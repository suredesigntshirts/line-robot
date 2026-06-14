---
name: frontend-review
description: Frontend gate + visual design review for the website. Renders the REAL site (local build or a deployed URL) in a real browser and (1) asserts INVARIANTS that survive theme churn — the theme applies, islands hydrate, no broken images, no JS errors (the TECH-06 net); (2) captures a screenshot gallery a sub-agent reviews against the design DIRECTION (mockups + heuristics + taste), no pixel-diff; (3) runs ad-hoc page/click probes the caller provides and returns results. Data-driven (discovers listings from the page) so it runs against seeded test data and live data unchanged. Use on frontend increments, after a meaningful deploy, or any time you want the design reviewed. Args: [local | <deployed-url>] [optional focus]
disable-model-invocation: true
---

# Frontend review — render the real site, assert invariants, review the design

Catches two classes that source review + SSR-string smokes are structurally blind to:
1. **The site renders WRONG** — unstyled / theme not applying / broken images / dead islands — even
   though the HTML is "correct" (the TECH-06 class; it shipped an unstyled site through a whole build).
2. **The design drifts from our DIRECTION** — not pixels, but alignment with the mockups + heuristics
   + taste brief.

NOT correctness (`/code-review`), semantics-vs-research (`/alignment-review`), or simplicity.

## Targets

> **Run everything from `packages/website/`** — `cd packages/website` first, or use the
> `npm run … -w @line-robot/website` scripts (they set the cwd for you). A bare `npx playwright …`
> from the repo root won't find the config; symptom: `page.goto: Cannot navigate to invalid URL`
> (the webServer never booted). All `e2e/…` paths below assume cwd = `packages/website`.

- **local** (default): builds + serves the REAL artifact on localhost via the plan-20 harness (seeded
  Docker PG, sirv static + SSR, fake-S3 images). For dev iteration + the per-increment gate.
- **deployed**: hits the live site — **no build/server**. The staging origin is
  `https://d15dpmhcgtrf1r.cloudfront.net` (also in `CLAUDE.md`; overridable at build via `SITE_URL`).
  Catches the infra-boundary bugs local can't model — CloudFront content-types/caching, the scoped
  S3-presign IAM role, the real Lambda env, RDS connectivity, redirects/headers. (Demonstrated: a
  deployed run flags `font-delivery` red when the live site is behind local — "your deploy hasn't
  shipped the fix yet.")

**The switch is the `E2E_BASE_URL` env var, not the script name.** Set it → deployed (the config
turns off the webServer and points the browser at that URL); unset → local. So `test:e2e:deployed` is
just `playwright test` with no build/server — you supply `E2E_BASE_URL=<url>`.

Same specs both ways — they're **data-driven** (discover listings from the rendered page, the DB's
public projection), so they adapt to seeded test data (local) or live data (deployed) with no
hardcoding.

## Non-negotiable principles

1. **Real artifact, real browser.** Local = the built site (never `astro dev`, never the Tailwind
   component gallery — that's what masked the original bug). Deployed = the live URL. If you can't
   build/serve/reach it, STOP and say so — never approve from reading source or HTML.
2. **Assert invariants, not pixels.** The design is still in flux (theme work ongoing) — we do **not**
   pixel-diff. We assert a theme APPLIES (tokens resolve, brand font delivered via @font-face, dark
   mode flips), islands hydrate, images load, no JS errors / 5xx. These survive theme churn. Pixel
   baselines are deferred to design lock-in.
3. **Design review is judgment vs DIRECTION, not vs a prior screenshot.** Compare the captured gallery
   to `docs/design/mockups/` + the heuristic register + the taste brief — "does this align with where
   we're going." Style only, never content/fields (those come from the code/schema).
4. **Save the caller's context — run in a sub-agent.** The heavy work (run the suite, open ~16
   screenshots) happens in a spawned agent; it returns a concise verdict + only the 2–3 screens worth
   the founder's eyes — not a dump of every image/log.

## Modes (compose as the task needs)

### A — Gate run (pass/fail invariants + click-throughs)
- local: `npm run test:e2e -w @line-robot/website`
- deployed: `E2E_BASE_URL=<url> npm run test:e2e:deployed -w @line-robot/website`
- **Read the result from `packages/website/test-results/results.json`** (don't stream stdout): green
  iff **`stats.unexpected === 0`**. Failing specs are the `suites[].specs[]` with `spec.ok === false`
  (drill `…tests[].results[].status !== "passed"` for the `error.message`); each failure's screenshot
  is `packages/website/test-results/artifacts/<test-slug>/test-failed-1.png`. Quick check **(from the
  repo root)**: `node -e 'console.log(require("./packages/website/test-results/results.json").stats)'`
  (from inside `packages/website/` use `./test-results/results.json`).
- **This is the hard gate.** Checks: theme applies (home + a discovered detail), fonts delivered, dark
  mode, no broken images (the presign/CDN path), no console/network errors, the empty state is
  healthy, and the click-through journeys.
- **Expected red on deployed when the deploy is behind:** if a deployed run fails ONLY an invariant
  you just shipped locally (e.g. `font-delivery`), that's the gate correctly saying "the live site
  predates this change — redeploy," not a flake. Confirm by checking the live CSS lacks the fix — the
  asset is content-hashed, so grab its real name from the page first:
  `curl -s "<url>/_astro/$(curl -s <url>/ | grep -oE 'Base[^\"]+\.css' | head -1)" | grep -c @font-face`
  → `0` on the behind deploy, `1` once redeployed.

### B — Capture + visual design review (the design eyes)
- Any run produces a fresh gallery, **namespaced by target**:
  `packages/website/test-results/gallery/{local|deployed}/{project}-{screen}.png` (home · home-rent ·
  detail · empty × desktop/mobile × light/dark — filenames self-describe). The next run of the SAME
  target overwrites it in place, so **review the gallery before launching another run of that target**
  (local and deployed no longer collide; same-target back-to-back does).
- **Spawn a fresh `Explore` sub-agent using the ready prompt in `design-review-prompt.md`** (fill in
  the target's gallery dir). That prompt already carries the inputs (mockups, taste brief, the register
  §4 *visual context groups* — read the IDs from §4, don't hardcode them) and the two HARD rules:
  **(1) style only — not content/fields/pixels**, and **(2) SURFACE divergences as open questions for
  the founder — do NOT let the agent adjudicate a mock↔render mismatch against `theme.css`/git** (that
  buries the very call the founder needs to make; e.g. "NPA badge renders calm-violet, mockup shows
  red — intended?" must reach the founder, not be self-resolved). It returns per-screen notes +
  worst-divergences-as-open-questions + the 2–3 screens worth the founder's eyes.
- Relay that verdict; do not inline all the images into the main conversation.

### C — Click-through journey library (list / run / add / modify / delete / promote)
Saved click-through runs live one-journey-per-file in `e2e/journeys/` — the **directory IS the
registry** (no separate index to drift; `--list` enumerates it). They run as part of the gate AND are
individually managed. It's just files + Playwright. **All commands below run from `packages/website/`**
(`cd packages/website` first):

- **list what we track:** `npx playwright test e2e/journeys --list` (titles) + `grep -A4 "Journey:"
  e2e/journeys/*.spec.ts` (purposes). Present name · covers · target.
- **run one:** `npx playwright test e2e/journeys/<slug>.spec.ts` (add `--project=desktop-light` for a
  single viewport/theme; prefix `E2E_BASE_URL=<url>` for deployed). **Run all journeys:** `--grep @journey`.
- **see artifacts:** `test-results/gallery/local/journey-<slug>-*.png` (or `…/deployed/…`) + the
  journey's entry in `results.json` (+ an on-failure trace under `test-results/artifacts/`).
- **add (permanent):** copy the **worked template in `e2e/journeys/README.md`** to
  `e2e/journeys/<slug>.spec.ts` and adapt — it shows how to target filter chips, assert a results
  change, and which `support.ts` helpers to use. Prefer **data-driven** (discovery); but for a
  "results narrowed" assertion, filter on a value the seed actually has (House/Condo, not Land — see
  the README's seed/facet note). Committed → re-runs on every future change. **After saving, run
  `npm run lint` + `npm run typecheck -w @line-robot/website` from the repo root** — heads-up:
  `biome check <single-file>` reports `e2e/` files as "ignored", so only the full `npm run lint`
  (`biome check .`) actually lints them; a journey can fail the repo's lint gate while a single-file
  check looks clean.
- **modify:** edit the file. **delete:** `rm e2e/journeys/<slug>.spec.ts`.
- **one-off (don't save):** write `e2e/adhoc/<name>.spec.ts` (gitignored scratch) with the same
  helpers, then `npx playwright test e2e/adhoc/<name>.spec.ts [--project=desktop-light]` (auto-boots
  the seeded server locally; `E2E_BASE_URL=<url>` to probe deployed). Ad-hoc specs are **excluded from
  the gate** (the `test:e2e` scripts list the gate dirs explicitly), so they don't pollute a gate run —
  but delete yours when done. **promote:** move it to `e2e/journeys/`, add the metadata header.
- **suggest coverage gaps:** read the journey list against the increment's diff (changed pages /
  islands / flows) and propose journeys to add / modify / delete — e.g. "the diff touches the province
  filter but no journey exercises it." Surface as suggestions; write only on the founder's OK. (Some
  facets aren't exercisable against the local seed — see the README's seed/facet note.)

## When it runs
- **Every frontend / design-bearing increment** (invoked by `/increment-review`): A + B on **local**.
- **After a meaningful deploy** (CLAUDE.md deploy cadence): A + B on **deployed** (the live URL).
- **On demand:** run B (design review) or C (ad-hoc probe) any time the founder or an agent wants eyes
  on the site.

## Reporting
`## Gate` (pass/fail invariants; failing ones with the saved screenshot path) · `## Design review`
(alignment vs direction; worst divergences; the few screens to open) · `## Ad-hoc` (if run) ·
`## Verdict`. Tight — link paths, don't inline dumps.

## Rules
- Read-only review; fixes happen after, by the author, then re-run.
- A failing **invariant** (theme not applying, broken image, JS error, 5xx) is a **BLOCKER**. A
  **design-alignment** note is a judgment the founder rules on.
- Don't pixel-diff (deferred). Don't grade content/fields against the mockups (content is code/schema
  driven — see `docs/design/mockups/README.md`: "steal the styling, ignore the data").
- Deployed needs a reachable URL; if the live site predates local changes, expect invariants like
  font-delivery to fail until it's redeployed — that's the gate correctly flagging the deploy is behind.

## Reference (Playwright syntax + this repo's helpers)
- Locators / selectors: https://playwright.dev/docs/locators · assertions (`toHaveAttribute`,
  `toHaveCount`, …): https://playwright.dev/docs/test-assertions
- JSON reporter shape: https://playwright.dev/docs/test-reporters#json-reporter · `webServer` /
  `reuseExistingServer`: https://playwright.dev/docs/test-webserver
- **Use the repo helpers, don't reinvent** (`e2e/support.ts`): `discoverDetailPaths` (find published
  listings from the page), `assertThemeApplies` (TECH-06 net), `assertNoBrokenImages` (presign/CDN),
  `watchForErrors` (JS/network/5xx), `capture` (gallery screenshot). The **seed shape, which facets are
  locally testable, and a filled-in journey example** are in `e2e/journeys/README.md`.
