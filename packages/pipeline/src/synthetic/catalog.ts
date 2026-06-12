import type { Amenity, PropertyType, TitleDeedType, Urgency } from "@line-robot/domain";
import { mulberry32, pick } from "./rng.ts";
import type { ListingSpec } from "./spec.ts";

// ---------------------------------------------------------------------------
// Deterministic spec catalog — the ground-truth population behind both the
// seed fixtures (≥20 listings) and Tier B eval cases. Hand-pinned rows cover
// the canon's hard cases (ส.ป.ก. no-sale land, rentals, quick-sale); the rest
// are generated from a seeded RNG so the catalog is stable run-to-run.
// ---------------------------------------------------------------------------

const CNX_SPOTS = [
  { tambon: "สุเทพ", landmark: "ใกล้ มช. ประตูหลัง", lat: 18.7953, lon: 98.9525 },
  { tambon: "ช้างเผือก", landmark: "ใกล้ตลาดช้างเผือก", lat: 18.8048, lon: 98.9817 },
  { tambon: "หนองป่าครั่ง", landmark: "ใกล้ Central Festival", lat: 18.7989, lon: 99.0166 },
  { tambon: "ฟ้าฮ่าม", landmark: "ริมน้ำปิง", lat: 18.8126, lon: 99.0052 },
  { tambon: "สันผีเสื้อ", landmark: "ใกล้สนามกีฬา 700 ปี", lat: 18.8443, lon: 98.9697 },
  { tambon: "แม่เหียะ", landmark: "ใกล้กาดฝรั่ง หางดง", lat: 18.7325, lon: 98.9416 },
] as const;

const OWNERS = [
  { name: "คุณสมชาย", phone: "081-234-5678" },
  { name: "คุณนิด", phone: "089-555-1122" },
  { name: "P'Aor", phone: "062-878-9900" },
  { name: "คุณวิชัย", phone: "053-321-456" },
  { name: "Khun Lek", phone: "095-111-2233" },
] as const;

const SELLABLE_DEEDS: TitleDeedType[] = ["chanote", "chanote", "chanote", "ns3g", "ns3k"];
const HOUSE_AMENITIES: Amenity[] = ["parking", "garden", "covered_parking"];
const CONDO_AMENITIES: Amenity[] = ["swimming_pool", "fitness", "keycard_access", "security_24h"];

/** Hand-pinned hard cases first (stable ids the tests reference by name). */
function pinnedSpecs(): ListingSpec[] {
  const base = { province: "เชียงใหม่", amphoe: "เมืองเชียงใหม่" };
  return [
    {
      // ส.ป.ก. land offered for sale — FIELD-03 hard-block exercise.
      id: "syn-spk-land",
      dealType: "sale",
      propertyType: "land",
      titleDeedType: "spk",
      priceThb: 850_000,
      urgency: "normal",
      ...base,
      tambon: "แม่เหียะ",
      landmark: "ติดถนนเลียบคลองชลประทาน",
      lat: 18.7299,
      lon: 98.9477,
      landRai: 2,
      landNgan: 1,
      landWah: 0,
      amenities: [],
      photoCount: 3,
      ownerName: "คุณวิชัย",
      phone: "053-321-456",
    },
    {
      // Condo rental — FIELD-08/12 fields, rental lifecycle.
      id: "syn-rent-condo",
      dealType: "rent",
      propertyType: "condo",
      titleDeedType: "chanote",
      priceThb: 12_000,
      urgency: "normal",
      ...base,
      tambon: "สุเทพ",
      landmark: "หลัง มช. Nimman ซอย 12",
      lat: 18.7995,
      lon: 98.9683,
      floorAreaSqm: 35,
      bedrooms: 1,
      bathrooms: 1,
      amenities: CONDO_AMENITIES,
      photoCount: 5,
      ownerName: "P'Aor",
      phone: "062-878-9900",
    },
    {
      // Quick-sale house — DIST-03 urgency phrasing.
      id: "syn-urgent-house",
      dealType: "sale",
      propertyType: "house",
      titleDeedType: "chanote",
      priceThb: 3_990_000,
      urgency: "quick_sale",
      ...base,
      tambon: "ช้างเผือก",
      landmark: "หมู่บ้านการ์เด้นวิว",
      lat: 18.8061,
      lon: 98.9803,
      landRai: 0,
      landNgan: 0,
      landWah: 60,
      floorAreaSqm: 180,
      bedrooms: 3,
      bathrooms: 2,
      amenities: HOUSE_AMENITIES,
      photoCount: 8,
      ownerName: "คุณสมชาย",
      phone: "081-234-5678",
    },
  ];
}

/**
 * Deterministically expand to `count` specs (seeded; same output every run).
 * The 3 pinned hard cases are always included, so the result is
 * max(count, 3) — callers asking for fewer than the pinned set still get it.
 */
export function specCatalog(count = 24): ListingSpec[] {
  const pinned = pinnedSpecs();
  const rng = mulberry32(20260613);
  const generated: ListingSpec[] = [];
  for (let i = 0; generated.length + pinned.length < count; i += 1) {
    const spot = pick(rng, CNX_SPOTS);
    const owner = pick(rng, OWNERS);
    const propertyType = pick(rng, ["house", "condo", "land", "townhouse"] as PropertyType[]);
    const isRent = propertyType !== "land" && rng() < 0.25;
    const urgency: Urgency = rng() < 0.15 ? "quick_sale" : "normal";
    const hasRooms = propertyType !== "land";
    generated.push({
      id: `syn-${String(i + 1).padStart(3, "0")}`,
      dealType: isRent ? "rent" : "sale",
      propertyType,
      titleDeedType: pick(rng, SELLABLE_DEEDS),
      priceThb: isRent
        ? (8 + Math.floor(rng() * 30)) * 1_000
        : (15 + Math.floor(rng() * 120)) * 100_000,
      urgency,
      province: "เชียงใหม่",
      amphoe: "เมืองเชียงใหม่",
      tambon: spot.tambon,
      landmark: spot.landmark,
      // Jitter ±~500m so listings spread around the spot.
      lat: spot.lat + (rng() - 0.5) * 0.01,
      lon: spot.lon + (rng() - 0.5) * 0.01,
      ...(propertyType === "land"
        ? {
            landRai: Math.floor(rng() * 5),
            landNgan: Math.floor(rng() * 4),
            landWah: Math.floor(rng() * 100),
          }
        : { landWah: 20 + Math.floor(rng() * 80), floorAreaSqm: 30 + Math.floor(rng() * 220) }),
      ...(hasRooms
        ? { bedrooms: 1 + Math.floor(rng() * 4), bathrooms: 1 + Math.floor(rng() * 3) }
        : {}),
      amenities:
        propertyType === "condo"
          ? CONDO_AMENITIES.slice(0, 1 + Math.floor(rng() * 3))
          : propertyType === "land"
            ? []
            : HOUSE_AMENITIES.slice(0, 1 + Math.floor(rng() * 2)),
      photoCount: 2 + Math.floor(rng() * 8),
      ownerName: owner.name,
      phone: owner.phone,
    });
  }
  return [...pinned, ...generated];
}
