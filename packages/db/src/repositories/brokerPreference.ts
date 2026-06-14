import { eq, sql } from "drizzle-orm";
import type { Db } from "../pool.ts";
import { brokerPreferences } from "../schema.ts";

// Stage 6 (D-S6-6) — a broker/investor's quick-quote matching preferences (one row per user). The
// read side is `listApprovedVettedUsers` (users.ts), which joins these onto approved-vetted users to
// produce the `matchVettedUsers` candidate set. This file owns the write (upsert).

export type BrokerPreferenceRow = typeof brokerPreferences.$inferSelect;

export interface BrokerPreferenceInput {
  provinces: string[];
  propertyTypes: string[];
  priceBandIds: string[];
}

/** Upsert a user's matching preferences (empty array on an axis = "any"). On conflict (the user
 * already has a row) it overwrites all three arrays + bumps `updated_at` — preferences are a single
 * editable form, so a write fully replaces the prior state rather than merging. */
export async function setBrokerPreference(
  db: Db,
  userId: string,
  input: BrokerPreferenceInput,
): Promise<void> {
  await db
    .insert(brokerPreferences)
    .values({
      userId,
      provinces: input.provinces,
      propertyTypes: input.propertyTypes,
      priceBandIds: input.priceBandIds,
    })
    .onConflictDoUpdate({
      target: brokerPreferences.userId,
      set: {
        provinces: input.provinces,
        propertyTypes: input.propertyTypes,
        priceBandIds: input.priceBandIds,
        updatedAt: sql`now()`,
      },
    });
}

export async function getBrokerPreference(
  db: Db,
  userId: string,
): Promise<BrokerPreferenceRow | undefined> {
  const [row] = await db
    .select()
    .from(brokerPreferences)
    .where(eq(brokerPreferences.userId, userId));
  return row;
}
