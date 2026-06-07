import { randomUUID } from "node:crypto";
import type { ConversationTracker, PropertyUpsert } from "../core/domain/catalog.js";
import { pushTarget } from "../core/domain/conversation.js";
import { parseGeoLinks } from "../core/domain/geo.js";
import type { OutboundMessage, StoredMessage } from "../core/domain/message.js";
import { mergePromptQuickReplies } from "../core/handlers/views.js";
import type { CatalogRepository } from "../core/ports/catalog.js";
import type {
  ExtractedProperty,
  ExtractionCandidate,
  ExtractionMedia,
  PropertyExtractor,
} from "../core/ports/extraction.js";
import type { LineGateway } from "../core/ports/lineGateway.js";
import type { MediaReader } from "../core/ports/mediaReader.js";
import type { MessageRepository } from "../core/ports/persistence.js";
import type { Clock, Logger } from "../core/ports/runtime.js";

export interface IngestionSweepDeps {
  readonly catalog: CatalogRepository;
  readonly messages: MessageRepository;
  readonly extractor: PropertyExtractor;
  readonly media: MediaReader;
  readonly gateway: LineGateway;
  readonly logger: Logger;
  readonly clock: Clock;
  /** Property-id generator (injectable for deterministic tests). Defaults to a random UUID. */
  readonly newId?: () => string;
}

export interface SweepOptions {
  /** Max conversations to claim per sweep run (bounds one invocation's work). */
  readonly maxConversations?: number;
  /** A claim older than this (ms) is treated as crashed and may be re-claimed by a later sweep. */
  readonly staleTimeoutMs?: number;
  /** Max media binaries (photos / chanote scans) to send to the model per conversation (cost cap). */
  readonly maxMedia?: number;
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
  /** Total properties upserted (created or updated). */
  readonly properties: number;
  /** Conversations skipped because another worker held a live claim. */
  readonly skipped: number;
  /** Conversations that errored mid-run (claim left in place for the stale-timeout retry). */
  readonly failed: number;
}

/** A merge candidate offered in the ambiguous-confirmation quick reply. */
interface MergeTarget {
  readonly id: string;
  readonly label: string;
}

/** One property the sweep wrote, for the push confirmation. */
interface AppliedProperty {
  readonly propertyId: string;
  readonly isNew: boolean;
  readonly ambiguous: boolean;
  readonly label: string;
  /** For an ambiguous (create-new) property: the conversation's existing properties offered as
   * merge targets in the confirmation quick reply. */
  readonly mergeTargets?: readonly MergeTarget[];
}

const DEFAULT_MAX_CONVERSATIONS = 25;
const DEFAULT_STALE_TIMEOUT_MS = 5 * 60_000;
const DEFAULT_MAX_MEDIA = 8;
/** Storage cap for the per-conversation memory note (mirrors the extractor's ≤1500-char prompt
 * instruction) — a backstop so a runaway note can't grow the cached prefix unbounded. */
const MAX_MEMORY_CHARS = 1500;
const MEDIA_CONTENT_TYPES: ReadonlySet<string> = new Set([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "application/pdf",
]);

function nullToUndef<T>(value: T | null): T | undefined {
  return value === null ? undefined : value;
}

/**
 * The debounced-ingestion sweep, invoked on an EventBridge cron. Finds conversations whose
 * quiet-debounce/cap window has elapsed (sparse GSI1, no scan), claims each one atomically, batches
 * its un-ingested messages, runs Claude extraction over the text + photos + map-link coordinates,
 * upserts the resulting properties (resolving update-vs-create against the conversation's own
 * candidates), then releases the conversation and pushes a confirmation. Pure orchestration over
 * ports — fully unit-testable with fakes.
 */
export class IngestionSweep {
  private readonly newId: () => string;

  constructor(
    private readonly deps: IngestionSweepDeps,
    private readonly opts: SweepOptions = {},
  ) {
    this.newId = deps.newId ?? randomUUID;
  }

  async run(): Promise<SweepResult> {
    const maxConversations = this.opts.maxConversations ?? DEFAULT_MAX_CONVERSATIONS;
    const staleTimeoutMs = this.opts.staleTimeoutMs ?? DEFAULT_STALE_TIMEOUT_MS;
    const nowMs = this.deps.clock.now();
    const nowIso = new Date(nowMs).toISOString();

    const due = await this.deps.catalog.findPendingConversations(nowIso, maxConversations);
    if (due.length === 0) {
      this.deps.logger.info("ingestion sweep: nothing due", { nowIso });
      return { due: 0, claimed: 0, ingested: 0, messages: 0, properties: 0, skipped: 0, failed: 0 };
    }

    const tally = {
      due: due.length,
      claimed: 0,
      ingested: 0,
      messages: 0,
      properties: 0,
      skipped: 0,
      failed: 0,
    };
    for (const tracker of due) {
      try {
        const outcome = await this.ingestOne(tracker, nowMs, staleTimeoutMs);
        if (outcome === null) {
          tally.skipped += 1;
          continue;
        }
        tally.claimed += 1;
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

  /** Claim → batch → extract → upsert → release → (best-effort) push. Returns counts, or `null` if
   * another worker holds a live claim. */
  private async ingestOne(
    tracker: ConversationTracker,
    nowMs: number,
    staleTimeoutMs: number,
  ): Promise<{ messageCount: number; propertyCount: number } | null> {
    const key = tracker.conversationKey;
    const claimed = await this.deps.catalog.claimConversation(key, nowMs, staleTimeoutMs);
    if (claimed === null) {
      this.deps.logger.info("ingestion sweep: claim contended; skipping", { conversationKey: key });
      return null;
    }

    const batch = await this.deps.messages.findSince(key, claimed.lastIngestedAt);
    const watermark = batch.reduce((max, m) => Math.max(max, m.timestamp), claimed.lastIngestedAt);

    // Extract + apply BEFORE releasing: a failure here must not advance the watermark.
    const applied = await this.extractAndApply(key, batch);

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
    return { messageCount: batch.length, propertyCount: applied.length };
  }

  private async extractAndApply(key: string, batch: StoredMessage[]): Promise<AppliedProperty[]> {
    const text = batch
      .map((m) => m.text)
      .filter((t): t is string => t !== undefined && t !== "")
      .join("\n");
    const media = await this.collectMedia(batch);
    if (text.trim() === "" && media.length === 0) {
      this.deps.logger.info("ingestion sweep: nothing to extract", { conversationKey: key });
      return [];
    }

    const geoHints = parseGeoLinks(text).map((g) => ({ lat: g.lat, long: g.long }));
    const candidates = await this.loadCandidates(key);
    const memory = nullToUndef(await this.deps.catalog.getMemoryDoc(key));
    const result = await this.deps.extractor.extract({
      conversationKey: key,
      text,
      media,
      geoHints,
      candidates,
      memory,
    });
    if (result === null) {
      this.deps.logger.info("ingestion sweep: extractor returned nothing", {
        conversationKey: key,
        messageCount: batch.length,
      });
      return [];
    }
    // Apply a proposed memory update even when no properties changed (the model may have learned an
    // alias without a property edit).
    await this.applyMemoryUpdate(key, result.memoryUpdate);
    if (result.properties.length === 0) {
      this.deps.logger.info("ingestion sweep: extractor returned no properties", {
        conversationKey: key,
        messageCount: batch.length,
      });
      return [];
    }

    // The conversation's existing properties become merge targets for any ambiguous create-new.
    const mergeTargets: MergeTarget[] = candidates.map((c) => ({
      id: c.propertyId,
      label: c.normalizedAddress ?? c.projectName ?? c.propertyId,
    }));
    const applied: AppliedProperty[] = [];
    for (const property of result.properties) {
      applied.push(await this.applyProperty(key, property, mergeTargets));
    }
    this.deps.logger.info("ingestion sweep: extracted properties", {
      conversationKey: key,
      messageCount: batch.length,
      propertyCount: applied.length,
    });
    return applied;
  }

  private async applyProperty(
    key: string,
    property: ExtractedProperty,
    mergeTargets: readonly MergeTarget[],
  ): Promise<AppliedProperty> {
    // Ambiguous-but-unmatched → create new (never auto-merge across ambiguity); the confirmation
    // flags it so a human can correct it. Interactive quick-reply resolution is a later slice.
    const isNew = property.existingPropertyId === null;
    const propertyId = property.existingPropertyId ?? this.newId();
    const now = this.deps.clock.now();

    const upsert: PropertyUpsert = {
      propertyId,
      normalizedAddress: nullToUndef(property.normalizedAddress),
      rawAddresses: property.rawAddress ? [property.rawAddress] : undefined,
      projectName: nullToUndef(property.projectName),
      lat: nullToUndef(property.lat),
      long: nullToUndef(property.long),
      district: nullToUndef(property.district),
      subdistrict: nullToUndef(property.subdistrict),
      province: nullToUndef(property.province),
      propertyType: nullToUndef(property.propertyType),
      status: nullToUndef(property.status),
      askingPrice: nullToUndef(property.askingPrice),
      currency: nullToUndef(property.currency),
      tags: property.tags ? [...property.tags] : undefined,
      updatedAt: now,
      lastActivityAt: now,
      ...(isNew ? { originConversationKey: key, createdAt: now } : {}),
    };
    await this.deps.catalog.upsertProperty(upsert);
    await this.deps.catalog.linkConversationProperty(key, propertyId, now);

    const label =
      nullToUndef(property.normalizedAddress) ?? nullToUndef(property.projectName) ?? propertyId;
    return {
      propertyId,
      isNew,
      ambiguous: property.ambiguous,
      label,
      // Only an ambiguous create-new gets merge offers, and only against *other* existing
      // properties (the just-created one is brand new, so it's never in the candidate set).
      ...(property.ambiguous && mergeTargets.length > 0 ? { mergeTargets } : {}),
    };
  }

  /** Persist a model-proposed memory note (bounded), if it learned anything durable this run. */
  private async applyMemoryUpdate(
    key: string,
    memoryUpdate: string | null | undefined,
  ): Promise<void> {
    const next = memoryUpdate?.trim();
    if (next === undefined || next === "") {
      return;
    }
    const bounded = next.slice(0, MAX_MEMORY_CHARS);
    await this.deps.catalog.putMemoryDoc(key, bounded);
    this.deps.logger.info("ingestion sweep: memory updated", {
      conversationKey: key,
      length: bounded.length,
    });
  }

  /** Fetch the bytes for every media attachment in the batch, capped at `maxMedia`. A missing or
   * unreadable object is skipped (logged) rather than failing the whole conversation. */
  private async collectMedia(batch: StoredMessage[]): Promise<ExtractionMedia[]> {
    const maxMedia = this.opts.maxMedia ?? DEFAULT_MAX_MEDIA;
    const withAttachment = batch.filter(
      (m) => m.attachment !== undefined && MEDIA_CONTENT_TYPES.has(m.attachment.contentType),
    );
    if (withAttachment.length > maxMedia) {
      this.deps.logger.info("ingestion sweep: capping media", {
        available: withAttachment.length,
        cap: maxMedia,
      });
    }

    const media: ExtractionMedia[] = [];
    for (const message of withAttachment.slice(0, maxMedia)) {
      const attachment = message.attachment;
      if (attachment === undefined) {
        continue;
      }
      try {
        const bytes = await this.deps.media.getMedia(attachment.s3Key);
        media.push({ base64: bytes.toString("base64"), mediaType: attachment.contentType });
      } catch (error) {
        this.deps.logger.warn("ingestion sweep: media read failed; skipping", {
          s3Key: attachment.s3Key,
          error: String(error),
        });
      }
    }
    return media;
  }

  /** The conversation's own properties, as dedup candidates (write-scope is per conversation). */
  private async loadCandidates(key: string): Promise<ExtractionCandidate[]> {
    const ids = await this.deps.catalog.listConversationProperties(key);
    const properties = await Promise.all(ids.map((id) => this.deps.catalog.getProperty(id)));
    return properties
      .filter((p): p is NonNullable<typeof p> => p !== null)
      .map((p) => ({
        propertyId: p.propertyId,
        normalizedAddress: p.normalizedAddress,
        projectName: p.projectName,
        lat: p.lat,
        long: p.long,
      }));
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
}

/**
 * "✅ Saved 2 properties: 123 Sukhumvit (new), Thonglor plot (updated)". An ambiguous create-new is
 * tagged "new — please confirm" and, when there are existing properties to merge into, the message
 * carries quick-reply chips ("Merge → <existing>" / "Keep separate") that the postback router
 * resolves. LINE only shows one message's quick replies, so we attach the *first* ambiguous
 * property's offer; any others stay flagged in the text (the safe create-new default).
 */
export function buildConfirmation(applied: AppliedProperty[]): OutboundMessage {
  const noun = applied.length === 1 ? "property" : "properties";
  const items = applied
    .map((a) => {
      const tag = a.ambiguous ? "new — please confirm" : a.isNew ? "new" : "updated";
      return `${a.label} (${tag})`;
    })
    .join(", ");
  const text = `✅ Saved ${applied.length} ${noun}: ${items}`;

  const toConfirm = applied.find((a) => a.mergeTargets !== undefined && a.mergeTargets.length > 0);
  if (toConfirm?.mergeTargets !== undefined) {
    return {
      type: "text",
      text,
      quickReplies: mergePromptQuickReplies(toConfirm.propertyId, [...toConfirm.mergeTargets]),
    };
  }
  return { type: "text", text };
}
