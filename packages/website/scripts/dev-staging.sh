#!/usr/bin/env bash
# Run the website locally (Astro dev server, hot reload) against the STAGING database + photo
# bucket, so you see real listings while editing templates. Read-only from the site's point of
# view (the website only SELECTs). Needs: the `line-robot` AWS profile, the Pulumi passphrase file,
# and `~/.pulumi/bin` (see CLAUDE.md → Deploying). Usage: npm run dev:staging -w @line-robot/website
set -euo pipefail
here="$(cd "$(dirname "$0")/.." && pwd)"
infra="$here/../../infra"
export PATH="$HOME/.pulumi/bin:$PATH"
export AWS_PROFILE="${AWS_PROFILE:-line-robot}"
export AWS_REGION="${AWS_REGION:-ap-southeast-1}"
export PULUMI_CONFIG_PASSPHRASE="$(cat "$HOME/.line-robot-pulumi-passphrase")"
export DATABASE_URL="$(cd "$infra" && pulumi stack output dbConnectionString --show-secrets)"
export ARCHIVE_BUCKET="$(cd "$infra" && pulumi stack output archiveBucketName)"
export LINE_OA_URL="$(cd "$infra" && pulumi config get lineOaUrl)"
echo "website dev → staging DB + bucket $ARCHIVE_BUCKET (LINE OA $LINE_OA_URL)"
cd "$here" && exec npx astro dev --host 127.0.0.1 --port "${PORT:-4321}" "$@"
