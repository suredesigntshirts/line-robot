import { blockCandidates, type DedupCandidate } from "../dedup/candidateFinder.ts";
import { type DedupConfig, dedupConfig } from "../dedup/config.ts";
import type { ExtractedListing } from "../steps.ts";

// ---------------------------------------------------------------------------
// Distinct-listings dedup metric (plan 23, CR-10). When a case asserts "N
// distinct listings in one conversation, 0 merges" (the 2026-06-15 incident's
// class: 5 distinct listings collapsed into 1 row), the extracted listings must
// NOT block against each other. This is the deterministic, blocker-level
// regression — it runs the SAME `blockCandidates` the pipeline uses, so it is
// free, needs no LLM, and honors deterministic-first dedup. It measures BLOCKING,
// not the LLM merge verdict; a verify-level metric is a deferred upgrade (CR-10).
// ---------------------------------------------------------------------------

function asCandidate(listing: ExtractedListing, id: string): DedupCandidate {
  return {
    id,
    deedNo: null,
    lat: listing.lat,
    lon: listing.lon,
    addressText: [listing.landmark, listing.tambon, listing.amphoe, listing.province]
      .filter((part): part is string => part !== null && part !== "")
      .join(" "),
    summary: listing.title,
  };
}

/**
 * Score 1 when none of the (known-distinct) listings block against each other; each falsely-blocked
 * pair drags the score down linearly (1 − blockedPairs / totalPairs). A single listing or fewer
 * scores 1 (no pairs to confuse).
 */
export function scoreDistinctListings(
  extracted: ExtractedListing[],
  config: DedupConfig = dedupConfig(),
): number {
  if (extracted.length < 2) return 1;
  const totalPairs = (extracted.length * (extracted.length - 1)) / 2;
  let blockedPairs = 0;
  extracted.forEach((listing, i) => {
    // Compare each listing only against those AFTER it, so each blocked pair is counted once.
    const pool = extracted.slice(i + 1).map((other, k) => asCandidate(other, String(i + 1 + k)));
    blockedPairs += blockCandidates(listing, pool, config).length;
  });
  return 1 - blockedPairs / totalPairs;
}
