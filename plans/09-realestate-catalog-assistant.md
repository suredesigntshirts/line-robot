# 09 — Real-Estate Catalog Assistant (LINE bot, Claude-powered)

## Context
The line-robot echo bot is being repurposed into a **real-estate personal assistant**. It listens to
Thai/English chats, and from messages that trickle in across several turns it **extracts and catalogs
properties** (keyed by address/geo), keeps a **calendar of follow-ups** with push reminders, and lets
the **people in a chat pull up the listings they have access to** in LINE. Scope is deliberately
small: a catalog assistant + calendar/notifications, with light memory/learning. Cost matters —
Haiku 4.5 primary, escalate rarely, batch where possible.

This replaces the echo behavior at the existing `MessageHandler` seam but **adds a second,
scheduled pipeline** for the debounced ingestion (the echo/handler path stays for interactive
commands & UI taps).

**Scope & access (decided): membership-based, via edges — not a single partition.**
- **Write-scope is per conversation:** a property entry is created/updated in the context of one
  conversation, so two users discussing the same property in *separate* DMs keep *separate* entries,
  and a group discussion produces one *shared* entry. Ingestion dedup/matching only ever considers
  the *current* conversation's own properties.
- **Read-access follows the user:** anyone who is (or becomes) a member of a conversation where a
  property was discussed can pull it up — **including from a different chat**. So if user1 & user2
  discuss property#10 in a group, both can later retrieve property#10 in their own 1:1 DM with the
  bot. (An earlier conversationKey-only partition got this wrong — it would have hidden property#10
  from user1's DM.)
- Implemented with edges: a **Conv→Property** edge (write-scope, per-chat listing, dedup candidates)
  + a **User↔Conv membership** edge maintained from message senders and `memberJoined`/`memberLeft`
  events (which the domain already parses). "My listings" resolves user → their conversations →
  those conversations' properties, keeping access current as group membership changes.

---

## Key corrections to the original spec
- **Haiku 4.5 does not support `effort`** (400s). Run Haiku *plain* for extraction; the "effort"
  dial lives on the escalation model — **Sonnet 4.6 at `effort: "medium"`**. Opus 4.8 only as a
  last resort. (Models: `claude-haiku-4-5` $1/$5 per 1M; `claude-sonnet-4-6` $3/$15; both support
  vision + structured outputs.)
- **LINE reply tokens expire ~1 min** and are single-use. Debounced ingestion runs *after* the
  window, so confirmations/reminders must use **push** (gateway already supports `push`), never reply.

---

## Architecture — two pipelines

```
                 (existing)                    (new — processor does on every inbound)
 LINE webhook → ingest Lambda → SQS → processor ──────────────┐
                                       │                       │ • upsert conversation tracker
                                       │ interactive path      │   (lastInboundAt, pendingSince→GSI1)
                                       ▼                       │ • upsert User↔Conv membership edges
                          MessageHandler seam                  │ • EAGERLY fetch media (LINE Get
                   (commands, rich-menu/postback taps,         │   Content) → S3, key on msg record
                    "show my listings" → Flex reply)           ▼
                                                     Catalog DynamoDB table  +  S3 (json + media)
                                                              ▲   ▲                    │
   EventBridge cron (~1–2 min) → INGESTION Lambda ────────────┘   │  reads bytes ◀─────┘
     • GSI1 query → conversations with pendingSince ≤ now−debounce (5–10 min)
     • conditional claim (status/claimedAt) so two sweeps never double-ingest
     • batch msgs since lastIngestedAt (text + S3 media) → Claude parse(),
       upsert properties/contacts/events, advance lastIngestedAt, clear pendingSince,
       PUSH confirmation (reply token long expired)                │
                                                                   │
   EventBridge cron (~hourly) → REMINDER Lambda ───────────────────┘
     • GSI2 byDueDate query → events due soon, conditional-claim, LINE push reminder.
```

**Why a scheduled sweep, not per-message:** the messages table already stores every inbound
message (`adapters/dynamodb/messageRepository.ts`), so it *is* the ingestion buffer — no new
queue needed. A cron that ingests conversations gone quiet for the debounce window naturally
batches "a single property discussed across sequential chats," and is dirt cheap at low volume.
(Rejected: EventBridge Scheduler one-time schedule per conversation reset on each message — more
moving parts; DynamoDB TTL+Streams — deletion lag up to 48h, too imprecise.)

### Ingestion mechanics (decided)

**Eager media capture (processor, on every inbound).** LINE Get Content is short-lived and the sweep
runs minutes later, so the processor downloads any image/file binary immediately and writes it to S3,
recording the key on the message record. The sweep reads bytes from S3, never from LINE — so the
debounce can be generous (5–10 min) without racing content expiry.

**S3 layout — one folder per message:**
```
s3://<archive-bucket>/conv/<conversationKey>/<messageId>/
    event.json        # raw LINE webhook event (audit + re-extraction)
    content.<ext>     # binary media (jpg/png/pdf…), Content-Type set; only for media messages
```
- `messageId` (LINE's id) is unique + stable, so the key is *derivable* from `(conversationKey,
  messageId)` — no S3 listing needed. Add a `putMedia(ref, messageId, bytes, contentType)` sibling to
  `adapters/s3/rawArchive.ts` (same client/bucket). Store `{s3Key, contentType}` as an `attachment`
  attribute on the message record so the sweep knows which messages have media and where.
- An S3 **lifecycle rule** handles expiry (no date needed in the key). The existing audit path
  `raw/<date>/…json` can stay or fold into this scheme — reversible.

**Finding work (no scan).** On each inbound, the processor sets `pendingSince` on the conversation
tracker (only if unset) → the tracker appears in the sparse **GSI1 `pendingIngestion`**. The sweep
queries `gsi1pk = "PENDING" AND gsi1sk ≤ now−debounce` for the exact ready list.

**Never twice (concurrency-safe).** Before processing, the sweep does a **conditional claim**: set
`status=INGESTING, claimedAt=now` *only if* `status ≠ INGESTING OR claimedAt < now−staleTimeout`.
Atomic — if two sweeps race, one wins and the other skips; a crashed run is retried after the timeout.

**No loss, no duplicates (watermark).** The batch is "messages with `timestamp > lastIngestedAt`."
On success: advance `lastIngestedAt` to the newest message ingested, clear the claim, clear
`pendingSince` (drops out of GSI1). A message arriving *during* ingestion re-sets `pendingSince`, so
the next sweep picks up the remainder.

---

## Anthropic approach (TypeScript SDK `@anthropic-ai/sdk`)

**Extraction = one structured-output call, not an agent loop (cheapest).**
- **SDK (confirmed installed): `@anthropic-ai/sdk@^0.102.0`** in `packages/bot`; its peer-dep allows
  `zod ^4`, and the repo's `zod@4.4.3` works with the helper — verified end-to-end (schema gen +
  `.parse()` roundtrip incl. nullable/array). Import the helper from `@anthropic-ai/sdk/helpers/zod`.
- `client.messages.parse({ model: "claude-haiku-4-5", output_config: { format: zodOutputFormat(Schema) }, ... })`
  returns the validated object on **`response.parsed_output`** (nullable — guard it). Haiku 4.5
  supports structured outputs.
- **Schema design — use `.nullable()`, not `.optional()`.** The property has ~40 fields, most absent
  in any single message; structured outputs wants every property present, so model "not mentioned"
  as `z.<type>().nullable()` (model emits explicit `null`) rather than optional/missing keys — more
  deterministic and easier to diff.
- Input to the call: the batched messages (text), any images/docs as content blocks, **and the
  candidate existing properties for this conversation** so the model resolves *update-existing vs
  create-new* itself. Output schema = a list of `propertyUpdates`, each tagged
  `target: "new" | "existing:<id>"` with extracted fields + events + contacts. Code applies them.
- **Avoiding property mix-ups & stale references (decided):**
  - Instruct the model to first *segment the batch into per-property buckets*, then assign each.
  - The candidate set is **not "recent only"** — a user may reference a property discussed weeks ago,
    so provide the conversation's properties broadly (id / address / geo / project / aliases) as
    candidates for matching.
  - **Never auto-merge across ambiguity.** A geo-distance + normalized-address guardrail blocks
    merging two distinct properties; but most chat-described properties have *no* lat/long, so when
    the match is uncertain the bot **asks** via the P1 quick-reply ("New property, or the Thonglor
    plot?") rather than guessing. Default when unsure: create-new or ask. (This also produces labeled
    data for a smarter matcher later.)

**Vision / Thai chanote + photos.**
- **Fetch binaries eagerly in the processor (on message receipt), NOT at sweep time.** LINE
  **Get Content** (`GET api-data.line.me/v2/bot/message/{id}/content`) is short-lived; the debounced
  sweep runs minutes later, so the processor downloads the binary immediately and stores it to S3
  (see Ingestion mechanics → S3 layout). The sweep then reads bytes from S3, never from LINE — this
  removes the content-expiry race and lets the debounce be generous (5–10 min).
- At extraction time, send the S3 bytes to Claude as an `image` block (base64) or, for PDFs, a
  `document` block. Haiku 4.5 has vision; keep images at modest resolution to control image-token
  cost. Files API (beta) optional for reuse/re-extraction.

**Prompt caching (biggest cost lever).**
- Stable prefix (cache breakpoint after it): system prompt + extraction instructions + the property
  field taxonomy + Thai title-deed glossary + per-conversation **memory doc**. Volatile (after
  breakpoint): the new message batch + candidate properties. Haiku min cacheable prefix = 4096 tokens
  (our prefix exceeds it). Use `ttl: "1h"` when a conversation re-ingests within the hour. Verify via
  `usage.cache_read_input_tokens`.

**Batch API (50% off) — deferred/bulk only.**
- Recommended live path is a **synchronous** Haiku call (cheap; gives a near-real-time push
  confirmation). Reserve **Message Batches API** for non-interactive bulk jobs: history backfill,
  nightly re-extraction/normalization. (Batches finish <1h typically, max 24h — too slow for the
  per-conversation confirmation.)

**Escalation policy (Haiku → Sonnet 4.6 → Opus 4.8).** Escalate when Haiku reports low confidence,
ambiguous which-property match, conflicting fields, or hard chanote OCR. Sonnet 4.6 at
`effort: "medium"` + adaptive thinking. Log escalation rate to watch cost.

**Memory / learning (decided: in-prompt first; managed agents later if needed).**
- A small per-conversation memory doc (catalog-table item, sk `MEMORY`) holding durable context:
  known people, area aliases ("the Thonglor plot" → property id), terminology, preferences.
- **Approach:** do as much as possible in-prompt — inject the memory doc into the cached prefix, and
  (a) read it before extraction to seed candidates/aliases, and/or (b) let the model propose updates
  as a `memoryPatch` field *in the structured output*, applied code-side. A live `memory`-style tool
  call inside the same `parse()` is awkward (structured output constrains the whole response), so
  prefer the pre-read + `memoryPatch` pattern over an in-call tool.
- If/when memory + multi-step ambiguity resolution outgrows a one-shot call, escalate **that path
  only** to a **managed agent** (Anthropic hosts the loop + memory), keeping the common path cheap.
  Keep the doc bounded (size cap). No secrets / over-collection of PII.

---

## Data model — new dedicated `catalog` DynamoDB table
Separate from `messages` so it can carry the GSIs the calendar/access needs (the messages table is
pk/sk only). Single-table, ElectroDB (same lib as `messageRepository.ts`); generic `pk`/`sk`,
ElectroDB composes them per entity. Entities & access patterns:

- **Property** — pk `PROP#<propertyId>`, sk `META`; fields + `originConversationKey`, geo +
  normalized-address attributes for matching, `updatedAt`.
- **PropertyEvent (calendar)** — pk `PROP#<propertyId>`, sk `EVT#<dueIso>#<eventId>`; carries
  `notifyConversationKey`. Indexed by **GSI2 `byDueDate`** for the reminder sweep (keys below).
- **Contact** — pk `PROP#<propertyId>`, sk `CONTACT#<contactId>`.
- **Conv→Property edge** — pk `CONV#<conversationKey>`, sk `PROP#<propertyId>`. Powers ingestion
  dedup candidates (write-scope) and "listings discussed in *this* chat."
- **Conversation tracker** — pk `CONV#<conversationKey>`, sk `META`. Carries
  `{lastInboundAt, lastIngestedAt, pendingSince, status, claimedAt}` — written by the processor on
  each inbound and by the sweep. Indexed by **GSI1 `pendingIngestion`** (sparse) so the sweep finds
  work without a scan; `lastIngestedAt` is the ingest watermark; `status`/`claimedAt` are the claim
  lock (see Ingestion mechanics).
- **Memory doc** — pk `CONV#<conversationKey>`, sk `MEMORY`; bounded learned context.
- **User↔Conv membership edge** — pk `USER#<userId>`, sk `CONV#<conversationKey>`. Maintained from
  each inbound message's `source.userId` + `memberJoined`/`memberLeft` events. Powers "show *my*
  listings" across chats via **base-table queries only**: `USER#<userId>` (sk begins_with `CONV#`) →
  conversations, then each `CONV#<key>` (sk begins_with `PROP#`) → properties. No GSI needed for this.

Single-table key reuse is intentional: `PROP#<id>` holds `META` + `EVT#…` + `CONTACT#…`;
`CONV#<key>` holds `META` + `MEMORY` + `PROP#…`. Reads use `pk = X` + `sk begins_with Y`.

**GSIs (concrete keys):**
- **GSI1 `pendingIngestion`** (sparse, P1) — `gsi1pk = "PENDING"`, `gsi1sk = <pendingSince ISO8601>`.
  Only the Conversation tracker writes these, and only while it has un-ingested messages; cleared
  after a successful ingest so the item drops out of the index. Sweep query:
  `gsi1pk = "PENDING" AND gsi1sk ≤ <now − debounce>`. Project `conversationKey`, `lastIngestedAt`,
  `pendingSince` so the sweep needs no follow-up read. Start with the single constant `"PENDING"`
  partition (low volume is trivial for one partition); shard to `"PENDING#<n>"` + N-way fan-out only
  if write volume ever exceeds one partition.
- **GSI2 `byDueDate`** (P2) — `gsi2pk = "DUE"`, `gsi2sk = <dueIso>#<eventId>`. Only PropertyEvent
  writes these. Reminder sweep query: `gsi2pk = "DUE" AND gsi2sk BETWEEN <watermark> AND <now+window>`.
  Make sparse by clearing the GSI keys (or setting `notifiedAt`) once pushed; reuse the ingestion
  conditional-claim to avoid double-sends. Same single-partition-then-shard guidance as GSI1.
- **GSI3 `convMembers`** (inverse membership — **deferred**, only if a "who's in this chat" pattern is
  needed) — `gsi3pk = CONV#<conversationKey>`, `gsi3sk = USER#<userId>`. Not required for P1/P2;
  "my listings" uses the base-table queries above.

- Photos/chanote scans → **S3** (eager capture in the processor; layout under Ingestion mechanics).
  Store `{s3Key, contentType}` on the message record at ingest, and the resolved keys on the Property
  `photos[]` / `documents[]` after extraction.

Worked example (the access scenario): user1 & user2 chat about property#10 in `group#G` → one Property
`PROP#10`, a `CONV#group#G → PROP#10` edge, and membership edges `USER#user1 → CONV#group#G`,
`USER#user2 → CONV#group#G`. Later, user1 DMs the bot and taps "My Listings": resolve
`USER#user1` → {`group#G`, `user#user1`} → union their Conv→Property edges → property#10 shows up. ✅
A *separate* DM where user2 independently discusses the same real property creates a distinct
`PROP#…` (matching only looked at `user#user2`'s own edges), so it stays separate. ✅

**Property fields** (original list + recommended additions):
- Identity: `propertyId`, `normalizedAddress`, `rawAddresses[]`, `projectName`, `lat/long`,
  `googleMapsUrl`, `plusCode`, district/subdistrict(tambon)/province.
- Title/legal (Thailand): `titleDeedType` (Chanote/Nor Sor 3 Gor/…), `deedNumber`, `parcelNo`,
  `tenure` (freehold/leasehold), `foreignQuota` (condos), `zoning`, `encumbrances/mortgage`.
- Physical: `propertyType` (land/house/townhouse/condo/commercial/shophouse), `landArea`
  (rai-ngan-wah + sqm), `usableArea` sqm, `bedrooms`, `bathrooms`, `roadAccess`, `utilities`,
  `furnished`, `yearBuilt`, `condition`.
- Commercial: `askingPrice`, `offeredPrice`, `lastPrice`, `currency` (THB), `commissionPct`,
  `transferFeeSplit`, `status` (lead→researching→visited→negotiating→offer→under-contract→closed→dropped),
  `source/leadOrigin`.
- Collections: `photos[]`, `documents[]`, `contacts[]`, `events[]`, `pros[]`, `cons[]`,
  `notes[]`, `tags[]`, `createdAt/updatedAt/lastActivityAt`.

---

## LINE UI elements (phased; reuse `lineGateway`, extend `OutboundMessage` + webhook parser)
- **Push** — confirmations & reminders (reply token too short for the delayed path). Limits: 5 msgs/
  request, friend/7-day/in-group recipients, plan monthly quota.
- **Flex Message carousel** — property "cards" (hero photo, address/price/status, action buttons).
  Limits: ≤12 bubbles/carousel, bubble ≤30KB, carousel ≤50KB.
- **Quick replies** (≤13) — confirmations ("New property?" / "Update <addr>?"), filters.
- **Postback actions** + **datetime picker** — card buttons (view/edit, set follow-up date).
  Requires extending the parser to handle `postback` webhook events (today they fall into `other`
  and are dropped).
- **Rich menu** — persistent nav: My Listings / Upcoming / Search / Help. Image ≤1MB, 800–2500px.
- **LIFF** (later) — web app inside LINE for a richer catalog browser/editor.

Extensions needed in code: `OutboundMessage` union (add `flex`/quick-reply variants) +
`lineGateway.toSdkMessage`; webhook parser to emit `postback` events and to carry non-text payloads
(location lat/lng, image/file message ids) on `IncomingMessage` (currently only text is populated).

---

## Reused seams (don't rebuild)
- Handler seam: `core/handlers/registry.ts` `createDefaultMessageHandler()` →
  `new CompositeMessageHandler([…])`. **Today it's `[ new EchoHandler() ]` only.** P1 *removes*
  `EchoHandler` (echo no longer needed; delete it + its tests) and *adds* a new `CommandHandler`
  (commands / postback taps); `CompositeMessageHandler` is reused as-is.
- Persistence pattern: ElectroDB entity like `adapters/dynamodb/messageRepository.ts`;
  `findRecent(ref, limit)` for the batch; S3 archive (`adapters/s3/rawArchive.ts`) for binaries.
- Config/DI: SSM secret via `requireParameter` + `buildDeps()` (Anthropic key already parked as
  Pulumi config secret `anthropicApiKey`; wire SSM param + processor IAM per the earlier plan).
- Infra: new Lambdas + EventBridge crons + catalog table mirror the patterns in `infra/index.ts`.

## Phasing (decided: Core + rich LINE UI in P1)
- **P1 — Ingestion core + retrieval + rich UI:** catalog table (+ GSI1), conversation tracker,
  **eager media capture to S3 in the processor**, ingestion sweep Lambda (GSI1 find + conditional
  claim + watermark), Haiku structured extraction (text + images/chanote, `.nullable()` schema),
  property upsert + within-conversation dedup (ask-when-unsure), **push confirmation to the same
  chat**. Retrieval: "show listings / on <road> / upcoming" rendered as a **Flex carousel**;
  **rich menu** (My Listings / Upcoming / Search / Help); **quick-reply** new-vs-update /
  new-vs-existing confirmations; **postback** parsing for card buttons. Requires `OutboundMessage` +
  `lineGateway` Flex/quick-reply extension and webhook parser changes (postback events + non-text
  payloads: location lat/lng, image/file message ids). The processor also maintains the
  **conversation tracker + User↔Conv membership edges** on every inbound (and on
  `memberJoined`/`memberLeft`, currently ignored), and **removes `EchoHandler`** in favor of a new
  `CommandHandler`. Anthropic key SSM param + processor IAM wiring. (Note: the `registerLambdaContext`
  idempotency fix is already in the working tree — not P1 scope.)
- **P2 — Calendar & reminders:** PropertyEvent + reminder sweep Lambda → **push reminders to the
  source chat**; datetime-picker follow-up creation/editing from Flex cards.
- **P3 — Memory & polish:** per-conversation memory doc + escalation tuning; optional LIFF
  browser/editor web app.

## Cost strategy (summary)
Debounce → far fewer LLM calls (biggest saver) · Haiku 4.5 plain · prompt-cache the stable prefix ·
images only when present, modest resolution · escalate only on low confidence · Batch API for
backfills. Per the earlier estimate the AWS infra stays ~pennies; LLM spend dominated by Haiku at
~$1/$5 per 1M with cache reads at 0.1×.

## Verification
- Unit: extraction schema/Zod validation; dedup guardrail (two nearby-but-distinct properties don't
  merge; same property across messages does). Handler/registry tests like existing echo tests.
- Integration (staging): DM a multi-message property description (+ a chanote photo) → after the
  debounce window, a Property row appears with extracted fields, S3 has the image, a push
  confirmation arrives. Add a follow-up date → reminder Lambda pushes at the due time. Forged-sig
  403 + idempotency still hold.
- Cost check: inspect `usage` (cache_read_input_tokens > 0; escalation rate low) in logs.

## Decisions (confirmed)
1. **Catalog scope:** write-scope per conversation (separate DMs → separate entries; shared group →
   shared entry), **read-access per user via membership** (a user can pull up a group's property from
   their own DM; both group members keep access). Edge/membership model, not a single partition.
2. **Phase-1 surface:** Core ingestion/retrieval **+ rich LINE UI** (rich menu + Flex cards +
   quick-reply/postback).
3. **Confirmations:** **push to the same chat** after each ingest (e.g. "✅ Saved 123 Sukhumvit
   (updated)").
4. **Ingestion timing:** eager media capture in the processor → S3; debounced sweep (5–10 min) reads
   from S3/DynamoDB. A generous debounce is safe because nothing races LINE's content expiry.
5. **Sweep correctness:** sparse **GSI1** to find work, **conditional claim** (status/claimedAt) for
   at-most-one worker, **`lastIngestedAt` watermark** for no-loss / no-duplicate batching.
6. **Extraction schema:** `@anthropic-ai/sdk@^0.102.0` + `zod@4.x` (verified working);
   `messages.parse` → `parsed_output`; model fields as `.nullable()` (not `.optional()`).
7. **Dedup:** candidate set includes older properties; **never auto-merge across ambiguity**; **ask
   via quick-reply** (new vs existing) when uncertain.
8. **Memory:** in-prompt first (cached memory doc + pre-read + `memoryPatch` in the structured
   output); escalate the hard path to **managed agents** later if needed.
9. **Echo:** removed (no longer needed); replaced by `CommandHandler` for interactive commands.
