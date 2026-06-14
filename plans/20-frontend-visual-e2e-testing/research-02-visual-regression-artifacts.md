# Research 02 — Playwright Visual Regression & Screenshot Artifacts (for LLM reference)

**Date:** 2026-06-14
**Scope:** A committed Playwright suite for the Astro SSR property website. Goals: (a) catch visual
regressions (the site once shipped UNSTYLED and nothing caught it), (b) produce a referenceable
gallery of screenshots — common viewports × light/dark — stored as artifacts so a Claude agent can
pull "home, mobile, dark" instantly, (c) keep it deterministic (low flake). Single browser only
(Chromium) for fast iteration; broader matrix is a later EPIC.

All non-obvious claims are cited inline by `[n]` to the **Sources** list at the bottom. Every cited
URL was actually fetched; fetch failures are noted there.

---

## 1. `toHaveScreenshot()` mechanics

### `toHaveScreenshot()` vs `toMatchSnapshot()`

- **`await expect(page).toHaveScreenshot()`** (also `expect(locator).toHaveScreenshot()`) is the
  modern image-comparison assertion. It is **retrying + auto-waiting**: it takes screenshots
  repeatedly "until two consecutive screenshots match," then compares against the committed baseline
  — this is what makes it stable against animations and late layout shifts. [1][2] By default it also
  **disables animations** and **hides the caret** (see option defaults below). [3]
- **`expect(buffer).toMatchSnapshot('name.png')`** is the older, lower-level generic snapshot
  assertion for text/binary/image values. It does **not** retry and does **not** auto-stabilise; you
  pass it an already-captured `await page.screenshot()` buffer. Content-type is auto-detected. [1]
- **Use `toHaveScreenshot()`** for our page/element visual checks (retry + built-in stabilisation).
  Reserve `toMatchSnapshot()` for non-image snapshots (e.g. a serialized DOM/JSON), not for pixels.

### Baseline storage + `snapshotPathTemplate`

By default snapshots live next to the test file in a `<testfile>-snapshots/` directory, with the
browser+platform baked into the filename (e.g. `landing-chromium-linux.png`) so OS rendering
differences get separate baselines. [1]

**Version note on the default template.** The current Playwright default is:

```
{snapshotDir}/{testFileDir}/{testFileName}-snapshots/{arg}{-projectName}{-snapshotSuffix}{ext}
```

Older docs/blog posts (and pre-1.4x) show the equivalent flatter form
`{testDir}/{testFilePath}-snapshots/{arg}-{projectName}-{platform}{ext}`. [5][6] The Microsoft Learn
visual-comparison guide (updated 2025-08) uses the `{snapshotDir}/{testFileDir}/{testFileName}-…`
token form. [4] Confirm the exact default on the version you install (`npx playwright --version`);
either way you should **override it** so files are organised the way the agent reads them.

**Token rule:** any token may be preceded by a single character (e.g. the `-` in `{-projectName}`)
that is **rendered only when the token has a non-empty value** — that is how the projectName/platform
segments disappear cleanly when empty. [4]

**Supported tokens** [4][7]: `{arg}` (relative snapshot path without extension), `{ext}` (extension
incl. leading dot), `{platform}` (`process.platform`), `{projectName}` (sanitized project name),
`{snapshotDir}`, `{testDir}`, `{testFileDir}`, `{testFileName}`, `{testFileBaseName}`,
`{testFilePath}`, `{testName}`.

**Organise as `{viewport}-{theme}-{screen}.png`.** Encode viewport+theme into the **project name**
and pass the screen as the `{arg}`. Recommended override (flat, predictable, no `{platform}` because
we pin one container — §2):

```ts
// playwright.config.ts
export default defineConfig({
  snapshotPathTemplate: 'tests/visual/__screenshots__/{projectName}/{arg}{ext}',
});
```

With projects named `desktop-light`, `mobile-dark`, etc. (§3) and `toHaveScreenshot('home.png')`,
baselines land at `tests/visual/__screenshots__/mobile-dark/home.png` — exactly the
`{viewport}-{theme}/{screen}` shape the agent wants. (You can also flatten fully with
`'tests/visual/__screenshots__/{projectName}-{arg}{ext}'` → `mobile-dark-home.png`.)

### Updating baselines

```bash
npx playwright test --update-snapshots          # rewrite all baselines
npx playwright test home.spec.ts --update-snapshots   # scope to a file
```

`--update-snapshots` regenerates the committed golden PNGs. [1] On CI, **missing** baselines make the
run fail (CI will not silently write new goldens) — generate/refresh them deliberately and commit
them. Commit both image and text snapshots to version control so diffs are reviewable. [1]

### Comparison knobs — and when to use each

All are settable per-call or globally under `expect.toHaveScreenshot` in the config. [1][3]

| Option | Type / default | What it does | When to use |
|---|---|---|---|
| `threshold` | `0..1`, default **`0.2`** | Acceptable **per-pixel** perceived colour difference in **YIQ** space. [3] | Leave near default; lower (e.g. `0.15`) only if you need stricter colour fidelity. Anti-aliasing noise lives here. |
| `maxDiffPixels` | number, unset by default | Absolute count of differing pixels tolerated (uses **pixelmatch**). [1][3] | Good for a fixed-size element/clip where you know the pixel budget. |
| `maxDiffPixelRatio` | `0..1`, unset | Differing pixels as a **fraction** of total. [3] | Better than `maxDiffPixels` for **full-page** shots whose pixel count varies by viewport — scales with image size. **Prefer this for our page-level shots** (e.g. `0.01`). |
| `animations` | `'disabled'`\|`'allow'`, default **`'disabled'`** | Stops CSS animations/transitions/Web Animations; finite ones fast-forward to completion, infinite reset to initial. [3] | Keep `'disabled'` (the default — but set it explicitly in config for clarity). |
| `caret` | `'hide'`\|`'initial'`, default **`'hide'`** | Hides the text input caret. [3] | Keep `'hide'`. |
| `scale` | `'css'`\|`'device'`, default **`'css'`** | `'css'` = one image px per CSS px (DPR-independent); `'device'` = one px per device px. [3] | Keep `'css'` so a DPR-2 mobile project doesn't double image dimensions vs baseline. |
| `fullPage` | bool, default `false` | Capture the whole scrollable page vs just the viewport. [3] | `true` for "the whole page" goldens; `false` (viewport) for above-the-fold/header checks. Beware sticky/fixed elements on full-page (§2). |
| `clip` | `{x,y,width,height}` | Crop to a region. [3] | Pin a single component (e.g. the price card) without the rest of the page. |
| `mask` | `Locator[]` (overlaid with a pink box; colour via `maskColor`, default `#FF00FF`) | Blank out dynamic regions before diffing. [3] | Mask anything non-deterministic: relative dates ("2 days ago"), map tiles, presigned-URL images, ad slots. |
| `stylePath` | `string \| string[]` (pierces Shadow DOM) | Inject CSS at capture time to hide/neutralise flapping elements. [1][3] | Global "hide the things that flap" sheet (see §2). Official example: `iframe { visibility: hidden; }`. [1] |
| `omitBackground` | bool, default `false` | Transparent instead of white background (PNG only). [3] | Rarely needed for full pages. |
| `maxDiffPixels`/`maxDiffPixelRatio`/`threshold` together | — | A pixel counts as "different" only if it exceeds `threshold`; the image fails only if the count exceeds `maxDiffPixels`/`maxDiffPixelRatio`. | Tune `threshold` for noise, then a small `maxDiffPixelRatio` as the failure budget. |

---

## 2. Determinism (low flake) — the big one

Screenshots flake mostly from **environment** (fonts, OS, DPR) and **dynamic content**. Playwright's
own warning: "Browser rendering can vary based on the host OS, version, settings, hardware, power
source (battery vs. power adapter), headless mode, and other factors" — so run baselines and
comparisons in the **same environment**. [1]

### Run in the official, version-pinned Playwright Docker image (local == CI)

This is the standard recommendation. Render in the **official image** `mcr.microsoft.com/playwright`,
**pinned to an exact version** (e.g. `mcr.microsoft.com/playwright:v1.60.0-noble`), so the fonts,
system libs, and browser build are byte-identical on a dev laptop and in CI. [8] The image "bakes the
fonts in for you," which is exactly what fixes the macOS-vs-Ubuntu baseline mismatch. [9] Practical
patterns: generate baselines **in CI / in the container** (not on a Mac), or run the browser as a
Playwright Server in the pinned container and connect local tests over WebSocket so all rendering
happens in one place. [9][10]

**Architecture caveat:** even with the same image, **arm64 vs amd64 can still produce different
pixels** — pin the **same CPU arch** too (e.g. always `linux/amd64`), or you'll get cross-arch diffs.
[9] For us: pick one arch for the committed Chromium baselines and run CI on it.

### Fonts — make sure the *real* font renders, not the fallback

- The site once shipped **unstyled** — a font-fallback render is the same class of bug, so this is the
  single most important determinism axis for us.
- **Wait for fonts to load** before capturing so text isn't in a fallback face:
  `await page.evaluate(() => document.fonts.ready)` (or `page.waitForFunction(() =>
  document.fonts.ready)`). [11][12]
- **Install the fonts in the render environment.** `document.fonts.ready` only guarantees the page's
  declared web-fonts finished loading; if a font isn't actually available (CDN-only, or a system font
  the container lacks), you still get a fallback. The pinned Docker image solves "is the font present"
  for its bundled set; for app web-fonts ensure they're served and loaded (self-host or let the page
  fetch them, then await `fonts.ready`). [9][11]
- **Version note / gotcha:** by default `page.screenshot()` waits for in-flight font network
  requests; on some sites this **hangs**, and Playwright added `PW_TEST_SCREENSHOT_NO_FONTS_READY=1`
  to skip that wait (≈10× faster for affected users) — but skipping it risks fallback-font captures,
  so for visual baselines **keep the wait** (don't set that env var) and instead pre-warm fonts. [11]

### Animations, caret, scrollbars

- **Animations:** `animations: 'disabled'` (the default for `toHaveScreenshot`, set it explicitly).
  [3] For JS-driven (non-CSS) animation, freeze the clock (below) or mock the timer. [13]
- **Caret:** `caret: 'hide'` (default). [3]
- **Scrollbars:** OS scrollbars differ across platforms; pin rendering via the container, and on
  `fullPage` shots beware that **fixed/sticky elements may move/duplicate** during the scroll-capture
  — mask them or hide via `stylePath`. [13]

### Dynamic data — dates, lazy images, randomness

- **Freeze time/dates.** Use Playwright's clock control (`page.clock`) or stub `Date`/`Intl` so
  "posted 3 hours ago" and formatted timestamps are stable; otherwise **`mask`** those nodes. [13]
- **Lazy-loaded images.** Either `await page.goto(url, { waitUntil: 'networkidle' })` (settles 500 ms
  after the last request) and/or `await locator.scrollIntoViewIfNeeded()` to trigger lazy loads
  before capture, then scroll back to top. [13] For us, the property thumbs are **presigned S3 URLs**
  that change every run — **`mask` the image regions** (or assert their presence separately) so the
  URL churn never diffs.
- **Random/AB content:** seed or stub it; mask if you can't.

### Device pixel ratio / scale

- Set `deviceScaleFactor` per project for retina emulation, but keep `scale: 'css'` so image
  dimensions stay tied to CSS pixels and match the baseline regardless of DPR. [3][13] Pin one DPR per
  project so a baseline captured at DPR-2 is always compared at DPR-2.

### The concrete "kills flake" checklist (apply all)

1. Render in **pinned** `mcr.microsoft.com/playwright:vX.Y.Z-noble`, **fixed CPU arch**. [8][9]
2. `expect.toHaveScreenshot`: `animations: 'disabled'`, `caret: 'hide'`, `scale: 'css'`. [3]
3. Before every capture: `await page.evaluate(() => document.fonts.ready)`. [11]
4. Global `stylePath` sheet to hide flapping nodes (carousels, iframes, map, sticky bars). [1][3]
5. Freeze the clock (`page.clock`) and/or `mask` relative dates & presigned-URL images. [13]
6. Trigger lazy images (`networkidle` + `scrollIntoViewIfNeeded`) or mask them. [13]
7. Small failure budget: `maxDiffPixelRatio` ≈ `0.01`, `threshold` ≈ `0.2` (default). [3]
8. Generate baselines **in the container / CI**, commit them; never regenerate on a laptop. [9]

Example global `stylePath` (`tests/visual/mask.css`):

```css
/* Neutralise non-deterministic regions before diffing. */
.leaflet-container, iframe, video, [data-flaky] { visibility: hidden !important; }
*, *::before, *::after { animation: none !important; transition: none !important; }
```

---

## 3. Light/dark + viewports

### Emulating dark mode — `colorScheme` vs the app's own theme toggle

Two distinct mechanisms — pick by **how the app decides its theme**:

- **`colorScheme: 'dark'`** (in `use`/project, or runtime `await page.emulateMedia({ colorScheme:
  'dark' })`) emulates the OS-level `prefers-color-scheme` media query. Supported values `'light'`,
  `'dark'`, `'no-preference'`. [14] **Right only if the site themes itself purely from
  `prefers-color-scheme`.**
- **If the app uses a manual switch** (e.g. a `data-theme="dark"` attribute / a class on `<html>`,
  persisted to localStorage — common for "I want dark even though my OS is light"), then **emulating
  the media query is NOT enough**: you must drive the app's own state. Set the attribute before/after
  load, e.g.:

  ```ts
  // toggle the app's manual theme, not just the media query
  await page.addInitScript(() => localStorage.setItem('theme', 'dark'));
  await page.goto('/');
  await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'));
  ```

  **Best practice: do both** — set `colorScheme` (so any `prefers-color-scheme` CSS matches) **and**
  set the app's `data-theme`/class — so the page is unambiguously in the intended theme no matter
  which signal the CSS reads. **→ Decide which mechanism our Astro site actually uses and wire the
  one that controls it; if it has a manual switch, drive `data-theme` (plus `colorScheme` for safety).**

### Viewport × theme matrix without exploding test count

Use **projects** as the matrix axis, not duplicated tests. Each project carries its own `use{}`
(viewport, `colorScheme`, `data-theme` via a fixture); the **same spec files** run under every
project, so N specs × M projects with zero test duplication. [4][15] Put the theme-toggle in a shared
fixture/`beforeEach` keyed off `testInfo.project.name` (or a project `metadata` flag) so a spec never
hard-codes a theme.

```ts
// playwright.config.ts (Chromium-only; theme & viewport are the axes)
import { defineConfig, devices } from '@playwright/test';

const DESKTOP = { width: 1280, height: 800 };
const MOBILE  = devices['Pixel 7'].viewport; // ~412×915, touch + DPR

export default defineConfig({
  snapshotPathTemplate: 'tests/visual/__screenshots__/{projectName}/{arg}{ext}',
  expect: { toHaveScreenshot: {
    animations: 'disabled', caret: 'hide', scale: 'css',
    maxDiffPixelRatio: 0.01, stylePath: './tests/visual/mask.css',
  }},
  projects: [
    { name: 'desktop-light', use: { ...devices['Desktop Chrome'], viewport: DESKTOP, colorScheme: 'light' } },
    { name: 'desktop-dark',  use: { ...devices['Desktop Chrome'], viewport: DESKTOP, colorScheme: 'dark'  } },
    { name: 'mobile-light',  use: { ...devices['Pixel 7'], colorScheme: 'light' } },
    { name: 'mobile-dark',   use: { ...devices['Pixel 7'], colorScheme: 'dark'  } },
  ],
});
```

A `beforeEach` reads the project's theme and also sets the app's `data-theme` (for a manual-switch
app), so the four projects fully define the 2×2 matrix and every spec contributes 4 baselines.

### Common viewport sizes to standardize on

- **Desktop:** `1280×720` is Playwright's documented default viewport [14]; `1280×800` or `1440×900`
  are common laptop sizes. Pick one desktop width and keep it forever.
- **Mobile:** use a `devices[...]` preset so you get the matching DPR + touch (`devices['Pixel 7']`
  ≈ 412×915, or `devices['iPhone 13']` ≈ 390×844). Presets bundle viewport + UA + `deviceScaleFactor`.
  [14] Pin **one** mobile preset for the fast suite.

For our fast suite: **`desktop 1280×800` and one mobile preset**, × **light/dark** = **4 projects**.

---

## 4. Artifact storage for LLM reference

Two distinct artifact classes — keep them separate:

- **COMMITTED baselines (golden):** the `toHaveScreenshot` PNGs under
  `tests/visual/__screenshots__/{projectName}/{arg}.png` (§1). These are version-controlled, reviewed
  in PRs, and are the source of truth. They change only via `--update-snapshots`.
- **EPHEMERAL per-run captures (the browsable gallery):** every run also emits a fresh snapshot of
  each screen so the agent can look at "what does it render right now," plus the **diff/actual** files
  Playwright writes on a mismatch.

### Where per-run artifacts go

- **`outputDir`** (default `<pkg>/test-results`) is the folder for "screenshots, videos, traces,
  etc." Each test run gets an isolated subdir so parallel tests don't collide. [4][16] On a
  `toHaveScreenshot` failure Playwright drops `*-actual.png`, `*-expected.png`, `*-diff.png` here and
  into the HTML report.
- **`testInfo.outputPath(...segments)`** returns a safe path inside that per-test output dir — use it
  to write our own gallery PNGs without clobbering parallel runs. [16]
- **`testInfo.attach(name, { path | body, contentType })`** attaches a file/buffer to the run so it
  shows up in the **HTML report** (`image/png` renders inline). [16] Use this so a human/agent opening
  the report sees the gallery.

### Emit a gallery + a manifest the agent can index

Capture a non-asserting screenshot per (screen, project), attach it, and append a manifest row.
Writing a **single JSON/markdown index** is the key move: the agent reads the small index and opens
**only the one image it needs** — never dump all images into context.

```ts
// tests/visual/_gallery.ts  — call from each visual test
import fs from 'node:fs';
import path from 'node:path';
import type { Page, TestInfo } from '@playwright/test';

const MANIFEST = 'tests/visual/__gallery__/manifest.json';

export async function gallery(page: Page, testInfo: TestInfo, screen: string) {
  const [viewport, theme] = testInfo.project.name.split('-'); // e.g. "mobile","dark"
  const rel = path.join('tests/visual/__gallery__', testInfo.project.name, `${screen}.png`);
  await page.evaluate(() => (document as any).fonts.ready);
  fs.mkdirSync(path.dirname(rel), { recursive: true });
  const buf = await page.screenshot({ path: rel, fullPage: true, animations: 'disabled', caret: 'hide' });
  await testInfo.attach(`${screen}-${testInfo.project.name}`, { body: buf, contentType: 'image/png' });
  // append to manifest (one process writes; for parallel runs, merge in globalTeardown instead)
  const idx = fs.existsSync(MANIFEST) ? JSON.parse(fs.readFileSync(MANIFEST, 'utf8')) : [];
  idx.push({ path: rel, screen, viewport, theme, project: testInfo.project.name });
  fs.writeFileSync(MANIFEST, JSON.stringify(idx, null, 2));
}
```

> Parallel-safe variant: have each test write its row to `testInfo.outputPath('gallery.json')`, then
> merge all rows into one `manifest.json` in a `globalTeardown`, so workers never race on one file.

**Manifest shape** (what the agent reads first):

```json
[
  { "path": "tests/visual/__gallery__/mobile-dark/home.png", "screen": "home", "viewport": "mobile", "theme": "dark", "project": "mobile-dark" },
  { "path": "tests/visual/__gallery__/desktop-light/detail.png", "screen": "detail", "viewport": "desktop", "theme": "light", "project": "desktop-light" }
]
```

Agent workflow: read `manifest.json` → filter to `{screen:"home", viewport:"mobile", theme:"dark"}`
→ open that **one** `path`. No image-dumping.

### Naming conventions (consistent across baselines and gallery)

- Directory/file: `{viewport}-{theme}/{screen}.png` (project dir + `{arg}`), e.g.
  `mobile-dark/home.png`. Same scheme for committed baselines and the ephemeral gallery so a path is
  predictable from `(screen, viewport, theme)` alone.
- `.gitignore` the ephemeral `tests/visual/__gallery__/` and `test-results/`; **commit**
  `tests/visual/__screenshots__/` (goldens). In CI, upload the gallery + HTML report as build
  artifacts so they're retrievable post-run.

---

## Recommended approach for our suite

**Matrix (Chromium-only, fast):** 4 projects = `{desktop, mobile} × {light, dark}`, named
`desktop-light` / `desktop-dark` / `mobile-light` / `mobile-dark`.
- desktop = `1280×800`; mobile = one `devices[...]` preset (e.g. `Pixel 7`).
- Theme set **both** ways: project `colorScheme` **and** the app's `data-theme` toggle in a shared
  `beforeEach` (verify which one the Astro site actually honours; drive that one for real, keep the
  other for safety).
- Screens to cover first: `home`, `listing-detail`, plus any page that proves CSS loaded (a page
  with tokens/spacing) — this directly guards against the "shipped unstyled" failure.

**Storage layout:**
```
tests/visual/
  *.spec.ts
  mask.css                         # global stylePath (hide flaky nodes, kill animations)
  _gallery.ts
  __screenshots__/{project}/{screen}.png      # COMMITTED golden baselines (toHaveScreenshot)
  __gallery__/                                # EPHEMERAL per-run gallery (gitignored)
    {project}/{screen}.png
    manifest.json                             # agent index: path -> {screen,viewport,theme}
test-results/                                 # outputDir: actual/expected/diff on failure (gitignored)
```
`snapshotPathTemplate: 'tests/visual/__screenshots__/{projectName}/{arg}{ext}'` (no `{platform}` —
we pin one container/arch). Agent pulls "home, mobile, dark" by reading `manifest.json` and opening
the single matching path.

**Determinism settings (config + per-capture):**
- Render only in pinned `mcr.microsoft.com/playwright:vX.Y.Z-noble`, fixed CPU arch; generate/commit
  baselines from that container, not a laptop.
- `expect.toHaveScreenshot`: `animations:'disabled'`, `caret:'hide'`, `scale:'css'`,
  `maxDiffPixelRatio:0.01`, `threshold:0.2`, `stylePath:'./tests/visual/mask.css'`.
- Every capture: `await page.evaluate(() => document.fonts.ready)`; ensure the app's web-fonts are
  served/loaded so text is the real face, not a fallback (the "unstyled" guard).
- `mask` (or freeze) presigned-URL property images, map tiles, and relative dates; freeze the clock
  with `page.clock`.
- Trigger lazy images (`networkidle` + `scrollIntoViewIfNeeded`) or mask them.

**A failing run** leaves `*-actual/-expected/-diff.png` in `test-results/` and the HTML report, and
the gallery + manifest let the agent inspect "what it looks like now" without an assertion.

---

## Sources

1. https://playwright.dev/docs/test-snapshots — Visual comparisons: `toHaveScreenshot` retries until
   two consecutive shots match; baseline dir `<file>-snapshots`; `--update-snapshots`; commit
   snapshots; `maxDiffPixels`; `stylePath` (`iframe { visibility: hidden }` example);
   `toMatchSnapshot` for non-image; "run tests in the same environment" warning. **Fetched.**
2. (same page §1) confirms the "took screenshots until two consecutive matched" mechanic. **Fetched.**
3. https://playwright.dev/docs/api/class-pageassertions — `toHaveScreenshot` option reference:
   `animations` (default `disabled`), `caret` (default `hide`), `clip`, `fullPage`, `mask`/`maskColor`
   (`#FF00FF`), `maxDiffPixelRatio`, `maxDiffPixels`, `omitBackground`, `scale` (default `css`),
   `stylePath` (pierces Shadow DOM), `threshold` (default `0.2`, YIQ), `timeout`. **Fetched.**
4. https://learn.microsoft.com/en-us/azure/app-testing/playwright-workspaces/how-to-configure-visual-comparisons —
   Microsoft Learn (updated 2025-08): host OS is part of the snapshot path; `snapshotPathTemplate`
   token form `{snapshotDir}/{testFileDir}/{testFileName}-snapshots/{arg}{-projectName}…{ext}`;
   example custom templates; `ignoreSnapshots`. **Fetched.**
5. https://www.linkedin.com/pulse/how-screenshots-naming-works-playwright-change-eugene-truuts-r1atf —
   Default template (older form) `'{testDir}/{testFilePath}-snapshots/{arg}-{projectName}-{platform}{ext}'`
   + token explanations + flat custom example. **Fetched.**
6. http://sdethub.com/eugene-truuts/how-the-screenshots-naming-works-in-playwright/ — same default
   literal and custom templates (`snapshots/{projectName}/{platform}/{arg}{ext}` etc.). **Fetched.**
7. https://playwright.dev/docs/api/class-testconfig — `snapshotPathTemplate` token list (`{arg}`,
   `{ext}`, `{platform}`, `{projectName}`, `{snapshotDir}`, `{testFileDir}`, `{testFileName}`,
   `{testFilePath}`, `{testName}`…); `outputDir` defaults to `<pkg>/test-results`. **Fetched** (the
   exact default literal was hidden behind a `%%-…-%%` include placeholder; default confirmed via
   [4][5][6]).
8. https://playwright.dev/docs/docker — Official image `mcr.microsoft.com/playwright`; tags
   `:v1.60.0-noble` / `:v1.60.0-jammy`; "recommended to always pin your Docker image to a specific
   version." (Page does **not** itself assert pixel-consistency wording.) **Fetched.**
9. WebSearch synthesis (Ensono Stacks, patricktree.me, Codoid, oneuptime, TestDino) — pinned official
   image bakes fonts in for local==CI; generate baselines in CI/container; arm64-vs-amd64 still
   diverges. **Fetched** (search results).
10. https://patricktree.me/blog/consistent-visual-assertions-via-playwright-server-in-docker —
    Playwright Server in a pinned Docker image (`v1.57.0-noble`) over WebSocket so all rendering is in
    one image; keeps local feedback loop. **Fetched.**
11. WebSearch synthesis incl. microsoft/playwright issues #35200, #35972, #3322 + test-automation
    blogs — `await page.waitForFunction(() => document.fonts.ready)`; FOUT/fallback risk;
    `PW_TEST_SCREENSHOT_NO_FONTS_READY` env var trade-off (faster but risks fallback capture).
    **Fetched** (search results; issue pages referenced, not individually fetched).
12. https://stacks.ensono.com/docs/testing/testing_in_nx/playwright_visual_testing — `animations:
    'disabled'`, `maxDiffPixelRatio` vs `threshold` guidance, Docker for consistent fonts/deps,
    tag-and-grep workflow for baseline updates. **Fetched.**
13. https://www.screensnap.pro/blog/playwright-screenshot-guide — lazy-image handling (`networkidle`,
    `scrollIntoViewIfNeeded`), `mask` dynamic regions, `deviceScaleFactor`/`scale`, fixed/sticky
    caveat on `fullPage`, mock-timer for JS animations, Docker image for font parity. **Fetched.**
14. https://playwright.dev/docs/emulation — `colorScheme` (`light`/`dark`/`no-preference`) in
    `use`/`test.use`/`page.emulateMedia`; `viewport` (default `1280×720`); `deviceScaleFactor`;
    `playwright.devices` presets; `locale`/`timezoneId`. **Fetched.**
15. https://playwright.dev/docs/test-configuration — `projects[]` each with own `use{}`; `outputDir`
    "folder for test artifacts (screenshots, videos, traces)"; multi-config matrix without test
    duplication. **Fetched.**
16. https://playwright.dev/docs/api/class-testinfo — `testInfo.attach(name,{path|body,contentType})`
    (image/png renders in HTML report), `testInfo.attachments`, `testInfo.outputPath(...segments)`
    (parallel-safe), `testInfo.outputDir`, `testInfo.snapshotPath(...,{kind})`. **Fetched.**

**Fetch failures noted:** the raw GitHub source files for the exact `snapshotPathTemplate` default
literal (`raw.githubusercontent.com/.../class-testconfig.md`, `.../params.md`, `.../config.ts`)
returned the unexpanded `%%-…-%%` include placeholder or 404, so the precise default literal could
not be read from source — it is instead taken from the Microsoft Learn guide [4] and two
docs-derived articles [5][6], with the version caveat noted in §1.
