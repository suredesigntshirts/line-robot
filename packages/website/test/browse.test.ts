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

  it("defaults to page 1 with no params", () => {
    expect(parse("")).toEqual({ page: 1 });
  });
});

describe("browseQueryString", () => {
  it("round-trips", () => {
    const q: BrowseQuery = { dealType: "sale", propertyType: "land", page: 2 };
    expect(parse(browseQueryString(q).slice(1))).toEqual(q);
  });

  it("is empty for the default query", () => {
    expect(browseQueryString({ page: 1 })).toBe("");
  });

  it("omits page when 1", () => {
    expect(browseQueryString({ dealType: "rent", page: 1 })).toBe("?deal=rent");
  });
});
