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

/** A quick-reply button: a chip shown under a message that fires a postback when tapped. LINE caps
 * a message at 13 quick replies and a label at 20 chars (the gateway truncates). */
export interface QuickReply {
  readonly label: string;
  /** Postback `data` payload delivered when the chip is tapped (same vocabulary as card buttons). */
  readonly data: string;
  /** Optional text echoed into the chat as if the user typed it. */
  readonly displayText?: string;
}

/** One action button on a property card, rendered in the Flex footer. Defaults to a postback button;
 * `mode: "datetime"` renders a LINE datetime-picker instead, which delivers the chosen time back as
 * a postback with the same `data` plus a `datetime` param; `mode: "uri"` renders a link button that
 * opens `uri` (e.g. a Google-Maps deep link) — `data` is unused for that mode. */
export interface CardAction {
  readonly label: string;
  readonly data: string;
  readonly mode?: "postback" | "datetime" | "uri";
  /** Target for `mode: "uri"` buttons (ignored otherwise). */
  readonly uri?: string;
}

/** A single `label: value` line inside a property card body. */
export interface PropertyCardRow {
  readonly label: string;
  readonly value: string;
}

/**
 * A semantic property "card" for a Flex carousel. Deliberately provider-agnostic — the LINE-specific
 * Flex JSON (bubbles/boxes/buttons) is built in {@link ../../adapters/line/lineGateway}, so handlers
 * describe *what* to show, not how LINE lays it out.
 */
export interface PropertyCard {
  readonly title: string;
  readonly subtitle?: string;
  /** A prominent line under the title/subtitle (e.g. the price on a detail card). Rendered larger
   * and bolder than a row. Carousel cards omit it; the detail card uses it. */
  readonly headline?: string;
  /** HTTPS hero image url. Omitted when a property has no photo; the card renders without a hero. */
  readonly heroImageUrl?: string;
  readonly rows: readonly PropertyCardRow[];
  /** Muted footnote lines shown after the rows (e.g. a "reply to update" hint and saved/updated
   * dates on the detail card). Separated from the rows by a divider when present. */
  readonly notes?: readonly string[];
  readonly actions: readonly CardAction[];
}

/**
 * A provider-agnostic outbound message the bot wants to send. `text` is the original path (now with
 * optional quick replies); `flex` renders a carousel of {@link PropertyCard}s; `imageCarousel`
 * renders a swipeable gallery of images, each tappable to open at full size. All carry optional
 * quick replies, which the gateway attaches to the LINE message.
 */
export type OutboundMessage =
  | { readonly type: "text"; readonly text: string; readonly quickReplies?: readonly QuickReply[] }
  | {
      readonly type: "flex";
      /** Fallback text shown in notifications and on clients that can't render Flex. */
      readonly altText: string;
      readonly cards: readonly PropertyCard[];
      readonly quickReplies?: readonly QuickReply[];
    }
  | {
      readonly type: "imageCarousel";
      /** Fallback text shown in notifications and on clients that can't render the gallery. */
      readonly altText: string;
      /** HTTPS image urls (e.g. presigned S3 GETs); each bubble opens its image at full size. */
      readonly imageUrls: readonly string[];
      readonly quickReplies?: readonly QuickReply[];
    };

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
