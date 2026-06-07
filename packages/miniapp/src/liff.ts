/**
 * The LIFF bootstrap. `liff.init()` must resolve BEFORE the SPA touches the URL (no pushState /
 * redirect until then — LIFF requirement), so {@link initLiff} is awaited in `main.tsx` before the
 * app renders. We use the **ID token** (not the access token): one `liff.getIDToken()` per request,
 * verified server-side, yields the user's `sub` directly — no extra profile round-trip, and it isn't
 * revoked when the LIFF window closes.
 */
import liff from "@line/liff";

const LIFF_ID = import.meta.env.VITE_LIFF_ID as string | undefined;

export async function initLiff(): Promise<void> {
  if (LIFF_ID === undefined || LIFF_ID === "") {
    throw new Error("VITE_LIFF_ID is not set — rebuild the SPA with the LIFF ID baked in.");
  }
  await liff.init({ liffId: LIFF_ID });
  // In an external browser (not the LINE in-app webview) the user isn't authenticated yet, so
  // getIDToken() would be null — kick off login (a full-page redirect; nothing after this runs).
  // Inside the LIFF browser this is skipped (the user is already logged in).
  if (!liff.isInClient() && !liff.isLoggedIn()) {
    liff.login();
  }
}

/** The current ID token (a fresh ES256 JWT LIFF keeps refreshed), or null if not logged in. */
export function getIdToken(): string | null {
  return liff.getIDToken();
}

/** True inside the LINE in-app (LIFF) browser; false in an external browser. */
export function isInClient(): boolean {
  return liff.isInClient();
}
