import { expect, test } from "@playwright/test";
import {
  assertColorScheme,
  assertCtaContrast,
  assertNoBrokenImages,
  assertThaiBodyLineHeight,
  assertThemeApplies,
  capture,
  DETAIL,
  mockApi,
  NOTES,
  SAVED,
  settle,
  VIEWINGS,
  watchForErrors,
} from "./support.ts";

// The LIFF-SPA frontend gate for the Stage-5 per-user CRM (Build D — D13). Renders the REAL built SPA
// with a MOCKED LIFF context + a MOCKED api (page.route fixtures) and drives: the saved tab (cards), the
// viewings tab (upcoming/past sections), save/unsave on the detail, create-viewing (picker → POST),
// notes (list + add + empty validation), and the owner edit form (fields → PATCH; the 404/400 paths).
// Each new screen is asserted against the deterministic invariants (theme/TH-07/contrast/colorScheme/no-
// broken-images/no-JS-errors) so an unstyled or low-contrast regression can't pass.

const schemeOf = (projectName: string): "light" | "dark" =>
  projectName.includes("dark") ? "dark" : "light";

test.describe("CRM — saved tab", () => {
  test("the saved tab renders the saved cards, themed, with no broken images", async ({
    page,
  }, testInfo) => {
    const problems = watchForErrors(page);
    const { tokensSeen } = await mockApi(page);

    await page.goto("/");
    await page.getByRole("tab", { name: "บันทึกไว้" }).click();
    // Hydration: the saved list mounts + renders one card per saved listing.
    await expect(page.locator("[data-saved-list] [data-listing-card]")).toHaveCount(SAVED.length);
    await settle(page);

    expect(
      tokensSeen.every((t) => t === "e2e.fixture.id-token"),
      "every call sent the id-token",
    ).toBe(true);

    await assertThemeApplies(page);
    await assertColorScheme(page, schemeOf(testInfo.project.name));
    await assertThaiBodyLineHeight(page);
    await assertNoBrokenImages(page);

    await capture(page, "saved", testInfo);
    expect(problems(), `console/network problems: ${problems().join("\n")}`).toEqual([]);
  });

  test("an empty saved set shows the themed saved empty-state", async ({ page }) => {
    await mockApi(page, { saved: [] });
    await page.goto("/");
    await page.getByRole("tab", { name: "บันทึกไว้" }).click();
    await expect(page.locator("[data-state='empty-saved']")).toBeVisible();
    await assertThemeApplies(page);
    await assertThaiBodyLineHeight(page);
  });
});

test.describe("CRM — viewings tab", () => {
  test("the viewings tab renders the upcoming + past sections, each with its viewing cards", async ({
    page,
  }, testInfo) => {
    const problems = watchForErrors(page);
    await mockApi(page);

    await page.goto("/");
    await page.getByRole("tab", { name: "นัดดูทรัพย์" }).click();
    // Both sections hydrate with the fixture split.
    await expect(
      page.locator("[data-viewings-section='upcoming'] [data-viewing-card]"),
    ).toHaveCount(VIEWINGS.upcoming.length);
    await expect(page.locator("[data-viewings-section='past'] [data-viewing-card]")).toHaveCount(
      VIEWINGS.past.length,
    );
    await settle(page);

    await assertThemeApplies(page);
    await assertColorScheme(page, schemeOf(testInfo.project.name));
    await assertThaiBodyLineHeight(page);

    await capture(page, "viewings", testInfo);
    expect(problems(), `console/network problems: ${problems().join("\n")}`).toEqual([]);
  });
});

test.describe("CRM — save/unsave on the detail", () => {
  test("tapping the bookmark toggles it and POSTs the save (the write hits the api)", async ({
    page,
  }) => {
    const { writes } = await mockApi(page);
    await page.goto(`/p/${DETAIL.id}`);
    const toggle = page.locator(`[data-save-toggle='${DETAIL.id}']`);
    await expect(toggle).toHaveAttribute("data-saved", "false");
    await toggle.click();
    await expect(toggle).toHaveAttribute("data-saved", "true");
    expect(writes).toContain(`POST /properties/${DETAIL.id}/save`);
  });
});

test.describe("CRM — book a viewing from the detail", () => {
  test("the picker → POST creates a viewing and shows the confirmation", async ({
    page,
  }, testInfo) => {
    const { writes } = await mockApi(page);
    await page.goto(`/p/${DETAIL.id}`);

    await page.locator(`[data-book-viewing='${DETAIL.id}']`).click();
    const input = page.locator("[data-viewing-input]");
    await expect(input).toBeVisible();
    // A future local datetime (the input is local wall-clock; the SPA converts to an absolute ISO).
    await input.fill("2030-12-31T10:00");
    await page.getByText("ยืนยันนัดดู").click();

    await expect(page.locator("[data-viewing-created]")).toBeVisible();
    expect(writes).toContain(`POST /properties/${DETAIL.id}/viewings`);

    await settle(page);
    await assertThaiBodyLineHeight(page);
    await capture(page, "viewing-created", testInfo);
  });

  test("a server 400 (invalid_time) surfaces a calm field error, no confirmation", async ({
    page,
  }) => {
    await mockApi(page, { createViewingStatus: 400 });
    await page.goto(`/p/${DETAIL.id}`);
    await page.locator(`[data-book-viewing='${DETAIL.id}']`).click();
    await page.locator("[data-viewing-input]").fill("2030-12-31T10:00");
    await page.getByText("ยืนยันนัดดู").click();
    await expect(page.locator("[data-viewing-error]")).toBeVisible();
    await expect(page.locator("[data-viewing-created]")).toHaveCount(0);
  });
});

test.describe("CRM — notes on the detail", () => {
  test("the notes list renders the caller's notes; adding one POSTs + prepends it", async ({
    page,
  }, testInfo) => {
    const { writes } = await mockApi(page);
    await page.goto(`/p/${DETAIL.id}`);

    await expect(page.locator("[data-note-card]")).toHaveCount(NOTES.length);
    await page.locator("[data-note-input]").fill("นัดเจ้าของวันเสาร์ 10 โมง");
    await page.locator("[data-add-note]").click();

    await expect(page.locator("[data-note-card]")).toHaveCount(NOTES.length + 1);
    expect(writes).toContain(`POST /properties/${DETAIL.id}/notes`);

    await settle(page);
    await assertThaiBodyLineHeight(page); // the note bodies are Thai body text
    await capture(page, "notes", testInfo);
  });

  test("an EMPTY note is blocked client-side with a field error (no POST)", async ({ page }) => {
    const { writes } = await mockApi(page);
    await page.goto(`/p/${DETAIL.id}`);
    await expect(page.locator("[data-note-input]")).toBeVisible();
    // Click add with the input left blank.
    await page.locator("[data-add-note]").click();
    await expect(page.locator("[data-note-error]")).toBeVisible();
    expect(writes.some((w) => w.includes("/notes"))).toBe(false);
  });
});

test.describe("CRM — owner edit surface", () => {
  test("the edit form renders the owner's fields, themed, and PATCHes on submit", async ({
    page,
  }, testInfo) => {
    const problems = watchForErrors(page);
    const { writes } = await mockApi(page);

    await page.goto(`/edit/${DETAIL.id}`);
    await expect(page.locator(`[data-edit-form='${DETAIL.id}']`)).toBeVisible();
    // A sale listing exposes the sale-price field, not the monthly-rent one.
    await expect(page.getByText("ราคาขาย (บาท)")).toBeVisible();
    await expect(page.getByText("ค่าเช่า/เดือน (บาท)")).toHaveCount(0);
    await settle(page);

    await assertThemeApplies(page);
    await assertColorScheme(page, schemeOf(testInfo.project.name));
    await assertThaiBodyLineHeight(page);
    await assertCtaContrast(page); // the solid save CTA — both modes
    await capture(page, "edit", testInfo);

    // Submit → PATCH → the saved outcome.
    await page.locator("[data-save-edit]").click();
    await expect(page.getByRole("heading", { name: "บันทึกการแก้ไขแล้ว" })).toBeVisible();
    expect(writes).toContain(`PATCH /properties/${DETAIL.id}`);
    await assertCtaContrast(page);
    await capture(page, "edit-saved", testInfo);

    expect(problems(), `console/network problems: ${problems().join("\n")}`).toEqual([]);
  });

  test("a 404 PATCH (non-claimant) shows the not-owner message, not the success outcome", async ({
    page,
  }) => {
    await mockApi(page, { editStatus: 404 });
    await page.goto(`/edit/${DETAIL.id}`);
    await expect(page.locator(`[data-edit-form='${DETAIL.id}']`)).toBeVisible();
    await page.locator("[data-save-edit]").click();
    await expect(page.getByRole("heading", { name: "บันทึกไม่สำเร็จ" })).toBeVisible();
    await expect(page.getByText("คุณไม่มีสิทธิ์แก้ไขประกาศนี้ หรือประกาศไม่พบ")).toBeVisible();
    await expect(page.getByRole("heading", { name: "บันทึกการแก้ไขแล้ว" })).toHaveCount(0);
    await assertThaiBodyLineHeight(page);
  });

  test("the my-listings card edit entry navigates to the edit surface", async ({ page }) => {
    await mockApi(page);
    await page.goto("/");
    await page.locator("[data-edit-listing]").first().click();
    await expect(page).toHaveURL(/\/edit\//);
    await expect(page.locator("[data-edit-form]")).toBeVisible();
  });
});
