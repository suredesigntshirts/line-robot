import { BANGKOK_OFFSET_MS } from "@line-robot/shared";
import { describe, expect, it } from "vitest";
import { resolveFollowUpTime } from "../../src/core/domain/followup.js";

/** Bangkok-local `2026-06-10T14:30` as epoch ms (what parseBangkokLocal yields). */
const DUE = Date.UTC(2026, 5, 10, 14, 30) - BANGKOK_OFFSET_MS;

describe("resolveFollowUpTime", () => {
  it("resolves a valid future Bangkok-local time to its instant", () => {
    const res = resolveFollowUpTime("2026-06-10T14:30", DUE - 60_000);
    expect(res).toEqual({ ok: true, dueAt: DUE });
  });

  it("rejects a malformed value as invalid", () => {
    for (const bad of ["", "2026-06-10", "10/06/2026 14:30", "2026-06-10T14:30:00"]) {
      expect(resolveFollowUpTime(bad, 0)).toEqual({ ok: false, reason: "invalid" });
    }
  });

  it("rejects a time at or before now as past", () => {
    expect(resolveFollowUpTime("2026-06-10T14:30", DUE)).toEqual({ ok: false, reason: "past" });
    expect(resolveFollowUpTime("2026-06-10T14:30", DUE + 1)).toEqual({ ok: false, reason: "past" });
  });
});
