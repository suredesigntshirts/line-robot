# 00 — Overview & Architecture

> **Master index for the LINE Echo Bot rollout.** Read this first. Each stage has its own
> numbered file in this folder and is self-contained enough to execute after a context clear.

## Context

We are building a LINE Messaging API bot, starting as an **echo bot** (replies with whatever
message it receives), that **must also work in group and multi-person ("room") chats**. It
deploys to **AWS Lambda** via **Pulumi (TypeScript)**, cheaply, in a versioned way across
**staging → production**.

This is the foundation for a larger project that will add **LLM-based handlers** later, so we
scaffold a clean **hexagonal (ports-and-adapters)** architecture now, leverage existing
libraries instead of rolling our own, and store messages in permanent AWS storage from day one.

All work is grounded in docs cached under `docs/` (LINE: `docs/developers.line.biz/`,
Pulumi: `docs/pulumi.com/`) and the installed `@line/bot-sdk@11.0.1`.

## Locked decisions

| Area | Choice |
|---|---|
| Processing model | **Async** — Ingest Lambda (Function URL) verifies + returns 200 + enqueues to SQS; Processor Lambda does the work. LINE explicitly recommends async; scales to LLM latency later. |
| Storage | **DynamoDB** (queryable messages) **+ S3** (raw webhook archive) |
| Library stack | **Powertools, ElectroDB, Zod, Vitest, Biome, esbuild** + `@line/bot-sdk` + `@pulumi/aws` |
| State / deploy | **Pulumi Cloud** backend, **manual `pulumi up`** (CI deferred) |
| Region | **ap-southeast-1 (Singapore)** |
| AWS auth | **Not set up yet** → credential bootstrap is an explicit Stage 01 step |
| Lambda runtime | **nodejs22.x** (`@line/bot-sdk` declares `engines >=22`) |

## Stage index

| File | Stage | Outcome |
|---|---|---|
| `01-repo-tooling-credentials.md` | Foundation | Green skeleton, workspaces, deps, AWS+Pulumi access, missing docs fetched |
| `02-core-domain-line-adapter.md` | Core logic | Echo + signature verify + webhook parse, fully offline, unit-tested |
| `03-persistence-dynamodb-s3-idempotency.md` | Storage | DynamoDB repo, S3 archive, idempotency, config loader |
| `04-lambda-handlers.md` | Entrypoints | `ingest` + `processor` composition roots, bundled |
| `05-pulumi-infra-staging.md` | Infra | All AWS resources as Pulumi code, `pulumi preview` clean |
| `06-deploy-staging-acceptance.md` | Staging | Deployed, LINE connected, acceptance tests pass |
| `07-production-rollout.md` | Production | Prod stack, alarms, versioned releases, rollback |
| `08-hardening-observability.md` | Hardening | Dashboards, runbook, LLM-handler seam documented |

Execute in order. Each file lists its prerequisite stage.

## Documentation-grounded constraints (the "why" behind the design)

- **Verify `x-line-signature` over the RAW request body** *before* parsing —
  `docs/developers.line.biz/en/docs/messaging-api/verify-webhook-signature/index.md`. The docs
  warn: any deserialize/escape/substitution before verification is indistinguishable from
  tampering and fails. SDK helper: `validateSignature(body, channelSecret, signature): boolean`.
- **Empty-event "verify" pings must still return HTTP 200** —
  `docs/.../messaging-api/verify-webhook-url/index.md` (LINE's Verify button sends
  `{"destination":"…","events":[]}`). **Do not IP-filter**; rely on signature
  (`development-guidelines/index.md`).
- **Webhooks get redelivered / duplicated; order is not guaranteed** — dedupe on
  `webhookEventId` (ULID), order by `timestamp` (`receiving-messages/index.md`). →
  **idempotency is mandatory.**
- **Reply tokens are single-use, valid ~1 min, work in groups/rooms**; push needs the `to` id —
  `sending-messages/index.md`. Async via SQS is sub-second, so reply stays valid; the gateway
  falls back to push when there is no/expired token (e.g. `leave`, `memberLeft`).
- **Source discrimination** via `source.type` → `userId` / `groupId` / `roomId`.
- **Group chats require enabling "Allow bot to join group chats"** (off by default) and bring
  `join` / `leave` / `memberJoined` / `memberLeft` events
  (`docs/.../messaging-api/group-chats/index.md`).
- **Cache gaps filled in Stage 01** (confirmed missing from `docs/pulumi.com/`):
  `aws.dynamodb.Table`, `aws.cloudwatch.LogGroup`, `aws.lambda.Alias`,
  `aws.s3.BucketV2` (+ public-access-block/versioning/lifecycle/SSE), `aws.sqs.Queue`,
  plus `aws.cloudwatch.{MetricAlarm,Dashboard}` and `aws.sns.{Topic,TopicSubscription}` for
  stages 07–08. (Note: Lambda versioning is `publishVersion: true` on the Function, not a
  separate `Version` resource.) **All fetched in Stage 01.**

## SDK quick reference (`@line/bot-sdk@11.0.1`, verified from installed `.d.ts`)

Package is **dual ESM/CJS** (`"type":"module"`, `engines.node >=22`); types at `dist/index.d.ts`.

```ts
import {
  validateSignature,                 // (body: string|Buffer, channelSecret: string, signature: string) => boolean
  messagingApi,                       // messagingApi.MessagingApiClient
  webhook,                            // types: CallbackRequest, MessageEvent, TextMessageContent, *Source
  LINE_SIGNATURE_HTTP_HEADER_NAME,    // "x-line-signature"
  LINE_REQUEST_ID_HTTP_HEADER_NAME,   // "x-line-request-id"
  SignatureValidationFailed, JSONParseError, HTTPFetchError,
} from "@line/bot-sdk";

const client = new messagingApi.MessagingApiClient({ channelAccessToken });
await client.replyMessage({ replyToken, messages });   // ReplyMessageRequest
await client.pushMessage({ to, messages });            // PushMessageRequest (to = user/group/room id)
await client.getProfile(userId);
await client.getGroupMemberProfile(groupId, userId);
```

Webhook shapes:
```ts
webhook.CallbackRequest   = { destination: string; events: webhook.Event[] }
webhook.MessageEvent      = { type: "message"; replyToken?: string; message: MessageContent; source?; timestamp; webhookEventId; ... }
webhook.TextMessageContent= { type: "text"; id: string; text: string; quoteToken: string; ... }
webhook.UserSource        = { type: "user";  userId?: string }
webhook.GroupSource       = { type: "group"; groupId: string; userId?: string }
webhook.RoomSource        = { type: "room";  roomId: string;  userId?: string }
```
> **Lambda note:** do NOT use the SDK's Express `middleware` export — use `validateSignature`
> directly on the raw Function URL body.

## Target architecture

```
LINE Platform
   │  POST (header x-line-signature, raw JSON body)
   ▼
Lambda: ingest  ──(Function URL, authType NONE)
   │  • validateSignature(rawBody, secret, sig)   → 403 if invalid
   │  • events.length === 0 → 200 (verify ping)
   │  • enqueue each event → SQS                  → 200 (500 if enqueue fails → LINE retries)
   ▼
SQS main queue ──(redrive after N receives)──▶ SQS DLQ
   │  (event source mapping, batched, partial-batch failures)
   ▼
Lambda: processor
   • Powertools idempotency (key = webhookEventId; dedicated DDB table + TTL)
   • RawArchive.put(event)            → S3 (immutable archive / future training data)
   • MessageRepository.save(message)  → DynamoDB (ElectroDB single-table)
   • MessageHandler.handle(ctx)       → EchoHandler  (LLM handler added later, no infra change)
   • LineGateway.reply(token, msgs)   → MessagingApiClient (push fallback)
```

## Repo layout (npm workspaces)

```
line-robot/
  package.json            # workspaces: ["packages/*", "infra"]
  biome.json  tsconfig.base.json  .editorconfig
  docs/                   # cached LINE + Pulumi docs (existing)
  plans/                  # these plan files
  packages/bot/
    src/
      core/
        domain/           # Message, ConversationRef, OutboundMessage (pure, no I/O)
        ports/            # MessageHandler, LineGateway, MessageRepository,
                          #   RawArchive, QueuePublisher, Logger, Clock (interfaces only)
        handlers/         # EchoHandler implements MessageHandler; handler registry
      adapters/
        line/             # signatureVerifier, webhookParser, LineGateway impl
        dynamodb/         # ElectroDB entities + MessageRepository impl
        s3/               # RawArchive impl
        queue/            # SQS QueuePublisher impl
        config/           # Powertools params loader, Zod-validated config
      lambda/             # composition roots: ingest.ts, processor.ts
      lib/                # Powertools logger, errors, idempotency wiring
    test/{fixtures,unit,integration}/
    esbuild.config.mjs
  infra/                  # Pulumi project (separate workspace)
    Pulumi.yaml  Pulumi.staging.yaml  Pulumi.prod.yaml  index.ts  src/
```

**Hexagonal seam:** `core/` imports nothing from AWS/LINE; all I/O lives behind ports in
`adapters/`; `lambda/` entrypoints are the only composition roots. Adding the future LLM bot =
a new `MessageHandler` in `core/handlers/` + register it. No infra change.

## Cross-cutting quality gates (referenced by every stage)

- **G1 Typecheck** — `tsc --noEmit` (bot + infra)
- **G2 Lint/format** — `biome check`
- **G3 Unit tests** — `vitest run`, coverage ≥80% on `core/`
- **G4 Integration** — DynamoDB Local + `aws-sdk-client-mock` for S3/SQS
- **G5 Build** — `esbuild` emits the two Lambda zips
- **G6 Infra** — infra `tsc` + `pulumi preview` clean
- **G7 Security** — forged-signature rejection test, least-privilege IAM review, secret-scan
  (no secrets in code/state), optional `/security-review`
- **G8 Acceptance** — live staging/prod smoke (defined in stages 06/07)

## Versioning & environments

- **Stacks:** `staging`, `prod` (`Pulumi.<stack>.yaml` checked in; secrets encrypted by Pulumi Cloud).
- **LINE channels:** separate **staging** and **prod** Messaging API channels (avoid cross-talk).
- **Releases:** git tags per release; Lambda versions + aliases for instant rollback; Pulumi
  Cloud state history as a second rollback path.

## Items needed from the user along the way

- **LINE:** create staging (then prod) **Messaging API channel(s)** → **Channel secret** +
  **Channel access token** (loaded into SSM SecureString, never committed).
- **AWS:** finish credential bootstrap (Stage 01).
- **Pulumi Cloud:** account + `pulumi login` (Stage 01).

## Key local references

- LINE docs: `docs/developers.line.biz/en/docs/messaging-api/{verify-webhook-signature,verify-webhook-url,receiving-messages,sending-messages,group-chats,development-guidelines}/index.md`; full reference `docs/developers.line.biz/en/reference/messaging-api/index.md`.
- SDK types: `node_modules/@line/bot-sdk/dist/{validate-signature,messaging-api/api/messagingApiClient,webhook/model/*}.d.ts`.
- Pulumi: `docs/pulumi.com/docs/iac/concepts/{projects,stacks,config,secrets,state-and-backends}.md`; `docs/pulumi.com/registry/packages/aws/api-docs/{lambda,iam,ssm,secretsmanager}/*.md` (+ dynamodb/cloudwatch/sqs/s3 after Stage 01).
