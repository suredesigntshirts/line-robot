import { describe, expect, it } from "vitest";
import type { Property } from "../../src/core/domain/catalog.js";
import { toDetailDto, toListDto } from "../../src/core/handlers/catalogDto.js";

function prop(over: Partial<Property> = {}): Property {
  return { propertyId: "p-0123456789", ...over };
}

describe("toListDto", () => {
  it("maps title, status badge, formatted + raw price, area, and a recency stamp", () => {
    const dto = toListDto(
      prop({
        normalizedAddress: "123 Sukhumvit",
        status: "negotiating",
        askingPrice: 5_500_000,
        currency: "THB",
        propertyType: "condo",
        district: "Watthana",
        province: "Bangkok",
        lastActivityAt: 1700,
      }),
    );
    expect(dto.propertyId).toBe("p-0123456789");
    expect(dto.title).toBe("123 Sukhumvit");
    expect(dto.status).toBe("negotiating");
    expect(dto.statusBadge).toBe("🟡 Negotiating");
    expect(dto.price).toBe("฿5,500,000");
    expect(dto.priceValue).toBe(5_500_000);
    expect(dto.area).toBe("Watthana, Bangkok");
    expect(dto.propertyType).toBe("condo");
    expect(dto.updatedAt).toBe(1700);
  });

  it("omits absent fields (present-only) and never carries a heroUrl itself", () => {
    const dto = toListDto(prop({ projectName: "The Park" }));
    expect(dto.title).toBe("The Park");
    expect(dto).not.toHaveProperty("price");
    expect(dto).not.toHaveProperty("status");
    expect(dto).not.toHaveProperty("statusBadge");
    expect(dto).not.toHaveProperty("area");
    expect(dto).not.toHaveProperty("heroUrl");
  });

  it("builds a lowercased search haystack from address/area/project/raw fields", () => {
    const dto = toListDto(
      prop({
        normalizedAddress: "55 Thonglor",
        projectName: "Noble Ploenchit",
        district: "Watthana",
        rawAddresses: ["Soi 55", "Sukhumvit 55"],
      }),
    );
    expect(dto.search).toContain("thonglor");
    expect(dto.search).toContain("noble ploenchit");
    expect(dto.search).toContain("sukhumvit 55");
    expect(dto.search).toBe(dto.search.toLowerCase());
  });

  it("prefers updatedAt for recency when lastActivityAt is absent", () => {
    expect(toListDto(prop({ updatedAt: 900 })).updatedAt).toBe(900);
  });

  it("omits updatedAt entirely when both timestamps are absent (no `updatedAt: 0` leak)", () => {
    // Guards the present-only wire contract: the DTO must keep `?? undefined` semantics, NOT the
    // domain activityTimestamp() which floors to 0 (compact() strips undefined but not 0).
    expect(toListDto(prop({ projectName: "The Park" }))).not.toHaveProperty("updatedAt");
  });
});

describe("toDetailDto", () => {
  it("maps the full field set, mapsUri, coordinates, and an (empty) photos array", () => {
    const dto = toDetailDto(
      prop({
        normalizedAddress: "123 Sukhumvit",
        status: "closed",
        askingPrice: 9_000_000,
        currency: "THB",
        propertyType: "house",
        listingType: "sale",
        bedrooms: 3,
        bathrooms: 2,
        usableAreaSqm: 180,
        landArea: "1 rai",
        floors: 2,
        furnishing: "fully furnished",
        projectName: "The Park",
        district: "Watthana",
        province: "Bangkok",
        contact: "Khun A",
        source: "Facebook",
        tags: ["pool", "corner"],
        notes: "great light",
        lat: 13.7,
        long: 100.5,
        createdAt: 100,
        updatedAt: 200,
      }),
    );
    expect(dto.title).toBe("123 Sukhumvit");
    expect(dto.statusBadge).toBe("🟢 Closed");
    expect(dto.price).toBe("฿9,000,000");
    expect(dto.bedrooms).toBe(3);
    expect(dto.tags).toEqual(["pool", "corner"]);
    expect(dto.lat).toBe(13.7);
    expect(dto.long).toBe(100.5);
    // Reconstructed-from-coordinates maps link when no shared mapUrl.
    expect(dto.mapsUri).toBe("https://www.google.com/maps/search/?api=1&query=13.7,100.5");
    expect(dto.photos).toEqual([]);
  });

  it("prefers the shared map link and renders monthly rent for a rental", () => {
    const dto = toDetailDto(
      prop({
        mapUrl: "https://maps.app.goo.gl/abc",
        listingType: "rent",
        rentPrice: 35_000,
        currency: "THB",
      }),
    );
    expect(dto.mapsUri).toBe("https://maps.app.goo.gl/abc");
    expect(dto.rent).toBe("฿35,000/mo");
    expect(dto).not.toHaveProperty("price");
  });

  it("passes the chanote block through and omits it when absent", () => {
    const withDeed = toDetailDto(prop({ chanote: { deedNumber: "1234", titleType: "chanote" } }));
    expect(withDeed.chanote).toEqual({ deedNumber: "1234", titleType: "chanote" });
    expect(toDetailDto(prop())).not.toHaveProperty("chanote");
  });

  it("omits empty tag arrays (present-only)", () => {
    expect(toDetailDto(prop({ tags: [] }))).not.toHaveProperty("tags");
  });
});
