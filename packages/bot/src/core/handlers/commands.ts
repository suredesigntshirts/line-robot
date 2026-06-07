/**
 * The interaction vocabulary shared across the rich LINE UI: rich-menu areas, Flex card buttons,
 * and quick replies all encode a postback `data` string here, and the {@link ./postbackRouter}
 * decodes it. Keeping encode + decode + the action names in one place means a button and its
 * handler can't drift apart. Also parses the handful of typed text commands.
 */

/** Action names carried in a postback `data` payload (`action=<name>&...`). */
export const ACTIONS = {
  /** Show the user's listings as a Flex carousel. */
  listings: "listings",
  /** Upcoming follow-ups (P2 calendar; empty-state until events exist). */
  upcoming: "upcoming",
  /** Prompt for a road/area search. */
  search: "search",
  /** Help / how-to text. */
  help: "help",
  /** Show one property's details (param: `id`). */
  view: "view",
  /** Merge a just-created property into an existing one (params: `from`, `into`). */
  merge: "merge",
  /** Keep a confirmation-flagged property as its own listing (param: `id`). */
  keep: "keep",
  /** Set a follow-up date on a property (param: `id`; the chosen datetime arrives in the LINE
   * datetime-picker's `params.datetime`, not in `data`). */
  setFollowUp: "setfollowup",
} as const;

export type ActionName = (typeof ACTIONS)[keyof typeof ACTIONS];

/** Encode a postback `data` payload, e.g. `encodePostback("view", { id })`. */
export function encodePostback(action: ActionName, params: Record<string, string> = {}): string {
  return new URLSearchParams({ action, ...params }).toString();
}

export interface DecodedPostback {
  readonly action: string;
  readonly params: URLSearchParams;
}

/** Decode a postback `data` payload into its action name + params. */
export function decodePostback(data: string): DecodedPostback {
  const params = new URLSearchParams(data);
  return { action: params.get("action") ?? "", params };
}

/** A typed text command the user can issue without tapping a button. */
export type TextCommand =
  | { readonly kind: "listings" }
  | { readonly kind: "search"; readonly query: string }
  | { readonly kind: "upcoming" }
  | { readonly kind: "help" };

/**
 * Recognize the small set of typed commands. Returns null for anything else so ordinary property
 * chat falls through untouched (and is ingested by the sweep). Matching is deliberately strict —
 * exact phrases, plus `on <road>` / `search <query>` — so it can't hijack a normal sentence.
 */
export function parseTextCommand(text: string | undefined): TextCommand | null {
  if (text === undefined) {
    return null;
  }
  const normalized = text.trim().toLowerCase();
  if (
    normalized === "my listings" ||
    normalized === "listings" ||
    normalized === "show my listings"
  ) {
    return { kind: "listings" };
  }
  if (normalized === "upcoming" || normalized === "follow-ups" || normalized === "followups") {
    return { kind: "upcoming" };
  }
  if (normalized === "help" || normalized === "menu" || normalized === "?") {
    return { kind: "help" };
  }
  // `on <road>` / `search <query>` / `listings on <road>` — single-line, bounded length so it
  // can't swallow a paragraph of property description.
  const search = /^(?:listings on|search|on)\s+(.{1,40})$/i.exec(text.trim());
  if (search?.[1] !== undefined && !search[1].includes("\n")) {
    return { kind: "search", query: search[1].trim() };
  }
  return null;
}
