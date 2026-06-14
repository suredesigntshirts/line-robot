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
  settle,
  watchForErrors,
} from "./support.ts";

// The LIFF-SPA frontend gate for the Stage-5 CLAIM flow (Build C). Renders the REAL built SPA at the
// additive `/claim/{id}` route with a MOCKED LIFF context + a MOCKED api (the claim/publish POSTs are
// fulfilled by page.route). Asserts the deterministic invariants (theme/TH-07/contrast/colorScheme/no-
// broken-images/no-JS-errors) on the claim screen AND drives the publish + keep-private + 409 paths.

const schemeOf = (projectName: string): "light" | "dark" =>
  projectName.includes("dark") ? "dark" : "light";

/** The claim flow starts at the REVIEW step only when the listing isn't already claimed by the caller
 * (the shared DETAIL fixture is `isClaimedByMe: true`). */
const UNCLAIMED = { ...DETAIL, isClaimedByMe: false };

test.describe("claim flow — frontend gate", () => {
  test("the review step renders the extracted listing, themed, with a contrast-safe claim CTA", async ({
    page,
  }, testInfo) => {
    const problems = watchForErrors(page);
    const { tokensSeen } = await mockApi(page, { detail: UNCLAIMED });

    await page.goto(`/claim/${DETAIL.id}`);
    // Hydration: the claim screen title + the bot-extracted listing headline render after the fetch.
    await expect(page.getByRole("heading", { name: "ตรวจสอบประกาศ" })).toBeVisible();
    await expect(page.getByText(DETAIL.headline)).toBeVisible();
    await expect(page.getByText("อ้างสิทธิ์ประกาศนี้ →")).toBeVisible();
    await settle(page);

    expect(tokensSeen.length, "the api was called").toBeGreaterThan(0);
    expect(
      tokensSeen.every((t) => t === "e2e.fixture.id-token"),
      "every call sent the id-token",
    ).toBe(true);

    await assertThemeApplies(page);
    await assertColorScheme(page, schemeOf(testInfo.project.name));
    await assertThaiBodyLineHeight(page);
    await assertCtaContrast(page); // the solid claim CTA — verified in BOTH modes
    await assertNoBrokenImages(page);

    await capture(page, "claim-review", testInfo);
    expect(problems(), `console/network problems: ${problems().join("\n")}`).toEqual([]);
  });

  test("claim → publish: the decision step then the public-success outcome (writes hit the api)", async ({
    page,
  }, testInfo) => {
    const problems = watchForErrors(page);
    const { writes } = await mockApi(page, { detail: UNCLAIMED });

    await page.goto(`/claim/${DETAIL.id}`);
    await page.getByText("อ้างสิทธิ์ประกาศนี้ →").click();

    // The visibility decision renders, including the group-private boundary copy "เฉพาะสมาชิกกลุ่มเดิม"
    // (the option subtitle — `exact` so it doesn't also match the "เห็นเฉพาะสมาชิกกลุ่มเดิม" feature line).
    await expect(page.getByText("อ้างสิทธิ์สำเร็จแล้ว")).toBeVisible();
    await expect(page.getByText("เลือกการมองเห็น")).toBeVisible();
    await expect(page.getByText("เฉพาะสมาชิกกลุ่มเดิม", { exact: true })).toBeVisible();
    await settle(page);
    // The decision step is contrast/TH-07 clean too.
    await assertThaiBodyLineHeight(page);
    await assertCtaContrast(page);
    await capture(page, "claim-decide", testInfo);

    // Publish → the public-success outcome.
    await page.getByRole("button", { name: /เผยแพร่สาธารณะเลย/ }).click();
    await expect(page.getByRole("heading", { name: "เผยแพร่สาธารณะแล้ว" })).toBeVisible();
    await assertCtaContrast(page);
    await capture(page, "claim-published", testInfo);

    expect(writes).toContain(`POST /properties/${DETAIL.id}/claim`);
    expect(writes).toContain(`POST /properties/${DETAIL.id}/publish`);
    expect(problems(), `console/network problems: ${problems().join("\n")}`).toEqual([]);
  });

  test("claim → keep-private: the group-private outcome", async ({ page }) => {
    const { writes } = await mockApi(page, { detail: UNCLAIMED });

    await page.goto(`/claim/${DETAIL.id}`);
    await page.getByText("อ้างสิทธิ์ประกาศนี้ →").click();
    await expect(page.getByText("เลือกการมองเห็น")).toBeVisible();

    await page.getByRole("button", { name: /เก็บไว้เฉพาะกลุ่มก่อน/ }).click();
    await expect(page.getByRole("heading", { name: "เก็บไว้เฉพาะกลุ่มแล้ว" })).toBeVisible();
    expect(writes).toContain(`POST /properties/${DETAIL.id}/keep-private`);
  });

  test("the concurrent-claim loser (409) sees a clear already-claimed message, not the publish choice", async ({
    page,
  }, testInfo) => {
    await mockApi(page, { detail: UNCLAIMED, claimStatus: 409 });

    await page.goto(`/claim/${DETAIL.id}`);
    await page.getByText("อ้างสิทธิ์ประกาศนี้ →").click();

    // The loser is told it's already claimed (+ why) and given a way back — NEVER the publish choice.
    await expect(page.getByRole("heading", { name: "ประกาศนี้ถูกอ้างสิทธิ์แล้ว" })).toBeVisible();
    await expect(page.getByText(/ถูกอ้างสิทธิ์โดยสมาชิกกลุ่มท่านอื่น/)).toBeVisible();
    await expect(page.getByText("เลือกการมองเห็น")).toHaveCount(0);
    // The message + its CTA are themed + contrast-safe (it's a real screen, not a toast).
    await assertThemeApplies(page);
    await assertThaiBodyLineHeight(page);
    await assertCtaContrast(page);
    await capture(page, "claim-already-claimed", testInfo);
  });
});
