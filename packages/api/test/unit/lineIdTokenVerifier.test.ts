import { describe, expect, it, vi } from "vitest";
import { LineIdTokenVerifier } from "../../src/adapters/lineIdTokenVerifier.ts";

const CHANNEL = "2010316767";
const NOW_MS = 1_750_000_000_000; // fixed clock
const FUTURE_EXP = Math.floor(NOW_MS / 1000) + 3600;
const PAST_EXP = Math.floor(NOW_MS / 1000) - 1;

function fetchReturning(status: number, body: unknown): typeof fetch {
  return vi.fn(async () => ({
    ok: status >= 200 && status < 300,
    json: async () => body,
  })) as unknown as typeof fetch;
}

const verifier = (fetchImpl: typeof fetch) =>
  new LineIdTokenVerifier(CHANNEL, () => NOW_MS, fetchImpl);

describe("LineIdTokenVerifier", () => {
  it("returns the subject for a valid token (aud matches, not expired)", async () => {
    const v = verifier(fetchReturning(200, { sub: "Uabc", aud: CHANNEL, exp: FUTURE_EXP }));
    expect(await v.verifyIdToken("tok")).toEqual({ userId: "Uabc" });
  });

  it("accepts an array audience containing the channel", async () => {
    const v = verifier(
      fetchReturning(200, { sub: "Uabc", aud: ["other", CHANNEL], exp: FUTURE_EXP }),
    );
    expect(await v.verifyIdToken("tok")).toEqual({ userId: "Uabc" });
  });

  it("rejects an empty token without calling fetch", async () => {
    const fetchImpl = fetchReturning(200, {});
    const v = verifier(fetchImpl);
    expect(await v.verifyIdToken("")).toBeNull();
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("rejects a non-200 response", async () => {
    const v = verifier(fetchReturning(400, { error: "invalid" }));
    expect(await v.verifyIdToken("tok")).toBeNull();
  });

  it("rejects a foreign audience", async () => {
    const v = verifier(fetchReturning(200, { sub: "Uabc", aud: "someone-else", exp: FUTURE_EXP }));
    expect(await v.verifyIdToken("tok")).toBeNull();
  });

  it("rejects an expired token", async () => {
    const v = verifier(fetchReturning(200, { sub: "Uabc", aud: CHANNEL, exp: PAST_EXP }));
    expect(await v.verifyIdToken("tok")).toBeNull();
  });

  it("rejects a missing/blank subject", async () => {
    const v = verifier(fetchReturning(200, { sub: "", aud: CHANNEL, exp: FUTURE_EXP }));
    expect(await v.verifyIdToken("tok")).toBeNull();
  });

  it("returns null on a network/parse error (never throws)", async () => {
    const fetchImpl = vi.fn(async () => {
      throw new Error("network down");
    }) as unknown as typeof fetch;
    const v = verifier(fetchImpl);
    await expect(v.verifyIdToken("tok")).resolves.toBeNull();
  });

  it("posts id_token + client_id form-encoded to LINE's verify endpoint", async () => {
    const fetchImpl = fetchReturning(200, { sub: "Uabc", aud: CHANNEL, exp: FUTURE_EXP });
    await verifier(fetchImpl).verifyIdToken("the-token");
    expect(fetchImpl).toHaveBeenCalledWith(
      "https://api.line.me/oauth2/v2.1/verify",
      expect.objectContaining({
        method: "POST",
        body: `id_token=the-token&client_id=${CHANNEL}`,
      }),
    );
  });
});
