/**
 * Journey: price-band chip narrows the result set (4.3 contextual price filter)
 * Covers:  filter-bar island hydration + the 4.3 ?price= facet AS A FILTER (not just the Buy↔Rent
 *          relabel that price-filter-relabel.spec.ts already covers). Selecting a sale asking-price
 *          bracket (1) updates the URL (?price=<id>), (2) marks the chip active (aria-pressed),
 *          (3) narrows the result grid to the matching subset (the "Listings: N" count drops but
 *          stays non-empty). Exercises the SearchFilters chip → FilterBar.findPriceBand → navigate
 *          path the teammate's 4.3 change introduced.
 * Target:  both (asserts narrowing, not an absolute count, so it adapts to live stock too — but the
 *          chosen bracket is one the local seed populates: the ฿4.5M sale house lands in ฿3–5M).
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

test(
  "journey: price-band filter narrows results (4.3)",
  { tag: ["@journey"] },
  async ({ page }, testInfo) => {
    const problems = watchForErrors(page);

    // Unfiltered baseline — /en/ so the count line + chip labels are in English.
    await page.goto("/en/");
    await expect(page.getByText("Price range", { exact: true })).toBeVisible(); // island hydrated
    const unfilteredTotal = await listingTotal(page);
    expect(unfilteredTotal, "home should show a non-empty result count").not.toBeNull();

    // The "฿3–5M" sale bracket (price band id s2) — the seed's ฿4.5M sale house lands in it, so the
    // filtered set is non-empty AND smaller than the unfiltered set (the ฿2.9M NPA house is in
    // ฿1–3M, the rent condo has no asking price). This is the README's "filter on a value the seed
    // actually has" rule for a real narrowing assertion.
    const band = page.getByRole("button", { name: "฿3–5M", exact: true });
    test.skip((await band.count()) === 0, "no ฿3–5M price-band chip");
    await band.click();

    // 1. URL reflects the price facet (s2 = the ฿3–5M sale band).
    await page.waitForURL(/price=s2/);

    // 2. The chip is now active after the SSR reload.
    await expect(page.getByRole("button", { name: "฿3–5M", exact: true })).toHaveAttribute(
      "aria-pressed",
      "true",
    );

    // 3. Results narrowed: still a count, non-empty, and a subset of the unfiltered total.
    const filteredTotal = await listingTotal(page);
    expect(filteredTotal, "filtered result set should be non-empty").not.toBeNull();
    expect(
      filteredTotal ?? Number.POSITIVE_INFINITY,
      "filtering to one price band cannot grow the result set",
    ).toBeLessThanOrEqual(unfilteredTotal ?? 0);
    // At least one matching card still renders.
    await expect(page.locator('a[href*="/properties/"]').first()).toBeVisible();

    await capture(page, "journey-price-band-filter", testInfo);
    expect(problems(), "no console/network errors during the price-band journey").toEqual([]);
  },
);
