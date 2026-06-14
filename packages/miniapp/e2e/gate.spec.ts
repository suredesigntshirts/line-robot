import { expect, test } from "@playwright/test";
import {
  assertColorScheme,
  assertCtaContrast,
  assertNoBrokenImages,
  assertThaiBodyLineHeight,
  assertThemeApplies,
  capture,
  DETAIL,
  MY_LISTINGS,
  mockApi,
  settle,
  watchForErrors,
} from "./support.ts";

// The LIFF-SPA frontend gate. Renders the REAL built SPA with a MOCKED LIFF context (the @line/liff
// alias) + a MOCKED api (page.route fixtures). Asserts the deterministic invariants on the two
// screens of Build B: `/` my-listings + `/p/{id}` detail. Runs mobile light + dark — the dark project
// is NOT a tautology (assertColorScheme proves the surface flips), so assertCtaContrast bites in dark.

/** The colour scheme this project renders (project names: mobile-light / mobile-dark). */
const schemeOf = (projectName: string): "light" | "dark" =>
  projectName.includes("dark") ? "dark" : "light";

test.describe("LIFF-SPA frontend gate", () => {
  test("the my-listings screen renders, themed, with the cards from the api", async ({
    page,
  }, testInfo) => {
    const problems = watchForErrors(page);
    const { tokensSeen } = await mockApi(page);

    await page.goto("/");
    // Hydration: the React island mounted + fetched + rendered every card.
    await expect(page.locator("[data-listing-card]")).toHaveCount(MY_LISTINGS.length);
    await settle(page);

    // The api was called WITH the mocked LIFF id-token (the auth contract is exercised, not bypassed).
    expect(tokensSeen.length, "the api was called").toBeGreaterThan(0);
    expect(
      tokensSeen.every((t) => t === "e2e.fixture.id-token"),
      "every call sent the id-token",
    ).toBe(true);

    // A RENT card shows its monthly rent, NOT "—" (review finding #1: the owner can see their rent).
    await expect(page.getByText("฿13,000")).toBeVisible();

    await assertThemeApplies(page);
    await assertColorScheme(page, schemeOf(testInfo.project.name)); // dark project actually renders dark
    await assertThaiBodyLineHeight(page);
    await assertCtaContrast(page); // bites in dark too (the surface flipped)
    await assertNoBrokenImages(page);

    await capture(page, "my-listings", testInfo);
    expect(problems(), `console/network problems: ${problems().join("\n")}`).toEqual([]);
  });

  test("the detail screen renders the listing, themed, with its photos + spec table", async ({
    page,
  }, testInfo) => {
    const problems = watchForErrors(page);
    await mockApi(page);

    await page.goto(`/p/${DETAIL.id}`);
    // Hydration: the detail headline (the listing's own headline) rendered after the fetch.
    await expect(page.getByRole("heading", { name: DETAIL.headline })).toBeVisible();
    await settle(page);

    // The spec table carries the rooms the api returned.
    await expect(page.getByText("3 นอน")).toBeVisible();
    await expect(page.getByText("2 น้ำ")).toBeVisible();

    await assertThemeApplies(page);
    await assertColorScheme(page, schemeOf(testInfo.project.name));
    await assertThaiBodyLineHeight(page);
    // The detail's "Open in Maps" is a solid CTA (data-cta-solid) — verify its contrast in BOTH modes.
    await assertCtaContrast(page);
    await assertNoBrokenImages(page);

    await capture(page, "detail", testInfo);
    expect(problems(), `console/network problems: ${problems().join("\n")}`).toEqual([]);
  });

  test("the empty-state renders themed Thai body text (TH-07 on the state copy)", async ({
    page,
  }) => {
    await page.route("https://e2e.api.local/**", (route) => {
      const u = new URL(route.request().url());
      if (u.pathname === "/me/listings")
        return route.fulfill({ status: 200, contentType: "application/json", body: "[]" });
      return route.fulfill({ status: 200, contentType: "application/json", body: "{}" });
    });
    await page.goto("/");
    await expect(page.locator("[data-state='empty']")).toBeVisible();
    await assertThemeApplies(page);
    await assertThaiBodyLineHeight(page);
  });

  test("an api error shows the themed error state with a contrast-safe retry CTA", async ({
    page,
  }) => {
    await page.route("https://e2e.api.local/**", (route) =>
      route.fulfill({ status: 500, contentType: "application/json", body: '{"error":"x"}' }),
    );
    await page.goto("/");
    await expect(page.locator("[data-state='error']")).toBeVisible();
    // the retry CTA is a solid filled button — assert its WCAG-AA contrast (incl. dark mode).
    await expect(page.locator("[data-cta-solid]")).toBeVisible();
    await assertThemeApplies(page);
    await assertCtaContrast(page);
  });

  test("tapping a card navigates to its detail (router push, frozen `/p/{id}`)", async ({
    page,
  }) => {
    await mockApi(page);
    await page.goto("/");
    const firstId = MY_LISTINGS[0]?.id ?? "";
    await page.locator("[data-listing-card]").first().click();
    await expect(page).toHaveURL(new RegExp(`/p/${firstId}$`));
    await expect(page.getByRole("heading", { name: DETAIL.headline })).toBeVisible();
  });
});
