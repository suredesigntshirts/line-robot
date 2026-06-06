import { senderUserId } from "../domain/conversation.js";
import type { IncomingMessage, OutboundMessage } from "../domain/message.js";
import type { MessageHandler } from "../ports/messageHandler.js";
import type { CatalogAssistant } from "./catalogAssistant.js";
import { parseTextCommand } from "./commands.js";

/**
 * Interprets the handful of typed text commands ("my listings", "on <road>", "upcoming", "help")
 * and delegates to the {@link CatalogAssistant}. Anything that isn't a recognized command returns
 * no messages, so ordinary property chat falls through untouched (and is ingested by the sweep).
 * This replaces the old EchoHandler at the {@link ./registry} seam.
 */
export class CommandHandler implements MessageHandler {
  constructor(private readonly assistant: CatalogAssistant) {}

  async handle(message: IncomingMessage): Promise<OutboundMessage[]> {
    const command = parseTextCommand(message.text);
    if (command === null) {
      return [];
    }
    switch (command.kind) {
      case "listings":
        return this.withUser(message, (userId) => this.assistant.myListings(userId));
      case "search":
        return this.withUser(message, (userId) =>
          this.assistant.listingsOnRoad(userId, command.query),
        );
      case "upcoming":
        return this.assistant.upcoming();
      case "help":
        return this.assistant.help();
    }
  }

  /** Run a listings query that needs the sender's id, or explain why we can't identify them. */
  private async withUser(
    message: IncomingMessage,
    run: (userId: string) => Promise<OutboundMessage[]>,
  ): Promise<OutboundMessage[]> {
    const userId = senderUserId(message.ref);
    if (userId === undefined) {
      return [{ type: "text", text: "I couldn't tell who you are in this chat." }];
    }
    return run(userId);
  }
}
