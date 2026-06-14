/**
 * Journey: contextual price filter relabels Buy↔Rent (4.3)
 * Covers:  filter-bar island hydration + the 4.3 contextual price control — switching to Rent
 *          relabels the single price range ("Price range" → "Rent/month") and drops the sale label.
 * Target:  both
 * Added:   2026-06-14
 */
import { expect, test } from "@playwright/test";
import { capture } from "../support.ts";

test(
  "journey: price filter relabels Buy↔Rent (4.3)",
  { tag: ["@journey"] },
  async ({ page }, testInfo) => {
    await page.goto("/en/");
    await expect(page.getByText("Price range", { exact: true })).toBeVisible();
    await page.getByRole("button", { name: "For rent", exact: true }).click();
    await page.waitForURL(/deal=rent/);
    await expect(page.getByText("Rent/month", { exact: true }).first()).toBeVisible();
    await expect(page.getByText("Price range", { exact: true })).toHaveCount(0);
    await capture(page, "journey-price-relabel", testInfo);
  },
);
