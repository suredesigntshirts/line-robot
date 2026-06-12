import type { EvalConfig } from "../../eval.config.ts";

/**
 * The six steps of the Stage 2 extraction pipeline (master plan §4.3). The scorecard schema is
 * frozen around these so Stage 2 populates scores without a redesign; a new pipeline step adds a
 * field here (additive, non-breaking).
 */
export const PIPELINE_STEPS = [
  "classify",
  "segment",
  "extract",
  "dedup",
  "translate",
  "gate",
] as const;
export type PipelineStep = (typeof PIPELINE_STEPS)[number];

/** Aggregate 0..1 score for one pipeline step; `score` is null until a case exercises the step. */
export interface StepScore {
  score: number | null;
  casesScored: number;
}

/** Aggregate 0..1 score for one extraction field (e.g. "price", "deedType") across all cases. */
export interface FieldAggregate {
  field: string;
  score: number;
  casesScored: number;
}

export interface Scorecard {
  caseCount: number;
  failures: number;
  /** Advisory pass/fail vs eval.config.ts thresholds (D21: reported, never blocking). */
  pass: boolean;
  perStep: Record<PipelineStep, StepScore>;
  perField: FieldAggregate[];
  /** API cost of the run in USD. Real model calls land in Stage 2; 0 until then. */
  costUsd: number;
  /** Per-step delta vs the committed baseline; null while no baseline file exists. */
  baselineDelta: Record<PipelineStep, number> | null;
}

/** Reserved location for the committed baseline scorecard; none committed yet (Stage 2). */
export const BASELINE_PATH = "packages/pipeline/eval-baseline.json";

export function emptyScorecard(): Scorecard {
  const perStep = Object.fromEntries(
    PIPELINE_STEPS.map((step) => [step, { score: null, casesScored: 0 }]),
  ) as Record<PipelineStep, StepScore>;
  return {
    caseCount: 0,
    failures: 0,
    pass: true,
    perStep,
    perField: [],
    costUsd: 0,
    baselineDelta: null,
  };
}

export function renderScorecard(card: Scorecard, config: EvalConfig): string {
  const lines = [
    `eval scorecard — model ${config.model} @ temp=${config.temperature}`,
    `${card.caseCount} cases, ${card.failures} failures — ${card.pass ? "PASS" : "FAIL"} (advisory, D21)`,
    "per-step (score / threshold):",
    ...PIPELINE_STEPS.map((step) => {
      const { score } = card.perStep[step];
      const shown = score === null ? "n/a" : score.toFixed(2);
      return `  ${step.padEnd(9)} ${shown} / ${config.scoreThresholds[step].toFixed(2)}`;
    }),
    card.perField.length === 0
      ? "per-field: none scored"
      : `per-field: ${card.perField.map((f) => `${f.field}=${f.score.toFixed(2)}`).join(", ")}`,
    `cost: $${card.costUsd.toFixed(2)}`,
    card.baselineDelta === null
      ? `baseline: none committed (${BASELINE_PATH}) — delta n/a`
      : `baseline delta: ${PIPELINE_STEPS.map((s) => `${s}=${card.baselineDelta?.[s].toFixed(2)}`).join(", ")}`,
  ];
  return lines.join("\n");
}
