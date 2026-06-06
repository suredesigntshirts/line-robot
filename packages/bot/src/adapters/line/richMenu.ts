import type { messagingApi } from "@line/bot-sdk";
import { ACTIONS, encodePostback } from "../../core/handlers/commands.js";

/**
 * The persistent navigation rich menu: four equal tabs that each fire a postback the
 * {@link ../../core/handlers/postbackRouter} already handles. Defining it here (next to the
 * gateway) keeps the LINE-specific shape out of core while sharing the one action vocabulary, so a
 * tab and its handler can't drift. The image is uploaded separately — see `scripts/setup-rich-menu`.
 */

// A "compact" rich menu (half-height). 2500px wide is LINE's required canvas width.
const WIDTH = 2500;
const HEIGHT = 843;

interface MenuTab {
  readonly label: string;
  readonly data: string;
}

const TABS: readonly MenuTab[] = [
  { label: "My Listings", data: encodePostback(ACTIONS.listings) },
  { label: "Upcoming", data: encodePostback(ACTIONS.upcoming) },
  { label: "Search", data: encodePostback(ACTIONS.search) },
  { label: "Help", data: encodePostback(ACTIONS.help) },
];

/** Build the rich-menu request (size + evenly-tiled tappable tabs → postback actions). */
export function buildRichMenu(): messagingApi.RichMenuRequest {
  const tabWidth = Math.floor(WIDTH / TABS.length);
  return {
    size: { width: WIDTH, height: HEIGHT },
    selected: true,
    name: "line-robot-main",
    chatBarText: "Menu",
    areas: TABS.map((tab, index) => ({
      bounds: { x: index * tabWidth, y: 0, width: tabWidth, height: HEIGHT },
      action: { type: "postback", data: tab.data, displayText: tab.label, label: tab.label },
    })),
  };
}

/** The tab labels, in order — handy for generating a placeholder menu image. */
export const RICH_MENU_TABS: readonly string[] = TABS.map((t) => t.label);
