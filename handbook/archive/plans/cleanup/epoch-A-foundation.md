# Foundation (Stages 1–5) — Design Review

## Epoch summary

This epoch built everything from scratch: npm workspaces + Biome/TypeScript toolchain, the
hexagonal-architecture skeleton (core domain, ports, adapters, app, lambda), DynamoDB + S3 +
SQS persistence, an echo handler, idempotency via Powertools, and the full Pulumi infra (two
Lambda functions, queues, SSM parameters, IAM roles, CloudWatch log groups).  The system at the
end of this epoch can receive a LINE webhook, verify its signature, enqueue each event to SQS,
process it exactly once, store the message, and echo it back.

---

## Design concerns introduced

### D01 — App layer directly imports an adapter (breaks hexagonal boundary)

**Severity:** high

**File(s):** `packages/bot/src/app/eventProcessor.ts:1–2`

**What was introduced:**
`EventProcessor` — the central app-layer orchestrator — opens with:

```ts
import { parseRawEvent } from "../adapters/line/webhookParser.js";
```

**Why it's a problem:**
The app layer is supposed to know only about ports (interfaces) defined in `core/ports/`.
Importing a concrete LINE adapter function couples the app-layer class to the LINE SDK's type
system and parse logic.  If the inbound transport ever changes (different queue format, a second
provider), `EventProcessor` must be edited rather than a new adapter wired in.  It also makes
the app layer non-testable without the LINE adapter present — though the test happens to
construct raw webhook-shaped JSON that coincidentally matches, hiding the coupling.

**Better approach:**
Define a port — e.g. `EventParser` in `core/ports/runtime.ts`:

```ts
export interface EventParser {
  parse(raw: unknown): InboundEvent;
}
```

Inject it into `EventProcessorDeps` and wire the concrete `parseRawEvent` wrapper at the lambda
composition root (`lambda/processor.ts`).  The app layer then depends only on the interface.

---

### D02 — `ingestHandler.ts` (app layer) imports AWS lambda types and the LINE SDK directly

**Severity:** medium

**File(s):** `packages/bot/src/app/ingestHandler.ts:1–2`

**What was introduced:**

```ts
import { LINE_SIGNATURE_HTTP_HEADER_NAME } from "@line/bot-sdk";
import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
```

The function signature of `handleIngest` is typed with `APIGatewayProxyEventV2` and returns
`APIGatewayProxyResultV2`.

**Why it's a problem:**
The app layer is supposed to be transport-agnostic.  Binding `handleIngest` to the AWS API
Gateway V2 event shape and to the LINE SDK constant means the handler can never be tested
without the `aws-lambda` type shims, and can never be reused by a different transport (e.g.
plain HTTP framework, ALB, or a test harness that doesn't construct a full
`APIGatewayProxyEventV2`).  The LINE header constant leaking here also duplicates the
adapter-specificity that already exists in `SignatureVerifier`.

**Better approach:**
Define a transport-agnostic `IngestRequest` in `core/ports/` (raw body string + signature
string).  The lambda entry point (`lambda/ingest.ts`) extracts these from the
`APIGatewayProxyEventV2` before calling the app layer.  `handleIngest` then accepts only
`IngestRequest` and returns a plain discriminated union (`{ ok: true } | { error: 403 | 500 }`).
The LINE header name stays inside `lambda/ingest.ts` where it belongs.

---

### D03 — `QueuePublisher` port uses `readonly unknown[]` — no domain type flows through the queue

**Severity:** medium

**File(s):** `packages/bot/src/core/ports/runtime.ts:3`, `packages/bot/src/adapters/queue/sqsPublisher.ts:20`

**What was introduced:**

```ts
export interface QueuePublisher {
  publish(events: readonly unknown[]): Promise<void>;
}
```

The app layer calls `publisher.publish(payloads)` where `payloads` is `EventPayload[]`, but the
port signature erases that type to `unknown`.

**Why it's a problem:**
The port is the contract between the app layer and the SQS adapter.  Typing it `unknown` means
the compiler cannot catch callers passing the wrong payload shape, and no tool can trace what
flows through the queue.  `EventPayload` is already a well-defined interface — there is no
reason not to use it.

**Better approach:**
Parameterise the port:

```ts
export interface QueuePublisher<T> {
  publish(events: readonly T[]): Promise<void>;
}
```

Or, since only `EventPayload` ever flows here, pin it directly:

```ts
import type { EventPayload } from "../domain/events.js";  // move EventPayload to domain
export interface QueuePublisher {
  publish(events: readonly EventPayload[]): Promise<void>;
}
```

`SqsQueuePublisher` then serialises to JSON at the adapter boundary, where type erasure is
intentional.

---

### D04 — `QUEUE_URL` is optional in the shared `EnvSchema` but mandatory for ingest; the check is deferred to runtime

**Severity:** medium

**File(s):** `packages/bot/src/adapters/config/config.ts:13`, `packages/bot/src/lambda/ingest.ts:13–14`

**What was introduced:**
`EnvSchema` declares `QUEUE_URL: z.string().min(1).optional()`.  `ingest.ts` then re-checks it
at runtime:

```ts
if (env.QUEUE_URL === undefined) {
  throw new Error("QUEUE_URL is required for the ingest Lambda");
}
```

**Why it's a problem:**
The env schema is validated at cold start to "fail fast and loudly" (the comment's own words).
But for the ingest Lambda the schema validation succeeds even when `QUEUE_URL` is absent; the
real failure only surfaces when `buildDeps()` runs.  It also introduces a TypeScript narrowing
burden: `env.QUEUE_URL` is `string | undefined` after `loadEnv()`, so the lambda has to
re-assert and cast.

The root cause is that both lambdas share one `EnvSchema` even though they have different
required env variables.

**Better approach:**
Define two schemas — `IngestEnvSchema` (includes `QUEUE_URL: z.string().min(1)`) and
`ProcessorEnvSchema` (omits `QUEUE_URL`) — or use a common base plus lambda-specific
extensions.  Each lambda calls `loadIngestEnv()` / `loadProcessorEnv()` and gets a typed result
where every field is `string`, not `string | undefined`.

---

### D05 — `loadSecrets` is defined but never used; dead code at birth

**Severity:** low

**File(s):** `packages/bot/src/adapters/config/config.ts:69–77`

**What was introduced:**

```ts
export async function loadSecrets(env: Env, maxAge = 300): Promise<Secrets> { … }
```

Neither lambda calls `loadSecrets`.  Ingest calls `loadChannelSecret`; processor calls
`loadChannelAccessToken`.

**Why it's a problem:**
Dead exported functions mislead readers into thinking there is a use-case for loading both
secrets together.  If the function is intended for future use, that intent is not documented.

**Better approach:**
Remove it until a caller exists.  If it is truly planned, add a `// used by X once Y is built`
comment.  Leaving unexplained dead exports is a maintenance liability.

---

### D06 — `refFromItem` silently substitutes empty strings for missing IDs

**Severity:** medium

**File(s):** `packages/bot/src/adapters/dynamodb/messageRepository.ts:62–68`

**What was introduced:**

```ts
case "group":
  return { kind: "group", groupId: item.groupId ?? "", senderUserId: item.senderUserId };
case "room":
  return { kind: "room", roomId: item.roomId ?? "", senderUserId: item.senderUserId };
default:
  return { kind: "user", userId: item.userId ?? "" };
```

**Why it's a problem:**
If a DynamoDB item has `kind: "group"` but `groupId` is absent (due to a schema bug, a
migration, or a partial write), the function returns `{ kind: "group", groupId: "" }`.  Every
downstream operation — `conversationKey`, `pushTarget`, LINE API calls — silently operates on a
blank ID.  The failure mode is invisible until a push to `""` hits the LINE API and returns an
error, far from the corrupt data.

**Better approach:**
Throw (or return a typed `Result<ConversationRef, Error>`) if a required field is missing:

```ts
if (!item.groupId) throw new Error(`DynamoDB item missing groupId for kind=group (pk=${item.pk})`);
return { kind: "group", groupId: item.groupId, senderUserId: item.senderUserId };
```

---

### D07 — Outbound message ID is a fragile string template, not an isolated concern

**Severity:** low

**File(s):** `packages/bot/src/app/eventProcessor.ts:109–116` (persistOutbound)

**What was introduced:**

```ts
messageId: `${message.webhookEventId}#out#${index}`,
```

**Why it's a problem:**
The ID generation scheme is an inline magic template that is tied to knowing the DynamoDB sort
key format (the `#`-delimited composite key convention ElectroDB uses).  It is defined in the
app layer, which is supposed to be storage-agnostic.  If the repository ever needs a different
ID shape, `EventProcessor` must be changed.  It is also not tested in isolation — the test
asserts the saved direction but not the generated ID.

**Better approach:**
Push ID generation into the repository adapter, or expose an `outboundMessageId(webhookEventId,
index)` factory in a dedicated module so the scheme is named and testable.  The app layer just
passes the index and lets the repository decide its key format.

---

### D08 — Lambda entry points lack test coverage

**Severity:** low

**File(s):** `packages/bot/src/lambda/ingest.ts`, `packages/bot/src/lambda/processor.ts`

**What was introduced:**
Both lambda files perform non-trivial wiring: the module-level `depsPromise` lazy-init pattern,
the `buildDeps` composition, the SSM fetch, the batch processor loop, and the cast
`JSON.parse(record.body) as EventPayload`.  No test was added for either file.

**Why it's a problem:**
The `as EventPayload` cast in `processor.ts` is the seam where a malformed SQS message could
silently skip fields and proceed.  The lazy-singleton pattern means a cold-start failure
(e.g. SSM unavailable) memoises the rejected promise and every subsequent warm invocation fails
permanently until the Lambda container is recycled — a subtle production risk not covered by
any test.

**Better approach:**
Extract the DI wiring into a testable `compose()` function that takes already-resolved
dependencies.  Test that `buildDeps` throws when the env is incomplete, and test the SQS record
body parsing with an intentionally malformed payload.  At minimum, validate the SQS record body
with Zod against `EventPayload`'s schema before casting.

---

### D09 — `commonEnv` injects `QUEUE_URL` into the processor Lambda unnecessarily

**Severity:** low

**File(s):** `infra/index.ts:404–447`

**What was introduced:**
A single `commonEnv` object is spread into both Lambda function environment blocks.  It includes
`QUEUE_URL`, which the processor Lambda does not use.

**Why it's a problem:**
The processor role has no `sqs:SendMessage` permission, so a bug that causes the processor to
try to publish would fail noisily — the leaked env var is not an active security risk.  But
spreading unneeded variables into a Lambda violates the principle of minimal configuration
surfaces: any configuration value present can be read by code running in that Lambda, and it
muddies `loadEnv` (which defines `QUEUE_URL` as optional precisely to accommodate the shared
env).  It also means refactoring the queue is a two-location change.

**Better approach:**
Separate the env into `baseEnv` (shared storage + secret param names + Powertools settings) and
add `QUEUE_URL` only to the ingest Lambda's environment block.

---

## What was done well

1. **Port definitions are clean and minimal.** Each port in `core/ports/` defines only what its
   consumers need — `MessageRepository` has two methods, `LineGateway` has two, `Logger` has
   three.  No leakage of SDK types across the boundary.

2. **Test coverage is broad for a foundation epoch.** Unit tests exist for every non-trivial
   component: the webhook parser, signature verifier, ingest handler, event processor,
   DynamoDB repository (integration), S3 archive, and LINE gateway.  The fixtures module is
   well-factored and reused across suites.  The integration test spins up real DynamoDB Local
   and exercises idempotency end-to-end.

3. **Infra IAM is genuinely least-privilege per Lambda.** Two separate roles with two separate
   inline policies — ingest can only send to SQS and read its one SSM parameter; processor has
   precisely the DynamoDB actions it needs.  No wildcard resources for compute actions.

---

## Patterns

Two recurring shortcuts are visible across this epoch's diff:

- **Adapters imported into the app layer.** Both `EventProcessor` (LINE webhook parser) and
  `handleIngest` (LINE SDK header constant, AWS lambda types) reach through the hexagonal
  boundary.  The pattern is "it's just a utility import" rationalisation — the import feels
  small, but it structurally ties the app layer to a specific adapter.

- **Shared configuration objects that grow optional fields.** `EnvSchema` and `commonEnv` both
  start broad-and-optional rather than per-component-strict.  This is a "I'll split it later"
  shortcut that forces runtime narrowing checks and type assertions downstream and tends to
  accumulate more optional fields over time rather than getting cleaned up.
