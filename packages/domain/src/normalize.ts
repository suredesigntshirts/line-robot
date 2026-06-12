// ---------------------------------------------------------------------------
// Post-extraction normalizers (stage-2 D2.8) — pure, no I/O.
// ---------------------------------------------------------------------------

/**
 * COPY-12: strip emoji (and pictographic noise) from display fields like
 * title/price/area. Keeps Thai, Latin, digits, and normal punctuation.
 */
export function stripEmoji(text: string): string {
  return text
    .replace(/\p{Extended_Pictographic}|\p{Emoji_Presentation}|\u{FE0F}|\u{200D}/gu, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

/** FIELD-01: Thai land units → m². 1 rai = 1600, 1 ngan = 400, 1 wah² = 4. */
export function landToSqm(rai: number, ngan: number, wah: number): number {
  return rai * 1600 + ngan * 400 + wah * 4;
}

/**
 * COPY-05: urgency phrases (ขายด่วน etc.) become a badge, never headline text.
 * Returns the cleaned title and whether a phrase was found.
 */
const URGENCY_PHRASES = /(?:ขายด่วน|ด่วนมาก|ด่วน|urgent sale|urgent)[!\s]*/giu;

export function extractUrgencyBadge(title: string): { title: string; urgentBadge: boolean } {
  const urgentBadge = URGENCY_PHRASES.test(title);
  URGENCY_PHRASES.lastIndex = 0;
  const cleaned = title
    .replace(URGENCY_PHRASES, "")
    .replace(/\s{2,}/g, " ")
    .trim();
  return { title: cleaned, urgentBadge };
}
