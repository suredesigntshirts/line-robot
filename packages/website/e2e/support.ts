import fs from "node:fs";
import path from "node:path";
import { expect, type Page, type TestInfo } from "@playwright/test";

// Shared helpers for the data-driven e2e + visual-review suite (plan 20). The site is the DB's public
// projection, so discovering from the rendered page makes every spec adapt to whatever's published —
// seeded test data now, live/staging data later — with zero hardcoding and no DB coupling.

/** Ephemeral review gallery (gitignored). Filenames are self-describing ({project}-{screen}.png) so
 * a reviewing agent can list the dir and open exactly the screen it needs. NOT pixel baselines.
 * Namespaced by target (local vs deployed) so a deployed run never clobbers the local gallery a
 * review is reading (and vice-versa). */
export const GALLERY_DIR = `test-results/gallery/${process.env.E2E_BASE_URL ? "deployed" : "local"}`;

/** Wait for fonts + every image to finish, so invariants/screenshots aren't measured mid-load. */
export async function settle(page: Page): Promise<void> {
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all(
      [...document.images]
        .filter((img) => !img.complete)
        .map(
          (img) =>
            new Promise((r) => {
              img.addEventListener("load", r, { once: true });
              img.addEventListener("error", r, { once: true });
            }),
        ),
    );
  });
}

/** Discover listing detail paths from the rendered home page (deduped). Empty = nothing published. */
export async function discoverDetailPaths(page: Page, home = "/"): Promise<string[]> {
  await page.goto(home);
  await expect(page.locator("body")).toBeVisible();
  return page
    .locator('a[href*="/properties/"]')
    .evaluateAll((els) => [
      ...new Set(
        els
          .map((e) => (e as HTMLAnchorElement).getAttribute("href"))
          .filter((h): h is string => !!h),
      ),
    ]);
}

/** TECH-06 net as an INVARIANT (not pixels): the design tokens actually resolve at runtime and the
 * body isn't the unstyled serif fallback. Survives any theme change — it checks that a theme applies
 * at all, not what it looks like. */
export async function assertThemeApplies(page: Page): Promise<void> {
  const t = await page.evaluate(() => {
    const root = getComputedStyle(document.documentElement);
    const v = (n: string) => root.getPropertyValue(n).trim();
    return {
      primary: v("--color-primary-600"),
      bg: v("--color-bg"),
      spacing: v("--spacing-4"),
      bodyFont: getComputedStyle(document.body).fontFamily,
    };
  });
  expect(t.primary, "--color-primary-600 must resolve (theme applied)").not.toBe("");
  expect(t.bg, "--color-bg must resolve").not.toBe("");
  expect(t.spacing, "--spacing-4 must resolve").not.toBe("");
  expect(t.bodyFont, "body must use the brand font stack, not the serif fallback").toContain(
    "Sarabun",
  );
}

/** Every rendered image actually loaded — catches the presign/IAM/CDN image bugs that only appear
 * against real infra (locally the fake-S3 serves them; on deploy this checks the real S3 path). */
export async function assertNoBrokenImages(page: Page): Promise<void> {
  await settle(page);
  const broken = await page.evaluate(() =>
    [...document.images]
      .filter((i) => !i.complete || i.naturalWidth === 0)
      .map((i) => i.currentSrc || i.src),
  );
  expect(broken, `broken images: ${broken.join(", ")}`).toEqual([]);
}

/** Collect console errors + failed requests over a flow — catches JS errors, 500s, dead assets that
 * a structural string-check would miss. Returns a getter for the accumulated problems. */
export function watchForErrors(page: Page): () => string[] {
  const problems: string[] = [];
  page.on("console", (m) => m.type() === "error" && problems.push(`console: ${m.text()}`));
  page.on("pageerror", (e) => problems.push(`pageerror: ${e.message}`));
  page.on("requestfailed", (r) =>
    problems.push(`requestfailed: ${r.url()} ${r.failure()?.errorText ?? ""}`),
  );
  page.on("response", (r) => r.status() >= 500 && problems.push(`http ${r.status()}: ${r.url()}`));
  // Favicons/analytics noise we don't control can be filtered here if needed.
  return () => problems;
}

/** Capture a fullPage screenshot into the review gallery as {project}-{screen}.png and attach it to
 * the report. These are for an LLM to review against the design direction — never diffed. */
export async function capture(page: Page, screen: string, testInfo: TestInfo): Promise<string> {
  await settle(page);
  fs.mkdirSync(GALLERY_DIR, { recursive: true });
  const file = path.join(GALLERY_DIR, `${testInfo.project.name}-${screen}.png`);
  await page.screenshot({ path: file, fullPage: true });
  await testInfo.attach(`${screen} · ${testInfo.project.name}`, {
    path: file,
    contentType: "image/png",
  });
  return file;
}
