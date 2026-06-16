import { readFileSync, writeFileSync } from "node:fs";
import process from "node:process";
import { isSaleBlockedByDeed } from "@line-robot/domain";
import { evalConfig } from "../../eval.config.ts";
import { CostLog } from "../cost.ts";
import { blockCandidates } from "../dedup/candidateFinder.ts";
import { dedupConfig } from "../dedup/config.ts";
import type { StepLlm } from "../ports.ts";
import type { StepContext } from "../steps/context.ts";
import { extractListing } from "../steps/extract.ts";
import { runGate } from "../steps/gate.ts";
import { segmentTranscript, singleSegmentFallback } from "../steps/segment.ts";
import { translateContent } from "../steps/translate.ts";
import type { ExtractedListing } from "../steps.ts";
import { CachingStepLlm } from "./cachingStepLlm.ts";
import { type EvalCase, loadCases } from "./cases.ts";
import { scoreDistinctListings } from "./distinctListings.ts";
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

/**
 * Bounded-concurrency map preserving input order (workers pull a shared cursor).
 * Local tiny copy of the bot's util — `@line-robot/pipeline` may not depend on
 * `@line-robot/bot`; the Group B image-stage rewrite (R-2b) relocates a shared
 * one into pipeline, at which point this can import it instead.
 */
async function mapWithConcurrency<T, R>(
  items: readonly T[],
  limit: number,
  fn: (item: T) => Promise<R>,
): Promise<R[]> {
  const results = new Array<R>(items.length);
  let cursor = 0;
  const worker = async (): Promise<void> => {
    while (true) {
      const i = cursor++;
      if (i >= items.length) return;
      results[i] = await fn(items[i] as T);
    }
  };
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}

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

const thaiRatio = (text: string) => (text.match(THAI_CHAR)?.length ?? 0) / Math.max(text.length, 1);

/**
 * Translate scoring is INVARIANT-based, not adequacy-judged: non-null, non-empty
 * title, and the output actually written in the TARGET script (direction-aware —
 * mixed-language transcripts yield English sources too, so en→th is exercised).
 * Catches empty, garbled or wrong-language output, not nuance (Tier A judge work).
 * Retained Thai proper nouns (soi/landmark names) make the en-target threshold
 * lenient (<0.35) by design.
 */
function scoreTranslate(
  fromLang: "th" | "en",
  result: { title: string; description: string } | null,
): { score: number; detail: string } {
  if (result === null) return { score: 0, detail: "translate returned null" };
  const ratio = thaiRatio(`${result.title} ${result.description}`);
  const checks: Array<[string, boolean]> = [
    ["title non-empty", result.title.trim() !== ""],
    fromLang === "th"
      ? ["en output not Thai-script", ratio < 0.35]
      : ["th output Thai-script-dominant", ratio > 0.5],
  ];
  const failed = checks.filter(([, ok]) => !ok).map(([name]) => name);
  return {
    score: checks.filter(([, ok]) => ok).length / checks.length,
    detail: failed.join(", ") || "ok",
  };
}

/**
 * HONESTY NOTE: this is a CONTRACT + PARSE-HEALTH smoke, not a model-quality
 * metric — the three checks recompute runGate's own deterministic floors, so a
 * well-parsing model scores 1.0 by construction. Its value against the REAL API
 * is catching schema-acceptance failures (the 16-union outage class: a 400 on
 * every call would null-fallback and miss the FIELD-02 ask on unknown-deed
 * cases) and floor regressions. Model gate judgment is Tier A judge work.
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

// U-EVAL-perf (plan 23): a warm response cache makes iteration on model-facing code
// free (0 API calls, 0 rate-limit pressure). Opt-in, and FORCE-OFF when regenerating
// the baseline — that path must measure a fresh model, never a frozen capture.
const CACHE_ENABLED = process.env.EVAL_CACHE === "1" && process.env.EVAL_WRITE_BASELINE !== "1";

/** One shared real adapter so the per-step cached prefixes actually get reused. */
const baseLlm: StepLlm | null = await (async () => {
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
// Wrap in the response cache at top-level scope (a closure-assigned `let` would
// leave TS narrowing the var to its `null` initializer at the report site below).
const cachingLlm =
  baseLlm && CACHE_ENABLED
    ? new CachingStepLlm(baseLlm, new URL("../../.eval-cache/", import.meta.url).pathname)
    : null;
const realLlm: StepLlm | null = cachingLlm ?? baseLlm;

// Bounded concurrency over cases (the eval touches no Postgres — pure API I/O).
// Cuts a cold real-model run from ~20 min toward the rate-limit ceiling; serial
// (=1) for oracle so the harness smoke stays deterministic.
const CONCURRENCY = Math.max(1, Number(process.env.EVAL_CONCURRENCY ?? (realLlm ? "6" : "1")));
// Progress line per case so a 20-min real run isn't a black box.
const PROGRESS = EVAL_MODE === "anthropic" || process.env.EVAL_PROGRESS === "1";

function buildLlm(evalCase: EvalCase): { llm: StepLlm; real: boolean } {
  if (realLlm) return { llm: realLlm, real: true };
  return { llm: new OracleStepLlm(evalCase.specs), real: false };
}

// Tier-A cases (no synthetic specs) are scored ONLY under the real model: the oracle answers from a
// case's specs, so a specs-less case would falsely score ~0 (plan 23 group-c §2.1, the "4th gap").
// Synthetic Tier-B cases always carry specs, so under oracle this filter is a no-op for them and
// keeps the harness smoke meaningful.
const cases = loadCases().filter((c) => EVAL_MODE === "anthropic" || c.specs.length > 0);
const card = emptyScorecard();
card.caseCount = cases.length;
const costLog = new CostLog();

const segmentScores: number[] = [];
const extractScores: number[] = [];
const dedupScores: number[] = [];
const translateScores: number[] = [];
const gateScores: number[] = [];
const fieldAggregate = new Map<string, { total: number; count: number }>();

/**
 * One case's contribution to the scorecard. Each runs independently (concurrent
 * cases share only the stateless `realLlm` + the synchronous `costLog`); the
 * results are merged back in input order afterwards, so the aggregate is identical
 * to a serial run regardless of `CONCURRENCY`.
 */
interface CaseOutcome {
  failed: boolean;
  segment: number | null;
  extract: number | null;
  dedup: number | null;
  translate: number | null;
  gate: number | null;
  fieldScores: FieldScore[];
}

let done = 0;
async function runCase(evalCase: EvalCase): Promise<CaseOutcome> {
  const started = Date.now();
  const outcome: CaseOutcome = {
    failed: false,
    segment: null,
    extract: null,
    dedup: null,
    translate: null,
    gate: null,
    fieldScores: [],
  };
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
    outcome.segment = scoreSegmentation(
      evalCase.expected.properties.length,
      segmented.segments.length,
    ).score;

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
    const fieldScores = scoreCase(evalCase.expected.properties, extracted);
    outcome.fieldScores = fieldScores;
    if (process.env.EVAL_VERBOSE === "1") {
      for (const f of fieldScores.filter((s) => s.score < 1)) {
        console.error(`MISS ${evalCase.id} ${f.field}: ${f.detail}`);
      }
    }
    if (extracted.length === 0 && evalCase.expected.properties.length > 0) {
      // Total extraction miss scores 0 — silently skipping it would inflate the mean.
      outcome.extract = 0;
    } else if (fieldScores.length > 0) {
      outcome.extract = fieldScores.reduce((s, f) => s + f.score, 0) / fieldScores.length;
    }

    // Translate + gate on the FIRST extracted listing per case (cost cap — the
    // sampling is visible in casesScored). Source language detected by script.
    const first = extracted[0];
    if (first && first.title !== "") {
      const fromLang = thaiRatio(`${first.title} ${first.description}`) >= 0.5 ? "th" : "en";
      const translated = await translateContent(ctx, {
        fromLang,
        title: first.title,
        description: first.description,
        notes: "",
      });
      const t = scoreTranslate(fromLang, translated);
      outcome.translate = t.score;
      if (t.score < 1 && process.env.EVAL_VERBOSE === "1") {
        console.error(`MISS ${evalCase.id} translate(${fromLang}): ${t.detail}`);
      }

      const gate = await runGate(ctx, {
        extracted: first,
        photoCount: 0,
        deedType: first.titleDeedType,
        listingType: first.dealType,
      });
      const g = scoreGateResult(first, gate);
      outcome.gate = g.score;
      if (g.score < 1 && process.env.EVAL_VERBOSE === "1") {
        console.error(`MISS ${evalCase.id} gate: ${g.detail}`);
      }
    }

    const dedup = scoreDedupCase(evalCase);
    if (dedup) {
      outcome.dedup = (dedup.pairPrecision + dedup.pairRecall) / 2;
    } else if (
      (evalCase.tier === "A" || evalCase.id.startsWith("distinct-")) &&
      evalCase.expected.duplicatePairs.length === 0 &&
      evalCase.expected.properties.length > 1
    ) {
      // "N distinct listings, 0 merges" archetype (E7 + the incident Tier-A): the extracted
      // listings must not block against each other. Scoped to the purpose-built archetypes (the
      // existing synthetic dumps aren't authored as spatially-distinct ground truth).
      outcome.dedup = scoreDistinctListings(extracted);
    }
  } catch (error) {
    outcome.failed = true;
    console.error(`case ${evalCase.id} failed:`, error);
  }
  done += 1;
  if (PROGRESS) {
    console.error(
      `  [${done}/${cases.length}] ${evalCase.id} (${Date.now() - started} ms)${outcome.failed ? " FAILED" : ""}`,
    );
  }
  return outcome;
}

const outcomes = await mapWithConcurrency(cases, CONCURRENCY, runCase);
for (const o of outcomes) {
  if (o.failed) card.failures += 1;
  if (o.segment !== null) segmentScores.push(o.segment);
  if (o.extract !== null) extractScores.push(o.extract);
  if (o.dedup !== null) dedupScores.push(o.dedup);
  if (o.translate !== null) translateScores.push(o.translate);
  if (o.gate !== null) gateScores.push(o.gate);
  for (const f of o.fieldScores) {
    const agg = fieldAggregate.get(f.field) ?? { total: 0, count: 0 };
    agg.total += f.score;
    agg.count += 1;
    fieldAggregate.set(f.field, agg);
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
if (cachingLlm) {
  // Warm runs serve responses from disk → `cost` above is NOTIONAL (stored usage),
  // not a real spend. Bypass the cache (EVAL_CACHE unset) to measure the live model.
  console.log(
    `cache: ${cachingLlm.hits} hits / ${cachingLlm.misses} misses (EVAL_CACHE=1 — cost is notional on hits)`,
  );
}
console.log(renderScorecard(card, evalConfig));
process.exit(0); // D21: advisory — never a failing exit, even on regression.
