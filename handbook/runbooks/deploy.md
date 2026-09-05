# Runbook — deploying (Pulumi → AWS staging)

Pulumi state is on a **local file backend** (`file://~`); secrets use a **passphrase** provider.

- Pulumi binary lives at `~/.pulumi/bin` (not on `PATH` by default).
- **Passphrase is stored in `~/.line-robot-pulumi-passphrase`** — `chmod 600`, OUTSIDE the repo.
  The user does **not** memorize it; it lives only in that file. To recover/view it:
  `cat ~/.line-robot-pulumi-passphrase`. **Never copy the value into the repo** (not even a
  gitignored `.env`) — one copy in that out-of-repo 0600 file is the safest place for it.
- Deploy identity: AWS profile `line-robot` (see `aws-identities.md`). Never deploy as `default`.

## Website deploy (the normal case)

```bash
export PATH="$HOME/.pulumi/bin:$PATH"
export AWS_PROFILE=line-robot
export PULUMI_CONFIG_PASSPHRASE="$(cat ~/.line-robot-pulumi-passphrase)"
npm run build -w @line-robot/website     # WEBSITE ONLY — see the rule below
cd infra && pulumi preview               # must list ONLY website-* resources as changing
pulumi up                                # review the diff, then "yes"
```

**Website-only build rule (and why).** Pulumi packages Lambda code straight from the workspace build
outputs: bot Lambdas from `packages/bot/dist/*`, the mini-app api from `packages/api/dist/api`, the
website from `packages/website/dist-lambda` + `dist/client`. The repo HEAD contains **plan-23 Group D
bot code (U-D2, DM-claimable listings, commit `103eae9`) that is built but has never been deployed**
— go-live is founder-gated. A root `npm run build` rebundles `packages/bot/dist` from HEAD, and the
next `pulumi up` would silently ship that code. So for a website deploy build **only the website
workspace** (its deps `@line-robot/ui`, `db`, `domain` are consumed from source and need no build of
their own), and check `pulumi preview`: if anything other than `website-*` (SSR Lambda, assets bucket
objects, CloudFront) shows a diff, stop and find out why before `pulumi up`. There is deliberately no
one-shot deploy script: the old `scripts/deploy-staging.sh` ran `pulumi up --yes` with no preview and is
archived under `handbook/archive/scripts/`.

**Schema must be at HEAD before deploying anything built from HEAD (2026-09 migration-0011 note).**
The website bundle imports the drizzle schema, which since plan 23 U-D1 includes
`listing.dm_claimant_user_id` (migration `0011`). Postgres rejects a SELECT that names a missing
column, so on 2026-09-05 migration 0011 was applied to staging **before** the website deploy even
though the bot code that writes the column stays undeployed. Rule: `npm run db:migrate -w @line-robot/db`
against staging first whenever `packages/db/migrations` has a file newer than the database (see
`migrations.md`). Staging is at 0011 as of 2026-09-05.

Nothing enforces these rules mechanically: `.claude/settings.json` lets an agent run `pulumi`, `aws`,
`psql` and `docker` without a prompt. The rules are prose — read them before deploying.

`SITE_URL` overrides the canonical origin at build time (defaults to the staging CloudFront domain).

## Post-deploy verification (any deploy that touches the website)

Run the **deployed** frontend gate against the live site — it catches infra-boundary bugs local
testing structurally can't (CloudFront content-types/caching, the scoped S3-presign IAM role, the
real Lambda env, RDS connectivity, redirects/headers):

```bash
E2E_BASE_URL=https://d15dpmhcgtrf1r.cloudfront.net npm run test:e2e:deployed -w @line-robot/website
```

Same data-driven specs as local — they discover whatever is published live. A red invariant here
means the deploy is broken or behind. Optional visual pass: `/frontend-review <that-url>`.
Record the deploy (date, HEAD, e2e result) in `STATUS.md`.

## Full-stack deploy (bot / mini-app — PARKED)

Only when the founder decides to go live with the bot changes: `npm run build` (all workspaces),
apply pending migrations, `pulumi up`, then the mini-app one-time steps in `line-bot.md`. Do not do
this as a side effect of a website deploy.
