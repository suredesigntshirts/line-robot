# Runbook — testing (what each suite proves)

## The free gate (every change)

```bash
npm run lint                                   # Biome (format + lint), whole repo
npm run typecheck                              # tsc / astro check per workspace
npm run test                                   # vitest unit tests per workspace (api, bot: with coverage thresholds)
npm run test:e2e -w @line-robot/website        # frontend changes (website, ui): real browser gate, needs Docker
```

`packages/ui`'s `test` also runs `scripts/check-colors.mjs` (token/palette sanity).

## Website

- **Unit** (`npm run test -w @line-robot/website`): `browse`, `jsonLd`, `localeRedirect`, `media`,
  `variants` — pure functions, no browser.
- **Smokes** (`test:ssr`, `test:browse`): build + a Node script that renders pages through the SSR
  entry and asserts strings. Fast, but **blind to styling** — an unstyled page passes. Never treat a
  green smoke as proof the site looks right.
- **e2e gate** (`test:e2e`): `astro build` + Playwright against `test/e2e-server.mjs` (seeded Docker
  Postgres + fake S3, see `local-dev.md`). Four projects: desktop/mobile × light/dark. Specs:
  - `theme.spec` — computed-style invariants: the theme applies, Thai body line-height, CTA contrast,
    `color-scheme`. This is the net that catches "styles didn't load".
  - `flows.spec` — render invariants (home, browse, detail; islands hydrate; no broken images; no JS
    errors).
  - `site-chrome.spec` — header/footer, theme-toggle persistence, mobile nav sheet.
  - `detail.spec` — gallery lightbox, copy-link, phone CTA bar.
  - `pages.spec` — static content pages, designed 404, `robots.txt`.
  - `browse-variants.spec` — the `?ui=` template variants a/b/c render from the one facet model.
  - `journeys/` — the click-through journey library (one file per saved journey; the directory is the
    registry — see its README).
  - `capture.spec` — the review-capture gallery into `test-results/gallery/` for a design review.
- **Deployed** (`test:e2e:deployed` with `E2E_BASE_URL`): the same specs against the live site — the
  post-deploy check in `deploy.md`.
- **Ad-hoc**: drop a throwaway `*.spec.ts` in `e2e/adhoc/` (those specs are gitignored and excluded from the
  gate; the helper scripts + README there are tracked) or shoot
  specific states with `node e2e/adhoc/shoot.mjs` — see `packages/website/e2e/adhoc/README.md`.
- **Design review pass** (opt-in, **founder-invoked**): the founder types `/frontend-review [url]`; it renders
  the real artifact and reviews it against `handbook/design/mockups/` and the heuristic register. The skill
  has `disable-model-invocation: true`, so a session cannot call it — ask the founder to run it, or do the
  manual equivalent: `npx playwright test e2e/capture.spec.ts` for the gallery, then compare the PNGs against
  `handbook/design/mockups/renders/direction-a-baania-clean-{light,dark}.png` by eye.

## Data layer

- `npm run test:integration -w @line-robot/db` / `-w @line-robot/pipeline` — Docker `postgis/postgis`
  suites (harness `@line-robot/db/testing`). Pipeline's `*.e2e.test.ts` files call the **real**
  Anthropic API (need `ANTHROPIC_API_KEY`).
- `npm run test:rds -w @line-robot/db` — against the real RDS instance (`DATABASE_URL`).
- `npm run eval` — pipeline scorecard over the synthetic cases. `EVAL_LLM=oracle` (default) is a
  harness smoke; `EVAL_LLM=anthropic` runs the real model (advisory, D21 — read the delta, regenerate
  `eval-baseline.json` once new behaviour is confirmed correct). `EVAL_CACHE=1` reuses frozen
  responses. Any change to what the model sees or returns must be validated on the real API, not
  only on the fakes — real-model bugs have hidden under green fakes before.

## Parked subsystems (still runnable)

- Mini-app: `npm run test:e2e -w @line-robot/miniapp` — two suites: the static gate (`e2e/`, mocked
  LIFF + routed api, computed-style + interaction tests) and the real-backend round-trip suite
  (`e2e-api/`, Docker Postgres + the real `packages/api` handler + stub LIFF verifier, port 4331;
  `test:e2e:api` runs just this one).
- Bot: `npm --prefix packages/bot run test:integration` — DynamoDB Local (Docker).

## Browser automation against third-party sites (research captures)

Our own site is tested **headless**. Third-party Thai portals are different: we are on a residential
IP and headless + bot UA gets walled. Capture them **headed**, with a current Chrome user-agent,
realistic viewport, locale `th-TH`, timezone Asia/Bangkok and human pacing. Never solve CAPTCHAs; for
hard walls (Cloudflare JS challenge, DataDome) open the page headed and ask the founder to clear it.
`playwright-cli -s=manual … --persistent` keeps a cleared profile; saved state in
`.playwright-cli/clearance-state.json` (gitignored — never commit cookies). Gotchas: `mousewheel`
may not scroll (use `eval window.scrollTo`); the echoed page title can be stale after `goto`.
