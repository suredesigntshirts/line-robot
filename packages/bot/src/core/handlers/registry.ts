import type { IncomingMessage, OutboundMessage } from "../domain/message.js";
import type { CatalogRepository } from "../ports/catalog.js";
import type { MessageHandler } from "../ports/messageHandler.js";
import type { Clock } from "../ports/runtime.js";
import { CatalogAssistant } from "./catalogAssistant.js";
import { CommandHandler } from "./commandHandler.js";

/**
 * Chain-of-responsibility over handlers: the first handler to produce output wins. This is the
 * seam for growth — register a future LLM chat handler ahead of {@link CommandHandler} and it takes
 * over, with the command handler as the fallback.
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

/** Dependencies the interactive handlers need (the catalog data layer + a clock). */
export interface HandlerDeps {
  readonly catalog: CatalogRepository;
  readonly clock: Clock;
}

/** The default message-handler wiring: the catalog command handler behind the composite seam. */
export function createDefaultMessageHandler(deps: HandlerDeps): MessageHandler {
  const assistant = new CatalogAssistant(deps.catalog, deps.clock);
  return new CompositeMessageHandler([new CommandHandler(assistant)]);
}
