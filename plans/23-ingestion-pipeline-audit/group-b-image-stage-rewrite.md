# Plan 23 — Group B: Image-stage rewrite (bounded-parallel classify · reference-based bytes · cache short-circuit) — R+P
> Status: R+P COMPLETE · Source: plans/23-ingestion-pipeline-audit/group-b-performance-resilience.md (extends/supersedes its image-stage parts) · Phase: Research+Plan ONLY (no implementation) · Reconciles with: 00-CONSOLIDATED-sequencing.md (Phase 3, CR-4/CR-5) + root CLAUDE.md

## 1. Problem & scope

The ingestion sweep processes image-heavy LINE chat dumps. A real incident: a user dumped **76 messages =
59 images** into one 1:1 conversation; extraction **timed out (180 s Lambda) on every attempt → abandoned
with zero listings.** The deployed band-aid raised the sweep Lambda to **900 s / 1024 MB**
(`infra/src/lambdas.ts:273,278`); the successful run was ~88 s, est $0.46.

Two **structural** problems this refactor fixes (both verified below):

1. **Classification is fully SERIAL** while the cheaper derivative build is already PARALLEL — backwards.
   `runPipeline` step 1 is a `for…of` with `await classifyImage` inside (`packages/pipeline/src/run.ts:182-185`):
   one image at a time, 1 Haiku 4.5 call each (+ a Sonnet 4.6 escalation on a low-confidence chanote,
   `packages/pipeline/src/steps/classify.ts:46-57`). Meanwhile the derivative build (S3 GET + 2× sharp) runs
   under an unbounded `Promise.all` at `packages/bot/src/app/pipelineV2Sweep.ts:182-204`. The expensive stage
   is serial; the cheap stage is parallel.
2. **All image BYTES are held in memory for the whole run.** The `Promise.all` at `pipelineV2Sweep.ts:182`
   materialises all 59 `vision.base64` strings into the `photos` array (~24-40 MB) and hands the whole array
   into `runPipeline` as `input.photos`. The base64 is only ever read in the classify loop (`run.ts:184` →
   `classify.ts:31`); everything downstream needs only `s3Key`/`thumbKey`/`kind` + the small `ClassifyResult`.
   The bytes are dead weight after classify yet resident the whole run; this is half of why 512→1024 MB was
   needed (`lambdas.ts:276-278`).

**This artifact designs the unified image-stage rewrite** with three properties: **(a)** bounded-parallel
classification, capped safe against Anthropic limits with `SWEEP_RESERVED_CONCURRENCY=3`
(`infra/src/naming.ts:32`) concurrent Lambdas; **(b)** reference-based / lazily-loaded bytes (peak memory
O(window), not O(#images)); **(c)** composes with the Group B Step-B `s3Key` classify cache so a WARM run
short-circuits the whole byte path (no S3 GET, no sharp, no LLM, no base64), cache writes EAGER per-image.

**Founder goal:** a robust solution that **simplifies** this part of the system and lets us **lower the
Lambda memory and shorten actual runtime**. Treat "simplify + delete code" as a first-class objective.

**Out of scope (flag-only):** chunking + watermark-per-chunk (Group B Step A; relationship analysed §3 R-11),
the smarter failure signal (Step C), dedup correctness (Group A), DM-claimable (Group D), the E8 trace store
*and* E10 write-idempotency (built alongside this in Phase 3 but separately specced; we only confirm
non-interference). Anthropic Batch API and ingest-time preprocess (E4(a)) are evaluated as OPTIONS (§4) but
the recommendation defers the latter (§9).

**Anti-over-engineering bar (root CLAUDE.md):** no interface until a 2nd impl; ports only at real seams
(LLM/DB/LINE/S3); no one-caller abstractions; no config nobody sets; code a human reads without a guide.

---

## 2. Research findings (current profile, contracts, rate-limit/sharp/libuv facts) — file:line grounded

### 2.1 Current image-stage profile (verified)

| Fact | Evidence | Note |
|---|---|---|
| Classify loop is serial `for…of await` | `packages/pipeline/src/run.ts:182-185` | `classifications.push(photo.vision ? await classifyImage(...) : null)` — one at a time |
| Result bound to photo BY POSITION (index `i`) | `run.ts:186-189` (`classifications[i]`), `:223,:227` (`classifications[e.slot]`) | **alignment landmine** — out-of-order results would mis-bind kind/deedNo (R-5) |
| classifyImage = 1 Haiku call, +1 Sonnet on low-conf chanote | `steps/classify.ts:46-57`; models `steps/context.ts:8-9` | worst case ~2× calls on chanote-heavy batches (R-7) |
| Derivative build = S3 GET + 2× sharp, returns bytes too | `packages/pipeline/src/media/derivatives.ts:44-60` | `getOriginal` → `downscale ×2` → `putDerivative ×2` → returns `{visionKey, thumbKey, visionJpeg}` |
| Sweep builds derivatives for ALL images via unbounded `Promise.all` | `pipelineV2Sweep.ts:182-204` | materialises every `base64` into `photos[]` |
| base64 read ONLY at classify | `classify.ts:31` → `adapters/content.ts:14` (`data: block.base64`) | downstream (`run.ts:165-170,224-228`, persist) uses only `s3Key`/`thumbKey`/`kind` |
| Two parallel arrays built: `photos` + marker-only `markers` | `pipelineV2Sweep.ts:182-204` (photos) + `:206-212` (markers) | both derived from the same `attachments`; markers exist only to seed `[IMG n]` (R-14 simplification) |
| `mapWithConcurrency` exists, order-preserving, **UNUSED anywhere** | `packages/bot/src/core/utils/concurrency.ts:7-26` (grep: 0 callers) | results indexed by `i` (`:20`) ⇒ preserves alignment for free; pure utility, no domain knowledge. **⚠️ It lives in `packages/bot`; the recommended classify use is in `packages/pipeline/src/run.ts`, and pipeline must NOT import from bot (dep runs bot→pipeline; verified pipeline imports nothing from bot). → RELOCATE this util into `packages/pipeline` and have bot import it back via `@line-robot/pipeline` (R-2b). The build-bounding call stays in the sweep/bot and uses it locally — fine.** |
| Lambda config = 900 s / 1024 MB / arm64 / reserved 3 | `infra/src/lambdas.ts:273,278,261,275`; `naming.ts:32` | comment names per-batch chunking as the real fix (`:271`) |
| sweep client = `new Anthropic({apiKey})`, no `maxRetries`/`timeout` override | `packages/bot/src/lambda/sweep.ts:61` | ⇒ SDK defaults apply (§2.4) |
| pipeline is byte-pure — NO AWS/S3 import | grep `@aws-sdk\|S3Client` in `packages/pipeline/src` → 0 hits | S3 only via the `MediaStore` port (`ports.ts:42-45`); hexagonal boundary intact |
| Real `MediaStore` = `S3RawArchive` | `packages/bot/src/adapters/s3/rawArchive.ts:32,75-98` | `getOriginal`(GET) / `putDerivative`(PUT); injected at `sweep.ts:43,62` |
| Cost log has NO per-call latency | `packages/pipeline/src/cost.ts:11-19` | E8/CR-5 adds `latencyMs` separately (not this work) |

### 2.2 Exact contracts that a bytes→reference change touches (the breaking surface)

The image-input contract is `PipelinePhoto.vision: VisionImage` where `VisionImage` embeds `base64`:

```
// packages/pipeline/src/steps.ts:19-25
export interface VisionImage { s3Key: string; mediaType: ...; base64: string; }
// packages/pipeline/src/run.ts:30-39
export interface PipelinePhoto { index: number; s3Key: string; thumbKey?: string; vision?: VisionImage; }
```

Exhaustive blast radius (file:line; only ONE production constructor of `base64`):

| Layer | File:line | What | Migration |
|---|---|---|---|
| `runPipeline` def | `run.ts:176` | signature | takes `MediaStore` + cache via `ctx`/param (§6) |
| **Only prod `runPipeline` caller** | `pipelineV2Sweep.ts:242-249` | passes `photos` (with base64) | passes photo **refs** (no base64) + threads media/cache |
| **Only prod `base64` constructor** | `pipelineV2Sweep.ts:190-194` | `base64: Buffer.from(d.visionJpeg).toString("base64")` | **DELETED** — bytes loaded lazily in pipeline |
| `VisionImage` type + base64 field | `steps.ts:19-25` | contract | `base64` becomes optional/removed; ref-carrying shape |
| base64 consumer (classify) | `classify.ts:31` | builds image block | loads bytes via `MediaStore` then passes base64 to port |
| LLM port image block | `ports.ts:21-24` | `{type:"image"; base64}` | **UNCHANGED** — port still takes base64 (R-2 boundary; bytes loaded just-in-time before the call) |
| Anthropic adapter | `adapters/content.ts:14` | `data: block.base64` | **UNCHANGED** |
| Integration tests | `pipeline.test.ts:104-110,142-148,189-195,228-234`; `live.e2e.test.ts:71-77` | build `PipelineInput` with `photos:[{index,s3Key}]` or `[]` — **never set `vision`/base64** | inject a fake `MediaStore`; classify already skipped when no bytes resolve |
| Sweep unit test | `pipelineV2Sweep.test.ts:279-315` | mocks `buildDerivatives` → asserts `photos[0].vision` defined | rewrite to the new ref shape (R-14: `vision` may be gone) |
| `derivatives.test.ts` | `:51-55` | asserts `visionJpeg` returned | DELETE that test if `visionJpeg` is dropped (R-14) |
| **Eval harness** | `eval/runner.ts:231` (`classify:null`), `:235,:249` (`geoHints:[]`), `:293` (`photoCount:0`) | **calls steps directly, never `runPipeline`, never images** | **ZERO blast radius** — eval is untouched by this change |
| `thumbKey` downstream | `run.ts:165-170,224-228`; `db/src/schema.ts:373`; `api/src/handler.ts:150-155`; `website/src/lib/media.ts:48-49`; `db/src/repositories/portal.ts:238` | website/miniapp thumb path | **UNCHANGED** — `thumbKey` is still produced + persisted identically (R-13) |

**Conclusion:** the contract change is contained — one production constructor deleted, one caller migrated,
one type narrowed, ~3 test files updated; the **LLM port stays base64** (the byte-loading moves *into* the
pipeline behind the existing `MediaStore` seam, not into the port). Eval, thumb path, DB schema all untouched.

### 2.3 sharp / libuv facts (sub-agent research, repo-grounded)

- **sharp 0.35.1** (`packages/pipeline/package.json:20`, lockfile-pinned). No `UV_THREADPOOL_SIZE` /
  `sharp.concurrency()` / `sharp.cache()` tuning exists anywhere (grep: 0 hits).
- sharp's async `.toBuffer()` runs decode/resize/encode on the **shared libuv threadpool (default size 4)**,
  contended by `node:fs`/`node:crypto`/`node:dns.lookup`/`node:zlib`. Firing 59 images × 2 derivatives = 118
  pipelines via nested unbounded `Promise.all` does **NOT** run 118× parallel — only ~4 execute, the rest
  queue. (Established libuv/N-API behaviour, high confidence.)
- **Lambda vCPU ∝ memory:** 1 full vCPU at 1769 MB ⇒ **1024 MB ≈ 0.58 vCPU, 512 MB ≈ 0.29 vCPU** (documented
  AWS). At sub-1-vCPU, real encode parallelism ≈ the fractional vCPU; the realistic speedup of the unbounded
  `Promise.all` over a serial loop is only **~1.0-1.3×** — the unbounded fan-out buys ~nothing in throughput
  and costs peak memory + GC pressure.
- **`sharp.cache()` is on by default (~50 MB) and useless here** (distinct one-shot images, ~0 hit rate) —
  pure peak-memory cost; `sharp.cache(false)` is a free win.
- **Bounding the build fan-out materially cuts peak memory** (caps concurrent decoded bitmaps; a phone photo
  decodes to ~36 MB raw) for ~the same throughput. The ready tool is `mapWithConcurrency` (K=1 at 512 MB,
  K=2 at 1024 MB ≈ the threadpool width). *(MB figures are sub-agent estimates; validate against CloudWatch
  `MaxMemoryUsed` before locking K — open question Q4.)*

### 2.4 Anthropic rate-limit + SDK retry facts (cached-docs + installed-SDK grounded)

- **Installed `@anthropic-ai/sdk` 0.102.0** (`packages/{bot,pipeline}/package.json`). Verified in
  `node_modules/.../client.js`:
  - `maxRetries = options.maxRetries ?? 2` (`client.js:111`, doc-comment `:63`). **Default 2 retries.**
  - Retries **429, 408, 409, ≥500** (`shouldRetry`, `client.js:665-700`). 429/500/529 are "Yes/retryable"
    (cached `error-codes.md:7-17`).
  - **Honors `retry-after` and `retry-after-ms` headers** (`client.js:704-720`) — *the sub-agent's "does NOT
    honor retry-after" was WRONG; the installed SDK does.* Falls back to exponential backoff `0.5s × 2^n`
    capped at `8s`, ±25% jitter (`calculateDefaultRetryTimeoutMillis`, `client.js:731-740`).
  - Our client is constructed bare (`sweep.ts:61`) ⇒ all the above defaults are live.
- Cached `error-codes.md:139-143`: 429 returns `retry-after` + `x-ratelimit-*` headers; "**The Anthropic SDKs
  automatically retry 429 and 5xx errors with exponential backoff (default max_retries=2).**" 529 overloaded
  is also retryable.
- **Prompt-caching minimum for Haiku 4.5 = 4096 tokens** (cached `prompt-caching.md:130-134`). An image is
  ~1600 tokens, and our cache_control is on the **system prefix only** (`anthropicStepLlm.ts:28`), with the
  image in user content *after* it (`classify.ts:30-31`) — so per-image `cache_control` would **silently not
  cache** (`prompt-caching.md:128`: "shorter prefixes silently won't cache… `cache_creation_input_tokens:0`").
  Confirms Group B §2.4: **don't add image cache_control; an out-of-band `s3Key` cache dominates.**
- **Rate-limit numbers — now CACHED & cited.** Downloaded the canonical doc to
  `docs/platform.claude.com/docs/en/api/rate-limits.md` (upstream
  `https://platform.claude.com/docs/en/api/rate-limits.md`; indexed in `docs/llms.txt`). Messages-API limits
  by model class & tier (`rate-limits.md:153-200`):

  | Model | Tier 1 (RPM/ITPM/OTPM) | Tier 2 | Tier 3 | Tier 4 |
  |---|---|---|---|---|
  | **Haiku 4.5** (classify) | 50 / 50k / 10k | 1,000 / 450k / 90k | 2,000 / 1M / 200k | 4,000 / 4M / 800k |
  | **Sonnet 4.x** (segment/extract/gate + classify-escalate; *shared* across 4.6/4.5/4) | 50 / 30k / 8k | 1,000 / 450k / 90k | 2,000 / 800k / 160k | 4,000 / 2M / 400k |

  Three rules from the cached doc that change the arithmetic:
  1. **Limits are PER-MODEL-CLASS** (`rate-limits.md:145`) — the Haiku classify bucket is independent of the
     Sonnet extract/gate bucket, so parallel classify does NOT starve the (Sonnet) segment loop.
  2. **Only UNCACHED input tokens count toward ITPM** (`rate-limits.md:102,123`). Our images are uncached
     (not prompt-cacheable, §2.4 above) ⇒ a cold classify counts its full ~1,600 input tokens — BUT the
     `s3Key` cache (Step B) makes a WARM run send *nothing* (cache hit ⇒ no API call ⇒ 0 ITPM). Rate-limit
     pressure therefore exists ONLY on the first cold ingest of each image.
  3. **Continuously-replenished token bucket, enforced sub-minute** (`rate-limits.md:32,34`) — "60 RPM may be
     enforced as ~1 req/s", so short bursts can momentarily exceed → 429 → the SDK retries honoring
     `retry-after` (verified §2.4). There is **no documented concurrent-request cap.**

**Concurrency recommendation — push it HIGH, let backoff govern (founder directive: "as many as we can get
away with; 6-8 ≫ 2-4").** The earlier "C ≤ ~1.5" worst-case (3 Lambdas bursting simultaneously at full ITPM)
was the wrong frame: 429s auto-retry with `retry-after` at **zero data loss** (§2.4), the cache means only the
rare cold first-ingest creates pressure, and the buckets are per-model. So set **C = 8** (env-overridable
`CLASSIFY_CONCURRENCY`, default 8) and treat the SDK 429 backoff as the real throttle — discover the ceiling
empirically rather than under-provision. Per tier, for one 59-image cold dump (~94k input, ~18k output,
~59 requests):
  - **Tier 2+ (1,000+ RPM, 450k+ ITPM):** C=8 is comfortable — one Lambda at C=8 ≈ ~6-7 req/s ≪ ~16 req/s
    (1,000 RPM); 94k ≪ 450k ITPM. Even three colliding dumps only graze RPM and self-smooth via backoff. Tier
    3+ could exceed 8, but C=8 already drains 59 images in ~10 s (§7) — diminishing returns past that.
  - **Tier 1 (50 RPM ≈ 0.83 req/s; 50k ITPM; 10k OTPM):** the *bucket itself* caps throughput — a 59-image
    dump needs ~70 s (RPM) / ~2 min (ITPM) regardless of C, so C=8 just leans on backoff (correct, no loss,
    but more 429 retry-noise; drop to ~4 to cut churn). Concurrency can't beat the bucket at tier 1 — only a
    tier upgrade, the Batch API, or ingest-time spread can.
  **Do NOT add `p-limit`** — `mapWithConcurrency` already bounds + orders (rule 1). *Q1 is now narrow:* the
  table is known; only **which tier this account is** is unconfirmed — read it from the Console → Limits page
  or the `x-ratelimit-limit-*` response headers. Default **C=8**; lower only on tier-1 + observed thrash.

---

## 3. Side-effects & risk register

Each row: evidence · severity · mitigation. R-1…R-15 map to the investigation list.

| # | Risk / side-effect | Evidence | Sev | Mitigation |
|---|---|---|---|---|
| **R-1** | Breaking the image-input contract (bytes→ref) ripples to all `PipelineInput`/`PipelinePhoto` constructors | §2.2 table | Med | Contained: 1 prod constructor deleted, 1 caller migrated, ~3 test files; LLM port unchanged; eval/thumb/schema untouched. Land in one increment, typecheck-gated. |
| **R-2** | Pipeline could gain an AWS/S3 import (breaks hexagonal "no adapter in core") | grep: pipeline is clean (`§2.1`); `MediaStore` port `ports.ts:42-45` | High | **Reuse the existing `MediaStore` port** — the pipeline already depends on it via `buildDerivatives`. Byte-loading is `store.getOriginal`/derivative-read behind that same seam. **No new port** (rule 2). |
| **R-2b** | **`mapWithConcurrency` is in `packages/bot`; the classify use is in `packages/pipeline` — a boundary/circular-dep trap** | `concurrency.ts` is under `packages/bot/src/core/utils`; pipeline imports nothing from bot (grep §2.1); dep direction is bot→pipeline | **Med** | **RELOCATE the generic util into `packages/pipeline`** (e.g. `packages/pipeline/src/util/concurrency.ts`) — it has no domain knowledge, and pipeline is already bot's dependency, so this is in-repo, **no new external dep**. Update bot's (currently zero) call sites + the K-bounded build wrap to import from `@line-robot/pipeline`. Adds ~1 file move + 1 import line to the LOC math (still net-negative). The artifact's "reuse as-is" was inaccurate on package location; the design is unchanged. |
| **R-3** | Bounded-parallel classify trips Anthropic rate limits (×3 Lambdas + escalations) | §2.4 (cited `rate-limits.md`); `naming.ts:32`; `classify.ts:52-53` (escalation) | Med | C=8 env-overridable (founder directive — push high, §2.4); per-model buckets (`rate-limits.md:145`) so classify≠extract; only-uncached-ITPM + the `s3Key` cache mean warm runs cost 0; SDK auto-retries 429/5xx honoring `retry-after` (verified `client.js:704-720`) at zero data loss; escalation counted (R-7). No explicit limiter. |
| **R-4** | sharp "parallel" build is libuv-bounded (≤4) + fractional-vCPU bound → naive Nx speedup is false | §2.3 | Low | Quantified: real speedup ~1.0-1.3× at 1024 MB. The win from this rewrite is **memory**, not build-CPU; bound build via `mapWithConcurrency` (K=2) + `sharp.cache(false)`. |
| **R-5** | Out-of-order window results would mis-bind kind/deedNo to the wrong image | `run.ts:186-189,223,227` bind by index | **High** | `mapWithConcurrency` writes `results[i]` (`concurrency.ts:20`) ⇒ **order preserved by construction**. Biting test asserts alignment (§8 test-c). |
| **R-6** | One image's S3/sharp/LLM failure must not fail the window or batch | current per-image catch `pipelineV2Sweep.ts:196-202`; `Promise.all` rejects on first | **High** | Per-unit `try/catch` INSIDE the `mapWithConcurrency` fn returning `{photo, classify:null}` on failure (mirrors today). Never `Promise.all` over raw classify promises. Biting test (§8 test-d). |
| **R-7** | chanote escalation = 2 calls/image holding bytes across both | `classify.ts:50-54` | Low | Bytes loaded once per image, held across both calls within that unit (already the case); freed when the unit returns. Budget §2.4 assumes ~1 call/image typical, headroom for escalation bursts via 429 backoff. |
| **R-8** | Cache miss must persist EAGERLY or retries stay cold | Group B §2.4 (E4); watermark doesn't advance on timeout (group-b §2.1 RC-2) | **High** | Per-image: classify → **immediately** `putClassification(s3Key, verdict)` (independent of run success), THEN continue. A later timeout leaves the cache warm. Biting test (§8 test-f). Reconciles with Step-B (§6). |
| **R-9** | Window parallelism must NOT spill into per-segment DB writes (pool max:2) | `pool.ts:24` (max:2); `naming.ts:29-42` budget; `run.ts:205-283` segment loop is serial | Med | Parallelism is scoped to the **byte/classify stage only** (§6 step 1). The segment loop (extract/dedup/gate/persist) stays the existing serial `for…of` — untouched. Biting test asserts ≤2 concurrent DB ops if measurable; minimally, the segment loop diff is empty. |
| **R-10** | Concurrent classify → concurrent E8 trace writes at the `AnthropicStepLlm` chokepoint | CR-5 (`00-CONSOLIDATED:95,177-186`) | Low | Trace sink is per-call, best-effort, never fails the pipeline (CR-5 spec). Concurrent best-effort writes are independent (per-call S3 key `traces/<conv>/<run>/<step>.json`). **Cross-dep, not built here**; flag: C must include the call ordinal so concurrent classify traces don't collide on `<step>.json` (hand-off note to CR-5 owner). |
| **R-11** | Does this make chunking (Step A) optional? | group-b Option A; CR-2 (`00-CONSOLIDATED:75-80,91-92`) | Info | **Yes, partially.** Once memory is O(window) and classify is parallel, chunking drops from a *memory* fix to a **time-only backstop**. With C=8 + cache, a 59-image cold run ≈ ~10 s of classify wall-clock (§7) — comfortably under even 300 s. **Chunking can be DEFERRED**, or its image cap grown (e.g. 30-40). But A is still wanted as the watermark-progress / poison-isolation mechanism (group-b RC-2/RC-4) — keep it, just no longer load-bearing for *this* timeout. **CR-2 ordering (A-dedup before chunking) is unaffected.** |
| **R-12** | Cost-savings expectation must be honest (timeout ≠ cost) | `lambdas.ts:273,278` | Info | §7 corrects: the 900 s ceiling is not billed; GB-ms of *actual* duration is. Savings = lower memory tier + shorter wall-clock + cache (warm: 0 tokens/GET/sharp). Bounded-parallel does NOT cut LLM token $ (same calls). |
| **R-13** | Rewrite breaks the 640px thumb path (website/miniapp) | thumb consumers §2.2 | Low | `thumbKey` is still produced by `buildDerivatives` and persisted identically (`run.ts:165-170`). The rewrite changes *byte residency + classify scheduling*, not the derivative keys/persist. Confirm: `derivatives.ts` thumb branch unchanged. |
| **R-14** | Simplification: redundant `visionJpeg` return + `markers` array + two-phase build-then-classify | `derivatives.ts:18-20,59`; `pipelineV2Sweep.ts:206-212`; `run.ts:181-189` | Info | DELETE `visionJpeg` from `DerivativeSet` (only consumer was the base64 line, now gone) + its test (`derivatives.test.ts:51-55`); FOLD `markers` into the same per-image unit; collapse build-then-classify into one per-image function. Net-LOC delta §6. |
| **R-15** | Ingest-time preprocess (E4(a)) might be the simplest robust end state | group-b §2.4(E4), §8; CR (`00-CONSOLIDATED:219`) | Info | Evaluated as Option D (§4). Removes classify from the hot path entirely but touches the processor/webhook path (Group-D-adjacent) + a per-image S3/LLM call at ingest. **Deferred** — the lazy-in-sweep design captures the whole win with no processor change; the `s3Key` cache is the clean hand-off seam to E4(a) later. |

---

## 4. Solution options (scored)

All options keep classify behind the `StepLlm` port and bytes behind the `MediaStore` port (R-2). They differ
in *where* bytes are loaded and *when* classify runs. C = classify concurrency; K = build concurrency.

### Option A — Status quo + just parallelise the classify loop (minimal)
Keep `pipelineV2Sweep.ts` materialising all base64; change only `run.ts:182-185` from `for…of await` to
`mapWithConcurrency(input.photos, C, p => classifyImage(...))`.
- **Effort:** XS (one function). **Blast radius:** tiny (run.ts only). **Risk:** Low.
- **Simplification:** none — bytes still O(#images) in memory (problem 2 UNFIXED), `markers`/`visionJpeg`
  redundancy remains. Does not let memory drop.
- **Verdict:** fixes (a) not (b). Half a fix; rejected as the end state but it is a strict subset of the
  recommendation (could ship first if time-boxed).

### Option B — Build-to-S3-keys, then lazy-load + bounded-parallel classify (the recommended core)
The sweep builds derivatives to S3 (as today) but returns **only keys** (no base64) into `photos`. The
pipeline's image stage runs `mapWithConcurrency(photos, C, …)`: per image — **cache lookup by `s3Key`** → on
hit, return verdict (zero bytes/LLM); on miss, `MediaStore.getOriginal(visionKey)` → classify → **eager
`putClassification`** → free bytes. Peak memory = O(C images), not O(#images). One per-image unit fuses
build-marker + classify + cache; `markers`/`visionJpeg` deleted.
- **Effort:** M. **Blast radius:** the §2.2 surface (contained). **Risk:** Med (contract change + parallelism).
- **Simplification:** **High** — deletes `visionJpeg`, the `markers` array, the two-phase split, the whole
  base64-materialisation; unifies on `s3Key` refs.
- **Verdict:** fixes (a)+(b)+(c), simplifies, enables lower memory + shorter runtime. **RECOMMENDED.**

### Option C — Fuse build + classify into one per-image bounded window (no separate build phase)
Like B, but the derivative build ALSO moves inside the windowed unit (build is currently a separate
`Promise.all` phase in the sweep). One `mapWithConcurrency(attachments, K, …)` does build→cache-check→
classify→persist per image.
- **Effort:** M (slightly more — moves build into the pipeline OR keeps it in the sweep but windowed).
- **Risk:** Med. **Subtlety:** build wants K≈2 (CPU/threadpool-bound, §2.3), classify wants C≈8
  (network-bound). Fusing forces one concurrency for two different resource profiles.
- **Verdict:** marginally simpler control flow but **conflates two concurrency budgets** — violates "one knob,
  one resource." Prefer B's clean split (build at K in the sweep; classify at C in the pipeline). Rejected.

### Option D — Ingest-time preprocess (E4(a)): build+classify once when the image arrives
Build derivative + classify + persist the verdict at the processor/webhook path; the sweep then loads zero
bytes and makes zero classify calls.
- **Effort:** L (processor path, Group-D-adjacent; new per-image S3/LLM at ingest; new IAM on the processor
  role). **Blast radius:** processor + webhook.
- **Simplification:** highest *eventual* (classify leaves the hot path), but biggest change now.
- **Verdict:** **the right long-term seam, deferred.** B's `s3Key` cache IS the hand-off point — once it
  exists, E4(a) is "call the same per-image unit at ingest instead of (or in addition to) the sweep." Don't
  build now (rule: smallest thing that works). Flagged §9/§10.

| Option | Fixes (a) parallel | (b) memory | (c) cache | Simplifies | Effort | Risk |
|---|---|---|---|---|---|---|
| A minimal | ✅ | ❌ | ❌ | ❌ | XS | Low |
| **B build-keys+lazy (REC)** | ✅ | ✅ | ✅ | ✅✅ | M | Med |
| C fused build+classify | ✅ | ✅ | ✅ | ✅ (but conflates K/C) | M | Med |
| D ingest-time | ✅ | ✅✅ | ✅ | ✅✅✅ (later) | L | High (processor) |

---

## 5. Recommended design (robust + simplest)

**Option B: build-to-S3-keys in the sweep at K, then a single bounded-parallel cache-first classify stage in
the pipeline at C, with eager per-image cache writes.** Concretely:

1. **Sweep (`pipelineV2Sweep.ts`)** builds derivatives via `mapWithConcurrency(attachments, K=2, buildDerivatives)`
   (replaces the unbounded `Promise.all`) and returns photo **references only**:
   `{ index, s3Key, thumbKey, visionKey }` — **no base64**. The redundant marker-only `markers` array is
   folded away (the `[IMG n]` markers are derived from the same photo list).
2. **`buildDerivatives` (`derivatives.ts`)** drops `visionJpeg` from `DerivativeSet` (return `{visionKey,
   thumbKey}`); no caller needs the bytes anymore.
3. **Pipeline image stage (`run.ts`)** replaces the serial loop with **one cache-first bounded-parallel pass**:
   ```
   classifications = await mapWithConcurrency(photos, C, async (photo) => {
     if (!photo.visionKey) return null;
     const cached = await cache?.find(photo.s3Key);        // (c) WARM short-circuit
     if (cached) return cached;                            //   → no GET, no sharp(already built), no LLM
     const { bytes, mediaType } = await media.getOriginal(photo.visionKey);  // (b) lazy, per-window
     const verdict = await classifyImage(ctx, { mediaType, base64: toB64(bytes) });
     if (verdict) await cache?.put(photo.s3Key, verdict);  // (R-8) EAGER, independent of run success
     return verdict;                                       //   bytes drop out of scope here → freed
   });
   ```
   `mapWithConcurrency` preserves index↔result alignment (R-5) and per-unit `try/catch` gives error isolation
   (R-6). `media` is the **existing `MediaStore` port** (R-2; no new seam). `cache` is the Step-B classify
   cache, injected the same way (§6).
4. **The LLM port and the segment/extract/dedup/gate/persist loop are UNCHANGED** — the port still receives
   base64 (loaded just-in-time, in scope only for that call); the segment loop stays serial (R-9).
5. **sharp tuning (cheap, separate):** at the sweep bundle's module load, `sharp.cache(false)` +
   `sharp.concurrency(1)`; set `UV_THREADPOOL_SIZE` via Lambda env (3-4 at 1024 MB, 2 at 512 MB). Build at K=2.
6. **Lambda config:** after the rewrite proves bounded memory in staging (CloudWatch `MaxMemoryUsed`),
   **lower memory 1024→512 MB** (Q4) and timeout per the chunking work (group-b CR-13; this rewrite makes the
   timeout-pressure largely moot, R-11).

**Why this is the robust-AND-simplest:** it reuses the two seams that already exist (`StepLlm`, `MediaStore`)
and the already-present `mapWithConcurrency` — **no new port, no new dependency, no new config nobody sets**
(C/K/UV are real knobs with sensible defaults). It DELETES the base64 materialisation, the `visionJpeg`
return, the `markers` array, and the two-phase build-then-classify. It is code a human reads top-to-bottom:
"for each photo, with bounded concurrency: cached? else load → classify → cache → free."

**Net conceptual complexity:** strictly *down* — one cache-first windowed function replaces (serial loop +
unbounded build `Promise.all` + parallel markers array + base64 plumbing).

---

## 6. Implementation plan (file-by-file, ordered) + cross-interactions + caller migrations

> Phase 3 work per `00-CONSOLIDATED §4`. Sequenced AFTER Group A's `pipelineV2Sweep.ts` geo-bind edit
> (CR-1) and the Step-B classify cache (this rewrite *consumes* it). Execute as ONE `/increment-review`-sized
> unit (backend; no `/frontend-review`). Gate: typecheck/lint/test/coverage + the biting tests (§8).

**Pre-req (Step B, separate increment, lands first per `00-CONSOLIDATED §4 Phase 3` bullet 1):** the
`s3Key`-keyed classify cache. Recommended store **B1 = a DynamoDB attribute on the message item**
(`messageRepository.ts` — the row the sweep already reads via `findSince`), exposing
`find(s3Key): ClassifyResult|null` / `put(s3Key, ClassifyResult)`. **One store ⇒ no `ClassifyCache`
interface** (rule 1); it is a typed pair of functions on the existing adapter, threaded as an optional
`classifyCache?` into `PipelineV2Deps` and into `runPipeline`. This rewrite assumes that pair exists; if Step
B has not landed, the cache params are simply `undefined` and the path degrades to cold-every-time (still
correct, just not warm-fast).

Ordered steps:

0. **Relocate `mapWithConcurrency` into `packages/pipeline` (R-2b).** Move
   `packages/bot/src/core/utils/concurrency.ts` → `packages/pipeline/src/util/concurrency.ts` (generic, no
   domain knowledge), re-export from the pipeline package barrel, and update bot's import path (currently 0
   callers, so only the new K-bounded build wrap in `pipelineV2Sweep.ts` imports it, via `@line-robot/pipeline`).
   This is the prerequisite for the pipeline-side classify use in steps 3/5 — pipeline must NOT import from bot.
1. **`packages/pipeline/src/steps.ts:19-25` — narrow `VisionImage`.** Make it a byte-free ref the pipeline
   resolves: keep `{ s3Key, mediaType }`, **remove `base64`** (or keep `base64?` transitional). The byte form
   passed to `classifyImage` becomes a small local `{ mediaType, base64 }` built just-in-time. *(R-1)*
2. **`packages/pipeline/src/media/derivatives.ts:15-20,43-60` — drop `visionJpeg`.** `DerivativeSet` =
   `{visionKey, thumbKey}`; stop returning bytes; remove the `visionJpeg` from `index.ts:4` export shape.
   *(R-14)*
3. **`packages/pipeline/src/run.ts:30-39,54-62,176-189`** — (a) `PipelinePhoto` carries `visionKey?` instead
   of `vision?: VisionImage{base64}`; (b) `runPipeline` gains access to the `MediaStore` + optional
   `classifyCache` — **thread via `StepContext`** (add `media: MediaStore` and `classifyCache?` to
   `StepContext` in `steps/context.ts:19-24`) so the segment steps that already take `ctx` need no new param,
   and `run.ts` reads `ctx.media`/`ctx.classifyCache`; (c) replace the serial loop with the cache-first
   `mapWithConcurrency` pass (§5 step 3). Keep the index→photo `Map` lookups at `run.ts:219-228` (already
   tolerate hallucinated markers by lookup, not position). *(R-2, R-5, R-6, R-8)*
3b. **Concurrency constant:** `CLASSIFY_CONCURRENCY` (env-overridable, default **8** — founder directive, §2.4) read in `run.ts` (or
   passed on `StepContext`). No config-nobody-sets — the default is the value. *(R-3, §2.4)*
4. **`packages/pipeline/src/steps/classify.ts:25-39,46-57`** — `classifyImage` takes the byte form
   `{mediaType, base64}` (unchanged internally); the caller (`run.ts`) now supplies it from the lazily-loaded
   bytes. The LLM port (`ports.ts:21-24`) and adapter (`content.ts:14`) are **unchanged**. *(R-2)*
5. **`packages/bot/src/app/pipelineV2Sweep.ts:182-212,242-249`** — (a) replace the unbounded build
   `Promise.all` with `mapWithConcurrency(attachments, K=2, buildDerivatives)`; (b) return photo refs
   `{index, s3Key, thumbKey, visionKey}` (no base64); (c) **delete** the `markers` array (`:206-212`) and
   derive `[IMG n]` markers from the photo refs; (d) thread `media: deps.media` + `classifyCache` onto the
   `StepContext` built at `:224`. *(R-13, R-14)*
6. **`packages/bot/src/lambda/sweep.ts:42-66`** — add `sharp.cache(false)` + `sharp.concurrency(1)` at the
   pipeline-bundle module init (or in `derivatives.ts` module scope so it ships with the pipeline that owns
   sharp). Wire `classifyCache` (Step B) into `createPipelineV2Port`. *(R-4)*
7. **`infra/src/lambdas.ts:281-290`** — add `UV_THREADPOOL_SIZE` to the sweep env (value per target memory,
   Q4). **After** staging proves bounded `MaxMemoryUsed`: lower `memorySize` 1024→512 (Q4) and adjust the
   timeout per the chunking work (CR-13). Re-verify `naming.ts:37` budget (unchanged; reserved=3). *(R-12)*
8. **Tests:** rewrite `pipelineV2Sweep.test.ts:279-315` to the ref shape + fake `MediaStore`/`classifyCache`;
   update `pipeline.test.ts`/`live.e2e.test.ts` to inject a fake `MediaStore` on `StepContext` (they pass
   `photos:[{index,s3Key}]` already — add `visionKey` to exercise classify, or keep imageless); **delete**
   `derivatives.test.ts:51-55` (visionJpeg gone). Add the §8 biting tests.

**Cross-interactions:**
- **Cache (Step B / E4):** §6 pre-req. Warm path skips GET+sharp(already-built)+LLM+base64 (R-8); eager write
  per image (independent of run success). The classify cache verdict is the FULL `ClassifyResult` (kind/label/
  ocrText/chanote/deedNo/lowConfidence) so `deedNoFrom`/`classifyToMediaKind` (`run.ts:50-52,92-97`) work
  identically on a warm hit.
- **Trace store (E8 / CR-5):** concurrent classify ⇒ concurrent best-effort trace writes at the
  `AnthropicStepLlm` chokepoint. **Hand-off note to the CR-5 owner:** the raw-I/O S3 key
  `traces/<conv>/<run>/<step>.json` must include a per-call ordinal (e.g. `…/classify-<i>.json`) so concurrent
  classify traces don't overwrite. No change here; flag only. *(R-10)*
- **Chunking (Step A / CR-2):** this rewrite makes chunking a time-only backstop, not a memory fix; chunk
  image-cap can grow or chunking can defer. CR-2's "A-dedup before chunking" ordering is unaffected. *(R-11)*
- **Write-idempotency (E10 / CR-4):** independent; the persist path (`run.ts:248`) is untouched here. The
  eager cache write is its own idempotent set (last-write-wins; `s3Key` bytes are immutable so the verdict is
  permanently valid — group-b Q "cache invalidation").
- **Pool (max:2):** parallelism is classify-only; the segment/DB loop stays serial (R-9).

**Caller migrations (the full list, R-1):** `pipelineV2Sweep.ts:190-194` (DELETE base64 ctor) · `:182-204`
(K-bounded build, refs) · `:206-212` (DELETE markers) · `:242-249` (thread media/cache) · `run.ts:30-39`
(PipelinePhoto) · `:54-62` (PipelineInput) · `:176-189` (windowed pass) · `steps.ts:19-25` (VisionImage) ·
`context.ts:19-24` (StepContext gains media/cache/C) · `derivatives.ts:15-20,59` (drop visionJpeg) ·
`index.ts:4` (DerivativeSet shape) · tests per §6.8. **Eval/thumb/DB schema: NO migration** (§2.2).

**Estimated net-LOC delta:** roughly **−40 to −60 LOC** net (delete: base64 materialisation block ~12,
`markers` array ~7, `visionJpeg` field+return+test ~10, the serial loop ~4; add: the windowed cache-first
function ~20, the K-bounded build wrap ~3, sharp tuning ~2, `StepContext` fields ~3). Conceptual complexity
drops: 4 moving parts (serial loop + unbounded build + markers array + base64 plumbing) → 1 windowed
cache-first function over photo refs.

---

## 7. Cost model (rigorous before/after; timeout ≠ cost corrected)

**The correction (R-12):** the 900 s Lambda **ceiling is NOT billed.** Lambda bills **GB-ms of ACTUAL
duration**. So "we raised the timeout to 900 s" cost us **nothing by itself**; what costs is (i) the memory
TIER (GB-ms rate ∝ memory: 1024 MB bills 2× the GB-ms-rate of 512 MB), (ii) the ACTUAL wall-clock, (iii) on
warm runs, repeated LLM tokens + S3 GETs + sharp CPU. **Bounded-parallel does NOT reduce LLM token cost** —
same number of classify calls, same tokens — it only cuts wall-clock. The token savings come ONLY from the
cache (warm runs) and (later, optional) the Batch API 50% lever.

Assumptions: classify ≈ 1,600 in + ~300 out tokens (typical, not max); Haiku 4.5 $1/$5 per MTok
(`cost.ts:23`) ⇒ ≈ **$0.0031/classify**. Serial latency ~1.2 s/call. C=8. Lambda arm64 GB-ms ≈ $0.0000133/GB-s.

**59-image case:**

| | Before (serial, 1024 MB, no cache) | After cold (C=8, 512 MB, cache miss) | After warm (cache hit) |
|---|---|---|---|
| Classify wall-clock | ~59 × 1.2 ≈ **71 s** | ~⌈59/8⌉ × 1.2 ≈ **~10 s** (sharp gate negligible vs network) | **~0 s** (cache reads) |
| Classify LLM $ | 59 × $0.0031 ≈ **$0.18** | **$0.18** (same calls — parallelism ≠ cheaper) | **$0** |
| S3 GET + sharp | 59 GET + 118 resize (every retry) | 59 GET + 118 resize (once) | **0** (skip build+GET on hit) |
| Peak memory | ~all 59 base64 (~30 MB) + sharp + segments → 1024 MB tier | O(C=8) bytes (~3 MB) → fits **512 MB** | trivial |
| Run GB-ms ($) at full-run ~88 s | 88 s × 1.0 GB × $13.3e-6 ≈ **$0.00117** | ~35 s × 0.5 GB × $13.3e-6 ≈ **$0.00023** | ~10 s × 0.5 GB ≈ **$0.00007** |
| **Total / run** | **~$0.18 + $0.0012 ≈ $0.18** | **~$0.18 + $0.0002 ≈ $0.18** | **~$0.0001** |

**200-image case (stress):** before — serial ~240 s classify (**would time out even at 900 s if combined
with extract/escalation tail**) and ~$0.62 tokens + ~30 MB×3.4 base64 likely OOM at 1024 MB. After cold —
~⌈200/8⌉×1.2 ≈ **30 s** classify, $0.62 tokens, memory bounded O(8) ⇒ fits 512 MB, run completes. After warm
— **~$0.0002.**

**Verdict (the honest cost story):**
- **Compute (GB-ms) savings: real and roughly 4× per run** — from (1) **halving the memory rate** (1024→512
  MB, enabled because peak memory is now O(window) not O(#images)) and (2) **shorter wall-clock** from
  parallelism (~71 s → ~18 s classify). On the 59-image run, GB-ms cost ≈ **$0.0012 → ~$0.0002**.
- **LLM token savings: $0 on a cold run** (same calls) — but the **cache makes warm/retry runs ~free**
  ($0.18 → $0). The incident's *real* waste was paying $0.18 of tokens on **every one of 3-4 retries**
  (group-b RC-3); the cache + parallelism (so it doesn't time out → no retries) eliminates that. That is the
  dominant dollar win, and it is a CACHE+RESILIENCE win, not a parallelism win.
- **The compute dollars are small in absolute terms** (sub-cent/run); the founder-meaningful wins are
  **(1) it stops timing out** (so retries — and their repeated $0.18 token bills — vanish), and **(2) it lets
  us run at 512 MB**, halving the GB-ms rate for every sweep, not just image ones. The cache is the token
  lever; parallelism + reference-bytes are the wall-clock + memory levers.
- **NOT a saving:** parallelism does not reduce token spend; don't claim it. Batch-API (50%) is the only
  token-$ lever beyond the cache, and it's deferred (§9).

---

## 8. Test plan (biting tests — break the feature → red)

House style: Docker-PG (`startPostgresLocal`, `@line-robot/db/testing`) + `FakeStepLlm` (records `requests`,
`pipeline.test.ts:8,50`) + a fake `MediaStore` (pattern `derivatives.test.ts:14-24`) + a fake
`classifyCache`. New tests in `packages/pipeline/test/integration/` (or a focused `run.classify.test.ts`).

- **test-a — concurrency never exceeds the cap.** Fake `StepLlm` whose `run` increments a live counter,
  records `maxInFlight`, awaits a small delay, decrements. Feed N=20 photos with `visionKey`, C=8. Assert
  `maxInFlight <= 8` AND `>= 2` (proves it actually parallelised, not serial). Break: set C above the cap or revert to
  the serial loop → `maxInFlight` = 1 or 20 → red.
- **test-b — bytes held ≤ window.** Fake `MediaStore.getOriginal` increments a live-buffer counter on entry,
  decrements when the returned bytes go out of scope is not directly observable — instead track
  `maxConcurrentGetOriginal` (enter/exit around the classify await). Assert `<= C`. Break: pre-materialise all
  bytes (old design) → all N loaded up front → counter = N → red. (Also asserts `getOriginal` called with the
  **visionKey**, never the original key — never re-downloads the full-res original.)
- **test-c — index↔result alignment preserved.** Photos with distinct `visionKey`s; fake `StepLlm` returns a
  verdict whose `label` encodes the image identity; have the fake resolve OUT of order (later indices first
  via staggered delays). Assert each persisted media row's `kind`/the segment's `deedNo` binds to the RIGHT
  image. Break: replace `mapWithConcurrency` with a naive `Promise.all` that doesn't index results → mis-bind
  → red. *(R-5)*
- **test-d — per-image error isolation.** One photo's `getOriginal` (or its classify) throws; the rest
  succeed. Assert: no exception escapes `runPipeline`, the failing image persists as a plain unclassified
  media row (kind=photo), the other images classify normally, and the batch produces listings. Break: drop
  the per-unit try/catch → `Promise.all` rejects → run fails → red. *(R-6)*
- **test-e — cache hit ⇒ zero MediaStore load + zero LLM call.** Pre-seed the fake `classifyCache` with a
  verdict for every `s3Key`. Run. Assert `mediaStore.getOriginal` call-count = 0 AND `fakeLlm.requests`
  filtered to `step==="classify"` = 0, yet the listing persists with the cached kind/deedNo. Break: skip the
  cache lookup → GET+LLM fire → counts non-zero → red. *(R-8c)*
- **test-f — cold classify count = #images, warm = 0; eager write.** Cold run (empty cache): assert classify
  request-count = #images-with-visionKey AND the cache now holds a verdict per `s3Key` (eager write happened).
  Then a 2nd run reusing the same cache: assert classify count = 0. Additionally: simulate a mid-run failure
  AFTER the first image classifies (throw in a later step) and assert the first image's verdict was already
  persisted to the cache (warm on the next attempt). Break: move the `put` to after the whole run / inside a
  success-only branch → mid-run failure leaves cache cold → 2nd-attempt classify count > 0 → red. *(R-8)*
- **test-g (regression) — thumb path unbroken.** Existing `pipeline.test.ts` media-row assertion
  (`media_rows:1`, `thumbKey` persisted) stays green with the new ref shape. *(R-13)*
- **Eval:** no new `EvalCase` row (eval doesn't exercise classify, §2.2); the call-count/throughput tests
  above are the biting net, per group-b §5 "Eval cases" reality check.

---

## 9. Open questions / founder decisions

- **Q1 — Account rate-limit TIER (the only remaining unknown).** The per-tier table is now cached & cited
  (`docs/platform.claude.com/docs/en/api/rate-limits.md`, §2.4); what's unconfirmed is *which tier* this
  account holds. Read it from the Console → Limits page or the `x-ratelimit-limit-*` response headers.
  Recommend **C=8** (founder directive) at tier-2+; at tier-1 the bucket caps throughput regardless of C, so
  keep C=8 (backoff governs, zero loss) or drop to ~4 to cut 429 churn. `CLASSIFY_CONCURRENCY` is
  env-overridable — retune with no redeploy.
- **Q2 — Rely on SDK 429 backoff vs add an explicit limiter?** Recommend **SDK backoff only** (verified:
  honors `retry-after`/`retry-after-ms`, 2 retries, exp backoff + jitter, `client.js:704-740`). No `p-limit`
  (`mapWithConcurrency` already bounds + orders; rule 1). Revisit only if staging shows sustained 429s.
- **Q3 — Lazy-in-sweep (recommended now) vs ingest-time preprocess E4(a) (deferred).** Recommend lazy now;
  the `s3Key` cache is the clean hand-off seam to E4(a) later (§4 Option D, §10).
- **Q4 — Target memory tier + UV_THREADPOOL_SIZE.** Recommend lowering 1024→**512 MB** AFTER staging
  CloudWatch `MaxMemoryUsed` confirms O(window) peak on a 59-image dump (sub-agent MB figures are estimates);
  `UV_THREADPOOL_SIZE`=2 at 512 MB, 3-4 at 1024 MB. Founder/ops confirm after the staging read.
- **Q5 — Keep or drop chunking (Step A) given R-11?** Recommend **keep A** for watermark-progress + poison
  isolation, but **grow its image cap** (or defer it) since this rewrite removes the memory/timeout pressure
  that made it load-bearing. (Does not change CR-2 ordering.)
- **Q6 — `VisionImage.base64` removal: hard-remove vs transitional `base64?`.** Recommend hard-remove in the
  same increment (the only constructor is deleted; transitional optionality just invites drift).

---

## 10. Cross-group dependencies + Out of scope

**Cross-group / cross-increment dependencies (flag, don't resolve here):**
- **Step B classify cache (E4)** — this rewrite *consumes* it (§6 pre-req). Land Step B first; if absent, the
  cache params are `undefined` and the path degrades to cold-every-time (correct, not warm-fast). (CR / group-b
  §3 Option B.)
- **CR-1 (`pipelineV2Sweep.ts` editor sequence A→B→D).** This rewrite is part of B's `pipelineV2Sweep.ts`
  edit; it must land AFTER Group A's geo-bind touch and be rebased on it. No parallel edits to that file.
- **CR-5 (E8 trace store).** Concurrent classify ⇒ concurrent trace writes. Hand-off note: per-call ordinal
  in the trace S3 key so concurrent classify traces don't collide (R-10). Built alongside, not here.
- **CR-2 (A before chunking).** Unaffected; this rewrite makes chunking a time-only backstop (R-11).
- **CR-4 (E10 write-idempotency).** Independent; persist path untouched. The eager cache write is its own
  idempotent set (immutable `s3Key` bytes ⇒ permanently-valid verdict).
- **Group A geo-bind / conservative-merge.** Operates on extract/dedup, downstream of this image stage —
  no interaction beyond the shared file (CR-1).

**Out of scope / deferred:**
- **Ingest-time preprocess (E4(a), Option D)** — moves classify off the hot path entirely; processor-path,
  Group-D-adjacent. Deferred; the `s3Key` cache is the hand-off seam (§4, Q3).
- **Anthropic Batch API (50% token lever, group-b Option D)** — the only token-$ lever beyond the cache;
  reshapes the sweep to async; deferred, pairs with E4(a) (group-b §8).
- **Image `cache_control`** — net-negative (Haiku 4.5 4096-tok minimum vs ~1600-tok image silently won't
  cache, §2.4); not pursued (group-b §8).
- **Chunking + watermark-per-chunk (Step A), smarter failure signal (Step C), the E8 trace store, E10
  idempotency** — separate Phase-3 increments (`00-CONSOLIDATED §4`); only non-interference confirmed here.
- **Lowering the Lambda timeout** — owned by the chunking work (CR-13); this rewrite removes the pressure.
- **Dedup correctness (A), DM-claimable (D), eval instrumentation (C).** Other groups.

<!-- RPI: R+P COMPLETE -->
