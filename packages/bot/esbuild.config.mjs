import { build } from "esbuild";

// Bundle each Lambda entrypoint into a single ESM file. We bundle the AWS SDK too (rather than
// rely on the runtime-provided copy) so deployed versions are pinned and reproducible.
const common = {
  bundle: true,
  platform: "node",
  target: "node22",
  format: "esm",
  sourcemap: true,
  minify: true,
  // Shim require() for any transitive CJS deps that use it inside an ESM bundle.
  banner: {
    js: "import { createRequire } from 'node:module'; const require = createRequire(import.meta.url);",
  },
};

await Promise.all([
  build({ ...common, entryPoints: ["src/lambda/ingest.ts"], outfile: "dist/ingest/index.mjs" }),
  build({
    ...common,
    entryPoints: ["src/lambda/processor.ts"],
    outfile: "dist/processor/index.mjs",
  }),
  build({ ...common, entryPoints: ["src/lambda/sweep.ts"], outfile: "dist/sweep/index.mjs" }),
  // Operational CLI (not deployed): the rich-menu setup. Bundled so it can be run with plain `node`.
  build({
    ...common,
    minify: false,
    entryPoints: ["scripts/setup-rich-menu.ts"],
    outfile: "dist/scripts/setup-rich-menu.mjs",
  }),
]);

console.log("Built dist/{ingest,processor,sweep}/index.mjs + dist/scripts/setup-rich-menu.mjs");
