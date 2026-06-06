import { describe, expect, it } from "vitest";
import type { IncomingMessage } from "../../src/core/domain/message.js";
import { EchoHandler } from "../../src/core/handlers/echoHandler.js";
import {
  CompositeMessageHandler,
  createDefaultMessageHandler,
} from "../../src/core/handlers/registry.js";
import type { MessageHandler } from "../../src/core/ports/messageHandler.js";

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

describe("EchoHandler", () => {
  const handler = new EchoHandler();

  it("echoes text straight back", async () => {
    expect(await handler.handle(msg({ text: "hi there" }))).toEqual([
      { type: "text", text: "hi there" },
    ]);
  });

  it("ignores non-text content", async () => {
    expect(await handler.handle(msg({ contentType: "sticker", text: undefined }))).toEqual([]);
  });

  it("ignores empty text", async () => {
    expect(await handler.handle(msg({ text: "" }))).toEqual([]);
  });
});

describe("CompositeMessageHandler", () => {
  it("returns the first non-empty handler result", async () => {
    const silent: MessageHandler = { handle: async () => [] };
    const loud: MessageHandler = { handle: async () => [{ type: "text", text: "from loud" }] };
    const composite = new CompositeMessageHandler([silent, loud]);
    expect(await composite.handle(msg())).toEqual([{ type: "text", text: "from loud" }]);
  });

  it("returns nothing when all handlers are silent", async () => {
    const silent: MessageHandler = { handle: async () => [] };
    const composite = new CompositeMessageHandler([silent, silent]);
    expect(await composite.handle(msg())).toEqual([]);
  });

  it("default handler echoes text", async () => {
    expect(await createDefaultMessageHandler().handle(msg({ text: "yo" }))).toEqual([
      { type: "text", text: "yo" },
    ]);
  });
});
