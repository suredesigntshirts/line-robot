# 07 — Production Rollout (versioned)

**Goal:** a safe, reversible production deployment with monitoring and a release process.
**Prerequisite:** Stage 06 (staging green).

## Work items

### 1. Production stack
- `cd infra && pulumi stack init prod`; `Pulumi.prod.yaml` with `aws:region: ap-southeast-1`.
- **Separate LINE prod channel** (recommended) → its own Channel secret + access token:
  `pulumi config set --secret line:channelSecret …` / `… line:channelAccessToken …` on `prod`.
- Per-env tuning: longer `retentionInDays`, optional **reserved concurrency** on the processor,
  same least-privilege IAM.

### 2. Monitoring & alarms (`observability.ts`, prod)
- `aws.cloudwatch.MetricAlarm`:
  - Lambda **Errors** > 0 (ingest & processor).
  - Lambda **Throttles** > 0.
  - SQS **ApproximateNumberOfMessagesVisible** on **DLQ** > 0 (failed events landed).
  - SQS **ApproximateAgeOfOldestMessage** on main queue above threshold (processor falling behind).
- (Optional) SNS topic → email for alarm notifications.

### 3. Versioned release process
- Tag the release: `git tag vX.Y.Z && git push --tags`.
- `npm run build` → `pulumi up --stack prod`.
- Lambda `aws.lambda.Alias` `prod` points at the published version → instant rollback target.
- **Rollback:** repoint the `prod` alias to the previous version, or `pulumi up` from the prior
  tagged commit. Pulumi Cloud stack history is the secondary recovery path.
- (CI deferred per decision — deploys are manual `pulumi up` for now.)

## Quality gate (must pass)
- All prod alarms created and in `OK`/insufficient-data (not alarming) at idle.
- **G8 acceptance** (from Stage 06) repeated against the **prod** channel and Function URL.
- **DLQ empty** post-smoke.
- Runbook updated (Stage 08) with deploy + rollback steps.

## Done criteria
Production bot live, monitored, releasable by tag, and rollback verified.

## References
- `aws.cloudwatch` (alarms) + `aws.lambda.Alias`/`Version` docs (fetched Stage 01).
- Stacks/secrets: `docs/pulumi.com/docs/iac/concepts/{stacks,secrets,state-and-backends}.md`.
