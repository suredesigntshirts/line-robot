import type { SegmentInput, SegmentResult } from "../steps.ts";
import { STEP_MODELS, type StepContext } from "./context.ts";
import { SEGMENT_SYSTEM } from "./prompts.ts";
import { segmentSchema } from "./schemas.ts";

function renderInput(input: SegmentInput): string {
  const markers = input.mediaMarkers
    .map(
      (m) =>
        `#${m.index}: ${m.classify ? `${m.classify.kind} — ${m.classify.label}` : "unclassified"}`,
    )
    .join("\n");
  const candidates = input.candidates.map((c) => `${c.id}: ${c.label}`).join("\n");
  return [
    `TRANSCRIPT:\n${input.transcript}`,
    `PHOTO MARKERS:\n${markers || "(none)"}`,
    `GEO HINTS: ${input.geoHints.join("; ") || "(none)"}`,
    `EXISTING CANDIDATES:\n${candidates || "(none)"}`,
  ].join("\n\n");
}

/**
 * Step 2: split the thread into property segments + photo attribution.
 * Fail: null → caller falls back to a single segment over the whole transcript.
 */
export async function segmentTranscript(
  ctx: StepContext,
  input: SegmentInput,
): Promise<SegmentResult | null> {
  const response = await ctx.llm.run({
    step: "segment",
    model: STEP_MODELS.segment,
    system: SEGMENT_SYSTEM,
    content: [{ type: "text", text: renderInput(input) }],
    schema: segmentSchema,
    maxOutputTokens: 2048,
  });
  ctx.costLog.record("segment", STEP_MODELS.segment, response.usage, ctx.mode);
  if (response.value === null) return null;
  return {
    segments: response.value.segments.map((s) => ({
      label: s.label,
      imageIndices: s.imageIndices,
      mapIndex: s.mapIndex,
      existingPropertyId: s.existingPropertyId === "" ? null : s.existingPropertyId,
      ambiguous: s.ambiguous,
      ambiguousWith: s.ambiguousWith,
    })),
  };
}

/** The spec'd fallback: one segment spanning the whole transcript. */
export function singleSegmentFallback(input: SegmentInput): SegmentResult {
  return {
    segments: [
      {
        label: "listing",
        imageIndices: input.mediaMarkers.map((m) => m.index),
        mapIndex: null,
        existingPropertyId: null,
        ambiguous: false,
        ambiguousWith: [],
      },
    ],
  };
}
