import { createTranslator } from "@line-robot/ui";
import { describe, expect, it } from "vitest";
import {
  cardHeadline,
  detailHeadline,
  formatThb,
  lifecycleKind,
  locationLine,
  mapsUri,
  priceFrameKey,
  priceText,
  propertyTypeKey,
} from "../src/lib/display.ts";
import { DETAIL, LISTING_ACTIVE, LISTING_RENT, MY_LISTINGS } from "./fixtures.ts";

const t = createTranslator("th");

describe("formatThb", () => {
  it("groups with the ฿ prefix and Latin numerals", () => {
    expect(formatThb(4_800_000)).toBe("฿4,800,000");
    expect(formatThb(0)).toBe("฿0");
  });
});

describe("priceText", () => {
  it("uses priceThb for a sale (the REAL card DTO shape — sale: priceThb set, monthlyRent null)", () => {
    expect(priceText(LISTING_ACTIVE)).toBe("฿1,200,000");
  });
  it("uses monthlyRent for a rent card — NOT '—' (review finding #1)", () => {
    // LISTING_RENT is the real api shape for a rental: priceThb null, monthlyRent 13_000.
    expect(LISTING_RENT.priceThb).toBeNull();
    expect(priceText(LISTING_RENT)).toBe("฿13,000");
  });
  it("falls back to '—' only when the relevant amount is genuinely absent", () => {
    expect(priceText({ dealType: "rent", priceThb: null, monthlyRent: null })).toBe("—");
    expect(priceText({ dealType: "sale", priceThb: null, monthlyRent: null })).toBe("—");
  });
});

describe("priceFrameKey", () => {
  it("asking for sale, monthly for rent", () => {
    expect(priceFrameKey("sale")).toBe("listing.priceAsking");
    expect(priceFrameKey("rent")).toBe("listing.priceMonthly");
  });
});

describe("propertyTypeKey", () => {
  it("maps every domain property type, falling back to other", () => {
    expect(propertyTypeKey("land")).toBe("ptype.land");
    expect(propertyTypeKey("condo")).toBe("ptype.condo");
    expect(propertyTypeKey("warehouse")).toBe("ptype.other");
  });
});

describe("locationLine", () => {
  it("joins amphoe · province, dropping absent parts", () => {
    expect(locationLine({ amphoe: "สันทราย", province: "เชียงใหม่" })).toBe("สันทราย · เชียงใหม่");
    expect(locationLine({ amphoe: null, province: "เชียงใหม่" })).toBe("เชียงใหม่");
    expect(locationLine({ amphoe: null, province: null })).toBe("");
  });
});

describe("lifecycleKind (DF-4)", () => {
  it("classifies the fixture spread", () => {
    // reserved sale → offer; available+published sale → active; available rent → active;
    // available+unpublished sale → draft; transferred sale → sold.
    expect(MY_LISTINGS.map(lifecycleKind)).toEqual(["offer", "active", "active", "draft", "sold"]);
  });
  it("rent terminal states map to rented/withdrawn", () => {
    expect(
      lifecycleKind({
        dealType: "rent",
        saleStage: "available",
        rentalStatus: "rented",
      }),
    ).toBe("rented");
    expect(
      lifecycleKind({
        dealType: "rent",
        saleStage: "available",
        rentalStatus: "withdrawn",
      }),
    ).toBe("withdrawn");
  });
});

describe("cardHeadline / detailHeadline", () => {
  it("composes deal + property type + location for a card", () => {
    expect(cardHeadline(LISTING_ACTIVE, t)).toBe("ขาย บ้านเดี่ยว · สันทราย · เชียงใหม่");
  });
  it("prefers the listing's own headline on the detail", () => {
    expect(detailHeadline(DETAIL, t)).toBe(DETAIL.headline);
  });
  it("falls back to the composed headline when the detail headline is blank", () => {
    expect(detailHeadline({ ...DETAIL, headline: "" }, t)).toContain("ขาย");
  });
});

describe("mapsUri", () => {
  it("builds a google-maps search link from lat/lon", () => {
    expect(mapsUri(18.79, 98.95)).toBe(
      "https://www.google.com/maps/search/?api=1&query=18.79,98.95",
    );
  });
});
