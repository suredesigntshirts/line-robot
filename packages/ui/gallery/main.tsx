import type { Listing } from "@line-robot/domain";
import { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";
import "../theme.css";
import "../fallbacks.css";
import {
  AccordionSection,
  Badge,
  CardGrid,
  createTranslator,
  EmptyState,
  ErrorState,
  FieldList,
  Gallery,
  LineCtaButton,
  ListingCard,
  PriceDisplay,
  Screen,
  SearchFilters,
  StatusBadge,
  toCardView,
  type UiLocale,
} from "../src/index.ts";

const HERO =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='300'><rect width='400' height='300' fill='%23b8d0ef'/><text x='200' y='150' text-anchor='middle' font-size='24'>photo</text></svg>";

const LISTING: Listing = {
  id: "demo-1",
  ownerUserId: "U1",
  sourceGroupId: null,
  dealType: "sale",
  saleStage: "available",
  rentalStatus: null,
  titleDeedType: "chanote",
  deedNo: "45678",
  tenure: null,
  leaseYears: null,
  propertyType: "house",
  priceThb: 4_500_000,
  priceNegotiable: true,
  urgency: "quick_sale",
  transactionType: "normal",
  redemptionPeriodYears: null,
  province: "เชียงใหม่",
  amphoe: "เมืองเชียงใหม่",
  tambon: "สุเทพ",
  landmark: "ใกล้ มช. ประตูหลัง",
  projectName: null,
  addressDetail: null,
  landRai: 0,
  landNgan: 1,
  landWah: 50,
  landSqm: 600,
  floorAreaSqm: 180,
  pricePerSqm: 25_000,
  pricePerWah: null,
  bedrooms: 3,
  bathrooms: 2,
  facingDirection: "E",
  landShape: null,
  roadAccessM: null,
  roadType: null,
  floodHistory: null,
  floodRiskZone: null,
  cityPlanZoneColor: null,
  listingMandate: "group_exclusive",
  exclusivityExpiresAt: null,
  postedByRole: "owner",
  extractionSource: "auto",
  createdAt: new Date("2026-06-10T00:00:00Z"),
  updatedAt: new Date("2026-06-12T00:00:00Z"),
};

const RENTAL: Listing = {
  ...LISTING,
  id: "demo-2",
  dealType: "rent",
  saleStage: null,
  rentalStatus: "available",
  urgency: "normal",
  priceThb: null,
  postedByRole: "broker",
  titleDeedType: "unknown",
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ display: "grid", gap: "var(--spacing-3)" }}>
      <h2 style={{ margin: 0, fontFamily: "var(--font-heading-th)", fontSize: "var(--text-lg)" }}>
        {title}
      </h2>
      {children}
    </section>
  );
}

function App() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [locale, setLocale] = useState<UiLocale>("th");
  const [photoIndex, setPhotoIndex] = useState(0);
  const [filters, setFilters] = useState<string[]>(["chanote"]);
  const t = createTranslator(locale);

  document.documentElement.dataset.theme = theme;
  document.documentElement.lang = locale;

  const photos = [0, 1, 2, 3].map((i) => ({ url: HERO, alt: `photo ${i + 1}` }));
  const view = toCardView({
    listing: LISTING,
    headline: locale === "th" ? "บ้านเดี่ยว 3 นอน ใกล้ มช." : "3-bed house near CMU",
    heroUrl: HERO,
    photoCount: 8,
    bedroomsLabel: t("listing.bedrooms", { count: 3 }),
    bathroomsLabel: t("listing.bathrooms", { count: 2 }),
  });

  return (
    <Screen>
      <div style={{ display: "flex", gap: "var(--spacing-2)", justifyContent: "flex-end" }}>
        <button type="button" onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
          theme: {theme}
        </button>
        <button type="button" onClick={() => setLocale(locale === "th" ? "en" : "th")}>
          locale: {locale}
        </button>
      </div>

      <Section title="Badges">
        <div style={{ display: "flex", gap: "var(--spacing-1)", flexWrap: "wrap" }}>
          <Badge kind="available">{t("badge.available")}</Badge>
          <Badge kind="reserved">{t("badge.reserved")}</Badge>
          <Badge kind="urgent">{t("badge.urgent")}</Badge>
          <Badge kind="verified">{t("badge.verified")}</Badge>
          <Badge kind="owner">{t("badge.ownerDirect")}</Badge>
          <Badge kind="npa">{t("badge.npa")}</Badge>
        </div>
        <StatusBadge listing={LISTING} verified t={t} />
        <StatusBadge listing={RENTAL} npa t={t} />
      </Section>

      <Section title="PriceDisplay">
        <PriceDisplay listing={LISTING} t={t} />
        <PriceDisplay listing={RENTAL} monthlyRent={12_000} t={t} />
        <PriceDisplay
          listing={{ ...LISTING, propertyType: "land", pricePerWah: 30_000, pricePerSqm: null }}
          t={t}
        />
      </Section>

      <Section title="LineCtaButton">
        <LineCtaButton lineHref="https://line.me/R/" phone="081-234-5678" t={t} />
        <LineCtaButton lineHref="https://line.me/R/" t={t} />
      </Section>

      <Section title="ListingCard">
        <CardGrid>
          <ListingCard
            listing={LISTING}
            view={view}
            verified
            postedByName="คุณสมชาย"
            href="#"
            t={t}
          />
          <ListingCard
            listing={RENTAL}
            view={{ ...view, id: "demo-2", photoCount: 0, heroUrl: null }}
            monthlyRent={12_000}
            postedByName="P'Aor"
            href="#"
            t={t}
          />
        </CardGrid>
      </Section>

      <Section title="Gallery">
        <Gallery photos={photos} current={photoIndex} onSelect={setPhotoIndex} t={t} />
      </Section>

      <Section title="FieldList + Accordion">
        <AccordionSection title={t("listing.deedSection")} defaultOpen>
          <FieldList
            rows={[
              { label: t("listing.deedSection"), value: "โฉนด เลขที่ 45678" },
              { label: t("listing.landArea"), value: "1 งาน 50 ตร.ว. (600 ตร.ม.)" },
              { label: t("listing.floorArea"), value: "180 ตร.ม." },
            ]}
          />
        </AccordionSection>
        <AccordionSection title="รายละเอียดเพิ่มเติม">
          <FieldList rows={[{ label: "ทิศ", value: "ตะวันออก" }]} />
        </AccordionSection>
      </Section>

      <Section title="SearchFilters">
        <SearchFilters
          groups={[
            {
              id: "deed",
              label: t("filter.deedType"),
              chips: [
                { id: "chanote", label: "โฉนด" },
                { id: "ns3g", label: "น.ส.3ก" },
              ],
            },
            {
              id: "misc",
              label: t("filter.all"),
              chips: [
                { id: "new", label: t("filter.newVsResale") },
                { id: "npa", label: t("filter.npa") },
                { id: "pets", label: t("filter.petFriendly") },
              ],
            },
          ]}
          value={filters}
          onChange={setFilters}
          t={t}
        />
      </Section>

      <Section title="Empty / Error">
        <EmptyState t={t} />
        <ErrorState t={t} onRetry={() => undefined} />
      </Section>
    </Screen>
  );
}

const root = document.getElementById("root");
if (root)
  createRoot(root).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
