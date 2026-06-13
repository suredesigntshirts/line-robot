# v2 Rebuild — Consolidated Backlog (what's left, Stages 0–4)

**The single source of truth for outstanding work.** Until now there was none — remaining items
lived scattered across each stage spec's iteration-log deviation rows, the stage-gate checklists,
`BLOCKERS.md`, and `MORNING.md`. That fragmentation is why work like website image rendering could
be deferred and then forgotten. This file supersedes the sprint-01 `BLOCKERS.md`/`MORNING.md` lists
(now mostly resolved) as the place to look.

**How this stays honest (the process gap that caused the confusion):**
- `/increment-review`'s **spec auditor** checks one increment's diff against its spec — *per increment*,
  not a rollup. When it (or a deviation) defers something, **add it here**, not only to the iteration log.
- The **stage-gate review** (master plan §5.3) is the level that catches "a stage deliverable never
  shipped." **Stage 2 and Stage 4 were never formally gated** — running those gates is itself a
  backlog item (below), and is how 4.1 (image rendering) should have been caught.

_Last updated: 2026-06-13 (audited each OPEN item against code + git log; corrections below)._

## Status at a glance

| Stage | State |
|---|---|
| 0 Quality bootstrap | Built + gated PASS. 2 minor carry-forwards. |
| 0 Spine re-audit | Done; Q-SA2/3/4 thread into Stage 1/2 (below). |
| 1 Data foundations | Built **+ DEPLOYED** (today). Minor + pre-prod items remain. |
| 2 Extraction pipeline | Live, **v2-only sweep**. **A1 readers, A2 image/OCR, A3 v1-extractor deletion, A5 cutover hardening** deployed + verified; **A4 batch transport proven on staging** (50% pricing + cache hit; cron wiring deferred → A4d). **GATED 2026-06-14 (A8): GATE-PASS**, conditional on a founder DF-6 ruling (see below). Tail: A4d (batch cron, deferred), A7 (eval Tier A, deferred). |
| 3 Shared UI | Built + gated PASS **pending the founder design-token pick**. |
| 4 Public website | **Live**, but **NOT formally gated** and has a real tail (incl. orphaned image rendering). |
| 5–7 | Not started (by design). Stage 5 spec fleshed, awaits approval. |

## Done today (2026-06-13) — recorded so it's not re-listed as open

RDS Postgres deployed · website live (`d15dpmhcgtrf1r.cloudfront.net`) · migrations + seed · RDS
TLS/CA fix · durable `SITE_URL` canonical fix · **`PIPELINE_V2` flipped on** · 5 real listings
reimported through v2 + published · v2 write-path verified vs real RDS · `fix/miniapp-env-baked`
merged to `main` · the over-built `v2-catalog-cutover.md` spec deleted, finding salvaged · eval real
baseline · Q-SA1 connection-budget assertion · increment-7 batch acceptance (API side) · sharp-on-
Lambda mechanics proven.

---

## ▶ How we move forward (recommended critical path)

1. ~~**Finish the v2 cutover** — A1 (repoint readers to Postgres)~~ **DONE 2026-06-13** (`d4d43b6`,
   deployed + verified on real infra). The bot processor, reminder, and read-api/mini-app now read the
   v2 Postgres catalog; v2 listings are visible in-chat + in the mini-app. Next blocking work is the
   Stage 2 fast-follow cluster below (A2–A5) and the Stage 2/4 gates.
2. ~~**Clear the Stage 2 fast-follow cluster:** A2 image+OCR, **A3** delete `claudeExtractor`, **A4** batch warm-cache acceptance, **A5** cutover hardening~~ **ALL DONE** (batch cron wiring deferred — A4d). The Stage 2 build cluster is complete; the only Stage 2 item left is **A8** (the formal stage gate).
3. **Run the Stage 2 + Stage 4 stage gates** (never done) — the heavy full-diff review that reconciles
   shipped vs spec. This is where **4.1 image rendering** and any other gaps get formally caught/closed.
4. **Founder decisions** that unblock built work (design-token pick, Stage 5 approval, the two schema-gap
   rulings, price-filter sale-vs-rent ruling).
5. **Then Stage 5** (mini-app React rebuild) and beyond.

---

## Stage 2 — Extraction pipeline (code-complete, flipped live, NOT gated)

| # | Item | Priority |
|---|---|---|
| A1 | ~~**Repoint catalog readers to Postgres**~~ **DONE + DEPLOYED + VERIFIED 2026-06-13** (`d4d43b6`). `PostgresPropertyStore` (PropertyStore slice; ConversationStore stays DynamoDB) + `listing_event` table (+ partial `due & un-notified` index) + `CompositeCatalogRepository` (Dynamo conv + Postgres props, stitches `listPropertiesForUser` which moved PropertyStore→CatalogRepository). Processor + read-api → composite; reminder → bare PostgresPropertyStore; `DATABASE_URL` on all three (boot fail-fast). Read-api `book a viewing` write now lands in Postgres → its DynamoDB `PutItem` grant dropped. **Verified on real infra:** 2 real LINE users → their 5 real listings (16/10/11 photos) via the exact composite path; reminder Lambda queries `listing_event` clean post-deploy; read-api boots 401 (not 500). Increment-review PASS (3 seats). _Minor logged: edit-by-reply drops free-text values that aren't valid v2 enums (documented graceful-degrade); `listPropertiesForUser` is N+1 (same as v1, fine at scale)._ | ~~BLOCKING~~ **DONE** |
| A2 | ~~**Wire image derivatives + classify + chanote OCR** into the v2 sweep port~~ **DONE + DEPLOYED + VERIFIED 2026-06-13** (`60fc7cf`). Each swept image now gets a 1568px vision derivative (feeds classify + chanote OCR → deed numbers to dedup, gallery kinds) + a 640px thumb (stored on `listing_media.thumb_key` for 4.1). `buildDerivatives` re-keyed by a hash of the original key (built pre-segmentation); `S3RawArchive` implements the pipeline `MediaStore` (Q-SA3); per-photo build failure degrades just that photo (Q-SA2). sharp's arm64 binaries packaged into `dist/sweep` only (isolated temp-dir install; `.bin`/wasm pruned). Sweep role +`s3:PutObject`. **Verified:** sharp downscales real listing photos locally; pipeline 89 unit + 8 integration green; post-deploy sweep cold-starts clean (sharp loads on arm64 Lambda, 0 import errors); `thumb_key` column live. _Full classify+OCR on new listings exercises on next ingestion._ | ~~Fast-follow~~ **DONE** |
| A3 | ~~**Delete `claudeExtractor.ts` + 16-union test + drop the rule**~~ **DONE + DEPLOYED + VERIFIED 2026-06-14** (`c482d84` A3a, `1fefbfd` A3b). Founder ruling "we don't edit via reply anymore" → **retired in-chat edit-by-reply** (deleted `EditReplyHandler` + the edit-context machinery — `armEdit`/`getEditContext`/`clearEdit` off the `ConversationStore` port + Dynamo impl + composite + fake; processor no longer builds a Claude extractor). PIPELINE_V2 was permanently on so the **v1 sweep extract path was dead** → made `IngestionSweep` v2-only (claim→batch→v2 pipeline→release→push; `catalog` dep narrowed to `ConversationStore`), then deleted `claudeExtractor.ts` + the 16-union test, the extraction ports, `propertyMapping`, `sentinel`, `ingestionMedia` (moved `buildTranscript`+`ClassifiedMedia` into `pipelineV2Sweep`); retired the vestigial `PIPELINE_V2` flag (sweep always builds v2, `DATABASE_URL` fail-fast; dropped the infra env + Pulumi config). Dropped the 16-union rule from root `CLAUDE.md` + deleted the obsolete `adapters/anthropic/CLAUDE.md`. **v1 catalog table left intact (read-only).** **Verified:** no surviving `claudeExtractor` import; typecheck+lint+full test suite green (bot 239); `pulumi up` 12 updated / 0 created / 0 deleted; **post-deploy sweep cold-start CLEAN** (`18:20Z` initStart→"nothing due"→success → sharp loads on arm64, `DATABASE_URL` present, 0 import errors); website 200, read-api 401, processor/reminder clean. increment-review PASS (spec + simplicity + correctness; 1 stale-comment nit fixed). _~~Deferred: `createPipelineV2Port` + `buildTranscript` lack direct unit coverage~~ **CLOSED in A8** — `packages/bot/test/unit/pipelineV2Sweep.test.ts`, 11 tests (6 `buildTranscript`, 5 `createPipelineV2Port.run`)._ | ~~Fast-follow~~ **DONE** |
| A4 | ~~**Batch-mode routing + warm-cache acceptance**~~ **TRANSPORT PROVEN ON STAGING; live cron wiring DEFERRED (founder decision 2026-06-14).** Found: `runPipeline` is strictly sequential (6 dependent steps), so the async Batch API can't wrap it in one shot; inline-poll inside the 180s Lambda would negate the 50% savings via idle billing, and the clean cross-tick submit/collect (Q-SA2's "2-min poll skips INGESTING") needs resumable per-step tracker state — a sizable change for cents of savings at ~5 listings/day, while the **sync path already cache-hits**. **Warm-cache acceptance MET via a one-off staging run** (real Batch API over the existing `batch/{build,collect}.ts`): a 6-entry batch (4 extract/Sonnet + 2 translate/Haiku) → **6/6 schema-parsed, every row `mode=batch` = 50% pricing CONFIRMED**; **prompt-cache hit CONFIRMED** (`cache_read_input_tokens=3076` on a warm `EXTRACT_SYSTEM` prefix; 3076 tok ≥ Sonnet's 2048 floor); **Haiku 4096-floor caveat CONFIRMED** (translate's ~1547-tok prefix < 4096 → never caches; `in=1765` full). Nuance: a single batch's entries process concurrently → each *creates* the cache (no read in-batch); realizing batch caching wants a 1h-TTL `cache_control` (currently 5-min ephemeral) so the prefix survives batch latency — see A4d. | ~~Fast-follow~~ **DONE (proven); wiring deferred** |
| A4d | **Batch cron wiring (DEFERRED — founder 2026-06-14).** Route the live passive sweep through Batch: needs the cross-tick submit/collect state machine (tracker `batchId` + a resumable pipeline so the 2-min poll collects without Lambda idle) + a **1h-TTL `cache_control`** (`batch/build.ts` + `anthropicStepLlm.ts`) so the cached prefix survives batch latency. Defer until ingestion volume justifies the 50% savings vs the complexity (transport proven; sync path cache-hits). Minor: `cost.ts` ignores `cache_creation_input_tokens` (under-counts cached calls — advisory only, D21). | Deferred (founder) |
| A5 | ~~**Cutover hardening**~~ **DONE + DEPLOYED + VERIFIED 2026-06-14** (`eb666f6`). Four deliverables shipped: (1) **CloudWatch error alarms** — an SNS topic `linerobot-staging-alarms` + an `Errors>=1` (Sum/300s/1 eval/`notBreaching`) alarm per production Lambda (processor/sweep/reminder/read-api), each dimensioned on the physical function name + wired to the topic (`infra/src/alarms.ts`, exposed `processorFn`/`readApiFn`, output `alarmTopicArn`). Topic left **unsubscribed** (founder choice — recommend `aws sns subscribe … --protocol email`). (2) **Post-flip invariant check** — `packages/db/src/checkCutover.ts` (`npm run db:check-cutover -w @line-robot/db`): asserts RDS-host resolution, TLS-encrypted session (no split-brain), `listing`+`listing_event` queryable, the `listing_event_due` partial index, and that the reminder's claim query plans — PASS/FAIL lines + non-zero exit. (3) **Boot fail-fast** — VERIFIED already covered (sweep/processor/reminder hand-rolled `if DATABASE_URL undefined throw`; read-api via required Zod in `ReadApiEnvSchema`); no redundant guards added, locked with a 4-path regression test (`bootFailFast.test.ts`). (4) **Real-RDS test gate** — `packages/db/test/rds/realRds.test.ts` + `vitest.rds.config.ts` (`npm run test:rds -w @line-robot/db`): opt-in (DATABASE_URL host must be `rds.amazonaws.com`, else skips loudly), actually connects through `pgConnectionConfig` so the CA verify-full path runs (the exact thing Docker tests couldn't reach). **Verified on real infra:** `db:check-cutover` 6/6 PASS vs staging RDS; `test:rds` 3/3 pass vs staging RDS (+ skips cleanly when non-RDS); `describe-alarms` shows all 4 alarms live + correct + wired to the topic; `pulumi up` targeted = **5 created / 80 unchanged** (no Lambda redeploy, no destructive/security diff); sweep cron healthy (`status:success`, no errors), zero alarms IN ALARM. typecheck+lint+full suite green (bot 243). increment-review PASS (3 fresh seats: spec + simplicity + correctness; only finding = a cosmetic `pool`→`client` rename, fixed; the rest refuted with evidence). _Note: the deploy intentionally targeted only the alarm resources — the website-ssr `~code` churn (non-deterministic Astro rebuild of unchanged source) is deferred, not part of A5._ | ~~Fast-follow~~ **DONE** |
| A6 | **Q-SA2** — sweep orchestration: per-step failure + partial success (replace conversation-level retry-cap); decide Batch-completion trigger (poll vs push). Resolve during the A1/A2 build. | Eng (do during build) |
| A7 | **Eval Tier A** — real anonymized golden set + LLM-judge scoring; today classify/translate/gate are n/a and the gate row is a parse-health smoke, not judgment quality. | Deferred (advisory, D21) |
| A8 | ~~**Run the Stage 2 stage gate**~~ **DONE 2026-06-14 — GATE-PASS** (conditional on a founder DF-6 ruling; verdict + retro recorded in `plans/19-v2-marketplace-rebuild/stage-2-extraction-pipeline.md` "Stage gate" section). Diff under review `9c067f7..HEAD` (A1→A5). Three fresh-context reviewers (spec auditor / architecture-conformance / correctness), skeptic-adjudicated. **Architecture: CLEAN** — hexagonal boundaries hold (pipeline core imports no LINE adapter; bot `core/` never reaches into adapters); **zero surviving `claudeExtractor`**; the retired **16-nullable RULE is gone** from root `CLAUDE.md` + the deleted `adapters/anthropic/CLAUDE.md` (the pipeline's per-step "≤16 unions" guard test is the legit NEW invariant, kept); file-size watchlist clean (`db/repositories/listings.ts` 429 borderline-but-cohesive). **Eval: real-model re-run 62/0, scores identical to the committed baseline** (`packages/pipeline/eval-baseline.json`; delta 0.00 every step → no rewrite needed; D21 advisory, no regression). **A3 deferral folded in** (`createPipelineV2Port`+`buildTranscript` unit tests). **3 gate-found fixes** committed (intra-run geo-dedup pool coords + non-image attachment filter — both deployed-code, deployed + verified; bootFailFast assertion tightened). typecheck+lint+test green (bot 254, pipeline 89, db 28, domain 21). **Founder-gated deviation:** the DF-6 iterative bot-DM completion loop was never built — mooted by the A3a "no edit-by-reply" ruling; pipeline gate + moderation-queue routing work; needs an explicit founder bless-the-descope vs reschedule (see founder queue). | ~~Gate~~ **DONE (GATE-PASS)** |

## Stage 4 — Public website (live, NOT gated)

| # | Item | Priority |
|---|---|---|
| 4.1 | **Image rendering — ORPHANED.** Card hero (`heroUrl` hardcoded null), detail-page gallery, and `og:image` were all deferred "to S4-I6," but S4-I6 shipped infra only and never delivered media. Needs the SSR Lambda to resolve `listing_media` keys → URLs (S3 read + presign, or public CDN path) + the card/detail render. | **Blocking for "Stage 4 done"** (photo-first is core) |
| 4.2 | **Radius search** (S4-I4 deferred) — repo `findListingsNear` exists; needs a map/geolocation UI. | Deferred |
| 4.3 | **Price-range filter** (S4-I4 deferred) — needs a founder sale-vs-rent ruling (price on `listing.price_thb` vs `listing_rental.monthly_rent`). | Deferred (founder ruling) |
| 4.4 | **LINE Login (S4-I7, stretch) — not built.** Web OAuth + signed-cookie session + saved listings. A listed deliverable + gate-smoke dependency. | Stretch not built |
| 4.5 | **Owner submission form (S4-I8, stretch) — not built.** Async handoff into the pipeline (D12 web path). | Stretch not built |
| 4.6 | **Email/Google OAuth + account-linking UX** — schema landed Stage 1; UX deferred (Google needs app-verification, founder-owned). | Deferred |
| 4.7 | **Schema gaps the alignment register requires:** NPA/`listing_type` marker (DIST-01/MKT-11) and new-vs-resale (COMP-06) — domain-first migrations, ~1 increment each, need founder go-ahead. | Schema gap (founder) |
| 4.8 | **Dedicated detail-fields increment** — facing/road/zone/condo + rental-subtable rows not yet rendered on the detail page. | Deferred |
| 4.9 | **Minor:** DF-3 Accept-Language soft redirect; TECH-11 `transition:persist`; sitemap 10k cap + en-as-alternate; th-fallback under `lang="en"` (TH-08); search query GIN-index/seq-scan perf. | Minor (fast-follow) |
| 4.10 | **Run the Stage 4 stage gate** — there is **no gate section** in the spec; the heavy full-diff review + eval + Playwright smoke + docs were never run. This is where 4.1 and the rest get formally reconciled. (Note the gate smoke needs 4.4 LINE Login.) | Gate (overdue) |

## Stages 0 / 1 / 3 — carry-forwards (mostly minor / by design)

| # | Item | Priority |
|---|---|---|
| 0.1 | ~~Run `/increment-review` once on a real diff~~ **DONE 2026-06-13**: the three-seat panel (spec auditor + simplicity critic + `/code-review` correctness, skeptic-adjudicated) ran on the A1 diff → PASS. (Skill is `disable-model-invocation`/user-only, so its procedure was executed directly with fresh sub-agents — same independence.) | ~~one run~~ DONE |
| 0.2 | `scoreFuzzy` (LLM-judge) + photo-attribution scorers — deferred to Stage 2 eval (= A7). | Deferred |
| 1.1 | ~~**Q-SA4** — state the raw-archive retention as explicit infra config (S3 lifecycle rule + data-handling note).~~ **DONE** (audit 2026-06-13): `infra/src/storage.ts:105-120` has the `archive-lifecycle` rule + the recorded retention decision (keep indefinitely for now; revisit before launch). | ~~Eng (small)~~ DONE |
| 1.2 | Production RDS hardening (pre-launch): private subnets + VPC endpoints/NAT + restrict SG (D-S1-2); RDS Proxy if Stage 2 fan-out raises concurrency (D-S1-4). | Pre-launch |
| 1.3 | CKAN ingestor is **built + wired + tested** (`packages/pipeline/src/seed/ckanIngestor.ts`, imported in `seed/run.ts`, unit + integration tests). Only the **live** open-data pull (`CKAN_DATASTORE_URL=… npm run db:seed`) is outstanding — optional; data.go.th was unreachable from the sandbox. | Optional (code done) |
| 3.1 | `shadcn init` never done (D3.1) — components hand-rolled on tokens; adoption deferred to Stage 4/5 consumers. Native `<details>` used for accordion. | Deferred |

## Founder action queue (unblocks built work)

- ~~Pick the design-token direction~~ **DONE 2026-06-13: Direction A "Baania-clean" (trust-blue) confirmed** after side-by-side HTML mockups (`docs/design/mockups/direction-*.html`); `theme.css` header updated to founder-confirmed, fallbacks regenerated. **Stage 3 design-token gate is now unblocked.**
- ~~Approve the Stage 5 build~~ **DONE 2026-06-13: Stage 5 shape approved** (claim/publish + My-Listings + viewings/follow-ups). Build it; the mocks in `docs/design/mockups/` are inspiration only.
- ~~Rulings: price-filter + schema gaps~~ **DONE 2026-06-13** (directions only — see `docs/design/mockups/README.md`): price filter = **contextual** (Buy/Rent relabels one range); **add both** schema fields (NPA/`listing_type` + new-vs-resale), surfaced via **detail-page disclosure + subtle meta**. **CONSTRAINTS for the real build:** rebuild UI from scratch (mocks = inspiration only); price ranges must use ACTUAL North-Thai bands from `a2-market-landscape-north.md` (NOT the demo brackets); **tone DOWN the NPA red** — it reads as alert/warning, should be a calm category highlight, not danger.
- ~~**Set `lineOaUrl`**~~ **DONE 2026-06-13:** `lineOaUrl = https://line.me/R/ti/p/@685kqtou` (founder
  OA basic ID); env-only `pulumi up` (website-ssr), verified — detail pages render the "แชทผ่าน LINE"
  CTA (CONV-06), and the founder confirmed the link opens the right OA. _No LINE verification was
  needed (basic ID auto-exists; add-friend link works unverified)._
- ~~**Deploy-policy gap (infra):** no `sns`/`cloudwatch` perms for A5 monitoring.~~ **DONE 2026-06-14**
  (`be4ab81`): scoped `sns:*` on `linerobot-*` topics + cloudwatch alarm actions on `linerobot-*`
  alarms + `cloudwatch:DescribeAlarms` global, applied as policy **v10** via tea-admin (pruned v5 for
  the 5-version cap). Verified live: `line-robot` can `DescribeAlarms` + sns on `linerobot-*`. **A5
  alarm deploy is unblocked.**
- **Bless or flag** the logged deviations in Stage 1–3 specs (built under blanket sprint approval).
- **DF-6 completion loop — descope or reschedule? (surfaced by the A8 Stage 2 gate.)** The Stage 2 spec
  promised a bot-DM loop that asks the poster for missing fields/photos and re-runs the quality gate on
  each reply until it passes. It was never built — it is a reply-driven flow, and your A3a ruling "we
  don't edit listings via plain-text reply anymore" retired reply-driven editing, which moots it. The
  pipeline half shipped (structured `GateResult`; hard-blocker / `needs_review` → moderation queue). Two
  options: **(a)** bless the descope — DF-6 superseded by claim/publish + admin moderation (recommended,
  consistent with A3a); or **(b)** reschedule a non-reply completion surface (e.g. a mini-app "complete
  your listing" prompt) into Stage 5. Not blocking; the quality gate functions either way.
- **Domain (D19):** real domain + Route 53 + ACM (interim canonical = staging CloudFront is set; the real
  domain unblocks LINE Login redirect + real SEO).

## By design / later (NOT Stages 0–4 — for completeness)

Stage 5 mini-app React rebuild (Preact retired) · Stage 6 groups/dealflow + exclusivity windows + role
vetting + quick-quote · Stage 7 AVM/market data (the `market_data` table is a Stage-7 placeholder;
`listing_exclusivity` types exist, behaviour is Stage 6) · plan 07 prod rollout (separate `prod` stack) ·
plan 08 hardening (CloudWatch dashboard, JWT rotation, S3 `*V2` deprecations) · MINI-App verification ·
GSI3 convMembers · Batch-API history backfill — all intentionally deferred, no consumer yet.
