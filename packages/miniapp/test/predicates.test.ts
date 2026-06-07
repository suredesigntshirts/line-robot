import type { PropertyListItem } from "@line-robot/shared";
import { describe, expect, it } from "vitest";
import { applyFilters, distinctValues, sortItems } from "../src/lib/predicates.js";

function item(over: Partial<PropertyListItem> & { propertyId: string }): PropertyListItem {
  return { title: over.propertyId, search: "", ...over };
}

const items: PropertyListItem[] = [
  item({
    propertyId: "a",
    title: "55 Thonglor",
    status: "negotiating",
    propertyType: "condo",
    area: "Watthana, Bangkok",
    priceValue: 5_000_000,
    updatedAt: 300,
    search: "55 thonglor watthana",
  }),
  item({
    propertyId: "b",
    title: "Riverside House",
    status: "lead",
    propertyType: "house",
    area: "Bang Rak, Bangkok",
    priceValue: 9_000_000,
    updatedAt: 200,
    search: "riverside bang rak",
  }),
  item({
    propertyId: "c",
    title: "No price condo",
    status: "lead",
    propertyType: "condo",
    area: "Watthana, Bangkok",
    updatedAt: 100,
    search: "no price",
  }),
];

describe("applyFilters", () => {
  it("returns everything for empty filters", () => {
    expect(applyFilters(items, {}).length).toBe(3);
  });

  it("filters by status, type, and area independently", () => {
    expect(applyFilters(items, { status: "lead" }).map((i) => i.propertyId)).toEqual(["b", "c"]);
    expect(applyFilters(items, { propertyType: "condo" }).map((i) => i.propertyId)).toEqual([
      "a",
      "c",
    ]);
    expect(applyFilters(items, { area: "Bang Rak, Bangkok" }).map((i) => i.propertyId)).toEqual([
      "b",
    ]);
  });

  it("combines filters (AND)", () => {
    expect(
      applyFilters(items, { status: "lead", propertyType: "condo" }).map((i) => i.propertyId),
    ).toEqual(["c"]);
  });

  it("matches the search box against the haystack and the title, case-insensitively", () => {
    expect(applyFilters(items, { query: "thonglor" }).map((i) => i.propertyId)).toEqual(["a"]);
    expect(applyFilters(items, { query: "RIVERSIDE" }).map((i) => i.propertyId)).toEqual(["b"]);
    expect(applyFilters(items, { query: "  " })).toHaveLength(3); // whitespace-only = no filter
  });
});

describe("sortItems", () => {
  it("sorts by recency (updatedAt desc) by default", () => {
    expect(sortItems(items, "recency").map((i) => i.propertyId)).toEqual(["a", "b", "c"]);
  });

  it("sorts by price ascending, pushing missing prices to the end", () => {
    expect(sortItems(items, "price-asc").map((i) => i.propertyId)).toEqual(["a", "b", "c"]);
  });

  it("sorts by price descending, keeping missing prices last", () => {
    expect(sortItems(items, "price-desc").map((i) => i.propertyId)).toEqual(["b", "a", "c"]);
  });

  it("does not mutate the input array", () => {
    const before = items.map((i) => i.propertyId);
    sortItems(items, "price-desc");
    expect(items.map((i) => i.propertyId)).toEqual(before);
  });
});

describe("distinctValues", () => {
  it("returns sorted distinct values and drops absent ones", () => {
    expect(distinctValues(items, "propertyType")).toEqual(["condo", "house"]);
    expect(distinctValues(items, "status")).toEqual(["lead", "negotiating"]);
    expect(distinctValues(items, "area")).toEqual(["Bang Rak, Bangkok", "Watthana, Bangkok"]);
  });
});
