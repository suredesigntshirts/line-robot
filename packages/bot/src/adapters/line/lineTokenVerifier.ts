import type { LineTokenVerifier } from "../../core/ports/lineTokenVerifier.js";
import type { Clock } from "../../core/ports/runtime.js";

/** LINE's stateless id-token verification endpoint. Takes the (public) channel id as `client_id` —
 * no channel secret — and returns the decoded, signature-checked payload, so we never handle LINE's
 * JWKS ourselves (`verify-id-token` endorses this endpoint). */
const VERIFY_ENDPOINT = "https://api.line.me/oauth2/v2.1/verify";

/** The fields we read off a successful verify response; LINE returns more (name/picture/email) but
 * v1 only needs the subject + the two claims we re-validate defensively. */
interface VerifyResponse {
  readonly sub?: unknown;
  readonly aud?: unknown;
  readonly exp?: unknown;
}

/** `aud` is normally a string for a LIFF id-token, but the spec allows an array — accept either. */
function audienceMatches(aud: unknown, channelId: string): boolean {
  if (typeof aud === "string") {
    return aud === channelId;
  }
  if (Array.isArray(aud)) {
    return aud.includes(channelId);
  }
  return false;
}

/**
 * {@link LineTokenVerifier} backed by LINE's verify endpoint. POSTs `id_token` + `client_id`
 * (form-encoded); on a 200 it re-checks `aud === channelId` and that `exp` (seconds) hasn't passed,
 * then returns `{ userId: sub }`. Any non-200, bad audience, expired token, or malformed body →
 * `null` (so a forged/foreign/expired token can't impersonate a user — the handler 401s).
 */
export class LineIdTokenVerifier implements LineTokenVerifier {
  constructor(
    private readonly channelId: string,
    private readonly clock: Clock,
    private readonly fetchImpl: typeof fetch = fetch,
  ) {}

  async verifyIdToken(idToken: string): Promise<{ userId: string } | null> {
    if (idToken === "") {
      return null;
    }
    let payload: VerifyResponse;
    try {
      const response = await this.fetchImpl(VERIFY_ENDPOINT, {
        method: "POST",
        headers: { "content-type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ id_token: idToken, client_id: this.channelId }).toString(),
      });
      if (!response.ok) {
        return null;
      }
      payload = (await response.json()) as VerifyResponse;
    } catch {
      // Network error or non-JSON body → treat as unverifiable.
      return null;
    }

    if (!audienceMatches(payload.aud, this.channelId)) {
      return null;
    }
    // `exp` is seconds-since-epoch; reject once it's in the past (small clock skew is acceptable —
    // the token is already signature-verified by the endpoint, this is just defence in depth).
    if (typeof payload.exp !== "number" || payload.exp * 1000 <= this.clock.now()) {
      return null;
    }
    if (typeof payload.sub !== "string" || payload.sub === "") {
      return null;
    }
    return { userId: payload.sub };
  }
}
