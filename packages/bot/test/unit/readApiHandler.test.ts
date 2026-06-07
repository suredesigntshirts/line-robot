import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { describe, expect, it } from "vitest";
import { handleReadApi, type ReadApiDeps } from "../../src/app/readApiHandler.js";
import type { LineTokenVerifier } from "../../src/core/ports/lineTokenVerifier.js";
import type { MediaUrlSigner } from "../../src/core/ports/mediaUrlSigner.js";
import { FakeCatalog } from "../fixtures/fakeCatalog.js";

const USER = "Ualice";
const CONV = "group#G1";

/** Verifier that accepts exactly one good token; everything else (incl. "") → null. */
const verifier: LineTokenVerifier = {
  async verifyIdToken(token) {
    return token === "good" ? { userId: USER } : null;
  },
};

/** Signer that presigns to `signed:<key>` but throws for any key containing "boom". */
const signer: MediaUrlSigner = {
  async presignGet(key) {
    if (key.includes("boom")) {
      throw new Error("presign failed");
    }
    return `signed:${key}`;
  },
};

function deps(catalog: FakeCatalog): ReadApiDeps {
  return {
    catalog,
    signer,
    verifier,
    logger: { info() {}, warn() {}, error() {} },
    clock: { now: () => 1_000_000 },
  };
}

function event(
  method: string,
  path: string,
  headers: Record<string, string> = {},
): APIGatewayProxyEventV2 {
  return {
    rawPath: path,
    headers,
    requestContext: { http: { method, path } },
  } as unknown as APIGatewayProxyEventV2;
}

const AUTH = { authorization: "Bearer good" };

function seeded(): FakeCatalog {
  const catalog = new FakeCatalog();
  catalog
    .seedProperty({
      propertyId: "p1",
      normalizedAddress: "123 Sukhumvit",
      status: "negotiating",
      askingPrice: 5_000_000,
      currency: "THB",
      lastActivityAt: 200,
      photos: [
        { s3Key: "p1/hero.jpg", kind: "property", label: "front" },
        { s3Key: "p1/deed.jpg", kind: "chanote" },
      ],
    })
    .seedProperty({ propertyId: "p2", projectName: "The Park", lastActivityAt: 100 })
    .seedEdge(CONV, "p1")
    .seedEdge(CONV, "p2")
    .seedMembership(USER, CONV);
  return catalog;
}

function body(res: APIGatewayProxyResultV2): unknown {
  return JSON.parse((res as { body: string }).body);
}

describe("handleReadApi auth", () => {
  it("401s when the Authorization header is missing", async () => {
    const res = (await handleReadApi(deps(seeded()), event("GET", "/me/properties"))) as {
      statusCode: number;
    };
    expect(res.statusCode).toBe(401);
  });

  it("401s when the token is invalid", async () => {
    const res = (await handleReadApi(
      deps(seeded()),
      event("GET", "/me/properties", { authorization: "Bearer nope" }),
    )) as { statusCode: number };
    expect(res.statusCode).toBe(401);
  });

  it("does NOT set its own CORS headers (the Function URL config owns CORS — a duplicate access-control-allow-origin would be invalid and break the browser fetch)", async () => {
    const res = (await handleReadApi(deps(seeded()), event("GET", "/me/properties"))) as {
      headers: Record<string, string>;
    };
    expect(res.headers["access-control-allow-origin"]).toBeUndefined();
  });
});

describe("GET /me/properties", () => {
  it("returns the caller's listings (recency-sorted) with a presigned hero", async () => {
    const res = await handleReadApi(deps(seeded()), event("GET", "/me/properties", AUTH));
    const list = body(res) as Array<{ propertyId: string; heroUrl?: string }>;
    expect(list.map((p) => p.propertyId)).toEqual(["p1", "p2"]); // p1 newer
    expect(list[0]?.heroUrl).toBe("signed:p1/hero.jpg"); // first `property` photo
    expect(list[1]?.heroUrl).toBeUndefined(); // p2 has no photos
  });
});

describe("GET /properties/{id}", () => {
  it("returns the full detail + presigned gallery for an owned listing", async () => {
    const res = await handleReadApi(deps(seeded()), event("GET", "/properties/p1", AUTH));
    const detail = body(res) as {
      title: string;
      photos: Array<{ url: string; kind: string; label?: string }>;
    };
    expect(detail.title).toBe("123 Sukhumvit");
    expect(detail.photos).toEqual([
      { url: "signed:p1/hero.jpg", kind: "property", label: "front" },
      { url: "signed:p1/deed.jpg", kind: "chanote" },
    ]);
  });

  it("404s a property the caller cannot reach (membership enforced, not just existence)", async () => {
    const catalog = seeded();
    // A property that exists but is NOT linked to any of the caller's conversations.
    catalog.seedProperty({ propertyId: "secret", normalizedAddress: "hidden" });
    const res = (await handleReadApi(deps(catalog), event("GET", "/properties/secret", AUTH))) as {
      statusCode: number;
    };
    expect(res.statusCode).toBe(404);
  });

  it("does not 500 when one photo fails to presign — it drops the bad one", async () => {
    const catalog = seeded();
    catalog.seedProperty({
      propertyId: "p3",
      normalizedAddress: "with bad photo",
      photos: [
        { s3Key: "p3/ok.jpg", kind: "property" },
        { s3Key: "p3/boom.jpg", kind: "other" },
      ],
    });
    catalog.seedEdge(CONV, "p3");
    const res = (await handleReadApi(deps(catalog), event("GET", "/properties/p3", AUTH))) as {
      statusCode: number;
    };
    expect(res.statusCode).toBe(200);
    const detail = body(res) as { photos: Array<{ url: string }> };
    expect(detail.photos).toEqual([{ url: "signed:p3/ok.jpg", kind: "property" }]);
  });
});

describe("GET /me/upcoming", () => {
  it("returns the caller's un-notified follow-ups, soonest first", async () => {
    const catalog = seeded();
    catalog
      .seedEvent({ eventId: "e1", propertyId: "p1", dueAt: 5000, notifyConversationKey: CONV })
      .seedEvent({ eventId: "e2", propertyId: "p2", dueAt: 2000, notifyConversationKey: CONV })
      .seedEvent({
        eventId: "e3",
        propertyId: "p1",
        dueAt: 9000,
        notifyConversationKey: CONV,
        notifiedAt: 1, // already fired — excluded
      });
    const res = await handleReadApi(deps(catalog), event("GET", "/me/upcoming", AUTH));
    const rows = body(res) as Array<{ eventId?: string; dueAt: number; propertyTitle: string }>;
    expect(rows.map((r) => r.dueAt)).toEqual([2000, 5000]);
    expect(rows[0]?.propertyTitle).toBe("The Park");
  });
});

describe("routing", () => {
  it("404s an unknown route", async () => {
    const res = (await handleReadApi(deps(seeded()), event("GET", "/nope", AUTH))) as {
      statusCode: number;
    };
    expect(res.statusCode).toBe(404);
  });
});
