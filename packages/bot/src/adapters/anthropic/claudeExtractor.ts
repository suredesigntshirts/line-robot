import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";
import type {
  ExtractionRequest,
  ExtractionResult,
  PropertyExtractor,
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

/** Haiku primary → Sonnet 4.6 (effort medium) → Opus 4.8 (effort high) — escalate only on low
 * confidence. `max` effort is Opus-tier only; Haiku rejects `effort`/`thinking` entirely. */
const DEFAULT_LADDER: readonly ModelTier[] = [
  { model: "claude-haiku-4-5" },
  { model: "claude-sonnet-4-6", effort: "medium", thinking: true },
  { model: "claude-opus-4-8", effort: "high", thinking: true },
];

const IMAGE_MEDIA_TYPES = new Set(["image/jpeg", "image/png", "image/gif", "image/webp"]);

const ExtractedPropertySchema = z.object({
  existingPropertyId: z.string().nullable(),
  ambiguous: z.boolean(),
  ambiguousWith: z.array(z.string()).nullable(),
  normalizedAddress: z.string().nullable(),
  rawAddress: z.string().nullable(),
  projectName: z.string().nullable(),
  lat: z.number().nullable(),
  long: z.number().nullable(),
  district: z.string().nullable(),
  subdistrict: z.string().nullable(),
  province: z.string().nullable(),
  propertyType: z.string().nullable(),
  status: z.string().nullable(),
  askingPrice: z.number().nullable(),
  currency: z.string().nullable(),
  tags: z.array(z.string()).nullable(),
});

const ExtractionSchema = z.object({
  properties: z.array(ExtractedPropertySchema),
  memoryUpdate: z.string().nullable(),
  lowConfidence: z.boolean(),
});

type ParsedExtraction = z.infer<typeof ExtractionSchema>;

// Stable cached prefix: instructions + field taxonomy + a small Thai title-deed glossary. The
// volatile batch/candidates/photos go in the user turn, after this breakpoint.
const SYSTEM_PROMPT = `You are a real-estate catalog assistant for a Thai/English property brokerage. From a batch of chat messages — plus any attached photos or title-deed (chanote) scans — extract structured PROPERTY records.

Method:
- First segment the batch into per-property buckets, then emit one entry per DISTINCT property.
- Decide update-vs-create per property: if it clearly matches one of the existing properties provided, set existingPropertyId to that id; otherwise set existingPropertyId to null (a new property).
- If a match is plausible but you are not confident, set existingPropertyId to null AND ambiguous to true, and set ambiguousWith to the id(s) of the existing candidate(s) it might actually be (from the provided candidates). Never guess a merge across ambiguity.
- Use null for every field not stated. Do NOT invent values.
- Set lowConfidence to true only if this batch is genuinely hard to extract — unreadable handwriting/OCR, conflicting or contradictory figures, or you are unsure of the overall structure. A stronger model then re-reads it. Otherwise set lowConfidence to false; do NOT set it merely because some fields are absent.

Field rules:
- askingPrice: a plain number in the property's currency (strip symbols, commas, and units like "M"/"ล้าน" — e.g. "5.5 ล้าน" → 5500000). currency defaults to "THB" unless another is stated.
- propertyType: one of land, house, townhouse, condo, commercial, shophouse (best guess).
- status: one of lead, researching, visited, negotiating, offer, under-contract, closed, dropped.
- lat/long: if map coordinates are supplied in the request, attach them to the property they describe.
- normalizedAddress: a clean single-line address; rawAddress: the address exactly as written in chat.

Thai title-deed glossary (context only): โฉนด = Chanote (full title), น.ส.3ก = Nor Sor 3 Gor, ส.ป.ก. = Sor Por Kor (agricultural), ไร่/งาน/ตารางวา = rai/ngan/wah (land area: 1 rai = 4 ngan = 400 wah = 1600 sqm), ตำบล/tambon = subdistrict, อำเภอ/amphoe = district, จังหวัด = province.

Conversation memory:
- A "Conversation memory" note may follow with durable context for THIS chat: known people, area aliases ("the Thonglor plot" → a specific property), terminology, and preferences. Use it to resolve references and aliases; do not contradict it.
- In memoryUpdate, return the FULL updated note (≤ 1500 characters) only when you learn a durable fact worth remembering next time — otherwise null. Keep it terse: facts and aliases, not a transcript. Never record secrets or sensitive personal data.`;

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
  const sections: string[] = [`New chat messages to extract from:\n${request.text || "(no text)"}`];

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
      `Existing properties in THIS conversation — match against these for updates (set existingPropertyId to the id if one matches, else null):\n${lines}`,
    );
  } else {
    sections.push(
      "There are no existing properties in this conversation yet — every property is new.",
    );
  }

  const content: Anthropic.ContentBlockParam[] = [{ type: "text", text: sections.join("\n\n") }];
  for (const media of request.media) {
    if (IMAGE_MEDIA_TYPES.has(media.mediaType)) {
      content.push({
        type: "image",
        source: {
          type: "base64",
          media_type: media.mediaType as "image/jpeg" | "image/png" | "image/gif" | "image/webp",
          data: media.base64,
        },
      });
    } else if (media.mediaType === "application/pdf") {
      content.push({
        type: "document",
        source: { type: "base64", media_type: "application/pdf", data: media.base64 },
      });
    }
    // Other types (audio, video, unknown) carry no extractable property data — skip them.
  }
  return content;
}

export class ClaudeExtractor implements PropertyExtractor {
  constructor(
    private readonly client: Anthropic,
    private readonly ladder: readonly ModelTier[] = DEFAULT_LADDER,
    private readonly logger?: Logger,
  ) {}

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

export function createClaudeExtractor(
  apiKey: string,
  ladder?: readonly ModelTier[],
  logger?: Logger,
): ClaudeExtractor {
  return new ClaudeExtractor(new Anthropic({ apiKey }), ladder, logger);
}
