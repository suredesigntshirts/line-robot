import type { IncomingMessage, OutboundMessage } from "../domain/message.js";
import type { MessageHandler } from "../ports/messageHandler.js";
import { EchoHandler } from "./echoHandler.js";

/**
 * Chain-of-responsibility over handlers: the first handler to produce output wins. This is the
 * seam for growth — register the future LLM handler ahead of {@link EchoHandler} and it takes
 * over, with echo as the fallback.
 */
export class CompositeMessageHandler implements MessageHandler {
  constructor(private readonly handlers: readonly MessageHandler[]) {}

  async handle(message: IncomingMessage): Promise<OutboundMessage[]> {
    for (const handler of this.handlers) {
      const result = await handler.handle(message);
      if (result.length > 0) {
        return result;
      }
    }
    return [];
  }
}

/** The default handler wiring for the current (echo-only) bot. */
export function createDefaultMessageHandler(): MessageHandler {
  return new CompositeMessageHandler([new EchoHandler()]);
}
