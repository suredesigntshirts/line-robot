// In-process SSR smoke over the EXACT bundled artifact Lambda runs (dist-lambda/server/index.mjs).
// Proves per-request rendering, the React island integration, locale routing, and the JSON
// endpoint — without AWS. Run via `npm run test:ssr` (builds first).

import assert from "node:assert/strict";

const { handler } = await import("../dist-lambda/server/index.mjs");

const event = (rawPath, extra = {}) => ({
  rawPath,
  rawQueryString: "",
  headers: { host: "local.test" },
  requestContext: { http: { method: "GET" } },
  ...extra,
});

let pass = 0;
const check = (name, cond) => {
  assert.ok(cond, name);
  pass += 1;
  console.log(`PASS  ${name}`);
};

// No DATABASE_URL in this smoke — the browse page must degrade to ErrorState, not 500.
delete process.env.DATABASE_URL;

const home = await handler(event("/"));
check("GET / returns 200", home.statusCode === 200);
check("GET / is HTML", /text\/html/.test(home.headers["content-type"] ?? ""));
check("GET / is Thai by default", home.body.includes('lang="th"'));
check("DB-less render degrades to ErrorState", home.body.includes('data-state="error"'));
check("filter island rendered (React SSR)", home.body.includes("astro-island"));
check("canonical present", home.body.includes('rel="canonical"'));
check("hreflang pair present", home.body.includes('hreflang="en"'));

const home2 = await handler(event("/"));
const stamp = (b) => b.match(/data-rendered-at="([^"]+)"/)?.[1];
check(
  "per-request SSR (timestamps differ)",
  stamp(home.body) !== undefined && stamp(home.body) !== stamp(home2.body),
);

const en = await handler(event("/en/"));
check("GET /en/ returns 200", en.statusCode === 200);
check("GET /en/ is English", en.body.includes('lang="en"'));

const health = await handler(event("/healthz"));
check(
  "GET /healthz returns 200 JSON",
  health.statusCode === 200 && /json/.test(health.headers["content-type"] ?? ""),
);
check("healthz body ok", JSON.parse(health.body).ok === true);

const missing = await handler(event("/no-such-page"));
check("unknown route is 404", missing.statusCode === 404);

console.log(`ALL ${pass} SSR SMOKE CHECKS PASSED`);
