import { describe, expect, it } from "vitest";
import { formatDate, formatDateTime } from "../src/lib/format.js";

describe("formatDate (Bangkok-local, with year)", () => {
  it("formats a mid-day instant on the same calendar day", () => {
    // 2026-06-02 07:30 UTC == 14:30 ICT, still 2 Jun.
    expect(formatDate(Date.parse("2026-06-02T07:30:00Z"))).toBe("2 Jun 2026");
  });
  it("rolls to the next Bangkok day for a late-UTC instant", () => {
    // 2026-06-01 18:00 UTC == 2026-06-02 01:00 ICT.
    expect(formatDate(Date.parse("2026-06-01T18:00:00Z"))).toBe("2 Jun 2026");
  });
  it("wraps month and year at the Bangkok new-year boundary", () => {
    // 2025-12-31 17:30 UTC == 2026-01-01 00:30 ICT.
    expect(formatDate(Date.parse("2025-12-31T17:30:00Z"))).toBe("1 Jan 2026");
  });
});

describe("formatDateTime (Bangkok-local, with time)", () => {
  it("appends a zero-padded ICT time", () => {
    // 2026-06-02 07:30 UTC == 14:30 ICT.
    expect(formatDateTime(Date.parse("2026-06-02T07:30:00Z"))).toBe("2 Jun 2026, 14:30");
  });
  it("rolls the date and pads single-digit hours/minutes", () => {
    // 2026-06-01 18:05 UTC == 2026-06-02 01:05 ICT.
    expect(formatDateTime(Date.parse("2026-06-01T18:05:00Z"))).toBe("2 Jun 2026, 01:05");
  });
});
