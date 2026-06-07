import { describe, expect, it } from "vitest";
import type { Property } from "../../src/core/domain/catalog.js";
import { CatalogAssistant } from "../../src/core/handlers/catalogAssistant.js";
import { FakeCatalog } from "../fixtures/fakeCatalog.js";
import { textOf } from "../fixtures/outbound.js";

const clock = { now: () => 1_000_000 };

function prop(id: string, over: Partial<Property> = {}): Property {
  return { propertyId: id, ...over };
}

/** Seed a user with membership + edges so listPropertiesForUser resolves the given properties. */
function seedUserListings(
  catalog: FakeCatalog,
  userId: string,
  convKey: string,
  props: Property[],
) {
  catalog.seedMembership(userId, convKey);
  for (const p of props) {
    catalog.seedProperty(p).seedEdge(convKey, p.propertyId);
  }
}

describe("CatalogAssistant — retrieval", () => {
  it("lists a user's properties most-recently-active first", async () => {
    const catalog = new FakeCatalog();
    seedUserListings(catalog, "U1", "user#U1", [
      prop("old", { normalizedAddress: "Old", lastActivityAt: 100 }),
      prop("new", { normalizedAddress: "New", lastActivityAt: 900 }),
    ]);
    const assistant = new CatalogAssistant(catalog, clock);

    const [msg] = await assistant.myListings("U1");
    expect(msg?.type).toBe("flex");
    if (msg?.type === "flex") {
      expect(msg.cards.map((c) => c.title)).toEqual(["New", "Old"]);
    }
  });

  it("returns an empty-state when the user has no listings", async () => {
    const assistant = new CatalogAssistant(new FakeCatalog(), clock);
    const [msg] = await assistant.myListings("nobody");
    expect(textOf(msg)).toContain("don't have any saved listings");
  });

  it("presigns a hero image for listings with photos, and none without a signer", async () => {
    const catalog = new FakeCatalog();
    seedUserListings(catalog, "U1", "user#U1", [
      prop("withPhoto", { normalizedAddress: "1 Sukhumvit", photos: ["conv/x/1/content"] }),
      prop("noPhoto", { normalizedAddress: "2 Rama IX", lastActivityAt: -1 }),
    ]);
    const signer = { presignGet: async (key: string) => `signed:${key}` };

    const [withSigner] = await new CatalogAssistant(catalog, clock, undefined, signer).myListings(
      "U1",
    );
    if (withSigner?.type !== "flex") {
      throw new Error("expected a flex carousel");
    }
    expect(withSigner.cards[0]?.heroImageUrl).toBe("signed:conv/x/1/content"); // withPhoto sorts first
    expect(withSigner.cards[1]?.heroImageUrl).toBeUndefined(); // noPhoto

    const [noSigner] = await new CatalogAssistant(catalog, clock).myListings("U1");
    if (noSigner?.type === "flex") {
      expect(noSigner.cards[0]?.heroImageUrl).toBeUndefined(); // no signer → no heroes
    }
  });

  it("filters listings by road/area query", async () => {
    const catalog = new FakeCatalog();
    seedUserListings(catalog, "U1", "user#U1", [
      prop("a", { normalizedAddress: "10 Sukhumvit Rd", lastActivityAt: 2 }),
      prop("b", { projectName: "Thonglor Heights", lastActivityAt: 1 }),
    ]);
    const assistant = new CatalogAssistant(catalog, clock);

    const [hit] = await assistant.listingsOnRoad("U1", "sukhumvit");
    if (hit?.type === "flex") {
      expect(hit.cards.map((c) => c.title)).toEqual(["10 Sukhumvit Rd"]);
    }
    const [miss] = await assistant.listingsOnRoad("U1", "rama 9");
    expect(textOf(miss)).toContain("No listings matching");
  });

  it("shows property detail as a rich flex card, or an explanation when it's gone", async () => {
    const catalog = new FakeCatalog().seedProperty(prop("p1", { normalizedAddress: "1 Rama IX" }));
    const assistant = new CatalogAssistant(catalog, clock);

    const [detail] = await assistant.viewProperty("p1");
    expect(detail?.type).toBe("flex");
    if (detail?.type === "flex") {
      expect(detail.cards[0]?.title).toBe("1 Rama IX");
    }
    expect(textOf((await assistant.viewProperty("missing"))[0])).toContain("couldn't find");
  });

  it("presigns all photos for the detail hero/count and the photo gallery", async () => {
    const catalog = new FakeCatalog().seedProperty(
      prop("p1", { normalizedAddress: "1 Rama IX", photos: ["a.jpg", "b.jpg", "c.jpg"] }),
    );
    const signer = { presignGet: async (key: string) => `signed:${key}` };
    const assistant = new CatalogAssistant(catalog, clock, undefined, signer);

    const [detail] = await assistant.viewProperty("p1");
    if (detail?.type === "flex") {
      expect(detail.cards[0]?.heroImageUrl).toBe("signed:a.jpg");
      // 3 photos → the "Photos (3)" button is present.
      expect(detail.cards[0]?.actions.map((a) => a.label)).toContain("🖼 Photos (3)");
    }

    const [gallery] = await assistant.showPhotos("p1");
    expect(gallery?.type).toBe("imageCarousel");
    if (gallery?.type === "imageCarousel") {
      expect(gallery.imageUrls).toEqual(["signed:a.jpg", "signed:b.jpg", "signed:c.jpg"]);
    }
  });

  it("renders no hero/Photos button and an empty gallery without a signer", async () => {
    const catalog = new FakeCatalog().seedProperty(
      prop("p1", { normalizedAddress: "1 Rama IX", photos: ["a.jpg", "b.jpg"] }),
    );
    const assistant = new CatalogAssistant(catalog, clock); // no signer

    const [detail] = await assistant.viewProperty("p1");
    if (detail?.type === "flex") {
      expect(detail.cards[0]?.heroImageUrl).toBeUndefined();
      expect(detail.cards[0]?.actions.map((a) => a.label)).not.toContain("🖼 Photos (2)");
    }
    const [gallery] = await assistant.showPhotos("p1");
    expect(gallery?.type).toBe("text"); // friendly "no photos" fallback
  });

  it("returns help and search-prompt copy", () => {
    const assistant = new CatalogAssistant(new FakeCatalog(), clock);
    expect(assistant.help()[0]?.type).toBe("text");
    expect(assistant.searchPrompt()[0]?.type).toBe("text");
  });

  it("shows an empty upcoming list, then lists follow-ups soonest-first", async () => {
    const catalog = new FakeCatalog()
      .seedProperty(prop("p1", { normalizedAddress: "1 Rama IX" }))
      .seedEdge("user#U1", "p1")
      .seedMembership("U1", "user#U1");
    const assistant = new CatalogAssistant(catalog, clock);

    expect(textOf((await assistant.upcoming("U1"))[0])).toContain("No upcoming follow-ups");

    await catalog.addEvent({
      eventId: "e1",
      propertyId: "p1",
      dueAt: Date.parse("2026-06-10T07:30:00Z"), // 14:30 ICT
      notifyConversationKey: "user#U1",
    });
    const [list] = await assistant.upcoming("U1");
    expect(textOf(list)).toContain("Upcoming follow-ups");
    expect(textOf(list)).toContain("1 Rama IX");
  });

  it("sets a follow-up from a datetime pick and rejects a past time", async () => {
    const catalog = new FakeCatalog().seedProperty(prop("p1", { normalizedAddress: "1 Rama IX" }));
    const modernClock = { now: () => Date.parse("2026-06-07T00:00:00Z") };
    const assistant = new CatalogAssistant(catalog, modernClock, () => "evt-1");

    const [ok] = await assistant.setFollowUp("user#U1", "p1", "2026-06-10T09:00");
    expect(textOf(ok)).toContain("Follow-up set");
    expect((await catalog.listPropertyEvents("p1"))[0]?.eventId).toBe("evt-1");

    const [past] = await assistant.setFollowUp("user#U1", "p1", "2020-01-01T09:00");
    expect(textOf(past)).toContain("already passed");
  });
});

describe("CatalogAssistant — merge", () => {
  it("folds a new property into an existing one and removes the new row + its edge", async () => {
    const catalog = new FakeCatalog();
    const convKey = "group#G";
    // Existing target (a prior candidate) + a just-created ambiguous property, both edged here.
    catalog
      .seedProperty(
        prop("into", {
          normalizedAddress: "Thonglor plot",
          createdAt: 1,
          originConversationKey: convKey,
        }),
      )
      .seedEdge(convKey, "into")
      .seedProperty(
        prop("from", {
          normalizedAddress: "Thonglor plot (new)",
          askingPrice: 9_000_000,
          currency: "THB",
        }),
      )
      .seedEdge(convKey, "from");

    const assistant = new CatalogAssistant(catalog, clock);
    const [msg] = await assistant.mergeNewInto(convKey, "from", "into");

    expect(textOf(msg)).toContain("Merged into Thonglor plot"); // names the target the user chose
    // `from` is gone; its edge is removed; `into` carries the merged fields + preserved origin.
    expect(catalog.properties.has("from")).toBe(false);
    expect(catalog.convProps.get(convKey)?.has("from")).toBe(false);
    const into = catalog.properties.get("into");
    expect(into?.askingPrice).toBe(9_000_000); // merged from `from`
    expect(into?.normalizedAddress).toBe("Thonglor plot (new)"); // newer extraction wins
    expect(into?.createdAt).toBe(1); // origin preserved (not clobbered)
    expect(into?.updatedAt).toBe(1_000_000);
  });

  it("is a no-op confirmation if the new property was already merged (double tap)", async () => {
    const catalog = new FakeCatalog().seedProperty(prop("into", { normalizedAddress: "Target" }));
    const assistant = new CatalogAssistant(catalog, clock);
    const [msg] = await assistant.mergeNewInto("group#G", "gone", "into");
    expect(textOf(msg)).toContain("Already merged into Target");
  });

  it("explains when the merge target is missing", async () => {
    const catalog = new FakeCatalog().seedProperty(prop("from", { normalizedAddress: "New" }));
    const assistant = new CatalogAssistant(catalog, clock);
    const [msg] = await assistant.mergeNewInto("group#G", "from", "missing");
    expect(textOf(msg)).toContain("couldn't find the listing to merge into");
    expect(catalog.properties.has("from")).toBe(true); // nothing deleted on failure
  });

  it("keepSeparate acknowledges without changing data", () => {
    const assistant = new CatalogAssistant(new FakeCatalog(), clock);
    expect(textOf(assistant.keepSeparate()[0])).toContain("separate listing");
  });
});
