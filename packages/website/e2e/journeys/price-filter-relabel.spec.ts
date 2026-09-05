/**
 * Journey: contextual price filter relabels Buy↔Rent (4.3)
 * Covers:  the SSR filter panel + the 4.3 contextual price control — switching to Rent
 *          relabels the single price range ("Price range" → "Rent/month") and drops the sale label.
 * Target:  both
 * Added:   2026-06-14
 */
import { expect, test } from "@playwright/test";
import { capture, openFilters } from "../support.ts";

test(
  "journey: price filter relabels Buy↔Rent (4.3)",
  { tag: ["@journey"] },
  async ({ page }, testInfo) => {
    await page.goto("/en/properties");
    await openFilters(page);
    const panel = page.locator("[data-filter-panel]");
    await expect(panel.getByText("Price range", { exact: true })).toBeVisible();
    await panel.getByRole("link", { name: "For rent", exact: true }).click();
    await page.waitForURL(/deal=rent/);
    await openFilters(page);
    await expect(
      page.locator("[data-filter-panel]").getByText("Rent/month", { exact: true }),
    ).toBeVisible();
    await expect(
      page.locator("[data-filter-panel]").getByText("Price range", { exact: true }),
    ).toHaveCount(0);
    await capture(page, "journey-price-relabel", testInfo);
  },
);
