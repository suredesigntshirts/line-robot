import { execFileSync } from "node:child_process";
import { CreateTableCommand, DynamoDBClient, ListTablesCommand } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { DynamoMessageRepository } from "../../src/adapters/dynamodb/messageRepository.js";
import type { StoredMessage } from "../../src/core/domain/message.js";
import {
  createIdempotencyConfig,
  createPersistenceLayer,
  makeEventIdempotent,
} from "../../src/lib/idempotency.js";

const CONTAINER = "linerobot-ddb-it";
const MESSAGES_TABLE = "messages-test";
const IDEMPOTENCY_TABLE = "idempotency-test";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function tryDocker(args: string[]): void {
  try {
    execFileSync("docker", args, { stdio: "ignore" });
  } catch {
    /* ignore — container may not exist yet */
  }
}

/** Start DynamoDB Local on a docker-assigned free host port and return its endpoint URL. */
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

async function createTables(client: DynamoDBClient): Promise<void> {
  await client.send(
    new CreateTableCommand({
      TableName: MESSAGES_TABLE,
      BillingMode: "PAY_PER_REQUEST",
      AttributeDefinitions: [
        { AttributeName: "pk", AttributeType: "S" },
        { AttributeName: "sk", AttributeType: "S" },
      ],
      KeySchema: [
        { AttributeName: "pk", KeyType: "HASH" },
        { AttributeName: "sk", KeyType: "RANGE" },
      ],
    }),
  );
  await client.send(
    new CreateTableCommand({
      TableName: IDEMPOTENCY_TABLE,
      BillingMode: "PAY_PER_REQUEST",
      AttributeDefinitions: [{ AttributeName: "id", AttributeType: "S" }],
      KeySchema: [{ AttributeName: "id", KeyType: "HASH" }],
    }),
  );
}

let ddb: DynamoDBClient;
let doc: DynamoDBDocumentClient;

beforeAll(async () => {
  const endpoint = startContainer();
  ddb = new DynamoDBClient({
    endpoint,
    region: "us-east-1",
    credentials: { accessKeyId: "test", secretAccessKey: "test" },
  });
  doc = DynamoDBDocumentClient.from(ddb);
  await waitForReady(ddb);
  await createTables(ddb);
});

afterAll(() => {
  tryDocker(["rm", "-f", CONTAINER]);
});

describe("DynamoMessageRepository", () => {
  it("saves and returns recent messages newest-first", async () => {
    const repo = new DynamoMessageRepository(doc, MESSAGES_TABLE);
    const ref = { kind: "group", groupId: "Cgroup1", senderUserId: "Usender" } as const;
    const base: StoredMessage = {
      ref,
      messageId: "m1",
      direction: "in",
      contentType: "text",
      text: "first",
      webhookEventId: "e1",
      timestamp: 1000,
    };
    await repo.save(base);
    await repo.save({
      ...base,
      messageId: "m2",
      text: "second",
      webhookEventId: "e2",
      timestamp: 2000,
    });
    await repo.save({
      ...base,
      messageId: "m3",
      text: "third",
      webhookEventId: "e3",
      timestamp: 3000,
    });

    const recent = await repo.findRecent(ref, 2);
    expect(recent.map((m) => m.text)).toEqual(["third", "second"]);
    expect(recent[0]?.ref).toEqual(ref);
  });

  it("findSince returns messages strictly newer than the watermark, oldest-first", async () => {
    const repo = new DynamoMessageRepository(doc, MESSAGES_TABLE);
    const ref = { kind: "user", userId: "Uwatermark" } as const;
    const key = "user#Uwatermark";
    const base = {
      ref,
      direction: "in",
      contentType: "text",
      webhookEventId: "ew",
    } as const;
    await repo.save({ ...base, messageId: "a", text: "t1", timestamp: 1000 });
    await repo.save({ ...base, messageId: "b", text: "t2", timestamp: 2000 });
    await repo.save({ ...base, messageId: "c", text: "t3", timestamp: 3000 });

    // Never ingested → all of them, oldest-first (the natural batch order for extraction).
    expect((await repo.findSince(key, 0)).map((m) => m.text)).toEqual(["t1", "t2", "t3"]);

    // Watermark is inclusive of the last-ingested message, so 2000 itself is excluded.
    expect((await repo.findSince(key, 2000)).map((m) => m.text)).toEqual(["t3"]);

    // Watermark at/after the newest message → empty batch.
    expect(await repo.findSince(key, 3000)).toEqual([]);
  });

  it("scopes messages to their own conversation", async () => {
    const repo = new DynamoMessageRepository(doc, MESSAGES_TABLE);
    const userRef = { kind: "user", userId: "Ualone" } as const;
    await repo.save({
      ref: userRef,
      messageId: "x1",
      direction: "in",
      contentType: "text",
      text: "solo",
      webhookEventId: "ex1",
      timestamp: 500,
    });

    const recent = await repo.findRecent(userRef, 10);
    expect(recent).toHaveLength(1);
    expect(recent[0]?.text).toBe("solo");
  });

  // Regression guard for the silent GROUP-ID lowercasing bug (cleanup unit 06): LINE group ids
  // are case-sensitive and uppercase-`C`-prefixed. ElectroDB's default key casing is `lower`, so
  // without `casing: "none"` the stored pk is lowercased and unreachable by any non-ElectroDB
  // reader built from the original (case-preserved) conversationKey. The attribute round-trip is
  // NOT enough to catch this (groupId is stored un-cased), so we assert on the raw stored pk.
  it("preserves the case of a mixed-case LINE group id in the stored key", async () => {
    const repo = new DynamoMessageRepository(doc, MESSAGES_TABLE);
    const ref = {
      kind: "group",
      groupId: "CGroupIdABCD1234",
      senderUserId: "Usender",
    } as const;
    const key = "group#CGroupIdABCD1234";
    await repo.save({
      ref,
      messageId: "g1",
      direction: "in",
      contentType: "text",
      text: "hello",
      webhookEventId: "eg1",
      timestamp: 1000,
    });
    await repo.save({
      ref,
      messageId: "g2",
      direction: "in",
      contentType: "text",
      text: "world",
      webhookEventId: "eg2",
      timestamp: 2000,
    });

    // (1) The raw stored partition key must retain the uppercase group id — this is the
    //     assertion that fails on the unfixed entity (pk would be `…group#cgroupidabcd1234`).
    const scan = await doc.send(new ScanCommand({ TableName: MESSAGES_TABLE }));
    const groupRows = (scan.Items ?? []).filter(
      (i) => typeof i.pk === "string" && i.pk.includes("CGroupIdABCD1234"),
    );
    expect(groupRows).toHaveLength(2);
    const lowercased = (scan.Items ?? []).filter(
      (i) => typeof i.pk === "string" && i.pk.includes("cgroupidabcd1234"),
    );
    expect(lowercased).toHaveLength(0);

    // (2) findRecent still round-trips the ref correctly (was already true, kept as a guard).
    const recent = await repo.findRecent(ref, 10);
    expect(recent.map((m) => m.text)).toEqual(["world", "hello"]);
    expect(recent[0]?.ref).toEqual(ref);

    // (3) findSince with the case-preserved conversationKey finds the same messages — proving the
    //     raw-key read path (used by the ingestion sweep) matches the case-preserved write path.
    expect((await repo.findSince(key, 0)).map((m) => m.text)).toEqual(["hello", "world"]);
    expect((await repo.findSince(key, 1000)).map((m) => m.text)).toEqual(["world"]);
  });
});

describe("idempotency", () => {
  it("runs a handler at most once per webhookEventId", async () => {
    let calls = 0;
    const inner = async (event: { webhookEventId: string }) => {
      calls += 1;
      return `done:${event.webhookEventId}`;
    };
    const store = createPersistenceLayer({ tableName: IDEMPOTENCY_TABLE, awsSdkV3Client: ddb });
    const idem = makeEventIdempotent(inner, store, createIdempotencyConfig());

    expect(await idem({ webhookEventId: "evt-A" })).toBe("done:evt-A");
    expect(await idem({ webhookEventId: "evt-A" })).toBe("done:evt-A");
    expect(calls).toBe(1);

    await idem({ webhookEventId: "evt-B" });
    expect(calls).toBe(2);
  });
});
