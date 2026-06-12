// ---------------------------------------------------------------------------
// Text/geo primitives for the deterministic dedup block (D2.6).
// ---------------------------------------------------------------------------

/** Normalize a Thai/English address string for similarity comparison. */
export function normalizeAddress(text: string): string {
  return text
    .toLowerCase()
    .replace(/ต\.|ตำบล/g, " ")
    .replace(/อ\.|อำเภอ/g, " ")
    .replace(/จ\.|จังหวัด/g, " ")
    .replace(/ซ\.|ซอย/g, " soi ")
    .replace(/ถ\.|ถนน/g, " ")
    .replace(/หมู่บ้าน|มบ\./g, " ")
    .replace(/[^\p{L}\p{M}\p{N} ]/gu, " ") // \p{M}: Thai vowel/tone marks are combining marks
    .replace(/\s+/g, " ")
    .trim();
}

/** Character trigrams (padded) for Dice similarity. */
function trigrams(text: string): Set<string> {
  const padded = `  ${text} `;
  const grams = new Set<string>();
  for (let i = 0; i <= padded.length - 3; i += 1) {
    grams.add(padded.slice(i, i + 3));
  }
  return grams;
}

/** Dice coefficient over character trigrams (pg_trgm-style). */
export function trigramSimilarity(a: string, b: string): number {
  if (a === "" || b === "") return 0;
  const ga = trigrams(a);
  const gb = trigrams(b);
  let shared = 0;
  for (const g of ga) if (gb.has(g)) shared += 1;
  return (2 * shared) / (ga.size + gb.size);
}

/** Token-set Jaccard for the no-coords admin/text block. */
export function jaccardSimilarity(a: string, b: string): number {
  const ta = new Set(a.split(" ").filter(Boolean));
  const tb = new Set(b.split(" ").filter(Boolean));
  if (ta.size === 0 || tb.size === 0) return 0;
  let shared = 0;
  for (const t of ta) if (tb.has(t)) shared += 1;
  return shared / (ta.size + tb.size - shared);
}

/** Haversine distance in metres. */
export function haversineM(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 6_371_000 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const BASE32 = "0123456789bcdefghjkmnpqrstuvwxyz";

/** Standard geohash encoding (precision 6 ≈ 1.2 km cell). */
export function geohash(lat: number, lon: number, precision: number): string {
  let minLat = -90;
  let maxLat = 90;
  let minLon = -180;
  let maxLon = 180;
  let hash = "";
  let bit = 0;
  let ch = 0;
  let even = true;
  while (hash.length < precision) {
    if (even) {
      const mid = (minLon + maxLon) / 2;
      if (lon >= mid) {
        ch = ch * 2 + 1;
        minLon = mid;
      } else {
        ch *= 2;
        maxLon = mid;
      }
    } else {
      const mid = (minLat + maxLat) / 2;
      if (lat >= mid) {
        ch = ch * 2 + 1;
        minLat = mid;
      } else {
        ch *= 2;
        maxLat = mid;
      }
    }
    even = !even;
    bit += 1;
    if (bit === 5) {
      hash += BASE32[ch];
      bit = 0;
      ch = 0;
    }
  }
  return hash;
}
