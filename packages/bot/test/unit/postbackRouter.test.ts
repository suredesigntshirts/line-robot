import { describe, expect, it } from "vitest";
import type { ConversationRef } from "../../src/core/domain/conversation.js";
import { CatalogAssistant } from "../../src/core/handlers/catalogAssistant.js";
import { ACTIONS, encodePostback } from "../../src/core/handlers/commands.js";
import { CatalogPostbackRouter } from "../../src/core/handlers/postbackRouter.js";
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

  it("routes view to a property's detail", async () => {
    const catalog = new FakeCatalog().seedProperty({
      propertyId: "p1",
      normalizedAddress: "9 Rama IX",
    });
    const out = await routerWith(catalog).route({
      ref: DM,
      data: encodePostback(ACTIONS.view, { id: "p1" }),
    });
    expect(textOf(out[0])).toContain("9 Rama IX");
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
});
