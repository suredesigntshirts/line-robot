import { expect, test } from "@playwright/test";
import {
  assertCtaContrast,
  assertThaiBodyLineHeight,
  assertThemeApplies,
  capture,
  cardPrices,
  listingTotal,
  watchForErrors,
} from "./support.ts";

// UI template variants (lib/variants.ts) + the two alternative browse filter UIs. Interaction-driven:
// the sheet/toolbar must actually change the URL and the result set, and the pick must stick.

test.describe("ui variants", () => {
  test("?ui= picks a template, sticks via cookie, and resets", async ({ page }) => {
    await page.goto("/en/properties?ui=browse:b");
    await expect(page.locator("html")).toHaveAttribute("data-ui", "browse:b");
    await expect(page.locator("main")).toHaveAttribute("data-browse-variant", "b");
    await expect(page.locator("[data-ui-chip]")).toBeVisible(); // explicit preview → switcher chip
    // Sticky: a plain navigation keeps the variant, and the chip disappears (no ?ui= this time).
    await page.goto("/en/properties?deal=rent");
    await expect(page.locator("main")).toHaveAttribute("data-browse-variant", "b");
    await expect(page.locator("[data-ui-chip]")).toHaveCount(0);
    // Global pick applies to browse too.
    await page.goto("/en/properties?ui=c");
    await expect(page.locator("main")).toHaveAttribute("data-browse-variant", "c");
    // Reset → default.
    await page.goto("/en/properties?ui=reset");
    await expect(page.locator("main")).toHaveAttribute("data-browse-variant", "a");
    await expect(page.locator("html")).not.toHaveAttribute("data-ui", /.+/);
  });

  test("unknown variants fall back to the default", async ({ page }) => {
    await page.goto("/en/properties?ui=browse:zzz");
    await expect(page.locator("main")).toHaveAttribute("data-browse-variant", "a");
  });
});

test.describe("browse variant b — rail + sheet", () => {
  test("rail chips filter; the sheet applies a facet and keeps the others", async ({
    page,
  }, testInfo) => {
    const problems = watchForErrors(page);
    await page.goto("/en/properties?ui=browse:b");
    const rail = page.locator("[data-quick-rail]");
    await expect(rail).toBeVisible();
    const before = await listingTotal(page);
    // Segmented deal toggle is a link.
    await rail.getByRole("link", { name: "For sale", exact: true }).click();
    await page.waitForURL(/deal=sale/);
    await expect(
      page.locator("[data-quick-rail]").getByRole("link", { name: "For sale", exact: true }),
    ).toHaveAttribute("aria-current", "page");
    // Open the sheet from the Price chip → it opens scrolled to the price section.
    await page.locator('[data-sheet-open="price"]').click();
    const sheet = page.locator("dialog[data-filter-sheet]");
    await expect(sheet).toHaveAttribute("open", "");
    await expect(sheet.locator('[data-price-for="sale"]')).toBeVisible();
    await expect(sheet.locator('[data-price-for="rent"]')).toBeHidden(); // contextual bands, no JS
    // Switching the deal radio swaps the band set (CSS :has()).
    await sheet.getByText("For rent", { exact: true }).click();
    await expect(sheet.locator('[data-price-for="rent"]')).toBeVisible();
    await sheet.getByText("For sale", { exact: true }).click();
    // Pick a property type + a price band, apply.
    await sheet.getByText("House", { exact: true }).click();
    await sheet.getByText("฿3–5M", { exact: true }).click();
    await sheet.getByRole("button", { name: "Show results" }).click();
    await page.waitForURL(/type=house/);
    const url = new URL(page.url());
    expect(url.searchParams.get("deal")).toBe("sale");
    expect(url.searchParams.get("price")).toBe("s2");
    expect(url.searchParams.get("type")).toBe("house");
    expect(url.searchParams.has("beds"), "'Any' must not reach the URL").toBe(false);
    const after = await listingTotal(page);
    expect(after ?? 0).toBeLessThanOrEqual(before ?? 0);
    // The rail reflects the applied state.
    await expect(page.locator('[data-sheet-open="price"]')).toContainText("฿3–5M");
    await assertThemeApplies(page);
    await assertCtaContrast(page);
    await assertThaiBodyLineHeight(page);
    await capture(page, "browse-variant-b-filtered", testInfo);
    expect(problems(), "no console/network errors in variant b").toEqual([]);
  });

  test("sheet closes on Escape and via the close button", async ({ page }) => {
    await page.goto("/en/properties?ui=browse:b");
    await page.locator("[data-sheet-open]").first().click();
    const sheet = page.locator("dialog[data-filter-sheet]");
    await expect(sheet).toHaveAttribute("open", "");
    await page.keyboard.press("Escape");
    await expect(sheet).not.toHaveAttribute("open", "");
    await page.locator("[data-sheet-open]").first().click();
    await sheet.locator("[data-sheet-close]").click();
    await expect(sheet).not.toHaveAttribute("open", "");
  });
});

test.describe("browse variant c — toolbar", () => {
  test("a select change applies immediately and 'Any' clears", async ({ page }, testInfo) => {
    const problems = watchForErrors(page);
    await page.goto("/en/properties?ui=browse:c");
    const toolbar = page.locator("[data-toolbar]");
    await expect(toolbar).toBeVisible();
    await toolbar.locator('select[name="type"]').selectOption("house");
    await page.waitForURL(/type=house/);
    expect(
      new URL(page.url()).searchParams.get("deal"),
      "'Any' deal must not serialise",
    ).toBeNull();
    await expect(page.locator("[data-toolbar]").locator('select[name="type"]')).toHaveValue(
      "house",
    );
    await page.locator("[data-toolbar]").locator('select[name="type"]').selectOption("");
    await page.waitForURL((u) => !u.searchParams.has("type"));
    // "More filters" holds the secondary facets.
    const more = page.locator("[data-toolbar] details");
    await more.locator("summary").click();
    await expect(more.locator('select[name="cond"]')).toBeVisible();
    await assertThemeApplies(page);
    await assertThaiBodyLineHeight(page);
    await capture(page, "browse-variant-c", testInfo);
    expect(problems(), "no console/network errors in variant c").toEqual([]);
  });
});

test.describe("sort + bedrooms (all variants)", () => {
  test("price sort reorders the cards; the beds facet narrows to the minimum", async ({ page }) => {
    await page.goto("/en/properties?deal=sale");
    const sort = page.locator("[data-sort-select]");
    await sort.selectOption("price_desc");
    await page.waitForURL(/sort=price_desc/);
    const desc = await cardPrices(page);
    test.skip(desc.length < 2, "need two priced sale cards to check order");
    expect(desc).toEqual([...desc].sort((a, b) => b - a));
    await page.locator("[data-sort-select]").selectOption("price_asc");
    await page.waitForURL(/sort=price_asc/);
    const asc = await cardPrices(page);
    expect(asc).toEqual([...asc].sort((a, b) => a - b));
    // Beds facet via the URL (every variant renders the same active chip).
    await page.goto("/en/properties?beds=3");
    await expect(page.getByText("3+ beds").first()).toBeVisible();
    const beds = await page
      .locator("[data-listing-card]")
      .evaluateAll((cards) =>
        cards.map((c) => Number(c.textContent?.match(/(\d+)\s*bed/)?.[1] ?? "0")),
      );
    for (const n of beds) expect(n).toBeGreaterThanOrEqual(3);
  });
});
