import { readdirSync, readFileSync } from "node:fs";
import { z } from "zod";
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

/** A Tier-A fixture file (goldenSet/tierA/*.case.json) — real chat + founder-verified truth. */
const tierAFixtureSchema = z.object({
  id: z.string(),
  transcript: z.string(),
  expected: z.object({
    properties: z.array(z.record(z.string(), z.unknown())),
    duplicatePairs: z.array(z.tuple([z.string(), z.string()])),
  }),
});

/**
 * Load Tier-A fixtures from `goldenSet/tierA/*.case.json`. These are real anonymized incidents
 * hand-labeled with founder-verified ground truth and carry NO synthetic specs — so the oracle
 * (which answers from a case's specs) cannot drive them; the runner scores them only under
 * EVAL_LLM=anthropic. An empty/missing directory yields no cases (no behavior change).
 */
function readTierAFixtures(): EvalCase[] {
  const dir = new URL("../../goldenSet/tierA/", import.meta.url);
  let files: string[];
  try {
    files = readdirSync(dir).filter((name) => name.endsWith(".case.json"));
  } catch {
    return [];
  }
  return files.sort().map((name) => {
    const parsed = tierAFixtureSchema.parse(JSON.parse(readFileSync(new URL(name, dir), "utf8")));
    return {
      id: parsed.id,
      tier: "A" as const,
      source: "tierA" as const,
      transcript: parsed.transcript,
      expected: parsed.expected,
      specs: [],
    };
  });
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

  // Plan 23 (E7): "N distinct listings in one conversation must NOT merge." The 3 pinned specs sit
  // in distinct districts (>1 km apart), so 0 duplicate pairs is ground truth — the regression for
  // the 2026-06-15 over-block→over-merge incident. The `distinct-` id prefix opts a case into the
  // distinct-listings dedup metric (see runner.ts); Tier-A incident fixtures opt in via tier "A".
  cases.push(toCase("distinct-dump-cnx", specs.slice(0, 3), { ...CALM, seed: 500 }));

  // Tier-A real-incident fixtures (hand-labeled, founder-verified); scored only under the real
  // model — see the runner's oracle filter. Empty dir ⇒ none.
  cases.push(...readTierAFixtures());

  return cases;
}
