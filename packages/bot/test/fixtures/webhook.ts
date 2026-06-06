// Builders for LINE webhook payloads used across the unit tests. Shapes follow
// docs/developers.line.biz/en/reference/messaging-api/index.md. Returned objects are plain
// JSON (typed loosely) since the parser consumes a raw body string.

type Json = Record<string, unknown>;

export const DESTINATION = "U00000000000000000000000000000000";

export function userSource(userId = "Uuser0000000000000000000000000001"): Json {
  return { type: "user", userId };
}

export function groupSource(groupId = "Cgroup00000000000000000000000001", userId?: string): Json {
  return userId === undefined ? { type: "group", groupId } : { type: "group", groupId, userId };
}

export function roomSource(roomId = "Rroom000000000000000000000000001", userId?: string): Json {
  return userId === undefined ? { type: "room", roomId } : { type: "room", roomId, userId };
}

interface EventOpts {
  webhookEventId?: string;
  timestamp?: number;
  source?: Json;
  replyToken?: string;
}

function eventBase(opts: EventOpts, fallbackId: string): Json {
  return {
    mode: "active",
    timestamp: opts.timestamp ?? 1700000000000,
    source: opts.source ?? userSource(),
    webhookEventId: opts.webhookEventId ?? fallbackId,
    deliveryContext: { isRedelivery: false },
  };
}

export function textMessageEvent(
  opts: EventOpts & { text?: string; messageId?: string } = {},
): Json {
  return {
    ...eventBase(opts, "01EVENTTEXT0000000000000000"),
    type: "message",
    replyToken: opts.replyToken ?? "replytoken0000000000000000000001",
    message: {
      type: "text",
      id: opts.messageId ?? "100000000000000001",
      text: opts.text ?? "hello",
      quoteToken: "quotetoken00000000000000000001",
    },
  };
}

export function stickerMessageEvent(opts: EventOpts & { messageId?: string } = {}): Json {
  return {
    ...eventBase(opts, "01EVENTSTICKER00000000000000"),
    type: "message",
    replyToken: opts.replyToken ?? "replytoken0000000000000000000002",
    message: {
      type: "sticker",
      id: opts.messageId ?? "100000000000000002",
      stickerId: "52002734",
      packageId: "11537",
      stickerResourceType: "ANIMATION",
      quoteToken: "quotetoken00000000000000000002",
    },
  };
}

export function imageMessageEvent(opts: EventOpts & { messageId?: string } = {}): Json {
  return {
    ...eventBase(opts, "01EVENTIMAGE00000000000000"),
    type: "message",
    replyToken: opts.replyToken ?? "replytoken0000000000000000000005",
    message: {
      type: "image",
      id: opts.messageId ?? "100000000000000003",
      contentProvider: { type: "line" },
    },
  };
}

export function locationMessageEvent(opts: EventOpts & { messageId?: string } = {}): Json {
  return {
    ...eventBase(opts, "01EVENTLOCATION0000000000000"),
    type: "message",
    replyToken: opts.replyToken ?? "replytoken0000000000000000000006",
    message: {
      type: "location",
      id: opts.messageId ?? "100000000000000004",
      title: "My Office",
      address: "Sukhumvit Rd, Bangkok",
      latitude: 13.7401,
      longitude: 100.5601,
    },
  };
}

export function fileMessageEvent(
  opts: EventOpts & { messageId?: string; fileName?: string } = {},
): Json {
  return {
    ...eventBase(opts, "01EVENTFILE0000000000000000"),
    type: "message",
    replyToken: opts.replyToken ?? "replytoken0000000000000000000007",
    message: {
      type: "file",
      id: opts.messageId ?? "100000000000000005",
      fileName: opts.fileName ?? "chanote.pdf",
      fileSize: 12345,
    },
  };
}

export function joinEvent(opts: EventOpts = {}): Json {
  return {
    ...eventBase({ source: groupSource(), ...opts }, "01EVENTJOIN0000000000000000"),
    type: "join",
    replyToken: opts.replyToken ?? "replytoken0000000000000000000003",
  };
}

export function leaveEvent(opts: EventOpts = {}): Json {
  return {
    ...eventBase({ source: groupSource(), ...opts }, "01EVENTLEAVE000000000000000"),
    type: "leave",
  };
}

export function memberJoinedEvent(opts: EventOpts = {}): Json {
  return {
    ...eventBase({ source: groupSource(), ...opts }, "01EVENTMEMBERJOIN0000000000"),
    type: "memberJoined",
    replyToken: opts.replyToken ?? "replytoken0000000000000000000004",
    joined: { members: [userSource("Umember000000000000000000000001")] },
  };
}

export function memberLeftEvent(opts: EventOpts = {}): Json {
  return {
    ...eventBase({ source: groupSource(), ...opts }, "01EVENTMEMBERLEFT0000000000"),
    type: "memberLeft",
    left: { members: [userSource("Umember000000000000000000000002")] },
  };
}

export function postbackEvent(
  opts: EventOpts & { data?: string; params?: Record<string, string> } = {},
): Json {
  const postback: Json = { data: opts.data ?? "action=listings" };
  if (opts.params !== undefined) {
    postback.params = opts.params;
  }
  return {
    ...eventBase(opts, "01EVENTPOSTBACK000000000000"),
    type: "postback",
    replyToken: opts.replyToken ?? "replytoken0000000000000000000008",
    postback,
  };
}

export function webhookBody(events: Json[], destination = DESTINATION): string {
  return JSON.stringify({ destination, events });
}
