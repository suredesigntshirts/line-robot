# Plan 11 — Richer "Details" view for a property

Status: **implemented — pending deploy.** Increment A committed (`ee3ecb4`). Increment B implemented
(catalog edit-context + `EditReplyHandler` + processor extractor wiring + the one-line processor-policy
SSM grant). 161 unit + 21 integration tests green; `pulumi preview` shows exactly 7 updates (3 Lambda
code rebundles + 3 alias bumps + the processor-policy grant), 39 unchanged — no table/GSI/deploy-policy
change. Deploy with `pulumi up` (Increment B needs it for the SSM grant).
Predecessors: `plans/09-realestate-catalog-assistant.md` (build plan), `plans/10-deferred-gsi3-batch-api.md`.

## Context / why

Tapping **Details** on a property card today fires a `view` postback that returns a single
plain-text message (`propertyDetail()`, `packages/bot/src/core/handlers/views.ts`):

```
📍 123/45 Sukhumvit Soi 31
Price: ฿4,500,000
Type: condo / Status: lead / Area: … / Tags: …
```

It is bare and discards data we already store: `lat`/`long` (never shown), every photo beyond the
carousel hero (`photos[]`), the project-name-or-address we don't use as the title, and the
timestamps. A broker viewing a listing can't navigate to it, can't see its photos, and can't act on
it.

The Details view should become:

1. a **rich Flex card** — hero photo, status emoji badge, big price, full address/project/area, tags,
   a "reply to update" note, saved/updated dates, and footer buttons;
2. an **"Open in Maps" button** — Google Maps deep-link (by lat/long when present, else by address);
3. a **photo gallery** of all photos — image carousel, each image tappable to full size;
4. **update-by-reply** — the user replies in plain language ("price is 4.2M", "mark sold") and the
   listing is updated immediately, with a confirmation of what changed.

The work splits into **Increment A** (visual upgrade — pure code, no IAM/secret change) and
**Increment B** (free-text edit — needs the processor Lambda to gain Claude access: a one-line IAM
grant + `pulumi up`). B is gated behind an *optional* extractor, so with nothing wired the handler
chain is byte-identical to today.

Staging is fully deployed and clean as of this plan (`pulumi preview` → 46 resources, zero diff).

## Decisions (resolved with the user)

- Detail format → **rich Flex card** (reuse the existing Flex / `toBubble` path in the gateway).
- Gallery → **image-carousel message**, opened by a "🖼 Photos (N)" footer button (a new `photos`
  postback), shown only when ≥2 photos resolve. Rendered as a Flex carousel of image-only bubbles
  (reuses the flex path; no new SDK template type).
- Map → **"🗺 Open in Maps" Flex `uri` button** → `https://www.google.com/maps/search/?api=1&query=…`.
- Edit-by-reply → **free-text → scoped Claude extraction** on the last-viewed property, applied
  immediately with a diff confirmation.
- Edit seam → a **new `EditReplyHandler`** in the existing `CompositeMessageHandler` chain (the
  documented growth seam, `registry.ts`), ordered `[CommandHandler, EditReplyHandler]` so typed
  commands always win. Injected via an **optional** `extractor` on `HandlerDeps`.
- Edit-context storage → **dedicated tracker methods** `armEdit` / `getEditContext` / `clearEdit`
  writing `editPropertyId`/`editArmedAt` on the `CONV#<key> / META` item. Kept OUT of the
  `ConversationTracker` domain type and the ingestion state machine (arming must not touch the
  GSI1/pending keys).
- `viewProperty(propertyId, conversationKey?)` — convKey optional/last, so existing single-arg call
  sites and tests still compile.

---

## Increment A — rich card + maps + gallery (code only, no infra diff)

| File | Change |
|---|---|
| `core/domain/message.ts` | `CardAction`: add `mode: "uri"` + `uri?: string`. `OutboundMessage`: add `{ type:"imageCarousel"; altText; imageUrls: readonly string[]; quickReplies? }`. |
| `core/handlers/commands.ts` | Add `ACTIONS.photos = "photos"` (encode/decode are generic — no other change). |
| `core/handlers/views.ts` | Rewrite `propertyDetail` to return a rich single `flex` card; add `mapsUri(property)`, a `status→emoji` map, a short `formatShortDate(ms)`, and `imageCarouselMessage(imageUrls, altText)`. Reuse `formatPrice`, `propertyTitle`, `area`, `encodePostback`. Footer buttons: Maps (`uri`, omit if no location/address), Follow-up (existing datetime), Photos (`postback`, only if ≥2 photos). |
| `adapters/line/lineGateway.ts` | `toCardAction`: add `uri` branch → `{ type:"uri", label, uri }`. `toSdkMessage`: add `case "imageCarousel"` → Flex carousel of image-only bubbles (`hero` image `size:"full"`, `aspectMode:"cover"`, `action:{type:"uri", uri}`); honor `withQuickReply`; cap 12 (existing `MAX_BUBBLES`). |
| `core/handlers/catalogAssistant.ts` | `viewProperty(propertyId, conversationKey?)`: load property, presign **all** photos via a new `galleryUrls(property)` (mirror `heroUrls`, per-photo try/catch + filter), render the rich card with hero + photo count. Add `showPhotos(propertyId)` → `imageCarouselMessage` (empty / no-signer → friendly text). |
| `core/handlers/postbackRouter.ts` | `view` case → `viewProperty(params.get("id") ?? "", conversationKey(ref))`. Add `case ACTIONS.photos`. |
| `app/eventProcessor.ts` | `outboundText()` — handle `imageCarousel` (return its `altText`) so the audit-row write doesn't break on the new variant. |

**Maps URL helper:** lat/long → `?api=1&query=LAT,LNG`; else `query=` URL-encoded
`normalizedAddress ?? rawAddresses[0] ?? area(p) ?? projectName`; undefined → button omitted.

**Tests (A):** `views.test.ts` (rich card shape; maps uri for coords vs address; photos button only
≥2; imageCarousel builder), `lineGateway.test.ts` (`uri` action → `type:"uri"`; imageCarousel → flex
carousel), `catalogAssistant.test.ts` (viewProperty returns flex; showPhotos presigns all; gallery
omitted without signer), `postbackRouter.test.ts` (photos route; view passes ref).

---

## Increment B — free-text "reply to update" (needs `pulumi up`)

| File | Change |
|---|---|
| `core/ports/catalog.ts` | Add `armEdit(convKey, propertyId, atMs)`, `getEditContext(convKey): Promise<{propertyId, armedAt} \| null>`, `clearEdit(convKey)`. |
| `adapters/dynamodb/catalogRepository.ts` | Implement the three via raw `UpdateCommand`/`GetCommand`/`UpdateCommand REMOVE` on `trackerKey(convKey)`. `armEdit` SETs `editPropertyId`/`editArmedAt` only (must NOT set gsi1/pending), with `if_not_exists` seeding of `conversationKey`/`entityType`. Reuse `trackerKey`. |
| `test/fixtures/fakeCatalog.*` | Implement the three over the in-memory map. |
| `core/handlers/catalogAssistant.ts` | In `viewProperty`, when `conversationKey` present, `await catalog.armEdit(convKey, id, clock.now())`. |
| `core/handlers/editReplyHandler.ts` (NEW) | `implements MessageHandler`. Deps: `catalog`, `extractor`, `clock`. `handle`: read `getEditContext`; none/expired (>15 min) → `[]`. Else load property, build `ExtractionRequest { text, media:[], geoHints:[], candidates:[thisProperty] }`, run `extractor.extract`. If a returned property has `existingPropertyId === thePropertyId` → set-if-present `PropertyUpsert` + `clock.now()`, `upsertProperty`, `clearEdit`, return `editConfirmationMessage(before, after)`. Otherwise `clearEdit` and return `[]` (fall through to the sweep). |
| `core/handlers/views.ts` | Add `editConfirmationMessage(before, after)` — list only changed fields, old→new. |
| `core/handlers/registry.ts` | `HandlerDeps.extractor?`; `createDefaultMessageHandler` appends `EditReplyHandler` only when set (chain unchanged otherwise). `createPostbackRouter` unchanged. |
| `lambda/processor.ts` | In `buildDeps`, gate on the key: `const extractor = env.ANTHROPIC_API_KEY_PARAM ? createClaudeExtractor(await loadAnthropicApiKey(env), …) : undefined;` pass into `createDefaultMessageHandler`. Reuse `createClaudeExtractor` + `loadAnthropicApiKey` (already used by `lambda/sweep.ts`). |
| `infra/index.ts` | **Only infra change:** `processor-policy` — add `anthropicApiKeyParam.arn` to the `ssm:GetParameter` Resource (make it an array). Env var already present in `commonEnv`; `ssmKmsDecrypt` already on the policy. |

**Tests (B):** `editReplyHandler.test.ts` (armed+match → upsert+diff; armed+expired → []; armed+no-match
→ [] fall-through; no extractor → handler absent), `catalogAssistant.test.ts` (viewProperty arms when
convKey passed), `fakeCatalog` edit-context, `registry.test.ts` (extractor → chain includes the
handler), DynamoDB-Local round-trip for `armEdit/getEditContext/clearEdit` (and `armEdit` leaves GSI1
untouched).

### Risks / mitigations (B)
- **Sweep re-extracts the edit message** after we applied it — benign for additive edits
  (set-if-present is idempotent). Edge case: corrections/removals (tags are list-replace) could
  diverge across two LLM passes. Mitigation: log every applied edit so divergence is observable on
  staging before relying on it.
- **Hijacking new-property chat:** 15-min TTL + the extractor's own `existingPropertyId !== id` →
  no-edit → fall through; arm only on explicit `view`.
- **Synchronous Haiku in the reply path** (~1–2s) is within the 30s processor timeout / reply-token
  window; `EventProcessor.send` already falls back to push; undefined extractor → instant `[]`.

---

## Verification

- **Unit:** `npm run test`, `npm run lint`, `npm run typecheck`.
- **Integration:** `npm --prefix packages/bot run test:integration` (DynamoDB Local) — edit-context
  round-trip; confirm `armEdit` leaves GSI1 untouched.
- **Deploy A:** `npm run build` then `cd infra && pulumi up` (Lambda code update; expect NO
  policy/resource diff). In the staging LINE chat: tap Details → rich card, big price, status emoji,
  Maps button deep-links (test a property with lat/long AND one with only an address), Photos button
  appears only with ≥2 photos and opens the carousel (each image opens full size).
- **Deploy B:** `pulumi up` shows the one `processor-policy` diff → apply, then redeploy code. View a
  property, then within 15 min send "change the price to 4.2M" → immediate diff confirmation + value
  updated (check via "my listings"). Send an unrelated new-property description after a view → it
  falls through to normal sweep ingestion (no false edit). Watch CloudWatch processor logs for the
  Haiku latency and confirm no SSM `AccessDenied`.

## Notes
- No new AWS resources, tables, GSIs, or secrets. B's only infra delta is the single SSM read grant.
- Both increments deploy through the existing `npm run build` + `pulumi up` flow.
