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
