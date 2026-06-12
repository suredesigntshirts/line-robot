import { readFileSync, writeFileSync } from "node:fs";
import process from "node:process";
import { evalConfig } from "../../eval.config.ts";
import { CostLog } from "../cost.ts";
import { blockCandidates } from "../dedup/candidateFinder.ts";
import { dedupConfig } from "../dedup/config.ts";
import type { StepLlm } from "../ports.ts";
import type { StepContext } from "../steps/context.ts";
import { isSaleBlockedByDeed } from "@line-robot/domain";
import { extractListing } from "../steps/extract.ts";
import { runGate } from "../steps/gate.ts";
import { segmentTranscript, singleSegmentFallback } from "../steps/segment.ts";
import { translateContent } from "../steps/translate.ts";
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
// Eval runner (D21: advisory — always exits 0). Scores segment/extract/dedup +
// translate (language/shape invariants) + gate (deterministic contract) over the
// Tier B synthetic set; classify needs image fixtures and stays n/a for now.
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
  // pairingPriceThb is never nulled (scored priceThb is, when a drifted repost makes the
  // price ambiguous) — sorting by it keeps pairing stable in multi-spec dup cases.
  const sortedExpected = byPrice(expectedProps, (p) =>
    Number(p.pairingPriceThb ?? p.priceThb ?? 0),
  );
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

const THAI_CHAR = /[฀-๿]/g;

/**
 * Translate scoring is INVARIANT-based, not adequacy-judged: non-null, non-empty
 * title, and th→en output actually dominated by non-Thai script. Catches empty,
 * garbled or wrong-language output — not nuance (Tier A judge work, later).
 */
function scoreTranslate(result: { lang: string; title: string; description: string } | null): {
  score: number;
  detail: string;
} {
  if (result === null) return { score: 0, detail: "translate returned null" };
  const text = `${result.title} ${result.description}`;
  const thaiRatio = (text.match(THAI_CHAR)?.length ?? 0) / Math.max(text.length, 1);
  const checks: Array<[string, boolean]> = [
    ["title non-empty", result.title.trim() !== ""],
    ["lang flipped to en", result.lang === "en"],
    ["output is not Thai-script", thaiRatio < 0.2],
  ];
  const failed = checks.filter(([, ok]) => !ok).map(([name]) => name);
  return {
    score: checks.filter(([, ok]) => ok).length / checks.length,
    detail: failed.join(", ") || "ok",
  };
}

/**
 * Gate scoring checks the step's DETERMINISTIC contract against its own input
 * (the extracted listing): the FIELD-03 sale blocker, the FIELD-02 unknown-deed
 * ask, and pass-coherence. Extra model asks are never penalized — completeness
 * judgment belongs to the model.
 */
function scoreGateResult(
  got: ExtractedListing,
  gate: { pass: boolean; missing: Array<{ field: string }>; blockers: Array<{ reason: string }> },
): { score: number; detail: string } {
  const blockerExpected = got.dealType === "sale" && isSaleBlockedByDeed(got.titleDeedType);
  const askDeedExpected = got.titleDeedType === "unknown";
  const checks: Array<[string, boolean]> = [
    [
      "deed blocker (FIELD-03)",
      gate.blockers.some((b) => b.reason === "deed_not_transferable") === blockerExpected,
    ],
    [
      "unknown-deed ask (FIELD-02)",
      !askDeedExpected || gate.missing.some((m) => m.field === "titleDeedType"),
    ],
    ["pass coherence", !(blockerExpected || askDeedExpected) || gate.pass === false],
  ];
  const failed = checks.filter(([, ok]) => !ok).map(([name]) => name);
  return {
    score: checks.filter(([, ok]) => ok).length / checks.length,
    detail: failed.join(", ") || "ok",
  };
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

// Repo-root .env (founder-provided key) — runner cwd is packages/pipeline.
try {
  process.loadEnvFile(new URL("../../../../.env", import.meta.url).pathname);
} catch {
  /* no .env — fine for oracle mode */
}

const EVAL_MODE = process.env.EVAL_LLM ?? "oracle";

/** One shared real adapter so the per-step cached prefixes actually get reused. */
const realLlm: StepLlm | null = await (async () => {
  if (EVAL_MODE !== "anthropic") return null;
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("EVAL_LLM=anthropic requires ANTHROPIC_API_KEY");
  }
  const [{ default: Anthropic }, { AnthropicStepLlm }] = await Promise.all([
    import("@anthropic-ai/sdk"),
    import("../adapters/anthropicStepLlm.ts"),
  ]);
  return new AnthropicStepLlm(new Anthropic());
})();

function buildLlm(evalCase: EvalCase): { llm: StepLlm; real: boolean } {
  if (realLlm) return { llm: realLlm, real: true };
  return { llm: new OracleStepLlm(evalCase.specs), real: false };
}

const cases = loadCases();
const card = emptyScorecard();
card.caseCount = cases.length;
const costLog = new CostLog();

const segmentScores: number[] = [];
const extractScores: number[] = [];
const dedupScores: number[] = [];
const translateScores: number[] = [];
const gateScores: number[] = [];
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
    if (process.env.EVAL_VERBOSE === "1") {
      for (const f of fieldScores.filter((s) => s.score < 1)) {
        console.error(`MISS ${evalCase.id} ${f.field}: ${f.detail}`);
      }
    }
    if (fieldScores.length > 0) {
      extractScores.push(fieldScores.reduce((s, f) => s + f.score, 0) / fieldScores.length);
      for (const f of fieldScores) {
        const agg = fieldAggregate.get(f.field) ?? { total: 0, count: 0 };
        agg.total += f.score;
        agg.count += 1;
        fieldAggregate.set(f.field, agg);
      }
    }

    // Translate (th→en) on the first extracted listing with a title; gate on every listing.
    const first = extracted[0];
    if (first && first.title !== "") {
      const translated = await translateContent(ctx, {
        fromLang: "th",
        title: first.title,
        description: first.description,
        notes: "",
      });
      const t = scoreTranslate(translated);
      translateScores.push(t.score);
      if (t.score < 1 && process.env.EVAL_VERBOSE === "1") {
        console.error(`MISS ${evalCase.id} translate: ${t.detail}`);
      }
    }
    for (const got of extracted) {
      const gate = await runGate(ctx, {
        extracted: got,
        photoCount: 0,
        deedType: got.titleDeedType,
        listingType: got.dealType,
      });
      const g = scoreGateResult(got, gate);
      gateScores.push(g.score);
      if (g.score < 1 && process.env.EVAL_VERBOSE === "1") {
        console.error(`MISS ${evalCase.id} gate: ${g.detail}`);
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
card.perStep.translate = { score: mean(translateScores), casesScored: translateScores.length };
card.perStep.gate = { score: mean(gateScores), casesScored: gateScores.length };
card.perField = [...fieldAggregate.entries()].map(([field, agg]) => ({
  field,
  score: agg.total / agg.count,
  casesScored: agg.count,
}));
card.costUsd = costLog.totalUsd();

// Baseline (D21 advisory): delta against the committed file; write it with EVAL_WRITE_BASELINE=1.
const baselinePath = new URL("../../eval-baseline.json", import.meta.url).pathname;
try {
  const baseline = JSON.parse(readFileSync(baselinePath, "utf8")) as {
    perStep: Record<string, { score: number | null }>;
  };
  card.baselineDelta = Object.fromEntries(
    Object.entries(card.perStep).map(([step, s]) => [
      step,
      (s.score ?? 0) - (baseline.perStep[step]?.score ?? 0),
    ]),
  ) as typeof card.baselineDelta;
} catch {
  /* no baseline committed yet */
}
if (process.env.EVAL_WRITE_BASELINE === "1" && realLlm) {
  writeFileSync(
    baselinePath,
    `${JSON.stringify(
      {
        writtenAt: new Date().toISOString(),
        mode: EVAL_MODE,
        caseCount: card.caseCount,
        perStep: card.perStep,
        perField: card.perField,
        costUsd: card.costUsd,
      },
      null,
      2,
    )}\n`,
  );
  console.log(`baseline written: ${baselinePath}`);
}

console.log(`mode: EVAL_LLM=${EVAL_MODE} (oracle = harness smoke, not a model baseline)`);
console.log(renderScorecard(card, evalConfig));
process.exit(0); // D21: advisory — never a failing exit, even on regression.
