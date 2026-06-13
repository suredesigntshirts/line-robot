import { type ConversationRef, conversationKey, senderUserId } from "../domain/conversation.js";
import type { OutboundMessage } from "../domain/message.js";
import type { PostbackInteraction, PostbackRouter } from "../ports/postbackRouter.js";
import type { CatalogAssistant } from "./catalogAssistant.js";
import { ACTIONS, decodePostback } from "./commands.js";

/**
 * Resolves card-button / quick-reply / rich-menu taps to catalog actions, delegating to the shared
 * {@link CatalogAssistant}. The merge/keep actions close the slice-4 ambiguous-merge loop: the
 * confirmation pushed by the sweep offers "Merge → <existing>" / "Keep separate" chips, and tapping
 * one lands here.
 */
export class CatalogPostbackRouter implements PostbackRouter {
  constructor(private readonly assistant: CatalogAssistant) {}

  async route({
    ref,
    data,
    params: pickerParams,
  }: PostbackInteraction): Promise<OutboundMessage[]> {
    const { action, params } = decodePostback(data);
    switch (action) {
      case ACTIONS.listings:
        return this.withUser(ref, (userId) => this.assistant.myListings(userId));
      case ACTIONS.search:
        return this.assistant.searchPrompt();
      case ACTIONS.upcoming:
        return this.withUser(ref, (userId) => this.assistant.upcoming(userId));
      case ACTIONS.help:
        return this.assistant.help();
      case ACTIONS.view:
        return this.assistant.viewProperty(params.get("id") ?? "");
      case ACTIONS.photos:
        return this.assistant.showPhotos(params.get("id") ?? "");
      case ACTIONS.delete:
        return this.assistant.deletePrompt(params.get("id") ?? "");
      case ACTIONS.deleteConfirm:
        return this.assistant.deleteListing(conversationKey(ref), params.get("id") ?? "");
      case ACTIONS.merge: {
        const from = params.get("from");
        const into = params.get("into");
        return from !== null && into !== null
          ? this.assistant.mergeNewInto(conversationKey(ref), from, into)
          : [];
      }
      case ACTIONS.keep:
        return this.assistant.keepSeparate();
      case ACTIONS.setFollowUp: {
        // The chosen time comes from the LINE datetime-picker's `params.datetime`, not the `data`.
        const id = params.get("id");
        const datetime = pickerParams?.datetime;
        return id !== null && datetime !== undefined
          ? this.assistant.setFollowUp(conversationKey(ref), id, datetime)
          : [];
      }
      default:
        return [];
    }
  }

  private async withUser(
    ref: ConversationRef,
    run: (userId: string) => Promise<OutboundMessage[]>,
  ): Promise<OutboundMessage[]> {
    const userId = senderUserId(ref);
    if (userId === undefined) {
      return [{ type: "text", text: "I couldn't tell who you are in this chat." }];
    }
    return run(userId);
  }
}
