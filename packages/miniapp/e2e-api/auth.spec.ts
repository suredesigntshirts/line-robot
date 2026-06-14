import { expect, test } from "@playwright/test";

// REAL verifier-stub auth contract (INC-2). The LIFF mock always emits the VALID fixture token, so the
// SPA can't drive the 401 path — we hit the real api directly (via the test request context) to prove
// the stub `LineTokenVerifier` actually REJECTS a bad/absent token (the real 401), and ADMITS the
// fixture token. This is the seam the static gate's mockApi never exercised (it fulfilled every
// request 200 regardless of the token).

const SERVER_PORT = Number(process.env.E2E_API_PORT || 4331);
const API = `http://localhost:${SERVER_PORT}/__api`;

test.describe("real verifier-stub auth", () => {
  test("a request with a BAD bearer token is rejected 401 by the real verifier", async ({
    request,
  }) => {
    const res = await request.get(`${API}/me/listings`, {
      headers: { authorization: "Bearer not-the-fixture-token" },
      failOnStatusCode: false,
    });
    expect(res.status()).toBe(401);
  });

  test("a request with NO authorization header is rejected 401", async ({ request }) => {
    const res = await request.get(`${API}/me/listings`, { failOnStatusCode: false });
    expect(res.status()).toBe(401);
  });

  test("the valid fixture token is ADMITTED (200) — the stub maps it to the seeded user", async ({
    request,
  }) => {
    const res = await request.get(`${API}/me/listings`, {
      headers: { authorization: "Bearer e2e.fixture.id-token" },
      failOnStatusCode: false,
    });
    expect(res.status()).toBe(200);
  });
});
