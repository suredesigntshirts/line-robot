/** Pure formatting helpers (no DOM). Dates are shown Bangkok-local (UTC+7, no DST) to match the
 * chat bot's stamps. */

const BANGKOK_OFFSET_MS = 7 * 60 * 60_000;
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** Epoch ms → e.g. "2 Jun 2026" (Bangkok-local). */
export function formatDate(at: number): string {
  const d = new Date(at + BANGKOK_OFFSET_MS); // shift so UTC getters read Bangkok wall-clock
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}
