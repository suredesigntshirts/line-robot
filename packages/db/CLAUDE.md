# CLAUDE.md — packages/db

- **After `npm run generate` (drizzle-kit), hand-fix the new migration SQL:** (1) drizzle emits the
  custom geography type QUOTED — `"geom" "geography(Point,4326)"` — which Postgres rejects; strip
  the quotes around `geography(Point,4326)`. (2) The FIRST migration must start with
  `CREATE EXTENSION IF NOT EXISTS postgis;--> statement-breakpoint` (already done in 0000_*; new
  databases need it before any geography column).
- **Connection rule (D-S1-4):** the only `pg.Pool` lives in `src/pool.ts`, `max: 2`. Lambda
  concurrency × 2 must stay well under db.t4g.micro's ~85 max_connections — recheck before raising
  Stage 2 batch fan-out. A swap to RDS Proxy touches only that file.
- Enums are NOT defined here — they mirror `@line-robot/domain` zod enums via `.options`; add new
  values in domain first, then `npm run generate` produces the `ALTER TYPE`.
- Repositories are thin hand-written functions over drizzle (one file per aggregate); no generic
  repository base class, no query builder abstractions.
