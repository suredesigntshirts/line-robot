# Plan 23 — Group B: Performance & resilience (timeouts, chunking, image caching, failure-flagging) — Research + Plan (RPI)
> Status: R+P COMPLETE · Source: plans/23-ingestion-pipeline-audit.md (Group B) · Phase: Research+Plan ONLY (no implementation)

## 1. Problem & scope

A real user dumped **76 messages = 59 images + 17 text** (70 inbound) into a 1:1 DM to seed their
account (founder: *"This is a standard use case… The line bot needs to be able to handle this."*).
The sweep handed the **whole backlog to `v2.run` in one call**; extraction **timed out at the 180 s
Lambda limit on every attempt**; because `ingestAttempts` bumps at *claim* time, 3 timeouts →
**abandon (attempt 4) + an apology push, no listings**. The mitigation (raise the sweep Lambda to
900 s / 1024 MB) cleared it in ~88 s of work (`ingested:1 messages:76 properties:5`, est $0.46,
prompt-cache hit) — a band-aid, not a fix.

Group B owns **performance & resilience** (founder items 3 & 4) + the two cross-cutting inputs E4
(preprocess images once at ingest, persist keyed by `s3Key`) and E9 (size-aware backpressure: chunk
deliberately rather than discover the limit by timing out). Concretely:
1. **Timeouts on quick-succession dumps** — one oversized batch ⇒ one long unbounded run.
2. **Re-processing waste** — the watermark advances only on full success; every retry re-does the
   full batch (including all 59 image classifications), guaranteeing the retry is as slow as the
   first try and times out the same way.
3. **No image-preprocess cache** — `classifyImage` re-runs per image on every attempt; only
   `media_kind` survives, the classification is otherwise discarded.
4. **Blind failure-flagging** — a timeout is indistinguishable from a genuine failure; the retry
   re-runs the identical oversized batch instead of making partial progress or triaging it.

**Out of scope (flag-only):** the dedup-collapse data-loss bug (Group A), eval/replay infra and
per-step tracing (Group C), DM/group unification (Group D). Write-idempotency (E10) touches A/D.

**Anti-over-engineering bar (root `CLAUDE.md`):** no interface until the 2nd impl; ports only at real
seams (LLM/DB/LINE); no one-caller abstractions; no config nobody sets; smallest thing that works;
the deliverable is code a human reads without a guide. The Postgres pool is `max:2` per Lambda
execution and `SWEEP_RESERVED_CONCURRENCY=3` is budgeted at preview time (`infra/src/naming.ts:29-42`,
`Σ(reservedConcurrency × 2) ≤ 60`); any change must keep us inside that budget.

## 2. Research findings

### 2.1 Root cause(s) — verified with evidence (file:line)

**RC-1 — Unbounded batch: the whole backlog goes to one `v2.run` call (CONFIRMED).**
`IngestionSweep.ingestOne` claims a conversation, then `batch = findSince(key, lastIngestedAt)`
returns *every* un-ingested message and passes the lot to `this.deps.v2.run(key, batch)` in one call
(`packages/bot/src/app/ingestionSweep.ts:169-174`). There is **no chunking / message cap** — the
only cap (`maxConversations`, default 25, `ingestionSweep.ts:56,79`) bounds *how many conversations*
per sweep, not the size of any one conversation's batch. `findSince` itself reads `pages: "all"`
(`messageRepository.ts:135`), so it never self-limits. One conversation = one unbounded run.

**RC-2 — Watermark advances only on full success, so a retry repeats the entire batch (CONFIRMED).**
The watermark (`watermark = batch.reduce(max timestamp)`, `ingestionSweep.ts:170`) is only committed
by `releaseConversation`, which runs **after** `v2.run` returns (`ingestionSweep.ts:174-179`). On any
throw — including a Lambda timeout — `releaseConversation` never runs and the catch block deliberately
leaves the claim in place (`ingestionSweep.ts:122-131`: *"the watermark must not advance past
un-ingested messages"*). The next sweep re-claims and re-runs the **identical** batch. Combined with
RC-3, a retry is exactly as expensive as the first try → it times out again → repeat.

**RC-3 — Image classification re-runs per image on every attempt and is discarded (CONFIRMED; this is
the cost driver).** `runPipeline` step 1 loops every photo and calls `classifyImage`
(`packages/pipeline/src/run.ts:182-185`); `classifyImage` makes 1 Haiku call per image and escalates
to Sonnet on a low-confidence chanote (`packages/pipeline/src/steps/classify.ts:46-57`). The result
is used to build `[IMG n]` transcript markers + decide `deedNo`/`media_kind`, then **thrown away** —
only `classifyToMediaKind(...) → media_kind` persists on `listing_media`
(`run.ts:50-52,165-170,223-228`; the discard is acknowledged in the audit). There is **no `s3Key`
cache**: a re-sweep rebuilds the 1568px derivative (`pipelineV2Sweep.ts:182-204` →
`media/derivatives.ts:44-60`, an S3 GET + two `sharp` resizes per photo) **and** re-classifies from
scratch. Note: `buildDerivatives` is keyed by a hash of the original `s3Key` and writes idempotently
(`derivatives.ts:22-29`), so the *derivative bytes* are stable across re-sweeps — but the
*classification LLM call* is not cached anywhere.

**RC-4 — `ingestAttempts` bumps at claim time, so a timeout counts toward give-up (CONFIRMED).**
`claimConversation` commits `ADD ingestAttempts :one` atomically *before* any extraction
(`packages/bot/src/adapters/dynamodb/catalogRepository.ts:148`, comment at :146-147 says this is
deliberate so a crash/timeout still counts). The give-up gate (`attempts > maxAttempts`, default 3)
abandons → `failConversation` + apology push **without extracting**
(`ingestionSweep.ts:154-167,211-225`, cap `DEFAULT_MAX_INGEST_ATTEMPTS=3` at :62). So three timeouts
on an oversized batch burn the budget and the user gets an apology with zero listings — exactly the
incident. There is **no "too big / timed out" signal**: abandon treats a size-driven timeout
identically to a genuinely-unprocessable batch, and nothing makes the next attempt *smaller*.

**Why a quick-succession dump times out, and why the retry guarantees a repeat timeout:** a
59-image dump needs ~59 sequential classify calls (the dominant term, §2.2) on top of segment +
per-segment extract/dedup/translate/gate; at ~1–1.5 s/call serialized that is well past 180 s.
Because the watermark didn't advance (RC-2) and nothing is cached (RC-3), the retry re-runs all 59
classifications → same wall-clock → same timeout → abandon (RC-4). The 900 s bump only moves the
cliff; a larger dump (or a slower model day) hits it again.

**Stale invariant exposed by the band-aid (worth flagging):** `infra/src/naming.ts:31` still says
*"rate(2 min) × 180s ⇒ ≤2 natural overlaps; 3 = headroom"*, but the timeout is now **900 s**. A
single conversation can now run for 15 min, during which ~7–8 cron ticks fire; the
`staleTimeoutMs` (5 min, `ingestionSweep.ts:57`) means a later sweep can treat a still-running 900 s
claim as "crashed" and **double-claim it** (`claimConversation` condition `claimedAt < :staleBefore`,
`catalogRepository.ts:149-150`). With `SWEEP_RESERVED_CONCURRENCY=3` and `pool max:2` that is bounded
(≤6 connections), but it means concurrent duplicate extraction of the same oversized batch — wasted
spend and a Group-A-adjacent double-write risk. **Chunking lets the timeout come back down to where
this invariant holds again.**

### 2.2 Verified code-path map

| Concern | File:line | Verified note |
|---|---|---|
| Sweep batch = whole backlog, one `v2.run`, no chunk | `packages/bot/src/app/ingestionSweep.ts:169-174` | `findSince(key, lastIngestedAt)` → `v2.run(key, batch)` |
| Watermark only advances on success (release after run) | `ingestionSweep.ts:170,174-179`; catch leaves claim `:122-131` | throw/timeout ⇒ no release ⇒ full re-run |
| Per-conversation cap is conversation-count only | `ingestionSweep.ts:56,79` (`maxConversations`=25) | no per-batch message/image cap anywhere |
| `findSince` reads all pages | `messageRepository.ts:129-139` (`pages:"all"`) | never self-limits the batch |
| Claim bumps attempts at claim time | `catalogRepository.ts:148` (`ADD ingestAttempts :one`) | timeout counts toward give-up (deliberate, :146-147) |
| Give-up → abandon + apology (no extract) | `ingestionSweep.ts:154-167,211-225`; cap `:62` | size-timeout treated as genuine failure |
| Watermark/release semantics (already chunk-friendly) | `catalogRepository.ts:170-212` | sets `lastIngestedAt=:wm`; "new message arrived" branch resets attempts to 0 + keeps it in GSI1 |
| Per-image classify (the cost driver), no `s3Key` cache | `pipeline/src/steps/classify.ts:46-57`; loop `run.ts:182-185` | Haiku +Sonnet-escalate per image |
| Classification discarded; only `media_kind` persists | `run.ts:50-52,165-170,223-228` | kind/label/OCR/deedNo dropped after use |
| Derivative build (S3 GET + 2× sharp), idempotent key | `pipeline/src/media/derivatives.ts:22-29,44-60` | bytes stable per `s3Key`; LLM call is not |
| Per-step models | `pipeline/src/steps/context.ts:8-17` | classify=Haiku, segment/extract/gate=Sonnet, extract-escalate=Opus, dedup/translate=Haiku |
| Prompt caching = **system prefix only** | `pipeline/src/adapters/anthropicStepLlm.ts:28` | `cache_control:{ephemeral}` on `system`; image is in user `content` → not in the cached prefix |
| Cost logging (no per-step timing) | `pipeline/src/cost.ts:21-67` | `estimateCostUsd`/`totalUsd`/`sawCacheHit`; `mode:"sync"\|"batch"`, batch=½ price |
| Batch transport **built but unwired on the hot path** | `pipeline/src/batch/build.ts`, `batch/collect.ts`; sweep uses `mode:"sync"` `pipelineV2Sweep.ts:224` | `submitBatch`/`collectBatch` exist; `runPipeline` never calls them |
| Lambda timeout/memory (band-aid) | `infra/src/lambdas.ts:269,274` (900 s) `:280` (1024 MB) | comment at :262-268 already names per-batch chunking as the real fix |
| Pool/concurrency budget | `infra/src/naming.ts:29-42`; `packages/db/src/pool.ts:24` (`max:2`) | `Σ(reserved×2) ≤ 60`; sweep reserved=3 |
| Tracker status enum (extension point) | `packages/bot/src/core/domain/catalog.ts:107-125` | `"IDLE"\|"INGESTING"\|"FAILED"` + optional `ingestAttempts` |
| Eval runner **does not exercise classify** | `pipeline/src/eval/runner.ts:25-31` | *"classify needs image fixtures and stays n/a for now"* |

### 2.3 Data / replay evidence (staging, read-only)

- **Incident conversation (`user#U810f7671d201fe7ce3ec2ef49ab8d16a`) — confirmed via DynamoDB
  `linerobot-staging-messages`** (pk `$linerobot#conversationKey_user#U810f…`, read-only Query, no
  mutation): **76 items = 59 image attachments (`image/jpeg`) + 17 text; 70 inbound / 6 outbound.**
  This pins the open-evidence item: **a 59-image dump.**
- **LLM call-count model for the incident (M=59 images, N=5 segments, K≈1–5 persisted):**
  classify ≈ M (59, Haiku, +Sonnet on low-conf chanote) · segment 1 (Sonnet) · extract N=5 (Sonnet,
  +Opus on low-conf) · dedup-verify ≤K (Haiku) · translate K (Haiku) · gate K (Sonnet). **Classify
  is ~59 of ~70+ total calls ≈ 80–85% of all inference and essentially all of the per-image S3 GET +
  sharp work** — it dominates a photo-heavy dump, exactly as the audit predicted. The successful run
  was est **$0.46** with a prompt-cache hit; the cache hit is on the *system* prefix only
  (anthropicStepLlm.ts:28), so the 59 image-token inputs were paid in full and would be **re-paid on
  every retry** — that is the waste founder note 3/4 calls out.
- **Postgres catalog** (`dbConnectionString` retrievable via Pulumi; not queried to avoid load):
  schema on disk confirms **no classification/OCR cache exists** — `listing_media`
  (`packages/db/src/schema.ts:365-377`) stores `s3_key`, `thumb_key`, `kind` (media_kind),
  `hero_index`, `is_render`; the only OCR-derived field anywhere is `deed_no` on the listing
  (`schema.ts:231`). Nothing persists the per-image classify verdict keyed by `s3Key`.
- **Planned (cheap, deterministic) replay for the implementation phase:** drive the 76-message batch
  through the **local Docker-PG harness** (`@line-robot/db/testing`) + a **fake `StepLlm`** that
  records call counts per step and a fake `MediaStore` — assert classify-call count = #images on a
  cold run and = 0 on a warm (cached) re-run. This needs **no paid API** and no staging writes; it is
  the biting test for the caching fix (§5).

### 2.4 Best-practice survey (cited)

Docs-first: there is **no `claude-api` entry in `docs/llms.txt`** (checked); I used the bundled
**`claude-api` skill reference** (cached 2026-06-04) for all Anthropic facts below rather than
guessing.

- **Bounded / chunked batch processing + watermark-per-chunk.** Standard backpressure: cap the unit
  of work so a single run is bounded and each run makes durable forward progress. Our tracker already
  supports it — `releaseConversation` advances `lastIngestedAt` to *any* watermark and its
  "new-message-arrived" branch keeps the conversation in GSI1 and **resets `ingestAttempts` to 0**
  (`catalogRepository.ts:199-211`); a chunk that advances the watermark and re-arms GSI1 is the same
  shape. This is the canonical fix for RC-1/RC-2 and lets the 900 s timeout come back down.
- **Content-addressed / step-level idempotency caching.** The dominant cost (classify) is a pure
  function of the image bytes. Cache the verdict keyed by a stable id of the original — the
  derivative layer already does exactly this for bytes (`sha256(originalKey)`,
  `derivatives.ts:26-29`); extend the same idea to the classify *verdict*. A warm re-run becomes a
  cache read, not a recompute (fixes RC-3 → makes retries cheap → breaks the repeat-timeout loop).
- **Decouple expensive preprocessing from the hot path (E4).** Move classify+OCR off the timeout-
  bounded sweep. Two placements: (a) at ingest/processor time when the image first arrives; (b)
  lazily on first sweep but **persisted** so it never repeats. (b) is strictly smaller (no processor
  changes, no new IAM/queue) and captures ~all of the retry win; (a) additionally removes it from the
  hot path entirely but is a bigger change (Group-D-adjacent: the processor path).
- **Anthropic prompt caching — applicability is limited here (cited: claude-api skill →
  `shared/prompt-caching.md`).** Caching is a **prefix match** over `tools → system → messages`; our
  image lives in the user `content` *after* the cached `system` block, so it is not cached today. You
  *could* add a `cache_control` breakpoint covering the image, but (i) the cacheable-prefix minimum is
  ~2048 tokens (Haiku 4.5: **4096**) and an image is ~1600 tokens — it may **silently not cache**;
  (ii) caching only helps when the **same** image is re-sent within the 5-min TTL, which is precisely
  the retry case — but a persisted `s3Key` cache solves the retry case *and* the cross-sweep case
  *and* survives the 5-min TTL, at $0 marginal token cost. **Verdict: an out-of-band classify cache
  dominates prompt-caching for this workload; don't add image cache_control.**
- **Anthropic Message Batches API economics (cited: claude-api skill → batches.md + pricing).** Batch
  = **50% of list price**, up to 100K requests/256 MB, most complete <1 h (max 24 h). The transport
  is **already built and unwired** (`batch/build.ts`, `batch/collect.ts`; `cost.ts:36-37` halves the
  price for `mode:"batch"`). For the *passive* sweep, submitting the 59 classify calls as one batch
  would halve their cost and parallelize them — but it trades latency (minutes) for cost, changes the
  sweep from synchronous to submit-then-poll, and `collectBatch` polls at 60 s intervals
  (`collect.ts:49`) which doesn't fit a 900 s Lambda. **Batch is a cost lever, not a timeout fix**;
  it's an optional later layer once classify is off the hot path (it pairs naturally with E4(a)).
- **Poison-message / DLQ + failure triage.** Distinguish retryable-transient from
  too-big/poison. The SQS path already has a DLQ (`naming.ts:24-27`), but the *sweep* is cron-driven,
  not queue-driven — its "DLQ" is the `FAILED` terminal status (`catalogRepository.ts:214-228`). The
  best-practice move is to make the failure signal *actionable*: a size-timeout should down-shift the
  chunk size / mark for smaller reprocessing rather than abandon, and a genuinely-unprocessable batch
  should land somewhere inspectable (feeds Group C's eval-capture loop — flag-only).
- **Model fit (cited: claude-api skill → models.md/pricing):** classify=`claude-haiku-4-5`
  ($1/$5/MTok, $0.10 cache-read) is already the cheapest tier — correct for a high-volume per-image
  step; the lever is *call count* (cache) and *transport* (batch), not the model.

## 3. Solution options

All options share the same north star: **no single sweep run approaches the timeout, and a retry is
cheap (a cache read), not a full recompute.** They compose; the trade-off is how much to do now.

### Option A — Chunk the batch + advance watermark per chunk (the resilience fix)
**Approach.** Cap one `ingestOne` to the first *C* images (and/or *M* messages) of the un-ingested
backlog (cold default e.g. **C=12 images**, env-overridable, validated by the replay test). Set the
watermark to that slice's max timestamp, `releaseConversation` (which keeps the conversation in GSI1
and re-arms it), and **reset attempts on a successful chunk** so forward progress refreshes the
budget. Each 2-min tick drains the next chunk; a 59-image dump clears over ~5 ticks, each well under
the timeout. Lower `infra/src/lambdas.ts:269` back toward ~300 s once chunking lands (restores the
`naming.ts:31` overlap invariant).
- **Effort:** Medium. Touches `ingestionSweep.ts` (slice + per-chunk watermark + attempt reset) and a
  small tracker tweak; reuses existing release semantics.
- **Risk/blast-radius:** Medium. Core ingest path; but the watermark/no-loss contract is already
  unit-tested and the release "new-message" branch already does the keep-in-GSI1 + reset-attempts
  move. Must preserve no-loss/no-duplicate. Pool budget unaffected (shorter runs hold the connection
  *less*, strictly better).
- **Alignment:** High. Smallest thing that fixes RC-1/RC-2; uses the seam that exists; no new port.
- **Why / why-not:** Directly answers founder note 4 and lets the 900 s band-aid retract. Does **not**
  on its own remove the per-image waste — a chunk that fails still re-runs that chunk's classifies
  (RC-3 unaddressed within a chunk). Best paired with B.

### Option B — Persist image classification keyed by `s3Key` (the waste fix, E4)
**Approach.** Before `classifyImage`, look up a persisted verdict by `s3Key`; on miss, classify and
**persist the full verdict** (kind/label/ocrText/chanote/deedNo/lowConfidence). A re-sweep (or a
later chunk that re-touches a photo) is a cache hit → zero classify calls on warm paths. Storage
options (pick one — see §6): **(B1) DynamoDB attribute on the existing message item** (the message
already carries `attachment.s3Key`; co-located, no new table, no new IAM — the sweep already reads
these rows); **(B2) S3 sidecar** `derivatives/<hash>-classify.json` (reuses the derivative key scheme
+ existing `MediaStore` seam); **(B3) a Postgres `image_classification` table** (domain-enum-first per
`packages/db/CLAUDE.md`; most queryable, heaviest).
- **Effort:** Medium (B1/B2) / Medium-High (B3 — migration).
- **Risk/blast-radius:** Low-Medium. Additive read-through cache; a miss falls back to today's
  behavior. Hexagonal: the cache belongs behind a port only if it has a 2nd impl — with one store it
  is a plain function/typed read on an existing adapter (no premature interface, per the rules).
- **Alignment:** High. This is E4 and founder note 3 verbatim ("process an image once… cached… so it
  wouldn't need to be pre-processed upon a second run"). B1 reuses the message item the sweep already
  reads — the least new surface.
- **Why / why-not:** Removes the dominant cost from retries → a retry is fast → the repeat-timeout
  loop is broken even before chunking. Lazy-persist (cache on first sweep) is strictly smaller than
  preprocess-at-ingest and captures the whole retry win; full ingest-time preprocessing (moving it
  off the hot path entirely) is a larger Group-D-adjacent change — defer (§8).

### Option C — Smarter failure signal: down-shift on size-timeout, don't blind-retry (founder note 4)
**Approach.** Distinguish a size/timeout failure from a genuine one. Practically, with A in place this
largely *falls out*: a chunk is bounded so it rarely times out, and a successful chunk resets attempts
— so a stuck conversation only burns the budget on chunks that genuinely fail. Add the explicit
signal: on a run that fails *without* having advanced any watermark, **shrink the next chunk** (e.g.
halve C, floor 1) before re-claiming, and only abandon when even a **single-item chunk** fails the cap
(that is a genuine poison item, not a size problem). Surface abandoned/oversized conversations to a
triage marker (a tracker field or a row) that Group C can snapshot into an eval case — **flag-only
here, don't build Group C's capture.**
- **Effort:** Low-Medium on top of A (a per-conversation chunk-size hint + the abandon-only-at-size-1
  rule).
- **Risk:** Low. Conservative; abandon still exists as the ultimate backstop.
- **Alignment:** High. "If we are timing out, we should flag as such… we need to be smarter."
- **Why / why-not:** Closes note 4 properly (no blind re-run of the identical oversized batch). Adds a
  little tracker state; keep it minimal (no new status enum value unless a 2nd consumer appears).

### Option D — Batch-API the passive classify step (cost lever, optional/later)
**Approach.** Once classify is cacheable/off-hot-path, submit cold classifies via the **already-built**
batch transport (`submitBatch`/`collectBatch`) at 50% price, parallelized. Requires moving the sweep
from synchronous to submit-then-collect (or to ingest-time preprocessing, E4(a)).
- **Effort:** Medium-High (changes the sweep's control flow; `collectBatch` 60 s polling doesn't fit a
  short Lambda).
- **Risk/blast-radius:** Medium-High. Async reshaping of the hot path; new failure modes (expired/
  partial batch — already handled in `collect.ts:67-73`).
- **Alignment:** Medium. Real cost win and the transport exists, but it's a **cost** optimization, not
  the **timeout/resilience** fix the founder asked for; violates "smallest thing that works" if done
  now.
- **Why / why-not:** Defer. Best revisited with ingest-time preprocessing (§8), where async latency is
  free.

## 4. Recommended direction

**Ship A + B + C as one sequenced increment; defer D.**

- **B first (persist classify by `s3Key`, lazy read-through).** It is the highest-leverage, lowest-
  risk change: it removes ~80–85% of a photo-dump's inference from every *retry* (the evidence: 59 of
  ~70 calls), which alone breaks the repeat-timeout loop and answers founder note 3. Use **B1 (DynamoDB
  attribute on the message item)** — it reuses the row the sweep already reads, needs no new table/
  IAM/seam, and keeps the cache co-located with the `s3Key` it keys on. One store ⇒ no port/interface
  (anti-over-engineering rule 1).
- **A next (chunk + watermark-per-chunk).** With B making each photo cheap-on-repeat, A makes each
  *run* bounded so no single sweep approaches the timeout — the structural fix for RC-1/RC-2 — and
  lets us **lower `infra/src/lambdas.ts:269` back to ~300 s**, restoring the `naming.ts:31` overlap
  invariant. A reuses the existing per-chunk release semantics.
- **C as the thin failure-signal layer on A.** Down-shift the chunk on a no-progress failure; abandon
  only when a single-item chunk fails. Emit a triage marker for Group C (flag-only).

**Rationale.** This is the minimal combination that makes the *standard* dump robust: B kills the
waste (note 3), A kills the unbounded run + lets the timeout retract (note 4 structural), C makes the
failure smart (note 4 explicit). It stays inside the pool budget (shorter runs hold the connection
less), adds no new infra, and introduces no interface/port without a second implementation. Batch-API
(D) and full ingest-time preprocessing (E4(a)) are real but larger cost/latency levers — deferred with
a clear seam.

## 5. Implementation plan (NOT executed)

> Execute in a later phase, gated by `/increment-review` + (this being a backend-resilience change,
> not UI) `npm run typecheck` / `npm run lint` / `npm run test` / coverage, plus the new replay test.
> No `/frontend-review` (no UI surface).

### Step B — persist classify verdict keyed by `s3Key` (do first)
1. **Domain:** add a `ClassifyResult` cache shape if not already exported from `pipeline/src/steps.ts`
   (it is — reuse it). No new domain enum needed (B1/B2). *If B3 chosen instead:* add nothing to
   `mediaKind`; the cache reuses existing enums — but B3 still needs a migration (domain-enum-first
   per `packages/db/CLAUDE.md` only if a new enum is introduced; here none is).
2. **Port boundary (LLM/DB/S3 are the only real seams):** the classify cache is a read-through over an
   *existing* adapter, not a new seam — **do not add a `ClassifyCache` interface** (rule 1: no
   interface until a 2nd impl). Implement as:
   - **B1 (recommended):** extend the DynamoDB `message` entity (`messageRepository.ts:13-61`) with an
     optional `classification` map attribute (kind/label/ocrText/deedNo/lowConfidence) + a
     `findClassification(s3Key)` / `putClassification(s3Key, result)` pair; or store it on the same
     item the sweep already loads via `findSince` (so the verdict rides along with the batch — zero
     extra reads on the hot path). Thread a tiny `classifyCache?` into `PipelineV2Deps`
     (`pipelineV2Sweep.ts:110-122`) and into `runPipeline`'s photo loop.
3. **Pipeline wiring:** in `run.ts:182-185`, before `classifyImage`, check the cache by
   `photo.s3Key`; on hit, skip the LLM call and use the cached verdict; on miss, classify then persist.
   Keep `classifyImage` itself pure (it already is) — the cache lives in the caller, so the eval/unit
   harness can inject a fake.
4. **Files to touch:** `packages/bot/src/adapters/dynamodb/messageRepository.ts:13-61,129-139`
   (attribute + accessors), `packages/bot/src/app/pipelineV2Sweep.ts:110-122,182-204,242-249` (thread
   cache + populate on derivative build), `packages/pipeline/src/run.ts:181-185` (read-through),
   `packages/pipeline/src/steps.ts` (cache type re-export if needed). **No `infra` change** (B1 reuses
   the messages table + existing IAM).
5. **Tests:** unit test the read-through in `run.ts` with a fake `StepLlm` (assert classify-call count
   = #images cold, = 0 warm); unit test the DynamoDB accessor against DynamoDB-Local
   (`npm --prefix packages/bot run test:integration`).

### Step A — chunk + watermark-per-chunk
1. **`SweepOptions`** (`ingestionSweep.ts:22-29`): add `maxImagesPerChunk?` / `maxMessagesPerChunk?`
   with cold defaults (e.g. 12 images), env-overridable in `sweep.ts` (no config-nobody-sets — the
   default is the value).
2. **`ingestOne`** (`ingestionSweep.ts:169-187`): after `findSince`, **slice** the batch to the first
   chunk (count images via `attachment.contentType.startsWith("image/")`), pass only the slice to
   `v2.run`, set `watermark` to the **slice's** max timestamp, `releaseConversation`, and **if more
   un-ingested messages remain, keep the conversation pending** so the next tick continues. The
   existing release "new-message-arrived" branch (`catalogRepository.ts:199-211`) already keeps it in
   GSI1 + resets attempts; mirror that for "chunk-remainder" (a successful chunk = forward progress ⇒
   reset attempts to 0).
3. **Infra:** once A lands and the replay test passes, lower `infra/src/lambdas.ts:269` 900→~300 s
   (keep 1024 MB headroom or retune) and **update the `naming.ts:31` comment** to the new timeout (the
   overlap invariant holds again at ~300 s). Re-verify `Σ(reserved×2) ≤ 60` (unchanged; reserved=3).
4. **Files:** `packages/bot/src/app/ingestionSweep.ts:22-29,169-187`,
   `packages/bot/src/adapters/dynamodb/catalogRepository.ts:170-212` (a "watermark advanced, work
   remains" release variant if the existing two branches don't cover it), `infra/src/lambdas.ts:269`,
   `infra/src/naming.ts:31` (comment).
5. **Tests:** extend the sweep unit suite (fakes) — a multi-chunk batch ingests over N runs with
   **no loss / no duplicate** (the existing watermark contract), watermark monotonic per chunk,
   attempts reset on a successful chunk.

### Step C — smarter failure signal
1. **`ingestOne`:** on a failure where **no watermark advanced**, record a shrink hint
   (halve next chunk, floor 1) on the tracker; only `failConversation`+abandon when a **single-item
   chunk** exceeds the attempt cap (genuine poison). Emit a structured log + a triage marker
   (a tracker field, or — flag-only — a Group-C eval-capture row).
2. **Files:** `packages/bot/src/app/ingestionSweep.ts:141-167`,
   `packages/bot/src/core/domain/catalog.ts:107-125` (optional `chunkSizeHint?` field — **no new
   status enum value** unless a 2nd consumer appears), `catalogRepository.ts` accessor for the hint.
3. **Tests:** a synthetic "1 poison image among many" case abandons only the chunk that can't shrink
   further; a "transient timeout" case down-shifts and eventually drains.

### Eval cases (tie to `npm run eval` / `packages/pipeline/src/eval`)
- **Reality check:** the eval runner today **does not exercise classify** (*"classify needs image
  fixtures and stays n/a for now"*, `runner.ts:25-31`) and `EVAL_LLM=oracle` is a text-only smoke. So
  the *caching* and *chunking* wins are **not** measurable by the current scorecard — they need a
  **new harness hook**, not a new `EvalCase` row:
  - Add a **`pipeline`-package integration test** (Docker-PG harness, fake `StepLlm` + fake
    `MediaStore`) that replays a multi-image batch and asserts **classify-call count cold vs warm**
    (B) and **bounded per-chunk work** (A). This is the biting test — break the cache → warm count
    goes non-zero → red.
  - **Flag for Group C (do not build here):** turning the real 59-image incident into a *scored* eval
    case requires the export/replay path + image-fixture support Group C owns. Group B's eval
    contribution is the call-count/throughput integration test above.
- **Cost/latency as an eval output:** the cost log already records per-step entries
  (`cost.ts:11-19`); when Group C adds tracing, classify-call-count and warm-cache-rate become
  first-class scorecard outputs. Flag-only.

### Rollout / feature-flagging & verification
- **B** is a transparent read-through (miss = today's behavior) — ship un-flagged; the warm path only
  improves. **A/C** are behavior-changing on the core ingest path: gate behind the env-overridable
  chunk-size option (a high cold default ≈ "off"; lower to enable) so it can be tuned/rolled back
  without a redeploy.
- **Sequence:** B → verify warm re-run does zero classify calls (replay test) → A → verify multi-chunk
  no-loss → lower the Lambda timeout → C.
- **Review cadence (root `CLAUDE.md` §5.3):** every change → typecheck/lint/test/coverage; this
  increment → `/increment-review` (spec-auditor vs this plan + the stage spec, `/code-review`
  correctness, simplicity critic vs the anti-over-engineering rules, then the skeptic). No
  `/alignment-review`/`/frontend-review` (no UI/copy/design surface). **Post-deploy:** confirm a real
  multi-image dump in staging drains over several ticks with bounded per-run time and a warm re-sweep
  logging zero classify calls (sweep log line already emits `estCostUsd`/`cacheHit`,
  `pipelineV2Sweep.ts:251-257`; add classify-cache-hit to it).

## 6. Open questions / founder decisions
- **Classify-cache store: B1 (DynamoDB message attribute) vs B2 (S3 sidecar) vs B3 (Postgres table)?**
  Recommend **B1** (least new surface, co-located with `s3Key`). B3 is the most queryable but the
  heaviest (migration + a new table) — only if classifications need to be queried independently of
  ingest (no current consumer).
- **Lazy-persist on first sweep vs preprocess-at-ingest (E4(a))?** Recommend **lazy now** (captures the
  whole retry/re-sweep win with no processor changes); preprocess-at-ingest moves classify off the hot
  path entirely but touches the processor path (Group-D-adjacent) — defer (§8).
- **Chunk size unit & default — images, messages, or both?** Recommend **image-count primary** (images
  drive cost/time per the evidence) with a message-count safety cap; pick the cold default (≈12 images)
  by the replay test against the ~300 s target, then retune via the scorecard, never by hand in prod.
- **Target Lambda timeout after chunking** — ~300 s (restores the overlap invariant) vs a middle value
  while we gain confidence? Founder/ops call.
- **Cache invalidation:** is a classify verdict ever stale (re-uploaded image at the same `s3Key`)?
  `s3Key` is per-archived-photo and immutable (`derivatives.ts:22-25`), so a verdict is permanently
  valid — confirm no path mutates an existing `s3Key`'s bytes.

## 7. Cross-group dependencies (flag, don't resolve)
- **Group A (dedup correctness).** Chunking interacts with the **in-batch pool-push**
  (`run.ts:248-261`): a property whose segments straddle a chunk boundary won't geo-block against its
  own earlier segment within one run. A relies on the next sweep's `listDedupPool` catching it — but
  this changes dedup's input distribution. **Coordinate chunk boundaries with Group A; do not redesign
  dedup here.** Group A also owns whether the unfiltered whole-catalog pool scales.
- **Group C (eval/replay & tracing).** The *scored* incident eval case, image-fixture support, and
  per-step timing/tracing (today only total cost) are Group C deliverables. Group B's caching/chunking
  wins are only *fully* visible once Group C adds per-step tracing + classify-aware eval. The
  failure-triage marker (C-step) is the input to Group C's "capture a failure as an eval case" loop.
  **Flag-only; build the marker minimally, not the capture loop.**
- **Group A/D (write idempotency, E10).** Chunking + retries increase the chance the same batch span
  is processed twice (and the 900 s/5-min stale-claim overlap noted in §2.1 already can). Robust
  write-idempotency (so a re-run reconciles instead of duplicating) is E10 / Group A/D — **flag-only**;
  do not design it here. Lowering the timeout under chunking *reduces* the stale-claim overlap window.

## 8. Out of scope / deferred
- **Anthropic Batch API for classify (Option D).** Real 50%-cost lever and the transport is already
  built (`batch/*`), but it's a cost optimization, not the timeout fix, and reshapes the sweep to
  async. Revisit after E4(a). **Deferred.**
- **Preprocess-at-ingest / processor-time classification (E4(a)).** Removes classify from the hot path
  entirely but touches the processor/webhook path (Group-D-adjacent). The lazy-persist cache (B)
  captures the retry win without it. **Deferred with a clear seam** (the `s3Key`-keyed cache is the
  hand-off point).
- **Adding image `cache_control` to the classify call.** Net-negative vs an out-of-band cache (Haiku's
  4096-token cacheable minimum vs ~1600-token image ⇒ may silently not cache; only helps inside the
  5-min TTL). **Not pursued** (§2.4).
- **Per-step tracing / timing in prod, scored incident eval case, eval-failure-capture loop.** Group C.
- **Dedup correctness, geo-binding, conservative-merge, candidate-pool scaling.** Group A/E.
- **DM-as-group-of-one unification.** Group D.

<!-- RPI: R+P COMPLETE -->
