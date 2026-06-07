import type { messagingApi } from "@line/bot-sdk";
import { ACTIONS, encodePostback } from "../../core/handlers/commands.js";

/**
 * The persistent navigation rich menu. Four tabs fire postbacks the
 * {@link ../../core/handlers/postbackRouter} already handles; an optional fifth **Catalog** tab is a
 * `uri` action that opens the LINE MINI App (LIFF) browse view. Defining it here (next to the
 * gateway) keeps the LINE-specific shape out of core while sharing the one action vocabulary, so a
 * tab and its handler can't drift. The image is uploaded separately — see `scripts/setup-rich-menu`.
 *
 * The Catalog tab is only added when a LIFF URL is supplied (it's unknown until the MINI App is
 * registered in the console), so `buildRichMenu()` with no args is the original 4-tab menu.
 */

// A "compact" rich menu (half-height). 2500px wide is LINE's required canvas width.
const WIDTH = 2500;
const HEIGHT = 843;

type MenuTab =
  | { readonly kind: "postback"; readonly label: string; readonly data: string }
  | { readonly kind: "uri"; readonly label: string; readonly uri: string };

const BASE_BEFORE: readonly MenuTab[] = [
  { kind: "postback", label: "My Listings", data: encodePostback(ACTIONS.listings) },
  { kind: "postback", label: "Upcoming", data: encodePostback(ACTIONS.upcoming) },
  { kind: "postback", label: "Search", data: encodePostback(ACTIONS.search) },
];
const HELP_TAB: MenuTab = { kind: "postback", label: "Help", data: encodePostback(ACTIONS.help) };

/** The tabs in display order. A non-empty `liffUrl` inserts the Catalog tab before Help. */
function tabsFor(liffUrl?: string): MenuTab[] {
  const catalog: MenuTab[] =
    liffUrl !== undefined && liffUrl !== ""
      ? [{ kind: "uri", label: "Catalog", uri: liffUrl }]
      : [];
  return [...BASE_BEFORE, ...catalog, HELP_TAB];
}

/** Build the rich-menu request (size + evenly-tiled tappable tabs). With `opts.liffUrl` set, a fifth
 * "Catalog" tab opens the MINI App via a `uri` action; without it, the original 4 postback tabs. */
export function buildRichMenu(opts: { liffUrl?: string } = {}): messagingApi.RichMenuRequest {
  const tabs = tabsFor(opts.liffUrl);
  const tabWidth = Math.floor(WIDTH / tabs.length);
  return {
    size: { width: WIDTH, height: HEIGHT },
    selected: true,
    name: "line-robot-main",
    chatBarText: "Menu",
    areas: tabs.map((tab, index) => {
      const x = index * tabWidth;
      // The last tab absorbs any rounding remainder so the tabs tile edge-to-edge to WIDTH.
      const width = index === tabs.length - 1 ? WIDTH - x : tabWidth;
      const bounds = { x, y: 0, width, height: HEIGHT };
      return {
        bounds,
        action:
          tab.kind === "uri"
            ? { type: "uri", uri: tab.uri, label: tab.label }
            : { type: "postback", data: tab.data, displayText: tab.label, label: tab.label },
      };
    }),
  };
}

/** The base tab labels, in order — handy for generating a placeholder menu image. (The Catalog tab,
 * when enabled, sits before Help — see {@link tabsFor}.) */
export const RICH_MENU_TABS: readonly string[] = [...BASE_BEFORE, HELP_TAB].map((t) => t.label);
