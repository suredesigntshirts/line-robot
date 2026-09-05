# 04 — Lambda Composition Roots & Bundling

**Goal:** the two Lambda entrypoints, wiring core + adapters, bundled into deployable zips.
**Prerequisite:** Stages 02–03.

## Work items

### 1. Ingest handler — `packages/bot/src/lambda/ingest.ts`
Function URL handler (`APIGatewayProxyEventV2` / Lambda Function URL event shape):
1. Read the **raw body** (note: base64-decode if `isBase64Encoded`). Do **not** JSON-parse before
   verifying.
2. Get signature from header `x-line-signature` (`LINE_SIGNATURE_HTTP_HEADER_NAME`).
3. `validateSignature(rawBody, channelSecret, signature)` → if false, respond **403**.
4. Parse body → `webhook.CallbackRequest`. If `events.length === 0` → respond **200**
   (LINE verify ping).
5. `QueuePublisher.publish(events)` → SQS (one message per event; include `webhookEventId`,
   `timestamp`, `source`).
6. Respond **200**. If the enqueue throws → respond **500** so LINE redelivers.

Keep it minimal and fast — no DynamoDB/S3 work here.

### 2. Processor handler — `packages/bot/src/lambda/processor.ts`
SQS-triggered, using `@aws-lambda-powertools/batch` (`processPartialResponse`) for
partial-batch failures. Per record:
1. Parse the enqueued event.
2. Idempotency wrapper keyed on `webhookEventId` (Stage 03).
3. `RawArchive.put(...)` → S3.
4. `MessageRepository.save(...)` → DynamoDB (direction `"in"`).
5. `HandlerRegistry` → `EchoHandler.handle(msg)` → `OutboundMessage[]`.
6. Send: if `replyToken` present → `LineGateway.reply(...)`; on token error or absent token →
   `LineGateway.push(to, ...)` where `to` is the conversation id. Persist outbound (direction `"out"`).
   Throw on failure so the record returns to the queue / DLQ.

### 3. Cross-cutting — `packages/bot/src/lib/`
- `logger.ts`: `@aws-lambda-powertools/logger` with structured context
  (`webhookEventId`, `sourceType`, `route`, `status`) per `development-guidelines` logging advice.
- Composition roots instantiate adapters **once at module scope** (outside the handler) for warm reuse.

### 4. Bundling — `packages/bot/esbuild.config.mjs`
- Two entrypoints → two outputs: `dist/ingest/index.js`, `dist/processor/index.js`.
- `platform:"node"`, `target:"node22"`, `format:"esm"` (or cjs — match handler export), `bundle:true`,
  `minify:true`, `sourcemap:true`. Exclude `@aws-sdk/*` if relying on the runtime-provided copy
  (else bundle it — decide and note; bundling is safest for version pinning).
- `npm -w packages/bot run build` produces the two folders that Pulumi will zip
  (`pulumi.asset.FileArchive`).

## Quality gates (must pass)
- **G1** typecheck, **G2** lint, **G5** build emits both bundles.
- **G3** handler unit tests:
  - Ingest: valid signature → 200 + publish called; empty events → 200 + no publish; forged
    signature → 403; enqueue throws → 500.
  - Processor: text event → archive + save + reply; group event → reply via group id; duplicate
    `webhookEventId` → processed once; reply-token failure → push fallback invoked.
  - Use `aws-sdk-client-mock` for SQS/S3/DDB and a mocked `MessagingApiClient`.
- Optional local invoke harness feeding a saved Function URL / SQS event fixture.

## Done criteria
Both Lambdas behave correctly under mocks and build to zips ready for Pulumi.

## References
- Function URL event shape: `@types/aws-lambda` (`APIGatewayProxyEventV2`).
- Async-processing rationale: `docs/.../messaging-api/receiving-messages/index.md`.
- `pulumi.asset.FileArchive` usage: Stage 05 + `docs/pulumi.com/registry/packages/aws/api-docs/lambda/function.md`.
