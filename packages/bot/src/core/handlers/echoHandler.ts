import type { IncomingMessage, OutboundMessage } from "../domain/message.js";
import type { MessageHandler } from "../ports/messageHandler.js";

/**
 * Echoes text messages straight back. Non-text content (stickers, images, …) is ignored
 * (returns no messages), which works identically in 1:1, group, and room chats.
 */
export class EchoHandler implements MessageHandler {
  async handle(message: IncomingMessage): Promise<OutboundMessage[]> {
    if (message.contentType === "text" && message.text !== undefined && message.text !== "") {
      return [{ type: "text", text: message.text }];
    }
    return [];
  }
}
