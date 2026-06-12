import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import type { Db } from "../pool.ts";

export { startPostgresLocal, stopPostgresLocal } from "./postgresLocal.ts";

/** Apply this package's committed migrations to `db` (integration-test bootstrap). */
export async function migrateDb(db: Db): Promise<void> {
  const migrationsFolder = join(dirname(fileURLToPath(import.meta.url)), "../../migrations");
  await migrate(db, { migrationsFolder });
}
