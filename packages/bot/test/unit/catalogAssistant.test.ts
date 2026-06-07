import { describe, expect, it } from "vitest";
import type { Property } from "../../src/core/domain/catalog.js";
import { CatalogAssistant } from "../../src/core/handlers/catalogAssistant.js";
import { FakeCatalog } from "../fixtures/fakeCatalog.js";
import { textOf } from "../fixtures/outbound.js";

const clock = { now: () => 1_000_000 };

/** A logger spy that records every warn call for assertion. */
function spyLogger() {
  const warns: Array<{ msg: string; ctx?: Record<string, unknown> }> = [];
  return {
    warns,
    info() {},
    warn(msg: string, ctx?: Record<string, unknown>) {
      warns.push({ msg, ctx });
    },
    error() {},
  };
}

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
      prop("withPhoto", {
        normalizedAddress: "1 Sukhumvit",
        photos: [{ s3Key: "conv/x/1/content", kind: "property" }],
      }),
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
      prop("p1", {
        normalizedAddress: "1 Rama IX",
        photos: [
          { s3Key: "a.jpg", kind: "property" },
          { s3Key: "b.jpg", kind: "property" },
          { s3Key: "c.jpg", kind: "property" },
        ],
      }),
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

  it("orders the gallery property → chanote → other and heroes the first property photo", async () => {
    const catalog = new FakeCatalog().seedProperty(
      prop("p1", {
        normalizedAddress: "1 Rama IX",
        photos: [
          { s3Key: "doc.jpg", kind: "other" },
          { s3Key: "deed.jpg", kind: "chanote" },
          { s3Key: "house.jpg", kind: "property" },
        ],
      }),
    );
    const signer = { presignGet: async (key: string) => `signed:${key}` };
    const assistant = new CatalogAssistant(catalog, clock, undefined, signer);

    const [detail] = await assistant.viewProperty("p1");
    if (detail?.type === "flex") {
      expect(detail.cards[0]?.heroImageUrl).toBe("signed:house.jpg"); // property photo, not the doc
    }
    const [gallery] = await assistant.showPhotos("p1");
    if (gallery?.type === "imageCarousel") {
      expect(gallery.imageUrls).toEqual(["signed:house.jpg", "signed:deed.jpg", "signed:doc.jpg"]);
    }
  });

  it("renders no hero/Photos button and an empty gallery without a signer", async () => {
    const catalog = new FakeCatalog().seedProperty(
      prop("p1", {
        normalizedAddress: "1 Rama IX",
        photos: [
          { s3Key: "a.jpg", kind: "property" },
          { s3Key: "b.jpg", kind: "property" },
        ],
      }),
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

  it("warns and drops the hero when a property's presign throws, keeping the others", async () => {
    const catalog = new FakeCatalog();
    seedUserListings(catalog, "U1", "user#U1", [
      prop("good", {
        normalizedAddress: "1 Good Rd",
        lastActivityAt: 2,
        photos: [{ s3Key: "good/hero.jpg", kind: "property" }],
      }),
      prop("bad", {
        normalizedAddress: "2 Boom Rd",
        lastActivityAt: 1,
        photos: [{ s3Key: "bad/boom.jpg", kind: "property" }],
      }),
    ]);
    const signer = {
      presignGet: async (key: string) => {
        if (key.includes("boom")) throw new Error("presign failed");
        return `signed:${key}`;
      },
    };
    const logger = spyLogger();

    const [msg] = await new CatalogAssistant(catalog, clock, undefined, signer, logger).myListings(
      "U1",
    );
    if (msg?.type !== "flex") throw new Error("expected a flex carousel");
    expect(msg.cards[0]?.heroImageUrl).toBe("signed:good/hero.jpg"); // good survives
    expect(msg.cards[1]?.heroImageUrl).toBeUndefined(); // bad dropped
    expect(logger.warns).toHaveLength(1);
    expect(logger.warns[0]?.ctx).toMatchObject({ propertyId: "bad", s3Key: "bad/boom.jpg" });
  });

  it("warns once per failed photo in the gallery and drops only the bad ones", async () => {
    const catalog = new FakeCatalog().seedProperty(
      prop("p1", {
        normalizedAddress: "1 Rama IX",
        photos: [
          { s3Key: "ok.jpg", kind: "property" },
          { s3Key: "boom.jpg", kind: "property" },
        ],
      }),
    );
    const signer = {
      presignGet: async (key: string) => {
        if (key.includes("boom")) throw new Error("presign failed");
        return `signed:${key}`;
      },
    };
    const logger = spyLogger();
    const assistant = new CatalogAssistant(catalog, clock, undefined, signer, logger);

    const [gallery] = await assistant.showPhotos("p1");
    if (gallery?.type !== "imageCarousel") throw new Error("expected an image carousel");
    expect(gallery.imageUrls).toEqual(["signed:ok.jpg"]); // boom dropped
    expect(logger.warns).toHaveLength(1);
    expect(logger.warns[0]?.ctx).toMatchObject({ propertyId: "p1", s3Key: "boom.jpg" });
  });

  it("arms an edit context for the conversation only when a conversationKey is given", async () => {
    const catalog = new FakeCatalog().seedProperty(prop("p1", { normalizedAddress: "1 Rama IX" }));
    const assistant = new CatalogAssistant(catalog, clock);

    await assistant.viewProperty("p1"); // no convKey (e.g. a unit call) → nothing armed
    expect(await catalog.getEditContext("user#U1")).toBeNull();

    await assistant.viewProperty("p1", "user#U1");
    expect(await catalog.getEditContext("user#U1")).toEqual({
      propertyId: "p1",
      armedAt: 1_000_000,
    });
  });

  it("deletes a listing: removes its events, edge, property, and any armed edit", async () => {
    const catalog = new FakeCatalog()
      .seedProperty(prop("p1", { normalizedAddress: "1 Rama IX" }))
      .seedEdge("user#U1", "p1")
      .seedEvent({
        eventId: "e1",
        propertyId: "p1",
        dueAt: 1,
        notifyConversationKey: "user#U1",
      });
    await catalog.armEdit("user#U1", "p1", 1);
    const assistant = new CatalogAssistant(catalog, clock);

    // Prompt first (confirmation), then confirm.
    expect(textOf((await assistant.deletePrompt("p1"))[0])).toContain("Delete");
    const [done] = await assistant.deleteListing("user#U1", "p1");
    expect(textOf(done)).toContain("Deleted");
    expect(catalog.properties.has("p1")).toBe(false);
    expect(await catalog.listPropertyEvents("p1")).toEqual([]);
    expect(await catalog.listConversationProperties("user#U1")).not.toContain("p1");
    expect(await catalog.getEditContext("user#U1")).toBeNull();
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
