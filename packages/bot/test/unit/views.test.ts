import { describe, expect, it } from "vitest";
import type { Property } from "../../src/core/domain/catalog.js";
import { decodePostback } from "../../src/core/handlers/commands.js";
import {
  formatPrice,
  helpMessage,
  imageCarouselMessage,
  listingsMessage,
  mapsUri,
  mergePromptQuickReplies,
  propertyCard,
  propertyDetail,
  searchPromptMessage,
  upcomingEmptyMessage,
} from "../../src/core/handlers/views.js";

function prop(over: Partial<Property> = {}): Property {
  return { propertyId: "p-0123456789", ...over };
}

describe("formatPrice", () => {
  it("formats THB with the baht symbol and a default currency", () => {
    expect(formatPrice(5_500_000, "THB")).toBe("฿5,500,000");
    expect(formatPrice(2_300_000)).toBe("฿2,300,000"); // defaults to THB
  });
  it("formats other currencies with the code suffix", () => {
    expect(formatPrice(750_000, "USD")).toBe("750,000 USD");
  });
  it("returns undefined when there is no price", () => {
    expect(formatPrice(undefined, "THB")).toBeUndefined();
  });
});

describe("propertyCard", () => {
  it("builds a card with title, status subtitle, rows, and a Details postback", () => {
    const card = propertyCard(
      prop({
        normalizedAddress: "123 Sukhumvit",
        status: "negotiating",
        askingPrice: 5_500_000,
        currency: "THB",
        propertyType: "condo",
        district: "Watthana",
        province: "Bangkok",
      }),
    );
    expect(card.title).toBe("123 Sukhumvit");
    expect(card.subtitle).toBe("negotiating");
    expect(card.rows).toEqual([
      { label: "Price", value: "฿5,500,000" },
      { label: "Type", value: "condo" },
      { label: "Area", value: "Watthana, Bangkok" },
    ]);
    const { action, params } = decodePostback(card.actions[0]?.data ?? "");
    expect(action).toBe("view");
    expect(params.get("id")).toBe("p-0123456789");
  });

  it("falls back through project name then a short id for the title", () => {
    expect(propertyCard(prop({ projectName: "The Park" })).title).toBe("The Park");
    expect(propertyCard(prop()).title).toBe("Property p-012345");
  });

  it("includes a hero image only when a url is supplied", () => {
    expect(propertyCard(prop()).heroImageUrl).toBeUndefined();
    expect(propertyCard(prop(), "https://signed.example/x.jpg").heroImageUrl).toBe(
      "https://signed.example/x.jpg",
    );
  });

  it("surfaces tags on the summary card (the catch-all for unstructured detail)", () => {
    const card = propertyCard(prop({ tags: ["sea-view", "renovated"] }));
    expect(card.rows).toContainEqual({ label: "Tags", value: "sea-view, renovated" });
  });
});

describe("listingsMessage", () => {
  it("renders an empty-state text when there are no listings", () => {
    const msg = listingsMessage([], { emptyText: "nothing here" });
    expect(msg).toEqual({ type: "text", text: "nothing here" });
  });

  it("renders a flex carousel for listings", () => {
    const msg = listingsMessage([prop({ normalizedAddress: "A" }), prop({ projectName: "B" })], {
      altText: "Your listings",
    });
    expect(msg.type).toBe("flex");
    if (msg.type === "flex") {
      expect(msg.altText).toBe("Your listings");
      expect(msg.cards).toHaveLength(2);
    }
  });

  it("caps at 12 cards and notes the truncation in altText", () => {
    const many = Array.from({ length: 15 }, (_, i) => prop({ propertyId: `p-${i}` }));
    const msg = listingsMessage(many, { altText: "Your listings" });
    if (msg.type === "flex") {
      expect(msg.cards).toHaveLength(12);
      expect(msg.altText).toContain("showing 12");
    }
  });

  it("attaches a hero image to the matching card from the heroUrls map", () => {
    const msg = listingsMessage([prop({ propertyId: "p-a" }), prop({ propertyId: "p-b" })], {
      heroUrls: new Map([["p-a", "https://signed.example/a.jpg"]]),
    });
    if (msg.type === "flex") {
      expect(msg.cards[0]?.heroImageUrl).toBe("https://signed.example/a.jpg");
      expect(msg.cards[1]?.heroImageUrl).toBeUndefined(); // no url for p-b
    }
  });
});

describe("propertyDetail", () => {
  it("renders a rich flex card with the salient fields, status badge, and price headline", () => {
    const msg = propertyDetail(
      prop({
        normalizedAddress: "123 Sukhumvit",
        projectName: "The Park",
        askingPrice: 6_000_000,
        propertyType: "condo",
        status: "visited",
        district: "Watthana",
        province: "Bangkok",
        tags: ["near-bts"],
        createdAt: Date.UTC(2026, 5, 2),
        updatedAt: Date.UTC(2026, 5, 6),
      }),
      { heroImageUrl: "https://signed.example/a.jpg", photoCount: 3 },
    );
    expect(msg.type).toBe("flex");
    if (msg.type !== "flex") {
      return;
    }
    const card = msg.cards[0];
    expect(card?.title).toBe("123 Sukhumvit"); // address wins the title
    expect(card?.subtitle).toBe("👀 Visited"); // status badge
    expect(card?.headline).toBe("฿6,000,000"); // prominent price
    expect(card?.heroImageUrl).toBe("https://signed.example/a.jpg");
    // The title was the address, so the *project* surfaces as a row (not the address again).
    expect(card?.rows).toContainEqual({ label: "Project", value: "The Park" });
    expect(card?.rows).not.toContainEqual({ label: "Address", value: "123 Sukhumvit" });
    expect(card?.rows).toContainEqual({ label: "Type", value: "condo" });
    expect(card?.rows).toContainEqual({ label: "Area", value: "Watthana, Bangkok" });
    expect(card?.rows).toContainEqual({ label: "Tags", value: "near-bts" });
    // Reply-to-update hint + saved/updated stamps.
    expect(card?.notes?.[0]).toContain("Reply to update");
    expect(card?.notes?.[1]).toBe("Saved 2 Jun · Updated 6 Jun");
  });

  it("shows the Photos button only with ≥2 photos, and Maps + Follow-up always-ish", () => {
    const withPhotos = propertyDetail(prop({ lat: 13.7, long: 100.5 }), { photoCount: 3 });
    const onePhoto = propertyDetail(prop({ lat: 13.7, long: 100.5 }), { photoCount: 1 });
    const labels = (m: typeof withPhotos): string[] =>
      m.type === "flex" ? (m.cards[0]?.actions.map((a) => a.label) ?? []) : [];
    expect(labels(withPhotos)).toEqual([
      "🗺 Open in Maps",
      "🖼 Photos (3)",
      "📅 Follow-up",
      "🗑 Delete",
    ]);
    expect(labels(onePhoto)).toEqual(["🗺 Open in Maps", "📅 Follow-up", "🗑 Delete"]); // no Photos
  });

  it("omits the Maps button when there is no location or address at all", () => {
    const msg = propertyDetail(prop({ askingPrice: 1 }));
    if (msg.type === "flex") {
      const labels = msg.cards[0]?.actions.map((a) => a.label) ?? [];
      expect(labels).not.toContain("🗺 Open in Maps");
    }
  });
});

describe("propertyDetail — extended fields", () => {
  it("renders every present field as a row and omits nulls", () => {
    const msg = propertyDetail(
      prop({
        normalizedAddress: "9 Rama IX",
        propertyType: "house",
        bedrooms: 3,
        bathrooms: 2,
        usableAreaSqm: 180,
        landArea: "1 rai 2 ngan",
        floors: 2,
        furnishing: "fully furnished",
        listingType: "sale",
        contact: "Khun A 081-234",
        source: "FB group",
        notes: "Corner unit, quiet soi",
      }),
    );
    if (msg.type !== "flex") {
      throw new Error("expected flex");
    }
    const rows = Object.fromEntries((msg.cards[0]?.rows ?? []).map((r) => [r.label, r.value]));
    expect(rows.Rooms).toBe("3 bed · 2 bath");
    expect(rows["Usable area"]).toBe("180 sqm");
    expect(rows.Land).toBe("1 rai 2 ngan");
    expect(rows.Floors).toBe("2");
    expect(rows.Furnishing).toBe("fully furnished");
    expect(rows.For).toBe("sale");
    expect(rows.Contact).toBe("Khun A 081-234");
    expect(rows.Source).toBe("FB group");
    expect(rows.Notes).toBe("Corner unit, quiet soi");
    expect(rows.Tags).toBeUndefined(); // no tags → omitted
  });

  it("uses monthly rent as the headline for a pure rental", () => {
    const msg = propertyDetail(prop({ rentPrice: 25_000, listingType: "rent" }));
    if (msg.type === "flex") {
      expect(msg.cards[0]?.headline).toBe("฿25,000/mo");
    }
  });
});

describe("mapsUri", () => {
  it("prefers the original shared map link over coordinates", () => {
    expect(mapsUri(prop({ mapUrl: "https://maps.app.goo.gl/abc", lat: 13.7, long: 100.5 }))).toBe(
      "https://maps.app.goo.gl/abc",
    );
  });
  it("prefers lat/long coordinates", () => {
    expect(mapsUri(prop({ lat: 13.736, long: 100.523 }))).toBe(
      "https://www.google.com/maps/search/?api=1&query=13.736,100.523",
    );
  });
  it("falls back to a URL-encoded address when there are no coordinates", () => {
    expect(mapsUri(prop({ normalizedAddress: "123 Sukhumvit Rd" }))).toBe(
      "https://www.google.com/maps/search/?api=1&query=123%20Sukhumvit%20Rd",
    );
  });
  it("is undefined when we have neither coordinates nor any address/area/project", () => {
    expect(mapsUri(prop())).toBeUndefined();
  });
});

describe("imageCarouselMessage", () => {
  it("builds an imageCarousel from urls", () => {
    const msg = imageCarouselMessage(["u1", "u2"], "Photos · X");
    expect(msg).toEqual({ type: "imageCarousel", altText: "Photos · X", imageUrls: ["u1", "u2"] });
  });
  it("falls back to friendly text when there are no photos", () => {
    const msg = imageCarouselMessage([], "Photos · X");
    expect(msg.type).toBe("text");
  });
});

describe("text views", () => {
  it("provides help, search-prompt, and upcoming empty-state copy", () => {
    expect(helpMessage().type).toBe("text");
    expect(searchPromptMessage().type).toBe("text");
    expect(upcomingEmptyMessage().type).toBe("text");
  });
});

describe("mergePromptQuickReplies", () => {
  it("offers up to 3 merge choices plus keep-separate", () => {
    const chips = mergePromptQuickReplies("new-1", [
      { id: "c1", label: "Thonglor plot" },
      { id: "c2", label: "Sukhumvit condo" },
      { id: "c3", label: "Rama 9 land" },
      { id: "c4", label: "Extra" },
    ]);
    expect(chips).toHaveLength(4); // 3 merges + keep
    expect(chips[0]?.label).toBe("Merge → Thonglor plot");
    const merge = decodePostback(chips[0]?.data ?? "");
    expect(merge.action).toBe("merge");
    expect(merge.params.get("from")).toBe("new-1");
    expect(merge.params.get("into")).toBe("c1");
    const keep = decodePostback(chips[3]?.data ?? "");
    expect(keep.action).toBe("keep");
    expect(keep.params.get("id")).toBe("new-1");
  });

  it("offers just keep-separate when there are no candidates", () => {
    const chips = mergePromptQuickReplies("new-1", []);
    expect(chips).toHaveLength(1);
    expect(decodePostback(chips[0]?.data ?? "").action).toBe("keep");
  });
});
