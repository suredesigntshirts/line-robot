import type { IncomingMessage, OutboundMessage } from "../domain/message.js";
import type { CatalogRepository } from "../ports/catalog.js";
import type { MediaUrlSigner } from "../ports/mediaUrlSigner.js";
import type { MessageHandler } from "../ports/messageHandler.js";
import type { PostbackRouter } from "../ports/postbackRouter.js";
import type { Clock, Logger } from "../ports/runtime.js";
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
  /** When present, presign-failure warns are emitted from the assistant's photo boundaries. */
  readonly logger?: Logger;
  /** MINI App base URL (`https://miniapp.line.me/{liffId}`); when set, the detail card gains an
   * "Open in Catalog" deep link. Absent → no button (the original in-chat-only detail card). */
  readonly miniappUrl?: string;
}

/**
 * Build both interactive entry points from a single shared {@link CatalogAssistant}: the
 * message-handler chain (the catalog {@link CommandHandler} behind the composite seam, the seam for
 * a future LLM chat handler) and the {@link CatalogPostbackRouter} for card-button / quick-reply /
 * rich-menu taps. One assistant instance backs both, so the two paths share identical config.
 */
export function createHandlers(deps: HandlerDeps): {
  messageHandler: MessageHandler;
  postbackRouter: PostbackRouter;
} {
  const assistant = new CatalogAssistant(
    deps.catalog,
    deps.clock,
    undefined,
    deps.signer,
    deps.logger,
    deps.miniappUrl,
  );
  return {
    messageHandler: new CompositeMessageHandler([new CommandHandler(assistant)]),
    postbackRouter: new CatalogPostbackRouter(assistant),
  };
}
