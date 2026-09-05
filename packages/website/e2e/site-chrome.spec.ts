import { expect, test } from "@playwright/test";
import {
  assertCtaContrast,
  assertThaiBodyLineHeight,
  assertThemeApplies,
  capture,
} from "./support.ts";

// Site chrome: header / footer / theme toggle / locale switch / mobile nav — the surfaces every
// page shares. Interaction-driven (click, reload, resize) so a broken toggle or a dead link bites.

test.describe("site chrome", () => {
  test("header, footer and skip link render on every page type", async ({ page }) => {
    for (const path of ["/", "/properties", "/about"]) {
      await page.goto(path);
      await expect(page.locator("[data-site-header]"), `header on ${path}`).toBeVisible();
      await expect(page.locator("[data-site-footer]"), `footer on ${path}`).toBeVisible();
      await expect(page.locator("a.skip-link"), `skip link on ${path}`).toHaveAttribute(
        "href",
        "#main",
      );
      await expect(page.locator("#main"), `#main landmark on ${path}`).toBeAttached();
    }
  });

  test("theme toggle flips the effective scheme and persists across reload", async ({ page }) => {
    await page.goto("/");
    const toggle = page.locator("[data-theme-toggle]").first();
    await expect(toggle).toBeVisible();
    const bg = () =>
      page.evaluate(() =>
        getComputedStyle(document.documentElement).getPropertyValue("--color-bg").trim(),
      );
    const before = await bg();
    const modeBefore = await toggle.getAttribute("data-mode");
    await toggle.click();
    const after = await bg();
    expect(after, "toggling must change the surface token").not.toBe(before);
    const expected = modeBefore === "dark" ? "light" : "dark";
    await expect(page.locator("html")).toHaveAttribute("data-theme", expected);
    // The choice survives a reload (localStorage + the pre-paint bootstrap script).
    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("data-theme", expected);
    expect(await bg()).toBe(after);
    // And the site still passes its style invariants in the flipped mode.
    await assertThemeApplies(page);
    await assertCtaContrast(page);
  });

  test("locale switch links to the same page in the other language", async ({ page }) => {
    await page.goto("/properties?deal=rent");
    const link = page.locator('[data-site-header] a[hreflang="en"]').first();
    await expect(link).toHaveAttribute("href", "/en/properties?deal=rent");
    await page.goto("/en/properties?deal=rent");
    const back = page.locator('[data-site-header] a[hreflang="th"]').first();
    await expect(back).toHaveAttribute("href", "/properties?deal=rent");
  });

  test("mobile nav opens, lists the primary links, and closes on Escape", async ({ page }) => {
    await page.goto("/");
    const toggle = page.locator("[data-nav-toggle]");
    test.skip(!(await toggle.isVisible()), "desktop layout — no mobile nav");
    const sheet = page.locator("#site-mobile-nav");
    await expect(sheet).toBeHidden();
    await toggle.click();
    await expect(sheet).toBeVisible();
    await expect(toggle).toHaveAttribute("aria-expanded", "true");
    await expect(sheet.getByRole("link").first()).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(sheet).toBeHidden();
  });

  test("home renders its sections with Thai body line-height intact", async ({
    page,
  }, testInfo) => {
    await page.goto("/");
    await expect(page.locator("[data-hero] h1")).toBeVisible();
    await expect(page.locator('form[role="search"]').first()).toBeVisible();
    await expect(page.locator("#home-latest")).toBeVisible();
    await expect(page.locator("#home-why")).toBeVisible();
    await expect(page.locator("#home-how")).toBeVisible();
    await assertThaiBodyLineHeight(page);
    await capture(page, "chrome-home", testInfo);
  });

  test("home search form lands on the browse page with the query applied", async ({ page }) => {
    await page.goto("/en/");
    const form = page.locator('form[role="search"]').first();
    await form.getByText("Rent", { exact: true }).click(); // the visible segment label (radio is sr-only)
    await expect(form.getByRole("radio", { name: "Rent" })).toBeChecked();
    await form.getByRole("searchbox").fill("condo");
    await form.getByRole("button", { name: "Search" }).click();
    await page.waitForURL(/\/en\/properties\?.*deal=rent/);
    expect(page.url()).toContain("q=condo");
    await expect(page.locator("h1")).toContainText("For rent");
  });
});
