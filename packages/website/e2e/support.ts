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

/** Wait for fonts + every RENDERED image to finish, so invariants/screenshots aren't measured
 * mid-load. Scrolls through the page first so `loading="lazy"` images below the fold actually start
 * (a fullPage screenshot doesn't scroll, and a lazy image that never enters the viewport never
 * loads — waiting on it would hang). Images that aren't laid out (display:none breakpoints) are
 * skipped for the same reason. */
export async function settle(page: Page): Promise<void> {
  await page.evaluate(async () => {
    // Instant scrolling: the site sets `scroll-behavior: smooth`, and a smooth scroll-to-top that
    // hasn't finished when the screenshot is taken leaves sticky bars mid-page in the capture.
    const step = Math.max(window.innerHeight, 400);
    for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
      window.scrollTo({ top: y, behavior: "instant" });
      await new Promise((r) => setTimeout(r, 40));
    }
    window.scrollTo({ top: 0, behavior: "instant" });
    for (let i = 0; i < 20 && window.scrollY !== 0; i++)
      await new Promise((r) => setTimeout(r, 25));
    await document.fonts.ready;
    const rendered = [...document.images].filter((img) => img.getClientRects().length > 0);
    await Promise.all(
      rendered
        .filter((img) => !img.complete)
        .map(
          (img) =>
            new Promise((r) => {
              img.addEventListener("load", r, { once: true });
              img.addEventListener("error", r, { once: true });
              setTimeout(r, 8000); // never hang a test on one slow image
            }),
        ),
    );
  });
}

/** Browse filters (variant a) live in a collapsible panel on phones — open it if the toggle is showing. */
export async function openFilters(page: Page): Promise<void> {
  const toggle = page.locator("[data-filters-toggle]");
  if ((await toggle.count()) > 0 && (await toggle.isVisible())) {
    const expanded = await toggle.getAttribute("aria-expanded");
    if (expanded !== "true") await toggle.click();
  }
  await expect(page.locator("[data-filter-panel]")).toBeVisible();
}

/** The rendered result total from the browse header (`data-total`), or null on the empty/error state. */
export async function listingTotal(page: Page): Promise<number | null> {
  const el = page.locator("[data-results-count]");
  if ((await el.count()) === 0) return null;
  const raw = await el.first().getAttribute("data-total");
  const n = Number(raw);
  return raw !== null && Number.isFinite(n) ? n : null;
}

/** Asking prices of the rendered cards, in page order (฿1,234,567 → 1234567). */
export async function cardPrices(page: Page): Promise<number[]> {
  return page.locator("[data-listing-card]").evaluateAll((cards) =>
    cards
      .map((c) => c.textContent?.match(/฿([\d,]+)/)?.[1])
      .filter((v): v is string => !!v)
      .map((v) => Number(v.replace(/,/g, ""))),
  );
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

/** TH-07 as a COMPUTED-STYLE invariant (not an eyeball): Thai BODY text must render with line-height
 * ≥1.6. This catches the regression class where a `text-*` utility pins a tight default line-height
 * (1.33–1.43) over the inherited --leading-body (1.65) — invisible to source review AND unreliable for
 * an LLM to see in a screenshot. Scoped to listing-card body text (the redesigned surface); exempts
 * headings (loopless Noto, TH-13 allows tighter), pill badges (`[data-badge]`), and absolutely-
 * positioned photo overlays (deal-pill / photo-count chips — short labels, not body text). */
export async function assertThaiBodyLineHeight(page: Page): Promise<void> {
  const offenders = await page.evaluate(() => {
    // Thai CONSONANTS + VOWELS/marks only (the readability concern). Deliberately EXCLUDES ฿ (the
    // Baht sign U+0E3F) and Thai digits, so a Latin-numeral price like "฿2,900,000" — which rightly
    // uses tight leading — is not mistaken for Thai body text.
    const THAI = /[ก-ฺเ-๎]/;
    const bad: { text: string; ratio: number }[] = [];
    // Listing cards (anywhere) + the detail-page / chrome body region (`[data-th-content]`).
    for (const el of document.querySelectorAll("[data-listing-card] *, [data-th-content] *")) {
      // only elements with their OWN direct Thai text node (a leaf line, not a wrapper)
      const hasOwnThai = [...el.childNodes].some(
        (n) => n.nodeType === 3 && THAI.test(n.textContent ?? ""),
      );
      if (!hasOwnThai) continue;
      const cs = getComputedStyle(el);
      if (cs.position === "absolute") continue; // overlay chips (deal-pill, photo-count)
      // pill badges + CTA buttons/links + accordion summaries: short single-line LABELS, not body
      // text (exempt). NOT a bare `a` — the listing card is an <a> wrapping real body text.
      if (el.closest("[data-badge], button, summary, a[data-cta]")) continue;
      if (/^["']?Noto Sans Thai/i.test(cs.fontFamily)) continue; // headings (TH-13)
      const fs = Number.parseFloat(cs.fontSize);
      const lh = Number.parseFloat(cs.lineHeight);
      if (!fs || Number.isNaN(lh)) continue;
      const ratio = lh / fs;
      if (ratio < 1.59)
        bad.push({
          text: (el.textContent ?? "").trim().slice(0, 24),
          ratio: Math.round(ratio * 100) / 100,
        });
    }
    return bad;
  });
  expect(
    offenders,
    `Thai body text below line-height 1.6 (TH-07): ${JSON.stringify(offenders)}`,
  ).toEqual([]);
}

/** WCAG-AA contrast on FILLED CTAs (`[data-cta-solid]` — the primary button + the active filter chip),
 * as a DETERMINISTIC invariant. Catches the class where a filled background flips lighter in dark mode
 * but the text colour does NOT (white-on-light-blue ≈ 2.9:1 — fails AA), which an LLM can't read off a
 * PNG and source review can't see (the tokens "declare" fine). Runs in every project, so the dark-mode
 * pairing is checked too. Uses a 1×1 canvas to resolve ANY computed colour (oklch/rgb/color()) to sRGB
 * bytes, then the WCAG 2.1 ratio. Threshold 4.5:1 (normal text). */
export async function assertCtaContrast(page: Page): Promise<void> {
  const bad = await page.evaluate(() => {
    const toRgb = (color: string): [number, number, number] => {
      const c = document.createElement("canvas");
      c.width = c.height = 1;
      const ctx = c.getContext("2d");
      if (!ctx) return [0, 0, 0];
      ctx.fillStyle = "#000";
      ctx.fillStyle = color;
      ctx.fillRect(0, 0, 1, 1);
      const d = ctx.getImageData(0, 0, 1, 1).data;
      return [d[0], d[1], d[2]];
    };
    const lin = (v: number) => {
      const s = v / 255;
      return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
    };
    const lum = ([r, g, b]: [number, number, number]) =>
      0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
    const ratio = (a: [number, number, number], b: [number, number, number]) => {
      const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
      return (hi + 0.05) / (lo + 0.05);
    };
    const out: { text: string; ratio: number }[] = [];
    for (const el of document.querySelectorAll("[data-cta-solid]")) {
      const cs = getComputedStyle(el);
      const r = ratio(toRgb(cs.color), toRgb(cs.backgroundColor));
      if (r < 4.5)
        out.push({
          text: (el.textContent ?? "").trim().slice(0, 20),
          ratio: Math.round(r * 100) / 100,
        });
    }
    return out;
  });
  expect(
    bad,
    `filled-CTA text/background contrast below WCAG-AA 4.5:1: ${JSON.stringify(bad)}`,
  ).toEqual([]);
}

/** Every rendered image actually loaded — catches the presign/IAM/CDN image bugs that only appear
 * against real infra (locally the fake-S3 serves them; on deploy this checks the real S3 path). */
export async function assertNoBrokenImages(page: Page): Promise<void> {
  await settle(page);
  const broken = await page.evaluate(() =>
    [...document.images]
      .filter((i) => i.getClientRects().length > 0) // laid out — a display:none breakpoint image never loads
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
