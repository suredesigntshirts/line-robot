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

const FIXTURE_ID_TOKEN = "e2e.fixture.id-token";

const liff = {
  init: async (_config: { liffId: string }): Promise<void> => {
    // resolves immediately — no network, no redirect
  },
  isInClient: (): boolean => true,
  isLoggedIn: (): boolean => true,
  login: (): void => {
    // no-op in the e2e harness (would be a redirect in a real external browser)
  },
  getIDToken: (): string | null => FIXTURE_ID_TOKEN,
  getLanguage: (): string => "th",
  isApiAvailable: (_name: string): boolean => false,
  // The CRM home identity chrome (S5-5) reads displayName + pictureUrl from here. Use an inline data:
  // URI (a 1×1 PNG) so the avatar decodes with ZERO network in BOTH e2e suites — the static gate AND
  // the real-api suite. (A URL on API_ORIGIN would be forwarded to the real `handleApi` by the
  // real-api forwarder, which 401s an unauthenticated <img> request; a data: URI sidesteps that and
  // keeps assertNoBrokenImages green. In production pictureUrl is a real LINE CDN URL.)
  getProfile: async () => ({
    userId: "e2e-user",
    displayName: "คุณธนวัฒน์",
    pictureUrl:
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
    statusMessage: undefined,
  }),
};

export default liff;
