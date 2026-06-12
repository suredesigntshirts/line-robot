import type { TitleDeedType } from "@line-robot/domain";
import type { ListingSpec } from "../synthetic/spec.ts";
import type { SeedIngestor } from "./SeedIngestor.ts";

// ---------------------------------------------------------------------------
// DF-5 second ingestor: Thai government CKAN open data (data.go.th style —
// LED auction/Treasury datasets are the model "clean source"). Deliberately
// modest: ONE datastore_search request, ≤100 rows, no paging, no retries.
// NOT a general scraper; bank-NPA portals and ToS-gated sites are excluded.
// ---------------------------------------------------------------------------

/** The CKAN datastore row fields this adapter understands (LED auction shape). */
export interface CkanPropertyRecord {
  title?: string;
  province?: string;
  amphoe?: string;
  tambon?: string;
  deed_type?: string;
  price_thb?: number | string;
  land_rai?: number | string;
  land_ngan?: number | string;
  land_wah?: number | string;
  lat?: number | string;
  lon?: number | string;
  contact?: string;
}

interface CkanResponse {
  success: boolean;
  result?: { records?: CkanPropertyRecord[] };
}

const DEED_WORDS: Array<[string, TitleDeedType]> = [
  ["โฉนด", "chanote"],
  ["น.ส.3ก", "ns3g"],
  ["น.ส.3ข", "ns3k"],
  ["น.ส.3", "ns3"],
  ["ส.ป.ก", "spk"],
];

function num(value: number | string | undefined): number | undefined {
  if (value === undefined) return undefined;
  const n = typeof value === "number" ? value : Number(String(value).replaceAll(",", ""));
  return Number.isFinite(n) ? n : undefined;
}

function mapRecord(record: CkanPropertyRecord, index: number): ListingSpec | undefined {
  const priceThb = num(record.price_thb);
  if (priceThb === undefined || priceThb <= 0 || !record.province) return undefined;
  const deed = DEED_WORDS.find(([word]) => record.deed_type?.includes(word))?.[1] ?? "unknown";
  const lat = num(record.lat);
  const lon = num(record.lon);
  return {
    id: `ckan-${String(index + 1).padStart(3, "0")}`,
    dealType: "sale",
    // Auction rows are land/buildings; without a typed column, default to land.
    propertyType: "land",
    titleDeedType: deed,
    priceThb,
    // LED auctions are distressed sales by definition (DIST).
    urgency: "quick_sale",
    province: record.province,
    amphoe: record.amphoe ?? "",
    tambon: record.tambon ?? "",
    landmark: record.title ?? "ทรัพย์ขายทอดตลาด",
    lat: lat ?? 0,
    lon: lon ?? 0,
    landRai: num(record.land_rai),
    landNgan: num(record.land_ngan),
    landWah: num(record.land_wah),
    amenities: [],
    photoCount: 0,
    ownerName: "กรมบังคับคดี",
    phone: record.contact ?? "",
  };
}

/**
 * @param datastoreSearchUrl full CKAN datastore_search URL incl. resource_id
 * @param fetchFn injectable for tests (committed fixture) and offline runs
 */
export function ckanIngestor(
  datastoreSearchUrl: string,
  fetchFn: typeof fetch = fetch,
): SeedIngestor {
  return {
    source: "ckan:led",
    async fetchSpecs(): Promise<ListingSpec[]> {
      const url = new URL(datastoreSearchUrl);
      if (!url.searchParams.has("limit")) url.searchParams.set("limit", "100");
      const response = await fetchFn(url, { headers: { accept: "application/json" } });
      if (!response.ok) throw new Error(`CKAN request failed: ${response.status}`);
      const body = (await response.json()) as CkanResponse;
      const records = body.success ? (body.result?.records ?? []) : [];
      return records
        .map((r, i) => mapRecord(r, i))
        .filter((spec): spec is ListingSpec => spec !== undefined);
    },
  };
}
