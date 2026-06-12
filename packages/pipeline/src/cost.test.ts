import { describe, expect, it } from "vitest";
import { CostLog, estimateCostUsd } from "./cost.ts";

const USAGE = { inputTokens: 1_000_000, outputTokens: 100_000, cacheReadTokens: 500_000 };

describe("estimateCostUsd", () => {
  it("prices haiku sync calls per the published rates", () => {
    // 1M in × $1 + 0.1M out × $5 + 0.5M cache-read × $0.10 = 1 + 0.5 + 0.05
    expect(estimateCostUsd("claude-haiku-4-5", USAGE, "sync")).toBeCloseTo(1.55, 5);
  });

  it("halves batch-mode pricing (D2.3)", () => {
    expect(estimateCostUsd("claude-haiku-4-5", USAGE, "batch")).toBeCloseTo(0.775, 5);
  });

  it("returns 0 for unknown models rather than inventing a price", () => {
    expect(estimateCostUsd("some-future-model", USAGE, "sync")).toBe(0);
  });
});

describe("CostLog", () => {
  it("records the full entry shape and aggregates", () => {
    const log = new CostLog();
    const entry = log.record("extract", "claude-sonnet-4-6", USAGE, "sync");
    expect(entry).toMatchObject({
      step: "extract",
      model: "claude-sonnet-4-6",
      inputTokens: USAGE.inputTokens,
      outputTokens: USAGE.outputTokens,
      cacheReadTokens: USAGE.cacheReadTokens,
      mode: "sync",
    });
    log.record("translate", "claude-haiku-4-5", USAGE, "batch");
    expect(log.all()).toHaveLength(2);
    expect(log.totalUsd()).toBeCloseTo(entry.estCostUsd + 0.775, 5);
  });

  it("reports cache hits only when cacheReadTokens > 0", () => {
    const log = new CostLog();
    log.record("gate", "claude-sonnet-4-6", { ...USAGE, cacheReadTokens: 0 }, "sync");
    expect(log.sawCacheHit()).toBe(false);
    log.record("gate", "claude-sonnet-4-6", USAGE, "sync");
    expect(log.sawCacheHit()).toBe(true);
  });
});
