import { execFileSync } from "node:child_process";
import pg from "pg";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** Run `docker <args>`, ignoring failure (e.g. removing a container that doesn't exist yet). */
function tryDocker(args: string[]): void {
  try {
    execFileSync("docker", args, { stdio: "ignore" });
  } catch {
    /* ignore — container may not exist yet */
  }
}

/** Start postgis/postgis in `containerName` on a docker-assigned free host port. */
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
      "-e",
      "POSTGRES_PASSWORD=test",
      "-e",
      "POSTGRES_DB=linerobot",
      "-p",
      "127.0.0.1::5432",
      "postgis/postgis:17-3.5",
    ],
    { stdio: "ignore" },
  );
  const mapping = execFileSync("docker", ["port", containerName, "5432/tcp"], {
    encoding: "utf8",
  }).trim();
  const hostPort = (mapping.split("\n")[0] ?? "").split(":").pop();
  if (hostPort === undefined || hostPort === "") {
    throw new Error(`Could not resolve mapped port from docker output: ${mapping}`);
  }
  return `postgres://postgres:test@127.0.0.1:${hostPort}/linerobot`;
}

async function waitForReady(connectionString: string): Promise<void> {
  for (let attempt = 0; attempt < 120; attempt += 1) {
    const client = new pg.Client({ connectionString });
    try {
      await client.connect();
      await client.query("SELECT 1");
      await client.end();
      return;
    } catch {
      await client.end().catch(() => {});
      await sleep(500);
    }
  }
  throw new Error("Postgres container did not become ready in time");
}

/**
 * Start a fresh PostGIS container and return its connection string. The caller
 * runs migrations and tears down with {@link stopPostgresLocal} in `afterAll`.
 * Each suite passes its own `containerName` so suites run concurrently.
 */
export async function startPostgresLocal(containerName: string): Promise<string> {
  const connectionString = startContainer(containerName);
  await waitForReady(connectionString);
  return connectionString;
}

/** Force-remove the container (idempotent) — for `afterAll` teardown. */
export function stopPostgresLocal(containerName: string): void {
  tryDocker(["rm", "-f", containerName]);
}
