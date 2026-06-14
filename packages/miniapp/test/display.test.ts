import { createTranslator } from "@line-robot/ui";
import { describe, expect, it } from "vitest";
import {
  cardHeadline,
  detailHeadline,
  formatThb,
  fullDateTime,
  lifecycleKind,
  locationLine,
  mapsUri,
  priceFrameKey,
  priceText,
  propertyTypeKey,
  viewingDateBubble,
  viewingStatusKey,
  viewingTime,
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

// --- Viewing date/time formatting (Stage 5, Build D — D13) ------------------
// A fixed UTC instant: 2026-06-20T03:00:00Z = 10:00 in Asia/Bangkok (UTC+7). The Intl outputs are
// asserted structurally (Latin day digit, non-empty Thai month, 24h time, B.E. year) so they don't
// break on a non-Bangkok CI tz — except the deterministic en-US cases, which are exact.

const ISO = "2026-06-20T03:00:00.000Z";

describe("viewingDateBubble", () => {
  it("returns a Latin day number + a localized short month", () => {
    const en = viewingDateBubble(ISO, "en");
    expect(en.month).toBe("Jun"); // en-US short month is deterministic
    expect(en.day).toMatch(/^\d{1,2}$/); // Latin day digit
    const th = viewingDateBubble(ISO, "th");
    expect(th.day).toMatch(/^\d{1,2}$/); // the day is Latin in both locales
    expect(th.month).not.toBe(""); // a localized Thai month abbreviation
  });
  it("returns an em-dash bubble for an unparseable date (never throws)", () => {
    expect(viewingDateBubble("not-a-date", "th")).toEqual({ day: "—", month: "" });
  });
});

describe("viewingTime", () => {
  it("renders a 24h HH:mm time", () => {
    expect(viewingTime(ISO, "en")).toMatch(/^\d{2}:\d{2}$/);
  });
  it("returns '' for an unparseable date", () => {
    expect(viewingTime("nope", "en")).toBe("");
  });
});

describe("fullDateTime", () => {
  it("includes a year for the th (Buddhist-era) stamp — 2026 → 2569", () => {
    // The th-TH locale defaults to the Buddhist calendar: 2026 CE = 2569 BE.
    expect(fullDateTime(ISO, "th")).toContain("2569");
  });
  it("includes the Gregorian year for en", () => {
    expect(fullDateTime(ISO, "en")).toContain("2026");
  });
  it("returns '' for an unparseable date", () => {
    expect(fullDateTime("", "th")).toBe("");
  });
});

describe("viewingStatusKey", () => {
  it("maps each viewing status to its label key, defaulting to requested", () => {
    expect(viewingStatusKey("confirmed")).toBe("viewing.statusConfirmed");
    expect(viewingStatusKey("done")).toBe("viewing.statusDone");
    expect(viewingStatusKey("cancelled")).toBe("viewing.statusCancelled");
    expect(viewingStatusKey("requested")).toBe("viewing.statusRequested");
    expect(viewingStatusKey("anything-else")).toBe("viewing.statusRequested");
  });
});
