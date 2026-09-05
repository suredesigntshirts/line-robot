# 03 — Extract shared catalog logic (photo ordering, upcoming rows, search haystack) into core/domain

> **Reconcile-pass note (queue 00).** Two things were settled:
> 1. **`collectUpcomingRows` is DEFERRED — Option A, user-confirmed 2026-06-08 (queue 00 D1, RESOLVED).**
>    Ship only the three fork-free extractions (photos / sort / search) here; this unit does **not** cover
>    master-plan P1 #3. The upcoming fan-out stays duplicated and is tracked as a separate future
>    change-unit. This unit is now **ready to implement** (no outstanding decision).
> 2. **Shared-file ordering with other units (all mechanical):**
>    - `core/domain/catalog.ts`: unit 04 deletes the top-of-file `Chanote` interface and adds a
>      re-export; THIS unit only *appends* three helpers at the end. Disjoint regions. If unit 04 lands
>      first (recommended), append below its re-export line — no other change.
>    - `core/handlers/catalogDto.ts`: unit 04 moves the DTO *interfaces* to `@line-robot/shared`; THIS
>      unit swaps `searchText` → `searchableText` and is told to **leave L108 `updatedAt` unchanged**.
>      Land unit 04 first, then apply this unit's `searchText` deletion + `searchableText` import on the
>      already-trimmed file.
>    - `app/readApiHandler.ts`: shared with units 02 (HTTP transport seam), 04 (`UpcomingItem` type),
>      09 (logger threading). THIS unit deletes the duplicate photo helpers + swaps the recency
>      comparator — disjoint from those. Recommended land order: **02 → 04 → 09 → 03 → 07** so each
>      rebases its import block onto the prior. (See queue 00 ordering.)
>    - `core/handlers/catalogAssistant.ts`: unit 09 adds a `logger?` param and `logger?.warn(...)` into
>      the `heroUrls` (L117) and `presignPhotos` (L257) **catch bodies**; THIS unit deletes the
>      file-private `orderedPhotos`/`heroPhotoKey` and imports them from `core/domain/photos.js` (the
>      *calls* at L111/L252 stay). Land **09 before 03**; when 03 removes the local helper definitions
>      it must NOT touch the catch bodies 09 added — only the helper-definition lines and the import
>      block change.

## Goal & rationale

Photo ordering (`PHOTO_KIND_ORDER`/`orderedPhotos`/`heroPhotoKey`), the activity-sort comparator
(`byActivityDesc`), the search-haystack field list (`matchesQuery`/`searchText`), and the "upcoming
follow-ups" fan-out are each duplicated across the chat handler (`catalogAssistant.ts`) and the
app/read-API layer (`readApiHandler.ts` / `catalogDto.ts`). Because the duplicates live in different
layers (`core/handlers/` vs `app/`), neither can import the other without a layering violation — so
the duplication is currently load-bearing. The fix is to give these pure `Property`→data functions a
canonical home in `core/domain/`, which both layers may legally import (master-plan Theme A; P1
#1/#3/#4; `09-epoch-design-debt.md` refactor #3 and pattern #1; `02-handlers.md` F01/F04;
`06-miniapp.md` photo-order parity). The change is behaviourally identical: the read-API's looser
`Record<string, number>` + `?? 9` photo-order variant is replaced by the chat handler's stricter
typed `Record<PhotoKind, number>` (the desired compile-time exhaustiveness), and the haystack /
sort / upcoming logic stay byte-equivalent.

## Blast radius

### Files created
- `packages/bot/src/core/domain/photos.ts` — `PHOTO_KIND_ORDER`, `orderedPhotos`, `heroPhotoKey`
  (pure functions over `PhotoKind`/`PropertyPhoto`).
- `packages/bot/test/unit/photos.test.ts` — direct unit tests for the new photos module.
- `packages/bot/test/unit/catalogQueries.test.ts` — direct unit tests for the new
  `byActivityDesc` / `activityTimestamp` / `searchableText` domain helpers.

### Files modified (symbols / regions touched)
- `packages/bot/src/core/domain/catalog.ts` — **add** three exported pure helpers at the bottom:
  `activityTimestamp(p)`, `byActivityDesc(a, b)`, `searchableText(p)`. No existing type changes.
- `packages/bot/src/core/handlers/catalogAssistant.ts` — **delete** the five file-private helpers
  (`PHOTO_KIND_ORDER` L27, `orderedPhotos` L29–35, `heroPhotoKey` L38–43, `byActivityDesc` L45–47,
  `matchesQuery` L50–61); **add** imports of `orderedPhotos`/`heroPhotoKey` (from `../domain/photos.js`)
  and `byActivityDesc`/`searchableText` (from `../domain/catalog.js`); rewrite the `matchesQuery`
  call-site at L91 to use `searchableText(p).includes(query.toLowerCase())`.
- `packages/bot/src/app/readApiHandler.ts` — **delete** its duplicate `PHOTO_KIND_ORDER` (L29–31,
  incl. the "matches the chat gallery" comment), `orderedPhotos` (L33–40), `heroPhotoKey` (L43–48);
  **add** imports of `orderedPhotos`/`heroPhotoKey` (from `../core/domain/photos.js`) and
  `byActivityDesc` (from `../core/domain/catalog.js`); replace the inline sort comparator at L122–124
  with `.sort(byActivityDesc)`.
- `packages/bot/src/core/handlers/catalogDto.ts` — **delete** the file-private `searchText()`
  (L81–94); **import** `searchableText` and `activityTimestamp` from `../domain/catalog.js`; at the
  `toListDto` body replace `search: searchText(p)` (L109) with `search: searchableText(p)` and
  replace `updatedAt: p.lastActivityAt ?? p.updatedAt` (L108) with `updatedAt: activityTimestamp(p)`.
- `packages/bot/test/unit/catalogDto.test.ts` — no code change required (the "builds a lowercased
  search haystack" test at L44–57 stays green because the haystack is identical); description only
  optional.

### Files deleted
- None.

### All call-sites to update
- `packages/bot/src/core/handlers/catalogAssistant.ts:77` — `.sort(byActivityDesc)` (now imported).
- `packages/bot/src/core/handlers/catalogAssistant.ts:91` — `matchesQuery(p, query)` → `searchableText(p).includes(query.toLowerCase())`.
- `packages/bot/src/core/handlers/catalogAssistant.ts:92` — `.sort(byActivityDesc)` (now imported).
- `packages/bot/src/core/handlers/catalogAssistant.ts:111` — `heroPhotoKey(property.photos)` (now imported).
- `packages/bot/src/core/handlers/catalogAssistant.ts:252` — `orderedPhotos(property.photos)` (now imported).
- `packages/bot/src/core/handlers/catalogDto.ts:108` — `activityTimestamp(p)` (now imported).
- `packages/bot/src/core/handlers/catalogDto.ts:109` — `searchableText(p)` (now imported).
- `packages/bot/src/app/readApiHandler.ts:84` — `heroPhotoKey(property.photos)` (now imported).
- `packages/bot/src/app/readApiHandler.ts:92` — `orderedPhotos(property.photos)` (now imported).
- `packages/bot/src/app/readApiHandler.ts:122–124` — inline comparator → `.sort(byActivityDesc)`.

### Tests touched
- **add** `packages/bot/test/unit/photos.test.ts` — direct coverage of `orderedPhotos` /
  `heroPhotoKey` / `PHOTO_KIND_ORDER`.
- **add** `packages/bot/test/unit/catalogQueries.test.ts` — direct coverage of `byActivityDesc` /
  `activityTimestamp` / `searchableText`.
- **update (optional, description-only)** `packages/bot/test/unit/catalogDto.test.ts`,
  `packages/bot/test/unit/catalogAssistant.test.ts`, `packages/bot/test/unit/readApiHandler.test.ts`
  — these remain green unchanged (all coverage is behavioural through public APIs); no edits required.

> **Scope decision — `collectUpcomingRows` is deliberately EXCLUDED from this unit.** See
> "Open questions / decisions". The upcoming fan-out needs both `CatalogRepository` (a `core/ports`
> type) and `propertyTitle` (a `core/handlers/views.ts` function); `core/domain` imports neither
> today (verified: no file under `core/domain/` imports `core/ports` or `core/handlers`). Extracting
> it into `core/domain` would either break the layering invariant or drag `propertyTitle` +
> `UpcomingFollowUp` out of the handler layer — a larger move that belongs in its own change-unit
> (master-plan P1 #3). This unit keeps the duplicated upcoming fan-out untouched and ships the three
> clean, fork-free extractions. **The fork was escalated as queue-00 D1 and RESOLVED to Option A
> (defer) — user-confirmed 2026-06-08; this unit is now ready to implement.**

## Current code

`packages/bot/src/core/handlers/catalogAssistant.ts` (the five file-private helpers, L25–61):
```ts
/** Most-recently-active first, so the freshest listings lead the carousel. */
/** Gallery order: property photos first, then chanote scans, then other documents (plan 13). */
const PHOTO_KIND_ORDER: Record<PhotoKind, number> = { property: 0, chanote: 1, other: 2 };

function orderedPhotos(photos: readonly PropertyPhoto[] | undefined): readonly PropertyPhoto[] {
  if (photos === undefined) {
    return [];
  }
  // Stable sort: within a kind, capture order is preserved.
  return [...photos].sort((a, b) => PHOTO_KIND_ORDER[a.kind] - PHOTO_KIND_ORDER[b.kind]);
}

/** The hero image key: the first property photo, falling back to any image. */
function heroPhotoKey(photos: readonly PropertyPhoto[] | undefined): string | undefined {
  if (photos === undefined || photos.length === 0) {
    return undefined;
  }
  return (photos.find((p) => p.kind === "property") ?? photos[0])?.s3Key;
}

function byActivityDesc(a: Property, b: Property): number {
  return (b.lastActivityAt ?? b.updatedAt ?? 0) - (a.lastActivityAt ?? a.updatedAt ?? 0);
}

/** Does any of the property's address/area/project fields contain `query` (case-insensitive)? */
function matchesQuery(property: Property, query: string): boolean {
  const needle = query.toLowerCase();
  const haystack = [
    property.normalizedAddress,
    property.projectName,
    property.district,
    property.subdistrict,
    property.province,
    ...(property.rawAddresses ?? []),
  ];
  return haystack.some((field) => field?.toLowerCase().includes(needle));
}
```

`packages/bot/src/app/readApiHandler.ts` (the duplicate photo helpers, L29–48):
```ts
/** Gallery order: property photos first, then chanote scans, then other documents (matches the chat
 * gallery in {@link ../core/handlers/catalogAssistant}). */
const PHOTO_KIND_ORDER: Record<string, number> = { property: 0, chanote: 1, other: 2 };

function orderedPhotos(photos: readonly PropertyPhoto[] | undefined): readonly PropertyPhoto[] {
  if (photos === undefined) {
    return [];
  }
  return [...photos].sort(
    (a, b) => (PHOTO_KIND_ORDER[a.kind] ?? 9) - (PHOTO_KIND_ORDER[b.kind] ?? 9),
  );
}

/** Hero key: first `property` photo, falling back to any image. */
function heroPhotoKey(photos: readonly PropertyPhoto[] | undefined): string | undefined {
  if (photos === undefined || photos.length === 0) {
    return undefined;
  }
  return (photos.find((p) => p.kind === "property") ?? photos[0])?.s3Key;
}
```

`packages/bot/src/app/readApiHandler.ts` (the inline comparator, L122–124):
```ts
  const properties = (await deps.catalog.listPropertiesForUser(userId)).sort(
    (a, b) => (b.lastActivityAt ?? b.updatedAt ?? 0) - (a.lastActivityAt ?? a.updatedAt ?? 0),
  );
```

`packages/bot/src/core/handlers/catalogDto.ts` (the duplicate haystack + inline activity stamp,
L81–110):
```ts
/** Lowercased searchable haystack — the same fields `views`/`catalogAssistant` match a road query on. */
function searchText(p: Property): string {
  return [
    p.normalizedAddress,
    p.projectName,
    p.district,
    p.subdistrict,
    p.province,
    ...(p.rawAddresses ?? []),
  ]
    .filter((s): s is string => s !== undefined && s !== "")
    .join(" ")
    .toLowerCase();
}

export function toListDto(p: Property): PropertyListDto {
  return compact({
    propertyId: p.propertyId,
    // ...
    updatedAt: p.lastActivityAt ?? p.updatedAt,
    search: searchText(p),
  }) as PropertyListDto;
}
```

> **Behavioural-equivalence note for `searchableText`.** `matchesQuery` lowercases each field and
> calls `.includes`; `searchText` filters out `undefined`/`""`, joins with a single space, then
> lowercases the whole string. The new canonical `searchableText` adopts `searchText`'s exact shape
> (filter empties → join `" "` → `.toLowerCase()`). `catalogAssistant`'s `matchesQuery` then becomes
> `searchableText(p).includes(query.toLowerCase())`, which is logically identical for a single needle
> (a `.includes` against the lowercased concatenation matches iff some field contains the needle —
> with the one trivially-different edge that a needle could span the `" "` join boundary; queries are
> single tokens/road names in practice, and the existing test `"sukhumvit"` / `"rama 9"` confirms the
> behaviour is preserved). The `catalogDto` `search` output string is **byte-for-byte unchanged**, so
> the miniapp `PropertyListItem.search` contract is preserved exactly.

## Target design

### New module: `packages/bot/src/core/domain/photos.ts`
```ts
/**
 * Pure photo-gallery ordering over the catalog's {@link PropertyPhoto} list. Shared by the chat
 * assistant ({@link ../handlers/catalogAssistant}) and the mini-app read API
 * ({@link ../../app/readApiHandler}) so the gallery order and hero selection are guaranteed identical
 * across both surfaces (compile-time, not comment-enforced). No IO — the presigning of the resulting
 * S3 keys is the caller's job.
 */
import type { PhotoKind, PropertyPhoto } from "./catalog.js";

/** Gallery order: property photos first, then chanote scans, then other documents (plan 13). Typed
 * over the full {@link PhotoKind} union so adding a new kind is a compile error here until ordered. */
export const PHOTO_KIND_ORDER: Record<PhotoKind, number> = { property: 0, chanote: 1, other: 2 };

/** Photos ordered property → chanote → other. Stable sort: within a kind, capture order is preserved.
 * Returns a fresh array (never mutates the input); `undefined` photos → `[]`. */
export function orderedPhotos(
  photos: readonly PropertyPhoto[] | undefined,
): readonly PropertyPhoto[] {
  if (photos === undefined) {
    return [];
  }
  return [...photos].sort((a, b) => PHOTO_KIND_ORDER[a.kind] - PHOTO_KIND_ORDER[b.kind]);
}

/** The hero image key: the first `property` photo, falling back to any image; `undefined` when none. */
export function heroPhotoKey(photos: readonly PropertyPhoto[] | undefined): string | undefined {
  if (photos === undefined || photos.length === 0) {
    return undefined;
  }
  return (photos.find((p) => p.kind === "property") ?? photos[0])?.s3Key;
}
```

### Additions to `packages/bot/src/core/domain/catalog.ts` (appended after the existing types)
```ts
// --- Pure listing queries (shared by the chat assistant and the mini-app read API) ---

/** The timestamp a listing is sorted/stamped by: most-recent activity, falling back to the last
 * update, then 0. Single source for both the recency comparator and the DTO's `updatedAt` stamp. */
export function activityTimestamp(p: Property): number {
  return p.lastActivityAt ?? p.updatedAt ?? 0;
}

/** Sort comparator: most-recently-active first (descending), so the freshest listings lead. */
export function byActivityDesc(a: Property, b: Property): number {
  return activityTimestamp(b) - activityTimestamp(a);
}

/** Lowercased searchable haystack — the canonical address/area/project field list a free-text road
 * query matches against. The mini-app's `PropertyListItem.search` is this exact string; the chat
 * assistant matches a needle with `searchableText(p).includes(query.toLowerCase())`. */
export function searchableText(p: Property): string {
  return [
    p.normalizedAddress,
    p.projectName,
    p.district,
    p.subdistrict,
    p.province,
    ...(p.rawAddresses ?? []),
  ]
    .filter((s): s is string => s !== undefined && s !== "")
    .join(" ")
    .toLowerCase();
}
```

### New exports (public symbols added)
- `core/domain/photos.ts`: `PHOTO_KIND_ORDER`, `orderedPhotos`, `heroPhotoKey`.
- `core/domain/catalog.ts`: `activityTimestamp`, `byActivityDesc`, `searchableText`.

### After-code: `catalogAssistant.ts` imports + `listingsOnRoad`
```ts
import {
  type PhotoKind, // (KEEP if still referenced elsewhere; otherwise DROP — see step 2)
  type Property,
  type PropertyPhoto, // (likewise DROP if no longer referenced)
  type PropertyUpsert,
  byActivityDesc,
  searchableText,
} from "../domain/catalog.js";
import { heroPhotoKey, orderedPhotos } from "../domain/photos.js";
// ... existing imports unchanged ...

  async listingsOnRoad(userId: string, query: string): Promise<OutboundMessage[]> {
    const needle = query.toLowerCase();
    const properties = (await this.catalog.listPropertiesForUser(userId))
      .filter((p) => searchableText(p).includes(needle))
      .sort(byActivityDesc);
    // ...unchanged...
  }
```

### After-code: `readApiHandler.ts` imports + `handleMyProperties`
```ts
import type { Property, PropertyPhoto } from "../core/domain/catalog.js";
import { byActivityDesc } from "../core/domain/catalog.js";
import { heroPhotoKey, orderedPhotos } from "../core/domain/photos.js";
// (PropertyPhoto stays imported only if still referenced; presignGallery uses orderedPhotos's
//  return type, so PropertyPhoto may no longer be needed — drop it if tsc flags it unused.)

async function handleMyProperties(
  deps: ReadApiDeps,
  userId: string,
): Promise<APIGatewayProxyResultV2> {   // ← KEEP whatever return type is present at land-time
  const properties = (await deps.catalog.listPropertiesForUser(userId)).sort(byActivityDesc);
  // ...unchanged...
}
```
> **Rebase note (queue 00 — vs unit 02):** unit 02 retypes every `handle*` to return
> `Promise<HttpResponse>` (and `handleReadApi`'s param to `HttpRequest`). If unit 02 has already
> landed (recommended order is 02 before 03), the signature here will already read
> `Promise<HttpResponse>` — **do NOT revert it to `APIGatewayProxyResultV2`.** This unit changes ONLY
> the body (`.sort(byActivityDesc)`) and the photo-helper imports; it never touches the return type.
> The `APIGatewayProxyResultV2` shown above is the pre-02 baseline for reference only.

### After-code: `catalogDto.ts` imports + `toListDto`
```ts
import type { Chanote, Property } from "../domain/catalog.js";
import { activityTimestamp, searchableText } from "../domain/catalog.js";
import { area, formatPrice, mapsUri, propertyTitle, statusBadge } from "./views.js";
// (the file-private searchText function is deleted)

export function toListDto(p: Property): PropertyListDto {
  return compact({
    // ...unchanged fields...
    updatedAt: activityTimestamp(p),
    search: searchableText(p),
  }) as PropertyListDto;
}
```

> **`activityTimestamp` vs the old `?? updatedAt` in `toListDto`:** the old code was
> `p.lastActivityAt ?? p.updatedAt` (NO `?? 0`) — so when both are absent it yielded `undefined`,
> which `compact()` then strips, omitting `updatedAt` from the DTO. `activityTimestamp` returns `0`
> in that case, which `compact()` would NOT strip (0 is not `undefined`), so a `updatedAt: 0` would
> appear. **This is a behavioural difference.** To preserve the present-only contract, the
> `toListDto` mapping must keep its own `?? undefined` semantics. Use:
> `updatedAt: p.lastActivityAt ?? p.updatedAt` — i.e. **do NOT replace L108 with `activityTimestamp`**.
> Instead leave L108 exactly as-is. `activityTimestamp` is introduced only as the shared helper
> backing `byActivityDesc`; `catalogDto`'s field map keeps its own undefined-preserving expression.
> (See step 5 — the corrected instruction.) The blast-map's suggestion to DRY L108 via the comparator
> is rejected here because the two have different absent-value semantics (`0` vs `undefined`).

## Step-by-step implementation

### Step 1 — Create `packages/bot/src/core/domain/photos.ts`
Create the file with exactly the "New module" code in **Target design** above (`PHOTO_KIND_ORDER`,
`orderedPhotos`, `heroPhotoKey`, importing `PhotoKind`/`PropertyPhoto` from `./catalog.js`).

### Step 2 — Append the three query helpers to `packages/bot/src/core/domain/catalog.ts`
At the end of the file, append the "Additions to catalog.ts" block (`activityTimestamp`,
`byActivityDesc`, `searchableText`). These are new top-level exports; no existing code changes.

### Step 3 — Rewrite `packages/bot/src/core/handlers/catalogAssistant.ts`
1. Delete the five file-private declarations: `PHOTO_KIND_ORDER` (L27), `orderedPhotos` (L29–35),
   `heroPhotoKey` (L38–43), `byActivityDesc` (L45–47), `matchesQuery` (L50–61), and the two stray
   doc-comment lines at L25–26.
2. Update the `../domain/catalog.js` import: add value imports `byActivityDesc, searchableText`.
   Remove `PhotoKind` and `PropertyPhoto` from the type import **only if** tsc reports them unused
   after the deletions (they were used solely by the deleted helpers — confirm with `tsc`).
3. Add a new import: `import { heroPhotoKey, orderedPhotos } from "../domain/photos.js";`.
4. In `listingsOnRoad` (L89–92), replace `.filter((p) => matchesQuery(p, query))` with
   `const needle = query.toLowerCase();` declared above the chain and
   `.filter((p) => searchableText(p).includes(needle))`.
5. Leave the call-sites at L77 (`.sort(byActivityDesc)`), L92 (`.sort(byActivityDesc)`),
   L111 (`heroPhotoKey(property.photos)`), L252 (`orderedPhotos(property.photos)`) exactly as
   written — they now resolve to the imported functions.

### Step 4 — Rewrite `packages/bot/src/app/readApiHandler.ts`
1. Delete the duplicate `PHOTO_KIND_ORDER` block incl. the leading comment (L29–31), `orderedPhotos`
   (L33–40), `heroPhotoKey` (L43–48).
2. Add value import `import { byActivityDesc } from "../core/domain/catalog.js";` and
   `import { heroPhotoKey, orderedPhotos } from "../core/domain/photos.js";`. Keep the existing
   `import type { Property, PropertyPhoto } from "../core/domain/catalog.js";` line; drop
   `PropertyPhoto` from it only if tsc flags it unused (it was used by the deleted `orderedPhotos`
   signature — `presignGallery` uses the return value, not the type, so it likely becomes unused).
3. In `handleMyProperties` (L122–124), replace the inline `.sort((a, b) => (b.lastActivityAt ?? ...)`
   with `.sort(byActivityDesc)`.
4. Leave L84 (`heroPhotoKey(property.photos)`) and L92 (`orderedPhotos(property.photos)`) as-is.

### Step 5 — Rewrite `packages/bot/src/core/handlers/catalogDto.ts`
1. Delete the file-private `searchText()` (L81–94) and its doc comment.
2. Update the `../domain/catalog.js` import to add the value import `searchableText`
   (do **not** import `activityTimestamp` — see the note below).
   Final: `import type { Chanote, Property } from "../domain/catalog.js";` plus a new value line
   `import { searchableText } from "../domain/catalog.js";` (or merge into one import statement).
3. In `toListDto` replace `search: searchText(p)` (L109) with `search: searchableText(p)`.
4. **Leave L108 (`updatedAt: p.lastActivityAt ?? p.updatedAt`) UNCHANGED.** Do not substitute
   `activityTimestamp(p)` here — `activityTimestamp` returns `0` when both are absent, which would
   leak `updatedAt: 0` into the DTO (breaking the present-only contract and the test at
   `catalogDto.test.ts:59` "prefers updatedAt … when lastActivityAt is absent"). The
   undefined-preserving `?? ` expression must stay local to the DTO.

### Step 6 — Add the two new test files (see Tests).

### Step 7 — Verify
Run the full verification suite (below). Fix any tsc "declared but never used" import by removing the
stale `PhotoKind`/`PropertyPhoto` type imports per steps 3.2 and 4.2.

## Tests

All existing behavioural tests stay green with **no edits** (functionality is identical):
- `catalogAssistant.test.ts` — "orders the gallery property → chanote → other" (L130–152),
  "presigns a hero image" (L48–72), "filters listings by road/area query" (L74–88), "lists … most-
  recently-active first" (L27–40) continue to exercise the extracted functions via the public API.
- `readApiHandler.test.ts` — gallery order (L113–124), hero (L103–110), recency sort, upcoming
  fan-out (L156–173) unchanged.
- `catalogDto.test.ts` — "builds a lowercased search haystack" (L44–57) and "prefers updatedAt …"
  (L59–61) stay green: the haystack string and the `updatedAt` semantics are byte-identical.

**Add `packages/bot/test/unit/photos.test.ts`** — direct coverage of the new domain module:
- `orderedPhotos` sorts mixed kinds property → chanote → other; preserves capture order within a kind
  (stable sort); returns `[]` for `undefined`; does not mutate the input array.
- `heroPhotoKey` returns the first `property` photo's `s3Key`; falls back to the first photo when no
  `property` kind is present; returns `undefined` for `undefined`/empty.
- `PHOTO_KIND_ORDER` maps `{ property: 0, chanote: 1, other: 2 }`.

**Add `packages/bot/test/unit/catalogQueries.test.ts`** — direct coverage of the new catalog helpers:
- `activityTimestamp` prefers `lastActivityAt`, falls back to `updatedAt`, then `0`.
- `byActivityDesc` orders most-recent first; uses `updatedAt` fallback; both-absent → 0 (stable).
- `searchableText` concatenates the six-field set, lowercases, drops `undefined`/`""`, spreads
  `rawAddresses`; assert the exact output string for a known input (locks the miniapp contract).

No bug fixes are introduced; this is a pure, behaviour-preserving extraction.

## Verification
```
npm run typecheck   # tsc across workspaces — expect clean (was clean at baseline)
npm run lint        # biome — expect clean
npm run test        # vitest unit — expect all green incl. the two new test files
```
`npm --prefix packages/bot run test:integration` is **not** required — this change-unit touches no
persistence/DynamoDB code (the helpers are pure; `CatalogRepository` is untouched).

Expected result: identical test pass set as baseline plus the two new test files; no behavioural diff.

## Dependencies & ordering

- **Independent of, but cleanly precedes, master-plan P1 #3 (`collectUpcomingRows`).** This unit
  deliberately does NOT extract the upcoming fan-out (see Open questions). When P1 #3 is done it can
  build on the `core/domain` home this unit establishes.
- **No hard dependency on P1 #2 (sentinel/propertyMapping).** Master-plan suggests doing #2 first for
  a cleaner surface, but #2 touches `editReplyHandler.ts`/`ingestionSweep.ts`/`claudeExtractor.ts` —
  disjoint files from this unit. Either order is safe.
- **Shared files with other units:** `core/domain/catalog.ts` is also touched by P2 #15/#16/#27/#28
  (domain naming/typing) and `readApiHandler.ts` by P1 #7 (HTTP-port transport refactor). This unit
  only *adds* exports to `catalog.ts` and only *deletes* local helpers + swaps imports in
  `readApiHandler.ts`, so merge conflicts with those units are mechanical (import-line / append-only).

## Risk & rollback

- **Anthropic 16-union limit: NOT touched.** None of the extracted symbols are Zod schema fields;
  `claudeExtractor.ts` and every `output_config.format` schema are untouched. The regression test at
  `claudeExtractor.test.ts` is unaffected. No risk to the nullable budget.
- **Layering: STRICTLY IMPROVED.** All three extractions land in `core/domain/` (which imports only
  other `core/domain` files — `photos.ts` → `catalog.ts` types only). `core/handlers/` and `app/`
  importing from `core/domain/` is the correct dependency direction. No new violation; one comment-
  enforced coupling becomes a compile-time shared import.
- **Behavioural risk — photo order `?? 9` drop.** The read-API previously tolerated an unknown kind
  via `?? 9` (sorted last); the canonical typed `Record<PhotoKind, number>` has no fallback, so an
  unknown kind (only reachable via malformed stored data, since the type union is closed) sorts to
  position `0` (first) rather than last. This is the intended stricter behaviour (a new `PhotoKind`
  becomes a compile error in `PHOTO_KIND_ORDER`); stored photos are always one of the three kinds, so
  no real data is affected.
- **Behavioural risk — `searchableText` join-boundary.** `.includes` against the joined string could
  in theory match a needle spanning the `" "` separator between two fields; queries are single
  tokens/road names and the existing tests pin the real behaviour. Negligible.
- **Behavioural risk — `updatedAt: 0` leak.** Explicitly avoided by keeping `catalogDto.ts` L108
  unchanged (step 5.4). The `catalogDto.test.ts:59` test guards against regression here.
- **Rollback:** revert the five touched files + delete `photos.ts` and the two new test files. No
  data migration, no infra, no deploy coupling — purely a source refactor.

## Open questions / decisions

### Decision 1 (resolved here): home for the photo + query helpers
`core/domain/photos.ts` (new file) for the photo helpers vs. appending them to `core/domain/catalog.ts`.
**Recommendation taken: split.** Photo ordering is a cohesive concern with three symbols and warrants
its own small module (mirrors the existing `geo.ts`/`events.ts`/`conversation.ts` per-concept domain
files and matches `09-epoch-design-debt.md` refactor #3's explicit `core/domain/photos.ts`
suggestion). `byActivityDesc`/`activityTimestamp`/`searchableText` are listing-query helpers that
operate on the whole `Property` and read naturally alongside the `Property` type, so they go in
`catalog.ts`. This is a settled choice, not a fork — recorded for transparency.

### Decision 2 (escalated as queue-00 D1 — ✅ RESOLVED to Option A, user-confirmed 2026-06-08): `collectUpcomingRows` placement
The blast-map and master-plan P1 #3 propose extracting the duplicated "upcoming follow-ups" fan-out
(`catalogAssistant.upcoming` L127–147 vs `readApiHandler.handleUpcoming` L152–177) into a shared
`collectUpcomingRows(catalog, userId)` helper returning `UpcomingFollowUp[]`. **This cannot land in
`core/domain` without a prerequisite move**, because the helper needs:
1. `CatalogRepository` — a `core/ports` type. **No `core/domain` file imports `core/ports` today**
   (verified by grep). Putting an async, repository-driven function in `core/domain` would introduce
   the first domain→ports dependency.
2. `propertyTitle` — lives in `core/handlers/views.ts`. Domain importing a handler is a layering
   violation.
3. `UpcomingFollowUp` — the return type, also defined in `core/handlers/views.ts` (L402), imported by
   `catalogAssistant.ts` (L21).

**Options:**
- **(A) Defer entirely (RECOMMENDED for this unit).** Ship the three fork-free extractions now; leave
  the upcoming fan-out duplicated. Track `collectUpcomingRows` as its own change-unit. Lowest risk;
  keeps this unit purely additive to `core/domain` with no new cross-layer dependency.
- **(B) Extract as a `core/handlers` helper (not domain).** Put `collectUpcomingRows(catalog, userId):
  Promise<UpcomingFollowUp[]>` in a new `core/handlers/upcoming.ts` (or in `views.ts` next to
  `UpcomingFollowUp`/`upcomingMessage`). `catalogAssistant` imports it directly; **but `readApiHandler`
  (in `app/`) importing from `core/handlers/` is itself a layering smell** (master-plan Theme B / P1
  #7 is specifically about getting `app/` off handler-layer imports). This trades the duplication for
  a boundary import that a later unit must unwind.
- **(C) Move `UpcomingFollowUp` + `propertyTitle` to `core/domain` first, add a domain→ports
  exception, then put `collectUpcomingRows` in domain.** Largest blast radius (touches `views.ts`,
  every `propertyTitle` call-site, and establishes a new domain-imports-ports precedent). Out of
  scope for a single mechanical unit.

**Decision: Option A — CONFIRMED by the user (2026-06-08).** This change-unit implements only the
photo/sort/search extractions (zero new cross-layer dependencies, fully fork-free) and defers
`collectUpcomingRows` to a dedicated future unit, to be sequenced after the P1 #7 transport-port work
(which determines whether `app/` may legally share a `core/handlers` helper). This unit does **not**
cover master-plan P1 #3 and is now ready to implement.
