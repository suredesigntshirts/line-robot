import { expect, type Page, test } from "@playwright/test";
import {
  assertColorScheme,
  assertCtaContrast,
  assertNoBrokenImages,
  assertThaiBodyLineHeight,
  assertThemeApplies,
  capture,
  mockApi,
  settle,
  watchForErrors,
} from "./support.ts";

// Stage-6 ADMIN + APPLY STYLE gate (INC-B3b). The realapi suite proves these surfaces FUNCTION; THIS
// static spec proves they're STYLED — it renders the role-application form + the two admin queues with
// the real built artifact + the Stage-6 mock routes, then runs the deterministic computed-style
// invariants (theme-applies, colour-scheme flip, TH-07 Thai body line-height, WCAG-AA CTA contrast,
// no-broken-images) on EACH. The new markers are MEASURED:
//   - the apply submit + the queue approve buttons are `data-cta-solid` → contrast bites (incl. dark);
//   - the applicant names, the moderation headlines/reasons, the form copy are `data-th-content` → TH-07 bites.
// Mobile light + dark (the dark project proves the surface flips via assertColorScheme).

const schemeOf = (projectName: string): "light" | "dark" =>
  projectName.includes("dark") ? "dark" : "light";

async function assertStyledSurface(page: Page, projectName: string): Promise<void> {
  await settle(page);
  await assertThemeApplies(page);
  await assertColorScheme(page, schemeOf(projectName));
  await assertThaiBodyLineHeight(page);
  await assertCtaContrast(page);
  await assertNoBrokenImages(page);
}

test.describe("Stage-6 apply + admin style gate", () => {
  test("the /apply role-application form renders themed, with a contrast-safe submit CTA", async ({
    page,
  }, testInfo) => {
    const problems = watchForErrors(page);
    await mockApi(page);

    await page.goto("/apply");
    await expect(page.locator("[data-apply-form]")).toBeVisible();
    // The role choice + every preference axis rendered (the chips carry Thai labels).
    await expect(page.locator("[data-apply-role='broker']")).toBeVisible();
    await expect(page.locator("[data-apply-pref='provinces']")).toBeVisible();
    await expect(page.locator("[data-apply-pref='property-types']")).toBeVisible();
    await expect(page.locator("[data-apply-pref='price-bands']")).toBeVisible();
    await expect(page.locator("[data-apply-submit]")).toBeVisible();

    await assertStyledSurface(page, testInfo.project.name); // the submit CTA's contrast bites here
    await capture(page, "apply-form", testInfo);
    expect(problems(), `console/network problems: ${problems().join("\n")}`).toEqual([]);
  });

  test("the /apply submit success outcome renders themed, with a contrast-safe done CTA", async ({
    page,
  }, testInfo) => {
    await mockApi(page);
    await page.goto("/apply");
    await page.locator("[data-apply-pref='provinces'] [data-chip='เชียงใหม่']").click();
    await page.locator("[data-apply-submit]").click(); // real POST /me/role-application (mocked 201)
    await expect(page.getByRole("heading", { name: "ส่งใบสมัครแล้ว" })).toBeVisible();
    await settle(page);
    await assertThemeApplies(page);
    await assertColorScheme(page, schemeOf(testInfo.project.name));
    await assertThaiBodyLineHeight(page);
    await assertCtaContrast(page); // the Outcome's solid done CTA
  });

  test("the /admin/vetting queue renders the pending applications, themed + contrast-safe", async ({
    page,
  }, testInfo) => {
    const problems = watchForErrors(page);
    await mockApi(page); // adminStatus defaults to 200 → the queue renders (an admin)

    await page.goto("/admin/vetting");
    await expect(page.locator("[data-admin-queue]")).toBeVisible();
    await expect(page.locator("[data-admin-row]")).toHaveCount(2);
    // The approve/reject CTAs render (the solid approve is data-cta-solid → measured).
    await expect(
      page.locator("[data-admin-row]").first().locator("[data-resolve='approved']"),
    ).toBeVisible();

    await assertStyledSurface(page, testInfo.project.name);
    await capture(page, "admin-vetting", testInfo);
    expect(problems(), `console/network problems: ${problems().join("\n")}`).toEqual([]);
  });

  test("a vetting row, once approved, renders the themed SUCCESS 'approved' note", async ({
    page,
  }) => {
    await mockApi(page);
    await page.goto("/admin/vetting");
    const row = page.locator("[data-admin-row]").first();
    await row.locator("[data-resolve='approved']").click(); // real POST (mocked 200) → the resolved note
    // Assert the SUCCESS note TEXT (not just a `[data-resolved]` node) — a failed POST does NOT resolve
    // the row (buttons stay + a red error), so this bites on a regression.
    await expect(row.locator("[data-resolved]")).toHaveText(/อนุมัติแล้ว/);
    await settle(page);
    await assertThemeApplies(page);
    await assertThaiBodyLineHeight(page);
  });

  test("a FAILED approve (server 500) keeps the buttons + shows a red inline error — NOT a green ✓", async ({
    page,
  }) => {
    // A transient resolve failure (non-409) must NOT resolve the row to a green "✓ failed" note: the
    // buttons STAY (so the admin can retry) and a red inline error shows. This is the INC-B3b bug fix.
    await mockApi(page, { resolveStatus: 500 });
    await page.goto("/admin/vetting");
    const row = page.locator("[data-admin-row]").first();
    await row.locator("[data-resolve='approved']").click();
    // The red inline error appears; the buttons remain; NO green success note.
    await expect(row.locator("[data-resolve-error]")).toBeVisible();
    await expect(row.locator("[data-resolve='approved']")).toBeVisible(); // retry still possible
    await expect(row.locator("[data-resolved]")).toHaveCount(0); // never a green ✓ on failure
    await settle(page);
    await assertThemeApplies(page);
    await assertThaiBodyLineHeight(page);
  });

  test("the /admin/moderation queue renders the pending gate-failed listings, themed + contrast-safe", async ({
    page,
  }, testInfo) => {
    const problems = watchForErrors(page);
    await mockApi(page);

    await page.goto("/admin/moderation");
    await expect(page.locator("[data-admin-queue]")).toBeVisible();
    await expect(page.locator("[data-admin-row]")).toHaveCount(2);
    await expect(
      page.locator("[data-admin-row]").first().locator("[data-resolve='approved']"),
    ).toBeVisible();

    await assertStyledSurface(page, testInfo.project.name);
    await capture(page, "admin-moderation", testInfo);
    expect(problems(), `console/network problems: ${problems().join("\n")}`).toEqual([]);
  });

  test("a non-admin (server 404) renders the calm no-access state, themed — the queue data never renders", async ({
    page,
  }, testInfo) => {
    const problems = watchForErrors(page);
    // adminStatus 404 simulates the server gating a non-admin → the UI's no-access state.
    await mockApi(page, { adminStatus: 404 });

    await page.goto("/admin/vetting");
    await expect(page.locator("[data-state='no-access']")).toBeVisible();
    await expect(page.locator("[data-admin-queue]")).toHaveCount(0);
    await expect(page.locator("[data-admin-row]")).toHaveCount(0);

    await settle(page);
    await assertThemeApplies(page);
    await assertColorScheme(page, schemeOf(testInfo.project.name));
    await assertThaiBodyLineHeight(page); // the no-access body copy is measured
    await capture(page, "admin-no-access", testInfo);
    // The 404 (the server gating the non-admin) is BY DESIGN — it logs a benign console "Failed to load
    // resource". Filter it; assert no OTHER (JS-error / 5xx) problems leaked.
    const unexpected = problems().filter((p) => !/404 \(Not Found\)/.test(p));
    expect(unexpected, `unexpected console/network problems: ${unexpected.join("\n")}`).toEqual([]);
  });
});
