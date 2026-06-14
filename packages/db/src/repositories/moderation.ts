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

/**
 * Resolve a moderation item to `approved` or `rejected`. Returns the resolved row, or undefined when
 * no such item exists.
 *
 * On `approved`: the listing is "set active" by CLEARING the review block — there is no separate
 * `active` status column in this schema. A listing's row exists from the moment the pipeline extracts
 * it (gate pass OR fail); the ONLY thing the gate-fail did was additionally write this pending
 * moderation_item, which holds the listing back from the normal claim→publish flow. Resolving it to
 * `approved` removes that block, so the listing re-enters the standard lifecycle (claim, then
 * poster-consent publish gates public visibility per LEGAL-02 — an admin approval is NOT itself a
 * publish-consent grant, which would breach LEGAL-02). On `rejected` the listing stays blocked.
 *
 * TODO (queued): if a richer model later needs an explicit listing-level "moderation passed" flag
 * (e.g. so the bot can re-invite a claim after approval), add a column then — not invented here on a
 * guess (D-S6-7 keeps the queue minimal).
 */
export async function resolveModerationItem(
  db: Db,
  id: string,
  status: "approved" | "rejected",
): Promise<ModerationItemRow | undefined> {
  const [updated] = await db
    .update(moderationItems)
    .set({ status })
    .where(eq(moderationItems.id, id))
    .returning();
  return updated;
}
