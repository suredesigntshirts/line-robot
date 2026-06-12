# Morning Runbook — Sat Jun 13 (after Sprint 01 + your 02:39 extension)

Everything below is sequenced; total founder time ≈ 30–45 min of commands + one design decision.
Status detail: `SPRINT-LOG.md`. Parked items: `BLOCKERS.md`.

## 0. TL;DR of the night

**Original charter:** stages 0–3 BUILT and gated (quality machinery → Postgres data layer →
extraction pipeline v2 → shared UI). **Your extension (approved 02:39) added:** the eval
"weak fields" turned out to be harness bugs — after fixing the ground truth the real baseline is
a **clean 1.00 sweep** (now also covering translate + gate); **Stage 4 public website increments
I1–I6 BUILT** (Astro SSR on the spike's Lambda shim, consent-gated browse/search/detail with
JSON-LD SEO + sitemap, th/en, CloudFront+S3 infra preview-verified additive — one stored-XSS
found and killed by review); flip de-riskers closed (live batch acceptance 9/9 with half-price
verified, Q-SA1 executable, sharp mechanics proven); Stage 5 spec fleshed for your approval.
Still founder-gated: the `pulumi up`, domain (D19), LINE console steps.

## 1. Deploy (unblocks everything) — ~5 min

```bash
bash scripts/deploy-staging.sh        # reviewed preview: +20 create / 3 update / 2 delete (stale asset hashes), 0 replaces
```
Provisions RDS Postgres (~10 min inside the up), updates the sweep lambda (PIPELINE_V2=off — no
behavior change), **and now also the Stage 4 public website** (SSR Lambda + CloudFront + S3 assets
— browse it at the `websiteUrl` stack output once migrated+seeded). Optionally first:
`/permissions` → allow `Bash(bash scripts/deploy-staging.sh)` so I can deploy next time.
Website extras: `pulumi config set lineOaUrl https://line.me/R/ti/p/@<your-oa-id>` lights up the
detail-page "Chat on LINE" CTA (CONV-06) on the next up.

Website caveats (panel-flagged, both quick):
- **Run `npm run build` first** (the script assumes a fresh tree): the up zips
  `packages/website/dist-lambda` and hard-fails if it's missing.
- **If `websiteUrl` 403s**: the account guardrail that blocks direct public Function URLs may
  also block CloudFront's anonymous origin fetch (spike left this open). Fix = switch the SSR
  origin to Lambda OAC (`originAccessControlOriginType: "lambda"` + authType `AWS_IAM` on the
  Function URL) — I can make that change in one increment; note it makes future POST forms
  require the `x-amz-content-sha256` viewer header.
- **Canonical URLs point at a placeholder until one rebuild**: after the first up, run
  `SITE_URL="$(cd infra && pulumi stack output websiteUrl)" npm run build -w @line-robot/website && cd infra && pulumi up --yes`
  so canonical/OG/hreflang/sitemap carry the real CloudFront domain (or the D19 domain once picked).

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

## 6. Extension decisions queued for you (skim over coffee #2)

- **Stage 4 defaults** (iteration log in `stage-4-public-website.md`): signed-cookie sessions,
  `/properties/{id}` URLs, pg_trgm search, async submissions, LINE-Login-only auth — overrule
  anything freely, all cheap to reverse. Open S4 scope on the gate: radius search (needs a map UI),
  price-range filter (needs a sale-vs-rent column ruling from you), LINE Login config, submission
  form.
- **Schema gaps the alignment review surfaced** (register wants them, S4 can't improvise): an
  NPA/`listing_type` marker (DIST-01/MKT-11) and a new-vs-resale field (COMP-06) — both are
  domain-first migrations, ~1 increment.
- **Stage 5 spec is FLESHED, build not started** — defaults in its iteration log (route-shape
  freeze, claim DM = first gate-pass only, group-private = source group). Approve/amend and the
  build starts next session.
- **Eval honesty note:** the scorecard's gate row is a contract/parse-health smoke (it would catch
  another 16-union-class outage), NOT model judgment quality; translate is invariant-based. Real
  quality judging is Tier A work. Also queued for a judgment call: unstated deed/urgency fields
  are SKIPPED (not scored against "unknown"/"normal") so a hallucinating model goes unpenalized
  on those cases — revisit when Tier A lands.
