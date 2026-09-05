import { expect, test } from "@playwright/test";
import {
  assertThaiBodyLineHeight,
  assertThemeApplies,
  capture,
  watchForErrors,
} from "./support.ts";

// Static/auxiliary pages: the markdown collection pages render their prose in both locales, the
// contact page renders its cards, robots/sitemap exist, and unknown paths get the designed 404.

const PAGES = ["about", "how-it-works", "privacy", "terms"] as const;

test.describe("auxiliary pages", () => {
  for (const slug of PAGES) {
    test(`/${slug} renders prose in th + en`, async ({ page }, testInfo) => {
      const problems = watchForErrors(page);
      await page.goto(`/${slug}`);
      await expect(page.locator("h1")).toBeVisible();
      await expect(page.locator("article.prose-site h2").first()).toBeVisible();
      await expect(page.locator('html[lang="th"]')).toBeAttached();
      await assertThemeApplies(page);
      await assertThaiBodyLineHeight(page);
      await page.goto(`/en/${slug}`);
      await expect(page.locator('html[lang="en"]')).toBeAttached();
      await expect(page.locator("article.prose-site h2").first()).toBeVisible();
      if (slug === "about") await capture(page, "page-about", testInfo);
      expect(problems(), `no errors on /${slug}`).toEqual([]);
    });
  }

  test("/contact renders the LINE, PDPA and broker cards", async ({ page }, testInfo) => {
    await page.goto("/contact");
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.locator("main section")).toHaveCount(3);
    await assertThaiBodyLineHeight(page);
    await capture(page, "page-contact", testInfo);
  });

  test("unknown paths get the designed 404 with a way forward", async ({ page }, testInfo) => {
    const res = await page.goto("/no-such-page-xyz");
    expect(res?.status()).toBe(404);
    await expect(page.locator("h1")).toContainText(/ไม่พบหน้านี้|Page not found/);
    await expect(page.locator('main a[href="/properties"]')).toBeVisible();
    const en = await page.goto("/en/no-such-page-xyz");
    expect(en?.status()).toBe(404);
    await expect(page.locator("h1")).toContainText("Page not found");
    await capture(page, "page-404", testInfo);
  });

  test("robots.txt and sitemap.xml are served", async ({ request }) => {
    const robots = await request.get("/robots.txt");
    expect(robots.status()).toBe(200);
    expect(await robots.text()).toContain("Sitemap:");
    const sitemap = await request.get("/sitemap.xml");
    expect(sitemap.status()).toBe(200);
    const xml = await sitemap.text();
    expect(xml).toContain("/how-it-works");
    expect(xml).toContain("/properties");
  });
});
