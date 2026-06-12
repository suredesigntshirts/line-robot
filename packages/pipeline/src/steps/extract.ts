import { extractUrgencyBadge, landToSqm, stripEmoji } from "@line-robot/domain";
import type { z } from "zod";
import type { ExtractedListing, ExtractInput } from "../steps.ts";
import { STEP_MODELS, type StepContext } from "./context.ts";
import { EXTRACT_SYSTEM } from "./prompts.ts";
import { extractSchema } from "./schemas.ts";

function renderInput(input: ExtractInput): string {
  const candidates = input.candidates.map((c) => `${c.id}: ${c.label}`).join("\n");
  return [
    `TRANSCRIPT:\n${input.transcript}`,
    `FOCUS SEGMENT: ${input.focus ?? "(the whole thread is one listing)"}`,
    `GEO HINTS: ${input.geoHints.join("; ") || "(none)"}`,
    `EXISTING CANDIDATES:\n${candidates || "(none)"}`,
  ].join("\n\n");
}

const empty = (s: string) => (s === "" ? null : s);

/** Post-extraction normalization (D2.8): emoji strip, urgency badge, Thai-unit sqm. */
function normalize(raw: z.infer<typeof extractSchema>): ExtractedListing {
  const { title, urgentBadge } = extractUrgencyBadge(stripEmoji(raw.title)); // COPY-05/12
  const hasLand = raw.landRai !== null || raw.landNgan !== null || raw.landWah !== null;
  return {
    dealType: raw.dealType,
    propertyType: raw.propertyType,
    titleDeedType: raw.titleDeedType,
    priceThb: raw.priceThb,
    urgency: urgentBadge && raw.urgency === "normal" ? "quick_sale" : raw.urgency,
    urgentBadge: urgentBadge || raw.urgency === "quick_sale",
    title,
    description: raw.description,
    province: empty(raw.province),
    amphoe: empty(raw.amphoe),
    tambon: empty(raw.tambon),
    landmark: empty(raw.landmark),
    lat: raw.lat,
    lon: raw.lon,
    landRai: raw.landRai,
    landNgan: raw.landNgan,
    landWah: raw.landWah,
    floorAreaSqm: raw.floorAreaSqm,
    bedrooms: raw.bedrooms,
    bathrooms: raw.bathrooms,
    facingDirection: raw.facingDirection === "" ? null : raw.facingDirection, // FIELD-11 as-claimed
    contactPhone: empty(raw.contactPhone),
    posterName: empty(raw.posterName),
    lowConfidence: raw.lowConfidence,
    landSqm: hasLand ? landToSqm(raw.landRai ?? 0, raw.landNgan ?? 0, raw.landWah ?? 0) : null,
  };
}

async function callOnce(ctx: StepContext, input: ExtractInput, model: string) {
  const response = await ctx.llm.run({
    step: "extract",
    model,
    system: EXTRACT_SYSTEM,
    content: [{ type: "text", text: renderInput(input) }],
    schema: extractSchema,
    maxOutputTokens: 4096,
  });
  ctx.costLog.record("extract", model, response.usage, ctx.mode);
  return response.value;
}

/**
 * Step 3: per-segment extraction; Sonnet → Opus ladder on lowConfidence (D2.2).
 * Fail: null → caller drops the segment, logs, and notifies the gate.
 */
export async function extractListing(
  ctx: StepContext,
  input: ExtractInput,
): Promise<ExtractedListing | null> {
  const first = await callOnce(ctx, input, STEP_MODELS.extract);
  if (first === null) return null;
  if (first.lowConfidence) {
    const escalated = await callOnce(ctx, input, STEP_MODELS.extractEscalation);
    if (escalated !== null) return normalize(escalated);
  }
  return normalize(first);
}
