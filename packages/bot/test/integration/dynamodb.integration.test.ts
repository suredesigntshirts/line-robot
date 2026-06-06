import { execFileSync } from "node:child_process";
import { CreateTableCommand, DynamoDBClient, ListTablesCommand } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { DynamoMessageRepository } from "../../src/adapters/dynamodb/messageRepository.js";
import type { StoredMessage } from "../../src/core/domain/message.js";
import { createPersistenceLayer, makeEventIdempotent } from "../../src/lib/idempotency.js";

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
});

describe("idempotency", () => {
  it("runs a handler at most once per webhookEventId", async () => {
    let calls = 0;
    const inner = async (event: { webhookEventId: string }) => {
      calls += 1;
      return `done:${event.webhookEventId}`;
    };
    const store = createPersistenceLayer({ tableName: IDEMPOTENCY_TABLE, awsSdkV3Client: ddb });
    const idem = makeEventIdempotent(inner, store);

    expect(await idem({ webhookEventId: "evt-A" })).toBe("done:evt-A");
    expect(await idem({ webhookEventId: "evt-A" })).toBe("done:evt-A");
    expect(calls).toBe(1);

    await idem({ webhookEventId: "evt-B" });
    expect(calls).toBe(2);
  });
});
