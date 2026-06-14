import { matchVettedUsers } from "@line-robot/domain";
import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  addRole,
  createGroup,
  createListing,
  createUserWithIdentity,
  type Db,
  dbFromPool,
  getExclusivity,
  getExclusivityWindowDays,
  listApprovedVettedUsers,
  listLapsedExclusivity,
  listQuickSaleUnpushed,
  markQuickSalePushed,
  markReleasePromptSent,
  openExclusivityWindow,
  setBrokerPreference,
  setListingMandate,
} from "../../src/index.ts";
import { migrateDb, startPostgresLocal, stopPostgresLocal } from "../../src/testing/index.ts";

// Stage 6 INC-B4 — the dealflow bot-sweep repo functions: migration 0010 (quick_sale_pushed_at),
// the once-guards (markReleasePromptSent / markQuickSalePushed), and the two scans
// (listLapsedExclusivity / listQuickSaleUnpushed). Each test BITES: a guard that didn't transition
// would let a second sweep re-DM/re-push; a scan that didn't filter would surface the wrong rows.

const CONTAINER = "linerobot-db-dealflow-b4-it";

let pool: pg.Pool;
let db: Db;

let owner: string; // pipeline pseudo-owner stand-in
let poster: string; // a real LINE user — the claimant we DM on lapse
let group: string; // the source group (window = 5 days here)
let broker: string;
let investor: string;

const baseListing = {
  dealType: "sale" as const,
  saleStage: "available" as const,
  titleDeedType: "chanote" as const,
  propertyType: "house" as const,
  province: "เชียงใหม่",
};

/** A claimed, group-sourced listing (the shape the lapse DM targets) — a claimant with a LINE identity
 * + a non-null source group. */
async function newClaimedListing(priceThb: number): Promise<string> {
  const created = await createListing(db, {
    listing: {
      ...baseListing,
      ownerUserId: owner,
      claimedByUserId: poster,
      sourceGroupId: group,
      priceThb,
    },
    content: [{ lang: "th", headline: "บ้านลาส์", description: "x", generatedBy: "human" }],
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

  owner = await newUser("Owner", "U-b4-owner");
  poster = await newUser("Poster", "U-b4-poster"); // provider_subject is the LINE id we DM
  broker = await newUser("Broker", "U-b4-broker");
  investor = await newUser("Investor", "U-b4-investor");
  group = (
    await createGroup(db, { lineGroupId: "C-b4-grp", name: "B4 group", exclusivityWindowDays: 5 })
  ).id;
});

afterAll(async () => {
  await pool?.end();
  stopPostgresLocal(CONTAINER);
});

describe("migration 0010 (quick_sale_pushed_at)", () => {
  it("added a nullable quick_sale_pushed_at timestamptz to listing", async () => {
    const { rows } = await pool.query(
      `SELECT data_type, is_nullable FROM information_schema.columns
       WHERE table_name = 'listing' AND column_name = 'quick_sale_pushed_at'`,
    );
    expect(rows).toHaveLength(1);
    expect(rows[0].data_type).toBe("timestamp with time zone");
    expect(rows[0].is_nullable).toBe("YES");
  });
});

describe("markReleasePromptSent — the lapse-DM once-guard (held → releasable)", () => {
  it("transitions held → releasable exactly once; a second call is a no-op (false)", async () => {
    const id = await newClaimedListing(3_000_000);
    await openExclusivityWindow(db, id, new Date("2026-01-01T00:00:00Z")); // releaseState defaults to held

    const first = await markReleasePromptSent(db, id);
    expect(first).toBe(true);
    expect((await getExclusivity(db, id))?.releaseState).toBe("releasable");

    // The guard is consumed — a re-sweep must NOT re-DM.
    const second = await markReleasePromptSent(db, id);
    expect(second).toBe(false);
    expect((await getExclusivity(db, id))?.releaseState).toBe("releasable"); // unchanged
  });

  it("returns false when there is no held window (already released / no window)", async () => {
    const id = await newClaimedListing(2_000_000); // no exclusivity row at all
    expect(await markReleasePromptSent(db, id)).toBe(false);
  });
});

describe("listLapsedExclusivity — the lapse scan (held + expired, claimant LINE id + source group)", () => {
  it("surfaces a held+expired window with the claimant's LINE id, source group, and window days", async () => {
    const id = await newClaimedListing(4_000_000);
    await openExclusivityWindow(db, id, new Date("2026-02-01T00:00:00Z")); // expires in the past vs `now` below

    const now = new Date("2026-03-01T00:00:00Z");
    const lapsed = await listLapsedExclusivity(db, now);
    const row = lapsed.find((r) => r.listingId === id);
    expect(row).toBeDefined();
    expect(row?.posterLineUserId).toBe("U-b4-poster"); // the DM push target = the claimant's LINE id
    expect(row?.sourceGroupId).toBe(group);
    expect(row?.windowDays).toBe(5); // per-group window
    expect(row?.headline).toBe("บ้านลาส์");
  });

  it("excludes a not-yet-expired window, and a window already prompted (releasable)", async () => {
    // Future expiry → not lapsed yet.
    const future = await newClaimedListing(2_500_000);
    await openExclusivityWindow(db, future, new Date("2026-12-31T00:00:00Z"));
    // Expired but already prompted (held → releasable) → out of the scan (only `held` is returned).
    const prompted = await newClaimedListing(2_600_000);
    await openExclusivityWindow(db, prompted, new Date("2026-02-01T00:00:00Z"));
    await markReleasePromptSent(db, prompted);

    const now = new Date("2026-03-01T00:00:00Z");
    const ids = (await listLapsedExclusivity(db, now)).map((r) => r.listingId);
    expect(ids).not.toContain(future); // not expired
    expect(ids).not.toContain(prompted); // already releasable, not held
  });

  it("excludes a lapsed window whose listing has no claimant LINE identity (no one to DM)", async () => {
    // A group-sourced listing with NO claimant → no LINE id to push to → excluded by the inner join.
    const created = await createListing(db, {
      listing: { ...baseListing, ownerUserId: owner, sourceGroupId: group, priceThb: 1_900_000 },
      content: [{ lang: "th", headline: "ไม่มีเจ้าของ", description: "x", generatedBy: "human" }],
    });
    await openExclusivityWindow(db, created.id, new Date("2026-02-01T00:00:00Z"));
    const ids = (await listLapsedExclusivity(db, new Date("2026-03-01T00:00:00Z"))).map(
      (r) => r.listingId,
    );
    expect(ids).not.toContain(created.id);
  });
});

describe("getExclusivityWindowDays — the per-group extend window", () => {
  it("returns the source group's window for a group-sourced listing", async () => {
    const id = await newClaimedListing(3_300_000);
    expect(await getExclusivityWindowDays(db, id)).toBe(5);
  });

  it("returns undefined for a listing with no source group", async () => {
    const created = await createListing(db, {
      listing: { ...baseListing, ownerUserId: owner, priceThb: 1_700_000 },
      content: [{ lang: "th", headline: "เดี่ยว", description: "x", generatedBy: "human" }],
    });
    expect(await getExclusivityWindowDays(db, created.id)).toBeUndefined();
  });
});

describe("setListingMandate — release-to-other-groups drops the group-exclusive mandate", () => {
  it("flips listing_mandate to 'open'", async () => {
    const id = await newClaimedListing(2_800_000);
    const { rows: before } = await pool.query("SELECT listing_mandate FROM listing WHERE id = $1", [
      id,
    ]);
    expect(before[0].listing_mandate).toBe("group_exclusive"); // the default
    await setListingMandate(db, id, "open");
    const { rows: after } = await pool.query("SELECT listing_mandate FROM listing WHERE id = $1", [
      id,
    ]);
    expect(after[0].listing_mandate).toBe("open");
  });
});

describe("markQuickSalePushed — the quick-quote once-guard", () => {
  it("stamps quick_sale_pushed_at exactly once (firstPush true, then false)", async () => {
    const id = await newClaimedListing(5_000_000);
    const at = new Date("2026-04-01T00:00:00Z");
    expect(await markQuickSalePushed(db, id, at)).toBe(true);
    const { rows } = await pool.query("SELECT quick_sale_pushed_at FROM listing WHERE id = $1", [
      id,
    ]);
    expect(rows[0].quick_sale_pushed_at).not.toBeNull();
    // A re-sweep must not re-push.
    expect(await markQuickSalePushed(db, id, new Date("2026-04-02T00:00:00Z"))).toBe(false);
  });
});

describe("listQuickSaleUnpushed — the quick-quote scan", () => {
  it("returns only urgency=quick_sale, un-pushed, priced + province listings (matchable shape)", async () => {
    // A quick-sale, un-pushed, priced listing in CNX → surfaces.
    const matchable = await createListing(db, {
      listing: {
        ...baseListing,
        ownerUserId: owner,
        sourceGroupId: group,
        priceThb: 4_200_000,
        urgency: "quick_sale",
      },
      content: [{ lang: "th", headline: "ขายด่วน", description: "x", generatedBy: "human" }],
    });
    // A normal-urgency listing → excluded.
    const normal = await createListing(db, {
      listing: { ...baseListing, ownerUserId: owner, priceThb: 3_000_000, urgency: "normal" },
      content: [{ lang: "th", headline: "ปกติ", description: "x", generatedBy: "human" }],
    });
    // A quick-sale listing with a NULL price → excluded (can't be price-band matched).
    const noPrice = await createListing(db, {
      listing: { ...baseListing, ownerUserId: owner, priceThb: null, urgency: "quick_sale" },
      content: [{ lang: "th", headline: "ไม่มีราคา", description: "x", generatedBy: "human" }],
    });
    // A quick-sale listing already pushed → excluded by the guard.
    const pushed = await createListing(db, {
      listing: { ...baseListing, ownerUserId: owner, priceThb: 2_500_000, urgency: "quick_sale" },
      content: [{ lang: "th", headline: "ส่งแล้ว", description: "x", generatedBy: "human" }],
    });
    await markQuickSalePushed(db, pushed.id, new Date("2026-05-01T00:00:00Z"));

    const candidates = await listQuickSaleUnpushed(db);
    const ids = candidates.map((c) => c.listingId);
    expect(ids).toContain(matchable.id);
    expect(ids).not.toContain(normal.id); // wrong urgency
    expect(ids).not.toContain(noPrice.id); // null price → no matchable amount
    expect(ids).not.toContain(pushed.id); // already pushed

    const row = candidates.find((c) => c.listingId === matchable.id);
    expect(row?.amountThb).toBe(4_200_000);
    expect(row?.province).toBe("เชียงใหม่");
    expect(row?.dealType).toBe("sale");
    expect(row?.headline).toBe("ขายด่วน");
  });

  it("uses monthly_rent as the matching amount for a rent listing", async () => {
    const created = await createListing(db, {
      listing: {
        dealType: "rent",
        rentalStatus: "available",
        titleDeedType: "chanote",
        propertyType: "condo",
        province: "เชียงใหม่",
        ownerUserId: owner,
        priceThb: null,
        urgency: "quick_sale",
      },
      content: [{ lang: "th", headline: "เช่าด่วน", description: "x", generatedBy: "human" }],
      rental: { monthlyRent: 15_000 },
    });
    const row = (await listQuickSaleUnpushed(db)).find((c) => c.listingId === created.id);
    expect(row).toBeDefined();
    expect(row?.dealType).toBe("rent");
    expect(row?.amountThb).toBe(15_000); // the monthly rent, not the (null) sale price
  });
});

describe("the vetted recipient set + matchVettedUsers (no unvetted leak)", () => {
  it("only an approved-vetted broker matching the listing's overlap is selected", async () => {
    // broker: approved, CNX/house/band-s2 (3M–5M).
    await addRole(db, { userId: broker, kind: "broker", approvalStatus: "approved" });
    await setBrokerPreference(db, broker, {
      provinces: ["เชียงใหม่"],
      propertyTypes: ["house"],
      priceBandIds: ["s2"],
    });
    // investor: approved but Phuket-only → must NOT match a CNX listing.
    await addRole(db, { userId: investor, kind: "investor", approvalStatus: "approved" });
    await setBrokerPreference(db, investor, {
      provinces: ["ภูเก็ต"],
      propertyTypes: [],
      priceBandIds: [],
    });
    // poster: a PENDING broker application → never vetted, must never be a recipient.
    await addRole(db, { userId: poster, kind: "broker", approvalStatus: "pending" });

    const candidates = await listApprovedVettedUsers(db);
    const ids = candidates.map((c) => c.userId);
    expect(ids).toContain(broker);
    expect(ids).toContain(investor);
    expect(ids).not.toContain(poster); // pending → unvetted, excluded server-side

    // A CNX house at 4.2M (band s2) matches the broker only.
    const matched = matchVettedUsers(
      { province: "เชียงใหม่", propertyType: "house", dealType: "sale", amountThb: 4_200_000 },
      candidates,
    );
    expect(matched.map((c) => c.userId)).toEqual([broker]);
  });
});
