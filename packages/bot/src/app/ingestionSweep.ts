import type { ConversationTracker } from "../core/domain/catalog.js";
import { pushTarget, pushTargetFromKey } from "../core/domain/conversation.js";
import type { StoredMessage } from "../core/domain/message.js";
import { type AppliedProperty, buildConfirmation } from "../core/handlers/views.js";
import type { ConversationStore } from "../core/ports/catalog.js";
import type { LineGateway } from "../core/ports/lineGateway.js";
import type { MessageRepository } from "../core/ports/persistence.js";
import type { Clock, Logger } from "../core/ports/runtime.js";
import type { PipelineV2Port } from "./pipelineV2Sweep.js";

export interface IngestionSweepDeps {
  /** The conversation tracker (debounced-ingestion state machine) — stays on DynamoDB. */
  readonly catalog: ConversationStore;
  readonly messages: MessageRepository;
  /** Extract-and-apply for each claimed batch: the v2 pipeline (packages/pipeline → Postgres). */
  readonly v2: PipelineV2Port;
  readonly gateway: LineGateway;
  readonly logger: Logger;
  readonly clock: Clock;
}

export interface SweepOptions {
  /** Max conversations to claim per sweep run (bounds one invocation's work). */
  readonly maxConversations?: number;
  /** A claim older than this (ms) is treated as crashed and may be re-claimed by a later sweep. */
  readonly staleTimeoutMs?: number;
  /** Give up on (→ FAILED) a conversation after this many ingestion attempts. */
  readonly maxIngestAttempts?: number;
}

/** Tallies one sweep run — returned for the Lambda log line and asserted in tests. */
export interface SweepResult {
  /** Conversations the GSI reported as due. */
  readonly due: number;
  /** Conversations fully processed and released. */
  readonly ingested: number;
  /** Total messages batched across all processed conversations. */
  readonly messages: number;
  /** Total properties upserted (created or updated) by the pipeline. */
  readonly properties: number;
  /** Conversations skipped because another worker held a live claim. */
  readonly skipped: number;
  /** Conversations that errored mid-run (claim left in place for the stale-timeout retry). */
  readonly failed: number;
  /** Conversations abandoned (→ FAILED) after exceeding the ingestion-attempt cap. */
  readonly abandoned: number;
}

/** The result of attempting one conversation: ingested (with counts), skipped (claim contended), or
 * abandoned (attempt cap exceeded → FAILED, no extraction run). */
type IngestOutcome =
  | { readonly kind: "ingested"; readonly messageCount: number; readonly propertyCount: number }
  | { readonly kind: "skipped" }
  | { readonly kind: "abandoned" };

const DEFAULT_MAX_CONVERSATIONS = 25;
const DEFAULT_STALE_TIMEOUT_MS = 5 * 60_000;
/** Give up on a conversation after this many ingestion attempts (claims). Extraction shouldn't
 * normally fail, so a conversation that keeps failing (timeout, bad media, API error) is abandoned
 * → FAILED rather than reclaimed forever — bounding the inference + Lambda spend of a stuck loop.
 * Counts every claim including timed-out/crashed runs (the counter is committed at claim time). */
const DEFAULT_MAX_INGEST_ATTEMPTS = 3;

/**
 * The debounced-ingestion sweep, invoked on an EventBridge cron. Finds conversations whose
 * quiet-debounce/cap window has elapsed (sparse GSI1, no scan), claims each one atomically, batches
 * its un-ingested messages, and delegates extract-and-apply to the v2 pipeline (packages/pipeline →
 * Postgres), then releases the conversation and pushes a confirmation. Pure orchestration over
 * ports — fully unit-testable with fakes. The conversation tracker (claim/debounce/watermark) stays
 * on DynamoDB; the property catalog lives in Postgres, owned by the pipeline.
 */
export class IngestionSweep {
  constructor(
    private readonly deps: IngestionSweepDeps,
    private readonly opts: SweepOptions = {},
  ) {}

  async run(): Promise<SweepResult> {
    const maxConversations = this.opts.maxConversations ?? DEFAULT_MAX_CONVERSATIONS;
    const staleTimeoutMs = this.opts.staleTimeoutMs ?? DEFAULT_STALE_TIMEOUT_MS;
    const nowMs = this.deps.clock.now();
    const nowIso = new Date(nowMs).toISOString();

    const due = await this.deps.catalog.findPendingConversations(nowIso, maxConversations);
    if (due.length === 0) {
      this.deps.logger.info("ingestion sweep: nothing due", { nowIso });
      return {
        due: 0,
        ingested: 0,
        messages: 0,
        properties: 0,
        skipped: 0,
        failed: 0,
        abandoned: 0,
      };
    }

    const maxAttempts = this.opts.maxIngestAttempts ?? DEFAULT_MAX_INGEST_ATTEMPTS;
    const tally = {
      due: due.length,
      ingested: 0,
      messages: 0,
      properties: 0,
      skipped: 0,
      failed: 0,
      abandoned: 0,
    };
    for (const tracker of due) {
      try {
        const outcome = await this.ingestOne(tracker, nowMs, staleTimeoutMs, maxAttempts);
        if (outcome.kind === "skipped") {
          tally.skipped += 1;
          continue;
        }
        if (outcome.kind === "abandoned") {
          tally.abandoned += 1;
          continue;
        }
        tally.ingested += 1;
        tally.messages += outcome.messageCount;
        tally.properties += outcome.propertyCount;
      } catch (error) {
        tally.failed += 1;
        // Don't release on error: the watermark must not advance past un-ingested messages, and a
        // freshly-created property must not be re-created by a retry. The claim stays put and the
        // stale-timeout lets a later sweep retry the whole batch.
        this.deps.logger.error("ingestion sweep: conversation failed", {
          conversationKey: tracker.conversationKey,
          error: String(error),
        });
      }
    }

    this.deps.logger.info("ingestion sweep complete", { ...tally });
    return { ...tally };
  }

  /** Claim → batch → extract → release → (best-effort) push. Returns the outcome:
   * `ingested` (counts), `skipped` (another worker holds a live claim), or `abandoned` (the
   * attempt cap was exceeded → marked FAILED, no extraction run). */
  private async ingestOne(
    tracker: ConversationTracker,
    nowMs: number,
    staleTimeoutMs: number,
    maxAttempts: number,
  ): Promise<IngestOutcome> {
    const key = tracker.conversationKey;
    const claimed = await this.deps.catalog.claimConversation(key, nowMs, staleTimeoutMs);
    if (claimed === null) {
      this.deps.logger.info("ingestion sweep: claim contended; skipping", { conversationKey: key });
      return { kind: "skipped" };
    }

    // Give-up cap: the claim atomically bumped ingestAttempts (counting prior timeouts/crashes too).
    // Past the cap we abandon WITHOUT extracting — that's the whole point: stop burning inference on
    // a batch that keeps failing. Mark FAILED (off the pending index) and tell the user once.
    const attempts = claimed.ingestAttempts ?? 1;
    if (attempts > maxAttempts) {
      this.deps.logger.error("ingestion sweep: giving up after repeated failures", {
        conversationKey: key,
        attempts,
        maxAttempts,
      });
      await this.deps.catalog.failConversation(key);
      await this.pushFailureNotice(key);
      return { kind: "abandoned" };
    }

    const batch = await this.deps.messages.findSince(key, claimed.lastIngestedAt);
    const watermark = batch.reduce((max, m) => Math.max(max, m.timestamp), claimed.lastIngestedAt);

    // Extract + apply BEFORE releasing: a failure here must not advance the watermark. The whole
    // extract-and-apply (segment → extract → dedup → write Postgres) is owned by the v2 pipeline.
    const applied = await this.deps.v2.run(key, batch);

    await this.deps.catalog.releaseConversation(key, {
      watermark,
      claimSeenInboundAt: claimed.lastInboundAt,
    });

    // Push the confirmation AFTER release so a push failure never re-triggers extraction (which
    // would duplicate the just-created properties). Best-effort: the reply token is long expired,
    // so push is the only channel, and a failed push shouldn't fail the run.
    if (applied.length > 0) {
      await this.pushConfirmation(key, batch, applied);
    }
    return { kind: "ingested", messageCount: batch.length, propertyCount: applied.length };
  }

  private async pushConfirmation(
    key: string,
    batch: StoredMessage[],
    applied: AppliedProperty[],
  ): Promise<void> {
    const ref = batch[0]?.ref;
    if (ref === undefined) {
      return;
    }
    try {
      await this.deps.gateway.push(pushTarget(ref), [buildConfirmation(applied)]);
    } catch (error) {
      this.deps.logger.warn("ingestion sweep: push confirmation failed", {
        conversationKey: key,
        error: String(error),
      });
    }
  }

  /** Tell the user once that we gave up on their last batch (best-effort — derives the push target
   * straight from the conversation key, since we deliberately don't load/extract the batch here). */
  private async pushFailureNotice(key: string): Promise<void> {
    try {
      await this.deps.gateway.push(pushTargetFromKey(key), [
        {
          type: "text",
          text: "⚠️ Sorry — I couldn't process your recent messages after several tries. Please try resending them.",
        },
      ]);
    } catch (error) {
      this.deps.logger.warn("ingestion sweep: push failure notice failed", {
        conversationKey: key,
        error: String(error),
      });
    }
  }
}
