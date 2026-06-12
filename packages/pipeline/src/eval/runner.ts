import process from "node:process";
import { evalConfig } from "../../eval.config.ts";
import { CostLog } from "../cost.ts";
import { blockCandidates } from "../dedup/candidateFinder.ts";
import { dedupConfig } from "../dedup/config.ts";
import type { StepLlm } from "../ports.ts";
import type { StepContext } from "../steps/context.ts";
import { extractListing } from "../steps/extract.ts";
import { segmentTranscript, singleSegmentFallback } from "../steps/segment.ts";
import type { ExtractedListing } from "../steps.ts";
import { type EvalCase, loadCases } from "./cases.ts";
import { OracleStepLlm } from "./oracle.ts";
import { emptyScorecard, renderScorecard } from "./scorecard.ts";
import {
  type FieldScore,
  scoreDedup,
  scoreExact,
  scoreNumeric,
  scoreSegmentation,
} from "./scoring.ts";

// ---------------------------------------------------------------------------
// Eval runner (D21: advisory — always exits 0). Scores segment/extract/dedup
// over the Tier B synthetic set; classify/translate/gate need image fixtures /
// judge scoring and stay n/a until Stage 2's follow-up.
// EVAL_LLM=oracle (default, no API): harness smoke, perfect pipeline = 1.0.
// EVAL_LLM=anthropic (needs ANTHROPIC_API_KEY): the real model baseline.
// ---------------------------------------------------------------------------

const SCORED_FIELDS = [
  "dealType",
  "propertyType",
  "titleDeedType",
  "urgency",
  "province",
  "amphoe",
  "tambon",
] as const;

function scoreCase(expectedProps: Array<Record<string, unknown>>, extracted: ExtractedListing[]) {
  const fieldScores: FieldScore[] = [];
  // Pair expected↔extracted by price order (ids don't survive real extraction).
  const byPrice = <T>(items: T[], price: (t: T) => number) =>
    [...items].sort((a, b) => price(a) - price(b));
  const sortedExpected = byPrice(expectedProps, (p) => Number(p.priceThb ?? 0));
  const sortedExtracted = byPrice(extracted, (l) => l.priceThb ?? 0);

  sortedExpected.forEach((expected, i) => {
    const got = sortedExtracted[i];
    if (!got) return;
    for (const field of SCORED_FIELDS) {
      const want = expected[field];
      if (typeof want !== "string" || want === "") continue;
      fieldScores.push(scoreExact(field, want, String(got[field] ?? "")));
    }
    if (typeof expected.priceThb === "number") {
      fieldScores.push(scoreNumeric("priceThb", expected.priceThb, got.priceThb ?? -1, 0.01));
    }
    for (const numField of ["bedrooms", "bathrooms"] as const) {
      const want = expected[numField];
      if (typeof want === "number") {
        fieldScores.push(scoreNumeric(numField, want, got[numField] ?? -1, 0));
      }
    }
  });
  return fieldScores;
}

/** Dedup scoring is deterministic (blocking quality) — independent of the LLM under test. */
function scoreDedupCase(evalCase: EvalCase) {
  const spec = evalCase.specs[0];
  if (!spec || evalCase.expected.duplicatePairs.length === 0) return null;
  const pool = [
    {
      id: spec.id,
      deedNo: null,
      lat: spec.lat,
      lon: spec.lon,
      addressText: `${spec.landmark} ${spec.tambon} ${spec.amphoe} ${spec.province}`,
      summary: spec.landmark,
    },
  ];
  const repost: ExtractedListing = {
    dealType: spec.dealType,
    propertyType: spec.propertyType,
    titleDeedType: spec.titleDeedType,
    priceThb: Math.round(spec.priceThb * 1.05),
    urgency: spec.urgency,
    urgentBadge: false,
    title: spec.landmark,
    description: "",
    province: spec.province,
    amphoe: spec.amphoe,
    tambon: spec.tambon,
    landmark: spec.landmark,
    lat: spec.lat + 0.0004,
    lon: spec.lon - 0.0004,
    landRai: null,
    landNgan: null,
    landWah: null,
    landSqm: null,
    floorAreaSqm: null,
    bedrooms: null,
    bathrooms: null,
    facingDirection: null,
    contactPhone: spec.phone,
    posterName: spec.ownerName,
    lowConfidence: false,
  };
  const blocked = blockCandidates(repost, pool, dedupConfig());
  const actualPairs: Array<[string, string]> = blocked
    .filter((c) => c.id === spec.id)
    .map(() => [spec.id, `${spec.id}-repost`]);
  return scoreDedup(evalCase.expected.duplicatePairs, actualPairs);
}

function buildLlm(evalCase: EvalCase): { llm: StepLlm; real: boolean } {
  const mode = process.env.EVAL_LLM ?? "oracle";
  if (mode === "anthropic") {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error("EVAL_LLM=anthropic requires ANTHROPIC_API_KEY");
    }
    // Lazy import keeps oracle runs dependency-free at runtime.
    throw new Error(
      "EVAL_LLM=anthropic: wire AnthropicStepLlm here when running the real baseline (see src/adapters/anthropicStepLlm.ts)",
    );
  }
  return { llm: new OracleStepLlm(evalCase.specs), real: false };
}

const cases = loadCases();
const card = emptyScorecard();
card.caseCount = cases.length;
const costLog = new CostLog();

const segmentScores: number[] = [];
const extractScores: number[] = [];
const dedupScores: number[] = [];
const fieldAggregate = new Map<string, { total: number; count: number }>();

for (const evalCase of cases) {
  try {
    const { llm } = buildLlm(evalCase);
    const ctx: StepContext = { llm, costLog, mode: "sync" };
    const mediaMarkers = evalCase.specs.map((_, i) => ({ index: i, classify: null }));
    const segmentInput = {
      transcript: evalCase.transcript,
      mediaMarkers,
      geoHints: [],
      candidates: [],
    };
    const segmented =
      (await segmentTranscript(ctx, segmentInput)) ?? singleSegmentFallback(segmentInput);
    segmentScores.push(
      scoreSegmentation(evalCase.expected.properties.length, segmented.segments.length).score,
    );

    const extracted: ExtractedListing[] = [];
    for (const segment of segmented.segments) {
      const listing = await extractListing(ctx, {
        transcript: evalCase.transcript,
        focus: segment.label,
        geoHints: [],
        candidates: [],
      });
      if (listing) extracted.push(listing);
    }
    if (extracted.length === 0 && evalCase.expected.properties.length > 0) {
      // Total extraction miss scores 0 — silently skipping it would inflate the mean.
      extractScores.push(0);
    }
    const fieldScores = scoreCase(evalCase.expected.properties, extracted);
    if (fieldScores.length > 0) {
      extractScores.push(fieldScores.reduce((s, f) => s + f.score, 0) / fieldScores.length);
      for (const f of fieldScores) {
        const agg = fieldAggregate.get(f.field) ?? { total: 0, count: 0 };
        agg.total += f.score;
        agg.count += 1;
        fieldAggregate.set(f.field, agg);
      }
    }

    const dedup = scoreDedupCase(evalCase);
    if (dedup) dedupScores.push((dedup.pairPrecision + dedup.pairRecall) / 2);
  } catch (error) {
    card.failures += 1;
    console.error(`case ${evalCase.id} failed:`, error);
  }
}

const mean = (xs: number[]) => (xs.length === 0 ? null : xs.reduce((a, b) => a + b, 0) / xs.length);
card.perStep.segment = { score: mean(segmentScores), casesScored: segmentScores.length };
card.perStep.extract = { score: mean(extractScores), casesScored: extractScores.length };
card.perStep.dedup = { score: mean(dedupScores), casesScored: dedupScores.length };
card.perField = [...fieldAggregate.entries()].map(([field, agg]) => ({
  field,
  score: agg.total / agg.count,
  casesScored: agg.count,
}));
card.costUsd = costLog.totalUsd();

console.log(
  `mode: EVAL_LLM=${process.env.EVAL_LLM ?? "oracle"} (oracle = harness smoke, not a model baseline)`,
);
console.log(renderScorecard(card, evalConfig));
process.exit(0); // D21: advisory — never a failing exit, even on regression.
