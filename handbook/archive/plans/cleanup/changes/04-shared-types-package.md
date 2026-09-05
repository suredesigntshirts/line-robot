# 04 — Create packages/shared for cross-package DTOs / tz constants; kill the miniapp type mirror

> **Reconcile-pass note (queue 00).** Shared-file coordination (all mechanical):
> - **`core/handlers/catalogDto.ts`** is also edited by unit 03. THIS unit moves the DTO *interfaces*
>   (`PhotoDto`/`PropertyListDto`/`PropertyDetailDto`) to `@line-robot/shared` and **keeps the
>   file-private `searchText` and the `toListDto`/`toDetailDto` mappers as-is**. Unit 03 then deletes
>   `searchText` (replacing it with the domain `searchableText`) and leaves L108 `updatedAt` untouched.
>   **Land unit 04 BEFORE unit 03** so 03 deletes `searchText` from a file whose DTOs already re-export
>   from shared. The two edits are disjoint (interface bodies vs. the `searchText` function) — no hunk
>   overlap.
> - **`core/domain/catalog.ts`** is also edited by unit 03 (append-only at end-of-file) — disjoint from
>   this unit's top-of-file `Chanote` delete + re-export. Land 04 first; 03 appends below.
> - **`app/readApiHandler.ts`** is also edited by units 02/03/09. THIS unit only adds the
>   `import type { UpcomingItem } from "@line-robot/shared"` and swaps the inline `rows` row-type for
>   `UpcomingItem[]`. If unit 02 has already landed, the file uses `HttpRequest`/`HttpResponse` seams —
>   that does not touch the `rows` region, so this edit applies cleanly. Recommended order:
>   **02 → 04 → 09 → 03 → 07** (see queue 00).

## Goal & rationale

`packages/miniapp/src/types.ts` is a hand-maintained, near-verbatim copy of the bot's read-API DTOs
(`PropertyListDto`, `PropertyDetailDto`, `PhotoDto`, the domain `Chanote`) plus a mirror of the
inline `UpcomingItem` row shape — kept aligned only by a "keep these in sync" prose comment.
`packages/miniapp/src/lib/format.ts` also re-declares `BANGKOK_OFFSET_MS` and `MONTHS` verbatim from
the bot's `core/domain/datetime.ts`. This is the single permanent cross-package drift risk in the
repo (06-miniapp.md F01/F09; 09-epoch-design-debt.md refactor #4, pattern #1; 00-master-plan.md Theme
D / P2 #13). This unit introduces one new source-only workspace package, `@line-robot/shared`, that
both packages import, so the API contract and the timezone primitives live in exactly one place and
any divergence becomes a compile error rather than a silent UI bug.

The contract direction is preserved: the bot is the **producer** of the JSON (its `readApiHandler`
maps `Property → DTO`), the miniapp is the **consumer**. Both now agree on the DTO *interfaces*
defined in `@line-robot/shared`; the bot keeps its `Property → DTO` mapper functions
(`toListDto`/`toDetailDto`) because those depend on bot-domain types and presentation helpers. No
behaviour changes — only the source of the type/constant declarations moves.

## Blast radius

### Files created
- `packages/shared/package.json` — new workspace package `@line-robot/shared` (source-only, no build).
- `packages/shared/tsconfig.json` — typecheck-only config (extends base; `noEmit`).
- `packages/shared/src/index.ts` — barrel re-exporting from the two modules below.
- `packages/shared/src/dto.ts` — the API DTO interfaces + `Chanote` + `UpcomingItem`.
- `packages/shared/src/datetime.ts` — `BANGKOK_OFFSET_MS` and `MONTHS`.
- `packages/shared/test/shared.test.ts` — smoke/value test for the constants (new coverage).
- `packages/miniapp/test/format.test.ts` — new test for `formatDate` (closes 06-miniapp.md F09 coverage gap; pins Bangkok-local correctness before the constant is swapped for an import).

### Files modified (with symbols/regions touched)
- `packages/bot/src/core/domain/catalog.ts` — DELETE the local `Chanote` interface (lines 21–50) and re-export it from `@line-robot/shared` (`export type { Chanote } from "@line-robot/shared";`). `PhotoKind`, `PropertyPhoto`, `Property`, `PropertyUpsert`, `PropertyEvent`, `ConversationTracker` stay; the `Property.chanote` field now refers to the re-exported type.
- `packages/bot/src/core/domain/datetime.ts` — DELETE local `BANGKOK_OFFSET_MS` (line 10) and `MONTHS` (line 13); import both from `@line-robot/shared`. Keep `DAYS`, `parseBangkokLocal`, `formatShortDate`, `formatShortDateTime`, `formatDueDate` (now consuming the imported constants). Re-export `BANGKOK_OFFSET_MS` so existing bot importers are unaffected.
- `packages/bot/src/core/handlers/catalogDto.ts` — DELETE the local `PhotoDto` (12–16), `PropertyListDto` (21–37), `PropertyDetailDto` (41–71) interface bodies; re-export them from `@line-robot/shared` (keeping the same names). Keep `compact`, `searchText`, `toListDto`, `toDetailDto`. The `import type { Chanote, Property }` line keeps `Property` (still from `../domain/catalog.js`); `Chanote` no longer needs a direct import here (it is part of `PropertyDetailDto` in shared) — drop `Chanote` from that import.
- `packages/bot/src/app/readApiHandler.ts` — change the `UpcomingItem` inline row type (154–159) to the shared `UpcomingItem` (import it; `propertyTitle` stays the field name). `PhotoDto` import path stays `../core/handlers/catalogDto.js` (catalogDto re-exports it) — **no change needed there**, but optionally re-point to shared (see Step 6 note). This closes the producer/consumer drift on `UpcomingItem`.
- `packages/bot/package.json` — add `"@line-robot/shared": "*"` to `dependencies`.
- `packages/miniapp/src/api.ts` — import `PropertyDetail`, `PropertyListItem`, `UpcomingItem` from `@line-robot/shared` instead of `./types.js` (using the shared canonical names — see "Naming decision").
- `packages/miniapp/src/lib/predicates.ts` — import `PropertyListItem` from `@line-robot/shared`.
- `packages/miniapp/src/lib/format.ts` — DELETE local `BANGKOK_OFFSET_MS` and `MONTHS`; import them from `@line-robot/shared`. Keep `formatDate`.
- `packages/miniapp/src/screens/Detail.tsx` — import `Chanote`, `PropertyDetail` from `@line-robot/shared`; `formatDate` import unchanged.
- `packages/miniapp/src/components/Gallery.tsx` — import `Photo` from `@line-robot/shared`.
- `packages/miniapp/src/screens/List.tsx` — import `PropertyListItem` from `@line-robot/shared`.
- `packages/miniapp/package.json` — add `"@line-robot/shared": "*"` to `dependencies`.

### Files deleted
- `packages/miniapp/src/types.ts` — its entire content now lives in `@line-robot/shared`.

### All call-sites to update (file:line)
Import statements (the only lines that change for consumers):
- `packages/bot/src/core/domain/catalog.ts:24` — `Chanote` definition → re-export.
- `packages/bot/src/core/domain/datetime.ts:10,13` — `BANGKOK_OFFSET_MS`, `MONTHS` defs → import.
- `packages/bot/src/core/handlers/catalogDto.ts:8,12,21,41` — DTO defs → re-export; trim `Chanote` from import.
- `packages/bot/src/app/readApiHandler.ts:154-159` — inline row type → shared `UpcomingItem`.
- `packages/miniapp/src/api.ts:6` — `./types.js` → `@line-robot/shared`.
- `packages/miniapp/src/lib/predicates.ts:7` — `../types.js` → `@line-robot/shared`.
- `packages/miniapp/src/lib/format.ts:4-5` — local consts → import.
- `packages/miniapp/src/screens/Detail.tsx:9` — `../types.js` → `@line-robot/shared`.
- `packages/miniapp/src/components/Gallery.tsx:5` — `../types.js` → `@line-robot/shared`.
- `packages/miniapp/src/screens/List.tsx:14` — `../types.js` → `@line-robot/shared`.
- `packages/miniapp/test/predicates.test.ts:3` — `../src/types.js` → `@line-robot/shared`.

**Unchanged by design** (verified): `views.ts:7`, `ingestionSweep.ts:9`, `catalogAssistant.ts:8`
import datetime *functions* (not the moved constants) from `../domain/datetime.js`, which still
exports them — no change. `catalogDto.test.ts:3` imports `toListDto`/`toDetailDto` (mappers stay) —
no change. `datetime.test.ts:2` imports `parseBangkokLocal`/`formatDueDate` (functions stay) — no
change. `claudeExtractor.ts:4`, `catalogRepository.ts:12`, `ports/extraction.ts:9` import `Chanote`
from `../domain/catalog.js` / `../../core/domain/catalog.js`, which now re-exports it — **no change**.
`package.json` (root) workspaces is `["packages/*", "infra"]`; the `packages/*` glob already covers
`packages/shared` — **no root edit needed**.

### Tests touched
- ADD `packages/shared/test/shared.test.ts` — value smoke test (`BANGKOK_OFFSET_MS === 25_200_000`, `MONTHS.length === 12`, ordering); also a type smoke import.
- ADD `packages/miniapp/test/format.test.ts` — pins `formatDate` Bangkok-local output across month/year boundaries (new coverage, closes F09).
- UPDATE `packages/miniapp/test/predicates.test.ts:3` — import `PropertyListItem` from `@line-robot/shared`.
- NO CHANGE: `packages/bot/test/unit/catalogDto.test.ts`, `packages/bot/test/unit/datetime.test.ts`, `packages/bot/test/unit/views.test.ts`, `packages/bot/test/unit/claudeExtractor.test.ts` (the 16-union guard).

## Current code

`packages/miniapp/src/types.ts` (the mirror being deleted; abbreviated — full content already read):
```ts
/** ...These mirror `catalogDto.ts` in the bot package — keep these in sync... */
export interface PropertyListItem { readonly propertyId: string; /* ...12 fields... */ }
export interface Photo { readonly url: string; readonly kind: string; readonly label?: string; }
export interface Chanote { /* ...13 optional fields... */ }
export interface PropertyDetail { /* ...28 fields incl. chanote?: Chanote, photos: readonly Photo[] */ }
export interface UpcomingItem {
  readonly propertyId: string; readonly propertyTitle: string;
  readonly dueAt: number; readonly title?: string;
}
```

`packages/miniapp/src/lib/format.ts` (constants being de-duplicated):
```ts
const BANGKOK_OFFSET_MS = 7 * 60 * 60_000;
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function formatDate(at: number): string {
  const d = new Date(at + BANGKOK_OFFSET_MS);
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}
```

`packages/bot/src/core/domain/datetime.ts` (source of truth for the constants):
```ts
export const BANGKOK_OFFSET_MS = 7 * 60 * 60_000;
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
// parseBangkokLocal / formatShortDate / formatShortDateTime / formatDueDate use these.
```

`packages/bot/src/core/handlers/catalogDto.ts` (source of truth for the DTOs):
```ts
import type { Chanote, Property } from "../domain/catalog.js";
export interface PhotoDto { readonly url: string; readonly kind: string; readonly label?: string; }
export interface PropertyListDto { /* 13 fields incl. search: string, heroUrl?: string */ }
export interface PropertyDetailDto { /* ...incl. chanote?: Chanote, photos: readonly PhotoDto[] */ }
export function toListDto(p: Property): PropertyListDto { /* stays */ }
export function toDetailDto(p: Property): PropertyDetailDto { /* stays */ }
```

`packages/bot/src/core/domain/catalog.ts` (source of truth for `Chanote`):
```ts
export interface Chanote { /* 13 optional fields: titleType?, deedNumber?, ... confidenceNote? */ }
```

`packages/bot/src/app/readApiHandler.ts:154-159` (the inline `UpcomingItem` shape, no named type today):
```ts
const rows: Array<{
  propertyId: string;
  propertyTitle: string;
  dueAt: number;
  title?: string;
}> = [];
```

## Target design

### Decision: source-only npm workspace package (NOT TS project references)

Both `packages/bot/tsconfig.json` and `packages/miniapp/tsconfig.json` set `noEmit: true`, and the
shared base sets `declaration: true` + `noEmit: true`. TS project references require `composite: true`
and **actual `.d.ts` emission** from the referenced project plus an `outDir` and a build ordering step
— directly at odds with the no-emit, no-build posture of this repo (esbuild bundles the bot;
Vite transpiles the miniapp; neither runs `tsc` to produce JS). The mixed `moduleResolution` (`NodeNext`
in the bot, `bundler` in the miniapp) further complicates a compiled-artifact approach.

Therefore `@line-robot/shared` is a **source-only package whose `package.json` `exports`/`types`
point directly at the TypeScript source**. Consumers transpile that source with their own toolchain:
- esbuild (`bundle: true`, `.ts` loader) inlines `packages/shared/src/*.ts` into the bot bundle — no
  esbuild config change, no `external` entry.
- Vite/`@preact/preset-vite` transpiles the `.ts` source on the fly — no Vite config change.
- `tsc --noEmit` in each consumer resolves the package via its `exports.types` (NodeNext) /
  `types` (bundler), both of which point at the `.ts` source. No build step, no `.d.ts` artifacts.

The package ships **types and two trivially-pure constants only** — zero runtime dependencies, zero
infra coupling — so importing it from `core/domain` does **not** violate the hexagonal rule (it is the
"shared kernel", strictly below adapters). See Risk section.

### Naming decision (resolved, status `ready`)

The shared package uses the **bot's DTO names as the canonical export names**, and additionally
exports the miniapp's historical names as **type aliases** so the miniapp's existing identifiers keep
working with zero renames in JSX/logic:

| Canonical (bot) | Miniapp alias (also exported) |
|---|---|
| `PropertyListDto` | `PropertyListItem` |
| `PropertyDetailDto` | `PropertyDetail` |
| `PhotoDto` | `Photo` |
| `Chanote` | `Chanote` (same) |
| `UpcomingItem` | `UpcomingItem` (same) |

This keeps the bot DTO names stable (no edits to `toListDto`/`toDetailDto` return types or the bot
tests) AND keeps the miniapp component code (`p: PropertyDetail`, `photos: readonly Photo[]`,
`PropertyListItem[]`) untouched apart from the import path. Aliases are free in a types-only module.

### `packages/shared/package.json`
```json
{
  "name": "@line-robot/shared",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "exports": {
    ".": {
      "types": "./src/index.ts",
      "default": "./src/index.ts"
    }
  },
  "main": "./src/index.ts",
  "types": "./src/index.ts"
}
```
No `scripts.build` (source-only). A `typecheck` script is added so the root `typecheck --workspaces`
covers it.
```json
  "scripts": {
    "typecheck": "tsc --noEmit",
    "test": "vitest run"
  },
  "devDependencies": {}
```
(`vitest`/`typescript` resolve from the root workspace hoist — no per-package devDeps needed, matching
how `packages/bot` and `packages/miniapp` already rely on root-hoisted `vitest`/`typescript`.)

### `packages/shared/tsconfig.json`
```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "rootDir": ".",
    "noUnusedLocals": true,
    "noUnusedParameters": true
  },
  "include": ["src/**/*.ts", "test/**/*.ts"]
}
```
The base provides `module/moduleResolution: NodeNext`, `verbatimModuleSyntax: true`, `strict`,
`noEmit: true`. Because all shared exports are `interface`/`type`/`const`, NodeNext `verbatimModuleSyntax`
is satisfied (consumers use `import type` for the interfaces).

### `packages/shared/src/dto.ts`
```ts
/**
 * The read-API JSON contract, shared by the bot (producer: `readApiHandler` maps Property → these)
 * and the miniapp (consumer). One source of truth so the two packages cannot drift — a field added
 * here is a compile error in any consumer that doesn't handle it. No runtime code, no IO.
 */

/** Title-deed (chanote) block, OCR'd from the deed image — every field optional. */
export interface Chanote {
  readonly titleType?: string;
  readonly deedNumber?: string;
  readonly landNumber?: string;
  readonly surveyPage?: string;
  readonly mapSheet?: string;
  readonly landOffice?: string;
  readonly province?: string;
  readonly district?: string;
  readonly subdistrict?: string;
  readonly landArea?: string;
  readonly ownerName?: string;
  readonly encumbrances?: readonly string[];
  readonly confidenceNote?: string;
}

/** One presigned photo in a detail response, in `property → chanote → other` order. */
export interface PhotoDto {
  readonly url: string;
  readonly kind: string;
  readonly label?: string;
}

/** A listing as shown in the scrollable List screen (`GET /me/properties`). */
export interface PropertyListDto {
  readonly propertyId: string;
  readonly title: string;
  readonly status?: string;
  readonly statusBadge?: string;
  readonly price?: string;
  readonly priceValue?: number;
  readonly currency?: string;
  readonly propertyType?: string;
  readonly listingType?: string;
  readonly area?: string;
  readonly updatedAt?: number;
  /** Lowercased searchable haystack the free-text box matches. */
  readonly search: string;
  /** Presigned hero image (attached by the handler when the listing has a photo). */
  readonly heroUrl?: string;
}

/** A listing's full detail (`GET /properties/{id}`). */
export interface PropertyDetailDto {
  readonly propertyId: string;
  readonly title: string;
  readonly status?: string;
  readonly statusBadge?: string;
  readonly price?: string;
  readonly rent?: string;
  readonly currency?: string;
  readonly propertyType?: string;
  readonly listingType?: string;
  readonly bedrooms?: number;
  readonly bathrooms?: number;
  readonly usableAreaSqm?: number;
  readonly landArea?: string;
  readonly floors?: number;
  readonly furnishing?: string;
  readonly projectName?: string;
  readonly address?: string;
  readonly area?: string;
  readonly contact?: string;
  readonly source?: string;
  readonly tags?: readonly string[];
  readonly notes?: string;
  readonly chanote?: Chanote;
  readonly lat?: number;
  readonly long?: number;
  readonly mapsUri?: string;
  readonly createdAt?: number;
  readonly updatedAt?: number;
  readonly photos: readonly PhotoDto[];
}

/** One due follow-up (`GET /me/upcoming`). */
export interface UpcomingItem {
  readonly propertyId: string;
  readonly propertyTitle: string;
  readonly dueAt: number;
  readonly title?: string;
}

/** Miniapp-side aliases (historical names) — the SPA imports these; same shapes as the *Dto names. */
export type PropertyListItem = PropertyListDto;
export type PropertyDetail = PropertyDetailDto;
export type Photo = PhotoDto;
```

### `packages/shared/src/datetime.ts`
```ts
/** Asia/Bangkok timezone primitives — UTC+7, no DST, so a fixed offset is exact year-round.
 * Shared by the bot's date formatters and the miniapp's `formatDate` so they cannot drift. */

/** Asia/Bangkok is UTC+7 with no daylight saving. */
export const BANGKOK_OFFSET_MS = 7 * 60 * 60_000;

/** Short English month labels, indexed by `Date.getUTCMonth()`. */
export const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
] as const;
```

### `packages/shared/src/index.ts`
```ts
export type {
  Chanote,
  Photo,
  PhotoDto,
  PropertyDetail,
  PropertyDetailDto,
  PropertyListDto,
  PropertyListItem,
  UpcomingItem,
} from "./dto.js";
export { BANGKOK_OFFSET_MS, MONTHS } from "./datetime.js";
```
(NodeNext requires the `.js` extension on the *relative* re-exports inside the shared package; the
shared package's own files use `verbatimModuleSyntax`, hence `export type` for the interfaces.)

### Bot `catalog.ts` after
```ts
// Chanote now lives in the shared kernel (read-API contract). Re-export so existing importers
// (claudeExtractor, catalogRepository, ports/extraction, catalogDto) keep importing from here.
export type { Chanote } from "@line-robot/shared";
// ... PhotoKind, PropertyPhoto, Property (with `chanote?: Chanote`), PropertyUpsert, etc. unchanged.
```

### Bot `datetime.ts` after
```ts
import { BANGKOK_OFFSET_MS, MONTHS } from "@line-robot/shared";

/** Re-exported for existing bot importers (none today consume it, but keep the surface stable). */
export { BANGKOK_OFFSET_MS };

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
// ...parseBangkokLocal / formatShortDate / formatShortDateTime / formatDueDate unchanged, now
// closing over the imported BANGKOK_OFFSET_MS and MONTHS.
```

### Bot `catalogDto.ts` after
```ts
import type { Property } from "../domain/catalog.js";
import { area, formatPrice, mapsUri, propertyTitle, statusBadge } from "./views.js";

// DTO contract lives in the shared kernel; re-export so readApiHandler + tests import from here.
export type { PhotoDto, PropertyDetailDto, PropertyListDto } from "@line-robot/shared";

// compact / searchText / toListDto / toDetailDto unchanged (they return the re-exported types).
```

### Bot `readApiHandler.ts` after (UpcomingItem region)
```ts
import { type PhotoDto, toDetailDto, toListDto } from "../core/handlers/catalogDto.js";
import type { UpcomingItem } from "@line-robot/shared";
// ...
const rows: UpcomingItem[] = [];
// push sites unchanged — `{ propertyId, propertyTitle, dueAt, title? }` already matches UpcomingItem.
```

## Step-by-step implementation

> Ordering matters: create the package and run `npm install` BEFORE editing any consumer, or the
> consumer typechecks will fail with "Cannot find module '@line-robot/shared'".

**Step 1 — scaffold the package.** Create the four source/config files exactly as in "Target design":
- `packages/shared/package.json`
- `packages/shared/tsconfig.json`
- `packages/shared/src/datetime.ts`
- `packages/shared/src/dto.ts`
- `packages/shared/src/index.ts`

**Step 2 — declare the dependency in both consumers.**
- `packages/bot/package.json`: add `"@line-robot/shared": "*"` to `dependencies` (alphabetical order: after `@line/bot-sdk`, before `electrodb` — keep the existing JSON ordering style).
- `packages/miniapp/package.json`: add `"@line-robot/shared": "*"` to `dependencies` (before `@line/liff`).

**Step 3 — link the workspace.** Run `npm install` at the repo root. This creates the
`node_modules/@line-robot/shared` symlink so both consumers resolve the bare specifier. (The root
`workspaces: ["packages/*", ...]` glob already includes `packages/shared`; do NOT edit root
package.json.)

**Step 4 — move `Chanote` into shared (bot domain re-exports).** In
`packages/bot/src/core/domain/catalog.ts`: delete the `Chanote` interface block (lines 21–50,
including its doc comment) and insert near the top (after the file's module doc comment, above
`PhotoKind`):
```ts
export type { Chanote } from "@line-robot/shared";
```
Leave `Property.chanote?: Chanote` as-is — it now refers to the re-exported type.

**Step 5 — swap the datetime constants in the bot.** In
`packages/bot/src/core/domain/datetime.ts`:
- Delete `export const BANGKOK_OFFSET_MS = 7 * 60 * 60_000;` (line 10) and
  `const MONTHS = [...]` (line 13).
- Add at the top of the module body:
  ```ts
  import { BANGKOK_OFFSET_MS, MONTHS } from "@line-robot/shared";

  export { BANGKOK_OFFSET_MS };
  ```
- Keep `const DAYS = [...]` and all four functions unchanged.

**Step 6 — re-export the DTOs from catalogDto.** In
`packages/bot/src/core/handlers/catalogDto.ts`:
- Change `import type { Chanote, Property } from "../domain/catalog.js";` →
  `import type { Property } from "../domain/catalog.js";` (drop `Chanote`; it is only referenced
  inside the now-moved `PropertyDetailDto`).
- Delete the three interface bodies: `PhotoDto` (12–16), `PropertyListDto` (21–37),
  `PropertyDetailDto` (41–71), including their doc comments.
- Add (after the `views.js` import):
  ```ts
  export type { PhotoDto, PropertyDetailDto, PropertyListDto } from "@line-robot/shared";
  ```
- Keep `compact`, `searchText`, `toListDto`, `toDetailDto` unchanged.

> Note on `readApiHandler.ts:14` (`import { type PhotoDto, ... } from "../core/handlers/catalogDto.js"`):
> because catalogDto now *re-exports* `PhotoDto`, this import still resolves — **leave it as-is** (do
> not re-point to shared; keeping the handler importing its DTOs from the catalogDto barrel preserves
> the existing "handler imports from handlers" locality).

**Step 7 — use the shared `UpcomingItem` in readApiHandler.** In
`packages/bot/src/app/readApiHandler.ts`:
- Add `import type { UpcomingItem } from "@line-robot/shared";` (group with the other type imports).
- Replace the inline `const rows: Array<{ ... }> = [];` (154–159) with `const rows: UpcomingItem[] = [];`.
- The `rows.push({ propertyId, propertyTitle, dueAt, ...title })` site is unchanged (its shape already
  matches `UpcomingItem`).

**Step 8 — point miniapp imports at shared.** Change only the import sources (identifiers unchanged,
because the shared package exports `PropertyListItem`/`PropertyDetail`/`Photo` aliases):
- `packages/miniapp/src/api.ts:6` →
  `import type { PropertyDetail, PropertyListItem, UpcomingItem } from "@line-robot/shared";`
- `packages/miniapp/src/lib/predicates.ts:7` →
  `import type { PropertyListItem } from "@line-robot/shared";`
- `packages/miniapp/src/screens/Detail.tsx:9` →
  `import type { Chanote, PropertyDetail } from "@line-robot/shared";`
- `packages/miniapp/src/components/Gallery.tsx:5` →
  `import type { Photo } from "@line-robot/shared";`
- `packages/miniapp/src/screens/List.tsx:14` →
  `import type { PropertyListItem } from "@line-robot/shared";`

**Step 9 — swap the miniapp datetime constants.** In `packages/miniapp/src/lib/format.ts`:
- Delete the local `const BANGKOK_OFFSET_MS = ...;` and `const MONTHS = [...];`.
- Add at the top: `import { BANGKOK_OFFSET_MS, MONTHS } from "@line-robot/shared";`
- Keep `formatDate` body unchanged. (Note: the bundler `noUncheckedIndexedAccess` already makes
  `MONTHS[d.getUTCMonth()]` `string | undefined`; the existing code already template-strings it, so a
  `readonly` tuple type from the shared `as const` is fine — `getUTCMonth()` is 0–11 so the value is
  always present; the template string coerces an (impossible) `undefined` to `"undefined"`, identical
  to today.)

**Step 10 — delete the mirror.** Delete `packages/miniapp/src/types.ts`.

**Step 11 — update the predicates test import.** In `packages/miniapp/test/predicates.test.ts:3` →
`import type { PropertyListItem } from "@line-robot/shared";`

**Step 12 — add the new tests** (see Tests section).

**Step 13 — verify** (see Verification).

## Tests

All existing tests assert **runtime values**, not static type identity, so moving the type/constant
declarations changes no assertion. Functionality is identical; no named bug is being fixed.

**ADD `packages/shared/test/shared.test.ts`** — pins the shared constants and that the barrel resolves:
```ts
import { describe, expect, it } from "vitest";
import { BANGKOK_OFFSET_MS, MONTHS } from "@line-robot/shared";

describe("@line-robot/shared datetime constants", () => {
  it("Bangkok is UTC+7 (no DST) in ms", () => {
    expect(BANGKOK_OFFSET_MS).toBe(7 * 60 * 60_000);
    expect(BANGKOK_OFFSET_MS).toBe(25_200_000);
  });
  it("has twelve English month labels in calendar order", () => {
    expect(MONTHS).toHaveLength(12);
    expect(MONTHS[0]).toBe("Jan");
    expect(MONTHS[11]).toBe("Dec");
  });
});
```

**ADD `packages/miniapp/test/format.test.ts`** — closes 06-miniapp.md F09 (no test existed). Pins
Bangkok-local correctness, including the UTC-vs-Bangkok boundary the manual offset is most likely to
get wrong. This validates the shared constants are correct *for the miniapp's consumer* before the
local copy is deleted:
```ts
import { describe, expect, it } from "vitest";
import { formatDate } from "../src/lib/format.js";

describe("formatDate (Bangkok-local, with year)", () => {
  it("formats a mid-day instant on the same calendar day", () => {
    // 2026-06-02 07:30 UTC == 14:30 ICT, still 2 Jun.
    expect(formatDate(Date.parse("2026-06-02T07:30:00Z"))).toBe("2 Jun 2026");
  });
  it("rolls to the next Bangkok day for a late-UTC instant", () => {
    // 2026-06-01 18:00 UTC == 2026-06-02 01:00 ICT.
    expect(formatDate(Date.parse("2026-06-01T18:00:00Z"))).toBe("2 Jun 2026");
  });
  it("wraps month and year at the Bangkok new-year boundary", () => {
    // 2025-12-31 17:30 UTC == 2026-01-01 00:30 ICT.
    expect(formatDate(Date.parse("2025-12-31T17:30:00Z"))).toBe("1 Jan 2026");
  });
});
```

**UPDATE `packages/miniapp/test/predicates.test.ts`** — line 3 import source only; all assertions
unchanged.

**NO CHANGE** (verified): `catalogDto.test.ts` (mappers stay in `catalogDto.ts`),
`datetime.test.ts` (functions stay), `views.test.ts` (formats indirectly), `claudeExtractor.test.ts`
(the 16-union guard — see Risk).

## Verification

```
npm install                 # REQUIRED FIRST — links node_modules/@line-robot/shared
npm run typecheck           # tsc across bot + miniapp + infra + shared — all green
npm run lint                # biome check . — includes packages/shared
npm run test                # vitest unit across all workspaces (bot, miniapp, shared)
```
Integration tests (`npm --prefix packages/bot run test:integration`) are **NOT** required — this unit
touches no persistence code (no DynamoDB adapter, no table schema, no S3).

Expected: `typecheck` green (the whole point — the previously-prose-enforced sync is now compiler-
enforced). `test` green including the two new test files. `lint` green (new files follow the existing
Biome style: double quotes, sorted imports — note shared `index.ts` re-exports are alphabetised).

Additional manual confidence check (optional, no infra change): `npm run build` should still bundle
the bot read-api Lambda with `@line-robot/shared` inlined (esbuild `bundle:true`, package not marked
`external`), and `npm --prefix packages/miniapp run build` (Vite) should still produce `dist/` with
the shared `.ts` transpiled in. Neither build config file changes.

## Dependencies & ordering

- **No hard dependency on any other change-unit.** This unit is self-contained (00-master-plan.md
  explicitly notes P2 #13 "is independent … can be done in parallel").
- **Soft sequencing vs. other cleanup units that touch the same files:**
  - A unit that touches `core/domain/catalog.ts` (e.g. a `Property` nested-value-object refactor) or
    `catalogDto.ts` (e.g. the photo-helper extraction in 09-epoch-design-debt.md refactor #3, which
    co-locates `presignGallery`/`presignHero` into `catalogDto.ts`) shares those files. **Land this
    DTO-extraction unit first** so the photo-helper unit modifies a `catalogDto.ts` that already
    re-exports its DTOs from shared — fewer conflicting hunks. If the photo-helper unit lands first,
    this unit must rebase its `catalogDto.ts` edits around the added functions (mechanical).
  - A unit that adds an `Upcoming` screen to the miniapp (06-miniapp.md F02) should land **after**
    this one and consume the shared `UpcomingItem` directly.
- **Files shared with other units:** `catalog.ts`, `catalogDto.ts`, `datetime.ts`, `readApiHandler.ts`
  appear in several cleanup refactors — flag for the reconcile pass.

## Risk & rollback

**Anthropic 16-union limit — NOT affected.** This unit does not touch
`packages/bot/src/adapters/anthropic/claudeExtractor.ts`, its Zod `ChanoteSchema`, or any
`output_config.format` schema. `ChanoteSchema` is a runtime Zod object; the moved `Chanote` is a
TypeScript interface used only as the *return type* of `toChanote()` (`claudeExtractor.ts:401`). That
import path is `../../core/domain/catalog.js`, which now **re-exports** `Chanote` from shared — so the
import line is unchanged and the schema is untouched. The `claudeExtractor.test.ts` 16-union
regression guard stays green by construction. (Confirmed: `grep` shows `Chanote` is imported from the
domain in `claudeExtractor.ts:4`, `catalogRepository.ts:12`, `ports/extraction.ts:9`; all three keep
importing from the domain, which re-exports — zero edits to those three files.)

**Hexagonal layering — deliberate, acceptable.** `core/domain/catalog.ts` (and `core/domain/datetime.ts`)
now `import`/re-export from `@line-robot/shared`. This is the **shared-kernel** pattern: `@line-robot/shared`
is a types-and-constants-only package with **zero** runtime dependencies and **zero** infra coupling —
strictly *below* adapters in the dependency graph, not an infra leak. The alternative (keep `Chanote`
and the constants in `core/domain` and have `shared` re-export *from the bot*) would force the miniapp's
`shared` import to transitively reach into `packages/bot/core/domain` and would couple the browser SPA's
type graph to a Node server package — exactly the coupling this unit exists to remove. So the chosen
direction (domain → shared) is the correct one; the master plan and epoch-debt doc both prescribe a
`packages/shared` that the domain imports.

**Module-resolution mismatch — handled by source-only exports.** The package exposes its `.ts`
source via `exports.types`/`types`. NodeNext (bot) resolves `exports.types`; bundler (miniapp) resolves
`types`; both point at `src/index.ts`. esbuild and Vite both transpile `.ts` from a dependency with no
config change (the package is not `external`). If, contrary to expectation, NodeNext refuses to resolve
a `.ts` `types` entry under a consumer's settings, the fallback is to add `"allowImportingTsExtensions"`
is **not** needed (the package specifier is bare, not a `.ts` path) — the documented risk is low. The
`npm run typecheck` step in Verification is the gate that catches any resolution issue immediately.

**npm-install ordering** is the most likely operational footgun: editing a consumer before
`npm install` links the symlink yields "Cannot find module '@line-robot/shared'". Mitigated by making
Step 3 (`npm install`) mandatory before Steps 4–11.

**Rollback.** Fully mechanical and isolated: `git checkout` the modified consumers, restore
`packages/miniapp/src/types.ts`, and `rm -rf packages/shared`, then `npm install`. No data, infra, or
deployed-artifact state is involved (no Pulumi change, no Lambda env change, no table change). The
read-API JSON on the wire is byte-identical (only the *declaration site* of the types moved), so a
deployed bot and a deployed miniapp remain wire-compatible across the change — rollback of one side
does not require rollback of the other.
