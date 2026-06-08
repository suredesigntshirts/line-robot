import { execFileSync } from "node:child_process";
import { DynamoDBClient, ListTablesCommand } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** Run `docker <args>`, ignoring failure (e.g. removing a container that doesn't exist yet). */
function tryDocker(args: string[]): void {
  try {
    execFileSync("docker", args, { stdio: "ignore" });
  } catch {
    /* ignore — container may not exist yet */
  }
}

/** Start DynamoDB Local in `containerName` on a docker-assigned free host port; return its endpoint URL. */
function startContainer(containerName: string): string {
  tryDocker(["rm", "-f", containerName]);
  execFileSync(
    "docker",
    [
      "run",
      "-d",
      "--rm",
      "--name",
      containerName,
      "-p",
      "127.0.0.1::8000",
      "amazon/dynamodb-local",
    ],
    { stdio: "ignore" },
  );
  const mapping = execFileSync("docker", ["port", containerName, "8000/tcp"], {
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

export interface DynamoDBLocal {
  readonly client: DynamoDBClient;
  readonly doc: DynamoDBDocumentClient;
}

/**
 * Start a fresh DynamoDB Local container, wait until it answers, and return a ready client + doc
 * client pointed at it. The caller owns table creation and tears the container down with
 * {@link stopDynamoDBLocal} in `afterAll`. Each integration suite passes its own `containerName` so
 * they can run concurrently without colliding.
 */
export async function startDynamoDBLocal(containerName: string): Promise<DynamoDBLocal> {
  const endpoint = startContainer(containerName);
  const client = new DynamoDBClient({
    endpoint,
    region: "us-east-1",
    credentials: { accessKeyId: "test", secretAccessKey: "test" },
  });
  const doc = DynamoDBDocumentClient.from(client);
  await waitForReady(client);
  return { client, doc };
}

/** Force-remove the container (idempotent) — for `afterAll` teardown. */
export function stopDynamoDBLocal(containerName: string): void {
  tryDocker(["rm", "-f", containerName]);
}
