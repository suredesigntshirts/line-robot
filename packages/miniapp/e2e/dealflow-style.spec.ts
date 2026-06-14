import { expect, type Page, test } from "@playwright/test";
import {
  assertColorScheme,
  assertCtaContrast,
  assertNoBrokenImages,
  assertThaiBodyLineHeight,
  assertThemeApplies,
  capture,
  DETAIL,
  mockApi,
  settle,
  watchForErrors,
} from "./support.ts";

// Stage-6 DEALFLOW STYLE gate. The realapi suite proves these surfaces FUNCTION; THIS static spec proves
// they're STYLED — it renders the new owner dealflow sections + the /quote screen + the member flag CTA
// with the real built artifact + the Stage-6 mock routes, then runs the deterministic computed-style
// invariants (theme-applies, colour-scheme flip, TH-07 Thai body line-height, WCAG-AA CTA contrast,
// no-broken-images) on EACH. Before this, the static `mockApi` had no interest/quotes routes, so the
// owner sections only ever rendered as accidental empty-states and `/quote/{id}` was never navigated —
// the markers (`data-cta-solid`/`data-th-content`) sat on unrendered surfaces. Now they're MEASURED:
//   - the quick-sale toggle + the member "สนใจประกาศนี้" CTA are `data-cta-solid` → contrast bites (incl. dark);
//   - the interest names + quote terms + section copy are `data-th-content` → TH-07 bites.
// Mobile light + dark (the dark project is not a tautology — assertColorScheme proves the surface flips).

/** The colour scheme this project renders (project names: mobile-light / mobile-dark). */
const schemeOf = (projectName: string): "light" | "dark" =>
  projectName.includes("dark") ? "dark" : "light";

/** Run the full deterministic invariant set on whatever's currently rendered. */
async function assertStyledSurface(page: Page, projectName: string): Promise<void> {
  await settle(page);
  await assertThemeApplies(page);
  await assertColorScheme(page, schemeOf(projectName)); // dark project actually renders dark
  await assertThaiBodyLineHeight(page); // TH-07 on the new Thai bodies (interest names, quote terms…)
  await assertCtaContrast(page); // WCAG-AA on the new solid CTAs, light AND dark
  await assertNoBrokenImages(page);
}

test.describe("Stage-6 dealflow style gate", () => {
  test("the OWNER detail renders the interest list + quick-sale toggle + quotes section, themed", async ({
    page,
  }, testInfo) => {
    const problems = watchForErrors(page);
    // DETAIL is a SALE listing claimed-by-me → the owner dealflow sections all render: the populated
    // interest list + the quick-sale toggle (sale-only) + the populated quotes list (from the mock).
    await mockApi(page);

    await page.goto(`/p/${DETAIL.id}`);
    // The owner sections mounted with real data (these are the NEW surfaces the style net now measures).
    await expect(page.locator("[data-interest-list] [data-interest-card]")).toHaveCount(2);
    await expect(
      page.locator(`[data-quick-sale='${DETAIL.id}'] [data-quick-sale-toggle]`),
    ).toBeVisible();
    await expect(page.locator("[data-quotes-list] [data-quote-card]")).toHaveCount(2);

    await assertStyledSurface(page, testInfo.project.name);
    await capture(page, "dealflow-owner-detail", testInfo);
    expect(problems(), `console/network problems: ${problems().join("\n")}`).toEqual([]);
  });

  test("the quick-sale toggle, once active, renders the themed quick-sale badge (solid CTA gone)", async ({
    page,
  }) => {
    await mockApi(page);
    await page.goto(`/p/${DETAIL.id}`);
    const toggle = page.locator(`[data-quick-sale='${DETAIL.id}'] [data-quick-sale-toggle]`);
    await expect(toggle).toBeVisible();
    await toggle.click(); // real POST /quick-sale (mocked 200) → the active badge state
    await expect(
      page.locator(`[data-quick-sale='${DETAIL.id}'] [data-quick-sale-active]`),
    ).toBeVisible();
    // The active state is still themed Thai body text (TH-07 on the note) — measure it.
    await settle(page);
    await assertThemeApplies(page);
    await assertThaiBodyLineHeight(page);
  });

  test("the NON-owner detail renders the member 'สนใจประกาศนี้' flag CTA, contrast-safe", async ({
    page,
  }, testInfo) => {
    const problems = watchForErrors(page);
    // A NOT-claimed-by-me detail → the member flag-interest action renders (a SOLID data-cta-solid CTA).
    await mockApi(page, { detail: { ...DETAIL, isClaimedByMe: false } });

    await page.goto(`/p/${DETAIL.id}`);
    const flag = page.locator(`[data-interest-flag='${DETAIL.id}'] [data-flag-interest]`);
    await expect(flag).toBeVisible();

    await assertStyledSurface(page, testInfo.project.name); // the flag CTA's contrast bites here (incl. dark)
    await capture(page, "dealflow-member-detail", testInfo);
    expect(problems(), `console/network problems: ${problems().join("\n")}`).toEqual([]);
  });

  test("the member flag CTA, once tapped, renders the themed 'noted' confirmation", async ({
    page,
  }) => {
    await mockApi(page, { detail: { ...DETAIL, isClaimedByMe: false } });
    await page.goto(`/p/${DETAIL.id}`);
    const flag = page.locator(`[data-interest-flag='${DETAIL.id}'] [data-flag-interest]`);
    await flag.click(); // real POST /interest (mocked 201) → the optimistic noted state
    await expect(
      page.locator(`[data-interest-flag='${DETAIL.id}'] [data-interest-flagged]`),
    ).toBeVisible();
    await settle(page);
    await assertThemeApplies(page);
    await assertThaiBodyLineHeight(page); // the noted-state Thai body copy is measured
  });

  test("the /quote/{id} screen renders the structured-offer form, themed, with a contrast-safe submit CTA", async ({
    page,
  }, testInfo) => {
    const problems = watchForErrors(page);
    await mockApi(page);

    await page.goto(`/quote/${DETAIL.id}`);
    // The quote screen mounted: the title + the form fields + the solid submit CTA (data-cta-solid).
    await expect(page.getByRole("heading", { name: "เสนอราคา" })).toBeVisible();
    await expect(page.locator("[data-quote-amount]")).toBeVisible();
    await expect(page.locator("[data-submit-quote]")).toBeVisible();

    await assertStyledSurface(page, testInfo.project.name); // the submit CTA's contrast bites here too
    await capture(page, "dealflow-quote-screen", testInfo);
    expect(problems(), `console/network problems: ${problems().join("\n")}`).toEqual([]);
  });

  test("the /quote/{id} success outcome renders themed, with a contrast-safe done CTA", async ({
    page,
  }, testInfo) => {
    await mockApi(page);
    await page.goto(`/quote/${DETAIL.id}`);
    await page.locator("[data-quote-amount]").fill("4500000");
    await page.locator("[data-submit-quote]").click(); // real POST /quotes (mocked 201) → the outcome
    await expect(page.getByRole("heading", { name: "ส่งข้อเสนอแล้ว" })).toBeVisible();
    await settle(page);
    await assertThemeApplies(page);
    await assertColorScheme(page, schemeOf(testInfo.project.name));
    await assertThaiBodyLineHeight(page);
    await assertCtaContrast(page); // the Outcome's solid done CTA
  });
});
