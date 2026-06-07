/**
 * Verifies a LIFF id-token and yields the LINE user id (`sub`) it was issued for. The mini-app's
 * read API turns the webview's `liff.getIDToken()` into the caller's identity through this seam, so
 * the {@link ../../app/readApiHandler} stays testable with a fake verifier (no network in tests).
 */
export interface LineTokenVerifier {
  /**
   * Validate an id-token and return its subject. Returns `null` (never throws) when the token is
   * missing/invalid/expired or its `aud` doesn't match the configured channel — the handler maps
   * `null` to a 401. A non-null `{ userId }` is the same `U…` id our membership edges are keyed on.
   */
  verifyIdToken(idToken: string): Promise<{ userId: string } | null>;
}
