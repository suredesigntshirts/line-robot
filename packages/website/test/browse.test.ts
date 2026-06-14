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

  describe("4.3 contextual price bracket", () => {
    it("resolves a SALE bracket id against the sale band set (and with no deal type)", () => {
      // ฿3–5M sweet-spot bracket — the bounds come from the research bands.
      expect(parse("deal=sale&price=s2").priceBand).toEqual({
        id: "s2",
        labelKey: "price.sale3to5m",
        min: 3_000_000,
        max: 5_000_000,
      });
      // No deal type → defaults to the sale bands (sale is the dominant Thai path).
      expect(parse("price=s0").priceBand).toMatchObject({ id: "s0", min: 0, max: 1_000_000 });
    });

    it("resolves a RENT bracket id only under a rent deal context", () => {
      expect(parse("deal=rent&price=r1").priceBand).toEqual({
        id: "r1",
        labelKey: "price.rent10to18k",
        min: 10_000,
        max: 18_000,
      });
      // The open-ended top bracket has a null ceiling.
      expect(parse("deal=rent&price=r3").priceBand).toMatchObject({ id: "r3", max: null });
    });

    it("drops a bracket id that belongs to the WRONG deal context (no cross-column leak)", () => {
      // A rent bracket under a sale search → unresolved → dropped (can't filter price_thb by a rent band).
      expect(parse("deal=sale&price=r1").priceBand).toBeUndefined();
      // A sale bracket under a rent search → dropped.
      expect(parse("deal=rent&price=s2").priceBand).toBeUndefined();
      // A sale bracket with no deal type resolves (defaults to sale); a rent bracket does not.
      expect(parse("price=s2").priceBand).toBeDefined();
      expect(parse("price=r1").priceBand).toBeUndefined();
    });

    it("drops an unknown bracket id", () => {
      expect(parse("deal=sale&price=s99").priceBand).toBeUndefined();
      expect(parse("deal=sale&price=DROP%20TABLE").priceBand).toBeUndefined();
    });
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

  it("4.3: serializes the price bracket id and round-trips within its deal context", () => {
    const sale: BrowseQuery = {
      dealType: "sale",
      priceBand: { id: "s2", labelKey: "price.sale3to5m", min: 3_000_000, max: 5_000_000 },
      page: 1,
    };
    expect(browseQueryString(sale)).toBe("?deal=sale&price=s2");
    expect(parse(browseQueryString(sale).slice(1))).toEqual(sale);

    const rent: BrowseQuery = {
      dealType: "rent",
      priceBand: { id: "r3", labelKey: "price.rentOver35k", min: 35_000, max: null },
      page: 1,
    };
    expect(browseQueryString(rent)).toBe("?deal=rent&price=r3");
    expect(parse(browseQueryString(rent).slice(1))).toEqual(rent);
  });

  it("4.2: serializes `near` (lat/lng trimmed to 5 dp + radius) and round-trips", () => {
    const q: BrowseQuery = { near: { lat: 18.796123, lng: 98.987654, radiusM: 5000 }, page: 1 };
    const s = browseQueryString(q);
    expect(s).toBe("?lat=18.79612&lng=98.98765&radius=5000");
    // Round-trips to the trimmed coordinates (5 dp ≈ 1 m — lossless for a search centre).
    expect(parse(s.slice(1)).near).toEqual({ lat: 18.79612, lng: 98.98765, radiusM: 5000 });
  });
});
