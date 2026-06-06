import type { ConversationRef } from "./conversation.js";

/** The message content kinds LINE can deliver. */
export type MessageContentType =
  | "text"
  | "image"
  | "video"
  | "audio"
  | "file"
  | "location"
  | "sticker";

export type MessageDirection = "in" | "out";

/** A normalized inbound message extracted from a LINE message event. */
export interface IncomingMessage {
  readonly ref: ConversationRef;
  readonly messageId: string;
  readonly contentType: MessageContentType;
  /** Present only for text messages. */
  readonly text?: string;
  readonly webhookEventId: string;
  /** Epoch milliseconds from the webhook event. */
  readonly timestamp: number;
  /** Single-use reply token; absent on some event types. */
  readonly replyToken?: string;
}

/** A provider-agnostic outbound message the bot wants to send. */
export interface OutboundMessage {
  readonly type: "text";
  readonly text: string;
}

/** A message as persisted (covers both inbound and outbound). */
export interface StoredMessage {
  readonly ref: ConversationRef;
  readonly messageId: string;
  readonly direction: MessageDirection;
  readonly contentType: MessageContentType;
  readonly text?: string;
  readonly webhookEventId?: string;
  readonly timestamp: number;
}
