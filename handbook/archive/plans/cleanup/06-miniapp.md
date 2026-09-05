# LINE MINI App (React + LIFF) — Code Quality Findings

## Summary
The miniapp is small, well-scoped, and clearly written; the hexagonal intent is honoured (no domain logic in components, pure lib functions with good tests). The biggest concrete problem is that `types.ts` is a near-verbatim copy of `catalogDto.ts` in the bot package with renamed identifiers, creating a drift risk between the two packages that is currently managed only by a prose comment. Secondary concerns are: dead API surface (`upcoming`), a misleading `useEffect` comment in `App.tsx` that masks re-registration cost on every navigate, and a handful of minor accessibility gaps. The CSS approach and component decomposition are both well-judged for the app's size.

## Findings

### [F01] types.ts is a hand-maintained mirror of bot's catalogDto.ts — divergence risk
**Severity:** medium
**File:** packages/miniapp/src/types.ts:1–88
**Issue:** Every interface here (`PropertyListItem`, `PropertyDetail`, `Photo`, `Chanote`, `UpcomingItem`) is structurally identical to the corresponding `PropertyListDto`, `PropertyDetailDto`, `PhotoDto`, and `Chanote` in `packages/bot/src/core/handlers/catalogDto.ts` and `packages/bot/src/core/domain/catalog.ts`, with only surface-level renames (e.g. `PropertyListDto` → `PropertyListItem`). The comment on line 3 acknowledges this: "These mirror `catalogDto.ts` in the bot package — keep these in sync if the server DTOs change." Manual sync across a monorepo boundary is a recurring source of silent bugs — a field added server-side won't appear in the UI until someone remembers to copy it. The `Chanote` type is especially risky: it lives in the bot's domain layer, gets re-exported through `catalogDto.ts`, and is then re-declared verbatim in `types.ts`.
**Suggestion:** Extract a shared `packages/shared` (or `packages/api-types`) workspace package that exports the DTO interfaces. Both the bot's `readApiHandler` (the producer) and the miniapp (the consumer) import from it. This is one `npm init` + a `"references"` entry in both `tsconfig.json` files. Even short of that, expose the DTO types from the bot as an importable path (`@line-robot/bot/catalogDto`) so the miniapp imports rather than duplicates. The `Chanote` type is the highest-risk candidate because it has twelve optional fields.

### [F02] `upcoming` API method and `UpcomingItem` type are dead code
**Severity:** low
**File:** packages/miniapp/src/api.ts:32–33; packages/miniapp/src/types.ts:82–88
**Issue:** `api.upcoming()` and `UpcomingItem` are defined and exported but no screen, component, or test references them. The upcoming/follow-up screen was apparently planned but not built. Dead exported symbols inflate the public surface and mislead future contributors into thinking there is an Upcoming screen in the SPA.
**Suggestion:** Either delete both (`UpcomingItem` type + `api.upcoming` method) until the screen is built, or add a `// TODO: Upcoming screen (plan 15?)` block comment and keep them unstaged in a feature branch. Do not leave unreachable API methods as permanent fixtures in `main`.

### [F03] `normalizePath` duplicated between App.tsx and deeplink.ts
**Severity:** low
**File:** packages/miniapp/src/App.tsx:43–45; packages/miniapp/src/lib/deeplink.ts:14–16
**Issue:** `App.tsx` defines a private `normalizePath` function (line 43) with the body `path.replace(/\/+$/, "") || "/"`. `deeplink.ts` defines an identical private `normalize` function (line 14) with the same body. They implement the same invariant — strip trailing slashes, keep "/" — and must stay in sync. The duplication is small but it is exactly the kind of "I'll just copy the one-liner" slip that leads to subtle divergence.
**Suggestion:** Export `normalize` from `deeplink.ts` (rename to `normalizePath` for clarity) and import it in `App.tsx`. The function is already tested indirectly through `resolveInitialPath` and `parseRoute`.

### [F04] `useEffect` in `App.tsx` re-registers `popstate` on every navigation, with a misleading comment
**Severity:** low
**File:** packages/miniapp/src/App.tsx:18–27
**Issue:** The effect's dependency array is `[path]`, so it runs (and tears down + recreates the `popstate` listener) on every call to `navigate()`. The in-code comment says "Mount-only" (line 20), which is wrong and will confuse anyone trying to understand or modify the effect. The behaviour is not broken — the cleanup correctly removes the old listener before the new one is added — but the redundant churn and false comment are a maintenance hazard. The `history.replaceState` guard inside the same effect (line 21–23) is also redundant after the first mount because `navigate()` already calls `pushState`, so `location.pathname` will already equal `path` on subsequent runs.
**Suggestion:** Split the effect into two: one with `[]` (mount-only) that sets up the `popstate` listener, and a separate `useEffect([path])` (or inline inside `navigate()`) that calls `replaceState` only on the initial load. This matches the actual intent, removes the misleading comment, and eliminates the re-registration cost.

### [F05] `Filters` object constructed outside `useMemo` but captured inside it — unnecessary indirection
**Severity:** low
**File:** packages/miniapp/src/screens/List.tsx:53–57
**Issue:** `filters` is assembled on line 53 as a plain object from the four state variables, then captured by reference inside the `useMemo` on line 55. The dependency array on line 56 lists the four individual variables (`status`, `propertyType`, `area`, `query`), not `filters`. This works correctly — because the memo factory is a closure that captures the current `filters` value — but it is architecturally muddled: the object is created every render, yet the memo is the only consumer, and the dep array does not include it. A future developer adding a filter variable could update `filters` without updating the dep array and silently produce stale results.
**Suggestion:** Either inline the object construction inside the memo factory (`() => sortItems(applyFilters(items, { status, propertyType, area, query }), sort)`) and remove the `filters` variable entirely, or include `filters` in the dep array (using `useMemo` to stabilise the object itself). The first option is simpler and removes the redundant variable.

### [F06] Gallery `caption()` is called twice per photo — once for `alt`, once for `figcaption`
**Severity:** low
**File:** packages/miniapp/src/components/Gallery.tsx:31–33
**Issue:** Line 31 calls `caption(photo)` for the `<img alt>` attribute, and line 33 calls it again for the `<figcaption>` text. `caption()` is a pure function so there is no correctness issue, but it creates two identical string allocations per photo and makes the JSX slightly harder to read.
**Suggestion:** Assign `const cap = caption(photo)` inside the `photos.map()` callback and reference `cap` in both places. This is a one-line fix that also makes the relationship between the alt text and the visible caption explicit.

### [F07] Lightbox is not accessible — missing `role="dialog"`, `aria-modal`, and keyboard dismissal
**Severity:** medium
**File:** packages/miniapp/src/components/Gallery.tsx:38–47
**Issue:** The fullscreen lightbox is implemented as a `<button>` covering the viewport. It has `aria-label="Close photo"` (line 42) but no `role="dialog"` or `aria-modal="true"`, so screen readers treat it as a plain button rather than a modal layer. Focus is not trapped inside it and there is no keyboard `Escape` handler — a user navigating by keyboard cannot dismiss the lightbox without clicking. The `<img>` inside has an empty `alt=""` (correct for decorative), but the parent button's label "Close photo" does not describe the photo content to a screen reader either.
**Suggestion:** Wrap the lightbox in a `<dialog>` element (native browser dialog gets focus trap and Escape for free) with `open` controlled by the `fullscreen` state. Call `dialogRef.current?.showModal()` / `close()` in a `useEffect`. This is a ~10-line change and eliminates all three gaps without manual focus management.

### [F08] `ChanoteBlock` silently omits `province`, `district`, and `subdistrict` fields
**Severity:** low
**File:** packages/miniapp/src/screens/Detail.tsx:125–145; packages/miniapp/src/types.ts:40–42
**Issue:** `Chanote` in `types.ts` declares `province`, `district`, and `subdistrict` as optional fields (lines 40–42), and these are populated by OCR when available. `ChanoteBlock` renders eight other fields but never renders these three. They are simply dropped. It is not clear from the code whether this is a deliberate design decision (the location is visible from the deed image) or an oversight during implementation. No comment explains the omission.
**Suggestion:** Either add `<Field label="Province" value={c.province} />` / `district` / `subdistrict` lines to `ChanoteBlock`, or add a comment explaining why they are intentionally hidden (e.g. "Skipped — visible in the deed photo above and would duplicate the property address fields"). The current silence is a future maintenance trap.

### [F09] `formatDate` hardcodes Bangkok timezone via manual offset arithmetic instead of `Intl`
**Severity:** low
**File:** packages/miniapp/src/lib/format.ts:4–11
**Issue:** The function shifts the epoch value by `7 * 60 * 60_000` ms then reads UTC getters — a valid but fragile technique. The comment acknowledges it: "shift so UTC getters read Bangkok wall-clock." This approach hard-codes UTC+7 and is not robust to any future need to display in a different locale or timezone. The `Intl.DateTimeFormat` API is available in every environment this app targets (modern LINE webview, Chrome, Safari) and handles timezone by name cleanly. The MONTHS array (line 5) is also a manual English-only table.
**Suggestion:** Replace with `new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Bangkok' }).format(new Date(at))` — one line, no manual offset, correct DST handling if Thailand ever adopts it, and produces the same "2 Jun 2026" output. The MONTHS array can then be deleted.

### [F10] `card-title` truncates with `text-overflow: ellipsis` but is missing `white-space: nowrap`
**Severity:** low
**File:** packages/miniapp/src/styles.css:175–180
**Issue:** `.card-title` has `overflow: hidden` and `text-overflow: ellipsis` (lines 178–179) but no `white-space: nowrap`. Without `white-space: nowrap`, a multi-word title wraps to multiple lines and `text-overflow` never fires — the overflow is hidden vertically by the parent flex layout rather than shown as an ellipsis. The title does not visually truncate; it just gets clipped at the card height.
**Suggestion:** Add `white-space: nowrap` to `.card-title`, or replace the truncation approach with `-webkit-line-clamp: 2` (with `display: -webkit-box; -webkit-box-orient: vertical; overflow: hidden`) to show two lines with an ellipsis on the second — more useful for longer property titles that benefit from wrapping once.

### [F11] `api.ts` has no request timeout or network error differentiation
**Severity:** low
**File:** packages/miniapp/src/api.ts:17–25
**Issue:** The `get()` helper wraps `fetch()` with no timeout. On a poor mobile connection inside the LINE app, a stalled request will spin the `Spinner` indefinitely because `fetch()` only rejects on network failure, not on timeout. The `ErrorView` distinguishes HTTP 401/404/other but has no path for "network offline" or "request timed out" (both produce an opaque `TypeError` from `fetch()`). The generic "Something went wrong" message is shown for all non-API errors.
**Suggestion:** Add an `AbortController` + `setTimeout` inside `get()` (e.g. 15 s) and throw a distinct error class (e.g. `TimeoutError`) on abort. Add a matching branch to `ErrorView` for network errors: "Check your connection and try again." This is a ~10-line change in `api.ts` and a one-line addition to `ErrorView`.

### [F12] `Spinner` return type is `ComponentChildren` instead of `JSX.Element`
**Severity:** low
**File:** packages/miniapp/src/ui.tsx:9
**Issue:** `Spinner` is annotated as returning `ComponentChildren` rather than `JSX.Element` (or `preact.VNode`). `ComponentChildren` is the type for what a component *receives* as `children`, not what it returns. While Preact accepts this at runtime, the annotation is semantically wrong and will confuse TypeScript inference when `<Spinner />` is used in conditional JSX — the compiler types the expression as `ComponentChildren` rather than the narrower element type.
**Suggestion:** Change the return type to `JSX.Element` (import `JSX` from `"preact"`). This is consistent with the other components in the file (`ErrorView`, `Field`, `Badge` all return implicit `JSX.Element`).

### [F13] `ListScreen` shows item count for total items, not filtered items — potentially misleading
**Severity:** low
**File:** packages/miniapp/src/screens/List.tsx:71
**Issue:** The header displays `{items.length}` (the total fetched count) at line 71, adjacent to the "Listings" heading. When filters are active, `visible.length` is smaller than `items.length`, yet the count shown does not change. A user who selects a status chip sees e.g. "Listings 42" while only 5 cards are displayed below — confusing.
**Suggestion:** Show `{visible.length}` in the header when any filter is active, e.g. `{visible.length < items.length ? `${visible.length} of ${items.length}` : items.length}`. Alternatively show `visible.length` always, which is simpler and equally useful.

## Cross-cutting patterns

**Consistent async pattern, but duplicated verbatim.** Both `ListScreen` and `DetailScreen` share an identical fetch-on-mount pattern: `useState<AsyncState<T>>`, `reloadKey` bump for retry, `cancelled` flag for cleanup, and inline `.then(success, failure)`. This is 20+ lines of boilerplate repeated in two places. A `useFetch<T>(fetcher, deps)` custom hook would unify them and make adding a third screen trivial.

**`idToken` acquisition is a caller responsibility, not the API client's.** Every API call requires the caller to get the token, null-check it, synthesise a 401 `ApiError`, and pass it as a parameter. The `api` object could instead call `getIdToken()` internally and throw `new ApiError(401)` when it is null — that's exactly what both screens currently do manually. The current design leaks the LIFF abstraction into the screen layer.

**No test for `format.ts`.** `deeplink.ts` and `predicates.ts` both have dedicated test files with good coverage. `format.ts` has no test at all — the `formatDate` function's manual epoch-shift arithmetic is the kind of logic most likely to be wrong at month/year boundaries (UTC midnight vs Bangkok midnight, January vs December wrap). A three-case test (start of month, end of year, known Bangkok date) would lock in correctness.

**Inline ternary chains in JSX are verbose but consistent.** Throughout `Detail.tsx` and `List.tsx`, optional values are rendered as `{x !== undefined ? <Thing value={x} /> : null}`. This is the correct Preact pattern (falsy `0` would render without the explicit check) and is used uniformly. The `Field` component absorbs most of this at the leaf level, which is well-designed.
