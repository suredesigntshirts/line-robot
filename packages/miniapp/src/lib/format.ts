/** Pure formatting helpers (no DOM). Dates are shown Bangkok-local (UTC+7, no DST) to match the
 * chat bot's stamps. The timezone primitives live in @line-robot/shared so the bot and the SPA
 * cannot drift. */
import { BANGKOK_OFFSET_MS, MONTHS } from "@line-robot/shared";

/** Epoch ms → e.g. "2 Jun 2026" (Bangkok-local). */
export function formatDate(at: number): string {
  const d = new Date(at + BANGKOK_OFFSET_MS); // shift so UTC getters read Bangkok wall-clock
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}
