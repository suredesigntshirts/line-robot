import { describe, expect, it } from "vitest";
import { EventProcessor, type EventProcessorDeps } from "../../src/app/eventProcessor.js";
import { type ConversationRef, conversationKey } from "../../src/core/domain/conversation.js";
import type {
  IncomingMessage,
  OutboundMessage,
  StoredMessage,
} from "../../src/core/domain/message.js";
import type { MessageHandler } from "../../src/core/ports/messageHandler.js";

/** A stand-in echo handler — the processor tests exercise reply/push/persist plumbing, not the
 * real CommandHandler's catalog logic (which has its own tests). */
const echoHandler: MessageHandler = {
  handle: async (message: IncomingMessage) =>
    message.contentType === "text" && message.text !== undefined && message.text !== ""
      ? [{ type: "text", text: message.text }]
      : [],
};

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
  postbacks: { data: string }[];
  warns: string[];
}

function makeProcessor(
  opts: { replyThrows?: boolean; contentThrows?: boolean; contentBytes?: Buffer } = {},
) {
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
    postbacks: [],
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
      findSince: async () => [],
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
      armEdit: async () => {},
      getEditContext: async () => null,
      clearEdit: async () => {},
      listUserConversations: async () => [],
      upsertProperty: async () => {},
      getProperty: async () => null,
      deleteProperty: async () => {},
      deletePropertyEvents: async () => {},
      linkConversationProperty: async () => {},
      unlinkConversationProperty: async () => {},
      listConversationProperties: async () => [],
      listPropertiesForUser: async () => [],
      addEvent: async () => {},
      listPropertyEvents: async () => [],
      findDueEvents: async () => [],
      markEventNotified: async () => false,
      getMemoryDoc: async () => null,
      putMemoryDoc: async () => {},
    },
    content: {
      getContent: async (id) => {
        spies.contentFetches.push(id);
        if (opts.contentThrows) {
          throw new Error("content expired");
        }
        // PNG magic bytes — exercises the content-type sniff (a LINE image message has no MIME).
        return opts.contentBytes ?? Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
      },
    },
    handler: echoHandler,
    postback: {
      route: async ({ data }) => {
        spies.postbacks.push({ data });
        return data === "action=silent" ? [] : [{ type: "text", text: `pb:${data}` }];
      },
    },
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

function postbackEvent(opts: { data?: string; source?: unknown; replyToken?: string } = {}) {
  return {
    type: "postback",
    webhookEventId: "pb1",
    timestamp: 4000,
    source: opts.source ?? { type: "user", userId: "U1" },
    replyToken: opts.replyToken ?? "r",
    postback: { data: opts.data ?? "action=listings" },
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
    // Sniffed from the PNG magic bytes, overriding the LINE image message's jpeg default.
    expect(spies.media[0]).toMatchObject({ messageId: "img1", contentType: "image/png" });
    expect(spies.saved[0]?.attachment).toEqual({
      s3Key: "conv/group#Cg/img1/content",
      contentType: "image/png",
    });
  });

  it("falls back to the declared image type when bytes aren't a recognised image", async () => {
    const { processor, spies } = makeProcessor({ contentBytes: Buffer.from("not-an-image") });
    await processor.process({ webhookEventId: "e-img", raw: imageEvent() });
    expect(spies.media[0]).toMatchObject({ contentType: "image/jpeg" }); // LINE image default
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

  it("routes a postback: replies, refreshes membership, and does not ingest", async () => {
    const { processor, spies } = makeProcessor();
    await processor.process({
      webhookEventId: "pb1",
      raw: postbackEvent({
        data: "action=listings",
        source: { type: "group", groupId: "Cg", userId: "Us" },
      }),
    });

    expect(spies.archived).toHaveLength(1);
    expect(spies.postbacks).toEqual([{ data: "action=listings" }]);
    expect(spies.memberships).toEqual([{ uid: "Us", key: "group#Cg" }]); // access refreshed
    expect(spies.touched).toHaveLength(0); // a tap is not chat content — not ingested
    expect(spies.saved.map((m) => m.direction)).toEqual(["out"]); // only the reply is logged
    expect(spies.replies[0]?.messages).toEqual([{ type: "text", text: "pb:action=listings" }]);
  });

  it("stays silent when a postback resolves to no reply", async () => {
    const { processor, spies } = makeProcessor();
    await processor.process({
      webhookEventId: "pb2",
      raw: postbackEvent({ data: "action=silent" }),
    });

    expect(spies.postbacks).toEqual([{ data: "action=silent" }]);
    expect(spies.replies).toHaveLength(0);
    expect(spies.pushes).toHaveLength(0);
    expect(spies.saved).toHaveLength(0);
  });
});
