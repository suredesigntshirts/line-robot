import { matchVettedUsers } from "@line-robot/domain";
import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  addRole,
  applyForRole,
  createInterestFlag,
  createListing,
  createModerationItem,
  createQuote,
  createUserWithIdentity,
  type Db,
  dbFromPool,
  extendExclusivity,
  getBrokerPreference,
  getExclusivity,
  getLatestRoleApplication,
  getUserRoles,
  listApprovedVettedUsers,
  listInterestFlags,
  listPendingModeration,
  listQuotesForListing,
  listRoleApplications,
  openExclusivityWindow,
  releaseExclusivity,
  resolveModerationItem,
  setBrokerPreference,
  setRoleApproval,
} from "../../src/index.ts";
import { migrateDb, startPostgresLocal, stopPostgresLocal } from "../../src/testing/index.ts";

const CONTAINER = "linerobot-db-dealflow-it";

let pool: pg.Pool;
let db: Db;

// Distinct users reused across the dealflow suites.
let owner: string; // pipeline pseudo-owner stand-in
let admin: string;
let brokerCnx: string;
let brokerPhuket: string;
let investor: string;

const baseListing = {
  dealType: "sale" as const,
  saleStage: "available" as const,
  titleDeedType: "chanote" as const,
  propertyType: "house" as const,
  province: "เชียงใหม่",
};

async function newListing(priceThb: number): Promise<string> {
  const created = await createListing(db, {
    listing: { ...baseListing, ownerUserId: owner, priceThb },
    content: [{ lang: "th", headline: "บ้านดีลโฟลว์", description: "x", generatedBy: "human" }],
  });
  return created.id;
}

async function newUser(name: string, subject: string): Promise<string> {
  return (
    await createUserWithIdentity(
      db,
      { displayName: name },
      { provider: "line", providerSubject: subject, verifiedAt: new Date() },
    )
  ).id;
}

beforeAll(async () => {
  const connectionString = await startPostgresLocal(CONTAINER);
  pool = new pg.Pool({ connectionString, max: 2 });
  db = dbFromPool(pool);
  await migrateDb(db);

  owner = await newUser("Owner", "U-owner");
  admin = await newUser("Admin", "U-admin");
  brokerCnx = await newUser("Broker CNX", "U-broker-cnx");
  brokerPhuket = await newUser("Broker Phuket", "U-broker-phuket");
  investor = await newUser("Investor", "U-investor");
});

afterAll(async () => {
  await pool?.end();
  stopPostgresLocal(CONTAINER);
});

describe("migration 0009 (enum adds + role cols + broker_preference)", () => {
  it("created the broker_preference table with text[] columns", async () => {
    const { rows } = await pool.query(
      `SELECT column_name, data_type FROM information_schema.columns
       WHERE table_name = 'broker_preference' ORDER BY column_name`,
    );
    const byName = Object.fromEntries(rows.map((r) => [r.column_name, r.data_type]));
    expect(byName.user_id).toBe("uuid");
    expect(byName.provinces).toBe("ARRAY");
    expect(byName.property_types).toBe("ARRAY");
    expect(byName.price_band_ids).toBe("ARRAY");
    expect(byName.updated_at).toBe("timestamp with time zone");
  });

  it("added reviewed_by / reviewed_at to role", async () => {
    const { rows } = await pool.query(
      `SELECT column_name FROM information_schema.columns
       WHERE table_name = 'role' AND column_name IN ('reviewed_by', 'reviewed_at')`,
    );
    expect(rows.map((r) => r.column_name).sort()).toEqual(["reviewed_at", "reviewed_by"]);
  });

  it("added 'admin' to role_kind and 'rejected' to approval_status", async () => {
    const { rows } = await pool.query(
      `SELECT t.typname, e.enumlabel FROM pg_type t
       JOIN pg_enum e ON e.enumtypid = t.oid
       WHERE t.typname IN ('role_kind', 'approval_status')`,
    );
    const labels = (typ: string) => rows.filter((r) => r.typname === typ).map((r) => r.enumlabel);
    expect(labels("role_kind")).toContain("admin");
    expect(labels("approval_status")).toContain("rejected");
  });
});

describe("exclusivity transitions (extend bumps expiresAt; release sets released)", () => {
  it("openExclusivityWindow then extend bumps expires_at (idempotent open)", async () => {
    const id = await newListing(2_000_000);
    const first = new Date("2026-06-22T00:00:00Z");
    await openExclusivityWindow(db, id, first);
    // A re-open is a no-op (PK conflict) — the first window stands.
    await openExclusivityWindow(db, id, new Date("2026-07-01T00:00:00Z"));
    let row = await getExclusivity(db, id);
    expect(row?.expiresAt.toISOString()).toBe(first.toISOString());
    expect(row?.releaseState).toBe("held");

    const bumped = new Date("2026-06-29T00:00:00Z");
    await extendExclusivity(db, id, bumped);
    row = await getExclusivity(db, id);
    expect(row?.expiresAt.toISOString()).toBe(bumped.toISOString());
    expect(row?.releaseState).toBe("held"); // extend doesn't release
  });

  it("releaseExclusivity sets release_state = released", async () => {
    const id = await newListing(3_000_000);
    await openExclusivityWindow(db, id, new Date("2026-06-22T00:00:00Z"));
    await releaseExclusivity(db, id);
    expect((await getExclusivity(db, id))?.releaseState).toBe("released");
  });

  it("getExclusivity returns undefined for a listing with no window", async () => {
    const id = await newListing(1_500_000);
    expect(await getExclusivity(db, id)).toBeUndefined();
  });
});

describe("interest flags (non-binding signal, idempotent, newest-first)", () => {
  it("creates flags (idempotent per user) and lists them with the flagger's name, newest first", async () => {
    const id = await newListing(2_400_000);
    await createInterestFlag(db, id, brokerCnx);
    await createInterestFlag(db, id, brokerCnx); // re-flag → no dup (unique index)
    await createInterestFlag(db, id, investor);

    const flags = await listInterestFlags(db, id);
    expect(flags).toHaveLength(2);
    // Newest first: investor flagged after brokerCnx.
    expect(flags[0]?.userId).toBe(investor);
    expect(flags[0]?.displayName).toBe("Investor");
    expect(flags[1]?.userId).toBe(brokerCnx);
    // The unique index held — exactly one brokerCnx flag.
    const { rows } = await pool.query(
      "SELECT count(*)::int AS n FROM interest_flag WHERE listing_id = $1 AND user_id = $2",
      [id, brokerCnx],
    );
    expect(rows[0].n).toBe(1);
  });
});

describe("quotes (structured quote storage, AVM feed)", () => {
  it("stores a quote with all fields and lists newest-first", async () => {
    const id = await newListing(5_000_000);
    const q1 = await createQuote(db, {
      listingId: id,
      brokerUserId: brokerCnx,
      amountThb: 4_800_000,
      discountVsMarket: 0.04,
      termsNote: "cash, 30-day close",
      status: "submitted",
    });
    expect(q1.amountThb).toBe(4_800_000);
    expect(q1.discountVsMarket).toBe(0.04);
    const q2 = await createQuote(db, {
      listingId: id,
      brokerUserId: investor,
      amountThb: 4_900_000,
    });
    expect(q2.discountVsMarket).toBeNull();

    const quotes = await listQuotesForListing(db, id);
    expect(quotes).toHaveLength(2);
    expect(quotes[0]?.id).toBe(q2.id); // newest first
    expect(quotes[1]?.id).toBe(q1.id);
  });
});

describe("moderation queue (list pending + resolve)", () => {
  it("lists pending items with the target listing headline, and resolve removes them from pending", async () => {
    const id = await newListing(2_100_000);
    await createModerationItem(db, "listing", id, "needs_review");
    const pending = await listPendingModeration(db);
    const item = pending.find((p) => p.targetId === id);
    expect(item).toBeDefined();
    expect(item?.reason).toBe("needs_review");
    expect(item?.headline).toBe("บ้านดีลโฟลว์"); // joined th headline

    const resolved = await resolveModerationItem(db, item?.id as string, "approved");
    expect(resolved.outcome).toBe("updated");
    if (resolved.outcome !== "updated") throw new Error("expected updated");
    expect(resolved.row.status).toBe("approved");
    // No longer pending.
    expect((await listPendingModeration(db)).map((p) => p.id)).not.toContain(item?.id);
  });

  it("reject keeps the item out of pending too; an unknown id returns not_found", async () => {
    const id = await newListing(2_200_000);
    await createModerationItem(db, "listing", id, "blocked");
    const [item] = (await listPendingModeration(db)).filter((p) => p.targetId === id);
    const rejected = await resolveModerationItem(db, item?.id as string, "rejected");
    expect(rejected.outcome).toBe("updated");
    if (rejected.outcome !== "updated") throw new Error("expected updated");
    expect(rejected.row.status).toBe("rejected");
    expect(
      (await resolveModerationItem(db, "00000000-0000-0000-0000-000000000000", "approved")).outcome,
    ).toBe("not_found");
  });

  it("terminal-state guard (fix B): re-resolving an already-decided item does NOT flip it → already_decided", async () => {
    const id = await newListing(2_350_000);
    await createModerationItem(db, "listing", id, "needs_review");
    const [item] = (await listPendingModeration(db)).filter((p) => p.targetId === id);
    const first = await resolveModerationItem(db, item?.id as string, "approved");
    expect(first.outcome).toBe("updated");
    // A stale/double admin request tries to FLIP approved → rejected: it must NOT take effect.
    const second = await resolveModerationItem(db, item?.id as string, "rejected");
    expect(second.outcome).toBe("already_decided");
    if (second.outcome !== "already_decided") throw new Error("expected already_decided");
    expect(second.row.status).toBe("approved"); // the prior decision STANDS
    // Confirm at the row level the status was not rewritten.
    const { rows } = await pool.query("SELECT status FROM moderation_item WHERE id = $1", [
      item?.id,
    ]);
    expect(rows[0].status).toBe("approved");
  });
});

describe("role vetting (queue, approve/reject with reviewer, getUserRoles)", () => {
  it("lists pending applications, approves one with the reviewer stamped, and reflects in getUserRoles", async () => {
    // brokerCnx applies for the broker role (pending).
    await addRole(db, { userId: brokerCnx, kind: "broker", approvalStatus: "pending" });
    const pending = await listRoleApplications(db); // default 'pending'
    const app = pending.find((a) => a.userId === brokerCnx && a.kind === "broker");
    expect(app).toBeDefined();
    expect(app?.displayName).toBe("Broker CNX");

    const approved = await setRoleApproval(db, app?.roleId as string, "approved", admin);
    expect(approved.outcome).toBe("updated");
    if (approved.outcome !== "updated") throw new Error("expected updated");
    expect(approved.row.approvalStatus).toBe("approved");
    expect(approved.row.reviewedBy).toBe(admin);
    expect(approved.row.reviewedAt).not.toBeNull();

    // getUserRoles reflects the approval.
    const roles = await getUserRoles(db, brokerCnx);
    expect(roles.find((r) => r.kind === "broker")?.approvalStatus).toBe("approved");
    // No longer in the pending queue.
    expect((await listRoleApplications(db)).map((a) => a.roleId)).not.toContain(app?.roleId);
  });

  it("records a rejection with the reviewer (D-S6-8)", async () => {
    await addRole(db, { userId: brokerPhuket, kind: "investor", approvalStatus: "pending" });
    const [app] = (await listRoleApplications(db)).filter((a) => a.userId === brokerPhuket);
    const rejected = await setRoleApproval(db, app?.roleId as string, "rejected", admin);
    expect(rejected.outcome).toBe("updated");
    if (rejected.outcome !== "updated") throw new Error("expected updated");
    expect(rejected.row.approvalStatus).toBe("rejected");
    expect(rejected.row.reviewedBy).toBe(admin);
    // Shows up only in the rejected query, not pending.
    expect((await listRoleApplications(db, "rejected")).map((a) => a.roleId)).toContain(
      app?.roleId,
    );
    expect((await listRoleApplications(db, "pending")).map((a) => a.roleId)).not.toContain(
      app?.roleId,
    );
  });
});

describe("broker preferences + the vetted-candidate read (feeds matchVettedUsers)", () => {
  it("upserts preferences (overwrite on re-write) and reads them back", async () => {
    await setBrokerPreference(db, brokerCnx, {
      provinces: ["เชียงใหม่"],
      propertyTypes: ["house", "land"],
      priceBandIds: ["s2", "s3"],
    });
    let pref = await getBrokerPreference(db, brokerCnx);
    expect(pref?.provinces).toEqual(["เชียงใหม่"]);
    expect(pref?.propertyTypes).toEqual(["house", "land"]);

    // Re-write fully replaces (not merges).
    await setBrokerPreference(db, brokerCnx, {
      provinces: ["เชียงใหม่", "ลำพูน"],
      propertyTypes: ["house"],
      priceBandIds: ["s2"],
    });
    pref = await getBrokerPreference(db, brokerCnx);
    expect(pref?.provinces).toEqual(["เชียงใหม่", "ลำพูน"]);
    expect(pref?.propertyTypes).toEqual(["house"]);
    expect(pref?.priceBandIds).toEqual(["s2"]);
  });

  it("listApprovedVettedUsers returns ONLY approved broker/investor users + their prefs; matchVettedUsers selects the overlap", async () => {
    // brokerCnx is approved-broker (above) with CNX/house/s2 prefs.
    // brokerPhuket is REJECTED (above) → must NOT appear.
    // Approve the investor with Phuket-only province prefs.
    await addRole(db, { userId: investor, kind: "investor", approvalStatus: "pending" });
    const [invApp] = (await listRoleApplications(db)).filter(
      (a) => a.userId === investor && a.kind === "investor",
    );
    await setRoleApproval(db, invApp?.roleId as string, "approved", admin);
    await setBrokerPreference(db, investor, {
      provinces: ["ภูเก็ต"],
      propertyTypes: [],
      priceBandIds: [],
    });
    // A pending applicant (owner applies, never approved) must NOT appear.
    await addRole(db, { userId: owner, kind: "broker", approvalStatus: "pending" });

    const candidates = await listApprovedVettedUsers(db);
    const ids = candidates.map((c) => c.userId).sort();
    expect(ids).toContain(brokerCnx);
    expect(ids).toContain(investor);
    expect(ids).not.toContain(brokerPhuket); // rejected
    expect(ids).not.toContain(owner); // pending

    // The pure seam selects the overlap: a CNX house at 4.2M (band s2) matches brokerCnx
    // (CNX/house/s2) but NOT the investor (Phuket-only province).
    const matched = matchVettedUsers(
      { province: "เชียงใหม่", propertyType: "house", dealType: "sale", amountThb: 4_200_000 },
      candidates,
    );
    expect(matched.map((c) => c.userId)).toEqual([brokerCnx]);

    // A Phuket condo at the same price matches the investor (province ภูเก็ต, any type, any band),
    // not brokerCnx (CNX-only province) — proving the server-side vetted set + overlap together
    // never leak to an unvetted user.
    const phuketMatch = matchVettedUsers(
      { province: "ภูเก็ต", propertyType: "condo", dealType: "sale", amountThb: 4_200_000 },
      candidates,
    );
    expect(phuketMatch.map((c) => c.userId)).toEqual([investor]);
  });

  it("a user approved as BOTH broker and investor appears EXACTLY ONCE (dedup by userId)", async () => {
    // role has no (user_id, kind) unique constraint, so a dual-role user has two approved role rows.
    const dual = await newUser("Dual Role", "U-dual-role");
    await addRole(db, { userId: dual, kind: "broker", approvalStatus: "approved" });
    await addRole(db, { userId: dual, kind: "investor", approvalStatus: "approved" });
    await setBrokerPreference(db, dual, {
      provinces: ["เชียงใหม่"],
      propertyTypes: ["house"],
      priceBandIds: ["s2"],
    });

    // The raw join WOULD return two rows for this user — proving the dedup has real work to do (this
    // assertion would equal the candidate count below, i.e. 2, if the dedup were removed).
    const { rows: rawRows } = await pool.query(
      `SELECT count(*)::int AS n FROM role r
       LEFT JOIN broker_preference bp ON bp.user_id = r.user_id
       WHERE r.approval_status = 'approved'
         AND r.kind IN ('broker', 'investor')
         AND r.user_id = $1`,
      [dual],
    );
    expect(rawRows[0].n).toBe(2);

    // listApprovedVettedUsers collapses them to exactly one candidate — so INC-B2's push notifies
    // the user once per listing, not twice.
    const candidates = await listApprovedVettedUsers(db);
    const dualRows = candidates.filter((c) => c.userId === dual);
    expect(dualRows).toHaveLength(1);
    // Prefs survive the dedup (both duplicate rows carried identical prefs via the userId-keyed join).
    expect(dualRows[0]?.provinces).toEqual(["เชียงใหม่"]);
    expect(dualRows[0]?.priceBandIds).toEqual(["s2"]);
  });
});

describe("role-application hardening (fixes B/C/D/E)", () => {
  it("setRoleApproval terminal-state guard (B): an already-decided role is NOT re-flipped → already_decided", async () => {
    const u = await newUser("Guard A", "U-guard-a");
    await addRole(db, { userId: u, kind: "broker", approvalStatus: "pending" });
    const [app] = (await listRoleApplications(db)).filter((a) => a.userId === u);
    const first = await setRoleApproval(db, app?.roleId as string, "approved", admin);
    expect(first.outcome).toBe("updated");
    // A stale/double request tries to FLIP approved → rejected: it must NOT take effect.
    const second = await setRoleApproval(db, app?.roleId as string, "rejected", admin);
    expect(second.outcome).toBe("already_decided");
    if (second.outcome !== "already_decided") throw new Error("expected already_decided");
    expect(second.row.approvalStatus).toBe("approved"); // the prior decision STANDS
    const { rows } = await pool.query("SELECT approval_status FROM role WHERE id = $1", [
      app?.roleId,
    ]);
    expect(rows[0].approval_status).toBe("approved");
  });

  it("setRoleApproval on an unknown role → not_found", async () => {
    const result = await setRoleApproval(
      db,
      "00000000-0000-0000-0000-000000000000",
      "approved",
      admin,
    );
    expect(result.outcome).toBe("not_found");
  });

  it("applyForRole (E) atomically creates a pending role AND its preferences in one transaction", async () => {
    const u = await newUser("Applicant", "U-applicant");
    const result = await applyForRole(db, u, "broker", {
      provinces: ["เชียงใหม่"],
      propertyTypes: ["condo"],
      priceBandIds: ["s1"],
    });
    expect(result).toEqual({ created: true, status: "pending" });
    // The role row exists AND is pending.
    const roles = await getUserRoles(db, u);
    expect(roles.filter((r) => r.kind === "broker")).toHaveLength(1);
    expect(roles[0]?.approvalStatus).toBe("pending");
    // The preferences were written in the SAME transaction (no pending role with no prefs).
    const pref = await getBrokerPreference(db, u);
    expect(pref?.provinces).toEqual(["เชียงใหม่"]);
    expect(pref?.propertyTypes).toEqual(["condo"]);
  });

  it("re-application guard (D): re-applying with a live pending role does NOT insert a duplicate", async () => {
    const u = await newUser("Re-applicant", "U-reapplicant");
    await applyForRole(db, u, "broker", { provinces: [], propertyTypes: [], priceBandIds: [] });
    const again = await applyForRole(db, u, "broker", {
      provinces: ["ภูเก็ต"], // a different pref — must be IGNORED on the guarded no-op
      propertyTypes: [],
      priceBandIds: [],
    });
    expect(again).toEqual({ created: false, status: "pending" });
    // Exactly ONE broker role row (no duplicate).
    const { rows } = await pool.query(
      "SELECT count(*)::int AS n FROM role WHERE user_id = $1 AND kind = 'broker'",
      [u],
    );
    expect(rows[0].n).toBe(1);
    // The no-op did NOT rewrite the existing prefs.
    expect((await getBrokerPreference(db, u))?.provinces).toEqual([]);
  });

  it("re-application guard does NOT block re-applying after a REJECTION", async () => {
    const u = await newUser("Rejected-then-reapply", "U-rejected-reapply");
    await applyForRole(db, u, "broker", { provinces: [], propertyTypes: [], priceBandIds: [] });
    const [app] = (await listRoleApplications(db)).filter((a) => a.userId === u);
    await setRoleApproval(db, app?.roleId as string, "rejected", admin);
    // A rejected user may try again — a fresh pending row IS created.
    const retry = await applyForRole(db, u, "broker", {
      provinces: ["เชียงใหม่"],
      propertyTypes: [],
      priceBandIds: [],
    });
    expect(retry).toEqual({ created: true, status: "pending" });
    const { rows } = await pool.query(
      "SELECT count(*)::int AS n FROM role WHERE user_id = $1 AND kind = 'broker'",
      [u],
    );
    expect(rows[0].n).toBe(2); // the rejected one + the new pending one
  });

  it("getLatestRoleApplication (C) deterministically surfaces the strongest standing (approved over rejected)", async () => {
    const u = await newUser("Two-apps", "U-two-apps");
    // A rejected broker application, then a fresh approved investor one.
    await addRole(db, { userId: u, kind: "broker", approvalStatus: "rejected" });
    await addRole(db, { userId: u, kind: "investor", approvalStatus: "approved" });
    const latest = await getLatestRoleApplication(db, u);
    // approved sorts before rejected → the approved investor role is "current", stably across reads.
    expect(latest?.kind).toBe("investor");
    expect(latest?.approvalStatus).toBe("approved");
    expect((await getLatestRoleApplication(db, u))?.id).toBe(latest?.id); // deterministic re-read
  });

  it("getLatestRoleApplication returns undefined for a user who never applied", async () => {
    const u = await newUser("Never-applied", "U-never-applied");
    expect(await getLatestRoleApplication(db, u)).toBeUndefined();
  });
});
