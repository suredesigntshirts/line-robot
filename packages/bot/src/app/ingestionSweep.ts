import type { ConversationTracker } from "../core/domain/catalog.js";
import type { CatalogRepository } from "../core/ports/catalog.js";
import type { MessageRepository } from "../core/ports/persistence.js";
import type { Clock, Logger } from "../core/ports/runtime.js";

export interface IngestionSweepDeps {
  readonly catalog: CatalogRepository;
  readonly messages: MessageRepository;
  readonly logger: Logger;
  readonly clock: Clock;
}

export interface SweepOptions {
  /** Max conversations to claim per sweep run (bounds one invocation's work). */
  readonly maxConversations?: number;
  /** A claim older than this (ms) is treated as crashed and may be re-claimed by a later sweep. */
  readonly staleTimeoutMs?: number;
}

/** Tallies one sweep run — returned for the Lambda log line and asserted in tests. */
export interface SweepResult {
  /** Conversations the GSI reported as due. */
  readonly due: number;
  /** Conversations this sweep claimed (won the lock for). */
  readonly claimed: number;
  /** Conversations fully processed and released. */
  readonly ingested: number;
  /** Total messages batched across all processed conversations. */
  readonly messages: number;
  /** Conversations skipped because another worker held a live claim. */
  readonly skipped: number;
  /** Conversations that errored mid-run (claim left in place for the stale-timeout retry). */
  readonly failed: number;
}

const DEFAULT_MAX_CONVERSATIONS = 25;
const DEFAULT_STALE_TIMEOUT_MS = 5 * 60_000;

/**
 * The debounced-ingestion sweep, invoked on an EventBridge cron. Finds conversations whose
 * quiet-debounce/cap window has elapsed (sparse GSI1, no scan), claims each one atomically, batches
 * its un-ingested messages, then releases it (advancing the watermark, clearing pending unless a
 * message arrived mid-run). Pure orchestration over ports — fully unit-testable.
 *
 * Slice 3 stops at "claim → batch → log → release": no LLM extraction yet, so the whole sweep loop
 * (find/claim/watermark/release) is verifiable on DynamoDB Local before extraction is wired in.
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
    const result: SweepResult = {
      due: due.length,
      claimed: 0,
      ingested: 0,
      messages: 0,
      skipped: 0,
      failed: 0,
    };
    if (due.length === 0) {
      this.deps.logger.info("ingestion sweep: nothing due", { nowIso });
      return result;
    }

    // Mutable tally accumulated across conversations, frozen into the readonly result at the end.
    const tally = { ...result };
    for (const tracker of due) {
      try {
        const batched = await this.ingestOne(tracker, nowMs, staleTimeoutMs);
        if (batched === null) {
          tally.skipped += 1;
          continue;
        }
        tally.claimed += 1;
        tally.ingested += 1;
        tally.messages += batched;
      } catch (error) {
        tally.failed += 1;
        // Don't release on error: the watermark must not advance past un-processed messages. The
        // claim stays put and the stale-timeout lets a later sweep retry the whole batch.
        this.deps.logger.error("ingestion sweep: conversation failed", {
          conversationKey: tracker.conversationKey,
          error: String(error),
        });
      }
    }

    this.deps.logger.info("ingestion sweep complete", { ...tally });
    return { ...tally };
  }

  /** Claim → batch → (extraction lands here in slice 4) → release. Returns the batched message
   * count, or `null` if another worker holds a live claim. */
  private async ingestOne(
    tracker: ConversationTracker,
    nowMs: number,
    staleTimeoutMs: number,
  ): Promise<number | null> {
    const key = tracker.conversationKey;
    const claimed = await this.deps.catalog.claimConversation(key, nowMs, staleTimeoutMs);
    if (claimed === null) {
      this.deps.logger.info("ingestion sweep: claim contended; skipping", { conversationKey: key });
      return null;
    }

    const batch = await this.deps.messages.findSince(key, claimed.lastIngestedAt);
    const watermark = batch.reduce((max, m) => Math.max(max, m.timestamp), claimed.lastIngestedAt);

    // Slice 3: no extraction yet — log the batch so the end-to-end loop is observable in CloudWatch.
    this.deps.logger.info("ingestion sweep: batched conversation", {
      conversationKey: key,
      messageCount: batch.length,
      sinceMs: claimed.lastIngestedAt,
      watermark,
      lastInboundAt: claimed.lastInboundAt,
    });

    await this.deps.catalog.releaseConversation(key, {
      watermark,
      claimSeenInboundAt: claimed.lastInboundAt,
    });
    return batch.length;
  }
}
