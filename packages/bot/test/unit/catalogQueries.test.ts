import { describe, expect, it } from "vitest";
import {
  activityTimestamp,
  byActivityDesc,
  type Property,
  searchableText,
} from "../../src/core/domain/catalog.js";

const prop = (over: Partial<Property> = {}): Property => ({ propertyId: "p", ...over });

describe("activityTimestamp", () => {
  it("prefers lastActivityAt, then updatedAt, then 0", () => {
    expect(activityTimestamp(prop({ lastActivityAt: 5, updatedAt: 3 }))).toBe(5);
    expect(activityTimestamp(prop({ updatedAt: 3 }))).toBe(3);
    expect(activityTimestamp(prop())).toBe(0);
  });
});

describe("byActivityDesc", () => {
  it("orders most-recently-active first", () => {
    const a = prop({ propertyId: "a", lastActivityAt: 100 });
    const b = prop({ propertyId: "b", lastActivityAt: 900 });
    expect([a, b].sort(byActivityDesc).map((p) => p.propertyId)).toEqual(["b", "a"]);
  });
  it("uses the updatedAt fallback in the comparison", () => {
    const a = prop({ propertyId: "a", updatedAt: 200 });
    const b = prop({ propertyId: "b", lastActivityAt: 50 });
    expect([b, a].sort(byActivityDesc).map((p) => p.propertyId)).toEqual(["a", "b"]);
  });
  it("treats both-absent as 0 (no reordering)", () => {
    const a = prop({ propertyId: "a" });
    const b = prop({ propertyId: "b" });
    expect([a, b].sort(byActivityDesc).map((p) => p.propertyId)).toEqual(["a", "b"]);
  });
});

describe("searchableText", () => {
  it("concatenates the field set, lowercases, drops empties, spreads rawAddresses", () => {
    const text = searchableText(
      prop({
        normalizedAddress: "123 Sukhumvit",
        projectName: "The Park",
        district: "Watthana",
        subdistrict: "",
        province: "Bangkok",
        rawAddresses: ["123 sukhumvit rd", "soi 11"],
      }),
    );
    // subdistrict "" is dropped; everything lowercased; rawAddresses spread at the end.
    expect(text).toBe("123 sukhumvit the park watthana bangkok 123 sukhumvit rd soi 11");
  });
  it("returns an empty string when no searchable fields are present", () => {
    expect(searchableText(prop())).toBe("");
  });
});
