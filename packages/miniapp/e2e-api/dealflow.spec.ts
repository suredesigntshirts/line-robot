import { expect, test } from "@playwright/test";
import { forwardApi, loginAs, seedIds, settle, watchForErrors } from "./support.ts";

// REAL-BACKEND Stage-6 DEALFLOW round-trips (INC-B3). Each spec DRIVES the SPA interaction against the
// real `handleApi` + a seeded Postgres, switching the ACTIVE identity with `loginAs` (the LIFF mock
// reads the role's token; the stub verifier maps it → the seeded subject), then RE-FETCHES as a
// different role and asserts REAL cross-user persistence — exactly what a static, single-identity mock
// can't prove. Each BITES: breaking the feature/handler (drop the POST, drop the urgency persist, drop
// the quote insert) flips the owner's count back to 0 / the broker's submit to a 409.

test.describe("real-backend Stage-6 dealflow", () => {
  test("interest round-trip: a MEMBER flags interest → the OWNER sees them in ผู้สนใจ", async ({
    page,
  }) => {
    const problems = watchForErrors(page);
    const { tokensSeen } = await forwardApi(page);
    const ids = await seedIds(page);
    const id = ids.listings.mine; // claimed by the owner, in the group → a member can view + flag it

    // --- as the MEMBER: open the listing + flag interest (real POST /properties/{id}/interest) -------
    await loginAs(page, "member");
    await page.goto(`/p/${id}`);
    const flag = page.locator(`[data-interest-flag='${id}'] [data-flag-interest]`);
    await expect(flag).toBeVisible();
    await flag.click();
    // Optimistic "noted" state on success (the flag is idempotent + non-binding, D-S6-3).
    await expect(
      page.locator(`[data-interest-flag='${id}'] [data-interest-flagged]`),
    ).toBeVisible();

    // --- as the OWNER: re-open the listing → the ผู้สนใจ list now shows the member (real GET) --------
    // BITES: without the member's POST persisting, the owner's interest list is empty (count 0).
    await loginAs(page, "owner");
    await page.goto(`/p/${id}`);
    const list = page.locator("[data-interest-list]");
    await expect(list).toBeVisible();
    await expect(list.locator("[data-interest-card]")).toHaveCount(1);
    await expect(list.getByText("สมาชิกกลุ่ม")).toBeVisible(); // the member's display name

    // Every call carried a VALID fixture token (the member's then the owner's) — both admitted.
    expect(tokensSeen.length, "the api was called").toBeGreaterThan(0);
    expect(
      tokensSeen.every((t) => t === "e2e.token.member" || t === "e2e.fixture.id-token"),
      "every call sent a known role token",
    ).toBe(true);
    await settle(page);
    expect(problems(), `console/network problems: ${problems().join("\n")}`).toEqual([]);
  });

  test("quick-sale round-trip: the OWNER toggles quick-sale → it PERSISTS (a vetted broker can then quote)", async ({
    page,
  }) => {
    await forwardApi(page);
    const ids = await seedIds(page);
    const id = ids.listings.toToggle; // a SALE listing NOT yet quick-sale

    // SANITY: before the toggle, the listing isn't a quick-sale target — a broker's quote 409s
    // `not_quick_sale`. This is the pre-state the toggle must change (proves the round-trip bites).
    await loginAs(page, "broker");
    let res = await page.request.post(
      `http://localhost:${process.env.E2E_API_PORT || 4331}/__api/properties/${id}/quotes`,
      {
        headers: { authorization: "Bearer e2e.token.broker", "content-type": "application/json" },
        data: { amountThb: 4_000_000 },
        failOnStatusCode: false,
      },
    );
    expect(res.status(), "pre-toggle: a non-quick-sale listing rejects a quote 409").toBe(409);

    // --- as the OWNER: open the owned SALE listing + toggle quick-sale (real POST /quick-sale) -------
    await loginAs(page, "owner");
    await page.goto(`/p/${id}`);
    const toggle = page.locator(`[data-quick-sale='${id}'] [data-quick-sale-toggle]`);
    await expect(toggle).toBeVisible();
    await toggle.click();
    // The active quick-sale badge/state reflects the toggle.
    await expect(page.locator(`[data-quick-sale='${id}'] [data-quick-sale-active]`)).toBeVisible();

    // --- RE-FETCH the persisted state: a vetted broker's quote now SUCCEEDS (urgency='quick_sale'
    //     persisted server-side). BITES: without the toggle persisting, this stays a 409.
    await loginAs(page, "broker");
    res = await page.request.post(
      `http://localhost:${process.env.E2E_API_PORT || 4331}/__api/properties/${id}/quotes`,
      {
        headers: { authorization: "Bearer e2e.token.broker", "content-type": "application/json" },
        data: { amountThb: 4_000_000 },
        failOnStatusCode: false,
      },
    );
    expect(res.status(), "post-toggle: the quick-sale persisted → the quote is accepted 201").toBe(
      201,
    );
  });

  test("quote round-trip: a BROKER submits a quote → the OWNER sees it in ข้อเสนอ", async ({
    page,
  }) => {
    const problems = watchForErrors(page);
    await forwardApi(page);
    const ids = await seedIds(page);
    const id = ids.listings.quickSale; // a SALE listing pre-flagged quick_sale (an open quote target)
    const amountThb = 6_500_000;

    // --- as the OWNER (sanity): the ข้อเสนอ list starts empty (the pre-state the submit must change) --
    await loginAs(page, "owner");
    await page.goto(`/p/${id}`);
    await expect(page.locator("[data-quotes-list] [data-quotes-empty]")).toBeVisible();

    // --- as the BROKER: open /quote/{id} + submit a structured quote (real POST /properties/{id}/quotes)
    await loginAs(page, "broker");
    await page.goto(`/quote/${id}`);
    await expect(page.getByRole("heading", { name: "เสนอราคา" })).toBeVisible();
    await page.locator("[data-quote-amount]").fill(String(amountThb));
    await page.locator("[data-quote-discount]").fill("5");
    await page.locator("[data-quote-terms]").fill("ชำระเงินสด ปิดการขายภายใน 30 วัน");
    await page.locator("[data-submit-quote]").click();
    await expect(page.getByRole("heading", { name: "ส่งข้อเสนอแล้ว" })).toBeVisible();

    // --- as the OWNER: re-open the listing → the ข้อเสนอ list shows the broker's offer (real GET) ----
    // BITES: without the broker's submit persisting, the owner's quotes list is empty (count 0).
    await loginAs(page, "owner");
    await page.goto(`/p/${id}`);
    const quotes = page.locator("[data-quotes-list]");
    await expect(quotes.locator("[data-quote-card]")).toHaveCount(1);
    await expect(quotes.getByText(`เสนอ ฿${amountThb.toLocaleString("en-US")}`)).toBeVisible();

    await settle(page);
    // The broker's `GET /properties/{id}` 404s by design — a pushed broker need NOT be a group member,
    // so the detail (the optional summary card) isn't readable by them; the QuoteScreen renders the form
    // regardless and the SUBMIT is the gated authority. That expected 404 logs a benign console "Failed
    // to load resource" — filter it; assert no OTHER (JS-error / 5xx) problems leaked.
    const unexpected = problems().filter((p) => !/404 \(Not Found\)/.test(p));
    expect(unexpected, `unexpected console/network problems: ${unexpected.join("\n")}`).toEqual([]);
  });
});
