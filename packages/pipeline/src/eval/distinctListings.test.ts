import { describe, expect, it } from "vitest";
import type { ExtractedListing } from "../steps.ts";
import { scoreDistinctListings } from "./distinctListings.ts";

function listing(over: Partial<ExtractedListing>): ExtractedListing {
  return {
    dealType: "sale",
    propertyType: "house",
    titleDeedType: "chanote",
    priceThb: 1_000_000,
    urgency: "normal",
    urgentBadge: false,
    title: "test",
    description: "",
    province: "เชียงใหม่",
    amphoe: "เมืองเชียงใหม่",
    tambon: "สุเทพ",
    landmark: "x",
    lat: 18.8,
    lon: 98.97,
    landRai: null,
    landNgan: null,
    landWah: null,
    landSqm: null,
    floorAreaSqm: null,
    bedrooms: null,
    bathrooms: null,
    facingDirection: null,
    contactPhone: null,
    posterName: null,
    lowConfidence: false,
    ...over,
  };
}

describe("scoreDistinctListings", () => {
  it("scores 1 for spatially distinct listings (the incident's correct outcome)", () => {
    const out = [
      listing({ title: "a", landmark: "ใกล้ มช.", tambon: "สุเทพ", lat: 18.7299, lon: 98.9477 }),
      listing({ title: "b", landmark: "สันทราย", tambon: "สันทราย", lat: 18.8264, lon: 99.0565 }),
      listing({ title: "c", landmark: "บ่อสร้าง", tambon: "บ่อสร้าง", lat: 18.84, lon: 99.12 }),
    ];
    expect(scoreDistinctListings(out)).toBe(1);
  });

  it("drops below 1 when two listings are co-located (a false merge would fire)", () => {
    const colocated = { landmark: "หมู่บ้านเดียวกัน", tambon: "สุเทพ", lat: 18.8, lon: 98.97 };
    const out = [listing({ title: "a", ...colocated }), listing({ title: "b", ...colocated })];
    expect(scoreDistinctListings(out)).toBeLessThan(1);
  });

  it("returns 1 for a single listing (no pairs to confuse)", () => {
    expect(scoreDistinctListings([listing({})])).toBe(1);
  });
});
