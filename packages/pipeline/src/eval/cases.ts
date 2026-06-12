export type EvalTier = "A" | "B";

export interface EvalCase {
  id: string;
  /** A = real anonymized hand-verified chats (parked, founder ruling Q6); B = synthetic, ground truth by construction. */
  tier: EvalTier;
  /** The LINE conversation the pipeline ingests, as exported text. */
  transcript: string;
  expected: ExpectedOutcome;
}

/** Ground truth for one case. Field-level value shapes are owned by Stage 2's pipeline output types. */
export interface ExpectedOutcome {
  /** One entry per distinct property in the transcript; keys are extraction field names. */
  properties: Array<Record<string, unknown>>;
  /** Property-id pairs that are the same real-world listing (dedup ground truth). */
  duplicatePairs: Array<[string, string]>;
}

/** Tier B synthetic cases arrive with the Stage 1 generator; until then the set is empty. */
export function loadCases(): EvalCase[] {
  return [];
}
