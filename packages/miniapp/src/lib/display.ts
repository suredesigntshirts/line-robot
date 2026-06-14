/**
 * Pure presentation mappers: turn the SLIM packages/api DTOs into localized display strings the
 * card/detail components render. No DOM, no LIFF — unit-testable. This is the mini-app's adaptation
 * layer (the website has `toCardView` over the full domain Listing; our DTOs are slimmer, so this is
 * its own thin mapper). Style = match the mock, content = these schema-driven strings.
 *
 * COPY-06: prices are ASKING prices (ราคาเสนอขาย), never implied appraisals; rentals frame monthly
 * (MKT-03). All Thai labels come from the @line-robot/ui catalog (no hardcoded Thai in JSX where a
 * catalog key exists) — see i18n.ts for the mini-app-specific keys.
 */
import type { Translator } from "@line-robot/ui";
import type { ListingCardDto, ListingDetailDto } from "./types.ts";

/** "฿4,800,000" — Latin numerals, grouped (matches the mock's .card-price treatment). */
export function formatThb(n: number): string {
  return `฿${n.toLocaleString("en-US")}`;
}

/** The headline price string for a card/detail, framed by deal type. Sale → priceThb; rent →
 * monthlyRent (both the card AND detail DTOs now carry it). Returns the amount only (the frame label
 * is a separate catalog string); "—" when the relevant amount is absent. */
export function priceText(dto: {
  dealType: string;
  priceThb: number | null;
  monthlyRent: number | null;
}): string {
  const amount = dto.dealType === "rent" ? dto.monthlyRent : dto.priceThb;
  return amount !== null ? formatThb(amount) : "—";
}

/** The price frame label key (COPY-06): asking-price for sale, monthly for rent. */
export function priceFrameKey(dealType: string): "listing.priceAsking" | "listing.priceMonthly" {
  return dealType === "rent" ? "listing.priceMonthly" : "listing.priceAsking";
}

/** Property-type → catalog key (ที่ดิน / บ้านเดี่ยว / …). */
export function propertyTypeKey(
  propertyType: string,
):
  | "ptype.land"
  | "ptype.house"
  | "ptype.townhouse"
  | "ptype.condo"
  | "ptype.commercial"
  | "ptype.other" {
  switch (propertyType) {
    case "land":
      return "ptype.land";
    case "house":
      return "ptype.house";
    case "townhouse":
      return "ptype.townhouse";
    case "condo":
      return "ptype.condo";
    case "commercial":
      return "ptype.commercial";
    default:
      return "ptype.other";
  }
}

/** "📍 อำเภอ · จังหวัด" location line from amphoe/province (drops absent parts). */
export function locationLine(dto: { amphoe: string | null; province: string | null }): string {
  return [dto.amphoe, dto.province].filter((s): s is string => !!s && s !== "").join(" · ");
}

/** The lifecycle badge kind for a card/detail — the mini-app's CRM lifecycle (DF-4): draft (unpublished
 * sale), active (published & available), reserved/under-contract, sold/transferred, rented, withdrawn.
 * Drives the badge colour (paired bg+text tokens) + label. Sale uses saleStage + isPublished; rent
 * uses rentalStatus. */
export type LifecycleKind = "draft" | "active" | "offer" | "sold" | "rented" | "withdrawn";

export function lifecycleKind(dto: {
  dealType: string;
  saleStage: string;
  rentalStatus: string;
  isPublished?: boolean;
}): LifecycleKind {
  if (dto.dealType === "rent") {
    if (dto.rentalStatus === "rented") return "rented";
    if (dto.rentalStatus === "withdrawn") return "withdrawn";
    // available rental: published → active, else draft.
    return dto.isPublished === false ? "draft" : "active";
  }
  // sale
  if (dto.saleStage === "transferred") return "sold";
  if (dto.saleStage === "reserved" || dto.saleStage === "under_contract") return "offer";
  // available sale: published → active, else draft (claimed-but-not-published).
  return dto.isPublished === false ? "draft" : "active";
}

/** The lifecycle badge label key per kind. */
export function lifecycleLabelKey(kind: LifecycleKind): import("@line-robot/ui").MessageKey {
  switch (kind) {
    case "draft":
      return "crm.statusDraft";
    case "active":
      return "crm.statusActive";
    case "offer":
      return "crm.statusOffer";
    case "sold":
      return "crm.statusSold";
    case "rented":
      return "crm.statusRented";
    case "withdrawn":
      return "crm.statusWithdrawn";
  }
}

/** Build a localized headline for a card. Prefer the listing's own headline (detail); for a card the
 * api gives no headline, so compose deal + property-type + location ("ขาย บ้านเดี่ยว · สันทราย"). */
export function cardHeadline(dto: ListingCardDto, t: Translator): string {
  const deal = dto.dealType === "rent" ? t("badge.forRent") : t("badge.forSale");
  const ptype = t(propertyTypeKey(dto.propertyType));
  const loc = locationLine(dto);
  return loc !== "" ? `${deal} ${ptype} · ${loc}` : `${deal} ${ptype}`;
}

/** The detail headline: the listing's own headline if present, else the composed fallback. */
export function detailHeadline(dto: ListingDetailDto, t: Translator): string {
  if (dto.headline && dto.headline.trim() !== "") return dto.headline;
  return cardHeadline(dto, t);
}

/** Google-Maps deep link for a lat/lon (used by the detail "Open in Maps" CTA). */
export function mapsUri(lat: number, lon: number): string {
  return `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`;
}

// --- Viewing date/time formatting (Stage 5, Build D — D13) ------------------
//
// The viewings mock (explore-stage5-3-viewings.html) shows a date BUBBLE (big day number + short Thai
// month) and a time line. Thai locales (th-TH) render the Buddhist-era calendar natively via Intl, so
// the note-meta year reads "2569" as in the mock; the bubble shows only day + month so the era doesn't
// clutter it. `en` falls back to the Gregorian locale (the SPA is th-default, but the locale flips with
// LIFF's reported language). All pure — no DOM — so they're unit-testable.

/** A viewing's date bubble: the day number + the short localized month (e.g. `{ day: "14", month:
 * "มิ.ย." }`). Latin numerals stay Latin via the bubble's `font-latin`; the month is localized. */
export function viewingDateBubble(
  iso: string,
  locale: "th" | "en",
): { day: string; month: string } {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return { day: "—", month: "" };
  // `en-US` numerals for the day (the mock's bubble uses Latin digits in both locales); the month is
  // localized (th → "มิ.ย.", en → "Jun"). For th we still want the Buddhist calendar's month name,
  // which `th-TH` gives; the day number is calendar-agnostic.
  const day = new Intl.DateTimeFormat("en-US", { day: "numeric" }).format(d);
  const month = new Intl.DateTimeFormat(locale === "th" ? "th-TH" : "en-US", {
    month: "short",
  }).format(d);
  return { day, month };
}

/** A viewing's time-of-day range start (e.g. "10:00") — 24h, locale-stable. The api stores a single
 * scheduledAt; we render the start time (no end time in the schema — the mock's range is illustrative). */
export function viewingTime(iso: string, locale: "th" | "en"): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat(locale === "th" ? "th-TH" : "en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(d);
}

/** A full date-time stamp for a note's meta line / a viewing's full date (Buddhist-era for th — "14
 * มิ.ย. 2569"). Uses the native th-TH Buddhist calendar so the year matches the mock's "2569". */
export function fullDateTime(iso: string, locale: "th" | "en"): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat(locale === "th" ? "th-TH" : "en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(d);
}

/** The viewing status → catalog label key (the status pill on a viewing card). */
export function viewingStatusKey(
  status: string,
):
  | "viewing.statusRequested"
  | "viewing.statusConfirmed"
  | "viewing.statusDone"
  | "viewing.statusCancelled" {
  switch (status) {
    case "confirmed":
      return "viewing.statusConfirmed";
    case "done":
      return "viewing.statusDone";
    case "cancelled":
      return "viewing.statusCancelled";
    default:
      return "viewing.statusRequested";
  }
}
