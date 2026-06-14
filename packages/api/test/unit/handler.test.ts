import type {
  ClaimResult,
  InterestFlagWithUser,
  ListingNoteRow,
  ModerationItemRow,
  MyListingCard,
  PendingModerationRow,
  PortalListingDetail,
  QuoteRow,
  RoleApplication,
  RoleRow,
  SavedListingCard,
  UserRow,
  ViewingCard,
  ViewingRow,
} from "@line-robot/db";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { type ApiDeps, handleApi, type Logger, type Repo } from "../../src/handler.ts";
import type { HttpRequest } from "../../src/http.ts";
import type { LineTokenVerifier } from "../../src/ports/lineTokenVerifier.ts";

// --- fakes ------------------------------------------------------------------

const LINE_USER = "Uline123";
const DB_USER_ID = "11111111-1111-1111-1111-111111111111";
const OTHER_USER_ID = "22222222-2222-2222-2222-222222222222";
const GROUP_ID = "33333333-3333-3333-3333-333333333333";
const LISTING_ID = "44444444-4444-4444-4444-444444444444";

const silentLogger: Logger = { warn: () => {}, error: () => {} };

/** A verifier that accepts exactly the token "good" → LINE_USER, everything else → null. */
const verifier: LineTokenVerifier = {
  verifyIdToken: async (t) => (t === "good" ? { userId: LINE_USER } : null),
};

function listingRow(
  over: Partial<PortalListingDetail["listing"]> = {},
): PortalListingDetail["listing"] {
  // Only the fields the handler reads matter; cast the rest.
  return {
    id: LISTING_ID,
    dealType: "sale",
    propertyType: "house",
    priceThb: 2_000_000,
    saleStage: "available",
    rentalStatus: null,
    province: "เชียงใหม่",
    amphoe: "เมือง",
    tambon: "สุเทพ",
    landmark: "Nimman",
    projectName: null,
    bedrooms: 3,
    bathrooms: 2,
    sourceGroupId: GROUP_ID,
    claimedByUserId: null,
    ...over,
  } as PortalListingDetail["listing"];
}

function portalDetail(
  over: Partial<PortalListingDetail["listing"]> = {},
  isSaved = false,
): PortalListingDetail {
  return {
    listing: listingRow(over),
    lat: 18.79,
    lon: 98.96,
    monthlyRent: null,
    isSaved,
    media: [
      { s3Key: "conv/x/0.jpg", thumbKey: null, kind: "photo", heroIndex: 0 },
      { s3Key: "conv/x/1.jpg", thumbKey: "derivatives/1.jpg", kind: "photo", heroIndex: 1 },
    ],
    content: [{ lang: "th", headline: "บ้าน", description: "รายละเอียด" }],
  };
}

/** A stub Repo where every member is a vi.fn() with a sane default; tests override per case. */
function makeRepo(over: Partial<Repo> = {}): Repo {
  const user: UserRow = { id: DB_USER_ID } as UserRow;
  return {
    findUserByIdentity: vi.fn(async () => user),
    createLineUser: vi.fn(async () => user),
    getPortalListingDetail: vi.fn(async () => portalDetail()),
    isGroupMember: vi.fn(async () => false),
    listMyListings: vi.fn(async () => [] as MyListingCard[]),
    claimListing: vi.fn(async () => "claimed" as ClaimResult),
    publishListing: vi.fn(async () => {}),
    keepListingPrivate: vi.fn(async () => {}),
    updateListingFields: vi.fn(async () => {}),
    updateRentalMonthlyRent: vi.fn(async () => {}),
    listSavedListingsForUser: vi.fn(async () => [] as SavedListingCard[]),
    saveListing: vi.fn(async () => {}),
    unsaveListing: vi.fn(async () => {}),
    listViewingsForUser: vi.fn(async () => ({ upcoming: [], past: [] })),
    createViewing: vi.fn(
      async (listingId, _userId, scheduledAt) =>
        ({ id: "v1", listingId, scheduledAt, status: "requested" }) as ViewingRow,
    ),
    listNotesForUserListing: vi.fn(async () => [] as ListingNoteRow[]),
    addListingNote: vi.fn(
      async (listingId, userId, body) =>
        ({ id: "n1", listingId, userId, body, createdAt: new Date() }) as ListingNoteRow,
    ),
    // Stage 6 (groups & dealflow) — sane defaults; tests override per case.
    getUserRoles: vi.fn(async () => [] as RoleRow[]),
    createInterestFlag: vi.fn(async () => {}),
    listInterestFlags: vi.fn(async () => [] as InterestFlagWithUser[]),
    applyForRole: vi.fn(async () => ({ created: true, status: "pending" }) as const),
    getLatestRoleApplication: vi.fn(async () => undefined),
    listRoleApplications: vi.fn(async () => [] as RoleApplication[]),
    setRoleApproval: vi.fn(async (roleId) => ({
      outcome: "updated" as const,
      row: { id: roleId } as RoleRow,
    })),
    listPendingModeration: vi.fn(async () => [] as PendingModerationRow[]),
    resolveModerationItem: vi.fn(async (id) => ({
      outcome: "updated" as const,
      row: { id } as ModerationItemRow,
    })),
    setListingUrgency: vi.fn(async () => {}),
    createQuote: vi.fn(async (input) => ({ id: "q1", ...input }) as QuoteRow),
    listQuotesForListing: vi.fn(async () => [] as QuoteRow[]),
    ...over,
  };
}

function deps(repo: Repo): ApiDeps {
  return {
    repo,
    verifier,
    presign: async (key) => `https://signed/${key}`,
    logger: silentLogger,
    now: () => new Date("2026-06-20T00:00:00Z"),
  };
}

function req(
  method: string,
  path: string,
  opts: { token?: string; body?: unknown } = {},
): HttpRequest {
  const token = opts.token ?? "good";
  return {
    method,
    path,
    headers: token === "" ? {} : { authorization: `Bearer ${token}` },
    rawBody: opts.body === undefined ? "" : JSON.stringify(opts.body),
  };
}

const bodyOf = (r: { body: string }) => JSON.parse(r.body);

// --- auth -------------------------------------------------------------------

describe("auth gate", () => {
  it("401s a missing token", async () => {
    const r = await handleApi(deps(makeRepo()), req("GET", "/me/listings", { token: "" }));
    expect(r.statusCode).toBe(401);
    expect(bodyOf(r)).toEqual({ error: "unauthorized" });
  });

  it("401s an invalid token", async () => {
    const r = await handleApi(deps(makeRepo()), req("GET", "/me/listings", { token: "forged" }));
    expect(r.statusCode).toBe(401);
  });

  it("resolves an existing LINE user without creating one", async () => {
    const repo = makeRepo();
    await handleApi(deps(repo), req("GET", "/me/listings"));
    expect(repo.findUserByIdentity).toHaveBeenCalledWith("line", LINE_USER);
    expect(repo.createLineUser).not.toHaveBeenCalled();
  });

  it("creates the user on first contact (none found)", async () => {
    const repo = makeRepo({ findUserByIdentity: vi.fn(async () => undefined) });
    const r = await handleApi(deps(repo), req("GET", "/me/listings"));
    expect(r.statusCode).toBe(200);
    expect(repo.createLineUser).toHaveBeenCalledWith("LINE user", LINE_USER);
  });

  it("survives a concurrent first-contact create race (unique-violation → re-read the winner)", async () => {
    // 1st lookup misses → create throws the unique-index violation (the other request won) → 2nd
    // lookup finds the winner's row. The request succeeds instead of 500ing.
    const winner: UserRow = { id: DB_USER_ID } as UserRow;
    const find = vi
      .fn<Repo["findUserByIdentity"]>()
      .mockResolvedValueOnce(undefined) // first contact: miss
      .mockResolvedValueOnce(winner); // after the failed create: the winner's row
    const repo = makeRepo({
      findUserByIdentity: find,
      createLineUser: vi.fn(async () => {
        throw new Error("duplicate key value violates unique constraint");
      }),
    });
    const r = await handleApi(deps(repo), req("GET", "/me/listings"));
    expect(r.statusCode).toBe(200);
    expect(find).toHaveBeenCalledTimes(2);
  });

  it("a genuine create failure (no winner on re-read) still 500s", async () => {
    const repo = makeRepo({
      findUserByIdentity: vi.fn(async () => undefined), // miss, and miss again on re-read
      createLineUser: vi.fn(async () => {
        throw new Error("db down");
      }),
    });
    const r = await handleApi(deps(repo), req("GET", "/me/listings"));
    expect(r.statusCode).toBe(500);
  });

  it("500s (no leak) when the repo throws", async () => {
    const repo = makeRepo({
      listMyListings: vi.fn(async () => {
        throw new Error("boom");
      }),
    });
    const r = await handleApi(deps(repo), req("GET", "/me/listings"));
    expect(r.statusCode).toBe(500);
    expect(bodyOf(r)).toEqual({ error: "internal_error" });
  });

  it("404s an unknown route", async () => {
    const r = await handleApi(deps(makeRepo()), req("GET", "/nope"));
    expect(r.statusCode).toBe(404);
  });
});

// --- my listings / saved ----------------------------------------------------

describe("GET /me/listings", () => {
  it("returns claimed cards with publish state + presigned hero", async () => {
    const repo = makeRepo({
      listMyListings: vi.fn(async () => [
        {
          listing: listingRow({ claimedByUserId: DB_USER_ID }),
          isPublished: true,
          heroThumbKey: "derivatives/h.jpg",
          monthlyRent: null, // a sale — rent rides on priceThb
        },
      ]),
    });
    const r = await handleApi(deps(repo), req("GET", "/me/listings"));
    expect(r.statusCode).toBe(200);
    const [card] = bodyOf(r);
    expect(card.id).toBe(LISTING_ID);
    expect(card.isPublished).toBe(true);
    expect(card.heroUrl).toBe("https://signed/derivatives/h.jpg");
    // A sale card carries its asking price on priceThb and a null monthlyRent.
    expect(card.priceThb).toBe(2_000_000);
    expect(card.monthlyRent).toBeNull();
  });

  it("a RENT card carries its monthly rent (the rent lives on the rental satellite, not priceThb)", async () => {
    const repo = makeRepo({
      listMyListings: vi.fn(async () => [
        {
          listing: listingRow({
            claimedByUserId: DB_USER_ID,
            dealType: "rent",
            rentalStatus: "available",
            priceThb: null, // a rental has no asking price on the listing row
          }),
          isPublished: true,
          heroThumbKey: null,
          monthlyRent: 13_000,
        },
      ]),
    });
    const r = await handleApi(deps(repo), req("GET", "/me/listings"));
    expect(r.statusCode).toBe(200);
    const [card] = bodyOf(r);
    expect(card.dealType).toBe("rent");
    expect(card.monthlyRent).toBe(13_000); // the owner can SEE their rent on the card
    expect(card.priceThb).toBeNull();
  });
});

describe("saved listings", () => {
  it("GET /me/saved returns saved cards", async () => {
    const repo = makeRepo({
      listSavedListingsForUser: vi.fn(async () => [
        { listing: listingRow(), savedAt: new Date("2026-06-19T00:00:00Z"), heroThumbKey: null },
        // SavedListingCard carries no monthlyRent (Build D) — the api passes null for saved cards.
      ]),
    });
    const r = await handleApi(deps(repo), req("GET", "/me/saved"));
    expect(r.statusCode).toBe(200);
    expect(bodyOf(r)).toHaveLength(1);
  });

  it("POST /properties/{id}/save saves", async () => {
    const repo = makeRepo();
    const r = await handleApi(deps(repo), req("POST", `/properties/${LISTING_ID}/save`));
    expect(r.statusCode).toBe(200);
    expect(repo.saveListing).toHaveBeenCalledWith(LISTING_ID, DB_USER_ID);
  });

  it("DELETE /properties/{id}/save unsaves", async () => {
    const repo = makeRepo();
    const r = await handleApi(deps(repo), req("DELETE", `/properties/${LISTING_ID}/save`));
    expect(r.statusCode).toBe(200);
    expect(repo.unsaveListing).toHaveBeenCalledWith(LISTING_ID, DB_USER_ID);
  });
});

// --- detail + authz ---------------------------------------------------------

describe("GET /properties/{id} (detail authz)", () => {
  it("the claimant sees it with a presigned gallery", async () => {
    const repo = makeRepo({
      getPortalListingDetail: vi.fn(async () => portalDetail({ claimedByUserId: DB_USER_ID })),
    });
    const r = await handleApi(deps(repo), req("GET", `/properties/${LISTING_ID}`));
    expect(r.statusCode).toBe(200);
    const d = bodyOf(r);
    expect(d.isClaimedByMe).toBe(true);
    // Default fixture is not saved → the detail reflects the persisted save state.
    expect(d.isSaved).toBe(false);
    // Gallery prefers the derivative, falls back to the original; both presigned, in hero order.
    expect(d.photos.map((p: { url: string }) => p.url)).toEqual([
      "https://signed/conv/x/0.jpg",
      "https://signed/derivatives/1.jpg",
    ]);
  });

  it("a SAVED listing's detail returns isSaved:true (the bookmark seeds from the persisted state)", async () => {
    const repo = makeRepo({
      getPortalListingDetail: vi.fn(async () =>
        portalDetail({ claimedByUserId: DB_USER_ID }, true),
      ),
    });
    const r = await handleApi(deps(repo), req("GET", `/properties/${LISTING_ID}`));
    expect(r.statusCode).toBe(200);
    expect(bodyOf(r).isSaved).toBe(true);
  });

  it("threads the caller's userId into getPortalListingDetail (so isSaved is computed for the caller)", async () => {
    const spy = vi.fn(async () => portalDetail({ claimedByUserId: DB_USER_ID }));
    await handleApi(
      deps(makeRepo({ getPortalListingDetail: spy })),
      req("GET", `/properties/${LISTING_ID}`),
    );
    // (listingId, callerUserId) — the resolved DB user, not the raw LINE subject.
    expect(spy).toHaveBeenCalledWith(LISTING_ID, DB_USER_ID);
  });

  it("a source-group member sees a listing they didn't claim", async () => {
    const repo = makeRepo({
      getPortalListingDetail: vi.fn(async () => portalDetail({ claimedByUserId: OTHER_USER_ID })),
      isGroupMember: vi.fn(async () => true),
    });
    const r = await handleApi(deps(repo), req("GET", `/properties/${LISTING_ID}`));
    expect(r.statusCode).toBe(200);
    expect(bodyOf(r).isClaimedByMe).toBe(false);
  });

  it("a non-member, non-claimant gets 404 (id stays non-enumerable)", async () => {
    const repo = makeRepo({
      getPortalListingDetail: vi.fn(async () => portalDetail({ claimedByUserId: OTHER_USER_ID })),
      isGroupMember: vi.fn(async () => false),
    });
    const r = await handleApi(deps(repo), req("GET", `/properties/${LISTING_ID}`));
    expect(r.statusCode).toBe(404);
  });

  it("404s a missing listing", async () => {
    const repo = makeRepo({ getPortalListingDetail: vi.fn(async () => undefined) });
    const r = await handleApi(deps(repo), req("GET", `/properties/${LISTING_ID}`));
    expect(r.statusCode).toBe(404);
  });
});

// --- claim (source-group authz gate + optimistic lock) ----------------------

/** A repo where the caller IS a source-group member (the authz precondition to claim). */
function memberClaimRepo(over: Partial<Repo> = {}): Repo {
  return makeRepo({ isGroupMember: vi.fn(async () => true), ...over });
}

describe("POST /properties/{id}/claim", () => {
  it("a source-group member can claim a fresh listing (200)", async () => {
    const repo = memberClaimRepo({ claimListing: vi.fn(async () => "claimed" as ClaimResult) });
    const r = await handleApi(deps(repo), req("POST", `/properties/${LISTING_ID}/claim`));
    expect(r.statusCode).toBe(200);
    expect(bodyOf(r)).toEqual({ status: "claimed" });
    expect(repo.isGroupMember).toHaveBeenCalledWith(GROUP_ID, DB_USER_ID);
    expect(repo.claimListing).toHaveBeenCalledWith(LISTING_ID, DB_USER_ID);
  });

  it("a NON-member is denied (404, listing existence not revealed) and never reaches the lock", async () => {
    const repo = makeRepo({
      isGroupMember: vi.fn(async () => false),
      claimListing: vi.fn(async () => "claimed" as ClaimResult),
    });
    const r = await handleApi(deps(repo), req("POST", `/properties/${LISTING_ID}/claim`));
    expect(r.statusCode).toBe(404);
    expect(bodyOf(r)).toEqual({ error: "not_found" });
    expect(repo.claimListing).not.toHaveBeenCalled();
  });

  it("a listing with NO source group cannot be group-claimed (404)", async () => {
    const repo = makeRepo({
      getPortalListingDetail: vi.fn(async () => portalDetail({ sourceGroupId: null })),
      // isGroupMember(null, …) returns false in the real repo; the fake honours that contract.
      isGroupMember: vi.fn(async (groupId) => groupId !== null),
      claimListing: vi.fn(async () => "claimed" as ClaimResult),
    });
    const r = await handleApi(deps(repo), req("POST", `/properties/${LISTING_ID}/claim`));
    expect(r.statusCode).toBe(404);
    expect(repo.claimListing).not.toHaveBeenCalled();
  });

  it("200 + already_yours on a same-user re-claim (idempotent)", async () => {
    const repo = memberClaimRepo({
      claimListing: vi.fn(async () => "already_yours" as ClaimResult),
    });
    const r = await handleApi(deps(repo), req("POST", `/properties/${LISTING_ID}/claim`));
    expect(r.statusCode).toBe(200);
    expect(bodyOf(r).status).toBe("already_yours");
  });

  it("409 with a clear message when another member already claimed it (within-group race)", async () => {
    const repo = memberClaimRepo({
      claimListing: vi.fn(async () => "already_claimed" as ClaimResult),
    });
    const r = await handleApi(deps(repo), req("POST", `/properties/${LISTING_ID}/claim`));
    expect(r.statusCode).toBe(409);
    expect(bodyOf(r).error).toBe("already_claimed");
    expect(typeof bodyOf(r).message).toBe("string");
  });

  it("404 when the listing doesn't exist (gate short-circuits before the lock)", async () => {
    const repo = makeRepo({
      getPortalListingDetail: vi.fn(async () => undefined),
      claimListing: vi.fn(async () => "not_found" as ClaimResult),
    });
    const r = await handleApi(deps(repo), req("POST", `/properties/${LISTING_ID}/claim`));
    expect(r.statusCode).toBe(404);
    expect(repo.claimListing).not.toHaveBeenCalled();
  });
});

// --- publish / keep-private (claimant-only) ---------------------------------

describe("publish / keep-private", () => {
  it("the claimant can publish", async () => {
    const repo = makeRepo({
      getPortalListingDetail: vi.fn(async () => portalDetail({ claimedByUserId: DB_USER_ID })),
    });
    const r = await handleApi(deps(repo), req("POST", `/properties/${LISTING_ID}/publish`));
    expect(r.statusCode).toBe(200);
    expect(bodyOf(r).status).toBe("published");
    expect(repo.publishListing).toHaveBeenCalledWith(LISTING_ID, DB_USER_ID, "v1");
  });

  it("a non-claimant CANNOT publish (404, even as a group member)", async () => {
    const repo = makeRepo({
      getPortalListingDetail: vi.fn(async () => portalDetail({ claimedByUserId: OTHER_USER_ID })),
      isGroupMember: vi.fn(async () => true),
    });
    const r = await handleApi(deps(repo), req("POST", `/properties/${LISTING_ID}/publish`));
    expect(r.statusCode).toBe(404);
    expect(repo.publishListing).not.toHaveBeenCalled();
  });

  it("the claimant can keep it group-private", async () => {
    const repo = makeRepo({
      getPortalListingDetail: vi.fn(async () => portalDetail({ claimedByUserId: DB_USER_ID })),
    });
    const r = await handleApi(deps(repo), req("POST", `/properties/${LISTING_ID}/keep-private`));
    expect(r.statusCode).toBe(200);
    expect(bodyOf(r).status).toBe("group_private");
    expect(repo.keepListingPrivate).toHaveBeenCalledWith(LISTING_ID);
  });
});

// --- owner edit (NOT edit-by-reply) -----------------------------------------

describe("PATCH /properties/{id}", () => {
  it("the claimant edits allowlisted fields", async () => {
    const repo = makeRepo({
      getPortalListingDetail: vi.fn(async () => portalDetail({ claimedByUserId: DB_USER_ID })),
    });
    const r = await handleApi(
      deps(repo),
      req("PATCH", `/properties/${LISTING_ID}`, {
        body: { landmark: " New soi ", priceThb: 2_500_000.7, ignored: "x" },
      }),
    );
    expect(r.statusCode).toBe(200);
    expect(repo.updateListingFields).toHaveBeenCalledWith(LISTING_ID, {
      landmark: "New soi",
      priceThb: 2_500_000, // truncated, trimmed; `ignored` not in the allowlist
    });
  });

  it("skips a negative numeric field (server-side non-negativity guard)", async () => {
    const repo = makeRepo({
      getPortalListingDetail: vi.fn(async () => portalDetail({ claimedByUserId: DB_USER_ID })),
    });
    const r = await handleApi(
      deps(repo),
      req("PATCH", `/properties/${LISTING_ID}`, {
        body: { landmark: "ok", priceThb: -5, bedrooms: -1 },
      }),
    );
    expect(r.statusCode).toBe(200);
    // negatives skipped; only the valid field is written
    expect(repo.updateListingFields).toHaveBeenCalledWith(LISTING_ID, { landmark: "ok" });
  });

  it("a rent listing's monthlyRent edit hits the rental satellite", async () => {
    const repo = makeRepo({
      getPortalListingDetail: vi.fn(async () =>
        portalDetail({ claimedByUserId: DB_USER_ID, dealType: "rent", rentalStatus: "available" }),
      ),
    });
    await handleApi(
      deps(repo),
      req("PATCH", `/properties/${LISTING_ID}`, { body: { monthlyRent: 15_000 } }),
    );
    expect(repo.updateRentalMonthlyRent).toHaveBeenCalledWith(LISTING_ID, 15_000);
  });

  it("a non-claimant cannot edit (404)", async () => {
    const repo = makeRepo({
      getPortalListingDetail: vi.fn(async () => portalDetail({ claimedByUserId: OTHER_USER_ID })),
      isGroupMember: vi.fn(async () => true),
    });
    const r = await handleApi(
      deps(repo),
      req("PATCH", `/properties/${LISTING_ID}`, { body: { landmark: "x" } }),
    );
    expect(r.statusCode).toBe(404);
    expect(repo.updateListingFields).not.toHaveBeenCalled();
  });
});

// --- viewings ---------------------------------------------------------------

describe("viewings", () => {
  it("GET /me/viewings returns upcoming + past", async () => {
    const card = (over: Partial<ViewingRow>): ViewingCard => ({
      viewing: {
        id: "v",
        listingId: LISTING_ID,
        requestedByUserId: DB_USER_ID,
        scheduledAt: new Date(),
        status: "requested",
        ...over,
      } as ViewingRow,
      listing: listingRow(),
      heroThumbKey: null,
    });
    const repo = makeRepo({
      listViewingsForUser: vi.fn(async () => ({
        upcoming: [card({ id: "u1" })],
        past: [card({ id: "p1" })],
      })),
    });
    const r = await handleApi(deps(repo), req("GET", "/me/viewings"));
    expect(r.statusCode).toBe(200);
    const body = bodyOf(r);
    expect(body.upcoming).toHaveLength(1);
    expect(body.past).toHaveLength(1);
  });

  it("POST /properties/{id}/viewings creates a viewing (members allowed)", async () => {
    const repo = makeRepo({
      getPortalListingDetail: vi.fn(async () => portalDetail({ claimedByUserId: OTHER_USER_ID })),
      isGroupMember: vi.fn(async () => true),
    });
    const r = await handleApi(
      deps(repo),
      req("POST", `/properties/${LISTING_ID}/viewings`, {
        body: { scheduledAt: "2026-07-01T10:00:00Z" },
      }),
    );
    expect(r.statusCode).toBe(201);
    expect(repo.createViewing).toHaveBeenCalledWith(
      LISTING_ID,
      DB_USER_ID,
      new Date("2026-07-01T10:00:00Z"),
    );
  });

  it("400s a missing/invalid scheduledAt", async () => {
    const repo = makeRepo({
      getPortalListingDetail: vi.fn(async () => portalDetail({ claimedByUserId: DB_USER_ID })),
    });
    const r = await handleApi(
      deps(repo),
      req("POST", `/properties/${LISTING_ID}/viewings`, { body: { scheduledAt: "not-a-date" } }),
    );
    expect(r.statusCode).toBe(400);
    expect(bodyOf(r).error).toBe("invalid_time");
  });

  it("400s a past scheduledAt (server-side future-time guard)", async () => {
    const repo = makeRepo({
      getPortalListingDetail: vi.fn(async () => portalDetail({ claimedByUserId: DB_USER_ID })),
    });
    // deps.now() = 2026-06-20; this is in the past
    const r = await handleApi(
      deps(repo),
      req("POST", `/properties/${LISTING_ID}/viewings`, {
        body: { scheduledAt: "2026-06-01T00:00:00Z" },
      }),
    );
    expect(r.statusCode).toBe(400);
    expect(bodyOf(r).error).toBe("invalid_time");
    expect(repo.createViewing).not.toHaveBeenCalled();
  });
});

// --- notes ------------------------------------------------------------------

describe("notes (per-user)", () => {
  beforeEach(() => vi.clearAllMocks());

  it("GET /properties/{id}/notes returns the caller's notes", async () => {
    const repo = makeRepo({
      getPortalListingDetail: vi.fn(async () => portalDetail({ claimedByUserId: DB_USER_ID })),
      listNotesForUserListing: vi.fn(async () => [
        {
          id: "n1",
          listingId: LISTING_ID,
          userId: DB_USER_ID,
          body: "note",
          createdAt: new Date(),
        } as ListingNoteRow,
      ]),
    });
    const r = await handleApi(deps(repo), req("GET", `/properties/${LISTING_ID}/notes`));
    expect(r.statusCode).toBe(200);
    expect(bodyOf(r)[0].body).toBe("note");
    expect(repo.listNotesForUserListing).toHaveBeenCalledWith(LISTING_ID, DB_USER_ID);
  });

  it("POST /properties/{id}/notes adds a note (members allowed)", async () => {
    const repo = makeRepo({
      getPortalListingDetail: vi.fn(async () => portalDetail({ claimedByUserId: OTHER_USER_ID })),
      isGroupMember: vi.fn(async () => true),
    });
    const r = await handleApi(
      deps(repo),
      req("POST", `/properties/${LISTING_ID}/notes`, { body: { body: "  hello  " } }),
    );
    expect(r.statusCode).toBe(201);
    expect(repo.addListingNote).toHaveBeenCalledWith(LISTING_ID, DB_USER_ID, "hello");
  });

  it("400s an empty note", async () => {
    const repo = makeRepo({
      getPortalListingDetail: vi.fn(async () => portalDetail({ claimedByUserId: DB_USER_ID })),
    });
    const r = await handleApi(
      deps(repo),
      req("POST", `/properties/${LISTING_ID}/notes`, { body: { body: "   " } }),
    );
    expect(r.statusCode).toBe(400);
  });
});
