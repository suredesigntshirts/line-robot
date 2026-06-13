# CLAUDE.md — line-robot

Project-specific guidance for Claude. (The global `~/.claude/CLAUDE.md` also applies.)

## Browser automation — always run headed, as a real user

When capturing or auditing external websites (playwright-cli or any browser tooling): **always run HEADED (not headless) with a current standard Chrome user-agent, realistic viewport, locale `th-TH` / timezone Asia/Bangkok for Thai sites, and human pacing** (load homepage, wait, then navigate deeper). We are on a residential IP; headless mode + bot UA is what gets blocked — headed-as-real-user got us past walls (DDproperty et al.) that hard-blocked headless runs. Never attempt to solve CAPTCHAs yourself; for hard walls (Cloudflare JS challenge, DataDome) open the page headed and ask the user to clear it — it takes them seconds.

**Reusable cleared session:** `playwright-cli -s=manual … --persistent` has a persistent Chrome profile with founder-cleared Cloudflare (ddproperty.com) + DataDome (idealista.com) cookies; saved state also at `.playwright-cli/clearance-state.json` (gitignored — NEVER commit cookies). Reuse via `-s=manual` or `state-load` before re-asking the founder. Headed flag: `playwright-cli open <url> --browser=chrome --persistent --headed`. Gotchas: `mousewheel` may not scroll (use `eval` `window.scrollTo`); the CLI's echoed Page Title can be stale after `goto` — verify with `eval document.title`.

## V2 rebuild — plan & product research

The v2 marketplace rebuild is governed by `plans/19-v2-marketplace-rebuild.md` (master plan,
decision register D1–D25) with per-stage specs in `plans/19-v2-marketplace-rebuild/`. **No stage is
built before its spec is fleshed and the user approves.**

Product/market research artifacts live in `docs/research/` (a1–c1). The **heuristic register** —
the numbered, falsifiable rules every design-bearing change is reviewed against — is
`docs/research/00-product-principles.md`. When reviewing or building UI, copy, schema, or flows,
load the register and check the applicable heuristic IDs. (A `/alignment-review` skill that does
this mechanically is a Stage 0 deliverable.)

## Quality system (Stage 0 onward)

Review cadence (canonical: master plan §5.3):

- **Every change (free, non-negotiable):** `npm run typecheck`, `npm run lint` (Biome), `npm run test`, coverage threshold.
- **Every increment (PR-sized unit):** run `/increment-review` — three fresh-context reviewers that did not write the code (spec auditor vs the stage spec; correctness via the installed `/code-review` skill; simplicity critic vs the rules below), then a skeptic verifies bespoke findings before anything is acted on; judgment calls surface to the founder. Design-bearing increments (UI, copy, schema, flows) also run `/alignment-review` against the heuristic register.
- **Every stage gate:** high-effort review of the stage's full diff; architecture-conformance check (hexagonal boundaries, no adapter imports in core, file-size watchlist); eval scorecard vs baseline; Playwright smoke on critical user flows (user-facing stages); docs and `CLAUDE.md` updated.

**Anti-over-engineering rules** (canonical copy — the simplicity critic loads these at review time; findings carry the same weight as bugs):

1. No interface until the second implementation exists.
2. Ports only at real seams (LLM, DB, LINE).
3. No one-caller abstractions.
4. No config nobody sets.
5. The deliverable is code a human developer reads without a guide.

Tooling: `/increment-review` (`.claude/skills/increment-review/`), `/alignment-review` (`.claude/skills/alignment-review/`), `npm run eval` (scorecard, **advisory only — D21**: regressions are reported, never blocking; the founder judges). Alignment register: `docs/research/00-product-principles.md`.

## Anthropic usage budget (long autonomous runs)

`~/.claude/check-usage.sh` prints the subscription rate-limit windows (5h + 7d — same data as
`/usage`, server-side authoritative). Check it roughly hourly during long autonomous runs; **never
poll more often than every 5 minutes** (the endpoint 429s).

Thresholds and mode switches (5h window):

- **At 85%:** stop starting new build increments. Wrap current work to a clean committed state.
- **Above 85%:** switch to waiting mode. Only run simple, low-token cleanup tasks delegated to
  sub-agents on **smaller models (haiku/sonnet)** — use the ready-made prompts in
  `.claude/low-token-cleanups.md`. Stay within ~10% more usage while waiting (these cleanups must
  be cheap).
- **At 95%: hard stop** — sleep until the window resets, then resume main work.

**Log each reading + mode switch in `SPRINT-LOG.md`** when a sprint is active (timestamp, % used,
current mode).

## v2 data layer (Stage 1)

- **Postgres (RDS `linerobot-staging-pg`)** is the v2 catalog store; DynamoDB stays for ingestion
  plumbing only (messages, idempotency, debounce state). Connection string: Pulumi output
  `dbConnectionString` (secret) / password in config secret `dbPassword`.
- **Staging connectivity posture (D-S1-2):** publicly accessible + TLS forced at the engine
  (`rds.force_ssl=1`) + 44-char generated secret. **Production hardening (pre-launch task): move to
  private subnets + VPC endpoints/NAT, restrict the SG.** Lambdas connect directly — the single
  `pg.Pool` (max 2) lives in `packages/db/src/pool.ts`; keep Lambda concurrency × 2 well under
  t4g.micro's ~85 max_connections.
- `npm run db:seed` — load synthetic fixtures (24+ listings, 3 groups, role spread) into
  `DATABASE_URL`. `npm run test:integration -w @line-robot/db` / `-w @line-robot/pipeline` — Docker
  `postgis/postgis` suites (harness: `@line-robot/db/testing`).
- Schema changes: edit zod enums in `packages/domain` first, then `packages/db/src/schema.ts`, then
  `npm run generate -w @line-robot/db` — and read `packages/db/CLAUDE.md` for the migration
  hand-fixes (geography quoting, postgis extension).
- **Dedup thresholds (Stage 2, D2.6)** live in `packages/pipeline/src/dedup/config.ts` —
  env-overridable (`DEDUP_GEOHASH_PRECISION` 6, `DEDUP_GEO_RADIUS_M` 1000,
  `DEDUP_TRIGRAM_THRESHOLD` 0.55, `DEDUP_JACCARD_THRESHOLD` 0.50, `DEDUP_BLOCK_CAP` 8). Defaults
  are validated by the synthetic dup-pair tests (P/R ≥ 0.90); retune via the eval scorecard, never
  by hand in prod.
- `npm run eval` — pipeline scorecard over 62 synthetic cases. `EVAL_LLM=oracle` (default) is a
  harness smoke; `EVAL_LLM=anthropic` + `ANTHROPIC_API_KEY` runs the real model baseline (D21
  advisory, always exits 0).

## Deploying (Pulumi → AWS staging)

Pulumi state is on a **local file backend** (`file://~`); secrets use a **passphrase** provider.

- Pulumi binary lives at `~/.pulumi/bin` (not on `PATH` by default).
- **Passphrase is stored in `~/.line-robot-pulumi-passphrase`** — `chmod 600`, OUTSIDE the repo.
  The user does **not** memorize it; it lives only in that file. To recover/view it:
  `cat ~/.line-robot-pulumi-passphrase`. **Never copy the value into the repo** (not even a
  gitignored `.env`) — one copy in that out-of-repo 0600 file is the safest place for it.
- Full deploy:
  ```bash
  export PATH="$HOME/.pulumi/bin:$PATH"
  export AWS_PROFILE=line-robot
  export PULUMI_CONFIG_PASSPHRASE="$(cat ~/.line-robot-pulumi-passphrase)"
  npm run build              # bundle Lambdas — infra points at packages/bot/dist/*
  cd infra && pulumi up      # review diff, then "yes"
  ```

## AWS identities (shared account 259543826733, region ap-southeast-1)

- **`line-robot`** profile — the scoped deploy + runtime identity (`linerobot-*` ARNs only). Also
  granted staging-only data-plane **read** (DynamoDB GetItem/Query/Scan, S3, CloudWatch Logs) for
  verifying deploys/tests.
- **`default`** profile = `tea-admin` (account admin) — only needed to edit the deploy policy
  itself: `infra/deploy-user-policy.json` → `aws iam create-policy-version --profile default`
  (IAM caps a policy at 5 versions; prune the oldest non-default first).

## Tests

- `npm run test` — unit (vitest).
- `npm --prefix packages/bot run test:integration` — integration against DynamoDB Local (needs docker).
- `npm run lint` / `npm run typecheck` before committing.

## Rich menu (one-time, after deploy)

The persistent nav menu (My Listings / Upcoming / Search / Help) is a **data-plane LINE API call,
not Pulumi infra**. Its shape lives in `packages/bot/src/adapters/line/richMenu.ts`; the tappable
tabs fire the same postbacks the processor's `PostbackRouter` handles. To (re)install it:

```bash
export LINE_CHANNEL_ACCESS_TOKEN="$(cd infra && pulumi config get channelAccessToken)"
npm --prefix packages/bot run build   # bundles dist/scripts/setup-rich-menu.mjs
node packages/bot/dist/scripts/setup-rich-menu.mjs <menu-image.(png|jpeg)>
```

The image is a **2500×843 PNG/JPEG ≤1MB** the user supplies; its visuals are cosmetic (the four tap
zones are defined by bounds, not the picture). The script is idempotent — it deletes any prior menu
named `line-robot-main` before creating + setting the new one as default.

## MINI App deep-chat integration (plan 17) — one-time steps

Deeper chat ↔ MINI App loop on the **unverified** channel (no verification needed). Manual steps:

- **Deep links on the detail card (R1):** set the MINI App base URL so the bot can put an "Open in
  Catalog" button on the Flex detail card: `cd infra && pulumi config set miniappUrl
  https://miniapp.line.me/<liffId>` (e.g. `…/2010316767-rdtwc5y3`). Optional — unset just omits the
  button. Wired into the processor env as `MINIAPP_URL`.
- **Share a listing (R3):** `liff.shareTargetPicker` requires a **one-time per-channel consent** —
  LINE console → the MINI App/LIFF channel → **LIFF tab** → agree to **"Agreement Regarding Use of
  Information"**. No new LIFF scope, no verification. (Recipients who share no conversation with the
  sender see the card's self-contained summary but can't open the full listing — membership gate.)
- **Book a viewing (R4):** adds `POST /properties/{id}/viewings` to the read-api (membership-gated,
  creates a follow-up event whose reminder goes to the caller's own 1:1 chat). The read-api role now
  also has `dynamodb:PutItem` and its Function URL CORS allows `POST` — both land via `pulumi up`.
  Rebuild the SPA (`npm run build`) so the new Detail-screen booking/share UI ships.

Current build plan: `plans/17-miniapp-deep-chat-integration.md`.
