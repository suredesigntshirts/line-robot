import fs from "node:fs";
import path from "node:path";
import { expect, type Page, type TestInfo } from "@playwright/test";
// ONE fixture source (review finding #4): the e2e harness renders the SAME fixtures the unit tests
// assert against (the full 5-listing spread incl. the rent + sold cards), so the e2e card-count + the
// rent-price case stay honest. Image URLs already point at API_ORIGIN (intercepted below).
import {
  API_ORIGIN,
  DETAIL,
  INTEREST_FLAGS,
  MODERATION_ITEMS,
  MY_LISTINGS,
  NOTES,
  QUOTES,
  ROLE_APPLICATIONS,
  SAVED,
  VIEWINGS,
} from "../test/fixtures.ts";

// Shared helpers for the LIFF-SPA frontend gate (plan-20 net, ported from packages/website/e2e). The
// SPA renders the REAL built artifact with a MOCKED LIFF context (the @line/liff alias in the e2e
// build) + the api fetch mocked at the network layer here. The invariants are deterministic
// computed-style checks (LLM pixel perception is unreliable — HARDENING-LOG); the perceptual mock-diff
// pass is /frontend-review (run by the orchestrator over the captured gallery).

/** Ephemeral review gallery (gitignored). Filenames self-describing ({project}-{screen}.png). */
export const GALLERY_DIR = "test-results/gallery";

export {
  API_ORIGIN,
  DETAIL,
  INTEREST_FLAGS,
  MODERATION_ITEMS,
  MY_LISTINGS,
  NOTES,
  QUOTES,
  ROLE_APPLICATIONS,
  SAVED,
  VIEWINGS,
};

// A 1x1 transparent PNG — a real, decodable image so assertNoBrokenImages passes (naturalWidth > 0).
const PNG_1X1 = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
  "base64",
);

/** Options for the api mock. `claimStatus` lets a claim-flow test simulate the concurrent-claim loser
 * (409) vs the happy path (200). `detail` overrides the served detail (e.g. an unclaimed listing so
 * the claim flow starts at the review step). */
export interface MockApiOptions {
  /** The status the `POST /properties/{id}/claim` route returns (200 happy / 409 already-claimed). */
  claimStatus?: number;
  /** Override the `GET /properties/{id}` detail (defaults to the shared DETAIL fixture). */
  detail?: typeof DETAIL;
  /** Override `GET /me/saved` (defaults to the shared SAVED fixture; `[]` exercises the empty state). */
  saved?: typeof SAVED;
  /** Override `GET /me/viewings` (defaults to VIEWINGS; `{upcoming:[],past:[]}` is the empty state). */
  viewings?: typeof VIEWINGS;
  /** The status `PATCH /properties/{id}` returns (200 updated / 404 non-claimant / 400 invalid). */
  editStatus?: number;
  /** The status `POST /properties/{id}/viewings` returns (201 created / 400 invalid_time). */
  createViewingStatus?: number;
  /** Stage 6: override `GET /properties/{id}/interest` (the owner's flagger list; `[]` = the empty state). */
  interest?: typeof INTEREST_FLAGS;
  /** Stage 6: override `GET /properties/{id}/quotes` (the owner's offers list; `[]` = the empty state). */
  quotes?: typeof QUOTES;
  /** Stage 6 (INC-B3b): the status `GET /me/role-application` returns (default 200 with `roleApplication`). */
  roleApplication?: { kind: "broker" | "investor" | null; status: string };
  /** Stage 6 (INC-B3b): the status the admin GETs return — 200 (admin) renders the queue, 404 (a
   * non-admin: the route is server-gated) renders the calm no-access state. Default 200. */
  adminStatus?: number;
  /** Stage 6 (INC-B3b): override `GET /admin/role-applications` (the vetting queue; `[]` = empty). */
  roleApplications?: typeof ROLE_APPLICATIONS;
  /** Stage 6 (INC-B3b): override `GET /admin/moderation` (the moderation queue; `[]` = empty). */
  moderation?: typeof MODERATION_ITEMS;
  /** Stage 6 (INC-B3b): the status the admin RESOLVE POSTs return — 200 (recorded), 409 (already
   * decided → the row resolves calmly), or a transient 5xx (the row keeps its buttons + a red inline
   * error, never a green "✓ failed"). Default 200. */
  resolveStatus?: number;
}

/** Install the api + image fixtures on a page. Asserts the request carried the Bearer id-token (the
 * mocked LIFF token), so the auth contract is exercised, not bypassed. Handles the GET reads (listings,
 * detail, saved, viewings, notes, AND the Stage-6 interest/quotes lists) AND the writes (claim/publish/
 * keep-private, save/unsave, create-viewing, add-note, edit, AND the Stage-6 flag-interest/quick-sale/
 * submit-quote). Returns the seen tokens + a record of the write requests observed. */
export async function mockApi(
  page: Page,
  opts: MockApiOptions = {},
): Promise<{ tokensSeen: string[]; writes: string[] }> {
  const tokensSeen: string[] = [];
  const writes: string[] = [];
  const detail = opts.detail ?? DETAIL;
  await page.route(`${API_ORIGIN}/**`, async (route) => {
    const req = route.request();
    const url = new URL(req.url());
    const auth = req.headers().authorization ?? "";
    if (auth.startsWith("Bearer ")) tokensSeen.push(auth.slice(7));

    if (url.pathname.startsWith("/img/")) {
      return route.fulfill({ status: 200, contentType: "image/png", body: PNG_1X1 });
    }
    if (url.pathname === "/me/listings") {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(MY_LISTINGS),
      });
    }
    // --- Per-user CRM reads (Stage 5, Build D) -------------------------------
    if (url.pathname === "/me/saved") {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(opts.saved ?? SAVED),
      });
    }
    if (url.pathname === "/me/viewings") {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(opts.viewings ?? VIEWINGS),
      });
    }
    if (req.method() === "GET" && /\/properties\/[^/]+\/notes$/.test(url.pathname)) {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(NOTES),
      });
    }
    // --- Per-user CRM writes (Stage 5, Build D) ------------------------------
    if (
      (req.method() === "POST" || req.method() === "DELETE") &&
      /\/properties\/[^/]+\/save$/.test(url.pathname)
    ) {
      writes.push(`${req.method()} ${url.pathname}`);
      const status = req.method() === "DELETE" ? "unsaved" : "saved";
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ status }),
      });
    }
    if (req.method() === "POST" && /\/properties\/[^/]+\/viewings$/.test(url.pathname)) {
      writes.push(`${req.method()} ${url.pathname}`);
      const status = opts.createViewingStatus ?? 201;
      const body =
        status === 201
          ? { viewingId: "v-new", scheduledAt: "2030-12-31T03:00:00.000Z", status: "requested" }
          : { error: "invalid_time" };
      return route.fulfill({ status, contentType: "application/json", body: JSON.stringify(body) });
    }
    if (req.method() === "POST" && /\/properties\/[^/]+\/notes$/.test(url.pathname)) {
      writes.push(`${req.method()} ${url.pathname}`);
      const sent = JSON.parse(req.postData() ?? "{}") as { body?: string };
      const text = typeof sent.body === "string" ? sent.body.trim() : "";
      if (text === "") {
        return route.fulfill({
          status: 400,
          contentType: "application/json",
          body: '{"error":"empty_note"}',
        });
      }
      return route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({ id: "n-new", body: text, createdAt: "2026-06-14T10:00:00.000Z" }),
      });
    }
    if (req.method() === "PATCH" && /^\/properties\/[^/]+$/.test(url.pathname)) {
      writes.push(`${req.method()} ${url.pathname}`);
      const status = opts.editStatus ?? 200;
      const body = status === 200 ? { status: "updated" } : { error: "not_found" };
      return route.fulfill({ status, contentType: "application/json", body: JSON.stringify(body) });
    }
    // The claim/publish/keep-private POST writes (Stage 5, Build C).
    if (
      req.method() === "POST" &&
      /\/properties\/[^/]+\/(claim|publish|keep-private)$/.test(url.pathname)
    ) {
      writes.push(`${req.method()} ${url.pathname}`);
      if (url.pathname.endsWith("/claim")) {
        const status = opts.claimStatus ?? 200;
        const body =
          status === 409
            ? { error: "already_claimed", message: "อสังหาฯ นี้ถูกอ้างสิทธิ์โดยผู้อื่นแล้ว" }
            : { status: "claimed" };
        return route.fulfill({
          status,
          contentType: "application/json",
          body: JSON.stringify(body),
        });
      }
      const status = url.pathname.endsWith("/publish") ? "published" : "group_private";
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ status }),
      });
    }
    // --- Stage 6 dealflow (interest flags / quick-sale / quotes) -------------
    // These MUST precede the `/properties/{id}` detail catch-all below, or a `GET …/interest` would
    // fall through to it and return the detail OBJECT where the SPA expects an ARRAY.
    if (req.method() === "GET" && /\/properties\/[^/]+\/interest$/.test(url.pathname)) {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(opts.interest ?? INTEREST_FLAGS),
      });
    }
    if (req.method() === "POST" && /\/properties\/[^/]+\/interest$/.test(url.pathname)) {
      writes.push(`${req.method()} ${url.pathname}`);
      return route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({ status: "flagged" }),
      });
    }
    if (req.method() === "POST" && /\/properties\/[^/]+\/quick-sale$/.test(url.pathname)) {
      writes.push(`${req.method()} ${url.pathname}`);
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ status: "quick_sale" }),
      });
    }
    if (req.method() === "GET" && /\/properties\/[^/]+\/quotes$/.test(url.pathname)) {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(opts.quotes ?? QUOTES),
      });
    }
    if (req.method() === "POST" && /\/properties\/[^/]+\/quotes$/.test(url.pathname)) {
      writes.push(`${req.method()} ${url.pathname}`);
      return route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({ quoteId: "q-new" }),
      });
    }
    // --- Stage 6 role application + admin (INC-B3b) --------------------------
    if (req.method() === "GET" && url.pathname === "/me/role-application") {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(opts.roleApplication ?? { kind: null, status: "none" }),
      });
    }
    if (req.method() === "POST" && url.pathname === "/me/role-application") {
      writes.push(`${req.method()} ${url.pathname}`);
      // A fresh application → 201 (the apply form's "submitted" outcome). The status echoes pending.
      return route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({ status: "pending" }),
      });
    }
    // The two admin queues — GATED SERVER-SIDE: `adminStatus` 404 simulates a non-admin (the calm
    // no-access state); 200 (default) returns the queue rows. The static spec flips it to test both.
    if (req.method() === "GET" && url.pathname === "/admin/role-applications") {
      const status = opts.adminStatus ?? 200;
      return route.fulfill({
        status,
        contentType: "application/json",
        body:
          status === 200
            ? JSON.stringify(opts.roleApplications ?? ROLE_APPLICATIONS)
            : '{"error":"not_found"}',
      });
    }
    if (req.method() === "POST" && /^\/admin\/role-applications\/[^/]+$/.test(url.pathname)) {
      writes.push(`${req.method()} ${url.pathname}`);
      const decision =
        (JSON.parse(req.postData() ?? "{}") as { decision?: string }).decision ?? "approved";
      const status = opts.resolveStatus ?? 200;
      return route.fulfill({
        status,
        contentType: "application/json",
        body: status < 300 ? JSON.stringify({ status: decision }) : `{"error":"resolve_failed"}`,
      });
    }
    if (req.method() === "GET" && url.pathname === "/admin/moderation") {
      const status = opts.adminStatus ?? 200;
      return route.fulfill({
        status,
        contentType: "application/json",
        body:
          status === 200
            ? JSON.stringify(opts.moderation ?? MODERATION_ITEMS)
            : '{"error":"not_found"}',
      });
    }
    if (req.method() === "POST" && /^\/admin\/moderation\/[^/]+$/.test(url.pathname)) {
      writes.push(`${req.method()} ${url.pathname}`);
      const decision =
        (JSON.parse(req.postData() ?? "{}") as { decision?: string }).decision ?? "approved";
      const status = opts.resolveStatus ?? 200;
      return route.fulfill({
        status,
        contentType: "application/json",
        body: status < 300 ? JSON.stringify({ status: decision }) : `{"error":"resolve_failed"}`,
      });
    }
    if (url.pathname.startsWith("/properties/")) {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(detail),
      });
    }
    return route.fulfill({
      status: 404,
      contentType: "application/json",
      body: '{"error":"not_found"}',
    });
  });
  return { tokensSeen, writes };
}

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

/** TECH-06 net as an INVARIANT (not pixels): the tokens resolve at runtime and the body isn't the
 * unstyled serif fallback. Survives theme change — checks that a theme applies at all. */
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

/** Proves the dark e2e project ISN'T a tautology (review finding #2): the rendered surface actually
 * flips with the project's colour scheme. In a `colorScheme: "dark"` project, `prefers-color-scheme:
 * dark` matches → theme.css's `:root:not([data-theme="light"])` dark block applies → the body's bg is
 * DARK. We resolve `--color-bg` to sRGB and assert its luminance sits on the expected side. (If
 * index.html still hardcoded data-theme="light", dark would render light here and this would fail.) */
export async function assertColorScheme(page: Page, scheme: "light" | "dark"): Promise<void> {
  const lum = await page.evaluate(() => {
    const bg = getComputedStyle(document.body).backgroundColor;
    const c = document.createElement("canvas");
    c.width = c.height = 1;
    const ctx = c.getContext("2d");
    if (!ctx) return 1;
    ctx.fillStyle = "#000";
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, 1, 1);
    const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
    const lin = (v: number) => {
      const s = (v ?? 0) / 255;
      return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
    };
    return 0.2126 * lin(r ?? 0) + 0.7152 * lin(g ?? 0) + 0.0722 * lin(b ?? 0);
  });
  if (scheme === "dark") {
    expect(lum, `dark scheme: body bg must be DARK (got luminance ${lum})`).toBeLessThan(0.2);
  } else {
    expect(lum, `light scheme: body bg must be LIGHT (got luminance ${lum})`).toBeGreaterThan(0.5);
  }
}

/** TH-07 as a COMPUTED-STYLE invariant: Thai BODY text must render with line-height ≥1.6. Scoped to
 * listing cards + the detail/chrome body region (`[data-th-content]`); exempts headings (loopless
 * Noto, TH-13 allows tighter), pill badges, CTAs, and absolutely-positioned overlays. The card root is
 * a `<button>` (`[data-listing-card]`) — it does NOT blanket-exempt its inner body text (title,
 * location, the LEGAL-06 disclaimer ARE measured); only GENUINE inner controls (an inner <button>, a
 * badge/tab/CTA) are exempt. */
export async function assertThaiBodyLineHeight(page: Page): Promise<void> {
  const offenders = await page.evaluate(() => {
    const THAI = /[ก-ฺเ-๎]/;
    const bad: { text: string; ratio: number }[] = [];
    for (const el of document.querySelectorAll("[data-listing-card] *, [data-th-content] *")) {
      const hasOwnThai = [...el.childNodes].some(
        (n) => n.nodeType === 3 && THAI.test(n.textContent ?? ""),
      );
      if (!hasOwnThai) continue;
      const cs = getComputedStyle(el);
      if (cs.position === "absolute") continue;
      // Exempt genuine small controls/labels (loopless or short, TH-13): pill badges, tabs, CTA
      // links, <summary>, and explicitly-flagged solid CTAs.
      if (el.closest("[data-badge], summary, a[data-cta], [role='tab'], [data-cta-solid]"))
        continue;
      // <button> exemption — but DON'T let the card-as-button (`[data-listing-card]`, whose ROOT is a
      // <button>) blanket-exempt its inner BODY text (title/location/the LEGAL-06 disclaimer). Exempt
      // an element only if its nearest <button> ancestor is a GENUINE inner control (e.g. the edit
      // entry), NOT the card root itself. (Previously `closest("button")` skipped the entire card
      // body — the TH-07 hole the alignment review found.)
      const btn = el.closest("button");
      if (btn && !btn.hasAttribute("data-listing-card")) continue;
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

/** WCAG-AA contrast on FILLED CTAs (`[data-cta-solid]`). Resolves any computed colour to sRGB via a
 * 1×1 canvas, then the WCAG 2.1 ratio. Threshold 4.5:1 (normal text). Runs in every project so the
 * dark-mode pairing is checked too. */
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
      return [d[0] ?? 0, d[1] ?? 0, d[2] ?? 0];
    };
    const lin = (v: number) => {
      const s = v / 255;
      return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
    };
    const lum = ([r, g, b]: [number, number, number]) =>
      0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
    const ratio = (a: [number, number, number], b: [number, number, number]) => {
      const la = lum(a);
      const lb = lum(b);
      const hi = Math.max(la, lb);
      const lo = Math.min(la, lb);
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

/** Every rendered image actually loaded. */
export async function assertNoBrokenImages(page: Page): Promise<void> {
  await settle(page);
  const broken = await page.evaluate(() =>
    [...document.images]
      .filter((i) => !i.complete || i.naturalWidth === 0)
      .map((i) => i.currentSrc || i.src),
  );
  expect(broken, `broken images: ${broken.join(", ")}`).toEqual([]);
}

/** Collect console errors + failed requests over a flow. Returns a getter for the accumulated
 * problems. Favicon noise is filtered (the SPA ships no favicon). */
export function watchForErrors(page: Page): () => string[] {
  const problems: string[] = [];
  page.on("console", (m) => m.type() === "error" && problems.push(`console: ${m.text()}`));
  page.on("pageerror", (e) => problems.push(`pageerror: ${e.message}`));
  page.on("requestfailed", (r) => {
    const url = r.url();
    if (url.endsWith("/favicon.ico")) return;
    problems.push(`requestfailed: ${url} ${r.failure()?.errorText ?? ""}`);
  });
  page.on("response", (r) => r.status() >= 500 && problems.push(`http ${r.status()}: ${r.url()}`));
  return () => problems;
}

/** Capture a fullPage screenshot into the review gallery as {project}-{screen}.png + attach it. */
export async function capture(page: Page, name: string, testInfo: TestInfo): Promise<string> {
  await settle(page);
  fs.mkdirSync(GALLERY_DIR, { recursive: true });
  const file = path.join(GALLERY_DIR, `${testInfo.project.name}-${name}.png`);
  await page.screenshot({ path: file, fullPage: true });
  await testInfo.attach(`${name} · ${testInfo.project.name}`, {
    path: file,
    contentType: "image/png",
  });
  return file;
}
