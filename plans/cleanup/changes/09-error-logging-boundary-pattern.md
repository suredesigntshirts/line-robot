# 09 — Make handler-boundary error handling consistent (log-then-return, no silent swallow)

> **Reconcile-pass note (queue 00).** Land order **09 BEFORE 03** (both edit `catalogAssistant.ts` and
> `readApiHandler.ts` photo regions) and **after 02** (which retypes the `readApiHandler` request/
> response seam, disjoint from the `presign*` helpers). Coordination:
> - **`core/handlers/catalogAssistant.ts`**: THIS unit adds a `logger?` 5th ctor param and
>   `logger?.warn(...)` inside the `heroUrls` (L117) and `presignPhotos` (L257) **catch bodies**. Unit
>   03 later deletes the file-private `orderedPhotos`/`heroPhotoKey` and imports them from
>   `core/domain/photos.js` — it must **preserve** the `logger?.warn` catch bodies this unit adds.
> - **`app/readApiHandler.ts`**: THIS unit threads `logger` through `presign`/`presignHero`/
>   `presignGallery`. Unit 03 then swaps those helpers' calls to the domain `orderedPhotos`/
>   `heroPhotoKey` — it must keep the `logger` params/args this unit added. Unit 02's seam retype
>   (`json`/`bearerToken`/`handle*` → `HttpRequest`/`HttpResponse`) does not touch `presign*`.
> - **`core/handlers/registry.ts`**: THIS unit adds `readonly logger?: Logger` to `HandlerDeps` and
>   forwards it. Unit 07 (catalog-port split) treats `HandlerDeps.catalog` as the broadest site and
>   makes **no functional change** there — no conflict (different field).
> - **`lambda/processor.ts`**: THIS unit adds a `logger` key to the two handler-factory literals; unit
>   02 adds `parser` to the EventProcessor deps; unit 08 swaps the cold-start wrapper. Disjoint regions.

## Goal & rationale

Presigned-URL failures are caught and turned into `null`/dropped with **no log** in three handler-boundary
sites — `CatalogAssistant.heroUrls`, `CatalogAssistant.presignPhotos`, and the module-level `presign`
helper in `readApiHandler.ts`. Each was copied with a "mirrors heroUrls" / "mirrors the chat assistant"
comment, so a bad or expired S3 key makes a photo silently vanish from a listing with **zero operational
signal**. This is finding **#5 "Silent swallow without logging"** in
`plans/cleanup/09-epoch-design-debt.md` (and Theme G in `00-master-plan.md`). The project already has the
**correct** log-then-return convention in the media-collection path
(`app/ingestionSweep.ts:710-716` — `catch (error) { logger.warn("…", { s3Key, error: String(error) }); return null; }`).
This unit applies that **same inline convention** at all three presign boundaries so failures become
observable. Behaviour is identical (failures still return `null`/drop the URL); the only new observable
effect is a `logger.warn` per failure.

## Blast radius

- **Files created:** none.
- **Files modified:**
  - `packages/bot/src/core/handlers/catalogAssistant.ts` — import `Logger` from `../ports/runtime.js`;
    add `logger?: Logger` as the 5th constructor param; add `logger?.warn(...)` in the two `catch`
    blocks (`heroUrls` ~line 117, `presignPhotos` ~line 257).
  - `packages/bot/src/core/handlers/registry.ts` — import `Logger`; add `readonly logger?: Logger` to
    `HandlerDeps`; forward `deps.logger` as the 5th arg into both `new CatalogAssistant(...)` calls
    (`createDefaultMessageHandler` ~line 48, `createPostbackRouter` ~line 59).
  - `packages/bot/src/app/readApiHandler.ts` — change `presign(signer, key)` →
    `presign(signer, key, logger)` and add `logger.warn(...)` in its `catch` (~line 75); thread `logger`
    through `presignHero` and `presignGallery`; pass `deps.logger` at the two call sites
    (`handleMyProperties` ~line 127, `handlePropertyDetail` ~line 148). **No `ReadApiDeps` interface
    change** — `logger: Logger` already exists.
  - `packages/bot/src/lambda/processor.ts` — add `logger` to the `HandlerDeps` object literals passed to
    `createDefaultMessageHandler(...)` (~line 70) and `createPostbackRouter(...)` (~line 71); `logger` is
    already in scope as a local `const`.
  - `packages/bot/test/unit/catalogAssistant.test.ts` — add two new tests (hero-presign-fail warn,
    gallery-presign-fail warn) with a spy logger; see Tests.
  - `packages/bot/test/unit/readApiHandler.test.ts` — convert the no-op logger to a warn-capturing spy
    and assert the warn on the existing presign-fail test; add a hero-presign-fail test on
    `/me/properties`; see Tests.
- **Files deleted:** none.
- **Context-only (no change):**
  - `packages/bot/src/lib/logger.ts` — `PowertoolsLoggerAdapter.warn()` already exists.
  - `packages/bot/src/core/ports/runtime.ts` — `Logger.warn()` already declared.
  - `packages/bot/src/lambda/read-api.ts` — already passes `logger: new PowertoolsLoggerAdapter()`.
- **All call-sites to update:** every one:
  - `packages/bot/src/core/handlers/registry.ts:48` — `new CatalogAssistant(deps.catalog, deps.clock, undefined, deps.signer)` → append `, deps.logger`.
  - `packages/bot/src/core/handlers/registry.ts:59` — `new CatalogAssistant(deps.catalog, deps.clock, undefined, deps.signer)` → append `, deps.logger`.
  - `packages/bot/src/lambda/processor.ts:70` — add `logger` key to the `createDefaultMessageHandler({...})` literal.
  - `packages/bot/src/lambda/processor.ts:71` — add `logger` key to the `createPostbackRouter({...})` literal.
  - `packages/bot/src/app/readApiHandler.ts:88` — `presign(signer, key)` → `presign(signer, key, logger)` (inside `presignHero`).
  - `packages/bot/src/app/readApiHandler.ts:93` — `presign(signer, p.s3Key)` → `presign(signer, p.s3Key, logger)` (inside `presignGallery`).
  - `packages/bot/src/app/readApiHandler.ts:127` — `presignHero(deps.signer, p)` → `presignHero(deps.signer, p, deps.logger)` (inside `handleMyProperties`).
  - `packages/bot/src/app/readApiHandler.ts:148` — `presignGallery(deps.signer, property)` → `presignGallery(deps.signer, property, deps.logger)` (inside `handlePropertyDetail`).
  - **No change required** (optional param, backward-compatible) at: `postbackRouter.test.ts:13` &
    `:57`, `commandHandler.test.ts:12`, `registry.test.ts:44/90/94`, and the success-path
    `catalogAssistant.test.ts` constructions (`:33`, `:43`, `:59`, `:80`, `:92`, `:114`, `:142`, etc.).
- **Tests touched:** update `catalogAssistant.test.ts` (add 2 tests) and `readApiHandler.test.ts`
  (upgrade spy + add 1 test). No change to `registry.test.ts`, `postbackRouter.test.ts`,
  `commandHandler.test.ts`.

## Current code

`packages/bot/src/core/handlers/catalogAssistant.ts` (constructor + the two swallow sites):

```ts
constructor(
  private readonly catalog: CatalogRepository,
  private readonly clock: Clock,
  newId?: () => string,
  private readonly signer?: MediaUrlSigner,
) {
  this.newId = newId ?? randomUUID;
}

// heroUrls (~line 115-119)
try {
  return [property.propertyId, await signer.presignGet(key)] as const;
} catch {
  return null;
}

// presignPhotos (~line 255-259)
try {
  return await signer.presignGet(key);
} catch {
  return null;
}
```

Imports today (no `Logger`):

```ts
import type { Clock } from "../ports/runtime.js";
```

`packages/bot/src/core/handlers/registry.ts` (interface + factories):

```ts
export interface HandlerDeps {
  readonly catalog: CatalogRepository;
  readonly clock: Clock;
  readonly signer?: MediaUrlSigner;
  readonly extractor?: PropertyExtractor;
}

export function createDefaultMessageHandler(deps: HandlerDeps): MessageHandler {
  const assistant = new CatalogAssistant(deps.catalog, deps.clock, undefined, deps.signer);
  // ...
}

export function createPostbackRouter(deps: HandlerDeps): PostbackRouter {
  return new CatalogPostbackRouter(
    new CatalogAssistant(deps.catalog, deps.clock, undefined, deps.signer),
  );
}
```

`registry.ts` imports today (no `Logger`):

```ts
import type { Clock } from "../ports/runtime.js";
```

`packages/bot/src/app/readApiHandler.ts` (the swallow site + helpers + call sites):

```ts
async function presign(signer: MediaUrlSigner, key: string): Promise<string | null> {
  try {
    return await signer.presignGet(key);
  } catch {
    return null;
  }
}

async function presignHero(
  signer: MediaUrlSigner,
  property: Property,
): Promise<string | undefined> {
  const key = heroPhotoKey(property.photos);
  if (key === undefined) {
    return undefined;
  }
  return (await presign(signer, key)) ?? undefined;
}

async function presignGallery(signer: MediaUrlSigner, property: Property): Promise<PhotoDto[]> {
  const photos = orderedPhotos(property.photos);
  const urls = await Promise.all(photos.map((p) => presign(signer, p.s3Key)));
  // ...
}

// handleMyProperties (~line 127)
const heroUrl = await presignHero(deps.signer, p);

// handlePropertyDetail (~line 148)
const photos = await presignGallery(deps.signer, property);
```

`ReadApiDeps` already carries `logger` (no interface change needed):

```ts
export interface ReadApiDeps {
  readonly catalog: CatalogRepository;
  readonly signer: MediaUrlSigner;
  readonly verifier: LineTokenVerifier;
  readonly logger: Logger;   // <-- already here
  readonly clock: Clock;
}
```

`packages/bot/src/lambda/processor.ts` (wiring, `logger` already in scope at line 48):

```ts
const logger = new PowertoolsLoggerAdapter();
// ...
handler: createDefaultMessageHandler({ catalog, clock: SYSTEM_CLOCK, signer, extractor }),
postback: createPostbackRouter({ catalog, clock: SYSTEM_CLOCK, signer }),
```

The **canonical correct pattern** this unit mirrors, `app/ingestionSweep.ts:710-716`:

```ts
} catch (error) {
  this.deps.logger.warn("ingestion sweep: media read failed; skipping", {
    s3Key: attachment.s3Key,
    error: String(error),
  });
  return null;
}
```

## Target design

**Convention (chosen over a shared helper):** apply the existing inline log-then-return shape at each
boundary — `catch (error) { logger?.warn("<context>: presign failed; dropping photo", { …keys, error: String(error) }); return null; }`.
No new module or exported symbol is introduced. (Rationale in "Open questions / decisions": a shared
`presignSafe` helper would need a new home that overlaps with the separate `core/domain/photos.ts`
refactor — keeping this unit inline matches the established codebase convention and stays
conflict-free.)

`CatalogAssistant` constructor — new 5th optional param `logger?` (order: `catalog, clock, newId?, signer?, logger?`):

```ts
import type { Clock, Logger } from "../ports/runtime.js";

export class CatalogAssistant {
  private readonly newId: () => string;

  constructor(
    private readonly catalog: CatalogRepository,
    private readonly clock: Clock,
    newId?: () => string,
    private readonly signer?: MediaUrlSigner,
    private readonly logger?: Logger,
  ) {
    this.newId = newId ?? randomUUID;
  }
  // ...
}
```

`heroUrls` catch (note `property.propertyId` is in scope inside the `.map` callback):

```ts
try {
  return [property.propertyId, await signer.presignGet(key)] as const;
} catch (error) {
  this.logger?.warn("catalog: hero presign failed; dropping photo", {
    propertyId: property.propertyId,
    s3Key: key,
    error: String(error),
  });
  return null;
}
```

`presignPhotos` catch (`key` is in scope inside the `.map` callback):

```ts
try {
  return await signer.presignGet(key);
} catch (error) {
  this.logger?.warn("catalog: gallery presign failed; dropping photo", {
    propertyId: property.propertyId,
    s3Key: key,
    error: String(error),
  });
  return null;
}
```

`HandlerDeps` gains optional `logger`:

```ts
import type { Clock, Logger } from "../ports/runtime.js";

export interface HandlerDeps {
  readonly catalog: CatalogRepository;
  readonly clock: Clock;
  readonly signer?: MediaUrlSigner;
  readonly extractor?: PropertyExtractor;
  /** When present, presign-failure warns are emitted from the assistant's photo boundaries. */
  readonly logger?: Logger;
}
```

Both factories forward `deps.logger` as the 5th constructor arg:

```ts
export function createDefaultMessageHandler(deps: HandlerDeps): MessageHandler {
  const assistant = new CatalogAssistant(deps.catalog, deps.clock, undefined, deps.signer, deps.logger);
  // ...
}

export function createPostbackRouter(deps: HandlerDeps): PostbackRouter {
  return new CatalogPostbackRouter(
    new CatalogAssistant(deps.catalog, deps.clock, undefined, deps.signer, deps.logger),
  );
}
```

`readApiHandler.ts` — `presign` takes a required `logger` (the module is only reachable with a fully-wired
`ReadApiDeps`, so it is always available; no `?.`):

```ts
async function presign(
  signer: MediaUrlSigner,
  key: string,
  logger: Logger,
): Promise<string | null> {
  try {
    return await signer.presignGet(key);
  } catch (error) {
    logger.warn("read-api: presign failed; dropping photo", {
      s3Key: key,
      error: String(error),
    });
    return null;
  }
}

async function presignHero(
  signer: MediaUrlSigner,
  property: Property,
  logger: Logger,
): Promise<string | undefined> {
  const key = heroPhotoKey(property.photos);
  if (key === undefined) {
    return undefined;
  }
  return (await presign(signer, key, logger)) ?? undefined;
}

async function presignGallery(
  signer: MediaUrlSigner,
  property: Property,
  logger: Logger,
): Promise<PhotoDto[]> {
  const photos = orderedPhotos(property.photos);
  const urls = await Promise.all(photos.map((p) => presign(signer, p.s3Key, logger)));
  // ...unchanged...
}
```

`processor.ts` wiring:

```ts
handler: createDefaultMessageHandler({ catalog, clock: SYSTEM_CLOCK, signer, extractor, logger }),
postback: createPostbackRouter({ catalog, clock: SYSTEM_CLOCK, signer, logger }),
```

**New exports:** none. (Only the optional `logger?: Logger` field added to the existing `HandlerDeps`
interface and the optional `logger?` constructor param.)

## Step-by-step implementation

1. **`packages/bot/src/core/handlers/catalogAssistant.ts` — import `Logger`.**
   Change `import type { Clock } from "../ports/runtime.js";` to
   `import type { Clock, Logger } from "../ports/runtime.js";`.

2. **Same file — add the constructor param.** After the `private readonly signer?: MediaUrlSigner,`
   line, add a new line `private readonly logger?: Logger,` (so the param order becomes
   `catalog, clock, newId?, signer?, logger?`). Leave the `this.newId = newId ?? randomUUID;` body as-is.

3. **Same file — `heroUrls` catch (~line 115-119).** Replace:
   ```ts
   try {
     return [property.propertyId, await signer.presignGet(key)] as const;
   } catch {
     return null;
   }
   ```
   with:
   ```ts
   try {
     return [property.propertyId, await signer.presignGet(key)] as const;
   } catch (error) {
     this.logger?.warn("catalog: hero presign failed; dropping photo", {
       propertyId: property.propertyId,
       s3Key: key,
       error: String(error),
     });
     return null;
   }
   ```

4. **Same file — `presignPhotos` catch (~line 255-259).** Replace:
   ```ts
   try {
     return await signer.presignGet(key);
   } catch {
     return null;
   }
   ```
   with:
   ```ts
   try {
     return await signer.presignGet(key);
   } catch (error) {
     this.logger?.warn("catalog: gallery presign failed; dropping photo", {
       propertyId: property.propertyId,
       s3Key: key,
       error: String(error),
     });
     return null;
   }
   ```
   (`property` is the method parameter and `key` is the `.map` callback parameter — both in scope.)

5. **`packages/bot/src/core/handlers/registry.ts` — import `Logger`.** Change
   `import type { Clock } from "../ports/runtime.js";` to
   `import type { Clock, Logger } from "../ports/runtime.js";`.

6. **Same file — add `logger?` to `HandlerDeps`.** Inside the interface, after the `extractor?` field
   (or anywhere in the body), add:
   ```ts
   /** When present, presign-failure warns are emitted from the assistant's photo boundaries. */
   readonly logger?: Logger;
   ```

7. **Same file — forward `deps.logger` in `createDefaultMessageHandler` (~line 48).** Change
   `new CatalogAssistant(deps.catalog, deps.clock, undefined, deps.signer)` to
   `new CatalogAssistant(deps.catalog, deps.clock, undefined, deps.signer, deps.logger)`.

8. **Same file — forward `deps.logger` in `createPostbackRouter` (~line 59).** Change
   `new CatalogAssistant(deps.catalog, deps.clock, undefined, deps.signer)` to
   `new CatalogAssistant(deps.catalog, deps.clock, undefined, deps.signer, deps.logger)`.

9. **`packages/bot/src/lambda/processor.ts` — add `logger` to both factory literals (~line 70-71).**
   Change:
   ```ts
   handler: createDefaultMessageHandler({ catalog, clock: SYSTEM_CLOCK, signer, extractor }),
   postback: createPostbackRouter({ catalog, clock: SYSTEM_CLOCK, signer }),
   ```
   to:
   ```ts
   handler: createDefaultMessageHandler({ catalog, clock: SYSTEM_CLOCK, signer, extractor, logger }),
   postback: createPostbackRouter({ catalog, clock: SYSTEM_CLOCK, signer, logger }),
   ```
   (`logger` is already declared as `const logger = new PowertoolsLoggerAdapter();` at line 48.)

10. **`packages/bot/src/app/readApiHandler.ts` — `presign` signature + catch (~line 72-78).** Replace:
    ```ts
    async function presign(signer: MediaUrlSigner, key: string): Promise<string | null> {
      try {
        return await signer.presignGet(key);
      } catch {
        return null;
      }
    }
    ```
    with:
    ```ts
    async function presign(
      signer: MediaUrlSigner,
      key: string,
      logger: Logger,
    ): Promise<string | null> {
      try {
        return await signer.presignGet(key);
      } catch (error) {
        logger.warn("read-api: presign failed; dropping photo", {
          s3Key: key,
          error: String(error),
        });
        return null;
      }
    }
    ```
    (`Logger` is already imported at line 19: `import type { Clock, Logger } from "../core/ports/runtime.js";`.)

11. **Same file — `presignHero` signature + body (~line 80-89).** Add a `logger: Logger,` param after
    `property: Property,` and change the call to `presign(signer, key, logger)`:
    ```ts
    async function presignHero(
      signer: MediaUrlSigner,
      property: Property,
      logger: Logger,
    ): Promise<string | undefined> {
      const key = heroPhotoKey(property.photos);
      if (key === undefined) {
        return undefined;
      }
      return (await presign(signer, key, logger)) ?? undefined;
    }
    ```

12. **Same file — `presignGallery` signature + body (~line 91-93).** Add a `logger: Logger,` param after
    `property: Property,` and change the inner call to `presign(signer, p.s3Key, logger)`:
    ```ts
    async function presignGallery(
      signer: MediaUrlSigner,
      property: Property,
      logger: Logger,
    ): Promise<PhotoDto[]> {
      const photos = orderedPhotos(property.photos);
      const urls = await Promise.all(photos.map((p) => presign(signer, p.s3Key, logger)));
      // ...rest of function unchanged...
    }
    ```

13. **Same file — `handleMyProperties` call site (~line 127).** Change
    `const heroUrl = await presignHero(deps.signer, p);` to
    `const heroUrl = await presignHero(deps.signer, p, deps.logger);`.

14. **Same file — `handlePropertyDetail` call site (~line 148).** Change
    `const photos = await presignGallery(deps.signer, property);` to
    `const photos = await presignGallery(deps.signer, property, deps.logger);`.

15. Run `npm run typecheck`, `npm run lint`, `npm run test`. See Verification.

## Tests

All behaviour stays identical (failures still drop the URL); the new tests pin the **new observable: a
`warn` per failure**. No bug fix is being made — this is added observability.

**`packages/bot/test/unit/catalogAssistant.test.ts` — add two tests** (place them after the existing
"presigns a hero image…" / "presigns all photos…" tests). Use a spy logger and a signer that throws for
a "boom" key, mirroring the readApiHandler test's signer convention.

```ts
/** A logger spy that records every warn call for assertion. */
function spyLogger() {
  const warns: Array<{ msg: string; ctx?: Record<string, unknown> }> = [];
  return {
    warns,
    info() {},
    warn(msg: string, ctx?: Record<string, unknown>) {
      warns.push({ msg, ctx });
    },
    error() {},
  };
}

it("warns and drops the hero when a property's presign throws, keeping the others", async () => {
  const catalog = new FakeCatalog();
  seedUserListings(catalog, "U1", "user#U1", [
    prop("good", {
      normalizedAddress: "1 Good Rd",
      lastActivityAt: 2,
      photos: [{ s3Key: "good/hero.jpg", kind: "property" }],
    }),
    prop("bad", {
      normalizedAddress: "2 Boom Rd",
      lastActivityAt: 1,
      photos: [{ s3Key: "bad/boom.jpg", kind: "property" }],
    }),
  ]);
  const signer = {
    presignGet: async (key: string) => {
      if (key.includes("boom")) throw new Error("presign failed");
      return `signed:${key}`;
    },
  };
  const logger = spyLogger();

  const [msg] = await new CatalogAssistant(catalog, clock, undefined, signer, logger).myListings("U1");
  if (msg?.type !== "flex") throw new Error("expected a flex carousel");
  expect(msg.cards[0]?.heroImageUrl).toBe("signed:good/hero.jpg"); // good survives
  expect(msg.cards[1]?.heroImageUrl).toBeUndefined(); // bad dropped
  expect(logger.warns).toHaveLength(1);
  expect(logger.warns[0]?.ctx).toMatchObject({ propertyId: "bad", s3Key: "bad/boom.jpg" });
});

it("warns once per failed photo in the gallery and drops only the bad ones", async () => {
  const catalog = new FakeCatalog().seedProperty(
    prop("p1", {
      normalizedAddress: "1 Rama IX",
      photos: [
        { s3Key: "ok.jpg", kind: "property" },
        { s3Key: "boom.jpg", kind: "property" },
      ],
    }),
  );
  const signer = {
    presignGet: async (key: string) => {
      if (key.includes("boom")) throw new Error("presign failed");
      return `signed:${key}`;
    },
  };
  const logger = spyLogger();
  const assistant = new CatalogAssistant(catalog, clock, undefined, signer, logger);

  const [gallery] = await assistant.showPhotos("p1");
  if (gallery?.type !== "imageCarousel") throw new Error("expected an image carousel");
  expect(gallery.imageUrls).toEqual(["signed:ok.jpg"]); // boom dropped
  expect(logger.warns).toHaveLength(1);
  expect(logger.warns[0]?.ctx).toMatchObject({ propertyId: "p1", s3Key: "boom.jpg" });
});
```

**`packages/bot/test/unit/readApiHandler.test.ts` — upgrade the spy and assert warns.**

1. Replace the no-op logger inside `deps(...)` with a module-level capturing spy so individual tests can
   read and reset it. Add near the top (after the `signer` const):
   ```ts
   /** Capturing logger spy: tests read `warns` and reset it per-case. */
   const logSpy = { warns: [] as Array<{ msg: string; ctx?: Record<string, unknown> }> };
   const captureLogger = {
     info() {},
     warn(msg: string, ctx?: Record<string, unknown>) {
       logSpy.warns.push({ msg, ctx });
     },
     error() {},
   };
   ```
   and change `deps(...)`'s `logger:` field from `{ info() {}, warn() {}, error() {} }` to `captureLogger`.
   Reset it at the start of each warn-asserting test with `logSpy.warns.length = 0;`.

2. Extend the existing test **"does not 500 when one photo fails to presign — it drops the bad one"**
   (~line 136): after the existing assertions add:
   ```ts
   expect(logSpy.warns.length).toBeGreaterThanOrEqual(1);
   expect(logSpy.warns.some((w) => w.ctx?.s3Key === "p3/boom.jpg")).toBe(true);
   ```
   (Reset `logSpy.warns.length = 0;` as the first line of this test so prior cases don't leak.)

3. Add a parallel **hero-presign-failure** test under `describe("GET /me/properties", …)`:
   ```ts
   it("warns and omits the hero (no 500) when a listing's hero presign fails", async () => {
     logSpy.warns.length = 0;
     const catalog = seeded();
     catalog
       .seedProperty({
         propertyId: "p9",
         normalizedAddress: "boom hero",
         lastActivityAt: 300, // newest → sorts first
         photos: [{ s3Key: "p9/boom.jpg", kind: "property" }],
       })
       .seedEdge(CONV, "p9");
     const res = await handleReadApi(deps(catalog), event("GET", "/me/properties", AUTH));
     const list = body(res) as Array<{ propertyId: string; heroUrl?: string }>;
     const p9 = list.find((p) => p.propertyId === "p9");
     expect(p9?.heroUrl).toBeUndefined(); // dropped, not a 500
     expect(logSpy.warns.some((w) => w.ctx?.s3Key === "p9/boom.jpg")).toBe(true);
   });
   ```

**No change** to `registry.test.ts`, `postbackRouter.test.ts`, `commandHandler.test.ts` — they construct
without `logger` and the optional param keeps them compiling and green. Note that the no-signer path in
those tests never reaches a `catch`, so no warn is emitted regardless.

## Verification

```
npm run typecheck   # tsc across workspaces — expect PASS (optional params are backward-compatible)
npm run lint        # biome — expect PASS (no unused vars; `error` is consumed in String(error))
npm run test        # vitest unit — expect PASS, incl. 3 new/updated tests asserting warn counts
```

Persistence is **not** touched (no DynamoDB / S3 access pattern change), so
`npm --prefix packages/bot run test:integration` is **not required** for this unit.

Expected result: all green. Baseline `npm run typecheck` was confirmed green before this change.

## Dependencies & ordering

- **No hard dependency** on any other change-unit; this is self-contained and can land first.
- **Shares files with these refactors — coordinate to avoid merge conflicts:**
  - `core/domain/photos.ts` extraction (master-plan P1 #1 / debt refactor #3) touches the **same regions**
    of `catalogAssistant.ts` (`heroUrls`, `presignPhotos`) and `readApiHandler.ts` (`presign*` helpers).
    If both land, **this unit (09) should land first** — it only adds a `logger` param + a `catch` body,
    leaving the function bodies in place for the later extraction to move. The extraction must then
    **preserve** the `logger?.warn(...)` lines when relocating the catch logic.
  - `registry.ts` `createHandlers(deps)` merge (master-plan P2 #23): once `HandlerDeps` has `logger?`,
    that later merge inherits the field for free; no conflict if 09 lands first.
  - `readApiHandler` transport-agnostic refactor (P1 #7): unrelated to the presign catch bodies; touches
    routing/types, not the `presign*` helpers' internals. Low conflict.
- **Does NOT depend on** and does not touch the Anthropic extractor / Zod schema work — see Risk.

## Risk & rollback

- **Anthropic 16-union limit:** **No risk.** This unit never touches `claudeExtractor.ts` or any
  `output_config.format` / Zod schema; no `.nullable()`/`.optional()`/`anyOf` is added. The regression
  test that asserts ≤16 unions is unaffected.
- **Hexagonal layering:** **Moves toward the ideal, never away.** `Logger` is a **port**
  (`core/ports/runtime.ts`); `CatalogAssistant` (in `core/handlers/`) importing a port is legal in the
  hex model. No infra/adapter dependency is introduced. The concrete `PowertoolsLoggerAdapter` is wired
  only at the Lambda boundaries (`processor.ts`, `read-api.ts`), which is correct.
- **Optional-param guard:** `CatalogAssistant.logger` is optional — every catch uses `this.logger?.warn`,
  so call-sites that omit `logger` (all existing tests, and any deploy without a logger) **cannot crash**.
  Forgetting the `?.` would NPE those call-sites — the implementer must keep the optional chain. In
  `readApiHandler.ts`, `logger` is **required** on `presign*` because `ReadApiDeps.logger` is always
  present; no `?.` there (and a missing arg would be a compile error, caught by typecheck).
- **Param-order footgun:** `CatalogAssistant`'s order is now `catalog, clock, newId?, signer?, logger?`.
  All 14 existing positional call-sites pass 2-4 args and stay valid; only the two registry sites pass the
  5th. Do not insert `logger` before `signer`.
- **Test-isolation risk:** upgrading `readApiHandler.test.ts`'s no-op logger to a capturing spy could
  surface a warn in a path not previously asserted. Mitigation: the spy only **records** (never throws),
  and the existing success-path tests do not assert on warn count, so they remain green. The new tests
  reset `logSpy.warns.length = 0` at their start to avoid cross-test bleed.
- **Rollback:** fully mechanical and isolated. Revert the single commit; nothing else depends on the new
  field. No data migration, no infra change, no deploy coupling.

## Open questions / decisions

Status is **ready** — there is one noted design choice with a clearly-correct resolution, not a genuine
fork requiring escalation:

- **Inline convention vs. a shared `presignSafe(signer, key, logger, ctx)` helper.** A single shared
  helper would DRY the three catch bodies, but (a) the three sites span two layers
  (`core/handlers/catalogAssistant.ts` and `app/readApiHandler.ts`) with **no shared home today**, and a
  new home (`core/domain/photos.ts`) is **owned by a separate refactor** (master-plan P1 #1 / debt
  refactor #3) — creating it here would collide with that unit; (b) the established codebase convention is
  **inline log-then-return with a consistent shape** (`ingestionSweep.ts` has four such sites, no helper);
  (c) inline keeps unit 09 minimal and conflict-free, and the later photo-helper extraction can fold the
  catch into the shared module if desired. **Decision: apply the inline convention** (the goal's "one
  convention", not "one helper"). This is recorded for transparency, not as a blocker.
