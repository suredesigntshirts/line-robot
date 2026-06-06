# CLAUDE.md — line-robot

Project-specific guidance for Claude. (The global `~/.claude/CLAUDE.md` also applies.)

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

Current build plan: `plans/09-realestate-catalog-assistant.md`.
