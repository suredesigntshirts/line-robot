import type { LlmUsage, PipelineStepName } from "./ports.ts";

// ---------------------------------------------------------------------------
// Cost log (spec §"step contracts"): every LLM call records
// {step, model, tokens, estCostUsd, mode}. Advisory observability — the
// scorecard prints the aggregate; nothing gates on it (D21).
// ---------------------------------------------------------------------------

export type TransportMode = "sync" | "batch";

export interface CostEntry {
  step: PipelineStepName;
  model: string;
  inputTokens: number;
  outputTokens: number;
  cacheReadTokens: number;
  estCostUsd: number;
  mode: TransportMode;
}

/** $/MTok (input, output, cache-read) per cached docs/llms.txt pricing. */
const PRICES: Record<string, { in: number; out: number; cacheRead: number }> = {
  "claude-haiku-4-5": { in: 1, out: 5, cacheRead: 0.1 },
  "claude-sonnet-4-6": { in: 3, out: 15, cacheRead: 0.3 },
  "claude-opus-4-8": { in: 5, out: 25, cacheRead: 0.5 },
};

export function estimateCostUsd(model: string, usage: LlmUsage, mode: TransportMode): number {
  const price = PRICES[model];
  if (!price) return 0;
  const raw =
    (usage.inputTokens * price.in +
      usage.outputTokens * price.out +
      usage.cacheReadTokens * price.cacheRead) /
    1_000_000;
  // Batch API is 50% of list price (D2.3).
  return mode === "batch" ? raw / 2 : raw;
}

export class CostLog {
  private readonly entries: CostEntry[] = [];

  record(step: PipelineStepName, model: string, usage: LlmUsage, mode: TransportMode): CostEntry {
    const entry: CostEntry = {
      step,
      model,
      ...usage,
      estCostUsd: estimateCostUsd(model, usage, mode),
      mode,
    };
    this.entries.push(entry);
    return entry;
  }

  all(): readonly CostEntry[] {
    return this.entries;
  }

  totalUsd(): number {
    return this.entries.reduce((sum, e) => sum + e.estCostUsd, 0);
  }

  /** True if any step confirmed a prompt-cache hit (gate-checklist evidence). */
  sawCacheHit(): boolean {
    return this.entries.some((e) => e.cacheReadTokens > 0);
  }
}
