# Click-through journey library

Each file here is ONE saved click-through run — a committed, named user journey that re-runs on every
e2e run (part of the gate) and is individually listable/runnable/editable. This **directory is the
registry** — there is no separate index to drift; `playwright test e2e/journeys --list` enumerates it.

Managed via `/frontend-review` (list / run / add / modify / delete / promote / suggest-gaps), but it's
just files + Playwright, so you can also do it by hand:

| Verb | How |
|---|---|
| **list** | `npx playwright test e2e/journeys --list` (+ `grep -A4 "Journey:" e2e/journeys/*.spec.ts` for the descriptions) |
| **run one** | `npx playwright test e2e/journeys/<slug>.spec.ts` (prefix `E2E_BASE_URL=<url>` for deployed) |
| **run all journeys** | `npx playwright test --grep @journey` |
| **see artifacts** | the journey's `capture()` PNGs in `test-results/gallery/journey-<slug>-*.png` + its `results.json` entry (+ on-failure trace) |
| **add (permanent)** | copy the template below to `e2e/journeys/<slug>.spec.ts` |
| **modify** | edit that file |
| **delete** | `rm e2e/journeys/<slug>.spec.ts` |
| **one-off (don't save)** | put it in `../adhoc/<name>.spec.ts` (gitignored) and run it |
| **promote a one-off** | move `../adhoc/<name>.spec.ts` here, add the header |

## Conventions

- One journey per file; `<slug>` describes the flow (`browse-to-detail`, `price-filter-relabel`).
- Every file starts with the metadata header (Journey / Covers / Target / Added) so `list` is useful.
- Tag the test `@journey` so `--grep @journey` selects the whole library.
- Prefer **data-driven** steps (use `../support.ts` helpers — `discoverDetailPaths`,
  `assertNoBrokenImages`, `watchForErrors`, `capture`) so the journey runs against seeded test data
  (local) AND live data (deployed) unchanged. `Target: local` only if it genuinely can't.
- End with a `capture(page, "journey-<slug>", testInfo)` so each run leaves a reviewable screenshot.

## The website's DOM, so you don't have to reverse-engineer it

- **Filter chips** are `<button type="button" aria-pressed="true|false">` with the chip label as text
  (`packages/ui/src/components/SearchFilters.tsx`). Click by role+name:
  `page.getByRole("button", { name: "House", exact: true }).click()`. Selecting one navigates to a URL
  param (`?type=house`, `?deal=rent`, `?cond=…`, `?province=…`, `?price=…` — see
  `src/components/FilterBar.tsx` + `src/lib/browse.ts`).
- **Chip labels are i18n strings** — the exact text lives in `packages/ui/src/i18n/en.ts` (and `th.ts`).
  Two gotchas: (a) **price-band labels use a typographic en-dash `–` (U+2013), not a hyphen** (e.g.
  `"฿3–5M"`) — a wrong glyph silently matches 0 chips; (b) the **URL carries the band *id*, not the
  label** (`?price=s2`, not `฿3–5M`). Run on `/en/` for stable English labels.
- **Results count line:** the page shows `Listings: N` (en) / `N ประกาศ` (th). Read it to prove a
  filter narrowed the set.
- **Listing cards** are `<a href="…/properties/{id}">`; **detail photos** render in a `<section>` of
  `<img>` (hero + thumbs).

## Seed shape & which facets are locally testable

The local harness (`test/e2e-server.mjs`) publishes **3 listings, all in เชียงใหม่**, each with real
fixture photos:
- sale **House**, ฿4.5M → price band `s2` (฿3–5M), 3 bed / 2 bath
- NPA **House**, ฿2.9M → price band `s1` (฿1–3M), 2 bed / 1 bath, carries the NPA badge + disclosure
- rent **Condo**, ฿13.5k/mo (no asking price)

- ✅ Locally exercisable: `deal=sale|rent`, `type=house|condo`, `price=s1|s2` (sale), the NPA
  badge/disclosure, galleries.
- ⚠️ **NOT locally exercisable:** `type=land|townhouse|commercial` (no stock → empty result), and the
  **province** filter (it only renders when >1 province exists; the seed has one). For a "results
  narrowed" assertion, filter on **House / Condo / a band that has stock (s1, s2)**, not Land. Mark
  such a journey `Target: deployed` if it needs data the seed lacks, or assert the empty-state instead.
- Playwright syntax: locators https://playwright.dev/docs/locators · assertions
  https://playwright.dev/docs/test-assertions · `waitForURL`
  https://playwright.dev/docs/api/class-page#page-wait-for-url

## Template (worked — adapt it)

```ts
/**
 * Journey: filter by property type narrows the results
 * Covers:  filter-bar island hydration + the ?type= facet — selecting "House" updates the URL and
 *          narrows the result count.
 * Target:  both
 * Added:   YYYY-MM-DD
 */
import { expect, test } from "@playwright/test";
import { capture, watchForErrors } from "../support.ts";

test("journey: type filter narrows results", { tag: ["@journey"] }, async ({ page }, testInfo) => {
  const problems = watchForErrors(page);
  await page.goto("/en/"); // /en/ so the count line + chip labels are in English

  const houseChip = page.getByRole("button", { name: "House", exact: true });
  await houseChip.click();
  await page.waitForURL(/type=house/); // the island hydrated and navigated
  await expect(houseChip).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByText(/Listings:\s*\d+/)).toBeVisible(); // results re-rendered

  await capture(page, "journey-type-filter", testInfo);
  expect(problems(), "no console/network errors during the journey").toEqual([]);
});
```

For a bare scaffold instead, copy any existing `*.spec.ts` here and replace the steps.
