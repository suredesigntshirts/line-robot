# Plan 23 — Ingestion Pipeline Audit (FIRST-PASS issue map)

> **Status:** FIRST PASS — issue capture + code paths only. NOT a plan, NOT a deep dive yet.
> **Purpose:** A durable map of the problems we found on 2026-06-15 when a real user dumped a batch of
> listings into the bot, plus the exact code paths, so we can (a) redo a deep dive without re-discovering,
> and (b) flesh out a proper deep-dive artifact → solutions → plan. Founder notes are preserved verbatim
> under each issue; analysis + code paths + my recommendations are added around them.
> **Next step (separate session):** deep-dive artifact per group → solution options → plan.
> **Do NOT start building from this doc.**

---

## 0. The triggering incident (evidence, 2026-06-15)

A real LINE user (`user#U810f7671d201fe7ce3ec2ef49ab8d16a`) forwarded ~**76 messages = 5 distinct property
listings** into a **1:1 DM** with the bot to "seed their account." What actually happened:

1. **Ingest + processor** worked: webhook enqueued, processor stored all 76 to DynamoDB. SQS/DLQ clean.
2. **Sweep extraction TIMED OUT** at the 180 s Lambda limit on every attempt. `ingestAttempts` bumps at
   claim time (even on timeout), so after 3 timeouts the conversation was **abandoned (attempt 4)** and the
   user got a `"⚠️ Sorry — I couldn't process your recent messages… please resend"` push. No listings.
3. **Mitigation applied + DEPLOYED:** raised sweep Lambda `timeout 180→900`, `memorySize 512→1024`
   (`infra/src/lambdas.ts:268,271`), re-armed the conversation via `touchConversation`. It then ingested in
   ~88 s of actual work (`ingested:1 messages:76 properties:5`, est $0.46, prompt-cache hit).
4. **BUT the deeper bug:** the pipeline extracted **5 distinct properties** (`listings:5, dropped:0`) and
   **only 1 row persisted** — dedup gave 4 of the 5 a `"merge"` verdict and folded them into the first
   listing (the แม่โจ้ dorm, `4b194544`). 4 distinct listings were silently lost. Data loss on the core path.

The 5 properties (from the raw messages — all genuinely distinct):
| # | Property | Price | Outcome |
|---|---|---|---|
| 1 | Mooban Wangtan house (map 18.7298,98.9688) | 2.3M | ❌ merged away |
| 2 | บ้านหลักชัย ขายฝาก, ต.สันนาเม็ง อ.สันทราย (map 18.8263,99.0564) | ขอยอด 1.25M | ❌ merged away |
| 3 | หอพัก ใกล้ ม.แม่โจ้, 39 rooms | 13.8M | ✅ the 1 survivor |
| 4 | ทาวน์โฮม อรสิริน 6, 31 ตรว | 1.3M | ❌ merged away |
| 5 | หอพัก บ่อสร้าง, สันกำแพง, 14 rooms | 4.8M | ❌ merged away |

**Core framing (founder):** *"This is a standard use case, where people will just dump a bunch of listings
to the line bot. The line bot needs to be able to handle this."* — This is the primary ingestion path, not
an edge case. Everything below is in service of making it robust + making us able to hill-climb on it.

---

## GROUP A — Pipeline correctness: distinct listings collapsing into one (founder items 1 & 5)

> **Founder note 5:** *"obviously we need to resolve the 5 listings collapsing into 1 listing. It should be
> 5 separate issues."*
> **Founder note 1:** *"We currently have some test data, which is these listings. So I need to investigate
> if this is where the merge is coming from. I don't think so, but we should confirm and rule if this is or
> is not happening."*

### What we know
- The pipeline is a per-segment loop: **segment → extract → dedup (block + verify) → persist/merge → translate → gate**.
- The merge decision is `decision.decision === "merge"` at `packages/pipeline/src/run.ts:236`. Merge ⇒ no new
  row, just fold into `intoId` (and refresh price if changed). "new" ⇒ `persistNewListing` (run.ts:99,248).
- `dropped:0` means the **quality gate kept all 5** — the loss is purely the dedup verdict.

### Code paths
| Concern | File:line | Note |
|---|---|---|
| Dedup loop + merge/new branch | `packages/pipeline/src/run.ts:205-261` | per-segment; line 236 merge, line 248 new |
| Deterministic blocking | `packages/pipeline/src/dedup/candidateFinder.ts:45-116` | deed-exact (1.0) → geo (geohash cell + haversine radius) → text (trigram 0.55 / jaccard 0.50); cap 8 |
| LLM verify | `packages/pipeline/src/dedup/verify.ts:23-71` | model = **`claude-haiku-4-5`** (cheapest); deed-exact short-circuits to merge; LLM failure/intoId-mismatch defaults to "new" |
| Dedup thresholds (env-tunable) | `packages/pipeline/src/dedup/config.ts:29-33` | GEOHASH_PRECISION 6 (~1.2 km), GEO_RADIUS_M 1000, TRIGRAM 0.55, JACCARD 0.50, BLOCK_CAP 8 |
| Candidate pool source | `packages/pipeline/src/run.ts:80-90` → `listDedupPool(db)` | loads **whole catalog, default 500 rows, UNFILTERED** (incl. seed/test data) |
| In-batch pool-push | `packages/pipeline/src/run.ts:248-261` | each new listing is pushed to the pool so later segments in the SAME batch block against it |

### Item 1 answer (seed/test data): **mostly ruled out, with a caveat**
- The candidate pool **does include the seed/test listings** (`listDedupPool` is unfiltered, 500-cap).
- BUT the 4 merges folded into the **freshly-created in-batch listing `4b194544`**, not seed rows — evidence:
  0 pre-existing rows had `updated_at` bumped in the incident window. So **seed data was not the merge target
  this time.** The deep dive should still (a) confirm per-segment which `intoId` each merge chose, and
  (b) treat the unfiltered whole-catalog pool as its own smell (Group A risk + Group E scaling item).

### Leading hypothesis (to confirm in deep dive)
The 5 properties are in **different districts** (สันทราย / แม่โจ้ / สันกำแพง), so geohash-6 (~1.2 km) +
1 km radius should NOT geo-block them together — *unless their geo didn't bind per-segment*. The map pins were
sent as **separate Google-Maps-link messages**, surfaced to the pipeline as conversation-level `geoHints` /
`[MAP n]` placeholders (`pipelineV2Sweep.ts:74-108`), not bound to a specific segment. If extraction applied
the same / a fallback coordinate to multiple segments (or left geo null and the blocker fell through to a weak
signal), then segment 2-5 geo-blocked against segment 1 and **Haiku `dedupVerify` returned "merge".**
Two compounding design facts:
1. The **merge decision runs on Haiku** (the cheapest model) for a verdict whose false-positive = silent data loss.
2. The **in-batch pool-push** means once listing 1 exists, every later segment is compared to it.

### Things to investigate in the deep dive
- Replay this exact conversation (Group C) and log, per segment: extracted lat/lon, `blockCandidates` output
  (which candidates + scores + reasons), and the `dedupVerify` verdict + confidence + reasons. Pin the exact
  failure step (geo mis-bind vs blocker vs Haiku verdict).
- Whether geo-hints should be **segment-scoped** (a map link adjacent to a listing's text binds to it).
- Whether merge should be **conservative by construction** (bias to "new"; require strong positive evidence —
  deed-exact or geo-very-close + high text sim — to merge; never merge on a weak/again-uncertain LLM verdict).
- Whether the dedup verdict model should be raised from Haiku, or kept Haiku but gated by deterministic guards.
- 💡 **(mine)** The user-facing confirmation is built from `outcome.listings` (= 5 segments), so the user was
  likely told "5" while only 1 persisted — the confirmation must reflect **persisted distinct rows**, not segments.

---

## GROUP B — Performance & resilience: timeouts, re-processing waste, image caching (founder items 3 & 4)

> **Founder note 3:** *"We have an issue, where many listings in quick succession cause lambda to timeout. We
> need a way to handle this, so we don't need to raise the timeout to so high. I assume much of this is
> processing images. If we process an image once, there's no reason we should have to do it again. We should
> think about our pipeline appropriately and separate out what we process. What when it's been processed once,
> could be cached, so it wouldn't need to be pre-processed upon a second run (saving us process time)."*
> **Founder note 4:** *"Also if we are timing out, we should flag as such, because if we re-process we're just
> wasting compute and similar issue will happen again. We need to be smarter about this."*

### What we know
- The sweep hands the **whole un-ingested backlog** to `v2.run(batch)` in ONE call — no chunking, watermark
  only advances on full success (`ingestionSweep.ts:169-179`). One oversized batch ⇒ one long unbounded run.
- LLM call count for an N-segment / M-image batch ≈ **~1.05·M + 1.1·N + 3·K** (K = persisted listings):
  classify (M, Haiku, +Sonnet escalation), segment (1, Sonnet), extract (N, Sonnet, +Opus escalation),
  dedup-verify (K, Haiku), translate (K, Haiku), gate (K, Sonnet). Image classification dominates a photo-heavy
  dump.
- **No image-classification cache.** `classifyImage` re-runs for every image on **every** batch attempt;
  results are discarded after extraction (only the `media_kind` enum survives on `listing_media`). So each of
  the 3 timeout retries re-classified every image from scratch — pure waste, and it makes the retry as slow as
  the first try (guaranteeing repeat timeouts, exactly founder note 4).
- **Timeout handling is blind retry.** `claimConversation` bumps `ingestAttempts` at claim time (designed so a
  timeout still counts), so 3 timeouts → abandon + apology. There's no "this batch is too big / make partial
  progress / flag it" path — it just re-runs the whole thing and dies the same way.

### Code paths
| Concern | File:line | Note |
|---|---|---|
| Sweep batch = whole backlog, no chunk | `packages/bot/src/app/ingestionSweep.ts:169-179` | `findSince(key, lastIngestedAt)`; watermark advances only on success (line 176) |
| Lambda timeout/memory (mitigated) | `infra/src/lambdas.ts:268,271` | now 900 s / 1024 MB (was 180/512) — band-aid |
| Claim bumps attempts at claim time | `packages/bot/src/adapters/dynamodb/catalogRepository.ts:148` | `ADD ingestAttempts :one` — timeout counts toward give-up |
| Give-up → abandon + apology | `packages/bot/src/app/ingestionSweep.ts:158-167, 211-225` | attempt cap 3; pushes the failure notice |
| Image classification (per image) | `packages/pipeline/src/steps/classify.ts:46-57` | Haiku, escalate to Sonnet on low-conf chanote; **no s3Key cache** |
| Classification discarded after use | `packages/pipeline/src/run.ts:182,165-170` | only `media_kind` persists; kind/label/OCR/deedNo dropped |
| Per-step models | `packages/pipeline/src/context.ts:9-16` | classify=Haiku, segment=Sonnet, extract=Sonnet(+Opus), dedup=Haiku, translate=Haiku, gate=Sonnet |
| Cost/cache logging exists | `packages/pipeline/src/...cost.ts` (`estCostUsd`, `sawCacheHit`) | but **no per-step timing/trace** in prod |

### Directions to explore (deep dive)
- 💡 **(mine) Preprocess images ONCE at ingest, not in the sweep.** When an image message arrives
  (processor / a dedicated preprocess step), classify + OCR + chanote-detect it and **persist the result**
  (DynamoDB message item or an S3 sidecar keyed by `s3Key`). The pipeline then reads cached classifications →
  the per-image LLM cost moves out of the hot path entirely and is never repeated on retries. Directly answers
  founder note 3 ("process an image once… separate out what we process… cached").
- **Chunk the batch** (the real fix for note 4): cap messages/segments per claim, advance the watermark per
  chunk so each sweep makes bounded forward progress and no single run approaches the timeout; attempts reset on
  progress. Lets us drop the 900 s back down.
- **Idempotency at the step level:** a stable content hash per image/segment so a re-run is a cache hit, not a
  recompute. (Ties to the preprocess-at-ingest idea.)
- **Smarter failure signal (note 4):** distinguish "timed out / too big" from "genuinely failed" — e.g., if a
  run times out, mark the conversation for chunked/again-smaller processing and DON'T blind-retry the identical
  oversized batch; surface oversized batches to a triage/DLQ that also becomes an eval case (Group C).
- **Per-step tracing/timing in prod** so we can see WHICH step ate the budget (today we only have total cost).
- Concurrency vs the Postgres pool: the sweep has `SWEEP_RESERVED_CONCURRENCY`; a 900 s run holds its DB
  connection longer — verify chunking keeps us inside the pool budget.

---

## GROUP C — Eval, replay & hill-climbing infrastructure (founder item 2) + architecture

> **Founder note 2:** *"Do we have this set of messages saved, so we can attempt to eval against them. Do we
> have a proper pipeline where we can use any set of messages as evals? A test pipeline like this could be
> useful for us long term, so when errors like this happen, they can be flagged as test cases to work against
> in the future and hill climb for, and test regressions."*
> **Founder framing:** *"Most likely we will need a loop to improve the prompts… follow best practices for LLM
> applications… What architecture do we have. What is best in class. What could we do to bring what we have
> inline to an architecture which will serve us well moving forward… We can't catch and fix one-off bugs as we
> find them. We need to be smart… and allow us to hill-climb properly."*

### Are the messages saved? **Yes.**
- DynamoDB `linerobot-staging-messages`, ElectroDB entity `message`, PK `conversationKey`, SK
  `(timestamp, messageId)` — `packages/bot/src/adapters/dynamodb/messageRepository.ts:13-61`. Stores text,
  `attachment {s3Key, contentType}`, location, sender, timestamp, direction. This conversation's 76 messages
  are fully present + replayable via `findSince(conversationKey, 0)` (repo:129-139).

### What eval infrastructure exists
| Piece | File:line | Note |
|---|---|---|
| Eval entrypoint | `package.json:18` → `packages/pipeline/package.json:12` → `packages/pipeline/src/eval/runner.ts:1-361` | `npm run eval` |
| Case schema | `packages/pipeline/src/eval/cases.ts:8-26` | `EvalCase {id, tier:"A"|"B", source, transcript, expected, specs}`; `ExpectedOutcome {properties[], duplicatePairs[]}` |
| 62 synthetic Tier-B cases | `cases.ts:45-81` | 24 calm + 24 messy + 6 multi-dumps + 8 dedup-traps; generated from `ListingSpec` via `synthetic/generator.ts:193-250` |
| Scorecard | `eval/scorecard.ts`, `eval/scoring.ts` | per-step (segment/extract/dedup/translate/gate) + per-field; dedup = pair precision/recall |
| Oracle vs real | `eval/oracle.ts:15-102`, `runner.ts:195-212` | `EVAL_LLM=oracle` (default, no API, perfect=1.0 harness smoke) / `anthropic` (real baseline) |
| Baseline (D21 advisory) | `packages/pipeline/eval-baseline.json`, `runner.ts:325-357` | reports delta, always exits 0 |
| Tier A (real, hand-verified) | — | **PARKED — no real cases loaded** (founder ruling Q6/D2.1) |

### The gap (turn a real dump into a regression case)
The harness is solid but **only ingests synthetic specs**. To make "a prod failure becomes a permanent eval
case we hill-climb on" (exactly founder note 2), we need:
1. **Export/replay path (code — tractable):** read `findSince(key, watermark)` → `buildTranscript(...)`
   (`pipelineV2Sweep.ts:74-108`) → emit a fixture. *Snag:* `buildTranscript` needs classified images; a real
   export must either pre-classify (run `classifyImage`) or emit `[IMG n] unknown` markers. No export/replay
   utility exists today (confirmed — grep found none).
2. **Ground-truth labelling (human — the hard part):** real messages have no `ExpectedOutcome`. A judge
   (founder) must state, per case: the distinct properties + key fields + which are duplicates. This is the
   parked "Tier A" judging. *(This case is a gift: we already know the truth = 5 distinct listings.)*
3. **Loader (code — small):** extend `cases.ts:loadCases()` to read a `tierA/` fixture dir (~20 lines).

### Architecture: what we have vs best-in-class (for the deep dive to expand)
**What we have (good bones):** a hexagonal step-LLM pipeline with per-step models + escalation ladders;
prompt caching; an oracle/real eval harness with a committed baseline + per-step/per-field scorecard;
deterministic-then-LLM dedup; cost logging. This is already above average.

**Best-in-class LLM-app patterns we're missing / should evaluate (💡 mine):**
- **Golden dataset sourced from prod.** Real, hand-verified conversations (esp. failures) as the regression
  set — not only synthetic. The "flag a failure → it becomes a locked test case" loop the founder wants.
- **Per-step evals + an LLM-as-judge** for fuzzy fields, with the deterministic scorer as the floor; track
  precision/recall per step over time, not just a single advisory number.
- **Prompt/version registry + experiment tracking:** prompts are versioned, eval runs are tagged to a prompt
  version, and we can A/B a prompt change against the golden set (hill-climb with a number that moves).
- **Tracing/observability:** per-step latency + token + decision traces in prod (today: total cost only). A
  trace per conversation that we can open when something looks wrong.
- **A failure-triage loop:** oversized/abandoned/low-confidence batches auto-captured to a queue that feeds new
  eval cases (closes Group B note 4 ↔ Group C note 2).
- **Targeted dedup eval suite:** the current dedup traps are *reposts of the same property*; we have **no case
  for "many DISTINCT listings in one conversation that must stay separate"** — the exact failure here. Add it.
- **Cost/latency budgets as first-class eval outputs**, so a prompt that's more accurate but 3× slower is visible.

---

## GROUP D — 1:1 DM vs Group: unify the model (founder item 6)

> **Founder note 6:** *"We need to explore 1:1 DM vs Groups issues. We should explore this. Ideally we mostly
> keep a similar pipeline for both DMs and groups. I'm not too sure how they differ right now. If we made DMs a
> 'user of 1 group' could we expand this. For now, just explore this path and explain the differences."*

### How they differ today
The pipeline itself is **identical** for DM and group — the divergence is entirely about **`source_group_id`**:
- Conversation key: `user#<lineUserId>` (DM) vs `group#<lineGroupId>` (group) — `conversation.ts:10-20`,
  parsed from the webhook in `webhookParser.ts:9-23`.
- The sweep branches in `pipelineV2Sweep.ts`: `lineGroupIdFromKey()` (124-132) returns `undefined` for `user#`;
  for groups, `populateGroupMembership()` (141-166) does `findOrCreateGroupByLineGroupId` + `upsertMembership`
  per sender and threads `sourceGroupId` into the pipeline (236-245). **DM → `sourceGroupId = undefined`.**
- `owner_user_id` **is set for both** (a pseudo-user resolved from the conversation key, `run.ts:135`); only
  `source_group_id` differs (NULL for DM). `claimed_by_user_id` is NULL until a real user claims via the API.

### Downstream consequences of NULL `source_group_id` (DM)
| Feature | File:line | DM behavior |
|---|---|---|
| Claim DM invite | `pipelineV2Sweep.ts:299-303` (`sendClaimInvites`) | **skipped** for DM (would dead-end in the gate's 404) |
| Claim gate | `packages/api/src/handler.ts:323-347` + `isGroupMember` `packages/db/src/repositories/portal.ts:160-172` | `isGroupMember(null)` ⇒ `false` — no one can group-claim a DM listing |
| View/notes authz | `handler.ts:220-232` | DM listing visible only to its claimant (group-member path is dead) |
| Exclusivity / lapse prompt | `packages/db/src/repositories/exclusivity.ts:119-148` | **INNER JOIN on `groups`** ⇒ DM listings (NULL group) are **never** eligible for exclusivity/lapse |
| Per-group window config | `packages/db/src/repositories/groups.ts:59-72` | N/A for DM → system default |
| Quick-quote dealflow | `packages/db/src/repositories/listings.ts:654+` | **not** group-gated → DM listings DO participate |
| Public website | `listings.ts:247-250,290-300` | publish-consent driven, **group-agnostic** → a published DM listing shows fine |

### "DM = group of one" — what it would touch (explore, don't build)
The 5 explicit branch points to change: `lineGroupIdFromKey` (132), the `populateGroupMembership` call
(236-241), `sendClaimInvites` guard (303), `isGroupMember` NULL check (portal.ts:165), and the exclusivity
INNER JOIN (exclusivity.ts:132-133). **Deepest issue:** exclusivity windows are group-keyed and opened at
ingest; a synthetic "group of one" would need (a) the DM peer auto-membered so they can claim, and (b) a
decision on whether DM listings get exclusivity windows at all (and who the lapse-DM targets, since a DM
listing has no separate claimant until claimed). Upside: it would **collapse the DM/group special-casing into
one code path** (the founder's instinct) and make DM listings first-class for claim/exclusivity. Tests already
encode the current DM-no-group behavior (`pipelineV2Sweep.test.ts:375-383, 497-513`) — they'd be the spec to
flip. **This is an exploration item for the deep dive, not a decided direction.**

---

## GROUP E — My additional recommendations (beyond the six)

1. **Dedup is the highest-leverage correctness fix — make merging conservative by construction.** Default to
   "new"; only merge on strong positive evidence (deed-exact, or geo-very-close AND high text similarity).
   A false "new" makes a dup (recoverable later); a false "merge" is **silent data loss** (unrecoverable). The
   asymmetry should be baked into thresholds + the verify prompt + possibly the model tier. (Group A.)
2. **Bind geo to segments, not the whole conversation.** Map-link messages should attach to the adjacent
   listing's segment so distinct properties get distinct coordinates (prevents the geo over-block we suspect).
3. **The candidate pool won't scale.** `listDedupPool` loads the whole catalog (500-cap, unfiltered) per run —
   fine at 30 listings, broken at 30k. Use PostGIS/geohash to fetch only spatially-near candidates. (Also
   reduces the blast radius of a bad block.)
4. **Move image preprocessing to ingest-time + persist it** (classify/OCR/chanote once per `s3Key`). Removes
   the dominant cost from the hot path and makes retries cheap. (Group B.)
5. **Confirmation must reflect persisted distinct rows**, not segment count — otherwise we tell users "5 added"
   when 1 exists (an integrity/trust bug the user would notice).
6. **Capture failures automatically as eval candidates.** Abandoned / timed-out / low-dedup-confidence batches
   should be snapshot-able into the golden set with one action → the hill-climb loop the founder wants.
7. **Add the missing eval archetype:** "N distinct listings in one conversation, expect N rows, 0 merges." This
   exact failure currently has no test.
8. **Per-step tracing/timing + a per-conversation trace view** so "why is this slow/wrong" is answerable from
   data, not log spelunking.
9. **Backpressure / size awareness:** detect an oversized dump up-front and chunk it deliberately rather than
   discovering the limit by timing out.
10. **Idempotency keys for writes** so a re-run (post-fix) of the same batch reconciles instead of duplicating.

---

## How to use this doc next

The deep dive (separate artifact, e.g. `plans/23-ingestion-pipeline-audit/deep-dive.md`) should, per group:
pull the named code paths, **replay this real conversation through the pipeline with per-step tracing** to
confirm/refute the Group A geo-mis-bind hypothesis, then turn each group into solution options with trade-offs
and a recommended direction — culminating in a build plan. The north star (founder): a pipeline + eval/
hill-climbing loop that handles "user dumps many listings" robustly and lets us improve prompts against a
growing golden set of real cases, instead of chasing one-off bugs.

### Open evidence still worth grabbing in the deep dive
- Per-segment dedup trace for the incident (extracted lat/lon, `blockCandidates` candidates+scores+reasons,
  `dedupVerify` verdict+confidence) — to pin the exact merge cause.
- Confirm which `intoId` each of the 4 merges targeted (in-batch listing vs seed) — closes founder item 1.
- The actual image count + classify cost in the incident run (to size the preprocess-at-ingest win).
