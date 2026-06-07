import type { IncomingMessage, OutboundMessage } from "../domain/message.js";
import type { CatalogRepository } from "../ports/catalog.js";
import type { PropertyExtractor } from "../ports/extraction.js";
import type { MediaUrlSigner } from "../ports/mediaUrlSigner.js";
import type { MessageHandler } from "../ports/messageHandler.js";
import type { PostbackRouter } from "../ports/postbackRouter.js";
import type { Clock } from "../ports/runtime.js";
import { CatalogAssistant } from "./catalogAssistant.js";
import { CommandHandler } from "./commandHandler.js";
import { EditReplyHandler } from "./editReplyHandler.js";
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
 * media URL signer for presigning property-card hero images, and a property extractor that enables
 * the free-text "reply to update" edit path). */
export interface HandlerDeps {
  readonly catalog: CatalogRepository;
  readonly clock: Clock;
  readonly signer?: MediaUrlSigner;
  /** When present, enables {@link EditReplyHandler} (free-text edits of the last-viewed listing).
   * Absent (e.g. no Anthropic key wired) → the chain is the command handler alone, as before. */
  readonly extractor?: PropertyExtractor;
}

/** The default message-handler wiring: the catalog command handler behind the composite seam, with
 * the free-text edit handler appended after it (so typed commands always win) when an extractor is
 * available. */
export function createDefaultMessageHandler(deps: HandlerDeps): MessageHandler {
  const assistant = new CatalogAssistant(deps.catalog, deps.clock, undefined, deps.signer);
  const handlers: MessageHandler[] = [new CommandHandler(assistant)];
  if (deps.extractor !== undefined) {
    handlers.push(new EditReplyHandler(deps.catalog, deps.extractor, deps.clock));
  }
  return new CompositeMessageHandler(handlers);
}

/** The default postback router: resolves card-button / quick-reply / rich-menu taps. */
export function createPostbackRouter(deps: HandlerDeps): PostbackRouter {
  return new CatalogPostbackRouter(
    new CatalogAssistant(deps.catalog, deps.clock, undefined, deps.signer),
  );
}
