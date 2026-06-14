import { build } from "esbuild";

// Bundle the mini-app API Lambda into a single ESM file (model: packages/bot's read-api). The AWS SDK
// is bundled (not the runtime copy) so deployed versions are pinned and reproducible. `pg-native` is
// pg's optional native binding — never installed — so it stays external; `sharp` isn't used here.
const common = {
  bundle: true,
  external: ["pg-native"],
  platform: "node",
  target: "node22",
  format: "esm",
  sourcemap: true,
  minify: true,
  // Shim require() for any transitive CJS deps that call it inside an ESM bundle.
  banner: {
    js: "import { createRequire } from 'node:module'; const require = createRequire(import.meta.url);",
  },
};

await build({
  ...common,
  entryPoints: ["src/lambda/api.ts"],
  outfile: "dist/api/index.mjs",
});

console.log("Built dist/api/index.mjs");
