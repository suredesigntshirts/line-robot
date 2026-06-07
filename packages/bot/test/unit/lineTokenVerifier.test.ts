import { describe, expect, it, vi } from "vitest";
import { LineIdTokenVerifier } from "../../src/adapters/line/lineTokenVerifier.js";

const CHANNEL_ID = "2010316764";
const CLOCK = { now: () => 1_000_000 }; // fixed "now" in ms

/** Build a fetch stub returning the given status + JSON (or a throwing `.json()` for malformed). */
function fakeFetch(opts: {
  ok?: boolean;
  body?: unknown;
  throwOnJson?: boolean;
  reject?: boolean;
}): typeof fetch {
  return vi.fn(async () => {
    if (opts.reject) {
      throw new Error("network down");
    }
    return {
      ok: opts.ok ?? true,
      json: async () => {
        if (opts.throwOnJson) {
          throw new Error("not json");
        }
        return opts.body;
      },
    } as Response;
  }) as unknown as typeof fetch;
}

/** A token whose `exp` (seconds) is comfortably in the future relative to CLOCK. */
const FUTURE_EXP = Math.floor(CLOCK.now() / 1000) + 3600;

describe("LineIdTokenVerifier", () => {
  it("returns the subject for a valid, unexpired, audience-matching token", async () => {
    const verifier = new LineIdTokenVerifier(
      CHANNEL_ID,
      CLOCK,
      fakeFetch({ body: { sub: "Udeadbeef", aud: CHANNEL_ID, exp: FUTURE_EXP } }),
    );
    expect(await verifier.verifyIdToken("tok")).toEqual({ userId: "Udeadbeef" });
  });

  it("accepts an `aud` array that includes the channel id", async () => {
    const verifier = new LineIdTokenVerifier(
      CHANNEL_ID,
      CLOCK,
      fakeFetch({ body: { sub: "Uxyz", aud: ["other", CHANNEL_ID], exp: FUTURE_EXP } }),
    );
    expect(await verifier.verifyIdToken("tok")).toEqual({ userId: "Uxyz" });
  });

  it("rejects an audience mismatch (a token minted for another channel)", async () => {
    const verifier = new LineIdTokenVerifier(
      CHANNEL_ID,
      CLOCK,
      fakeFetch({ body: { sub: "Uxyz", aud: "9999999999", exp: FUTURE_EXP } }),
    );
    expect(await verifier.verifyIdToken("tok")).toBeNull();
  });

  it("rejects an expired token", async () => {
    const verifier = new LineIdTokenVerifier(
      CHANNEL_ID,
      CLOCK,
      fakeFetch({ body: { sub: "Uxyz", aud: CHANNEL_ID, exp: 1 } }),
    );
    expect(await verifier.verifyIdToken("tok")).toBeNull();
  });

  it("rejects a non-200 response", async () => {
    const verifier = new LineIdTokenVerifier(
      CHANNEL_ID,
      CLOCK,
      fakeFetch({ ok: false, body: { error: "invalid_request" } }),
    );
    expect(await verifier.verifyIdToken("tok")).toBeNull();
  });

  it("returns null on a malformed JSON body", async () => {
    const verifier = new LineIdTokenVerifier(CHANNEL_ID, CLOCK, fakeFetch({ throwOnJson: true }));
    expect(await verifier.verifyIdToken("tok")).toBeNull();
  });

  it("returns null on a network error", async () => {
    const verifier = new LineIdTokenVerifier(CHANNEL_ID, CLOCK, fakeFetch({ reject: true }));
    expect(await verifier.verifyIdToken("tok")).toBeNull();
  });

  it("rejects an empty token without calling the endpoint", async () => {
    const spy = fakeFetch({ body: {} });
    const verifier = new LineIdTokenVerifier(CHANNEL_ID, CLOCK, spy);
    expect(await verifier.verifyIdToken("")).toBeNull();
    expect(spy).not.toHaveBeenCalled();
  });

  it("posts the id_token + public client_id form-encoded to the verify endpoint", async () => {
    const spy = fakeFetch({ body: { sub: "U1", aud: CHANNEL_ID, exp: FUTURE_EXP } });
    const verifier = new LineIdTokenVerifier(CHANNEL_ID, CLOCK, spy);
    await verifier.verifyIdToken("the-token");
    expect(spy).toHaveBeenCalledWith(
      "https://api.line.me/oauth2/v2.1/verify",
      expect.objectContaining({
        method: "POST",
        body: "id_token=the-token&client_id=2010316764",
      }),
    );
  });
});
