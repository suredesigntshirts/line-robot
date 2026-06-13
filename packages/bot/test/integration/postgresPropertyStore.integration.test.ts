import {
  createListing,
  createUserWithIdentity,
  type Db,
  dbFromPool,
  ewktPoint,
} from "@line-robot/db";
import { migrateDb, startPostgresLocal, stopPostgresLocal } from "@line-robot/db/testing";
import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { PostgresPropertyStore } from "../../src/adapters/postgres/propertyStore.js";

// Exercises the bot's Postgres PropertyStore end to end against a real Postgres (Docker): the
// listing→Property mapping (geom unpacked, photos, deed, rent vs sale), owner-scoped conversation
// listing, the edit write path, the listing_event lifecycle (due partial index + atomic claim), and
// the cascade delete. This is the seam the catalog cutover repoints — exactly where SQL/mapping
// bugs hide behind unit fakes.
const CONTAINER = "linerobot-bot-pg-it";
const CONV_KEY = "group#Cabc123";

let pool: pg.Pool;
let db: Db;
let store: PostgresPropertyStore;
let listingId: string;

beforeAll(async () => {
  const connectionString = await startPostgresLocal(CONTAINER);
  pool = new pg.Pool({ connectionString, max: 2 });
  db = dbFromPool(pool);
  await migrateDb(db);
  store = new PostgresPropertyStore(db);

  // The conversation's pseudo-owner (single-owner v2 model: identity subject == conversation key).
  const owner = await createUserWithIdentity(
    db,
    { displayName: CONV_KEY },
    { provider: "line", providerSubject: CONV_KEY, verifiedAt: new Date() },
  );
  const listing = await createListing(db, {
    listing: {
      ownerUserId: owner.id,
      dealType: "sale",
      titleDeedType: "chanote",
      deedNo: "98765",
      propertyType: "house",
      priceThb: 5_300_000,
      province: "Chiang Mai",
      amphoe: "Hang Dong",
      tambon: "Ban Waen",
      landmark: "Soi 5",
      projectName: "Green Valley",
      geom: ewktPoint(98.92, 18.69),
      landRai: 0,
      landNgan: 1,
      landWah: 50,
      bedrooms: 3,
      bathrooms: 2,
      floorAreaSqm: 200,
    },
    content: [{ lang: "th", headline: "บ้านสวย", description: "บ้านเดี่ยว", generatedBy: "llm" }],
    media: [
      { s3Key: "k0.jpg", kind: "photo", heroIndex: 0 },
      { s3Key: "k1.jpg", kind: "photo", heroIndex: 1 },
    ],
  });
  listingId = listing.id;
}, 120_000);

afterAll(async () => {
  await pool?.end();
  stopPostgresLocal(CONTAINER);
});

describe("PostgresPropertyStore", () => {
  it("maps a listing (+satellites) to the bot Property, geom unpacked to lat/long", async () => {
    const p = await store.getProperty(listingId);
    expect(p).not.toBeNull();
    expect(p).toMatchObject({
      propertyId: listingId,
      projectName: "Green Valley",
      province: "Chiang Mai",
      district: "Hang Dong", // amphoe → district
      subdistrict: "Ban Waen", // tambon → subdistrict
      listingType: "sale",
      askingPrice: 5_300_000,
      currency: "THB",
      bedrooms: 3,
      landArea: "1 ngan 50 wah", // rai=0 omitted
      notes: "บ้านเดี่ยว",
    });
    expect(p?.lat).toBeCloseTo(18.69, 3);
    expect(p?.long).toBeCloseTo(98.92, 3);
    expect(p?.photos?.map((ph) => ph.s3Key)).toEqual(["k0.jpg", "k1.jpg"]);
    expect(p?.chanote?.deedNumber).toBe("98765");
  });

  it("resolves a conversation's listings via the owner identity", async () => {
    expect(await store.listConversationProperties(CONV_KEY)).toEqual([listingId]);
    expect(await store.listConversationProperties("group#nobody")).toEqual([]);
  });

  it("applies a structured edit (upsertProperty)", async () => {
    await store.upsertProperty({ propertyId: listingId, askingPrice: 4_900_000, bedrooms: 4 });
    const p = await store.getProperty(listingId);
    expect(p?.askingPrice).toBe(4_900_000);
    expect(p?.bedrooms).toBe(4);
  });

  it("runs the follow-up event lifecycle with an at-most-once claim", async () => {
    const eventId = "33333333-3333-3333-3333-333333333333";
    const dueAt = Date.parse("2026-06-01T00:00:00Z");
    await store.addEvent({
      eventId,
      propertyId: listingId,
      dueAt,
      title: "Site visit",
      notifyConversationKey: CONV_KEY,
      createdAt: Date.now(),
    });

    const due = await store.findDueEvents(new Date(dueAt + 1000).toISOString(), 10);
    expect(due.map((e) => e.eventId)).toContain(eventId);
    const event = due.find((e) => e.eventId === eventId);
    if (!event) throw new Error("event not found");

    expect(await store.markEventNotified(event, Date.now())).toBe(true);
    expect(await store.markEventNotified(event, Date.now())).toBe(false); // already claimed

    // Notified events drop out of the due query (partial index).
    const after = await store.findDueEvents(new Date(dueAt + 1000).toISOString(), 10);
    expect(after.map((e) => e.eventId)).not.toContain(eventId);

    const all = await store.listPropertyEvents(listingId);
    expect(all).toHaveLength(1);
    expect(all[0]?.notifiedAt).toBeDefined();
  });

  it("cascade-deletes the listing, its satellites, and its events", async () => {
    await store.addEvent({
      eventId: "44444444-4444-4444-4444-444444444444",
      propertyId: listingId,
      dueAt: Date.now() + 1_000_000,
      notifyConversationKey: CONV_KEY,
    });
    await store.deleteProperty(listingId);
    expect(await store.getProperty(listingId)).toBeNull();
    expect(await store.listPropertyEvents(listingId)).toHaveLength(0);
    expect(await store.listConversationProperties(CONV_KEY)).toEqual([]);
  });
});
