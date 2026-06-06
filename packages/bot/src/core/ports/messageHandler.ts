import type { IncomingMessage, OutboundMessage } from "../domain/message.js";

/**
 * The core business-logic seam for inbound messages. Today the catalog {@link CommandHandler}; a
 * future LLM chat bot is just another implementation registered alongside it via the composite.
 */
export interface MessageHandler {
  handle(message: IncomingMessage): Promise<OutboundMessage[]>;
}
