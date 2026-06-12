import {
  NO_SALE_DEED_TYPES,
  type ReleaseState,
  type RentalStatus,
  type SaleStage,
  type TitleDeedType,
} from "./enums.ts";

// ---------------------------------------------------------------------------
// Listing-lifecycle rules (DF-4 / DEAL-02 / DEAL-11 / D8). Pure functions —
// no I/O, no clock; callers supply state and timestamps.
// ---------------------------------------------------------------------------

/**
 * Sale lifecycle mirrors the Thai close: มัดจำ (reserved) → จะซื้อจะขาย
 * (under_contract) → โอน (transferred). Deals fall through at any stage before
 * transfer, returning the listing to available. Transferred is terminal.
 */
const SALE_STAGE_TRANSITIONS: Record<SaleStage, readonly SaleStage[]> = {
  available: ["reserved"],
  reserved: ["under_contract", "available"],
  under_contract: ["transferred", "available"],
  transferred: [],
};

export function canTransitionSaleStage(from: SaleStage, to: SaleStage): boolean {
  return SALE_STAGE_TRANSITIONS[from].includes(to);
}

/** Rentals re-list after a tenancy ends or a withdrawal is reversed (DF-4). */
const RENTAL_STATUS_TRANSITIONS: Record<RentalStatus, readonly RentalStatus[]> = {
  available: ["rented", "withdrawn"],
  rented: ["available"],
  withdrawn: ["available"],
};

export function canTransitionRentalStatus(from: RentalStatus, to: RentalStatus): boolean {
  return RENTAL_STATUS_TRANSITIONS[from].includes(to);
}

/** FIELD-03: sale listings on no-transfer deed types are hard-blocked from publication. */
export function isSaleBlockedByDeed(deedType: TitleDeedType): boolean {
  return NO_SALE_DEED_TYPES.has(deedType);
}

/**
 * D8 exclusivity window (types + rules now; release *behaviour* is Stage 6).
 * A listing's group-exclusive window may auto-release only when the window has
 * expired, no group member holds an interest flag, and the deal is not in
 * flight — DEAL-02: never auto-release while reserved or under_contract.
 */
export interface ExclusivityWindow {
  openedAt: Date;
  expiresAt: Date;
  releaseState: ReleaseState;
}

export function canAutoRelease(
  window: ExclusivityWindow,
  saleStage: SaleStage,
  openInterestFlags: number,
  now: Date,
): boolean {
  return (
    window.releaseState === "held" &&
    now.getTime() >= window.expiresAt.getTime() &&
    openInterestFlags === 0 &&
    saleStage !== "reserved" &&
    saleStage !== "under_contract"
  );
}
