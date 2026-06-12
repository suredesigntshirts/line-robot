import { describe, expect, it } from "vitest";
import { extractUrgencyBadge, landToSqm, stripEmoji } from "../src/index.ts";

describe("stripEmoji (COPY-12)", () => {
  it("removes emoji but keeps Thai, Latin, digits, punctuation", () => {
    expect(stripEmoji("🔥ขายบ้านเดี่ยว 3.5 ล้าน!! 🏡✨")).toBe("ขายบ้านเดี่ยว 3.5 ล้าน!!");
    expect(stripEmoji("Price: 4,500,000 THB ✅")).toBe("Price: 4,500,000 THB");
  });

  it("collapses whitespace left behind", () => {
    expect(stripEmoji("ที่ดิน 🌳 🌳 สวย")).toBe("ที่ดิน สวย");
  });

  it("is a no-op on clean text", () => {
    expect(stripEmoji("ทาวน์เฮาส์ 2 ชั้น ต.สุเทพ")).toBe("ทาวน์เฮาส์ 2 ชั้น ต.สุเทพ");
  });
});

describe("extractUrgencyBadge (COPY-05)", () => {
  it("moves ขายด่วน into the badge and out of the title", () => {
    expect(extractUrgencyBadge("ขายด่วน!! บ้านเดี่ยวใกล้นิมมาน")).toEqual({
      title: "บ้านเดี่ยวใกล้นิมมาน",
      urgentBadge: true,
    });
  });

  it("handles English urgency phrasing", () => {
    expect(extractUrgencyBadge("URGENT SALE house near CMU")).toEqual({
      title: "house near CMU",
      urgentBadge: true,
    });
  });

  it("leaves non-urgent titles untouched", () => {
    expect(extractUrgencyBadge("คอนโดวิวดอย 1 นอน")).toEqual({
      title: "คอนโดวิวดอย 1 นอน",
      urgentBadge: false,
    });
  });
});

describe("landToSqm (FIELD-01)", () => {
  it("converts the rai/ngan/wah triple", () => {
    expect(landToSqm(1, 2, 35)).toBe(1600 + 800 + 140);
    expect(landToSqm(0, 0, 0)).toBe(0);
  });
});
