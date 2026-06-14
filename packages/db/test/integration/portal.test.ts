import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  addListingNote,
  addMembership,
  claimListing,
  createGroup,
  createListing,
  createUserWithIdentity,
  createViewing,
  type Db,
  dbFromPool,
  deleteListingCascade,
  getListing,
  getPortalListingDetail,
  isGroupMember,
  keepListingPrivate,
  listMyListings,
  listNotesForUserListing,
  listSavedListingsForUser,
  listViewingsForUser,
  markClaimInvited,
  publishListing,
  saveListing,
  searchPublicListings,
  unsaveListing,
  updateViewingStatus,
} from "../../src/index.ts";
import { migrateDb, startPostgresLocal, stopPostgresLocal } from "../../src/testing/index.ts";

const CONTAINER = "linerobot-db-portal-it";

let pool: pg.Pool;
let db: Db;

// Two distinct LINE users + a base sale-listing aggregate factory.
let alice: string;
let bob: string;
let groupId: string;

const baseListing = {
  dealType: "sale" as const,
  saleStage: "available" as const,
  titleDeedType: "chanote" as const,
  propertyType: "house" as const,
  province: "เชียงใหม่",
};

async function newListing(priceThb: number, sourceGroupId?: string): Promise<string> {
  const created = await createListing(db, {
    listing: {
      ...baseListing,
      ownerUserId: alice, // pipeline pseudo-owner stand-in (not a claim)
      priceThb,
      ...(sourceGroupId ? { sourceGroupId } : {}),
    },
    content: [{ lang: "th", headline: "บ้านทดสอบ", description: "x", generatedBy: "human" }],
    media: [
      { s3Key: "conv/x/0.jpg", kind: "photo", heroIndex: 0 },
      { s3Key: "conv/x/1.jpg", thumbKey: "derivatives/x-1-thumb.jpg", kind: "photo", heroIndex: 1 },
    ],
  });
  return created.id;
}

/** A RENT listing: no asking price on the row, a rental satellite carrying `monthly_rent`. */
async function newRentListing(monthlyRent: number): Promise<string> {
  const created = await createListing(db, {
    listing: {
      ...baseListing,
      dealType: "rent",
      saleStage: "available",
      rentalStatus: "available",
      ownerUserId: alice,
      priceThb: null,
    },
    content: [{ lang: "th", headline: "เช่าทดสอบ", description: "x", generatedBy: "human" }],
    media: [{ s3Key: "conv/r/0.jpg", kind: "photo", heroIndex: 0 }],
    rental: { monthlyRent },
  });
  return created.id;
}

beforeAll(async () => {
  const connectionString = await startPostgresLocal(CONTAINER);
  pool = new pg.Pool({ connectionString, max: 2 });
  db = dbFromPool(pool);
  await migrateDb(db);

  alice = (
    await createUserWithIdentity(
      db,
      { displayName: "Alice" },
      { provider: "line", providerSubject: "U-alice", verifiedAt: new Date() },
    )
  ).id;
  bob = (
    await createUserWithIdentity(
      db,
      { displayName: "Bob" },
      { provider: "line", providerSubject: "U-bob", verifiedAt: new Date() },
    )
  ).id;
  groupId = (await createGroup(db, { name: "CNX", lineGroupId: "C-portal" })).id;
});

afterAll(async () => {
  await pool?.end();
  stopPostgresLocal(CONTAINER);
});

describe("claim (optimistic lock, D7)", () => {
  it("the first claimant wins; a same-user re-claim is idempotent", async () => {
    const id = await newListing(2_000_000);
    expect(await claimListing(db, id, alice)).toBe("claimed");
    // The listing now carries the claim facts.
    const detail = await getPortalListingDetail(db, id);
    expect(detail?.listing.claimedByUserId).toBe(alice);
    expect(detail?.listing.claimedAt).not.toBeNull();
    // Alice re-claiming her own listing is idempotent (not an error).
    expect(await claimListing(db, id, alice)).toBe("already_yours");
  });

  it("a second user loses the claim with a clear already_claimed result", async () => {
    const id = await newListing(3_000_000);
    expect(await claimListing(db, id, alice)).toBe("claimed");
    expect(await claimListing(db, id, bob)).toBe("already_claimed");
    // The original claimant is unchanged after the failed claim.
    const detail = await getPortalListingDetail(db, id);
    expect(detail?.listing.claimedByUserId).toBe(alice);
  });

  it("concurrent claims on the same fresh listing: exactly one wins", async () => {
    const id = await newListing(2_500_000);
    // Fire both claims concurrently — the conditional UPDATE serialises them per row.
    const [a, b] = await Promise.all([claimListing(db, id, alice), claimListing(db, id, bob)]);
    const outcomes = [a, b].sort();
    expect(outcomes).toEqual(["already_claimed", "claimed"]);
  });

  it("returns not_found for an unknown listing", async () => {
    expect(await claimListing(db, "00000000-0000-0000-0000-000000000000", alice)).toBe("not_found");
  });
});

describe("publish / keep-private (LEGAL-02 consent)", () => {
  it("publishing a claimed listing makes it publicly visible; keep-private hides it again", async () => {
    const id = await newListing(4_000_000);
    await claimListing(db, id, alice);

    // Before publish: not in the public search.
    const before = await searchPublicListings(db, { lang: "th" });
    expect(before.rows.map((r) => r.listing.id)).not.toContain(id);

    await publishListing(db, id, alice, "v1");
    const after = await searchPublicListings(db, { lang: "th" });
    expect(after.rows.map((r) => r.listing.id)).toContain(id);

    // Keep-private revokes the consent → falls back out of the public search.
    await keepListingPrivate(db, id);
    const reverted = await searchPublicListings(db, { lang: "th" });
    expect(reverted.rows.map((r) => r.listing.id)).not.toContain(id);

    // Keep-private on a never-published listing is a harmless no-op.
    const unpublished = await newListing(1_500_000);
    await expect(keepListingPrivate(db, unpublished)).resolves.toBeUndefined();
  });
});

describe("listMyListings (claimed-by-user portal read)", () => {
  it("returns only the caller's claimed listings, with publish state + hero thumb", async () => {
    const mine = await newListing(5_000_000);
    const notMine = await newListing(6_000_000);
    await claimListing(db, mine, bob);
    await claimListing(db, notMine, alice);
    await publishListing(db, mine, bob, "v1");

    const cards = await listMyListings(db, bob);
    const card = cards.find((c) => c.listing.id === mine);
    expect(card).toBeDefined();
    expect(card?.isPublished).toBe(true);
    expect(card?.heroThumbKey).toBe("derivatives/x-1-thumb.jpg"); // hero_index 1, has a thumb
    // Alice's listing never appears in Bob's portal.
    expect(cards.map((c) => c.listing.id)).not.toContain(notMine);
    // An unclaimed pipeline listing (pseudo-owner alice) is not "Alice's" either.
    const unclaimed = await newListing(7_000_000);
    expect((await listMyListings(db, alice)).map((c) => c.listing.id)).not.toContain(unclaimed);
    // A SALE card carries a null monthlyRent (its asking price is on priceThb).
    expect(card?.monthlyRent).toBeNull();
  });

  it("a claimed RENT listing carries its monthly rent from the rental satellite", async () => {
    const rent = await newRentListing(13_000);
    await claimListing(db, rent, bob);
    const cards = await listMyListings(db, bob);
    const card = cards.find((c) => c.listing.id === rent);
    expect(card).toBeDefined();
    expect(card?.listing.dealType).toBe("rent");
    expect(card?.monthlyRent).toBe(13_000); // the owner can SEE their rent, not an empty priceThb
    expect(card?.listing.priceThb).toBeNull();
  });
});

describe("group-membership authz", () => {
  it("isGroupMember reflects membership; NULL group is never a member", async () => {
    await addMembership(db, { groupId, userId: alice });
    expect(await isGroupMember(db, groupId, alice)).toBe(true);
    expect(await isGroupMember(db, groupId, bob)).toBe(false);
    expect(await isGroupMember(db, null, alice)).toBe(false);
  });

  it("getPortalListingDetail exposes the source group + claimant for the API gate", async () => {
    const id = await newListing(2_200_000, groupId);
    await claimListing(db, id, alice);
    const detail = await getPortalListingDetail(db, id);
    expect(detail?.listing.sourceGroupId).toBe(groupId);
    expect(detail?.listing.claimedByUserId).toBe(alice);
    // Gallery is in hero order; both originals + the one derivative are exposed.
    expect(detail?.media.map((m) => m.s3Key)).toEqual(["conv/x/0.jpg", "conv/x/1.jpg"]);
    expect(detail?.media[1]?.thumbKey).toBe("derivatives/x-1-thumb.jpg");
  });
});

describe("saved listings", () => {
  it("save is idempotent; unsave removes; the list is newest-first with hero thumb", async () => {
    const a = await newListing(1_100_000);
    const b = await newListing(1_200_000);
    await saveListing(db, a, bob);
    await saveListing(db, a, bob); // idempotent — no duplicate, no throw
    await saveListing(db, b, bob);

    const saved = await listSavedListingsForUser(db, bob);
    const ids = saved.map((s) => s.listing.id);
    expect(ids).toContain(a);
    expect(ids).toContain(b);
    // Newest save first (b saved after a).
    expect(ids.indexOf(b)).toBeLessThan(ids.indexOf(a));
    expect(saved.find((s) => s.listing.id === a)?.heroThumbKey).toBe("derivatives/x-1-thumb.jpg");

    await unsaveListing(db, a, bob);
    expect((await listSavedListingsForUser(db, bob)).map((s) => s.listing.id)).not.toContain(a);
    // Bob's saves are not Alice's.
    expect(await listSavedListingsForUser(db, alice)).toHaveLength(0);
  });
});

describe("viewings (CRM lifecycle)", () => {
  it("splits upcoming/past, scopes to the requester, and advances status", async () => {
    const id = await newListing(3_300_000);
    const now = new Date("2026-06-20T10:00:00Z");
    const future = new Date("2026-06-25T10:00:00Z");
    const past = new Date("2026-06-10T10:00:00Z");

    const upcomingViewing = await createViewing(db, id, alice, future);
    await createViewing(db, id, alice, past);
    // Bob's viewing on the same listing must not show in Alice's list.
    await createViewing(db, id, bob, future);

    const { upcoming, past: pastList } = await listViewingsForUser(db, alice, now);
    expect(upcoming.map((v) => v.viewing.scheduledAt.toISOString())).toEqual([
      future.toISOString(),
    ]);
    expect(pastList.map((v) => v.viewing.scheduledAt.toISOString())).toEqual([past.toISOString()]);
    expect(upcoming[0]?.viewing.status).toBe("requested");
    expect(upcoming[0]?.heroThumbKey).toBe("derivatives/x-1-thumb.jpg");

    // Advance the lifecycle — scoped to the requester (Bob can't touch Alice's viewing).
    expect(await updateViewingStatus(db, upcomingViewing.id, bob, "confirmed")).toBe(false);
    expect(await updateViewingStatus(db, upcomingViewing.id, alice, "confirmed")).toBe(true);
    const after = await listViewingsForUser(db, alice, now);
    expect(after.upcoming[0]?.viewing.status).toBe("confirmed");
  });
});

describe("listing notes (D13, per-user)", () => {
  it("appends notes scoped to the writing user, newest first", async () => {
    const id = await newListing(2_700_000);
    await addListingNote(db, id, alice, "first note");
    await addListingNote(db, id, alice, "second note");
    await addListingNote(db, id, bob, "bob's private note");

    const aliceNotes = await listNotesForUserListing(db, id, alice);
    expect(aliceNotes.map((n) => n.body)).toEqual(["second note", "first note"]); // newest first
    // Alice never sees Bob's note on the same listing.
    expect(aliceNotes.map((n) => n.body)).not.toContain("bob's private note");
    expect((await listNotesForUserListing(db, id, bob)).map((n) => n.body)).toEqual([
      "bob's private note",
    ]);
  });
});

describe("markClaimInvited (one-shot claim-DM guard)", () => {
  it("stamps once and refuses to re-stamp", async () => {
    const id = await newListing(1_900_000);
    const at = new Date("2026-06-21T08:00:00Z");
    expect(await markClaimInvited(db, id, at)).toBe(true);
    // A second trigger can't re-send (the guard already fired).
    expect(await markClaimInvited(db, id, new Date())).toBe(false);
    const detail = await getPortalListingDetail(db, id);
    expect(detail?.listing.claimInvitedAt?.toISOString()).toBe(at.toISOString());
  });
});

describe("deleteListingCascade with a listing_note (regression: FK no-action)", () => {
  it("deletes a listing that has notes without an FK violation", async () => {
    const id = await newListing(2_100_000);
    // A note's FK to listing is ON DELETE no action — before the fix, this made the cascade throw.
    await addListingNote(db, id, alice, "a note that would block the delete");
    await expect(deleteListingCascade(db, id)).resolves.toBeUndefined();
    expect(await getListing(db, id)).toBeUndefined();
    // The note is gone too (same transaction), so no orphan rows linger.
    const { rows } = await pool.query(
      "SELECT count(*)::int AS n FROM listing_note WHERE listing_id = $1",
      [id],
    );
    expect(rows[0].n).toBe(0);
  });
});
