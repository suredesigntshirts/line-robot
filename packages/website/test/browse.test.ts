import { describe, expect, it } from "vitest";
import { type BrowseQuery, browseQueryString, parseBrowseQuery } from "../src/lib/browse.ts";

const parse = (qs: string) => parseBrowseQuery(new URLSearchParams(qs));

describe("parseBrowseQuery", () => {
  it("parses valid filters", () => {
    expect(parse("deal=rent&type=condo&page=3")).toEqual({
      dealType: "rent",
      propertyType: "condo",
      page: 3,
    });
  });

  it("drops unknown enum values and bad pages", () => {
    expect(parse("deal=lease&type=castle&page=0")).toEqual({ page: 1 });
    expect(parse("page=banana")).toEqual({ page: 1 });
    expect(parse("page=-2")).toEqual({ page: 1 });
  });

  it("4.7: parses the new-vs-resale + provenance facets", () => {
    expect(parse("cond=resale&ltype=npa")).toEqual({
      saleCondition: "resale",
      listingType: "npa",
      page: 1,
    });
    expect(parse("cond=new&ltype=auction")).toEqual({
      saleCondition: "new",
      listingType: "auction",
      page: 1,
    });
  });

  it("4.7: drops the non-filter defaults (`normal`/`unknown`) and junk facet values", () => {
    // `normal`/`unknown` are valid enum members but mean "no filter" — never carried in the query.
    expect(parse("cond=unknown&ltype=normal")).toEqual({ page: 1 });
    expect(parse("cond=mint&ltype=foreclosure")).toEqual({ page: 1 });
  });

  it("defaults to page 1 with no params", () => {
    expect(parse("")).toEqual({ page: 1 });
  });

  it("parses text + province, trimming and capping length", () => {
    expect(parse("q=%20nimman%20&province=เชียงใหม่")).toEqual({
      text: "nimman",
      province: "เชียงใหม่",
      page: 1,
    });
    expect(parse(`q=${"ก".repeat(150)}`).text).toHaveLength(100);
  });

  describe("4.2 radius (near) search", () => {
    it("parses lat/lng + a valid radius into `near`", () => {
      expect(parse("lat=18.79&lng=98.99&radius=3000").near).toEqual({
        lat: 18.79,
        lng: 98.99,
        radiusM: 3000,
      });
    });

    it("defaults the radius to 3 km when absent", () => {
      expect(parse("lat=18.79&lng=98.99").near?.radiusM).toBe(3000);
    });

    it("snaps an off-list or junk radius to the nearest allowed option", () => {
      expect(parse("lat=18.79&lng=98.99&radius=2200").near?.radiusM).toBe(3000); // 2200→3000
      expect(parse("lat=18.79&lng=98.99&radius=400").near?.radiusM).toBe(1000); // 400→1000
      expect(parse("lat=18.79&lng=98.99&radius=99999").near?.radiusM).toBe(10000); // huge→10km cap
      expect(parse("lat=18.79&lng=98.99&radius=DROP%20TABLE").near?.radiusM).toBe(3000); // junk→default
    });

    it("drops `near` unless BOTH lat and lng parse as finite numbers", () => {
      expect(parse("lat=18.79").near).toBeUndefined();
      expect(parse("lng=98.99").near).toBeUndefined();
      expect(parse("lat=abc&lng=98.99").near).toBeUndefined();
      expect(parse("lat=18.79&lng=Infinity").near).toBeUndefined();
      expect(parse("lat=&lng=").near).toBeUndefined();
    });

    it("rejects out-of-range WGS84 coordinates (nonsense points)", () => {
      expect(parse("lat=91&lng=98.99").near).toBeUndefined();
      expect(parse("lat=18.79&lng=181").near).toBeUndefined();
      expect(parse("lat=-95&lng=-200").near).toBeUndefined();
    });

    it("composes with the other filters", () => {
      expect(parse("deal=rent&lat=18.79&lng=98.99&radius=5000")).toEqual({
        dealType: "rent",
        near: { lat: 18.79, lng: 98.99, radiusM: 5000 },
        page: 1,
      });
    });
  });
});

describe("browseQueryString", () => {
  it("round-trips", () => {
    const q: BrowseQuery = {
      dealType: "sale",
      propertyType: "land",
      saleCondition: "resale",
      listingType: "npa",
      province: "เชียงใหม่",
      text: "นิมมาน",
      page: 2,
    };
    expect(parse(browseQueryString(q).slice(1))).toEqual(q);
  });

  it("is empty for the default query", () => {
    expect(browseQueryString({ page: 1 })).toBe("");
  });

  it("omits page when 1", () => {
    expect(browseQueryString({ dealType: "rent", page: 1 })).toBe("?deal=rent");
  });

  it("4.2: serializes `near` (lat/lng trimmed to 5 dp + radius) and round-trips", () => {
    const q: BrowseQuery = { near: { lat: 18.796123, lng: 98.987654, radiusM: 5000 }, page: 1 };
    const s = browseQueryString(q);
    expect(s).toBe("?lat=18.79612&lng=98.98765&radius=5000");
    // Round-trips to the trimmed coordinates (5 dp ≈ 1 m — lossless for a search centre).
    expect(parse(s.slice(1)).near).toEqual({ lat: 18.79612, lng: 98.98765, radiusM: 5000 });
  });
});
