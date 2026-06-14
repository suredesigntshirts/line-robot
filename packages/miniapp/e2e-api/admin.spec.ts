import { expect, test } from "@playwright/test";
import { forwardApi, loginAs, seedIds, settle, watchForErrors } from "./support.ts";

// REAL-BACKEND Stage-6 ADMIN round-trips (INC-B3b). Each spec DRIVES the SPA against the real
// `handleApi` + a seeded Postgres, switching the ACTIVE identity with `loginAs` (the LIFF mock reads
// the role's token; the stub verifier maps it → the seeded subject), then RE-FETCHES as a different
// role and asserts REAL cross-user / server-authoritative behaviour. Each BITES: drop the role-app
// POST and the member never appears in the admin queue; drop the moderation resolve and the item stays
// pending; remove the server-side admin gate and a member would see the queue data (it does NOT).

const PORT = process.env.E2E_API_PORT || 4331;
const apiUrl = (path: string): string => `http://localhost:${PORT}/__api${path}`;

test.describe("real-backend Stage-6 admin", () => {
  test("role-application round-trip: a MEMBER applies as broker → an ADMIN sees + approves it → the MEMBER's status is approved", async ({
    page,
  }) => {
    const problems = watchForErrors(page);
    const { tokensSeen } = await forwardApi(page);
    await seedIds(page);

    // --- as the MEMBER: open /apply, submit a broker application with preferences (real POST) --------
    await loginAs(page, "member");
    await page.goto("/apply");
    await expect(page.getByRole("heading", { name: "สมัครเป็นนายหน้า/นักลงทุน" })).toBeVisible();
    // broker is the default role; pick a couple of preference chips, then submit.
    await page.locator("[data-apply-pref='provinces'] [data-chip='เชียงใหม่']").click();
    await page.locator("[data-apply-pref='property-types'] [data-chip='house']").click();
    await page.locator("[data-apply-submit]").click();
    // Fresh application (201) → the "submitted, under review" outcome.
    await expect(page.getByRole("heading", { name: "ส่งใบสมัครแล้ว" })).toBeVisible();

    // SANITY: the member's own status now reads pending (real GET /me/role-application).
    await loginAs(page, "member");
    await page.goto("/apply");
    await expect(page.locator("[data-apply-status='pending']")).toBeVisible();

    // --- as the ADMIN: the vetting queue shows the member's application → approve it (real POST) ------
    // BITES: without the member's POST persisting, the member's application is absent from the queue.
    await loginAs(page, "admin");
    await page.goto("/admin/vetting");
    await expect(page.locator("[data-admin-queue]")).toBeVisible();
    const memberRow = page.locator("[data-admin-row]").filter({ hasText: "สมาชิกกลุ่ม" });
    await expect(memberRow).toHaveCount(1);
    await memberRow.locator("[data-resolve='approved']").click();
    // The row resolves in place to the SUCCESS note — asserting the TEXT ("✓ อนุมัติแล้ว"), not just
    // that a `[data-resolved]` node exists: a FAILED approve (a non-409 throw) does NOT resolve the row
    // (the buttons stay + a red inline error shows), so this text bites on a regressed/failed POST.
    await expect(memberRow.locator("[data-resolved]")).toHaveText(/อนุมัติแล้ว/);

    // --- as the MEMBER: /apply now reports the APPROVED standing (real GET, post-approval) -----------
    // BITES: without the admin's approve persisting, this stays pending.
    await loginAs(page, "member");
    await page.goto("/apply");
    await expect(page.locator("[data-apply-status='approved']")).toBeVisible();

    expect(tokensSeen.length, "the api was called").toBeGreaterThan(0);
    expect(
      tokensSeen.every((t) => t === "e2e.token.member" || t === "e2e.token.admin"),
      "every call sent a known role token (member or admin)",
    ).toBe(true);
    await settle(page);
    expect(problems(), `console/network problems: ${problems().join("\n")}`).toEqual([]);
  });

  test("moderation round-trip: an ADMIN resolves a pending gate-failed listing → it leaves the pending queue", async ({
    page,
  }) => {
    const problems = watchForErrors(page);
    await forwardApi(page);
    const ids = await seedIds(page);

    // --- as the ADMIN: the moderation queue shows the seeded pending gate-failed listing -------------
    await loginAs(page, "admin");
    await page.goto("/admin/moderation");
    await expect(page.locator("[data-admin-queue]")).toBeVisible();
    const row = page.locator(`[data-admin-row='${ids.moderationItemId}']`);
    await expect(row).toBeVisible();
    await expect(row.getByText("ประกาศรอตรวจสอบคุณภาพ คอนโดใจกลางเมือง")).toBeVisible();

    // Resolve (approve) — RECORDS the decision (LEGAL-02: it does NOT publish). The row resolves.
    await row.locator("[data-resolve='approved']").click();
    await expect(row.locator("[data-resolved]")).toBeVisible();

    // --- RE-FETCH the pending set directly: the item is GONE from pending (status flipped server-side).
    // BITES: without the resolve persisting, the item stays in the pending list. Asserted at the API
    // layer (the canonical pending set) so a client-side optimistic remove can't fake it.
    const res = await page.request.get(apiUrl("/admin/moderation"), {
      headers: { authorization: "Bearer e2e.token.admin" },
    });
    expect(res.ok(), "the admin moderation list responds").toBeTruthy();
    const pending = (await res.json()) as Array<{ id: string }>;
    expect(
      pending.some((m) => m.id === ids.moderationItemId),
      "the resolved item must be gone from the pending set",
    ).toBe(false);

    await settle(page);
    expect(problems(), `console/network problems: ${problems().join("\n")}`).toEqual([]);
  });

  test("admin GATE is server-side: a MEMBER sees the no-access state; an ADMIN sees the queue (data never leaks)", async ({
    page,
  }) => {
    await forwardApi(page);
    await seedIds(page);

    // --- as the MEMBER: /admin/vetting renders the calm no-access state (the server 404s the non-admin).
    // The queue DATA never renders for the member — the gate is SERVER-side, not UI-pretend.
    await loginAs(page, "member");
    await page.goto("/admin/vetting");
    await expect(page.locator("[data-state='no-access']")).toBeVisible();
    await expect(page.locator("[data-admin-queue]")).toHaveCount(0);
    await expect(page.locator("[data-admin-row]")).toHaveCount(0);

    // PROVE the server (not the UI) blocked it: the member's RAW request to the admin endpoint 404s.
    const memberRes = await page.request.get(apiUrl("/admin/role-applications"), {
      headers: { authorization: "Bearer e2e.token.member" },
    });
    expect(memberRes.status(), "the server 404s a non-admin on the admin route").toBe(404);

    // --- as the ADMIN: the same route renders the queue (the gate admits the admin). BITES: were the
    //     gate UI-only, the member above would have rendered the queue too.
    await loginAs(page, "admin");
    await page.goto("/admin/vetting");
    await expect(page.locator("[data-admin-queue]")).toBeVisible();
    await expect(page.locator("[data-state='no-access']")).toHaveCount(0);

    const adminRes = await page.request.get(apiUrl("/admin/role-applications"), {
      headers: { authorization: "Bearer e2e.token.admin" },
    });
    expect(adminRes.status(), "the server admits the admin").toBe(200);
  });
});
