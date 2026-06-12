import { type GateResult, isSaleBlockedByDeed } from "@line-robot/domain";
import type { GateInput } from "../steps.ts";
import { STEP_MODELS, type StepContext } from "./context.ts";
import { GATE_SYSTEM } from "./prompts.ts";
import { gateSchema } from "./schemas.ts";

/**
 * Step 6: quality gate → the DF-6 bot-feedback contract. Hard blockers are
 * DETERMINISTIC (FIELD-02/03 deed rules — never delegated to the model); the
 * LLM proposes the missing/weak field list. Photos are nudged, never
 * hard-blocked (CONV-01). Fail: pass:false + needs_review → moderation (D11).
 */
export async function runGate(ctx: StepContext, input: GateInput): Promise<GateResult> {
  const blockers: GateResult["blockers"] = [];
  // FIELD-03: the five no-transfer deed types hard-block a SALE (rentals exempt).
  if (input.listingType === "sale" && isSaleBlockedByDeed(input.deedType)) {
    blockers.push({ reason: "deed_not_transferable", promptKey: "blocked_deed_cannot_sell" });
  }

  const response = await ctx.llm.run({
    step: "gate",
    model: STEP_MODELS.gate,
    system: GATE_SYSTEM,
    content: [
      {
        type: "text",
        text: `LISTING (extracted):\n${JSON.stringify(input.extracted, null, 2)}\nphotoCount: ${input.photoCount}`,
      },
    ],
    schema: gateSchema,
    maxOutputTokens: 1024,
  });
  ctx.costLog.record("gate", STEP_MODELS.gate, response.usage, ctx.mode);

  if (response.value === null) {
    // Spec'd failure: treat as not-passing with a generic needs-review → moderation queue.
    return {
      pass: false,
      missing: [{ field: "review", severity: "required", promptKey: "needs_review" }],
      blockers,
    };
  }

  // FIELD-02: an unknown deed never publishes — ensure the ask survives even if
  // the model omitted it (deterministic floor under the LLM's list).
  const missing = [...response.value.missing];
  if (input.deedType === "unknown" && !missing.some((m) => m.field === "titleDeedType")) {
    missing.unshift({ field: "titleDeedType", severity: "required", promptKey: "ask_deed_type" });
  }

  const pass =
    blockers.length === 0 && response.value.pass && !missing.some((m) => m.severity === "required");
  return { pass, missing, blockers };
}
