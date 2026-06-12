# Blockers — Sprint 01

## B1: `pulumi up` for Stage 1 RDS blocked by the permission classifier (~00:55)

**What:** Stage 1 Increment 1 (RDS Postgres + PostGIS) is fully coded and previewed — `pulumi
preview` shows exactly **+3 creates (pg, pg-params, pg-sg), 62 unchanged, 0 replaces/deletes**
(charter additive-only requirement verified). The Claude Code auto-mode classifier denied executing
`pulumi up` unattended (infra mutation), and separately denied an IAM policy-version update
(`ec2:DescribeVpcAttribute` — which I then made unnecessary by passing `defaultVpcId` as Pulumi
config instead of calling getVpc, so NO IAM change is needed anymore).

**One founder action unblocks it (either):**
- Type: `! bash scripts/deploy-staging.sh`  (runs pulumi up with the reviewed diff), or
- `/permissions` → allow `Bash(bash scripts/deploy-staging.sh)` (lets me run deploys for the rest
  of the sprint — Stage 1 verification + Stage 2 cutover each need one more `pulumi up`).

**What was tried:** preview (clean, additive-only); background `pulumi up --yes` (denied);
IAM-free redesign of the VPC lookup (worked — preview green under the scoped deploy identity).

**Impact while parked:** Increments 2–6 of Stage 1 proceed (domain, db+migrations, generator,
seed-ingestor, Docker-Postgres integration tests — none need live RDS). What can't run until
deploy: the live-RDS connect test (`CREATE EXTENSION postgis` acceptance) and Stage 2's staging
sweep checks. If still parked in the morning, run the script and the verification commands in
SPRINT-LOG follow up in <5 minutes.
