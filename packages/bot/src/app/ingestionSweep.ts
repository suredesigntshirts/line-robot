import { randomUUID } from "node:crypto";
import type {
  Chanote,
  ConversationTracker,
  PropertyPhoto,
  PropertyUpsert,
} from "../core/domain/catalog.js";
import { pushTarget, pushTargetFromKey } from "../core/domain/conversation.js";
import { formatShortDateTime } from "../core/domain/datetime.js";
import { parseGeoLinks, parseMapUrls } from "../core/domain/geo.js";
import type { OutboundMessage, StoredMessage } from "../core/domain/message.js";
import { mergePromptQuickReplies } from "../core/handlers/views.js";
import type { CatalogRepository } from "../core/ports/catalog.js";
import type {
  ExtractedProperty,
  ExtractionCandidate,
  ImageClassifier,
  PropertyExtractor,
  PropertySegment,
  PropertySegmenter,
} from "../core/ports/extraction.js";
import type { LineGateway } from "../core/ports/lineGateway.js";
import type { MediaReader } from "../core/ports/mediaReader.js";
import type { MessageRepository } from "../core/ports/persistence.js";
import type { Clock, Logger } from "../core/ports/runtime.js";

export interface IngestionSweepDeps {
  readonly catalog: CatalogRepository;
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

/** One classified attachment from a batch: its S3 key, content-type, and the model's verdict
 * (null when classification failed → treated as a plain property photo). */
interface ClassifiedMedia {
  readonly s3Key: string;
  readonly contentType: string;
  readonly kind: PropertyPhoto["kind"];
  readonly label?: string;
  readonly chanote?: Chanote;
  readonly ocrText?: string;
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
  /** Conversations abandoned (→ FAILED) after exceeding the ingestion-attempt cap. */
  readonly abandoned: number;
}

/** The result of attempting one conversation: ingested (with counts), skipped (claim contended), or
 * abandoned (attempt cap exceeded → FAILED, no extraction run). */
type IngestOutcome =
  | { readonly kind: "ingested"; readonly messageCount: number; readonly propertyCount: number }
  | { readonly kind: "skipped" }
  | { readonly kind: "abandoned" };

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
/** Give up on a conversation after this many ingestion attempts (claims). Extraction shouldn't
 * normally fail, so a conversation that keeps failing (timeout, bad media, API error) is abandoned
 * → FAILED rather than reclaimed forever — bounding the inference + Lambda spend of a stuck loop.
 * Counts every claim including timed-out/crashed runs (the counter is committed at claim time). */
const DEFAULT_MAX_INGEST_ATTEMPTS = 3;
/** Backstop on images classified per conversation per run (one cheap vision call each). High enough
 * to cover real listings (we never know which images are documents until we look). */
const DEFAULT_MAX_CLASSIFY = 30;
/** Image classification runs as independent vision calls — done concurrently (bounded) so a large
 * batch (20+ photos) doesn't serialise past the sweep's Lambda timeout. Each Haiku call is cheap;
 * a small pool stays well under Anthropic concurrency limits while cutting wall-clock ~Nx. */
const CLASSIFY_CONCURRENCY = 6;
/** Property photos kept per batch — documents (chanote/other) are uncapped. */
const DEFAULT_MAX_PROPERTY_PHOTOS = 12;
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

/** Extraction now uses sentinels (see ports/extraction.ts): `""` for absent text, `[]` for absent
 * lists — so set-if-present upserts never clobber a stored value with an empty one. */
function emptyToUndef(value: string): string | undefined {
  return value === "" ? undefined : value;
}
function listToUndef(value: readonly string[]): string[] | undefined {
  return value.length > 0 ? [...value] : undefined;
}

/** Merge title-deed reads across a chanote's pages (front carries the parcel fields, the back the
 * encumbrances) — prefer the first non-empty value per field; union the encumbrances. */
function mergeChanote(a: Chanote, b: Chanote): Chanote {
  const pick = (x?: string, y?: string): string | undefined => x ?? y;
  const notes = [a.confidenceNote, b.confidenceNote].filter((n): n is string => n !== undefined);
  return {
    titleType: pick(a.titleType, b.titleType),
    deedNumber: pick(a.deedNumber, b.deedNumber),
    landNumber: pick(a.landNumber, b.landNumber),
    surveyPage: pick(a.surveyPage, b.surveyPage),
    mapSheet: pick(a.mapSheet, b.mapSheet),
    landOffice: pick(a.landOffice, b.landOffice),
    province: pick(a.province, b.province),
    district: pick(a.district, b.district),
    subdistrict: pick(a.subdistrict, b.subdistrict),
    landArea: pick(a.landArea, b.landArea),
    ownerName: pick(a.ownerName, b.ownerName),
    encumbrances:
      [...(a.encumbrances ?? []), ...(b.encumbrances ?? [])].length > 0
        ? [...new Set([...(a.encumbrances ?? []), ...(b.encumbrances ?? [])])]
        : undefined,
    confidenceNote: notes.length > 0 ? notes.join(" ") : undefined,
  };
}

/** A blank extracted property (all sentinels) — used when a focused pass-2 extract returns nothing
 * but the segment still warrants a record (so its photos/map/chanote aren't lost). */
function emptyExtracted(): ExtractedProperty {
  return {
    existingPropertyId: "",
    ambiguous: false,
    ambiguousWith: [],
    normalizedAddress: "",
    rawAddress: "",
    projectName: "",
    lat: null,
    long: null,
    district: "",
    subdistrict: "",
    province: "",
    propertyType: "",
    status: "",
    askingPrice: null,
    currency: "",
    tags: [],
    bedrooms: null,
    bathrooms: null,
    usableAreaSqm: null,
    landArea: "",
    floors: null,
    furnishing: "",
    notes: "",
    listingType: "",
    rentPrice: null,
    contact: "",
    source: "",
  };
}

/** Combine a segment's identity decision (pass 1) with the focused field extraction (pass 2). The
 * segment owns create-vs-update + ambiguity; the focused extract owns the fields. If pass 2 produced
 * nothing, keep the segment label as a project name so the listing isn't nameless. */
function mergeSegment(segment: PropertySegment, fields?: ExtractedProperty): ExtractedProperty {
  const base = fields ?? emptyExtracted();
  const projectName =
    base.projectName !== "" ? base.projectName : fields === undefined ? segment.label : "";
  return {
    ...base,
    projectName,
    existingPropertyId: segment.existingPropertyId,
    ambiguous: segment.ambiguous,
    ambiguousWith: segment.ambiguousWith,
  };
}

/** Map over items with a bounded number of in-flight promises, preserving input order in the result
 * (workers pull from a shared cursor). Lets us fan out independent I/O — e.g. per-image vision calls
 * — without spawning all N at once or serialising them one at a time. */
async function mapWithConcurrency<T, R>(
  items: readonly T[],
  limit: number,
  fn: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  const results = new Array<R>(items.length);
  let cursor = 0;
  const worker = async (): Promise<void> => {
    while (true) {
      const i = cursor++;
      if (i >= items.length) {
        return;
      }
      results[i] = await fn(items[i] as T, i);
    }
  };
  const workers = Array.from({ length: Math.min(limit, items.length) }, worker);
  await Promise.all(workers);
  return results;
}

/** Build the single timestamped transcript both passes read. Each line is `[<Bangkok date+time>]`
 * followed by the message text (with map links rewritten to `[MAP n]`) or an image marker
 * `[IMG n] <kind> - <label> ocr: <text>`. The timestamps (second resolution) expose burst/gap
 * structure for segmentation; the indexed markers let the segmenter attribute media per property. */
function buildTranscript(
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
        claimed: 0,
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
      claimed: 0,
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
    // Per-image pass: classify every attachment + OCR documents (plan 13).
    const classified = await this.classifyMedia(batch);
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
    const allGeoHints = parseGeoLinks(chatText).map((g) => ({ lat: g.lat, long: g.long }));
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
    const applied: AppliedProperty[] = [];
    for (const segment of seg.segments) {
      const mapUrl = segment.mapIndex >= 0 ? mapLinks[segment.mapIndex] : undefined;
      // Pass ONLY this property's own map coord to its focused extract (don't leak siblings' coords).
      const segGeo =
        mapUrl !== undefined
          ? parseGeoLinks(mapUrl).map((g) => ({ lat: g.lat, long: g.long }))
          : [];
      // PASS 2 — a focused extraction filling all fields for THIS property only (no dilution).
      const result = await this.deps.extractor.extract({
        conversationKey: key,
        text: transcript,
        media: [],
        geoHints: segGeo,
        candidates,
        focus: segment.label,
      });
      const segImages = segment.imageIndices
        .map((i) => classified[i])
        .filter((c): c is ClassifiedMedia => c !== undefined);
      const photos = this.collectPhotos(segImages);
      const chanote = this.collectChanote(segImages);
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
    const single = result.properties.length === 1;
    const photos = single ? this.collectPhotos(classified) : [];
    const chanote = single ? this.collectChanote(classified) : undefined;
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
      normalizedAddress: emptyToUndef(property.normalizedAddress),
      rawAddresses: emptyToUndef(property.rawAddress) ? [property.rawAddress] : undefined,
      projectName: emptyToUndef(property.projectName),
      lat: nullToUndef(property.lat),
      long: nullToUndef(property.long),
      // Backfill location from the title deed when the chat text didn't state it.
      district: emptyToUndef(property.district) ?? chanote?.district,
      subdistrict: emptyToUndef(property.subdistrict) ?? chanote?.subdistrict,
      province: emptyToUndef(property.province) ?? chanote?.province,
      propertyType: emptyToUndef(property.propertyType),
      status: emptyToUndef(property.status),
      askingPrice: nullToUndef(property.askingPrice),
      currency: emptyToUndef(property.currency),
      tags: listToUndef(property.tags),
      bedrooms: nullToUndef(property.bedrooms),
      bathrooms: nullToUndef(property.bathrooms),
      usableAreaSqm: nullToUndef(property.usableAreaSqm),
      landArea: emptyToUndef(property.landArea) ?? chanote?.landArea,
      floors: nullToUndef(property.floors),
      furnishing: emptyToUndef(property.furnishing),
      notes: emptyToUndef(property.notes),
      listingType: emptyToUndef(property.listingType),
      rentPrice: nullToUndef(property.rentPrice),
      contact: emptyToUndef(property.contact),
      source: emptyToUndef(property.source),
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

  /** Classify (+ OCR documents) every media attachment in the batch, one vision call each, capped at
   * the classify backstop. A missing/unreadable object or a failed classify falls back to a plain
   * `property` photo (logged) rather than failing the whole conversation. */
  private async classifyMedia(batch: StoredMessage[]): Promise<ClassifiedMedia[]> {
    const maxClassify = this.opts.maxMedia ?? DEFAULT_MAX_CLASSIFY;
    const withAttachment = batch.filter(
      (m) => m.attachment !== undefined && MEDIA_CONTENT_TYPES.has(m.attachment.contentType),
    );
    if (withAttachment.length > maxClassify) {
      this.deps.logger.info("ingestion sweep: capping media", {
        available: withAttachment.length,
        cap: maxClassify,
      });
    }

    // Classify with bounded concurrency: each image is an independent vision call, so a serial loop
    // over a large batch (20+ photos) blows the sweep's Lambda timeout. Results stay positional, so
    // the [IMG n] markers + segment imageIndices remain stable (buildTranscript keys off this order).
    const settled = await mapWithConcurrency(
      withAttachment.slice(0, maxClassify),
      CLASSIFY_CONCURRENCY,
      async (message): Promise<ClassifiedMedia | null> => {
        const attachment = message.attachment;
        if (attachment === undefined) {
          return null;
        }
        let bytes: Buffer;
        try {
          bytes = await this.deps.media.getMedia(attachment.s3Key);
        } catch (error) {
          this.deps.logger.warn("ingestion sweep: media read failed; skipping", {
            s3Key: attachment.s3Key,
            error: String(error),
          });
          return null;
        }
        const classification = await this.deps.classifier.classifyImage({
          base64: bytes.toString("base64"),
          mediaType: attachment.contentType,
        });
        return {
          s3Key: attachment.s3Key,
          contentType: attachment.contentType,
          // A failed classify defaults to a plain property photo (stored + shown, just unlabelled).
          kind: classification?.kind ?? "property",
          ...(classification?.label !== undefined ? { label: classification.label } : {}),
          ...(classification?.chanote !== undefined ? { chanote: classification.chanote } : {}),
          ...(classification?.ocrText !== undefined ? { ocrText: classification.ocrText } : {}),
        };
      },
    );
    return settled.filter((c): c is ClassifiedMedia => c !== null);
  }

  /** The labelled gallery images for a single-property batch: only renderable images (PDFs can't show
   * in an image carousel), property photos capped, documents (chanote/other) uncapped. */
  private collectPhotos(classified: readonly ClassifiedMedia[]): PropertyPhoto[] {
    const maxPhotos = this.opts.maxPropertyPhotos ?? DEFAULT_MAX_PROPERTY_PHOTOS;
    const photos: PropertyPhoto[] = [];
    let propertyCount = 0;
    for (const c of classified) {
      if (!c.contentType.startsWith("image/")) {
        continue; // a chanote PDF still yields chanote data, but can't be a gallery image
      }
      if (c.kind === "property") {
        if (propertyCount >= maxPhotos) {
          continue;
        }
        propertyCount += 1;
      }
      photos.push({
        s3Key: c.s3Key,
        kind: c.kind,
        ...(c.label !== undefined ? { label: c.label } : {}),
      });
    }
    return photos;
  }

  /** Merge the chanote reads across all title-deed images/pages in a single-property batch. */
  private collectChanote(classified: readonly ClassifiedMedia[]): Chanote | undefined {
    const chanotes = classified.flatMap((c) => (c.chanote !== undefined ? [c.chanote] : []));
    if (chanotes.length === 0) {
      return undefined;
    }
    return chanotes.reduce((acc, c) => mergeChanote(acc, c));
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
