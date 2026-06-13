import { createUserWithIdentity, type Db, findUserByIdentity } from "@line-robot/db";
import {
  buildDerivatives,
  CostLog,
  type MediaStore,
  runPipeline,
  type StepContext,
  type StepLlm,
} from "@line-robot/pipeline";
import { parseGeoLinks } from "../core/domain/geo.js";
import type { StoredMessage } from "../core/domain/message.js";
import type { AppliedProperty } from "../core/handlers/views.js";
import type { Logger } from "../core/ports/runtime.js";
import { buildTranscript, type ClassifiedMedia } from "./ingestionMedia.js";

// ---------------------------------------------------------------------------
// PIPELINE_V2 (stage-2 increment 9, flag-off by default): the sweep's
// extract-and-apply is swapped for packages/pipeline → Postgres. The claim/
// debounce/watermark machinery around it is unchanged (spine audit: KEEP).
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
      const attachments = batch
        .map((m) => m.attachment)
        .filter((a): a is NonNullable<typeof a> => a !== undefined);

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
