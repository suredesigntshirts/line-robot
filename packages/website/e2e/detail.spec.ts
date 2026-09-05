import { expect, test } from "@playwright/test";
import {
  assertThaiBodyLineHeight,
  capture,
  discoverDetailPaths,
  watchForErrors,
} from "./support.ts";

// Listing detail: interaction-driven — the lightbox must open/advance/close, the copy-link button
// must write the URL, the phone CTA bar must be present, and the page must keep its invariants.

test.describe("listing detail", () => {
  test("gallery lightbox opens on the hero, advances, and closes", async ({ page }) => {
    const paths = await discoverDetailPaths(page);
    test.skip(paths.length === 0, "no published listings");
    await page.goto(paths[0]);
    const gallery = page.locator("[data-gallery]");
    test.skip((await gallery.count()) === 0, "listing has no photos");
    const dialog = gallery.locator("dialog[data-lightbox]");
    await expect(dialog).not.toHaveAttribute("open", "");
    await gallery.locator('[data-lightbox-open="0"]').first().click();
    await expect(dialog).toHaveAttribute("open", "");
    await expect(dialog.locator("[data-lightbox-counter]")).toHaveText(/^1 \/ \d+$/);
    const total = Number((await gallery.getAttribute("data-photo-count")) ?? "0");
    if (total > 1) {
      await dialog.locator("[data-lightbox-next]").click();
      await expect(dialog.locator("[data-lightbox-counter]")).toHaveText(/^2 \/ \d+$/);
      await page.keyboard.press("ArrowLeft");
      await expect(dialog.locator("[data-lightbox-counter]")).toHaveText(/^1 \/ \d+$/);
    }
    await page.keyboard.press("Escape");
    await expect(dialog).not.toHaveAttribute("open", "");
  });

  test("copy-link writes the page URL to the clipboard (desktop panel)", async ({
    page,
    context,
    browserName,
  }) => {
    test.skip(
      browserName !== "chromium",
      "clipboard permissions are chromium-only in this harness",
    );
    const paths = await discoverDetailPaths(page);
    test.skip(paths.length === 0, "no published listings");
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.goto(paths[0]);
    const btn = page.locator("[data-copy-link]");
    test.skip(!(await btn.isVisible()), "panel hidden at this viewport");
    await btn.click();
    await expect(btn).toContainText(/คัดลอกลิงก์แล้ว|Link copied/);
    const text = await page.evaluate(() => navigator.clipboard.readText());
    expect(text).toBe(page.url());
  });

  test("phones get a sticky LINE CTA bar; desktop gets the side panel", async ({ page }) => {
    const paths = await discoverDetailPaths(page);
    test.skip(paths.length === 0, "no published listings");
    await page.goto(paths[0]);
    const bar = page.locator("[data-sticky-cta]");
    const panel = page
      .locator("aside[aria-label]")
      .filter({ has: page.locator('a[data-cta="line"]') });
    const wide = (await page.viewportSize())?.width ?? 0;
    if (wide >= 1024) {
      await expect(panel).toBeVisible();
      await expect(bar).toBeHidden();
    } else {
      await expect(bar).toBeVisible();
      await expect(bar.locator('a[data-cta="line"]')).toBeVisible();
    }
  });

  test("renders key facts, spec table, legal notices and similar listings without errors", async ({
    page,
  }, testInfo) => {
    const problems = watchForErrors(page);
    const paths = await discoverDetailPaths(page);
    test.skip(paths.length === 0, "no published listings");
    await page.goto(paths[0]);
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.getByRole("list", { name: /ข้อมูลสำคัญ|Key facts/ })).toBeVisible();
    await expect(page.locator("dl").first()).toBeVisible();
    await expect(page.getByText(/ข้อมูลจากผู้ลงประกาศ|poster-provided/).first()).toBeVisible();
    await expect(page.locator("#similar-heading")).toBeVisible();
    await assertThaiBodyLineHeight(page);
    await capture(page, "detail-polished", testInfo);
    expect(problems(), "no console/network errors on detail").toEqual([]);
  });
});
