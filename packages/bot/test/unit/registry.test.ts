import { describe, expect, it } from "vitest";
import type { IncomingMessage } from "../../src/core/domain/message.js";
import {
  CompositeMessageHandler,
  createDefaultMessageHandler,
} from "../../src/core/handlers/registry.js";
import type { MessageHandler } from "../../src/core/ports/messageHandler.js";
import { FakeCatalog } from "../fixtures/fakeCatalog.js";

function msg(partial: Partial<IncomingMessage> = {}): IncomingMessage {
  return {
    ref: { kind: "user", userId: "U1" },
    messageId: "m1",
    contentType: "text",
    text: "hello",
    webhookEventId: "e1",
    timestamp: 1,
    replyToken: "r1",
    ...partial,
  };
}

describe("CompositeMessageHandler", () => {
  it("returns the first non-empty handler result", async () => {
    const silent: MessageHandler = { handle: async () => [] };
    const loud: MessageHandler = { handle: async () => [{ type: "text", text: "from loud" }] };
    const composite = new CompositeMessageHandler([silent, loud]);
    expect(await composite.handle(msg())).toEqual([{ type: "text", text: "from loud" }]);
  });

  it("returns nothing when all handlers are silent", async () => {
    const silent: MessageHandler = { handle: async () => [] };
    expect(await new CompositeMessageHandler([silent, silent]).handle(msg())).toEqual([]);
  });
});

describe("createDefaultMessageHandler", () => {
  it("wires a working catalog command handler", async () => {
    const catalog = new FakeCatalog();
    catalog.seedMembership("U1", "user#U1");
    catalog
      .seedProperty({ propertyId: "p1", normalizedAddress: "1 Sukhumvit" })
      .seedEdge("user#U1", "p1");
    const handler = createDefaultMessageHandler({ catalog, clock: { now: () => 1 } });

    expect((await handler.handle(msg({ text: "my listings" })))[0]?.type).toBe("flex");
    expect(await handler.handle(msg({ text: "just chatting about nothing" }))).toEqual([]);
  });

  it("appends the edit-reply handler only when an extractor is provided", async () => {
    const catalog = new FakeCatalog().seedProperty({ propertyId: "p1", askingPrice: 1 });
    await catalog.armEdit("user#U1", "p1", 1);
    const extractor = {
      extract: async () => ({
        properties: [
          {
            existingPropertyId: "p1",
            ambiguous: false,
            ambiguousWith: null,
            normalizedAddress: null,
            rawAddress: null,
            projectName: null,
            lat: null,
            long: null,
            district: null,
            subdistrict: null,
            province: null,
            propertyType: null,
            status: "negotiating",
            askingPrice: null,
            currency: null,
            tags: null,
            bedrooms: null,
            bathrooms: null,
            usableAreaSqm: null,
            landArea: null,
            floors: null,
            furnishing: null,
            notes: null,
            listingType: null,
            rentPrice: null,
            contact: null,
            source: null,
          },
        ],
      }),
    };

    // Without an extractor, an armed reply just falls through (no edit handler in the chain).
    const noExtractor = createDefaultMessageHandler({ catalog, clock: { now: () => 1 } });
    expect(await noExtractor.handle(msg({ text: "we're negotiating now" }))).toEqual([]);

    // With one, the edit lands and is confirmed.
    const withExtractor = createDefaultMessageHandler({
      catalog,
      clock: { now: () => 1 },
      extractor,
    });
    const out = await withExtractor.handle(msg({ text: "we're negotiating now" }));
    expect(out[0]?.type).toBe("text");
    expect(catalog.properties.get("p1")?.status).toBe("negotiating");
  });
});
