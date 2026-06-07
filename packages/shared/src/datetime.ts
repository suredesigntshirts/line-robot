/** Asia/Bangkok timezone primitives — UTC+7, no DST, so a fixed offset is exact year-round.
 * Shared by the bot's date formatters and the miniapp's `formatDate` so they cannot drift. */

/** Asia/Bangkok is UTC+7 with no daylight saving. */
export const BANGKOK_OFFSET_MS = 7 * 60 * 60_000;

/** Short English month labels, indexed by `Date.getUTCMonth()`. */
export const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;
