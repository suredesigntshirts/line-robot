# Ad-hoc e2e specs (scratch — gitignored)

Drop a throwaway Playwright spec here to probe a specific page or click-through, then run it. Use the
helpers in `../support.ts` (`discoverDetailPaths`, `assertThemeApplies`, `assertNoBrokenImages`,
`watchForErrors`, `capture`) and the DOM/seed notes in `../journeys/README.md`.

**Run it** (from `packages/website/`):
```bash
npx playwright test e2e/adhoc/<name>.spec.ts                          # all 4 projects, local (auto-boots the server)
npx playwright test e2e/adhoc/<name>.spec.ts --project=desktop-light  # one viewport/theme, faster
E2E_BASE_URL=https://<cloudfront> npx playwright test e2e/adhoc/<name>.spec.ts  # probe deployed
```

These are **gitignored** (`*.spec.ts`) and **excluded from the gate** — the `test:e2e` scripts list the
gate dirs explicitly, so an ad-hoc spec never runs in a normal gate run. Delete yours when done, or
**promote** it: move it to `../journeys/<slug>.spec.ts` and add the metadata header.

## Review screenshots (`shoot.mjs`)

`shoot.mjs` is a committed helper for design review: it shoots specific states (mobile viewport,
lightbox open, filters open, dark mode) against a running e2e server into `test-results/review/`
(gitignored). Start the server once, then pass a JSON list of shots:

```bash
node test/e2e-server.mjs &                      # seeded Docker PG + the real build on :4321
SHOTS='[{"name":"detail-mobile","path":"/properties/<id>","mobile":true},
        {"name":"lightbox","path":"/properties/<id>","click":"[data-lightbox-open=\"0\"]"},
        {"name":"browse-dark","path":"/properties","dark":true,"full":true}]' node e2e/adhoc/shoot.mjs
```

Shot fields: `path` (required), `name`, `mobile` (Pixel 7), `dark`, `full` (fullPage), `click`
(selector or list, clicked in order), `scroll` (y px), `wait` (ms after load).

## Mock renders (`render-mocks.mjs`)

Renders `handbook/design/mockups/*.html` to `renders/<name>-{light,dark}.png` at 1400px wide — the design
bar `/frontend-review` diffs the site against. `node e2e/adhoc/render-mocks.mjs [name…] [--out <dir>]`
(`--out` to render elsewhere and compare first). Commit the PNGs when a mock changes.

## Open Graph card (`og-image.mjs`)

Regenerates `src/assets/og-default.png` (1200×630) from an HTML card using the brand tokens + the
installed fonts: `node e2e/adhoc/og-image.mjs`.
