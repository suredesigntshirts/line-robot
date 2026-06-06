import { describe, expect, it } from "vitest";
import { conversationKey, pushTarget } from "../../src/core/domain/conversation.js";

describe("conversationKey", () => {
  it("keys user, group, and room conversations distinctly", () => {
    expect(conversationKey({ kind: "user", userId: "U1" })).toBe("user#U1");
    expect(conversationKey({ kind: "group", groupId: "C1" })).toBe("group#C1");
    expect(conversationKey({ kind: "room", roomId: "R1" })).toBe("room#R1");
  });
});

describe("pushTarget", () => {
  it("returns the id used as the push `to` field", () => {
    expect(pushTarget({ kind: "user", userId: "U1" })).toBe("U1");
    expect(pushTarget({ kind: "group", groupId: "C1" })).toBe("C1");
    expect(pushTarget({ kind: "room", roomId: "R1" })).toBe("R1");
  });
});
