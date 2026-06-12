import { getDb, getPublicListingDetail, type PublicListingDetail } from "@line-robot/db";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Detail loader shared by the th/en routes. "missing" covers malformed ids too —
 * a junk id is a 404, not a pg uuid-cast 500. "unavailable" = DB down (503).
 */
export async function loadDetail(
  id: string,
  locale: "th" | "en",
): Promise<
  { kind: "ok"; detail: PublicListingDetail } | { kind: "missing" } | { kind: "unavailable" }
> {
  if (!UUID.test(id)) return { kind: "missing" };
  try {
    const detail = await getPublicListingDetail(getDb(), id, locale);
    return detail ? { kind: "ok", detail } : { kind: "missing" };
  } catch (error) {
    console.error("detail query failed:", error);
    return { kind: "unavailable" };
  }
}
