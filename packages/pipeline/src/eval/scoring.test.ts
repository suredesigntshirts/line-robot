import { describe, expect, it } from "vitest";
import { scoreDedup, scoreExact, scoreNumeric, scoreSegmentation } from "./scoring.ts";

describe("scoreExact", () => {
  it("scores 1 on an exact match", () => {
    expect(scoreExact("deedType", "chanote", "chanote").score).toBe(1);
  });

  it("scores 0 on a mismatch and names both values", () => {
    const result = scoreExact("deedType", "chanote", "sor-por-kor");
    expect(result.score).toBe(0);
    expect(result.detail).toContain("chanote");
    expect(result.detail).toContain("sor-por-kor");
  });
});

describe("scoreNumeric", () => {
  it("scores 1 within tolerance", () => {
    expect(scoreNumeric("price", 1_000_000, 1_005_000, 0.01).score).toBe(1);
  });

  it("scores 1 exactly at the tolerance boundary", () => {
    expect(scoreNumeric("price", 1_000_000, 1_010_000, 0.01).score).toBe(1);
  });

  it("scores 0 outside tolerance", () => {
    expect(scoreNumeric("price", 1_000_000, 1_020_000, 0.01).score).toBe(0);
  });

  it("requires equality at zero tolerance", () => {
    expect(scoreNumeric("count", 3, 3, 0).score).toBe(1);
    expect(scoreNumeric("count", 3, 4, 0).score).toBe(0);
  });
});

describe("scoreSegmentation", () => {
  it("passes only on the exact property count", () => {
    expect(scoreSegmentation(2, 2).score).toBe(1);
    expect(scoreSegmentation(2, 3).score).toBe(0);
  });
});

describe("scoreDedup", () => {
  it("returns perfect scores when both sides are empty", () => {
    expect(scoreDedup([], [])).toEqual({ pairPrecision: 1, pairRecall: 1 });
  });

  it("scores a full match", () => {
    expect(
      scoreDedup(
        [
          ["a", "b"],
          ["c", "d"],
        ],
        [
          ["a", "b"],
          ["c", "d"],
        ],
      ),
    ).toEqual({ pairPrecision: 1, pairRecall: 1 });
  });

  it("treats [a,b] and [b,a] as the same pair", () => {
    expect(scoreDedup([["a", "b"]], [["b", "a"]])).toEqual({ pairPrecision: 1, pairRecall: 1 });
  });

  it("computes precision and recall on a partial match", () => {
    // actual: 1 true positive of 2 predicted -> precision 0.5; 1 found of 2 expected -> recall 0.5
    const result = scoreDedup(
      [
        ["a", "b"],
        ["c", "d"],
      ],
      [
        ["a", "b"],
        ["x", "y"],
      ],
    );
    expect(result).toEqual({ pairPrecision: 0.5, pairRecall: 0.5 });
  });

  it("gives precision 1 / recall 0 when nothing is predicted but pairs were expected", () => {
    expect(scoreDedup([["a", "b"]], [])).toEqual({ pairPrecision: 1, pairRecall: 0 });
  });
});
