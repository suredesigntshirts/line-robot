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
| 2 Extraction pipeline | Code-complete, **flipped live** (`PIPELINE_V2=on`); **readers repointed to Postgres (A1 done + deployed 2026-06-13)**. **NOT formally gated.** Fast-follow tail (A2–A5). |
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
2. **Clear the Stage 2 fast-follow cluster** that ships with/after A1: **A2** image+OCR wiring,
   **A3** delete `claudeExtractor`, **A4** batch routing + warm-cache check, **A5** cutover hardening.
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
| A2 | **Wire image derivatives + classify + chanote OCR** into the v2 sweep port (apply the proven sharp-on-Lambda recipe scoped to `dist/sweep`). v2-lite skips these → no deed OCR, unfiltered galleries. (= spine Q-SA3 archive-derivatives port.) | Fast-follow (recommended with A1) |
| A3 | **Delete `claudeExtractor.ts` + the 16-union regression test**, and drop the 16-union rule from the CLAUDE.md files once gone (D2.5 step 5). | Fast-follow |
| A4 | **Batch-mode routing in the sweep** + the live warm-cache acceptance (`cache_read_input_tokens > 0`) and one Lambda-side batch sweep in staging. | Fast-follow |
| A5 | **Cutover hardening** — boot fail-fast on missing `DATABASE_URL` (processor/reminder/read-api), a real-RDS test gate (not just Docker/fakes — how the TLS bug slipped), a CloudWatch sweep-error alarm + a post-flip invariant check. | Fast-follow (resilience) |
| A6 | **Q-SA2** — sweep orchestration: per-step failure + partial success (replace conversation-level retry-cap); decide Batch-completion trigger (poll vs push). Resolve during the A1/A2 build. | Eng (do during build) |
| A7 | **Eval Tier A** — real anonymized golden set + LLM-judge scoring; today classify/translate/gate are n/a and the gate row is a parse-health smoke, not judgment quality. | Deferred (advisory, D21) |
| A8 | **Run the Stage 2 stage gate** — full-diff review, eval scorecard, architecture conformance, commit the real-model baseline. Depends on A1–A3. | Gate (do after A1–A3) |

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
| 0.1 | Run `/increment-review` once on a real diff — closes the Stage 0 gate's skill-invocation loop (gate passed on procedure execution). | Founder/eng (one run) |
| 0.2 | `scoreFuzzy` (LLM-judge) + photo-attribution scorers — deferred to Stage 2 eval (= A7). | Deferred |
| 1.1 | ~~**Q-SA4** — state the raw-archive retention as explicit infra config (S3 lifecycle rule + data-handling note).~~ **DONE** (audit 2026-06-13): `infra/src/storage.ts:105-120` has the `archive-lifecycle` rule + the recorded retention decision (keep indefinitely for now; revisit before launch). | ~~Eng (small)~~ DONE |
| 1.2 | Production RDS hardening (pre-launch): private subnets + VPC endpoints/NAT + restrict SG (D-S1-2); RDS Proxy if Stage 2 fan-out raises concurrency (D-S1-4). | Pre-launch |
| 1.3 | CKAN ingestor is **built + wired + tested** (`packages/pipeline/src/seed/ckanIngestor.ts`, imported in `seed/run.ts`, unit + integration tests). Only the **live** open-data pull (`CKAN_DATASTORE_URL=… npm run db:seed`) is outstanding — optional; data.go.th was unreachable from the sandbox. | Optional (code done) |
| 3.1 | `shadcn init` never done (D3.1) — components hand-rolled on tokens; adoption deferred to Stage 4/5 consumers. Native `<details>` used for accordion. | Deferred |

## Founder action queue (unblocks built work)

- ~~Pick the design-token direction~~ **DONE 2026-06-13: Direction A "Baania-clean" (trust-blue) confirmed** after side-by-side HTML mockups (`docs/design/mockups/direction-*.html`); `theme.css` header updated to founder-confirmed, fallbacks regenerated. **Stage 3 design-token gate is now unblocked.**
- ~~Approve the Stage 5 build~~ **DONE 2026-06-13: Stage 5 shape approved** (claim/publish + My-Listings + viewings/follow-ups). Build it; the mocks in `docs/design/mockups/` are inspiration only.
- ~~Rulings: price-filter + schema gaps~~ **DONE 2026-06-13** (directions only — see `docs/design/mockups/README.md`): price filter = **contextual** (Buy/Rent relabels one range); **add both** schema fields (NPA/`listing_type` + new-vs-resale), surfaced via **detail-page disclosure + subtle meta**. **CONSTRAINTS for the real build:** rebuild UI from scratch (mocks = inspiration only); price ranges must use ACTUAL North-Thai bands from `a2-market-landscape-north.md` (NOT the demo brackets); **tone DOWN the NPA red** — it reads as alert/warning, should be a calm category highlight, not danger.
- **Set `lineOaUrl`** Pulumi config to light the detail-page "Chat on LINE" CTA (CONV-06).
- **Bless or flag** the logged deviations in Stage 1–3 specs (built under blanket sprint approval).
- **Domain (D19):** real domain + Route 53 + ACM (interim canonical = staging CloudFront is set; the real
  domain unblocks LINE Login redirect + real SEO).

## By design / later (NOT Stages 0–4 — for completeness)

Stage 5 mini-app React rebuild (Preact retired) · Stage 6 groups/dealflow + exclusivity windows + role
vetting + quick-quote · Stage 7 AVM/market data (the `market_data` table is a Stage-7 placeholder;
`listing_exclusivity` types exist, behaviour is Stage 6) · plan 07 prod rollout (separate `prod` stack) ·
plan 08 hardening (CloudWatch dashboard, JWT rotation, S3 `*V2` deprecations) · MINI-App verification ·
GSI3 convMembers · Batch-API history backfill — all intentionally deferred, no consumer yet.
