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
| **U-D1 — DM-claimant column** | `listing.dm_claimant_user_id` nullable FK + migration `0011_thankful_may_parker` (clean ADD COLUMN+FK, no hand-fix). Validated on real PG (db integration 78). Staging at 0010, zero drift → applies cleanly. Additive/non-breaking (nothing reads it until U-D2). **Not yet applied to staging (gated).** | `dd4574b` |
| **U-D2 — DM-claimable behavior** | Sweep `resolveDmClaimant` (real bare-id poster, NOT pseudo-owner) → threads `dmClaimantUserId` set-once on the create path; relaxed `sendClaimInvites` so a DM gets its claim DM; self-guarding `isDmClaimant` admits `sourceGroupId IS NULL && dmClaimantUserId==caller` at both gate sites (claim + read); `requireClaimant` (publish/edit) still needs a real claim. Flipped 2 sweep tests + guard; +4 api gate tests; +1 db round-trip; **+1 e2e-api real-backend DM claim→publish (admitted via dm_claimant, NOT membership)**. Adversarial authz audit: no live exploit; its MEDIUM (self-guard the primitive) applied. Oracle eval unchanged. | `103eae9` |
| **U-EVAL-perf — fast real-model eval** | `CachingStepLlm` decorator at the `StepLlm` seam (`EVAL_CACHE=1`, gitignored `.eval-cache/`) + bounded case-level concurrency (`EVAL_CONCURRENCY`, dflt 6 real/1 oracle) via a local `mapWithConcurrency` + per-case progress. Warm re-run = 0 API calls; real cold→warm proof **5485 ms → 0 ms**, byte-identical extraction. Cache bypassed on `EVAL_WRITE_BASELINE=1` (baseline always fresh). Oracle eval unchanged (PASS 1.0). Adversarial audit's one real finding (usage not re-validated on read → could NaN `costUsd`) fixed + tested. **Eval-only, zero production impact.** | `9161271` (+ lint hygiene `8a5613a`) |

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
  distance on `BlockedCandidate` — see `candidateFinder.ts:81`.)* **Blocked on a founder yes/no** (tighten
  already-safe behavior).
- ~~U-EVAL-perf~~ **DONE** (`9161271`) — see §1. Warm re-runs are now seconds; iterate on Group B's
  model-facing image work with `EVAL_CACHE=1` (and BYPASS via `EVAL_WRITE_BASELINE=1` for the baseline).

**Phase 4 — Group D, DM-claimable (Option 1)** — self-contained, addresses the founder-critical
"dumped my listings but can't use them." Spec: `group-d-dm-group-unification.md` §5. **Blast-radius
audit done 2026-06-16 — plan validated WITH corrections (the spec's line numbers drifted under A1 + the
membership change; see audit corrections below).**
- ~~U-D1 — migration~~ **DONE (`dd4574b`)** — `listing.dm_claimant_user_id` nullable FK + migration
  `0011_thankful_may_parker` (clean ADD COLUMN+FK, no hand-fix). Validated on real PG (db integration 78).
  Staging at 0010, zero drift → 0011 applies cleanly. **NOT yet applied to staging (gated go-live step).**
- ~~U-D2 — sweep + gate~~ **DONE (`103eae9`)** — see §1. **Code complete; NOT yet on staging.** Remaining
  for Group D = **Phase 3 go-live (gated on founder sign-off):** (1) apply migration `0011` to staging RDS
  (`DATABASE_URL=<staging> npm run db:migrate -w @line-robot/db`); (2) re-verify the NULL-group count
  (6 now) + run the idempotent backfill (strip `user#` from each NULL-group listing's pseudo-owner subject
  → bare-id user → set `dm_claimant_user_id`) — this is what makes the *incident survivor* claimable;
  (3) `npm run build && pulumi up` (bot sweep + api Lambdas); (4) confirm a DM listing is claimable live.
- **(superseded build notes for U-D2)** (audit-corrected map): (a) **new** `resolveDmClaimant` in the DM path
  — do NOT reuse `populateGroupMembership`, it `return undefined`s at `pipelineV2Sweep.ts:155` BEFORE the
  bare-sender resolve at `:164`; (b) thread `dmClaimantUserId` through `PipelineInput` (`run.ts:54-68`) →
  `persistNewListing` (`:105-179`) → `createListing` listing-obj (`:139-177`) — set the **new** column,
  NOT `claimedByUserId` (no auto-claim), set-once for E10; (c) relax `sendClaimInvites` guard at
  `pipelineV2Sweep.ts:311`; (d) admit the DM claimant at BOTH gate sites — `handleClaim` `handler.ts:331-334`
  + `authorizedListing` `:220-233` (the latter is one fn → covers detail/notes/viewings/flagInterest/quickSale);
  fix the stale `handler.ts:324-330` comment; (e) flip the 2 sweep tests (now at `pipelineV2Sweep.test.ts:387-395`
  & `:509-525`) + add `api`/`db`/`e2e-api` tests; (f) re-verify staging NULL-group count (6 now) then backfill.
  **Eval-case step DROPPED** — the incident DM fixture already exists from Phase 1 (CR-8). Correctness-critical
  (authz gate) → run the adversarial code-only audit + `/increment-review` + `/alignment-review`. NOT model-facing.

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
   `U-EVAL-perf` (cache + concurrency) so iteration isn't 20-min-per-run. **(BUILT — `9161271`.)**
9. **A bounded ONE-CALL real cold→warm check verifies an eval-infra seam cheaply** — for U-EVAL-perf we
   proved the cache round-trips a LIVE Anthropic response (5485 ms → 0 ms, byte-identical extraction)
   with a throwaway 1-call script, not a 20-min full run. The fake unit test proves the decorator logic;
   the one real call proves the real seam (JSON round-trip + zod re-validation against the real schema).

## 5. How to resume (one small unit per iteration)

After clearing context, paste the prompt in `RESUME-PROMPT.md` (this folder). It assumes zero memory,
reads this file + the relevant group artifact, builds the next single smallest-blast-radius unit with
the full discipline above (real-API validation + adversarial audit + commit + update this status), then
stops so you can review before the next iteration.
