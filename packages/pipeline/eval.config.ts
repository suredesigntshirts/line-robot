import type { PipelineStep } from "./src/eval/scorecard.ts";

export interface EvalConfig {
  model: string;
  temperature: number;
  /** Advisory pass thresholds per pipeline step (D21: reported, never blocking). */
  scoreThresholds: Record<PipelineStep, number>;
}

export const evalConfig: EvalConfig = {
  // Default/fallback; Stage 2 assigns models per step (D2.2: haiku for classify/dedup/translate,
  // sonnet/opus for segment/extract/gate).
  model: "claude-sonnet-4-6",
  temperature: 0,
  scoreThresholds: {
    classify: 0.95,
    segment: 0.9,
    extract: 0.9,
    dedup: 0.9,
    translate: 0.85,
    gate: 0.95,
  },
};
