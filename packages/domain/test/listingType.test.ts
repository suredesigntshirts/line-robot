import { describe, expect, it } from "vitest";
import { listingType, saleCondition } from "../src/index.ts";

describe("listingType (DIST-01/MKT-11/P8)", () => {
  it("is the minimal provenance set: normal | npa | auction", () => {
    expect(listingType.options).toEqual(["normal", "npa", "auction"]);
  });

  it("parses the members and rejects unknown provenance", () => {
    expect(listingType.safeParse("npa").success).toBe(true);
    expect(listingType.safeParse("auction").success).toBe(true);
    expect(listingType.safeParse("foreclosure").success).toBe(false);
  });
});

describe("saleCondition (COMP-06)", () => {
  it("is new | resale | unknown", () => {
    expect(saleCondition.options).toEqual(["new", "resale", "unknown"]);
  });

  it("defaults the unsaid case to unknown, not new", () => {
    // `unknown` must be a real member so existing rows that never stated it are
    // omitted from the UI rather than mislabelled "new".
    expect(saleCondition.safeParse("unknown").success).toBe(true);
  });
});
