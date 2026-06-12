import process from "node:process";
import { closeDb, getDb } from "@line-robot/db";
import { ckanIngestor } from "./ckanIngestor.ts";
import { seed } from "./seed.ts";
import { syntheticIngestor } from "./syntheticIngestor.ts";

// `npm run db:seed` — loads the synthetic catalog into DATABASE_URL.
// Set CKAN_DATASTORE_URL to also pull the open-data source (live network).
const ingestors = [syntheticIngestor()];
const ckanUrl = process.env.CKAN_DATASTORE_URL;
if (ckanUrl) ingestors.push(ckanIngestor(ckanUrl));

try {
  const summary = await seed(getDb(), ingestors);
  console.log(
    `seeded: ${summary.listings} listings, ${summary.users} users, ${summary.groups} groups` +
      ` (${summary.moderationFlagged} sale listings on no-sale deeds — FIELD-03 moderation candidates)`,
  );
} catch (error) {
  console.error("db:seed failed:", error);
  process.exitCode = 1;
} finally {
  await closeDb();
}
