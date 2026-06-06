import { describe, expect, it } from "vitest";
import { EventProcessor, type EventProcessorDeps } from "../../src/app/eventProcessor.js";
import { type ConversationRef, conversationKey } from "../../src/core/domain/conversation.js";
import type { OutboundMessage, StoredMessage } from "../../src/core/domain/message.js";
import { EchoHandler } from "../../src/core/handlers/echoHandler.js";

interface Spies {
  archived: { id: string; ref: ConversationRef }[];
  media: { messageId: string; contentType: string; size: number }[];
  saved: StoredMessage[];
  touched: { key: string; at: number }[];
  memberships: { uid: string; key: string }[];
  removed: { uid: string; key: string }[];
  contentFetches: string[];
  replies: { token: string; messages: OutboundMessage[] }[];
  pushes: { to: string; messages: OutboundMessage[] }[];
  warns: string[];
}

function makeProcessor(opts: { replyThrows?: boolean; contentThrows?: boolean } = {}) {
  const spies: Spies = {
    archived: [],
    media: [],
    saved: [],
    touched: [],
    memberships: [],
    removed: [],
    contentFetches: [],
    replies: [],
    pushes: [],
    warns: [],
  };
  const deps: EventProcessorDeps = {
    archive: {
      put: async (id, ref) => {
        spies.archived.push({ id, ref });
      },
      putMedia: async (ref, messageId, bytes, contentType) => {
        spies.media.push({ messageId, contentType, size: bytes.length });
        return `conv/${conversationKey(ref)}/${messageId}/content`;
      },
    },
    repository: {
      save: async (message) => {
        spies.saved.push(message);
      },
      findRecent: async () => [],
    },
    catalog: {
      touchConversation: async (key, at) => {
        spies.touched.push({ key, at });
      },
      recordMembership: async (uid, key) => {
        spies.memberships.push({ uid, key });
      },
      removeMembership: async (uid, key) => {
        spies.removed.push({ uid, key });
      },
      findPendingConversations: async () => [],
      claimConversation: async () => null,
      releaseConversation: async () => {},
      getConversation: async () => null,
      listUserConversations: async () => [],
      upsertProperty: async () => {},
      getProperty: async () => null,
      linkConversationProperty: async () => {},
      listConversationProperties: async () => [],
      listPropertiesForUser: async () => [],
    },
    content: {
      getContent: async (id) => {
        spies.contentFetches.push(id);
        if (opts.contentThrows) {
          throw new Error("content expired");
        }
        return Buffer.from("FAKEIMG");
      },
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

function imageEvent(opts: { source?: unknown; messageId?: string } = {}) {
  return {
    type: "message",
    webhookEventId: "e-img",
    timestamp: 2000,
    source: opts.source ?? { type: "group", groupId: "Cg", userId: "Us" },
    replyToken: "r",
    message: { type: "image", id: opts.messageId ?? "img1" },
  };
}

function memberEvent(kind: "memberJoined" | "memberLeft", userId: string) {
  const members = { members: [{ type: "user", userId }] };
  return {
    type: kind,
    webhookEventId: `e-${kind}`,
    timestamp: 3000,
    source: { type: "group", groupId: "Cg" },
    replyToken: kind === "memberJoined" ? "r" : undefined,
    ...(kind === "memberJoined" ? { joined: members } : { left: members }),
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

  it("updates the conversation tracker and sender membership on a message", async () => {
    const { processor, spies } = makeProcessor();
    await processor.process({
      webhookEventId: "e1",
      raw: textEvent({ source: { type: "group", groupId: "Cg", userId: "Us" }, replyToken: "r" }),
    });

    expect(spies.touched).toEqual([{ key: "group#Cg", at: 1000 }]);
    expect(spies.memberships).toEqual([{ uid: "Us", key: "group#Cg" }]);
  });

  it("eagerly captures media to S3 and records the attachment on the message", async () => {
    const { processor, spies } = makeProcessor();
    await processor.process({ webhookEventId: "e-img", raw: imageEvent() });

    expect(spies.contentFetches).toEqual(["img1"]);
    expect(spies.media[0]).toMatchObject({ messageId: "img1", contentType: "image/jpeg" });
    expect(spies.saved[0]?.attachment).toEqual({
      s3Key: "conv/group#Cg/img1/content",
      contentType: "image/jpeg",
    });
  });

  it("stores the message without an attachment if media capture fails", async () => {
    const { processor, spies } = makeProcessor({ contentThrows: true });
    await processor.process({ webhookEventId: "e-img", raw: imageEvent() });

    expect(spies.saved).toHaveLength(1);
    expect(spies.saved[0]?.attachment).toBeUndefined();
    expect(spies.warns).toHaveLength(1);
  });

  it("records membership on memberJoined and removes it on memberLeft", async () => {
    const { processor, spies } = makeProcessor();
    await processor.process({ webhookEventId: "mj", raw: memberEvent("memberJoined", "Umem1") });
    await processor.process({ webhookEventId: "ml", raw: memberEvent("memberLeft", "Umem2") });

    expect(spies.memberships).toEqual([{ uid: "Umem1", key: "group#Cg" }]);
    expect(spies.removed).toEqual([{ uid: "Umem2", key: "group#Cg" }]);
    // Member events archive but do not save messages or reply.
    expect(spies.saved).toHaveLength(0);
    expect(spies.replies).toHaveLength(0);
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
    expect(spies.contentFetches).toHaveLength(0); // stickers are not captured
    expect(spies.replies).toHaveLength(0);
    expect(spies.pushes).toHaveLength(0);
  });

  it("archives but does not reply to non-message, non-member events", async () => {
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
