/**
 * Journey: browse → open a card → detail → back
 * Covers:  the core navigation path — home list → a listing card link → the detail page renders →
 *          browser-back returns to the list. Also asserts the detail gallery images load.
 * Target:  both (data-driven — exercises whatever's published)
 * Added:   2026-06-14
 */
import { expect, test } from "@playwright/test";
import { assertNoBrokenImages, capture } from "../support.ts";

test(
  "journey: browse → open a card → detail → back",
  { tag: ["@journey"] },
  async ({ page }, testInfo) => {
    await page.goto("/");
    const cards = page.locator('a[href*="/properties/"]');
    test.skip((await cards.count()) === 0, "no listings to click through");
    await cards.first().click();
    await page.waitForURL(/\/properties\//);
    await expect(page.locator("h1")).toBeVisible();
    await assertNoBrokenImages(page);
    await capture(page, "journey-browse-to-detail", testInfo);
    await page.goBack();
    await expect(page.locator('a[href*="/properties/"]').first()).toBeVisible();
  },
);
