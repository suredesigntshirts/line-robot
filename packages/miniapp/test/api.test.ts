import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError, createApiClient } from "../src/lib/api.ts";
import { DETAIL, MY_LISTINGS, NOTES, SAVED, VIEWINGS } from "./fixtures.ts";

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

  // Stage 5, Build D — the per-user CRM endpoints.
  it("GET /me/saved returns the saved cards", async () => {
    vi.stubGlobal("fetch", stubFetch(200, SAVED));
    const api = createApiClient(BASE, () => "tok");
    expect(await api.saved()).toEqual(SAVED);
  });

  it("POST + DELETE /properties/{id}/save toggle save state on the right verb", async () => {
    const fetchSpy = stubFetch(200, { status: "saved" });
    vi.stubGlobal("fetch", fetchSpy);
    const api = createApiClient(BASE, () => "tok");
    await api.save("L-1");
    expect(fetchSpy).toHaveBeenCalledWith(
      "https://api.test/properties/L-1/save",
      expect.objectContaining({ method: "POST" }),
    );
    await api.unsave("L-1");
    expect(fetchSpy).toHaveBeenCalledWith(
      "https://api.test/properties/L-1/save",
      expect.objectContaining({ method: "DELETE" }),
    );
  });

  it("GET /me/viewings returns the upcoming/past split", async () => {
    vi.stubGlobal("fetch", stubFetch(200, VIEWINGS));
    const api = createApiClient(BASE, () => "tok");
    expect(await api.viewings()).toEqual(VIEWINGS);
  });

  it("POST /properties/{id}/viewings sends the scheduledAt body + Content-Type", async () => {
    const fetchSpy = stubFetch(201, { viewingId: "v", scheduledAt: "x", status: "requested" });
    vi.stubGlobal("fetch", fetchSpy);
    const api = createApiClient(BASE, () => "tok");
    await api.createViewing("L-1", "2026-06-20T03:00:00.000Z");
    expect(fetchSpy).toHaveBeenCalledWith(
      "https://api.test/properties/L-1/viewings",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ scheduledAt: "2026-06-20T03:00:00.000Z" }),
        headers: expect.objectContaining({ "Content-Type": "application/json" }),
      }),
    );
  });

  it("a 400 (invalid_time) from create-viewing surfaces as ApiError(400)", async () => {
    vi.stubGlobal("fetch", stubFetch(400, { error: "invalid_time" }));
    const api = createApiClient(BASE, () => "tok");
    const err = await api.createViewing("L-1", "bad").catch((e) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect(err.status).toBe(400);
  });

  it("GET /properties/{id}/notes returns the caller's notes; POST sends the body", async () => {
    vi.stubGlobal("fetch", stubFetch(200, NOTES));
    let api = createApiClient(BASE, () => "tok");
    expect(await api.notes("L-1")).toEqual(NOTES);

    const fetchSpy = stubFetch(201, NOTES[0]);
    vi.stubGlobal("fetch", fetchSpy);
    api = createApiClient(BASE, () => "tok");
    await api.addNote("L-1", "hello");
    expect(fetchSpy).toHaveBeenCalledWith(
      "https://api.test/properties/L-1/notes",
      expect.objectContaining({ method: "POST", body: JSON.stringify({ body: "hello" }) }),
    );
  });

  it("a 400 (empty_note) from add-note surfaces as ApiError(400)", async () => {
    vi.stubGlobal("fetch", stubFetch(400, { error: "empty_note" }));
    const api = createApiClient(BASE, () => "tok");
    const err = await api.addNote("L-1", "   ").catch((e) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect(err.status).toBe(400);
  });

  it("PATCH /properties/{id} sends the patch body and returns the updated status", async () => {
    const fetchSpy = stubFetch(200, { status: "updated" });
    vi.stubGlobal("fetch", fetchSpy);
    const api = createApiClient(BASE, () => "tok");
    expect(await api.editListing("L-1", { priceThb: 5_000_000, bedrooms: 4 })).toEqual({
      status: "updated",
    });
    expect(fetchSpy).toHaveBeenCalledWith(
      "https://api.test/properties/L-1",
      expect.objectContaining({
        method: "PATCH",
        body: JSON.stringify({ priceThb: 5_000_000, bedrooms: 4 }),
      }),
    );
  });

  it("a 404 (non-claimant) from PATCH surfaces as ApiError(404)", async () => {
    vi.stubGlobal("fetch", stubFetch(404, { error: "not_found" }));
    const api = createApiClient(BASE, () => "tok");
    const err = await api.editListing("L-1", { priceThb: 1 }).catch((e) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect(err.status).toBe(404);
  });
});
