import { describe, expect, it } from "vitest";
import { emptyToUndef, listToUndef, nullToUndef } from "../../src/core/domain/sentinel.js";

describe("sentinel helpers", () => {
  it("nullToUndef maps null -> undefined and passes through values (incl. 0/'' )", () => {
    expect(nullToUndef(null)).toBeUndefined();
    expect(nullToUndef(0)).toBe(0);
    expect(nullToUndef("")).toBe("");
    expect(nullToUndef(13.7)).toBe(13.7);
  });
  it("emptyToUndef maps '' -> undefined and passes through non-empty strings", () => {
    expect(emptyToUndef("")).toBeUndefined();
    expect(emptyToUndef("x")).toBe("x");
  });
  it("listToUndef maps [] -> undefined and copies non-empty lists", () => {
    expect(listToUndef([])).toBeUndefined();
    const src = ["a", "b"];
    const out = listToUndef(src);
    expect(out).toEqual(["a", "b"]);
    expect(out).not.toBe(src); // fresh mutable copy
  });
});
