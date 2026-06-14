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

/** The view a path maps to. Additive routes (claim/saved/viewings) extend this union in Build C/D. */
export type Route = { readonly name: "list" } | { readonly name: "detail"; readonly id: string };

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

/** Parse a route path into a view descriptor. Unknown paths fall back to the List. */
export function parseRoute(path: string): Route {
  const match = /^\/p\/([^/]+)$/.exec(normalizePath(path));
  if (match?.[1] !== undefined) {
    try {
      return { name: "detail", id: decodeURIComponent(match[1]) };
    } catch {
      return { name: "detail", id: match[1] };
    }
  }
  return { name: "list" };
}

/** The path for a listing's detail view (used for in-app navigation + deep links). FROZEN shape. */
export function detailPath(listingId: string): string {
  return `/p/${encodeURIComponent(listingId)}`;
}
