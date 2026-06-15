# Plan 23 — Group A: Dedup correctness (distinct listings collapsing into one) — Research + Plan (RPI)
> Status: R+P COMPLETE · Source: plans/23-ingestion-pipeline-audit.md (Group A) · Phase: Research+Plan ONLY (no implementation)

## 1. Problem & scope

A real LINE user (`user#U810f7671d201fe7ce3ec2ef49ab8d16a`) dumped 76 messages = **5 distinct
property listings** into a 1:1 DM. The pipeline extracted all 5 (`listings:5, dropped:0`) but
**only 1 row persisted** (`4b194544`, the แม่โจ้ dorm) — the dedup step gave 4 of the 5 a `"merge"`
verdict and folded them into the survivor. Four distinct listings were silently lost on the core
ingestion path. The founder frames "dump many listings" as the *primary* use case, not an edge case.

**Group A owns:** the dedup over-merge (founder items 1 & 5) and the cross-cutting recommendations
**E1** (conservative-merge asymmetry), **E2** (segment-scoped geo — *design-flagged here, but the
ingest/sweep half is Group B's; see §7*), **E3** (candidate-pool scaling), **E5** (confirmation
reflects persisted distinct rows), **E10** (write idempotency keys).

The governing asymmetry, baked into every design choice below: **a false "new" makes a recoverable
duplicate; a false "merge" is unrecoverable silent data loss.** Bias hard toward "new."

## 2. Research findings

### 2.1 Root cause(s) with evidence (file:line)

**ROOT CAUSE — geo mis-bind: conversation-level `geoHints` are applied to EVERY segment, stamping a
wrong-but-shared coordinate onto multiple distinct listings, which then geo-block together and Haiku
verifies "merge."** This is the audit's leading hypothesis — **CONFIRMED with code + data evidence.**

Evidence chain:

1. **`geoHints` are conversation-level, not per-segment.** The sweep computes them once over the
   whole batch text: `pipelineV2Sweep.ts:247` — `geoHints: parseGeoLinks(chatText).map(...)` where
   `chatText` is the entire batch joined (`pipelineV2Sweep.ts:219-222`). They flow into
   `PipelineInput.geoHints` (`run.ts:60`).

2. **Every segment's extraction receives ALL of those hints.** `run.ts:205-212` loops per segment
   and calls `extractListing(ctx, { transcript, focus: segment.label, geoHints: input.geoHints, … })`
   — it passes the *full* `input.geoHints` array to every segment, unfiltered. `extract.ts:13`
   renders them verbatim into the prompt: `` `GEO HINTS: ${input.geoHints.join("; ") || "(none)"}` ``.
   The Sonnet extractor is free to (and did) attach a hint coordinate that belongs to a *different*
   listing.

3. **The per-segment map binding the segmenter computes is THROWN AWAY.** The segment schema has a
   `mapIndex` field (`schemas.ts:39`, `steps.ts:58`), the segmenter parses it
   (`segment.ts:45`), and the transcript carries ordered `[MAP n]` placeholders
   (`pipelineV2Sweep.ts:96-103`). But **`run.ts` never reads `segment.mapIndex`** — there is no code
   path that maps a segment's `mapIndex` to a specific coordinate. Confirmed by grep: `mapIndex` is
   referenced only in `schemas.ts`, `steps.ts`, `segment.ts`, and the oracle — never in `run.ts`.
   So the one mechanism that *could* bind geo per-segment is dead.

4. **DATA PROOF (staging, read-only).** The incident conversation (`pk =
   $linerobot#conversationKey_user#U810f7671d201fe7ce3ec2ef49ab8d16a`, 76 messages) contains exactly
   **3 map URLs, of which only 2 are `?q=lat,lon` coordinate-bearing** (`parseGeoLinks` mines only
   those — short `maps.app.goo.gl` links carry no coords, per `geo.ts:55-77`):
   - `18.72989755,98.96882414` → property #1 (Mooban Wangtan house, 2.3M)
   - `18.82638337,99.05647534` → property #2 (บ้านหลักชัย, สันทราย, 1.25M)
   These two pins are **14.15 km apart** (different districts), so geohash-6 (~1.2 km) + 1 km radius
   would NOT block them together *if each bound to its own listing*.
   **The single survivor row `4b194544` (property #3, the แม่โจ้ dorm, 13.8M `commercial`)
   persisted with `geom` lat/lon = `18.82638, 99.05648` — i.e. EXACTLY geoHint #2, which belongs to
   property #2, not #3.** Property #3 had *no* map pin of its own. This is the definitive proof: a
   conversation-level hint for one listing was stamped onto another listing's segment. (Query:
   `SELECT id, ST_Y(geom::geometry), ST_X(geom::geometry) FROM listing WHERE id::text LIKE
   '4b194544%'` → `18.82638 / 99.05648`. Only 1 row exists for that owner; `source_group_id` NULL.)

5. **Why "merge" then fires.** Once ≥2 segments carry the same (or near, same geohash-6 cell)
   coordinate, the deterministic blocker links them on `geo_same_cell` / `geo_within_radius`
   (`candidateFinder.ts:78-99`, score `0.6 + 0.3·…`). The blocked pair goes to **Haiku
   `dedupVerify`** (`verify.ts:36`, model `STEP_MODELS.dedup = "claude-haiku-4-5"`,
   `context.ts:14`). With matching coordinates and overlapping admin text, Haiku returned `"merge"`.
   Compounded by the **in-batch pool-push** (`run.ts:248-261`): the moment listing 1 is created it is
   pushed into the live `pool` with its (mis-bound) coordinates, so every later segment in the SAME
   batch is compared against it — turning one bad coordinate into N−1 merges in a single run.

**The merge verdict is the proximate trigger; the geo mis-bind is the upstream cause.** Both are in
Group A's remit. Note the blocker is working as designed (`geo_within_radius` is correct behavior
*for genuinely-near listings*); the bug is that the coordinates fed to it were wrong because geo
isn't bound per-segment. Fixing only the verifier (e.g. raising the model) without fixing the
geo-bind would still under-protect, because two listings that truly share a (wrongly-applied)
coordinate look like a real dup to *any* verifier.

### 2.2 Verified code-path map (line numbers checked against current source; audit's were close)

| Concern | Verified file:line | Note (vs audit) |
|---|---|---|
| Dedup loop + merge/new branch | `packages/pipeline/src/run.ts:205-262` | per-segment; **merge at 236**, **new at 248**. Audit said 205-261/236/248 — correct. |
| Per-segment extract call (geo bug site) | `packages/pipeline/src/run.ts:207-212` | passes `geoHints: input.geoHints` (ALL hints) to every segment — **the mis-bind.** |
| Candidate pool loader | `packages/pipeline/src/run.ts:80-90` (`loadCandidatePool` → `listDedupPool`) | audit cited 80-90 as `listDedupPool`; actually `loadCandidatePool` wraps it. |
| `listDedupPool` (whole catalog, 500-cap, unfiltered) | `packages/db/src/repositories/listings.ts:129-145` | `.from(listings).limit(500)` — **no spatial WHERE** (E3). |
| In-batch pool-push | `packages/pipeline/src/run.ts:249-261` | new listing pushed with its `lat/lon` so later segments block on it. Correct. |
| Deterministic blocking | `packages/pipeline/src/dedup/candidateFinder.ts:45-116` | deed-exact (1.0, `continue`) → geo (cell + haversine ≤ radius, drop if farther per DEAL-09) → trigram/jaccard text; sort desc, cap 8. Correct. |
| LLM verify | `packages/pipeline/src/dedup/verify.ts:23-71` | deed-exact short-circuits to merge (33); else Haiku (36, `STEP_MODELS.dedup`); failure/`intoId` mismatch → "new" (57-64). Correct. |
| Verify model tier | `packages/pipeline/src/steps/context.ts:14` | `dedup: "claude-haiku-4-5"`. |
| Thresholds | `packages/pipeline/src/dedup/config.ts:27-35` | geohash 6, radius 1000 m, trigram 0.55, jaccard 0.50, cap 8 — env-overridable. |
| Dedup prompt | `packages/pipeline/src/steps/prompts.ts:79-84` (`DEDUP_SYSTEM`) | already says "If uncertain, decide 'new' — a false merge is the user-visible defect." Instruction exists; behavior didn't hold. |
| geoHints source | `packages/bot/src/app/pipelineV2Sweep.ts:219-247` | `parseGeoLinks(chatText)` over the whole batch. |
| `[MAP n]` placeholders (ordered, incl. short links) | `pipelineV2Sweep.ts:96-103` (`parseMapUrls`) | distinct from `geoHints`; ordered; not bound to segments. |
| `segment.mapIndex` (computed, never consumed) | `schemas.ts:39`, `steps.ts:58`, `segment.ts:45` | **dead** — `run.ts` never reads it. |
| User-facing confirmation count (E5) | sweep returns `outcome.listings.map(...)` (`pipelineV2Sweep.ts:265-270`); confirmation built from `AppliedProperty[]` upstream | reflects **segment count**, not persisted distinct rows. |

### 2.3 Data / replay evidence (staging, read-only — no writes, no paid LLM calls)

- **DynamoDB** `linerobot-staging-messages`: incident `pk` query → `Count 76`; 17 text msgs, **59
  image attachments**, 0 LINE location msgs; **3 map URLs, 2 coordinate-bearing** (listed in §2.1.4).
  (The 59 images are a Group-B cost signal, out of Group A scope — flagged in §7.)
- **Postgres** `linerobot.public.listing`: only **1 row** for the incident owner — `4b194544`,
  `commercial`, 13.8M, `geom = 18.82638 / 99.05648` (= geoHint #2), `source_group_id` NULL,
  `created_at = updated_at` (no later price refresh). **No pre-existing/seed row had its `updated_at`
  bumped** in the window → confirms **founder item 1: seed/test data was NOT the merge target** (the
  4 merges folded into the freshly-created in-batch survivor, not a seed row). The unfiltered
  whole-catalog pool remains a latent risk (E3) but didn't cause *this* incident.
- **Replay note (planned, not run here):** a full per-segment trace (extracted lat/lon +
  `blockCandidates` scores + `dedupVerify` verdict/confidence per segment) should be captured via the
  **LOCAL Docker/eval harness** or a read-only replay utility — NOT against staging, and NOT with
  paid LLM calls beyond the eval baseline. The export/replay utility itself is **Group C's
  deliverable** (§7); Group A's tests below are constructed to bite without it.

### 2.4 Best-practice survey (entity resolution / record linkage in mature data + LLM systems)

Cited docs: the project's own `docs/research/00-product-principles.md` (DEAL-09 "never text alone",
FIELD-11 as-claimed) and `packages/db/CLAUDE.md` (domain-enum-first migrations); the Anthropic
`claude-api` skill reference (model IDs/pricing, loaded this session — `claude-haiku-4-5` $1/$5 200K
ctx, no `effort`; `claude-sonnet-4-6` $3/$15 1M ctx, adaptive thinking + `effort`;
`claude-opus-4-8` $5/$25). No new external libs are introduced, so no further docs were needed.

Canonical ER/record-linkage patterns and how they map onto our hexagonal step-LLM + eval pipeline:

- **Blocking → scoring → decision, with a human/uncertain tier (Fellegi-Sunter, Dedupe.io,
  Zingg, Splink).** We already have deterministic blocking (`candidateFinder`) → LLM scoring
  (`dedupVerify`) → binary decision. The missing piece is the **clerical-review band**: mature
  systems route *uncertain* pairs to a human queue, not to an automatic merge. We already have
  `createModerationItem` (`run.ts:274`) for gate failures — the same seam can hold uncertain merges
  (`target_type = "merge_request"` is already a supported value in
  `listings.ts:148`). This is the single highest-leverage pattern for the data-loss asymmetry.
- **Asymmetric decision thresholds.** Splink/Fellegi-Sunter set the match threshold by the *cost*
  of a false link. For us a false link = data loss, so the merge threshold must be high and require
  *strong positive evidence* (deed-exact, or geo-very-close AND high text similarity), never a bare
  LLM "yes." This is E1 made concrete.
- **Deterministic guards over the LLM verdict.** Best practice does not trust a free-form LLM verdict
  as the sole arbiter of an irreversible operation; the LLM is one signal gated by deterministic
  rules. Our blocker already provides a `score` and `reasons` per candidate — we should *require* a
  qualifying deterministic reason before honoring a merge, regardless of model tier.
- **Spatial blocking via the index, not a full scan.** PostGIS `ST_DWithin` on a GiST index is the
  standard scalable blocking key; loading the whole catalog (`listDedupPool`, 500-cap) is the
  anti-pattern. This is E3 — but the spatial fetch is shared ingest/DB plumbing (§7).
- **Idempotent linkage runs.** Mature pipelines key writes so a re-run reconciles to the same graph
  rather than duplicating (E10). Our writes are not keyed to a source batch/message today.

**Verdict on "raise the dedup model" (audit open question):** raising Haiku→Sonnet for *verify only*
is cheap (≤8 short calls/batch, 512 out-tokens; ~$0.01–0.03/batch at Sonnet rates) and would help,
**but it is not the primary fix** — the bad coordinate makes the pair look like a true dup to any
model. Recommend keeping Haiku as the default verifier **gated by deterministic guards**, with model
tier as a *tunable secondary lever* validated by the eval scorecard (D16/D2.2 already say "scorecard
justifies model choice"), not a guess.

## 3. Solution options

### Option A — Bind geo per-segment only (minimal, root-cause-targeted)
**Approach.** Stop passing all conversation-level `geoHints` to every segment. Use the
already-computed-but-dead `segment.mapIndex` to bind *one* coordinate to its segment, and pass
**only that segment's** hint (or none) into `extractListing`. The `[MAP n]`/`geoHints` ordering must
be reconciled so index N resolves to a coordinate (today `geoHints` drops non-coordinate short links,
so the index spaces differ — this needs aligning, see §5).
- *Effort:* **S–M.** Touches `run.ts`, the geoHints/mapLinks plumbing in `pipelineV2Sweep.ts`, and
  `singleSegmentFallback`. Some of the index-alignment work straddles the sweep (Group B seam, §7).
- *Risk/blast-radius:* **Low-medium.** Pure narrowing of what each extract sees; can't over-merge
  more than today. Risk is a segment losing a coordinate it legitimately should share (rare).
- *Alignment:* Strong — uses an existing field, removes a latent footgun, no new abstraction.
- *Why / why-not:* Fixes the *cause*. But on its own it doesn't add a safety net for the *next*
  novel over-merge trigger (e.g. a genuinely-shared but wrong coordinate, or an over-eager Haiku
  verdict on text alone). The asymmetry argues for defense-in-depth, not a single point fix.

### Option B — Conservative-merge guard on the verdict (safety net, E1)
**Approach.** Make merge require *strong positive evidence* by construction in `dedupVerify` /
`run.ts`: honor a `"merge"` verdict only when the chosen candidate carries a **qualifying
deterministic reason** — `deed_exact` (already auto-merges), OR `geo_same_cell`/`geo_within_radius`
**at a tighter radius AND** a text-similarity reason, OR a high blocker `score` floor. A bare
LLM "merge" on a weak block (e.g. text-only, or geo-only with low confidence) is **downgraded to a
moderation `merge_request`**, not an automatic fold. Add a confidence floor on `verdict.confidence`.
- *Effort:* **S.** Localized to `verify.ts` + a small branch in `run.ts:236` (route weak merges to
  `createModerationItem(db,"merge_request",…)` and persist as new). No schema change (merge_request
  already valid).
- *Risk/blast-radius:* **Low.** Strictly *reduces* automatic merges → strictly reduces data-loss
  risk. Worst case: more dups land (recoverable) + more moderation items.
- *Alignment:* Strong — encodes the asymmetry the project explicitly states; reuses the existing
  moderation seam; no new port/interface (anti-over-engineering rules satisfied).
- *Why / why-not:* Directly targets the irreversible-loss asymmetry and protects against *any*
  future over-merge trigger, not just geo. Doesn't fix the bad coordinate (a deed/geo-very-close +
  text pair would still legitimately pass the guard) — so weaker alone than paired with A.

### Option C — A + B together (recommended): fix the cause AND add the asymmetric guard
**Approach.** Ship Option A (geo binds per-segment) *and* Option B (merge requires strong positive
evidence; weak/uncertain merges → moderation as new rows). Plus E5 (confirmation reflects persisted
distinct rows). Defer E3 (spatial pool) and E10 (idempotency) as flagged cross-group items.
- *Effort:* **M.** Sum of A+B; both are small and independent enough to land as two increments.
- *Risk/blast-radius:* **Low.** Each piece only ever *reduces* merges.
- *Alignment:* Strongest — root cause + defense-in-depth + honest user copy, all within existing
  seams.
- *Why / why-not:* Best matches the founder's "this is the primary path, make it robust" framing and
  the loss asymmetry. Slightly more than the minimum, but A-alone leaves the system one novel bug
  away from silent loss again; the guard is the durable net.

### Option D — Raise the verify model tier (Haiku → Sonnet) ± a second-pass
**Approach.** Change `STEP_MODELS.dedup` to `claude-sonnet-4-6` (optionally with adaptive thinking)
so the verdict on an irreversible op uses a stronger model; optionally add a confirm-merge second
call.
- *Effort:* **XS** (one line) to S (second pass).
- *Risk/blast-radius:* **Low** technically; **cost** rises (~3× per verify call, still small).
- *Alignment:* Partial — D2.2/D16 say model tier is scorecard-justified, so a *blind* swap violates
  "no config nobody validated." Doesn't fix the cause.
- *Why / why-not:* Cheap and plausibly helps at the margin, but a wrong-coordinate pair looks like a
  true dup to any model — **insufficient as the primary fix.** Keep as a *tunable secondary lever*
  inside Option C, validated by the eval scorecard, not a standalone solution.

## 4. Recommended direction

**Option C (A + B), with D folded in only as a scorecard-validated tunable.** Rationale:

- **A fixes the proven root cause** (geo mis-bind) using a field the code already computes — the
  cleanest, smallest change that removes the actual defect.
- **B encodes the irreversible-loss asymmetry as a structural guard** so the *next* novel over-merge
  trigger degrades to a recoverable dup + a moderation item, not silent loss. This is the durable
  win and the one most aligned with the founder's "core path must be robust" north star.
- **E5** ships alongside (small, user-trust-critical): the confirmation must say how many *distinct
  rows persisted*, not how many segments were seen — otherwise we'd have told this user "5 added"
  while 1 existed.
- **D (model tier)** is *not* the headline fix; it stays a lever the eval scorecard can pull later.
- **E3 (spatial pool) and E10 (idempotency) are flagged as cross-group dependencies (§7), not built
  here** — E3's spatial fetch is shared DB/ingest plumbing and E10 overlaps Group B/D.

Net behavior change: merges become rare and evidence-gated; uncertain pairs surface to humans;
distinct dumps stay distinct; the user is told the truth.

## 5. Implementation plan (NOT executed)

> Two increments, each independently reviewable. No new ports/interfaces (anti-over-engineering
> rules 1–3). Behavior only ever *reduces* automatic merges.

### Increment A1 — geo binds per-segment (root cause)
**Steps**
1. **Reconcile the two index spaces** so a segment's `mapIndex` resolves to a coordinate. Today
   `[MAP n]` (`parseMapUrls`, ordered, incl. short links) and `geoHints` (`parseGeoLinks`,
   coordinate-only, drops short links) have **different indices**. Change the sweep to build a single
   ordered `mapLinks` list and a parallel `coordByMapIndex: (string|null)[]` (coordinate or null for
   a short link), so `[MAP n]` ↔ `coordByMapIndex[n]` line up. Files: `pipelineV2Sweep.ts:74-108`
   (buildTranscript already returns `mapLinks`; surface the parallel coord array) and
   `pipelineV2Sweep.ts:242-249` (pass the array into `PipelineInput`). *This touches the sweep —
   coordinate with Group B (§7) for E2.*
2. **Carry per-segment geo into extract.** In `run.ts:205-212`, resolve the segment's coordinate
   from `segment.mapIndex` → `coordByMapIndex[mapIndex]` and pass **only that** as the segment's
   `geoHints` (a single-element array, or `[]` when the segment has no bound pin). Remove the blanket
   `geoHints: input.geoHints`.
3. **Fallback safety.** When `segment.mapIndex` is null and there is exactly ONE coordinate for the
   whole conversation AND exactly ONE segment, it may bind; otherwise **bind nothing** (do not spray
   all hints). Update `singleSegmentFallback` (`segment.ts:53-66`) accordingly.
4. **Keep `PipelineInput.geoHints`** as the conversation-level array for backward compat, but stop
   using it as the per-segment source.

**Files (file:line)**
- `packages/bot/src/app/pipelineV2Sweep.ts:74-108, 242-249` (ordered coord-by-map-index; *Group B
  seam*).
- `packages/pipeline/src/run.ts:60-62` (input shape), `:205-212` (per-segment geo bind),
  `:191-199` (segment input still gets all hints for segmentation context — unchanged).
- `packages/pipeline/src/steps.ts` (extend `ExtractInput`/`PipelineInput` only if a new
  per-segment field is needed — prefer reusing `geoHints` as the now-per-segment slot to avoid a new
  field).
- `packages/pipeline/src/steps/segment.ts:53-66` (fallback).

### Increment A2 — conservative-merge guard + honest confirmation (E1, E5)
**Steps**
1. **Require strong positive evidence to auto-merge.** In `dedupVerify` (`verify.ts:56-70`), after a
   `"merge"` verdict, check the chosen candidate's blocker `reasons`/`score`: auto-merge ONLY if it
   has `deed_exact` (already short-circuited at :31-34) OR (`geo_within_radius`/`geo_same_cell` at a
   tightened radius AND a `text_similar` reason) OR `score ≥` a strong-evidence floor AND
   `verdict.confidence ≥` a floor. Otherwise return a new `decision: "merge_uncertain"` (or a flag on
   `DedupResult`) carrying the candidate id + reasons.
2. **Route uncertain merges to moderation as a NEW row.** In `run.ts:236`, branch: `"merge"` →
   fold as today; `"merge_uncertain"` → `persistNewListing(...)` (no data loss) **and**
   `createModerationItem(db, "merge_request", newId, "uncertain_dedup:<intoId>")`
   (`run.ts:274`, `listings.ts:148` already accepts `"merge_request"`). The human reviewer can later
   confirm/reject the merge.
3. **Tighten the merge-geo radius** without touching the *blocking* radius. Add a separate
   `DEDUP_MERGE_RADIUS_M` (default tighter than the 1000 m block radius, e.g. 150 m) in
   `config.ts:27-35` — env-overridable, validated by eval (do not hand-tune in prod, per root
   `CLAUDE.md`). Blocking stays generous (recall); merging is strict (precision on an irreversible
   op).
4. **E5 — confirmation reflects persisted distinct rows.** The sweep already returns one
   `AppliedProperty` per `outcome.listings` entry with `isNew` (`pipelineV2Sweep.ts:265-270`).
   Make the user-facing confirmation count **distinct persisted listing ids** (dedupe by
   `propertyId`, and/or split into "added N new / updated M existing") rather than raw segment count.
   Files: the confirmation view builder consuming `AppliedProperty[]` (trace from
   `pipelineV2Sweep.ts` callers → `core/handlers/views.ts`). *Copy is user-facing — see §7 alignment
   note.*
5. **Model tier (D) as a tunable, not a default change.** Leave `STEP_MODELS.dedup = haiku`
   (`context.ts:14`); document that the eval scorecard (below) is the gate for any Sonnet swap. If
   the new eval archetype shows Haiku under-protecting *even with the guards*, raise to
   `claude-sonnet-4-6` and re-baseline — never blind-swap (D2.2/D16).

**Files (file:line)**
- `packages/pipeline/src/dedup/verify.ts:23-71` (strong-evidence gate; new uncertain outcome).
- `packages/pipeline/src/dedup/config.ts:27-35` (`DEDUP_MERGE_RADIUS_M`, merge-confidence floor).
- `packages/pipeline/src/run.ts:230-262` (route uncertain → new + moderation).
- `packages/pipeline/src/steps.ts:117-122` (`DedupResult` may gain an `uncertain` flag/reason —
  additive).
- `packages/bot/src/app/pipelineV2Sweep.ts:265-270` + `core/handlers/views.ts` (E5 confirmation).

### New/changed unit tests
- `packages/pipeline/test/` — **geo-bind:** a multi-segment input where segment 2 has its own
  `mapIndex`→coord and segment 3 has none asserts segment 3's extract receives `[]` hints (not
  segment 2's coord). Break the fix → test goes red (segment 3 extracts with a foreign coord).
- **conservative-merge:** a blocked pair with geo-only (no text) and a Haiku "merge" verdict asserts
  the outcome is **new + moderation `merge_request`**, not a fold. A deed-exact pair still
  auto-merges. A geo-very-close + text pair still auto-merges.
- **merge radius:** two listings 500 m apart (inside the 1 km *block* radius, outside the 150 m
  *merge* radius) with a Haiku "merge" → routed to uncertain/new, not folded.
- **E5:** given an outcome with 5 segments collapsing to 2 persisted ids, the confirmation reports
  "2", not "5".
- **route-compat / regression:** existing `pipelineV2Sweep.test.ts` DM-no-group expectations
  unchanged (the geo fix is orthogonal to source_group_id).

### Eval cases (tie to `npm run eval` / `packages/pipeline/src/eval`)
The current eval is **blind to this failure** — `runner.ts:235,249` hardcode `geoHints: []`, and
`scoreDedupCase` (`runner.ts:141-186`) runs only `blockCandidates` on a 1-element pool (never the
`runPipeline` merge loop, never `dedupVerify`). Two additions:
1. **New archetype — "N distinct listings, expect N rows, 0 merges."** Add to `cases.ts:loadCases()`
   (a `dump-distinct-*` case from 3–5 spatially-separated specs, e.g. reuse the 3-spec dump shape at
   `cases.ts:60-67` with distinct districts) with `expected.duplicatePairs: []`. This is the exact
   archetype the audit (E7) says is missing — today dedup is scored on only 8 *repost* cases
   (`eval-baseline.json` shows `dedup casesScored:8`).
2. **Geo-mis-bind regression case.** Feed `geoHints` of TWO far-apart coordinates into a 5-segment
   transcript (mirroring the incident) and assert the pipeline yields **5 distinct rows**. This
   requires the eval to exercise the *real* merge path, so also:
   - extend the runner to pass real per-segment geoHints (stop hardcoding `[]` at `runner.ts:235,249`)
   - add a dedup-decision scorer that runs the actual `dedupVerify` guard over a multi-segment case
     (oracle mode can return the incident-shaped extractions). Score = distinct-rows-preserved.
   Re-baseline `eval-baseline.json` with `EVAL_LLM=anthropic` after the change (advisory, D21 — never
   blocking).

### Migrations
- **None for A1/A2 core** (merge_request moderation type already exists; merge-radius is config).
- If a new dedup outcome value is persisted anywhere as an enum, follow `packages/db/CLAUDE.md`:
  add to the `@line-robot/domain` zod enum first → `npm run generate -w @line-robot/db` → hand-fix
  the migration. The recommended design keeps the "uncertain" state as a *moderation row* (existing
  schema), so **no migration is expected.**

### Rollout / feature-flagging
- Both increments are behavior-narrowing (fewer auto-merges) and safe to ship un-flagged. If a flag
  is wanted, gate the conservative-merge guard behind an env switch defaulting **on** (so the safe
  behavior is the default — not "config nobody sets" since it has a real default and a test).
- Merge thresholds (`DEDUP_MERGE_RADIUS_M`, confidence floor) are env-overridable defaults, retuned
  via the eval scorecard, never by hand in prod (root `CLAUDE.md` dedup-thresholds rule).

### Verification (project review cadence)
- **Every change:** `npm run typecheck`, `npm run lint`, `npm run test`, coverage threshold;
  `npm run test:integration -w @line-robot/pipeline` (Docker PG) for the merge-routing path.
- **Increment review:** `/increment-review` (spec auditor vs this plan; `/code-review`; simplicity
  critic vs anti-over-engineering rules) + skeptic. Schema/flow-bearing → `/alignment-review`
  against `docs/research/00-product-principles.md` (DEAL-09, FIELD-11, and the E5 copy heuristics).
- **Eval:** `npm run eval` (oracle smoke + `EVAL_LLM=anthropic` baseline) showing the new
  distinct-dump and geo-mis-bind cases pass; advisory delta reported (D21).
- **Stage gate:** the incident transcript, once Group C lands the export/replay path, becomes a
  locked Tier-A regression case (the founder already knows the ground truth = 5 distinct).

## 6. Open questions / founder decisions
1. **Uncertain-merge UX:** route weak merges to the **moderation queue as new rows** (recommended —
   zero data loss) vs auto-merge-but-flag vs always-new? (Recommendation: new + moderation.)
2. **Merge-radius value:** `DEDUP_MERGE_RADIUS_M` default — 150 m proposed; founder/eval to confirm
   (true same-property pins are typically <50 m; same condo building <30 m).
3. **Model tier:** keep Haiku-guarded (recommended) vs raise dedup verify to `claude-sonnet-4-6`?
   Decide from the eval scorecard after A2, not now (cost is ~3× per verify call, still cents/batch).
4. **E5 copy:** exact Thai/EN wording for "added N new / updated M" — founder taste call
   (FOUNDER-QUEUE candidate).
5. **Reverse-merge tooling:** do we need a one-click "un-merge" in moderation for historical
   bad merges? (Out of scope here; flag for backlog.)

## 7. Cross-group dependencies (flag, don't resolve)
- **E2 segment-scoped geo (ingest/sweep half) — Group B.** A1 step 1 must touch
  `pipelineV2Sweep.ts:74-108` to emit an ordered coord-by-map-index. The *binding logic* is Group A;
  the *sweep plumbing* is shared with Group B's batching/chunking work — coordinate so we don't
  double-edit `buildTranscript`. **Do not design Group B's fix.**
- **E3 candidate-pool scaling — Group B (DB/ingest).** `listDedupPool` (`listings.ts:129-145`) is
  unfiltered whole-catalog (500-cap); a PostGIS `ST_DWithin`/geohash spatial fetch is the scale fix
  and reduces a bad block's blast radius, but it's shared DB plumbing. Flag only.
- **E10 write idempotency — Group B/D.** Keying writes to a source batch/message so a re-run
  reconciles instead of duplicating overlaps the sweep watermark + DM machinery. Flag only.
- **E5 confirmation copy — user-facing.** The count fix is Group A; the *wording* is design-bearing
  (alignment register + FOUNDER-QUEUE).
- **Group C (eval/replay).** The export/replay utility that turns this real conversation into a
  locked Tier-A case is Group C's deliverable; Group A's new eval archetype + runner geoHints change
  are built here, but the real-conversation fixture loader is Group C.
- **59-image cost / sweep timeout — Group B.** The incident's 59 attachments dominate cost/latency
  (founder items 3 & 4) — noted as evidence, not Group A's fix.

## 8. Out of scope / deferred
- PostGIS spatial candidate fetch (E3) — Group B.
- Image-classification caching / preprocess-at-ingest (Group B notes 3 & 4).
- Batch chunking / oversized-dump backpressure (Group B).
- Idempotency keys for writes (E10) — Group B/D.
- "DM = group of one" unification (Group D).
- Reverse-merge / un-merge moderation tooling (backlog).
- Raising the dedup model tier as a *default* — deferred to a scorecard-justified decision, not part
  of the core fix.

<!-- RPI: R+P COMPLETE -->
