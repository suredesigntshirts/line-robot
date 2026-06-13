import { dirname, join } from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import pg from "pg";
import { pgConnectionConfig } from "./rdsCa.ts";

// `npm run db:migrate` — apply the committed drizzle migrations to DATABASE_URL.
// Standalone (own pool) so it never touches the Lambda's module-scope pool in pool.ts.
const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is not set");

const migrationsFolder = join(dirname(fileURLToPath(import.meta.url)), "../migrations");
const pool = new pg.Pool({ ...pgConnectionConfig(connectionString), max: 1 });

try {
  await migrate(drizzle(pool), { migrationsFolder });
  console.log("migrations applied");
} catch (error) {
  console.error("db:migrate failed:", error);
  process.exitCode = 1;
} finally {
  await pool.end();
}
