# Runbook — database migrations (drizzle + Postgres/PostGIS)

Canonical gotchas live next to the code in `packages/db/CLAUDE.md` (read it before touching a
migration). This runbook is the procedure.

## Changing the schema

1. Add/adjust enums in `packages/domain` (zod) first — `packages/db` mirrors them via `.options`.
2. Edit `packages/db/src/schema.ts`.
3. `npm run generate -w @line-robot/db` (drizzle-kit) → new file in `packages/db/migrations/`.
4. **Hand-fix the generated SQL:** drizzle emits the geography type quoted
   (`"geom" "geography(Point,4326)"`) — strip the quotes around `geography(Point,4326)`. The first
   migration must start with `CREATE EXTENSION IF NOT EXISTS postgis;--> statement-breakpoint`
   (already in `0000_*`).
5. Validate on a real Postgres: `npm run test:integration -w @line-robot/db` (Docker).

## Applying to staging

```bash
export PATH="$HOME/.pulumi/bin:$PATH"
export AWS_PROFILE=line-robot
export PULUMI_CONFIG_PASSPHRASE="$(cat ~/.line-robot-pulumi-passphrase)"
DATABASE_URL="$(cd infra && pulumi stack output dbConnectionString --show-secrets)" \
  npm run db:migrate -w @line-robot/db
```

`src/migrate.ts` runs the drizzle migrator over its own one-shot pool; it does **not** seed
(`npm run db:seed` does). The host must be the `rds.amazonaws.com` endpoint so the embedded RDS CA
path engages (`src/rdsCa.ts`); never work around TLS with `sslmode=no-verify`.

**Rule:** staging must be at the schema HEAD expects before deploying anything built from HEAD —
the website bundle imports the schema too (see `deploy.md`, migration-0011 note).

## State

Staging `linerobot-staging-pg` is at migration **0011** (applied 2026-09-05). Migrations 0000–0011 are
in `packages/db/migrations/`. Connection: the single `pg.Pool` (max 2) in `packages/db/src/pool.ts`;
keep Lambda concurrency × 2 well under t4g.micro's ~85 max_connections.
