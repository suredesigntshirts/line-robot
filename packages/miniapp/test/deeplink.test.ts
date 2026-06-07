import { describe, expect, it } from "vitest";
import { detailPath, parseRoute, resolveInitialPath } from "../src/lib/deeplink.js";

describe("resolveInitialPath", () => {
  it("uses a concrete non-root pathname directly", () => {
    expect(resolveInitialPath("/p/abc", "")).toBe("/p/abc");
  });

  it("strips a trailing slash", () => {
    expect(resolveInitialPath("/p/abc/", "")).toBe("/p/abc");
    expect(resolveInitialPath("/", "")).toBe("/");
  });

  it("decodes a deep link delivered via the liff.state query param", () => {
    const search = `?liff.state=${encodeURIComponent("/p/xyz-123")}`;
    expect(resolveInitialPath("/", search)).toBe("/p/xyz-123");
  });

  it("keeps only the path portion of liff.state (drops its query/fragment)", () => {
    const search = `?liff.state=${encodeURIComponent("/p/xyz?foo=1#frag")}`;
    expect(resolveInitialPath("/", search)).toBe("/p/xyz");
  });

  it("ignores an off-site liff.state and falls back to root", () => {
    const search = `?liff.state=${encodeURIComponent("https://evil.example/p/x")}`;
    expect(resolveInitialPath("/", search)).toBe("/");
  });

  it("falls back to root when there is no path and no liff.state", () => {
    expect(resolveInitialPath("/", "")).toBe("/");
  });
});

describe("parseRoute", () => {
  it("routes the root to the list", () => {
    expect(parseRoute("/")).toEqual({ name: "list" });
  });

  it("routes /p/:id to the detail with the decoded id", () => {
    expect(parseRoute("/p/abc-123")).toEqual({ name: "detail", id: "abc-123" });
    expect(parseRoute(`/p/${encodeURIComponent("weird id/with")}`)).toEqual({
      name: "detail",
      id: "weird id/with",
    });
  });

  it("falls back to the list for unknown paths", () => {
    expect(parseRoute("/something/else")).toEqual({ name: "list" });
  });
});

describe("detailPath", () => {
  it("builds an encoded detail path that round-trips through parseRoute", () => {
    const id = "id with space";
    expect(parseRoute(detailPath(id))).toEqual({ name: "detail", id });
  });
});
