import { createTranslator } from "@line-robot/ui";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MyListingCard } from "../src/components/MyListingCard.tsx";
import { computeStats } from "../src/components/StatsStrip.tsx";
import { DETAIL, LISTING_ACTIVE, LISTING_OFFER, MY_LISTINGS } from "./fixtures.ts";

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
