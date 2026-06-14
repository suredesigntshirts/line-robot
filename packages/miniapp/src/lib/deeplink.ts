/**
 * Pure routing helpers (no LIFF/DOM imports, so they're unit-testable). The SPA uses the History API
 * — NO `#` fragment routing (LIFF forbids it) — so a route is just `location.pathname`.
 *
 * ROUTE-SHAPE FREEZE (Stage 5 open-question ruling): `/` = my-listings, `/p/{id}` = detail. These are
 * the EXACT shapes plan-17's Flex deep links and the rich-menu tabs already resolve to, so existing
 * chat links keep working with no Flex-template change. Claim/saved/viewings are ADDITIVE routes
 * (Build C/D) — added to {@link parseRoute}'s table without touching the two frozen shapes.
 *
 * Deep links open as `https://liff.line.me/{liffId}/p/{id}`. LIFF delivers the path after the LIFF
 * ID either as the real pathname (…/p/{id}) once it has redirected, or — on the primary redirect —
 * inside the `liff.state` query parameter (urlencoded). {@link resolveInitialPath} normalizes both.
 */

/** The view a path maps to. Additive routes (claim/edit) extend this union; saved/viewings are TABS
 * within the list shell (`/`), not their own routes (the rich-menu/Flex deep links never target them). */
export type Route =
  | { readonly name: "list" }
  | { readonly name: "detail"; readonly id: string }
  | { readonly name: "claim"; readonly id: string }
  | { readonly name: "edit"; readonly id: string }
  | { readonly name: "quote"; readonly id: string };

/** Strip a trailing slash (but keep "/"). */
export function normalizePath(path: string): string {
  return path.replace(/\/+$/, "") || "/";
}

/**
 * The initial route path after `liff.init()` resolves. Prefer a concrete non-root `pathname`; else
 * decode a `liff.state` query param (keeping only its path, dropping any query/fragment); else "/".
 * Never returns an off-site path — anything not starting with "/" falls back to "/".
 */
export function resolveInitialPath(pathname: string, search: string): string {
  const path = normalizePath(pathname);
  if (path !== "/") {
    return path;
  }
  const state = new URLSearchParams(search).get("liff.state");
  if (state !== null && state !== "") {
    let decoded = state;
    try {
      decoded = decodeURIComponent(state);
    } catch {
      // leave as-is if it wasn't valid percent-encoding
    }
    const justPath = decoded.split(/[?#]/)[0] ?? "";
    if (justPath.startsWith("/")) {
      return normalizePath(justPath);
    }
  }
  return "/";
}

/** Decode a captured path segment, falling back to the raw segment if it isn't valid %-encoding. */
function decodeId(raw: string): string {
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

/** Parse a route path into a view descriptor. Unknown paths fall back to the List. The CLAIM route
 * (`/claim/{id}`, Build C) is ADDITIVE — checked alongside the frozen `/p/{id}` detail; neither frozen
 * shape changed (the plan-17 Flex deep links + rich-menu tabs still resolve). */
export function parseRoute(path: string): Route {
  const normalized = normalizePath(path);
  const detail = /^\/p\/([^/]+)$/.exec(normalized);
  if (detail?.[1] !== undefined) {
    return { name: "detail", id: decodeId(detail[1]) };
  }
  const claim = /^\/claim\/([^/]+)$/.exec(normalized);
  if (claim?.[1] !== undefined) {
    return { name: "claim", id: decodeId(claim[1]) };
  }
  const edit = /^\/edit\/([^/]+)$/.exec(normalized);
  if (edit?.[1] !== undefined) {
    return { name: "edit", id: decodeId(edit[1]) };
  }
  const quote = /^\/quote\/([^/]+)$/.exec(normalized);
  if (quote?.[1] !== undefined) {
    return { name: "quote", id: decodeId(quote[1]) };
  }
  return { name: "list" };
}

/** The path for a listing's detail view (used for in-app navigation + deep links). FROZEN shape. */
export function detailPath(listingId: string): string {
  return `/p/${encodeURIComponent(listingId)}`;
}

/** The path for a listing's CLAIM screen (`/claim/{id}`, Build C). The bot DMs this; the SPA navigates
 * to it post-claim's parent (My Listings) on completion. ADDITIVE — the frozen shapes are untouched. */
export function claimPath(listingId: string): string {
  return `/claim/${encodeURIComponent(listingId)}`;
}

/** The path for a listing's owner EDIT screen (`/edit/{id}`, Build D). Reached from the my-listings
 * card + the detail screen (owner only). ADDITIVE — the frozen shapes are untouched; this is the
 * mini-app edit surface that replaced edit-by-reply (A3a). */
export function editPath(listingId: string): string {
  return `/edit/${encodeURIComponent(listingId)}`;
}

/** The path for a vetted broker's QUOTE-RESPONSE screen (`/quote/{id}`, Stage 6 / D10). The bot's
 * quick-quote Flex push (INC-B4) deep-links a matched vetted broker here to submit a structured offer.
 * ADDITIVE — the frozen plan-17 shapes (`/`, `/p/{id}`, `/claim/{id}`, `/edit/{id}`) are untouched. */
export function quotePath(listingId: string): string {
  return `/quote/${encodeURIComponent(listingId)}`;
}
