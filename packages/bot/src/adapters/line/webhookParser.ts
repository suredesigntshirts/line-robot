import type { webhook } from "@line/bot-sdk";
import type { ConversationRef } from "../../core/domain/conversation.js";
import type { InboundEvent, ParsedWebhook } from "../../core/domain/events.js";
import type { IncomingMessage, MessageContentType } from "../../core/domain/message.js";

/** Map a LINE `source` object onto a provider-agnostic {@link ConversationRef}. */
function toConversationRef(source: webhook.Source | undefined): ConversationRef | undefined {
  if (source === undefined) {
    return undefined;
  }
  switch (source.type) {
    case "user":
      return source.userId !== undefined ? { kind: "user", userId: source.userId } : undefined;
    case "group":
      return { kind: "group", groupId: source.groupId, senderUserId: source.userId };
    case "room":
      return { kind: "room", roomId: source.roomId, senderUserId: source.userId };
    default:
      return undefined;
  }
}

function toIncomingMessage(event: webhook.MessageEvent, ref: ConversationRef): IncomingMessage {
  const content = event.message;
  const base = {
    ref,
    messageId: content.id,
    contentType: content.type as MessageContentType,
    webhookEventId: event.webhookEventId,
    timestamp: event.timestamp,
    replyToken: event.replyToken,
  };
  switch (content.type) {
    case "text":
      return { ...base, text: content.text };
    case "location":
      return {
        ...base,
        location: {
          latitude: content.latitude,
          longitude: content.longitude,
          title: content.title,
          address: content.address,
        },
      };
    case "file":
      return { ...base, fileName: content.fileName };
    default:
      return base;
  }
}

/** Pull user ids out of a member list on memberJoined/memberLeft events. */
function memberUserIds(members: ReadonlyArray<webhook.Source> | undefined): string[] {
  return (members ?? []).flatMap((m) =>
    m.type === "user" && m.userId !== undefined ? [m.userId] : [],
  );
}

/** Flatten a postback's `params` (datetime picker / rich-menu switch) into a plain string record,
 * dropping non-string values. Returns undefined when there are no params (the common case). */
function postbackParams(
  params: webhook.PostbackContent["params"],
): Record<string, string> | undefined {
  if (params === undefined) {
    return undefined;
  }
  const entries = Object.entries(params).filter(
    (entry): entry is [string, string] => typeof entry[1] === "string",
  );
  return entries.length > 0 ? Object.fromEntries(entries) : undefined;
}

function toInboundEvent(event: webhook.Event): InboundEvent {
  const ref = toConversationRef(event.source);
  const base = { webhookEventId: event.webhookEventId, timestamp: event.timestamp };

  switch (event.type) {
    case "message":
      return ref === undefined
        ? { kind: "other", eventType: "message", ...base }
        : { kind: "message", message: toIncomingMessage(event, ref) };
    case "join":
      return ref !== undefined && event.replyToken !== undefined
        ? { kind: "join", ref, replyToken: event.replyToken, ...base }
        : { kind: "other", eventType: "join", ...base };
    case "leave":
      return ref !== undefined
        ? { kind: "leave", ref, ...base }
        : { kind: "other", eventType: "leave", ...base };
    case "memberJoined":
      return ref !== undefined && event.replyToken !== undefined
        ? {
            kind: "memberJoined",
            ref,
            replyToken: event.replyToken,
            memberIds: memberUserIds(event.joined?.members),
            ...base,
          }
        : { kind: "other", eventType: "memberJoined", ...base };
    case "memberLeft":
      return ref !== undefined
        ? { kind: "memberLeft", ref, memberIds: memberUserIds(event.left?.members), ...base }
        : { kind: "other", eventType: "memberLeft", ...base };
    case "postback": {
      if (ref === undefined || event.replyToken === undefined) {
        return { kind: "other", eventType: "postback", ...base };
      }
      const params = postbackParams(event.postback.params);
      return {
        kind: "postback",
        ref,
        replyToken: event.replyToken,
        data: event.postback.data,
        ...(params !== undefined ? { params } : {}),
        ...base,
      };
    }
    default:
      return { kind: "other", eventType: event.type, ...base };
  }
}

/**
 * Parse a raw webhook request body into a provider-agnostic {@link ParsedWebhook}.
 * An empty `events` array (LINE's "verify" ping) yields an empty `events` list.
 * Throws `SyntaxError` on malformed JSON — callers verify the signature first.
 */
export function parseWebhook(rawBody: string): ParsedWebhook {
  const callback = JSON.parse(rawBody) as webhook.CallbackRequest;
  const events = (callback.events ?? []).map(toInboundEvent);
  return { destination: callback.destination, events };
}

/** Parse a single raw LINE event (e.g. one SQS message payload) into an {@link InboundEvent}. */
export function parseRawEvent(raw: unknown): InboundEvent {
  return toInboundEvent(raw as webhook.Event);
}
