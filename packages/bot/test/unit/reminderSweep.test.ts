import { describe, expect, it } from "vitest";
import { ReminderSweep } from "../../src/app/reminderSweep.js";
import type { OutboundMessage } from "../../src/core/domain/message.js";
import type { LineGateway } from "../../src/core/ports/lineGateway.js";
import type { Logger } from "../../src/core/ports/runtime.js";
import { FakeCatalog } from "../fixtures/fakeCatalog.js";
import { textOf } from "../fixtures/outbound.js";

const silentLogger: Logger = { info() {}, warn() {}, error() {} };
const clock = { now: () => Date.parse("2026-06-10T08:00:00Z") };

function capturingGateway() {
  const pushes: { to: string; messages: OutboundMessage[] }[] = [];
  const gateway: LineGateway = {
    reply: async () => {},
    push: async (to, messages) => {
      pushes.push({ to, messages });
    },
  };
  return { gateway, pushes };
}

function setup() {
  const catalog = new FakeCatalog().seedProperty({
    propertyId: "p1",
    normalizedAddress: "1 Sukhumvit",
  });
  const { gateway, pushes } = capturingGateway();
  const sweep = new ReminderSweep({ catalog, gateway, logger: silentLogger, clock });
  return { catalog, pushes, sweep };
}

describe("ReminderSweep", () => {
  it("pushes a due reminder to the source chat and won't re-send it", async () => {
    const { catalog, pushes, sweep } = setup();
    await catalog.addEvent({
      eventId: "e1",
      propertyId: "p1",
      dueAt: Date.parse("2026-06-10T07:30:00Z"),
      notifyConversationKey: "group#G123",
      title: "Site visit",
    });

    const first = await sweep.run();
    expect(first).toMatchObject({ due: 1, sent: 1, skipped: 0, failed: 0 });
    expect(pushes[0]?.to).toBe("G123"); // pushTargetFromKey strips the `group#` prefix
    expect(textOf(pushes[0]?.messages[0])).toContain("Site visit");
    expect(textOf(pushes[0]?.messages[0])).toContain("1 Sukhumvit");

    // Notified events clear their GSI keys → drop out of the due query; a second sweep is a no-op.
    const second = await sweep.run();
    expect(second).toMatchObject({ due: 0, sent: 0 });
    expect(pushes).toHaveLength(1);
  });

  it("does nothing when the only event is still in the future", async () => {
    const { catalog, pushes, sweep } = setup();
    await catalog.addEvent({
      eventId: "future",
      propertyId: "p1",
      dueAt: Date.parse("2026-12-01T00:00:00Z"),
      notifyConversationKey: "user#U1",
    });
    expect(await sweep.run()).toMatchObject({ due: 0, sent: 0 });
    expect(pushes).toHaveLength(0);
  });

  it("still reminds with a fallback title when the property was since removed", async () => {
    const { catalog, pushes, sweep } = setup();
    await catalog.addEvent({
      eventId: "e2",
      propertyId: "gone",
      dueAt: Date.parse("2026-06-10T07:00:00Z"),
      notifyConversationKey: "user#U9",
    });
    expect(await sweep.run()).toMatchObject({ sent: 1 });
    expect(pushes[0]?.to).toBe("U9");
    expect(textOf(pushes[0]?.messages[0])).toContain("your listing");
  });
});
