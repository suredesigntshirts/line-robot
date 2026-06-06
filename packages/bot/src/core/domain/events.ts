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
      readonly webhookEventId: string;
      readonly timestamp: number;
    }
  | {
      readonly kind: "memberLeft";
      readonly ref: ConversationRef;
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
