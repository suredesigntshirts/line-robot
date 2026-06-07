import { BANGKOK_OFFSET_MS, MONTHS } from "@line-robot/shared";
import { describe, expect, it } from "vitest";

describe("@line-robot/shared datetime constants", () => {
  it("Bangkok is UTC+7 (no DST) in ms", () => {
    expect(BANGKOK_OFFSET_MS).toBe(7 * 60 * 60_000);
    expect(BANGKOK_OFFSET_MS).toBe(25_200_000);
  });
  it("has twelve English month labels in calendar order", () => {
    expect(MONTHS).toHaveLength(12);
    expect(MONTHS[0]).toBe("Jan");
    expect(MONTHS[11]).toBe("Dec");
  });
});
