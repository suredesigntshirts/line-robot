import { describe, expect, it } from "vitest";
import { VERSION } from "../src/version.js";

describe("scaffold smoke test", () => {
  it("exposes a semver version string", () => {
    expect(VERSION).toMatch(/^\d+\.\d+\.\d+$/);
  });
});
