import { describe, expect, it } from "vitest";
import { extractedToBaseUpsert } from "../../src/core/handlers/propertyMapping.js";
import type { ExtractedProperty } from "../../src/core/ports/extraction.js";

function extracted(over: Partial<ExtractedProperty> = {}): ExtractedProperty {
  return {
    existingPropertyId: "",
    ambiguous: false,
    ambiguousWith: [],
    normalizedAddress: "",
    rawAddress: "",
    projectName: "",
    lat: null,
    long: null,
    district: "",
    subdistrict: "",
    province: "",
    propertyType: "",
    status: "",
    askingPrice: null,
    currency: "",
    tags: [],
    bedrooms: null,
    bathrooms: null,
    usableAreaSqm: null,
    landArea: "",
    floors: null,
    furnishing: "",
    notes: "",
    listingType: "",
    rentPrice: null,
    contact: "",
    source: "",
    ...over,
  };
}

describe("extractedToBaseUpsert", () => {
  it("all-sentinel input -> every field present and undefined", () => {
    const u = extractedToBaseUpsert(extracted());
    // Pin the exact key set so a field accidentally dropped from the mapping is caught (every key is
    // optional in PropertyUpsert, so a dropped key would NOT fail typecheck — only this assertion).
    expect(new Set(Object.keys(u))).toEqual(
      new Set([
        "normalizedAddress",
        "rawAddresses",
        "projectName",
        "lat",
        "long",
        "district",
        "subdistrict",
        "province",
        "propertyType",
        "status",
        "askingPrice",
        "currency",
        "tags",
        "bedrooms",
        "bathrooms",
        "usableAreaSqm",
        "landArea",
        "floors",
        "furnishing",
        "notes",
        "listingType",
        "rentPrice",
        "contact",
        "source",
      ]),
    );
    for (const v of Object.values(u)) expect(v).toBeUndefined();
  });
  it("passes through non-empty strings and numbers; wraps rawAddress; copies tags", () => {
    const u = extractedToBaseUpsert(
      extracted({
        normalizedAddress: "1 Sukhumvit",
        rawAddress: "1 sukhumvit rd",
        askingPrice: 5_500_000,
        tags: ["near-bts"],
        status: "lead",
      }),
    );
    expect(u.normalizedAddress).toBe("1 Sukhumvit");
    expect(u.rawAddresses).toEqual(["1 sukhumvit rd"]);
    expect(u.askingPrice).toBe(5_500_000);
    expect(u.tags).toEqual(["near-bts"]);
    expect(u.status).toBe("lead");
  });
  it("backfills location from chanote only when the extracted field is empty", () => {
    const chanote = { district: "Cd", subdistrict: "Cs", province: "Cp", landArea: "1 rai" };
    const u = extractedToBaseUpsert(extracted({ district: "Ed" }), chanote);
    expect(u.district).toBe("Ed"); // extracted wins
    expect(u.subdistrict).toBe("Cs"); // backfilled
    expect(u.province).toBe("Cp");
    expect(u.landArea).toBe("1 rai");
  });
  it("never backfills when no chanote is supplied (edit-path parity)", () => {
    const u = extractedToBaseUpsert(extracted({ district: "" }));
    expect(u.district).toBeUndefined();
    expect(u.landArea).toBeUndefined();
  });
});
