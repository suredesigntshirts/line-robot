import { describe, expect, it } from "vitest";
import type { Property } from "../../src/core/domain/catalog.js";
import { decodePostback } from "../../src/core/handlers/commands.js";
import {
  formatPrice,
  helpMessage,
  listingsMessage,
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

describe("text views", () => {
  it("renders a property detail with the salient fields", () => {
    const msg = propertyDetail(
      prop({
        normalizedAddress: "123 Sukhumvit",
        askingPrice: 6_000_000,
        status: "visited",
        tags: ["near-bts"],
      }),
    );
    expect(msg.type).toBe("text");
    if (msg.type === "text") {
      expect(msg.text).toContain("123 Sukhumvit");
      expect(msg.text).toContain("฿6,000,000");
      expect(msg.text).toContain("visited");
      expect(msg.text).toContain("near-bts");
    }
  });

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
