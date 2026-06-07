/**
 * Pure routing helpers (no LIFF/DOM imports, so they're unit-testable). The SPA uses the History API
 * — NO `#` fragment routing (LIFF forbids it) — so a route is just `location.pathname`.
 *
 * Deep links open as `https://liff.line.me/{liffId}/p/{id}`. LIFF delivers the path after the LIFF
 * ID either as the real pathname (…/p/{id}) once it has redirected, or — on the primary redirect —
 * inside the `liff.state` query parameter (urlencoded). {@link resolveInitialPath} normalizes both.
 */

/** The view a path maps to. */
export type Route = { readonly name: "list" } | { readonly name: "detail"; readonly id: string };

/** Strip a trailing slash (but keep "/"). */
function normalize(path: string): string {
  return path.replace(/\/+$/, "") || "/";
}

/**
 * The initial route path after `liff.init()` resolves. Prefer a concrete non-root `pathname`; else
 * decode a `liff.state` query param (keeping only its path, dropping any query/fragment); else "/".
 * Never returns an off-site path — anything not starting with "/" falls back to "/".
 */
export function resolveInitialPath(pathname: string, search: string): string {
  const path = normalize(pathname);
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
      return normalize(justPath);
    }
  }
  return "/";
}

/** Parse a route path into a view descriptor. Unknown paths fall back to the List. */
export function parseRoute(path: string): Route {
  const match = /^\/p\/([^/]+)$/.exec(normalize(path));
  if (match?.[1] !== undefined) {
    try {
      return { name: "detail", id: decodeURIComponent(match[1]) };
    } catch {
      return { name: "detail", id: match[1] };
    }
  }
  return { name: "list" };
}

/** The path for a property's detail view (used for in-app navigation + deep links). */
export function detailPath(propertyId: string): string {
  return `/p/${encodeURIComponent(propertyId)}`;
}
