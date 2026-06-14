import { and, eq, lt, sql } from "drizzle-orm";
import type { Db } from "../pool.ts";
import { groups, listingContent, listingExclusivity, listings, userIdentities } from "../schema.ts";

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

// ---------------------------------------------------------------------------
// Stage 6 (D-S6-4) — the exclusivity-lapse release prompt (INC-B4, bot sweep side). When a window
// lapses (`release_state='held'` AND `expires_at < now`) the dealflow sweep DMs the poster a Flex
// card offering release-publicly / release-to-other-groups / extend. The DM is sent ONCE, guarded by
// the `held → releasable` transition (`markReleasePromptSent`): the existing `release_state` enum is
// reused as the once-guard (no new column). Ignoring the DM leaves the listing group-private — there
// is NO silent auto-release (D-S6-4).
// ---------------------------------------------------------------------------

/**
 * The lapse-DM once-guard: conditionally transition a window `held → releasable` and report whether
 * THIS call made the transition. The UPDATE is guarded `WHERE release_state = 'held'`, so the sweep
 * sends the release prompt exactly once across re-runs (a second sweep sees `releasable` and the guard
 * returns false). Reuses the persisted enum — no new column for the guard. Returns false when no `held`
 * row exists (already prompted, already released, or no window at all).
 */
export async function markReleasePromptSent(db: Db, listingId: string): Promise<boolean> {
  const updated = await db
    .update(listingExclusivity)
    .set({ releaseState: "releasable" })
    .where(
      and(eq(listingExclusivity.listingId, listingId), eq(listingExclusivity.releaseState, "held")),
    )
    .returning({ listingId: listingExclusivity.listingId });
  return updated.length === 1;
}

/** A lapsed window the sweep should prompt on: the listing + its window timestamps, the claimant's LINE
 * push target, the source group's id + per-group window (for an `extend`), and the th headline for the
 * card. The poster we DM is the CLAIMANT's LINE identity — the only real LINE user who owns the
 * release/publish decision (the pipeline `owner_user_id` is a conversation pseudo-user, not DM-able). */
export interface LapsedExclusivity {
  listingId: string;
  expiresAt: Date;
  /** The claimant's LINE provider subject — the push `to` target for the release DM. */
  posterLineUserId: string;
  sourceGroupId: string;
  /** The source group's exclusivity window (days) — the `extend` decision bumps `expires_at` by this. */
  windowDays: number;
  /** The th headline for the prompt card, or '' when there's no th content row. */
  headline: string;
}

/**
 * Every lapsed-but-undecided window the release sweep should prompt on: `release_state='held'` AND
 * `expires_at < now`, joined to a claimant with a LINE identity (the DM target) and a source group
 * (the membership scope + the per-group `extend` window). The joins are the filter: a listing with no
 * claimant LINE identity or no source group is NOT prompted (we'd have no real LINE user to DM, or no
 * group to extend within). `now` is injected (deterministic clock — never `Date.now()` in logic).
 */
export async function listLapsedExclusivity(db: Db, now: Date): Promise<LapsedExclusivity[]> {
  const rows = await db
    .select({
      listingId: listingExclusivity.listingId,
      expiresAt: listingExclusivity.expiresAt,
      posterLineUserId: userIdentities.providerSubject,
      sourceGroupId: listings.sourceGroupId,
      windowDays: groups.exclusivityWindowDays,
      headline: sql<string | null>`(
        select c.headline from ${listingContent} c
        where c.listing_id = ${listings.id} and c.lang = 'th' limit 1)`,
    })
    .from(listingExclusivity)
    .innerJoin(listings, eq(listings.id, listingExclusivity.listingId))
    .innerJoin(groups, eq(groups.id, listings.sourceGroupId))
    .innerJoin(
      userIdentities,
      and(eq(userIdentities.userId, listings.claimedByUserId), eq(userIdentities.provider, "line")),
    )
    .where(and(eq(listingExclusivity.releaseState, "held"), lt(listingExclusivity.expiresAt, now)));
  return rows.map((r) => ({
    listingId: r.listingId,
    expiresAt: r.expiresAt,
    posterLineUserId: r.posterLineUserId,
    // The inner join on a non-null source group guarantees these are present.
    sourceGroupId: r.sourceGroupId as string,
    windowDays: r.windowDays,
    headline: r.headline ?? "",
  }));
}
