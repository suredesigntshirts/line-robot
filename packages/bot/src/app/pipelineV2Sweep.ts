import { createUserWithIdentity, type Db, findUserByIdentity } from "@line-robot/db";
import { CostLog, runPipeline, type StepContext, type StepLlm } from "@line-robot/pipeline";
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
// v2-LITE simplifications (logged; both lift in follow-ups):
// - No image derivatives yet (sharp-on-Lambda packaging pending) → classify is
//   skipped; photos land as plain media rows, chanote OCR resumes once
//   derivatives ship (D2.7).
// - Owner identity is the CONVERSATION (provider line, subject = conversation
//   key) until Stage 4 account linking maps real LINE user ids.
// ---------------------------------------------------------------------------

export interface PipelineV2Port {
  run(conversationKey: string, batch: StoredMessage[]): Promise<AppliedProperty[]>;
}

interface PipelineV2Deps {
  db: Db;
  llm: StepLlm;
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
      // Marker-only media entries so buildTranscript emits [IMG n] lines the
      // segmenter can attribute — no vision pass in v2-lite.
      const attachments = batch
        .map((m) => m.attachment)
        .filter((a): a is NonNullable<typeof a> => a !== undefined);
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
        photos: markers.map((m, index) => ({ index, s3Key: m.s3Key })),
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
