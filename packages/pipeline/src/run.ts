import {
  changePrice,
  createListing,
  createModerationItem,
  type Db,
  ewktPoint,
  getListing,
  listDedupPool,
} from "@line-robot/db";
import type { ContentLang, GateResult } from "@line-robot/domain";
import { blockCandidates, type DedupCandidate } from "./dedup/candidateFinder.ts";
import { dedupConfig } from "./dedup/config.ts";
import { dedupVerify } from "./dedup/verify.ts";
import { classifyImage } from "./steps/classify.ts";
import type { StepContext } from "./steps/context.ts";
import { extractListing } from "./steps/extract.ts";
import { runGate } from "./steps/gate.ts";
import { segmentTranscript, singleSegmentFallback } from "./steps/segment.ts";
import { translateContent } from "./steps/translate.ts";
import type { ClassifyResult, DedupResult, ExtractedListing, VisionImage } from "./steps.ts";

// ---------------------------------------------------------------------------
// The six-step pipeline, end to end: classify → segment → extract → dedup →
// translate → gate, writing the catalog to Postgres (D2.5). Per-step failure
// semantics (Q-SA2): a failed segment is dropped and reported; a failed gate
// or hard blocker queues moderation; dedup failure means "new"; translate
// failure skips the row. Partial success is normal.
// ---------------------------------------------------------------------------

export interface PipelinePhoto {
  /** Position marker in the transcript (matches `<photo …#i>` markers). */
  index: number;
  /** S3 key of the archived original (media row source). */
  s3Key: string;
  /** 1568px vision derivative; absent = skip classification for this photo. */
  vision?: VisionImage;
}

export interface PipelineInput {
  transcript: string;
  ownerUserId: string;
  sourceGroupId?: string;
  photos: PipelinePhoto[];
  geoHints: string[];
  /** Primary language of the source chat (translation targets the other one). */
  contentLang: ContentLang;
}

export interface PipelineListingOutcome {
  /** Postgres listing id (new or merged-into). */
  listingId: string;
  decision: DedupResult;
  gate: GateResult;
}

export interface PipelineOutcome {
  listings: PipelineListingOutcome[];
  /** Segment labels whose extraction failed (logged; gate-notified per spec). */
  droppedSegments: string[];
}

/** Existing catalog → dedup block pool. Seed-scale: the whole catalog. */
async function loadCandidatePool(db: Db): Promise<DedupCandidate[]> {
  const rows = await listDedupPool(db);
  return rows.map((row) => ({
    id: row.id,
    deedNo: row.deedNo,
    lat: row.lat,
    lon: row.lon,
    addressText: [row.landmark, row.tambon, row.amphoe, row.province].filter(Boolean).join(" "),
    summary: `${row.propertyType} ${row.landmark ?? ""} ${row.priceThb ?? "?"}THB ${row.tambon ?? ""}`,
  }));
}

function deedNoFrom(classifications: Array<ClassifyResult | null>): string | null {
  for (const c of classifications) {
    if (c?.chanote?.deedNo) return c.chanote.deedNo;
  }
  return null;
}

async function persistNewListing(
  db: Db,
  ctx: StepContext,
  input: PipelineInput,
  extracted: ExtractedListing,
  deedNo: string | null,
  photoKeys: string[],
): Promise<string> {
  const isRent = extracted.dealType === "rent";
  const translated = await translateContent(ctx, {
    fromLang: input.contentLang,
    title: extracted.title,
    description: extracted.description,
    notes: "",
  });
  const content = [
    {
      lang: input.contentLang,
      headline: extracted.title,
      description: extracted.description,
      generatedBy: "llm" as const, // LEGAL-06: auto until poster_confirmed
    },
    ...(translated
      ? [
          {
            lang: translated.lang,
            headline: translated.title,
            description: translated.description,
            generatedBy: "llm" as const,
          },
        ]
      : []),
  ];

  const listing = await createListing(db, {
    listing: {
      ownerUserId: input.ownerUserId,
      sourceGroupId: input.sourceGroupId,
      dealType: extracted.dealType,
      saleStage: isRent ? null : "available",
      rentalStatus: isRent ? "available" : null,
      titleDeedType: extracted.titleDeedType,
      deedNo,
      propertyType: extracted.propertyType,
      priceThb: isRent ? null : extracted.priceThb,
      urgency: extracted.urgency,
      province: extracted.province,
      amphoe: extracted.amphoe,
      tambon: extracted.tambon,
      landmark: extracted.landmark,
      geom:
        extracted.lat !== null && extracted.lon !== null
          ? ewktPoint(extracted.lon, extracted.lat)
          : null,
      landRai: extracted.landRai,
      landNgan: extracted.landNgan,
      landWah: extracted.landWah,
      landSqm: extracted.landSqm,
      floorAreaSqm: extracted.floorAreaSqm,
      bedrooms: extracted.bedrooms,
      bathrooms: extracted.bathrooms,
      facingDirection: extracted.facingDirection,
      extractionSource: "auto", // LEGAL-06
    },
    content,
    rental: isRent ? { monthlyRent: extracted.priceThb, utilityRateType: "unknown" } : undefined,
    media: photoKeys.map((s3Key, i) => ({ s3Key, kind: "photo" as const, heroIndex: i })),
  });
  return listing.id;
}

/** Run the full pipeline over one conversation thread and write Postgres. */
export async function runPipeline(
  ctx: StepContext,
  db: Db,
  input: PipelineInput,
): Promise<PipelineOutcome> {
  // 1. classify+ocr each photo that has a vision derivative.
  const classifications: Array<ClassifyResult | null> = [];
  for (const photo of input.photos) {
    classifications.push(photo.vision ? await classifyImage(ctx, photo.vision) : null);
  }
  const mediaMarkers = input.photos.map((photo, i) => ({
    index: photo.index,
    classify: classifications[i] ?? null,
  }));

  // 2. segment (fallback: the whole transcript as one listing).
  const segmentInput = {
    transcript: input.transcript,
    mediaMarkers,
    geoHints: input.geoHints,
    candidates: [],
  };
  const segmented =
    (await segmentTranscript(ctx, segmentInput)) ?? singleSegmentFallback(segmentInput);

  const pool = await loadCandidatePool(db);
  const config = dedupConfig();
  const outcome: PipelineOutcome = { listings: [], droppedSegments: [] };

  for (const segment of segmented.segments) {
    // 3. extract (per segment); failure drops the segment, logged.
    const extracted = await extractListing(ctx, {
      transcript: input.transcript,
      focus: segment.label,
      geoHints: input.geoHints,
      candidates: [],
    });
    if (extracted === null) {
      outcome.droppedSegments.push(segment.label);
      continue;
    }

    // Indices come from the model — tolerate hallucinated markers by lookup, never by position.
    const photoByIndex = new Map(input.photos.map((p, i) => [p.index, { photo: p, slot: i }]));
    const segmentClassifications = segment.imageIndices.map(
      (i) => classifications[photoByIndex.get(i)?.slot ?? -1] ?? null,
    );
    const deedNo = deedNoFrom(segmentClassifications);
    const photoKeys = segment.imageIndices
      .map((i) => photoByIndex.get(i)?.photo.s3Key)
      .filter((k): k is string => k !== undefined);

    // 4. dedup: deterministic block → LLM verify; default new.
    const blocked = blockCandidates({ ...extracted, deedNo }, pool, config);
    const decision = await dedupVerify(ctx, extracted, blocked);

    // 5+6. persist + translate + gate.
    let listingId: string;
    if (decision.decision === "merge" && decision.intoId !== undefined) {
      listingId = decision.intoId;
      // Re-sweep / re-post: refresh the price with an audit trail — but only when
      // it actually changed (idempotent re-sweeps must not spam price_history).
      // Nothing else is overwritten without poster confirmation (LEGAL-06).
      if (extracted.dealType === "sale" && extracted.priceThb !== null) {
        const current = await getListing(db, listingId);
        if (current && current.priceThb !== extracted.priceThb) {
          await changePrice(db, listingId, extracted.priceThb, "corrected");
        }
      }
    } else {
      listingId = await persistNewListing(db, ctx, input, extracted, deedNo, photoKeys);
      pool.push({
        id: listingId,
        deedNo,
        lat: null,
        lon: null,
        addressText: [extracted.landmark, extracted.tambon, extracted.amphoe, extracted.province]
          .filter(Boolean)
          .join(" "),
        summary: `${extracted.propertyType} ${extracted.landmark ?? ""} ${extracted.priceThb ?? "?"}THB`,
      });
    }

    const gate = await runGate(ctx, {
      extracted,
      photoCount: photoKeys.length,
      deedType: extracted.titleDeedType,
      listingType: extracted.dealType,
    });
    if (
      gate.blockers.length > 0 ||
      (!gate.pass && gate.missing.some((m) => m.promptKey === "needs_review"))
    ) {
      await createModerationItem(
        db,
        "listing",
        listingId,
        gate.blockers[0]?.reason ?? "needs_review",
      );
    }

    outcome.listings.push({ listingId, decision, gate });
  }

  return outcome;
}
