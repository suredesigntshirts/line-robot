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
  };
}
