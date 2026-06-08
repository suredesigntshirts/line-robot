import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";
import type { Chanote } from "../../core/domain/catalog.js";
import { emptyToUndef } from "../../core/domain/sentinel.js";
import type {
  ExtractionMedia,
  ExtractionRequest,
  ExtractionResult,
  ImageClassification,
  ImageClassifier,
  PropertyExtractor,
  PropertySegmenter,
  SegmentationResult,
} from "../../core/ports/extraction.js";
import type { Logger } from "../../core/ports/runtime.js";

/**
 * Property extraction via one structured-output call per tier (no agent loop — cheapest). The cheap
 * primary is Haiku 4.5 run plain (`effort`/`thinking` error on Haiku); when it reports
 * `lowConfidence`, the call escalates up a model ladder (Sonnet 4.6 → Opus 4.8) with adaptive
 * thinking, so the common case stays cheap and only hard batches pay for a stronger model. Absent
 * fields are modelled as explicit `.nullable()` rather than optional, so the model always emits the
 * key — more deterministic and easier to diff. See `plans/09-realestate-catalog-assistant.md`.
 */

const MAX_TOKENS = 4096;
/** Thinking tiers need more headroom (thinking tokens count toward the output budget). */
const THINKING_MAX_TOKENS = 8192;

/** One rung of the escalation ladder. Haiku takes no `effort`/`thinking` (they error on Haiku);
 * the stronger tiers set `effort` + adaptive thinking. */
export interface ModelTier {
  readonly model: string;
  readonly effort?: "low" | "medium" | "high" | "max";
  readonly thinking?: boolean;
}

/** Haiku primary → Sonnet 4.6 (effort medium) — escalate only on low confidence (hard chanote OCR,
 * conflicting figures). We deliberately do NOT escalate to Opus: property extraction is not a
 * reasoning-hard task, and Opus-with-thinking is slow + costly for no real gain here. Haiku rejects
 * `effort`/`thinking` entirely, so only the Sonnet rung sets them. (The interactive edit path uses a
 * Haiku-only ladder with no escalation at all — see `lambda/processor.ts`.) */
const DEFAULT_LADDER: readonly ModelTier[] = [
  { model: "claude-haiku-4-5" },
  { model: "claude-sonnet-4-6", effort: "medium", thinking: true },
];

/** Image MIME types we can send to the model as an `image` block (PDF → `document`; anything else is
 * skipped). One set, shared by the extraction content builder and the per-image classifier. */
const SUPPORTED_IMAGE_MEDIA_TYPES = new Set(["image/jpeg", "image/png", "image/gif", "image/webp"]);

// IMPORTANT: Anthropic strict structured output caps a schema at 16 UNION (nullable) parameters —
// see ./CLAUDE.md. We therefore keep `.nullable()` ONLY for numbers (no clean empty sentinel) and
// model every other "not stated" as a required field with a sentinel: text → "" , list → [] .
// Strict mode forces every key to be present anyway, so this keeps the same determinism without
// spending the nullable budget. Current nullable count = 8 (the numbers below). A regression test
// (`claudeExtractor.schema.test.ts`) asserts this stays ≤ 16.
const ExtractedPropertySchema = z.object({
  existingPropertyId: z.string(), // "" → create-new; otherwise the id to update
  ambiguous: z.boolean(),
  ambiguousWith: z.array(z.string()), // [] → none
  normalizedAddress: z.string(),
  rawAddress: z.string(),
  projectName: z.string(),
  lat: z.number().nullable(),
  long: z.number().nullable(),
  district: z.string(),
  subdistrict: z.string(),
  province: z.string(),
  propertyType: z.string(),
  status: z.string(),
  askingPrice: z.number().nullable(),
  currency: z.string(),
  tags: z.array(z.string()), // [] → none
  bedrooms: z.number().nullable(),
  bathrooms: z.number().nullable(),
  usableAreaSqm: z.number().nullable(),
  landArea: z.string(),
  floors: z.number().nullable(),
  furnishing: z.string(),
  notes: z.string(),
  listingType: z.string(),
  rentPrice: z.number().nullable(),
  contact: z.string(),
  source: z.string(),
});

export const ExtractionSchema = z.object({
  properties: z.array(ExtractedPropertySchema),
  memoryUpdate: z.string(), // "" → no durable update this run
  lowConfidence: z.boolean(),
});

type ParsedExtraction = z.infer<typeof ExtractionSchema>;

// --- Two-pass: segmentation (plan 13 inc 6) --------------------------------------------------------
// Pass 1 splits a batch into distinct properties and attributes their images/map by index — no field
// extraction (that's pass 2, `extract` with `focus`). 0 nullables (arrays/sentinels only).
const SegmentSchema = z.object({
  label: z.string(), // short anchor for the property, e.g. "Mooban Wangtan"
  existingPropertyId: z.string(), // "" → create-new
  ambiguous: z.boolean(),
  ambiguousWith: z.array(z.string()),
  imageIndices: z.array(z.number()), // which [IMG n] belong to this property
  mapIndex: z.number(), // which [MAP n] belongs to it; -1 = none
});

export const SegmentationSchema = z.object({
  segments: z.array(SegmentSchema),
  memoryUpdate: z.string(), // "" → none
});

const SEGMENT_SYSTEM_PROMPT = `You segment a batch of Thai/English property-chat messages into the DISTINCT properties it covers. Do NOT extract details — only split + attribute.

The transcript is line-by-line in chat order. Image attachments appear as "[IMG n] <kind> - <label> ocr: <text>" and shared map links as "[MAP n] ...". Use the ordering + content to group everything about one property together.

For each distinct property, output one segment with:
- label: a short anchor naming it (a project/road name or the clearest identifier in its messages).
- existingPropertyId: if it clearly matches one of the existing properties listed, that id; else "" (new). If unsure, "" + ambiguous=true + ambiguousWith=[the candidate id(s) it might be].
- imageIndices: the n of every [IMG n] that belongs to this property (photos, its chanote pages, its docs). [] if none.
- mapIndex: the n of the [MAP n] that is this property's location, or -1.

Assign each image/map to exactly one property by its position + content. If the whole batch is one property, return a single segment listing all images. In memoryUpdate, return a durable note (≤1500 chars) only if you learned something worth remembering, else "".`;

// --- Per-image classify + OCR (plan 13) ------------------------------------------------------------
// Each image gets ONE small vision call. Stays trivially within the 16-union limit: only `chanote`
// is nullable (1); every inner field is required-with-sentinel ("" / []).
const ChanoteSchema = z.object({
  titleType: z.string(), // chanote | nor-sor-3-gor | nor-sor-3 | sor-por-kor | other | ""
  deedNumber: z.string(),
  landNumber: z.string(),
  surveyPage: z.string(),
  mapSheet: z.string(),
  landOffice: z.string(),
  province: z.string(),
  district: z.string(),
  subdistrict: z.string(),
  landArea: z.string(),
  ownerName: z.string(),
  encumbrances: z.array(z.string()),
  confidenceNote: z.string(), // "" unless something was hard to read
});

export const ClassifiedImageSchema = z.object({
  kind: z.enum(["property", "chanote", "other"]),
  label: z.string(), // short subtype of the image; "" if nothing useful
  chanote: ChanoteSchema.nullable(), // non-null only when kind === "chanote"
  ocrText: z.string(), // text read off a document/screenshot ("other"); "" otherwise
});

type ParsedClassification = z.infer<typeof ClassifiedImageSchema>;

const CLASSIFY_SYSTEM_PROMPT = `You classify ONE image from a Thai/English property chat and, if it is a document, read its text.

Set "kind" to exactly one of:
- "property": a photo of the actual property — building, room, exterior, land plot, view, floor plan render. No legal text.
- "chanote": a Thai land title deed or land legal document. Recognise it by its CONTENT/LAYOUT, never by the Garuda emblem colour or the file type — photocopies are greyscale and back/continuation pages may have no Garuda. Tell-tale content: a title-deed/parcel number (เลขที่โฉนด/เลขที่ดิน), a survey map-sheet (ระวาง), area in rai/ngan/wah (ไร่/งาน/ตารางวา), a surveyed plot diagram, a Land Office (สำนักงานที่ดิน), an owner registry.
- "other": any other document or text image — a sale/lease contract, a screenshot of chat messages, a listing flyer, a price sheet, a map screenshot.

Set "label" to a SHORT (2-4 word) lowercase descriptor of this specific image — loose, not strict. Examples by kind:
- property: "external - front", "external - side", "external - balcony", "internal - bedroom", "internal - living room", "internal - kitchen", "internal - bathroom", "road / access", "view", "floor plan".
- chanote: "front", "back", "2nd page", "plot diagram".
- other: "chat log", "contract", "price list", "map screenshot".
Pick the closest fit; coin a similar short label if none match. "" only if you truly can't tell.

If kind is "chanote": fill the chanote object (else set chanote to null). Make a BEST EFFORT even on low-quality scans; for any field you cannot read confidently, leave it "" and describe the problem in confidenceNote. Use "" for missing text, [] for no encumbrances.
- titleType: chanote (โฉนด / Nor Sor 4 Jor) | nor-sor-3-gor (น.ส.3ก) | nor-sor-3 (น.ส.3) | sor-por-kor (ส.ป.ก.) | other.
- deedNumber=เลขที่โฉนด, landNumber=เลขที่ดิน, surveyPage=หน้าสำรวจ, mapSheet=ระวาง, landOffice=สำนักงานที่ดิน, landArea=area as written (e.g. "1 rai 2 ngan 30 wah"), ownerName=registered owner(s).
- encumbrances: from the reverse side — mortgages (จำนอง), leases, usufructs (สิทธิเก็บกิน), servitudes (ภาระจำยอม); [] if none/not shown.

If kind is "other": put ALL legible text into ocrText verbatim (it may contain property facts). Otherwise ocrText is "".
If kind is "property": chanote is null and ocrText is "".`;

// Stable cached prefix: instructions + field taxonomy + a small Thai title-deed glossary. The
// volatile batch/candidates/photos go in the user turn, after this breakpoint.
const SYSTEM_PROMPT = `You are a real-estate catalog assistant for a Thai/English property brokerage. From a batch of chat messages — plus any attached photos or title-deed (chanote) scans — extract structured PROPERTY records.

Method:
- First segment the batch into per-property buckets, then emit one entry per DISTINCT property.
- Decide update-vs-create per property: if it clearly matches one of the existing properties provided, set existingPropertyId to that id; otherwise set existingPropertyId to "" (empty string = a new property).
- If a match is plausible but you are not confident, set existingPropertyId to "" AND ambiguous to true, and set ambiguousWith to the id(s) of the existing candidate(s) it might actually be (from the provided candidates). Never guess a merge across ambiguity.
- For any value NOT stated: use "" for text fields, [] for list fields, and null for the numeric fields (lat, long, askingPrice, rentPrice, bedrooms, bathrooms, usableAreaSqm, floors). Do NOT invent values.
- Set lowConfidence to true only if this batch is genuinely hard to extract — unreadable handwriting/OCR, conflicting or contradictory figures, or you are unsure of the overall structure. A stronger model then re-reads it. Otherwise set lowConfidence to false; do NOT set it merely because some fields are absent.

Field rules:
- askingPrice: a plain number in the property's currency (strip symbols, commas, and units like "M"/"ล้าน" — e.g. "5.5 ล้าน" → 5500000). currency defaults to "THB" unless another is stated.
- propertyType: one of land, house, townhouse, condo, commercial, shophouse (best guess).
- status: one of lead, researching, visited, negotiating, offer, under-contract, closed, dropped.
- lat/long: if map coordinates are supplied in the request, attach them to the property they describe.
- normalizedAddress: a clean single-line address; rawAddress: the address exactly as written in chat.
- bedrooms/bathrooms/floors: plain integer counts. usableAreaSqm: built/usable area in square metres (number). landArea: land size exactly as written, keeping Thai units (e.g. "1 rai 2 ngan", "80 ตารางวา").
- furnishing: one of unfurnished, partly furnished, fully furnished. listingType: "sale" or "rent" (if it's a rental, put the monthly rent in rentPrice and leave askingPrice null unless a sale price is also given).
- contact: the owner/agent name and/or phone exactly as written. source: where the lead came from (a person, a group/chat name, or a listing site). notes: a short free-form description of anything notable not captured by the other fields.

Thai title-deed glossary (context only): โฉนด = Chanote (full title), น.ส.3ก = Nor Sor 3 Gor, ส.ป.ก. = Sor Por Kor (agricultural), ไร่/งาน/ตารางวา = rai/ngan/wah (land area: 1 rai = 4 ngan = 400 wah = 1600 sqm), ตำบล/tambon = subdistrict, อำเภอ/amphoe = district, จังหวัด = province.

Conversation memory:
- A "Conversation memory" note may follow with durable context for THIS chat: known people, area aliases ("the Thonglor plot" → a specific property), terminology, and preferences. Use it to resolve references and aliases; do not contradict it.
- In memoryUpdate, return the FULL updated note (≤ 1500 characters) only when you learn a durable fact worth remembering next time — otherwise "" (empty string). Keep it terse: facts and aliases, not a transcript. Never record secrets or sensitive personal data.`;

/** A label that introduces the per-conversation memory note in the system prefix. */
const MEMORY_PREAMBLE =
  "Conversation memory (durable context learned earlier in this chat) — use it to resolve references:";

/**
 * Build the system prefix: a shared, conversation-independent instruction block (its own cache
 * breakpoint, so it can be reused across conversations once large enough), plus the per-conversation
 * memory note in a second block. Both use a **1h** TTL because re-ingests of the same conversation
 * are spaced by the debounce window (5–30 min), which would expire the default 5-min cache before
 * the next sweep. NOTE: Haiku's minimum cacheable prefix is **4096 tokens** — today's system+memory
 * prefix is well under that, so these breakpoints don't actually cache yet; they're placed correctly
 * for when the prefix grows (verify with `cache_read_input_tokens` in the logs). Exported (pure) so
 * the shape is unit-testable.
 */
export function buildExtractionSystem(memory?: string): Anthropic.TextBlockParam[] {
  const blocks: Anthropic.TextBlockParam[] = [
    { type: "text", text: SYSTEM_PROMPT, cache_control: { type: "ephemeral", ttl: "1h" } },
  ];
  const trimmed = memory?.trim();
  if (trimmed !== undefined && trimmed !== "") {
    blocks.push({
      type: "text",
      text: `${MEMORY_PREAMBLE}\n${trimmed}`,
      cache_control: { type: "ephemeral", ttl: "1h" },
    });
  }
  return blocks;
}

/** Build the volatile user-turn content: the batch text + candidates + geo hints, followed by any
 * media blocks. Exported (pure) so the prompt shape is unit-testable without hitting the API. */
export function buildExtractionContent(request: ExtractionRequest): Anthropic.ContentBlockParam[] {
  const sections: string[] = [];
  if (request.focus !== undefined && request.focus !== "") {
    // Two-pass: extract only the one property a prior segmentation pass identified.
    sections.push(
      `FOCUS: Extract ONLY the single property described as "${request.focus}" in the transcript below ` +
        "(ignore any other properties). Emit EXACTLY ONE property entry for it. The transcript may " +
        'contain image markers like "[IMG n] ..." and map markers like "[MAP n] ..." — treat them as ' +
        "context for this property.",
    );
  }
  sections.push(`New chat messages to extract from:\n${request.text || "(no text)"}`);

  if (request.geoHints.length > 0) {
    const coords = request.geoHints.map((g) => `${g.lat},${g.long}`).join("; ");
    sections.push(
      `Map coordinates found in the messages (assign to the matching property): ${coords}`,
    );
  }

  if (request.candidates.length > 0) {
    const lines = request.candidates
      .map(
        (c) =>
          `- id=${c.propertyId} address=${c.normalizedAddress ?? "?"} project=${c.projectName ?? "?"} geo=${c.lat ?? "?"},${c.long ?? "?"}`,
      )
      .join("\n");
    sections.push(
      `Existing properties in THIS conversation — match against these for updates (set existingPropertyId to the id if one matches, else "" (empty string)):\n${lines}`,
    );
  } else {
    sections.push(
      "There are no existing properties in this conversation yet — every property is new.",
    );
  }

  const content: Anthropic.ContentBlockParam[] = [{ type: "text", text: sections.join("\n\n") }];
  for (const media of request.media) {
    // Image → image block, PDF → document block, anything else (audio/video/unknown) → skipped.
    const block = mediaBlock(media);
    if (block !== null) {
      content.push(block);
    }
  }
  return content;
}

export class ClaudeExtractor implements PropertyExtractor, PropertySegmenter {
  constructor(
    private readonly client: Anthropic,
    private readonly ladder: readonly ModelTier[] = DEFAULT_LADDER,
    private readonly logger?: Logger,
  ) {}

  /** Pass 1 of two-pass extraction: split + attribute, on the cheap primary tier (no field work). */
  async segment(request: ExtractionRequest): Promise<SegmentationResult | null> {
    const primary = this.ladder[0];
    if (primary === undefined) {
      return null;
    }
    const model = primary.model;
    try {
      const response = await this.client.messages.parse({
        model,
        max_tokens: MAX_TOKENS,
        system: [
          {
            type: "text",
            text: SEGMENT_SYSTEM_PROMPT,
            cache_control: { type: "ephemeral", ttl: "1h" },
          },
        ],
        messages: [{ role: "user", content: buildExtractionContent(request) }],
        output_config: { format: zodOutputFormat(SegmentationSchema) },
      });
      const parsed = response.parsed_output ?? null;
      if (parsed === null) {
        return null;
      }
      return { segments: parsed.segments, memoryUpdate: parsed.memoryUpdate };
    } catch (error) {
      this.logger?.warn("segmentation failed", { error: String(error) });
      return null;
    }
  }

  async extract(request: ExtractionRequest): Promise<ExtractionResult | null> {
    // Walk the ladder: accept the first tier that is confident (or unparseable-but-last). Escalate
    // when a tier reports lowConfidence and a stronger tier remains.
    for (let i = 0; i < this.ladder.length; i += 1) {
      const tier = this.ladder[i];
      if (tier === undefined) {
        continue;
      }
      const parsed = await this.callTier(tier, request);
      const hasStrongerTier = i < this.ladder.length - 1;
      if (parsed !== null && (!parsed.lowConfidence || !hasStrongerTier)) {
        return {
          properties: parsed.properties,
          memoryUpdate: parsed.memoryUpdate,
          ...(i > 0 ? { escalatedTo: tier.model } : {}),
        };
      }
      // parsed === null (unparseable) or lowConfidence with a stronger tier → escalate.
    }
    return null;
  }

  /** One structured-output call for a given tier. Haiku runs plain; stronger tiers add `effort` +
   * adaptive thinking (with extra token headroom for the thinking). */
  private async callTier(
    tier: ModelTier,
    request: ExtractionRequest,
  ): Promise<ParsedExtraction | null> {
    const response = await this.client.messages.parse({
      model: tier.model,
      max_tokens: tier.thinking === true ? THINKING_MAX_TOKENS : MAX_TOKENS,
      system: buildExtractionSystem(request.memory),
      messages: [{ role: "user", content: buildExtractionContent(request) }],
      output_config: {
        format: zodOutputFormat(ExtractionSchema),
        ...(tier.effort !== undefined ? { effort: tier.effort } : {}),
      },
      ...(tier.thinking === true ? { thinking: { type: "adaptive" as const } } : {}),
    });
    // Log token usage so cache effectiveness (cache_read_input_tokens > 0) and per-tier cost are
    // observable in CloudWatch — the cheapest way to verify prompt caching once the prefix is large
    // enough to cache.
    const usage = response.usage;
    if (this.logger !== undefined && usage !== undefined) {
      this.logger.info("extraction call", {
        model: tier.model,
        cacheReadTokens: usage.cache_read_input_tokens ?? 0,
        cacheCreationTokens: usage.cache_creation_input_tokens ?? 0,
        inputTokens: usage.input_tokens,
        outputTokens: usage.output_tokens,
      });
    }
    // parsed_output is null if the model refused or produced unparseable output — guard it.
    return response.parsed_output ?? null;
  }
}

/** Anthropic client tuning passed through to the SDK. Used by the interactive (processor) edit path
 * to bound the call so it can't exceed the Lambda's reply budget: a hard `timeout` + `maxRetries: 0`.
 * The sweep omits these and keeps the SDK defaults. */
export interface ExtractorClientOptions {
  readonly timeout?: number;
  readonly maxRetries?: number;
}

export function createClaudeExtractor(
  apiKey: string,
  ladder?: readonly ModelTier[],
  logger?: Logger,
  clientOpts?: ExtractorClientOptions,
): ClaudeExtractor {
  return new ClaudeExtractor(new Anthropic({ apiKey, ...clientOpts }), ladder, logger);
}

/** Map the model's sentinel-filled chanote object to the domain shape (drop "" / [] fields). Returns
 * undefined if nothing legible was captured. */
function toChanote(c: z.infer<typeof ChanoteSchema>): Chanote | undefined {
  const chanote: Chanote = {
    titleType: emptyToUndef(c.titleType),
    deedNumber: emptyToUndef(c.deedNumber),
    landNumber: emptyToUndef(c.landNumber),
    surveyPage: emptyToUndef(c.surveyPage),
    mapSheet: emptyToUndef(c.mapSheet),
    landOffice: emptyToUndef(c.landOffice),
    province: emptyToUndef(c.province),
    district: emptyToUndef(c.district),
    subdistrict: emptyToUndef(c.subdistrict),
    landArea: emptyToUndef(c.landArea),
    ownerName: emptyToUndef(c.ownerName),
    encumbrances: c.encumbrances.length > 0 ? [...c.encumbrances] : undefined,
    confidenceNote: emptyToUndef(c.confidenceNote),
  };
  return Object.values(chanote).some((v) => v !== undefined) ? chanote : undefined;
}

const CLASSIFY_MAX_TOKENS = 1500;

/** One Haiku vision call per image: classify property/chanote/other and, for documents, OCR. Kept
 * deliberately cheap + bounded so a listing's whole photo set can be processed independently. */
export class ClaudeImageClassifier implements ImageClassifier {
  constructor(
    private readonly client: Anthropic,
    private readonly model: string = "claude-haiku-4-5",
    private readonly logger?: Logger,
  ) {}

  async classifyImage(media: ExtractionMedia): Promise<ImageClassification | null> {
    const block = mediaBlock(media);
    if (block === null) {
      return null; // unsupported type — caller stores it as a plain property photo
    }
    let parsed: ParsedClassification | null = null;
    try {
      const response = await this.client.messages.parse({
        model: this.model,
        max_tokens: CLASSIFY_MAX_TOKENS,
        system: CLASSIFY_SYSTEM_PROMPT,
        messages: [{ role: "user", content: [block] }],
        output_config: { format: zodOutputFormat(ClassifiedImageSchema) },
      });
      parsed = response.parsed_output ?? null;
    } catch (error) {
      this.logger?.warn("image classify failed", { error: String(error) });
      return null;
    }
    if (parsed === null) {
      return null;
    }
    const chanote =
      parsed.kind === "chanote" && parsed.chanote !== null ? toChanote(parsed.chanote) : undefined;
    return {
      kind: parsed.kind,
      ...(emptyToUndef(parsed.label) !== undefined ? { label: parsed.label } : {}),
      ...(chanote !== undefined ? { chanote } : {}),
      ...(emptyToUndef(parsed.ocrText) !== undefined ? { ocrText: parsed.ocrText } : {}),
    };
  }
}

/** Map an {@link ExtractionMedia} to the single Anthropic image/document content block for a model
 * call (extraction or classify), or null for an unsupported media type. The one place this mapping
 * lives — shared by {@link buildExtractionContent} and {@link ClaudeImageClassifier}. */
function mediaBlock(media: ExtractionMedia): Anthropic.ContentBlockParam | null {
  if (SUPPORTED_IMAGE_MEDIA_TYPES.has(media.mediaType)) {
    return {
      type: "image",
      source: {
        type: "base64",
        media_type: media.mediaType as "image/jpeg" | "image/png" | "image/gif" | "image/webp",
        data: media.base64,
      },
    };
  }
  if (media.mediaType === "application/pdf") {
    return {
      type: "document",
      source: { type: "base64", media_type: "application/pdf", data: media.base64 },
    };
  }
  return null;
}

export function createClaudeImageClassifier(
  apiKey: string,
  model?: string,
  logger?: Logger,
  clientOpts?: ExtractorClientOptions,
): ClaudeImageClassifier {
  return new ClaudeImageClassifier(new Anthropic({ apiKey, ...clientOpts }), model, logger);
}
