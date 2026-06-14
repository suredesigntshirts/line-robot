import { expect, test } from "@playwright/test";
import { assertThemeApplies, discoverDetailPaths } from "./support.ts";

// The TECH-06 net as INVARIANTS, not pixels — these survive theme churn (they check that a theme
// applies at all + the brand font is delivered + dark mode flips, never an exact colour/layout). Runs
// on the home page AND a discovered detail page so both layouts are covered against whatever data is
// published. This is the gate that catches an unstyled / theme-not-applying deploy; it's data-driven,
// so it runs identically against seeded test data (local) and live data (deployed).

test.describe("theme applies (TECH-06 net)", () => {
  test("tokens resolve + brand font on the home page", async ({ page }) => {
    await page.goto("/");
    await assertThemeApplies(page);
  });

  test("tokens resolve + brand font on a listing detail page", async ({ page }) => {
    const paths = await discoverDetailPaths(page);
    test.skip(paths.length === 0, "no published listings to open");
    await page.goto(paths[0]);
    await assertThemeApplies(page);
  });

  test("brand fonts are delivered via @font-face, not merely named in the stack", async ({
    page,
  }) => {
    await page.goto("/");
    await page.evaluate(() => document.fonts.ready);
    // document.fonts holds only @font-face-declared faces, NOT system fonts — the environment-
    // independent detector that the brand fonts are actually shipped.
    const families = await page.evaluate(() =>
      [...document.fonts].map((f) => f.family.replace(/["']/g, "")),
    );
    expect(families, "Sarabun must be delivered via @font-face").toContain("Sarabun");
    expect(families, "Noto Sans Thai must be delivered via @font-face").toContain("Noto Sans Thai");
  });

  test("dark mode flips the surface token by colour scheme", async ({ page }) => {
    await page.goto("/");
    const bgFor = async (scheme: "light" | "dark") => {
      await page.emulateMedia({ colorScheme: scheme });
      return page.evaluate(() =>
        getComputedStyle(document.documentElement).getPropertyValue("--color-bg").trim(),
      );
    };
    const light = await bgFor("light");
    const dark = await bgFor("dark");
    expect(light, "light --color-bg must resolve").not.toBe("");
    expect(dark, "dark --color-bg must resolve").not.toBe("");
    expect(dark, "dark mode must change the surface token").not.toBe(light);
  });
});
