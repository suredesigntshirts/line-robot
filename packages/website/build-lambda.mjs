// Bundle the Lambda shim (src/lambda.mjs) + the Astro server build into ONE handler file.
// Output: dist-lambda/server/index.mjs exporting `handler`, with dist/client/** copied to the
// sibling client/ dir. Pulumi zips dist-lambda/ as the Lambda code.
//
// GOTCHA (spike #1): @astrojs/node's runtime walks up from import.meta.url for a "server"
// directory segment to locate the sibling "client" static-asset dir — the output path MUST
// contain `server/` and a sibling `client/` must exist.
//
// Run AFTER `astro build` (needs dist/server/entry.mjs to exist).

import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs";
import { build } from "esbuild";

if (!existsSync(new URL("./dist/server/entry.mjs", import.meta.url))) {
  console.error("Missing dist/server/entry.mjs — run `astro build` first.");
  process.exit(1);
}

rmSync(new URL("./dist-lambda", import.meta.url), { recursive: true, force: true });
mkdirSync(new URL("./dist-lambda/client", import.meta.url), { recursive: true });
// NOTE: middleware-mode @astrojs/node does NOT serve static files — this copy only satisfies
// the adapter's resolveClientDir walk (and prerendered error pages). /_astro/* asset requests
// 404 at the Lambda; S4-I6 routes them to S3 via CloudFront, which is the only public path
// anyway (account guardrail blocks direct Function URLs).
if (existsSync(new URL("./dist/client", import.meta.url))) {
  cpSync(
    new URL("./dist/client", import.meta.url),
    new URL("./dist-lambda/client", import.meta.url),
    {
      recursive: true,
    },
  );
}

await build({
  entryPoints: [new URL("./src/lambda.mjs", import.meta.url).pathname],
  bundle: true,
  platform: "node",
  target: "node22",
  format: "esm",
  outfile: new URL("./dist-lambda/server/index.mjs", import.meta.url).pathname,
  // Same native-dep rule as packages/bot: never bundle binaries into the artifact.
  external: ["pg-native", "sharp"],
  banner: {
    js: "import { createRequire as __cr } from 'module'; const require = __cr(import.meta.url);",
  },
  logLevel: "info",
});

console.log("Bundled -> dist-lambda/server/index.mjs  (Lambda handler = server/index.handler)");
