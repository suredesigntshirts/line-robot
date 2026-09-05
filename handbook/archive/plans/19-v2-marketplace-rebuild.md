# Plan 19 — V2 Marketplace Rebuild (master plan)

**Status: DRAFT — master plan approved in principle; each stage requires its own fleshed spec + user approval before any code is written.**

- Direction settled with the user 2026-06-12 (Q&A rounds; full decision register below).
- Stage specs live in `plans/19-v2-marketplace-rebuild/` — one doc per stage, written as a skeleton now, fleshed out just-in-time before its stage starts, iterated with the user, and only then built.
- Predecessors: plans 00–17 (deployed v1), plan 18 (dedup design sketch — superseded by Stage 2 here, ideas absorbed).

---

## 1. Why v2

The v1 system (plans 00–17) proved the concept: a LINE bot that passively listens to group chats, extracts property listings with Claude, and shows them in a LIFF mini-app. A full review (2026-06-12) found:

**Worth keeping.** The ingestion spine is genuinely solid: webhook → signature verify → SQS → processor → debounced sweep, with idempotency, least-privilege IAM, DLQs, and 257 unit + 27 integration tests. Hexagonal architecture is cleanly applied.

**Not fit for the product we're building:**

| Area | v1 reality | Why it can't carry v2 |
|---|---|---|
| LLM pipeline | 3 prompts as string constants, Haiku-first, zero eval harness — every prompt change is a live production experiment | No way to measure or protect extraction quality |
| Extraction schema | One big strict-output schema, hard-capped at 16 nullable/union params (already caused one full outage) | Structural ceiling on listing richness |
| Dedup | 100% LLM judgment over an unbounded candidate list | Silent duplicate listings; token cost grows with history |
| Data model | DynamoDB single-table, all visibility implicit via "shares a chat" | No roles, no public/private, no groups, no geo/faceted search, no price history, no i18n fields — the marketplace cannot be expressed in it |
| Mini-app | 2-screen Preact SPA, bespoke CSS, hardcoded English | shadcn/component-sharing requires React; no i18n anywhere |
| Cost levers | Prompt caching configured but inert (prompts below cache minimum), full-res images to vision, no Batch API | All three big levers unused |

**Decision: clean slate on the catalog.** Current data is disposable test data. The ingestion spine, LINE adapters, and infra tooling are retained; the catalog data model, extraction pipeline internals, and the SPA are rebuilt.

---

## 2. Product vision

A real-estate marketplace for Thailand (North-flavored marketing, no hard geographic restriction) with a LINE-native growth loop:

1. **Passive collection** — the bot sits in LINE groups where brokers/owners already share listings and extracts them automatically. Listings are **private to that group's mirror** by default.
2. **Claim & publish** — the bot DMs the poster: claim your listing, publish it publicly with one tap (**poster opt-in is the only path to public**; doubles as user onboarding).
3. **Group first-dibs** — each listing gets a **time-based exclusivity window** in its group (default 7 days, configurable per group). Members can flag interest to hold it; when the window lapses, the poster can release it publicly or to other groups.
4. **Public website** — SEO-ready Astro site: anonymous browse/search of public listings (buy / sell / rent), owner submission via form *or* chat, Thai + English.
5. **Roles & dealflow** — broker / investor / owner / visitor. Broker and investor are **admin-approved**. Owners can submit discounted quick-sale properties; matched vetted brokers/investors get a LINE push and respond with structured quotes in-app.
6. **Price estimates (AVM)** — hybrid: own listing corpus + LLM comparable analysis first; public land-office sales data ingested via a dedicated pipeline; broker quotes enrich it over time. Outputs market price + time-to-sell at various price points.

**Business model:** public listings free; later, broker/investor subscriptions pay for private dealflow access. Build order optimizes for the inventory/traffic flywheel first.

---

## 3. Decision register (settled 2026-06-12)

| # | Decision | Choice |
|---|---|---|
| D1 | Catalog database | **Postgres** (PostGIS for geo). DynamoDB retained only for ingestion plumbing: raw messages, idempotency, sweep/debounce state |
| D2 | Data migration | **None — clean slate.** v1 catalog is disposable |
| D3 | Hosting | **All-AWS via Pulumi**, ap-southeast-1. Website = Astro 6 SSR + React islands + Tailwind + shadcn |
| D4 | Frontend stack | **One React stack**: shared `packages/ui` (React + Tailwind + shadcn + tokens) consumed by Astro islands and a rebuilt mini-app. Preact SPA retired |
| D5 | Auth | Anonymous public browse. **LINE Login primary** (mini-app always LIFF). Website also email/Google → **account-linking modeled in schema from day one** |
| D6 | Groups | **Mirrored from LINE chats first**, modeled as first-class entities; web-native groups later |
| D7 | Publishing | **Poster opt-in only** (bot DM → claim → publish) |
| D8 | Group exclusivity | **Time-based window** (default 7 days, configurable); interest flags hold; lapse → releasable |
| D9 | Roles | broker / investor / owner / visitor; **broker + investor admin-approved** |
| D10 | Quick-sale channel | **LINE push (Flex) to matched vetted brokers/investors → structured quotes in-app** (quotes also feed the AVM) |
| D11 | Moderation | **Auto-publish behind an LLM quality/duplicate/spam gate**; failures → admin review queue |
| D12 | Submission UX | **Both** structured web form and chat flow (DM the bot → extraction → confirm in mini-app) |
| D13 | CRM vs marketplace | **Split**: listings get marketplace lifecycle (draft/active/under-offer/sold/rented/withdrawn); saved/viewings/follow-ups/notes are per-user features; edit-by-reply survives for own listings |
| D14 | i18n | **Design for N languages, ship Thai + English.** Listing content stored per-language, LLM-translated at write time; UI string catalogs |
| D15 | Extraction economics | **Hybrid**: interactive paths synchronous; passive group extraction via **Anthropic Batch API** |
| D16 | Model choice | **Quality first, optimize later** — best eval scores during seeding phase, tuned down using scorecard data |
| D17 | AVM data | **Hybrid**: own corpus + LLM comps → + land-office sales dumps (ingestion pipeline) → + broker quotes |
| D18 | Geography | No restriction; North-Thailand-flavored marketing |
| D19 | Domain | TBD — placeholder; register + Route53 + ACM as an early manual step |
| D20 | Sequencing | Fewer, bigger foundation stages; **public website is the first user-facing milestone** |
| D21 | Eval gating | **Advisory only** — scorecard always runs and reports; never blocks; user judges regressions |
| D22 | Review cadence | **Per-increment adversarial panel + per-stage heavy gate** (see §6) |
| D23 | Process persistence | Quality workflow encoded as project skill(s) + repo CLAUDE.md rules + this plan |
| D24 | Rebuild depth | **First-principles rebuild of all product layers; the kept v1 spine is kept on evidence, not by default** — Stage 0 runs a first-principles re-audit of the retained layer ("if designed from zero, would anything differ?"); anything flagged is rebuilt, the rest is kept with written justification |
| D25 | Pre-build research | **10-artifact research program** (Thai market/users/tech → `docs/research/`, see `19-v2-marketplace-rebuild/research-program.md`) runs before Stage 1 flesh-out; outputs a **numbered heuristic register** enforced by a second review skill **`/alignment-review`** (separate from the code-focused /increment-review); thought-leader-first sourcing, Thai-language sources required, A5 teardown via live browsing; A6 legal scoped to test-phase disclosure |
| D26 | Vertical priority | **Sales first, rentals second.** Both fully modeled in the Stage 1 schema and handled by the extraction pipeline from day one (rental fields per DEAL-11/FIELD-08/FIELD-12); where stage work must be sequenced, sale flows ship before rental-specific UX (rental facets, renewal/turnover loop). Rentals are a fast-follow, not a phase-2 afterthought — research shows the rental market growing while sales contract |

---

## 4. Target architecture

### 4.1 Stores

- **Postgres** — single source of truth for the marketplace: listings (+ per-language content), users, identities/account-links, roles, groups, memberships, visibility/exclusivity state, viewings, saved/interest flags, quotes, price history, market-data (land-office sales), moderation queue. PostGIS for radius/bbox search; Postgres FTS for text search (OpenSearch explicitly *not* planned at this scale).
  - Engine sizing decided in Stage 1 spec: Aurora Serverless v2 vs plain RDS (t4g class). Honest note: Aurora Serverless v2 has a cost floor (~0.5 ACU ≈ $40+/mo); a small RDS instance is ~$12–15/mo and is likely the right start at this scale.
- **DynamoDB** (retained, ingestion plumbing only) — raw message log, idempotency, conversation tracker/debounce state. The catalog/membership/event entities in the v1 catalog table are retired.
- **S3** — raw webhook archive, listing media (with an image-derivative step: downscaled variants for vision calls and web delivery), market-data dumps.

### 4.2 Compute & packages (target shape — exact layout finalized in Stage 1)

```
packages/
  domain/      pure types + business rules (listing lifecycle, exclusivity windows, roles)
  db/          Postgres schema, migrations, query layer (consumed by api, pipeline, website SSR)
  pipeline/    extraction pipeline v2 + eval harness + synthetic generator
  api/         HTTP API (Lambda) for mini-app + website islands; auth (LIFF token / session)
  ui/          React + Tailwind + shadcn components, tokens, i18n strings
  website/     Astro 6 SSR (Lambda + CloudFront), React islands from ui/
  miniapp/     rebuilt React SPA on ui/ (replaces Preact)
  bot/         slimmed: LINE adapters, webhook/processor/sweep lambdas, chat UX (Flex, rich menu)
infra/         Pulumi (existing, extended: Postgres, website, api)
```

v1 `packages/shared` is absorbed into `domain/`. The bot's webhook → SQS → processor → debounced sweep spine is kept as-is; the sweep's *internals* call the new pipeline.

### 4.3 Extraction pipeline v2 — design principles

Replaces the single-big-schema extractor. Multi-step, each step a small focused schema (dissolves the 16-union cap permanently):

1. **Classify & preprocess** — image downscaling before vision; image classify (property/chanote/other) and OCR as today, but on derivatives.
2. **Segment** — split a conversation batch into property mentions (as today, hardened).
3. **Extract** — per-segment structured extraction; **validated enums** (zod enums, not free strings); Thai-unit normalization.
4. **Dedup** — deterministic blocking first (deed number, geohash proximity, normalized-address/trigram similarity → small candidate set), LLM verify only on survivors. Absorbs plan 18.
5. **Translate** — write-time LLM translation of listing content into the other shipped language(s); stored per-language.
6. **Quality gate** — completeness/spam/duplicate screen before any public visibility (D11).

Cross-cutting: hybrid sync/batch (D15 — sweep path through Batch API, interactive edit path synchronous); per-step model selection driven by eval scores (D16); prompt caching made real (shared cached prefix above the cache minimum); per-call cost logging; every step independently evaluable.

---

## 5. Quality system

### 5.1 Synthetic data, generated backwards

A generator agent takes a **structured ground-truth listing spec** (price, deed type, location, photos, language mix) plus a **chaos profile** (typos, Thai slang, ล้าน abbreviations, multi-property dumps, out-of-order photos, mid-thread corrections, duplicate re-posts) and emits a realistic LINE transcript. Expected extraction is known **by construction** — no hand-labeling.

One generator, three consumers:
- **Eval golden set** — Tier A: real anonymized archived chats, hand-verified (high-trust regression core). Tier B: synthetic coverage of rare paths (ส.ป.ก. deeds, rentals, mixed-language, dedup traps). Every production extraction bug becomes a new case — the set only ratchets up.
- **Seed fixtures** — the same ground-truth specs load into Postgres so the website/search/groups/mini-app are developed and integration-tested against a realistic populated dataset (clean slate would otherwise mean building UI against an empty DB).
- **Dedup pairs** — generated duplicates-with-variation give the dedup layer labeled match/no-match pairs.

### 5.2 Eval runner

Thin bespoke TS runner (not promptfoo). Per-field deterministic scoring (exact for enums/numbers with tolerance; fuzzy/LLM-judge only for free text); separate scores for segmentation (property count, photo attribution) and dedup (pair precision/recall). Scorecard baseline committed to the repo; runs on any prompt/schema/model change and nightly; prints API cost per run. **Advisory only (D21)** — regressions are reported, never blocking; the user judges.

### 5.3 Adversarial code review (D22)

- **Every change (free, non-negotiable):** typecheck, Biome lint, unit tests, coverage threshold.
- **Every increment (PR-sized unit):** three fresh-context reviewer sub-agents that did not write the code:
  1. **Spec auditor** — diff vs the stage spec; every acceptance criterion verified; scope drift flagged both directions.
  2. **Correctness reviewer** — bugs, edge cases, error paths.
  3. **Simplicity critic** — adversarially hunts over-engineering: one-caller abstractions, single-implementation interfaces, premature generality, config nobody sets. Its findings are treated as seriously as bugs.
  Findings are verified by a skeptic agent before being acted on; judgment calls surface to the user.
- **Every stage gate:** high-effort code review across the stage's full diff; architecture-conformance check (hexagonal boundaries, no adapter imports in core, file-size watchlist); eval scorecard vs baseline; Playwright smoke on critical user flows (user-facing stages); docs/CLAUDE.md updated.

**Anti-over-engineering rules:** no interface until the second implementation exists; ports only at real seams (LLM, DB, LINE); the deliverable is code a human developer reads without a guide.

**Persistence (D23):** `/increment-review` project skill in `.claude/`; cadence + rules in repo `CLAUDE.md`; eval runner as an npm script; this section mirrored into every stage spec.

---

## 6. Stages

**What's still left to build is consolidated in [`BACKLOG.md`](../../BACKLOG.md)** (repo root) — the
single source of truth for outstanding items across stages, rolled up from the per-stage iteration
logs so nothing hides in a deviation row. Per-increment spec conformance is checked by
`/increment-review` (spec auditor); deferrals it logs must land in `BACKLOG.md`.

Stage specs in `plans/19-v2-marketplace-rebuild/`. Lifecycle of each stage doc:

```
skeleton (now) → fleshed spec → user approval → build (increment reviews)
              → stage gate (heavy review) → retro notes appended → next stage
```

| Stage | Doc | Scope (one line) | Ships |
|---|---|---|---|
| R | `research-program.md` | Pre-build research: 10 artifacts → `docs/research/` + heuristic register + capstone principles (D25); runs before/alongside Stage 0 | Research artifacts; capstone gates Stage 1 flesh-out |
| 0 | `stage-0-quality-bootstrap.md` | /increment-review + **/alignment-review** skills, CLAUDE.md quality rules, eval-runner scaffold, **v1-spine first-principles re-audit (D24)** | The workflow itself + keep/rebuild verdicts |
| 1 | `stage-1-data-foundations.md` | Postgres + PostGIS via Pulumi, full marketplace schema + migrations, domain package, synthetic generator + seed fixtures | Populated dev database |
| 2 | `stage-2-extraction-pipeline.md` | Pipeline v2 (classify→segment→extract→dedup→translate→gate), eval harness + golden set, hybrid sync/batch, writes to Postgres | Bot extracting into the new model, scorecard live |
| 3 | `stage-3-shared-ui.md` | packages/ui: React + Tailwind + shadcn, design tokens, Thai/English i18n plumbing, core listing components | Storybook-style component gallery |
| 4 | `stage-4-public-website.md` | Astro 6 SSR site: browse/search/detail (SEO), LINE Login + email auth + account linking, owner submission form, domain/ACM | **First public milestone** |
| 5 | `stage-5-miniapp-rebuild.md` | React mini-app on packages/ui: claim/publish opt-in, my listings, saved/viewings, edit-by-reply kept | Preact retired |
| 6 | `stage-6-groups-dealflow.md` | Mirrored groups, exclusivity windows + release mechanics, role vetting + admin screens, quick-quote flow | Private dealflow live |
| 7 | `stage-7-avm-market-data.md` | Land-office data ingestion pipeline, comparable-based estimates + time-to-sell, quick-sale matching | Estimates live |

Dependencies: 0 → 1 → 2; 3 can overlap 2; 4 needs 1+2+3; 5 needs 3 (+4's auth); 6 needs 5; 7 needs 1 (data) and 6 (quote flow), estimate math can start earlier.

---

## 7. Kept / retired from v1

**Kept — conditional on the D24 re-audit:** webhook → SQS → processor → debounced sweep spine; LINE adapters (signature verify, webhook parser, gateway, rich menu); idempotency; Pulumi setup + deploy identity; S3 archive; test harness patterns (vitest, DynamoDB Local, fakes at ports). The Stage 0 re-audit reviews this layer from first principles with fresh-context agents; each component is either rebuilt (findings feed the Stage 1/2 specs) or kept with its justification on record in the audit dossier.

**Retired:** single-big-schema extractor (16-union constraint becomes moot — the guard rules in `adapters/anthropic/CLAUDE.md` stay until the old extractor is deleted); v1 catalog DynamoDB entities + membership-gated read-api; Preact SPA; conversation-scoped visibility as the security model.

---

## 8. Risks & open items

- **Domain/brand TBD (D19)** — blocks SEO/LINE-Login config late in Stage 4; nothing earlier.
- **Postgres cost floor** — Aurora Serverless v2 minimum ≈ $40+/mo vs small RDS ≈ $12–15/mo; decide in Stage 1 spec.
- **Account linking (D5)** — email user ↔ LINE user merge has real edge cases (conflicting claims); schema lands in Stage 1, UX deferred to Stage 4+.
- **Batch API latency** — passive path results may take up to 1h worst-case; group confirmation messages must be phrased accordingly (Stage 2).
- **Exclusivity default** — proposed 7 days, configurable per group; confirm in Stage 6 spec.
- **Anonymization of real eval fixtures** — strip LINE IDs/names/phone numbers before archived chats enter the repo-committed golden set (Stage 2 spec defines the scrub).
- **v1 keeps running** during Stages 0–3 (it's the source of archived chats and live groups); cutover plan defined in Stage 2 (pipeline) and Stage 5 (mini-app).
