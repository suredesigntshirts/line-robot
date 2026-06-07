/**
 * Date helpers for the follow-up calendar. LINE's datetime-picker returns a timezone-less local
 * string (e.g. `2026-06-10T14:30`) interpreted in the user's app timezone; this is a Thai
 * real-estate assistant, so we anchor everything to **Asia/Bangkok**. Bangkok observes no DST, so a
 * fixed +7h offset is exact year-round — no ICU/timezone database needed (keeps this pure + testable
 * and avoids depending on the Lambda runtime's tz data).
 */

/** Asia/Bangkok is UTC+7 with no daylight saving. */
export const BANGKOK_OFFSET_MS = 7 * 60 * 60_000;

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** Parse a LINE datetime-picker value (`YYYY-MM-DDTHH:mm`, Bangkok-local) into epoch ms. Returns
 * `null` for anything that isn't that exact shape. */
export function parseBangkokLocal(local: string): number | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(local);
  if (m === null) {
    return null;
  }
  // The regex guarantees five numeric groups; Number() over each keeps them plain `number`.
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  const h = Number(m[4]);
  const min = Number(m[5]);
  // Date.UTC treats the components as UTC; subtract the offset to get the real instant for a
  // Bangkok wall-clock time.
  return Date.UTC(y, mo - 1, d, h, min) - BANGKOK_OFFSET_MS;
}

/** Format an instant as a compact Bangkok-local date, e.g. `2 Jun` (no time). */
export function formatShortDate(at: number): string {
  const d = new Date(at + BANGKOK_OFFSET_MS); // shift so UTC getters read Bangkok wall-clock
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]}`;
}

/** Format an instant as a compact Bangkok-local date+time WITH SECONDS, e.g. `2 Jun 14:32:07` — used
 * to stamp each line of the extraction transcript. Second resolution matters: a burst of messages a
 * few seconds apart then a ~20s gap is a strong signal of where one property ends and the next begins,
 * so the segmenter can group by time clustering. */
export function formatShortDateTime(at: number): string {
  const d = new Date(at + BANGKOK_OFFSET_MS); // shift so UTC getters read Bangkok wall-clock
  const hh = String(d.getUTCHours()).padStart(2, "0");
  const mm = String(d.getUTCMinutes()).padStart(2, "0");
  const ss = String(d.getUTCSeconds()).padStart(2, "0");
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${hh}:${mm}:${ss}`;
}

/** Format an instant as a short Bangkok-local label, e.g. `Tue Jun 10, 14:30 ICT`. */
export function formatDueDate(dueAt: number): string {
  const d = new Date(dueAt + BANGKOK_OFFSET_MS); // shift so UTC getters read Bangkok wall-clock
  const hh = String(d.getUTCHours()).padStart(2, "0");
  const mm = String(d.getUTCMinutes()).padStart(2, "0");
  return `${DAYS[d.getUTCDay()]} ${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}, ${hh}:${mm} ICT`;
}
