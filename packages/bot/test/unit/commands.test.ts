import { describe, expect, it } from "vitest";
import {
  ACTIONS,
  decodePostback,
  encodePostback,
  parseTextCommand,
} from "../../src/core/handlers/commands.js";

describe("postback encode/decode", () => {
  it("round-trips an action with params (url-encoding ids)", () => {
    const data = encodePostback(ACTIONS.view, { id: "PROP#123 abc" });
    const { action, params } = decodePostback(data);
    expect(action).toBe("view");
    expect(params.get("id")).toBe("PROP#123 abc");
  });

  it("decodes an action with no params", () => {
    const { action, params } = decodePostback(encodePostback(ACTIONS.listings));
    expect(action).toBe("listings");
    expect([...params.keys()]).toEqual(["action"]);
  });

  it("yields an empty action for a malformed payload", () => {
    expect(decodePostback("not-a-postback").action).toBe("");
  });
});

describe("parseTextCommand", () => {
  it("recognizes the listings aliases", () => {
    for (const text of ["my listings", "My Listings", "  listings ", "show my listings"]) {
      expect(parseTextCommand(text)).toEqual({ kind: "listings" });
    }
  });

  it("recognizes upcoming and help aliases", () => {
    expect(parseTextCommand("upcoming")).toEqual({ kind: "upcoming" });
    expect(parseTextCommand("Follow-ups")).toEqual({ kind: "upcoming" });
    expect(parseTextCommand("help")).toEqual({ kind: "help" });
    expect(parseTextCommand("menu")).toEqual({ kind: "help" });
    expect(parseTextCommand("?")).toEqual({ kind: "help" });
  });

  it("parses a road search via on/search/listings on", () => {
    expect(parseTextCommand("on Sukhumvit")).toEqual({ kind: "search", query: "Sukhumvit" });
    expect(parseTextCommand("search Thonglor")).toEqual({ kind: "search", query: "Thonglor" });
    expect(parseTextCommand("listings on Rama 9")).toEqual({ kind: "search", query: "Rama 9" });
  });

  it("does not hijack ordinary property chat", () => {
    expect(
      parseTextCommand("This condo on Sukhumvit is 5.5M and has a great view, what do you think?"),
    ).toBeNull();
    expect(
      parseTextCommand("Let's meet on Tuesday at the site to discuss the price\nand more"),
    ).toBeNull();
    expect(parseTextCommand(undefined)).toBeNull();
    expect(parseTextCommand("hello there")).toBeNull();
  });
});
