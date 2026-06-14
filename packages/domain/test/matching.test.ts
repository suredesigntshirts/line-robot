import { describe, expect, it } from "vitest";
import {
  type MatchCandidate,
  type MatchListing,
  matchVettedUsers,
  priceBandId,
} from "../src/index.ts";

describe("priceBandId (Stage-4 North-Thai bands)", () => {
  it("sale bands: floor inclusive, ceiling exclusive, open top", () => {
    expect(priceBandId("sale", 0)).toBe("s0");
    expect(priceBandId("sale", 999_999)).toBe("s0");
    expect(priceBandId("sale", 1_000_000)).toBe("s1"); // boundary lands in the higher band
    expect(priceBandId("sale", 4_200_000)).toBe("s2");
    expect(priceBandId("sale", 5_000_000)).toBe("s3");
    expect(priceBandId("sale", 20_000_000)).toBe("s5"); // open-ended top
    expect(priceBandId("sale", 99_000_000)).toBe("s5");
  });

  it("rent bands map to the monthly-rent boundaries", () => {
    expect(priceBandId("rent", 8_500)).toBe("r0");
    expect(priceBandId("rent", 10_000)).toBe("r1");
    expect(priceBandId("rent", 18_000)).toBe("r2");
    expect(priceBandId("rent", 35_000)).toBe("r3");
    expect(priceBandId("rent", 120_000)).toBe("r3");
  });

  it("throws on a negative amount (a price can't be below the ฿0 floor)", () => {
    expect(() => priceBandId("sale", -1)).toThrow();
  });
});

describe("matchVettedUsers (D-S6-6 province ∩ type ∩ band overlap)", () => {
  const listing: MatchListing = {
    province: "เชียงใหม่",
    propertyType: "house",
    dealType: "sale",
    amountThb: 4_200_000, // → band s2
  };

  it("an all-empty (any/any/any) preference always matches", () => {
    const c: MatchCandidate = { userId: "any" };
    expect(matchVettedUsers(listing, [c])).toEqual([c]);
    // explicit-empty arrays are equivalent to absent
    const c2: MatchCandidate = {
      userId: "empties",
      provinces: [],
      propertyTypes: [],
      priceBandIds: [],
    };
    expect(matchVettedUsers(listing, [c2])).toEqual([c2]);
  });

  it("a province-only preference matches on province, rejects a different province", () => {
    const cnx: MatchCandidate = { userId: "cnx", provinces: ["เชียงใหม่"] };
    const phuket: MatchCandidate = { userId: "phuket", provinces: ["ภูเก็ต"] };
    expect(matchVettedUsers(listing, [cnx, phuket])).toEqual([cnx]);
  });

  it("a property-type preference filters: house in, condo-only out", () => {
    const condoOnly: MatchCandidate = { userId: "condo", propertyTypes: ["condo"] };
    const houseOrLand: MatchCandidate = { userId: "hl", propertyTypes: ["house", "land"] };
    expect(matchVettedUsers(listing, [condoOnly, houseOrLand])).toEqual([houseOrLand]);
  });

  it("a price-band preference matches the listing's derived band, rejects an adjacent one", () => {
    const inBand: MatchCandidate = { userId: "in", priceBandIds: ["s2", "s3"] };
    const wrongBand: MatchCandidate = { userId: "out", priceBandIds: ["s0", "s1"] };
    // 4.2M → s2: inBand contains s2, wrongBand does not.
    expect(matchVettedUsers(listing, [inBand, wrongBand])).toEqual([inBand]);
  });

  it("all three axes must overlap (AND) — a province match with a band miss does NOT match", () => {
    const provinceYesBandNo: MatchCandidate = {
      userId: "mixed",
      provinces: ["เชียงใหม่"],
      priceBandIds: ["s5"], // 4.2M is s2, not s5
    };
    expect(matchVettedUsers(listing, [provinceYesBandNo])).toEqual([]);
  });

  it("preserves order and returns the matched subset across a realistic candidate set", () => {
    const candidates: MatchCandidate[] = [
      { userId: "u1", provinces: ["เชียงใหม่"], propertyTypes: ["house"], priceBandIds: ["s2"] }, // match
      { userId: "u2" }, // any/any/any → match
      { userId: "u3", provinces: ["ภูเก็ต"] }, // province miss
      { userId: "u4", propertyTypes: ["condo"] }, // type miss
      { userId: "u5", priceBandIds: ["s2", "s3"] }, // band match
    ];
    expect(matchVettedUsers(listing, candidates).map((c) => c.userId)).toEqual(["u1", "u2", "u5"]);
  });

  it("uses the RENT band for a rent listing (the amount is the monthly rent)", () => {
    const rentListing: MatchListing = {
      province: "เชียงใหม่",
      propertyType: "condo",
      dealType: "rent",
      amountThb: 12_000, // → r1
    };
    const r1Broker: MatchCandidate = { userId: "r1", priceBandIds: ["r1"] };
    const r2Broker: MatchCandidate = { userId: "r2", priceBandIds: ["r2"] };
    expect(matchVettedUsers(rentListing, [r1Broker, r2Broker])).toEqual([r1Broker]);
  });
});
