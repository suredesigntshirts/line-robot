# 02 — Core Domain & LINE Adapter (pure, offline)

**Goal:** all bot business logic + LINE parsing/verification/sending, with **zero AWS
dependencies**, fully unit-tested offline.
**Prerequisite:** Stage 01.

## Work items

### 1. Domain types — `packages/bot/src/core/domain/`
- `ConversationRef` — discriminated by chat type:
  ```ts
  type ConversationRef =
    | { kind: "user";  userId: string }
    | { kind: "group"; groupId: string; senderUserId?: string }
    | { kind: "room";  roomId: string;  senderUserId?: string };
  ```
- `IncomingMessage` — normalized inbound: `{ ref, messageId, text?, contentType, webhookEventId, timestamp, replyToken? }`.
- `OutboundMessage` — provider-agnostic `{ type: "text"; text: string }` (extensible later).

### 2. Ports (interfaces only) — `packages/bot/src/core/ports/`
```ts
interface MessageHandler { handle(msg: IncomingMessage): Promise<OutboundMessage[]>; }
interface LineGateway {
  reply(replyToken: string, messages: OutboundMessage[]): Promise<void>;
  push(to: string, messages: OutboundMessage[]): Promise<void>;
}
interface MessageRepository { save(m: IncomingMessage): Promise<void>;
                              findRecent(ref: ConversationRef, limit: number): Promise<IncomingMessage[]>; }
interface RawArchive { put(eventId: string, ref: ConversationRef, raw: unknown): Promise<void>; }
interface QueuePublisher { publish(events: unknown[]): Promise<void>; }
interface Logger { info(...): void; warn(...): void; error(...): void; }
interface Clock { now(): number; }
```

### 3. Handlers — `packages/bot/src/core/handlers/`
- `EchoHandler implements MessageHandler`: if `msg.text` present → return
  `[{ type:"text", text: msg.text }]`; non-text → `[]` (or a friendly note). Pure, no I/O.
- `HandlerRegistry`: maps event/message kind → handler. Today only echo; this is the seam where
  the future LLM handler plugs in.

### 4. LINE adapter — `packages/bot/src/adapters/line/`
- `signatureVerifier.ts`: wraps `validateSignature(rawBody, channelSecret, signature)`; throws
  `SignatureValidationFailed` on mismatch. Operates on the **raw string/Buffer** body.
- `webhookParser.ts`: `JSON.parse` raw body → `webhook.CallbackRequest`; map each
  `webhook.Event` to domain. Source discrimination:
  ```ts
  switch (event.source?.type) {
    case "user":  ref = { kind:"user",  userId: src.userId! }; break;
    case "group": ref = { kind:"group", groupId: src.groupId, senderUserId: src.userId }; break;
    case "room":  ref = { kind:"room",  roomId: src.roomId,  senderUserId: src.userId }; break;
  }
  ```
  Handle `message`/`join`/`leave`/`memberJoined`/`memberLeft`; remember `leave` & `memberLeft`
  have **no** `replyToken`.
- `lineGateway.ts`: `LineGateway` impl over `new messagingApi.MessagingApiClient({ channelAccessToken })`.
  `reply()` → `client.replyMessage({ replyToken, messages })`; `push()` →
  `client.pushMessage({ to, messages })`. Map `OutboundMessage` → SDK `Message`. Catch
  `HTTPFetchError`; on reply-token failure, surface so caller can fall back to push.

### 5. Test fixtures — `packages/bot/test/fixtures/`
Capture real LINE payload shapes (from `docs/developers.line.biz/en/reference/messaging-api/index.md`):
1:1 text, group text, room text, **empty events** (`{"destination":"…","events":[]}`),
`join`, `leave`, `memberJoined`, `memberLeft`, a non-text (sticker/image) message.

## Quality gates (must pass)
- **G1** typecheck, **G2** lint.
- **G3** unit tests, coverage ≥80% on `core/`:
  - webhook parsing for all fixtures incl. empty-events → yields no messages.
  - source discrimination → correct `ConversationRef` for user/group/room.
  - `EchoHandler` echoes text, ignores non-text.
  - signature verify: **valid passes, forged fails** (compute a known-good HMAC in the test).
  - `LineGateway` maps outbound correctly and calls a **mocked** `MessagingApiClient`.

## Done criteria
Bot logic runs entirely offline with high coverage; no `@aws-sdk/*` import anywhere in `core/`.

## References
- Webhook/source/message shapes: `node_modules/@line/bot-sdk/dist/webhook/model/*.d.ts`
- `validateSignature`: `node_modules/@line/bot-sdk/dist/validate-signature.d.ts`
- Reply/push: `node_modules/@line/bot-sdk/dist/messaging-api/api/messagingApiClient.d.ts`
- Signature rules: `docs/.../messaging-api/verify-webhook-signature/index.md`
