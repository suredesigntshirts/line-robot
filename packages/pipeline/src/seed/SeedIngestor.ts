import type { ListingSpec } from "../synthetic/spec.ts";

/**
 * D-S1-9 (founder ruling): pluggable seed sources. An ingestor normalises one
 * source into ground-truth listing specs; the seeding pipeline turns specs
 * into Postgres fixtures. Two implementations exist from day one (synthetic +
 * CKAN open data), which is what justifies the interface.
 */
export interface SeedIngestor {
  /** Short source name recorded on fixtures (e.g. "synthetic", "ckan:led"). */
  source: string;
  fetchSpecs(): Promise<ListingSpec[]>;
}
