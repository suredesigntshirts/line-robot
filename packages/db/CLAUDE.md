# CLAUDE.md — packages/db

- **After `npm run generate` (drizzle-kit), hand-fix the new migration SQL:** (1) drizzle emits the
  custom geography type QUOTED — `"geom" "geography(Point,4326)"` — which Postgres rejects; strip
  the quotes around `geography(Point,4326)`. (2) The FIRST migration must start with
  `CREATE EXTENSION IF NOT EXISTS postgis;--> statement-breakpoint` (already done in 0000_*; new
  databases need it before any geography column).
- **Connection rule (D-S1-4):** the only `pg.Pool` lives in `src/pool.ts`, `max: 2`. Lambda
  concurrency × 2 must stay well under db.t4g.micro's ~85 max_connections — recheck before raising
  Stage 2 batch fan-out. A swap to RDS Proxy touches only that file.
- **TLS to RDS:** `src/pool.ts` is the one place TLS is decided, via `pgConnectionConfig()` in
  `src/rdsCa.ts`. RDS presents the AWS RDS CA (not in Node's trust store) and pg 8.x treats
  `sslmode=require` as `verify-full`, so a bare `require` fails with `SELF_SIGNED_CERT_IN_CHAIN`. We
  embed the ap-southeast-1 RDS CA bundle and verify against it (full verify-full), and **strip any
  in-URL `sslmode`** — an in-URL `sslmode` overrides the explicit `ssl` object in this pg version.
  Never "fix" this with `sslmode=no-verify` / `rejectUnauthorized:false`. Refresh the bundle if the
  instance's CA rotates.
- **Applying migrations:** `npm run db:migrate -w @line-robot/db` with `DATABASE_URL` set (host must
  be the `rds.amazonaws.com` endpoint so the CA path engages). `src/migrate.ts` runs the drizzle
  migrator over its own one-shot pool; it does NOT seed (use `npm run db:seed`).
- Enums are NOT defined here — they mirror `@line-robot/domain` zod enums via `.options`; add new
  values in domain first, then `npm run generate` produces the `ALTER TYPE`.
- Repositories are thin hand-written functions over drizzle (one file per aggregate); no generic
  repository base class, no query builder abstractions.
