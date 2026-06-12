import { STEP_MODELS, type StepContext } from "../steps/context.ts";
import { DEDUP_SYSTEM } from "../steps/prompts.ts";
import { dedupVerifySchema } from "../steps/schemas.ts";
import type { DedupResult, ExtractedListing } from "../steps.ts";
import type { BlockedCandidate } from "./candidateFinder.ts";

function renderListing(extracted: ExtractedListing): string {
  return [
    `title: ${extracted.title}`,
    `type: ${extracted.dealType} ${extracted.propertyType}, deed ${extracted.titleDeedType}`,
    `price: ${extracted.priceThb ?? "?"} THB`,
    `where: ${[extracted.landmark, extracted.tambon, extracted.amphoe, extracted.province].filter(Boolean).join(", ")}`,
    `size: ${extracted.landSqm ?? "?"} m² land, ${extracted.floorAreaSqm ?? "?"} m² floor`,
    `contact: ${extracted.contactPhone ?? "?"} (${extracted.posterName ?? "?"})`,
  ].join("\n");
}

/**
 * Step 4: LLM verify over the ≤8 blocked survivors (D2.6). Deed-exact matches
 * skip the LLM entirely (definitive). ANY failure defaults to "new" — a false
 * merge is the user-visible defect; a missed merge is recoverable.
 */
export async function dedupVerify(
  ctx: StepContext,
  extracted: ExtractedListing,
  blocked: BlockedCandidate[],
): Promise<DedupResult> {
  if (blocked.length === 0) {
    return { decision: "new", score: 0, reasons: ["no_candidates"] };
  }
  const definitive = blocked.find((c) => c.reasons.includes("deed_exact"));
  if (definitive) {
    return { decision: "merge", intoId: definitive.id, score: 1, reasons: definitive.reasons };
  }

  const response = await ctx.llm.run({
    step: "dedup",
    model: STEP_MODELS.dedup,
    system: DEDUP_SYSTEM,
    content: [
      {
        type: "text",
        text: `NEW LISTING:\n${renderListing(extracted)}\n\nCANDIDATES:\n${blocked
          .map(
            (c) =>
              `${c.id} (block score ${c.score.toFixed(2)}, ${c.reasons.join("+")}): ${c.summary}`,
          )
          .join("\n")}`,
      },
    ],
    schema: dedupVerifySchema,
    maxOutputTokens: 512,
  });
  ctx.costLog.record("dedup", STEP_MODELS.dedup, response.usage, ctx.mode);

  const verdict = response.value;
  if (
    verdict === null ||
    verdict.decision === "new" ||
    verdict.intoId === "" ||
    !blocked.some((c) => c.id === verdict.intoId)
  ) {
    return { decision: "new", score: verdict?.confidence ?? 0, reasons: ["verify_default_new"] };
  }
  return {
    decision: "merge",
    intoId: verdict.intoId,
    score: verdict.confidence,
    reasons: [verdict.reason],
  };
}
