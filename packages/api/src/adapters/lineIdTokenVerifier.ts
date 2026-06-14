import type { LineTokenVerifier } from "../ports/lineTokenVerifier.ts";

// Ported verbatim (behaviour) from packages/bot/src/adapters/line/lineTokenVerifier.ts — the PROVEN v1
// LIFF id-token verifier (spine-audit row 7: KEEP). LINE's stateless verify endpoint takes the
// (public) channel id as `client_id` — no channel secret — and returns the decoded, signature-checked
// payload, so we never handle LINE's JWKS ourselves.
const VERIFY_ENDPOINT = "https://api.line.me/oauth2/v2.1/verify";

/** The fields we read off a successful verify response; LINE returns more (name/picture/email) but we
 * only need the subject + the two claims we re-validate defensively. */
interface VerifyResponse {
  readonly sub?: unknown;
  readonly aud?: unknown;
  readonly exp?: unknown;
}

/** `aud` is normally a string for a LIFF id-token, but the spec allows an array — accept either. */
function audienceMatches(aud: unknown, channelId: string): boolean {
  if (typeof aud === "string") return aud === channelId;
  if (Array.isArray(aud)) return aud.includes(channelId);
  return false;
}

/**
 * {@link LineTokenVerifier} backed by LINE's verify endpoint. POSTs `id_token` + `client_id`
 * (form-encoded); on a 200 it re-checks `aud === channelId` and that `exp` (seconds) hasn't passed,
 * then returns `{ userId: sub }`. Any non-200, bad audience, expired token, or malformed body →
 * `null` (so a forged/foreign/expired token can't impersonate a user — the handler 401s).
 *
 * `now` returns the current epoch-ms (injected so tests are deterministic). `fetchImpl` is injectable
 * for the same reason (no network in unit tests).
 */
export class LineIdTokenVerifier implements LineTokenVerifier {
  constructor(
    private readonly channelId: string,
    private readonly now: () => number = Date.now,
    private readonly fetchImpl: typeof fetch = fetch,
  ) {}

  async verifyIdToken(idToken: string): Promise<{ userId: string } | null> {
    if (idToken === "") return null;
    let payload: VerifyResponse;
    try {
      const response = await this.fetchImpl(VERIFY_ENDPOINT, {
        method: "POST",
        headers: { "content-type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ id_token: idToken, client_id: this.channelId }).toString(),
      });
      if (!response.ok) return null;
      payload = (await response.json()) as VerifyResponse;
    } catch {
      // Network error or non-JSON body → treat as unverifiable.
      return null;
    }

    if (!audienceMatches(payload.aud, this.channelId)) return null;
    // `exp` is seconds-since-epoch; reject once it's in the past (the endpoint already
    // signature-verified the token, so this is defence in depth).
    if (typeof payload.exp !== "number" || payload.exp * 1000 <= this.now()) return null;
    if (typeof payload.sub !== "string" || payload.sub === "") return null;
    return { userId: payload.sub };
  }
}
