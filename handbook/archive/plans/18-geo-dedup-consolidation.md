# 18 — Per-conversation dedup (blocking + fuzzy scoring) + geohash GSI for radius search

## Context

Deduplication today is **100% LLM-driven**. The ingestion sweep calls `loadCandidates(conversationKey)`
(`packages/bot/src/app/ingestionSweep.ts:478`), which loads **every** property already discussed in
*this one chat*, stuffs them all into the extraction prompt (`claudeExtractor.ts:~253`), and the model
emits `existingPropertyId` / `ambiguous`. Two real problems remain:

- **The per-conversation dedup doesn't scale.** Preloading *all* of a conversation's properties into
  every prompt dilutes the model and grows token cost as a chat accumulates listings. There is no
  index, no blocking, no ranking.
- **No geospatial filtering.** `lat`/`long` (from shared map links via `parseGeoLinks`) are stored as
  plain numbers and never queried. We want a fast deterministic area filter (~1km radius) — for
  **user-facing radius search** ("listings near here").

**Approach for dedup — the established entity-resolution pattern: blocking → fuzzy scoring → LLM verify.**
- *Blocking* = cheap deterministic candidate generation (deed identity, geo proximity, admin-area keys)
  that shrinks the comparison set from O(everything-in-the-chat) to O(handful).
- *Fuzzy scoring* = address normalization + string/geo similarity to rank the block.
- *LLM verify* = the model makes the final same-property decision — which it **already does** today via
  `existingPropertyId`. We upgrade the *candidate set it sees*, not the decision step.

---

## Data model & access (settled — read this first)

This is the conceptual frame the rest of the plan depends on. It needed naming, not changing.

The catalog is **one DynamoDB table** (single-table design — correct for DynamoDB: no joins, related
items co-located in a partition, one table to operate). It holds several **logically separate
entities** keyed by prefix. Ownership is already **normalized out of the property** and kept as
lookup edges:

```
Property        pk=PROP#<id>   sk=META         → listing fields ONLY (no members, no owners)
Conv→Property   pk=CONV#<key>  sk=PROP#<id>    → "this property is visible in this conversation"
Membership      pk=USER#<id>   sk=CONV#<key>   → "this user is in this conversation"
```

**Access scope = the conversation.** A user can see a property iff they are a member of *some*
conversation it is linked to. This is a forward, two-hop walk and needs **no extra index**:

```
User ──(Membership)──▶ Conversation ──(Conv→Property)──▶ Property      (= listPropertiesForUser)
```

Consequences we rely on:
- **Private-until-shared falls out for free.** A property linked only to your DM conversation is
  private to you; once a group conversation links it, every member of that group sees it. No special
  casing.
- **Cross-group visibility is a READ-TIME aggregation, not a write-time merge.** "My Listings" is the
  union across all your conversations (`listPropertiesForUser`, `catalogRepository.ts:348`). We never
  merge records across scopes — merging would *grant* a scope access (a privacy leak) and force an
  N×M per-ingest fan-out. So **dedup stays per-conversation**; cross-scope reach is pure presentation.
- **Reverse queries are not needed.** "Who can see property P?" / "who is in conversation C?" would
  need an inverse index (the deferred **GSI3** in `plans/10`). No feature here needs them, so GSI3
  stays unbuilt — and we do **not** reserve its slot (see Phase 2).

This resolves the earlier "group cross-member nuance": two members share a group, a property sits in
only one's DM → it stays separate and private until explicitly shared into the group. That is the
**desired** behavior, not a gap.

---

## HARD constraint (do not regress)

`packages/bot/src/adapters/anthropic/CLAUDE.md`: strict structured output caps the **output schema** at
**16 union/nullable params total** (currently 8, all numbers; a regression test asserts it). **This
plan adds ZERO output-schema fields** — it only changes *which* candidates are rendered into the
prompt text and enriches `ExtractionCandidate` (an in-memory type, not the Zod output schema). Keep
`claudeExtractor.schema.test.ts` green.

---

## Phase 1 — Per-conversation CandidateFinder + grouped "My Listings" (pure code, no infra)

Delivers the dedup-quality/scaling upgrade and the cross-group visibility the user wants, with **no new
GSI and no change to the extraction call shape**. All candidate scoping stays **per conversation**
(today's `loadCandidates(key)` scope) — no cross-user union, no cross-scope merge.

### 1a. Address normalization + similarity (pure, unit-tested)
- **Create `packages/bot/src/core/domain/dedup/normalize.ts`** — Thai/English address canonicalization:
  lowercase, strip punctuation, normalize Soi/ซอย, Road/ถนน/Rd, Moo/หมู่, common abbreviations; tokenize.
  Reuse the field list from `searchableText()` (`core/domain/catalog.ts:144`) as the text source.
- **Create `packages/bot/src/core/domain/dedup/score.ts`** — pure scorers:
  - `haversineKm(a, b)` — great-circle distance.
  - `textSimilarity(a, b)` — trigram Dice coefficient + token-set Jaccard over normalized tokens
    (vendor ~30 lines; if a lib is preferred, **fetch docs first** via `/documentation-downloader`).
  - `compositeScore(newSignal, candidate)` → `{ score, reasons }`.

### 1b. CandidateFinder (blocking + ranking, per conversation)
- **Create `packages/bot/src/core/domain/dedup/candidateFinder.ts`** — given the extracted property's
  signals (lat/long, normalized address, projectName, district/subdistrict/province, **chanote deed
  fields**) and **the conversation's own property pool**, run three blocking strategies and union them:
  1. **Deed/parcel block — deterministic, definitive.** Exact match on `chanote.deedNumber`+`landOffice`
     (or `mapSheet`+`landNumber`). Same deed ⇒ same parcel ⇒ score 1.0. Strongest key; directly
     answers "property boundaries."
  2. **Geo block.** When lat/long present: keep candidates within a radius (Haversine **in code**,
     default ~1km); proximity feeds the score. *(No GSI needed — a single conversation's property
     count is the bound. The Phase-2 GSI is for radius **search**, not this.)*
  3. **Admin/text block.** When no coords (common — coords only come from map links): match on
     normalized province/district/subdistrict + projectName/address similarity.
  Score, rank, return **top-K (≈5–8)** with `{ propertyId, score, distanceKm?, deedMatch }`.

### 1c. Wire CandidateFinder into the sweep (scope unchanged)
- **Modify `packages/bot/src/app/ingestionSweep.ts`** — `loadCandidates(key)` keeps loading **the
  conversation's own** properties (`listConversationProperties`), but instead of mapping them raw it
  runs them through `candidateFinder` against the extracted signals and passes the ranked **top-K** to
  extraction (so a busy chat no longer dumps its entire property list into the prompt).
- **Modify `packages/bot/src/core/ports/extraction.ts`** — enrich `ExtractionCandidate` with optional
  `distanceKm` / `deedMatch` hints (in-memory only — **not** the Zod output schema). Update the stale
  "write-scope is per conversation" doc comment to reflect ranked candidates (scope is still per-conv).
- **Modify `claudeExtractor.ts` `buildExtractionContent` (~lines 253–262)** — render the richer hints
  (e.g. `geo-dist=0.3km deed=match`) so the model verifies better. **No output-schema change.**
- **No change to `mergeNewInto`.** Merges stay within the current conversation (its existing
  `linkConversationProperty(conversationKey, intoId)` at `catalogAssistant.ts:289` is correct as-is).
  The old "cross-conversation merge edge case" is dropped — we don't merge across scopes.

### 1d. Grouped "My Listings" (the cross-group visibility surface)
- **Today** `myListings` (`catalogAssistant.ts:49`) flattens `listPropertiesForUser` into one
  recency-sorted carousel. The user wants to **see everything from every group + DM, grouped by source**.
- **Add `catalogRepository.listPropertiesForUserGrouped(userId)`** returning
  `{ conversationKey, properties: Property[] }[]` — the *same* two-hop walk as `listPropertiesForUser`
  but **without** collapsing the Conv→Property edges, so each property keeps its source conversation(s).
  No new index — reuses `listUserConversations` + `listConversationProperties`.
- **Update `myListings`** to render grouped sections ("From *<group/DM label>*: …"). A property linked
  to several conversations appears under each. (`listPropertiesForUser` stays for `listingsOnRoad`/
  read-api/upcoming, which want the flat union.)
- Conversation display labels: best-effort from the conversation key / tracker; falls back to a
  generic "Group" / "Direct chat" when no friendly name is known.

### Phase 1 tests
- Unit: `normalize`, `haversineKm`, `textSimilarity`, `compositeScore`, `candidateFinder` ranking
  (deed-exact beats geo beats text; top-K cutoff).
- Keep `claudeExtractor.schema.test.ts` (16-union) green — assert no new output-schema unions.
- Unit/integration: `listPropertiesForUserGrouped` groups by source conversation and matches the flat
  `listPropertiesForUser` union when flattened.

---

## Phase 2 — Geohash GSI + radius search (user-facing feature — the GSI's consumer)

Confirmed in scope: radius search ("listings near here") is on the roadmap, so the geohash GSI has a
real consumer. Build the substrate **and** the feature together (don't ship unused infra).

### 2a. Geohash GSI on the catalog table
- **Add `ngeohash`** (small, vetted) — **fetch docs via `/documentation-downloader` first** — or vendor
  a minimal encoder+neighbors.
- **`infra/src/storage.ts`** — add a geo GSI mirroring the GSI1/GSI2 blocks (`:62–79`), PAY_PER_REQUEST.
  The `${catalogTable.arn}/index/*` IAM wildcard already covers it (`lambdas.ts:64/92/123`,
  `miniapp.ts:121`) — **no deploy-policy change.** Partition = coarse geohash prefix (**precision 6 ≈
  1.2km cell**, so a 1km query = center + 8 neighbors), sort = full geohash (precision ~9).
  - **Naming: by purpose, not a reserved number.** DynamoDB allows 20 GSIs and there is no scarce
    "slot"; we are **not** building GSI3 (the deferred membership index in `plans/10`), so do not
    reserve it. Use semantic attribute names — `geohashPrefix` (HASH) / `geohash` (RANGE) — and index
    name `byGeo`. If reverse-membership is ever built it simply takes the next index; no gap reserved.
- **`catalogEntities.ts`** — add `geohash` / `geohashPrefix` attributes + a `byGeo` ElectroDB index on
  the Property entity.
- **`catalogRepository.ts`** — `upsertProperty` computes geohash from lat/long on write; add
  `findPropertiesNear(lat, long, radiusKm)` that queries center+neighbor cells then Haversine-filters
  (mirror the `findPendingConversations`/`findDueEvents` GSI query pattern).
- **Backfill:** new writes carry `geohash`; existing properties get it on re-ingest (or a later one-off
  job). Active listings self-populate.

### 2b. Radius search feature (the consumer — membership-scoped)
- A user-facing "near here" search: triggered by a shared map pin / `near` command (chat) and/or a
  miniapp map. Handler: `findPropertiesNear(...)` **intersected with the caller's visible set**
  (`listPropertiesForUser`) so results obey the same access model — you only see nearby listings you're
  allowed to see. Render via the existing `listingsMessage` carousel.
- Tests: geohash encode/neighbor unit tests; integration test for the geo query; a membership-scoping
  test (nearby property in a chat you're *not* in does not surface).

### Deferred (not in this plan)
- **`find_similar_properties` Anthropic tool** — was framed as cross-conversation dedup reach, which
  contradicts the per-conversation model. Per-conversation blocking already injects the right small
  candidate set, so the tool adds little. Defer; revisit only if per-conversation candidate quality
  proves insufficient on real data.
- **GSI3 (inverse membership) + Batch API** — remain deferred per `plans/10`; nothing here needs them.

---

## Files at a glance

| Action | Path | Phase |
|---|---|---|
| create | `packages/bot/src/core/domain/dedup/normalize.ts` | 1 |
| create | `packages/bot/src/core/domain/dedup/score.ts` | 1 |
| create | `packages/bot/src/core/domain/dedup/candidateFinder.ts` | 1 |
| modify | `packages/bot/src/app/ingestionSweep.ts` (`loadCandidates` → rank top-K, per-conv) | 1 |
| modify | `packages/bot/src/core/ports/extraction.ts` (`ExtractionCandidate` hints; doc comment) | 1 |
| modify | `packages/bot/src/adapters/anthropic/claudeExtractor.ts` (`buildExtractionContent` render) | 1 |
| modify | `packages/bot/src/adapters/dynamodb/catalogRepository.ts` (`listPropertiesForUserGrouped`) | 1 |
| modify | `packages/bot/src/core/handlers/catalogAssistant.ts` (`myListings` grouped render) | 1 |
| modify | `infra/src/storage.ts` (geo GSI — `geohashPrefix`/`geohash`, index `byGeo`) | 2 |
| modify | `packages/bot/src/adapters/dynamodb/catalogEntities.ts` (geohash attrs + `byGeo`) | 2 |
| modify | `packages/bot/src/adapters/dynamodb/catalogRepository.ts` (`findPropertiesNear`, geohash on upsert) | 2 |
| add | radius-search handler + wiring (chat command / miniapp), membership-scoped | 2 |

---

## Verification

- **Unit/typecheck/lint:** `npm run test`, `npm run typecheck`, `npm run lint`. 16-union regression test
  stays green.
- **Integration:** `npm --prefix packages/bot run test:integration` (DynamoDB Local) — grouped-listings
  test; Phase-2 geo-query + membership-scoping test.
- **End-to-end (staging, Pulumi):** `npm run build` + `cd infra && pulumi up`. Then: (a) in a busy chat,
  re-mention an existing property → confirm the bot offers update/merge from the *ranked* candidates
  (not the whole list); (b) "My Listings" shows listings **grouped by group/DM**; (c) a "near here"
  search returns nearby listings **only from chats you're in**.

## Open items
- Scoring weights/threshold need tuning against real Thai listing data after Phase 1 ships.
- Conversation display names for the grouped view (friendly labels vs. generic "Group"/"Direct chat").
