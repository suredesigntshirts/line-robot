# Research 03 — Testing the Astro production build with Playwright, disabling the dev toolbar, and Claude/Anthropic Playwright guidance

**Date:** 2026-06-14
**Scope:** Three questions for the Stage-20 frontend visual/E2E harness, answered against authoritative docs (docs.astro.build, Claude/Anthropic docs, withastro GitHub) and grounded in our actual build (`packages/website`).

**Our build (confirmed from source):** `astro.config.mjs` has `output: "server"`, `adapter: node({ mode: "middleware" })`, `integrations: [react()]`, i18n th(default)/en. `package.json build` = `astro build && node build-lambda.mjs`. `@astrojs/node` runtime version in the ecosystem at time of writing: **v10.1.4** (the docs page reflects this).

> **Load-bearing fact (verbatim from the node adapter docs):** *"Note that middleware mode does not do file serving. You'll need to configure your HTTP framework to do that for you. By default the client assets are written to `./dist/client/`."* This is exactly why a naive "run only the SSR handler" harness 404s `/_astro/*` and renders unstyled — see Q1.

---

## Q1 — Serving the production build for Playwright (not `astro dev`)

### How `astro preview` works, and why it does NOT work for us

`astro preview` *"Starts a local server to serve the contents of your static directory (`dist/`...) created by running `astro build`... It is not designed to be run in production."* ([CLI reference](https://docs.astro.build/en/reference/cli-reference/)). For SSR/adapter builds, **the preview server is provided by the adapter** — an adapter must implement a `previewEntrypoint` for `astro preview` to work at all.

The decisive detail: `astro preview` support for `@astrojs/node` was introduced *together with standalone mode* in [withastro/astro PR #5056 "Node.js standalone mode + support for `astro preview`"](https://github.com/withastro/astro/pull/5056). That PR added "a new `previewEntrypoint` API that adapters can support to enable `astro preview`" **and** "a new `{ mode: 'standalone' }` option for the `@astrojs/node` adapter," and converted the example to standalone. The practical consequence:

- **`@astrojs/node` in `mode: "standalone"` supports `astro preview`** (it boots the full standalone HTTP server, which *does* serve `dist/client`).
- **`@astrojs/node` in `mode: "middleware"` (our mode) does NOT provide a preview server.** Middleware mode emits only `dist/server/entry.mjs` (the `handler(req, res, next)`) and explicitly does no file serving. So **`npm run preview` is not a viable harness for us as-shipped** — the Astro testing guide's stock `command: 'npm run preview'` recipe assumes a preview-capable adapter.

> Astro's own testing guide recipe ([Testing](https://docs.astro.build/en/guides/testing/)) — given here for reference; the `command` is the only part we must change:
> ```ts
> import { defineConfig } from '@playwright/test';
> export default defineConfig({
>   webServer: {
>     command: 'npm run preview',
>     url: 'http://localhost:4321/',
>     timeout: 120 * 1000,
>     reuseExistingServer: !process.env.CI,
>   },
>   use: { baseURL: 'http://localhost:4321/' },
> });
> ```
> The guide's rationale: *"Run your tests against your production code to more closely resemble your live, deployed site"* (i.e. prefer the built output over `astro dev`).

### Standalone vs middleware — the file-serving difference (verbatim)

From the [`@astrojs/node` adapter docs](https://docs.astro.build/en/guides/integrations-guide/node/):

- **Standalone** — *"the server handles file serving in addition to the page and API routes"*; *"automatically starts when the entry module is run."* Boot: `node ./dist/server/entry.mjs` (env `HOST=0.0.0.0 PORT=4321`; HTTPS via `SERVER_CERT_PATH`/`SERVER_KEY_PATH`). Assets in `dist/client/` ARE served.
- **Middleware** (ours) — *"allows the built output to be used as middleware for another Node.js server, like Express.js or Fastify"*; *"middleware mode does not do file serving."* Exports a `handler` you mount yourself; you serve `dist/client/` with your framework.

The docs' own middleware Express example **is the prod-faithful split we need** (static first, SSR fall-through):

```js
import express from 'express';
import { handler as ssrHandler } from './dist/server/entry.mjs';

const app = express();
// Change this based on your astro.config.mjs, `base` option. They should match. Default "/".
const base = '/';
app.use(base, express.static('dist/client/'));   // serves /_astro/* etc. (= CloudFront+S3 in prod)
app.use(ssrHandler);                              // SSR HTML (= the Lambda in prod)

app.listen(8080);
```

### Options evaluated

| Option | Mirrors prod CDN+Lambda split? | Uses our exact shipped build? | Cost / risk |
|---|---|---|---|
| **(a) `astro preview`** | — | — | **Not available in middleware mode** (no `previewEntrypoint`). Non-starter without re-configuring the adapter. |
| **(b) Second build with `mode: "standalone"` for tests** | Partly (one process serves both static + SSR — *not* a true split) | **No** — different adapter mode/entry than what we ship; static is served by Astro's standalone server, not our S3 path | Maintains a *parallel* build config; risk of test/prod drift (the very split-bug class we want to catch could be masked). |
| **(c) Thin Node server: `express.static('dist/client')` → fall through to middleware `entry.mjs`** | **Yes** — static dir served separately, SSR handler serves only HTML, exactly mirroring CloudFront(static)+Lambda(SSR) | **Yes** — same `dist/client` + same `dist/server/entry.mjs` we deploy | ~15 lines of glue; this is the documented middleware pattern. |

### Recommendation: option (c)

A ~15-line Express (or `node:http` + a static helper) server that mounts `express.static('dist/client')` *before* the middleware `ssrHandler`. It (1) uses the **byte-identical** `dist/client/_astro/*` and `dist/server/entry.mjs` we ship, (2) faithfully reproduces the **two-origin split** (static vs SSR are served by distinct layers, so a CSS/asset-path regression surfaces as a real 404 instead of being papered over), and (3) avoids a second adapter/build config and its drift. Do **not** use `astro preview` (unavailable in our mode) and avoid the standalone second-build (collapses the split into one server and diverges from shipped config).

> Note: our `build-lambda.mjs` already copies `dist/client/**` next to the bundled server (only to satisfy the adapter's `resolveClientDir` walk; it confirms *"middleware-mode @astrojs/node does NOT serve static files... /_astro/* asset requests 404 at the Lambda; S4-I6 routes them to S3 via CloudFront"*). The test harness should serve **`dist/client`** statically to stand in for that CloudFront/S3 leg.

### Wiring `webServer` for Playwright

Point `webServer.command` at the harness script (not `astro preview`), build first, and gate readiness on the URL:

```ts
// playwright.config.ts
import { defineConfig } from '@playwright/test';
const PORT = process.env.E2E_PORT ?? '4321';
export default defineConfig({
  webServer: {
    // build the real artifact, then boot static-dir + middleware SSR split harness
    command: 'npm run build && node test/e2e-server.mjs',
    url: `http://localhost:${PORT}/`,       // Playwright polls this until it 200s (readiness)
    timeout: 180 * 1000,                     // build + DB migrate/seed can be slow
    reuseExistingServer: !process.env.CI,    // locally reuse an already-running server; always fresh in CI
    env: {
      PORT,
      DATABASE_URL: process.env.DATABASE_URL ?? '',  // SSR needs Postgres (see below)
    },
  },
  use: { baseURL: `http://localhost:${PORT}/` },
});
```

- **`reuseExistingServer`**: `!process.env.CI` is the canonical value (Astro guide). Locally, if a server is already on the port Playwright reuses it (fast iteration); in CI it always starts fresh.
- **Readiness**: prefer `url:` over `port:` — Playwright waits for an HTTP 200 from that URL before running tests, which correctly waits out our build + DB connect. (If you split build out of `command`, keep `url` so a slow first SSR render still gates the run.)
- **Skip the build in the command** if you run `npm run build` as a separate pretest step; then `command` is just `node test/e2e-server.mjs` and you avoid rebuilding on every `reuseExistingServer` hit.

### The DB dependency (our SSR reads Postgres)

The site SSR-reads the catalog, so the harness server must have a live `DATABASE_URL`. Reuse the **existing** test infra rather than inventing new plumbing — our smoke tests (`packages/website/test/browse.smoke.mjs`) already do exactly this via `@line-robot/db/testing`:

```js
import { startPostgresLocal, stopPostgresLocal, migrateDb } from '@line-robot/db/testing';
// in test/e2e-server.mjs, before booting express:
const connectionString = await startPostgresLocal('linerobot-website-e2e'); // docker postgis
// migrate + seed deterministic fixtures, then set process.env.DATABASE_URL = connectionString
```

Either start the container inside `e2e-server.mjs` (one process owns DB + web; simplest, and Playwright's `webServer.url` readiness naturally waits for it), or start Postgres in a Playwright **global setup** and pass `DATABASE_URL` through `webServer.env`. Seed with deterministic fixtures (our `npm run db:seed`, or the inline `createListing`/`grantPublishConsent` pattern the browse smoke already uses) so screenshots are stable. Tear the container down in global teardown / on server exit.

---

## Q2 — Disable the Astro dev toolbar

### Exact config

```js
// astro.config.mjs
import { defineConfig } from 'astro/config';
export default defineConfig({
  devToolbar: { enabled: false },
});
```

From the [Configuration Reference](https://docs.astro.build/en/reference/configuration-reference/): `devToolbar.enabled` — **Type:** `boolean`, **Default:** `true` — *"Whether to enable the Astro Dev Toolbar. This toolbar allows you to inspect your page islands, see helpful audits on performance and accessibility, and more."* Disable with `devToolbar: { enabled: false }`.

### When does it render? (dev only — never in preview/prod)

The [Dev toolbar guide](https://docs.astro.build/en/guides/dev-toolbar/) states verbatim: *"This toolbar is enabled by default and appears when you hover over the bottom of the page. **It is a development tool only and will not appear on your published site.**"* It renders during `astro dev` only; it does **not** inject into `astro build` output, and therefore does not appear in `astro preview` or in our prod build / our option-(c) harness (which serve the built `dist/`).

**Implication for our harness:** because we test the **built** artifact (Q1), the toolbar is already absent — it cannot pollute screenshots or hydration tests regardless of config. Setting `devToolbar: { enabled: false }` is still worth doing as belt-and-suspenders (protects any ad-hoc `astro dev`-based capture and keeps dev/prod parity), but it is not strictly required for the prod-build harness.

### Per-user alternative (not for CI)

Project-wide is the config above. For an individual machine only: `astro preferences disable devToolbar` (add `--global` for all projects); re-enable with `astro preferences enable devToolbar`. Use the config option, not preferences, for anything that must hold in CI.

### Other dev-only UI to be aware of

- The dev toolbar is the only Astro-injected dev-only chrome (islands inspector, a11y/perf audits live *inside* it). Removing/ignoring it removes all of it.
- **Vite HMR/error overlay** is a dev-server feature (`astro dev`) — it likewise does not exist in the built output we test, so it cannot appear in the option-(c) harness.
- Third-party island libraries (e.g. React) ship no dev overlay of their own here; nothing else injects visible chrome. No further action needed when testing the build.

---

## Q3 — Official Claude / Anthropic guidance for Playwright-based agent testing

**Short version:** Anthropic does **not** publish a dedicated "how to write Playwright E2E tests" guide. What *does* exist is official guidance and tooling for **agentic browser verification** — having Claude (Code) drive a real browser via the **Playwright MCP server** to click through a running app and verify UI — plus the **computer use** tool for screenshot-based desktop/UI control. Summary of the authoritative material actually fetched:

### a) Playwright MCP server in Claude Code (official docs + marketplace)

- The Claude Code MCP reference ([code.claude.com/docs/en/mcp](https://code.claude.com/docs/en/mcp), formerly docs.anthropic.com/en/docs/claude-code/mcp) explains MCP generally — *"Claude Code can connect to hundreds of external tools and data sources through the Model Context Protocol (MCP)..."* — but its worked examples are GitHub/Sentry/Figma/PostgreSQL. **Playwright is *not* a headline example on that page** (don't cite it as if it were).
- The Playwright MCP server is listed in Anthropic's **plugin marketplace**: [claude.com/plugins/playwright](https://claude.com/plugins/playwright) — *"Browser automation and end-to-end testing MCP server by Microsoft. Enables Claude to interact with web pages, take screenshots, fill forms, and automate testing workflows."* **Published by Microsoft, not Anthropic** (listed in Anthropic's marketplace; ~268k installs at fetch time). Capabilities: *"navigating to URLs, clicking elements, filling forms, handling file uploads, managing browser dialogs, taking screenshots, generating PDFs, and running custom Playwright scripts."* Backed by `@playwright/mcp`.

### b) Anthropic engineering blog — Playwright MCP for agentic UI verification (the closest thing to official guidance)

[Anthropic, "Harness design for long-running application development"](https://www.anthropic.com/engineering/harness-design-long-running-apps) describes using Playwright MCP as the *evaluator's* tool, which is directly applicable to our Stage-20 goal:

- Frontend design section: *"I gave the evaluator the Playwright MCP, which let it interact with the live page directly before scoring each criterion and writing a detailed critique."*
- Full-stack section: *"Applications from earlier harnesses often looked impressive but still had real bugs when you actually tried to use them. To catch these, the evaluator used the Playwright MCP to click through the running application the way a user would, testing UI features, API endpoints, and database states."*
- It shows concrete bugs caught only by driving the live UI (e.g. a rectangle-fill tool that placed tiles only at drag endpoints). Takeaway: agentic browser testing catches interaction bugs that backend/code review misses.

### c) Computer use tool — explicit session/verification guidance

The [Computer use tool docs](https://platform.claude.com/docs/en/docs/agents-and-tools/computer-use) (redirected from docs.anthropic.com) give the most prescriptive official guidance, in a Tip:

> *"For agents that span multiple sessions, run end-to-end verification at the start of each session, not only after implementation. Browser-based checks catch regressions from prior sessions that code-level review alone misses."*

(Links to ["Effective harnesses for long-running agents"](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents).) Computer use is **beta**, screenshot+mouse/keyboard control (not Playwright); beta headers `computer-use-2025-11-24` (Opus 4.8/4.7/4.6, Sonnet 4.6, Opus 4.5) / `computer-use-2025-01-24` (older). It also advises, for repeatable UI tasks, putting explicit task tips in the system prompt and (with `enable_zoom`) zooming for small UI text. For *our* purposes (a built web app), **Playwright MCP is the right fit, not computer use** — computer use is for full-desktop control; Playwright MCP gives deterministic accessibility-tree-based web automation.

### Verdict

There is **no official Anthropic "Playwright testing" tutorial**. The official, citable guidance is: (1) the **Playwright MCP server** (Microsoft-authored, in Anthropic's marketplace) is the supported way to give Claude/Claude Code browser automation; (2) Anthropic's **engineering blog endorses Playwright MCP for agentic UI verification** ("click through the app the way a user would"); (3) the **computer use** docs give the cross-session "verify at session start, browser checks catch regressions" principle. Our deterministic Playwright `webServer` suite (Q1) and any agentic Playwright-MCP spot-checks are complementary — the suite is the regression gate, MCP/agentic runs are exploratory verification.

---

## Recommended harness for our build

Given middleware-mode `@astrojs/node` + the CloudFront(static)+Lambda(SSR) split + a Postgres dependency:

1. **Boot the real prod build with a thin split server (option c), not `astro preview`.** Add `packages/website/test/e2e-server.mjs`:
   - `await startPostgresLocal('linerobot-website-e2e')` (`@line-robot/db/testing`, docker postgis) → `migrateDb` → seed deterministic fixtures (reuse `db:seed` or the `createListing`/`grantPublishConsent` pattern already in `browse.smoke.mjs`); set `process.env.DATABASE_URL`.
   - `express()`: `app.use('/', express.static(new URL('../dist/client', ...)))` **then** `app.use(ssrHandler)` from `../dist/server/entry.mjs`. Static-first → SSR fall-through = the prod two-origin split, so a missing `/_astro/*` asset fails as a real 404 (the exact bug class we want to catch), not silently unstyled HTML.
   - `app.listen(process.env.PORT ?? 4321)`; on exit, `stopPostgresLocal`.

2. **`playwright.config.ts` `webServer`:**
   - `command: 'npm run build && node test/e2e-server.mjs'` (or split the build into a pretest step and make `command` just the server),
   - `url: 'http://localhost:4321/'` (readiness gate), `timeout: 180_000`,
   - `reuseExistingServer: !process.env.CI`,
   - `env: { PORT, DATABASE_URL }`; `use.baseURL` the same URL.

3. **Dev toolbar:** set `devToolbar: { enabled: false }` in `astro.config.mjs` as belt-and-suspenders. Strictly speaking it's already absent because we test the *built* output (toolbar is `astro dev`-only and never in `dist/`), but the flag guarantees parity and protects any ad-hoc dev capture.

4. **Agentic layer (optional, Anthropic-aligned):** for exploratory verification, add the **Playwright MCP server** and have Claude Code "click through the running app the way a user would" against this same harness URL — per Anthropic's harness-design blog. Keep the deterministic Playwright suite as the CI regression gate; use MCP/agentic runs for spot-checks, ideally at the start of a session (computer-use docs' cross-session principle).

**Why not the alternatives:** `astro preview` needs a preview-capable adapter — middleware mode has none (PR #5056 tied preview to standalone). A separate standalone build collapses the static/SSR split into one server and diverges from shipped config, which can *mask* the asset-path bugs we most need to catch.

---

## Sources

All URLs below were actually fetched (WebFetch) this session unless noted; search-only snippets are marked.

- https://docs.astro.build/en/guides/integrations-guide/node/ — `@astrojs/node` adapter; verbatim standalone vs middleware, *"middleware mode does not do file serving,"* the full Express `express.static('dist/client/')` + `ssrHandler` example, standalone boot/env vars. Version noted: v10.1.4.
- https://docs.astro.build/en/guides/testing/ — Astro's Playwright `webServer` recipe (`command: 'npm run preview'`, `reuseExistingServer`, `baseURL`) and the "test against production code" rationale; also lists Vitest/Cypress/Nightwatch.
- https://docs.astro.build/en/reference/cli-reference/ — `astro preview` definition ("serve the contents of dist/", "not designed to be run in production").
- https://docs.astro.build/en/reference/configuration-reference/ — `devToolbar.enabled` type `boolean`, default `true`, description, disable snippet.
- https://docs.astro.build/en/guides/dev-toolbar/ — *"It is a development tool only and will not appear on your published site"*; project-wide vs per-user (`astro preferences`) disable.
- https://github.com/withastro/astro/pull/5056 — "Node.js standalone mode + support for `astro preview`"; the `previewEntrypoint` API and that preview support for `@astrojs/node` arrived with standalone mode (basis for "middleware mode has no preview").
- https://github.com/withastro/astro/blob/main/packages/integrations/node/README.md — fetched but content was only the package stub (links/license), no code example; the example came from the docs page above. (Noted per instructions: this source could not yield the requested example.)
- https://code.claude.com/docs/en/mcp (redirect from https://docs.anthropic.com/en/docs/claude-code/mcp) — Claude Code MCP reference; confirms MCP connects external tools but uses GitHub/Sentry/Figma/Postgres as examples — Playwright is NOT a headline example there.
- https://claude.com/plugins/playwright — Playwright MCP plugin listing in Anthropic's marketplace; *"by Microsoft,"* capabilities, ~268k installs (Microsoft-authored, not Anthropic-published).
- https://www.anthropic.com/engineering/harness-design-long-running-apps — Anthropic engineering: evaluator uses Playwright MCP to "click through the running application the way a user would, testing UI features, API endpoints, and database states."
- https://platform.claude.com/docs/en/docs/agents-and-tools/computer-use (redirect from https://docs.anthropic.com/en/docs/agents-and-tools/computer-use) — Computer use tool; verbatim cross-session Tip ("run end-to-end verification at the start of each session... Browser-based checks catch regressions..."); beta headers/versions.
- https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents — referenced by the computer-use Tip (not separately fetched; cited as the doc's own pointer).
- *Search-only (not individually fetched):* https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills (Agent Skills overview) and https://github.com/anthropics/skills (official skills repo) — surfaced as related Anthropic resources; no Playwright-specific claim drawn from them.

**Project files inspected (for the synthesis):** `packages/website/astro.config.mjs` (confirms `output:"server"`, `node({mode:"middleware"})`), `packages/website/build-lambda.mjs` (confirms middleware mode 404s `/_astro/*`, CloudFront/S3 serves statics), `packages/website/test/browse.smoke.mjs` (existing `@line-robot/db/testing` Postgres pattern to reuse), root `package.json` (`db:seed`).
