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
  return {
    ref,
    messageId: content.id,
    contentType: content.type as MessageContentType,
    text: content.type === "text" ? content.text : undefined,
    webhookEventId: event.webhookEventId,
    timestamp: event.timestamp,
    replyToken: event.replyToken,
  };
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
        ? { kind: "memberJoined", ref, replyToken: event.replyToken, ...base }
        : { kind: "other", eventType: "memberJoined", ...base };
    case "memberLeft":
      return ref !== undefined
        ? { kind: "memberLeft", ref, ...base }
        : { kind: "other", eventType: "memberLeft", ...base };
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
