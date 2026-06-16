import {
  changePrice,
  createListing,
  createModerationItem,
  type Db,
  ewktPoint,
  getListing,
  listDedupPool,
} from "@line-robot/db";
import type { ContentLang, GateResult, MediaKind } from "@line-robot/domain";
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
  /** 640px web derivative key (D2.7); stored on the media row for the public website. */
  thumbKey?: string;
  /** 1568px vision derivative; absent = skip classification for this photo. */
  vision?: VisionImage;
}

/** One media row to persist: the original + its (optional) web thumb + its classified kind. */
interface SegmentMedia {
  s3Key: string;
  thumbKey?: string;
  kind: MediaKind;
}

/** The classify step's kind → the storage `media_kind`. Only chanote is distinguished; maps,
 * chat-logs and unrecognised images ("other") store as a plain photo (no floorplan/render detector). */
function classifyToMediaKind(c: ClassifyResult | null): MediaKind {
  return c?.kind === "chanote" ? "chanote" : "photo";
}

export interface PipelineInput {
  transcript: string;
  ownerUserId: string;
  sourceGroupId?: string;
  /** The REAL bare-id poster of a 1:1 DM (no source group), recorded so the listing knows who may
   * claim it (plan 23 Group D). Written set-once on the create path only — a dedup merge into an
   * existing listing never touches it. Undefined for group-sourced listings (claim is gated by group
   * membership there) and for DMs with no resolvable sender. */
  dmClaimantUserId?: string;
  photos: PipelinePhoto[];
  /** Conversation-level coordinates, for SEGMENTATION context only (the segmenter sees them all to
   * decide how many listings exist). Per-segment extraction is bound via `coordByMapIndex` (A1). */
  geoHints: string[];
  /** Per-`[MAP n]`-marker coordinate ("lat,long") or null (a coordinate-less short link), index-
   * aligned with the transcript's [MAP n] markers. A segment's `mapIndex` resolves ITS OWN pin
   * through this, so a listing never inherits another listing's coordinate (A1, plan 23). */
  coordByMapIndex?: (string | null)[];
  /** Primary language of the source chat (translation targets the other one). */
  contentLang: ContentLang;
}

export interface PipelineListingOutcome {
  /** Postgres listing id (new or merged-into). */
  listingId: string;
  /** Extracted display title (the bot's confirmation copy). */
  title: string;
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
  media: SegmentMedia[],
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
      // Only written here (the create path) → set-once: a re-sweep that dedup-MERGES into an existing
      // listing keeps that listing's original claimant (E10). Undefined for group/sender-less listings.
      dmClaimantUserId: input.dmClaimantUserId,
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
    media: media.map((m, i) => ({
      s3Key: m.s3Key,
      thumbKey: m.thumbKey ?? null,
      kind: m.kind,
      heroIndex: i,
    })),
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

  // A1 — bind each segment to ITS OWN map pin, never the whole conversation's. Resolve the pin from
  // the segmenter's per-segment `mapIndex` (through coordByMapIndex); for a single-listing thread
  // with exactly one pin, bind it deterministically; otherwise none. A pin claimed by MORE THAN ONE
  // segment signals mis-attribution → bind it to none (don't stamp one coordinate on two listings,
  // which would geo-block and re-merge them). The pin is then applied AUTHORITATIVELY below (the
  // extract prompt doesn't read GEO HINTS, so the model's lat/lon can't be trusted to honor it).
  const coordByMapIndex = input.coordByMapIndex ?? [];
  const presentCoords = coordByMapIndex.filter((c) => c !== null);
  const soleCoord: string | null =
    segmented.segments.length === 1 && presentCoords.length === 1
      ? (presentCoords[0] ?? null)
      : null;
  const mapIndexUses = new Map<number, number>();
  for (const s of segmented.segments) {
    if (s.mapIndex !== null) mapIndexUses.set(s.mapIndex, (mapIndexUses.get(s.mapIndex) ?? 0) + 1);
  }

  for (const segment of segmented.segments) {
    const segCoord =
      segment.mapIndex !== null
        ? mapIndexUses.get(segment.mapIndex) === 1
          ? (coordByMapIndex[segment.mapIndex] ?? null)
          : null // collision: ≥2 segments claim this pin → bind none
        : soleCoord;
    // 3. extract (per segment); failure drops the segment, logged.
    const extracted = await extractListing(ctx, {
      transcript: input.transcript,
      focus: segment.label,
      geoHints: segCoord ? [segCoord] : [],
      candidates: [],
    });
    if (extracted === null) {
      outcome.droppedSegments.push(segment.label);
      continue;
    }
    // Apply the segment's own pin AUTHORITATIVELY: the shared Google-Maps pin is the location the
    // poster attached to THIS listing, and the extract prompt never instructs geo-from-hint — so
    // overwrite the model's lat/lon (which may be null or prose-guessed). A pinless segment keeps
    // whatever the model extracted from prose. This is what actually guarantees pin isolation.
    if (segCoord !== null) {
      const [latStr, lonStr] = segCoord.split(",");
      const lat = Number(latStr);
      const lon = Number(lonStr);
      if (Number.isFinite(lat) && Number.isFinite(lon)) {
        extracted.lat = lat;
        extracted.lon = lon;
      }
    }

    // Indices come from the model — tolerate hallucinated markers by lookup, never by position.
    const photoByIndex = new Map(input.photos.map((p, i) => [p.index, { photo: p, slot: i }]));
    const segmentEntries = segment.imageIndices
      .map((i) => photoByIndex.get(i))
      .filter((e): e is { photo: PipelinePhoto; slot: number } => e !== undefined);
    const deedNo = deedNoFrom(segmentEntries.map((e) => classifications[e.slot] ?? null));
    const segmentMedia: SegmentMedia[] = segmentEntries.map((e) => ({
      s3Key: e.photo.s3Key,
      thumbKey: e.photo.thumbKey,
      kind: classifyToMediaKind(classifications[e.slot] ?? null),
    }));

    // 4. dedup: deterministic block → LLM verify; default new. A weak/uncertain "merge" is
    // downgraded to new + a merge_request (E1 conservative-merge guard) — see below.
    const blocked = blockCandidates({ ...extracted, deedNo }, pool, config);
    const decision = await dedupVerify(ctx, extracted, blocked, config);

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
      listingId = await persistNewListing(db, ctx, input, extracted, deedNo, segmentMedia);
      pool.push({
        id: listingId,
        deedNo,
        // Carry the extracted coordinates so a second segment in THIS SAME batch that is the same
        // property (no shared deed, weak address text, but nearby coords) geo-blocks against the
        // listing we just created — not only on the next sweep.
        lat: extracted.lat,
        lon: extracted.lon,
        addressText: [extracted.landmark, extracted.tambon, extracted.amphoe, extracted.province]
          .filter(Boolean)
          .join(" "),
        summary: `${extracted.propertyType} ${extracted.landmark ?? ""} ${extracted.priceThb ?? "?"}THB`,
      });
      // E1: an uncertain "merge" was persisted as new to avoid silent data loss — queue the
      // candidate for human merge/keep-separate review instead of folding it away.
      if (decision.mergeRequestIntoId !== undefined) {
        await createModerationItem(
          db,
          "merge_request",
          listingId,
          `uncertain_dedup:${decision.mergeRequestIntoId}`,
        );
      }
    }

    const gate = await runGate(ctx, {
      extracted,
      photoCount: segmentMedia.length,
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

    outcome.listings.push({ listingId, title: extracted.title, decision, gate });
  }

  return outcome;
}
