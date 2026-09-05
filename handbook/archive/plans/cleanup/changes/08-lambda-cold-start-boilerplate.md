# 08 — Unify the 5 Lambda cold-start patterns (lazySingleton + SYSTEM_CLOCK) + per-lambda env schema

> **Reconcile-pass note (queue 00).** This unit is **independent** (no hard dependency) and is
> recommended to land **early**, before the boundary units rewrite the lambda handler bodies, because
> it is purely structural (the cold-start wrapper + the shared clock import). Shared-file coordination:
> - **`lambda/processor.ts`** is also edited by unit 02 (adds `parser: new LineWebhookParser()` to the
>   `EventProcessor` deps object) and unit 09 (adds a `logger` key to the two handler-factory literals).
>   THIS unit only touches the `SYSTEM_CLOCK` def, the `let depsPromise`/`getDeps` cold-start block, and
>   the import lines — disjoint regions. If this unit lands first (recommended), 02 and 09 add their
>   keys to deps objects that already use the imported `SYSTEM_CLOCK`/`getDeps`.
> - **`lambda/ingest.ts` and `lambda/read-api.ts`** are also edited by unit 02 (the `HttpRequest`/
>   `HttpResponse` mapping + `toHttpRequest`). THIS unit changes only the memoisation wrapper, the
>   `SYSTEM_CLOCK` import (read-api), and read-api's `loadEnv` → `loadReadApiEnv` swap. Land **08 before
>   02** so 02's `toHttpRequest`/handler-signature edits rebase onto the unified `lazySingleton`
>   skeleton (02's spec already says "landing this unit [08] first is cleaner").
> - **`adapters/config/config.ts`** — this unit only *appends* `ReadApiEnvSchema`/`loadReadApiEnv`,
>   leaving `EnvSchema`/`loadEnv` intact; additive, low conflict with any other config edit.

## Goal & rationale

`const SYSTEM_CLOCK = { now: () => Date.now() }` is copy-pasted verbatim into four Lambda entry
points (`processor.ts`, `read-api.ts`, `reminder.ts`, `sweep.ts`), and the cold-start lazy-singleton
memoisation (`let p; p ??= build(); return p`) is hand-rolled five times with two different variable
names (`depsPromise` vs `sweepPromise`) and two different shapes (a `getDeps()` getter in the HTTP
lambdas vs an inlined `??=` in the handler body of the scheduled lambdas). This change-unit extracts
one shared `SYSTEM_CLOCK` (`lib/clock.ts`) and one generic `lazySingleton<T>` helper
(`lib/lazySingleton.ts`), then normalises all five entry points onto the identical
`buildX → const getX = lazySingleton(buildX) → handler calls await getX()` skeleton — the pattern we
copy for every future Lambda. It also splits the shared `EnvSchema` so the read-only `read-api`
Lambda validates only the three env vars it has IAM permission to use, instead of carrying
`MESSAGES_TABLE`/`IDEMPOTENCY_TABLE`/`CHANNEL_*_PARAM`/`QUEUE_URL` it can never touch.

Sources: `plans/cleanup/03-app-lambda.md` F06 (SYSTEM_CLOCK ×4) + F07 (memoisation naming drift);
`plans/cleanup/07-infra-build.md` F02 (shared-EnvSchema noise) + cross-cutting "commonEnv as a leaky
abstraction"; `plans/cleanup/00-master-plan.md` P2 #18 + #19, Theme F, and the explicit constraint
at line 133 ("the underlying `??=` logic is correct and should not be altered beyond the structural
normalisation"); `plans/cleanup/09-epoch-design-debt.md` (Epoch A: the `buildDeps` composition root
"would memoize a rejected promise and brick all subsequent warm invocations — has no test").

**Behaviour is identical** — including the memoisation-of-rejection hazard, which is **preserved on
purpose** (see Open questions / decisions and Risk). The only intentional behavioural change is that
`read-api` cold-start now validates a narrower env set; this is a correctness improvement (no false
env vars) coordinated with the infra env block.

## Blast radius

- **Files created:**
  - `packages/bot/src/lib/clock.ts` — exports `SYSTEM_CLOCK: Clock`.
  - `packages/bot/src/lib/lazySingleton.ts` — exports `lazySingleton<T>(factory) => () => Promise<T>`.
  - `packages/bot/test/unit/clock.test.ts` — coverage for `SYSTEM_CLOCK`.
  - `packages/bot/test/unit/lazySingleton.test.ts` — coverage for `lazySingleton`, incl. the
    rejection-memoisation behaviour pin.

- **Files modified:**
  - `packages/bot/src/lambda/ingest.ts` — replace `let depsPromise` + `getDeps()` (lines 9, 24–27)
    with `const getDeps = lazySingleton(buildDeps)`. No `SYSTEM_CLOCK` here (ingest doesn't use it).
  - `packages/bot/src/lambda/processor.ts` — remove local `SYSTEM_CLOCK` (line 26), import it from
    `lib/clock.js`; replace `let depsPromise` + `getDeps()` (lines 33, 93–96) with
    `const getDeps = lazySingleton(buildDeps)`.
  - `packages/bot/src/lambda/read-api.ts` — remove local `SYSTEM_CLOCK` (line 12), import from
    `lib/clock.js`; replace `let depsPromise` + `getDeps()` (lines 38–43) with
    `const getDeps = lazySingleton(buildDeps)`; switch `loadEnv()` → `loadReadApiEnv()` and drop the
    now-redundant `CATALOG_TABLE`/`LIFF_CHANNEL_ID` `undefined` guards (the scoped schema requires
    them).
  - `packages/bot/src/lambda/reminder.ts` — remove local `SYSTEM_CLOCK` (line 10), import from
    `lib/clock.js`; replace `let sweepPromise` + inlined `??=` in handler (lines 30, 33) with
    `const getSweep = lazySingleton(buildReminderSweep)` and `await (await getSweep()).run()`.
  - `packages/bot/src/lambda/sweep.ts` — remove local `SYSTEM_CLOCK` (line 17), import from
    `lib/clock.js`; replace `let sweepPromise` + inlined `??=` in handler (lines 49, 52) with
    `const getSweep = lazySingleton(buildSweep)` and `await (await getSweep()).run()`.
  - `packages/bot/src/adapters/config/config.ts` — add `ReadApiEnvSchema`, `ReadApiEnv` type, and
    `loadReadApiEnv()`; leave existing `EnvSchema`/`Env`/`loadEnv` and the `load*` SSM functions
    untouched.
  - `infra/index.ts` — give `read-api` a scoped env block (`readApiEnv`) instead of
    `{ ...commonEnv, LIFF_CHANNEL_ID }`; the four bot lambdas keep `commonEnv` unchanged.
  - `packages/bot/test/unit/config.test.ts` — add a `describe("loadReadApiEnv")` block with a scoped
    fixture. Existing `loadEnv`/`loadSecrets` tests are unchanged.

- **Files deleted:** none.

- **All call-sites to update (every one):**
  - `packages/bot/src/lambda/ingest.ts:9` (`let depsPromise`), `:24–27` (`getDeps`), `:30` (call).
  - `packages/bot/src/lambda/processor.ts:26` (`SYSTEM_CLOCK` def), `:33` (`let depsPromise`),
    `:93–96` (`getDeps`), `:101` (call). Usages at `:70`, `:71`, `:74` stay (now the imported const).
  - `packages/bot/src/lambda/read-api.ts:12` (`SYSTEM_CLOCK` def), `:15` (`loadEnv`), `:16–21`
    (the two `undefined` guards), `:38` (`let depsPromise`), `:40–43` (`getDeps`), `:46` (call).
    Usages at `:31`, `:33` stay (imported const).
  - `packages/bot/src/lambda/reminder.ts:10` (`SYSTEM_CLOCK` def), `:30` (`let sweepPromise`),
    `:33` (`??=`), `:34` (await). Usage at `:25` stays.
  - `packages/bot/src/lambda/sweep.ts:17` (`SYSTEM_CLOCK` def), `:49` (`let sweepPromise`), `:52`
    (`??=`), `:53` (await). Usage at `:44` stays.
  - `infra/index.ts:633` (read-api `environment.variables`).
  - **No other modules import any of these symbols.** Confirmed by repo-wide grep: `SYSTEM_CLOCK`,
    `depsPromise`, `sweepPromise`, `getDeps` appear ONLY in the five lambda files; `loadEnv` is
    imported only by the five lambdas + `config.test.ts`. `packages/miniapp` and `infra` contain no
    TypeScript imports from `config.ts` (infra references env-var names only as string keys).

- **Tests touched:**
  - ADD `packages/bot/test/unit/clock.test.ts`.
  - ADD `packages/bot/test/unit/lazySingleton.test.ts`.
  - UPDATE `packages/bot/test/unit/config.test.ts` (add `loadReadApiEnv` describe block).
  - UNCHANGED (verified — they use their own inline clock literals and bypass the lambda entry
    points): `lineTokenVerifier.test.ts`, `eventProcessor.test.ts`, `reminderSweep.test.ts`,
    `readApiHandler.test.ts`, `ingestionSweep.test.ts`, and both integration tests.

## Current code

`packages/bot/src/lambda/ingest.ts` (HTTP-lambda shape — `getDeps()` getter):

```ts
let depsPromise: Promise<IngestDeps> | undefined;

async function buildDeps(): Promise<IngestDeps> {
  const env = loadEnv();
  if (env.QUEUE_URL === undefined) {
    throw new Error("QUEUE_URL is required for the ingest Lambda");
  }
  // ...
}

function getDeps(): Promise<IngestDeps> {
  depsPromise ??= buildDeps();
  return depsPromise;
}

export async function handler(event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> {
  return handleIngest(await getDeps(), event);
}
```

`packages/bot/src/lambda/sweep.ts` (scheduled-lambda shape — inlined `??=`, plus a local clock):

```ts
const SYSTEM_CLOCK = { now: () => Date.now() };

async function buildSweep(): Promise<IngestionSweep> {
  // ... uses SYSTEM_CLOCK
}

// Memoize the built sweep (incl. warm SSM-loaded secrets and SDK clients) across invocations.
let sweepPromise: Promise<IngestionSweep> | undefined;

export const handler: ScheduledHandler = async () => {
  sweepPromise ??= buildSweep();
  await (await sweepPromise).run();
};
```

`packages/bot/src/lambda/read-api.ts` (guards the optional env fields by hand):

```ts
const SYSTEM_CLOCK = { now: () => Date.now() };

async function buildDeps(): Promise<ReadApiDeps> {
  const env = loadEnv();
  if (env.CATALOG_TABLE === undefined) {
    throw new Error("CATALOG_TABLE is required for the read-api Lambda");
  }
  if (env.LIFF_CHANNEL_ID === undefined) {
    throw new Error("LIFF_CHANNEL_ID is required for the read-api Lambda");
  }
  // ... uses env.CATALOG_TABLE, env.ARCHIVE_BUCKET, env.LIFF_CHANNEL_ID, SYSTEM_CLOCK
}

let depsPromise: Promise<ReadApiDeps> | undefined;
function getDeps(): Promise<ReadApiDeps> {
  depsPromise ??= buildDeps();
  return depsPromise;
}
```

`packages/bot/src/adapters/config/config.ts` (single shared schema; the three read-api fields are
`.optional()` because the schema must also serve the bot lambdas that don't set them):

```ts
const EnvSchema = z.object({
  MESSAGES_TABLE: z.string().min(1),
  IDEMPOTENCY_TABLE: z.string().min(1),
  ARCHIVE_BUCKET: z.string().min(1),
  QUEUE_URL: z.string().min(1).optional(),
  CHANNEL_SECRET_PARAM: z.string().min(1),
  CHANNEL_ACCESS_TOKEN_PARAM: z.string().min(1),
  CATALOG_TABLE: z.string().min(1).optional(),
  ANTHROPIC_API_KEY_PARAM: z.string().min(1).optional(),
  LIFF_CHANNEL_ID: z.string().min(1).optional(),
});
export type Env = z.infer<typeof EnvSchema>;
export function loadEnv(source: NodeJS.ProcessEnv = process.env): Env {
  return EnvSchema.parse(source);
}
```

`infra/index.ts:619–637` (read-api currently inherits the whole `commonEnv`):

```ts
environment: { variables: { ...commonEnv, LIFF_CHANNEL_ID: liffChannelId } },
```

## Target design

### New: `packages/bot/src/lib/clock.ts`

```ts
import type { Clock } from "../core/ports/runtime.js";

/**
 * The production wall-clock {@link Clock}. Shared by every Lambda entry point so the
 * `{ now: () => Date.now() }` literal lives in exactly one place. Tests inject their own
 * deterministic clock instead of importing this.
 */
export const SYSTEM_CLOCK: Clock = { now: () => Date.now() };
```

Layering note: this lives in `lib/` (cross-cutting Lambda infrastructure, alongside `idempotency.ts`
and `logger.ts`), NOT in `core/ports/runtime.ts`. `runtime.ts` defines the `Clock` *port* (a pure
interface, no infra); `Date.now()` is a concrete time *source* and belongs on the adapter/lib side.
`lib/clock.ts` imports the `Clock` type from the port for annotation — dependency points
lib → core, which is correct.

### New: `packages/bot/src/lib/lazySingleton.ts`

```ts
/**
 * Cold-start memoisation for a Lambda's composition root. Returns a getter that runs `factory`
 * at most once per warm container and hands back the same Promise on every subsequent call —
 * the standard `let p; p ??= factory(); return p` pattern, factored out so all five Lambda entry
 * points share one implementation.
 *
 * NOTE — rejection is memoised. If `factory()` rejects (e.g. SSM unavailable at cold start), the
 * rejected Promise is cached and every later call rejects with the same error until the container
 * is recycled. This matches the existing per-Lambda behaviour and is INTENTIONALLY preserved (see
 * plans/cleanup/00-master-plan.md line 133: "the underlying `??=` logic is correct and should not
 * be altered"). Do NOT add retry-on-rejection here without a dedicated change-unit — it would
 * alter the processor's observable cold-start failure mode.
 */
export function lazySingleton<T>(factory: () => Promise<T>): () => Promise<T> {
  let promise: Promise<T> | undefined;
  return () => {
    promise ??= factory();
    return promise;
  };
}
```

### `config.ts` — add (do not change the existing `EnvSchema`/`Env`/`loadEnv`):

```ts
/**
 * Scoped env for the read-only read-api Lambda. It only needs the catalog table, the archive
 * bucket (to presign photos), and the public LIFF channel id (id-token `aud`). It has NO IAM grant
 * for the message/idempotency tables, the SSM secret params, or the queue — so it must not require
 * (or carry) them. All three are required-non-optional here, replacing the by-hand `undefined`
 * guards in the entry point.
 */
const ReadApiEnvSchema = z.object({
  CATALOG_TABLE: z.string().min(1),
  ARCHIVE_BUCKET: z.string().min(1),
  LIFF_CHANNEL_ID: z.string().min(1),
});
export type ReadApiEnv = z.infer<typeof ReadApiEnvSchema>;
export function loadReadApiEnv(source: NodeJS.ProcessEnv = process.env): ReadApiEnv {
  return ReadApiEnvSchema.parse(source);
}
```

16-union budget: `ReadApiEnvSchema` uses only `z.string().min(1)` (no `.nullable()`/`.optional()`/
`anyOf`), so it adds **zero** unions. This schema is NOT the Anthropic `output_config.format`
extraction schema; the regression test in that area is untouched.

### Lambda entry-point target skeleton (uniform across all five)

```ts
async function buildDeps(): Promise<Deps> { /* unchanged body */ }
const getDeps = lazySingleton(buildDeps);

export const handler /* : ... */ = async (...) => { /* uses await getDeps() */ };
```

For the two scheduled lambdas the getter is named `getSweep` (it builds a sweep, not a `Deps` bag);
the build functions keep their descriptive names (`buildSweep`, `buildReminderSweep`). New exports
introduced by this unit: `SYSTEM_CLOCK`, `lazySingleton`, `ReadApiEnvSchema` is module-private,
`ReadApiEnv` (type), `loadReadApiEnv`.

### `infra/index.ts` — scoped read-api env

```ts
// read-api is READ-ONLY: only the catalog table, the archive bucket, and the public LIFF channel
// id (id-token aud). It has no IAM grant for the message/idempotency tables, SSM params, or queue,
// so it must not carry them — loadReadApiEnv() validates exactly this set.
const readApiEnv: Record<string, pulumi.Input<string>> = {
  CATALOG_TABLE: catalogTable.name,
  ARCHIVE_BUCKET: archiveBucket.bucket,
  LIFF_CHANNEL_ID: liffChannelId,
  POWERTOOLS_SERVICE_NAME: "line-robot",
  POWERTOOLS_LOG_LEVEL: "INFO",
};
// ... in readApiFn:
environment: { variables: readApiEnv },
```

(Powertools `POWERTOOLS_*` are read by the Powertools runtime, not by `ReadApiEnvSchema`, so they
stay — extra keys are ignored by `z.object().parse`.)

## Step-by-step implementation

1. **Create `packages/bot/src/lib/clock.ts`** with the exact content from Target design.

2. **Create `packages/bot/src/lib/lazySingleton.ts`** with the exact content from Target design.

3. **`packages/bot/src/adapters/config/config.ts`** — append the `ReadApiEnvSchema` + `ReadApiEnv` +
   `loadReadApiEnv` block (from Target design) after `loadSecrets`. Do not touch `EnvSchema`, `Env`,
   `loadEnv`, or any `load*` SSM function.

4. **`packages/bot/src/lambda/ingest.ts`:**
   - Add import: `import { lazySingleton } from "../lib/lazySingleton.js";`.
   - Delete `let depsPromise: Promise<IngestDeps> | undefined;` (line 9).
   - Delete the whole `function getDeps() { depsPromise ??= buildDeps(); return depsPromise; }`
     (lines 24–27).
   - Immediately after `buildDeps`'s closing brace, add: `const getDeps = lazySingleton(buildDeps);`.
   - `buildDeps` body (incl. the `QUEUE_URL` guard) and the `handler` (`await getDeps()`) are
     unchanged.

5. **`packages/bot/src/lambda/processor.ts`:**
   - Add import: `import { SYSTEM_CLOCK } from "../lib/clock.js";` and
     `import { lazySingleton } from "../lib/lazySingleton.js";`.
   - Delete `const SYSTEM_CLOCK = { now: () => Date.now() };` (line 26).
   - Delete `let depsPromise: Promise<Deps> | undefined;` (line 33) and the
     `function getDeps() {...}` (lines 93–96).
   - After `buildDeps`'s closing brace add `const getDeps = lazySingleton(buildDeps);`.
   - The three `SYSTEM_CLOCK` usages (lines 70, 71, 74) and `await getDeps()` (line 101) are
     unchanged.

6. **`packages/bot/src/lambda/read-api.ts`:**
   - Replace the config import `import { loadEnv } from "../adapters/config/config.js";` with
     `import { loadReadApiEnv } from "../adapters/config/config.js";`.
   - Add `import { SYSTEM_CLOCK } from "../lib/clock.js";` and
     `import { lazySingleton } from "../lib/lazySingleton.js";`.
   - Delete `const SYSTEM_CLOCK = { now: () => Date.now() };` (line 12).
   - In `buildDeps`: change `const env = loadEnv();` → `const env = loadReadApiEnv();` and **delete
     both** `if (env.CATALOG_TABLE === undefined) {...}` and
     `if (env.LIFF_CHANNEL_ID === undefined) {...}` guards (lines 16–21). With the scoped schema,
     `env.CATALOG_TABLE`, `env.ARCHIVE_BUCKET`, `env.LIFF_CHANNEL_ID` are all typed `string`
     (required), so the rest of the body type-checks without narrowing.
   - Delete `let depsPromise...` (line 38) and `function getDeps() {...}` (lines 40–43); add
     `const getDeps = lazySingleton(buildDeps);` after `buildDeps`.
   - `handler` (`await getDeps()`) unchanged.

7. **`packages/bot/src/lambda/reminder.ts`:**
   - Add `import { SYSTEM_CLOCK } from "../lib/clock.js";` and
     `import { lazySingleton } from "../lib/lazySingleton.js";`.
   - Delete `const SYSTEM_CLOCK = { now: () => Date.now() };` (line 10).
   - Delete `let sweepPromise...` (line 30) and replace with
     `const getSweep = lazySingleton(buildReminderSweep);` (place it right after `buildReminderSweep`).
   - Rewrite the handler body:
     ```ts
     export const handler: ScheduledHandler = async () => {
       await (await getSweep()).run();
     };
     ```

8. **`packages/bot/src/lambda/sweep.ts`:**
   - Add `import { SYSTEM_CLOCK } from "../lib/clock.js";` and
     `import { lazySingleton } from "../lib/lazySingleton.js";`.
   - Delete `const SYSTEM_CLOCK = { now: () => Date.now() };` (line 17).
   - Delete `let sweepPromise...` (line 49) and add `const getSweep = lazySingleton(buildSweep);`
     after `buildSweep`.
   - Rewrite the handler body:
     ```ts
     export const handler: ScheduledHandler = async () => {
       await (await getSweep()).run();
     };
     ```

9. **`infra/index.ts`:**
   - Immediately after the `liffChannelId` declaration (currently line 580), add the `readApiEnv`
     object from Target design.
   - In `readApiFn` change
     `environment: { variables: { ...commonEnv, LIFF_CHANNEL_ID: liffChannelId } },` (line 633) to
     `environment: { variables: readApiEnv },` and update the adjacent comment (lines 631–632) to
     explain the scoped env. Leave `commonEnv` and the four bot lambdas (`ingestFn`, `processorFn`,
     `sweepFn`, `reminderFn`) untouched.

10. **Tests** — see next section.

11. Run the Verification commands.

## Tests

All behaviour stays identical; the one named coordination is the read-api scoped-env validation,
which the new config test pins. No bug fix is in scope.

- **ADD `packages/bot/test/unit/clock.test.ts`** (pins: the export is wired and returns a number):
  ```ts
  import { describe, expect, it } from "vitest";
  import { SYSTEM_CLOCK } from "../../src/lib/clock.js";

  describe("SYSTEM_CLOCK", () => {
    it("returns a millisecond timestamp close to Date.now()", () => {
      const before = Date.now();
      const t = SYSTEM_CLOCK.now();
      const after = Date.now();
      expect(typeof t).toBe("number");
      expect(t).toBeGreaterThanOrEqual(before);
      expect(t).toBeLessThanOrEqual(after);
    });
  });
  ```

- **ADD `packages/bot/test/unit/lazySingleton.test.ts`** (pins: call-once memoisation, same-Promise
  identity, generic inference, and — most importantly — that a rejected factory is NOT retried,
  documenting the intentionally-preserved hazard):
  ```ts
  import { describe, expect, it, vi } from "vitest";
  import { lazySingleton } from "../../src/lib/lazySingleton.js";

  describe("lazySingleton", () => {
    it("invokes the factory exactly once across repeated calls", async () => {
      const factory = vi.fn(async () => ({ value: 42 }));
      const get = lazySingleton(factory);
      const a = await get();
      const b = await get();
      expect(factory).toHaveBeenCalledTimes(1);
      expect(a).toBe(b); // same resolved object, not a re-build
    });

    it("returns the identical Promise object on repeated calls", () => {
      const get = lazySingleton(async () => 1);
      expect(get()).toBe(get());
    });

    it("memoises a rejection and does NOT retry the factory (preserved cold-start behaviour)", async () => {
      const factory = vi.fn(async () => {
        throw new Error("ssm down");
      });
      const get = lazySingleton(factory);
      await expect(get()).rejects.toThrow("ssm down");
      await expect(get()).rejects.toThrow("ssm down");
      expect(factory).toHaveBeenCalledTimes(1); // rejected promise is cached, not re-run
    });
  });
  ```

- **UPDATE `packages/bot/test/unit/config.test.ts`** — add (existing tests unchanged):
  ```ts
  import { loadEnv, loadReadApiEnv, loadSecrets } from "../../src/adapters/config/config.js";

  const readApiValidEnv = {
    CATALOG_TABLE: "catalog",
    ARCHIVE_BUCKET: "bucket",
    LIFF_CHANNEL_ID: "2010312345",
  } as unknown as NodeJS.ProcessEnv;

  describe("loadReadApiEnv", () => {
    it("parses the scoped read-api environment", () => {
      expect(loadReadApiEnv(readApiValidEnv)).toEqual({
        CATALOG_TABLE: "catalog",
        ARCHIVE_BUCKET: "bucket",
        LIFF_CHANNEL_ID: "2010312345",
      });
    });

    it("throws when a required scoped variable is missing", () => {
      expect(() => loadReadApiEnv({ CATALOG_TABLE: "catalog" } as NodeJS.ProcessEnv)).toThrow();
    });

    it("ignores extra env vars the read-api role cannot use", () => {
      const withNoise = { ...readApiValidEnv, MESSAGES_TABLE: "m", QUEUE_URL: "q" } as NodeJS.ProcessEnv;
      expect(loadReadApiEnv(withNoise)).not.toHaveProperty("MESSAGES_TABLE");
    });
  });
  ```
  (Change only the import line at the top to add `loadReadApiEnv`; append the fixture + describe
  block.)

## Verification

```
npm run typecheck   # tsc across workspaces — bot + infra must stay green (infra readApiEnv change)
npm run lint        # biome — new lib files + edits must pass
npm run test        # vitest unit — new clock/lazySingleton tests + updated config tests pass
```

Applies: typecheck, lint, and unit test — all three. Integration tests do **not** apply (this unit
touches no persistence/DynamoDB path; the integration suite already wires its own clocks and does
not import the lambda entry points). Expected result: all green, with `lib/clock.ts` and
`lib/lazySingleton.ts` now covered (no `all: true` coverage regression). The Anthropic 16-union
regression test is unaffected (no extraction-schema change).

Optional sanity check (not required to land): `npm --prefix packages/bot run build` to confirm all
five esbuild entrypoints still bundle — they will, since `lib/clock.ts` and `lib/lazySingleton.ts`
tree-shake per-bundle exactly like `lib/idempotency.ts`/`lib/logger.ts` do today.

## Dependencies & ordering

- **No hard predecessor.** This unit is self-contained. `lib/` already hosts `idempotency.ts` and
  `logger.ts`, so the home directory exists.
- **Deploy coordination (within this unit):** the `read-api` code change (`loadReadApiEnv`) and the
  infra change (`readApiEnv` block) MUST ship together. If the narrowed schema deploys while infra
  still injects the old `commonEnv`, cold start still succeeds (extra keys are ignored) — but if
  infra narrows the env first while the old `loadEnv()` code is live, read-api cold start would
  throw on the now-missing required `MESSAGES_TABLE`/etc. Land both in the same commit and run the
  standard `npm run build && pulumi up` so the bundle and the env block update atomically.
- **Shared-file awareness with other cleanup units:**
  - `config.ts` is also touched by units that split the app/HTTP boundary; this unit only **adds**
    `ReadApiEnvSchema`/`loadReadApiEnv` and leaves `EnvSchema`/`loadEnv` intact, so merges are
    additive (low conflict).
  - The five `lambda/*.ts` files are likely touched by the "transport-agnostic readApiHandler /
    WebhookParser port" unit (03 F01/F02, master-plan items 1–3). That unit changes the *body* of
    `buildDeps`/the handler signature; this unit changes only the *memoisation wrapper and the clock
    import*. They are mechanically separable but edit the same files — landing **this unit first**
    is cleaner (it's purely structural and small), so the boundary unit rebases onto the unified
    skeleton.
  - `infra/index.ts` is also the target of the "decompose infra monolith" and "scoped env builders"
    units (07 F01/cross-cutting). This unit makes the minimal read-api env change; if the infra
    decomposition lands first, apply the `readApiEnv` change in whichever module the read-api
    function moved to.

## Risk & rollback

- **Memoisation-of-rejection (preserved, not fixed):** `lazySingleton` caches a rejected Promise
  exactly like the current `??=`. A cold-start `buildDeps` failure still bricks the warm container
  until recycle. This is the documented Epoch-A hazard
  (`plans/cleanup/09-epoch-design-debt.md` line 49) but the master plan (line 133) explicitly scopes
  it OUT of this refactor. Risk is therefore **zero net behavioural change**; the jsdoc warns the
  next maintainer not to "fix" it inline.
- **read-api env narrowing:** the only intentional behavioural delta. Mitigated by shipping code +
  infra together (see Dependencies). Rollback: revert the `infra/index.ts` line back to
  `{ ...commonEnv, LIFF_CHANNEL_ID: liffChannelId }` and the read-api import back to `loadEnv()`
  with its two `undefined` guards — fully self-contained, no data migration.
- **Anthropic 16-union limit:** NOT triggered. This unit does not touch `claudeExtractor.ts` or any
  `output_config.format` schema. `ReadApiEnvSchema` is plain `z.string().min(1)` (0 unions). The
  union-count regression test stays green.
- **Layering:** `lib/clock.ts` and `lib/lazySingleton.ts` import only from `core/ports` (the `Clock`
  type) and nothing else — dependency direction lib → core is correct. Putting the constant in
  `lib/` (not `core/ports/runtime.ts`) keeps `Date.now()` out of the pure port layer. This moves the
  code **toward** the hexagonal ideal.
- **Naming collision:** no `lazy-singleton`/`lazySingleton` package or symbol exists anywhere in the
  repo or `package.json` (grep-confirmed); the name is unambiguous.
- **Rollback overall:** every change is a localized edit; `git revert` of the single commit restores
  the prior five-file pattern with no state to unwind.

## Open questions / decisions

Status is **ready** — the one genuine fork (below) is resolved by an explicit project directive, not
by silent choice.

- **Resolved: rejection-memoisation — preserve vs fix.** The scout flagged whether `lazySingleton`
  should reset the cached Promise on rejection (retry next invocation). Decision: **preserve current
  behaviour**, because `plans/cleanup/00-master-plan.md` line 133 states "the underlying `??=` logic
  is correct and should not be altered beyond the structural normalisation," and the task spec
  forbids behavioural changes unless the change-unit explicitly names a bug fix — this unit does
  not. The hazard is documented in the jsdoc and a test pins the no-retry behaviour so a future fix
  is a deliberate, reviewed change.
- **Resolved (folded into scope): the `ReadApiEnvSchema` split.** The change-unit title and goal
  both name the per-lambda env schema ("+ per-lambda env schema"; "Optionally split…"); master-plan
  item #19 lists it, and `07-infra-build.md` F02 marks the read-api carrying inaccessible env vars
  as a real (not cosmetic) correctness issue. Decision: **include it in this unit** with the
  coordinated infra change, rather than deferring — it is small, shares the same files, and removes
  IAM/env divergence in one move. If a reviewer prefers to keep this unit purely about
  `lazySingleton`/`SYSTEM_CLOCK`, steps 3, 6 (the `loadReadApiEnv` swap + guard deletions), 9, and
  the `loadReadApiEnv` test block can be dropped as a clean subset without affecting the rest.
