import { describe, expect, it } from "vitest";
import { SYSTEM_CLOCK } from "../../src/lib/clock.js";

describe("SYSTEM_CLOCK", () => {
  it("returns a millisecond timestamp close to Date.now()", () => {
    const before = Date.now();
    const t = SYSTEM_CLOCK.now();
    const after = Date.now();
    expect(typeof t).toBe("number");
    expect(t).toBeGreaterThanOrEqual(before);
    expect(t).toBeLessThanOrEqual(after);
  });
});
