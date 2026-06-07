# Plan 14 (LINE MINI App) — Design Review

## Epoch summary

Plan 14 added a read-only LIFF SPA (React/Preact on CloudFront + S3) that lets LINE users browse their property catalog outside of chat. A new `read-api` Lambda serves three JSON routes — `GET /me/properties`, `GET /properties/{id}`, and `GET /me/upcoming` — secured by verifying the LIFF id-token against LINE's verify endpoint. The Catalog tab was added to the rich menu as a fifth `uri` action.

---

## Design concerns introduced

### [D01] Photo ordering and hero selection duplicated from `catalogAssistant`

**Severity:** medium

**File(s):** `packages/bot/src/app/readApiHandler.ts:31-50`

**What was introduced:** `PHOTO_KIND_ORDER`, `orderedPhotos`, and `heroPhotoKey` were copied verbatim into `readApiHandler.ts`. The identical logic (including the same sentinel value `9` for unknown kinds) already lives in `packages/bot/src/core/handlers/catalogAssistant.ts:27-43`. The comment in the handler even acknowledges the duplication: "Gallery order: property photos first, then chanote scans, then other documents (matches the chat gallery)."

**Why it's a problem:** Two implementations of the same ordering rule will drift. The `catalogAssistant` version uses a typed `Record<PhotoKind, number>` (which catches a missing kind at compile time); the handler uses `Record<string, number>` (silent). If a new `kind` value is ever added to the domain, only one copy will be updated.

**Better approach:** Lift `PHOTO_KIND_ORDER`, `orderedPhotos`, and `heroPhotoKey` out of `catalogAssistant` into `packages/bot/src/core/handlers/photoHelpers.ts` (or into `catalogDto.ts` itself, since `toDetailDto` already knows about photos). Both `catalogAssistant` and `readApiHandler` import from that one location. The hero-key logic belongs in `catalogDto.ts` alongside `presignGallery`, which already has the signer; or even better, make `toDetailDto` accept the pre-sorted `PhotoDto[]` and have a single shared helper produce them.

---

### [D02] `allowedPropertyIds` executes a redundant fan-out that duplicates `listPropertiesForUser`

**Severity:** medium

**File(s):** `packages/bot/src/app/readApiHandler.ts:109-116`, `packages/bot/src/adapters/dynamodb/catalogRepository.ts:697-705`

**What was introduced:** `handlePropertyDetail` computes membership by calling `listUserConversations` then `listConversationProperties` for every conversation key, building a `Set<string>`. This is exactly what `listPropertiesForUser` already does internally — it too calls `listUserConversations` → `listConversationProperties` → fan-out `getProperty`. So a single detail request now makes two full fan-out traversals: one in `allowedPropertyIds` (to get ids) and one in — nothing, actually; `handlePropertyDetail` then calls `getProperty(propertyId)` separately. But the user's entire conversation graph is traversed just to build an id set, when `listPropertiesForUser` would have returned full `Property` objects the caller could have checked directly.

**Why it's a problem:** For a user with many conversations, the membership check alone issues `1 + N` DynamoDB queries (one for conversations, one per conversation for property ids). If those N property lists are large, this is a non-trivial cold read just to validate access. The existing port already has `listPropertiesForUser` which does the same traversal; the handler could extract membership from that result instead of re-traversing.

**Better approach:** Either (a) add a `hasPropertyAccess(userId, propertyId): Promise<boolean>` method to the `CatalogRepository` port that can be implemented as a single-item membership check without loading all properties, or (b) call `listPropertiesForUser` once and check whether the target id is in the returned set — reusing the already-loaded `Property` objects for the detail response. Option (b) is a one-line change in `handlePropertyDetail` that eliminates the duplicate traversal.

---

### [D03] `handleUpcoming` issues a `listPropertyEvents` per property — an O(N) fan-out with no cap

**Severity:** medium

**File(s):** `packages/bot/src/app/readApiHandler.ts:152-175`

**What was introduced:** `handleUpcoming` fetches all of the user's properties, then fires a `listPropertyEvents` query per property in a `Promise.all`. For a user with many listings, this is N+1 DynamoDB round trips inside a single Lambda invocation. There is no upper bound.

**Why it's a problem:** The reminder sweep already owns a `findDueEvents(nowIso, limit)` query that uses the GSI2 sparse index to find un-notified events globally — but it can't be scoped to a single user without an additional membership check. The current approach will be slow and potentially expensive for active users, and has no timeout guard. A user with 50 properties = 51 DynamoDB calls just to render the upcoming tab.

**Better approach:** Either (a) add a user-scoped upcoming query to the `CatalogRepository` port (e.g. `listUpcomingEventsForUser(userId)`), backed by a GSI that indexes by user or by walking the already-computed property set in a single BatchGetItem; or (b) accept the fan-out but enforce a cap (e.g. top 20 most-recently-active properties) documented in the port. At minimum, add a comment acknowledging the N+1 and the open GSI3 ticket from the plan.

---

### [D04] `idToken` is threaded as a raw string parameter through each `useEffect` rather than held in a stable module-level reference

**Severity:** low

**File(s):** `packages/miniapp/src/screens/List.tsx:30-31`, `packages/miniapp/src/screens/Detail.tsx:19-20`

**What was introduced:** Both `ListScreen` and `DetailScreen` call `getIdToken()` at the top of their `useEffect` fetch logic, obtaining the token at effect-run time. The token is not stored in state or passed as a prop, so if `liff.getIDToken()` ever returns a different value between the mount and a reload (e.g. after a token refresh), the two screens get their tokens from separate `getIdToken()` calls with no coordination. The `getIdToken` call inside `useEffect` also means any token-related error surfaces as an `ApiError(401)` state rather than being handled at the app boundary.

**Why it's a problem:** LIFF rotates the id-token transparently, so in practice a stale token is unlikely. But architecturally, token acquisition is an I/O concern that belongs in one place. Both screens duplicate the same `if (token === null) { setState({ status: "error", ... }) }` guard. If a third screen is added, this pattern is copied a third time.

**Better approach:** Hoist token acquisition to `App.tsx` or a context/hook (e.g. `useIdToken(): string | null`). Pass it as a prop to each screen, or store it in a React context. Token-null means the app is not authenticated and the `ErrorView` should be shown at the router level, not silently inside individual screens. This would also make the screens easier to unit-test (inject the token rather than mock the `liff` module).

---

### [D05] `packages/miniapp/src/types.ts` is a manual copy of `packages/bot/src/core/handlers/catalogDto.ts` with no enforced contract

**Severity:** medium

**File(s):** `packages/miniapp/src/types.ts`, `packages/bot/src/core/handlers/catalogDto.ts`

**What was introduced:** The miniapp's `PropertyListItem`, `PropertyDetail`, `Photo`, and `Chanote` interfaces are hand-copied from the bot's `PropertyListDto`, `PropertyDetailDto`, `PhotoDto`, and `Chanote` domain type. The comment in `types.ts` explicitly says "These mirror `catalogDto.ts` in the bot package — keep these in sync if the server DTOs change." The `Chanote` type is even a full re-declaration of the same domain struct that already exists in `packages/bot/src/core/domain/catalog.ts`.

**Why it's a problem:** There is no compile-time enforcement that the client and server types agree. When a field is added to `PropertyDetailDto` on the server (e.g. a new `videoUrl` optional field), nothing reminds the developer to update `types.ts`. The comment "keep these in sync" is the entire safety net. In a mono-repo, this is avoidable.

**Better approach:** Create a shared `packages/api-types` (or `packages/shared`) package that both `packages/bot` and `packages/miniapp` import. Export the DTO interfaces from there; `catalogDto.ts` imports them to satisfy its return types, and `types.ts` is replaced by a re-export. This is a one-time workspace setup cost that eliminates the drift risk permanently. As a lighter alternative, export the DTO interfaces from `catalogDto.ts` and re-export them from `miniapp/src/types.ts` using `export type { PropertyDetailDto as PropertyDetail }` — at least then a rename in `catalogDto.ts` becomes a compile error in the miniapp.

---

### [D06] Bangkok timezone offset re-declared as a module-level constant in the miniapp

**Severity:** low

**File(s):** `packages/miniapp/src/lib/format.ts:4`

**What was introduced:** `const BANGKOK_OFFSET_MS = 7 * 60 * 60_000` and the `MONTHS` array were re-declared in `format.ts`. The identical constant and array already exist in `packages/bot/src/core/domain/datetime.ts:10-13`, along with a `formatShortDate` function that produces the same `"2 Jun"` output (minus the year).

**Why it's a problem:** If the offset ever needed to change (unlikely, Bangkok has no DST, but the principle holds), there are now two places to update. More concretely, the `MONTHS` array can go stale: if a developer decides to localise month names in the bot, they must also remember to update the miniapp copy. The comment in `format.ts` says "to match the chat bot's stamps" — but that guarantee is purely manual.

**Better approach:** Move the constant and `MONTHS` array into the shared types package proposed in D05. Alternatively, export `BANGKOK_OFFSET_MS` and `MONTHS` from `datetime.ts` and import them in the miniapp (if the packages share a workspace and the miniapp is allowed to depend on a `@line-robot/shared` package). If cross-package dependencies are not desired, at minimum inline a comment with the source file reference so future developers know which file is the source of truth.

---

### [D07] `readApiHandler.ts` contains all HTTP dispatch, business logic, and presign orchestration in one 233-line file

**Severity:** low

**File(s):** `packages/bot/src/app/readApiHandler.ts`

**What was introduced:** The handler file contains: bearer-token extraction, route dispatch (a string-matching router), per-route business logic (sort, membership gate, gallery presigning, upcoming aggregation), photo ordering, and the `presign`/`presignHero`/`presignGallery` helper chain. All of this is co-located in one file.

**Why it's a problem:** The hexagonal convention elsewhere in this codebase separates domain logic (core/handlers) from orchestration (app/) from I/O (adapters). Here, photo ordering is domain logic that ended up in an app-layer file. Route dispatch is infrastructure concern embedded alongside business rules. The file will grow quickly if routes are added.

**Better approach:** Extract `presignGallery`, `presignHero`, and `orderedPhotos` into `catalogDto.ts` (which already owns the DTO shape and is described as the place that "attaches" photos). Move the photo ordering constant there too (resolving D01 simultaneously). The handler then becomes a thin dispatcher that calls `toDetailDto` + `presignGallery` and returns `json(200, result)`. This aligns with how `catalogAssistant.ts` delegates all view-building to `views.ts`.

---

### [D08] CloudFront cache policy referenced by a hardcoded magic string

**Severity:** low

**File(s):** `infra/index.ts:636`

**What was introduced:** The SPA's CloudFront distribution uses `cachePolicyId: "658327ea-f89d-4fab-a63d-7e88639e58f6"` — the AWS Managed `CachingOptimized` policy — identified only by a UUID with a brief inline comment.

**Why it's a problem:** The UUID is opaque. A reader must look up the value to confirm what policy it refers to. If the `@pulumi/aws` provider exposes this as a named constant (it does: `aws.cloudfront.CachePolicyIds.cachingOptimized` in some versions), the magic string is unnecessary. The comment partially mitigates this, but the comment can drift from the value.

**Better approach:** Replace with the Pulumi-provided constant if available, or declare `const CLOUDFRONT_CACHING_OPTIMIZED_POLICY_ID = "658327ea-f89d-4fab-a63d-7e88639e58f6"; // AWS Managed-CachingOptimized` at the top of the infra file so the UUID is named in one place.

---

## What was done well

1. **Clean hexagonal seam for token verification.** `LineTokenVerifier` is a one-method port in `core/ports/`; the `LineIdTokenVerifier` adapter is in `adapters/line/`; tests use a hand-written fake. This is textbook ports-and-adapters for a third-party network call, and makes the handler fully unit-testable without any mocking.

2. **Test coverage is present and meaningful for the new behavior.** `readApiHandler.test.ts`, `catalogDto.test.ts`, `lineTokenVerifier.test.ts`, `richMenu.test.ts`, `deeplink.test.ts`, and `predicates.test.ts` all ship with the epoch. The handler tests cover auth (401 paths), membership enforcement (404 for unowned property), presign failure resilience (bad photo is dropped, not 500'd), and the CORS invariant. This is well above average for a "move fast" feature.

3. **The miniapp's pure-logic layer (`lib/`) is properly isolated and tested.** `predicates.ts`, `deeplink.ts`, and `format.ts` have zero framework imports; they are plain TypeScript functions. `liff.ts` is the only LIFF-touching module, making every other file testable with vitest in Node. This is the right structure.

---

## Patterns

The recurring shortcut in this epoch is **duplication in preference to extraction.** When the miniapp needed something the bot already had — photo ordering, date formatting, Bangkok offset, search haystack building — the code was copied rather than shared. Each copy comes with a "mirrors X" or "matches Y" comment acknowledging the duplication, which signals the author was aware but chose speed over structure. The same pattern appears in `allowedPropertyIds` duplicating the traversal inside `listPropertiesForUser`.

The root cause is the mono-repo lacking a shared package: `packages/bot` and `packages/miniapp` have no common dependency to import from, so anything needed in both places must be duplicated. The architectural fix (D05) for the type duplication would also resolve D01 and D06 as a side effect.
