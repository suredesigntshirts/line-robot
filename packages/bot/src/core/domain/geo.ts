/**
 * Geo extraction from chat text. Real-data finding: users share a property's location as a
 * Google-Maps URL pasted into an ordinary text message (`maps?q=13.75,100.50`), NOT as a LINE
 * location message — so the ingestion sweep mines coordinates out of the batched text and feeds
 * them to extraction as hints.
 */

/** A coordinate pair parsed from a Google-Maps link, with the matched carrier kept for provenance. */
export interface ParsedGeo {
  readonly lat: number;
  readonly long: number;
  /** The matched URL fragment that carried the coordinates (logging / audit). */
  readonly source: string;
}

// A decimal degree, e.g. `13`, `-13`, `13.7563`.
const DEG = "(-?\\d{1,3}(?:\\.\\d+)?)";
// Coordinate carriers Google Maps uses, in priority order: the `@lat,lng` place-view form and the
// `q=`/`ll=`/`query=` (optionally `loc:`-prefixed) search/pin form.
const PATTERNS: readonly RegExp[] = [
  new RegExp(`@${DEG},${DEG}`, "g"),
  new RegExp(`[?&](?:q|ll|query)=(?:loc:)?${DEG},${DEG}`, "g"),
];

const isLat = (n: number): boolean => Number.isFinite(n) && n >= -90 && n <= 90;
const isLong = (n: number): boolean => Number.isFinite(n) && n >= -180 && n <= 180;

/**
 * Extract every Google-Maps coordinate found in free text — de-duplicated by lat/long and in the
 * order first seen. Requires an explicit maps carrier (`@`, `q=`, `ll=`, `query=`) so bare number
 * pairs in prose don't produce false positives. Out-of-range pairs are dropped.
 */
export function parseGeoLinks(text: string): ParsedGeo[] {
  if (!text) {
    return [];
  }
  const out: ParsedGeo[] = [];
  const seen = new Set<string>();
  for (const pattern of PATTERNS) {
    for (const match of text.matchAll(pattern)) {
      const lat = Number(match[1]);
      const long = Number(match[2]);
      if (!isLat(lat) || !isLong(long)) {
        continue;
      }
      const key = `${lat},${long}`;
      if (seen.has(key)) {
        continue;
      }
      seen.add(key);
      // Trim a leading `?`/`&` so the source reads as the bare carrier (e.g. `q=13.75,100.5`).
      out.push({ lat, long, source: match[0].replace(/^[?&]/, "") });
    }
  }
  return out;
}
