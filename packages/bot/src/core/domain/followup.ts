/**
 * The one rule for turning a LINE/MINI-App datetime into a follow-up's `dueAt`, shared by both entry
 * points so they can't drift: the chat datetime-picker ({@link ../handlers/catalogAssistant.setFollowUp})
 * and the MINI App "book a viewing" route ({@link ../../app/readApiHandler}). Pure — no IO.
 */
import { parseBangkokLocal } from "./datetime.js";

/** A resolved future instant, or why the input was rejected (mapped to chat text / an HTTP 400). */
export type FollowUpTime =
  | { readonly ok: true; readonly dueAt: number }
  | { readonly ok: false; readonly reason: "invalid" | "past" };

/**
 * Parse a Bangkok-local `YYYY-MM-DDTHH:mm` value into epoch ms, rejecting anything malformed
 * (`invalid`) or already elapsed (`past` — so the reminder sweep never fires an instant, confusing
 * reminder). The future-time check uses the caller's `nowMs` so it stays clock-injectable + testable.
 */
export function resolveFollowUpTime(datetimeLocal: string, nowMs: number): FollowUpTime {
  const dueAt = parseBangkokLocal(datetimeLocal);
  if (dueAt === null) {
    return { ok: false, reason: "invalid" };
  }
  if (dueAt <= nowMs) {
    return { ok: false, reason: "past" };
  }
  return { ok: true, dueAt };
}
