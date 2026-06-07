# Plan 12 — Listing depth, photo association, edit-path hardening, original maps link, delete, blank-slate reset

Status: **in progress.** Follows plan 11 (richer Details, deployed). Driven by post-deploy feedback.

## Context / why

After plan 11 went live, testing on staging surfaced bugs and gaps. Diagnosis from staging logs + a
data audit (`linerobot-staging-catalog`, 6 properties):

1. **Edit-path storm (bug).** The free-text edit handler reuses the full extraction ladder
   (Haiku→Sonnet→Opus + extended thinking). A short edit trips `lowConfidence` → an Opus-with-thinking
   call exceeds the processor's **30s timeout** → SQS redelivers ~5× → duplicate/garbled edits.
   Logs at 07:46 show ~6 invocations ending in `status:"timeout"`. This produced the typo'd
   "Mooban Lak Chain" duplicate.
2. **Photos rarely associated.** Capture to S3 works (59 images today), but only **1 of 6**
   properties has `photos[]`: the sweep attaches images **only when a batch resolves to exactly one
   property** and **replaces** rather than accumulates; and per-conversation write-scope creates
   duplicate property records (same place 3× across chats).
3. **Maps link discards the original.** `geo.ts` keeps only `lat/long`; `mapsUri()` rebuilds
   `?query=lat,lng`. The user wants the **original shared Google-Maps link** preserved and used.
4. **Listings are thin.** We only extract 13 fields (no beds/baths/area/land/floor/contact). The
   card already renders what we store — it looks sparse because the *data* is sparse.
5. **Data is messy** (per-conversation dups + the storm's typo) → a blank-slate reset is wanted.

## Decisions (resolved with the user)

- **New extraction fields:** bedrooms, bathrooms, usable area (sqm), land size (rai/ngan/wah, human
  string), floors, furnishing, notes/description, listing type (sale/rent) + rent price, contact,
  source.
- **Photos:** automatic from chat (NO reply-with-photo), **append/accumulate**, both DM and group.
- **Maps:** store + prefer the **original shared link**.
- **Card:** render **every present field** as a clean `Field: value` list, nulls hidden (Flex docs
  are cached: `docs/.../using-flex-messages`, `flex-message-elements`, `flex-message-layout`).
- **Wipe:** **full reset** — catalog table + messages table + S3 raw archive. Gated behind a separate
  explicit confirmation; run AFTER the new code is deployed.

## Increment 1 — P1 hotfix (deploy first; stops active damage)

| File | Change |
|---|---|
| `adapters/anthropic/claudeExtractor.ts` | `createClaudeExtractor(apiKey, ladder?, logger?, clientOpts?)` — pass `clientOpts` to `new Anthropic({ apiKey, ...clientOpts })` (for `timeout`, `maxRetries`). |
| `lambda/processor.ts` | Build the edit extractor as **Haiku-only, bounded**: `createClaudeExtractor(key, [{ model: "claude-haiku-4-5" }], logger, { timeout: 12_000, maxRetries: 0 })`. Sweep keeps `DEFAULT_LADDER`. |
| `adapters/dynamodb/catalogRepository.ts` | `DEFAULT_DEBOUNCE.quietDebounceMs` **5 min → 2 min** (maxWait stays 30 min). |
| `core/handlers/editReplyHandler.ts` | After a successful apply, **re-arm** the edit context (`armEdit` with `now`) instead of `clearEdit`, so corrections/reverts keep targeting the listing. Prepend an edit hint to the extraction text: *"editing the just-viewed property; name=project, address=street."* |
| ops | Drain the events DLQ (storm leftovers): redrive or purge `linerobot-staging-events-dlq`. |

Tests: bounded-extractor wiring; re-arm after apply; existing edit tests still green. Deploy
(`pulumi up` — Lambda code only, no infra diff).

## Increment 2 — richer listings + photos + maps + delete

**Schema (new fields)** — add to `Property` (`core/domain/catalog.ts`), `ExtractedProperty` + Zod
schema + `SYSTEM_PROMPT` (`claudeExtractor.ts`), ElectroDB attrs + `toProperty` + upsert mapping
(`catalogRepository.ts`), and the apply paths (`ingestionSweep.applyProperty`, `editReplyHandler`):
`bedrooms?` `bathrooms?` `usableAreaSqm?` `landArea?` (string) `floors?` `furnishing?` `notes?`
`listingType?` `rentPrice?` `contact?` `source?` `mapUrl?`.

**Card render-all** (`views.propertyDetail`): build rows from an ordered `(label, value)` table over
every field, omitting nulls; format numbers (`฿`, `sqm`, `bed`/`bath`). Keep hero, status badge,
price headline, notes, buttons.

**Photos append** (`ingestionSweep.applyProperty`): merge existing + new photo keys (deduped) instead
of replacing; keep the single-property-batch guard (no misattribution). Card already renders once
`photos[]` is populated.

**Maps original link** (`core/domain/geo.ts` + sweep/edit): add `parseMapUrls(text)` to capture full
Google-Maps URLs (incl. `maps.app.goo.gl` short links); set `property.mapUrl` (set-if-present).
`views.mapsUri()` prefers `mapUrl → coords → address`.

**Delete** (`commands.ts` + `postbackRouter.ts` + `catalogAssistant.ts` + `views.ts`): add `ACTIONS.delete`
+ `ACTIONS.deleteConfirm`; a 🗑 Delete button on the detail card → confirm quick-replies
("Yes, delete" / "Cancel") → `deleteProperty` + `unlinkConversationProperty` + delete its events
(add `deletePropertyEvents` or guard the reminder against a null property). Dangling edges in other
conversations are already filtered at read time.

**Legacy cleanup**: remove stale comments/paths (`message.ts` heroImageUrl "doesn't record photo keys
yet", the photo-replace comment), align `propertyCard` status with `statusBadge`, drop dead code found
during the pass.

Tests: new-field render; mapUrl preference + parseMapUrls; append-photos (unit + integration);
delete + confirm flow.

## Increment 3 — blank-slate full reset (gated, destructive)

A one-off maintenance script (admin `default`/tea-admin profile, since the `line-robot` CLI identity
is read-only on the data plane): delete all items from `linerobot-staging-catalog` and
`linerobot-staging-messages`, and empty the S3 raw-archive bucket. Run AFTER Increment 1+2 are
deployed so re-ingestion uses the new schema. **Explicit confirmation required before running.**

## Verification
- `npm run test` / `test:integration` / `lint` / `typecheck` per increment.
- Deploy each increment via `npm run build` + `pulumi up`.
- Live: edit a listing (no timeout/storm — check processor logs for a single Haiku call, no retries);
  share photos in a chat about one property → they accumulate on the card after the (2-min) sweep;
  Open in Maps uses the shared link; Details shows the new fields when present; Delete removes a
  listing. Post-reset: catalog empty, new chats populate fresh.
