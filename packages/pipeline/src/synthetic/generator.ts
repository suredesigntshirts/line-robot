import type { ExpectedOutcome } from "../eval/cases.ts";
import type { ChaosProfile } from "./chaosProfile.ts";
import { chance, mulberry32, pick, type Rng, shuffle } from "./rng.ts";
import type { ListingSpec } from "./spec.ts";

// ---------------------------------------------------------------------------
// §5.1: spec + chaos profile → realistic LINE transcript. Expected extraction
// is known by construction. One generator, three consumers: eval cases, seed
// fixtures (via the seed ingestor), dedup pairs (duplicateRepost).
// ---------------------------------------------------------------------------

export interface TranscriptMessage {
  sender: string;
  /** Text content, or undefined for a photo message. */
  text?: string;
  /** Marker naming which spec photo this is (photo-attribution ground truth). */
  photoOf?: { specId: string; index: number };
  /** Minutes after the thread started. */
  atMinute: number;
}

export interface GeneratedCase {
  /** Eval-case id — derived from spec ids + profile seed (stable). */
  id: string;
  messages: TranscriptMessage[];
  /** The transcript as exported text (what the pipeline ingests). */
  transcript: string;
  expected: ExpectedOutcome;
}

const TH_PROPERTY_WORD: Record<string, string> = {
  land: "ที่ดิน",
  house: "บ้านเดี่ยว",
  townhouse: "ทาวน์เฮาส์",
  condo: "คอนโด",
  commercial: "อาคารพาณิชย์",
  other: "อสังหาฯ",
};

const TH_DEED_WORD: Record<string, string> = {
  chanote: "โฉนด",
  ns3g: "น.ส.3ก",
  ns3k: "น.ส.3ข",
  ns3: "น.ส.3",
  spk: "ส.ป.ก.",
  pbt5: "ภบท.5",
  ns2: "น.ส.2",
  stg: "ส.ท.ก.",
  sk1: "ส.ค.1",
  other: "เอกสารสิทธิ์อื่น",
  unknown: "",
};

const EN_PROPERTY_WORD: Record<string, string> = {
  land: "land plot",
  house: "house",
  townhouse: "townhouse",
  condo: "condo",
  commercial: "commercial building",
  other: "property",
};

function formatPriceTh(priceThb: number, abbrev: boolean, rng: Rng): string {
  if (abbrev && priceThb >= 1_000_000) {
    const millions = priceThb / 1_000_000;
    const rendered = Number.isInteger(millions) ? `${millions}` : millions.toFixed(2);
    return pick(rng, [`${rendered}ล้าน`, `${rendered} ล้าน`, `${rendered}ลบ.`]);
  }
  return `${priceThb.toLocaleString("en-US")} บาท`;
}

/** Thai-style typo: transpose two adjacent characters somewhere mid-string. */
function applyTypo(rng: Rng, text: string): string {
  if (text.length < 4) return text;
  const i = 1 + Math.floor(rng() * (text.length - 3));
  return text.slice(0, i) + text.charAt(i + 1) + text.charAt(i) + text.slice(i + 2);
}

function areaPhrase(spec: ListingSpec, abbrev: boolean): string {
  const parts: string[] = [];
  if (spec.landRai) parts.push(`${spec.landRai} ไร่`);
  if (spec.landNgan) parts.push(`${spec.landNgan} งาน`);
  if (spec.landWah) parts.push(abbrev ? `${spec.landWah} ตร.ว.` : `${spec.landWah} ตารางวา`);
  if (spec.floorAreaSqm)
    parts.push(abbrev ? `${spec.floorAreaSqm} ตร.ม.` : `${spec.floorAreaSqm} ตารางเมตร`);
  return parts.join(" ");
}

function renderThai(spec: ListingSpec, profile: ChaosProfile, rng: Rng): string {
  const lines: string[] = [];
  const action = spec.dealType === "sale" ? "ขาย" : "ให้เช่า";
  const urgent =
    profile.urgencyPhrases && spec.urgency === "quick_sale"
      ? pick(rng, ["ขายด่วน!! ", "ด่วน! "])
      : "";
  lines.push(`${urgent}${action}${TH_PROPERTY_WORD[spec.propertyType]} ${spec.landmark}`);
  const deed = TH_DEED_WORD[spec.titleDeedType];
  if (deed) lines.push(deed);
  const area = areaPhrase(spec, profile.thaiAbbreviations);
  if (area) lines.push(area);
  if (spec.bedrooms !== undefined && spec.bathrooms !== undefined) {
    lines.push(
      profile.thaiAbbreviations
        ? `${spec.bedrooms}นอน ${spec.bathrooms}น้ำ`
        : `${spec.bedrooms} ห้องนอน ${spec.bathrooms} ห้องน้ำ`,
    );
  }
  lines.push(`ต.${spec.tambon} อ.${spec.amphoe} จ.${spec.province}`);
  const price = formatPriceTh(spec.priceThb, profile.thaiAbbreviations, rng);
  lines.push(
    spec.dealType === "rent"
      ? `เช่า ${spec.priceThb.toLocaleString("en-US")}/เดือน`
      : `ราคา ${price}`,
  );
  lines.push(`สนใจติดต่อ ${spec.ownerName} ${spec.phone}`);
  return lines.join("\n");
}

function renderEnglish(spec: ListingSpec, rng: Rng): string {
  const action = spec.dealType === "sale" ? "For sale" : "For rent";
  const lines = [
    `${action}: ${EN_PROPERTY_WORD[spec.propertyType]} near ${spec.landmark}`,
    spec.bedrooms !== undefined ? `${spec.bedrooms} bed / ${spec.bathrooms} bath` : "",
    `${spec.tambon}, ${spec.amphoe}, ${spec.province}`,
    spec.dealType === "rent"
      ? `${spec.priceThb.toLocaleString("en-US")} THB/month`
      : `${(spec.priceThb / 1_000_000).toFixed(1)}M THB`,
    pick(rng, [`Contact ${spec.phone}`, `Tel ${spec.phone}`]),
  ];
  return lines.filter((l) => l !== "").join("\n");
}

function renderListing(spec: ListingSpec, profile: ChaosProfile, rng: Rng): string {
  const lang =
    profile.languageMix === "mixed" ? (chance(rng, 0.5) ? "th" : "en") : profile.languageMix;
  let text = lang === "th" ? renderThai(spec, profile, rng) : renderEnglish(spec, rng);
  if (chance(rng, profile.typoRate)) text = applyTypo(rng, text);
  return text;
}

/** Expected fields the eval scorecard checks, straight from the spec (no parsing). */
function expectedProperty(spec: ListingSpec, postedPhotos: number): Record<string, unknown> {
  return {
    id: spec.id,
    dealType: spec.dealType,
    propertyType: spec.propertyType,
    titleDeedType: spec.titleDeedType,
    priceThb: spec.priceThb,
    urgency: spec.urgency,
    province: spec.province,
    amphoe: spec.amphoe,
    tambon: spec.tambon,
    bedrooms: spec.bedrooms ?? null,
    bathrooms: spec.bathrooms ?? null,
    // Ground truth is what was actually POSTED (chaos may drop photos), not what
    // the spec intended — photo attribution is scored against the transcript.
    photoCount: postedPhotos,
  };
}

/**
 * Generate one chat thread covering `specs` (multi-property dump when >1),
 * applying the chaos profile deterministically.
 */
export function generateCase(specs: ListingSpec[], profile: ChaosProfile): GeneratedCase {
  if (specs.length === 0) throw new Error("generateCase requires at least one spec");
  const rng = mulberry32(profile.seed);
  const messages: TranscriptMessage[] = [];
  let minute = 0;
  const duplicatePairs: Array<[string, string]> = [];
  const postedPhotos = new Map<string, number>();

  for (const spec of specs) {
    // Mid-thread correction: the ORIGINAL post advertises a stale (higher) price;
    // a later message corrects it to the spec truth. Rendering the original from a
    // stale-price spec (instead of string-replacing afterwards) keeps the chaos
    // independent of RNG state.
    const correcting = profile.midThreadCorrection && spec.dealType === "sale";
    const staleSpec: ListingSpec = correcting
      ? {
          ...spec,
          priceThb: Math.round((spec.priceThb * (1 + (0.03 + rng() * 0.07))) / 100_000) * 100_000,
        }
      : spec;
    messages.push({
      sender: spec.ownerName,
      text: renderListing(staleSpec, profile, rng),
      atMinute: minute,
    });
    minute += 1;

    // Photos — possibly fewer than promised, possibly out of order.
    const kept = Array.from({ length: spec.photoCount }, (_, i) => i).filter(
      () => !chance(rng, profile.photosMissingRate),
    );
    postedPhotos.set(spec.id, kept.length);
    const order = profile.photosOutOfOrder ? shuffle(rng, kept) : kept;
    for (const index of order) {
      messages.push({
        sender: spec.ownerName,
        photoOf: { specId: spec.id, index },
        atMinute: minute,
      });
      minute += 1;
    }

    if (correcting) {
      minute += 30;
      messages.push({
        sender: spec.ownerName,
        text: `แก้ไขครับ ราคา ${spec.priceThb.toLocaleString("en-US")} บาท`,
        atMinute: minute,
      });
    }

    if (profile.duplicateRepost.enabled) {
      minute += 120;
      const driftedPrice = Math.round(
        spec.priceThb * (1 + (rng() * 2 - 1) * profile.duplicateRepost.priceDriftPct),
      );
      const repostId = `${spec.id}-repost`;
      const repostSpec: ListingSpec = {
        ...spec,
        id: repostId,
        priceThb: driftedPrice,
        phone: profile.duplicateRepost.contactDrift ? spec.phone.replaceAll("-", " ") : spec.phone,
      };
      messages.push({
        sender: spec.ownerName,
        text: renderListing(repostSpec, profile, rng),
        atMinute: minute,
      });
      duplicatePairs.push([spec.id, repostId]);
    }
    minute += 5;
  }

  const transcript = messages
    .map((m) =>
      m.text !== undefined
        ? `[${m.atMinute}m] ${m.sender}: ${m.text}`
        : `[${m.atMinute}m] ${m.sender}: <photo ${m.photoOf?.specId}#${m.photoOf?.index}>`,
    )
    .join("\n");

  return {
    id: `${specs.map((s) => s.id).join("+")}@${profile.seed}`,
    messages,
    transcript,
    expected: {
      properties: specs.map((s) => expectedProperty(s, postedPhotos.get(s.id) ?? 0)),
      duplicatePairs,
    },
  };
}
