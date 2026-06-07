# 02 — Close the 3 app->adapter boundary violations (WebhookParser, SignatureVerifier, HttpRequest/Response ports) + validate parseRawEvent

> **Reconcile-pass note (queue 00).** This unit defines the new ports that **unit 07 (CatalogRepository
> split) hard-depends on** — land **02 before 07**. Recommended land order for the files it shares:
> - Land **08 before 02** for the lambda entry points (`ingest.ts`/`read-api.ts`/`processor.ts`): unit
>   08 first unifies the cold-start skeleton (`lazySingleton` + imported `SYSTEM_CLOCK`), then this
>   unit adds `toHttpRequest`/handler-signature mapping on top. (08's spec agrees: "landing this unit
>   [08] first is cleaner.")
> - On `app/readApiHandler.ts`, this unit retypes the request/response **seam** (`json`/`bearerToken`/
>   `handle*`/`handleReadApi` → `HttpRequest`/`HttpResponse`). Units 03 (photo helpers), 04
>   (`UpcomingItem`), 09 (logger on `presign*`) touch **other** regions of the same file. Recommended
>   order **02 → 04 → 09 → 03 → 07** so each rebases its import block onto the prior.
> - This unit adds `isPermanentError` to the `LineGateway` port; if any later unit relocates
>   `LineGateway`, it must preserve that method. This unit does NOT create a per-port directory — new
>   ports are flat files (`core/ports/webhookParser.ts` etc.), which is why unit 07's port-layout open
>   question resolves to "keep the single `core/ports/catalog.ts`" (Option A).

## Goal & rationale

Three `app/` files reach across the hexagonal boundary into adapters / AWS types, the only architectural
violations in an otherwise clean dependency graph: `eventProcessor.ts` imports `parseRawEvent` +
`isPermanentLineError` from adapter files; `ingestHandler.ts` types its verifier dep as the concrete
`SignatureVerifier` class and imports a LINE-SDK constant; `readApiHandler.ts` accepts/returns raw
`APIGatewayProxyEventV2` / `APIGatewayProxyResultV2` throughout its internals. This unit defines the
missing ports (`WebhookParser`, `SignatureVerifier`, `HttpRequest`/`HttpResponse`), adds
`isPermanentError` to the `LineGateway` port, and pushes all AWS/LINE type mapping down into `lambda/`.
It also fixes the high-severity `parseRawEvent` blind-cast bug (currently `raw as webhook.Event`, zero
tests) by adding Zod structural validation and direct unit tests. Sources: `plans/cleanup/00-master-plan.md`
P1 #5/#6/#7/#10 + Theme B; `plans/cleanup/09-epoch-design-debt.md` refactor #2 + pattern #2 + legacy
"Epoch A"; `plans/cleanup/03-app-lambda.md` F01/F02; `plans/cleanup/05-adapters-line-infra.md` F01;
`plans/cleanup/08-cross-cutting.md` F06/F07.

## Blast radius

- **Files created:**
  - `packages/bot/src/core/ports/webhookParser.ts` — `WebhookParser` port (`parse(raw): InboundEvent`).
  - `packages/bot/src/core/ports/signatureVerifier.ts` — `SignatureVerifier` port (`verify(rawBody, signature)`).
  - `packages/bot/src/core/ports/httpGateway.ts` — provider-agnostic `HttpRequest` / `HttpResponse` types.

- **Files modified (with regions):**
  - `packages/bot/src/core/ports/lineGateway.ts` — add `isPermanentError(error: unknown): boolean` to the `LineGateway` interface.
  - `packages/bot/src/adapters/line/webhookParser.ts` — add a Zod `EventBase` guard inside `parseRawEvent` (lines 136-138); add an exported `LineWebhookParser` class implementing the `WebhookParser` port; add `import { z }`.
  - `packages/bot/src/adapters/line/signatureVerifier.ts` — `class SignatureVerifier implements SignatureVerifierPort`; add `export const LINE_SIGNATURE_HEADER` re-export of the SDK constant (line 7-16).
  - `packages/bot/src/adapters/line/lineGateway.ts` — add an `isPermanentError` method to `LineMessagingGateway` that delegates to the existing module-level `isPermanentLineError` (keep the standalone export for the gateway's own test); lines 31-38, 189-205.
  - `packages/bot/src/app/eventProcessor.ts` — drop the two adapter imports (lines 1-2); add `parser: WebhookParser` to `EventProcessorDeps`; call `this.deps.parser.parse(...)` (line 155) and `this.deps.gateway.isPermanentError(...)` (line 313).
  - `packages/bot/src/app/ingestHandler.ts` — drop the `@line/bot-sdk` + `aws-lambda` + concrete-`SignatureVerifier` imports (lines 1-3); type `verifier` against the port; replace `APIGatewayProxyEventV2` param with `HttpRequest` and `APIGatewayProxyResultV2` return with `HttpResponse`; `rawBodyOf` reads `request.rawBody` (no base64/header logic).
  - `packages/bot/src/app/readApiHandler.ts` — drop the `aws-lambda` import (line 12); `json()` returns `HttpResponse`; `bearerToken()` takes `HttpRequest`; `handleReadApi` takes `HttpRequest` returns `HttpResponse`; all four `handle*` helpers return `HttpResponse`.
  - `packages/bot/src/lambda/ingest.ts` — map `APIGatewayProxyEventV2` → `HttpRequest` (read header + decode base64 here using `LINE_SIGNATURE_HEADER`); map `HttpResponse` → `APIGatewayProxyResultV2`.
  - `packages/bot/src/lambda/read-api.ts` — map `APIGatewayProxyEventV2` → `HttpRequest`; map `HttpResponse` → `APIGatewayProxyResultV2`.
  - `packages/bot/src/lambda/processor.ts` — add `parser: new LineWebhookParser()` to the `EventProcessor` deps (line 65-75).

- **Files deleted:** none.

- **All call-sites to update (file:line):**
  - `packages/bot/src/app/eventProcessor.ts:1` — `import { isPermanentLineError }` → removed.
  - `packages/bot/src/app/eventProcessor.ts:2` — `import { parseRawEvent }` → removed.
  - `packages/bot/src/app/eventProcessor.ts:155` — `parseRawEvent(payload.raw)` → `this.deps.parser.parse(payload.raw)`.
  - `packages/bot/src/app/eventProcessor.ts:313` — `isPermanentLineError(error)` → `this.deps.gateway.isPermanentError(error)`.
  - `packages/bot/src/app/ingestHandler.ts:1-3` — three imports replaced (port + `HttpRequest`/`HttpResponse`).
  - `packages/bot/src/app/ingestHandler.ts:8` — `verifier: SignatureVerifier` → port type.
  - `packages/bot/src/app/ingestHandler.ts:13-18` — `rawBodyOf(event: APIGatewayProxyEventV2)` → `request.rawBody`.
  - `packages/bot/src/app/ingestHandler.ts:32-36` — `handleIngest` signature + header read.
  - `packages/bot/src/app/readApiHandler.ts:12,54,63,121,138,152,194-195` — all AWS-type references.
  - `packages/bot/src/lambda/ingest.ts:2,29-31` — type imports + handler mapping.
  - `packages/bot/src/lambda/read-api.ts:4,45-47` — type imports + handler mapping.
  - `packages/bot/src/lambda/processor.ts:17,65-75` — import `LineWebhookParser`; add `parser` dep.

- **Tests touched (add/update):**
  - `packages/bot/test/unit/webhookParser.test.ts` — ADD a `describe("parseRawEvent")` block (validation cases). `import { parseRawEvent }` from the same module.
  - `packages/bot/test/unit/eventProcessor.test.ts` — add `parser` to the `deps` factory (line 58-150); the `raw: null` drop test stays green via the injected parser.
  - `packages/bot/test/unit/ingestHandler.test.ts` — `event()` helper returns `HttpRequest` (drops `as unknown as APIGatewayProxyEventV2`, moves the base64 decode into the helper); verifier can stay the concrete class (it satisfies the port) — only the input type changes.
  - `packages/bot/test/unit/readApiHandler.test.ts` — `event()` returns `HttpRequest`; `body()` reads from `HttpResponse`.
  - `packages/bot/test/unit/lineGateway.test.ts` — UNCHANGED (the `isPermanentLineError` standalone export stays; its 3 tests keep importing it from `adapters/line/lineGateway.js`).
  - `packages/bot/test/unit/signatureVerifier.test.ts` — UNCHANGED (the adapter keeps its `verify` shape).

## Current code

`packages/bot/src/app/eventProcessor.ts` (imports + the two call-sites):
```ts
import { isPermanentLineError } from "../adapters/line/lineGateway.js";
import { parseRawEvent } from "../adapters/line/webhookParser.js";
// ...
export interface EventProcessorDeps {
  readonly archive: RawArchive;
  // ... (no parser today)
  readonly gateway: LineGateway;
  readonly logger: Logger;
  readonly clock: Clock;
}
// ...
    try {
      event = parseRawEvent(payload.raw);          // line 155
// ...
      if (isPermanentLineError(error)) {            // line 313
```

`packages/bot/src/app/ingestHandler.ts` (whole file is small):
```ts
import { LINE_SIGNATURE_HTTP_HEADER_NAME } from "@line/bot-sdk";
import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import type { SignatureVerifier } from "../adapters/line/signatureVerifier.js";
import type { Logger, QueuePublisher } from "../core/ports/runtime.js";
import type { EventPayload } from "./eventProcessor.js";

export interface IngestDeps {
  readonly verifier: SignatureVerifier;
  readonly publisher: QueuePublisher;
  readonly logger: Logger;
}

function rawBodyOf(event: APIGatewayProxyEventV2): string {
  if (event.body === undefined) return "";
  return event.isBase64Encoded ? Buffer.from(event.body, "base64").toString("utf8") : event.body;
}
// ...
export async function handleIngest(
  deps: IngestDeps,
  event: APIGatewayProxyEventV2,
): Promise<APIGatewayProxyResultV2> {
  const signature = event.headers?.[LINE_SIGNATURE_HTTP_HEADER_NAME];
  const rawBody = rawBodyOf(event);
  if (!deps.verifier.verify(rawBody, signature)) { /* 403 */ }
  // ...
}
```

`packages/bot/src/adapters/line/webhookParser.ts:136-138` (the blind cast — F01):
```ts
export function parseRawEvent(raw: unknown): InboundEvent {
  return toInboundEvent(raw as webhook.Event);
}
```

`packages/bot/src/adapters/line/lineGateway.ts:31-38` (the predicate to expose via the port):
```ts
export function isPermanentLineError(error: unknown): boolean {
  return (
    error instanceof HTTPFetchError &&
    error.status >= 400 && error.status < 500 && error.status !== 429
  );
}
```

`packages/bot/src/app/readApiHandler.ts` (the AWS-typed seams):
```ts
import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
function json(statusCode: number, body: unknown): APIGatewayProxyResultV2 { /* ... */ }
function bearerToken(event: APIGatewayProxyEventV2): string { /* event.headers */ }
export async function handleReadApi(deps, event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> {
  const method = event.requestContext?.http?.method ?? "GET";
  const path = (event.rawPath ?? "/").replace(/\/+$/, "") || "/";
  // ...
}
```

## Target design

The hexagonal target (matches master-plan P1 #5/#6/#7 prescriptions verbatim): the app layer depends
only on `core/ports` interfaces + `core/domain` types; adapters implement the ports; `lambda/` owns ALL
AWS/LINE-SDK type translation.

### New port: `core/ports/webhookParser.ts`
```ts
import type { InboundEvent } from "../domain/events.js";

/** Parses a single raw LINE webhook event (one SQS payload) into a provider-agnostic
 * {@link InboundEvent}. Throws on a structurally malformed payload — the processor catches,
 * logs, and drops (a malformed event re-throws identically on every redelivery). */
export interface WebhookParser {
  parse(raw: unknown): InboundEvent;
}
```

### New port: `core/ports/signatureVerifier.ts`
```ts
/** Verifies the LINE `x-line-signature` HMAC over the RAW request body. The app's ingest
 * handler depends on this port; the LINE-SDK-backed implementation lives in the adapter. */
export interface SignatureVerifier {
  verify(rawBody: string | Buffer, signature: string | undefined): boolean;
}
```

### New port: `core/ports/httpGateway.ts`
```ts
/** A provider-agnostic inbound HTTP request, mapped from the Lambda Function URL event at the
 * `lambda/` boundary so the app handlers stay transport-agnostic (no aws-lambda types). */
export interface HttpRequest {
  readonly method: string;
  /** Path after the host, trailing slash NOT yet normalized. */
  readonly path: string;
  /** Header names are lower-cased by the caller; values may be undefined. */
  readonly headers: Record<string, string | undefined>;
  /** The already-decoded (base64-resolved) raw body, or "" when absent. */
  readonly rawBody: string;
}

/** A provider-agnostic HTTP response — structurally a subset of APIGatewayProxyResultV2
 * (statusCode + optional headers + body), so the lambda maps it back with a plain return. */
export interface HttpResponse {
  readonly statusCode: number;
  readonly headers?: Record<string, string>;
  readonly body: string;
}
```

### Extended port: `core/ports/lineGateway.ts`
```ts
import type { OutboundMessage } from "../domain/message.js";

/** Outbound side of the LINE Messaging API: reply (token-based) and push (id-based). */
export interface LineGateway {
  reply(replyToken: string, messages: OutboundMessage[]): Promise<void>;
  push(to: string, messages: OutboundMessage[]): Promise<void>;
  /** Whether a delivery failure is permanent (re-sending can never succeed → drop, don't retry).
   * Keeps the LINE HTTPFetchError check inside the adapter; the app stays SDK-free. */
  isPermanentError(error: unknown): boolean;
}
```

### Adapter: `adapters/line/signatureVerifier.ts`
```ts
import { LINE_SIGNATURE_HTTP_HEADER_NAME, validateSignature } from "@line/bot-sdk";
import type { SignatureVerifier as SignatureVerifierPort } from "../../core/ports/signatureVerifier.js";

/** The lower-cased LINE signature header name. Re-exported from the SDK so the lambda wiring
 * reads it here (adapter layer) instead of the app layer importing @line/bot-sdk. */
export const LINE_SIGNATURE_HEADER = LINE_SIGNATURE_HTTP_HEADER_NAME;

export class SignatureVerifier implements SignatureVerifierPort {
  constructor(private readonly channelSecret: string) {}

  verify(rawBody: string | Buffer, signature: string | undefined): boolean {
    if (signature === undefined || signature === "") return false;
    return validateSignature(rawBody, this.channelSecret, signature);
  }
}
```

### Adapter: `adapters/line/webhookParser.ts` — Zod guard + port class
Add at top: `import { z } from "zod";` and the port import. Add a module-level schema that mirrors the
SDK `EventBase` (only the fields `toInboundEvent` actually reads at the top level), then validate before
the cast. The type-specific nested payloads (`message`, `postback`, `joined`, `left`) stay loose via
`z.unknown()` / passthrough, because `toInboundEvent` already null-guards them per branch and the SDK's
own union is far wider than we narrow. (NOTE: this Zod schema is a pure runtime guard — it is NEVER
passed to `zodOutputFormat`, so the Anthropic 16-union cap does not apply.)
```ts
/** Minimal structural guard for a raw LINE event — the {@link webhook.EventBase} fields
 * {@link toInboundEvent} actually depends on. Per-type payloads (`message`/`postback`/members)
 * stay loose: each `toInboundEvent` branch already null-guards them, and over-tight validation
 * would drop valid events whose optional fields the SDK union allows to vary. NOT an extraction
 * schema — never passed to zodOutputFormat (Anthropic 16-union cap does not apply). */
const RawEventSchema = z
  .object({
    type: z.string().min(1),
    webhookEventId: z.string().min(1),
    timestamp: z.number(),
    // source/message/postback/joined/left are read per-branch and individually guarded.
  })
  .passthrough();

/** Parse a single raw LINE event (e.g. one SQS message payload) into an {@link InboundEvent}.
 * Validates the structural minimum first, throwing a descriptive ZodError on a malformed shape
 * (truncated JSON, DLQ replay, foreign producer) rather than silently misparsing deeper in. */
export function parseRawEvent(raw: unknown): InboundEvent {
  const parsed = RawEventSchema.parse(raw);
  return toInboundEvent(parsed as unknown as webhook.Event);
}

/** Port-shaped wrapper so the app's EventProcessor depends on {@link WebhookParser}, not this module. */
export class LineWebhookParser implements WebhookParser {
  parse(raw: unknown): InboundEvent {
    return parseRawEvent(raw);
  }
}
```

### Adapter: `adapters/line/lineGateway.ts` — expose the predicate on the gateway
Keep the existing `export function isPermanentLineError` (its own gateway test imports it directly).
Add a method on the class that delegates:
```ts
export class LineMessagingGateway implements LineGateway {
  constructor(private readonly client: LineApiClient) {}
  async reply(/* unchanged */) {}
  async push(/* unchanged */) {}
  isPermanentError(error: unknown): boolean {
    return isPermanentLineError(error);
  }
}
```

### App: `ingestHandler.ts` (after)
```ts
import type { HttpRequest, HttpResponse } from "../core/ports/httpGateway.js";
import type { Logger, QueuePublisher } from "../core/ports/runtime.js";
import type { SignatureVerifier } from "../core/ports/signatureVerifier.js";
import type { EventPayload } from "./eventProcessor.js";

export interface IngestDeps {
  readonly verifier: SignatureVerifier;
  readonly publisher: QueuePublisher;
  readonly logger: Logger;
}

function extractRawEvents(rawBody: string): Array<{ webhookEventId?: unknown }> {
  const parsed = JSON.parse(rawBody) as { events?: unknown };
  return Array.isArray(parsed.events) ? (parsed.events as Array<{ webhookEventId?: unknown }>) : [];
}

export async function handleIngest(deps: IngestDeps, request: HttpRequest): Promise<HttpResponse> {
  const signature = request.headers["x-line-signature"];
  const rawBody = request.rawBody;
  if (!deps.verifier.verify(rawBody, signature)) {
    deps.logger.warn("rejected webhook with invalid signature");
    return { statusCode: 403, body: "invalid signature" };
  }
  const rawEvents = extractRawEvents(rawBody);
  if (rawEvents.length === 0) return { statusCode: 200, body: "OK" };
  const payloads: EventPayload[] = rawEvents.map((raw) => ({
    webhookEventId: typeof raw.webhookEventId === "string" ? raw.webhookEventId : "",
    raw,
  }));
  await deps.publisher.publish(payloads);
  deps.logger.info("enqueued webhook events", { count: payloads.length });
  return { statusCode: 200, body: "OK" };
}
```
The old `rawBodyOf` (base64 + header) is deleted from the app — its logic moves to `lambda/ingest.ts`.
The header lookup `request.headers["x-line-signature"]` uses the lower-cased literal (the lambda
lower-cases header keys when building the `HttpRequest`); the SDK constant is referenced only in the
lambda via `LINE_SIGNATURE_HEADER`.

### App: `readApiHandler.ts` (after — signatures only; bodies unchanged)
- `import type { HttpRequest, HttpResponse } from "../core/ports/httpGateway.js";` replaces the `aws-lambda` import.
- `json(statusCode, body): HttpResponse` (body shape `{ statusCode, headers, body }` is already structurally an `HttpResponse`).
- `bearerToken(request: HttpRequest): string` reads `request.headers` (already a `Record<string,string|undefined>`; the existing `headers.authorization ?? headers.Authorization` fallback stays — the lambda passes lower-cased keys, but keeping the fallback is harmless and preserves behavior).
- `handleMyProperties` / `handlePropertyDetail` / `handleUpcoming` return `Promise<HttpResponse>`.
- `handleReadApi(deps, request: HttpRequest): Promise<HttpResponse>` reads `request.method` and `request.path` (instead of `event.requestContext.http.method` / `event.rawPath`); the trailing-slash normalization stays.

### Lambda: `lambda/ingest.ts` (after)
```ts
import { SQSClient } from "@aws-sdk/client-sqs";
import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { loadChannelSecret, loadEnv } from "../adapters/config/config.js";
import { LINE_SIGNATURE_HEADER, SignatureVerifier } from "../adapters/line/signatureVerifier.js";
import { SqsQueuePublisher } from "../adapters/queue/sqsPublisher.js";
import { handleIngest, type IngestDeps } from "../app/ingestHandler.js";
import type { HttpRequest } from "../core/ports/httpGateway.js";
import { PowertoolsLoggerAdapter } from "../lib/logger.js";

// buildDeps / getDeps unchanged.

function toHttpRequest(event: APIGatewayProxyEventV2): HttpRequest {
  const body =
    event.body === undefined
      ? ""
      : event.isBase64Encoded
        ? Buffer.from(event.body, "base64").toString("utf8")
        : event.body;
  // Only the signature header is needed; pass it under the canonical lower-cased name.
  return {
    method: event.requestContext?.http?.method ?? "POST",
    path: event.rawPath ?? "/",
    headers: { [LINE_SIGNATURE_HEADER]: event.headers?.[LINE_SIGNATURE_HEADER] },
    rawBody: body,
  };
}

export async function handler(event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> {
  return handleIngest(await getDeps(), toHttpRequest(event));
}
```
`HttpResponse` (`{ statusCode, body }`) is structurally assignable to `APIGatewayProxyResultV2`, so the
direct `return` type-checks without a cast. NOTE: API Gateway / Function URL header keys may arrive in
mixed case, but the LINE Function URL lower-cases them; `event.headers?.[LINE_SIGNATURE_HEADER]` matches
the existing behavior at `ingestHandler.ts:36`, so this is byte-for-byte equivalent.

### Lambda: `lambda/read-api.ts` (after)
```ts
import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import type { HttpRequest } from "../core/ports/httpGateway.js";
// ... existing imports ...

function toHttpRequest(event: APIGatewayProxyEventV2): HttpRequest {
  const headers: Record<string, string | undefined> = {};
  for (const [k, v] of Object.entries(event.headers ?? {})) headers[k.toLowerCase()] = v;
  return {
    method: event.requestContext?.http?.method ?? "GET",
    path: event.rawPath ?? "/",
    headers,
    rawBody: event.body ?? "",
  };
}

export async function handler(event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> {
  return handleReadApi(await getDeps(), toHttpRequest(event));
}
```
The handler lower-cases header keys, so `bearerToken`'s `headers.authorization` path resolves regardless
of inbound casing (preserving today's `authorization ?? Authorization` behavior). `HttpResponse` →
`APIGatewayProxyResultV2` returns directly (structural subset; the existing `json()` already emits
`{ statusCode, headers: { "content-type": ... }, body }`).

### Lambda: `lambda/processor.ts` (after — add the parser dep)
```ts
import { LineWebhookParser } from "../adapters/line/webhookParser.js";
// ...
  const processor = new EventProcessor({
    archive: new S3RawArchive(s3, env.ARCHIVE_BUCKET),
    parser: new LineWebhookParser(),
    repository: new DynamoMessageRepository(doc, env.MESSAGES_TABLE),
    catalog,
    // ... rest unchanged
  });
```

### App: `eventProcessor.ts` (after — deps + call-sites)
```ts
import type { WebhookParser } from "../core/ports/webhookParser.js";
// (drop the two adapter imports)

export interface EventProcessorDeps {
  readonly archive: RawArchive;
  readonly parser: WebhookParser;
  readonly repository: MessageRepository;
  // ... rest unchanged
}
// ...
    try {
      event = this.deps.parser.parse(payload.raw);
// ...
      if (this.deps.gateway.isPermanentError(error)) {
```

## Step-by-step implementation

1. **Create `packages/bot/src/core/ports/webhookParser.ts`** with the `WebhookParser` interface (see Target design). Import `InboundEvent` from `../domain/events.js`.

2. **Create `packages/bot/src/core/ports/signatureVerifier.ts`** with the `SignatureVerifier` interface (single `verify` method). No imports needed.

3. **Create `packages/bot/src/core/ports/httpGateway.ts`** with `HttpRequest` and `HttpResponse` interfaces (see Target design). No imports needed.

4. **Edit `packages/bot/src/core/ports/lineGateway.ts`**: add `isPermanentError(error: unknown): boolean;` to the `LineGateway` interface (after `push`).

5. **Edit `packages/bot/src/adapters/line/signatureVerifier.ts`**:
   - Change line 1 import to `import { LINE_SIGNATURE_HTTP_HEADER_NAME, validateSignature } from "@line/bot-sdk";`.
   - Add `import type { SignatureVerifier as SignatureVerifierPort } from "../../core/ports/signatureVerifier.js";`.
   - Add `export const LINE_SIGNATURE_HEADER = LINE_SIGNATURE_HTTP_HEADER_NAME;`.
   - Change `export class SignatureVerifier {` → `export class SignatureVerifier implements SignatureVerifierPort {`. Body unchanged.

6. **Edit `packages/bot/src/adapters/line/webhookParser.ts`**:
   - Add `import { z } from "zod";` and `import type { WebhookParser } from "../../core/ports/webhookParser.js";` (biome will sort: the `zod` import goes after the SDK import; the port import goes with the other `../../core/...` imports).
   - Add the `RawEventSchema` constant (above `parseWebhook`, near the other module-level code).
   - Replace `parseRawEvent` body (lines 136-138) with the validated version (see Target design).
   - Add the `LineWebhookParser` class after `parseRawEvent`.

7. **Edit `packages/bot/src/adapters/line/lineGateway.ts`**: add the `isPermanentError` method to `LineMessagingGateway` (delegates to the existing `isPermanentLineError`). Keep the standalone `export function isPermanentLineError` exactly as-is.

8. **Edit `packages/bot/src/app/eventProcessor.ts`**:
   - Delete lines 1-2 (the two adapter imports).
   - Add `import type { WebhookParser } from "../core/ports/webhookParser.js";` (biome sorts it among the `../core/ports/*` imports).
   - Add `readonly parser: WebhookParser;` to `EventProcessorDeps` (immediately after `archive`).
   - Line 155: `event = parseRawEvent(payload.raw);` → `event = this.deps.parser.parse(payload.raw);`.
   - Line 313: `if (isPermanentLineError(error)) {` → `if (this.deps.gateway.isPermanentError(error)) {`.

9. **Edit `packages/bot/src/app/ingestHandler.ts`**: replace the whole file with the "after" version in Target design (drop `rawBodyOf`, retype `IngestDeps.verifier` + `handleIngest`, read header via `request.headers["x-line-signature"]`). `extractRawEvents` and the payload-mapping logic are unchanged.

10. **Edit `packages/bot/src/app/readApiHandler.ts`**:
    - Line 12: replace the `aws-lambda` import with `import type { HttpRequest, HttpResponse } from "../core/ports/httpGateway.js";` (sort among `../core/...`).
    - `json(...)`: return type `HttpResponse`.
    - `bearerToken(event: APIGatewayProxyEventV2)` → `bearerToken(request: HttpRequest)`; rename the local uses `event` → `request` (only reads `.headers`).
    - `handleMyProperties` / `handlePropertyDetail` / `handleUpcoming`: return type `Promise<HttpResponse>`.
    - `handleReadApi(deps, event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2>` → `handleReadApi(deps, request: HttpRequest): Promise<HttpResponse>`; inside, `const method = request.method;` and `const path = (request.path ?? "/").replace(/\/+$/, "") || "/";`. Update the `bearerToken(event)` call to `bearerToken(request)`.

11. **Edit `packages/bot/src/lambda/ingest.ts`**: add the `toHttpRequest` mapper and the `HttpRequest` + `LINE_SIGNATURE_HEADER` imports; change the import of `SignatureVerifier` to also import `LINE_SIGNATURE_HEADER`; change `handler` to call `handleIngest(await getDeps(), toHttpRequest(event))`. Keep `APIGatewayProxyEventV2`/`ResultV2` imports.

12. **Edit `packages/bot/src/lambda/read-api.ts`**: add the `toHttpRequest` mapper + `HttpRequest` import; change `handler` to `handleReadApi(await getDeps(), toHttpRequest(event))`. Keep the AWS-type imports.

13. **Edit `packages/bot/src/lambda/processor.ts`**: add `import { LineWebhookParser } from "../adapters/line/webhookParser.js";` (sort with the other `../adapters/line/*` imports) and add `parser: new LineWebhookParser(),` to the `EventProcessor` deps object.

14. Run `npm run lint` (biome will re-sort imports) then `npm run typecheck`.

## Tests

Functionality stays behaviourally identical. One explicit **bug fix** is called out: `parseRawEvent`
gains structural validation (master-plan P1 #10 / 05-adapters F01) — the external contract is preserved
(it still throws on bad input; `EventProcessor` still logs + drops).

1. **`packages/bot/test/unit/webhookParser.test.ts`** — add `parseRawEvent` to the import and a new block:
   ```ts
   describe("parseRawEvent", () => {
     it("round-trips a valid single postback event", () => {
       const ev = JSON.parse(fx.webhookBody([fx.postbackEvent({ data: "action=x" })])).events[0];
       const parsed = parseRawEvent(ev);
       expect(parsed.kind).toBe("postback");
     });
     it("round-trips a valid text message event", () => {
       const ev = JSON.parse(fx.webhookBody([fx.textMessageEvent({ text: "hi" })])).events[0];
       expect(parseRawEvent(ev).kind).toBe("message");
     });
     it("throws on null / non-object input", () => {
       expect(() => parseRawEvent(null)).toThrow();
       expect(() => parseRawEvent("nope")).toThrow();
       expect(() => parseRawEvent(42)).toThrow();
     });
     it("throws when the type field is missing", () => {
       expect(() => parseRawEvent({ webhookEventId: "e1", timestamp: 1 })).toThrow();
     });
     it("throws when webhookEventId is missing", () => {
       expect(() => parseRawEvent({ type: "message", timestamp: 1 })).toThrow();
     });
     it("throws when timestamp is the wrong type", () => {
       expect(() => parseRawEvent({ type: "message", webhookEventId: "e1", timestamp: "x" })).toThrow();
     });
   });
   ```
   Pins: valid events parse; structurally-malformed payloads throw (was the untested hot path).

2. **`packages/bot/test/unit/eventProcessor.test.ts`** — in the `deps` object inside `makeProcessor` (line 58-150), add `parser: { parse: (raw) => parseRawEvent(raw) },` and `import { parseRawEvent } from "../../src/adapters/line/webhookParser.js";` at the top. This wires the real parser so every existing test (and the `raw: null` drop test at line 373) keeps its current behavior — `parseRawEvent(null)` now throws a `ZodError`, still caught by `process`'s try/catch → logged + dropped. The existing assertions (`spies.errors` length 1, `spies.archived` length 0) stay green.

3. **`packages/bot/test/unit/ingestHandler.test.ts`** — change `event()` to build an `HttpRequest`:
   ```ts
   import type { HttpRequest } from "../../src/core/ports/httpGateway.js";
   function event(body: string, signature?: string, isBase64Encoded = false): HttpRequest {
     const rawBody = isBase64Encoded ? Buffer.from(body).toString("base64") : body;
     return {
       method: "POST",
       path: "/",
       headers: signature === undefined ? {} : { "x-line-signature": signature },
       rawBody: isBase64Encoded ? Buffer.from(rawBody, "base64").toString("utf8") : rawBody,
     };
   }
   ```
   The base64-decode test still exercises a base64 round-trip end-to-end (the helper now decodes,
   mirroring what the lambda does). `new SignatureVerifier(SECRET)` stays — the concrete class satisfies
   the port, so `IngestDeps.verifier` accepts it; drop nothing else. Remove the `aws-lambda` import.

4. **`packages/bot/test/unit/readApiHandler.test.ts`** — change `event()` to return `HttpRequest` and `body()` to read `HttpResponse`:
   ```ts
   import type { HttpRequest, HttpResponse } from "../../src/core/ports/httpGateway.js";
   function event(method: string, path: string, headers: Record<string, string> = {}): HttpRequest {
     return { method, path, headers, rawBody: "" };
   }
   function body(res: HttpResponse): unknown { return JSON.parse(res.body); }
   ```
   All ~10 call-sites stay (they pass `(method, path, headers)`); the `as { statusCode }` casts on the
   results can stay or be replaced with `HttpResponse`. Behavior is identical.

5. **`packages/bot/test/unit/lineGateway.test.ts`** — UNCHANGED. The standalone `isPermanentLineError`
   export remains; its 3 tests keep passing. (Optionally a future unit could also assert
   `gateway.isPermanentError` delegates, but that is out of scope here.)

6. **`packages/bot/test/unit/signatureVerifier.test.ts`** — UNCHANGED.

## Verification
```
npm run typecheck   # tsc across workspaces — expect clean
npm run lint        # biome — expect clean (it re-sorts the changed imports)
npm run test        # vitest unit — expect all green, incl. the new parseRawEvent block
```
Integration tests are NOT required: this unit touches no persistence (DynamoDB/S3) code — only the
in-memory port/handler boundary. Skip `npm --prefix packages/bot run test:integration`.

Expected result: green typecheck/lint/test. The new `parseRawEvent` tests add ~6 cases; all existing
tests pass unchanged in behavior.

## Dependencies & ordering

- **No hard dependency on other change-units.** This is master-plan P1 #5/#6/#7/#10 and is sequenced
  first in the cleanup ("P1 #5 and #6 before #7" — all three land together here since they share the
  port-extension pattern and the same `lambda/` wiring touch).
- **Shared files / coordinate with other units:**
  - `core/ports/runtime.ts` — this unit does NOT touch it (the scout's map listed it as a possible
    home for the verifier port; we put the port in its own file instead, so no conflict). A later unit
    that makes `QueuePublisher` generic (master-plan #32/F12) edits `runtime.ts` independently.
  - `core/ports/lineGateway.ts` — this unit adds `isPermanentError`. If a later unit splits/relocates
    LineGateway, it must preserve this method.
  - `lambda/processor.ts` — this unit adds the `parser` dep; the F18 "lazySingleton/SYSTEM_CLOCK"
    cleanup also edits this file. Land order is flexible; the edits are in different regions.
  - `app/readApiHandler.ts` — also targeted by the photo-helper extraction unit (F01) and the
    upcoming-rows extraction unit (F02). Those touch helper bodies, not the request/response seam this
    unit changes — low conflict, but if both land, reconcile the import block.
- Land this unit **before** the CatalogRepository split (P2 #12), per the master plan ("once the
  injection points are narrowed, the smaller interfaces become immediately usable").

## Risk & rollback

- **Anthropic 16-union cap:** NOT at risk. The new `RawEventSchema` Zod object is a pure runtime guard,
  never passed to `zodOutputFormat`/`output_config.format`. `claudeExtractor.ts` is untouched, and its
  union-count regression test (`claudeExtractor.test.ts:114-170`) is unaffected.
- **Layering:** all three violations are removed and none re-introduced. The one subtlety — keeping the
  `HTTPFetchError` check inside the adapter via `LineGateway.isPermanentError` rather than moving the
  predicate to `core/` — is deliberate: moving an SDK-type check into `core/` would be a NEW
  wrong-direction violation (core importing the SDK). The app now calls the predicate through the port.
- **Behavioral risk — header casing:** the read-api lambda now lower-cases header keys before building
  `HttpRequest`; `bearerToken` keeps its `authorization ?? Authorization` fallback, so behavior is
  preserved for any casing. The ingest lambda forwards only the `x-line-signature` header under the
  canonical lower-cased name (matching the SDK constant), identical to today's `event.headers?.[...]`.
- **Behavioral risk — `parseRawEvent` strictness:** the schema validates ONLY `type`/`webhookEventId`/
  `timestamp` and `.passthrough()`es everything else, so it cannot drop valid `leave`/`memberLeft`
  events (which lack a reply token) — those still flow through `toInboundEvent`'s per-branch guards.
  The `raw: null` processor test now throws a `ZodError` instead of a `TypeError`, but both are caught
  and dropped identically; `String(error)` still logs.
- **Rollback:** revert the commit. The change is self-contained in `packages/bot`; no infra/Pulumi, no
  schema, no persistence. `git revert` restores the prior imports cleanly. No deploy-order coupling.
