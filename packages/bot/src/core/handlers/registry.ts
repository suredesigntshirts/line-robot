import type { IncomingMessage, OutboundMessage } from "../domain/message.js";
import type { CatalogRepository } from "../ports/catalog.js";
import type { MediaUrlSigner } from "../ports/mediaUrlSigner.js";
import type { MessageHandler } from "../ports/messageHandler.js";
import type { PostbackRouter } from "../ports/postbackRouter.js";
import type { Clock } from "../ports/runtime.js";
import { CatalogAssistant } from "./catalogAssistant.js";
import { CommandHandler } from "./commandHandler.js";
import { CatalogPostbackRouter } from "./postbackRouter.js";

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

/** Dependencies the interactive handlers need (the catalog data layer, a clock, and — optionally — a
 * media URL signer for presigning property-card hero images). */
export interface HandlerDeps {
  readonly catalog: CatalogRepository;
  readonly clock: Clock;
  readonly signer?: MediaUrlSigner;
}

/** The default message-handler wiring: the catalog command handler behind the composite seam. */
export function createDefaultMessageHandler(deps: HandlerDeps): MessageHandler {
  const assistant = new CatalogAssistant(deps.catalog, deps.clock, undefined, deps.signer);
  return new CompositeMessageHandler([new CommandHandler(assistant)]);
}

/** The default postback router: resolves card-button / quick-reply / rich-menu taps. */
export function createPostbackRouter(deps: HandlerDeps): PostbackRouter {
  return new CatalogPostbackRouter(
    new CatalogAssistant(deps.catalog, deps.clock, undefined, deps.signer),
  );
}
