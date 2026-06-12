import type { CostLog, TransportMode } from "../cost.ts";
import type { StepLlm } from "../ports.ts";

/**
 * D2.2 per-step model assignment (quality-first, D16). The scorecard justifies
 * later downgrades; escalation models handle lowConfidence re-reads.
 */
export const STEP_MODELS = {
  classify: "claude-haiku-4-5",
  classifyEscalation: "claude-sonnet-4-6",
  segment: "claude-sonnet-4-6",
  extract: "claude-sonnet-4-6",
  extractEscalation: "claude-opus-4-8",
  dedup: "claude-haiku-4-5",
  translate: "claude-haiku-4-5",
  gate: "claude-sonnet-4-6",
} as const;

/** Everything a step needs at the LLM seam; one per pipeline run. */
export interface StepContext {
  llm: StepLlm;
  costLog: CostLog;
  mode: TransportMode;
}
