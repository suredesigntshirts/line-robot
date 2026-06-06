import type { IncomingMessage, OutboundMessage } from "../domain/message.js";

/**
 * The core business-logic seam. Today only {@link EchoHandler}; the future LLM bot is just
 * another implementation registered alongside it.
 */
export interface MessageHandler {
  handle(message: IncomingMessage): Promise<OutboundMessage[]>;
}
