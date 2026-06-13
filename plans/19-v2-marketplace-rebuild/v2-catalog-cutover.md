# v2 Catalog Cutover — PIPELINE_V2 flip + reader migration

**Spec status: FLESHED (2026-06-13) — BUILD NOT STARTED.** Written at founder request after Stage 4
(public website) went live reading Postgres while ingestion still writes the v1 DynamoDB catalog.
Open questions below carry recommended defaults; every one is flagged for founder review because
several touch settled decisions (D2, D13) and the Stage 5 boundary. No code written.

## Why this exists (the problem)

Today there are **two catalogs**:

- **v1 — DynamoDB** (`linerobot-staging-catalog`): written by the sweep (`PIPELINE_V2=off`), read by
  the **bot processor** (in-chat "My Listings", view, merge, edit-by-reply, follow-ups) and the
  **read-api** (the v1 MINI App). Holds 17 real listings from the friends launch.
- **v2 — Postgres/RDS**: written by `runPipeline` when `PIPELINE_V2=on`, read by the **public
  website** (Stage 4, live). Currently holds only the 24 synthetic seed listings.

So the website shows synthetic data, and flipping `PIPELINE_V2=on` is a **hard cutover** (the sweep
delegates extract-and-apply wholesale to v2 — no dual-write): new LINE listings would flow to
Postgres/website but stop landing in v1, so the in-chat bot commands and the v1 MINI App would
freeze at their current 17 listings. The website's v2 read path and write path are both verified
against real RDS (TLS/CA fix `9c1e203`; live `runPipeline` extract→RDS run, 2026-06-13). What is
missing is a path for the **bot/MINI-App read+write surfaces** to follow ingestion onto Postgres.

## Reconciling with settled decisions (read before scoping)

This cutover intersects three already-settled items; the spec is shaped by them, not the reverse:

- **D2 — "Data migration: None. Clean slate. v1 catalog is disposable."** The 17 v1 listings are,
  per the settled plan, **disposable**. Backfilling them into Postgres is a *deviation* — only worth
  it if the founder now values those specific 17 records (see Decision C). The default that honors
  D2 is: **do not backfill; let v1 go stale and retire it.**
- **D13 — CRM vs marketplace split.** v2 listings carry a *marketplace* lifecycle
  (draft/active/under-offer/sold/rented/withdrawn); per-user saved/viewings/follow-ups/notes are
  separate per-user features. The bot's v1 `Property` is a *CRM-lead* shape (status lead→closed,
  tags, chanote, source). These models genuinely differ — a 1:1 projection is lossy (see Decision A).
- **Stage 5 — MINI App rebuild** already scopes: rebuild the MINI App on `packages/ui` + v2, retire
  the v1 read-api and the v1 Preact SPA, implement claim/publish + my-listings + viewings +
  follow-ups on the v2 model. **The MINI-App half of "migrate readers" IS Stage 5.** Building a
  Postgres adapter behind the *old* read-api would be throwaway.

**Consequence:** "migrate readers to v2" decomposes into three parts, only one of which is net-new
here:
1. **MINI App reader** → already Stage 5 (rebuild, not adapt). Do not duplicate.
2. **Bot in-chat catalog commands (processor)** → net-new; not covered by any existing stage. This
   spec owns it.
3. **The flip itself + shared gaps** (a Postgres home for follow-up events; the owner/scope model) →
   net-new; this spec owns it.

## Scope

**In:**
- A Postgres implementation of the bot's `PropertyStore` slice of `CatalogRepository`
  (`packages/bot/src/core/ports/catalog.ts`), so the **processor** in-chat commands read+write v2.
- A new Postgres **follow-up events** table (no v2 home exists today) + its reminder-sweep due-query.
- The `PIPELINE_V2=on` flip (Pulumi `pipelineV2` config) + the env/wiring to make the processor and
  reminder Lambdas Postgres-connected (they have no `DATABASE_URL` today — only website-ssr + sweep).
- A `Property ⇆ listing` projection/mapping (v2 listing → bot `Property` for reads; bot edits →
  listing writes).
- The end-to-end verification + rollback procedure for the flip.

**Out (explicitly):**
- The MINI App reader migration and read-api retirement — **Stage 5**.
- Any change to the `ConversationStore` slice (tracker/debounce/claim/watermark, edit context,
  membership edges, memory docs) — these are ingestion/conversation state, **kept on DynamoDB** per
  the Stage 0 spine audit and D1. The cutover keeps them exactly as-is.
- Marketplace lifecycle UX, claim/publish, exclusivity — Stages 5/6.
- Backfilling v1 → v2 unless Decision C overrides D2.

## The port split

`CatalogRepository = ConversationStore & PropertyStore`. The cutover splits the single
`DynamoCatalogRepository` consumers get into a **composite**: DynamoDB for `ConversationStore`,
Postgres for `PropertyStore`. `HandlerDeps.catalog` is assembled from both; no handler signature
changes (they already depend on the merged port).

**Stays on DynamoDB (ConversationStore — unchanged):**
`touchConversation`, `findPendingConversations`, `claimConversation`, `failConversation`,
`releaseConversation`, `getConversation`, `armEdit`, `getEditContext`, `clearEdit`,
`recordMembership`, `removeMembership`, `listUserConversations`, `getMemoryDoc`, `putMemoryDoc`.

**Moves to Postgres (PropertyStore — new adapter):**

| Method | Postgres mapping |
| --- | --- |
| `upsertProperty(PropertyUpsert)` | Update `listing` (+ child tables) by id; set-if-present merge semantics. The hard part: bot CRM fields with no v2 column (see Decision A). |
| `getProperty(id)` | Select `listing` joined to condo/rental/fees/content/media → project to `Property`. |
| `deleteProperty(id)` | Delete `listing` + children (no cascade FKs today → delete children first, or add `ON DELETE CASCADE` in a migration — recommended). |
| `linkConversationProperty` / `unlinkConversationProperty` / `listConversationProperties` | v2 has no conv→property edge table. A listing's owner is the conversation's Postgres user (`runPipeline`'s `ensureOwner`: identity `line`/`conversationKey`). "Properties in conversation X" = `listing WHERE owner_user_id = user(line, X)`. **Single-owner**, unlike v1's many-conv→one-property edges (see Decision B). |
| `listPropertiesForUser(lineUserId)` | Hybrid: DynamoDB membership (`listUserConversations`) → conversation keys → Postgres users `(line, key)` → `listing WHERE owner_user_id = ANY(...)`. Read-access still follows the user across chats via the DynamoDB membership edges. |
| `addEvent` / `listPropertyEvents` / `deletePropertyEvents` / `findDueEvents` / `markEventNotified` | New `listing_event` table (below). Reminder sweep gets `DATABASE_URL` + Postgres event store. |

## Schema gaps (additive migrations)

1. **`listing_event`** — no Postgres home for the bot's `PropertyEvent` (P2 follow-ups). New table:
   `id`, `listing_id` (FK), `due_at timestamptz`, `title text`, `notify_conversation_key text`,
   `notified_at timestamptz`, `created_at timestamptz`. **Partial index** `WHERE notified_at IS
   NULL` to serve the reminder sweep's due-query without a scan (the v2 analogue of the sparse GSI2).
   Follows the existing migration hand-fix rules (`packages/db/CLAUDE.md`).
2. **`ON DELETE CASCADE`** on the `listing_*` child FKs (today none cascade → `deleteProperty` and
   the merge flow must delete children by hand). Recommended cleanup so delete/merge is one statement.
3. **Owner-by-conversation index**: `listing(owner_user_id)` index for the per-conversation /
   per-user reads (verify it exists; add if not).

## Decisions for the founder

- **Decision A — `Property` ⇆ `listing` model reconciliation (D13).** The bot `Property` has CRM
  fields with no marketplace column: `status` (lead→…→closed deal pipeline), `tags`, `source`,
  `originConversationKey`, the full `chanote` OCR struct (v2 keeps only `deed_no` / `title_deed_type`).
  Options: **(A1, recommended)** add a `jsonb listing_crm` sidecar column on `listing` for the
  bot-only CRM fields the marketplace schema doesn't model — keeps v2 marketplace columns clean,
  lets the processor round-trip its `Property` losslessly, defers a proper CRM model to a later
  stage; **(A2)** add first-class columns for each (pollutes the marketplace table with CRM
  concepts); **(A3)** drop the unmodeled fields on read (lossy — in-chat "My Listings" loses status
  badges, tags, chanote detail). Recommend **A1**.
- **Decision B — single-owner vs membership fan-out.** v1 let one property be linked to many
  conversations (a listing reshared across chats showed in each). v2's `owner_user_id` is single.
  Recommend accepting **single-owner = origin conversation** (matches `runPipeline` today); the
  cross-chat *read* fan-out still works via DynamoDB membership → owner-conversation lookup. If true
  multi-conversation listings are needed, that's a v2 edge table — defer unless required.
- **Decision C — backfill the 17 v1 listings? (touches D2).** Default honoring D2: **no backfill,
  v1 is disposable**, the 17 go stale and are retired with the read-api in Stage 5. Override only if
  the founder wants those exact records preserved — then a one-off DynamoDB→Postgres map script
  (lossy per Decision A) runs before the flip. Recommend **no backfill** unless the records matter.
- **Decision D — what happens to the v1 MINI App between the flip and Stage 5.** After the flip the
  v1 read-api still reads DynamoDB → friends see the frozen 17 (+ whatever they had), not new
  listings. Options: **(D1)** leave it (it's being retired in Stage 5 anyway — recommended if Stage 5
  is near); **(D2)** sequence this cutover *into* Stage 5 so the MINI App and bot commands move
  together and nothing freezes. Recommend **D1** if Stage 5 is the next build, else **D2**.

## Increments

1. **`listing_event` migration + Postgres event store** (`@line-robot/db` repo functions) + unit/
   integration tests against Docker Postgres. No behavior change yet (nothing reads it).
2. **`PostgresPropertyStore` adapter** implementing the PropertyStore methods with the `Property ⇆
   listing` projection (Decision A's `listing_crm` sidecar) + `ON DELETE CASCADE` migration. Covered
   by the existing in-memory port contract tests, re-run against the Postgres impl.
3. **Composite wiring**: assemble `HandlerDeps.catalog` from `{ ...dynamoConversationStore,
   ...postgresPropertyStore }`; give processor + reminder Lambdas `DATABASE_URL` (infra) and the
   RDS-connected pool (the `pool.ts` CA path already works). No handler changes.
4. **Flip**: `pulumi config set pipelineV2 on` + `pulumi up`. Verify (below). Keep the one-line
   rollback ready (`pipelineV2 off` + up).
5. **(Conditional, Decision C)** backfill script, run once before increment 4 if chosen.

## Verification & rollback

- **Pre-flip**, against staging RDS: port contract tests green on `PostgresPropertyStore`; a live
  `runPipeline` sweep writes a listing and the processor's `getProperty`/`listPropertiesForUser`
  read it back projected to `Property`; a follow-up event round-trips through `listing_event` and
  the reminder sweep's due-query finds it.
- **Post-flip smoke**: send a test listing via LINE → sweep (now v2) writes Postgres → it appears on
  the **website** AND in the in-chat **"My Listings"** (proves the processor reads v2) → set a
  follow-up → reminder fires from `listing_event`. Then a controlled cleanup.
- **Rollback**: `pipelineV2=off` + `pulumi up` returns ingestion to DynamoDB. The processor would
  then read Postgres while the sweep writes DynamoDB — so rollback is only clean *before* increment 3
  ships; after, rollback means reverting increments 3–4 together. Sequence the flip and the
  composite wiring in the **same** deploy window to keep rollback atomic.

## Risk register

- **Split-brain window**: if the processor reads Postgres before the sweep writes Postgres (or vice
  versa), in-chat commands and ingestion disagree. Mitigation: ship composite-read wiring (inc 3) and
  the flip (inc 4) together; never half-deployed.
- **Connection budget (D-S1-4)**: adding processor + reminder as Postgres clients raises concurrency
  × `pool.max`. Recheck against t4g.micro's ~85 `max_connections` before the flip (today only
  website-ssr + sweep connect; `pool.max=2`). Processor is SQS-driven (can spike) — size its reserved
  concurrency or pool accordingly.
- **Model-mismatch surprises (Decision A)**: in-chat features that depend on CRM fields (status
  badges, tags, chanote gallery) silently degrade if A3 is chosen. A1 avoids this.
- **D2 drift**: backfilling (Decision C) reintroduces v1 data into the "clean slate" — only do it
  deliberately.
