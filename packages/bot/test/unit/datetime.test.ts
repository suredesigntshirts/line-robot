import { describe, expect, it } from "vitest";
import { formatDueDate, parseBangkokLocal } from "../../src/core/domain/datetime.js";

describe("datetime (Asia/Bangkok, UTC+7)", () => {
  it("parses a picker value as Bangkok-local epoch ms", () => {
    // 2026-06-10 14:30 ICT == 07:30 UTC.
    expect(parseBangkokLocal("2026-06-10T14:30")).toBe(Date.parse("2026-06-10T07:30:00Z"));
  });

  it("returns null for anything that isn't `YYYY-MM-DDTHH:mm`", () => {
    expect(parseBangkokLocal("not-a-date")).toBeNull();
    expect(parseBangkokLocal("2026-06-10")).toBeNull();
    expect(parseBangkokLocal("2026-06-10T14:30:00")).toBeNull();
  });

  it("formats an instant as a Bangkok label", () => {
    expect(formatDueDate(Date.parse("2026-06-10T07:30:00Z"))).toContain("Jun 10, 14:30 ICT");
  });

  it("round-trips a pick back to the same label", () => {
    const ms = parseBangkokLocal("2026-01-05T09:05");
    expect(ms).not.toBeNull();
    expect(formatDueDate(ms as number)).toContain("Jan 5, 09:05 ICT");
  });
});
