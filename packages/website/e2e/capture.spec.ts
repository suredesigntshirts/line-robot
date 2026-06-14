import { test } from "@playwright/test";
import { capture, discoverDetailPaths } from "./support.ts";

// Capture a review GALLERY (no diff, no pass/fail on pixels). For each project (viewport × theme) it
// shoots the key screens the current data produces, into test-results/gallery/{project}-{screen}.png.
// An LLM/sub-agent then reviews these against docs/design/mockups + the heuristic register — this is
// qualitative design-alignment review, NOT pixel regression (deferred to design lock-in). Runs on
// every e2e run so the gallery is always fresh for the founder / a reviewing agent.

test("capture: home (browse)", async ({ page }, testInfo) => {
  await page.goto("/");
  await capture(page, "home", testInfo);
});

test("capture: home filtered to rent", async ({ page }, testInfo) => {
  await page.goto("/?deal=rent");
  await capture(page, "home-rent", testInfo);
});

test("capture: listing detail", async ({ page }, testInfo) => {
  const paths = await discoverDetailPaths(page);
  test.skip(paths.length === 0, "no published listings to capture");
  await page.goto(paths[0]);
  await capture(page, "detail", testInfo);
});

test("capture: empty state", async ({ page }, testInfo) => {
  await page.goto("/?q=zzqqx-no-such-listing-12345");
  await capture(page, "empty", testInfo);
});
