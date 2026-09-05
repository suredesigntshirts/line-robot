# Plan 23 — CONSOLIDATED cross-group reconciliation + implementation sequencing
> Status: RECONCILED · Inputs: the four group R+P artifacts (A/B/C/D) in this folder + `group-b-image-stage-rewrite.md` (supersedes Group B's image stage) + `plans/23-ingestion-pipeline-audit.md` · Phase: still Plan (no code executed here)

## 0. What this document is

The four group artifacts were researched **independently** (by design) — each flagged cross-group
overlaps but was forbidden from resolving them. This document is the promised **separate reconciliation
pass**: it (a) resolves every cross-group seam into a decision with a single owner, (b) reassigns the
orphaned cross-cutting recommendations (E3, E6, E8, E10) that no single group owned, (c) de-duplicates
the eval cases three groups each proposed, and (d) lays out one **sequenced build order** with the
dependency rationale.

It does **not** supersede the group artifacts — they remain the detailed specs (root causes, file:line
maps, options, tests). This is the index + the order + the conflict resolutions. **No code is executed
in this phase** (RPI's "Implement" is a later, separately-approved step); the per-phase plans below are
the inputs to that step.

Read order for an implementer: this doc → the specific group artifact for the phase you're building.

---

## 1. The unified picture

One incident exposed four entangled problems. In plain terms:

A real user dumped **76 messages = 59 images + 17 text = 5 distinct listings** into a **1:1 DM**.
1. The whole backlog went to one extraction run; it **timed out** (180s) three times → abandoned → an
   apology, no listings. *(Group B)*
2. Mitigation raised the Lambda to 900s; it then completed — but **dedup merged 4 of the 5 distinct
   listings into 1** (a wrong, conversation-level coordinate was stamped onto multiple segments →
   geo-blocked → Haiku said "merge") → **silent data loss**. *(Group A)*
3. We had **no way to turn that real failure into a regression test** to hill-climb against. *(Group C)*
4. The 1 survivor is **un-claimable by anyone** because it is a DM listing (`source_group_id` NULL) and
   the claim gate only admits source-group members → the user who dumped listings to "seed their
   account" **cannot use them**. *(Group D)*

**Severity ranking that drives the order:** silent data loss (A) > can't-use-my-data (D) > cost/latency
waste with a deployed band-aid (B) — and the eval loop (C) is the enabler that makes A's fix *provable*
and *regression-proof*. The 900s band-aid (commit `a93d73d`) means ingestion currently *completes*, so
we are **losing data on every multi-distinct-listing dump right now** — that is the thing to stop first.

### Dependency graph (who must precede whom)

```
            ┌─────────────────────────────────────────────┐
            │ Phase 1: Group C eval INSTRUMENTATION        │  (makes the bug measurable / red)
            │  loader · tier-gate · distinct-listings      │
            │  metric · runner real-geoHints · E7+incident │
            └───────────────────┬─────────────────────────┘
                                │ red regression cases exist
                                ▼
            ┌─────────────────────────────────────────────┐
            │ Phase 2: Group A DEDUP CORRECTNESS           │  (the data-loss fix; cases go green)
            │  A1 geo-bind/segment · A2 conservative-merge │  ← first edit of pipelineV2Sweep.ts
            │  + E5 honest count · regenerate baseline     │
            └───────────────────┬─────────────────────────┘
                                │ dedup is now safe under ANY batching
                                ▼
            ┌─────────────────────────────────────────────┐
            │ Phase 3: Group B RESILIENCE (+E10,+E8 store) │  (retract the band-aid)
            │  image-stage rewrite: cache+∥classify+refs   │  ← rebases on A's sweep edit
            │  → 512MB · chunk=BACKSTOP · failsig · E10     │
            └───────────────────┬─────────────────────────┘
                                │ sweep + write-path settled
                                ▼
            ┌─────────────────────────────────────────────┐
            │ Phase 4: Group D DM-CLAIMABLE (Option 1)     │  (make the incident's data usable)
            │  dm_claimant_user_id · gate admission · DM    │  ← rebases on settled sweep
            │  claim-invite · backfill 6 rows              │
            └───────────────────┬─────────────────────────┘
                                ▼
              Phase 5: deferred follow-ups (founder-gated, see §6)
```

The one **non-obvious ordering call**: **A before B.** Intuition says "fix the timeout first." But the
band-aid already makes ingestion complete, and chunking (B) makes cross-run/cross-chunk dedup the
*normal* path — so shipping chunking *before* dedup is conservative-by-construction would spread the
silent-merge bug across chunk boundaries. Group A's conservative-merge guard makes any cross-chunk split
degrade to a *recoverable duplicate + a moderation item*, never silent loss. So A must land first. (See
CR-2.) *(The image-stage rewrite demotes chunking to a time-only backstop — but if/when chunking is built,
this A-before-chunking ordering still applies.)*

---

## 2. Cross-group conflict register (RESOLVED)

Every seam any group flagged, resolved to one decision + one owner. `CR-2`, `CR-3`, `CR-4` are the
substantive ones; the rest are hand-offs and de-duplications.

| # | Seam (groups) | The overlap / conflict | Resolution | Owner · Phase |
|---|---|---|---|---|
| **CR-1** | Shared file `pipelineV2Sweep.ts` (A·B·D) | All three edit the sweep's `run` / `buildTranscript` / `PipelineInput` assembly (A: per-segment geo; B: chunk slice + classify-cache thread; D: `dm_claimant`). Parallel work would collide. | **Strict sequence A→B→D; no parallel edits to this file.** A's geo-bind is the smallest, root-cause touch and goes first; B and D each rebase. | Sequencing · P2→P3→P4 |
| **CR-2** | Chunking × in-batch pool-push (A↔B) — *semantic* | B's per-chunk watermark splits one property's segments across runs; cross-chunk dedup then falls to `listDedupPool` (cross-run) instead of the in-batch pool-push (`run.ts:248-261`), changing dedup's input distribution. | **A lands first.** A's conservative-merge (bias-to-new, weak merges → moderation as new rows) makes any cross-chunk split a *recoverable dup + merge_request*, never silent loss. B's chunker should avoid splitting mid-burst where cheap, but **correctness no longer depends on it.** **Update (image-stage rewrite):** chunking is further demoted to a *time-only backstop* — parallel classify + O(window) memory remove the timeout/memory pressure that made it load-bearing — so this seam is even lower-stakes; the ordering still applies if chunking is built. | Group A (correctness) · P2 before P3 |
| **CR-3** | E3 candidate-pool scaling — *orphaned* | `listDedupPool` is unfiltered whole-catalog (500-cap, `listings.ts:129-145`). A flagged it; B called it "shared DB plumbing"; nobody owned it. Chunking (CR-2) makes it *more* load-bearing. | **Assign to a dedicated DB increment: PostGIS `ST_DWithin` spatial fetch.** Sequenced **after** B-core, coordinated with chunking. **Not blocking** — 500-cap is fine at ~30 listings; this is a scale + blast-radius fix, not a fix for *this* incident. | Dedup/DB (A-adjacent) · P5 |
| **CR-4** | E10 write idempotency — *orphaned* | A/B/D all flagged it; none owned it. Chunking + retries + the 900s/5-min stale-claim overlap (B §2.1) make re-processing the same span routine. | **Small dedicated increment in P3, with chunking:** a stable write idempotency key (source message-id / batch-span) used by `persistNewListing`. A's listing writes and D's `dm_claimant` write both adopt the same **set-once / WHERE-guarded** pattern. | Sweep/pipeline write-path (B-adjacent) · P3 |
| **CR-5** | Per-call I/O trace store E8 (B↔C) — *duplicate-build risk + a real capability gap* | B wants "which step ate the timeout budget"; C wants hill-climb diagnostics AND the founder's "store all API calls with inputs and outputs". Today **nothing** persists API I/O (`CostLog` is ephemeral, aggregate $ only) — so full observability is currently impossible. Both groups would otherwise bolt on overlapping per-step timing. | **Build ONE trace store in P3, co-built with B.** A `traceSink` port on `StepContext` + `latencyMs` on `cost.ts` `CostEntry`, captured at the single `AnthropicStepLlm` chokepoint, fanning to **two tiers**: raw per-call I/O (`{system, userContent, response, usage, latencyMs}`) → **S3** `traces/<conv>/<run>/<step>.json`, and a queryable **Postgres `pipeline_trace`** metrics row (tokens/latency/cost/cache + `s3_key`). Flag-gated (`PIPELINE_TRACE`, default off) + S3 lifecycle TTL for PII. B uses `latencyMs`; C consumes the metrics as scorecard outputs. **Deferred to P5:** only the *read surfaces* — the per-conversation trace **view** and the **lossless E6 exporter** (read a captured trace → label → `tierA/`). | Pipeline infra (built w/ B, consumed by C) · **store P3** / view+exporter P5 |
| **CR-6** | Failure auto-capture E6 (B→C) — *producer/consumer split* | C's "failures become eval candidates" needs B's failure-classification signal (timeout/oversized/low-confidence). | **B emits a minimal triage marker in P3 (flag-only, no consumer).** C builds the promote-to-eval-case consumer in **P5**. Don't build the consumer before the signal exists. | B (signal) · P3 · / C (consumer) · P5 |
| **CR-7** | Export/replay × image-cache (B↔C) | C's exporter could read B's `s3Key` classify cache for richer image markers. | **No hard dependency.** C v1 emits `[IMG n] unknown` markers (no Group-B dep). Once B's classify cache lands (P3), C's exporter (P5) **may** read it. Synergy, not blocker. | C · P5 (optional read of B's P3 cache) |
| **CR-8** | Triplicate eval-case authoring (A·C·D) | A wants an "N distinct, 0 merges" archetype; C wants the incident Tier-A case + the E7 archetype; D wants a "DM-dump" archetype. Three groups, overlapping cases. | **One canonical incident Tier-A fixture + one E7 synthetic Tier-B archetype, both authored by C (P1).** The "distinct-listings" metric (A) and the "DM-claimable" expected field (D) are *properties of* those cases, not new cases. A and D **specify expectations; C authors.** | C authors · P1 (A/D specify) |
| **CR-9** | Eval-runner ownership (A↔C) | A's plan edits `runner.ts` (pass real per-segment geoHints; add a dedup-decision scorer); C's plan also edits `runner.ts` (tier gating, distinct-listings metric). | **Group C owns ALL eval-harness/`runner.ts` edits.** A's needs (stop hardcoding `geoHints:[]` at `runner.ts:235,249`; score the merge path) are **inputs to C's P1 work**, not a second editor of the file. | C · P1 |
| **CR-10** | Distinct-listings metric design (A vs C) | A proposed a *verify-level* metric (run `dedupVerify`, count merges, needs LLM+DB). C proposed a *blocker-level* metric (0 false blocks among N distinct, deterministic, free). | **Adopt C's deterministic blocker-level metric for v1** — free, catches the over-block root cause, honors deterministic-first dedup + D21. A's verify-level metric is a **deferred upgrade** only if a real case passes the blocker yet fails at verify. | C · P1 (A's variant → P5 if needed) |
| **CR-11** | E5 confirmation copy (A→design) | A implements "count persisted distinct rows, not segments"; the Thai/EN wording is design-bearing. | **A ships the count logic (P2);** the wording goes to `docs/design/skill-hardening/FOUNDER-QUEUE.md` + `/alignment-review`. Hand-off, no conflict. | A code · P2 / founder copy |
| **CR-12** | Eval baseline regeneration timing (C) | When do we rewrite `eval-baseline.json`? | **P1 lands the cases (red under `EVAL_LLM=anthropic`) → P2 A-fix turns them green → regenerate the baseline after P2.** D21-advisory throughout; never a blocking exit. | C · after P2 |
| **CR-13** | The 900s Lambda band-aid (B) | The deployed 900s/1024MB mitigation (`infra/src/lambdas.ts`, commit `a93d73d`) broke the `naming.ts:31` stale-claim overlap invariant (B §2.1). | **B lowers 900→~300s in P3 AFTER chunking proves bounded per-run time**, and updates the `naming.ts:31` comment. The band-aid stays until then (it's load-bearing — don't retract early). | B · P3 |

**Net:** no two groups propose *incompatible* designs that survive reconciliation. The only true
build-order constraints are **CR-1** (one file, sequence the editors) and **CR-2** (correctness before
chunking). Everything else is ownership assignment or de-duplication.

---

## 3. Orphaned cross-cutting items — final ownership

The audit's Group E recommendations were "distributed into" the four groups, but four of them landed in
the cracks between groups. Assigned here:

| Item | Was | Now owned by | Phase |
|---|---|---|---|
| **E3** spatial candidate pool (PostGIS `ST_DWithin`) | "shared DB plumbing", unowned | Dedup/DB increment (A-adjacent) | **P5** (not blocking; scale + blast-radius) |
| **E6** auto-capture failures → eval candidates | producer B / consumer C, unsequenced | B emits signal (P3) · C builds consumer (P5) | **P3 signal / P5 consumer** |
| **E8** per-call I/O trace store + per-step timing | B + C both wanted it; no API I/O is persisted today | Trace store — raw I/O→S3 + `pipeline_trace` (PG) at the chokepoint, built w/ B (P3) · trace *view* + lossless exporter (P5) | **P3 store / P5 view** |
| **E10** write idempotency keys | A/B/D all flagged, none owned | Sweep/pipeline write-path increment | **P3** (with chunking) |

E1 (conservative merge), E2 (segment geo), E5 (honest count) → Group A (P2). E4 (image preprocess/cache)
→ Group B (P3), with full *ingest-time* preprocessing deferred (P5). E7 (distinct-listings archetype) +
E9 (size-aware backpressure) → C (P1) / B (P3) respectively.

---

## 4. The consolidated implementation sequence

Each phase is one or more `/increment-review`-sized units. **"Spec"** points to the group artifact that
holds the file:line plan. Gating follows root `CLAUDE.md` §5.3.

### Phase 1 — Eval instrumentation (Group C core) · *makes the failure measurable*
**Why first:** lowest risk (eval module only, no hot path), and it gives us the red regression test
*before* the fix so A's improvement is provable (hill-climb best practice). **Spec:** group-c §5 Option A.
- Tier-A fixture loader (`cases.ts`), oracle/tier gating so specs-less Tier-A cases are **n/a under
  `EVAL_LLM=oracle`** (the 4th-gap fix), scored under `anthropic`.
- The **distinct-listings dedup metric** (blocker-level, CR-10) so "N distinct must not merge" is visible.
- Pass **real per-segment geoHints** into the runner (stop hardcoding `[]`, `runner.ts:235,249`) — CR-9,
  the prerequisite for measuring A's geo fix.
- Author **one E7 Tier-B archetype** ("N distinct, different districts, 0 merges") + **one incident
  Tier-A fixture** (5 listings, 0 merges; truth already known) — CR-8.
- **Gate:** typecheck/lint/test/coverage; `npm run eval` (oracle) stays 1.0 on the existing 62 + the E7
  case; `/increment-review`. *No baseline rewrite yet (CR-12).*
- **Exit:** `EVAL_LLM=anthropic npm run eval` shows the incident case failing (≈1 of 5 distinct) — the
  bug is now a red test.

### Phase 2 — Dedup correctness (Group A) · *the data-loss fix*
**Why second:** stops the active silent loss; must precede chunking (CR-2). First edit of
`pipelineV2Sweep.ts` (CR-1). **Spec:** group-a §5 (Increments A1, A2).
- **A1 — geo binds per-segment:** reconcile `[MAP n]`/`geoHints` index spaces; use `segment.mapIndex`
  to pass *only* a segment's own coordinate (or none) into `extractListing`; kill the blanket
  `geoHints: input.geoHints`.
- **A2 — conservative-merge guard:** auto-merge ONLY on strong deterministic evidence (deed-exact, or
  tight-geo `DEDUP_MERGE_RADIUS_M` AND text-sim, or a score+confidence floor); weak/uncertain "merge" →
  `persistNewListing` + `createModerationItem(…, "merge_request", …)` (no schema change). Plus **E5**
  honest confirmation count (CR-11).
- Model tier (Haiku→Sonnet for verify) stays a **scorecard-decided lever**, not part of this fix.
- **Gate:** the full §5.3 cadence + `/alignment-review` (DEAL-09, FIELD-11, E5 copy) + `npm run
  test:integration -w @line-robot/pipeline`. **Then regenerate `eval-baseline.json`** (CR-12) — the P1
  cases go green.
- **Exit:** the incident/E7 eval cases pass; a multi-distinct dump persists N rows.

### Phase 3 — Performance & resilience (Group B) + E10 + the E8 trace store · *retract the band-aid*
**Why third:** the band-aid holds, so this is not silent-loss-urgent; it rebases on A's settled sweep
(CR-1) and benefits from A's safe-under-any-batching dedup (CR-2). **Spec:** `group-b-image-stage-rewrite.md`
(image stage — **governs; supersedes group-b §3-§5 for images**) + group-b §5 (failure-signal C).
- **Image-stage rewrite (the load-bearing image fix):** one cache-first, **bounded-parallel** classify pass
  over photo *references* — cache hit by `s3Key` → done; miss → lazy `MediaStore.getOriginal` → classify
  (**C=8**, env `CLASSIFY_CONCURRENCY`, SDK 429-backoff governs — cited `rate-limits.md`) → **eager** cache
  write → bytes freed. Absorbs the old "Step B classify cache" (the warm short-circuit) **and** parallelises
  the formerly-serial classify **and** drops peak memory to O(window). Store: **B1 DynamoDB attribute on the
  message item.** Relocate `mapWithConcurrency` bot→pipeline (R-2b); `sharp.cache(false)`/`concurrency(1)`.
  **Then lower the Lambda 1024→512 MB** once staging `MaxMemoryUsed` confirms bounded peak. **Spec/risks/tests:
  `group-b-image-stage-rewrite.md`.**
- **A (chunk + watermark-per-chunk) — DEMOTED to a time-only BACKSTOP.** No longer the load-bearing timeout
  fix (parallel classify + O(window) memory remove the pressure). Keep it (or grow its image cap) for
  watermark-forward-progress + poison-isolation (RC-2/RC-4); **can be deferred.** If built: cap `ingestOne`,
  advance watermark per chunk, reset attempts on a successful chunk + the new release branch (group-b §5 Step A).
- **C (smarter failure signal):** down-shift the chunk on a no-progress failure; abandon only when a
  single-item chunk fails; emit a **minimal triage marker** (CR-6, E6-producer, flag-only).
- **Lower `infra/src/lambdas.ts` timeout** + fix the `naming.ts:31` comment (CR-13) — now low-pressure (the
  rewrite makes runs short); pair with the 1024→512 MB memory drop above.
- **E10 (CR-4):** a stable write idempotency key so a re-run reconciles instead of duplicating.
- **E8 trace store (CR-5):** a `traceSink` port on `StepContext` + `latencyMs` per `CostEntry`, capturing at the
  single `AnthropicStepLlm` chokepoint into **two tiers** — raw per-call I/O (`{system, userContent, response,
  usage, latencyMs}`) → **S3** `traces/<conv>/<run>/<step>.json`, and a queryable **Postgres `pipeline_trace`** row
  (input/output/cache tokens, latency, cost, `s3_key`). This is the concrete implementation of `traceSink` — **not a
  stub**: it is what makes caching/chunking wins measurable (classify-call-count cold-vs-warm, per-step timing) for
  B AND delivers the founder's "store all API calls with inputs and outputs" (impossible today — nothing persists
  API I/O). Sink default = no-op (pipeline core stays infra-free; eval runner wires no-op/local-file). Hot-path write
  is best-effort and never fails the pipeline. **Flag-gated** (`PIPELINE_TRACE`, default off) + **S3 lifecycle TTL**
  for PII (captured prompts hold real phone numbers/addresses). New migration: `pipeline_trace` (metrics table; no
  domain enum → `schema.ts` add + `npm run generate`). The trace **view** + lossless E6 exporter are P5 readers.
- **Gate:** §5.3 (backend, **no** `/frontend-review`); the new **pipeline integration test** (Docker-PG
  + fake `StepLlm`/`MediaStore`) asserting classify-calls = #images cold, 0 warm, and bounded per-chunk
  work; **trace-store tests** — a fake `traceSink` records once per step with a non-zero `latencyMs`, a
  sink-throws test proves the pipeline still completes (best-effort), and a Docker-PG test round-trips a
  `pipeline_trace` row; post-deploy staging check that a real multi-image dump drains over several ticks + a warm
  re-sweep logs zero classify calls.

### Phase 4 — DM claimable (Group D, Option 1) · *make the incident's data usable*
**Why fourth:** rebases on the settled sweep (CR-1, after A's geo-bind + B's chunking touch it); uses the
shared eval case (CR-8); needs E10's set-once pattern (CR-4) for its new write. **Spec:** group-d §5
(Option 1).
- New nullable `listing.dm_claimant_user_id` FK (next migration after P3's `pipeline_trace` table — `0012` if
  P3 takes `0011`; numbers are assigned in build order, domain-enum N/A, hand-fix per
  `packages/db/CLAUDE.md`); set on the DM sweep branch to the **real (bare-id) DM peer**, not the
  pseudo-`owner_user_id` (group-d §2.2 item 8 — the non-obvious correctness point).
- Relax `sendClaimInvites` DM-skip so a DM listing gets its one-shot claim DM to the peer.
- Admit the DM claimant at the two gate sites (`handler.ts:331-334` claim; `:220-233` read authz):
  `sourceGroupId === null && dmClaimantUserId === caller`.
- Backfill the ~6 existing NULL-group DM rows (idempotent maintenance step).
- **Flip** the two DM-no-group tests (`pipelineV2Sweep.test.ts:375-383, 497-513`) to the new contract;
  add `packages/api` + `packages/db` + `e2e-api` round-trip tests.
- **Gate:** §5.3 + `/alignment-review` (claim/publish, LEGAL-02, privacy) + `npm run test:e2e:api -w
  @line-robot/miniapp`.
- **Full DM/group unification (Option 2) is NOT built** — deferred to P5 behind a forcing function (§6).

### Phase 5 — Deferred follow-ups (founder-gated; each its own later decision)
- **E3** PostGIS spatial candidate pool (CR-3) — when scale or blast-radius warrants.
- **E8 trace *view*** (read/query UI) + **lossless E6 capture consumer** (CR-5/CR-6) — readers over the P3 trace
  store; built once the P3 store + Group B's failure signal exist. *(The trace store itself is now built in P3, not
  here.)*
- **Group C Option B** export/replay utility (CR-7) — to scale the golden-set loop beyond this incident.
- **Anthropic Batch API** for classify (group-b Option D, 50% cost) — pairs with ingest-time preprocess.
- **Ingest-time image preprocess** (E4(a)) — moves classify off the hot path entirely (processor-path).
- **DM/group unification Option 2** (group-d §6.4) — gated on exclusivity-at-ingest OR a 2nd NULL-group
  case.
- **LLM-as-judge (`scoreFuzzy`)** + **prompt-version/experiment registry** — aspirational; defer until a
  second consumer exists (anti-over-engineering rule 1).
- Dedup **verify-level** distinct-listings metric (CR-10) + **model-tier** raise — only if the scorecard
  shows the deterministic floor under-protects.

---

## 5. One thing to build once, consumed by many

To prevent the "independent groups → duplicated infra" trap, three artifacts are built **once** and
referenced by the others:
1. **The incident eval fixture + E7 archetype** (C, P1) — A measures its dedup metric on it; D adds the
   DM-claimable expectation; C owns the file. (CR-8)
2. **The per-call trace store** (P3) — one `traceSink` at the `AnthropicStepLlm` chokepoint fanning to S3 (raw
   I/O) + Postgres `pipeline_trace` (metrics). B uses `latencyMs` for chunking/caching validation; C surfaces the
   metrics as scorecard outputs; the P5 trace view + lossless E6 exporter read the same store. (CR-5)
3. **The write idempotency key** (P3) — A's listing writes, B's chunk re-runs, and D's `dm_claimant`
   write all adopt the same set-once pattern. (CR-4)

---

## 6. Consolidated founder decisions (the cross-cutting ones)

The group artifacts list ~20 open questions; these are the ones that gate **sequencing or scope** and
want a founder call before P-by-P build approval. (Recommendations carry the asymmetry/anti-over-eng
bias.)

1. **Confirm the phase order** C-instrument → A → B(+E10) → D, and that **A precedes B** (correctness
   before chunking, CR-2). *(Recommend: yes.)*
2. **Dedup uncertain-merge UX:** weak merges → moderation as **new rows** (zero data loss).
   `DEDUP_MERGE_RADIUS_M` default ≈150 m. *(Recommend.)*
3. **DM listings self-claimable by their sender** (Group D Option 1)? *(Recommend: yes — it's what the
   incident requires.)* Full unification (Option 2) **deferred**. *(Recommend.)*
4. **Classify-cache store = B1** (DynamoDB message attribute). *(Recommend.)* Lazy-persist now;
   ingest-time preprocess deferred.
5. **Chunk = a time-only BACKSTOP now** (demoted by the image-stage rewrite, R-11) — if built at all, default
   ≈12-40 images + Lambda timeout tuned via the replay test, not by hand. *(Founder/ops confirm — or defer
   chunking entirely; the rewrite removes the pressure that required it.)*
6. **Distinct-listings metric = deterministic blocker-level for v1** (CR-10); model-tier raise is
   scorecard-decided after P2. *(Recommend.)*
7. **E5 confirmation wording** (Thai/EN "added N new / updated M") — taste call → FOUNDER-QUEUE. (CR-11)
8. **Exclusivity-at-ingest** (the premise behind "DM listings get exclusivity") is **dormant today**
   (0 `listing_exclusivity` rows, no production opener — group-d §2.1 correction). Decide separately
   whether to build it at all; it does **not** gate any phase here.
9. **Trace-store scope, PII & retention (CR-5, now committed in P3).** The P3 trace store captures **real PII**
   (phone numbers, addresses, names) in raw prompts. Decisions: (a) turn capture on in **prod** or **staging-only**
   first (recommend staging-only); (b) raw-blob S3 **TTL** (recommend 30–90 days; the `pipeline_trace` metrics row —
   no content — persists longer); (c) confirm read access scoped to the deploy/admin role; capture is flag-gated
   (`PIPELINE_TRACE`, default off) regardless. This decision gates *enabling* the store, not building it.
10. **Image-stage rewrite (the new primary Group B image fix — `group-b-image-stage-rewrite.md`).** (a)
   **Classify concurrency `CLASSIFY_CONCURRENCY` default = 8** (founder directive — push high; SDK 429-backoff
   governs; per-tier limits cited in `docs/platform.claude.com/docs/en/api/rate-limits.md`). (b) **Confirm the
   account rate-limit TIER** (Console → Limits, or the `x-ratelimit-limit-*` response headers) — the only open
   input; at tier-1 the token bucket caps throughput regardless of C. (c) **Lower the sweep Lambda
   1024→512 MB** once staging `MaxMemoryUsed` confirms O(window) peak. *(Recommend all three.)*

---

## 7. Program-level risk & verification

- **Biggest risk: building B before A** would let chunking spread the silent-merge bug across chunk
  boundaries (CR-2). The order above prevents it; the P1 regression cases would also catch a re-merge.
- **Shared-file collisions** (CR-1): enforce the A→B→D sequence on `pipelineV2Sweep.ts`; do not parallelize.
- **Every phase** runs the §5.3 cadence (typecheck/lint/test/coverage + `/increment-review`; design-
  bearing → `/alignment-review`; user-facing → `/frontend-review`). **Eval stays D21-advisory** — a red
  eval never blocks a merge; the founder reads the delta.
- **The north-star check:** after P1–P2, `EVAL_LLM=anthropic npm run eval` shows the incident going
  1→5 distinct persisted; after P3, a real staging dump drains in bounded per-run time with a warm
  re-sweep doing zero classify calls; after P4, the incident's user can claim + publish their listings.
  That sequence *is* the hill-climb loop the founder asked for, proven on the real failure.

---

## 8. Status & next step

- This reconciliation is **paper-only** — no code/schema/infra changed (the four group artifacts were
  R+P; this is their consolidation). The pending git tree before the implement phase should still show
  only docs under `plans/23-ingestion-pipeline-audit/`.
- **Next step (separate, founder-approved):** begin **Phase 1** (Group C eval instrumentation) as a
  normal `/increment-review`-gated build, using `group-c-eval-hillclimbing.md` §5 as the spec — then
  proceed down the sequence, re-reading each group artifact at its phase.
