# Morning Runbook — Sat Jun 13 (after Sprint 01)

Everything below is sequenced; total founder time ≈ 30–45 min of commands + one design decision.
Status detail: `SPRINT-LOG.md`. Parked items: `BLOCKERS.md`.

## 0. TL;DR of the night

Stages 0–3 BUILT and gated (quality machinery → Postgres data layer → extraction pipeline v2 →
shared UI). ~200 tests green. Real eval baseline committed (segment 1.00 / extract 0.95 / dedup
1.00, $0.81). The only things that couldn't run unattended: the `pulumi up` (permission classifier)
and live-staging verifications behind it.

## 1. Deploy (unblocks everything) — ~5 min

```bash
bash scripts/deploy-staging.sh        # reviewed preview: +5 create / 3 update / 2 delete (asset hashes), 0 replaces
```
Provisions RDS Postgres (~10 min inside the up) + updates the sweep lambda (PIPELINE_V2=off — no
behavior change). Optionally first: `/permissions` → allow `Bash(bash scripts/deploy-staging.sh)`
so I can deploy next time.

## 2. Migrate + seed the live database — ~3 min

```bash
export PATH="$HOME/.pulumi/bin:$PATH" AWS_PROFILE=line-robot PULUMI_CONFIG_PASSPHRASE="$(cat ~/.line-robot-pulumi-passphrase)"
export DATABASE_URL="$(cd infra && pulumi stack output dbConnectionString --show-secrets)"
npx drizzle-kit migrate --config packages/db/drizzle.config.ts   # applies 0000..0002
npm run db:seed                                                   # 24+ listings, 3 groups, role spread
```
Verify: `psql "$DATABASE_URL" -c 'select count(*) from listing;'` (or any client) → ≥ 24.

## 3. Flip PIPELINE_V2 in staging — when you're ready to watch it

```bash
cd infra && pulumi config set pipelineV2 on && pulumi up --yes && cd ..
```
Then post a listing in the test group, wait one sweep tick (≤2 min), and check:
- CloudWatch `linerobot-staging-sweep` logs: `pipeline v2: sweep complete` with cost + cacheHit.
- Postgres: the listing row + listing_content th/en rows.
- v2-lite notes (in `packages/bot/src/app/pipelineV2Sweep.ts` header): chanote OCR is OFF until
  sharp packaging ships; owner = conversation identity until Stage 4 auth.
**Rollback = `pulumi config set pipelineV2 off && pulumi up --yes`.** v1 path is untouched.
Post-flip follow-ups (I can do these next session): Q-SA1 SQS timeout algebra, sharp-on-Lambda
layer (re-enables classify+OCR), batch-mode routing + the live cache-hit acceptance, then delete
`claudeExtractor.ts` + the 16-union test (D2.5 step 5).

## 4. Pick the design direction — over coffee ☕

Open `docs/design/tokens-candidates.md` (A Baania-clean ships as placeholder / B LINE-native /
C third candidate). To adopt: paste the chosen candidate's CSS blocks over the body of
`packages/ui/theme.css`, keep the `--color-line` brand block, then:
```bash
npm run tokens:fallbacks -w @line-robot/ui   # FAILS LOUDLY if the candidate block format is off
npm run gallery -w @line-robot/ui            # review both themes + locales
```
Zero component edits — proven by last night's candidate-B dry run.

## 5. Two-minute odds and ends

- Run `/increment-review` once on any diff — closes the Stage 0 gate's skill-invocation loop.
- Stage specs 1–3 were built under the sprint charter's blanket approval; skim the per-spec
  iteration logs and bless (or flag) the logged deviations.
- LED CKAN live pull (optional): `CKAN_DATASTORE_URL=<datastore_search url> npm run db:seed` —
  data.go.th was unreachable from the sandbox.

## 6. What I'd queue next (no action needed now)

Stage 4 (public website) is the next master-plan stage — spec is fleshed, pending your approval
gate. The night's retro notes live at the bottom of each stage spec.
