import type { Listing } from "@line-robot/domain";
import type { Translator } from "../i18n/index.ts";

interface PriceDisplayProps {
  listing: Pick<
    Listing,
    "dealType" | "priceThb" | "priceNegotiable" | "pricePerWah" | "pricePerSqm" | "propertyType"
  >;
  /** Rentals price on listing_rental.monthly_rent; pass it when dealType=rent. */
  monthlyRent?: number | null;
  /** "card" (compact, in a listing card) or "detail" (the hero price on the detail page). */
  size?: "card" | "detail";
  t: Translator;
}

const formatThb = (n: number) => `฿${n.toLocaleString("en-US")}`;

/**
 * COPY-06: prices are framed as ASKING prices (ราคาเสนอขาย), never implied appraisals. TH-03:
 * per-area uses Thai units — wah² for land, m² for built. Direction-a treatment: a small muted
 * frame LABEL above a bold price (Latin numerals, tight tracking); negotiable + per-area trail muted.
 */
export function PriceDisplay({ listing, monthlyRent, size = "card", t }: PriceDisplayProps) {
  const isRent = listing.dealType === "rent";
  const amount = isRent ? (monthlyRent ?? null) : listing.priceThb;
  const frame = isRent ? t("listing.priceMonthly") : t("listing.priceAsking");
  const perArea =
    listing.propertyType === "land" && listing.pricePerWah !== null
      ? `${formatThb(Math.round(listing.pricePerWah))} ${t("listing.pricePerWah")}`
      : listing.pricePerSqm !== null
        ? `${formatThb(Math.round(listing.pricePerSqm))} ${t("listing.pricePerSqm")}`
        : null;
  const priceSize = size === "detail" ? "text-2xl" : "text-md";

  return (
    <div className="font-body-th">
      {/* TH-06/07: the Thai frame label is body text → ≥13px + leading ≥1.6. The price itself is
          Latin numerals (font-latin), so a tight line-height is fine there. */}
      <div className="text-sm text-text-2 leading-relaxed">{frame}</div>
      <div className={`font-latin font-bold ${priceSize} text-text leading-tight tracking-tight`}>
        {amount !== null ? formatThb(amount) : "—"}
        {listing.priceNegotiable && (
          <span className="ml-2 font-body-th font-normal text-sm text-text-2 leading-relaxed tracking-normal">
            {t("listing.negotiable")}
          </span>
        )}
      </div>
      {perArea && <div className="text-sm text-text-2 leading-relaxed">{perArea}</div>}
    </div>
  );
}
