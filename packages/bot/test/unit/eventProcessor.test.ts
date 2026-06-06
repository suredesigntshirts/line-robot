import { describe, expect, it } from "vitest";
import { EventProcessor, type EventProcessorDeps } from "../../src/app/eventProcessor.js";
import type { ConversationRef } from "../../src/core/domain/conversation.js";
import type { OutboundMessage, StoredMessage } from "../../src/core/domain/message.js";
import { EchoHandler } from "../../src/core/handlers/echoHandler.js";

interface Spies {
  archived: { id: string; ref: ConversationRef }[];
  saved: StoredMessage[];
  replies: { token: string; messages: OutboundMessage[] }[];
  pushes: { to: string; messages: OutboundMessage[] }[];
  warns: string[];
}

function makeProcessor(opts: { replyThrows?: boolean } = {}) {
  const spies: Spies = { archived: [], saved: [], replies: [], pushes: [], warns: [] };
  const deps: EventProcessorDeps = {
    archive: {
      put: async (id, ref) => {
        spies.archived.push({ id, ref });
      },
    },
    repository: {
      save: async (message) => {
        spies.saved.push(message);
      },
      findRecent: async () => [],
    },
    handler: new EchoHandler(),
    gateway: {
      reply: async (token, messages) => {
        if (opts.replyThrows) {
          throw new Error("reply token expired");
        }
        spies.replies.push({ token, messages });
      },
      push: async (to, messages) => {
        spies.pushes.push({ to, messages });
      },
    },
    logger: {
      info: () => {},
      warn: (message) => {
        spies.warns.push(message);
      },
      error: () => {},
    },
    clock: { now: () => 12345 },
  };
  return { processor: new EventProcessor(deps), spies };
}

function textEvent(
  opts: { id?: string; source?: unknown; replyToken?: string; text?: string } = {},
) {
  return {
    type: "message",
    webhookEventId: opts.id ?? "e1",
    timestamp: 1000,
    source: opts.source ?? { type: "user", userId: "U1" },
    replyToken: opts.replyToken,
    message: { type: "text", id: "m1", text: opts.text ?? "hello" },
  };
}

describe("EventProcessor", () => {
  it("archives, stores, and echoes a 1:1 text message via reply", async () => {
    const { processor, spies } = makeProcessor();
    await processor.process({ webhookEventId: "e1", raw: textEvent({ replyToken: "r" }) });

    expect(spies.archived).toHaveLength(1);
    expect(spies.archived[0]?.ref).toEqual({ kind: "user", userId: "U1" });
    expect(spies.saved.map((m) => m.direction)).toEqual(["in", "out"]);
    expect(spies.saved[1]?.text).toBe("hello");
    expect(spies.replies).toEqual([{ token: "r", messages: [{ type: "text", text: "hello" }] }]);
    expect(spies.pushes).toHaveLength(0);
  });

  it("works in a group chat (group ref preserved)", async () => {
    const { processor, spies } = makeProcessor();
    await processor.process({
      webhookEventId: "e2",
      raw: textEvent({ source: { type: "group", groupId: "Cg", userId: "Us" }, replyToken: "r" }),
    });

    expect(spies.archived[0]?.ref).toEqual({ kind: "group", groupId: "Cg", senderUserId: "Us" });
    expect(spies.replies).toHaveLength(1);
  });

  it("falls back to push when reply fails", async () => {
    const { processor, spies } = makeProcessor({ replyThrows: true });
    await processor.process({ webhookEventId: "e3", raw: textEvent({ replyToken: "r" }) });

    expect(spies.replies).toHaveLength(0);
    expect(spies.pushes).toEqual([{ to: "U1", messages: [{ type: "text", text: "hello" }] }]);
    expect(spies.warns).toHaveLength(1);
  });

  it("ignores non-text content (stores inbound only, no reply)", async () => {
    const { processor, spies } = makeProcessor();
    await processor.process({
      webhookEventId: "e4",
      raw: {
        type: "message",
        webhookEventId: "e4",
        timestamp: 1,
        source: { type: "user", userId: "U1" },
        message: { type: "sticker", id: "m2", stickerId: "1", packageId: "1" },
      },
    });

    expect(spies.archived).toHaveLength(1);
    expect(spies.saved.map((m) => m.direction)).toEqual(["in"]);
    expect(spies.replies).toHaveLength(0);
    expect(spies.pushes).toHaveLength(0);
  });

  it("archives but does not reply to non-message events", async () => {
    const { processor, spies } = makeProcessor();
    await processor.process({
      webhookEventId: "e5",
      raw: {
        type: "join",
        webhookEventId: "e5",
        timestamp: 1,
        source: { type: "group", groupId: "Cg" },
        replyToken: "r",
      },
    });

    expect(spies.archived).toHaveLength(1);
    expect(spies.saved).toHaveLength(0);
    expect(spies.replies).toHaveLength(0);
  });
});
