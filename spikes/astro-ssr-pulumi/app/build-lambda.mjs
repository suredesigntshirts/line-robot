// Bundle the Lambda shim (src/lambda.mjs) + the Astro server build into ONE handler file for Lambda.
// Output: dist-lambda/server/index.mjs exporting `handler`. Pulumi zips dist-lambda/ as the code.
//
// GOTCHA: @astrojs/node's runtime walks up from import.meta.url to find a "server" directory
// segment (to locate the sibling "client" static-asset dir). Bundling to a flat file breaks that —
// it throws "Could not find the server directory". Fix per the adapter's own error message: emit
// into a path that CONTAINS a `server/` segment, and provide a sibling (here empty) `client/` dir.
//
// Run AFTER `astro build` (needs app/dist/server/entry.mjs to exist).

import { existsSync, mkdirSync, rmSync } from "node:fs";
import { build } from "esbuild";

if (!existsSync(new URL("./dist/server/entry.mjs", import.meta.url))) {
  console.error("Missing dist/server/entry.mjs — run `npm run build` (astro build) first.");
  process.exit(1);
}

rmSync(new URL("./dist-lambda", import.meta.url), { recursive: true, force: true });
// Empty client/ sibling: this app ships no static client assets, but the adapter resolves the dir.
mkdirSync(new URL("./dist-lambda/client", import.meta.url), { recursive: true });

await build({
  entryPoints: [new URL("./src/lambda.mjs", import.meta.url).pathname],
  bundle: true,
  platform: "node",
  target: "node22",
  format: "esm",
  outfile: new URL("./dist-lambda/server/index.mjs", import.meta.url).pathname,
  // Keep Node built-ins external; bundle everything else (Astro runtime) into one file.
  // `__dirname`/`import.meta.url` shimming: esbuild handles ESM output natively.
  banner: {
    js: "import { createRequire as __cr } from 'module'; const require = __cr(import.meta.url);",
  },
  logLevel: "info",
});

console.log("Bundled -> dist-lambda/server/index.mjs  (Lambda handler = server/index.handler)");
