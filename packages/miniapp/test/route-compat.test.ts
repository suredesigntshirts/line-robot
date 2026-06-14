/**
 * ROUTE-COMPAT SAFETY NET (Stage 5, Build E — the spec's "v1 retired/parked" DoD bullet).
 *
 * The bot emits MINI App deep links from two places:
 *   - the Flex card / claim-DM builders in `packages/bot/src/core/handlers/views.ts`
 *     (`catalogDeepLink` → `/p/{id}`, `claimDeepLink` → `/claim/{id}`), and
 *   - the rich-menu builder in `packages/bot/src/adapters/line/richMenu.ts` (the optional
 *     "Catalog" tab is a `uri` action that opens the MINI App base).
 * The rebuilt SPA router is `parseRoute` (`src/lib/deeplink.ts`), which resolves `/`, `/p/{id}`,
 * `/claim/{id}`, `/edit/{id}` and falls THROUGH to the List for anything else.
 *
 * This test asserts that EVERY MINI App path shape the bot's builders actually emit resolves in the
 * SPA router to a SPECIFIC route (never the fall-through-to-list default, unless the bot deliberately
 * opened the bare base `/`). It is DATA-DRIVEN: the path shapes are produced by INVOKING the real bot
 * builders (not a hand-maintained list), so if a future bot builder emits a MINI App path the SPA
 * router doesn't handle, this test FAILS — that is the whole point of the safety net.
 *
 * It imports the bot's pure builders by RELATIVE cross-package path (not a `@line-robot/bot` package
 * dependency): the bot is a backend Lambda; pulling its AWS/LINE-SDK dependency graph into this
 * frontend SPA package would be the wrong coupling. The imported builders are pure (the only
 * transitive runtime import is `@line-robot/shared`'s datetime constants — hoisted, AWS-free), so a
 * relative import is the lightest seam that still reads from the SINGLE source of truth on each side.
 */

import { describe, expect, it } from "vitest";
import { buildRichMenu } from "../../bot/src/adapters/line/richMenu.ts";
import { catalogDeepLink, claimDeepLink } from "../../bot/src/core/handlers/views.ts";
import { normalizePath, parseRoute, type Route } from "../src/lib/deeplink.ts";

// A representative MINI App base URL + listing id. The bot is configured with a `miniappUrl` like
// `https://miniapp.line.me/{liffId}`; the id stands in for a real Postgres/listing id.
const BASE = "https://miniapp.line.me/2010316767-rdtwc5y3";
const ID = "11111111-1111-1111-1111-111111111111";

/** Strip the configured MINI App base off an emitted deep link, leaving the SPA-relative path the
 * webview router actually sees (e.g. `https://…/{liffId}/p/{id}` → `/p/{id}`). Returns undefined for
 * a URL that doesn't target the configured base (a non-MINI-App link the SPA never routes). */
function pathOf(uri: string): string | undefined {
  if (!uri.startsWith(BASE)) {
    return undefined;
  }
  const rest = uri.slice(BASE.length);
  return rest === "" ? "/" : rest;
}

/**
 * Every MINI App link the bot's builders EMIT, derived by invoking the real builders (data-driven —
 * no hardcoded path list that could silently diverge from the bot). Each entry carries the SPA
 * relative path and a label for failure messages. Adding a new bot builder that emits a MINI App
 * deep link should be reflected here by invoking it — and then the assertions below prove the SPA
 * handles whatever it emits.
 */
function botEmittedMiniAppPaths(): { label: string; path: string }[] {
  const out: { label: string; path: string }[] = [];

  // 1. The Flex card / detail "Open in Catalog" deep link.
  const catalog = catalogDeepLink(BASE, ID);
  if (catalog !== undefined) {
    const p = pathOf(catalog);
    expect(p, "catalogDeepLink must target the configured MINI App base").toBeDefined();
    out.push({ label: "catalogDeepLink (Flex card → detail)", path: p as string });
  }

  // 2. The claim-DM deep link.
  const claim = claimDeepLink(BASE, ID);
  if (claim !== undefined) {
    const p = pathOf(claim);
    expect(p, "claimDeepLink must target the configured MINI App base").toBeDefined();
    out.push({ label: "claimDeepLink (claim DM → claim screen)", path: p as string });
  }

  // 3. The rich-menu "Catalog" tab — the only rich-menu area that opens a MINI App URI (the rest are
  //    postbacks the bot's PostbackRouter handles, never SPA routes). Derived from the real builder.
  //    The LINE SDK types `areas`/`action.uri` loosely (a wide `Action` union), so narrow defensively.
  const menu = buildRichMenu({ liffUrl: BASE });
  for (const area of menu.areas ?? []) {
    const action = area.action;
    if (action?.type === "uri" && "uri" in action && typeof action.uri === "string") {
      const label = "label" in action ? action.label : "Catalog";
      const p = pathOf(action.uri);
      expect(p, `rich-menu uri tab "${label}" must target the MINI App base`).toBeDefined();
      out.push({ label: `rich-menu tab "${label}"`, path: p as string });
    }
  }

  return out;
}

describe("route-compat: every bot-emitted MINI App path resolves in the SPA router", () => {
  const emitted = botEmittedMiniAppPaths();

  it("the bot emits at least the catalog + claim + rich-menu Catalog deep links", () => {
    // A floor so a refactor that accidentally stops emitting deep links can't make the suite vacuous.
    const labels = emitted.map((e) => e.label);
    expect(labels).toContain("catalogDeepLink (Flex card → detail)");
    expect(labels).toContain("claimDeepLink (claim DM → claim screen)");
    expect(labels.some((l) => l.startsWith('rich-menu tab "Catalog"'))).toBe(true);
  });

  it.each(
    emitted,
  )("$label → path $path resolves to a specific SPA route (not the fall-through list)", ({
    path,
  }) => {
    const route = parseRoute(path);
    // The ONLY path that may legitimately resolve to the List is the bare base "/". Any deeper path
    // the bot deep-links to MUST resolve to a specific, non-default route — otherwise the bot is
    // shipping a link the SPA silently drops to the listings screen (a broken deep link).
    if (normalizePath(path) === "/") {
      expect(route).toEqual<Route>({ name: "list" });
    } else {
      expect(
        route.name,
        `bot emits "${path}" but the SPA router falls it through to the list — the SPA does not handle this deep link`,
      ).not.toBe("list");
    }
  });

  it("each bot deep link carries the listing id through to the SPA route", () => {
    // The id must survive the round-trip (a detail/claim deep link that loses its id is broken).
    for (const { path, label } of emitted) {
      if (normalizePath(path) === "/") {
        continue;
      }
      const route = parseRoute(path);
      expect("id" in route, `${label} should resolve to an id-bearing route`).toBe(true);
      if ("id" in route) {
        expect(route.id, `${label} must carry the listing id`).toBe(ID);
      }
    }
  });
});

describe("route-compat BITES: an unhandled bot path would fail the net", () => {
  // Proof the safety net is not vacuous: a hypothetical FUTURE bot builder that deep-links to a path
  // the SPA router doesn't handle (e.g. `/gallery/{id}`) falls through to the List — which the
  // per-path assertion above treats as a FAILURE. We assert that fall-through here directly, so the
  // mechanism that catches divergence is itself proven to catch it.
  it("a MINI App path the SPA doesn't handle resolves to the fall-through list (would trip the net)", () => {
    const unhandled = `/gallery/${ID}`; // a plausible path a future bot builder might emit
    expect(parseRoute(unhandled)).toEqual<Route>({ name: "list" });
    // …and that is exactly the condition the per-path test rejects for any non-"/" path:
    expect(normalizePath(unhandled)).not.toBe("/");
    expect(parseRoute(unhandled).name).toBe("list"); // → the per-path `.not.toBe("list")` would FAIL
  });

  it("every CURRENTLY emitted deep link is on the handled side of that line", () => {
    // The dual of the bite proof: none of today's real bot deep links land on the fall-through.
    for (const { path } of botEmittedMiniAppPaths()) {
      if (normalizePath(path) === "/") {
        continue;
      }
      expect(parseRoute(path).name).not.toBe("list");
    }
  });
});
