# Plan 23 — Group C: Eval, replay & hill-climbing infrastructure (+ architecture) — Research + Plan (RPI)
> Status: R+P COMPLETE · Source: plans/23-ingestion-pipeline-audit.md (Group C) · Phase: Research+Plan ONLY (no implementation)

## 1. Problem & scope

On 2026-06-15 a real LINE user dumped ~76 messages = 5 distinct property listings into a 1:1 DM
(`user#U810f7671d201fe7ce3ec2ef49ab8d16a`). The pipeline extracted all 5 but **persisted only 1** — dedup
gave 4 of the 5 a `"merge"` verdict and silently folded them into the first listing. That correctness bug is
**Group A's** to fix. Group C's job is the loop **around** the fix: founder item 2 — *"Do we have this set of
messages saved, so we can attempt to eval against them… A test pipeline like this could be useful long term,
so when errors like this happen, they can be flagged as test cases to hill-climb for, and test regressions."*

Scope (this artifact only — no implementation):
- Verify/refute the audit's claims about what eval infrastructure exists and what's missing.
- Honestly assess our harness against best-in-class LLM-app evaluation, anchored to the anti-over-engineering
  rules and D21 (eval is advisory, never blocking).
- Close the **prod failure → permanent golden case → hill-climb** loop. The first deliverable must make THIS
  incident a permanent **Tier-A regression case** (truth is known: 5 distinct listings, 0 merges) and add the
  missing **E7 archetype** ("N distinct listings in one conversation, expect N rows, 0 merges").
- Fold in cross-cutting inputs **E6** (auto-capture failed batches as eval candidates), **E7** (the missing
  archetype), **E8** (full per-call I/O **trace store** + per-step timing — promoted to a committed P3 deliverable;
  see §3 Option D) as options, scored honestly.

Out of band (flagged, never designed here): Group A owns the dedup fix the new case will measure; Group B owns
image-preprocess/caching that the export path and failure-capture triggers depend on.

---

## 2. Research findings

### 2.1 Root cause / gap analysis (evidence + file:line)

The harness is genuinely solid for **synthetic** evaluation, but there is **no path from a real conversation to
a scored eval case**. The audit's 3-part gap is **accurate and, on inspection, slightly understated** — there is
a 4th, subtler gap (the oracle can't drive a real case). Concretely:

1. **The messages ARE saved + replayable. CONFIRMED (code + live staging).**
   - `packages/bot/src/adapters/dynamodb/messageRepository.ts:12-61` — ElectroDB `message` entity, PK
     `["conversationKey"]`, SK `["timestamp","messageId"]`, `casing:"none"`. Stores `text`, `attachment
     {s3Key, contentType}` (lines 32-38), `location {lat,lon,title,address}` (23-31), `direction`,
     `contentType`, `timestamp`, `messageId`, `kind`, `userId`/`groupId`/`senderUserId`.
   - `findSince(conversationKey, sinceMs)` (repo:129-139) does `byConversation … gte(timestamp) … pages:"all"`
     then `filter(timestamp > sinceMs)` — the exact no-loss/no-dup replay primitive. Its only production caller
     is `ingestionSweep.ts:169`.
   - **Live staging read (read-only, `AWS_PROFILE=line-robot ap-southeast-1`):** PK
     `$linerobot#conversationKey_user#U810f7671d201fe7ce3ec2ef49ab8d16a` returns **exactly 76 items**.
     Breakdown: **17 text** (incl. 6 outbound `"Your listings"` rich-menu echoes, `direction:"out"`),
     **59 image** (`contentType:"image"`, `direction:"in"`, each with `attachment {s3Key:"conv/user#…/…/content.jpg",
     contentType:"image/jpeg"}`), **0 `location` messages**.
   - **Key replay-evidence finding (refines the audit):** the **map pins arrive as plain text messages**
     carrying `https://www.google.com/maps?q=18.72989755,98.96882414` URLs (3 such text messages found), NOT as
     DynamoDB `location` map attributes. So the geo on this case is reconstructed by `parseMapUrls`/`parseGeoLinks`
     from message **text**, surfaced to the pipeline as conversation-level `geoHints` + `[MAP n]` markers
     (`pipelineV2Sweep.ts:96-103, 247`). This matters for the export design and corroborates Group A's
     "geo bound to the conversation, not the segment" hypothesis.
   - SK shape on a real row: `$message_1#timestamp_1781006004409#messageId_01KTP3NV57RQNVQR9DC5Z3CV8W#out#0`
     (asc-sortable; `findSince` replay-faithful).

2. **The harness ONLY ingests synthetic specs. CONFIRMED.**
   - `loadCases()` (`packages/pipeline/src/eval/cases.ts:45-81`) builds 62 cases purely from `specCatalog(24)`:
     24 calm + 24 messy singles + 6 three-listing dumps + 8 dedup-trap reposts. Every case is `tier:"B",
     source:"synthetic"` via `toCase()` (cases.ts:28-38). `loadCases()` is the runner's sole input
     (`runner.ts:215`). It reads **no directory** — there is no Tier-A loader.

3. **No export/replay utility exists today. CONFIRMED by grep.**
   - `grep -rni "exportTranscript|replayConversation|buildFixture|dumpConversation|exportCase|snapshotConversation"`
     over `packages/` → **zero hits**. The only transcript-builder is `buildTranscript()`
     (`pipelineV2Sweep.ts:74-108`), which lives in `packages/bot` (the app layer) and is **not** the eval
     transcript shape (the synthetic generator emits a different, simpler `[Nm] sender: text` transcript —
     `generator.ts:276-282`).

4. **Tier A is parked with NO real cases loaded. CONFIRMED.**
   - The directory exists but is empty: `packages/pipeline/goldenSet/tierA/` contains only `README.md`
     ("Tier A … parked per D2.1/Q6. Cases land here with source: 'tierA'; nothing depends on this until founder
     labeling."). `cases.ts:43` references `goldenSet/tierA/` in a comment but **no code reads it** (grep: the
     only `goldenSet` mention in `*.ts` is that comment). The `EvalCase` type already has the `tier:"A"` /
     `source:"tierA"` slots (cases.ts:6-18) — the schema is ready; the loader and fixtures are not.

5. **Scorer shape. CONFIRMED (per-step + per-field + dedup pair P/R).**
   - Per-step scores aggregated in `runner.ts:313-322` into `card.perStep` for `segment / extract / dedup /
     translate / gate` (`classify` stays `null` — needs image fixtures; runner.ts:29). Per-field aggregate
     (`card.perField`, runner.ts:318-322) over `SCORED_FIELDS` (`runner.ts:34-42`: dealType, propertyType,
     titleDeedType, urgency, province, amphoe, tambon) + numeric price/bedrooms/bathrooms.
   - Scorers (`packages/pipeline/src/eval/scoring.ts`): `scoreExact` (15-22, enums), `scoreNumeric`
     (28-42, relative tolerance), `scoreSegmentation` (50-52, exact count match), `scoreDedup` (63-76, pair
     precision/recall with `[a,b]≡[b,a]` canonicalization). **`scoreFuzzy` (45-47) THROWS** — "LLM-judge scorer;
     implemented in Stage 2" — i.e. **the LLM-as-judge slot is declared but unimplemented**.
   - Honest caveats are written into the code: `scoreGateResult` (runner.ts:108-138) is a "CONTRACT + PARSE-HEALTH
     smoke" (recomputes `runGate`'s own deterministic floors → a well-parsing model scores 1.0 by construction);
     `scoreTranslate` (runner.ts:81-106) is an INVARIANT check (non-empty + target-script ratio), not adequacy.
     These are floors, not quality metrics — accurate self-description.

6. **Oracle vs real. CONFIRMED — with a load-bearing subtlety the audit didn't name.**
   - `EVAL_MODE = process.env.EVAL_LLM ?? "oracle"` (runner.ts:195). Oracle path:
     `OracleStepLlm` (`eval/oracle.ts:15-102`) answers `segment`/`extract`/`translate`/`gate` **from the case's
     own `ListingSpec[]`** (oracle.ts:38-49 maps one segment per spec; oracle.ts:69-101 returns the spec's fields
     for extract). A perfect pipeline ⇒ 1.0 — it validates **harness plumbing**, not model quality
     (oracle.ts:7-14, runner.ts:30). Real path: `EVAL_LLM=anthropic` + `ANTHROPIC_API_KEY` constructs
     `AnthropicStepLlm` (runner.ts:198-208) — the actual baseline.
   - **4th gap (mine, beyond the audit's 3):** the oracle is **spec-driven**. A real Tier-A case has **no
     `ListingSpec[]`** — it's real transcript text + a hand-authored `ExpectedOutcome`. Under `EVAL_LLM=oracle`,
     a specs-less case feeds `new OracleStepLlm([])` (runner.ts:212) → `segment()` returns 0 segments,
     `extract()` returns `null` (oracle.ts:75 `this.specs[0]` is undefined) → the case scores ~0 **falsely**.
     **Therefore Tier-A cases are only meaningful under `EVAL_LLM=anthropic`** and MUST be skipped/marked n/a
     under oracle. The runner has **no tier filter today** (`grep` for `tier`/`EVAL_TIER` in runner.ts → only
     comments), so naively adding Tier-A cases to `loadCases()` would corrupt the oracle smoke. Any loader plan
     must gate on `source/tier`.

7. **Baseline is D21-advisory (always exits 0). CONFIRMED.**
   - `runner.ts:325-339` reads `eval-baseline.json`, computes per-step `baselineDelta`, prints it.
     `runner.ts:361` `process.exit(0)` with the comment "D21: advisory — never a failing exit, even on
     regression." `renderScorecard` derives PASS/FAIL only for display (scorecard.ts:64-66). The committed
     `eval-baseline.json` is `mode:"anthropic", caseCount:62`, all per-step ≈1.0 except translate 0.984 — a real
     model baseline. `eval.config.ts` holds advisory thresholds (classify .95 / segment .9 / extract .9 / dedup
     .9 / translate .85 / gate .95). No external eval framework: `packages/pipeline/package.json` deps are only
     `@anthropic-ai/sdk`, `@line-robot/db`, `@line-robot/domain`, `sharp`, `zod` — the harness is 100% in-repo.

**Net:** the audit's "3-part gap (export/replay path, ground-truth labelling, loader)" is **correct and
complete as far as it goes**, plus the 4th gap above (oracle can't drive a real case). The dedup scorer is also
**synthetic-only**: `scoreDedupCase` (runner.ts:141-186) hand-builds a one-row pool + a synthetic repost from
`evalCase.specs[0]` and scores **only** `blockCandidates` (the deterministic blocker), NOT the LLM `dedupVerify`
verdict — so the current dedup score measures *blocking recall on reposts*, and has **no notion of "N distinct
listings that must NOT merge."** That is exactly why the incident's failure mode (false-merge / over-block) is
invisible to the eval today (E7).

### 2.2 Verified code-path map

| Concern | File:line | Verified note |
|---|---|---|
| Eval entrypoint | `package.json:18` → `packages/pipeline/package.json:12` → `runner.ts` | `npm run eval` → `node src/eval/runner.ts`. ✔ |
| Case schema + loader | `eval/cases.ts:6-26` (types), `:45-81` (`loadCases`) | `EvalCase{id,tier,source,transcript,expected,specs}`; loader is synthetic-only. ✔ |
| Synthetic generator | `synthetic/generator.ts:193-293` (`generateCase`), `spec.ts` (`ListingSpec`) | spec→transcript, expected known by construction. Audit cited `:193-250`; real end is `:293`. ✔ (minor) |
| Oracle | `eval/oracle.ts:15-102` | spec-driven; HARNESS ONLY; specs-less case → null extract. ✔ + 4th-gap finding. |
| Per-step / per-field aggregation | `runner.ts:313-323` | segment/extract/dedup/translate/gate + perField; classify null. ✔ |
| Scorers | `eval/scoring.ts:15-76` | exact/numeric/segmentation/dedup-P/R; `scoreFuzzy` THROWS (45-47). ✔ |
| Dedup scoring (synthetic-only) | `runner.ts:141-186` | scores `blockCandidates` on a synthetic repost; ignores `dedupVerify`. ✔ |
| Baseline + D21 exit | `runner.ts:325-339, 361`; `eval-baseline.json` | delta reported; `exit(0)` always. ✔ |
| Advisory thresholds | `eval.config.ts` | per-step thresholds, never blocking. ✔ |
| Message store + replay | `messageRepository.ts:12-61` (entity), `:129-139` (`findSince`) | saved + replayable; staging-confirmed 76 rows. ✔ |
| Transcript builder (bot layer) | `pipelineV2Sweep.ts:74-108` (`buildTranscript`) | needs `ClassifiedMedia[]` (kind) → the export snag; emits `[IMG n]` + `[MAP n]`. Exported, no test. ✔ |
| Sweep replay caller | `ingestionSweep.ts:169` | `findSince(key, lastIngestedAt)`; the prod replay path to mirror. ✔ |
| Tier-A slot | `goldenSet/tierA/README.md` only | empty; no loader reads it. ✔ |
| Per-step tracing | (none) | `grep trace/span/latencyMs/stepTiming` in pipeline/bot-app → **zero**. Only `CostLog` (`cost.ts`) aggregates $; no per-step timing/decision trace (E8). ✔ |
| Image-classify cache | (none) | `grep classifyCache/classification.*cache/media_classification` → **zero** (Group B territory). ✔ |

Audit line-number corrections: per-step models are in **`packages/pipeline/src/steps/context.ts:8-17`** (`STEP_MODELS`), not `context.ts:9-16` (no such file at that path). `dedupVerify` model = `STEP_MODELS.dedup` = `claude-haiku-4-5` (verify.ts:36-54) — confirmed. Pricing in `cost.ts:22-26` (haiku $1/$5, sonnet $3/$15, opus $5/$25) matches the cached claude-api model catalog.

### 2.3 Data / replay evidence (live staging, read-only — nothing mutated)

A faithful replay/export of THIS conversation must reconstruct, per message: `text` (incl. the maps-URL text
messages that carry geo), `attachment {s3Key, contentType}` (59 images), `contentType`, `direction`, `timestamp`
(ms epoch — drives burst/gap segmentation), `messageId`, `kind`, `userId`. `location` is **empty** for this case
(geo is in text). The `StoredMessage` domain type (`packages/bot/src/core/domain/message.ts:121-130`) already
carries all of these. The 6 outbound `"Your listings"` rows are bot echoes — an export should keep only inbound
(`direction:"in"`) or mirror `ingestionSweep`'s watermark semantics (it ingests since `lastIngestedAt`; the
outbound echoes are interleaved). **Open evidence still worth grabbing later** (not blocking R+P): the exact
per-segment extracted lat/lon + `blockCandidates` + `dedupVerify` verdicts for the incident (Group A's trace),
and the image count/classify cost (Group B's sizing) — both belong to the trace work (E8) / their owning groups.

### 2.4 Best-practice survey (for an LLM-extraction app) + how we map

Sources consulted: cached **claude-api** skill — `shared/agent-design.md` (eval/observability framing),
`shared/tool-use-concepts.md` (structured outputs / strict tools), `shared/models.md` + `shared/prompt-caching.md`
(model ids/pricing, cache-hit verification via `usage.cache_read_input_tokens`). No Anthropic "evals / LLM-as-judge"
page is cached in `docs/llms.txt` (checked: the index has LINE/Astro/AWS/Pulumi but no platform.claude.com eval
doc) — so the judge-specific guidance below is from general LLM-app practice, flagged as not-doc-grounded, and the
plan does NOT build a judge in v1 (see §3). Live source if we later need it: `platform.claude.com/docs/.../evals`
via the documentation-downloader skill.

Best-in-class pattern → our state:
- **Golden dataset sourced from prod (failure→locked case).** *Missing.* Tier-A parked, no loader. This is the
  highest-leverage gap and the founder's explicit ask. Our synthetic set is above-average **breadth**; it lacks
  **real-world fidelity** (Thai chat chaos, real geo-in-text, the exact dump that broke us).
- **Per-step evals + LLM-as-judge for fuzzy fields, deterministic scorer as the floor.** *Partial.* We have the
  deterministic floor (exact/numeric/dedup-P/R) and honest invariant checks for translate/gate. `scoreFuzzy`
  is a declared-but-throwing slot. **Above-average that we don't over-claim** — the code labels its smokes as
  smokes. Best-in-class adds a judge for free-text adequacy; we should NOT add one until a second real need
  exists (anti-over-engineering rule 1).
- **Prompt/version registry + experiment tracking (runs tagged to a prompt version, A/B vs golden).** *Missing.*
  No `promptVersion`/experiment id anywhere (grep → zero). The baseline is a single committed JSON snapshot;
  there's no notion of "this score came from prompt vX." For real hill-climbing you want to attribute a score
  delta to a prompt change. This is real best-practice but heavy; v1 can approximate it with git (the baseline
  JSON + prompts are versioned in the same commit).
- **Tracing/observability (per-step latency + tokens + decision traces).** *Missing in prod* (E8). We have
  `CostLog` aggregate $ only — no per-step timing, no per-conversation trace. This is what makes "why slow/wrong"
  answerable from data. Genuinely valuable and ties to Group B's timeout work, but it's a separate build.
- **Failure-triage loop (auto-capture failures → eval candidates).** *Missing* (E6). Abandoned/timed-out/
  low-dedup-confidence batches are not captured anywhere for replay. Closes Group B note 4 ↔ Group C note 2.
- **Cost/latency budgets as first-class eval outputs.** *Partial.* `card.costUsd` is printed; latency is not
  measured (no timing). Best-in-class surfaces "more accurate but 3× slower" — we can't see the slower today.
- **Targeted dedup suite incl. "many distinct listings must stay separate."** *Missing* (E7) — the exact incident
  archetype. Current dedup traps are same-property reposts only.

**Honest verdict:** the harness is **above average** for a young product — hexagonal step-LLM pipeline, per-step
models, committed real baseline, deterministic-then-LLM dedup, cost logging, and (importantly) **honest
self-labeling** of which scores are smokes. What's genuinely missing and worth building, in leverage order:
(1) the prod-failure→golden loop (E7 archetype + this incident as Tier-A), (2) failure auto-capture (E6),
(3) per-step tracing (E8). Prompt-version/experiment tracking and an LLM-judge are real best-practice but
**aspirational** for our scale — defer until a second need exists.

---

## 3. Solution options

All options keep the harness **in-repo, D21-advisory, deterministic-first**. They differ in how far up the
best-practice ladder they climb. Effort is rough dev-days; blast-radius = how much existing code changes.

### Option A — Minimal: in-repo Tier-A fixture loader + this incident + E7 archetype (recommended core)

**Approach.** Three small pieces, no new packages, no infra:
1. **Tier-A loader.** Extend `loadCases()` (cases.ts:45-81) to also read JSON fixtures from
   `packages/pipeline/goldenSet/tierA/*.case.json` (each = `{id, transcript, expected, source:"tierA", tier:"A"}`,
   `specs:[]`). ~20-30 lines + a tiny `readFixtures()` helper.
2. **Oracle/tier gating.** In `runner.ts`, Tier-A cases (no specs) are **skipped under `EVAL_LLM=oracle`** (n/a,
   not 0 — the 4th-gap fix) and scored normally under `EVAL_LLM=anthropic`. Add the missing **distinct-listings
   dedup metric**: for a case whose `expected.duplicatePairs` is empty but `expected.properties.length > 1`,
   score "0 false merges" = persisted-distinct-count vs expected-count (drives E7 + the incident).
3. **Author two cases by hand.** (a) The **E7 synthetic archetype** as a Tier-B case (so it runs under oracle
   too): a multi-listing dump in *different districts*, `expected: N properties, 0 duplicatePairs` — built from
   `specCatalog` slices the generator already supports (`generator.ts` multi-spec path). (b) The **incident
   Tier-A case**: a hand-authored transcript fixture with the founder-verified truth (5 distinct listings, 0
   merges, key fields per listing).

**buildTranscript snag handling.** Option A authors the Tier-A transcript **by hand** from the known incident
(the 5 listings are enumerated in the audit §0) rather than running an exporter — so it does NOT depend on
classified images. Images are represented as plain `[IMG n] property` markers in the fixture text (the segmenter
only needs the marker, not the classification, to attribute media; classification quality is `classify`'s job,
which stays n/a). Geo is the maps-URL text, exactly as it arrives. This sidesteps the
buildTranscript-needs-classified-images problem entirely for v1.

**Trade-offs.** Effort ~1.5 days. Risk/blast-radius **low** — additive loader + one runner branch; existing 62
cases untouched (oracle stays 1.0). Alignment **high** (uses existing `EvalCase` slots, in-repo, D21). Anti-over-
engineering: no interface, no port, no config nobody sets, one new small file. **Why:** delivers the founder's
exact ask (this failure is now a locked regression case we hill-climb on) at minimal cost. **Why-not:** doesn't
automate capture of *future* failures (still hand-authored), no tracing, no prompt-versioning.

### Option B — Option A + export/replay utility (one-action snapshot of a real conversation)

**Approach.** Add a small **export script** (`packages/pipeline/scripts/exportCase.ts` or a bot-side script that
reuses `findSince`) that: reads `findSince(conversationKey, 0)`, builds the eval-transcript text, and writes a
`tierA/<id>.case.json` **stub** with `expected` left as a TODO for the founder to fill. The founder then labels
`expected` and commits. This turns "make a real conversation into a case" from hand-transcription into one command
+ labelling.

**buildTranscript snag handling.** The exporter must produce a transcript without classified images. Two sub-options:
(i) emit `[IMG n] unknown` markers (cheap, no LLM, no Group-B dependency) — recommended; (ii) pre-classify via
`classifyImage` on export (accurate labels, but pulls in the vision/derivative path and $ cost, and is exactly
the work Group B is reorganizing — **don't**). v1 picks (i): markers only, since the segmenter attributes by
index, not by label. Note this exporter would live near the bot's `findSince` and `buildTranscript` (app layer);
to keep `packages/pipeline` free of LINE/AWS deps, the script either runs in `packages/bot` (it already imports
the DynamoDB repo) and emits the pipeline-shaped JSON, or reads raw DynamoDB items directly.

**Trade-offs.** Effort ~3 days (script + the cross-package home decision + a unit test on the transcript shape).
Risk **low-medium** (a script, not a hot-path change; but it touches the bot↔pipeline seam). Alignment **high**.
Anti-over-engineering: the script is a one-caller utility — acceptable as a *script* (not a library port) since it
has a real seam (DynamoDB→fixture) and the founder runs it ad hoc. **Why:** makes the loop repeatable for the
*next* real failure, not just this one. **Why-not:** the export is only worth it once we have >1 conversation to
snapshot; for the single incident, hand-authoring (Option A) is cheaper and avoids the image snag entirely.

### Option C — Option B + E6 failure auto-capture triage queue

**Approach.** When the sweep abandons / times out / produces a low-dedup-confidence batch
(`ingestionSweep.ts:158-167`, the give-up path; and Group B's future "too big" signal), write a lightweight
**triage marker** (a DynamoDB item or an S3 sidecar keyed by conversationKey + watermark) flagging the
conversation as an **eval candidate**. The export utility (Option B) then has a worklist; the founder labels and
promotes candidates into `tierA/` with one action.

**Trade-offs.** Effort ~5-6 days. Risk **medium** — touches the live sweep give-up path (writes on failure) and
needs a small queue/store + a promote action. Alignment **good** but it **straddles Group B** (the failure
*signals* — timeout/oversized/low-confidence — are Group B's to define; Group C only consumes them). Anti-over-
engineering risk: a triage queue with no consumer is "config nobody sets" until the founder actually works the
queue. **Why:** the full founder vision — failures become candidates automatically. **Why-not:** premature until
(a) Group B defines the failure signals and (b) we've proven the loop on this one case. Build the consumer side
(loader + export) first; wire the auto-capture trigger when Group B lands its failure-classification.

### Option D — Pipeline trace store (E8): full per-call I/O capture at the chokepoint + per-step metrics (PROMOTED to committed)

**Approach.** Capture every model call's **real input and output** at the single Anthropic chokepoint, into a
**two-tier store** so that both observability ("what exactly did we send / get back / how long / how much") and
the hill-climb loop (replay a real call *losslessly* as an eval case) are served by one substrate. Today there is
**no** persistence of API I/O at all (confirmed: §2.2 "Per-step tracing → none"; `CostLog` is ephemeral, aggregate $
only) — so "store all API calls with inputs and outputs" is currently impossible. This builds it:

1. **Raw I/O → S3** (cold, verbatim). At `AnthropicStepLlm.run()` (`packages/pipeline/src/adapters/anthropicStepLlm.ts`)
   — the single place every step's call passes through — write one JSON blob per call:
   `{ runId, conversationKey, step, model, system, userContent, response (parsed object + raw text), usage, latencyMs }`,
   keyed `traces/<conversationKey>/<runId>/<step>-<seq>.json` in the archive bucket. This is the **only** place that
   holds the *exact assembled prompt* and the *exact model response*. The message-store replay (Option B) can only
   reconstruct the input lossily (`[IMG n] unknown` markers, geo re-parsed from text) and captures **no output** —
   so it is not a substitute for capture.
2. **Metrics → Postgres `pipeline_trace`** (warm, queryable). A thin row per call:
   `id, run_id, conversation_key, step, model, input_tokens, output_tokens, cache_read_tokens, latency_ms, cost_usd,
   s3_key (→ the raw blob), created_at`. This answers "which step ate the budget", "are we actually getting cache
   hits" (the open question from the count_tokens-vs-`cacheHit:true` tension), and "cost per conversation" with a SQL
   query instead of an S3 scan — and it is what the scorecard and the deferred trace *view* (P5) read.
3. **The seam.** Add an optional `traceSink` to `StepContext` (`packages/pipeline/src/steps/context.ts`) — a port
   (real seam = the trace store) with a **no-op default**, so the pipeline core stays infra-free and tests inject a
   fake. `cost.ts` `CostEntry` gains `latencyMs`; the sink receives the entry + the raw I/O. The bot wires the real
   S3+PG sink in `pipelineV2Sweep.ts`; the eval runner wires a no-op (or a local-file sink for offline inspection).
   This is the same `latencyMs`/`traceSink` hook Group B needs for the timeout work — built **once**.
4. **Flag + retention (PII — load-bearing).** Captured prompts contain **real PII** (phone numbers, addresses, names
   from Thai LINE chats — confirmed in the incident transcript). So capture is **flag-gated** (`PIPELINE_TRACE=1`,
   default off in prod until the founder decides), the raw-blob S3 prefix carries a **lifecycle TTL** (recommend
   30–90 days), and read access is scoped to the deploy/admin role only. The `pipeline_trace` metrics row (counts,
   timings, keys — **no message content**) may persist longer; only the raw blob expires.

**Why this, not "a log line or S3 JSON".** A log line is unqueryable and unbounded; "S3 JSON" alone can't answer
aggregate questions without a scan. The two-tier split (raw in S3, metrics in PG pointing at it) is the standard
observability shape **and** the substrate the deferred pieces need: the **per-conversation trace view** (P5) is a
reader over `pipeline_trace` + the blobs; **E6 failure-capture → eval case** (P5) becomes *lossless* — "take a
captured trace, label `expected`, write `tierA/<id>.case.json`" — instead of Option B's lossy reconstruction.

**Trade-offs.** Effort ~3-4 days for the **capture store** (sink port + S3 write + `pipeline_trace` migration + bot
wiring + flag/TTL), separate from the trace-*view* UI (deferred P5). Risk **medium** — touches `StepContext` (every
step gains the optional sink, but the no-op default = zero behavior change) and adds a hot-path write (must be
async/best-effort and **never fail the pipeline**). Anti-over-engineering: tracing IS a real seam (the LLM
chokepoint), so the `traceSink` port is defensible under **rule 2** (ports only at real seams); the no-op default
keeps it a one-line change for non-tracing callers. **Why promote it:** it is the *only* design that delivers true
"store all API calls with inputs and outputs" observability **and** a lossless replay path for the hill-climb loop
— one store, two consumers, and the founder asked for exactly this capability. **Why it is still not Option A:** it
does not by itself lock the *current* incident as a case (Option A hand-authors that); it is the infrastructure that
makes the *next* failure capturable losslessly. **Prompt-version tagging** (a `promptVersion` hash on each trace row
and the baseline) rides along cheaply once `pipeline_trace` exists, but a full prompt/experiment **registry** stays
deferred (rule 1 — one eval consumer). Co-built with Group B in P3.

---

## 4. Recommended direction (+ rationale)

**Sequenced path: A now → B next → D's trace store promoted to committed P3 (co-built w/ Group B) → Option C +
the trace read-surfaces deferred to P5.**

1. **Ship Option A first** (the recommended core). It is the smallest thing that fully satisfies founder item 2's
   first half: *this* incident becomes a permanent, hand-verified **Tier-A** regression case (truth is already
   known — 5 distinct, 0 merges), and the **E7 archetype** ("N distinct listings, expect N rows, 0 merges") is
   added as a runnable Tier-B case. It needs no export tooling, no image-classification dependency (hand-authored
   transcript with `[IMG n]` markers + maps-URL geo), no infra, and it touches only the eval module — so the
   blast radius is one additive loader + one runner branch, with the existing 62-case oracle smoke unchanged.
   Crucially it includes the **4th-gap fix** (Tier-A cases are n/a under oracle, scored under
   `EVAL_LLM=anthropic`) and the **missing distinct-listings dedup metric** that makes the incident's failure
   mode *visible* to the eval — so when **Group A** ships its dedup fix, `npm run eval` (real model) will *show*
   the case going from 1→5 persisted (D21-advisory, founder reads the delta).

2. **Then Option B** (export/replay utility), once we want the loop to scale beyond this one conversation. Emit
   `[IMG n] unknown` markers on export (no Group-B dependency); leave `expected` as a founder-labelled TODO.

3. **Promote Option D's trace store (E8) to a committed P3 deliverable, co-built with Group B** — defer only its
   *read surfaces*. The trace store (full per-call I/O → S3 + a queryable Postgres `pipeline_trace` row, captured at
   the `AnthropicStepLlm` chokepoint, flag-gated + TTL'd for PII) is the substrate that both the per-conversation
   trace *view* and the E6 failure-capture loop sit on, so it must exist before either; and Group B needs the same
   per-step `latencyMs`/`traceSink` seam for its timeout work — so it is built **once** in P3, not twice. Group C
   consumes it as scorecard/eval outputs. **Defer to P5** only the trace *view* (the read/query UI) and the **E6
   auto-capture consumer** (which also waits on Group B's failure-classification signals — don't build the trigger
   before they exist).

4. **Defer Option C** (E6 failure auto-capture) to P5 — it consumes Group B's failure signals AND, once D's trace
   store lands, the captured trace makes the export *lossless* (it reads a real trace, not Option B's reconstructed
   transcript). Fold Option B's exporter + Option C's auto-capture + D's trace store together in P5 as the
   end-to-end "failure → locked golden case" loop.

Rationale: maximum founder-value per dev-day, smallest blast radius, no premature abstraction, honors D21
(advisory) and deterministic-first dedup. The one cross-group piece designed here rather than handed off is the
**E8 trace store** — promoted because it is a shared seam (the LLM chokepoint Group B also needs) and because it is
the only thing that delivers the founder's "store all API calls with inputs and outputs", which nothing in the
pipeline does today; it is explicitly co-built with Group B in P3 so it is built once, not twice. The remaining
cross-group items (E6 signals, the dedup fix) still hand back to their owners.

---

## 5. Implementation plan (NOT executed)

Executed in a LATER phase. Scoped to **Option A** (the first deliverable); Option B sketched at the end.

### Steps (Option A)

1. **Add the Tier-A fixture loader.**
   - File: `packages/pipeline/src/eval/cases.ts` — add `readTierAFixtures(): EvalCase[]` that reads
     `packages/pipeline/goldenSet/tierA/*.case.json` (via `node:fs` `readdirSync` + `readFileSync`, resolved
     `new URL("../../goldenSet/tierA/", import.meta.url)`), validating each with a small zod schema (reuse
     `ExpectedOutcome` shape; `specs:[]`, `tier:"A"`, `source:"tierA"`). Append its result to `loadCases()`'s
     return (cases.ts:80). Empty dir ⇒ empty array (no behavior change until a fixture lands).
   - Keep the fixture JSON schema minimal: `{ id, transcript, expected:{properties[],duplicatePairs[]} }`.
2. **Gate Tier-A under oracle + add the distinct-listings metric.**
   - File: `packages/pipeline/src/eval/runner.ts`.
     - In the case loop (runner.ts:227), `if (EVAL_MODE === "oracle" && evalCase.specs.length === 0) continue;`
       (Tier-A is n/a under the oracle smoke — the 4th-gap fix; document why inline).
     - Add a **distinct-listings dedup score**: when `evalCase.expected.duplicatePairs.length === 0 &&
       evalCase.expected.properties.length > 1`, score = `1 - (mergesObserved / (expectedCount-1))` or simpler
       `persistedDistinct === expectedCount ? 1 : 0`. Because the eval runner today does NOT persist to Postgres
       (it scores extraction in-memory; dedup is scored via `scoreDedupCase`'s synthetic blocker), the cleanest
       v1 is to **extend `scoreDedupCase`** (runner.ts:141-186) to handle the "expect 0 pairs among N extracted"
       case by running `blockCandidates` for each extracted listing against the others and asserting **0 blocks**
       (false-positive blocking is the leading indicator of the over-block→merge failure). Feed the result into
       `dedupScores` so it shows in `card.perStep.dedup`. (A fuller "actually run dedupVerify and count merges"
       check is possible but pulls in the LLM + DB — defer; the blocker-level metric is the deterministic floor
       that catches the incident's root cause and aligns with deterministic-first dedup.)
3. **Author the E7 archetype (Tier-B, runs under oracle + real).**
   - File: `packages/pipeline/src/eval/cases.ts` — in `loadCases()`, add one case from
     `specCatalog` listings chosen in **distinct districts** (the generator already supports a multi-spec dump:
     `toCase("distinct-dump", [specA, specB, specC], {...CALM})`), with `expected` = N properties, **0
     duplicatePairs**. Pick specs whose `tambon/amphoe/lat/lon` are far apart so geohash-6 + 1 km radius should
     NOT block them. This is the regression for "many distinct listings must stay separate."
4. **Author the incident Tier-A fixture.**
   - File (new): `packages/pipeline/goldenSet/tierA/incident-2026-06-15-dorm-dump.case.json`. Transcript
     hand-authored from the audit §0 table (5 listings: Mooban Wangtan 2.3M w/ maps-URL geo; บ้านหลักชัย ขายฝาก
     1.25M; หอพัก ใกล้ ม.แม่โจ้ 39 rooms 13.8M; ทาวน์โฮม อรสิริน 6 1.3M; หอพัก บ่อสร้าง 14 rooms 4.8M), images as
     `[IMG n] property` markers, geo as `https://www.google.com/maps?q=lat,lng` text lines (matching the real
     data shape confirmed in §2.3). `expected.properties` = 5 entries (key fields: dealType, propertyType,
     price, province/amphoe/tambon per the table); `expected.duplicatePairs = []`. **The `expected` values are a
     founder decision (see §6)** — leave a clearly-marked TODO if any field is uncertain at authoring time.

### Tests + eval cases

- **Unit test (new):** `packages/pipeline/src/eval/cases.test.ts` — asserts `loadCases()` now includes the E7
  Tier-B case and (when a fixture exists) the Tier-A case; asserts the Tier-A case has `source:"tierA"`,
  `specs.length===0`, and a non-empty `expected.properties`. Data-driven like
  `packages/miniapp/test/route-compat.test.ts` (reads the real loader, not a hand list).
- **Unit test (new):** extend `packages/pipeline/src/eval/scoring.test.ts` — a "0-merge among N distinct" case for
  the new distinct-listings dedup metric (give it N spatially-separated extracted listings → expect score 1; give
  it two near-identical → expect a block/penalty). Break-the-feature check: if the metric is wired wrong, the
  incident case scores high — the test must go red when N distinct listings collapse.
- **Eval cases (the deliverable itself):** the E7 Tier-B archetype (runs under `npm run eval` oracle AND real) +
  the incident Tier-A case (runs under `EVAL_LLM=anthropic` only; n/a under oracle). After **Group A** ships its
  dedup fix, `EVAL_LLM=anthropic npm run eval` should show the incident case's distinct-listings/dedup score
  improve — the hill-climb signal. **Run `EVAL_LLM=anthropic` (and the real-model integration tests) enough to
  confirm the new behavior is actually correct, and iterate until it works** — it costs cents (the audit ran the
  incident at est $0.46), far cheaper than a silent correctness regression the oracle/fakes pass clean. The oracle
  smoke + unit tests stay the always-on free CI gate; the live run is the required validation layer for any
  change to what the model sees or returns (prompts, extraction/dedup/segmentation/gate logic, schemas) — not a
  rare founder-only event. See root `CLAUDE.md` §"Quality system" → "For model-facing changes".

### Migrations

**None.** The golden set is fixture files + an in-repo loader; no schema, no DynamoDB, no Postgres change. (Per
`packages/db/CLAUDE.md`, enums are domain-first then `npm run generate` — but no enum is touched here.) Confirm:
no `packages/db` change required.

### Rollout / flags

- No feature flag, no infra. The loader is additive; empty `tierA/` ⇒ no change. Oracle smoke stays green
  (existing 62 cases untouched; Tier-A skipped under oracle).
- The baseline (`eval-baseline.json`) is regenerated by the founder via `EVAL_WRITE_BASELINE=1 EVAL_LLM=anthropic
  npm run eval` **only after Group A's fix lands** — so the baseline reflects the fixed behavior, not the bug.
  Until then the new cases are reported as deltas (D21-advisory).

### Verification vs review cadence (CLAUDE.md §5.3)

- **Every change:** `npm run typecheck`, `npm run lint`, `npm run test` (the two new unit tests), coverage.
  `npm run eval` (oracle) must still print PASS/1.0 on the 62 + the E7 Tier-B case.
- **Increment review (`/increment-review`):** spec-auditor vs this plan; simplicity critic vs the anti-over-
  engineering rules (the loader must stay a small function, not a registry abstraction). This is a schema/flow-
  bearing change → also `/alignment-review` against `docs/research/00-product-principles.md` if any user-facing
  copy is implied (none here — eval is internal).
- **D21 reminder:** the eval stays advisory; nothing about this change makes a red eval block a merge.

### Option B sketch (next deliverable, when scaling the loop)

- New script `packages/bot/scripts/exportEvalCase.ts` (lives in `packages/bot` — it already depends on the
  DynamoDB message repo; keeps `packages/pipeline` LINE/AWS-free): args `conversationKey`, `outId`; reads
  `messages.findSince(key, 0)`, builds the eval-transcript text (text lines + `[MAP n]` from `parseMapUrls` +
  `[IMG n] unknown` markers — **no classification**, no Group-B dependency), writes
  `packages/pipeline/goldenSet/tierA/<outId>.case.json` with `expected` as a labelled TODO. Unit test on the
  transcript-shape (deterministic given fixed input). The founder labels `expected` and commits.

### Option D sketch (trace store — COMMITTED, P3, co-built with Group B)

The capture store is a P3 deliverable (consolidated plan CR-5/§3) — built once with Group B's timeout work and
consumed by Group C. Implementation outline (file:line grounded):

1. **`traceSink` port + `latencyMs`.** `packages/pipeline/src/steps/context.ts` — add `traceSink?: TraceSink` to
   `StepContext` (`{ llm, costLog, mode }` today). `TraceSink` is one method:
   `record(entry: { runId, conversationKey, step, model, system, userContent, response, rawText, usage, latencyMs }): void`
   (fire-and-forget; implementations MUST swallow their own errors — a trace write never fails the pipeline). Default
   is undefined ⇒ no-op (every existing caller unchanged). `packages/pipeline/src/cost.ts` `CostEntry` gains
   `latencyMs` (measured around the SDK call in `anthropicStepLlm.ts`).
2. **Capture at the chokepoint.** `packages/pipeline/src/adapters/anthropicStepLlm.ts:run()` — already the single
   call site and already reads `response.usage.cache_read_input_tokens` (~line 37). Wrap the `messages.parse` call
   with a monotonic timer; after it returns, call `ctx.traceSink?.record({...})` with the assembled `system`/
   `userContent`, the parsed `response` + raw text, `usage`, and `latencyMs`. No prompt content touches the pipeline
   core — the sink is the only thing that sees it.
3. **The real sink (bot layer).** `packages/bot` owns an `S3PgTraceSink`: writes the raw JSON blob to
   `traces/<conversationKey>/<runId>/<step>-<seq>.json` in the archive bucket and inserts the thin `pipeline_trace`
   row via `@line-robot/db`. Wired in `pipelineV2Sweep.ts` when `PIPELINE_TRACE=1`. The eval runner wires a no-op
   (or a `LocalFileTraceSink` for offline inspection) — keeps `packages/pipeline` LINE/AWS-free.
4. **Migration `pipeline_trace`** (Postgres). New table — `id, run_id, conversation_key, step, model, input_tokens,
   output_tokens, cache_read_tokens, latency_ms, cost_usd, s3_key, created_at` (+ optional `prompt_version`). No
   domain enum is touched, so per `packages/db/CLAUDE.md` this is a `schema.ts` add + `npm run generate` (hand-fix
   only if a geography/extension quirk appears — none expected for a plain metrics table). This is the migration
   that §5's Option A "Migrations: None" deferred to here.
5. **IAM + lifecycle (infra).** The sweep role gains `s3:PutObject` on `${archive}/traces/*`; an S3 lifecycle rule
   expires that prefix after the founder-chosen TTL (§6). Read access (the P5 trace view) is scoped to the
   deploy/admin role. Flag default **off in prod** until the founder green-lights PII capture.
6. **Group C consumption (now).** The scorecard reads `pipeline_trace` aggregates (per-step latency, cache-hit rate,
   cost/conversation) as advisory outputs. The **per-conversation trace view** and the **lossless E6 exporter** are
   the P5 readers over this store (see §7, consolidated §5).

**Tests:** a fake `TraceSink` asserts the chokepoint calls `record` once per step with the right `step`/`model` and a
non-zero `latencyMs`; a sink-throws test asserts the pipeline still completes (best-effort contract); a DB
integration test (Docker-PG) asserts a `pipeline_trace` row round-trips. **No `EVAL_LLM=anthropic` needed** — the
fake LLM drives capture in CI.

---

## 6. Open questions / founder decisions

1. **Ground-truth labelling authority + format (the parked Tier-A decision, D2.1/Q6).** Who is the judge for
   Tier-A cases, and what is the canonical `expected` format/precision? Proposed: founder is the sole judge;
   format = `expected.properties[]` (one per distinct listing, keys = extraction field names: dealType,
   propertyType, titleDeedType, priceThb, province/amphoe/tambon, optional lat/lon/beds/baths) +
   `expected.duplicatePairs[]`. **For the incident case the truth is already settled (5 distinct, 0 merges)** —
   only the per-listing field values need a founder confirm. Need a decision on **field strictness**: which
   fields are scored-exact vs "don't care / skip if uncertain" (the synthetic generator skips unstated
   deed/urgency by setting `""` — Tier-A should follow the same convention).
2. **Distinct-listings metric precision.** Is the deterministic blocker-level metric (0 false blocks among N
   distinct) sufficient as the v1 regression signal, or does the founder want the fuller "run `dedupVerify`,
   count merges" check (needs the LLM + DB)? Recommendation: blocker-level for v1 (deterministic-first, free,
   catches the root cause); upgrade only if a real case slips past the blocker but fails at verify.
3. **When to regenerate the baseline.** Confirm the baseline is rewritten only after Group A's dedup fix lands
   (so it encodes correct behavior). Until then, deltas only.
4. **LLM-as-judge (`scoreFuzzy`) — build or keep deferred?** Recommendation: keep deferred (no second consumer
   yet; deterministic floor + invariants suffice). Founder confirm.
5. **Prompt-version tagging (Option D slice).** Do we want a `promptVersion` stamped on eval runs/baseline now, or
   rely on git commit identity? Recommendation: git for now; revisit when A/B-ing prompt changes becomes routine.
   (Once `pipeline_trace` exists it can carry a `prompt_version` column for cheap — but a full registry stays deferred.)
6. **Trace-store PII & retention (E8/Option D — now a committed P3 deliverable).** Full per-call I/O capture stores
   **real PII** (phone numbers, addresses, names, from the Thai LINE chats — present in the incident transcript).
   Decisions needed: (a) capture is flag-gated (`PIPELINE_TRACE`, default **off** in prod) — turn it on in **prod**
   or **staging-only** at first? (b) raw-blob S3 **TTL** length (recommend 30–90 days; the `pipeline_trace` metrics
   row — no content — may persist longer); (c) confirm read access scoped to the deploy/admin role. Recommendation:
   staging-only + 30-day TTL to start; widen once the trace view (P5) proves its value.

---

## 7. Cross-group dependencies (flag, don't resolve)

- **Group A (dedup correctness).** Owns the actual fix for "5 listings → 1." Group C's new eval cases
  (E7 archetype + incident Tier-A + the distinct-listings metric) are the **measurement** of that fix — Group C
  must not change `run.ts:236`/`verify.ts`/`candidateFinder.ts` thresholds; it only adds cases that will move
  when Group A's fix lands. Coordinate the baseline-regeneration timing with Group A.
- **Group B (performance/resilience/image cache).** (i) The **export/replay utility** (Option B) builds a
  transcript; the clean v1 emits `[IMG n] unknown` markers to avoid Group B's image-classification/caching work —
  but if Group B lands an **ingest-time classification cache keyed by `s3Key`**, the exporter could read cached
  classifications for richer markers (a future enhancement, not a v1 dependency). (ii) The **E6 auto-capture
  triggers** (timeout/abandoned/oversized/low-confidence) are **Group B's signals to define**
  (`ingestionSweep.ts:158-167` + their new "too big" path); Group C only consumes them. (iii) The **E8 trace store**
  — now a **committed P3 deliverable** (full per-call I/O → S3 + a queryable `pipeline_trace` row, captured at the
  `AnthropicStepLlm` chokepoint via a `traceSink` port; §3 Option D, §5 Option-D sketch) — is **co-built with
  Group B**: they need the same `latencyMs`/`traceSink` seam for "which step ate the timeout budget", so it is built
  **once** in P3 and Group C consumes it (scorecard outputs now; the trace *view* + lossless eval-case capture in
  P5). Don't double-build the timing hook. Beyond that seam, do NOT design Group B's fixes here.

---

## 8. Out of scope / deferred

- **LLM-as-judge / `scoreFuzzy` implementation** — declared-but-throwing slot stays deferred (no second consumer).
- **Prompt/version registry + experiment tracking** — git is the v1 versioning; a real registry is aspirational
  for our scale (anti-over-engineering rule 1).
- **Per-call I/O trace store (E8/Option D) — NO LONGER DEFERRED.** Promoted to a committed **P3** deliverable
  (full prompt+response capture → S3 + a queryable `pipeline_trace` Postgres row at the `AnthropicStepLlm`
  chokepoint, flag-gated + TTL'd for PII), co-built with Group B. See §3 Option D, §5 Option-D sketch, consolidated
  CR-5. **Deferred to P5** are only its *read surfaces*: the **per-conversation trace view** (read/query UI over the
  store) and the **lossless E6 exporter** (capture a trace → label → `tierA/`).
- **Failure auto-capture triage queue (E6 consumer)** — deferred (P5) until Group B defines failure signals; once
  the P3 trace store exists, the captured trace makes that capture *lossless* (no message reconstruction).
- **Export/replay utility (Option B)** — sketched, not the first deliverable; build when scaling beyond the one
  incident.
- **classify-step eval coverage** — stays `n/a` (needs image fixtures + Group B's image path); not addressed here.
- **The dedup correctness fix itself** — Group A. **Image preprocess/cache + chunking + timeout signals** — Group B.
- **Pulling `findSince`/`buildTranscript` into `packages/pipeline`** — explicitly avoided (would import
  LINE/AWS into the pipeline package, breaking the hexagonal boundary); the exporter lives in `packages/bot`.

<!-- RPI: R+P COMPLETE -->
