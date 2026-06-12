import { specCatalog } from "../synthetic/catalog.ts";
import type { ListingSpec } from "../synthetic/spec.ts";
import type { SeedIngestor } from "./SeedIngestor.ts";

/** Primary seed source: the deterministic synthetic catalog (D-S1-9). */
export function syntheticIngestor(count = 24): SeedIngestor {
  return {
    source: "synthetic",
    fetchSpecs: (): Promise<ListingSpec[]> => Promise.resolve(specCatalog(count)),
  };
}
