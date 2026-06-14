import { describe, expect, it } from "vitest";
import {
  claimPath,
  detailPath,
  editPath,
  normalizePath,
  parseRoute,
  resolveInitialPath,
} from "../src/lib/deeplink.ts";

// The route-shape freeze: `/` = list, `/p/{id}` = detail (plan-17 Flex deep links + rich-menu tabs).
describe("route-shape freeze", () => {
  it("the bare root resolves to the list", () => {
    expect(parseRoute("/")).toEqual({ name: "list" });
    expect(parseRoute("")).toEqual({ name: "list" });
  });

  it("`/p/{id}` resolves to detail with the decoded id", () => {
    expect(parseRoute("/p/abc-123")).toEqual({ name: "detail", id: "abc-123" });
    expect(parseRoute("/p/abc-123/")).toEqual({ name: "detail", id: "abc-123" }); // trailing slash
    expect(parseRoute("/p/a%20b")).toEqual({ name: "detail", id: "a b" }); // url-decoded
  });

  it("detailPath round-trips through parseRoute (deep links keep working)", () => {
    const id = "11111111-1111-1111-1111-111111111111";
    expect(parseRoute(detailPath(id))).toEqual({ name: "detail", id });
  });

  it("unknown paths fall back to the list (never throws)", () => {
    expect(parseRoute("/saved")).toEqual({ name: "list" });
    expect(parseRoute("/p")).toEqual({ name: "list" });
    expect(parseRoute("/p/a/b")).toEqual({ name: "list" });
  });
});

// The ADDITIVE claim route (Stage 5, Build C) — `/claim/{id}`. The two frozen shapes are untouched.
describe("claim route (additive)", () => {
  it("`/claim/{id}` resolves to claim with the decoded id", () => {
    expect(parseRoute("/claim/L-1")).toEqual({ name: "claim", id: "L-1" });
    expect(parseRoute("/claim/L-1/")).toEqual({ name: "claim", id: "L-1" }); // trailing slash
    expect(parseRoute("/claim/a%20b")).toEqual({ name: "claim", id: "a b" }); // url-decoded
  });

  it("claimPath round-trips through parseRoute (the bot DM deep link keeps working)", () => {
    const id = "11111111-1111-1111-1111-111111111111";
    expect(parseRoute(claimPath(id))).toEqual({ name: "claim", id });
  });

  it("a malformed claim path falls back to the list (never throws)", () => {
    expect(parseRoute("/claim")).toEqual({ name: "list" });
    expect(parseRoute("/claim/a/b")).toEqual({ name: "list" });
  });

  it("the frozen detail shape is NOT shadowed by adding the claim route", () => {
    expect(parseRoute("/p/abc-123")).toEqual({ name: "detail", id: "abc-123" });
  });
});

// The ADDITIVE edit route (Stage 5, Build D) — `/edit/{id}` (the owner edit surface that replaced
// edit-by-reply, A3a). The frozen shapes (and the claim route) are untouched.
describe("edit route (additive)", () => {
  it("`/edit/{id}` resolves to edit with the decoded id", () => {
    expect(parseRoute("/edit/L-1")).toEqual({ name: "edit", id: "L-1" });
    expect(parseRoute("/edit/L-1/")).toEqual({ name: "edit", id: "L-1" }); // trailing slash
    expect(parseRoute("/edit/a%20b")).toEqual({ name: "edit", id: "a b" }); // url-decoded
  });

  it("editPath round-trips through parseRoute", () => {
    const id = "11111111-1111-1111-1111-111111111111";
    expect(parseRoute(editPath(id))).toEqual({ name: "edit", id });
  });

  it("a malformed edit path falls back to the list (never throws)", () => {
    expect(parseRoute("/edit")).toEqual({ name: "list" });
    expect(parseRoute("/edit/a/b")).toEqual({ name: "list" });
  });

  it("the frozen detail + additive claim shapes are NOT shadowed by adding the edit route", () => {
    expect(parseRoute("/p/abc-123")).toEqual({ name: "detail", id: "abc-123" });
    expect(parseRoute("/claim/abc-123")).toEqual({ name: "claim", id: "abc-123" });
  });
});

describe("normalizePath", () => {
  it("strips trailing slashes but keeps root", () => {
    expect(normalizePath("/")).toBe("/");
    expect(normalizePath("/p/1/")).toBe("/p/1");
    expect(normalizePath("/p/1///")).toBe("/p/1");
  });
});

describe("resolveInitialPath (LIFF deep-link delivery)", () => {
  it("prefers a concrete non-root pathname", () => {
    expect(resolveInitialPath("/p/9", "")).toBe("/p/9");
  });

  it("decodes a path delivered via the liff.state query param", () => {
    const search = `?liff.state=${encodeURIComponent("/p/9?foo=bar")}`;
    expect(resolveInitialPath("/", search)).toBe("/p/9");
  });

  it("never returns an off-site path", () => {
    const search = `?liff.state=${encodeURIComponent("https://evil.example/p/9")}`;
    expect(resolveInitialPath("/", search)).toBe("/");
  });

  it("falls back to root with no pathname + no state", () => {
    expect(resolveInitialPath("/", "")).toBe("/");
  });
});
