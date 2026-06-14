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
  ViewingRow,
} from "@line-robot/db";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { type ApiDeps, handleApi, type Logger, type Repo } from "../../src/handler.ts";
import type { HttpRequest } from "../../src/http.ts";
import type { LineTokenVerifier } from "../../src/ports/lineTokenVerifier.ts";

// Stage 6 (groups & dealflow, INC-B2) — the new endpoints + the SERVER-SIDE role/vetted gates. These
// tests prove the two spec-auditor invariants BITE: (1) every /admin/* route is rejected for a caller
// whose role rows do NOT include an approved `admin` (the default Repo has none); (2) the quote-submit
// path is rejected for a caller without an approved broker/investor role. The gate reads the role
// SERVER-SIDE from `getUserRoles` — the client never asserts its own role.

const LINE_USER = "Uadmin";
const DB_USER_ID = "11111111-1111-1111-1111-111111111111";
const OTHER_USER_ID = "22222222-2222-2222-2222-222222222222";
const GROUP_ID = "33333333-3333-3333-3333-333333333333";
const LISTING_ID = "44444444-4444-4444-4444-444444444444";
const ROLE_ID = "55555555-5555-5555-5555-555555555555";
const MOD_ID = "66666666-6666-6666-6666-666666666666";

const silentLogger: Logger = { warn: () => {}, error: () => {} };

const verifier: LineTokenVerifier = {
  verifyIdToken: async (t) => (t === "good" ? { userId: LINE_USER } : null),
};

function listingRow(
  over: Partial<PortalListingDetail["listing"]> = {},
): PortalListingDetail["listing"] {
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

function portalDetail(over: Partial<PortalListingDetail["listing"]> = {}): PortalListingDetail {
  return {
    listing: listingRow(over),
    lat: 18.79,
    lon: 98.96,
    monthlyRent: null,
    isSaved: false,
    media: [],
    content: [{ lang: "th", headline: "บ้าน", description: "x" }],
  };
}

/** Build a role row of the given kind/status (the gate reads kind + approvalStatus). */
function role(kind: RoleRow["kind"], approvalStatus: RoleRow["approvalStatus"]): RoleRow {
  return {
    id: ROLE_ID,
    userId: DB_USER_ID,
    kind,
    approvalStatus,
    reviewedBy: null,
    reviewedAt: null,
  };
}

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
    // Stage 6 — defaults: NO roles (the gate's deny-by-default baseline).
    getUserRoles: vi.fn(async () => [] as RoleRow[]),
    createInterestFlag: vi.fn(async () => {}),
    listInterestFlags: vi.fn(async () => [] as InterestFlagWithUser[]),
    applyForRole: vi.fn(async () => ({ created: true, status: "pending" }) as const),
    getLatestRoleApplication: vi.fn(async () => undefined),
    listRoleApplications: vi.fn(async () => [] as RoleApplication[]),
    setRoleApproval: vi.fn(async () => ({
      outcome: "updated" as const,
      row: role("broker", "approved"),
    })),
    listPendingModeration: vi.fn(async () => [] as PendingModerationRow[]),
    resolveModerationItem: vi.fn(async (id) => ({
      outcome: "updated" as const,
      row: { id, status: "approved" } as ModerationItemRow,
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

/** A repo whose caller IS an approved admin (the admit precondition for /admin/* routes). */
const adminRepo = (over: Partial<Repo> = {}): Repo =>
  makeRepo({ getUserRoles: vi.fn(async () => [role("admin", "approved")]), ...over });

beforeEach(() => vi.clearAllMocks());

// --- interest flags ---------------------------------------------------------

describe("interest flags", () => {
  it("a source-group member can flag interest (201, idempotent)", async () => {
    const repo = makeRepo({
      getPortalListingDetail: vi.fn(async () => portalDetail({ claimedByUserId: OTHER_USER_ID })),
      isGroupMember: vi.fn(async () => true),
    });
    const r = await handleApi(deps(repo), req("POST", `/properties/${LISTING_ID}/interest`));
    expect(r.statusCode).toBe(201);
    expect(bodyOf(r)).toEqual({ status: "flagged" });
    expect(repo.createInterestFlag).toHaveBeenCalledWith(LISTING_ID, DB_USER_ID);
  });

  it("a non-member, non-claimant CANNOT flag interest (404)", async () => {
    const repo = makeRepo({
      getPortalListingDetail: vi.fn(async () => portalDetail({ claimedByUserId: OTHER_USER_ID })),
      isGroupMember: vi.fn(async () => false),
    });
    const r = await handleApi(deps(repo), req("POST", `/properties/${LISTING_ID}/interest`));
    expect(r.statusCode).toBe(404);
    expect(repo.createInterestFlag).not.toHaveBeenCalled();
  });

  it("the CLAIMANT can list the flags", async () => {
    const repo = makeRepo({
      getPortalListingDetail: vi.fn(async () => portalDetail({ claimedByUserId: DB_USER_ID })),
      listInterestFlags: vi.fn(async () => [
        { id: "f1", userId: OTHER_USER_ID, displayName: "Ploy", createdAt: new Date() },
      ]),
    });
    const r = await handleApi(deps(repo), req("GET", `/properties/${LISTING_ID}/interest`));
    expect(r.statusCode).toBe(200);
    expect(bodyOf(r)[0]).toMatchObject({ userId: OTHER_USER_ID, displayName: "Ploy" });
  });

  it("an ADMIN (non-claimant) can list the flags", async () => {
    const repo = adminRepo({
      getPortalListingDetail: vi.fn(async () => portalDetail({ claimedByUserId: OTHER_USER_ID })),
      isGroupMember: vi.fn(async () => false),
      listInterestFlags: vi.fn(async () => [
        { id: "f1", userId: OTHER_USER_ID, displayName: "Ploy", createdAt: new Date() },
      ]),
    });
    const r = await handleApi(deps(repo), req("GET", `/properties/${LISTING_ID}/interest`));
    expect(r.statusCode).toBe(200);
    expect(bodyOf(r)).toHaveLength(1);
  });

  it("a NON-claimant NON-admin (even a member) CANNOT list the flags (404 — the gate bites)", async () => {
    const repo = makeRepo({
      getPortalListingDetail: vi.fn(async () => portalDetail({ claimedByUserId: OTHER_USER_ID })),
      isGroupMember: vi.fn(async () => true), // a member, but not the claimant and not admin
      listInterestFlags: vi.fn(async () => [
        { id: "f1", userId: OTHER_USER_ID, displayName: "Ploy", createdAt: new Date() },
      ]),
    });
    const r = await handleApi(deps(repo), req("GET", `/properties/${LISTING_ID}/interest`));
    expect(r.statusCode).toBe(404);
    expect(repo.listInterestFlags).not.toHaveBeenCalled();
  });
});

// --- role application -------------------------------------------------------

describe("POST /me/role-application", () => {
  it("creates a PENDING role + stores the preferences atomically (assert applyForRole received them)", async () => {
    const repo = makeRepo();
    const r = await handleApi(
      deps(repo),
      req("POST", "/me/role-application", {
        body: {
          kind: "broker",
          provinces: ["เชียงใหม่"],
          propertyTypes: ["condo", "house"],
          priceBandIds: ["s2"],
        },
      }),
    );
    expect(r.statusCode).toBe(201);
    expect(bodyOf(r)).toEqual({ status: "pending" });
    // One atomic call (fix E) — role + prefs together, not two separate repo writes.
    expect(repo.applyForRole).toHaveBeenCalledWith(DB_USER_ID, "broker", {
      provinces: ["เชียงใหม่"],
      propertyTypes: ["condo", "house"],
      priceBandIds: ["s2"],
    });
  });

  it("defaults missing preference arrays to [] (any)", async () => {
    const repo = makeRepo();
    await handleApi(
      deps(repo),
      req("POST", "/me/role-application", { body: { kind: "investor" } }),
    );
    expect(repo.applyForRole).toHaveBeenCalledWith(DB_USER_ID, "investor", {
      provinces: [],
      propertyTypes: [],
      priceBandIds: [],
    });
  });

  it("re-application guard (fix D): an existing live role → 200 with its status, NO duplicate insert", async () => {
    // applyForRole returns created:false when the user already has a live (pending/approved) role.
    const repo = makeRepo({
      applyForRole: vi.fn(async () => ({ created: false, status: "approved" }) as const),
    });
    const r = await handleApi(
      deps(repo),
      req("POST", "/me/role-application", { body: { kind: "broker" } }),
    );
    // 200 (not 201) — nothing was created; the existing standing is reported.
    expect(r.statusCode).toBe(200);
    expect(bodyOf(r)).toEqual({ status: "approved" });
  });

  it("400s an invalid kind (only broker/investor)", async () => {
    const repo = makeRepo();
    const r = await handleApi(
      deps(repo),
      req("POST", "/me/role-application", { body: { kind: "admin" } }),
    );
    expect(r.statusCode).toBe(400);
    expect(repo.applyForRole).not.toHaveBeenCalled();
  });

  it("400s a non-JSON body", async () => {
    const repo = makeRepo();
    const r = await handleApi(deps(repo), req("POST", "/me/role-application"));
    expect(r.statusCode).toBe(400);
    expect(repo.applyForRole).not.toHaveBeenCalled();
  });

  it("GET /me/role-application returns the caller's status", async () => {
    const repo = makeRepo({
      getLatestRoleApplication: vi.fn(async () => role("broker", "approved")),
    });
    const r = await handleApi(deps(repo), req("GET", "/me/role-application"));
    expect(r.statusCode).toBe(200);
    expect(bodyOf(r)).toEqual({ kind: "broker", status: "approved" });
  });

  it("GET /me/role-application for a user who NEVER applied → {kind:null,status:'none'} (fix L)", async () => {
    const repo = makeRepo({ getLatestRoleApplication: vi.fn(async () => undefined) });
    const r = await handleApi(deps(repo), req("GET", "/me/role-application"));
    expect(r.statusCode).toBe(200);
    expect(bodyOf(r)).toEqual({ kind: null, status: "none" });
  });
});

// --- admin gate (the spec-auditor invariant — BITES) ------------------------

describe("admin gate (server-side, never UI-gated)", () => {
  // The default makeRepo has NO admin role → every /admin/* route must be rejected. Proving the gate
  // bites: an admin-less Repo never reaches the underlying repo read/write.
  const adminRoutes: ReadonlyArray<[string, string, unknown]> = [
    ["GET", "/admin/role-applications", undefined],
    ["POST", `/admin/role-applications/${ROLE_ID}`, { decision: "approved" }],
    ["GET", "/admin/moderation", undefined],
    ["POST", `/admin/moderation/${MOD_ID}`, { decision: "approved" }],
  ];

  for (const [method, path, body] of adminRoutes) {
    it(`${method} ${path} is REJECTED for a non-admin (404, no leak)`, async () => {
      const repo = makeRepo(); // no roles
      const r = await handleApi(deps(repo), req(method, path, { body }));
      expect(r.statusCode).toBe(404);
      // The gate short-circuits BEFORE any underlying repo action.
      expect(repo.listRoleApplications).not.toHaveBeenCalled();
      expect(repo.setRoleApproval).not.toHaveBeenCalled();
      expect(repo.listPendingModeration).not.toHaveBeenCalled();
      expect(repo.resolveModerationItem).not.toHaveBeenCalled();
    });
  }

  it("a PENDING admin role is NOT enough (only an approved admin is admitted)", async () => {
    const repo = makeRepo({ getUserRoles: vi.fn(async () => [role("admin", "pending")]) });
    const r = await handleApi(deps(repo), req("GET", "/admin/role-applications"));
    expect(r.statusCode).toBe(404);
    expect(repo.listRoleApplications).not.toHaveBeenCalled();
  });

  it("an approved NON-admin role (broker) is NOT admin", async () => {
    const repo = makeRepo({ getUserRoles: vi.fn(async () => [role("broker", "approved")]) });
    const r = await handleApi(deps(repo), req("GET", "/admin/moderation"));
    expect(r.statusCode).toBe(404);
    expect(repo.listPendingModeration).not.toHaveBeenCalled();
  });
});

describe("admin vetting + moderation (an approved admin is admitted)", () => {
  it("GET /admin/role-applications lists the pending queue", async () => {
    const repo = adminRepo({
      listRoleApplications: vi.fn(async () => [
        {
          roleId: ROLE_ID,
          userId: OTHER_USER_ID,
          displayName: "Somchai",
          kind: "broker",
          approvalStatus: "pending",
        } as RoleApplication,
      ]),
    });
    const r = await handleApi(deps(repo), req("GET", "/admin/role-applications"));
    expect(r.statusCode).toBe(200);
    expect(repo.listRoleApplications).toHaveBeenCalledWith("pending");
    expect(bodyOf(r)[0]).toMatchObject({ roleId: ROLE_ID, kind: "broker", displayName: "Somchai" });
  });

  it("POST /admin/role-applications/{roleId} approves — setRoleApproval gets the ADMIN's id", async () => {
    const repo = adminRepo({
      setRoleApproval: vi.fn(async () => ({
        outcome: "updated" as const,
        row: role("broker", "approved"),
      })),
    });
    const r = await handleApi(
      deps(repo),
      req("POST", `/admin/role-applications/${ROLE_ID}`, { body: { decision: "approved" } }),
    );
    expect(r.statusCode).toBe(200);
    expect(bodyOf(r)).toEqual({ status: "approved" });
    // The reviewer stamped is the resolved admin user (server-side), not anything from the body.
    expect(repo.setRoleApproval).toHaveBeenCalledWith(ROLE_ID, "approved", DB_USER_ID);
  });

  it("POST /admin/role-applications/{roleId} rejects", async () => {
    const repo = adminRepo({
      setRoleApproval: vi.fn(async () => ({
        outcome: "updated" as const,
        row: role("broker", "rejected"),
      })),
    });
    const r = await handleApi(
      deps(repo),
      req("POST", `/admin/role-applications/${ROLE_ID}`, { body: { decision: "rejected" } }),
    );
    expect(r.statusCode).toBe(200);
    expect(bodyOf(r)).toEqual({ status: "rejected" });
    expect(repo.setRoleApproval).toHaveBeenCalledWith(ROLE_ID, "rejected", DB_USER_ID);
  });

  it("terminal-state guard (fix B): vetting an ALREADY-DECIDED role → 409, the prior status STANDS", async () => {
    // setRoleApproval reports already_decided; the handler must 409 and NOT report the attempted flip.
    const repo = adminRepo({
      setRoleApproval: vi.fn(async () => ({
        outcome: "already_decided" as const,
        row: role("broker", "approved"),
      })),
    });
    const r = await handleApi(
      deps(repo),
      // A stale request trying to flip approved → rejected.
      req("POST", `/admin/role-applications/${ROLE_ID}`, { body: { decision: "rejected" } }),
    );
    expect(r.statusCode).toBe(409);
    // The response reports the STANDING status (approved), never the rejected the stale request asked for.
    expect(bodyOf(r)).toMatchObject({ error: "already_decided", status: "approved" });
  });

  it("400s an invalid decision", async () => {
    const repo = adminRepo();
    const r = await handleApi(
      deps(repo),
      req("POST", `/admin/role-applications/${ROLE_ID}`, { body: { decision: "maybe" } }),
    );
    expect(r.statusCode).toBe(400);
    expect(repo.setRoleApproval).not.toHaveBeenCalled();
  });

  it("404s vetting a role that doesn't exist (setRoleApproval → not_found)", async () => {
    const repo = adminRepo({
      setRoleApproval: vi.fn(async () => ({ outcome: "not_found" }) as const),
    });
    const r = await handleApi(
      deps(repo),
      req("POST", `/admin/role-applications/${ROLE_ID}`, { body: { decision: "approved" } }),
    );
    expect(r.statusCode).toBe(404);
  });

  it("GET /admin/moderation lists pending items", async () => {
    const repo = adminRepo({
      listPendingModeration: vi.fn(async () => [
        {
          id: MOD_ID,
          targetType: "listing",
          targetId: LISTING_ID,
          reason: "blocklist",
          createdAt: new Date(),
          headline: "บ้านสวย",
        } as PendingModerationRow,
      ]),
    });
    const r = await handleApi(deps(repo), req("GET", "/admin/moderation"));
    expect(r.statusCode).toBe(200);
    expect(bodyOf(r)[0]).toMatchObject({ id: MOD_ID, listingId: LISTING_ID, headline: "บ้านสวย" });
  });

  it("POST /admin/moderation/{id} records the decision; it does NOT publish the listing (fix I)", async () => {
    // v1: resolve marks the moderation_item; it does NOT make the listing publicly visible (no
    // publish-consent grant — LEGAL-02; the listing-lifecycle wiring is queued, not built here).
    const repo = adminRepo({
      resolveModerationItem: vi.fn(async (id) => ({
        outcome: "updated" as const,
        row: { id, status: "approved" } as ModerationItemRow,
      })),
    });
    const r = await handleApi(
      deps(repo),
      req("POST", `/admin/moderation/${MOD_ID}`, { body: { decision: "approved" } }),
    );
    expect(r.statusCode).toBe(200);
    expect(bodyOf(r)).toEqual({ status: "approved" });
    expect(repo.resolveModerationItem).toHaveBeenCalledWith(MOD_ID, "approved");
    // Resolving does NOT publish the listing (no publish-consent grant — LEGAL-02 + fix I).
    expect(repo.publishListing).not.toHaveBeenCalled();
  });

  it("terminal-state guard (fix B): resolving an ALREADY-DECIDED item → 409, prior status stands", async () => {
    const repo = adminRepo({
      resolveModerationItem: vi.fn(async (id) => ({
        outcome: "already_decided" as const,
        row: { id, status: "approved" } as ModerationItemRow,
      })),
    });
    const r = await handleApi(
      deps(repo),
      req("POST", `/admin/moderation/${MOD_ID}`, { body: { decision: "rejected" } }),
    );
    expect(r.statusCode).toBe(409);
    expect(bodyOf(r)).toMatchObject({ error: "already_decided", status: "approved" });
  });

  it("404s resolving a moderation item that doesn't exist (resolveModerationItem → not_found)", async () => {
    const repo = adminRepo({
      resolveModerationItem: vi.fn(async () => ({ outcome: "not_found" }) as const),
    });
    const r = await handleApi(
      deps(repo),
      req("POST", `/admin/moderation/${MOD_ID}`, { body: { decision: "rejected" } }),
    );
    expect(r.statusCode).toBe(404);
  });
});

// --- quick-sale flag (claimant-only) ----------------------------------------

describe("POST /properties/{id}/quick-sale", () => {
  it("the claimant flags quick-sale (200)", async () => {
    const repo = makeRepo({
      getPortalListingDetail: vi.fn(async () => portalDetail({ claimedByUserId: DB_USER_ID })),
    });
    const r = await handleApi(deps(repo), req("POST", `/properties/${LISTING_ID}/quick-sale`));
    expect(r.statusCode).toBe(200);
    expect(bodyOf(r)).toEqual({ status: "quick_sale" });
    expect(repo.setListingUrgency).toHaveBeenCalledWith(LISTING_ID, "quick_sale");
  });

  it("a NON-claimant (even a group member) CANNOT flag quick-sale (404)", async () => {
    const repo = makeRepo({
      getPortalListingDetail: vi.fn(async () => portalDetail({ claimedByUserId: OTHER_USER_ID })),
      isGroupMember: vi.fn(async () => true),
    });
    const r = await handleApi(deps(repo), req("POST", `/properties/${LISTING_ID}/quick-sale`));
    expect(r.statusCode).toBe(404);
    expect(repo.setListingUrgency).not.toHaveBeenCalled();
  });

  it("quick-sale on a RENT listing is REJECTED (fix F — quick-sale is sale-only)", async () => {
    const repo = makeRepo({
      getPortalListingDetail: vi.fn(async () =>
        portalDetail({ claimedByUserId: DB_USER_ID, dealType: "rent", rentalStatus: "available" }),
      ),
    });
    const r = await handleApi(deps(repo), req("POST", `/properties/${LISTING_ID}/quick-sale`));
    expect(r.statusCode).toBe(409);
    expect(bodyOf(r)).toEqual({ error: "not_a_sale_listing" });
    expect(repo.setListingUrgency).not.toHaveBeenCalled();
  });
});

// --- quotes (vetted gate — the spec-auditor invariant — BITES) --------------

/** A quick-sale listing detail (the only valid quote target per fix A). */
const quickSaleDetail = (over: Partial<PortalListingDetail["listing"]> = {}) =>
  portalDetail({ urgency: "quick_sale", ...over });

/** A vetted-broker Repo whose listing is a live quick-sale target (the quote happy-path baseline). */
const vettedQuoteRepo = (over: Partial<Repo> = {}): Repo =>
  makeRepo({
    getUserRoles: vi.fn(async () => [role("broker", "approved")]),
    getPortalListingDetail: vi.fn(async () => quickSaleDetail()),
    ...over,
  });

describe("POST /properties/{id}/quotes (vetted gate)", () => {
  it("an UNVETTED user CANNOT submit a quote (403 — the gate bites; createQuote never runs)", async () => {
    const repo = makeRepo({ getPortalListingDetail: vi.fn(async () => quickSaleDetail()) }); // no roles → not vetted
    const r = await handleApi(
      deps(repo),
      req("POST", `/properties/${LISTING_ID}/quotes`, { body: { amountThb: 1_900_000 } }),
    );
    expect(r.statusCode).toBe(403);
    expect(bodyOf(r)).toEqual({ error: "not_vetted" });
    expect(repo.createQuote).not.toHaveBeenCalled();
  });

  it("a PENDING broker is NOT vetted (403)", async () => {
    const repo = makeRepo({
      getUserRoles: vi.fn(async () => [role("broker", "pending")]),
      getPortalListingDetail: vi.fn(async () => quickSaleDetail()),
    });
    const r = await handleApi(
      deps(repo),
      req("POST", `/properties/${LISTING_ID}/quotes`, { body: { amountThb: 1_900_000 } }),
    );
    expect(r.statusCode).toBe(403);
    expect(repo.createQuote).not.toHaveBeenCalled();
  });

  it("a vetted broker quoting a NON-EXISTENT listing → 404 (fix A — never hits the FK / 500s)", async () => {
    const repo = vettedQuoteRepo({ getPortalListingDetail: vi.fn(async () => undefined) });
    const r = await handleApi(
      deps(repo),
      req("POST", `/properties/${LISTING_ID}/quotes`, { body: { amountThb: 1_900_000 } }),
    );
    expect(r.statusCode).toBe(404);
    expect(repo.createQuote).not.toHaveBeenCalled();
  });

  it("a vetted broker quoting a listing that is NOT quick_sale → 409 (fix A)", async () => {
    const repo = vettedQuoteRepo({
      // a normal (non-quick-sale) listing — the default fixture's urgency is undefined / not quick_sale
      getPortalListingDetail: vi.fn(async () => portalDetail({ urgency: "normal" })),
    });
    const r = await handleApi(
      deps(repo),
      req("POST", `/properties/${LISTING_ID}/quotes`, { body: { amountThb: 1_900_000 } }),
    );
    expect(r.statusCode).toBe(409);
    expect(bodyOf(r)).toEqual({ error: "not_quick_sale" });
    expect(repo.createQuote).not.toHaveBeenCalled();
  });

  it("an approved BROKER can quote a QUICK-SALE listing (201) — brokerUserId = the resolved caller", async () => {
    const repo = vettedQuoteRepo();
    const r = await handleApi(
      deps(repo),
      req("POST", `/properties/${LISTING_ID}/quotes`, {
        body: { amountThb: 1_850_000.9, discountVsMarket: 7.5, termsNote: "  cash, 30d  " },
      }),
    );
    expect(r.statusCode).toBe(201);
    expect(bodyOf(r)).toEqual({ quoteId: "q1" });
    expect(repo.createQuote).toHaveBeenCalledWith({
      listingId: LISTING_ID,
      brokerUserId: DB_USER_ID,
      amountThb: 1_850_000, // truncated
      discountVsMarket: 7.5,
      termsNote: "cash, 30d", // trimmed
    });
  });

  it("an approved INVESTOR is also vetted (201)", async () => {
    const repo = vettedQuoteRepo({
      getUserRoles: vi.fn(async () => [role("investor", "approved")]),
    });
    const r = await handleApi(
      deps(repo),
      req("POST", `/properties/${LISTING_ID}/quotes`, { body: { amountThb: 2_100_000 } }),
    );
    expect(r.statusCode).toBe(201);
    expect(repo.createQuote).toHaveBeenCalled();
  });

  it("400s a missing / zero / over-cap amount (fix G — sane bounds; feeds the AVM)", async () => {
    const repo = vettedQuoteRepo();
    for (const body of [
      { termsNote: "x" },
      { amountThb: 0 },
      { amountThb: -5 },
      { amountThb: 1e13 },
    ]) {
      const r = await handleApi(
        deps(repo),
        req("POST", `/properties/${LISTING_ID}/quotes`, { body }),
      );
      expect(r.statusCode).toBe(400);
    }
    expect(repo.createQuote).not.toHaveBeenCalled();
  });

  it("400s an out-of-range discountVsMarket (fix G — must be 0..100)", async () => {
    const repo = vettedQuoteRepo();
    for (const discountVsMarket of [-1, 150]) {
      const r = await handleApi(
        deps(repo),
        req("POST", `/properties/${LISTING_ID}/quotes`, {
          body: { amountThb: 1_900_000, discountVsMarket },
        }),
      );
      expect(r.statusCode).toBe(400);
      expect(bodyOf(r)).toEqual({ error: "invalid_discount" });
    }
    expect(repo.createQuote).not.toHaveBeenCalled();
  });
});

describe("GET /properties/{id}/quotes (claimant/admin read)", () => {
  it("the CLAIMANT lists the quotes", async () => {
    const repo = makeRepo({
      getPortalListingDetail: vi.fn(async () => portalDetail({ claimedByUserId: DB_USER_ID })),
      listQuotesForListing: vi.fn(async () => [
        {
          id: "q1",
          listingId: LISTING_ID,
          brokerUserId: OTHER_USER_ID,
          amountThb: 1_900_000,
          discountVsMarket: 5,
          termsNote: "cash",
          status: null,
          createdAt: new Date(),
        } as QuoteRow,
      ]),
    });
    const r = await handleApi(deps(repo), req("GET", `/properties/${LISTING_ID}/quotes`));
    expect(r.statusCode).toBe(200);
    expect(bodyOf(r)[0]).toMatchObject({ quoteId: "q1", amountThb: 1_900_000 });
  });

  it("an ADMIN (non-claimant) can list the quotes", async () => {
    const repo = adminRepo({
      getPortalListingDetail: vi.fn(async () => portalDetail({ claimedByUserId: OTHER_USER_ID })),
      isGroupMember: vi.fn(async () => false),
      listQuotesForListing: vi.fn(async () => [] as QuoteRow[]),
    });
    const r = await handleApi(deps(repo), req("GET", `/properties/${LISTING_ID}/quotes`));
    expect(r.statusCode).toBe(200);
    expect(repo.listQuotesForListing).toHaveBeenCalledWith(LISTING_ID);
  });

  it("a NON-claimant NON-admin CANNOT list quotes (404 — the gate bites)", async () => {
    const repo = makeRepo({
      getPortalListingDetail: vi.fn(async () => portalDetail({ claimedByUserId: OTHER_USER_ID })),
      isGroupMember: vi.fn(async () => true),
    });
    const r = await handleApi(deps(repo), req("GET", `/properties/${LISTING_ID}/quotes`));
    expect(r.statusCode).toBe(404);
    expect(repo.listQuotesForListing).not.toHaveBeenCalled();
  });
});
