import type { ConversationRef } from "../domain/conversation.js";
import type { OutboundMessage } from "../domain/message.js";

/** A normalized postback interaction: a card button, quick-reply chip, or rich-menu tap. */
export interface PostbackInteraction {
  readonly ref: ConversationRef;
  /** The action `data` payload the UI element carried (decoded by the router). */
  readonly data: string;
  /** LINE-supplied params — notably the datetime-picker's `datetime` value for follow-ups. */
  readonly params?: Record<string, string>;
}

/**
 * Routes a postback to a catalog action — the deterministic sibling of {@link MessageHandler}.
 * Postback `data` says exactly what to do, so (unlike messages) there's no chain of responsibility.
 */
export interface PostbackRouter {
  route(interaction: PostbackInteraction): Promise<OutboundMessage[]>;
}
