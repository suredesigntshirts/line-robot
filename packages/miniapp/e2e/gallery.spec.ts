import { expect, test } from "@playwright/test";
import { DETAIL, mockApi, settle } from "./support.ts";

// The detail-screen photo GALLERY functional gate. Renders the REAL built SPA at `/p/{id}` with the
// MOCKED api (the multi-photo DETAIL fixture) and DRIVES the navigation: it asserts the FUNCTIONAL
// outcome of a thumbnail tap (the active hero src actually changes + the active marker moves) and of a
// horizontal swipe, plus the count/position chip. This is the layer that catches "renders but doesn't
// navigate" — the bug class this rebuild fixes. Runs mobile light + dark (testMatch picks it up).

const PHOTOS = DETAIL.photos;

/** The `src` of whichever hero <img> currently carries the active marker. */
const heroSrc = (page: import("@playwright/test").Page) =>
  page.locator("[data-gallery] [data-gallery-hero]").getAttribute("src");

test.describe("detail gallery — functional navigation", () => {
  test("tapping a thumbnail changes the active hero photo + moves the active marker", async ({
    page,
  }) => {
    await mockApi(page);
    await page.goto(`/p/${DETAIL.id}`);
    // Hydration: the gallery mounted with its photo count.
    const gallery = page.locator("[data-gallery]");
    await expect(gallery).toBeVisible();
    await settle(page);

    // The fixture is multi-photo so the navigation is meaningfully exercised.
    expect(PHOTOS.length).toBeGreaterThanOrEqual(5);

    // The count chip reflects the TOTAL photo count (data attr + visible position chip).
    await expect(gallery).toHaveAttribute("data-photo-count", String(PHOTOS.length));
    await expect(page.locator("[data-photo-count-chip]")).toContainText(String(PHOTOS.length));

    // Initially photo 0 is the active hero, and thumb 0 is the active-marked thumbnail.
    expect(await heroSrc(page)).toBe(PHOTOS[0]?.url);
    await expect(page.locator("[data-gallery-thumb='0']")).toHaveAttribute("data-active", "");

    // Tap thumbnail #2 — the FUNCTIONAL outcome: the hero src changes to photo 2's url …
    await page.locator("[data-gallery-thumb='2']").click();
    await expect
      .poll(async () => await heroSrc(page), { message: "hero src changed to photo 2" })
      .toBe(PHOTOS[2]?.url);
    // … the active marker MOVED off thumb 0 onto thumb 2 …
    await expect(page.locator("[data-gallery-thumb='2']")).toHaveAttribute("data-active", "");
    await expect(page.locator("[data-gallery-thumb='0']")).not.toHaveAttribute("data-active", "");
    // … and the position chip tracks it (3 of N).
    await expect(page.locator("[data-photo-count-chip]")).toContainText(`3/${PHOTOS.length}`);

    // Tap a different thumbnail (#4) — proves it isn't a one-shot toggle.
    await page.locator("[data-gallery-thumb='4']").click();
    await expect.poll(async () => await heroSrc(page)).toBe(PHOTOS[4]?.url);
    await expect(page.locator("[data-gallery-thumb='4']")).toHaveAttribute("data-active", "");
  });

  test("swiping the hero strip advances the active photo", async ({ page }) => {
    await mockApi(page);
    await page.goto(`/p/${DETAIL.id}`);
    await expect(page.locator("[data-gallery]")).toBeVisible();
    await settle(page);

    expect(await heroSrc(page)).toBe(PHOTOS[0]?.url);

    // Programmatically scroll the hero strip one viewport-width to the right (the swipe path), then
    // dispatch the scroll event the component listens to. The active photo must advance to photo 1.
    await page.evaluate(() => {
      const strip = document.querySelector("[data-gallery-hero-strip]") as HTMLElement | null;
      if (!strip) throw new Error("hero strip not found");
      strip.scrollLeft = strip.clientWidth;
      strip.dispatchEvent(new Event("scroll", { bubbles: true }));
    });

    await expect
      .poll(async () => await heroSrc(page), { message: "swipe advanced the hero" })
      .toBe(PHOTOS[1]?.url);
    await expect(page.locator("[data-gallery-thumb='1']")).toHaveAttribute("data-active", "");
  });

  test("tapping the hero opens the full-screen lightbox; the close button dismisses it", async ({
    page,
  }) => {
    await mockApi(page);
    await page.goto(`/p/${DETAIL.id}`);
    await expect(page.locator("[data-gallery]")).toBeVisible();
    await settle(page);

    const lightbox = page.locator("[data-gallery-lightbox]");
    // Closed initially.
    await expect(lightbox).toHaveCount(0);

    // Tap the active hero photo → the FUNCTIONAL outcome: the modal lightbox opens and shows the
    // photos (every gallery photo is in the lightbox strip).
    await page.locator("[data-gallery-hero]").click();
    await expect(lightbox).toBeVisible();
    await expect(lightbox).toHaveAttribute("aria-modal", "true");
    await expect(lightbox.locator("img")).toHaveCount(PHOTOS.length);

    // Click the close button → it's gone again.
    await lightbox.getByRole("button").click();
    await expect(lightbox).toHaveCount(0);
  });
});
