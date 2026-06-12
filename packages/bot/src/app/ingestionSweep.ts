import { randomUUID } from "node:crypto";
import type {
  Chanote,
  ConversationTracker,
  PropertyPhoto,
  PropertyUpsert,
} from "../core/domain/catalog.js";
import { pushTarget, pushTargetFromKey } from "../core/domain/conversation.js";
import { parseGeoLinks } from "../core/domain/geo.js";
import type { StoredMessage } from "../core/domain/message.js";
import { emptyToUndef, nullToUndef } from "../core/domain/sentinel.js";
import { extractedToBaseUpsert } from "../core/handlers/propertyMapping.js";
import {
  type AppliedProperty,
  buildConfirmation,
  type MergeTarget,
} from "../core/handlers/views.js";
import type { ConversationStore, PropertyStore } from "../core/ports/catalog.js";
import type {
  ExtractedProperty,
  ExtractionCandidate,
  ImageClassifier,
  PropertyExtractor,
  PropertySegmenter,
} from "../core/ports/extraction.js";
import type { LineGateway } from "../core/ports/lineGateway.js";
import type { MediaReader } from "../core/ports/mediaReader.js";
import type { MessageRepository } from "../core/ports/persistence.js";
import type { Clock, Logger } from "../core/ports/runtime.js";
import {
  buildTranscript,
  type ClassifiedMedia,
  classifyMedia,
  collectChanote,
  collectPhotos,
  DEFAULT_MAX_CLASSIFY,
  DEFAULT_MAX_PROPERTY_PHOTOS,
  mergeSegment,
} from "./ingestionMedia.js";
import type { PipelineV2Port } from "./pipelineV2Sweep.js";

export interface IngestionSweepDeps {
  readonly catalog: ConversationStore & PropertyStore;
  readonly messages: MessageRepository;
  readonly extractor: PropertyExtractor;
  /** Pass 1 of two-pass extraction (plan 13 inc 6): split the batch into distinct properties. */
  readonly segmenter: PropertySegmenter;
  /** Per-image classify + OCR (plan 13): each image is read in its own small vision call. */
  readonly classifier: ImageClassifier;
  readonly media: MediaReader;
  readonly gateway: LineGateway;
  readonly logger: Logger;
  readonly clock: Clock;
  /** Property-id generator (injectable for deterministic tests). Defaults to a random UUID. */
  readonly newId?: () => string;
  /** PIPELINE_V2 (stage-2 cutover): when present, extract-and-apply is delegated
   * wholesale to the v2 pipeline → Postgres; claim/debounce/watermark unchanged. */
  readonly v2?: PipelineV2Port;
}

export interface SweepOptions {
  /** Max conversations to claim per sweep run (bounds one invocation's work). */
  readonly maxConversations?: number;
  /** A claim older than this (ms) is treated as crashed and may be re-claimed by a later sweep. */
  readonly staleTimeoutMs?: number;
  /** Backstop on how many images/docs to CLASSIFY per conversation per run (one vision call each). */
  readonly maxMedia?: number;
  /** Cap on PROPERTY photos kept per batch (documents — chanote/other — are never capped). */
  readonly maxPropertyPhotos?: number;
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
  /** Total properties upserted (created or updated). */
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
/** Storage cap for the per-conversation memory note (mirrors the extractor's ≤1500-char prompt
 * instruction) — a backstop so a runaway note can't grow the cached prefix unbounded. */
const MAX_MEMORY_CHARS = 1500;

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

  /** Claim → batch → extract → upsert → release → (best-effort) push. Returns the outcome:
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
    return { kind: "ingested", messageCount: batch.length, propertyCount: applied.length };
  }

  private async extractAndApply(key: string, batch: StoredMessage[]): Promise<AppliedProperty[]> {
    // PIPELINE_V2: the entire extract-and-apply swaps to packages/pipeline (Postgres catalog).
    if (this.deps.v2) {
      return this.deps.v2.run(key, batch);
    }
    // Per-image pass: classify every attachment + OCR documents (plan 13).
    const maxClassify = this.opts.maxMedia ?? DEFAULT_MAX_CLASSIFY;
    const classified = await classifyMedia({
      batch,
      media: this.deps.media,
      classifier: this.deps.classifier,
      logger: this.deps.logger,
      maxClassify,
    });
    // Build ONE timestamped transcript with [IMG n] / [MAP n] markers — feeds both passes, and the
    // timestamps + markers let the model segment by time-clustering and attribute each image/map.
    const { transcript, mapLinks } = buildTranscript(batch, classified);
    if (transcript.trim() === "") {
      this.deps.logger.info("ingestion sweep: nothing to extract", { conversationKey: key });
      return [];
    }

    // Geo coords come from the raw chat text (parseGeoLinks handles `?q=lat,lng` links, including
    // ones parseMapUrls doesn't treat as shareable map links and so didn't rewrite to [MAP n]).
    const chatText = batch
      .map((m) => m.text)
      .filter((t): t is string => t !== undefined && t !== "")
      .join("\n");
    const allGeoHints = parseGeoLinks(chatText);
    const candidates = await this.loadCandidates(key);
    const memory = nullToUndef(await this.deps.catalog.getMemoryDoc(key));

    // PASS 1 — segment the batch into distinct properties + attribute their images/map by index.
    const seg = await this.deps.segmenter.segment({
      conversationKey: key,
      text: transcript,
      media: [],
      geoHints: allGeoHints,
      candidates,
      memory,
    });
    if (seg === null) {
      // Segmentation unparseable → fall back to a single focused-less extraction over the transcript.
      return this.singlePassFallback(
        key,
        batch,
        transcript,
        classified,
        mapLinks,
        candidates,
        memory,
        allGeoHints,
      );
    }
    await this.applyMemoryUpdate(key, seg.memoryUpdate);
    if (seg.segments.length === 0) {
      this.deps.logger.info("ingestion sweep: segmenter found no properties", {
        conversationKey: key,
        messageCount: batch.length,
      });
      return [];
    }

    const mergeTargets = this.toMergeTargets(candidates);
    const maxPhotos = this.opts.maxPropertyPhotos ?? DEFAULT_MAX_PROPERTY_PHOTOS;
    const applied: AppliedProperty[] = [];
    for (const segment of seg.segments) {
      const mapUrl = segment.mapIndex >= 0 ? mapLinks[segment.mapIndex] : undefined;
      // Pass ONLY this property's own map coord to its focused extract (don't leak siblings' coords).
      const segGeo = mapUrl !== undefined ? parseGeoLinks(mapUrl) : [];
      // PASS 2 — a focused extraction filling all fields for THIS property only (no dilution).
      const result = await this.deps.extractor.extract({
        conversationKey: key,
        text: transcript,
        media: [],
        geoHints: segGeo,
        candidates,
        memory, // BUG FIX (epoch G D01): pass-2 was silently dropping the memory note
        focus: segment.label,
      });
      const segImages = segment.imageIndices
        .map((i) => classified[i])
        .filter((c): c is ClassifiedMedia => c !== undefined);
      const photos = collectPhotos(segImages, maxPhotos);
      const chanote = collectChanote(segImages);
      const property = mergeSegment(segment, result?.properties[0]);
      applied.push(await this.applyProperty(key, property, mergeTargets, photos, chanote, mapUrl));
    }
    this.deps.logger.info("ingestion sweep: extracted properties", {
      conversationKey: key,
      messageCount: batch.length,
      segmentCount: seg.segments.length,
      propertyCount: applied.length,
    });
    return applied;
  }

  /** Fallback when segmentation fails: one extraction over the transcript, attributing media only
   * when it resolves to exactly one property (the pre-two-pass behaviour). */
  private async singlePassFallback(
    key: string,
    batch: StoredMessage[],
    transcript: string,
    classified: readonly ClassifiedMedia[],
    mapLinks: readonly string[],
    candidates: readonly ExtractionCandidate[],
    memory: string | undefined,
    geoHints: readonly { lat: number; long: number }[],
  ): Promise<AppliedProperty[]> {
    const result = await this.deps.extractor.extract({
      conversationKey: key,
      text: transcript,
      media: [],
      geoHints,
      candidates,
      memory,
    });
    if (result === null) {
      this.deps.logger.info("ingestion sweep: extractor returned nothing", {
        conversationKey: key,
      });
      return [];
    }
    await this.applyMemoryUpdate(key, result.memoryUpdate);
    if (result.properties.length === 0) {
      return [];
    }
    const mergeTargets = this.toMergeTargets(candidates);
    const maxPhotos = this.opts.maxPropertyPhotos ?? DEFAULT_MAX_PROPERTY_PHOTOS;
    const single = result.properties.length === 1;
    const photos = single ? collectPhotos(classified, maxPhotos) : [];
    const chanote = single ? collectChanote(classified) : undefined;
    const mapUrl = single ? mapLinks[0] : undefined;
    const applied: AppliedProperty[] = [];
    for (const property of result.properties) {
      applied.push(await this.applyProperty(key, property, mergeTargets, photos, chanote, mapUrl));
    }
    this.deps.logger.info("ingestion sweep: extracted properties (fallback)", {
      conversationKey: key,
      messageCount: batch.length,
      propertyCount: applied.length,
    });
    return applied;
  }

  /** The conversation's existing properties become merge targets for any ambiguous create-new. */
  private toMergeTargets(candidates: readonly ExtractionCandidate[]): MergeTarget[] {
    return candidates.map((c) => ({
      id: c.propertyId,
      label: c.normalizedAddress ?? c.projectName ?? c.propertyId,
    }));
  }

  private async applyProperty(
    key: string,
    property: ExtractedProperty,
    mergeTargets: readonly MergeTarget[],
    newPhotos: readonly PropertyPhoto[],
    chanote?: Chanote,
    mapUrl?: string,
  ): Promise<AppliedProperty> {
    // Ambiguous-but-unmatched → create new (never auto-merge across ambiguity); the confirmation
    // flags it so a human can correct it. Interactive quick-reply resolution is a later slice.
    const isNew = property.existingPropertyId === "";
    const propertyId = isNew ? this.newId() : property.existingPropertyId;
    const now = this.deps.clock.now();

    // Accumulate photos (a property's gallery grows across batches) — merge this batch's labelled
    // images with any already stored, de-duped by S3 key, rather than replacing.
    const photos = await this.mergePhotos(isNew ? null : propertyId, newPhotos);

    const upsert: PropertyUpsert = {
      propertyId,
      ...extractedToBaseUpsert(property, chanote),
      // Keep the original shared map link (set-if-present, so it isn't cleared when none this batch).
      ...(mapUrl !== undefined ? { mapUrl } : {}),
      // Title-deed data from a chanote scan this batch (set-if-present).
      ...(chanote !== undefined ? { chanote } : {}),
      // Only set photos when this batch had images — never clobber existing photos with an empty list.
      ...(photos !== undefined ? { photos } : {}),
      updatedAt: now,
      lastActivityAt: now,
      ...(isNew ? { originConversationKey: key, createdAt: now } : {}),
    };
    await this.deps.catalog.upsertProperty(upsert);
    await this.deps.catalog.linkConversationProperty(key, propertyId, now);

    const label =
      emptyToUndef(property.normalizedAddress) ?? emptyToUndef(property.projectName) ?? propertyId;
    // Narrow the merge offer to the model's `ambiguousWith` hint when it named valid candidates;
    // otherwise fall back to offering every candidate (the safe original behaviour).
    const hinted = new Set(property.ambiguousWith);
    const filtered = mergeTargets.filter((t) => hinted.has(t.id));
    const offered = filtered.length > 0 ? filtered : mergeTargets;
    return {
      propertyId,
      isNew,
      ambiguous: property.ambiguous,
      label,
      // Only an ambiguous create-new gets merge offers, and only against *other* existing
      // properties (the just-created one is brand new, so it's never in the candidate set).
      ...(property.ambiguous && offered.length > 0 ? { mergeTargets: offered } : {}),
    };
  }

  /** Merge a batch's labelled images into a property's existing gallery (de-duped by S3 key, a fresh
   * classification winning), or undefined when this batch had no images — so we never clobber stored
   * photos with an empty list. */
  private async mergePhotos(
    existingPropertyId: string | null,
    newPhotos: readonly PropertyPhoto[],
  ): Promise<PropertyPhoto[] | undefined> {
    if (newPhotos.length === 0) {
      return undefined;
    }
    const prior =
      existingPropertyId === null
        ? []
        : ((await this.deps.catalog.getProperty(existingPropertyId))?.photos ?? []);
    const byKey = new Map<string, PropertyPhoto>();
    for (const p of prior) {
      byKey.set(p.s3Key, p);
    }
    for (const p of newPhotos) {
      byKey.set(p.s3Key, p); // re-classification of the same image wins
    }
    return [...byKey.values()];
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
