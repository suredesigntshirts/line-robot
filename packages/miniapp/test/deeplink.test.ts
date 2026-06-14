import { describe, expect, it } from "vitest";
import { detailPath, normalizePath, parseRoute, resolveInitialPath } from "../src/lib/deeplink.ts";

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
