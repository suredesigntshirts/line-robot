import { describe, expect, it } from "vitest";
import { parseGeoLinks, parseMapUrls } from "../../src/core/domain/geo.js";

describe("parseGeoLinks", () => {
  it("parses the q= pin form (the real-data pattern users paste)", () => {
    const geo = parseGeoLinks("here it is https://maps.google.com/?q=13.7563,100.5018 take a look");
    expect(geo).toEqual([{ lat: 13.7563, long: 100.5018 }]);
  });

  it("parses the @ place-view form", () => {
    const geo = parseGeoLinks("https://www.google.com/maps/@13.7563,100.5018,17z");
    expect(geo).toEqual([{ lat: 13.7563, long: 100.5018 }]);
  });

  it("parses ll=, query=, and loc:-prefixed forms", () => {
    expect(parseGeoLinks("...?ll=13.5,100.2...")[0]).toMatchObject({ lat: 13.5, long: 100.2 });
    expect(parseGeoLinks("...?query=1.0,2.0...")[0]).toMatchObject({ lat: 1.0, long: 2.0 });
    expect(parseGeoLinks("...?q=loc:7.8,98.3...")[0]).toMatchObject({ lat: 7.8, long: 98.3 });
  });

  it("handles negative coordinates", () => {
    expect(parseGeoLinks("?q=-33.8688,151.2093")[0]).toEqual({
      lat: -33.8688,
      long: 151.2093,
    });
  });

  it("de-duplicates repeated coordinates, preserving first-seen order", () => {
    const geo = parseGeoLinks("?q=13.1,100.1 ... ?q=13.2,100.2 ... ?q=13.1,100.1");
    expect(geo.map((g) => `${g.lat},${g.long}`)).toEqual(["13.1,100.1", "13.2,100.2"]);
  });

  it("ignores bare number pairs with no maps carrier (no false positives)", () => {
    expect(parseGeoLinks("the unit is 13.5, 100.2 sqm and costs 5,000,000")).toEqual([]);
  });

  it("drops out-of-range coordinates", () => {
    expect(parseGeoLinks("?q=999.0,100.0")).toEqual([]); // lat > 90
    expect(parseGeoLinks("?q=13.0,200.0")).toEqual([]); // long > 180
  });

  it("returns empty for empty/blank text", () => {
    expect(parseGeoLinks("")).toEqual([]);
    expect(parseGeoLinks("no link here")).toEqual([]);
  });
});

describe("parseMapUrls", () => {
  it("captures the original long-form and short-link Google-Maps URLs verbatim", () => {
    expect(parseMapUrls("see https://www.google.com/maps/place/Foo/@13.7,100.5,17z here")[0]).toBe(
      "https://www.google.com/maps/place/Foo/@13.7,100.5,17z",
    );
    expect(parseMapUrls("loc: https://maps.app.goo.gl/aB9xQ")).toEqual([
      "https://maps.app.goo.gl/aB9xQ",
    ]);
    expect(parseMapUrls("old https://goo.gl/maps/xyz123")).toEqual(["https://goo.gl/maps/xyz123"]);
  });

  it("trims trailing sentence punctuation and de-duplicates", () => {
    expect(parseMapUrls("here: https://maps.app.goo.gl/aB9xQ.")).toEqual([
      "https://maps.app.goo.gl/aB9xQ",
    ]);
    expect(
      parseMapUrls("https://maps.app.goo.gl/dup and again https://maps.app.goo.gl/dup"),
    ).toEqual(["https://maps.app.goo.gl/dup"]);
  });

  it("returns empty when there's no maps link", () => {
    expect(parseMapUrls("just chatting, no link")).toEqual([]);
    expect(parseMapUrls("")).toEqual([]);
  });
});
