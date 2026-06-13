import type { Listing } from "@line-robot/domain";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import {
  AccordionSection,
  createTranslator,
  EmptyState,
  ErrorState,
  LineCtaButton,
  ListingCard,
  PriceDisplay,
  SearchFilters,
  StatusBadge,
  toCardView,
} from "../src/index.ts";

const t = createTranslator("th");

const LISTING: Listing = {
  id: "L1",
  ownerUserId: "U1",
  sourceGroupId: null,
  dealType: "sale",
  saleStage: "available",
  rentalStatus: null,
  titleDeedType: "chanote",
  deedNo: null,
  tenure: null,
  leaseYears: null,
  propertyType: "house",
  priceThb: 4_500_000,
  priceNegotiable: true,
  urgency: "quick_sale",
  transactionType: "normal",
  listingType: "normal",
  saleCondition: "unknown",
  redemptionPeriodYears: null,
  province: "เชียงใหม่",
  amphoe: "เมืองเชียงใหม่",
  tambon: "สุเทพ",
  landmark: "ใกล้ มช.",
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

describe("StatusBadge", () => {
  it("derives badges from domain fields: sale + urgent + owner-direct (COPY-05/10)", () => {
    render(<StatusBadge listing={LISTING} t={t} />);
    expect(screen.getByText("ขาย")).toBeDefined();
    expect(screen.getByText("ขายด่วน")).toBeDefined();
    expect(screen.getByText("เจ้าของขายเอง")).toBeDefined();
  });

  it("FIELD-02: unknown deed wears the amber WARN badge, not the NPA category colour", () => {
    const { container } = render(
      <StatusBadge listing={{ ...LISTING, titleDeedType: "unknown" }} t={t} />,
    );
    expect(screen.getByText("ยังไม่ยืนยันโฉนด")).toBeDefined();
    // Must render as `warn` (amber nudge), never `npa` — the two are distinct concepts now.
    expect(container.querySelector('[data-badge="warn"]')).not.toBeNull();
    expect(container.querySelector('[data-badge="npa"]')).toBeNull();
  });

  it("DIST-01: NPA stock wears the calm bank-asset label (npa category badge, never danger)", () => {
    const { container } = render(
      <StatusBadge listing={{ ...LISTING, listingType: "npa", urgency: "normal" }} t={t} />,
    );
    expect(screen.getByText("ทรัพย์ธนาคาร")).toBeDefined();
    const npaBadge = container.querySelector('[data-badge="npa"]');
    expect(npaBadge).not.toBeNull();
    // The calm category token — NOT the danger badge (there is no `danger` badge kind at all).
    expect(container.querySelector('[data-badge="danger"]')).toBeNull();
  });

  it("DIST-01: LED auction stock wears the court-auction label (same calm category)", () => {
    render(
      <StatusBadge listing={{ ...LISTING, listingType: "auction", urgency: "normal" }} t={t} />,
    );
    expect(screen.getByText("ขายทอดตลาด (บังคับคดี)")).toBeDefined();
  });

  it("a normal listing shows no provenance badge", () => {
    const { container } = render(<StatusBadge listing={{ ...LISTING, urgency: "normal" }} t={t} />);
    expect(container.querySelector('[data-badge="npa"]')).toBeNull();
  });

  it("TH-04: verified poster badge appears when verified", () => {
    render(<StatusBadge listing={LISTING} verified t={t} />);
    expect(screen.getByText("ยืนยันตัวตนแล้ว")).toBeDefined();
  });
});

describe("PriceDisplay", () => {
  it("COPY-06: frames the price as ASKING + negotiable flag", () => {
    render(<PriceDisplay listing={LISTING} t={t} />);
    expect(screen.getByText("ราคาเสนอขาย")).toBeDefined();
    expect(screen.getByText(/฿4,500,000/)).toBeDefined();
    expect(screen.getByText("ต่อรองได้")).toBeDefined();
  });

  it("TH-03: built property shows per-m²; land shows per-wah", () => {
    render(<PriceDisplay listing={LISTING} t={t} />);
    expect(screen.getByText(/฿25,000 บาท\/ตร\.ม\./)).toBeDefined();
    render(
      <PriceDisplay
        listing={{ ...LISTING, propertyType: "land", pricePerWah: 30_000, pricePerSqm: null }}
        t={t}
      />,
    );
    expect(screen.getByText(/฿30,000 บาท\/ตร\.ว\./)).toBeDefined();
  });

  it("rentals frame as monthly rent from listing_rental", () => {
    render(
      <PriceDisplay
        listing={{ ...LISTING, dealType: "rent", priceThb: null }}
        monthlyRent={12_000}
        t={t}
      />,
    );
    expect(screen.getByText("ค่าเช่า/เดือน")).toBeDefined();
    expect(screen.getByText(/฿12,000/)).toBeDefined();
  });
});

describe("LineCtaButton (CONV-06/09)", () => {
  it("LINE is primary, phone secondary, tel: sanitized", () => {
    render(<LineCtaButton lineHref="https://line.me/x" phone="081-234-5678" t={t} />);
    const line = screen.getByText("แชทผ่าน LINE").closest("a");
    const phone = screen.getByText("โทร").closest("a");
    expect(line?.getAttribute("href")).toBe("https://line.me/x");
    expect(phone?.getAttribute("href")).toBe("tel:0812345678");
  });

  it("renders without phone (LINE only)", () => {
    render(<LineCtaButton lineHref="https://line.me/x" t={t} />);
    expect(screen.queryByText("โทร")).toBeNull();
  });
});

describe("ListingCard (CONV-03/04/05/11)", () => {
  const view = toCardView({
    listing: LISTING,
    headline: "บ้านเดี่ยวใกล้ มช.",
    heroUrl: "https://cdn/x.jpg",
    photoCount: 8,
    bedroomsLabel: t("listing.bedrooms", { count: 3 }),
    bathroomsLabel: t("listing.bathrooms", { count: 2 }),
  });

  it("renders headline, price, badges, freshness, and the human trust signal", () => {
    render(
      <ListingCard
        listing={LISTING}
        view={view}
        postedByName="คุณสมชาย"
        href="/p/L1"
        verified
        t={t}
      />,
    );
    expect(screen.getByText("บ้านเดี่ยวใกล้ มช.")).toBeDefined();
    expect(screen.getByText(/฿4,500,000/)).toBeDefined();
    expect(screen.getByText("ขายด่วน")).toBeDefined();
    expect(screen.getByText(/ลงประกาศโดย คุณสมชาย/)).toBeDefined();
    expect(screen.getByText(/อัปเดต 2026-06-12/)).toBeDefined();
    expect(screen.getByText("8 รูป")).toBeDefined();
  });
});

describe("AccordionSection (CONV-05)", () => {
  it("deed section is default-expanded; others collapsed", () => {
    const { container } = render(
      <>
        <AccordionSection title={t("listing.deedSection")} defaultOpen>
          <span>โฉนด 12345</span>
        </AccordionSection>
        <AccordionSection title="อื่นๆ">
          <span>hidden</span>
        </AccordionSection>
      </>,
    );
    const sections = container.querySelectorAll("details");
    expect(sections[0]?.open).toBe(true);
    expect(sections[1]?.open).toBe(false);
  });
});

describe("SearchFilters (COMP-05/06, D3.9 stateless)", () => {
  const groups = [
    {
      id: "deed",
      label: t("filter.deedType"),
      chips: [
        { id: "chanote", label: "โฉนด" },
        { id: "ns3g", label: "น.ส.3ก" },
      ],
    },
  ];

  it("emits onChange with toggled chip, never fetches", () => {
    const onChange = vi.fn();
    render(<SearchFilters groups={groups} value={[]} onChange={onChange} t={t} />);
    screen.getByText("โฉนด").click();
    expect(onChange).toHaveBeenCalledWith(["chanote"]);
  });

  it("clear chip resets the selection", () => {
    const onChange = vi.fn();
    render(<SearchFilters groups={groups} value={["chanote"]} onChange={onChange} t={t} />);
    screen.getByText(t("filter.clear")).click();
    expect(onChange).toHaveBeenCalledWith([]);
  });
});

describe("Empty/Error states (COPY-07: what + why + next)", () => {
  it("EmptyState carries all three parts", () => {
    render(<EmptyState t={t} />);
    expect(screen.getByText("ไม่พบประกาศ")).toBeDefined();
    expect(screen.getByText(/ตัวกรองของคุณ/)).toBeDefined();
    expect(screen.getByText(/ลองล้างตัวกรอง/)).toBeDefined();
  });

  it("ErrorState offers retry", () => {
    const onRetry = vi.fn();
    render(<ErrorState t={t} onRetry={onRetry} />);
    screen.getByText("ลองใหม่").click();
    expect(onRetry).toHaveBeenCalled();
  });
});
