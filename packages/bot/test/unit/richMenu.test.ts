import { describe, expect, it } from "vitest";
import { buildRichMenu, RICH_MENU_TABS } from "../../src/adapters/line/richMenu.js";
import { ACTIONS, decodePostback } from "../../src/core/handlers/commands.js";

describe("buildRichMenu", () => {
  const menu = buildRichMenu();

  it("is a 2500-wide compact menu with a short chat-bar label", () => {
    expect(menu.size).toEqual({ width: 2500, height: 843 });
    expect((menu.chatBarText ?? "").length).toBeLessThanOrEqual(14);
  });

  it("tiles four tappable tabs edge-to-edge with no gaps or overlaps", () => {
    const areas = menu.areas ?? [];
    expect(areas).toHaveLength(4);
    let cursor = 0;
    for (const area of areas) {
      expect(area.bounds?.x).toBe(cursor);
      expect(area.bounds?.y).toBe(0);
      expect(area.bounds?.height).toBe(843);
      cursor += area.bounds?.width ?? 0;
    }
    // Four 625-wide tabs tile to 2500.
    expect(cursor).toBe(2500);
  });

  it("maps each tab to the postback action the router handles", () => {
    const actions = (menu.areas ?? []).map((a) => {
      const action = a.action;
      return action?.type === "postback" && action.data !== undefined
        ? decodePostback(action.data).action
        : undefined;
    });
    expect(actions).toEqual([ACTIONS.listings, ACTIONS.upcoming, ACTIONS.search, ACTIONS.help]);
    expect(RICH_MENU_TABS).toEqual(["My Listings", "Upcoming", "Search", "Help"]);
  });
});

describe("buildRichMenu with a LIFF URL (Catalog tab)", () => {
  const liffUrl = "https://liff.line.me/2010316764-abcdef";
  const menu = buildRichMenu({ liffUrl });

  it("adds a fifth tab that tiles edge-to-edge to 2500", () => {
    const areas = menu.areas ?? [];
    expect(areas).toHaveLength(5);
    let cursor = 0;
    for (const area of areas) {
      expect(area.bounds?.x).toBe(cursor);
      cursor += area.bounds?.width ?? 0;
    }
    expect(cursor).toBe(2500);
  });

  it("makes the Catalog tab a uri action opening the LIFF URL, before Help", () => {
    const areas = menu.areas ?? [];
    const catalog = areas[3]?.action;
    expect(catalog?.type).toBe("uri");
    expect(catalog?.type === "uri" ? catalog.uri : undefined).toBe(liffUrl);
    // Help stays last and stays a postback.
    const help = areas[4]?.action;
    expect(help?.type).toBe("postback");
  });

  it("omits the Catalog tab when the LIFF URL is empty", () => {
    expect(buildRichMenu({ liffUrl: "" }).areas).toHaveLength(4);
  });
});
