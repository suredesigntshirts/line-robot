# Plan 23 — Implementation status & resume guide
> Status as of 2026-06-16. This is the live index of what's BUILT vs LEFT for the ingestion-pipeline
> audit. Read this first, then `00-CONSOLIDATED-sequencing.md` for the phase order, then the specific
> group artifact for the unit you're building. Update this file as units land.

## 1. DONE (committed)

Mapped to the consolidated phases. All gated: typecheck/lint/unit + (for model-facing changes) the
real-model Docker integration tests; oracle eval stays PASS 1.0.

| Plan item | What shipped | Commit(s) |
|---|---|---|
| Trivial B (sharp R-4, naming CR-13 comment) | `sharp.cache(false)`/`concurrency(1)`; stale 180s→900s sweep-timeout comment | `9c963a2` |
| **Phase 1 — Group C eval instrumentation** | Tier-A fixture loader, oracle/tier gating (the "4th gap"), distinct-listings dedup metric (scoped to `distinct-*`/tier-A archetypes), E7 archetype | `24a6380` |
| Incident Tier-A fixture | Rebuilt from the REAL 77-msg staging thread (`user#U810f…`); corrected a hand-authored error (#2 was 1.25% interest, not 1.25M price) | `dcc2bf1` |
| **E5 honest count** | `buildConfirmation` counts distinct persisted rows, not segments | `d343465` |
| **Phase 2 — A2 conservative-merge guard** | Weak/uncertain merge → new row + `merge_request` moderation item (no schema change); `DEDUP_MERGE_SCORE_FLOOR`/`_CONFIDENCE_FLOOR` | `5f6f899` |
| A2 audit fix | **geo now REQUIRED** to auto-merge (text-only no longer folds a listing); bounded `confidence` 0..1; floor 0.7→0.85 (~170 m) | `0bd4302` |
| **Phase 2 — A1 geo-bind per-segment** | `coordByMapIndex` parallel to `[MAP n]`; `SEGMENT_SYSTEM` teaches `mapIndex`; per-segment bind | `dcc2bf1` |
| A1 audit fix | **authoritative bind** (override model lat/lon — extract prompt never reads GEO HINTS); collision guard; `mapIndex` int≥0 | `841b2e4` |
| A1 acceptance harness | `geoBind.test.ts` (deterministic, asserts persisted geom) + `incidentGeoMerge.e2e.test.ts` (real-model, 5 distinct rows, 0 shared coords) | `c486e6a`, `841b2e4` |
| Real-API validation policy | CLAUDE.md "For model-facing changes" rule; D21 reframed "advisory = run-and-judge, not skip" | `6170b0c` |
| **U1 — baseline regen (real model)** | 64 cases, $1.21, PASS; segment/extract/dedup/gate held ~1.00 (SEGMENT_SYSTEM change did NOT regress segmentation); dedup scores the 2 new distinct archetypes (0 false blocks); translate −0.02 = jitter + harder real cases, not a regression | `2024e1b` |

**Net effect:** the 2026-06-15 incident path now works — A2 stops the silent data loss (≥5 rows
persist, not 1) and A1 gives each listing its own correct pin (no shared coords). Proven on the real
conversation via real-model integration tests.

## 2. Divergences from the plan (all verified in the correct direction — see chat verification)

- **A2 stricter than the plan's literal `OR score≥floor`** (which permitted text-only). Now requires
  geo — faithful to DEAL-09 "never text alone" + the loss-asymmetry the plan repeatedly states.
- **A2 uses `DEDUP_MERGE_SCORE_FLOOR` instead of the named `DEDUP_MERGE_RADIUS_M`** (§5 A2.3) — same
  intent (tight geo for merge), simpler (no distance threaded onto `BlockedCandidate`). **Open:** A2's
  geo+text arm still merges up to the 1 km block radius; the plan wanted ≤~150 m even with text. See LEFT U-A2b.
- **A1 went beyond "pass as hint":** authoritative override + segmenter prompt change + collision
  guard. The plan assumed `mapIndex` was populated (it wasn't) and that a hint would bind (the extract
  prompt ignores it). These additions make the plan's goal actually hold. Residual: a single
  non-colliding `mapIndex` mis-attribution can still hard-bind a foreign pin (rare; A2 backstops).
- **Group C "real geoHints into the runner" (§5 item 3) trimmed** — the runner can't exercise the
  bind loop; honored by CR-10 (deterministic blocker metric for v1). The real proof is the integration test.

## 3. LEFT TO DO — small-blast-radius units, ordered

> Build ONE per iteration. CR-1: `pipelineV2Sweep.ts` editors must be sequenced (A1 already landed
> the first edit; B's rewrite and D's claim-write both rebase on it — no parallel edits to that file).

**Immediate**
- **U-A2b — (founder call) tighten A2's geo+text merge radius.** Add a `DEDUP_MERGE_RADIUS_M` gate on
  the geo+text arm so merges need both keys AND close geo (the plan's full conservatism). *(small; needs the
  distance on `BlockedCandidate` — see `candidateFinder.ts:81`.)*
- **U-EVAL-perf — speed up the real-model eval (caching + concurrency).** A cold `EVAL_LLM=anthropic`
  run is ~20 min — only **2 s of CPU over 20 min wall**, i.e. fully throttle/serial-bound (the account's
  rate-limit tier is low; the runner has zero concurrency). Two complementary fixes: **(1) a
  `CachingStepLlm` decorator** wrapping the adapter at `runner.ts:204`, keyed on
  `sha256(step+model+system+content+maxOutputTokens)` → a gitignored `packages/pipeline/.eval-cache/`;
  re-validate the cached value against the current zod schema on read (a schema/prompt change auto-misses
  → real call). Gate behind `EVAL_CACHE=1` (opt-in) and BYPASS it when regenerating the official baseline
  or checking model drift (a cache freezes responses at capture time — temp=0, `eval.config.ts:14`). A
  pure-logic change (no prompt edit) then re-runs in seconds; a prompt edit re-calls only that step.
  **(2) bounded-concurrency** over cases/calls (`mapWithConcurrency`) to cut the cold run ~20 min → ~2-3
  (rate-limit permitting). *(eval-only, ~50-80 LOC, zero production impact; pairs naturally.)*

**Phase 4 — Group D, DM-claimable (Option 1)** — self-contained, addresses the founder-critical
"dumped my listings but can't use them." Spec: `group-d-dm-group-unification.md` §5.
- **U-D1 — migration:** new nullable `listing.dm_claimant_user_id` FK (domain-enum N/A; `schema.ts` add →
  `npm run generate` → hand-fix per `packages/db/CLAUDE.md`).
- **U-D2 — sweep + gate + backfill:** set `dm_claimant_user_id` on the DM branch (the REAL bare-id peer,
  not the pseudo-owner); relax `sendClaimInvites` DM-skip; admit the DM claimant at `handler.ts:331-334`
  + `:220-233`; backfill ~6 NULL-group rows; flip the 2 DM-no-group tests + add `api`/`db`/`e2e-api` tests.

**Phase 3 — Group B, performance & resilience.** Spec: `group-b-image-stage-rewrite.md` (image stage,
governs) + `group-b-performance-resilience.md` (Steps A/C). Sharp tuning + the timeout comment already shipped.
- **U-B1 — Step B classify cache (s3Key-keyed, DynamoDB message attribute B1).** Pre-req for the rewrite.
- **U-B2 — image-stage rewrite** (bounded-parallel classify C=8, reference bytes, cache short-circuit).
  BIG — build per `group-b-image-stage-rewrite.md` §6 ordered steps (each step is a sub-unit). Then lower
  Lambda 1024→512 MB once staging `MaxMemoryUsed` confirms O(window).
- **U-B3 — Step C smarter failure signal** (down-shift on no-progress; abandon only at single-item; triage marker).
- **U-B4 — E10 write idempotency key** (set-once/WHERE-guarded `persistNewListing`; D's claim-write adopts it).
- **U-B5 — E8 trace store** (`traceSink` port → S3 raw I/O + Postgres `pipeline_trace` migration; flag `PIPELINE_TRACE`, S3 TTL). Large.
- **U-B6 — chunking (Step A, demoted to backstop)** + lower Lambda 900→300 s (CR-13). Deferrable.

**Phase 5 — deferred / founder-gated** (don't build without a decision): E3 PostGIS spatial pool, E8
trace *view* + E6 capture consumer, Group C export/replay utility, Anthropic Batch API, ingest-time
preprocess, DM/group unification Option 2, LLM-as-judge, verify-level dedup metric, the `merge_request`
*actuator* (resolveModerationItem is a no-op on the listing today — A2 is safe but the recovery path is inert).

## 4. What helped us write bug-free code (process learnings — keep doing these)

1. **Adversarial, fresh-context, code-only audits caught both CRITICAL bugs the green tests masked.**
   Spawn a sub-agent told to "assume idiots wrote it, full of bugs, review the CODE only — no plans/docs."
   It found: A2 auto-merging on text alone, and A1's binding being advisory/untested. Do this for any
   correctness-critical (LLM / dedup / data-loss) increment, AFTER the code is written.
2. **Real-API validation exposes what fakes hide.** The oracle/`FakeStepLlm` passed green by construction
   while both bugs sat underneath; only `EVAL_LLM=anthropic` + the Docker real-model integration tests
   showed the real behavior. (Now a CLAUDE.md rule.)
3. **Ground fixtures in REAL captured data, not reconstructions.** Exporting the real staging conversation
   corrected a factual error in the hand-authored fixture and revealed the exact structure (3 maps, 2 coords
   + 1 short link) that the fix had to handle.
4. **Make tests bite on the real effect, not a proxy.** The geoBind test first asserted the prompt string
   (which the model may ignore) — false confidence; the audit pushed it to assert the PERSISTED geom.
5. **Reason about real value ranges, not just logic shape.** Working out the actual score ranges (geo
   0.6–0.9, text max 0.8) vs the 0.7 floor is what exposed the text-only hole — the logic "looked" right.
6. **Test-first red harness, reviewed before the fix** (the `it.fails` → green flow) gives a "green-able
   target" and surfaces design gaps (the advisory binding) before you build on them.
7. **The baseline-regen delta is the broad-regression net the integration tests can't give.** It confirmed
   the `SEGMENT_SYSTEM` change held segmentation at 1.00 and the new dedup metric works on the real model —
   the one thing the incident-only integration test couldn't tell us. Run it after any model-facing change.
8. **The real-model eval is throttle/serial-bound (~20 min, 2 s CPU).** The account's rate-limit tier is
   low and the runner has no concurrency. Don't idle-wait on it without progress visibility; and build
   `U-EVAL-perf` (cache + concurrency) so iteration isn't 20-min-per-run.

## 5. How to resume (one small unit per iteration)

After clearing context, paste the prompt in `RESUME-PROMPT.md` (this folder). It assumes zero memory,
reads this file + the relevant group artifact, builds the next single smallest-blast-radius unit with
the full discipline above (real-API validation + adversarial audit + commit + update this status), then
stops so you can review before the next iteration.
