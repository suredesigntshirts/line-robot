import { and, desc, eq } from "drizzle-orm";
import type { Db } from "../pool.ts";
import { listingContent, moderationItems } from "../schema.ts";

// Stage 6 (D-S6-7) — the moderation queue: a minimal approve/reject over the gate-fail set the
// pipeline writes (`moderation_item` with status='pending'; see packages/pipeline/src/run.ts, where a
// quality-gate blocker / needs_review queues the listing). Not a full CRUD panel.

export type ModerationItemRow = typeof moderationItems.$inferSelect;

/** A pending moderation item joined to its target listing's id + th headline (so the admin queue can
 * show what's under review without a second fetch). `headline` falls back to '' when the target isn't
 * a listing (e.g. a merge_request) or has no th content row. Newest first. */
export interface PendingModerationRow {
  id: string;
  targetType: ModerationItemRow["targetType"];
  targetId: string;
  reason: string | null;
  createdAt: Date;
  /** The target listing's th headline (empty when the target is not a listing / has no th content). */
  headline: string;
}

export async function listPendingModeration(db: Db): Promise<PendingModerationRow[]> {
  return db
    .select({
      id: moderationItems.id,
      targetType: moderationItems.targetType,
      targetId: moderationItems.targetId,
      reason: moderationItems.reason,
      createdAt: moderationItems.createdAt,
      // LEFT JOIN: the target may not be a listing (merge_request) — keep the item, blank the headline.
      headline: listingContent.headline,
    })
    .from(moderationItems)
    .leftJoin(
      listingContent,
      and(eq(listingContent.listingId, moderationItems.targetId), eq(listingContent.lang, "th")),
    )
    .where(eq(moderationItems.status, "pending"))
    .orderBy(desc(moderationItems.createdAt))
    .then((rows) => rows.map((r) => ({ ...r, headline: r.headline ?? "" })));
}

/** The outcome of an admin moderation decision: a real transition, an already-decided no-op (so the
 * caller can 409 a stale/double request), or no such item (404). */
export type ModerationResolveResult =
  | { outcome: "updated"; row: ModerationItemRow }
  | { outcome: "already_decided"; row: ModerationItemRow }
  | { outcome: "not_found" };

/**
 * Resolve a moderation item to `approved` or `rejected`. This is the admin REVIEW action: it lists the
 * gate-fail set (`listPendingModeration`) and marks each item approved/rejected — a record of the
 * admin's decision on the `moderation_item` row.
 *
 * IMPORTANT (v1 scope — D-S6-7): resolving an item does NOT itself change a listing's visibility.
 * Nothing in the claim / publish / public-query path reads `moderation_item.status` yet, so an
 * `approved` decision records the review outcome but does not unblock or publish the listing. Wiring
 * the moderation outcome INTO the listing lifecycle (so approve actually gates/ungates the listing) is
 * a cross-cutting change that is QUEUED, not built here. (Public visibility still requires the
 * poster's own publish-consent grant per LEGAL-02 regardless — an admin approval is never that.)
 *
 * Terminal-state guard: the UPDATE is `WHERE status = 'pending'`, so a stale or double admin request
 * can never silently flip an already-decided item (approved → rejected). When it touches no row we read
 * the item back to distinguish "already decided" (exists, not pending → 409) from "no such item" (404).
 */
export async function resolveModerationItem(
  db: Db,
  id: string,
  status: "approved" | "rejected",
): Promise<ModerationResolveResult> {
  const [updated] = await db
    .update(moderationItems)
    .set({ status })
    .where(and(eq(moderationItems.id, id), eq(moderationItems.status, "pending")))
    .returning();
  if (updated) return { outcome: "updated", row: updated };
  const [existing] = await db.select().from(moderationItems).where(eq(moderationItems.id, id));
  return existing ? { outcome: "already_decided", row: existing } : { outcome: "not_found" };
}
