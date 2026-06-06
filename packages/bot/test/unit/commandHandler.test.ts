import { describe, expect, it } from "vitest";
import type { ConversationRef } from "../../src/core/domain/conversation.js";
import type { IncomingMessage } from "../../src/core/domain/message.js";
import { CatalogAssistant } from "../../src/core/handlers/catalogAssistant.js";
import { CommandHandler } from "../../src/core/handlers/commandHandler.js";
import { FakeCatalog } from "../fixtures/fakeCatalog.js";
import { textOf } from "../fixtures/outbound.js";

const clock = { now: () => 1 };

function handlerWith(catalog = new FakeCatalog()): CommandHandler {
  return new CommandHandler(new CatalogAssistant(catalog, clock));
}

function msg(text: string, ref: ConversationRef = { kind: "user", userId: "U1" }): IncomingMessage {
  return {
    ref,
    messageId: "m1",
    contentType: "text",
    text,
    webhookEventId: "e1",
    timestamp: 1,
    replyToken: "r1",
  };
}

describe("CommandHandler", () => {
  it("returns nothing for ordinary chat (so it falls through to ingestion)", async () => {
    expect(await handlerWith().handle(msg("this 2-bed condo is 5.5M near BTS"))).toEqual([]);
    expect(await handlerWith().handle(msg("", { kind: "user", userId: "U1" }))).toEqual([]);
  });

  it("answers 'my listings' with the user's catalog", async () => {
    const catalog = new FakeCatalog();
    catalog.seedMembership("U1", "user#U1");
    catalog
      .seedProperty({ propertyId: "p1", normalizedAddress: "1 Sukhumvit" })
      .seedEdge("user#U1", "p1");

    const [out] = await handlerWith(catalog).handle(msg("my listings"));
    expect(out?.type).toBe("flex");
    if (out?.type === "flex") {
      expect(out.cards[0]?.title).toBe("1 Sukhumvit");
    }
  });

  it("routes 'on <road>' to a filtered search", async () => {
    const catalog = new FakeCatalog();
    catalog.seedMembership("U1", "user#U1");
    catalog
      .seedProperty({ propertyId: "p1", normalizedAddress: "9 Thonglor" })
      .seedEdge("user#U1", "p1");

    const [out] = await handlerWith(catalog).handle(msg("on Thonglor"));
    expect(out?.type).toBe("flex");
  });

  it("answers upcoming and help with text", async () => {
    expect(textOf((await handlerWith().handle(msg("upcoming")))[0])).toContain("No upcoming");
    expect((await handlerWith().handle(msg("help")))[0]?.type).toBe("text");
  });

  it("explains when it can't identify the sender of a listings command", async () => {
    const [out] = await handlerWith().handle(msg("my listings", { kind: "group", groupId: "G" }));
    expect(textOf(out)).toContain("couldn't tell who you are");
  });
});
