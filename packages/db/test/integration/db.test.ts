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
    // 4.7 additive columns: an aggregate that omits them gets the safe defaults
    // (existing rows are ordinary supply, condition unstated) — never NULL.
    expect(listing.listingType).toBe("normal");
    expect(listing.saleCondition).toBe("unknown");

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
  let npaNewId: string;
  let resaleId: string;

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

    // 4.7: a bank-owned (NPA) listing that is also first-hand (new) — the two axes are independent.
    const npaNew = await createListing(db, {
      listing: {
        ...baseListing,
        ownerUserId: ownerId,
        priceThb: 1_800_000,
        listingType: "npa",
        saleCondition: "new",
      },
      content: [
        { lang: "th", headline: "ทรัพย์ธนาคารมือหนึ่ง", description: "x", generatedBy: "human" },
      ],
    });
    npaNewId = npaNew.id;
    await grantPublishConsent(db, npaNewId, ownerId, "v1");

    // 4.7: a resale listing (ordinary provenance) — only the saleCondition axis is set.
    const resale = await createListing(db, {
      listing: {
        ...baseListing,
        ownerUserId: ownerId,
        priceThb: 2_600_000,
        saleCondition: "resale",
      },
      content: [{ lang: "th", headline: "บ้านมือสอง", description: "x", generatedBy: "human" }],
    });
    resaleId = resale.id;
    await grantPublishConsent(db, resaleId, ownerId, "v1");
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

  it("4.7: filters by listingType (NPA) and saleCondition (new-vs-resale) as first-class facets", async () => {
    // DIST-01/COMP-05: the NPA source filter narrows to bank-owned stock only.
    const npa = await searchPublicListings(db, { lang: "th", listingType: "npa" });
    expect(npa.rows.map((r) => r.listing.id)).toEqual([npaNewId]);

    // COMP-06: new-vs-resale is its own axis. `new` catches the NPA-new listing (provenance is
    // orthogonal); `resale` catches the resale one. Neither bleeds into the other.
    const fresh = await searchPublicListings(db, { lang: "th", saleCondition: "new" });
    expect(fresh.rows.map((r) => r.listing.id)).toEqual([npaNewId]);
    const resale = await searchPublicListings(db, { lang: "th", saleCondition: "resale" });
    expect(resale.rows.map((r) => r.listing.id)).toEqual([resaleId]);

    // The two axes compose (AND): NPA *and* new = the one listing that is both.
    const npaAndNew = await searchPublicListings(db, {
      lang: "th",
      listingType: "npa",
      saleCondition: "new",
    });
    expect(npaAndNew.rows.map((r) => r.listing.id)).toEqual([npaNewId]);

    // An ordinary listing carries the safe defaults and is not caught by either distressed/condition filter.
    const all = await searchPublicListings(db, { lang: "th" });
    const ordinary = all.rows.find((r) => r.listing.id === consentedId);
    expect(ordinary?.listing.listingType).toBe("normal");
    expect(ordinary?.listing.saleCondition).toBe("unknown");
  });

  it("4.3: filters the asking price by a SALE bracket and excludes null-priced listings", async () => {
    // Dedicated, known-price sale fixtures spanning the real North-Thai bands.
    const cheap = await createListing(db, {
      listing: { ...baseListing, ownerUserId: ownerId, priceThb: 900_000 }, // < ฿1M
      content: [{ lang: "th", headline: "บ้านราคาประหยัด", description: "x", generatedBy: "human" }],
    });
    const sweet = await createListing(db, {
      listing: { ...baseListing, ownerUserId: ownerId, priceThb: 4_200_000 }, // ฿3–5M (sweet spot)
      content: [{ lang: "th", headline: "บ้านช่วงราคาดี", description: "x", generatedBy: "human" }],
    });
    await grantPublishConsent(db, cheap.id, ownerId, "v1");
    await grantPublishConsent(db, sweet.id, ownerId, "v1");

    // ฿3–5M bracket catches the 4.2M house; the 0.9M and the boundary listings fall outside.
    const band3to5 = await searchPublicListings(db, {
      lang: "th",
      dealType: "sale",
      priceBand: { min: 3_000_000, max: 5_000_000 },
    });
    const ids3to5 = band3to5.rows.map((r) => r.listing.id);
    expect(ids3to5).toContain(sweet.id);
    expect(ids3to5).not.toContain(cheap.id);
    // The rent fixture has price_thb=null → never caught by a sale price bracket.
    expect(ids3to5).not.toContain(rentId);
    expect(band3to5.rows.every((r) => (r.listing.priceThb ?? 0) >= 3_000_000)).toBe(true);
    expect(band3to5.rows.every((r) => (r.listing.priceThb ?? 0) < 5_000_000)).toBe(true);

    // < ฿1M (open lower bound) catches the 0.9M house, not the 4.2M one.
    const under1m = await searchPublicListings(db, {
      lang: "th",
      dealType: "sale",
      priceBand: { min: 0, max: 1_000_000 },
    });
    expect(under1m.rows.map((r) => r.listing.id)).toContain(cheap.id);
    expect(under1m.rows.map((r) => r.listing.id)).not.toContain(sweet.id);
  });

  it("4.3: a bracket boundary is inclusive at the floor, exclusive at the ceiling", async () => {
    // An exact ฿3,000,000 listing belongs to ฿3–5M (floor inclusive), NOT ฿1–3M (ceiling exclusive).
    const onBoundary = await createListing(db, {
      listing: { ...baseListing, ownerUserId: ownerId, priceThb: 3_000_000 },
      content: [{ lang: "th", headline: "บ้านพอดีขอบ", description: "x", generatedBy: "human" }],
    });
    await grantPublishConsent(db, onBoundary.id, ownerId, "v1");

    const into3to5 = await searchPublicListings(db, {
      lang: "th",
      dealType: "sale",
      priceBand: { min: 3_000_000, max: 5_000_000 },
    });
    expect(into3to5.rows.map((r) => r.listing.id)).toContain(onBoundary.id);

    const into1to3 = await searchPublicListings(db, {
      lang: "th",
      dealType: "sale",
      priceBand: { min: 1_000_000, max: 3_000_000 },
    });
    expect(into1to3.rows.map((r) => r.listing.id)).not.toContain(onBoundary.id);
  });

  it("4.3: a RENT bracket filters monthly_rent (the satellite), not the asking price", async () => {
    const studio = await createListing(db, {
      listing: {
        ...baseListing,
        ownerUserId: ownerId,
        dealType: "rent",
        saleStage: null,
        rentalStatus: "available",
        propertyType: "condo",
        priceThb: null,
      },
      content: [{ lang: "th", headline: "สตูดิโอให้เช่า", description: "x", generatedBy: "human" }],
      rental: { monthlyRent: 8_500, utilityRateType: "unknown" }, // < ฿10k/mo (studio tier)
    });
    await grantPublishConsent(db, studio.id, ownerId, "v1");

    // ฿10–18k/mo catches the shared rent fixture (12,000); the 8,500 studio falls below it.
    const band10to18 = await searchPublicListings(db, {
      lang: "th",
      dealType: "rent",
      priceBand: { min: 10_000, max: 18_000 },
    });
    const ids = band10to18.rows.map((r) => r.listing.id);
    expect(ids).toContain(rentId); // monthlyRent 12,000
    expect(ids).not.toContain(studio.id); // monthlyRent 8,500
    // The bracket reads the satellite — every match has a monthly rent in band, no SALE listing leaks
    // in despite many sale listings having a price_thb in the 10k-18k numeric range.
    expect(band10to18.rows.every((r) => r.monthlyRent !== null)).toBe(true);
    expect(band10to18.rows.every((r) => (r.monthlyRent ?? 0) >= 10_000)).toBe(true);

    // < ฿10k/mo catches the studio, not the 12,000 fixture.
    const under10k = await searchPublicListings(db, {
      lang: "th",
      dealType: "rent",
      priceBand: { min: 0, max: 10_000 },
    });
    expect(under10k.rows.map((r) => r.listing.id)).toContain(studio.id);
    expect(under10k.rows.map((r) => r.listing.id)).not.toContain(rentId);
  });

  it("4.3: the price bracket composes (AND) with the other facets", async () => {
    // A resale house at 2.6M (the shared resale fixture) under ฿1–3M + resale = caught; bump the
    // band to ฿3–5M and the same resale listing drops out (price out of band, condition still matches).
    const resaleIn = await searchPublicListings(db, {
      lang: "th",
      dealType: "sale",
      saleCondition: "resale",
      priceBand: { min: 1_000_000, max: 3_000_000 },
    });
    expect(resaleIn.rows.map((r) => r.listing.id)).toContain(resaleId); // 2.6M resale
    const resaleOut = await searchPublicListings(db, {
      lang: "th",
      dealType: "sale",
      saleCondition: "resale",
      priceBand: { min: 3_000_000, max: 5_000_000 },
    });
    expect(resaleOut.rows.map((r) => r.listing.id)).not.toContain(resaleId);
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

  it("4.2: radius search filters by distance, orders nearest-first, projects distance + coords", async () => {
    // Two consented listings with known coords ~13.6 km apart (Nimman vs Hang Dong).
    const nimman = await createListing(db, {
      listing: {
        ...baseListing,
        ownerUserId: ownerId,
        priceThb: 5_000_000,
        geom: ewktPoint(NIMMAN.lon, NIMMAN.lat),
      },
      content: [{ lang: "th", headline: "ใกล้ Nimman", description: "x", generatedBy: "human" }],
    });
    await grantPublishConsent(db, nimman.id, ownerId, "v1");
    const hangDong = await createListing(db, {
      listing: {
        ...baseListing,
        ownerUserId: ownerId,
        priceThb: 5_000_000,
        geom: ewktPoint(HANG_DONG.lon, HANG_DONG.lat),
      },
      content: [{ lang: "th", headline: "หางดง", description: "x", generatedBy: "human" }],
    });
    await grantPublishConsent(db, hangDong.id, ownerId, "v1");

    // A 1 km radius around Nimman includes Nimman, excludes Hang Dong (and the geom-less fixtures).
    const tight = await searchPublicListings(db, {
      lang: "th",
      near: { lat: NIMMAN.lat, lon: NIMMAN.lon, radiusM: 1_000 },
    });
    const tightIds = tight.rows.map((r) => r.listing.id);
    expect(tightIds).toContain(nimman.id);
    expect(tightIds).not.toContain(hangDong.id);
    expect(tightIds).not.toContain(consentedId); // no geom → never in a radius result
    expect(tight.total).toBe(tight.rows.length);

    // Nimman's own distance is ~0 m; coordinates round-trip through the projection.
    const self = tight.rows.find((r) => r.listing.id === nimman.id);
    expect(self?.distanceM).toBeLessThan(5);
    expect(self?.lat).toBeCloseTo(NIMMAN.lat, 4);
    expect(self?.lon).toBeCloseTo(NIMMAN.lon, 4);

    // A 6 km radius excludes Hang Dong (~13.6 km away) — the distance filter is real, not a no-op.
    const mid = await searchPublicListings(db, {
      lang: "th",
      near: { lat: NIMMAN.lat, lon: NIMMAN.lon, radiusM: 6_000 },
    });
    expect(mid.rows.map((r) => r.listing.id)).not.toContain(hangDong.id);

    // A 15 km radius includes both, NEAREST FIRST, each with a sensible distance.
    const wide = await searchPublicListings(db, {
      lang: "th",
      near: { lat: NIMMAN.lat, lon: NIMMAN.lon, radiusM: 15_000 },
    });
    const order = wide.rows.map((r) => r.listing.id);
    expect(order.indexOf(nimman.id)).toBeLessThan(order.indexOf(hangDong.id));
    const far = wide.rows.find((r) => r.listing.id === hangDong.id);
    expect(far?.distanceM).toBeGreaterThan(10_000);
    expect(far?.distanceM).toBeLessThan(15_000);

    // The radius composes with structured filters (AND) — a property type the points don't match
    // yields an empty radius result even though the point is in range.
    const composed = await searchPublicListings(db, {
      lang: "th",
      propertyType: "condo",
      near: { lat: NIMMAN.lat, lon: NIMMAN.lon, radiusM: 15_000 },
    });
    expect(composed.rows.map((r) => r.listing.id)).not.toContain(nimman.id); // nimman is a house

    // A non-radius search leaves distanceM null but still carries coords.
    const plain = await searchPublicListings(db, { lang: "th" });
    const plainNimman = plain.rows.find((r) => r.listing.id === nimman.id);
    expect(plainNimman?.distanceM).toBeNull();
    expect(plainNimman?.lat).toBeCloseTo(NIMMAN.lat, 4);
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
