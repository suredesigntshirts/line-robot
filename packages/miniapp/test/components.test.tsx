import { createTranslator } from "@line-robot/ui";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Gallery } from "../src/components/Gallery.tsx";
import { Header } from "../src/components/Header.tsx";
import { MyListingCard } from "../src/components/MyListingCard.tsx";
import { FilterChips, SearchPill } from "../src/components/MyListingsControls.tsx";
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

  it("overlays the deal pill (photo-forward) — ขาย for a sale, ให้เช่า for a rent", () => {
    const { unmount } = render(<MyListingCard listing={LISTING_ACTIVE} t={t} onOpen={() => {}} />);
    const sellPill = document.querySelector("[data-deal-pill]");
    expect(sellPill?.textContent).toBe("ขาย");
    unmount();
    render(<MyListingCard listing={LISTING_RENT} t={t} onOpen={() => {}} />);
    expect(document.querySelector("[data-deal-pill]")?.textContent).toBe("ให้เช่า");
  });

  it("shows the photo-present chip ONLY when the card has a hero photo (no fabricated count)", () => {
    const { unmount } = render(<MyListingCard listing={LISTING_OFFER} t={t} onOpen={() => {}} />);
    expect(document.querySelector("[data-photo-chip]")).toBeTruthy(); // LISTING_OFFER has a photo
    unmount();
    render(<MyListingCard listing={LISTING_ACTIVE} t={t} onOpen={() => {}} />); // no heroUrl
    expect(document.querySelector("[data-photo-chip]")).toBeNull();
  });
});

describe("Header identity chrome (S5-5)", () => {
  const profile = { displayName: "คุณธนวัฒน์", pictureUrl: "https://x/p.png" };

  it("renders the wordmark, the avatar image, and the display name from the profile", () => {
    render(<Header t={t} active="listings" onSelect={() => {}} profile={profile} />);
    expect(screen.getByText("ทรัพย์ดี")).toBeTruthy(); // the wordmark
    expect(screen.getByText("คุณธนวัฒน์")).toBeTruthy(); // display name
    const avatar = document.querySelector("[data-identity-avatar]") as HTMLImageElement;
    expect(avatar.tagName).toBe("IMG");
    expect(avatar.getAttribute("src")).toBe(profile.pictureUrl);
  });

  it("falls back to an initial-based avatar when no pictureUrl is granted", () => {
    render(
      <Header t={t} active="listings" onSelect={() => {}} profile={{ displayName: "ธนวัฒน์" }} />,
    );
    const avatar = document.querySelector("[data-identity-avatar]");
    expect(avatar?.tagName).not.toBe("IMG"); // a span fallback
    expect(avatar?.textContent).toBe("ธ"); // the first grapheme
  });

  it("with NO profile shows the account title (degrades, never errors)", () => {
    render(<Header t={t} active="listings" onSelect={() => {}} />);
    expect(screen.getByText("บัญชีของฉัน")).toBeTruthy();
    expect(document.querySelector("[data-identity-avatar]")?.textContent).toBe("?");
  });
});

describe("MyListings controls", () => {
  it("FilterChips marks the active chip aria-pressed and fires onSelect with the bucket", () => {
    const onSelect = vi.fn();
    render(<FilterChips t={t} active="all" onSelect={onSelect} />);
    const offer = document.querySelector("[data-filter-chip='offer']") as HTMLButtonElement;
    expect(offer.getAttribute("aria-pressed")).toBe("false");
    expect(
      (document.querySelector("[data-filter-chip='all']") as HTMLElement).getAttribute(
        "aria-pressed",
      ),
    ).toBe("true");
    fireEvent.click(offer);
    expect(onSelect).toHaveBeenCalledWith("offer");
  });

  it("SearchPill is controlled — emits typed text and a clear", () => {
    const onChange = vi.fn();
    const { rerender } = render(<SearchPill t={t} value="" onChange={onChange} />);
    // No clear button while empty.
    expect(document.querySelector("[data-search-clear]")).toBeNull();
    fireEvent.change(document.querySelector("[data-search-input]") as HTMLInputElement, {
      target: { value: "สันทราย" },
    });
    expect(onChange).toHaveBeenCalledWith("สันทราย");
    // With a value, the clear button appears + resets.
    rerender(<SearchPill t={t} value="สันทราย" onChange={onChange} />);
    fireEvent.click(document.querySelector("[data-search-clear]") as HTMLButtonElement);
    expect(onChange).toHaveBeenCalledWith("");
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
  it("derives total/active/offer/draft/closed from the lifecycle of each listing (5-stat strip)", () => {
    // fixtures: offer, active, active(rent), draft, sold → total 5, active 2 (the two live), offer 1,
    // draft 1, closed 1 (under-offer is now its OWN tile, split out of active — S5-5 five-stat strip).
    expect(computeStats(MY_LISTINGS)).toEqual({
      total: 5,
      active: 2,
      offer: 1,
      draft: 1,
      closed: 1,
    });
  });
  it("is all-zero for an empty set", () => {
    expect(computeStats([])).toEqual({ total: 0, active: 0, offer: 0, draft: 0, closed: 0 });
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
