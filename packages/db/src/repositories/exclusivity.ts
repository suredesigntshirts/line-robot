import { eq, sql } from "drizzle-orm";
import type { Db } from "../pool.ts";
import { listingExclusivity } from "../schema.ts";

// Stage 6 (D-S6-2) — exclusivity-window state transitions. The persisted row stays the coarse
// [held|releasable|released] (+ window timestamps); the rich logical state is DERIVED by the pure
// `deriveExclusivityState` engine in @line-robot/domain from these columns. These repo fns are the
// two persisted transitions: EXTEND (bump expiresAt) and RELEASE (releaseState → released).

export type ExclusivityRow = typeof listingExclusivity.$inferSelect;

export async function getExclusivity(
  db: Db,
  listingId: string,
): Promise<ExclusivityRow | undefined> {
  const [row] = await db
    .select()
    .from(listingExclusivity)
    .where(eq(listingExclusivity.listingId, listingId));
  return row;
}

/**
 * Extend the window: bump `expires_at` to `newExpiresAt` (the caller derives it via
 * `extendedExpiry(now, windowDays)`). The bumped timestamp IS the persisted record of the extend —
 * there is no separate audit row: the only candidate table (`listing_event`) is a reminder primitive
 * with a NOT-NULL `notify_conversation_key`, so writing an "audit" row there would be a misuse (a
 * dedicated exclusivity-event log is queued, not invented here on a guess). No-op if no window row
 * exists for the listing.
 */
export async function extendExclusivity(
  db: Db,
  listingId: string,
  newExpiresAt: Date,
): Promise<void> {
  await db
    .update(listingExclusivity)
    .set({ expiresAt: newExpiresAt })
    .where(eq(listingExclusivity.listingId, listingId));
}

/**
 * Release the window: set `release_state = 'released'`. This is the exclusivity-side transition;
 * "release publicly" (the website-visibility decision) is a SEPARATE publish-consent grant the caller
 * makes alongside this (D-S6-4) — they are different facts (the window vs LEGAL-02 consent). No-op if
 * no window row exists.
 */
export async function releaseExclusivity(db: Db, listingId: string): Promise<void> {
  await db
    .update(listingExclusivity)
    .set({ releaseState: "released" })
    .where(eq(listingExclusivity.listingId, listingId));
}

/** Open the exclusivity window for a listing (test/seed helper + the ingest path's window start):
 * stamps `window_opened_at = now()` and `expires_at` from the caller. Idempotent per listing via the
 * PK conflict — a re-open is a no-op (the first window stands). */
export async function openExclusivityWindow(
  db: Db,
  listingId: string,
  expiresAt: Date,
): Promise<void> {
  await db
    .insert(listingExclusivity)
    .values({ listingId, windowOpenedAt: sql`now()`, expiresAt })
    .onConflictDoNothing({ target: listingExclusivity.listingId });
}
