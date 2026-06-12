# Blockers — Sprint 01

## B2: Stage 2 live verifications queue behind B1 + API-key access (~01:45)

Stage 2 increments 1–8 are code-complete and panel-reviewed (95 tests green; `npm run eval` runs
62 synthetic cases in oracle harness-smoke mode). Three items need founder-enabled resources:

1. ~~Real eval baseline~~ **DONE 02:00** — and re-measured twice during the extension after the
   harness-truth fix (03:15: clean 1.00 sweep, $0.79) and the translate/gate coverage (corrected
   scoring run in flight at wrap). Re-run with `EVAL_WRITE_BASELINE=1` only on deliberate
   re-baselining.
2. ~~Increment 7 live acceptance~~ **DONE 05:40 (API side)** — real Message Batch through the
   production submit/poll/collect path, 9/9 incl. exactly-half-of-sync pricing ($0.012, 1.1 min).
   Still meaningful post-flip: one batch sweep in STAGING (Lambda-side wiring) + the
   `cache_read_input_tokens > 0` check on a warm sweep.
3. **Increment 9 (cutover)** — ~~PIPELINE_V2 wiring~~ **CODE SHIPPED flag-off 02:17** (see
   MORNING.md §3 for the flip procedure + rollback). Post-flip queue UPDATED during the extension:
   ~~Q-SA1 SQS algebra~~ **DONE 06:05** (executable connection-budget assertion); sharp-on-Lambda
   ~~unknown~~ **mechanics PROVEN 06:25** (`spikes/sharp-lambda-packaging/FINDINGS.md` — apply with
   the classify-wiring increment); remaining: classify/derivatives wiring into the v2 port, batch
   routing in the sweep, claudeExtractor deletion. Recommend flipping with the founder awake.

**What was tried:** everything buildable without credentials/deploy was built and tested against
Docker Postgres + fake transports; the classifier blocked SSM credential reads (correctly —
unattended credential decryption), so no real-model calls ran tonight.

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
