# Runbook — local development

## Website against the staging database (hot reload)

```bash
npm run dev:staging -w @line-robot/website        # http://127.0.0.1:4321  (PORT=… to change)
```

Runs `packages/website/scripts/dev-staging.sh`: Astro dev server with hot reload, connected to the
**staging** Postgres (`linerobot-staging-pg`) and the **staging** photo bucket, so you see real
listings while editing templates. The website only SELECTs, so this is read-only from the site's
point of view. The script pulls `dbConnectionString`, `archiveBucketName` and `lineOaUrl` from the
Pulumi stack, so it needs: `~/.pulumi/bin`, the `line-robot` AWS profile, and the passphrase file
`~/.line-robot-pulumi-passphrase` (see `deploy.md`). Plain `npm run dev -w @line-robot/website` is the
same server without that env — you must export `DATABASE_URL` and `ARCHIVE_BUCKET` yourself.

## Website offline — the e2e server (real build, no AWS)

```bash
npm run build -w @line-robot/website              # astro build + the Lambda shim
npm run test:e2e:server -w @line-robot/website    # node test/e2e-server.mjs → http://localhost:4321
```

`test/e2e-server.mjs` boots a seeded Docker Postgres (`postgis/postgis`, container
`linerobot-website-e2e`), serves the **real production build** — static client via `sirv` falling
through to the SSR middleware, faithfully reproducing the CloudFront + Lambda split — and stands in
for the private S3 archive (presigned thumb URLs resolve to fixtures under
`test/fixtures/property-images/`). No credentials needed. This is what the Playwright gate runs
against; use it to reproduce an e2e failure by hand. Port: `E2E_PORT` (default 4321 — do not run it
at the same time as `dev:staging` unless you change one of the ports).

## Docker

Docker is needed for: the website e2e server/gate, `npm run test:integration -w @line-robot/db` and
`-w @line-robot/pipeline` (Postgres + PostGIS via the `@line-robot/db/testing` harness), the
mini-app real-backend suite (`packages/miniapp/e2e-api`, port 4331 — parked), and the bot's
DynamoDB-Local integration tests (parked). Unit tests, lint and typecheck need no Docker.

## Everyday commands

```bash
npm i
npm run lint && npm run typecheck && npm run test
npm run test:e2e -w @line-robot/website
```

Seed a database with synthetic fixtures: `DATABASE_URL=… npm run db:seed` (24+ listings, 3 groups).
