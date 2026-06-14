/** Shared decorative line-icons (all `aria-hidden` — they accompany text labels, never stand alone).
 * One source so the house glyph isn't re-drawn in MyListingCard + the empty state (simplicity). */

/** A simple house outline — the listing photo placeholder + the my-listings empty state. */
export function HouseIcon({ size = 28 }: { size?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 9.5 12 3l9 6.5" />
      <path d="M5 10v10h14V10" />
    </svg>
  );
}
