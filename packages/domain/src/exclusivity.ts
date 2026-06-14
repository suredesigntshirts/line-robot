import type { ReleaseState } from "./enums.ts";

// ---------------------------------------------------------------------------
// Stage 6 (D-S6-2) — exclusivity-window engine. PURE: no I/O, no clock; the
// caller injects `now`. The persisted `listing_exclusivity.releaseState` stays
// the coarse [held|releasable|released]; this module DERIVES the rich logical
// state the UI/bot reason about. `extend` is an OPERATION (bump expiresAt),
// NOT a fifth steady state — it's modelled as `extendedExpiry`, not a label.
// ---------------------------------------------------------------------------

/**
 * The logical exclusivity state a group member / poster sees:
 * - `released`  — the poster released it (publicly or to other groups); the window no longer holds.
 * - `lapsed`    — the window expired and is awaiting the poster's release decision (the release prompt
 *                 is due). Eligible for the release prompt (see {@link isReleasable}).
 * - `interest_flagged` — still within the window, but at least one group member has flagged interest
 *                 (a non-binding signal — D-S6-3; it does NOT block the poster releasing early).
 * - `open`      — within the window, no interest flagged.
 */
export type ExclusivityState = "open" | "interest_flagged" | "lapsed" | "released";

export interface ExclusivityInputs {
  releaseState: ReleaseState;
  expiresAt: Date;
  hasInterestFlags: boolean;
  now: Date;
}

/**
 * Derive the logical exclusivity state. `released` short-circuits everything (the window is over);
 * otherwise expiry wins over an interest flag (a lapsed window awaits a release decision regardless
 * of flags), and an in-window flag is surfaced as `interest_flagged`, else `open`. The `>=` boundary
 * means the exact instant of expiry counts as lapsed.
 */
export function deriveExclusivityState(inputs: ExclusivityInputs): ExclusivityState {
  const { releaseState, expiresAt, hasInterestFlags, now } = inputs;
  if (releaseState === "released") return "released";
  if (now.getTime() >= expiresAt.getTime()) return "lapsed";
  if (hasInterestFlags) return "interest_flagged";
  return "open";
}

/** True iff the listing is eligible for the release prompt — i.e. its window has lapsed and the
 * poster hasn't decided yet. The exclusivity-lapse sweep (INC-B4) DMs the poster for exactly these. */
export function isReleasable(state: ExclusivityState): boolean {
  return state === "lapsed";
}

/** True iff the window can still be extended — anything not already released. (A `held`/`releasable`
 * window, lapsed or not, can be bumped; a released listing is past the point of extension.) */
export function canExtend(releaseState: ReleaseState): boolean {
  return releaseState !== "released";
}

/** The new expiry after a poster extends: `windowDays` from `now` (bumps `listing_exclusivity.
 * expiresAt`, returning the listing to `open` for a fresh window). Pure — the caller persists it. */
export function extendedExpiry(now: Date, windowDays: number): Date {
  return new Date(now.getTime() + windowDays * 24 * 60 * 60 * 1000);
}
