#!/bin/bash
# Deploys the staging stack (CLAUDE.md "Deploying"). Usage: bash scripts/deploy-staging.sh
set -euo pipefail
cd "$(dirname "$0")/../infra"
export PATH="$HOME/.pulumi/bin:$PATH"
export AWS_PROFILE=line-robot
export PULUMI_CONFIG_PASSPHRASE="$(cat ~/.line-robot-pulumi-passphrase)"
pulumi up --yes --non-interactive
