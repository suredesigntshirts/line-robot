/**
 * A mock `@line/liff` for the LIFF-SPA frontend gate (e2e ONLY). The real bundle imports `@line/liff`;
 * the e2e Vite build (mode `e2e`) ALIASES that import to this file (see vite.config.ts), so the gate
 * renders the REAL production artifact (router, screens, theme, Tailwind, fonts, api client) with the
 * ONE LIFF-SDK boundary swapped for a deterministic stub — exactly the hexagonal seam. It mocks the
 * LIFF context (init resolves, a fixed id-token, in-client, th language); the api fetch is mocked at
 * the network layer by Playwright `page.route` (so the real api client + auth header are exercised).
 *
 * Lives under e2e/ (not src/) so it never ships in the production bundle and the alias only applies in
 * the `e2e` Vite mode — it's a test double, not app code.
 */

/** The DEFAULT fixture token — the EXISTING `e2e-user` identity. The static gate + every existing
 * real-api spec emit this (backward-compatible: no `loginAs` → this token, unchanged behaviour). */
const FIXTURE_ID_TOKEN = "e2e.fixture.id-token";

/** MULTI-IDENTITY (Stage 6, INC-B3). The real-api harness seeds several roles (owner/member/broker/
 * admin); a spec's `loginAs(page, role)` writes the role's fixture token into `localStorage` BEFORE
 * navigation (an init-script, so it's present on first paint). This mock reads that value and returns
 * it from `getIDToken()`, so the SPA's api client sends the role's Bearer token; the server's stub
 * verifier maps each token → its seeded LINE subject. When no token is set (the static gate, every
 * existing spec) it DEFAULTS to the fixture token — so nothing pre-Stage-6 changes.
 *
 * Read defensively: `localStorage` may be unavailable in some contexts; any failure falls back to the
 * default token. The KEY + the token→subject contract are mirrored in e2e-api/support.ts + server.mjs. */
const ACTIVE_TOKEN_KEY = "e2e-active-token";

function activeToken(): string {
  try {
    return localStorage.getItem(ACTIVE_TOKEN_KEY) ?? FIXTURE_ID_TOKEN;
  } catch {
    return FIXTURE_ID_TOKEN;
  }
}

/** The display profile the identity chrome (S5-5) shows. Keyed off the active token so a non-default
 * identity reads as a different person; the `userId` is informational here (the api trusts the verified
 * id-token, not this). Defaults to the existing `e2e-user` profile (backward-compatible). */
const PROFILES: Record<string, { userId: string; displayName: string }> = {
  "e2e.fixture.id-token": { userId: "e2e-user", displayName: "คุณธนวัฒน์" },
  "e2e.token.member": { userId: "e2e-member", displayName: "สมาชิกกลุ่ม" },
  "e2e.token.broker": { userId: "e2e-broker", displayName: "นายหน้าตรวจสอบแล้ว" },
  "e2e.token.other": { userId: "e2e-other-user", displayName: "สมาชิกอีกคน" },
  // The `admin` identity is added in INC-B3b; an unknown token here falls back to the default profile.
};

const liff = {
  init: async (_config: { liffId: string }): Promise<void> => {
    // resolves immediately — no network, no redirect
  },
  isInClient: (): boolean => true,
  isLoggedIn: (): boolean => true,
  login: (): void => {
    // no-op in the e2e harness (would be a redirect in a real external browser)
  },
  getIDToken: (): string | null => activeToken(),
  getLanguage: (): string => "th",
  isApiAvailable: (_name: string): boolean => false,
  // The CRM home identity chrome (S5-5) reads displayName + pictureUrl from here. Use an inline data:
  // URI (a 1×1 PNG) so the avatar decodes with ZERO network in BOTH e2e suites — the static gate AND
  // the real-api suite. (A URL on API_ORIGIN would be forwarded to the real `handleApi` by the
  // real-api forwarder, which 401s an unauthenticated <img> request; a data: URI sidesteps that and
  // keeps assertNoBrokenImages green. In production pictureUrl is a real LINE CDN URL.)
  getProfile: async () => {
    const p = PROFILES[activeToken()] ?? PROFILES[FIXTURE_ID_TOKEN];
    return {
      userId: p?.userId ?? "e2e-user",
      displayName: p?.displayName ?? "คุณธนวัฒน์",
      pictureUrl:
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
      statusMessage: undefined,
    };
  },
};

export default liff;
