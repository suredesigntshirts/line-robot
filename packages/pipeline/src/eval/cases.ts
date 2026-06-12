import { specCatalog } from "../synthetic/catalog.ts";
import { CALM, type ChaosProfile, MESSY_GROUP_CHAT } from "../synthetic/chaosProfile.ts";
import { type GeneratedCase, generateCase } from "../synthetic/generator.ts";
import type { ListingSpec } from "../synthetic/spec.ts";

export type EvalTier = "A" | "B";

export interface EvalCase {
  id: string;
  /** A = real anonymized hand-verified chats (parked, founder ruling Q6/D2.1); B = synthetic. */
  tier: EvalTier;
  source: "tierA" | "synthetic";
  /** The LINE conversation the pipeline ingests, as exported text. */
  transcript: string;
  expected: ExpectedOutcome;
  /** Ground-truth specs behind the case (synthetic only; powers the oracle mode). */
  specs: ListingSpec[];
}

/** Ground truth for one case. Field-level value shapes are owned by the pipeline output types. */
export interface ExpectedOutcome {
  /** One entry per distinct property in the transcript; keys are extraction field names. */
  properties: Array<Record<string, unknown>>;
  /** Property-id pairs that are the same real-world listing (dedup ground truth). */
  duplicatePairs: Array<[string, string]>;
}

function toCase(id: string, specs: ListingSpec[], profile: ChaosProfile): EvalCase {
  const generated: GeneratedCase = generateCase(specs, profile);
  return {
    id,
    tier: "B",
    source: "synthetic",
    transcript: generated.transcript,
    expected: generated.expected,
    specs,
  };
}

/**
 * Tier B synthetic golden set (D2.1): N≥50 deterministic cases over the spec
 * catalog — calm singles, messy singles, multi-property dumps, and dedup-trap
 * re-posts. Tier A slot (goldenSet/tierA/) stays empty until founder labeling.
 */
export function loadCases(): EvalCase[] {
  const specs = specCatalog(24);
  const cases: EvalCase[] = [];

  // 24 calm singles + 24 messy singles (per-spec seeds keep cases independent).
  specs.forEach((spec, i) => {
    cases.push(toCase(`calm-${spec.id}`, [spec], { ...CALM, seed: 100 + i }));
    cases.push(
      toCase(`messy-${spec.id}`, [spec], {
        ...MESSY_GROUP_CHAT,
        seed: 200 + i,
        duplicateRepost: { enabled: false, priceDriftPct: 0, contactDrift: false },
      }),
    );
  });

  // 6 multi-property dumps (3 specs each).
  for (let i = 0; i < 6; i += 1) {
    const dump = specs.slice(i * 3, i * 3 + 3);
    if (dump.length === 3) {
      cases.push(toCase(`dump-${i}`, dump, { ...CALM, seed: 300 + i, photosOutOfOrder: true }));
    }
  }

  // 8 dedup traps (re-post with drift).
  specs.slice(0, 8).forEach((spec, i) => {
    cases.push(
      toCase(`dup-${spec.id}`, [spec], {
        ...CALM,
        seed: 400 + i,
        duplicateRepost: { enabled: true, priceDriftPct: 0.05, contactDrift: true },
      }),
    );
  });

  return cases;
}
