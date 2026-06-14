// E2E static server for the LIFF-SPA frontend gate (plan-20 net, ported). Serves the REAL built SPA
// (`dist-e2e/` — built with `--mode e2e`, the LIFF SDK aliased to the mock, the api base pinned to a
// route Playwright intercepts). SPA fallback: any non-asset path (e.g. `/p/{id}`) serves index.html so
// the History-API router resolves it client-side — faithfully reproducing the CloudFront SPA-rewrite.
//
// NOT `vite dev` (different pipeline). Needs a built `dist-e2e/` (the test:e2e script runs the build).

import { existsSync } from "node:fs";
import http from "node:http";
import { fileURLToPath } from "node:url";
import sirv from "sirv";

const DIST = fileURLToPath(new URL("../dist-e2e", import.meta.url));
const PORT = Number(process.env.E2E_PORT || 4330);

if (!existsSync(DIST)) {
  console.error(`[miniapp-e2e] missing build at ${DIST} — run \`vite build --mode e2e\` first`);
  process.exit(1);
}

// `single: true` → SPA fallback to index.html for unmatched paths (the /p/{id} routes). Assets under
// /assets/* are served with their hashed-immutable headers.
const serve = sirv(DIST, { single: true, dev: false, etag: true });

const server = http.createServer((req, res) => {
  serve(req, res, () => {
    res.statusCode = 404;
    res.end("not found");
  });
});

server.listen(PORT, () => {
  console.log(`[miniapp-e2e] serving ${DIST} on http://localhost:${PORT}`);
});
