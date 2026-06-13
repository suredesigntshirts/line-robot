import { createUserWithIdentity, type Db, findUserByIdentity } from "@line-robot/db";
import {
  buildDerivatives,
  CostLog,
  type MediaStore,
  runPipeline,
  type StepContext,
  type StepLlm,
} from "@line-robot/pipeline";
import type { Chanote, PropertyPhoto } from "../core/domain/catalog.js";
import { formatShortDateTime } from "../core/domain/datetime.js";
import { parseGeoLinks, parseMapUrls } from "../core/domain/geo.js";
import type { StoredMessage } from "../core/domain/message.js";
import type { AppliedProperty } from "../core/handlers/views.js";
import type { Logger } from "../core/ports/runtime.js";

// ---------------------------------------------------------------------------
// The ingestion sweep's extract-and-apply: packages/pipeline → Postgres. The claim/debounce/
// watermark machinery around it (in IngestionSweep) is unchanged (spine audit: KEEP).
//
// v2 image pipeline (A2): each image gets two sharp derivatives — a 1568px vision image that feeds
// classify + chanote OCR (deed numbers → dedup, gallery kinds), and a 640px thumb stored on the
// media row for the public website. A per-photo build failure degrades just that photo to an
// unclassified plain media row, never the whole sweep.
// Remaining v2-lite simplification:
// - Owner identity is the CONVERSATION (provider line, subject = conversation key) until Stage 4
//   account linking maps real LINE user ids.
// ---------------------------------------------------------------------------

export interface PipelineV2Port {
  run(conversationKey: string, batch: StoredMessage[]): Promise<AppliedProperty[]>;
}

/** One classified attachment from a batch: its S3 key, content-type, and (best-effort) the image's
 * kind/label/OCR. The marker pass below only sets `kind`; the real per-image classification happens
 * inside the pipeline. */
export interface ClassifiedMedia {
  readonly s3Key: string;
  readonly contentType: string;
  readonly kind: PropertyPhoto["kind"];
  readonly label?: string;
  readonly chanote?: Chanote;
  readonly ocrText?: string;
}

/** Build the timestamped transcript the pipeline segmenter reads. Each line is `[<Bangkok
 * date+time>]` followed by the message text (with map links rewritten to `[MAP n]`) or an image
 * marker `[IMG n] <kind> - <label> ocr: <text>`. The timestamps (second resolution) expose
 * burst/gap structure for segmentation; the indexed markers let the segmenter attribute media per
 * property. */
export function buildTranscript(
  batch: readonly StoredMessage[],
  classified: readonly ClassifiedMedia[],
): { transcript: string; mapLinks: string[] } {
  const indexByKey = new Map(classified.map((c, i) => [c.s3Key, i]));
  const ordered = [...batch].sort((a, b) => a.timestamp - b.timestamp);
  const mapLinks: string[] = [];
  const lines: string[] = [];
  for (const m of ordered) {
    const stamp = `[${formatShortDateTime(m.timestamp)}]`;
    const attachKey = m.attachment?.s3Key;
    if (attachKey !== undefined && indexByKey.has(attachKey)) {
      const i = indexByKey.get(attachKey) as number;
      const c = classified[i] as ClassifiedMedia;
      const label = c.label !== undefined ? ` - ${c.label}` : "";
      const ocr = c.ocrText !== undefined ? ` ocr: ${c.ocrText}` : "";
      lines.push(`${stamp} [IMG ${i}] ${c.kind}${label}${ocr}`);
      continue;
    }
    const text = m.text;
    if (text !== undefined && text !== "") {
      let rewritten = text;
      for (const url of parseMapUrls(text)) {
        let idx = mapLinks.indexOf(url);
        if (idx === -1) {
          idx = mapLinks.length;
          mapLinks.push(url);
        }
        rewritten = rewritten.split(url).join(`[MAP ${idx}]`);
      }
      lines.push(`${stamp} ${rewritten}`);
    }
  }
  return { transcript: lines.join("\n"), mapLinks };
}

interface PipelineV2Deps {
  db: Db;
  llm: StepLlm;
  media: MediaStore;
  logger: Logger;
}

/** Find-or-create the Postgres user this conversation's listings belong to. */
async function ensureOwner(db: Db, conversationKey: string): Promise<string> {
  const existing = await findUserByIdentity(db, "line", conversationKey);
  if (existing) return existing.id;
  const created = await createUserWithIdentity(
    db,
    { displayName: conversationKey },
    { provider: "line", providerSubject: conversationKey, verifiedAt: new Date() },
  );
  return created.id;
}

export function createPipelineV2Port(deps: PipelineV2Deps): PipelineV2Port {
  return {
    async run(conversationKey, batch) {
      // Only image attachments become photos: a PDF/video/audio would throw inside sharp and degrade
      // to a media row that points at a non-image as if it were a photo. Filtering here keeps the
      // `photos` and `markers` lists (and so the [IMG n] transcript indices) aligned.
      const attachments = batch
        .map((m) => m.attachment)
        .filter((a): a is NonNullable<typeof a> => a !== undefined)
        .filter((a) => a.contentType.startsWith("image/"));

      // Build both derivatives per image (sharp): the 1568px vision image feeds classify + chanote
      // OCR; the 640px thumb is stored for the public website. A failed build degrades just that
      // photo to a plain unclassified media row (the original key), never the whole sweep.
      const photos = await Promise.all(
        attachments.map(async (a, index) => {
          try {
            const d = await buildDerivatives(deps.media, a.s3Key);
            return {
              index,
              s3Key: a.s3Key,
              thumbKey: d.thumbKey,
              vision: {
                s3Key: d.visionKey,
                mediaType: "image/jpeg" as const,
                base64: Buffer.from(d.visionJpeg).toString("base64"),
              },
            };
          } catch (error) {
            deps.logger.warn("pipeline v2: derivative build failed; photo unclassified", {
              s3Key: a.s3Key,
              error: String(error),
            });
            return { index, s3Key: a.s3Key };
          }
        }),
      );

      // Marker-only entries so buildTranscript emits the [IMG n] lines the segmenter attributes by
      // index — the real per-image classification happens inside the pipeline.
      const markers: ClassifiedMedia[] = attachments.map((a) => ({
        s3Key: a.s3Key,
        contentType: a.contentType ?? "image/jpeg",
        kind: "property",
      }));
      const { transcript } = buildTranscript(batch, markers);
      if (transcript.trim() === "") {
        deps.logger.info("pipeline v2: nothing to extract", { conversationKey });
        return [];
      }

      const chatText = batch
        .map((m) => m.text)
        .filter((t): t is string => t !== undefined && t !== "")
        .join("\n");

      const ctx: StepContext = { llm: deps.llm, costLog: new CostLog(), mode: "sync" };
      const ownerUserId = await ensureOwner(deps.db, conversationKey);
      const outcome = await runPipeline(ctx, deps.db, {
        transcript,
        ownerUserId,
        photos,
        geoHints: parseGeoLinks(chatText).map((g) => `${g.lat},${g.long}`),
        contentLang: "th",
      });

      deps.logger.info("pipeline v2: sweep complete", {
        conversationKey,
        listings: outcome.listings.length,
        dropped: outcome.droppedSegments.length,
        estCostUsd: ctx.costLog.totalUsd(),
        cacheHit: ctx.costLog.sawCacheHit(),
      });

      return outcome.listings.map((l) => ({
        propertyId: l.listingId,
        isNew: l.decision.decision === "new",
        ambiguous: false,
        label: l.title || l.listingId.slice(0, 8),
      }));
    },
  };
}
