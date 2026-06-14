import { describe, expect, it } from "vitest";
import type { ConversationRef } from "../../src/core/domain/conversation.js";
import { CatalogAssistant } from "../../src/core/handlers/catalogAssistant.js";
import { ACTIONS, encodePostback } from "../../src/core/handlers/commands.js";
import { CatalogPostbackRouter } from "../../src/core/handlers/postbackRouter.js";
import type { ReleaseDecider } from "../../src/core/handlers/releaseDecider.js";
import { FakeCatalog } from "../fixtures/fakeCatalog.js";
import { textOf } from "../fixtures/outbound.js";

const clock = { now: () => 5 };
const DM: ConversationRef = { kind: "user", userId: "U1" };

function routerWith(catalog = new FakeCatalog()): CatalogPostbackRouter {
  return new CatalogPostbackRouter(new CatalogAssistant(catalog, clock));
}

describe("CatalogPostbackRouter", () => {
  it("routes listings to the user's catalog", async () => {
    const catalog = new FakeCatalog();
    catalog.seedMembership("U1", "user#U1");
    catalog
      .seedProperty({ propertyId: "p1", normalizedAddress: "1 Sukhumvit" })
      .seedEdge("user#U1", "p1");

    const out = await routerWith(catalog).route({
      ref: DM,
      data: encodePostback(ACTIONS.listings),
    });
    expect(out[0]?.type).toBe("flex");
  });

  it("routes view to a property's detail (rich flex card)", async () => {
    const catalog = new FakeCatalog().seedProperty({
      propertyId: "p1",
      normalizedAddress: "9 Rama IX",
    });
    const out = await routerWith(catalog).route({
      ref: DM,
      data: encodePostback(ACTIONS.view, { id: "p1" }),
    });
    expect(out[0]?.type).toBe("flex");
    if (out[0]?.type === "flex") {
      expect(out[0].cards[0]?.title).toBe("9 Rama IX");
    }
  });

  it("routes photos to an image carousel of the property's photos", async () => {
    const catalog = new FakeCatalog().seedProperty({
      propertyId: "p1",
      normalizedAddress: "9 Rama IX",
      photos: [
        { s3Key: "a.jpg", kind: "property" },
        { s3Key: "b.jpg", kind: "property" },
      ],
    });
    const signer = { presignGet: async (k: string) => `https://signed.example/${k}` };
    const router = new CatalogPostbackRouter(
      new CatalogAssistant(catalog, clock, undefined, signer),
    );
    const out = await router.route({ ref: DM, data: encodePostback(ACTIONS.photos, { id: "p1" }) });
    expect(out[0]?.type).toBe("imageCarousel");
    if (out[0]?.type === "imageCarousel") {
      expect(out[0].imageUrls).toEqual([
        "https://signed.example/a.jpg",
        "https://signed.example/b.jpg",
      ]);
    }
  });

  it("routes delete to a confirm prompt, and deleteConfirm to an actual delete", async () => {
    const catalog = new FakeCatalog()
      .seedProperty({ propertyId: "p1", normalizedAddress: "9 Rama IX" })
      .seedEdge("user#U1", "p1");

    const prompt = await routerWith(catalog).route({
      ref: DM,
      data: encodePostback(ACTIONS.delete, { id: "p1" }),
    });
    expect(textOf(prompt[0])).toContain("Delete");
    expect(catalog.properties.has("p1")).toBe(true); // not yet deleted

    const done = await routerWith(catalog).route({
      ref: DM,
      data: encodePostback(ACTIONS.deleteConfirm, { id: "p1" }),
    });
    expect(textOf(done[0])).toContain("Deleted");
    expect(catalog.properties.has("p1")).toBe(false);
  });

  it("routes search, upcoming, and help to text", async () => {
    const router = routerWith();
    expect((await router.route({ ref: DM, data: encodePostback(ACTIONS.search) }))[0]?.type).toBe(
      "text",
    );
    expect(
      textOf((await router.route({ ref: DM, data: encodePostback(ACTIONS.upcoming) }))[0]),
    ).toContain("No upcoming");
    expect((await router.route({ ref: DM, data: encodePostback(ACTIONS.help) }))[0]?.type).toBe(
      "text",
    );
  });

  it("resolves a merge confirmation by folding the new property into the chosen one", async () => {
    const catalog = new FakeCatalog();
    const convKey = "user#U1";
    catalog
      .seedProperty({ propertyId: "into", normalizedAddress: "Thonglor plot" })
      .seedEdge(convKey, "into")
      .seedProperty({
        propertyId: "new",
        normalizedAddress: "Thonglor (new)",
        askingPrice: 9_000_000,
      })
      .seedEdge(convKey, "new");

    const out = await routerWith(catalog).route({
      ref: DM,
      data: encodePostback(ACTIONS.merge, { from: "new", into: "into" }),
    });
    expect(textOf(out[0])).toContain("Merged into Thonglor plot");
    expect(catalog.properties.has("new")).toBe(false);
    expect(catalog.properties.get("into")?.askingPrice).toBe(9_000_000);
  });

  it("sets a follow-up from a datetime-picker postback, ignoring one with no datetime", async () => {
    const catalog = new FakeCatalog().seedProperty({
      propertyId: "p1",
      normalizedAddress: "1 Sukhumvit",
    });
    const out = await routerWith(catalog).route({
      ref: DM,
      data: encodePostback(ACTIONS.setFollowUp, { id: "p1" }),
      params: { datetime: "2999-06-10T09:00" },
    });
    expect(textOf(out[0])).toContain("Follow-up set");
    expect(await catalog.listPropertyEvents("p1")).toHaveLength(1);

    // No datetime param (e.g. the user dismissed the picker) → nothing happens.
    const none = await routerWith(catalog).route({
      ref: DM,
      data: encodePostback(ACTIONS.setFollowUp, { id: "p1" }),
    });
    expect(none).toEqual([]);
  });

  it("acknowledges keep-separate and ignores an unknown/garbled action", async () => {
    const router = routerWith();
    expect(
      textOf((await router.route({ ref: DM, data: encodePostback(ACTIONS.keep, { id: "x" }) }))[0]),
    ).toContain("separate");
    expect(await router.route({ ref: DM, data: "action=bogus" })).toEqual([]);
    expect(
      await router.route({ ref: DM, data: encodePostback(ACTIONS.merge, { from: "x" }) }),
    ).toEqual([]); // missing `into`
  });

  it("explains when it can't identify the user for a listings tap", async () => {
    const out = await routerWith().route({
      ref: { kind: "group", groupId: "G" },
      data: encodePostback(ACTIONS.listings),
    });
    expect(textOf(out[0])).toContain("couldn't tell who you are");
  });

  // Stage 6 (D-S6-4) — the three release-prompt decisions delegate to the (optional) ReleaseDecider,
  // passing the caller's LINE user id + the listing id. A fake decider records the dispatch. The router
  // only calls the three methods, so the fake is cast through `unknown` to the ReleaseDecider port.
  describe("release-prompt decisions (Stage 6)", () => {
    function fakeDecider() {
      const calls: Array<{ method: string; lineUserId: string; listingId: string }> = [];
      const mk = (method: string) => async (lineUserId: string, listingId: string) => {
        calls.push({ method, lineUserId, listingId });
        return [{ type: "text" as const, text: `${method}-ok` }];
      };
      const decider = {
        releasePublicly: mk("releasePublicly"),
        releaseToOtherGroups: mk("releaseToOtherGroups"),
        extend: mk("extend"),
      } as unknown as ReleaseDecider;
      return { calls, decider };
    }

    it("routes each of the three actions to the matching ReleaseDecider method (caller + listing id)", async () => {
      const { calls, decider } = fakeDecider();
      const router = new CatalogPostbackRouter(
        new CatalogAssistant(new FakeCatalog(), clock),
        decider,
      );

      expect(
        textOf(
          (
            await router.route({
              ref: DM,
              data: encodePostback(ACTIONS.releasePublicly, { id: "L1" }),
            })
          )[0],
        ),
      ).toBe("releasePublicly-ok");
      await router.route({
        ref: DM,
        data: encodePostback(ACTIONS.releaseToOtherGroups, { id: "L2" }),
      });
      await router.route({
        ref: DM,
        data: encodePostback(ACTIONS.extendExclusivity, { id: "L3" }),
      });

      expect(calls).toEqual([
        { method: "releasePublicly", lineUserId: "U1", listingId: "L1" },
        { method: "releaseToOtherGroups", lineUserId: "U1", listingId: "L2" },
        { method: "extend", lineUserId: "U1", listingId: "L3" },
      ]);
    });

    it("no-ops a release postback when no ReleaseDecider is wired (Stage-6 flow off)", async () => {
      // routerWith() builds a router with no decider.
      expect(
        await routerWith().route({
          ref: DM,
          data: encodePostback(ACTIONS.releasePublicly, { id: "L1" }),
        }),
      ).toEqual([]);
    });

    it("no-ops a release postback with no listing id", async () => {
      const { decider } = fakeDecider();
      const router = new CatalogPostbackRouter(
        new CatalogAssistant(new FakeCatalog(), clock),
        decider,
      );
      expect(
        await router.route({ ref: DM, data: encodePostback(ACTIONS.releasePublicly) }),
      ).toEqual([]);
    });
  });
});
