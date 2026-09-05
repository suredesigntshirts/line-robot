# Plan 17 — Deeper MINI App ↔ chat integration (R1 · R3 · R4)

_Status: in progress. Builds on plan 14 (read-only MINI App). Research: `docs/research/liff-miniapp-deep-integration.md`._

Three increments that deepen the chat ↔ MINI App loop **without** verifying the channel (all work on
the current unverified Published channel `2010316767`):

- **R1 — Deep-link Flex cards → the catalog screen.** A "🔎 Open in Catalog" `uri` button on the
  in-chat **detail** card opens `…/p/{propertyId}` straight to that listing in the webview.
- **R3 — Share a listing via `liff.shareTargetPicker()`.** A "Share" button in the MINI App detail
  screen sends a **self-contained** Flex listing card to chosen friends/groups, with a deep-link
  button back into the listing.
- **R4 — Book a viewing in the MINI App.** A date/time picker in the detail screen writes a
  `PropertyEvent`; the existing reminder sweep pushes the reminder into the user's 1:1 chat.

Explicitly **out of scope** (per the user): R2 (push a summary back via `sendMessages`), R5 (channel
verification), and everything verification gates (Service Messages, vanity URL, add-to-home-screen).

---

## R1 — Deep-link Flex detail card → catalog screen

The MINI App router already resolves `/p/{id}` (via `liff.state`) — we only need to emit the URL.

**Bot (build the link):**
- `core/handlers/views.ts`: add `catalogDeepLink(baseUrl, propertyId)` → `${base}/p/{id}` (or
  `undefined` when no base). In `propertyDetail()`, prepend a `🔎 Open in Catalog` `uri` action when a
  `catalogBaseUrl` option is supplied. Carousel cards stay unchanged (keeps them uncluttered;
  Details → detail card → Open in Catalog is the path).
- `core/handlers/catalogAssistant.ts`: add a 6th ctor arg `miniappUrl?`; pass
  `catalogBaseUrl: this.miniappUrl` in `viewProperty()`'s `propertyDetail()` call.
- `core/handlers/registry.ts`: `HandlerDeps.miniappUrl?` → forward to `CatalogAssistant`.
- `lambda/processor.ts`: pass `miniappUrl: env.MINIAPP_URL`.
- `adapters/config/config.ts`: add `MINIAPP_URL: z.string().url().optional()` to `EnvSchema`.

**Infra:**
- `infra/src/lambdas.ts`: processor env gets `MINIAPP_URL` from `config.get("miniappUrl")` (optional —
  a missing config just omits the button, mirroring the rich-menu Catalog tab).
- New Pulumi config to set at deploy: `pulumi config set miniappUrl https://miniapp.line.me/2010316767-rdtwc5y3`.

**Tests:** `views.test` — `propertyDetail(p, { catalogBaseUrl })` includes a `🔎 Open in Catalog`
uri action with `…/p/{id}`; omitted without the option (existing exact-label assertions stay green).

---

## R3 — Share a listing via `shareTargetPicker`

**MINI App only + a one-time console toggle.** Access nuance: a recipient who shares no conversation
with the sender hits the membership gate (404) on the deep link — so the shared **card is
self-contained** (title, status, price, type, area) and the deep-link button is a bonus for those who
can open it. Images are omitted (presigned URLs expire; a stale card would 403).

- `lib/share.ts` (new, pure, testable): `buildShareFlex(listing, deepLinkUrl)` → a LINE Flex
  **bubble** message object (`{ type: "flex", altText, contents }`) summarising the listing + a
  "View listing" `uri` button.
- `liff.ts`: `canShare()` = `liff.isApiAvailable("shareTargetPicker")`; `shareMessages(messages)`
  wraps `liff.shareTargetPicker(messages)`; `miniAppDeepLink(path)` = `https://miniapp.line.me/${LIFF_ID}${path}`.
- `screens/Detail.tsx`: a "Share" button (rendered only when `canShare()`); on tap build the share
  Flex from the loaded `PropertyDetail` + `miniAppDeepLink(detailPath(id))` and call `shareMessages`.
  Surface success / cancel / error inline.
- **Manual one-time step (documented):** LINE console → the LIFF/MINI-App channel → **LIFF tab** →
  consent to **"Agreement Regarding Use of Information"** (required to enable `shareTargetPicker`;
  no channel verification needed). No new LIFF scope.

**Tests:** `share.test` — `buildShareFlex` produces a valid bubble with the title, a price/area line,
and a `uri` button pointing at the deep link.

---

## R4 — Book a viewing (writes a PropertyEvent)

The read-api gains **one narrow write**: an authenticated, membership-gated route that creates a
follow-up `PropertyEvent` for the caller. The reminder target is the caller's **1:1** chat
(`user#{userId}`, derived from the id-token) so the existing reminder sweep pushes it with no change.

**Shared rule (no drift):**
- `core/domain/followup.ts` (new): `resolveFollowUpTime(datetimeLocal, nowMs)` →
  `{ ok:true, dueAt } | { ok:false, reason:"invalid"|"past" }` (wraps `parseBangkokLocal` + future
  check). `catalogAssistant.setFollowUp()` is refactored onto it; the read-api uses it too.
- `@line-robot/shared` `dto.ts`: `BookViewingRequest { datetimeLocal; title? }`,
  `BookViewingResponse { eventId; dueAt }`.

**Backend route:** `app/readApiHandler.ts` — `POST /properties/{id}/viewings`:
1. id-token → userId (existing). 2. membership gate via `allowedPropertyIds` (404 if not reachable).
3. parse JSON body; `resolveFollowUpTime` → 400 `{error:"invalid_time"|"past_time"}` on failure.
4. `addEvent({ eventId: randomUUID(), propertyId, dueAt, title: title||"Viewing",
   notifyConversationKey: "user#"+userId, createdAt: now })`. 5. `201 { eventId, dueAt }`.

**Infra (`infra/src/miniapp.ts`):**
- read-api role: add `dynamodb:PutItem` on the catalog table (only — no Update/Delete). Update the
  "READ-ONLY" comments to "read + one narrow membership-gated event write".
- Function URL CORS: `allowMethods: ["GET","POST"]` (`content-type` already allowed).

**MINI App:**
- `api.ts`: add `post<T>(path, idToken, body)` + `bookViewing(id, idToken, req)`.
- `screens/Detail.tsx`: a "📅 Book a viewing" button → inline form (`<input type="datetime-local">`,
  min=now, optional note) → `bookViewing`. Success: "Viewing booked for … — I'll remind you in LINE."
- Reminder requires the user to have the OA as a friend (they do — the MINI App is reached from the
  bot's rich menu). Noted, not enforced.

**Tests:** `followup.test` (invalid/past/ok); `readApiHandler.test` POST cases (404 non-member, 400
invalid + past, 201 creates the event with `notifyConversationKey = user#<userId>` + default title).

---

## Cross-cutting / deploy

- No change to the extractor schema → the 16-nullable structured-output limit is untouched.
- `npm run lint && npm run typecheck && npm run test` (bot + miniapp); rebuild the SPA so the new
  Detail screen ships; `cd infra && pulumi up` (sets `miniappUrl`, redeploys read-api with the POST
  route + PutItem + CORS, and the processor with `MINIAPP_URL`).
- Update `CLAUDE.md` "Current build plan" pointer → plan 17; add the shareTargetPicker console step.
