# 05 — Pulumi Infrastructure (staging stack)

**Goal:** every AWS resource defined as Pulumi TypeScript, previewable, least-privilege.
**Prerequisite:** Stage 04 (built bundles) + Pulumi docs from Stage 01.

## Work items

### 1. Pulumi project — `infra/`
- `Pulumi.yaml`: `name: line-robot`, `runtime: nodejs`, `description`.
- `Pulumi.staging.yaml`: `config: { aws:region: ap-southeast-1 }`.
- `index.ts` entrypoint + modules in `infra/src/` (`storage.ts`, `queue.ts`, `iam.ts`,
  `lambda.ts`, `observability.ts`, `config.ts`). Export the Function URL.

### 2. Resources
Storage (`storage.ts`):
- `aws.dynamodb.Table` **messages** — `billingMode: "PAY_PER_REQUEST"`, PK/SK string keys
  (`pk`/`sk`), point-in-time recovery on.
- `aws.dynamodb.Table` **idempotency** — PK `id`, `ttl` attribute enabled, PAY_PER_REQUEST.
- `aws.s3.BucketV2` **raw archive** — `aws.s3.BucketPublicAccessBlock` (all true),
  versioning enabled, lifecycle rule (e.g. transition to IA after 30d). Block all public access.

Queue (`queue.ts`):
- `aws.sqs.Queue` **DLQ**.
- `aws.sqs.Queue` **main** with `redrivePolicy` → DLQ (`maxReceiveCount` ~5),
  `visibilityTimeout` ≥ 6× processor timeout.

IAM (`iam.ts`) — **one role per Lambda**, least privilege:
- Ingest role: `sqs:SendMessage` on main queue; `ssm:GetParameter`(+`kms:Decrypt`) on the
  channel-secret param; CloudWatch Logs write.
- Processor role: `sqs:Receive/Delete/GetAttributes` on main queue; `dynamodb:*Item/Query` on
  both tables; `s3:PutObject` on the archive bucket; `ssm:GetParameter`(+`kms:Decrypt`) on token
  params; CloudWatch Logs write.
- Build policies with `aws.iam.getPolicyDocument`; attach via `aws.iam.RolePolicy`.

Compute (`lambda.ts`):
- `aws.lambda.Function` **ingest** & **processor** — `runtime: aws.lambda.Runtime.NodeJS22dX`,
  `handler: "index.handler"`, `code: new pulumi.asset.FileArchive("../packages/bot/dist/<name>")`,
  `architectures:["arm64"]` (cheaper), `timeout`/`memorySize` sized per role, `environment` =
  table/bucket/queue names + SSM param names.
- `aws.lambda.FunctionUrl` on **ingest** — `authorizationType: "NONE"` (LINE can't sign IAM;
  security is the signature check — documented, do not IP-filter).
- `aws.lambda.EventSourceMapping` SQS main → **processor** (`batchSize`, `functionResponseTypes:["ReportBatchItemFailures"]`).
- `aws.lambda.Alias` `staging` per function (rollback target).

Secrets/config (`config.ts`):
- `aws.ssm.Parameter` (type `SecureString`) for **channelSecret** and **channelAccessToken**,
  `value` from `pulumi.Config().requireSecret(...)` (encrypted in Pulumi Cloud state). Lambdas
  read them at runtime (Stage 03 loader) — never baked into the bundle.

Observability (`observability.ts`):
- `aws.cloudwatch.LogGroup` per function with `retentionInDays` (e.g. 14) so logs aren't kept forever.

### 3. Stack config
```
cd infra
pulumi stack init staging
pulumi config set aws:region ap-southeast-1
pulumi config set --secret line:channelSecret <staging channel secret>
pulumi config set --secret line:channelAccessToken <staging access token>
```

## Quality gates (must pass)
- **G6** `tsc` in `infra/` clean; `pulumi preview` on `staging` succeeds with the intended resource set.
- **G7** IAM reviewed = least privilege (no `*` on resources); no plaintext secrets in
  `pulumi preview --diff`; Function URL public-exposure documented (signature-protected).

## Done criteria
`pulumi preview` shows a clean, least-privilege stack ready to deploy. No `pulumi up` yet.

## References
- `docs/pulumi.com/registry/packages/aws/api-docs/{lambda/{function,functionurl,permission,alias},iam/*,ssm/parameter,secretsmanager/secret}.md`
- + dynamodb/cloudwatch/sqs/s3 docs fetched in Stage 01.
- Config/secrets: `docs/pulumi.com/docs/iac/concepts/{config,secrets,stacks}.md`.
