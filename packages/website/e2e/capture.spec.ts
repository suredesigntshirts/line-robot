import { test } from "@playwright/test";
import { capture, discoverDetailPaths } from "./support.ts";

// Capture a review GALLERY (no diff, no pass/fail on pixels). For each project (viewport × theme) it
// shoots the key screens the current data produces, into test-results/gallery/{project}-{screen}.png.
// An LLM/sub-agent then reviews these against handbook/design/mockups + the heuristic register — this is
// qualitative design-alignment review, NOT pixel regression (deferred to design lock-in). Runs on
// every e2e run so the gallery is always fresh for the founder / a reviewing agent.

test("capture: home", async ({ page }, testInfo) => {
  await page.goto("/");
  await capture(page, "home", testInfo);
});

test("capture: browse", async ({ page }, testInfo) => {
  await page.goto("/properties");
  await capture(page, "browse", testInfo);
});

test("capture: browse filtered to rent", async ({ page }, testInfo) => {
  await page.goto("/properties?deal=rent");
  await capture(page, "browse-rent", testInfo);
});

test("capture: listing detail", async ({ page }, testInfo) => {
  const paths = await discoverDetailPaths(page);
  test.skip(paths.length === 0, "no published listings to capture");
  await page.goto(paths[0]);
  await capture(page, "detail", testInfo);
});

test("capture: empty state", async ({ page }, testInfo) => {
  await page.goto("/properties?q=zzqqx-no-such-listing-12345");
  await capture(page, "empty", testInfo);
});

test("capture: browse variant b (rail + sheet, sheet open)", async ({ page }, testInfo) => {
  await page.goto("/properties?ui=browse:b&deal=sale");
  await capture(page, "browse-b", testInfo);
  await page.locator("[data-sheet-open]").first().click();
  await page.waitForTimeout(300);
  await page.screenshot({
    path: `${testInfo.outputDir}/../../gallery/${process.env.E2E_BASE_URL ? "deployed" : "local"}/${testInfo.project.name}-browse-b-sheet.png`,
  });
  await page.goto("/properties?ui=reset");
});

test("capture: browse variant c (toolbar)", async ({ page }, testInfo) => {
  await page.goto("/properties?ui=browse:c&deal=sale");
  await capture(page, "browse-c", testInfo);
  await page.goto("/properties?ui=reset");
});
