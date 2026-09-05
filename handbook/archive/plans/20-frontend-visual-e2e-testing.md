# Plan 20 — Frontend visual + e2e testing pipeline

**Status: BUILT 2026-06-14 (slices 1–3 green; harness proven). Founder review pending on the font
gap + the deferred hardening below.** Research artifacts: `research-01..03` in this folder. Build
summary at the bottom (`## Build status`).

## Why

The overnight runs shipped the public website **unstyled** (Times New Roman, no colour) through an
entire build; it was caught only at the Stage-4 gate, the next night. Root cause + full
introspection: the `quality-loop-perceptually-blind` memory. The short version: **no check ever
rendered the production site in a browser and asserted anything measurable about it.** The only
"visual" smoke rendered the Tailwind-enabled component gallery (where tokens resolve); the website
smokes were `body.includes()` string matches on SSR HTML (byte-identical whether styled or not).

This plan adds the missing layer: a committed Playwright suite that **builds and serves exactly what
ships, drives it in a real browser, and fails on measurable regressions** — computed styles, island
behaviour, and visual drift. It is the automation behind the new `/frontend-review` skill (which
already exists and runs the manual version of this until the suite lands).

## Non-negotiable principle

**Test the production artifact, not a proxy.** The suite serves the real `astro build` output (same
CSS/JS pipeline that ships), not `astro dev` and never the `packages/ui` gallery. A test environment
with a different CSS pipeline than prod is what masked the original bug — designing that out is the
whole point.

## Current state

- No `@playwright/test` anywhere; `playwright-cli` (the skill) is ad-hoc only.
- `packages/website/test/{ssr,browse}.smoke.mjs` import the Lambda handler **in-process** and assert
  `body.includes(...)`. Useful for content/SSR, blind to rendering. Keep them; add the browser layer.
- Build output: `astro build && node build-lambda.mjs` → the SSR Lambda handler. Seed data via the
  Docker `postgis/postgis` harness (as `browse.smoke.mjs` already uses).

## Step 0 — docs first (global CLAUDE.md rule)

Before writing test code, cache Playwright Test docs via `/documentation-downloader`
(`@playwright/test`: `webServer`, `toHaveScreenshot`, `page.evaluate`/`getComputedStyle`, projects,
viewport/colour-scheme). Don't guess the API.

## Build slices (each is a PR-sized increment, reviewed by `/increment-review` + `/frontend-review`)

### Slice 1 — harness + the TECH-06 computed-style net (highest value, ship first)
- Add `@playwright/test` (dev dep, `packages/website`), `playwright.config.ts`, `e2e/` dir.
- `webServer` serves the **real built artifact** over HTTP. Approach: a thin Node HTTP wrapper around
  the built SSR handler (or the `@astrojs/node` standalone server entry) pointed at a seeded Docker
  Postgres — identical bundle to prod, just locally reachable. NOT `astro dev`.
- First tests = `checklist.md` §A invariants: body `font-family` is Sarabun (not serif/Times),
  `--color-primary-600` / `--color-bg` / `--spacing-4` / `--radius-*` resolve non-empty, primary CTA
  background ≈ trust-blue token, dark-mode toggle changes the surface. **These alone reproduce-and-
  catch the original bug** — add one that fails on today's pre-fix `theme.css`-only import as proof.
- Wire `test:e2e` script. Decision: our own app runs **headless** for determinism (the CLAUDE.md
  "always headed" rule is for *external* sites on a residential IP; it doesn't apply to localhost).

### Slice 2 — island hydration / behaviour e2e (`checklist.md` §B)
- Real-browser interaction the SSR smokes can't do: filter-bar chip navigation, contextual price
  relabel (Buy↔Rent drops out-of-context bracket), geolocation "near me" (mocked grant + denied-
  graceful), Leaflet pins + lazy-load, live locale toggle. This is the "frontend JavaScript testing"
  gap — today these are only asserted as SSR `astro-island` markup presence.

### Slice 3 — visual-regression snapshots (`checklist.md` §C)
- `toHaveScreenshot` baselines: home (th/en × light/dark × mobile/desktop), detail (photos /
  NPA-auction provenance / rental), empty + error states. Pin browser + viewport; ensure Sarabun +
  Noto Sans Thai are installed in the run environment (document the font setup so CI and local match
  — unpinned fonts make snapshots flap). Baselines committed; intended changes update them in the
  same commit.

## Cadence integration (deliverable, not optional)

- Update `CLAUDE.md` §Quality system **Review cadence**: `npm run test:e2e` joins the **"every change
  (free, non-negotiable)"** row **for frontend packages**, and `/frontend-review` joins the **"every
  increment"** row for design-bearing/frontend increments (alongside `/alignment-review`). The
  user-facing **stage gate** runs the full `/frontend-review` incl. the style-vs-mockup diff.
- `/frontend-review` already calls `npm run test:e2e -w @line-robot/website` when present; this plan
  makes "present" true.

## Acceptance

- `npm run test:e2e` builds the real artifact, serves it, and runs green in a clean checkout (with
  Docker for seed data).
- A deliberate regression test proves the net bites: reverting the `fallbacks.css` import in
  `Base.astro` (the TECH-06 condition) turns the §A suite **red**.
- Slices 2–3 cover the islands and the key screens; baselines committed.
- CLAUDE.md cadence updated; `/frontend-review` runs the suite end-to-end.

## Out of scope / deferred

- Cross-browser (Firefox/WebKit) — Chromium only first; Thai-Android WebView quirks (TECH-06 OKLCH
  fallback) stay covered by the `@supports` cascade + the §A token-resolution assertions.
- Lighthouse / perf budgets — separate concern; note as a follow-up if wanted.
- The MINI App SPA (`packages/miniapp`) — same approach later if its UI grows; not this plan.

## Decisions (from research — `research-01..03`, all cited)

- **Reporters:** `dot` (near-silent on green) + `json` → `test-results/results.json`. No HTML
  reporter (nothing auto-opens). The agent greps the JSON for failures only — keeps test output out
  of context. Speed: `fullyParallel`, headless single-browser, `retries:0` locally, artifacts
  `only-on-failure`, `reuseExistingServer` so the agent doesn't reboot the app each run.
- **Serve the prod build faithfully:** middleware-mode `@astrojs/node` has no `astro preview`, and
  it serves NO static assets — so `test/e2e-server.mjs` mounts `sirv(dist/client)` **before** the SSR
  `dist/server/entry.mjs` handler, reproducing the prod CloudFront(static)+Lambda(SSR) split. A CSS
  404 or token miss therefore unstyles the page here exactly as in prod. (Rejected: a standalone
  second build — collapses the split and masks asset bugs.)
- **Matrix = projects:** `{desktop 1280×800, Pixel 7} × {light, dark}` = 4 Chromium projects, same
  specs under each (no test duplication). Dark mode is `prefers-color-scheme`-driven on this site, so
  `colorScheme` per project is faithful — no `data-theme` injection.
- **Visual determinism:** `toHaveScreenshot` with `maxDiffPixelRatio 0.01`, `animations:'disabled'`,
  `caret:'hide'`, `scale:'css'`; await `document.fonts.ready`; mask the per-run "updated" date
  (`data-testid="listing-updated"`); seed carries no photos → stable placeholders.
- **Gallery = the committed baselines:** `e2e/__screenshots__/{viewport-theme}/{screen}.png` IS the
  quick-reference gallery (12 images: home / home-en / detail × 4 axes). Ephemeral failure artifacts
  go to `test-results/` (gitignored).
- **Dev toolbar:** `devToolbar:{enabled:false}` in astro.config (dev-only anyway; belt-and-suspenders).

## Build status (2026-06-14) — BUILT, harness proven

- **Slice 1 (TECH-06 net):** `e2e/theme.spec.ts` — tokens resolve, body font is the resolved Sarabun
  stack (NB: the stack ends in `sans-serif`, so the real signal is "contains Sarabun", not "isn't
  serif"), dark surface token changes by scheme. **Red-proof PASSED:** removing the `fallbacks.css`
  import + rebuild turns all 3 red — the net catches the exact bug that shipped blind.
- **Slice 2 (behaviour):** `e2e/filters.spec.ts` — the filter island hydrates + navigates, and the
  4.3 contextual price control relabels Buy↔Rent. (Real-browser hydration the SSR smokes can't do.)
- **Slice 3 (visual):** `e2e/visual.spec.ts` — 12 committed baselines across the 4 axes.
- **Result:** 32/32 green in ~14s. Scripts: `test:e2e`, `test:e2e:update`, `test:e2e:server`.
  `npm run lint` + `astro check` clean.

## Known gaps surfaced — and closed

- **Brand fonts were never DELIVERED → FIXED 2026-06-14.** The pipeline found that Sarabun /
  Noto Sans Thai were named in the `--font-*-th` stacks but there was NO `@font-face` / `@fontsource`
  dep / font `<link>` / `astro:fonts` anywhere — so the looped-Sarabun Thai typography (a TH-06/07
  differentiator) only rendered for users whose device already had the font. The TECH-06 fix made the
  var *resolve*; it did not make the font *load*. **Fix:** self-hosted `@fontsource/sarabun` +
  `@fontsource/noto-sans-thai` (Thai+Latin subsets, weights 400/700 body + 600/700 heading) imported
  in `Base.astro`; 8 woff2 ship to `/_astro/*` (S3+CloudFront in prod, sirv in tests). **Regression
  guard:** `theme.spec.ts` now asserts both families are present in `document.fonts` (the FontFaceSet
  holds only @font-face-declared faces, NOT system fonts — the environment-independent detector the
  old `document.fonts.check` could never be). Baselines regenerated; 36/36 green.

## Deferred hardening (next EPIC, before broad sign-off)

- Broaden click-through coverage (geolocation/NearMe, Leaflet map, pagination) and the screen matrix;
  add cross-browser once Chromium is trusted.
- CI: run in the pinned Playwright container (`mcr.microsoft.com/playwright:v1.60.0-noble`) and wire
  `test:e2e` into the "every change (free)" gate for frontend packages.

## Revision — direction shift (founder, 2026-06-14 session 2): data-driven + capture-review + deployed

The first cut leaned **pixel-regression** (committed `toHaveScreenshot` baselines) and **hardcoded**
seed assumptions. Founder correction: we're doing a lot of theme work before lock-in, so pixel
baselines are premature (every intentional change = a false failure); and tests shouldn't hardcode
data. Rebuilt around three principles:

- **Invariants, not pixels.** Dropped the committed baselines + `__screenshots__`. The gate now
  asserts the theme *applies* (tokens resolve, fonts delivered, dark mode flips), islands hydrate, no
  broken images, no JS errors / 5xx — all of which survive theme churn. `e2e/theme.spec.ts` +
  `e2e/flows.spec.ts`. Pixel-regression is deferred to design lock-in.
- **Capture for LLM review (not diff).** `e2e/capture.spec.ts` shoots a fresh gallery
  (`test-results/gallery/{project}-{screen}.png`, gitignored) every run; `/frontend-review` spawns a
  sub-agent that reviews it against `docs/design/mockups/` + the heuristic register + the taste brief
  — qualitative design-alignment, context-saving (returns a verdict + the few screens that matter).
- **Data-driven + two targets.** Specs discover listings from the rendered page (the DB's public
  projection), so they run unchanged against seeded test data (local) and live data (deployed). One
  switch: `E2E_BASE_URL=<url>` → deployed (no webServer, hits the live CloudFront/Lambda);
  unset → local. `npm run test:e2e` (local) / `test:e2e:deployed`. Per the founder, the headed-real-
  user rule in CLAUDE.md is third-party-only — our own app runs headless (clarified in CLAUDE.md).
- **Managed click-through journey library.** Saved journeys live one-per-file in `e2e/journeys/*.spec.ts`
  (the directory IS the registry — `--list` enumerates it, no drift-prone index), each with a metadata
  header (Journey/Covers/Target/Added) + `@journey` tag + a per-journey `capture()` artifact. They run
  as part of the gate AND `/frontend-review` manages the full lifecycle: **list / run-one / see-artifacts
  / add (permanent) / modify / delete / promote a one-off / suggest coverage-gaps from the diff**. Each
  verb is thin (Playwright file ops + `--list`/`--grep`/json) — no bespoke DSL (founder call:
  journeys-as-code over a declarative config, per the anti-over-engineering rules). One-offs go in
  `e2e/adhoc/` (gitignored scratch); a template lives in `e2e/journeys/README.md`. `flows.spec.ts` keeps
  only the always-run render invariants.

**Deployed proof (against the live staging site):** 8 invariants passed on real CloudFront/Lambda;
`font-delivery` correctly went **red** (the live site predates this session's font fix — i.e. "the
deploy is behind local"); the 4.3 relabel was flaky→passed-on-retry (the `retries:1` deployed
tolerance earned its keep). So the deployed harness works AND catches real local-vs-prod drift.

**Data:** uses the existing synthetic test data + the 20 committed fixture images (no canary). Live
data tested later — same specs, just point `E2E_BASE_URL` + (eventually) richer DB-driven assertions.

**Status: 64/64 local green; deployed target proven against live. Still uncommitted on `main`.**

## Usability hardening (2 rounds of fresh-agent dogfooding)

The skill was tested by **fresh `general-purpose` sub-agents with NO conversation context** (not
`fork` — a clean room), told only "use the skill, narrate your confusion." Round 1 (2 agents) hit real
friction → fixed → round 2 (2 agents) confirmed it gone. Fixes: the run-command **cwd bug**
(`webServer.cwd` + a "run from `packages/website/`" banner with the exact failure symptom), the
deployed URL + the `E2E_BASE_URL`-is-the-switch explanation, the `results.json` schema, the gallery
**namespaced by target** (`local/` vs `deployed/`, no cross-clobber), ad-hoc **excluded from the gate**
(explicit gate-spec list), a **worked journey template** + DOM/seed/facet/i18n-en-dash notes, the
`biome check <file>`-silently-ignores-`e2e/` gotcha, a defensive root `test-results/` gitignore, and a
**`design-review-prompt.md` sidecar** that forces the review sub-agent to **surface** mock↔render
divergences as founder questions rather than self-adjudicate them (round 2 caught it burying the NPA
red-vs-violet call). Net: round-1 HIGH friction → round-2 only low/polish; the test agents even added
two real journeys (type + price-band filter) while dogfooding.
