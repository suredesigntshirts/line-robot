import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import pg from "pg";
import { pgConnectionConfig } from "./rdsCa.ts";

// ---------------------------------------------------------------------------
// D-S1-4: one module-scope pool per Lambda container, max 2 connections,
// keepAlive, lazy connect on first query. No RDS Proxy / pgBouncer at seed
// scale — concurrency × max MUST stay well under db.t4g.micro's ~85
// max_connections (recorded risk; revisit before Stage 2 batch fan-out).
// The pool lives in this one file so a future swap to RDS Proxy is localised.
// ---------------------------------------------------------------------------

export type Db = NodePgDatabase;

let pool: pg.Pool | undefined;
let db: Db | undefined;

/** Lazily create (once per process) the pool + drizzle instance from DATABASE_URL. */
export function getDb(connectionString = process.env.DATABASE_URL): Db {
  if (db) return db;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set and no connection string was provided");
  }
  pool = new pg.Pool({ ...pgConnectionConfig(connectionString), max: 2, keepAlive: true });
  db = drizzle(pool);
  return db;
}

/** Close the pool (tests / graceful shutdown). */
export async function closeDb(): Promise<void> {
  await pool?.end();
  pool = undefined;
  db = undefined;
}

/** Build a drizzle instance over a caller-owned pool (integration tests). */
export function dbFromPool(callerPool: pg.Pool): Db {
  return drizzle(callerPool);
}
