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

/** A geo point shared from a LINE location message. */
export interface GeoLocation {
  readonly latitude: number;
  readonly longitude: number;
  readonly title?: string;
  readonly address?: string;
}

/** A binary captured to S3 (eagerly, at receipt) — what the ingestion sweep reads instead of
 * re-fetching from LINE's short-lived Get Content endpoint. */
export interface MediaAttachment {
  readonly s3Key: string;
  readonly contentType: string;
}

/** A normalized inbound message extracted from a LINE message event. */
export interface IncomingMessage {
  readonly ref: ConversationRef;
  readonly messageId: string;
  readonly contentType: MessageContentType;
  /** Present only for text messages. */
  readonly text?: string;
  /** Present only for location messages. */
  readonly location?: GeoLocation;
  /** Present only for file messages (original upload name, carries the extension). */
  readonly fileName?: string;
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
  readonly location?: GeoLocation;
  readonly fileName?: string;
  /** S3 pointer to the eagerly-captured binary, for media messages. */
  readonly attachment?: MediaAttachment;
  readonly webhookEventId?: string;
  readonly timestamp: number;
}
