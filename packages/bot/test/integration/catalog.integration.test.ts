import { execFileSync } from "node:child_process";
import { CreateTableCommand, DynamoDBClient, ListTablesCommand } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { DynamoCatalogRepository } from "../../src/adapters/dynamodb/catalogRepository.js";

const CONTAINER = "linerobot-ddb-catalog-it";
const CATALOG_TABLE = "catalog-test";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const iso = (ms: number) => new Date(ms).toISOString();

function tryDocker(args: string[]): void {
  try {
    execFileSync("docker", args, { stdio: "ignore" });
  } catch {
    /* ignore — container may not exist yet */
  }
}

function startContainer(): string {
  tryDocker(["rm", "-f", CONTAINER]);
  execFileSync(
    "docker",
    ["run", "-d", "--rm", "--name", CONTAINER, "-p", "127.0.0.1::8000", "amazon/dynamodb-local"],
    { stdio: "ignore" },
  );
  const mapping = execFileSync("docker", ["port", CONTAINER, "8000/tcp"], {
    encoding: "utf8",
  }).trim();
  const hostPort = (mapping.split("\n")[0] ?? "").split(":").pop();
  if (hostPort === undefined || hostPort === "") {
    throw new Error(`Could not resolve mapped port from docker output: ${mapping}`);
  }
  return `http://127.0.0.1:${hostPort}`;
}

async function waitForReady(client: DynamoDBClient): Promise<void> {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    try {
      await client.send(new ListTablesCommand({}));
      return;
    } catch {
      await sleep(500);
    }
  }
  throw new Error("DynamoDB Local did not become ready in time");
}

async function createTable(client: DynamoDBClient): Promise<void> {
  await client.send(
    new CreateTableCommand({
      TableName: CATALOG_TABLE,
      BillingMode: "PAY_PER_REQUEST",
      AttributeDefinitions: [
        { AttributeName: "pk", AttributeType: "S" },
        { AttributeName: "sk", AttributeType: "S" },
        { AttributeName: "gsi1pk", AttributeType: "S" },
        { AttributeName: "gsi1sk", AttributeType: "S" },
        { AttributeName: "gsi2pk", AttributeType: "S" },
        { AttributeName: "gsi2sk", AttributeType: "S" },
      ],
      KeySchema: [
        { AttributeName: "pk", KeyType: "HASH" },
        { AttributeName: "sk", KeyType: "RANGE" },
      ],
      GlobalSecondaryIndexes: [
        {
          IndexName: "gsi1",
          KeySchema: [
            { AttributeName: "gsi1pk", KeyType: "HASH" },
            { AttributeName: "gsi1sk", KeyType: "RANGE" },
          ],
          Projection: { ProjectionType: "ALL" },
        },
        {
          IndexName: "gsi2",
          KeySchema: [
            { AttributeName: "gsi2pk", KeyType: "HASH" },
            { AttributeName: "gsi2sk", KeyType: "RANGE" },
          ],
          Projection: { ProjectionType: "ALL" },
        },
      ],
    }),
  );
}

let ddb: DynamoDBClient;
let doc: DynamoDBDocumentClient;
let repo: DynamoCatalogRepository;

beforeAll(async () => {
  const endpoint = startContainer();
  ddb = new DynamoDBClient({
    endpoint,
    region: "us-east-1",
    credentials: { accessKeyId: "test", secretAccessKey: "test" },
  });
  doc = DynamoDBDocumentClient.from(ddb);
  await waitForReady(ddb);
  await createTable(ddb);
  // Small debounce windows so the quiet/cap behaviour is exercised with plain millisecond math.
  repo = new DynamoCatalogRepository(doc, CATALOG_TABLE, {
    quietDebounceMs: 1000,
    maxWaitMs: 5000,
  });
});

afterAll(() => {
  tryDocker(["rm", "-f", CONTAINER]);
});

// Quiet debounce = 1000ms, max-wait cap = 5000ms (set on the repo in beforeAll). readyAt is the
// GSI1 sort key, so a conversation is "due" once findPendingConversations(now) sees readyAt <= now.
describe("conversation tracker", () => {
  it("pushes readyAt out as messages arrive (quiet-debounce)", async () => {
    await repo.touchConversation("conv-A", 1000); // readyAt = 2000
    await repo.touchConversation("conv-A", 2000); // readyAt pushed out to 3000

    const tracker = await repo.getConversation("conv-A");
    expect(tracker?.pendingSince).toBe(iso(1000)); // anchored to the first message
    expect(tracker?.lastInboundAt).toBe(2000);
    expect(tracker?.lastIngestedAt).toBe(0);
    expect(tracker?.status).toBe("IDLE");

    // Not yet due just after the first message's window — the 2nd message moved the timer.
    const tooEarly = await repo.findPendingConversations(iso(2999), 50);
    expect(tooEarly.map((t) => t.conversationKey)).not.toContain("conv-A");

    const due = await repo.findPendingConversations(iso(3000), 50);
    expect(due.map((t) => t.conversationKey)).toContain("conv-A");
  });

  it("freezes readyAt at the max-wait cap so an active chat can't starve", async () => {
    await repo.touchConversation("conv-cap", 1000); // readyAt 2000, deadline 6000
    await repo.touchConversation("conv-cap", 2000); // readyAt 3000
    await repo.touchConversation("conv-cap", 5500); // candidate 6500 > deadline → frozen at 6000
    await repo.touchConversation("conv-cap", 7000); // still frozen at 6000, lastInboundAt advances

    const tracker = await repo.getConversation("conv-cap");
    expect(tracker?.lastInboundAt).toBe(7000);

    expect(
      (await repo.findPendingConversations(iso(5999), 50)).map((t) => t.conversationKey),
    ).not.toContain("conv-cap");
    expect(
      (await repo.findPendingConversations(iso(6000), 50)).map((t) => t.conversationKey),
    ).toContain("conv-cap");
  });

  it("claims at most one worker and recovers a stale claim", async () => {
    await repo.touchConversation("conv-B", 1000);

    const claimed = await repo.claimConversation("conv-B", 100_000, 60_000);
    expect(claimed?.status).toBe("INGESTING");
    expect(claimed?.lastInboundAt).toBe(1000);

    // A second worker is locked out while the claim is fresh.
    expect(await repo.claimConversation("conv-B", 100_001, 60_000)).toBeNull();

    // …but a much later sweep reclaims a stale (crashed) run.
    const reclaimed = await repo.claimConversation("conv-B", 1_000_000, 60_000);
    expect(reclaimed?.status).toBe("INGESTING");
  });

  it("clears pending on a clean release (no new messages)", async () => {
    await repo.touchConversation("conv-C", 1000);
    const claimed = await repo.claimConversation("conv-C", 100_000, 60_000);
    await repo.releaseConversation("conv-C", {
      watermark: claimed?.lastInboundAt ?? 0,
      claimSeenInboundAt: claimed?.lastInboundAt ?? 0,
    });

    const tracker = await repo.getConversation("conv-C");
    expect(tracker?.pendingSince).toBeUndefined();
    expect(tracker?.claimedAt).toBeUndefined();
    expect(tracker?.status).toBe("IDLE");
    expect(tracker?.lastIngestedAt).toBe(1000);
    const ready = await repo.findPendingConversations(iso(10_000_000), 50);
    expect(ready.map((t) => t.conversationKey)).not.toContain("conv-C");
  });

  it("stays pending when a message arrives mid-ingestion (no loss)", async () => {
    await repo.touchConversation("conv-D", 1000); // readyAt 2000
    const claimed = await repo.claimConversation("conv-D", 100_000, 60_000);
    // A new message lands during the ingestion run — touch re-arms readyAt to 3000.
    await repo.touchConversation("conv-D", 2000);

    await repo.releaseConversation("conv-D", {
      watermark: claimed?.lastInboundAt ?? 0, // only ingested up to 1000
      claimSeenInboundAt: claimed?.lastInboundAt ?? 0,
    });

    const tracker = await repo.getConversation("conv-D");
    expect(tracker?.lastIngestedAt).toBe(1000);
    expect(tracker?.pendingSince).toBe(iso(1000)); // still pending (not cleared)
    expect(tracker?.claimedAt).toBeUndefined();
    // Due at the re-armed readyAt (3000) from the mid-ingestion message — remainder gets swept.
    expect(
      (await repo.findPendingConversations(iso(2999), 50)).map((t) => t.conversationKey),
    ).not.toContain("conv-D");
    expect(
      (await repo.findPendingConversations(iso(3000), 50)).map((t) => t.conversationKey),
    ).toContain("conv-D");
  });

  it("arms / reads / clears an edit context without enqueueing ingestion", async () => {
    // Arm on a conversation that has never had a message: it seeds the META item but must NOT make
    // the conversation eligible for the ingestion sweep (it writes no GSI1 keys).
    await repo.armEdit("conv-edit", "prop-1", 5000);
    expect(await repo.getEditContext("conv-edit")).toEqual({ propertyId: "prop-1", armedAt: 5000 });
    expect(
      (await repo.findPendingConversations(iso(10_000_000), 50)).map((t) => t.conversationKey),
    ).not.toContain("conv-edit");

    // Re-arming overwrites the target; clearing removes it entirely.
    await repo.armEdit("conv-edit", "prop-2", 6000);
    expect(await repo.getEditContext("conv-edit")).toEqual({ propertyId: "prop-2", armedAt: 6000 });
    await repo.clearEdit("conv-edit");
    expect(await repo.getEditContext("conv-edit")).toBeNull();
  });
});

describe("properties + edges + membership", () => {
  it("merges property upserts without clobbering prior fields", async () => {
    await repo.upsertProperty({ propertyId: "pM", normalizedAddress: "a", tags: ["x"] });
    await repo.upsertProperty({ propertyId: "pM", photos: ["conv/x/1/content"] });
    await repo.upsertProperty({ propertyId: "pM", askingPrice: 5_000_000, currency: "THB" });

    const prop = await repo.getProperty("pM");
    expect(prop).toMatchObject({
      propertyId: "pM",
      normalizedAddress: "a",
      tags: ["x"],
      photos: ["conv/x/1/content"],
      askingPrice: 5_000_000,
      currency: "THB",
    });
  });

  it("resolves 'my listings' via membership → conversations → properties", async () => {
    // user1 & user2 discuss property p10 in group#G; user2 separately discusses p20 in their DM.
    await repo.recordMembership("user1", "group#G", 1000);
    await repo.recordMembership("user2", "group#G", 1000);
    await repo.recordMembership("user2", "user#user2", 1000);

    await repo.upsertProperty({ propertyId: "p10", originConversationKey: "group#G" });
    await repo.linkConversationProperty("group#G", "p10", 1000);
    await repo.upsertProperty({ propertyId: "p20", originConversationKey: "user#user2" });
    await repo.linkConversationProperty("user#user2", "p20", 1000);

    expect(await repo.listUserConversations("user2")).toEqual(
      expect.arrayContaining(["group#G", "user#user2"]),
    );
    expect(await repo.listConversationProperties("group#G")).toEqual(["p10"]);

    const forUser1 = (await repo.listPropertiesForUser("user1")).map((p) => p.propertyId);
    expect(forUser1).toEqual(["p10"]); // group property visible, DM property not

    const forUser2 = (await repo.listPropertiesForUser("user2")).map((p) => p.propertyId).sort();
    expect(forUser2).toEqual(["p10", "p20"]);
  });

  it("removes a membership edge on memberLeft", async () => {
    await repo.recordMembership("leaver", "group#H", 1000);
    expect(await repo.listUserConversations("leaver")).toEqual(["group#H"]);

    await repo.removeMembership("leaver", "group#H");
    expect(await repo.listUserConversations("leaver")).toEqual([]);
  });

  it("deletes a property and unlinks its edge (the merge primitives)", async () => {
    await repo.upsertProperty({ propertyId: "pMerge", normalizedAddress: "to be merged" });
    await repo.linkConversationProperty("conv-merge", "pMerge", 1000);
    expect(await repo.listConversationProperties("conv-merge")).toEqual(["pMerge"]);

    await repo.unlinkConversationProperty("conv-merge", "pMerge");
    await repo.deleteProperty("pMerge");

    expect(await repo.getProperty("pMerge")).toBeNull();
    expect(await repo.listConversationProperties("conv-merge")).toEqual([]);
  });
});

// PropertyEvents live under the property partition (sk EVT#<dueIso>#<id>) and surface to the reminder
// sweep via the sparse GSI2 (gsi2sk = <dueIso>#<id>). markEventNotified clears the GSI keys so a
// notified event drops out of findDueEvents — exercised end-to-end below.
describe("property events (calendar / reminders)", () => {
  it("lists a property's events and finds only those due, soonest-first", async () => {
    const early = { dueAt: Date.parse("2026-06-10T03:00:00Z") };
    const late = { dueAt: Date.parse("2026-06-10T05:00:00Z") };
    const future = { dueAt: Date.parse("2026-09-01T00:00:00Z") };
    await repo.addEvent({
      eventId: "evtB",
      propertyId: "pEvt",
      dueAt: late.dueAt,
      notifyConversationKey: "group#G",
      title: "Call seller",
    });
    await repo.addEvent({
      eventId: "evtA",
      propertyId: "pEvt",
      dueAt: early.dueAt,
      notifyConversationKey: "group#G",
    });
    await repo.addEvent({
      eventId: "evtF",
      propertyId: "pEvt",
      dueAt: future.dueAt,
      notifyConversationKey: "group#G",
    });

    expect((await repo.listPropertyEvents("pEvt")).map((e) => e.eventId).sort()).toEqual([
      "evtA",
      "evtB",
      "evtF",
    ]);

    const due = await repo.findDueEvents(iso(Date.parse("2026-06-10T06:00:00Z")), 50);
    expect(due.map((e) => e.eventId)).toEqual(["evtA", "evtB"]); // future excluded, ordered by dueAt
    expect(due[0]).toMatchObject({ notifyConversationKey: "group#G" });
  });

  it("claims an event at most once and drops it from the due index on notify", async () => {
    await repo.addEvent({
      eventId: "evtOnce",
      propertyId: "pOnce",
      dueAt: Date.parse("2026-06-10T03:00:00Z"),
      notifyConversationKey: "user#U1",
    });
    // The GSI2 partition is shared across all properties, so pick our event out by id (other tests'
    // un-notified events are due here too).
    const due = await repo.findDueEvents(iso(Date.parse("2026-06-10T06:00:00Z")), 50);
    const event = due.find((e) => e.eventId === "evtOnce");
    expect(event).toBeDefined();

    // First claim wins; a racing second claim loses.
    expect(await repo.markEventNotified(event as never, 1000)).toBe(true);
    expect(await repo.markEventNotified(event as never, 1001)).toBe(false);

    // Notified → GSI keys cleared → no longer due, but the row remains (notifiedAt stamped).
    const stillDue = await repo.findDueEvents(iso(Date.parse("2026-06-10T06:00:00Z")), 50);
    expect(stillDue.map((e) => e.eventId)).not.toContain("evtOnce");
    const remaining = (await repo.listPropertyEvents("pOnce")).find((e) => e.eventId === "evtOnce");
    expect(remaining?.notifiedAt).toBe(1000);
  });
});

describe("conversation memory", () => {
  it("round-trips and replaces the per-conversation memory note", async () => {
    expect(await repo.getMemoryDoc("conv-mem")).toBeNull();

    await repo.putMemoryDoc("conv-mem", "Khun Mali is the seller.");
    expect(await repo.getMemoryDoc("conv-mem")).toBe("Khun Mali is the seller.");

    await repo.putMemoryDoc("conv-mem", "Khun Mali is the seller. Weekends only.");
    expect(await repo.getMemoryDoc("conv-mem")).toBe("Khun Mali is the seller. Weekends only.");
  });
});
