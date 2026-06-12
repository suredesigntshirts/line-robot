/**
 * Per-field scorers. Deterministic scorers are implemented (their semantics are final);
 * judge-based scoring needs the Stage 2 pipeline and throws until it lands.
 */

/** Score for a single field of a single case. */
export interface FieldScore {
  field: string;
  /** 0 (wrong) .. 1 (exact). */
  score: number;
  detail: string;
}

/** Exact match — enums and normalized strings. */
export function scoreExact(field: string, expected: string, actual: string): FieldScore {
  const hit = expected === actual;
  return {
    field,
    score: hit ? 1 : 0,
    detail: hit ? "exact" : `expected ${expected}, got ${actual}`,
  };
}

/** Numeric with relative tolerance — prices, areas. `tolerance` is a fraction (0.01 = ±1%). */
export function scoreNumeric(
  field: string,
  expected: number,
  actual: number,
  tolerance: number,
): FieldScore {
  const hit = Math.abs(actual - expected) <= Math.abs(expected) * tolerance;
  return {
    field,
    score: hit ? 1 : 0,
    detail: hit
      ? `within ±${tolerance * 100}%`
      : `expected ${expected}±${tolerance * 100}%, got ${actual}`,
  };
}

/** Free-text similarity via LLM judge — lands in Stage 2 with the real pipeline. */
export function scoreFuzzy(_field: string, _expected: string, _actual: string): FieldScore {
  throw new Error("scoreFuzzy is an LLM-judge scorer; implemented in Stage 2");
}

/** Segmentation: did the pipeline find the right number of distinct properties? (Photo-attribution scoring joins in Stage 2 once the pipeline output carries photo assignments.) */
export function scoreSegmentation(expectedCount: number, actualCount: number): FieldScore {
  return scoreNumeric("propertyCount", expectedCount, actualCount, 0);
}

/**
 * Dedup pair precision/recall against ground-truth duplicate pairs. Pairs are normalized to a
 * canonical form: [a, b] and [b, a] are the same pair.
 */
export interface DedupScore {
  pairPrecision: number;
  pairRecall: number;
}

export function scoreDedup(
  expectedPairs: Array<[string, string]>,
  actualPairs: Array<[string, string]>,
): DedupScore {
  const key = ([a, b]: [string, string]) => (a < b ? `${a}|${b}` : `${b}|${a}`);
  const expected = new Set(expectedPairs.map(key));
  const actual = new Set(actualPairs.map(key));
  const truePositives = [...actual].filter((k) => expected.has(k)).length;
  return {
    pairPrecision: actual.size === 0 ? 1 : truePositives / actual.size,
    pairRecall: expected.size === 0 ? 1 : truePositives / expected.size,
  };
}
