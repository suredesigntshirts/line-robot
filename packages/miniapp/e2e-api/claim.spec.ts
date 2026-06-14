import { expect, test } from "@playwright/test";
import { forwardApi, seedIds, settle, watchForErrors } from "./support.ts";

// REAL-BACKEND claim/publish round-trips (INC-2). The SPA drives the actual `/claim/{id}` flow against
// the real `handleApi` + a seeded Postgres; after each mutation we RE-FETCH the api (via the SPA's own
// network, re-mounting My Listings or the detail) and assert the REAL persisted state changed — the
// optimistic lock, the publish→consent grant, and the keep-private→consent withdrawal. The static gate
// can only assert the optimistic UI against canned bodies; this proves persistence.
//
// The lifecycle badge (`[data-lifecycle]`) on the My-listings card is the publish-state surface: an
// available sale renders `active` when published, `draft` when claimed-but-not-published — derived from
// the api's `isPublished` (an active publish_consent row). So a re-mounted `data-lifecycle` IS the
// round-tripped consent state.

test.describe("real-backend claim flow", () => {
  test("claim → publish: the listing becomes published and shows ACTIVE on My Listings (real consent)", async ({
    page,
  }) => {
    const problems = watchForErrors(page);
    const { tokensSeen } = await forwardApi(page);
    const ids = await seedIds(page);
    const id = ids.listings.claimable;

    // Drive the real claim flow: review → claim → decide → publish.
    await page.goto(`/claim/${id}`);
    await expect(page.getByRole("heading", { name: "ตรวจสอบประกาศ" })).toBeVisible();
    await page.getByText("อ้างสิทธิ์ประกาศนี้ →").click();
    await expect(page.getByText("เลือกการมองเห็น")).toBeVisible(); // claim actually succeeded (real lock)
    await page.getByRole("button", { name: /เผยแพร่สาธารณะเลย/ }).click();
    await expect(page.getByRole("heading", { name: "เผยแพร่สาธารณะแล้ว" })).toBeVisible();

    // RE-FETCH through the SPA: re-mount My Listings (a fresh `GET /me/listings`) — the claimed listing
    // is now present AND published (lifecycle `active`). This bites only if claim+publish PERSISTED.
    await page.goto("/");
    const card = page.locator(`[data-listing-card='${id}']`);
    await expect(card).toBeVisible(); // the claim persisted → it's now one of MY listings
    await expect(card.locator("[data-lifecycle]")).toHaveAttribute("data-lifecycle", "active");

    expect(tokensSeen.length, "the api was called").toBeGreaterThan(0);
    expect(
      tokensSeen.every((t) => t === "e2e.fixture.id-token"),
      "every call sent the fixture id-token",
    ).toBe(true);
    await settle(page);
    expect(problems(), `console/network problems: ${problems().join("\n")}`).toEqual([]);
  });

  test("keep-private: a PUBLISHED listing's consent is WITHDRAWN → it shows DRAFT on My Listings", async ({
    page,
  }) => {
    await forwardApi(page);
    const ids = await seedIds(page);
    const id = ids.listings.published; // already claimed-by-me AND published (seeded consent)

    // Sanity: it starts ACTIVE (published) on My Listings — the pre-state the mutation must change.
    await page.goto("/");
    await expect(page.locator(`[data-listing-card='${id}'] [data-lifecycle]`)).toHaveAttribute(
      "data-lifecycle",
      "active",
    );

    // /claim/{id} on an already-claimed-by-me listing jumps straight to the decide step → keep-private.
    await page.goto(`/claim/${id}`);
    await expect(page.getByText("เลือกการมองเห็น")).toBeVisible();
    await page.getByRole("button", { name: /เก็บไว้เฉพาะกลุ่มก่อน/ }).click();
    await expect(page.getByRole("heading", { name: "เก็บไว้เฉพาะกลุ่มแล้ว" })).toBeVisible();

    // RE-FETCH: the consent was withdrawn → the card now renders DRAFT (real consent state changed).
    await page.goto("/");
    await expect(page.locator(`[data-listing-card='${id}'] [data-lifecycle]`)).toHaveAttribute(
      "data-lifecycle",
      "draft",
    );
  });

  test("the concurrent-claim loser sees the real 409 already-claimed outcome", async ({ page }) => {
    await forwardApi(page);
    const ids = await seedIds(page);
    const id = ids.listings.claimedByOther; // already claimed by the OTHER seeded member

    await page.goto(`/claim/${id}`);
    await expect(page.getByRole("heading", { name: "ตรวจสอบประกาศ" })).toBeVisible();
    await page.getByText("อ้างสิทธิ์ประกาศนี้ →").click();

    // The REAL handler returns 409 (the optimistic lock found a non-null claimant) → the loser screen,
    // never the publish choice.
    await expect(page.getByRole("heading", { name: "ประกาศนี้ถูกอ้างสิทธิ์แล้ว" })).toBeVisible();
    await expect(page.getByText("เลือกการมองเห็น")).toHaveCount(0);
  });
});
