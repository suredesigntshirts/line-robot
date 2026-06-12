# CLAUDE.md — line-robot

Project-specific guidance for Claude. (The global `~/.claude/CLAUDE.md` also applies.)

## Browser automation — always run headed, as a real user

When capturing or auditing external websites (playwright-cli or any browser tooling): **always run HEADED (not headless) with a current standard Chrome user-agent, realistic viewport, locale `th-TH` / timezone Asia/Bangkok for Thai sites, and human pacing** (load homepage, wait, then navigate deeper). We are on a residential IP; headless mode + bot UA is what gets blocked — headed-as-real-user got us past walls (DDproperty et al.) that hard-blocked headless runs. Never attempt to solve CAPTCHAs; screenshot the challenge as evidence and move on.

## V2 rebuild — plan & product research

The v2 marketplace rebuild is governed by `plans/19-v2-marketplace-rebuild.md` (master plan,
decision register D1–D25) with per-stage specs in `plans/19-v2-marketplace-rebuild/`. **No stage is
built before its spec is fleshed and the user approves.**

Product/market research artifacts live in `docs/research/` (a1–c1). The **heuristic register** —
the numbered, falsifiable rules every design-bearing change is reviewed against — is
`docs/research/00-product-principles.md`. When reviewing or building UI, copy, schema, or flows,
load the register and check the applicable heuristic IDs. (A `/alignment-review` skill that does
this mechanically is a Stage 0 deliverable.)

## ⚠️ Anthropic structured output — HARD 16-nullable-parameter limit (DO NOT REGRESS)

Our extraction uses Anthropic **strict structured output** (`messages.parse` +
`output_config.format` / `zodOutputFormat`). That mode **caps a schema at 16 parameters with union
types** — every `.nullable()` / `.optional()` / `anyOf` field counts. **Exceed it and the API
returns a hard `400 invalid_request_error` on EVERY call** ("Schemas contains too many parameters
with union types … limit: 16 parameters with unions"). This is **not caught by our tests** — they
use a fake extractor, so the real-API limit is only hit in production.

This already caused a full extraction outage once (plan 12 added 11 `.nullable()` fields → 27
nullables → every sweep + edit 400'd; see `plans/13-chanote-ocr-and-image-pipeline.md`).

**Rules when touching `packages/bot/src/adapters/anthropic/claudeExtractor.ts` (or any
`output_config.format` schema):**
- **Keep the total nullable/union count ≤ 16** across the WHOLE schema (nested objects count too).
- Prefer **required-with-sentinel** over nullable: strings → `z.string()` with `""` = absent;
  arrays → `z.array(...)` with `[]` = absent. Strict mode already forces every key to be present,
  so you keep determinism without spending a nullable. Reserve `.nullable()` for **numbers** (no
  clean sentinel) — there are ~8 of them, which is the whole budget we spend.
- To add many fields, **group them in a single nullable nested object** (1 union for the group;
  inner fields required) rather than N nullable scalars.
- There is a **regression test** that serialises the schema and asserts ≤16 unions — keep it green.
- See `packages/bot/src/adapters/anthropic/CLAUDE.md` for the same rule next to the code.

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
