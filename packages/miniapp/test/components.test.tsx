import { createTranslator } from "@line-robot/ui";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Gallery } from "../src/components/Gallery.tsx";
import { MyListingCard } from "../src/components/MyListingCard.tsx";
import { computeStats } from "../src/components/StatsStrip.tsx";
import { DETAIL, LISTING_ACTIVE, LISTING_OFFER, LISTING_RENT, MY_LISTINGS } from "./fixtures.ts";

const t = createTranslator("th");

describe("MyListingCard", () => {
  it("renders the lifecycle badge, composed headline, price + meta from a card DTO", () => {
    render(<MyListingCard listing={LISTING_ACTIVE} t={t} onOpen={() => {}} />);
    // active sale → "ประกาศอยู่" badge
    expect(screen.getByText("ประกาศอยู่")).toBeTruthy();
    // composed headline
    expect(screen.getByText(/ขาย บ้านเดี่ยว/)).toBeTruthy();
    // price (Latin numerals, grouped)
    expect(screen.getByText("฿1,200,000")).toBeTruthy();
    // the card carries the e2e marker (its id) so the frontend gate's invariants scope here
    const card = document.querySelector(`[data-listing-card="${LISTING_ACTIVE.id}"]`);
    expect(card).toBeTruthy();
  });

  it("a RENT card shows its monthly rent + ค่าเช่า/เดือน frame, NOT '—' (review finding #1)", () => {
    // LISTING_RENT is the real api shape for a rental: priceThb null, monthlyRent 13_000.
    expect(LISTING_RENT.priceThb).toBeNull();
    render(<MyListingCard listing={LISTING_RENT} t={t} onOpen={() => {}} />);
    expect(screen.getByText("฿13,000")).toBeTruthy(); // the owner SEES their rent
    expect(screen.queryByText("—")).toBeNull(); // never the empty em-dash
    expect(screen.getByText("ค่าเช่า/เดือน")).toBeTruthy(); // MKT-03 monthly frame
  });

  it("fires onOpen when tapped (navigates to detail)", async () => {
    const onOpen = vi.fn();
    render(<MyListingCard listing={LISTING_OFFER} t={t} onOpen={onOpen} />);
    (document.querySelector("[data-listing-card]") as HTMLButtonElement).click();
    expect(onOpen).toHaveBeenCalledOnce();
  });

  it("renders the presigned hero when present, the placeholder glyph otherwise", () => {
    const { unmount } = render(<MyListingCard listing={LISTING_OFFER} t={t} onOpen={() => {}} />);
    expect(document.querySelector("img")).toBeTruthy(); // LISTING_OFFER has a heroUrl
    unmount();
    render(<MyListingCard listing={LISTING_ACTIVE} t={t} onOpen={() => {}} />); // no heroUrl
    expect(document.querySelector("img")).toBeNull();
    expect(document.querySelector("svg")).toBeTruthy(); // placeholder glyph
  });
});

describe("Gallery", () => {
  it("renders a hero + the photo-count chip + a thumbnail per photo", () => {
    render(<Gallery photos={DETAIL.photos} alt="x" t={t} />);
    // count chip carries the total + position 1/N
    expect(document.querySelector("[data-photo-count]")?.getAttribute("data-photo-count")).toBe(
      String(DETAIL.photos.length),
    );
    expect(screen.getByText(`รูปภาพ 1/${DETAIL.photos.length} รูป`)).toBeTruthy();
    // a thumbnail per photo; the active one is photo 0
    expect(document.querySelectorAll("[data-gallery-thumb]").length).toBe(DETAIL.photos.length);
    const hero = document.querySelector("[data-gallery-hero]") as HTMLImageElement;
    expect(hero.getAttribute("src")).toBe(DETAIL.photos[0]?.url);
    expect(document.querySelector("[data-gallery-thumb='0']")?.hasAttribute("data-active")).toBe(
      true,
    );
  });

  it("tapping a thumbnail makes that photo the active hero (the bug class this rebuild fixes)", () => {
    render(<Gallery photos={DETAIL.photos} alt="x" t={t} />);
    fireEvent.click(document.querySelector("[data-gallery-thumb='2']") as HTMLButtonElement);
    expect(
      (document.querySelector("[data-gallery-hero]") as HTMLImageElement).getAttribute("src"),
    ).toBe(DETAIL.photos[2]?.url);
    expect(document.querySelector("[data-gallery-thumb='2']")?.hasAttribute("data-active")).toBe(
      true,
    );
    expect(document.querySelector("[data-gallery-thumb='0']")?.hasAttribute("data-active")).toBe(
      false,
    );
  });

  it("renders nothing for an empty photo set", () => {
    const { container } = render(<Gallery photos={[]} alt="x" t={t} />);
    expect(container.firstChild).toBeNull();
  });
});

describe("computeStats", () => {
  it("derives total/active/draft/closed from the lifecycle of each listing", () => {
    // fixtures: offer, active, active(rent), draft, sold → total 5, active 3 (offer+2 active), draft 1, closed 1
    expect(computeStats(MY_LISTINGS)).toEqual({ total: 5, active: 3, draft: 1, closed: 1 });
  });
  it("is all-zero for an empty set", () => {
    expect(computeStats([])).toEqual({ total: 0, active: 0, draft: 0, closed: 0 });
  });
});

describe("DETAIL fixture shape", () => {
  it("matches the frozen contract fields the detail screen reads", () => {
    // A guard that the fixture (and thus the contract the screen codes against) carries every field
    // the DetailScreen renders — catches a contract drift at test time, not in the browser.
    for (const key of [
      "id",
      "dealType",
      "propertyType",
      "priceThb",
      "monthlyRent",
      "saleStage",
      "rentalStatus",
      "province",
      "amphoe",
      "tambon",
      "landmark",
      "projectName",
      "bedrooms",
      "bathrooms",
      "lat",
      "lon",
      "headline",
      "description",
      "isClaimedByMe",
      "photos",
    ]) {
      expect(DETAIL).toHaveProperty(key);
    }
  });
});
