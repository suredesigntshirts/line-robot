import type { ExtractedListing } from "../steps.ts";
import type { DedupConfig } from "./config.ts";
import {
  geohash,
  haversineM,
  jaccardSimilarity,
  normalizeAddress,
  trigramSimilarity,
} from "./normalize.ts";

/** A previously stored listing the new extraction is blocked against. */
export interface DedupCandidate {
  id: string;
  deedNo: string | null;
  lat: number | null;
  lon: number | null;
  /** Address-ish text: landmark + tambon/amphoe/province + project name. */
  addressText: string;
  /** One-line summary shown to the LLM verifier. */
  summary: string;
}

export interface BlockedCandidate {
  id: string;
  summary: string;
  score: number;
  reasons: string[];
}

function addressOf(extracted: ExtractedListing): string {
  return normalizeAddress(
    [extracted.landmark, extracted.tambon, extracted.amphoe, extracted.province]
      .filter((part): part is string => part !== null)
      .join(" "),
  );
}

/**
 * D2.6 deterministic block: deed-exact (definitive, score 1.0, skips geo/text)
 * → geohash cell + Haversine ≤ radius → trigram/Jaccard text block. Returns at
 * most `blockCap` candidates, best first. Never text alone when a stronger key
 * disagrees (DEAL-09): geo-known pairs farther than the radius are dropped
 * even if their text matches.
 */
export function blockCandidates(
  extracted: ExtractedListing & { deedNo?: string | null },
  pool: DedupCandidate[],
  config: DedupConfig,
): BlockedCandidate[] {
  const address = addressOf(extracted);
  const hasGeo = extracted.lat !== null && extracted.lon !== null;
  const cell = hasGeo
    ? geohash(extracted.lat as number, extracted.lon as number, config.geohashPrecision)
    : null;

  const blocked: BlockedCandidate[] = [];
  for (const candidate of pool) {
    const reasons: string[] = [];
    let score = 0;

    // Key 1: deed/parcel exact match — definitive.
    if (
      extracted.deedNo !== undefined &&
      extracted.deedNo !== null &&
      extracted.deedNo !== "" &&
      candidate.deedNo !== null &&
      candidate.deedNo === extracted.deedNo
    ) {
      blocked.push({
        id: candidate.id,
        summary: candidate.summary,
        score: 1,
        reasons: ["deed_exact"],
      });
      continue;
    }

    // Key 2: geo proximity.
    const candidateHasGeo = candidate.lat !== null && candidate.lon !== null;
    if (hasGeo && candidateHasGeo) {
      const distance = haversineM(
        extracted.lat as number,
        extracted.lon as number,
        candidate.lat as number,
        candidate.lon as number,
      );
      if (distance > config.geoRadiusM) {
        // Both sides know where they are and they disagree — text similarity
        // must not resurrect the pair (DEAL-09: never text alone).
        continue;
      }
      const candidateCell = geohash(
        candidate.lat as number,
        candidate.lon as number,
        config.geohashPrecision,
      );
      reasons.push(candidateCell === cell ? "geo_same_cell" : "geo_within_radius");
      score = Math.max(score, 0.6 + 0.3 * (1 - distance / config.geoRadiusM));
    }

    // Key 3: admin/text similarity.
    const candidateAddress = normalizeAddress(candidate.addressText);
    const trigram = trigramSimilarity(address, candidateAddress);
    const jaccard = jaccardSimilarity(address, candidateAddress);
    if (trigram >= config.trigramThreshold || jaccard >= config.jaccardThreshold) {
      reasons.push(`text_similar(${trigram.toFixed(2)}/${jaccard.toFixed(2)})`);
      score = Math.max(score, Math.max(trigram, jaccard) * 0.8);
    }

    if (reasons.length > 0) {
      blocked.push({ id: candidate.id, summary: candidate.summary, score, reasons });
    }
  }

  return blocked.sort((a, b) => b.score - a.score).slice(0, config.blockCap);
}
