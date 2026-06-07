# 10 — Deferred infra: GSI3 (inverse membership) + Batch API

> **Status: NOT BUILT — intentionally deferred (decided 2026-06-07).**
> This is a "why & when" document, not a build order. Neither piece has a consumer in the code
> today, so building either now would add cost and complexity for zero benefit (and unused infra
> rots). This doc captures *what they are, the concrete future features that would need them, the
> signal that tells us "now it's time," and a build sketch* — so picking them up later is cheap
> instead of re-deriving the context.

## Why this document exists

Plan 09 (the catalog assistant) listed two pieces of infrastructure as **"build only if needed"** and
we left them out:

1. **GSI3 `convMembers`** — a second index that would let us ask *"who are the members of this
   conversation?"*
2. **The Anthropic Batch API** — a cheaper, asynchronous way to run *lots* of extractions at once.

When they came up during the P2/P3 work, there was nothing in the product that actually used either
one. Building unused infrastructure is the opposite of what we want (it costs money on every write,
adds code paths nobody exercises, and quietly drifts out of sync with everything else). So we
deferred them — but deferring without writing down *why* means re-learning all this later. Hence this
doc.

**The one-line rule for both: don't build them speculatively. Build each the first time a real
feature needs it. This doc tells you what that feature looks like.**

---

## Background you need first (how the catalog works today)

A 30-second recap so the rest makes sense.

The catalog is one DynamoDB table. The relevant relationships are stored as **one-directional
"edges"** (rows whose key encodes a relationship):

- **Membership edge** — `USER#<userId>` → `CONV#<conversationKey>`. Answers *"which conversations is
  this user a member of?"* Written on every inbound message (the sender) and on join/leave events.
- **Conv→Property edge** — `CONV#<conversationKey>` → `PROP#<propertyId>`. Answers *"which properties
  were discussed in this conversation?"*

"**Show my listings**" walks these forward: user → their conversations (membership edges) → those
conversations' properties (Conv→Property edges). Read-access "follows the user" this way, with no
reverse lookups needed.

**Extraction** (turning chat into property records) runs **synchronously**: the debounced ingestion
sweep calls Claude once per conversation and waits for the answer so it can push an immediate
"✅ Saved …" confirmation. This is the right design for the *live* path — low latency, instant
feedback.

Both deferred items are about doing something the current one-directional, synchronous design can't
do cheaply.

---

## Item 1 — GSI3 `convMembers` (inverse membership index)

### What it is, in plain terms

Membership is stored in **one direction only**: `USER#<id>` → `CONV#<key>`. That's perfect for "which
chats is *this user* in," but it cannot answer the reverse — **"who is in *this chat*?"** — without
scanning the entire table (slow and expensive, and gets worse as data grows).

GSI3 would index the *same* membership edges the *other* way:

```
gsi3pk = CONV#<conversationKey>
gsi3sk = USER#<userId>
```

Query `gsi3pk = CONV#<key>` → the list of that conversation's members, instantly.

### Why we don't have it yet

Nothing in the product asks "who's in this chat?". "My listings" only needs the user→conversation
direction we already have. Adding GSI3 means **every membership write also writes a second index
entry** — extra cost on a hot path (membership is touched on every inbound message) — for an index
**no code reads**.

### Concrete features that would need it (the triggers)

Watch for any of these on the roadmap; the first one to land is the signal to build GSI3:

1. **Per-member notifications / DM fan-out.** Today reminders push to the *conversation* (the group
   chat). If we ever want to remind or notify each member *individually* (e.g., DM every agent in a
   group their own copy of a follow-up), we must enumerate the conversation's members → GSI3.
2. **A "who can see this?" / sharing display.** "Show everyone in this group who has access to these
   listings," or an access panel. Listing a conversation's people needs CONV → USER → GSI3.
   - ⚠️ *Accuracy note:* answering "who can see **property X**" needs **two** reverse lookups —
     first property → conversations (a Property→Conv reverse index we also don't have; merge today is
     "local-conversation only, no inverse index"), then conversations → members (GSI3). GSI3 is
     necessary but not sufficient for the property-centric version. It *is* sufficient for the
     conversation-centric version ("members of this chat").
3. **Admin / audit / support.** "List all members of conversation Y" for a support console or
   debugging.
4. **Conversation-scoped cleanup.** If a conversation is deleted, enumerate its members to tidy up
   their edges — needs CONV → USER.

### Cost / benefit

- **Cost:** one extra GSI on the catalog table. PAY_PER_REQUEST, so it's a per-write charge on each
  membership upsert/delete (which happen on every inbound message's sender + each join/leave) plus
  storage. At current volume this is pennies. The real cost is an index with **no reader = dead
  weight** that can silently drift.
- **Benefit:** O(1) "members of a conversation" instead of a full-table scan — a hard prerequisite
  for any member-enumeration feature.

### Build sketch (when triggered)

1. **Infra** (`infra/index.ts`): add `gsi3pk`/`gsi3sk` string attributes + a `gsi3` index to the
   catalog table — mirrors the existing GSI1/GSI2 blocks. Within the `linerobot-*` deploy wildcards,
   so **no deploy-policy-version change**. (DynamoDB adds one GSI per `UpdateTable`; it backfills the
   index over existing data, a few minutes at this size.)
2. **Repository** (`adapters/dynamodb/catalogRepository.ts`): the membership ElectroDB entity already
   has a `byUser` index — add a second index `byConversation` writing `gsi3pk = CONV#<key>`,
   `gsi3sk = USER#<id>`. ElectroDB writes *both* index keys automatically on every `upsert`/`delete`,
   so the write path needs no other change.
3. **Port + method:** add `listConversationMembers(conversationKey): Promise<string[]>` that queries
   GSI3.
4. **Backfill caveat:** existing membership rows won't carry `gsi3` keys until they're rewritten. Two
   options: (a) accept that GSI3 only covers *new/rewritten* edges — active members re-message
   frequently, so it self-populates; or (b) run a one-time rewrite of all `USER→CONV` edges (itself a
   bulk job — see Item 2, and "How they relate" below). For most uses, (a) is fine.
5. **IAM:** the reading Lambda needs `dynamodb:Query` on the index — already covered by the existing
   `${catalogTable.arn}/index/*` wildcards. No new grant.

### Decision rule

> Build GSI3 the first time a feature needs to **enumerate the people in a conversation**. Until
> then, don't.

---

## Item 2 — Batch API (Anthropic Message Batches) for bulk extraction

### What it is, in plain terms

Extraction today is **synchronous**: the sweep calls Claude and waits, because it wants to push an
immediate "✅ Saved …" reply. That's correct for the *live* path.

The Anthropic **Message Batches API** is a *different* tool for a *different* job: submit many
extraction requests at once, let them run **asynchronously** (typically done within an hour, max 24h),
and pay **50% of the normal token price**. It's built for high-volume work where you don't need an
instant answer.

### Why we don't have it yet

There's no bulk job to run. The live sweep handles steady-state ingestion fine. Batch only earns its
keep when you have a *large pile* of extractions to do at once and can afford to wait.

### Concrete jobs that would need it (the triggers)

1. **History backfill on onboarding.** A new group/account already has months of chat sitting in the
   messages table. Re-extracting that whole backlog into properties could be thousands of
   conversations — synchronous would be slow and full-price. Batch, overnight, at half price, is the
   right tool.
2. **Re-extraction after a schema or prompt change.** If we add property fields, improve the glossary,
   or change the extraction prompt, we may want to re-run extraction over existing source messages to
   backfill the new fields across all properties. A scheduled batch job.
3. **Re-extraction after a model upgrade.** Re-process to lift data quality with a better model,
   cheaply and without touching the live path.
4. **One-off migrations.** Any "re-derive X for every property" pass.

### Cost / benefit

- **Cost:** a separate code path — build batch requests, submit, poll for completion, apply results —
  plus somewhere to run it (a one-off script or a scheduled Lambda). Moderate complexity.
- **Benefit:** ~50% token savings on bulk work, doesn't block or slow the live path, and handles
  volume the synchronous path can't (rate limits, latency, sheer count).

### Build sketch (when triggered)

1. A new entrypoint (script or scheduled Lambda) that selects what to (re)process — e.g., all
   conversations in the messages table, or properties last extracted before a schema version.
2. Build a batch of `messages.parse`-shaped requests, each tagged `custom_id = conversationKey`.
   **Reuse the existing pure builders** `buildExtractionSystem` + `buildExtractionContent` (already
   exported from `claudeExtractor.ts`) so the batch prompt can't drift from the live one.
3. Submit via `client.messages.batches.create({ requests })`; poll `batches.retrieve(id)` until
   `processing_status === "ended"`; stream results via `batches.results(id)`.
4. **Apply each result through the SAME logic the sweep uses.** This is the main refactor batch
   motivates: factor the "apply an extraction result → upsert property + edges + memory" logic out of
   `IngestionSweep` into a shared `ExtractionApplier` that both the live sweep and the batch job call,
   so live and bulk paths can never diverge.
5. Guardrails: log batch size + token usage; cap per run; never run against the live confirmation
   push (batch results are old — no "✅ Saved" reply, just silent catalog updates).

### Decision rule

> Build the Batch path the first time we need to **(re)extract a large backlog at once** — onboarding
> history backfill, or a schema/model-driven re-extraction. Until then, the synchronous sweep is
> enough and simpler.

---

## How the two relate

Both a GSI3 **backfill** (rewriting all membership edges) and Batch **re-extraction** are flavors of
the same shape: *a bulk rewrite over the catalog/messages tables.* If we build a small reusable
"bulk job over the table" harness for the first one that lands, it can likely serve the other. So
when the first bulk need appears, consider that shared harness rather than a bespoke one-off.

## Summary

| Item | Enables / answers | Trigger to build | Rough effort |
|---|---|---|---|
| **GSI3 `convMembers`** | "Who is in this conversation?" (member enumeration) | First feature needing per-member fan-out, a sharing/access display, or member audit | Small — one GSI + one ElectroDB index + one query method |
| **Batch API** | Cheap async bulk (re)extraction | First need to backfill history or re-extract after a schema/model change | Medium — new entrypoint + submit/poll/apply, plus factoring a shared `ExtractionApplier` out of the sweep |

## What NOT to do

Don't build either speculatively. Each adds ongoing cost (write amplification / an unexercised code
path) for zero current benefit, and unused infra rots. This document is the cheap insurance: when a
real trigger appears, the context is already here.
