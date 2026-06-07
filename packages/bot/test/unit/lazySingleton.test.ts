import { describe, expect, it, vi } from "vitest";
import { lazySingleton } from "../../src/lib/lazySingleton.js";

describe("lazySingleton", () => {
  it("invokes the factory exactly once across repeated calls", async () => {
    const factory = vi.fn(async () => ({ value: 42 }));
    const get = lazySingleton(factory);
    const a = await get();
    const b = await get();
    expect(factory).toHaveBeenCalledTimes(1);
    expect(a).toBe(b); // same resolved object, not a re-build
  });

  it("returns the identical Promise object on repeated calls", () => {
    const get = lazySingleton(async () => 1);
    expect(get()).toBe(get());
  });

  it("memoises a rejection and does NOT retry the factory (preserved cold-start behaviour)", async () => {
    const factory = vi.fn(async () => {
      throw new Error("ssm down");
    });
    const get = lazySingleton(factory);
    await expect(get()).rejects.toThrow("ssm down");
    await expect(get()).rejects.toThrow("ssm down");
    expect(factory).toHaveBeenCalledTimes(1); // rejected promise is cached, not re-run
  });
});
