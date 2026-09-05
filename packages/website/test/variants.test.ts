import { describe, expect, it } from "vitest";
import { parseBrowseQuery } from "../src/lib/browse.ts";
import { activeFacetCount, hiddenInputs, hrefFor } from "../src/lib/browseFacets.ts";
import { isEmptySpec, parseUiSpec, serializeUiSpec, variantFor } from "../src/lib/variants.ts";

describe("UI variant spec", () => {
  it("parses a global pick, page-scoped picks, and reset", () => {
    expect(parseUiSpec("b")).toEqual({ global: "b", pages: {} });
    expect(parseUiSpec("browse:b,home:c")).toEqual({ pages: { browse: "b", home: "c" } });
    expect(parseUiSpec("B, Browse:C")).toEqual({ global: "b", pages: { browse: "c" } });
    expect(isEmptySpec(parseUiSpec("reset"))).toBe(true);
    expect(isEmptySpec(parseUiSpec(""))).toBe(true);
    expect(isEmptySpec(parseUiSpec(undefined))).toBe(true);
  });

  it("drops junk tokens (no injection into the cookie)", () => {
    expect(parseUiSpec("browse:<script>,ok:b")).toEqual({ pages: { ok: "b" } });
    expect(serializeUiSpec(parseUiSpec("browse:b,x"))).toBe("x,browse:b");
  });

  it("resolves page-scoped over global over the default, unknown → default", () => {
    expect(variantFor("browse", parseUiSpec("browse:c,b"))).toBe("c");
    expect(variantFor("browse", parseUiSpec("b"))).toBe("b");
    expect(variantFor("browse", parseUiSpec("home:b"))).toBe("a");
    expect(variantFor("browse", parseUiSpec("zzz"))).toBe("a");
    expect(variantFor("browse", parseUiSpec(""))).toBe("a");
  });
});

describe("facet hrefs", () => {
  const q = (qs: string) => parseBrowseQuery(new URLSearchParams(qs));

  it("sets, replaces and clears a facet, always resetting the page", () => {
    expect(hrefFor("/p", q("page=3"), "type", "house")).toBe("/p?type=house");
    expect(hrefFor("/p", q("type=house"), "type", "condo")).toBe("/p?type=condo");
    expect(hrefFor("/p", q("type=house"), "type", undefined)).toBe("/p");
  });

  it("changing the deal drops a price bracket; changing the province drops the district", () => {
    expect(hrefFor("/p", q("deal=sale&price=s2"), "deal", "rent")).toBe("/p?deal=rent");
    expect(hrefFor("/p", q("province=X&area=Y"), "province", "Z")).toBe("/p?province=Z");
  });

  it("hidden inputs carry everything except the edited params; active count counts facets", () => {
    const query = q("deal=rent&price=r1&q=condo&beds=2&sort=price_asc");
    expect(hiddenInputs(query, ["q", "sort"])).toEqual([
      ["deal", "rent"],
      ["beds", "2"],
      ["price", "r1"],
    ]);
    expect(activeFacetCount(query)).toBe(4);
  });
});
