import { describe, expect, it } from "vitest";
import { loadCases } from "./cases.ts";

describe("loadCases", () => {
  const cases = loadCases();

  it("includes the E7 distinct-listings archetype with >1 property and 0 duplicate pairs", () => {
    const e7 = cases.find((c) => c.id === "distinct-dump-cnx");
    expect(e7).toBeDefined();
    expect(e7?.tier).toBe("B");
    expect(e7?.expected.duplicatePairs).toHaveLength(0);
    expect((e7?.expected.properties.length ?? 0) > 1).toBe(true);
  });

  it("loads committed Tier-A fixtures (no specs, founder-labeled expected set)", () => {
    const tierA = cases.filter((c) => c.tier === "A");
    expect(tierA.length).toBeGreaterThan(0); // the incident fixture is committed
    for (const c of tierA) {
      expect(c.source).toBe("tierA");
      expect(c.specs).toHaveLength(0);
      expect(c.expected.properties.length).toBeGreaterThan(0);
    }
  });

  it("keeps the synthetic Tier-B set intact (calm/messy/dump/dup)", () => {
    const synthetic = cases.filter((c) => c.source === "synthetic");
    // 24 calm + 24 messy + 6 dumps + 8 dup-traps + 1 E7 distinct archetype.
    expect(synthetic.length).toBe(63);
  });
});
