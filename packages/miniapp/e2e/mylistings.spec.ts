import { expect, test } from "@playwright/test";
import {
  assertColorScheme,
  assertCtaContrast,
  assertNoBrokenImages,
  assertThaiBodyLineHeight,
  assertThemeApplies,
  capture,
  MY_LISTINGS,
  mockApi,
  settle,
  watchForErrors,
} from "./support.ts";

// The LIFF-SPA frontend gate for the Stage-5 PHOTO-FORWARD my-listings home (this increment). Renders
// the REAL built SPA with a MOCKED LIFF context (incl. the identity profile) + a MOCKED api, and DRIVES
// the interactive controls — the whole point of the run: a control isn't "done" because it renders, it
// must WORK and the test must BITE (break the handler → the assertion goes red). We drive: the tabs
// (forward AND back to default), the lifecycle filter chips (narrow → clear → restore), and the search
// pill (narrow → clear → restore). The new chrome (5-stat strip, section header, identity row) is held
// to the deterministic invariants (theme / TH-07 / contrast / colorScheme / no-broken-images).

const schemeOf = (projectName: string): "light" | "dark" =>
  projectName.includes("dark") ? "dark" : "light";

// Fixture lifecycle buckets (from test/fixtures.ts MY_LISTINGS):
//   OFFER (sale reserved, photo, สันกำแพง) → offer
//   ACTIVE (sale published, no photo, สันทราย) → active
//   RENT (rent available, photo, เมืองเชียงใหม่) → active
//   DRAFT (sale unpublished, no photo, แม่ริม) → draft
//   SOLD (sale transferred, photo, สันทราย) → closed
const COUNT = { all: MY_LISTINGS.length, active: 2, offer: 1, draft: 1, closed: 1 } as const;

/** Cards visible in the LISTINGS panel only (the saved panel also uses [data-listing-card]). */
const listingCards = (page: import("@playwright/test").Page) =>
  page.locator("[data-listings-list] [data-listing-card]");

test.describe("my-listings home — photo-forward layout + chrome", () => {
  test("renders the photo-forward cards, the 5-stat strip, the identity chrome — themed, no broken images", async ({
    page,
  }, testInfo) => {
    const problems = watchForErrors(page);
    await mockApi(page);

    await page.goto("/");
    await expect(listingCards(page)).toHaveCount(COUNT.all);
    // The 5-stat count strip (S5-5): five tiles, the total tile reads the fixture count.
    await expect(page.locator("[data-stats-strip] [data-stat]")).toHaveCount(5);
    await expect(page.locator("[data-stat='crm.statTotal']")).toContainText(String(COUNT.all));
    // Identity chrome: the avatar image (real LIFF pictureUrl) + the wordmark.
    await expect(page.locator("[data-identity-avatar]")).toBeVisible();
    await expect(page.locator("[data-wordmark]")).toContainText("ทรัพย์ดี");
    // Photo-forward: each card with a photo overlays the deal pill + the photo-present chip.
    await expect(page.locator("[data-listings-list] [data-deal-pill]").first()).toBeVisible();
    await expect(page.locator("[data-listings-list] [data-photo-chip]").first()).toBeVisible();
    await settle(page);

    await assertThemeApplies(page);
    await assertColorScheme(page, schemeOf(testInfo.project.name));
    await assertThaiBodyLineHeight(page);
    await assertCtaContrast(page); // the active "ทั้งหมด" filter chip is a filled control
    await assertNoBrokenImages(page);

    await capture(page, "mylistings", testInfo);
    expect(problems(), `console/network problems: ${problems().join("\n")}`).toEqual([]);
  });

  test("TABS switch the panel forward AND back to the default listings panel", async ({ page }) => {
    await mockApi(page);
    await page.goto("/");
    // Default = listings: the listings list + stats strip are present.
    await expect(page.locator("[data-listings-list]")).toBeVisible();
    await expect(page.locator("[data-stats-strip]")).toBeVisible();

    // → Saved: the saved list mounts; the listings stats strip is gone.
    await page.getByRole("tab", { name: "บันทึกไว้" }).click();
    await expect(page.locator("[data-saved-list]")).toBeVisible();
    await expect(page.locator("[data-stats-strip]")).toHaveCount(0);
    await expect(page.locator("[data-listings-list]")).toHaveCount(0);

    // → Viewings: the upcoming section mounts; the saved list is gone.
    await page.getByRole("tab", { name: "นัดดูทรัพย์" }).click();
    await expect(page.locator("[data-viewings-section='upcoming']")).toBeVisible();
    await expect(page.locator("[data-saved-list]")).toHaveCount(0);

    // → back to Listings (the existing crm test only drives forward): the listings panel returns.
    await page.getByRole("tab", { name: "ประกาศของฉัน" }).click();
    await expect(page.locator("[data-listings-list]")).toBeVisible();
    await expect(page.locator("[data-stats-strip]")).toBeVisible();
    await expect(page.locator("[data-viewings-section='upcoming']")).toHaveCount(0);
    await expect(listingCards(page)).toHaveCount(COUNT.all);
  });

  test("LIFECYCLE FILTER CHIPS actually narrow the rendered card set; clearing restores it", async ({
    page,
  }) => {
    await mockApi(page);
    await page.goto("/");
    await expect(listingCards(page)).toHaveCount(COUNT.all);

    // Tap "ประกาศอยู่" (active) → only the two live cards remain.
    await page.locator("[data-filter-chip='active']").click();
    await expect(page.locator("[data-filter-chip='active']")).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await expect(listingCards(page)).toHaveCount(COUNT.active);

    // Tap "มีผู้สนใจ" (offer) → only the single under-offer card.
    await page.locator("[data-filter-chip='offer']").click();
    await expect(listingCards(page)).toHaveCount(COUNT.offer);

    // Tap "ขายแล้ว/เช่าแล้ว" (closed) → only the single sold card.
    await page.locator("[data-filter-chip='closed']").click();
    await expect(listingCards(page)).toHaveCount(COUNT.closed);

    // Clear (tap "ทั้งหมด") → the full set returns.
    await page.locator("[data-filter-chip='all']").click();
    await expect(listingCards(page)).toHaveCount(COUNT.all);
  });

  test("a filter that matches nothing shows the no-match state (not the no-listings empty state)", async ({
    page,
  }) => {
    await mockApi(page);
    // Override /me/listings with a set that has NO drafts → the draft chip yields zero cards. This
    // route is registered AFTER mockApi so it wins (Playwright matches handlers last-registered-first).
    await page.route("**/me/listings", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(MY_LISTINGS.filter((l) => l.isPublished !== false)),
      }),
    );
    await page.goto("/");
    await page.locator("[data-filter-chip='draft']").click();
    await expect(page.locator("[data-state='no-match']")).toBeVisible();
    await expect(listingCards(page)).toHaveCount(0);
  });

  test("the SEARCH PILL narrows the rendered set by location; clearing restores it", async ({
    page,
  }) => {
    await mockApi(page);
    await page.goto("/");
    await expect(listingCards(page)).toHaveCount(COUNT.all);

    // "สันทราย" is the amphoe of ACTIVE + SOLD → two cards.
    await page.locator("[data-search-input]").fill("สันทราย");
    await expect(listingCards(page)).toHaveCount(2);

    // "สันกำแพง" is the amphoe of OFFER only → one card.
    await page.locator("[data-search-input]").fill("สันกำแพง");
    await expect(listingCards(page)).toHaveCount(1);

    // The clear (✕) button resets the query → the full set returns.
    await page.locator("[data-search-clear]").click();
    await expect(listingCards(page)).toHaveCount(COUNT.all);
  });
});
