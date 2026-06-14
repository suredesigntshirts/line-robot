/**
 * Verifies a LIFF id-token and yields the LINE user id (`sub`) it was issued for. The mini-app turns
 * its webview's `liff.getIDToken()` into the caller's identity through this seam, so the handler stays
 * testable with a fake verifier (no network in tests).
 *
 * This is a real external seam (LINE's verify endpoint) — a port is justified per the anti-over-
 * engineering rules. It is the ONLY interface in this package: everything else reads the DB public
 * barrel directly (no one-caller abstractions).
 */
export interface LineTokenVerifier {
  /**
   * Validate an id-token and return its subject. Returns `null` (never throws) when the token is
   * missing/invalid/expired or its `aud` doesn't match the configured channel — the handler maps
   * `null` to a 401. A non-null `{ userId }` is the same `U…` id the LINE platform issues.
   */
  verifyIdToken(idToken: string): Promise<{ userId: string } | null>;
}
