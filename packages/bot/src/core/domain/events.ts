import type { ConversationRef } from "./conversation.js";
import type { IncomingMessage } from "./message.js";

/**
 * A normalized webhook event. The LINE adapter maps raw SDK events onto this union so the
 * core never depends on the SDK's event shapes. `leave` and `memberLeft` carry no reply token.
 */
export type InboundEvent =
  | { readonly kind: "message"; readonly message: IncomingMessage }
  | {
      readonly kind: "join";
      readonly ref: ConversationRef;
      readonly replyToken: string;
      readonly webhookEventId: string;
      readonly timestamp: number;
    }
  | {
      readonly kind: "leave";
      readonly ref: ConversationRef;
      readonly webhookEventId: string;
      readonly timestamp: number;
    }
  | {
      readonly kind: "memberJoined";
      readonly ref: ConversationRef;
      readonly replyToken: string;
      /** User ids of the members who joined (for membership edges). */
      readonly memberIds: readonly string[];
      readonly webhookEventId: string;
      readonly timestamp: number;
    }
  | {
      readonly kind: "memberLeft";
      readonly ref: ConversationRef;
      /** User ids of the members who left (their access edges are removed). */
      readonly memberIds: readonly string[];
      readonly webhookEventId: string;
      readonly timestamp: number;
    }
  | {
      /** A card button / quick-reply / rich-menu tap. Carries a single-use reply token (postbacks
       * are interactive, so reply is fine) and the action `data` payload the UI element set. */
      readonly kind: "postback";
      readonly ref: ConversationRef;
      readonly replyToken: string;
      /** The postback `data` string, e.g. `action=view&id=PROP#123`. */
      readonly data: string;
      /** Extra params (datetime picker, rich-menu switch); carried for the P2 calendar flow. */
      readonly params?: Record<string, string>;
      readonly webhookEventId: string;
      readonly timestamp: number;
    }
  | {
      readonly kind: "other";
      readonly eventType: string;
      readonly webhookEventId: string;
      readonly timestamp: number;
    };

/** Result of parsing a webhook request body. */
export interface ParsedWebhook {
  readonly destination: string;
  readonly events: readonly InboundEvent[];
}
