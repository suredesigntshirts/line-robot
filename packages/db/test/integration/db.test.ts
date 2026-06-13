import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  addMembership,
  changePrice,
  createGroup,
  createListing,
  createUserWithIdentity,
  type Db,
  dbFromPool,
  ewktPoint,
  findListingsNear,
  findUserByIdentity,
  getContent,
  getListing,
  getPublicListingDetail,
  grantPublishConsent,
  listListings,
  listPublicProvinces,
  searchPublicListings,
} from "../../src/index.ts";
import { migrateDb, startPostgresLocal, stopPostgresLocal } from "../../src/testing/index.ts";

const CONTAINER = "linerobot-db-it";

// Nimman, Chiang Mai
const NIMMAN = { lon: 98.9683, lat: 18.7995 };
// Hang Dong — ~15km away
const HANG_DONG = { lon: 98.9192, lat: 18.6864 };

let pool: pg.Pool;
let db: Db;

beforeAll(async () => {
  const connectionString = await startPostgresLocal(CONTAINER);
  pool = new pg.Pool({ connectionString, max: 2 });
  db = dbFromPool(pool);
  await migrateDb(db);
});

afterAll(async () => {
  await pool?.end();
  stopPostgresLocal(CONTAINER);
});

describe("migrations", () => {
  it("applied PostGIS and the geography column at SRID 4326", async () => {
    const { rows } = await pool.query(
      "SELECT srid, type FROM geography_columns WHERE f_table_name = 'listing' AND f_geography_column = 'geom'",
    );
    expect(rows[0]).toMatchObject({ srid: 4326, type: "Point" });
  });

  it("created every spec entity", async () => {
    const { rows } = await pool.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'",
    );
    const names = rows.map((r) => r.table_name);
    for (const required of [
      "user",
      "user_identity",
      "account_merge_request",
      "role",
      "group",
      "group_membership",
      "listing",
      "listing_condo",
      "listing_rental",
      "listing_fees",
      "listing_content",
      "listing_amenity",
      "listing_media",
      "listing_exclusivity",
      "interest_flag",
      "saved_listing",
      "viewing",
      "quote",
      "price_history",
      "co_agent_agreement",
      "publish_consent",
      "moderation_item",
      "market_data",
    ]) {
      expect(names).toContain(required);
    }
  });
});

describe("repositories", () => {
  let ownerId: string;
  let listingId: string;

  it("creates a user with a LINE identity and finds it back", async () => {
    const user = await createUserWithIdentity(
      db,
      { displayName: "คุณสมชาย" },
      { provider: "line", providerSubject: "U1234", verifiedAt: new Date() },
    );
    ownerId = user.id;
    const found = await findUserByIdentity(db, "line", "U1234");
    expect(found?.id).toBe(ownerId);
    expect(await findUserByIdentity(db, "email", "U1234")).toBeUndefined();
  });

  it("creates a group and membership", async () => {
    const group = await createGroup(db, { name: "CNX Brokers", lineGroupId: "C9999" });
    await addMembership(db, { groupId: group.id, userId: ownerId });
    expect(group.exclusivityWindowDays).toBe(7);
  });

  it("creates a sale listing aggregate with per-language content and geometry", async () => {
    const listing = await createListing(db, {
      listing: {
        ownerUserId: ownerId,
        dealType: "sale",
        saleStage: "available",
        titleDeedType: "chanote",
        propertyType: "house",
        priceThb: 4_500_000,
        province: "เชียงใหม่",
        amphoe: "เมืองเชียงใหม่",
        tambon: "สุเทพ",
        landmark: "ใกล้ Nimman ซอย 9",
        geom: ewktPoint(NIMMAN.lon, NIMMAN.lat),
        landRai: 0,
        landNgan: 1,
        landWah: 50,
        landSqm: 600,
      },
      content: [
        {
          lang: "th",
          headline: "บ้านเดี่ยวใกล้นิมมาน",
          description: "ขายบ้าน 3 นอน",
          generatedBy: "human",
        },
        {
          lang: "en",
          headline: "House near Nimman",
          description: "3-bed house",
          generatedBy: "llm",
        },
      ],
      amenities: ["parking", "garden"],
      media: [{ s3Key: "conv/x/1/content.jpg", kind: "photo", heroIndex: 0 }],
    });
    listingId = listing.id;
    expect(listing.urgency).toBe("normal");

    const content = await getContent(db, listingId);
    expect(content).toHaveLength(2);
    expect(content.map((c) => c.lang).sort()).toEqual(["en", "th"]);
  });

  it("finds the listing by radius (PostGIS ST_DWithin) and excludes far points", async () => {
    const near = await findListingsNear(db, NIMMAN.lon, NIMMAN.lat, 1_000);
    expect(near.map((l) => l.id)).toContain(listingId);
    const far = await findListingsNear(db, HANG_DONG.lon, HANG_DONG.lat, 1_000);
    expect(far.map((l) => l.id)).not.toContain(listingId);
  });

  it("records price changes in price_history", async () => {
    await changePrice(db, listingId, 4_200_000, "reduced");
    const { rows } = await pool.query(
      "SELECT price_thb::bigint AS price, reason FROM price_history WHERE listing_id = $1 ORDER BY changed_at",
      [listingId],
    );
    expect(rows).toHaveLength(2);
    expect(Number(rows[0].price)).toBe(4_500_000);
    expect(rows[1].reason).toBe("reduced");
    const updated = await getListing(db, listingId);
    expect(updated?.priceThb).toBe(4_200_000);
  });

  it("lists listings", async () => {
    const all = await listListings(db);
    expect(all.length).toBeGreaterThanOrEqual(1);
  });
});

describe("public search (LEGAL-02 consent gate)", () => {
  let ownerId: string;
  let consentedId: string;
  let unconsentedId: string;
  let rentId: string;

  const baseListing = {
    dealType: "sale" as const,
    saleStage: "available" as const,
    titleDeedType: "chanote" as const,
    propertyType: "house" as const,
    province: "เชียงใหม่",
    amphoe: "เมืองเชียงใหม่",
    tambon: "ช้างเผือก",
  };

  beforeAll(async () => {
    const user = await createUserWithIdentity(
      db,
      { displayName: "public-search-owner" },
      { provider: "line", providerSubject: "U-public-search", verifiedAt: new Date() },
    );
    ownerId = user.id;

    const consented = await createListing(db, {
      listing: { ...baseListing, ownerUserId: ownerId, priceThb: 2_000_000 },
      content: [{ lang: "th", headline: "บ้านยินยอมเผยแพร่", description: "x", generatedBy: "human" }],
      media: [{ s3Key: "a/1.jpg", kind: "photo" }],
    });
    consentedId = consented.id;
    await grantPublishConsent(db, consentedId, ownerId, "v1");

    const unconsented = await createListing(db, {
      listing: { ...baseListing, ownerUserId: ownerId, priceThb: 3_000_000 },
      content: [{ lang: "th", headline: "ห้ามเผยแพร่", description: "x", generatedBy: "human" }],
    });
    unconsentedId = unconsented.id;

    const rent = await createListing(db, {
      listing: {
        ...baseListing,
        ownerUserId: ownerId,
        dealType: "rent",
        saleStage: null,
        rentalStatus: "available",
        propertyType: "condo",
        priceThb: null,
      },
      content: [{ lang: "th", headline: "คอนโดให้เช่า", description: "x", generatedBy: "human" }],
      rental: { monthlyRent: 12_000, utilityRateType: "unknown" },
    });
    rentId = rent.id;
    await grantPublishConsent(db, rentId, ownerId, "v1");
  });

  it("returns only consented listings", async () => {
    const { rows, total } = await searchPublicListings(db, { lang: "th" });
    const ids = rows.map((r) => r.listing.id);
    expect(ids).toContain(consentedId);
    expect(ids).toContain(rentId);
    expect(ids).not.toContain(unconsentedId);
    expect(total).toBe(rows.length);
  });

  it("carries headline (th fallback), photo count and monthly rent", async () => {
    const { rows } = await searchPublicListings(db, { lang: "en" });
    const sale = rows.find((r) => r.listing.id === consentedId);
    expect(sale?.headline).toBe("บ้านยินยอมเผยแพร่"); // no en row → th fallback
    expect(sale?.photoCount).toBe(1);
    expect(sale?.monthlyRent).toBeNull();
    expect(sale?.heroThumbKey).toBeNull(); // its one photo has no derivative yet
    const rent = rows.find((r) => r.listing.id === rentId);
    expect(rent?.monthlyRent).toBe(12_000);
  });

  it("4.1: hero thumb + gallery pick derivative-bearing photos in hero order", async () => {
    const withPhotos = await createListing(db, {
      listing: { ...baseListing, ownerUserId: ownerId, priceThb: 4_000_000 },
      content: [{ lang: "th", headline: "บ้านมีรูป", description: "x", generatedBy: "human" }],
      media: [
        // heroIndex 0 but NO thumb yet → must be skipped for the hero (needs a derivative).
        { s3Key: "g/0.jpg", kind: "photo", heroIndex: 0 },
        // heroIndex 2 with a thumb.
        { s3Key: "g/2.jpg", thumbKey: "derivatives/bbb-thumb.jpg", kind: "photo", heroIndex: 2 },
        // heroIndex 1 with a thumb → the winning hero (lowest hero_index among thumb-bearing).
        { s3Key: "g/1.jpg", thumbKey: "derivatives/aaa-thumb.jpg", kind: "photo", heroIndex: 1 },
        // a chanote with a thumb → excluded from the photo hero/gallery.
        { s3Key: "g/deed.jpg", thumbKey: "derivatives/deed-thumb.jpg", kind: "chanote" },
      ],
    });
    await grantPublishConsent(db, withPhotos.id, ownerId, "v1");

    const { rows } = await searchPublicListings(db, { lang: "th" });
    const card = rows.find((r) => r.listing.id === withPhotos.id);
    expect(card?.photoCount).toBe(3); // 3 photos, the chanote isn't counted
    expect(card?.heroThumbKey).toBe("derivatives/aaa-thumb.jpg"); // hero_index 1, has a thumb

    const detail = await getPublicListingDetail(db, withPhotos.id, "th");
    // gallery = thumb-bearing photos only, hero order; the no-thumb photo + the chanote are excluded.
    expect(detail?.photos.map((p) => p.thumbKey)).toEqual([
      "derivatives/aaa-thumb.jpg",
      "derivatives/bbb-thumb.jpg",
    ]);
  });

  it("4.8: projects the rental satellite + omits it for non-rentals", async () => {
    const detail = await getPublicListingDetail(db, rentId, "th");
    // The rent fixture set monthlyRent + utilityRateType; deposit/advance/minLease take schema defaults.
    expect(detail?.rental).toMatchObject({
      depositMonths: 2,
      advanceMonths: 1,
      minLeaseMonths: 12,
      utilityRateType: "unknown",
      furnishingStatus: null,
      petsAllowed: null,
    });
    expect(detail?.condo).toBeNull(); // a condo *rental* with no listing_condo row → no condo block
    // A plain sale house carries neither satellite.
    const sale = await getPublicListingDetail(db, consentedId, "th");
    expect(sale?.rental).toBeNull();
    expect(sale?.condo).toBeNull();
  });

  it("4.8: projects the condo satellite + the plot fields ride on the listing row", async () => {
    const condoSale = await createListing(db, {
      listing: {
        ...baseListing,
        ownerUserId: ownerId,
        propertyType: "condo",
        priceThb: 5_500_000,
        floorAreaSqm: 48,
        facingDirection: "SE",
        roadAccessM: 12,
        roadType: "public",
        cityPlanZoneColor: "เหลือง",
      },
      content: [{ lang: "th", headline: "คอนโดขาย", description: "x", generatedBy: "human" }],
      condo: {
        camFeePerSqmMonth: 50,
        sinkingFundPerSqm: 500,
        projectForeignQuotaPct: 49,
        foreignQuotaAvailable: true,
        quotaBucket: "foreign_quota",
      },
    });
    await grantPublishConsent(db, condoSale.id, ownerId, "v1");

    const detail = await getPublicListingDetail(db, condoSale.id, "th");
    expect(detail?.condo).toMatchObject({
      camFeePerSqmMonth: 50,
      sinkingFundPerSqm: 500,
      projectForeignQuotaPct: 49,
      foreignQuotaAvailable: true,
      quotaBucket: "foreign_quota",
    });
    expect(detail?.rental).toBeNull(); // a sale has no rental satellite
    // facing/road/zone are columns on the listing row itself (no extra projection needed).
    expect(detail?.listing.facingDirection).toBe("SE");
    expect(detail?.listing.roadAccessM).toBe(12);
    expect(detail?.listing.roadType).toBe("public");
    expect(detail?.listing.cityPlanZoneColor).toBe("เหลือง");
  });

  it("filters by dealType/propertyType and paginates with a stable total", async () => {
    const rentOnly = await searchPublicListings(db, { lang: "th", dealType: "rent" });
    expect(rentOnly.rows.map((r) => r.listing.id)).toEqual([rentId]);

    const paged = await searchPublicListings(db, { lang: "th", page: 1, pageSize: 1 });
    expect(paged.rows).toHaveLength(1);
    expect(paged.total).toBeGreaterThanOrEqual(2);
  });

  it("finds by free text over landmark/headline with ILIKE metachars escaped", async () => {
    const byHeadline = await searchPublicListings(db, { lang: "th", text: "ยินยอม" });
    expect(byHeadline.rows.map((r) => r.listing.id)).toEqual([consentedId]);
    const noWildcard = await searchPublicListings(db, { lang: "th", text: "%" });
    expect(noWildcard.rows).toHaveLength(0);
    const miss = await searchPublicListings(db, { lang: "th", text: "ไม่มีทางพบ" });
    expect(miss.rows).toHaveLength(0);
  });

  it("filters by province and lists distinct public provinces", async () => {
    const provinces = await listPublicProvinces(db);
    expect(provinces).toContain("เชียงใหม่");
    const byProvince = await searchPublicListings(db, { lang: "th", province: "เชียงใหม่" });
    expect(byProvince.rows.length).toBeGreaterThanOrEqual(1);
    const none = await searchPublicListings(db, { lang: "th", province: "ภูเก็ต" });
    expect(none.rows).toHaveLength(0);
  });

  it("hides a listing after a deletion request (LEGAL-10)", async () => {
    await pool.query(
      "UPDATE publish_consent SET deletion_requested_at = now() WHERE listing_id = $1",
      [rentId],
    );
    const { rows } = await searchPublicListings(db, { lang: "th" });
    expect(rows.map((r) => r.listing.id)).not.toContain(rentId);
  });
});
