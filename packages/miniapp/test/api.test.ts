import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError, createApiClient } from "../src/lib/api.ts";
import { DETAIL, MY_LISTINGS } from "./fixtures.ts";

// The api client carries the LIFF id-token as `Authorization: Bearer <token>` on every request and
// maps non-2xx to ApiError(status). We drive it with a stub fetch + a stub token source.

const BASE = "https://api.test";

function stubFetch(status: number, body: unknown) {
  return vi.fn(async () => ({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  })) as unknown as typeof fetch;
}

afterEach(() => vi.restoreAllMocks());

describe("createApiClient", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", stubFetch(200, MY_LISTINGS));
  });

  it("GET /me/listings sends the Bearer id-token header", async () => {
    const fetchSpy = stubFetch(200, MY_LISTINGS);
    vi.stubGlobal("fetch", fetchSpy);
    const api = createApiClient(BASE, () => "tok-123");
    const data = await api.myListings();
    expect(data).toEqual(MY_LISTINGS);
    expect(fetchSpy).toHaveBeenCalledWith(
      "https://api.test/me/listings",
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: "Bearer tok-123" }),
      }),
    );
  });

  it("GET /properties/{id} encodes the id and returns the detail", async () => {
    const fetchSpy = stubFetch(200, DETAIL);
    vi.stubGlobal("fetch", fetchSpy);
    const api = createApiClient(BASE, () => "tok");
    const data = await api.listing("a b/c");
    expect(data).toEqual(DETAIL);
    expect(fetchSpy).toHaveBeenCalledWith(
      "https://api.test/properties/a%20b%2Fc",
      expect.any(Object),
    );
  });

  it("throws ApiError(401) without a round-trip when there is no token", async () => {
    const fetchSpy = stubFetch(200, MY_LISTINGS);
    vi.stubGlobal("fetch", fetchSpy);
    const api = createApiClient(BASE, () => null);
    await expect(api.myListings()).rejects.toMatchObject({ status: 401 });
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("maps a non-2xx response to ApiError carrying the status", async () => {
    vi.stubGlobal("fetch", stubFetch(404, { error: "not_found" }));
    const api = createApiClient(BASE, () => "tok");
    const err = await api.listing("missing").catch((e) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect(err.status).toBe(404);
  });

  // Stage 5, Build C — the claim/publish writes.
  it("POST /claim hits the claim sub-path with the Bearer header and returns the status", async () => {
    const fetchSpy = stubFetch(200, { status: "claimed" });
    vi.stubGlobal("fetch", fetchSpy);
    const api = createApiClient(BASE, () => "tok");
    expect(await api.claim("L-1")).toEqual({ status: "claimed" });
    expect(fetchSpy).toHaveBeenCalledWith(
      "https://api.test/properties/L-1/claim",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({ Authorization: "Bearer tok" }),
      }),
    );
  });

  it("a 409 from /claim (the concurrent-claim loser) surfaces as ApiError(409)", async () => {
    vi.stubGlobal("fetch", stubFetch(409, { error: "already_claimed" }));
    const api = createApiClient(BASE, () => "tok");
    const err = await api.claim("L-1").catch((e) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect(err.status).toBe(409);
  });

  it("POST /publish and /keep-private hit their sub-paths", async () => {
    const fetchSpy = stubFetch(200, { status: "published" });
    vi.stubGlobal("fetch", fetchSpy);
    const api = createApiClient(BASE, () => "tok");
    await api.publish("L-1");
    expect(fetchSpy).toHaveBeenCalledWith(
      "https://api.test/properties/L-1/publish",
      expect.objectContaining({ method: "POST" }),
    );
    await api.keepPrivate("L-1");
    expect(fetchSpy).toHaveBeenCalledWith(
      "https://api.test/properties/L-1/keep-private",
      expect.objectContaining({ method: "POST" }),
    );
  });
});
