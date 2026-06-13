import { describe, expect, it } from "vitest";
import { CompositeCatalogRepository } from "../../src/adapters/compositeCatalogRepository.js";
import { FakeCatalog } from "../fixtures/fakeCatalog.js";

const USER = "Ualice";
const CONV_A = "group#A";
const CONV_B = "group#B";

describe("CompositeCatalogRepository", () => {
  it("listPropertiesForUser stitches DynamoDB membership to Postgres listings", async () => {
    // Membership lives only on the conversation store; listings live only on the property store —
    // proving the composite reads each from the right side.
    const conversations = new FakeCatalog().seedMembership(USER, CONV_A);
    const properties = new FakeCatalog().seedProperty({ propertyId: "p1" }).seedEdge(CONV_A, "p1");
    const composite = new CompositeCatalogRepository(conversations, properties);

    const result = await composite.listPropertiesForUser(USER);
    expect(result.map((p) => p.propertyId)).toEqual(["p1"]);
  });

  it("dedups a property reachable through two conversations", async () => {
    const conversations = new FakeCatalog()
      .seedMembership(USER, CONV_A)
      .seedMembership(USER, CONV_B);
    const properties = new FakeCatalog()
      .seedProperty({ propertyId: "shared" })
      .seedEdge(CONV_A, "shared")
      .seedEdge(CONV_B, "shared");
    const composite = new CompositeCatalogRepository(conversations, properties);

    const result = await composite.listPropertiesForUser(USER);
    expect(result.map((p) => p.propertyId)).toEqual(["shared"]);
  });

  it("routes conversation ops to the conversation store and property ops to the property store", async () => {
    const conversations = new FakeCatalog().seedMembership(USER, CONV_A);
    const properties = new FakeCatalog().seedProperty({ propertyId: "p9" });
    const composite = new CompositeCatalogRepository(conversations, properties);

    expect(await composite.listUserConversations(USER)).toEqual([CONV_A]);
    expect((await composite.getProperty("p9"))?.propertyId).toBe("p9");
    // A property only on the conversation-store side is NOT found (reads go to the property store).
    conversations.seedProperty({ propertyId: "wrong" });
    expect(await composite.getProperty("wrong")).toBeNull();
  });
});
