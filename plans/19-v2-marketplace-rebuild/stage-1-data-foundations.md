# Stage 1 — Data Foundations

**Spec status: SKELETON.** This document is fleshed into a full spec, iterated with the user, and approved before any code for this stage is written. (Lifecycle: skeleton → fleshed spec → user approval → build with increment reviews → stage gate → retro.)

## Purpose

Lays the complete data layer before any pipeline or UI code is written, so that every subsequent stage builds against a stable, migration-tracked schema. Provisions Postgres + PostGIS on AWS via Pulumi, defines the full marketplace schema covering every domain concept from the master plan, introduces the `packages/domain` and `packages/db` packages, and produces a synthetic data generator + seed fixtures so later stages have a realistic populated database to build against rather than an empty one.

## Scope

**In:**
- Postgres + PostGIS provisioned via Pulumi (engine sizing choice made here — see Open questions)
- Full marketplace schema with migrations (see entity list below)
- `packages/domain` — pure TypeScript types for all domain concepts (listing lifecycle states, role definitions, exclusivity window data types); business-rule functions limited to listing lifecycle only — exclusivity window logic belongs to Stage 6; no DB or adapter imports
- `packages/db` — schema definitions, migration runner, query/repository layer; consumes `packages/domain`; consumed by `packages/api`, `packages/pipeline`, `packages/website`
- Synthetic data generator: takes a ground-truth listing spec + chaos profile, emits a realistic LINE transcript; output is the seed fixture input
- Seed fixtures: ground-truth listing specs load into Postgres so UI/search/group stages develop against a realistic dataset
- `packages/domain` absorbed from v1 `packages/shared` (types only; adapter code stays in `packages/bot`)

**Schema entities (must all be modeled):**
- Listings (with per-language content rows, lifecycle states: draft/active/under-offer/sold/rented/withdrawn)
- Users, identities/account-links (LINE ID, email, Google — account-linking modeled from day one per D5)
- Roles (broker / investor / owner / visitor; broker + investor require admin approval per D9)
- Groups (LINE chat mirrors per D6; exclusivity window config per D8)
- Group memberships
- Visibility / exclusivity state (time-based window, interest flags, release state per D7/D8)
- Viewings
- Saved listings / interest flags
- Quotes (for quick-sale flow per D10; also feeds AVM)
- Price history
- Market-data (land-office sales; placeholder table structure, fully populated in Stage 7)
- Moderation queue (per D11)

**Out (explicitly):**
- Extraction pipeline internals (Stage 2)
- React components or any UI (Stage 3+)
- Auth endpoints or LIFF integration (Stage 4/5)
- Exclusivity window engine / interest-flag logic — schema and types land here; behaviors in Stage 6
- Quick-quote push mechanics (Stage 6)
- Land-office data ingestion pipeline (Stage 7)

## Key deliverables

1. Pulumi resources for Postgres (engine + PostGIS extension + VPC connectivity)
2. `packages/db` with migration files covering every schema entity above
3. `packages/domain` with TypeScript types for all domain concepts; listing lifecycle business-rule functions (state transitions); exclusivity window types defined but window-open/interest-flag logic deferred to Stage 6
4. Synthetic data generator script (`packages/pipeline/src/synthetic/generator.ts` or equivalent)
5. Seed fixture set (minimum: 20 listings, 3 groups, representative role spread) loadable via `npm run db:seed`
6. Updated `infra/` Pulumi program; deploy verified on staging
7. Connection string wired into Pulumi config (not hardcoded); Lambda connectivity approach confirmed

## Dependencies

- Stage 0 must be complete (quality workflow in place before product code starts)
- Manual AWS step: VPC/subnet config may need extending to allow Lambda → RDS connectivity (confirm during flesh-out)
- No LINE console steps required for this stage

## Acceptance criteria (sketch)

- `pulumi up` provisions a running Postgres instance with PostGIS enabled; connection verified from a Lambda test invocation
- All migrations run cleanly from a fresh database to the full schema; `migrate:down` then `migrate:up` is idempotent
- `packages/domain` has zero dependencies on `packages/db` or any adapter — enforced by a circular-dependency check
- `packages/db` exports typed repository functions for every entity; TypeScript strict-mode clean
- `npm run db:seed` loads all seed fixtures without error; spot-queries return expected rows
- Synthetic generator produces a LINE transcript from a given spec; round-trip through a stub extractor returns the spec fields (smoke test, not a full eval — that's Stage 2)
- Stage gate: architecture-conformance check verifies `packages/domain` has no adapter imports; `packages/db` has no LINE/HTTP adapter imports

## Open questions (resolve when fleshing this spec)

- **Engine sizing**: Aurora Serverless v2 (≈$40+/mo minimum, auto-scales) vs small RDS t4g (≈$12–15/mo, fixed)? Master plan §4.1 notes this is the right stage to decide; cost floor matters at early scale
- **Migration tool**: drizzle-orm, Prisma, or raw SQL migrations with a thin runner? Not decided — choice affects `packages/db` API surface significantly
- **Connection pooling**: RDS Proxy (adds cost + latency) vs pgBouncer sidecar vs Lambda direct connection with pool-on-first-call? Lambda cold start + Postgres max-connections interaction must be addressed
- **Package layout confirmation**: exact directory names and which packages are monorepo members — the master plan §4.2 shows a target shape but notes "exact layout finalized in Stage 1"
- **Account-linking edge cases**: what happens when two LINE users claim the same listing, or a LINE user and an email user have overlapping contact info? Schema must accommodate the merge strategy even if UX is Stage 4
- **Synthetic generator location**: lives in `packages/pipeline` (co-located with eval) or a separate `packages/fixtures` package? Depends on package layout decision above
- **Chaos profile format**: what shape does the chaos profile input take? Needs to be defined before the generator can be built

## Review process

Standard cadence per master plan §5.3: every increment → spec auditor + correctness reviewer + simplicity critic (fresh-context sub-agents, skeptic-verified findings); stage gate → high-effort full-diff review, architecture conformance, eval scorecard check (advisory), docs updated.

Stage-1-specific review notes:
- The spec auditor checks that every entity from the master plan §4.1 entity list appears in migrations; missing tables are scope drift
- The simplicity critic scrutinizes the query layer: repository functions should be thin typed wrappers, not a full ORM abstraction or a generic query builder nobody else uses
- Stage gate includes a schema review: check that per-language content is correctly modeled (not just a locale JSON blob), that PostGIS geometry columns have appropriate SRID, and that the exclusivity-window *types* in `packages/domain` can express D8 (window deadline, interest holds, release state) — the window behavior itself is Stage 6

## Iteration log

| Date | What changed | Why |
|---|---|---|
| (empty — filled during flesh-out and build) |
