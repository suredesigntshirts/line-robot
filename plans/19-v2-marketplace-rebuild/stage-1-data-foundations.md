# Stage 1 — Data Foundations

**Spec status: FLESHED — pending founder approval.** (Lifecycle: skeleton → fleshed spec → user approval → build with increment reviews → stage gate → retro.)

## Purpose

Lay the complete marketplace data layer before any pipeline or UI code, so every later stage builds against a stable, migration-tracked schema with a realistic populated database. Stage 1 provisions Postgres + PostGIS on AWS (additively to the existing Pulumi staging stack), defines the full schema covering every domain concept in the master plan + the A4 field canon + the DEAL/DIST/DF rulings, introduces `packages/domain` (pure types + listing-lifecycle rules) and `packages/db` (drizzle schema, migrations, typed repositories), and ships a synthetic data generator + pluggable seed-ingestor that produce both eval cases and Postgres seed fixtures. Output: a populated dev database the rest of v2 develops against instead of an empty one.

## Decisions (each resolves a skeleton open question: resolution + rationale)

- **D-S1-1 Engine — RDS Postgres `db.t4g.micro`, single-AZ, PostGIS, ~20 GB gp3, deletion-protection ON, named `linerobot-staging-pg`.** Added *additively* to the existing `infra/` project + staging stack; no existing resource is touched. *Rationale:* Aurora Serverless v2's ~$40+/mo ACU floor is not justified at seed scale; t4g.micro is ~$12–15/mo and ample. Deploy identity already carries RDS + EC2-SG permissions (policy v9). Single-AZ is acceptable for staging; production HA is a later revisit.
- **D-S1-2 Connectivity — `publicly_accessible=true` + TLS required (`rds.force_ssl=1` via a custom parameter group) + a 32+ char generated password in a Pulumi config secret + SG ingress 5432 open.** *Rationale:* Lambdas need *both* the DB and the Anthropic API; VPC-attaching them to reach a private RDS forces a NAT gateway (~$32/mo, exceeding the DB cost). Public + forced-TLS + strong secret is the documented **staging-phase posture**. **Production hardening (noted, out of scope here):** move RDS into private subnets, attach Lambdas to the VPC with a NAT gateway or VPC endpoints, restrict SG to known egress. Tracked as a Stage-7/pre-prod risk, not built now.
- **D-S1-3 ORM/migrations — `drizzle-orm` + `drizzle-kit`, `node-postgres` (`pg`) driver, migrations committed as SQL.** *Rationale:* Drizzle gives typed schema-as-TS with generated, reviewable SQL migrations (no hidden runtime codegen), aligns with the "thin typed wrappers, not a generic query builder" simplicity rule, and `pg` is the boring, well-understood driver. Repositories are hand-written functions over Drizzle queries — no generic repository base class.
- **D-S1-4 Connection handling — Lambda direct connection with a module-scope `pg.Pool` (max ~2 per container), `keepAlive` on, lazy connect-on-first-call.** No RDS Proxy, no pgBouncer at this stage. *Rationale:* seed-scale traffic stays far below `db.t4g.micro`'s ~80-connection ceiling; RDS Proxy adds cost + latency for a problem we don't have yet. The pool lives in `packages/db` so a future swap to RDS Proxy is one file. *Recorded risk:* concurrency × pool-size must stay under max_connections — documented in the db package README; revisit if Stage 2 batch fan-out raises concurrency.
- **D-S1-5 Package layout (confirms master §4.2) — monorepo members `@line-robot/domain` and `@line-robot/db` added now; the synthetic generator + seed-ingestor live in `@line-robot/pipeline` under `src/synthetic/` and `src/seed/`.** No separate `packages/fixtures`. *Rationale:* generator and eval are co-located (master §5.1 — one generator, three consumers); a fixtures package would be a one-caller split. `@line-robot/shared` is absorbed into `domain/` (types move; bot adapter code stays in `@line-robot/bot`). Naming follows the existing `@line-robot/*` convention.
- **D-S1-6 Account-linking merge strategy — listings and all owned data key on a **canonical `user_id`**; a `user_identity` table holds (provider ∈ {line,email,google}, provider_subject, verified_at) rows, each pointing at one user. First verified identity creates the user; subsequent verified identities for the *same* person attach to it. A **conflict** (two already-distinct users provably the same person, or two users both claiming one listing) is never auto-merged — it raises an `account_merge_request` row routed to the **moderation/admin queue** for manual resolution.** *Rationale:* deterministic ownership (canonical id) with an explicit, auditable link table and a human gate on the genuinely ambiguous cases (DEAL-10 owner-direct + multi-agent open mandates make duplicate claims real). UX is Stage 4; the schema + merge-request entity land now (master §8 risk).
- **D-S1-7 Chaos profile format — a typed `ChaosProfile` object** (TS type in `@line-robot/pipeline`): weighted toggles for typo rate, Thai slang/abbreviation (ล้าน, ตร.ว.), multi-property dumps, out-of-order/missing photos, mid-thread corrections, duplicate re-posts (with price/contact drift), language mix (th/en/mixed), and urgency-phrase injection (ขายด่วน). *Rationale:* a declarative object is deterministic (seedable RNG), serialisable into eval-case metadata, and directly exercises the A1/A3/A4 hard cases (dedup traps, non-transferable deeds, rentals).
- **D-S1-8 Per-language content — a separate `listing_content` table, one row per (listing_id, lang)**, never a locale JSON blob. *Rationale:* D14 design-for-N + master review note ("per-language correctly modelled, not a locale JSON blob"); enables FTS per language and clean translation write-back. Ships `th` + `en` rows.
- **D-S1-9 Seed-ingestor — a pluggable `SeedIngestor` interface (founder ruling)** in `@line-robot/pipeline/src/seed/`. Source adapters normalise a source → ground-truth listing specs → fixtures. **Tonight's adapters: (1) `synthetic` (primary)**, and **(2) at most ONE simple spider adapter for a single cleanly/openly accessible source**, kept modest (DF-5: pluggable, seed-scale only, NO ToS-violating scraping — bank-NPA portals are explicitly excluded; LED CKAN open data is the model of a clean source). *Rationale:* architecture (the interface + a second implementation proving it) matters more than volume; the interface earns its keep by having two implementations from day one (satisfies the "no interface until the second implementation" rule).
- **D-S1-10 saleStage (DF-4) — `sale_stage` enum {available, reserved, under_contract, transferred} on sale listings only; rentals use a simpler `rental_status` {available, rented, withdrawn}.** Lifecycle transition functions live in `@line-robot/domain`. *Rationale:* mirrors the Thai 3-stage close (มัดจำ → จะซื้อจะขาย → โอน); rentals don't carry that ceremony (DEAL-11/DF-4).
- **D-S1-11 Integration tests — Docker Postgres + PostGIS (`postgis/postgis` image) mirroring the existing DynamoDB-Local harness** (`packages/bot/test/integration/dynamodbLocal.ts` pattern: ephemeral container on a docker-assigned port, migrate, run, tear down). *Rationale:* same well-worn pattern the team already trusts; no new infra concept.

## Schema outline (entity → key fields; full DDL is build work)

Geometry columns use `geography(Point,4326)` (PostGIS, WGS84). Money in integer THB satang or `numeric`. Enums are Postgres enums mirrored by zod/TS in `@line-robot/domain`.

| Entity | Key fields (non-exhaustive) |
|---|---|
| `user` | id (canonical), display_name, primary_role_id, created_at |
| `user_identity` | id, user_id→user, provider {line,email,google}, provider_subject, verified_at, contact_value |
| `account_merge_request` | id, user_id_a, user_id_b, reason, status {open,resolved,rejected}, created_at, resolved_by |
| `role` | id, kind {broker,investor,owner,visitor}, approval_status {none,pending,approved} (broker/investor admin-approved, D9) |
| `group` | id, line_group_id, name, exclusivity_window_days (default 7, configurable DF-1/DEAL-07), created_at |
| `group_membership` | id, group_id, user_id, role_in_group, joined_at |
| `listing` | id, owner_user_id, source_group_id, deal_type {sale,rent}, sale_stage (DF-4, sale only), rental_status (rent only), title_deed_type enum (FIELD-02; 11-value incl. 5 no-sale), tenure {freehold,leasehold}+lease_years (DEAL-12/FIELD-03), property_type, price_thb, price_negotiable + urgency {normal,quick_sale,price_reduced} (single field; DIST-03/DIST-11), khai_fak fields: transaction_type + redemption_period_years (DIST-06), province/amphoe/tambon (separate, FIELD-13), project_name, address_detail, geom (PostGIS point), land_rai/land_ngan/land_wah + land_sqm computed (FIELD-01), floor_area_sqm (FIELD-09), price_per_sqm/price_per_wah computed (FIELD-10), facing_direction enum, land_shape, road_access_m + road_type, flood_history + flood_risk_zone (seller-disclosed, FIELD-07), city_plan_zone_color, listing_mandate {group_exclusive,open} + exclusivity_expires_at (DEAL-07), posted_by_role (DEAL-10), extraction_source {auto,poster_confirmed} (LEGAL-06), created_at/updated_at |
| `listing_condo` (1:1, condo only) | listing_id, cam_fee_per_sqm_month, sinking_fund_per_sqm (FIELD-04), foreign_quota_available + project_foreign_quota_pct, quota_bucket {foreign,thai} (FIELD-05) |
| `listing_rental` (1:1, rent only) | listing_id, monthly_rent, deposit_months (default 2), advance_months (default 1), min_lease_months (default 12), pets_allowed, furnishing_status {fully,partly,unfurnished}+furnishing_notes (FIELD-12), utility_rate_type (FIELD-08) |
| `listing_fees` (1:1, optional) | listing_id, commission_pct (default 3% sale / 1mo rent, DEAL-14/DF-7), fee_split_note (free text, DEAL-03/04) |
| `listing_content` | id, listing_id, lang {th,en}, headline, description, generated_by {human,llm} (D14/D8) |
| `listing_amenity` | listing_id, amenity (canonical enum; from the A4 field canon — no register ID, amenities are catalogued in the artifact body) |
| `listing_media` | id, listing_id, s3_key, kind {photo,chanote,floorplan,render}, hero_index, is_render (label, P4) |
| `listing_exclusivity` | listing_id, window_opened_at, expires_at, release_state {held,releasable,released} (D8; *behaviour* is Stage 6, types only here) |
| `interest_flag` | id, listing_id, user_id, created_at (group first-dibs hold) |
| `saved_listing` | id, listing_id, user_id, created_at |
| `viewing` | id, listing_id, requested_by_user_id, scheduled_at, status {requested,confirmed,done,cancelled} |
| `quote` | id, listing_id, broker_user_id, amount_thb, discount_vs_market, terms_note, status, created_at (DEAL-13/D10; feeds AVM) |
| `price_history` | id, listing_id, price_thb, changed_at, reason {new,reduced,corrected} |
| `co_agent_agreement` | id, listing_id, holder_user_id, co_agent_user_id, split_pct (default 50), acknowledged_at (DEAL-05/06) |
| `publish_consent` | id, listing_id, user_id, consent_version, consent_timestamp (LEGAL-02 — never null on public), deletion_requested_at (LEGAL-10) |
| `moderation_item` | id, target_type {listing,merge_request}, target_id, status {pending,approved,rejected}, reason, created_at (D11) |
| `market_data` (Stage 7 placeholder) | id, source {led,treasury,asking}, province/amphoe/tambon, geom, price_thb, area, deed_no, observed_at (structure now, populated Stage 7) |

## Increments

Each increment is one PR-sized unit with its own per-increment adversarial review (spec auditor + correctness + simplicity critic, skeptic-verified — master §5.3).

1. **Infra — RDS Postgres + PostGIS (additive)** — `infra/src/database.ts` (new), wired in `infra/index.ts`; password as `pulumi config set --secret dbPassword`; custom parameter group `rds.force_ssl=1`; output the connection string (secret). *Acceptance:* `pulumi up` provisions `linerobot-staging-pg`; a one-off Lambda/psql test connects over TLS and runs `CREATE EXTENSION postgis`; no existing resource shows a replacement in the diff. *Review focus:* additive-only (no drift on existing lambdas/storage/miniapp); deletion-protection + force_ssl actually set; secret never in plaintext.
2. **`@line-robot/domain`** — `packages/domain/` absorbs `@line-robot/shared` types; adds enums (saleStage, deed types, tenure, roles, …) + listing-lifecycle transition functions (sale 4-stage, rental simple); zod schemas as the single source of truth. *Acceptance:* zero imports from `@line-robot/db` or any adapter (circular-dep check green); strict TS clean; lifecycle functions unit-tested. *Review focus:* no DB/adapter leakage; transition rules match DF-4/DEAL-02 (no auto-release while reserved/under_contract).
3. **`@line-robot/db` + migrations** — `packages/db/` drizzle schema for every entity above; SQL migrations via drizzle-kit; module-scope `pg.Pool`; hand-written typed repositories (one file per aggregate). *Acceptance:* fresh DB → all migrations apply cleanly; PostGIS columns at SRID 4326; `listing_content` is a table (not JSON); repositories typed + strict clean; every master/A4 entity present. *Review focus:* repositories are thin typed wrappers (no generic query builder); per-language modelled as rows; nullable budget irrelevant here (Postgres, not the Anthropic 16-union cap) but enums validated.
4. **Synthetic generator** — `packages/pipeline/src/synthetic/generator.ts` + `chaosProfile.ts`: ground-truth spec + `ChaosProfile` → realistic LINE transcript; deterministic via seeded RNG; emits **both** an eval case (transcript + expected fields) and a Postgres-ready fixture. *Acceptance:* given a spec, produces a transcript; round-trip through a stub extractor recovers the spec fields (smoke only — full eval is Stage 2); covers ส.ป.ก./rental/mixed-language/duplicate-repost cases. *Review focus:* chaos toggles real and deterministic; no premature generality beyond the documented profile.
5. **Seed-ingestor + fixtures** — `packages/pipeline/src/seed/SeedIngestor.ts` interface + `synthetic` adapter (primary) + ONE modest spider adapter for a single clean/open source (DF-5; LED CKAN-style, no bank/ToS scraping); `npm run db:seed` loads fixtures. *Acceptance:* `db:seed` loads ≥20 listings, 3 groups, representative role spread without error; spot-queries return expected rows; both adapters satisfy the same interface; spider adapter targets only an openly accessible source and is rate-modest. *Review focus:* the interface earns its keep (two implementations exist); the spider is genuinely modest (architecture > volume); no ToS-violating source.
6. **Integration tests (Docker Postgres+PostGIS)** — `packages/db/test/integration/postgres.ts` mirroring the DynamoDB-Local harness; migrate → seed → query; PostGIS radius query smoke. *Acceptance:* `npm --prefix packages/db run test:integration` spins an ephemeral `postgis/postgis` container, applies migrations, seeds, runs repository + a bbox/radius query, tears down. *Review focus:* mirrors existing pattern (ephemeral, docker-assigned port); no leaked containers; deterministic.

## Stage gate checklist

- [ ] `pulumi up` provisions a running Postgres + PostGIS; TLS-only connect verified from a Lambda test invocation; existing stack untouched (additive diff).
- [ ] All migrations apply cleanly from a fresh DB; `down`→`up` idempotent.
- [ ] Every entity in the master §4.1 list + A4 field canon (FIELD-01..13) + DEAL-07/10..14 + DIST-03/06 + DF-4/7 + LEGAL-02/06/10 appears in migrations (spec auditor checklist).
- [ ] `@line-robot/domain` has zero adapter/`db` imports (circular-dep check); `@line-robot/db` has no LINE/HTTP adapter imports (architecture-conformance).
- [ ] `npm run db:seed` loads all fixtures; spot-queries pass; per-language content stored as rows; PostGIS SRID 4326.
- [ ] Exclusivity-window *types* in `@line-robot/domain` can express D8 (deadline, interest holds, release state) — behaviour deferred to Stage 6.
- [ ] Integration suite green on Docker Postgres; typecheck + Biome + unit + coverage green.
- [ ] Per-increment reviews complete + skeptic-verified; `CLAUDE.md` updated (new `dbPassword` secret, db:seed + test:integration scripts, Postgres connection posture + production-hardening note).

## Open question from the spine audit (stage-0-spine-audit.md, D24)

- **Q-SA4 (raw-archive retention):** the S3 raw archive keeps Thai chat data (names, LINE IDs,
  phone numbers) indefinitely with only a 30-day IA transition and no stated retention policy.
  When touching infra this stage, add an explicit lifecycle statement: either a chosen retention
  rule or a recorded "indefinite for now, revisit before public launch" decision + one-paragraph
  data-handling note. Small, infra-config-level; do not build scrub/export machinery (deferred with
  Tier A, D2.1).

## Risks

- **Public RDS posture (D-S1-2)** — accepted for staging (forced TLS + strong secret + SG); production must move to private subnets + VPC/NAT. Documented; not built now.
- **Connection-count under Lambda fan-out (D-S1-4)** — direct pooling is fine at seed scale; Stage 2 batch concurrency could approach max_connections. Mitigation hook: pool lives in one file, swap to RDS Proxy is localised.
- **Account-merge ambiguity (D-S1-6)** — duplicate claims are real (open mandates); manual admin queue is the safety valve, but the merge UX is Stage 4 — schema must not paint us into a corner (canonical id + link table chosen to avoid that).
- **Spider adapter scope creep (D-S1-9)** — temptation to over-build ingestion volume; held to ONE modest clean-source adapter by DF-5 + the simplicity critic.
- **Field-canon drift** — A4 lists several PLAUSIBLE-BUT-UNVERIFIED ranges (CNX CAM/sinking-fund). Schema stores the fields; validation *ranges* stay advisory until §5 market validation.

## Iteration log

| Date | What changed | Why |
|---|---|---|
| 2026-06-13 | Build amendments (Increments 2+3): (a) D-S1-5's "`@line-robot/shared` absorbed into domain" NOT executed — shared's DTOs are v1 miniapp read shapes consumed by live v1 code; absorbing them would churn v1 imports for types that die with the Stage 5 rebuild. `@line-robot/domain` starts v2-pure; shared is deleted in Stage 5. (b) Increment 6's Docker-Postgres harness was built alongside Increment 3 to validate migrations immediately (same deliverable, earlier). (c) Panel fixes: users.primary_role_id gained its FK (migration 0001); dead `withinRadius` helper deleted; `ewktPoint` validates finite coordinates. | Increment review + founder-empowered judgment, logged |
| 2026-06-12 | Skeleton → fleshed spec; all 7 open questions resolved with decisions D-S1-1..11; schema outline tied to A4 FIELD-01..15 + A1 DEAL + A3 DIST + DF rulings; 6 increments defined. | Stage-1 just-in-time flesh-out (master §6); built unattended, no founder TBDs. |
