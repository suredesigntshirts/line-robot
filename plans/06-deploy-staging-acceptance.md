# 06 — Deploy to Staging & Acceptance

**Goal:** a working echo bot in staging, connected to LINE, with passing live acceptance tests.
**Prerequisite:** Stage 05 (clean `pulumi preview`).

## Work items

### 1. Deploy
- `npm run build` (rebuild bundles) → `cd infra && pulumi up --stack staging`.
- Capture the exported **Function URL** (`pulumi stack output functionUrl`).

### 2. LINE channel wiring (staging channel)
Create/locate a **Messaging API channel** in the LINE Developers Console
(`docs/.../messaging-api/getting-started/index.md`). On the **Messaging API** tab:
- Set **Webhook URL** = `<Function URL>` (the bot listens at the URL root; no `/webhook` path
  unless you route one — confirm the handler path matches).
- Enable **Use webhook**.
- Enable **Allow bot to join group chats** (off by default — required for group support).
- **Disable** Auto-reply messages and Greeting messages (they interfere with the bot).
- Issue/copy the **Channel access token**; copy the **Channel secret** (Basic settings).
- Put both into the stack:
  `pulumi config set --secret line:channelSecret …` /
  `pulumi config set --secret line:channelAccessToken …` then `pulumi up` to push to SSM.
- Add the bot as a friend via the channel QR for 1:1 testing.

### 3. Verify webhook
- Click **Verify** in the console → must show **Success** (handler returns 200 to the empty-event
  ping after passing signature check). If it fails, check CloudWatch logs for the ingest Lambda.

## Quality gate G8 — Acceptance (all must pass)
- **1:1 echo:** DM the bot → identical text echoed back.
- **Group echo:** create a group, invite the bot (a `join` event is received and handled), send a
  message → echoed.
- **Room echo:** multi-person chat → echoed.
- **Redelivery/idempotency:** re-trigger the same event (or replay) → exactly **one** reply and
  **one** stored message row (idempotency working).
- **Forged request:** POST to the Function URL with a bad/absent `x-line-signature` → **403**.
- **Persistence:** confirm rows in the DynamoDB messages table and objects in the S3 archive
  bucket for the test conversations.
- **Operational:** CloudWatch logs show structured entries; **DLQ is empty**.

## Done criteria
LINE **Verify = Success** and every G8 check passes; results recorded (e.g. in `08` runbook).

## References
- `docs/.../messaging-api/{getting-started,verify-webhook-url,group-chats}/index.md`
- Webhook signature / redelivery: `docs/.../messaging-api/{verify-webhook-signature,receiving-messages}/index.md`
