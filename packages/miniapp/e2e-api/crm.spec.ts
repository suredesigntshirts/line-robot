import { expect, test } from "@playwright/test";
import { forwardApi, seedIds, settle, watchForErrors } from "./support.ts";

// REAL-BACKEND CRM round-trips (INC-2). Each spec DRIVES the SPA interaction against the real
// `handleApi` + a seeded Postgres, then RE-FETCHES (re-mounting the tab/detail = a fresh real GET) and
// asserts REAL persistence — not the optimistic UI a static mock proves. Targets the seeded `mine`
// listing (claimed by the test user, so the detail/notes/viewings authz gate admits the caller).

test.describe("real-backend CRM", () => {
  test("save round-trip: saving on the detail makes the listing appear in the Saved tab", async ({
    page,
  }) => {
    const problems = watchForErrors(page);
    await forwardApi(page);
    const ids = await seedIds(page);
    const id = ids.listings.mine;

    // Saved is empty for this user at seed time — the tab shows the empty state.
    await page.goto("/");
    await page.getByRole("tab", { name: "บันทึกไว้" }).click();
    await expect(page.locator("[data-state='empty-saved']")).toBeVisible();

    // Save from the detail (real POST /properties/{id}/save).
    await page.goto(`/p/${id}`);
    const toggle = page.locator(`[data-save-toggle='${id}']`);
    await expect(toggle).toHaveAttribute("data-saved", "false");
    await toggle.click();
    await expect(toggle).toHaveAttribute("data-saved", "true");

    // RE-MOUNT the Saved tab → a fresh GET /me/saved → the listing now persists in the saved set.
    await page.goto("/");
    await page.getByRole("tab", { name: "บันทึกไว้" }).click();
    await expect(page.locator(`[data-saved-list] [data-listing-card='${id}']`)).toBeVisible();
    await expect(page.locator("[data-saved-list] [data-listing-card]")).toHaveCount(1);

    await settle(page);
    expect(problems(), `console/network problems: ${problems().join("\n")}`).toEqual([]);
  });

  test("create-viewing round-trip: a booked viewing appears in the Viewings upcoming section", async ({
    page,
  }) => {
    await forwardApi(page);
    const ids = await seedIds(page);
    const id = ids.listings.mine;

    // No viewings at seed time — the upcoming section is empty.
    await page.goto("/");
    await page.getByRole("tab", { name: "นัดดูทรัพย์" }).click();
    await expect(
      page.locator("[data-viewings-section='upcoming'] [data-viewing-card]"),
    ).toHaveCount(0);

    // Book a future viewing from the detail (real POST /properties/{id}/viewings; the FIXED `now` is
    // 2026-06-15, so a 2030 booking lands deterministically in "upcoming").
    await page.goto(`/p/${id}`);
    await page.locator(`[data-book-viewing='${id}']`).click();
    await page.locator("[data-viewing-input]").fill("2030-12-31T10:00");
    await page.getByText("ยืนยันนัดดู").click();
    await expect(page.locator("[data-viewing-created]")).toBeVisible();

    // RE-MOUNT the Viewings tab → fresh GET /me/viewings → the viewing persisted into upcoming.
    await page.goto("/");
    await page.getByRole("tab", { name: "นัดดูทรัพย์" }).click();
    await expect(
      page.locator("[data-viewings-section='upcoming'] [data-viewing-card]"),
    ).toHaveCount(1);
  });

  test("add-note round-trip: an added note persists and re-renders on a fresh detail mount", async ({
    page,
  }) => {
    await forwardApi(page);
    const ids = await seedIds(page);
    const id = ids.listings.mine;
    const noteText = "นัดเจ้าของวันเสาร์ 10 โมง ต่อรองราคาได้อีก";

    // No notes at seed time.
    await page.goto(`/p/${id}`);
    await expect(page.locator("[data-note-card]")).toHaveCount(0);
    await page.locator("[data-note-input]").fill(noteText);
    await page.locator("[data-add-note]").click();
    await expect(page.locator("[data-note-card]")).toHaveCount(1);

    // RE-MOUNT the detail → fresh GET /properties/{id}/notes → the note persisted.
    await page.goto(`/p/${id}`);
    await expect(page.locator("[data-note-card]")).toHaveCount(1);
    await expect(page.getByText(noteText)).toBeVisible();
  });

  test("edit PATCH allowlist round-trip: editing bedrooms persists and re-renders on the detail", async ({
    page,
  }) => {
    await forwardApi(page);
    const ids = await seedIds(page);
    const id = ids.listings.mine; // seeded bedrooms = 4

    // The detail's spec table shows the seeded bedroom count (4 → "4 นอน", the i18n format).
    await page.goto(`/p/${id}`);
    await expect(page.getByText("4 นอน")).toBeVisible();

    // Edit bedrooms 4 → 5 on the real edit surface (exercises the api's EDITABLE_INT_FIELDS allowlist
    // — the static mock NEVER touched the actual patch; here it must persist).
    await page.goto(`/edit/${id}`);
    await expect(page.locator(`[data-edit-form='${id}']`)).toBeVisible();
    const bedrooms = page.getByLabel("ห้องนอน");
    await expect(bedrooms).toHaveValue("4");
    await bedrooms.fill("5");
    await page.locator("[data-save-edit]").click();
    await expect(page.getByRole("heading", { name: "บันทึกการแก้ไขแล้ว" })).toBeVisible();

    // RE-FETCH the detail → the persisted bedroom count is now 5 (and the old 4 is gone).
    await page.goto(`/p/${id}`);
    await expect(page.getByText("5 นอน")).toBeVisible();
    await expect(page.getByText("4 นอน")).toHaveCount(0);
  });
});
