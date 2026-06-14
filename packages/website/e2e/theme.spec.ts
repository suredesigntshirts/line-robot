import { expect, test } from "@playwright/test";
import {
  assertCtaContrast,
  assertThaiBodyLineHeight,
  assertThemeApplies,
  discoverDetailPaths,
} from "./support.ts";

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

  test("oklch/old-Android fallback ships hex tokens under @supports not(oklch) (TECH-06)", async ({
    page,
    request,
  }) => {
    // Tailwind compiles @theme to oklch() unconditionally; pre-Chrome-111 Thai Android WebViews
    // can't parse oklch and would render unstyled. The fallback restates the colour tokens as hex
    // inside `@supports not (color: oklch())` (inert on modern browsers, applied on old ones). A
    // modern browser can't EXERCISE that branch, so we assert the served CSS SHIPS it — the net
    // that bites if a future change drops the fallback import or regenerates it empty. BLOCKER.
    await page.goto("/");
    const hrefs = await page
      .locator('link[rel="stylesheet"]')
      .evaluateAll((els) => els.map((e) => (e as HTMLLinkElement).href));
    expect(hrefs.length, "page must ship at least one stylesheet").toBeGreaterThan(0);
    let css = "";
    for (const href of hrefs) css += await (await request.get(href)).text();
    expect(css, "must ship a @supports not(oklch) fallback block").toMatch(
      /@supports\s+not\s*\(\s*color\s*:\s*oklch/,
    );
    // After Phase 1 the ONLY hex colour declarations are inside that fallback block (Tailwind emits
    // oklch everywhere else), so a hex --color-bg / --color-primary-500 is proof the net is present.
    expect(css, "fallback must restate --color-bg as hex").toMatch(/--color-bg:\s*#[0-9a-fA-F]{6}/);
    expect(css, "fallback must restate --color-primary-500 as hex").toMatch(
      /--color-primary-500:\s*#[0-9a-fA-F]{6}/,
    );
  });

  test("Thai body text in listing cards renders line-height >= 1.6 (TH-07)", async ({ page }) => {
    await page.goto("/");
    await assertThaiBodyLineHeight(page);
  });

  // The state pages carry data-th-content; visit them so the invariant actually runs there (a marker
  // that no test exercises is inert — that gap is exactly what this closes).
  test("Thai body text in the empty state renders line-height >= 1.6 (TH-07)", async ({ page }) => {
    await page.goto("/?q=zzqqx-no-such-listing-12345");
    await assertThaiBodyLineHeight(page);
  });

  test("Thai body text on the 404 page renders line-height >= 1.6 (TH-07)", async ({ page }) => {
    await page.goto("/this-path-does-not-exist-404-xyz");
    await assertThaiBodyLineHeight(page);
  });

  test("filled CTAs keep WCAG-AA contrast in this colour scheme (incl. dark)", async ({ page }) => {
    await page.goto("/");
    await assertCtaContrast(page);
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
