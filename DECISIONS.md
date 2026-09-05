# DECISIONS — durable decision log

One line per decision. Status: **active** · **superseded by …** · **under review**. Rationale lives in
the source document, not here. Add a row when a decision is taken; never rewrite history — mark it
superseded instead. `STATUS.md` says what is true now; this file says what was decided and when.
**The status column records the decision's state, not build state** — "active" means still the
intent, not "in place". Build state is `STATUS.md`'s job; where a decision is only partly built, the
cell says so in parentheses.

| id | date | decision | status | source |
|---|---|---|---|---|
| D1 | 2026-06-12 | Catalog database = Postgres (PostGIS for geo); DynamoDB only for ingestion plumbing (raw messages, idempotency, sweep/debounce state) | active | `handbook/archive/plans/19-v2-marketplace-rebuild.md` §3 |
| D2 | 2026-06-12 | No data migration from v1 — clean slate | active (done) | plan 19 §3 |
| D3 | 2026-06-12 | Hosting = all-AWS via Pulumi, ap-southeast-1; website = Astro 6 SSR + React islands + Tailwind + shadcn | active | plan 19 §3 |
| D4 | 2026-06-12 | One React stack: shared `packages/ui` consumed by Astro islands and the rebuilt mini-app; Preact SPA retired | active | plan 19 §3 |
| D5 | 2026-06-12 | Auth: anonymous public browse; LINE Login primary (mini-app always LIFF); website also email/Google; account-linking modeled in schema from day one | **under review** (supply decision D27 may change it) | plan 19 §3 |
| D6 | 2026-06-12 | Groups mirrored from LINE chats first, modeled as first-class entities; web-native groups later | active | plan 19 §3 |
| D7 | 2026-06-12 | Publishing = poster opt-in only (bot DM → claim → publish) | **under review** (supply decision D27 may change it) | plan 19 §3 |
| D8 | 2026-06-12 | Group exclusivity = time-based window (default 7 days, per-group configurable); interest flags hold; lapse → releasable | active | plan 19 §3 |
| D9 | 2026-06-12 | Roles broker / investor / owner / visitor; broker + investor admin-approved | active | plan 19 §3 |
| D10 | 2026-06-12 | Quick-sale channel = LINE push (Flex) to matched vetted brokers/investors → structured quotes in-app (quotes feed the AVM) | active (built in Stage 6, parked with the bot) | plan 19 §3 |
| D11 | 2026-06-12 | Moderation = auto-publish behind an LLM quality/duplicate/spam gate; failures → admin review queue | active (queue + admin review built; the approve→visible block is NOT wired — S6-11, STATUS Deferred) | plan 19 §3 |
| D12 | 2026-06-12 | Submission UX = both a structured web form and a chat flow | active | plan 19 §3 |
| D13 | 2026-06-12 | CRM vs marketplace split: listings get a marketplace lifecycle; saved/viewings/follow-ups/notes are per-user features (the edit-by-reply clause was retired in Stage 5, ruling A3a — owner edit is a form) | active | plan 19 §3 |
| D14 | 2026-06-12 | Design for N languages, ship Thai + English; listing content stored per-language, LLM-translated at write time | active | plan 19 §3 |
| D15 | 2026-06-12 | Extraction economics hybrid: interactive paths synchronous; passive group extraction via the Anthropic Batch API | active (Batch transport built; the live sweep is not routed through it — A4d, STATUS Deferred) | plan 19 §3 |
| D16 | 2026-06-12 | Model choice: quality first, optimize later using scorecard data | active | plan 19 §3 |
| D17 | 2026-06-12 | AVM data hybrid: own corpus + LLM comps → land-office sales dumps → broker quotes | active (not built; Stage 7 is a skeleton) | plan 19 §3 |
| D18 | 2026-06-12 | Geography: no restriction; North-Thailand-flavored marketing | active | plan 19 §3 |
| D19 | 2026-06-12 | Domain: TBD placeholder; register + Route53 + ACM as an early manual step | active (still open) | plan 19 §3 |
| D20 | 2026-06-12 | Sequencing: fewer, bigger foundation stages; public website is the first user-facing milestone | active | plan 19 §3 |
| D21 | 2026-06-12 | Eval gating advisory only — the scorecard always runs and reports, never blocks; the founder judges | active | plan 19 §3 |
| D22 | 2026-06-12 | Review cadence = per-increment adversarial panel + per-stage heavy gate | superseded by plan 24 §0 #4 (free gate + Playwright e2e + `/frontend-review` opt-in) | plan 19 §3; `handbook/archive/plans/24-context-cleanup.md` |
| D23 | 2026-06-12 | Process persistence: quality workflow encoded as project skills + repo CLAUDE.md rules + the plan | active (skills reduced per plan 24) | plan 19 §3 |
| D24 | 2026-06-12 | Rebuild depth: first-principles rebuild of all product layers; the kept v1 spine is kept on evidence, not by default | active (done) | plan 19 §3 |
| D25 | 2026-06-12 | Pre-build research program: 10 artifacts → heuristic register enforced at review | active (done; register frozen 2026-09) | plan 19 §3; `handbook/research/00-product-principles.md` |
| D26 | 2026-06-12 | Vertical priority: sales first, rentals second; both modeled and extracted from day one | active | plan 19 §3 |
| DF-1 | 2026-06-12 | Exclusivity window (D8) unvalidated as a Thai norm → keep the mechanic, validate in real groups, window group-configurable from day one | active | `handbook/research/00-product-principles.md` §3 |
| DF-2 | 2026-06-12 | Deploy adapter: Pulumi-wired Lambda shim over `@astrojs/node`, no SST (ruled by live spike) | active | principles §3; `handbook/archive/spikes/astro-ssr-pulumi-FINDINGS.md` |
| DF-3 | 2026-06-12 | Default locale `th` (clean Thai URLs, `/en/` prefix, Accept-Language soft redirect on first visit) | active | principles §3 |
| DF-4 | 2026-06-12 | Listing lifecycle adopts the Thai 3-stage close: `saleStage` available / reserved / under_contract / transferred; no auto-release while reserved; rentals simpler | active | principles §3 |
| DF-5 | 2026-06-12 | External data ingestion: LED CKAN first; pipelines pluggable; seed-scale only at start; bank-NPA portals no-scrape | active | principles §3 |
| DF-6 | 2026-06-12 | Photo floor = nudge-and-iterate (bot keeps asking until the quality gate is satisfied; no hard photo-count block) | active (descoped from Stage 5 mini-app) | principles §3 |
| DF-7 | 2026-06-12 | Fee/commission math: schema fields in Stage 1; user-facing display gated behind broker validation | active | principles §3 |
| DF-8 | 2026-06-12 | Burmese as a future language: don't plan for it; revisit only on analytics evidence | active | principles §3 |
| P21-1 | 2026-06-13 | Design tokens = Direction A "Baania-clean" trust-blue; `packages/ui/theme.css` is the single token source | active | `handbook/design/design-direction.md`; `handbook/archive/plans/21-frontend-architecture-conformance.md` |
| P21-2 | 2026-06-14 | Deploy adapter confirmed: Pulumi + `build-lambda.mjs` + `@astrojs/node`; supersedes canon TECH-12 (`astro-sst`) | active | plan 21 "Out (settled)"; `handbook/research/c1-frontend-stack-canon.md` |
| D27 | 2026-09-05 | Website-first; the LINE bot / mini-app is parked (deployed, not developed). Listing supply = a website submission form re-using the extraction pipeline (own plan later) | **planned** | `handbook/archive/plans/24-context-cleanup.md` §0; prior art BACKLOG 4.5 / stage-4 S4-I8 (`handbook/archive/2026-06-sprint/BACKLOG.md`) |
| D28 | 2026-09-05 | UI template variants (A/B + design exploration) selected via `?ui=` → sticky `ui` cookie, registry in `packages/website/src/lib/variants.ts`; all variants render from one facet model, zero React | active | commit `f69d8c2`; `packages/website/CLAUDE.md` |
| D29 | 2026-09-05 | Brand wordmark stays the placeholder "ทรัพย์ดี / Sapdee", read from the i18n catalog (`site.name`) so a rename is one edit | active (name still open) | `handbook/archive/skill-hardening/FOUNDER-QUEUE.md` FQ-4; `STATUS.md` |
| D30 | 2026-09-05 | Poster pseudo-owner ids (`group#…`, conversation pseudo-users) are never rendered as the poster on the website | active | `packages/website/src/lib/cards.ts`; commit `f69d8c2` |
