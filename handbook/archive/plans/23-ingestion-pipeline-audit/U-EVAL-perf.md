# Plan 23 — U-EVAL-perf: fast real-model eval (response cache + bounded concurrency)
> Status: **BUILT (`9161271`, 2026-06-16)** · Owner: eval harness (`packages/pipeline/src/eval`) · Phase: dev-experience,
> done BEFORE the Group B image work (which is model-facing and will need many real-API validation runs).
> Eval-harness only — **zero production / ingestion hot-path impact.**
>
> **Shipped:** `cachingStepLlm.ts` (decorator at the `StepLlm` seam, `EVAL_CACHE=1`, gitignored `.eval-cache/`,
> key = `sha256(step+model+system+content+maxOutputTokens)`, value+usage re-validated on read, null never
> frozen, bypassed on `EVAL_WRITE_BASELINE=1`) + bounded case-level concurrency (`EVAL_CONCURRENCY`, dflt 6
> real/1 oracle) via a local `mapWithConcurrency` + per-case progress. Proof: warm = 0 API calls, real
> cold→warm **5485 ms → 0 ms** byte-identical; oracle eval unchanged (PASS 1.0). Options C (confirm/raise the
> rate-limit tier), F (committed CI cache), G (`--quick` subset) remain available but were not needed.
> The sketch below is the as-built record.

## 1. The pain (what we ran into)

The new CLAUDE.md rule ("validate model-facing changes against the real Anthropic API, iterate until it
works") is correct — it's the only thing that catches what the oracle/`FakeStepLlm` fakes hide. But the
real-model eval is **painfully slow to iterate on**, and it bit us twice in one session:

- A single `EVAL_LLM=anthropic npm run eval` took **~20 minutes** of wall-clock for 64 cases, **~$1.21**.
- Measured mid-run: the process had **2 seconds of CPU over 20 minutes of wall-clock** — i.e. it is
  **~99.8% blocked on the network**, not computing. The whole run is latency- and throttle-bound.
- Average ~4.3 s/call vs a normal ~1.5 s ⇒ a large share is **SDK 429 backoff**: the account's
  rate-limit tier is low enough that a serial run gets throttled (this was the open "which tier?"
  question in `group-b-performance-resilience.md` §2.4 — now answered: low).
- **No progress visibility** — the runner buffers everything and prints the scorecard only at the very
  end, so a 20-minute run is a black box ("is it stuck or working?"). We burned attention idle-waiting.

This friction compounds: the Group B image-stage rewrite is model-facing and will need repeated
real-API validation. At 20 min/run, that loop is unworkable.

## 2. Root causes (verified, file:line)

| Cause | Evidence | Effect |
|---|---|---|
| **Serial runner — zero concurrency** | `runner.ts:232` `for (const evalCase of cases)` with sequential `await` per step (~280 round-trips) | wall-clock = Σ of every call's latency |
| **No response cache** | grep: no cache anywhere in `eval/`; every run re-calls the API even for unchanged inputs/prompts | every iteration pays the full ~280 calls again |
| **Low rate-limit tier ⇒ 429 backoff** | 2 s CPU / 20 min wall; SDK retries 429 w/ exp backoff (`anthropicStepLlm.ts` via SDK default `maxRetries=2`) | per-call latency inflated; concurrency capped by the token bucket |
| **Buffered output** | `runner.ts` prints only the final scorecard | no "is it progressing?" signal |

Determinism is on our side for caching: **temp=0** (`eval.config.ts:14`), one shared adapter
(`runner.ts:204` `new AnthropicStepLlm(new Anthropic())`), and the single `StepLlm.run(request)` seam
(`ports.ts`) every call passes through.

## 3. What to explore (options, roughly in leverage order)

**A. Response cache — the highest-leverage lever for ITERATION.** A `CachingStepLlm` decorator wrapping
the adapter at the `StepLlm` seam. Key = `sha256(step + model + system + content + maxOutputTokens)` —
`system` is the prompt, `content` is the input, so **same prompt + same input → cache hit (no API call);
change either → key changes → miss → real call** (exactly the "if inputs and prompts are the same, read
the cached output" goal). Store: a gitignored `packages/pipeline/.eval-cache/<step>-<hash>.json`.
Re-validate the cached value against the current zod schema on read (a tightened schema/changed prompt
auto-misses → real call). The decisive property: **a warm run makes ZERO API calls → ZERO rate-limit
pressure** — the only way to truly beat throttling is to not call. A pure-logic change (e.g. the A1/A2
geo/dedup logic, no prompt edit) then re-runs in seconds; a prompt edit re-calls only that step.

**B. Bounded concurrency — the lever for COLD runs.** Wrap the case loop (or the per-step calls) in
bounded-concurrency (`mapWithConcurrency`, the util the image-stage rewrite relocates into
`packages/pipeline`). The eval touches no Postgres, so there's no pool constraint — concurrency is pure
API. This cuts a cold run from ~20 min toward ~2-3, **up to the rate-limit ceiling**: per-model-class
token buckets mean classify/segment/extract draw on independent buckets, and once a bucket is saturated
the SDK 429-backoff governs the rest (zero data loss). So concurrency helps until the tier caps it.

**C. Confirm (and consider raising) the rate-limit tier — the only lever for genuinely-fast COLD runs.**
Read it from Console → Limits or the `x-ratelimit-limit-*` response headers (the one external unknown).
The cache makes warm runs free and concurrency saturates the bucket, but a **cold** full run is
fundamentally bounded by the tier's RPM/ITPM. Knowing the numbers tells us how fast "as fast as
throttling allows" actually is, and whether a tier bump is worth it.

**D. Progress visibility — cheap, removes the black box.** Print `case i/N (step)` (or behind a flag) so
a long run isn't anxiety-inducing and we can tell throttle-stall from genuine progress.

**E. (complementary, already partly there) Anthropic prompt caching.** `cache_control` is already on the
system prefix (`anthropicStepLlm.ts:28`) — it cuts input-token COST and some latency, but **still makes
the network round-trip**, so it's not a substitute for the local response cache (A). Keep it; it stacks.

**F. (stretch / defer) Committed cache for CI reproducibility.** A committed `.eval-cache/` would let CI
run the "anthropic" eval for free + deterministically, real-calling only on prompt changes. Powerful but
risks repo bloat and staleness — defer until A proves out locally.

**G. (optional) `--quick` subset mode.** Run a representative subset (Tier-A + a few archetypes) for the
inner loop; full set for the official baseline. Optional once A+B make full runs cheap enough.

## 4. The endpoint (target behavior)

- **Warm re-run, no prompt change → seconds.** Change `run.ts`/dedup/geo logic, re-run the eval, get the
  scorecard in <~10 s (all cache hits, 0 API calls, 0 rate-limit pressure). This is the iteration target.
- **Cold run / prompt change → as fast as Anthropic throttling allows.** Bounded concurrency saturates
  the account's token bucket; SDK backoff governs the overflow at zero data loss. Target ~2-3 min at the
  current tier (vs ~20), faster if the tier is raised. Only the steps whose prompt/input changed re-call.
- **Official baseline + model-drift checks → BYPASS the cache** (fresh calls). A response cache freezes
  the model's answers at capture time; it must never silently stand in when we actually want to *measure*
  the model. So caching is **opt-in** (`EVAL_CACHE=1`) and the baseline-regen path runs without it.
- **Always → progress visibility.** No more 20-minute black boxes.

Net: iteration on model-facing code stops being a 20-minute-per-run, $1.21-per-run tax, while the
official baseline stays an honest fresh-model measurement.

## 5. Implementation sketch (not built)

1. **`packages/pipeline/src/eval/cachingStepLlm.ts`** — `class CachingStepLlm implements StepLlm`,
   constructed with `(inner: StepLlm, dir: string)`. `run(request)`: compute the key; on hit read+
   re-validate `{value, usage}` (validation failure ⇒ treat as miss); on miss `await inner.run`, write,
   return. Swallow cache I/O errors (never fail the eval on a cache problem).
2. **Wire at `runner.ts:204`** — when `EVAL_CACHE` is set, wrap: `realLlm = new CachingStepLlm(new
   AnthropicStepLlm(new Anthropic()), cacheDir)`. Baseline regen (`EVAL_WRITE_BASELINE=1`) forces
   cache-bypass regardless, so the official baseline is always fresh.
3. **Concurrency** — replace the `runner.ts:232` serial `for` with a bounded `mapWithConcurrency`
   (default `EVAL_CONCURRENCY` ≈ 6-8); the score-aggregation arrays become per-case results merged after.
   Reuse the relocated `mapWithConcurrency` from `@line-robot/pipeline` (image-rewrite R-2b) or add a tiny
   local helper if that hasn't landed.
4. **Progress** — a `case i/N done (Δt)` line per case (always, or behind `EVAL_PROGRESS`/`EVAL_VERBOSE`).
5. **`.gitignore`** the cache dir.

**Tests/verification:** a unit test that a warm run (pre-seeded cache) makes **0** `inner.run` calls and
returns the cached scores (assert via a counting fake `StepLlm`); a before/after wall-clock note (cold
serial vs cold concurrent vs warm) recorded in the commit; confirm `EVAL_WRITE_BASELINE=1` bypasses the
cache (fresh calls). No production code touched — gate stays typecheck/lint/test.

## 6. Open questions / decisions

- **Cache key vs schema:** is step-name + re-validate-on-read enough, or include a schema hash in the
  key? (Re-validate is simpler and auto-invalidates a tightened schema; a loosened schema keeps old hits,
  which is fine.) Recommend re-validate-on-read for v1.
- **Cost on a cache hit:** report the stored `usage` (stable cost numbers across runs) or 0 (true
  marginal cost)? Recommend stored usage, but tag the scorecard "warm (cached)" so $ isn't misread.
- **Concurrency default + per-model buckets:** start `EVAL_CONCURRENCY=6`; raise once the tier (C) is
  known. Don't over-provision — backoff churn past the bucket is wasted.
- **Confirm the rate-limit tier (C)** — the one external input that sets the cold-run floor.

## 7. Out of scope
- Speeding up the *production* sweep's classify (that's the Group B image-stage rewrite — different code).
- Committed/CI cache (option F) — defer until the local cache proves out.
- An LLM-judge or any scoring change — orthogonal.
