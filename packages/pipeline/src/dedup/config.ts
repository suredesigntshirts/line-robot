import process from "node:process";

/**
 * D2.6 blocking thresholds — tunable defaults, env-overridable, validated by
 * synthetic dup pairs (never guessed in prod; the plan-18 open item).
 * Blocking keys are deed → geo → admin/text, never text alone (DEAL-09).
 */
export interface DedupConfig {
  /** Geohash cell precision for the proximity block (6 ≈ 1.2 km cells). */
  geohashPrecision: number;
  /** Haversine filter after the geohash block, metres. */
  geoRadiusM: number;
  /** Trigram (Dice) similarity threshold on normalized address text. */
  trigramThreshold: number;
  /** Token-set Jaccard threshold for the no-coords admin/text block. */
  jaccardThreshold: number;
  /** Max candidates forwarded to LLM verify. */
  blockCap: number;
  /**
   * E1 conservative-merge guard. A "merge" is irreversible (silent data loss), so an LLM "merge"
   * verdict is honored only on strong evidence — which ALWAYS requires geo proximity (text alone
   * never auto-merges; two units in one project share an address string): geo AND text agreeing, OR
   * geo-very-close (block score ≥ `mergeScoreFloor` ⇒ ≈≤170 m at the 0.85 default), AND LLM
   * confidence ≥ `mergeConfidenceFloor`. Weaker/uncertain merges persist as a NEW row + a
   * `merge_request` moderation item (a recoverable duplicate, never a silent fold). Retune via the
   * eval scorecard, never by hand in prod. (Geo score = 0.6+0.3·(1−d/radius): 0.85 ⇒ d≈167 m.)
   */
  mergeScoreFloor: number;
  mergeConfidenceFloor: number;
}

function envNumber(name: string, fallback: number): number {
  const raw = process.env[name];
  const n = raw === undefined ? Number.NaN : Number(raw);
  return Number.isFinite(n) ? n : fallback;
}

export function dedupConfig(): DedupConfig {
  return {
    geohashPrecision: envNumber("DEDUP_GEOHASH_PRECISION", 6),
    geoRadiusM: envNumber("DEDUP_GEO_RADIUS_M", 1000),
    trigramThreshold: envNumber("DEDUP_TRIGRAM_THRESHOLD", 0.55),
    jaccardThreshold: envNumber("DEDUP_JACCARD_THRESHOLD", 0.5),
    blockCap: envNumber("DEDUP_BLOCK_CAP", 8),
    mergeScoreFloor: envNumber("DEDUP_MERGE_SCORE_FLOOR", 0.85),
    mergeConfidenceFloor: envNumber("DEDUP_MERGE_CONFIDENCE_FLOOR", 0.6),
  };
}
