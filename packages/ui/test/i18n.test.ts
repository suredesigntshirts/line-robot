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
});
