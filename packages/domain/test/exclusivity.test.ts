import { describe, expect, it } from "vitest";
import { canExtend, deriveExclusivityState, extendedExpiry, isReleasable } from "../src/index.ts";

// Fixed clocks — the engine never reads Date.now(); every case injects `now`.
const EXPIRES = new Date("2026-06-22T00:00:00Z"); // a 7-day window opened 2026-06-15
const WITHIN = new Date("2026-06-18T00:00:00Z"); // 4 days in, still open
const AT_EXPIRY = new Date("2026-06-22T00:00:00Z"); // the exact expiry instant
const AFTER = new Date("2026-06-23T00:00:00Z"); // a day past expiry

describe("deriveExclusivityState (D-S6-2 derived logical state)", () => {
  it("open: held, within window, no interest flags", () => {
    expect(
      deriveExclusivityState({
        releaseState: "held",
        expiresAt: EXPIRES,
        hasInterestFlags: false,
        now: WITHIN,
      }),
    ).toBe("open");
  });

  it("open → interest_flagged when a flag arrives within the window", () => {
    expect(
      deriveExclusivityState({
        releaseState: "held",
        expiresAt: EXPIRES,
        hasInterestFlags: true,
        now: WITHIN,
      }),
    ).toBe("interest_flagged");
  });

  it("open → lapsed at the exact expiry instant (>= boundary)", () => {
    expect(
      deriveExclusivityState({
        releaseState: "held",
        expiresAt: EXPIRES,
        hasInterestFlags: false,
        now: AT_EXPIRY,
      }),
    ).toBe("lapsed");
  });

  it("lapsed wins over an interest flag once the window expires (awaits release decision)", () => {
    expect(
      deriveExclusivityState({
        releaseState: "held",
        expiresAt: EXPIRES,
        hasInterestFlags: true,
        now: AFTER,
      }),
    ).toBe("lapsed");
  });

  it("released short-circuits everything — even a future expiry / open window", () => {
    expect(
      deriveExclusivityState({
        releaseState: "released",
        expiresAt: EXPIRES,
        hasInterestFlags: true,
        now: WITHIN,
      }),
    ).toBe("released");
  });

  it("a `releasable` (poster-prompted) window still derives open/lapsed by the clock, not released", () => {
    // releasable is NOT released — it only means the poster MAY release; the window logic still applies.
    expect(
      deriveExclusivityState({
        releaseState: "releasable",
        expiresAt: EXPIRES,
        hasInterestFlags: false,
        now: WITHIN,
      }),
    ).toBe("open");
    expect(
      deriveExclusivityState({
        releaseState: "releasable",
        expiresAt: EXPIRES,
        hasInterestFlags: false,
        now: AFTER,
      }),
    ).toBe("lapsed");
  });
});

describe("isReleasable predicate (eligible for the release prompt)", () => {
  it("true only for lapsed", () => {
    expect(isReleasable("lapsed")).toBe(true);
    expect(isReleasable("open")).toBe(false);
    expect(isReleasable("interest_flagged")).toBe(false);
    expect(isReleasable("released")).toBe(false);
  });
});

describe("canExtend predicate", () => {
  it("anything not released can be extended; released cannot", () => {
    expect(canExtend("held")).toBe(true);
    expect(canExtend("releasable")).toBe(true);
    expect(canExtend("released")).toBe(false);
  });
});

describe("extendedExpiry (extend = bump expiresAt, NOT a 5th state)", () => {
  it("returns windowDays from now; extending a lapsed window resets it to open", () => {
    const now = new Date("2026-06-23T00:00:00Z"); // past the old EXPIRES → currently lapsed
    expect(
      deriveExclusivityState({
        releaseState: "held",
        expiresAt: EXPIRES,
        hasInterestFlags: false,
        now,
      }),
    ).toBe("lapsed");

    const fresh = extendedExpiry(now, 7);
    expect(fresh.toISOString()).toBe("2026-06-30T00:00:00.000Z");
    // With the bumped expiry, the very same `now` is back inside the window → open again.
    expect(
      deriveExclusivityState({
        releaseState: "held",
        expiresAt: fresh,
        hasInterestFlags: false,
        now,
      }),
    ).toBe("open");
  });

  it("respects a per-group window length other than 7", () => {
    const now = new Date("2026-06-15T00:00:00Z");
    expect(extendedExpiry(now, 14).toISOString()).toBe("2026-06-29T00:00:00.000Z");
    expect(extendedExpiry(now, 3).toISOString()).toBe("2026-06-18T00:00:00.000Z");
  });
});
