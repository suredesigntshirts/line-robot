import { desc, eq } from "drizzle-orm";
import type { Db } from "../pool.ts";
import { quotes } from "../schema.ts";

// Stage 6 (D10) — structured quotes a vetted broker/investor submits in response to a quick-quote
// push. Stored verbatim; also feeds the Stage-7 AVM. The recipient set is computed server-side from
// approved-vetted users only (matchVettedUsers + listApprovedVettedUsers) — a quote can only ever be
// authored by an already-vetted user; that gate lives in packages/api, not here.

export type QuoteRow = typeof quotes.$inferSelect;

export interface NewQuoteInput {
  listingId: string;
  brokerUserId: string;
  amountThb: number;
  discountVsMarket?: number;
  termsNote?: string;
  status?: string;
}

export async function createQuote(db: Db, input: NewQuoteInput): Promise<QuoteRow> {
  const [created] = await db
    .insert(quotes)
    .values({
      listingId: input.listingId,
      brokerUserId: input.brokerUserId,
      amountThb: input.amountThb,
      discountVsMarket: input.discountVsMarket,
      termsNote: input.termsNote,
      status: input.status,
    })
    .returning();
  if (!created) throw new Error("quote insert returned no row");
  return created;
}

/** All quotes on a listing, newest first (the poster/admin review + the AVM feed). */
export async function listQuotesForListing(db: Db, listingId: string): Promise<QuoteRow[]> {
  return db
    .select()
    .from(quotes)
    .where(eq(quotes.listingId, listingId))
    .orderBy(desc(quotes.createdAt));
}
