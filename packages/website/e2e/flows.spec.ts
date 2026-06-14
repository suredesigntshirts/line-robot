import { expect, test } from "@playwright/test";
import {
  assertNoBrokenImages,
  assertThemeApplies,
  discoverDetailPaths,
  watchForErrors,
} from "./support.ts";

// Data-driven render INVARIANTS — discover whatever's published and assert per-page health. No
// hardcoded listing data, so the same specs run against seeded test data (local) and live data
// (deployed). (Named click-through journeys live in e2e/journeys/ — the managed library.)

test.describe("render invariants (data-driven)", () => {
  test("home: shell renders, theme applies, no broken images, no errors", async ({ page }) => {
    const problems = watchForErrors(page);
    await page.goto("/");
    await expect(page.locator("h1")).toBeVisible();
    await assertThemeApplies(page);
    await assertNoBrokenImages(page); // card hero photos actually load (the presign/CDN path)
    expect(problems(), "no console/network errors on home").toEqual([]);
  });

  test("every published listing detail renders its invariants", async ({ page }) => {
    const paths = await discoverDetailPaths(page);
    test.skip(paths.length === 0, "no published listings");
    for (const detailPath of paths.slice(0, 6)) {
      const problems = watchForErrors(page);
      await page.goto(detailPath);
      await expect(page.locator("h1"), `detail h1 on ${detailPath}`).toBeVisible();
      await assertThemeApplies(page);
      await assertNoBrokenImages(page); // gallery photos load — catches the real S3 presign/IAM path
      expect(problems(), `no errors on ${detailPath}`).toEqual([]);
    }
  });

  test("empty result set renders a healthy empty state, not a 500", async ({ page }) => {
    const problems = watchForErrors(page);
    const res = await page.goto("/?q=zzqqx-no-such-listing-12345");
    expect(res?.status() ?? 0, "empty search must not 5xx").toBeLessThan(500);
    await assertThemeApplies(page);
    expect(problems(), "no errors on the empty state").toEqual([]);
  });
});
