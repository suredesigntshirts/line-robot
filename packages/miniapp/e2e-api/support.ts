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
  /** Stage 6 multi-identity users (the non-claimant member / vetted broker). */
  memberUserId: string;
  brokerUserId: string;
  /** Stage 6 (INC-B3b): the ADMIN (server `/admin/*` gate) + a separate APPLICANT with a pending
   * broker role-application (the vetting queue's seeded pending row). */
  adminUserId: string;
  applicantUserId: string;
  groupId: string;
  /** Stage 6 (INC-B3b): the seeded PENDING moderation item (the moderation queue's target). */
  moderationItemId: string;
  listings: {
    claimable: string;
    mine: string;
    claimedByOther: string;
    published: string;
    /** Stage 6: a SALE listing pre-flagged `quick_sale` (the quote round-trip's target). */
    quickSale: string;
    /** Stage 6: a SALE listing NOT yet quick-sale (the quick-sale-toggle round-trip's target). */
    toToggle: string;
    /** Stage 6 (INC-B3b): a gate-failed listing the seeded moderation item targets. */
    flagged: string;
    /** Plan 23 Group D: a group-less (1:1-DM-sourced) listing whose dm_claimant is the test user. */
    dmClaimable: string;
  };
}

/** Fetch the deterministic seed ids from the running server (which one is claimable / mine / …). */
export async function seedIds(page: Page): Promise<SeedIds> {
  const res = await page.request.get(`${SERVER_BASE}/__ids`);
  expect(res.ok(), "the harness /__ids endpoint must respond").toBeTruthy();
  return (await res.json()) as SeedIds;
}

/** A seeded role a spec can authenticate as (Stage 6 multi-identity). `owner` is the DEFAULT — every
 * pre-Stage-6 spec runs as it WITHOUT calling `loginAs` (so they're unaffected). `admin` (INC-B3b) holds
 * the seeded `approved` admin role → the server-side `/admin/*` gate admits it (every other role 404s). */
export type Role = "owner" | "member" | "broker" | "other" | "admin";

/** The fixture id-token each role's LIFF mock emits — mirrored in e2e/mocks/liff.ts (which reads the
 * active token from localStorage) + server.mjs (the stub verifier maps it → the seeded LINE subject). */
const ROLE_TOKEN: Record<Role, string> = {
  owner: "e2e.fixture.id-token",
  member: "e2e.token.member",
  broker: "e2e.token.broker",
  other: "e2e.token.other",
  admin: "e2e.token.admin",
};

/** localStorage key the LIFF mock reads to choose which token `getIDToken()` returns (see liff.ts). */
const ACTIVE_TOKEN_KEY = "e2e-active-token";

/**
 * Set the ACTIVE identity for the SPA's LIFF mock BEFORE navigation (Stage 6 multi-identity). Installs
 * an init-script that writes the role's fixture token into `localStorage` — it runs on EVERY document
 * (so a subsequent `page.goto` already has it on first paint). `addInitScript` ACCUMULATES (each call
 * adds another script, it does NOT replace the prior one) — but every `loginAs` writes the SAME
 * localStorage key, so on a re-navigation the scripts run in order and the LAST write wins; that's why a
 * later `loginAs(page, 'owner')` cleanly switches identity. The LIFF mock reads the key and returns the
 * matching token from `getIDToken()`; the server's stub verifier maps token → seeded subject. NOT
 * calling `loginAs` leaves the default (`e2e-user`) — backward-compatible.
 *
 * Call BEFORE the `page.goto` for the identity you want; to switch identity mid-test, call it again then
 * re-navigate (the existing in-page SPA cached the old token, so a fresh `goto` is required to re-read).
 */
export async function loginAs(page: Page, role: Role): Promise<void> {
  const token = ROLE_TOKEN[role];
  await page.addInitScript(
    ([key, value]) => {
      try {
        window.localStorage.setItem(key, value);
      } catch {
        // localStorage unavailable — the mock falls back to the default token (still a valid identity).
      }
    },
    [ACTIVE_TOKEN_KEY, token] as const,
  );
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
    try {
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
    } catch (error) {
      // ONLY swallow the known TEARDOWN race: a detail screen fires several background GETs
      // (interest/quotes/notes); one still in flight when the test ends + the page closes makes the
      // route callback throw "Target page/context/browser has been closed". That's not a test failure —
      // the live assertions already ran. ANYTHING else (a real upstream fulfill failure, a server 500
      // surfaced as a thrown error) is RE-THROWN so it isn't masked from watchForErrors / the spec.
      const message = error instanceof Error ? error.message : String(error);
      if (!/(Target page|context|browser).*has been closed/i.test(message)) throw error;
      await route.abort().catch(() => {});
    }
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
    // net::ERR_ABORTED is a NAVIGATION/teardown artifact, not a failure: when a spec navigates
    // (`page.goto`) right after an OPTIMISTIC background write (save/flag/resolve — the UI already
    // reflected success), the in-flight request is cancelled by the new document. The live assertions
    // already proved the behaviour; a genuine failure still surfaces as a 5xx response (the `response`
    // handler below) or a JS console/page error (caught above). So an abort is filtered as benign — it
    // is the same class of teardown race `forwardApi` already swallows on page-close.
    const err = r.failure()?.errorText ?? "";
    if (err.includes("ERR_ABORTED")) return;
    problems.push(`requestfailed: ${u} ${err}`);
  });
  page.on("response", (r) => r.status() >= 500 && problems.push(`http ${r.status()}: ${r.url()}`));
  return () => problems;
}
