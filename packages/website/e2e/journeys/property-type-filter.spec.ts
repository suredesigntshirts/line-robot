/**
 * Journey: filter bar — property-type chip narrows the result set
 * Covers:  filter-bar island hydration + the property-type facet — selecting a type chip
 *          (1) updates the URL (?type=<value>), (2) marks the chip active (aria-pressed),
 *          (3) re-renders the result grid to the matching subset (the "Listings: N" count
 *          drops to the filtered total). Exercises the SearchFilters chip → navigate path.
 * Target:  both (data-driven — discovers the type chips + result counts from the page; asserts
 *          narrowing rather than an absolute count, so it adapts to whatever stock is published)
 * Added:   2026-06-14
 */
import { expect, test } from "@playwright/test";
import { capture, watchForErrors } from "../support.ts";

/** Read the rendered total from the "Listings: N" count line (null when the empty state shows). */
async function listingTotal(page: import("@playwright/test").Page): Promise<number | null> {
  const line = page.getByText(/^Listings:\s*\d+$/);
  if ((await line.count()) === 0) return null;
  const text = (await line.first().textContent()) ?? "";
  const m = text.match(/(\d+)/);
  return m ? Number(m[1]) : null;
}

/** The property-type group is the div holding the "Property type" label span + its chip row. */
function typeGroup(page: import("@playwright/test").Page) {
  return page.locator("div", { has: page.getByText("Property type", { exact: true }) }).last();
}

test(
  "journey: property-type filter narrows results",
  { tag: ["@journey"] },
  async ({ page }, testInfo) => {
    const problems = watchForErrors(page);

    // Unfiltered baseline.
    await page.goto("/en/");
    const group = typeGroup(page);
    await expect(group.getByRole("button").first()).toBeVisible(); // island hydrated
    const unfilteredTotal = await listingTotal(page);
    expect(unfilteredTotal, "home should show a non-empty result count").not.toBeNull();

    // Pick a property type that has published stock so the filtered set is non-empty and we can
    // assert a real narrowing. "House" is the seed's most-stocked type; on live data it's the
    // dominant residential category, so this stays meaningful against staging too.
    const chip = group.getByRole("button", { name: "House", exact: true });
    test.skip((await chip.count()) === 0, "no House property-type chip");
    await chip.click();

    // 1. URL reflects the filter.
    await page.waitForURL(/type=house/);

    // 2. The chip is now active (selection reflected after the SSR reload).
    await expect(
      typeGroup(page).getByRole("button", { name: "House", exact: true }),
    ).toHaveAttribute("aria-pressed", "true");

    // 3. Results updated: the grid still renders a count and it is a subset of the unfiltered total.
    const filteredTotal = await listingTotal(page);
    expect(filteredTotal, "filtered result set should be non-empty").not.toBeNull();
    expect(
      filteredTotal ?? Number.POSITIVE_INFINITY,
      "filtering by a single property type cannot grow the result set",
    ).toBeLessThanOrEqual(unfilteredTotal ?? 0);
    // The narrowed page still shows at least one matching card.
    await expect(page.locator('a[href*="/properties/"]').first()).toBeVisible();

    await capture(page, "journey-property-type-filter", testInfo);
    expect(problems(), "no console/network errors during the filter journey").toEqual([]);
  },
);
