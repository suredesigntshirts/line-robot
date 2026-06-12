import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { migrate } from "drizzle-orm/node-postgres/migrator";
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
  listListings,
} from "../../src/index.js";
import { startPostgresLocal, stopPostgresLocal } from "./postgresLocal.js";

const CONTAINER = "linerobot-db-it";
const MIGRATIONS = join(dirname(fileURLToPath(import.meta.url)), "../../migrations");

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
  await migrate(db, { migrationsFolder: MIGRATIONS });
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
