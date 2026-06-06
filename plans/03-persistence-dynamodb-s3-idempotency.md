# 03 — Persistence: DynamoDB + S3 + Idempotency + Config

**Goal:** durable storage, raw archive, redelivery-safe idempotency, and secure config loading.
**Prerequisite:** Stage 02 (and the DynamoDB/S3/SQS docs fetched in Stage 01).

## Work items

### 1. DynamoDB message repository — `packages/bot/src/adapters/dynamodb/`
- ElectroDB `Message` entity, single-table design:
  - **PK** = conversation ref, e.g. `CONV#user#<userId>` / `CONV#group#<groupId>` / `CONV#room#<roomId>`.
  - **SK** = `MSG#<timestamp>#<messageId>` (sortable, recent-last).
  - Attributes: `messageId, text, contentType, senderUserId?, webhookEventId, timestamp, direction("in"|"out")`.
  - Optional GSI later for per-sender queries; not needed now.
- `MessageRepository` impl: `save()` puts the item; `findRecent(ref, limit)` queries PK,
  `ScanIndexForward:false`, `Limit:limit` — this is the future LLM context window.
- Use `@aws-sdk/lib-dynamodb` `DynamoDBDocumentClient` under ElectroDB.

### 2. S3 raw archive — `packages/bot/src/adapters/s3/`
- `RawArchive.put(eventId, ref, raw)` → `PutObject` to the archive bucket.
- Key: `raw/<yyyy>/<mm>/<dd>/<convKey>/<eventId>.json`, body = original event JSON,
  `ContentType: application/json`. Immutable audit log / future training data.

### 3. Idempotency — `packages/bot/src/lib/idempotency.ts`
- Use `@aws-lambda-powertools/idempotency` with `DynamoDBPersistenceLayer` against a
  **dedicated idempotency table** (TTL-enabled) — keep separate from the messages table.
- Idempotency key = `webhookEventId` (ULID, unique per event). Wrap the processor's
  per-event unit of work so redelivered duplicates are skipped.

### 4. Config & secrets — `packages/bot/src/adapters/config/`
- Load **Channel secret** + **Channel access token** from **SSM SecureString** via
  `@aws-lambda-powertools/parameters/ssm` `getParameter(name, { decrypt:true, maxAge })`
  (built-in caching → fewer SSM calls per warm Lambda).
- Validate all runtime config (env var names for table/bucket/queue, SSM param names) with a
  **Zod** schema; fail fast at cold start with a clear error.

## Quality gates (must pass)
- **G1** typecheck, **G2** lint.
- **G4** integration tests:
  - Repository `save` + `findRecent` against **DynamoDB Local** (docker) — round-trips and
    returns most-recent-first.
  - **Idempotency**: same `webhookEventId` processed twice → underlying work runs once.
  - S3 `put` verified with `aws-sdk-client-mock` (correct key + body).
  - Config loader: valid SSM/env → parsed object; missing/invalid → Zod error.

## Done criteria
Messages persist and query correctly; duplicate webhooks are deduped; secrets load from SSM with
validation; still no Lambda entrypoints (next stage).

## References
- DynamoDB / S3 / SQS Pulumi docs fetched in Stage 01 (under `docs/pulumi.com/registry/packages/aws/api-docs/`).
- Redelivery/idempotency rationale: `docs/.../messaging-api/receiving-messages/index.md`.
- Powertools modules: `@aws-lambda-powertools/{idempotency,parameters}` (inspect `node_modules` types).
