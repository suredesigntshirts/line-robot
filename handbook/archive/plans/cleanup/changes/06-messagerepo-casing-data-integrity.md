# 06 — Add casing:"none" to the ElectroDB message entity (silent GROUP-ID lowercasing)

> **Reconcile-pass note (queue 00).** Fully **independent** — no shared source files or symbols with
> units 01–05/07–09 (`messageRepository.ts` + two integration tests only; the `processor.ts`/`sweep.ts`/
> `ingestionSweep.ts`/`infra/index.ts` references in this spec are explicit **no-change** call-sites).
> Sequenced **FIRST** in the wave because it is deploy-urgent (data integrity): the longer it waits,
> the more likely a pre-existing group row turns the trivially-safe fix into a migration. Run the
> pre-deploy DynamoDB scan gate (this spec) before `pulumi up`.

## Goal & rationale
The `byConversation` index in `buildMessageEntity` (packages/bot/src/adapters/dynamodb/messageRepository.ts:48–51) omits `casing: "none"`, so ElectroDB applies its **default key casing (`lower`)** and silently lowercases the entire generated `pk`/`sk` string on every write. LINE GROUP IDs are case-sensitive and uppercase-`C`-prefixed (e.g. `CGroupIdABCD1234`), so a group message is stored under `pk = "$linerobot#conversationkey_group#cgroupidabcd1234"` instead of the case-preserved key. This is a latent data-integrity bug: any non-ElectroDB reader (raw `GetItem`/`Scan`, a future idempotency layer, a migration script) that builds the key from the original case-preserved `conversationKey` will miss the row. Every entity in `catalogRepository.ts` already sets `casing: "none"` for exactly this reason (see its header comment at line 31–33); the message entity is the lone outlier. This unit applies the one-line-per-key fix, adds a regression test that inspects the **raw stored pk** (the only assertion that actually catches the bug), and prescribes a pre-deploy scan so the rollout is safe.

Source findings: `plans/cleanup/00-master-plan.md` (P1 #9, Theme E/H; Execution-order note line 116 — "Confirm the impact with a scan before applying the fix"); `plans/cleanup/04-adapters-ai-storage.md` [F12]; `plans/cleanup/08-cross-cutting.md` (Theme: exemplary DynamoDB adapter — keep it consistent).

## Blast radius
- **Files created:** none.
- **Files modified:**
  - `packages/bot/src/adapters/dynamodb/messageRepository.ts` — inside `buildMessageEntity`, the `byConversation` index `pk` (line 49) and `sk` (line 50). Add `casing: "none"` to each. No other line changes. `MessageEntity`/`MessageItem` type aliases (lines 58–59) are re-derived automatically; `DynamoMessageRepository` and its three methods (`save`, `findRecent`, `findSince`) are unchanged; `createMessageRepository` unchanged.
  - `packages/bot/test/integration/dynamodb.integration.test.ts` — add `ScanCommand` to the existing `@aws-sdk/lib-dynamodb` import; add one regression test in the `DynamoMessageRepository` describe block (mixed-case group ID, raw-pk assertion + round-trip + `findSince`).
  - `packages/bot/test/integration/ingestionSweep.integration.test.ts` — add one end-to-end test using a mixed-case group `ConversationRef` through `save → touchConversation → sweep`/`findSince`.
- **Files deleted:** none.
- **All call-sites to update:** NONE require code changes — the entity-config change propagates through every instantiation automatically. Enumerated for completeness:
  - `packages/bot/src/lambda/processor.ts:67` — `new DynamoMessageRepository(doc, env.MESSAGES_TABLE)` (no change).
  - `packages/bot/src/lambda/sweep.ts:36` — `new DynamoMessageRepository(doc, env.MESSAGES_TABLE)` (no change).
  - `packages/bot/src/app/eventProcessor.ts:203` — `this.deps.repository.save(stored)` (no change).
  - `packages/bot/src/app/eventProcessor.ts:328` — `this.deps.repository.save({...})` (no change).
  - `packages/bot/src/app/ingestionSweep.ts:402` — `this.deps.messages.findSince(key, claimed.lastIngestedAt)` (no change; `key` comes from the catalog GSI1 scan whose tracker items are written raw as `CONV#<conversationKey>`, already case-preserved — so once the messages table is also case-preserved, both sides match).
  - `packages/bot/test/integration/dynamodb.integration.test.ts:103,136,160` — repo instantiations (no change beyond the added test).
  - `packages/bot/test/integration/ingestionSweep.integration.test.ts:175` — `messages = new DynamoMessageRepository(doc, MESSAGES_TABLE)` (no change beyond the added test).
- **Tests touched:**
  - UPDATE `packages/bot/test/integration/dynamodb.integration.test.ts` — add mixed-case group regression test (see Tests section).
  - UPDATE `packages/bot/test/integration/ingestionSweep.integration.test.ts` — add mixed-case group end-to-end test.
  - NO CHANGE: `test/unit/eventProcessor.test.ts`, `test/unit/ingestionSweep.test.ts`, `test/unit/conversation.test.ts` (all use in-memory mocks of `MessageRepository`; ElectroDB casing never runs).

## Current code
`packages/bot/src/adapters/dynamodb/messageRepository.ts` (lines 47–52, the only region that changes):
```ts
      indexes: {
        byConversation: {
          pk: { field: "pk", composite: ["conversationKey"] },
          sk: { field: "sk", composite: ["timestamp", "messageId"] },
        },
      },
```

The established pattern this mirrors — `packages/bot/src/adapters/dynamodb/catalogRepository.ts` (every entity sets `casing: "none"`, e.g. the `convProperty` `byConversation` index at lines 125–138):
```ts
      indexes: {
        byConversation: {
          pk: {
            field: "pk",
            composite: ["conversationKey"],
            template: "CONV#${conversationKey}",
            casing: "none",
          },
          sk: {
            field: "sk",
            composite: ["propertyId"],
            template: "PROP#${propertyId}",
            casing: "none",
          },
        },
      },
```
(The catalog entities also use a `template`; the message entity does NOT and must NOT add one — `casing` is independent of `template`. The fix is `casing` only.)

### Verified bug evidence (ElectroDB v3.9.x `.query.byConversation(...).params()`)
With `conversationKey: "group#CGroupIdABCD1234"`:
- **Current (no casing):** `:pk = "$linerobot#conversationkey_group#cgroupidabcd1234"` — lowercased.
- **After `casing:"none"`:** `:pk = "$linerobot#conversationKey_group#CGroupIdABCD1234"` — case preserved.

The default is `lower`: in `node_modules/electrodb/src/types.js`, `DefaultKeyCasing = KeyCasing.lower`, applied via `formatKeyCasing` (`src/util.js:133`) → `toLowerCase()` when no per-index `casing` is set. The `groupId`/`userId`/`roomId` *attributes* are written un-cased (attribute default is `none`), so `refFromItem`/`toStoredMessage` reconstruct `ref.groupId` correctly **even today** — which is exactly why the existing tests pass and why a round-trip assertion alone does NOT catch the bug. Only the raw `pk` string is corrupted.

## Target design
After-code for `messageRepository.ts` (lines 47–52):
```ts
      indexes: {
        byConversation: {
          // `casing: "none"` preserves case-sensitive LINE conversation ids (group ids are
          // uppercase `C…`-prefixed). ElectroDB's default key casing is `lower`, which would
          // otherwise silently lowercase the whole pk/sk — mirrors every entity in
          // catalogRepository.ts so messages and the raw-written CONV# tracker keys stay
          // byte-comparable.
          pk: { field: "pk", composite: ["conversationKey"], casing: "none" },
          sk: { field: "sk", composite: ["timestamp", "messageId"], casing: "none" },
        },
      },
```
No new exports. No port, domain, type-alias, or call-site signature changes. `MessageEntity = ReturnType<typeof buildMessageEntity>` and `MessageItem = EntityItem<MessageEntity>` are structurally identical before and after (casing is a runtime serialization concern, not a type-level one).

## Step-by-step implementation
1. **Edit `packages/bot/src/adapters/dynamodb/messageRepository.ts`.** Replace the `byConversation` block (lines 48–51):
   - Find:
     ```ts
         byConversation: {
           pk: { field: "pk", composite: ["conversationKey"] },
           sk: { field: "sk", composite: ["timestamp", "messageId"] },
         },
     ```
   - Replace with:
     ```ts
         byConversation: {
           // `casing: "none"` preserves case-sensitive LINE conversation ids (group ids are
           // uppercase `C…`-prefixed). ElectroDB's default key casing is `lower`, which would
           // otherwise silently lowercase the whole pk/sk — mirrors every entity in
           // catalogRepository.ts so messages and the raw-written CONV# tracker keys stay
           // byte-comparable.
           pk: { field: "pk", composite: ["conversationKey"], casing: "none" },
           sk: { field: "sk", composite: ["timestamp", "messageId"], casing: "none" },
         },
     ```
   - Do NOT add a `template`. Do NOT touch any other line in the file.

2. **Edit `packages/bot/test/integration/dynamodb.integration.test.ts` — import.** Change line 3:
   - Find: `import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";`
   - Replace: `import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";`

3. **Edit `packages/bot/test/integration/dynamodb.integration.test.ts` — add regression test.** Inside the `describe("DynamoMessageRepository", …)` block, after the existing `"scopes messages to their own conversation"` test (i.e. after line 175, before the block's closing `});` at line 176), add:
   ```ts
     // Regression guard for the silent GROUP-ID lowercasing bug (cleanup unit 06): LINE group ids
     // are case-sensitive and uppercase-`C`-prefixed. ElectroDB's default key casing is `lower`, so
     // without `casing: "none"` the stored pk is lowercased and unreachable by any non-ElectroDB
     // reader built from the original (case-preserved) conversationKey. The attribute round-trip is
     // NOT enough to catch this (groupId is stored un-cased), so we assert on the raw stored pk.
     it("preserves the case of a mixed-case LINE group id in the stored key", async () => {
       const repo = new DynamoMessageRepository(doc, MESSAGES_TABLE);
       const ref = {
         kind: "group",
         groupId: "CGroupIdABCD1234",
         senderUserId: "Usender",
       } as const;
       const key = "group#CGroupIdABCD1234";
       await repo.save({
         ref,
         messageId: "g1",
         direction: "in",
         contentType: "text",
         text: "hello",
         webhookEventId: "eg1",
         timestamp: 1000,
       });
       await repo.save({
         ref,
         messageId: "g2",
         direction: "in",
         contentType: "text",
         text: "world",
         webhookEventId: "eg2",
         timestamp: 2000,
       });

       // (1) The raw stored partition key must retain the uppercase group id — this is the
       //     assertion that fails on the unfixed entity (pk would be `…group#cgroupidabcd1234`).
       const scan = await doc.send(new ScanCommand({ TableName: MESSAGES_TABLE }));
       const groupRows = (scan.Items ?? []).filter(
         (i) => typeof i.pk === "string" && i.pk.includes("CGroupIdABCD1234"),
       );
       expect(groupRows).toHaveLength(2);
       const lowercased = (scan.Items ?? []).filter(
         (i) => typeof i.pk === "string" && i.pk.includes("cgroupidabcd1234"),
       );
       expect(lowercased).toHaveLength(0);

       // (2) findRecent still round-trips the ref correctly (was already true, kept as a guard).
       const recent = await repo.findRecent(ref, 10);
       expect(recent.map((m) => m.text)).toEqual(["world", "hello"]);
       expect(recent[0]?.ref).toEqual(ref);

       // (3) findSince with the case-preserved conversationKey finds the same messages — proving the
       //     raw-key read path (used by the ingestion sweep) matches the case-preserved write path.
       expect((await repo.findSince(key, 0)).map((m) => m.text)).toEqual(["hello", "world"]);
       expect((await repo.findSince(key, 1000)).map((m) => m.text)).toEqual(["world"]);
     });
   ```

4. **Edit `packages/bot/test/integration/ingestionSweep.integration.test.ts` — add end-to-end test.** Inside `describe("IngestionSweep (end-to-end on DynamoDB Local)", …)`, after the existing `"applies extraction…"` test (after line 324, before the block's closing `});` at line 325), add:
   ```ts
     it("ingests a mixed-case GROUP conversation end-to-end after the casing fix", async () => {
       const ref = { kind: "group", groupId: "CGroupXYZ7", senderUserId: "Umember" } as const;
       const key = "group#CGroupXYZ7";
       await arrive(ref, key, "gm1", 1000);
       await arrive(ref, key, "gm2", 1500);

       // findSince (the sweep's read path) must find both messages under the case-preserved key.
       expect((await messages.findSince(key, 0)).map((m) => m.text)).toEqual(["gm1", "gm2"]);

       clock.value = 3000;
       const swept = await makeSweep().run();
       // due=1 (the group conversation is past its quiet window) and both messages are batched —
       // proving the catalog tracker key (raw CONV#<key>) and the messages key now agree on case.
       expect(swept).toMatchObject({ due: 1, claimed: 1, ingested: 1, messages: 2 });
       expect((await catalog.getConversation(key))?.lastIngestedAt).toBe(1500);
     });
   ```
   - Note: `arrive()` (defined at line 182) already does `messages.save(stored)` + `catalog.touchConversation(key, timestamp)`, so this reuses the existing harness. `makeSweep()` uses `nullExtractor`, so `properties` is 0 and no push is asserted — this test focuses on the claim/watermark/key-match path with a group key.

## Tests
- **NEW (regression, bug fix)** `dynamodb.integration.test.ts` → `"preserves the case of a mixed-case LINE group id in the stored key"`. Pins: the raw stored `pk` retains `CGroupIdABCD1234` (fails on the unfixed entity, where pk is lowercased to `…cgroupidabcd1234`); `findRecent` round-trips `ref`; `findSince(key, …)` with the case-preserved key returns the right batch. This is the explicit guard for the **named data-integrity bug** (F12 / P1 #9). The raw-pk Scan assertion is load-bearing — a round-trip-only assertion passes even with the bug because the `groupId` *attribute* is stored un-cased.
- **NEW (end-to-end)** `ingestionSweep.integration.test.ts` → `"ingests a mixed-case GROUP conversation end-to-end after the casing fix"`. Pins: a group conversation flows through `save → touchConversation → run()` and is claimed/ingested with the correct watermark, confirming the messages-table key (now case-preserved) matches the catalog tracker key (always raw `CONV#<key>`, case-preserved). All existing sweep tests use `user#…` refs and would not exercise the group path.
- **UNCHANGED behaviour for every other test.** The three existing `DynamoMessageRepository` tests still pass (group `Cgroup1` test, `findSince` user test, scoping test) — their assertions are on `ref`/`text`, which were and remain correct. No unit test changes: `eventProcessor.test.ts`, `ingestionSweep.test.ts`, `conversation.test.ts` use mocks and never touch ElectroDB.

## Verification
```
npm run typecheck   # tsc across workspaces — expect clean (no type-level change)
npm run lint        # biome — expect clean (comment + casing key only)
npm run test        # vitest unit — expect green (no unit test touches this path)
npm --prefix packages/bot run test:integration   # DynamoDB Local (needs docker) — REQUIRED here
```
- `typecheck`/`lint`/`test` (unit): all must stay green; this change is type-invariant and touches no unit-tested code path.
- `test:integration` is the **decisive** check (this unit changes persistence). Expected: the two new tests pass with the fix applied; **the new `dynamodb` regression test (assertion 1, raw-pk Scan) FAILS if the `casing: "none"` edit is reverted** — that is the intended guard. Requires docker (DynamoDB Local). If docker is unavailable in the runner, state that and defer the integration run to a docker-capable environment; do not weaken the assertion to make it pass without docker.

### Pre-deploy rollout gate (one-time, before `pulumi up` reaches the messages table)
Because a write under the unfixed entity lands at a *lowercased* pk and a write under the fixed entity lands at a *case-preserved* pk, any pre-existing GROUP message becomes unreachable after the switch. The change is **trivially safe only if zero group messages already exist** in the target table. Run this read-only scan (line-robot profile has staging data-plane read) BEFORE deploying:
```bash
export AWS_PROFILE=line-robot
# MESSAGES_TABLE name: read it from the deployed stack output / Lambda env.
aws dynamodb scan \
  --table-name "<messages-table-name>" \
  --filter-expression "begins_with(pk, :p)" \
  --expression-attribute-values '{":p":{"S":"$linerobot#conversationkey_group#"}}' \
  --projection-expression "pk" \
  --region ap-southeast-1 --output json
```
- The prefix `"$linerobot#conversationkey_group#"` is the **lowercased** form ElectroDB writes today (entity `service:"linerobot"`, attribute `conversationKey`, value prefix `group#`). Any returned items are pre-existing group messages written under the buggy lowercased key.
- **Zero items → the fix is trivially safe; deploy.** (Expected on staging — Plan 13 records a blank-slate wipe; group messaging is new.)
- **Any items → STOP.** A back-fill is required before switching: for each returned item, copy it to the case-preserved key (`PutItem` with the un-cased pk reconstructed from the row's stored `groupId` attribute, then `DeleteItem` of the old row), or accept the loss only if the data is disposable. Do not deploy the entity change until the table is clean, or those rows orphan permanently. This back-fill is out of scope for this unit (it would be a separate one-off script) — this unit only prescribes the gate.

## Dependencies & ordering
- **No code dependency on any other change-unit.** This is a self-contained adapter-internal edit plus two integration tests. It does not share a file or symbol with units 01–05 of this cleanup wave.
- **Ordering recommendation (from the master plan, line 116): do this one EARLY and deploy it before group messaging accrues data.** The longer it waits, the more likely a pre-existing group message turns the trivially-safe fix into a migration. It can land independently and in parallel with the boundary/duplication units.
- **Shared-file note:** `messageRepository.ts` is not touched by any other listed unit (units 24/F12-adjacent touch `catalogRepository.ts`, a different file). The two integration test files are touched only here. No reconcile conflict expected.

## Risk & rollback
- **Primary risk — orphaned pre-existing group rows.** Fully mitigated by the pre-deploy scan gate above; if the scan returns zero group messages the fix is byte-safe. Internal consistency is preserved either way for the *current* code paths because `findRecent` and `findSince` both route through the same (now case-preserved) ElectroDB key path — the only exposure was external/raw readers, which is exactly what the fix closes.
- **sk casing — no-op today, correct for the future.** The sk composite is `[timestamp(number), messageId(string)]`; LINE messageIds are numeric strings and the model labels (`$message_1#timestamp_…`) are already lowercase, so `casing:"none"` on sk changes nothing for existing data (verified via `.params()`). Added for consistency and to be correct if messageId format ever gains uppercase.
- **Rollback.** Revert the one-line-per-key edit in `messageRepository.ts` (and the two test additions). Trivial. NOTE: rolling back AFTER any case-preserved group write has occurred re-introduces the orphaning problem in the other direction — so the same scan-gate discipline applies to a rollback. Prefer not to roll back once deployed with a clean table.
- **Anthropic 16-union limit — NOT touched.** This unit does not go near `claudeExtractor.ts`, any Zod schema, or `output_config.format`. Zero impact on the union/nullable budget; the regression test that counts unions stays green untouched.
- **Hexagonal layering — neutral/consistent.** `casing` is a pure DynamoDB-adapter serialization detail. The `MessageRepository` port, `core/domain/conversation.ts`, and all `app/`/`lambda/` code are unchanged. The fix makes the message adapter consistent with the catalog adapter — toward, never away from, the target architecture.
- **MINI App / infra — zero blast radius.** The miniapp has no DynamoDB/ElectroDB dependency; the messages table definition in `infra/index.ts` (`pk: S, sk: S`) is unchanged because `casing` is a client-side setting, not a table attribute. No Pulumi change.
