import { describe, expect, it } from "vitest";
import {
  canAutoRelease,
  canTransitionRentalStatus,
  canTransitionSaleStage,
  isSaleBlockedByDeed,
  NO_SALE_DEED_TYPES,
  titleDeedType,
} from "../src/index.js";

describe("sale stage transitions (DF-4: มัดจำ → จะซื้อจะขาย → โอน)", () => {
  it("walks the happy path forward", () => {
    expect(canTransitionSaleStage("available", "reserved")).toBe(true);
    expect(canTransitionSaleStage("reserved", "under_contract")).toBe(true);
    expect(canTransitionSaleStage("under_contract", "transferred")).toBe(true);
  });

  it("allows fall-through back to available before transfer", () => {
    expect(canTransitionSaleStage("reserved", "available")).toBe(true);
    expect(canTransitionSaleStage("under_contract", "available")).toBe(true);
  });

  it("forbids skipping stages and reviving a transferred listing", () => {
    expect(canTransitionSaleStage("available", "transferred")).toBe(false);
    expect(canTransitionSaleStage("available", "under_contract")).toBe(false);
    expect(canTransitionSaleStage("reserved", "transferred")).toBe(false);
    expect(canTransitionSaleStage("transferred", "available")).toBe(false);
  });

  it("forbids self-transitions", () => {
    expect(canTransitionSaleStage("available", "available")).toBe(false);
    expect(canTransitionSaleStage("reserved", "reserved")).toBe(false);
  });
});

describe("rental status transitions (DF-4: no sale ceremony)", () => {
  it("allows rent-out, withdraw, and re-list", () => {
    expect(canTransitionRentalStatus("available", "rented")).toBe(true);
    expect(canTransitionRentalStatus("available", "withdrawn")).toBe(true);
    expect(canTransitionRentalStatus("rented", "available")).toBe(true);
    expect(canTransitionRentalStatus("withdrawn", "available")).toBe(true);
  });

  it("forbids rented→withdrawn shortcut", () => {
    expect(canTransitionRentalStatus("rented", "withdrawn")).toBe(false);
  });
});

describe("deed-type sale block (FIELD-03)", () => {
  it("blocks exactly the five no-transfer deed types", () => {
    expect([...NO_SALE_DEED_TYPES].sort()).toEqual(["ns2", "pbt5", "sk1", "spk", "stg"]);
    for (const deed of NO_SALE_DEED_TYPES) {
      expect(isSaleBlockedByDeed(deed)).toBe(true);
    }
  });

  it("does not block sellable or unresolved deed types", () => {
    expect(isSaleBlockedByDeed("chanote")).toBe(false);
    expect(isSaleBlockedByDeed("ns3g")).toBe(false);
    expect(isSaleBlockedByDeed("unknown")).toBe(false);
  });

  it("every blocked type is a member of the canonical enum (FIELD-02)", () => {
    for (const deed of NO_SALE_DEED_TYPES) {
      expect(titleDeedType.options).toContain(deed);
    }
  });
});

describe("exclusivity auto-release (D8 / DEAL-02)", () => {
  const window = {
    openedAt: new Date("2026-06-01T00:00:00Z"),
    expiresAt: new Date("2026-06-08T00:00:00Z"),
    releaseState: "held",
  } as const;
  const afterExpiry = new Date("2026-06-09T00:00:00Z");
  const beforeExpiry = new Date("2026-06-05T00:00:00Z");

  it("releases an expired, uncontested, not-in-flight listing", () => {
    expect(canAutoRelease(window, "available", 0, afterExpiry)).toBe(true);
  });

  it("never auto-releases while reserved or under contract (DEAL-02)", () => {
    expect(canAutoRelease(window, "reserved", 0, afterExpiry)).toBe(false);
    expect(canAutoRelease(window, "under_contract", 0, afterExpiry)).toBe(false);
  });

  it("holds while interest flags are open or the window is unexpired", () => {
    expect(canAutoRelease(window, "available", 2, afterExpiry)).toBe(false);
    expect(canAutoRelease(window, "available", 0, beforeExpiry)).toBe(false);
  });

  it("only a held window can auto-release", () => {
    expect(
      canAutoRelease({ ...window, releaseState: "released" }, "available", 0, afterExpiry),
    ).toBe(false);
    expect(
      canAutoRelease({ ...window, releaseState: "releasable" }, "available", 0, afterExpiry),
    ).toBe(false);
  });

  it("releases exactly at the expiry instant, not before", () => {
    expect(canAutoRelease(window, "available", 0, window.expiresAt)).toBe(true);
  });
});
