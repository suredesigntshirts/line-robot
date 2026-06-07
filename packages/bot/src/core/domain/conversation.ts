/**
 * A conversation is where messages happen: a 1:1 chat, a group, or a multi-person "room".
 * Provider-agnostic — the LINE adapter maps `source` objects onto this.
 */
export type ConversationRef =
  | { readonly kind: "user"; readonly userId: string }
  | { readonly kind: "group"; readonly groupId: string; readonly senderUserId?: string }
  | { readonly kind: "room"; readonly roomId: string; readonly senderUserId?: string };

/** Stable string key for storage partitioning and logging, e.g. `group#Cxxxx`. */
export function conversationKey(ref: ConversationRef): string {
  switch (ref.kind) {
    case "user":
      return `user#${ref.userId}`;
    case "group":
      return `group#${ref.groupId}`;
    case "room":
      return `room#${ref.roomId}`;
  }
}

/** The recipient id for a push message (`to`): user, group, or room id. */
export function pushTarget(ref: ConversationRef): string {
  switch (ref.kind) {
    case "user":
      return ref.userId;
    case "group":
      return ref.groupId;
    case "room":
      return ref.roomId;
  }
}

/** The push recipient id for a stored `conversationKey` (`<kind>#<id>`) — the reminder sweep holds
 * the key string, not a {@link ConversationRef}. Ids never contain `#`, so the id is everything
 * after the first one. */
export function pushTargetFromKey(conversationKey: string): string {
  return conversationKey.slice(conversationKey.indexOf("#") + 1);
}

/**
 * The user who sent/owns a message or interaction: the peer in a DM, the sender in a group/room
 * (undefined when LINE didn't include a sender). Drives membership edges and "show *my* listings".
 */
export function senderUserId(ref: ConversationRef): string | undefined {
  switch (ref.kind) {
    case "user":
      return ref.userId;
    case "group":
    case "room":
      return ref.senderUserId;
  }
}
