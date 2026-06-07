# LINE Adapter + Supporting Infrastructure Adapters — Code Quality Findings

## Summary

The adapters are largely clean and architecturally sound: the hexagonal boundary is respected (core
domain types cross the boundary in both directions; SDK types stay inside the adapter layer),
security-critical code is correct, and test coverage is meaningful for the cases that matter most.
The biggest concerns are a `parseRawEvent` function with an unsafe cast that is entirely untested,
a `QueuePublisher` port typed as `unknown[]` that loses all domain semantics at the port boundary,
and `S3RawArchive` combining two distinct responsibilities (archiving and media storage) in one
class that implements two unrelated ports. Several smaller issues — a hardcoded colour constant,
hard-to-check optional chaining in tests, a missing test for the SQS publisher, and the script
reaching directly for `process.env` instead of the `loadEnv` path — round out the findings.

---

## Findings

### [F01] `parseRawEvent` is an unsafe blind cast with no test coverage
**Severity:** high  
**File:** `packages/bot/src/adapters/line/webhookParser.ts:136-138`  
**Issue:** `parseRawEvent` casts `raw: unknown` directly to `webhook.Event` with no guard:
```ts
export function parseRawEvent(raw: unknown): InboundEvent {
  return toInboundEvent(raw as webhook.Event);
}
```
If SQS delivers a malformed payload (truncated JSON, a DLQ replay with unexpected shape, a message
accidentally enqueued by another producer), `toInboundEvent` will silently misparse it or throw a
runtime error deep inside a switch, with no useful error message. The function is also entirely
absent from `webhookParser.test.ts` — there is zero coverage of the SQS single-event path, which
is the hot path for every processed message.  
**Suggestion:** Add a Zod schema (or at minimum a `typeof`/property guard) that validates the bare
minimum fields (`type`, `source`, `webhookEventId`, `timestamp`) before passing to `toInboundEvent`,
and throw a descriptive `Error` on failure. Add at least one unit test covering the SQS-event path
(valid postback → `postback` event, invalid shape → throws).

---

### [F02] `QueuePublisher.publish` accepts `readonly unknown[]` — domain semantics lost at the port
**Severity:** medium  
**File:** `packages/bot/src/core/ports/runtime.ts:2-4`  
**Issue:** The port signature is `publish(events: readonly unknown[]): Promise<void>`. `SqsQueuePublisher`
then serialises each element with `JSON.stringify(event)` and the consumer later does
`raw as webhook.Event`. The type-erasure is complete: neither the port nor the publisher know what
they are carrying. Any call site can pass an arbitrary array without a compile-time error. The
identity of what flows through the queue — raw LINE webhook events — is expressed nowhere in types.  
**Suggestion:** Introduce a narrow wrapper type at the boundary:
```ts
export interface QueuePublisher {
  publish(events: readonly RawWebhookEvent[]): Promise<void>;
}
```
Where `RawWebhookEvent` is a branded `unknown` or, better, a `webhook.Event`-shaped interface kept
in the adapter layer (not the domain). Alternatively, keep `unknown` at the core port but tighten
`SqsQueuePublisher` to a generic `QueuePublisher<T>` so at least the call sites agree on T.

---

### [F03] `S3RawArchive` implements two unrelated ports — violation of single responsibility
**Severity:** medium  
**File:** `packages/bot/src/adapters/s3/rawArchive.ts:30`  
**Issue:** `S3RawArchive implements RawArchive, MediaReader`. `RawArchive` is the write side
(webhook JSON archiving + media ingestion). `MediaReader` is the read side (ingestion sweep reads
back media for extraction). They share an S3 client and bucket, but nothing else: different callers,
different Lambda roles, different lifecycle. Coupling them in one class means every consumer that
needs only reading (the sweep Lambda) must instantiate an object carrying the full archive write
surface.  
**Suggestion:** Extract a separate `S3MediaReader` class (5–8 lines, trivial) that holds the same
client + bucket and implements only `MediaReader.getMedia`. Each port then has a dedicated
implementor. The factory `createRawArchive` stays; add `createMediaReader` alongside it.

---

### [F04] Hardcoded hex colour literals scattered across `lineGateway.ts`
**Severity:** low  
**File:** `packages/bot/src/adapters/line/lineGateway.ts:78,85,96,97`  
**Issue:** Raw hex colour strings appear four times inside `toBubble`:
`"#888888"` (subtitle), `"#1DB446"` (headline/price — LINE brand green), `"#aaaaaa"` (row label),
`"#555555"` (row value), `"#999999"` (notes). These have no names, so the visual intent
(e.g. "muted", "accent", "price") is invisible to the reader, and updating the palette requires
hunting through function bodies.  
**Suggestion:** Collect them as named constants at the top of the file (or a `theme.ts` sibling):
```ts
const COLOUR_TITLE_MUTED = "#888888";
const COLOUR_ACCENT_GREEN = "#1DB446";
const COLOUR_ROW_LABEL   = "#aaaaaa";
const COLOUR_ROW_VALUE   = "#555555";
const COLOUR_NOTE        = "#999999";
```
Names make the intent reviewable; a future palette change is a one-line edit.

---

### [F05] `toFlexContainer` and `toImageCarousel` duplicate the single-vs-carousel dispatch logic
**Severity:** low  
**File:** `packages/bot/src/adapters/line/lineGateway.ts:139-141,161-163`  
**Issue:** Both functions contain the same idiom:
```ts
return bubbles.length === 1 && bubbles[0] !== undefined
  ? bubbles[0]
  : { type: "carousel", contents: bubbles };
```
This is a three-line copy/paste. If LINE changes the single-item rule, or if the `undefined`
guard logic evolves, both must be updated in sync.  
**Suggestion:** Extract a small helper:
```ts
function wrapBubbles(bubbles: messagingApi.FlexBubble[]): messagingApi.FlexContainer {
  return bubbles.length === 1 && bubbles[0] !== undefined
    ? bubbles[0]
    : { type: "carousel", contents: bubbles };
}
```
Both callers become one-liners.

---

### [F06] `SqsQueuePublisher` throws a vague error on partial failure — lost diagnostics
**Severity:** low  
**File:** `packages/bot/src/adapters/queue/sqsPublisher.ts:32-34`  
**Issue:**
```ts
throw new Error(`Failed to enqueue ${result.Failed.length} message(s) to SQS`);
```
The `Failed` array from SQS contains `{ Id, Code, Message, SenderFault }` per entry — the `Code`
and `Message` tell you whether the failure was throttling, a permission error, or a bad payload. Discarding all of that makes on-call triage harder; the log only shows a count.  
**Suggestion:** Include the first failure's `Code` and `Message` in the thrown error:
```ts
const first = result.Failed[0];
throw new Error(
  `Failed to enqueue ${result.Failed.length} SQS message(s): ${first?.Code} — ${first?.Message}`
);
```

---

### [F07] No unit tests for `SqsQueuePublisher`
**Severity:** medium  
**File:** `packages/bot/src/adapters/queue/sqsPublisher.ts` (no test file found)  
**Issue:** The SQS publisher has no test file at all. The batching logic (`chunk`), the batch-failure
throw path, and multi-batch iteration are all untested. The `chunk` helper — whose correctness is
critical for not dropping events — is a private function with no coverage. Given that SQS delivery
is the bridge between ingest and processing, a silent batching bug would be hard to notice.  
**Suggestion:** Add `packages/bot/test/unit/sqsPublisher.test.ts` using `aws-sdk-client-mock`
(already used in `rawArchive.test.ts`). Cover: single batch, multi-batch (> 10 events), partial
failure throws, empty input is a no-op.

---

### [F08] `setup-rich-menu.ts` reads `process.env` directly instead of going through `loadEnv`
**Severity:** low  
**File:** `packages/bot/scripts/setup-rich-menu.ts:25-37`  
**Issue:** The script checks `process.env.LINE_CHANNEL_ACCESS_TOKEN` and `process.env.LIFF_URL`
directly, bypassing the validated `loadEnv()` path used by every Lambda. This is a script, not a
Lambda, so the env schema does not apply one-to-one — but the pattern means there is no consistent
place that documents which env vars the script expects, and a missing `LINE_CHANNEL_ACCESS_TOKEN`
gives a plain `throw new Error` rather than a structured validation message. The comment in CLAUDE.md
also instructs users to set the var via a subshell `$(cd infra && pulumi config get …)` which works
but is fragile (cwd-dependent).  
**Suggestion:** Define a small `z.object({ LINE_CHANNEL_ACCESS_TOKEN: z.string().min(1), LIFF_URL:
z.string().url().optional() })` at the top of the script and call `.parse(process.env)` to validate
and document the script's requirements in one place.

---

### [F09] `lineTokenVerifier.ts` — `exp` boundary uses `<=` which rejects tokens expiring in the current millisecond
**Severity:** low  
**File:** `packages/bot/src/adapters/line/lineTokenVerifier.ts:66`  
**Issue:**
```ts
if (typeof payload.exp !== "number" || payload.exp * 1000 <= this.clock.now()) {
```
`<=` means a token is rejected when `exp * 1000 == now()` — i.e. the token expires at exactly the
current millisecond. In practice this is harmless (sub-millisecond window), but `<` is the
conventional JWT check (`exp` means "valid *until* this second", inclusive). The asymmetry is a
potential source of confusion during code review.  
**Suggestion:** Change `<=` to `<` for semantic correctness and to match standard JWT semantics.
The existing test at line 65–68 uses `exp: 1` (well in the past) and would still pass.

---

### [F10] `webhookParser.ts` — `contentType` is cast from string without narrowing
**Severity:** low  
**File:** `packages/bot/src/adapters/line/webhookParser.ts:29`  
**Issue:**
```ts
contentType: content.type as MessageContentType,
```
`content.type` from the SDK is a string union that includes `"sticker"`, `"audio"`, `"video"`, and
other values. `MessageContentType` currently covers all of them, but the cast suppresses the
compiler's ability to warn if a new SDK event type is added that the domain type doesn't yet list.
The domain type and the SDK type may diverge silently.  
**Suggestion:** Add a narrowing assertion or a compile-time exhaustiveness guard. At minimum, assert
that the set of values is a subset at the type level using `satisfies`, or use a mapping object
that forces explicit handling of each SDK message type. If a new type arrives, the code will then
fail at compile time rather than silently passing through.

---

### [F11] `rawArchive.test.ts` missing a test for `getMedia`
**Severity:** low  
**File:** `packages/bot/test/unit/rawArchive.test.ts`  
**Issue:** The test file covers `put` and `putMedia` but not `getMedia`. The "missing body" error
path in `rawArchive.ts:71-73` is completely untested, as is the success path. Since `getMedia` is
the read side used by the ingestion sweep, a regression there would silently cause extraction to
fail with an obscure error.  
**Suggestion:** Add two tests: one where the mock returns a body (verify the result is the expected
`Buffer`), and one where the mock returns `Body: undefined` (verify the descriptive error is
thrown). `aws-sdk-client-mock` supports mocking `GetObjectCommand`.

---

### [F12] `richMenu.ts` — `RICH_MENU_TABS` export exposes the 4-tab baseline but silently excludes the Catalog tab
**Severity:** low  
**File:** `packages/bot/src/adapters/line/richMenu.ts:67`  
**Issue:**
```ts
export const RICH_MENU_TABS: readonly string[] = [...BASE_BEFORE, HELP_TAB].map((t) => t.label);
```
The export name `RICH_MENU_TABS` suggests "all tabs", but it is actually the 4-tab (no Catalog)
baseline. The test at `richMenu.test.ts:35` asserts `RICH_MENU_TABS` equals
`["My Listings", "Upcoming", "Search", "Help"]` — which documents the current value but does not
alert a future developer that a fifth tab exists. If `RICH_MENU_TABS` is used to generate a
placeholder image, the 5-tab version will be rendered incorrectly.  
**Suggestion:** Rename to `BASE_RICH_MENU_TABS` or `DEFAULT_RICH_MENU_TABS`, and add a JSDoc
comment noting it is the no-Catalog variant. Alternatively, accept `liffUrl` as an argument and
derive the tab labels from `tabsFor(liffUrl)` so it matches whatever `buildRichMenu` would produce.

---

### [F13] `lineGateway.test.ts` uses optional chaining in assertions — hides missing fields
**Severity:** low  
**File:** `packages/bot/test/unit/lineGateway.test.ts` (multiple lines, e.g. 86, 154)  
**Issue:** Several test assertions use optional chaining inside `expect`:
```ts
expect(sent.quickReply.items[0].action).toMatchObject({ … });
expect(firstMessage(client.replyMessage).contents.footer.contents[0].action).toMatchObject(…);
```
These chains will not throw if an intermediate property is `undefined` — they will produce
`undefined`, and `expect(undefined).toMatchObject(…)` will fail with a cryptic "received undefined"
rather than "footer is undefined". This makes test failures harder to diagnose.  
**Suggestion:** Use `expect(sent.quickReply).toBeDefined()` and `expect(sent.quickReply.items).toHaveLength(…)`
as intermediate assertions before drilling into `.items[0].action`, or wrap the access in the
`must()` helper already defined in `webhookParser.test.ts`.

---

## Cross-cutting patterns

**Pattern 1 — Factory functions are inconsistent.** `rawArchive.ts` exports both a class (`S3RawArchive`) and a factory (`createRawArchive`). `mediaUrlSigner.ts` exports only the class (`S3MediaUrlSigner`) with no factory. `sqsPublisher.ts` exports both. `lineGateway.ts` exports classes and two separate factory functions (`createLineMessagingGateway`, `createLineContentClient`). There is no consistent convention: some adapters use factories as the canonical construction path, others leave the class as the public surface. Pick one (factory-only is preferable for injection points — it hides the class name from callsites) and apply it uniformly.

**Pattern 2 — S3 adapters are appropriately thin but share no abstraction.** `mediaUrlSigner.ts` and `rawArchive.ts` both accept `(client: S3Client, bucket: string)`. There is no shared `S3AdapterBase` or config record. This is fine at two adapters, but if a third S3 adapter is added, a small `interface S3Config { client: S3Client; bucket: string }` would reduce repetition and make constructor signatures uniform.

**Pattern 3 — Security-critical code (`signatureVerifier.ts`, `lineTokenVerifier.ts`) is simple and correct.** Both delegate the cryptographic heavy lifting to well-audited libraries (`@line/bot-sdk`'s `validateSignature`, LINE's own verify endpoint), add clear defensive guards (empty string check, audience/expiry re-validation), and are well-tested. This is the right posture.

**Pattern 4 — `unknown` as a seam type appears in two different places with different intent.** `QueuePublisher.publish(events: readonly unknown[])` uses `unknown` to mean "the domain doesn't care what this is" (deliberately opaque). `parseRawEvent(raw: unknown)` uses `unknown` to mean "we received something off the wire and haven't validated it yet". Both need different handling: the publisher's `unknown` is acceptable (though improvable per F02); the parser's `unknown` must be validated before use (F01). The same type is doing two jobs and the unsafe one is the one that bites.
