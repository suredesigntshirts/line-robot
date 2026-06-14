import { expect, type Page } from "@playwright/test";

// Shared helpers for the REAL-BACKEND e2e suite (INC-2). The SPA's baked `VITE_API_URL` is the fake
// origin `https://e2e.api.local`; here we FORWARD every request to that origin to the local real-api
// server (`/__api/*`), which runs the actual `handleApi` over a seeded Docker Postgres. This reuses the
// SAME `dist-e2e` artifact + the existing LIFF mock (which already sends the Bearer id-token) — no
// second SPA build, no dynamic-port baking. The static gate's `mockApi` FAKES this origin with canned
// bodies; we FORWARD it to the real handler, so the round-trips prove real persistence + the real
// contract (the edit allowlist, isSaved, group authz, claim/publish→consent), which a static mock can't.

const API_ORIGIN = "https://e2e.api.local";
const SERVER_PORT = Number(process.env.E2E_API_PORT || 4331);
const SERVER_BASE = `http://localhost:${SERVER_PORT}`;

/** The seed ids the server materialised, by role — fetched once per spec from `/__ids`. */
export interface SeedIds {
  userId: string;
  otherUserId: string;
  groupId: string;
  listings: {
    claimable: string;
    mine: string;
    claimedByOther: string;
    published: string;
  };
}

/** Fetch the deterministic seed ids from the running server (which one is claimable / mine / …). */
export async function seedIds(page: Page): Promise<SeedIds> {
  const res = await page.request.get(`${SERVER_BASE}/__ids`);
  expect(res.ok(), "the harness /__ids endpoint must respond").toBeTruthy();
  return (await res.json()) as SeedIds;
}

/** Install the api FORWARDER on a page: every `https://e2e.api.local/...` request is re-issued against
 * the local real-api server (`/__api/...`) with the SAME method + headers (incl. the Bearer id-token
 * the LIFF mock sends) + body, then fulfilled with the real handler's response. Returns the tokens seen
 * (so a spec can assert the auth contract was exercised, exactly like the static gate's mockApi). */
export async function forwardApi(page: Page): Promise<{ tokensSeen: string[] }> {
  const tokensSeen: string[] = [];
  await page.route(`${API_ORIGIN}/**`, async (route) => {
    const req = route.request();
    const url = new URL(req.url());
    const auth = req.headers().authorization ?? "";
    if (auth.startsWith("Bearer ")) tokensSeen.push(auth.slice(7));

    const target = `${SERVER_BASE}/__api${url.pathname}${url.search}`;
    // Use the test runner's request context to reach localhost (the page's network is what we're
    // intercepting; APIRequestContext is the side channel that actually hits the server).
    const upstream = await page.request.fetch(target, {
      method: req.method(),
      headers: req.headers(),
      data: req.postData() ?? undefined,
      // The real handler classifies HTTP outcomes (401/404/409/400) as normal responses, not errors —
      // never throw on a non-2xx; forward it through so the SPA sees the real status.
      failOnStatusCode: false,
    });
    await route.fulfill({ response: upstream });
  });
  return { tokensSeen };
}

/** Wait for fonts + every image to finish (so assertions/screenshots aren't measured mid-load). */
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

/** Collect console errors + failed requests over a flow (favicon noise filtered). */
export function watchForErrors(page: Page): () => string[] {
  const problems: string[] = [];
  page.on("console", (m) => m.type() === "error" && problems.push(`console: ${m.text()}`));
  page.on("pageerror", (e) => problems.push(`pageerror: ${e.message}`));
  page.on("requestfailed", (r) => {
    const u = r.url();
    if (u.endsWith("/favicon.ico")) return;
    problems.push(`requestfailed: ${u} ${r.failure()?.errorText ?? ""}`);
  });
  page.on("response", (r) => r.status() >= 500 && problems.push(`http ${r.status()}: ${r.url()}`));
  return () => problems;
}
