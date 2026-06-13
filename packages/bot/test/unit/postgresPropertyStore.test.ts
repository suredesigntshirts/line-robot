import type { BotListingRead, ListingRow } from "@line-robot/db";
import { describe, expect, it } from "vitest";
import {
  listingReadToProperty,
  propertyUpsertToListingPatch,
} from "../../src/adapters/postgres/propertyStore.js";

// A fully-populated listing row with sensible defaults; override per-test. Only the columns the bot
// `Property` view reads are interesting — the rest are present so the row satisfies ListingRow.
function row(overrides: Partial<ListingRow> = {}): ListingRow {
  return {
    id: "11111111-1111-1111-1111-111111111111",
    ownerUserId: "22222222-2222-2222-2222-222222222222",
    sourceGroupId: null,
    dealType: "sale",
    saleStage: "available",
    rentalStatus: null,
    titleDeedType: "chanote",
    deedNo: null,
    tenure: null,
    leaseYears: null,
    propertyType: "house",
    priceThb: 4_500_000,
    priceNegotiable: false,
    urgency: "normal",
    transactionType: "normal",
    redemptionPeriodYears: null,
    province: "Chiang Mai",
    amphoe: "Mueang",
    tambon: "Suthep",
    landmark: "near Nimman",
    projectName: "Baan Suan",
    addressDetail: null,
    geom: null,
    landRai: 1,
    landNgan: 2,
    landWah: 30,
    landSqm: null,
    floorAreaSqm: 180,
    pricePerSqm: null,
    pricePerWah: null,
    bedrooms: 3,
    bathrooms: 2,
    facingDirection: null,
    landShape: null,
    roadAccessM: null,
    roadType: null,
    floodHistory: null,
    floodRiskZone: null,
    cityPlanZoneColor: null,
    listingMandate: "group_exclusive",
    exclusivityExpiresAt: null,
    postedByRole: null,
    extractionSource: "auto",
    createdAt: new Date("2026-06-01T00:00:00Z"),
    updatedAt: new Date("2026-06-10T00:00:00Z"),
    ...overrides,
  };
}

function read(overrides: Partial<BotListingRead> = {}): BotListingRead {
  return {
    listing: row(),
    lat: 18.8,
    lon: 98.97,
    monthlyRent: null,
    furnishingStatus: null,
    media: [],
    content: [{ lang: "th", headline: "บ้านสวย", description: "บ้านเดี่ยว 3 นอน" }],
    amenities: [],
    ...overrides,
  };
}

describe("listingReadToProperty", () => {
  it("maps a sale listing's core fields", () => {
    const p = listingReadToProperty(read());
    expect(p).toMatchObject({
      propertyId: "11111111-1111-1111-1111-111111111111",
      projectName: "Baan Suan",
      province: "Chiang Mai",
      district: "Mueang", // amphoe → district
      subdistrict: "Suthep", // tambon → subdistrict
      propertyType: "house",
      listingType: "sale",
      status: "available", // saleStage
      askingPrice: 4_500_000,
      currency: "THB",
      bedrooms: 3,
      bathrooms: 2,
      usableAreaSqm: 180,
      landArea: "1 rai 2 ngan 30 wah",
      lat: 18.8,
      long: 98.97,
      notes: "บ้านเดี่ยว 3 นอน",
    });
    expect(p.rentPrice).toBeUndefined();
    expect(p.createdAt).toBe(new Date("2026-06-01T00:00:00Z").getTime());
    expect(p.lastActivityAt).toBe(new Date("2026-06-10T00:00:00Z").getTime());
  });

  it("maps a rent listing's rent fields, not askingPrice", () => {
    const p = listingReadToProperty(
      read({
        listing: row({
          dealType: "rent",
          saleStage: null,
          rentalStatus: "available",
          priceThb: null,
        }),
        monthlyRent: 18_000,
        furnishingStatus: "fully",
      }),
    );
    expect(p.listingType).toBe("rent");
    expect(p.rentPrice).toBe(18_000);
    expect(p.askingPrice).toBeUndefined();
    expect(p.status).toBe("available"); // rentalStatus
    expect(p.furnishing).toBe("fully furnished");
    expect(p.currency).toBe("THB");
  });

  it("orders photos by heroIndex and maps media kind", () => {
    const p = listingReadToProperty(
      read({
        media: [
          { s3Key: "b.jpg", kind: "photo", heroIndex: 1 },
          { s3Key: "deed.jpg", kind: "chanote", heroIndex: 2 },
          { s3Key: "a.jpg", kind: "photo", heroIndex: 0 },
        ],
      }),
    );
    expect(p.photos).toEqual([
      { s3Key: "a.jpg", kind: "property" },
      { s3Key: "b.jpg", kind: "property" },
      { s3Key: "deed.jpg", kind: "chanote" },
    ]);
  });

  it("maps amenities to tags and a deed number to chanote", () => {
    const p = listingReadToProperty(
      read({
        listing: row({ deedNo: "1234", titleDeedType: "chanote" }),
        amenities: ["swimming_pool", "parking"],
      }),
    );
    expect(p.tags).toEqual(["swimming_pool", "parking"]);
    expect(p.chanote).toEqual({ deedNumber: "1234", titleType: "chanote" });
  });

  it("omits absent fields (no price, no geom, no content)", () => {
    const p = listingReadToProperty(
      read({
        listing: row({ priceThb: null, projectName: null, landmark: null, addressDetail: null }),
        lat: null,
        lon: null,
        content: [],
      }),
    );
    expect(p.askingPrice).toBeUndefined();
    expect(p.currency).toBeUndefined();
    expect(p.lat).toBeUndefined();
    expect(p.notes).toBeUndefined();
    expect(p.projectName).toBeUndefined();
  });
});

describe("propertyUpsertToListingPatch", () => {
  it("maps structured fields and renames district/subdistrict", () => {
    const { listing, monthlyRent } = propertyUpsertToListingPatch({
      propertyId: "x",
      projectName: "New Name",
      province: "Lamphun",
      district: "Mueang Lamphun",
      subdistrict: "Nai Mueang",
      askingPrice: 3_000_000,
      bedrooms: 4,
    });
    expect(listing).toMatchObject({
      projectName: "New Name",
      province: "Lamphun",
      amphoe: "Mueang Lamphun",
      tambon: "Nai Mueang",
      priceThb: 3_000_000,
      bedrooms: 4,
    });
    expect(monthlyRent).toBeUndefined();
  });

  it("coerces valid enums and drops invalid free-text enums", () => {
    const valid = propertyUpsertToListingPatch({
      propertyId: "x",
      propertyType: "condo",
      listingType: "rent",
    });
    expect(valid.listing.propertyType).toBe("condo");
    expect(valid.listing.dealType).toBe("rent");

    const invalid = propertyUpsertToListingPatch({
      propertyId: "x",
      propertyType: "mansion", // not a valid enum member
      listingType: "lease",
    });
    expect(invalid.listing.propertyType).toBeUndefined();
    expect(invalid.listing.dealType).toBeUndefined();
  });

  it("builds geom only when both coordinates are present", () => {
    expect(
      propertyUpsertToListingPatch({ propertyId: "x", lat: 18.8, long: 98.97 }).listing.geom,
    ).toBe("SRID=4326;POINT(98.97 18.8)");
    expect(
      propertyUpsertToListingPatch({ propertyId: "x", lat: 18.8 }).listing.geom,
    ).toBeUndefined();
  });

  it("routes rentPrice to monthlyRent, not the listing patch", () => {
    const { listing, monthlyRent } = propertyUpsertToListingPatch({
      propertyId: "x",
      rentPrice: 15_000,
    });
    expect(monthlyRent).toBe(15_000);
    expect(Object.keys(listing)).toHaveLength(0);
  });

  it("never maps status (vocab mismatch)", () => {
    const { listing } = propertyUpsertToListingPatch({ propertyId: "x", status: "negotiating" });
    expect(Object.keys(listing)).toHaveLength(0);
  });
});
