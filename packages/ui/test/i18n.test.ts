import { describe, expect, it } from "vitest";
import { createTranslator } from "../src/i18n/index.ts";

describe("createTranslator (D3.4)", () => {
  it("defaults to Thai (DF-3)", () => {
    expect(createTranslator()("badge.urgent")).toBe("ขายด่วน");
  });

  it("returns the English string for en", () => {
    expect(createTranslator("en")("badge.urgent")).toBe("Urgent sale");
  });

  it("interpolates {var} in both locales", () => {
    expect(createTranslator("th")("listing.photos", { count: 7 })).toBe("7 รูป");
    expect(createTranslator("en")("listing.postedBy", { name: "Aor" })).toBe("Posted by Aor");
  });

  it("leaves unknown placeholders intact rather than crashing", () => {
    expect(createTranslator("en")("listing.photos", {})).toBe("{count} photos");
  });

  it("CTA labels are bare verbs (COPY-02)", () => {
    const t = createTranslator("en");
    for (const key of ["cta.call"] as const) {
      expect(t(key).split(" ").length).toBeLessThanOrEqual(1);
    }
  });

  it("4.8 detail-field units interpolate with correct Thai units", () => {
    const th = createTranslator("th");
    expect(th("field.roadWidth", { m: 12 })).toBe("หน้ากว้างถนน 12 เมตร");
    expect(th("field.monthsValue", { count: 2 })).toBe("2 เดือน");
    expect(th("field.camFeeValue", { thb: 50 })).toBe("50 บาท/ตร.ม./เดือน");
    expect(th("field.foreignQuotaPct", { pct: 49 })).toBe("49% ของโครงการ");
    const en = createTranslator("en");
    expect(en("field.roadWidth", { m: 12 })).toBe("12 m road frontage");
    expect(en("field.monthsValue", { count: 2 })).toBe("2 months");
  });

  it("4.8 enum-keyed labels resolve for every facing/furnishing/utility/quota value", () => {
    const th = createTranslator("th");
    for (const d of ["N", "NE", "E", "SE", "S", "SW", "W", "NW"] as const) {
      expect(th(`facing.${d}`)).not.toBe("");
    }
    for (const f of ["fully", "partly", "unfurnished"] as const) {
      expect(th(`furnishing.${f}`)).not.toBe("");
    }
    // utility=unknown is intentionally NOT a key — the detail page omits that non-answer row,
    // so only the three meaningful rates have labels.
    for (const u of ["government", "landlord_rate", "included"] as const) {
      expect(th(`utility.${u}`)).not.toBe("");
    }
    for (const q of ["foreign_quota", "thai_quota"] as const) {
      expect(th(`quota.${q}`)).not.toBe("");
    }
  });
});
