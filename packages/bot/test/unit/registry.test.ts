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
});
