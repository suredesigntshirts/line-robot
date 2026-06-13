import { execFileSync } from "node:child_process";
import { cpSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { build } from "esbuild";

// Bundle each Lambda entrypoint into a single ESM file. We bundle the AWS SDK too (rather than
// rely on the runtime-provided copy) so deployed versions are pinned and reproducible.
//
// Build-host note: `@esbuild/linux-x64` is pinned as an explicit devDependency in package.json on
// purpose — it's esbuild's native binary for the x86_64 build host. It looks like a redundant
// platform-specific dep, but pruning it breaks this bundle on CI/deploy. Do not remove it.
const common = {
  bundle: true,
  // pg's optional native binding — never installed; require('pg-native') must stay external.
  external: ["pg-native", "sharp"],
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
  build({
    ...common,
    entryPoints: ["src/lambda/reminder.ts"],
    outfile: "dist/reminder/index.mjs",
  }),
  build({
    ...common,
    entryPoints: ["src/lambda/read-api.ts"],
    outfile: "dist/read-api/index.mjs",
  }),
  // Operational CLI (not deployed): the rich-menu setup. Bundled so it can be run with plain `node`.
  build({
    ...common,
    minify: false,
    entryPoints: ["scripts/setup-rich-menu.ts"],
    outfile: "dist/scripts/setup-rich-menu.mjs",
  }),
]);

console.log(
  "Built dist/{ingest,processor,sweep,reminder,read-api}/index.mjs + dist/scripts/setup-rich-menu.mjs",
);

// sharp on the sweep Lambda (A2 / D2.7 image derivatives). esbuild keeps `sharp` external, so its
// native binaries ship as a SIBLING node_modules in dist/sweep ONLY — no other Lambda imports it.
// Install in an ISOLATED temp dir outside the monorepo (running `npm install` inside dist/sweep
// makes npm walk up to the workspace root and re-run its installs — which breaks), then copy the
// native packages in. Cross-platform fetch (arm64 from an x86 host) is proven in
// spikes/sharp-lambda-packaging. The wasm fallback is pruned to stay well inside Lambda's 250MB cap.
const sweepDir = resolve("dist/sweep");
const sharpTmp = mkdtempSync(resolve(tmpdir(), "sweep-sharp-"));
writeFileSync(
  resolve(sharpTmp, "package.json"),
  JSON.stringify({ name: "sharp-fetch", private: true }),
);
execFileSync("npm", ["install", "--no-package-lock", "--os=linux", "--cpu=arm64", "sharp@0.35.1"], {
  cwd: sharpTmp,
  stdio: "inherit",
});
// Clear any prior copy first — cpSync can't merge over the existing `.bin` symlinks (EEXIST on rebuild).
rmSync(resolve(sweepDir, "node_modules"), { recursive: true, force: true });
cpSync(resolve(sharpTmp, "node_modules"), resolve(sweepDir, "node_modules"), { recursive: true });
rmSync(resolve(sweepDir, "node_modules/@img/sharp-wasm32"), { recursive: true, force: true });
// Drop npm's `.bin` CLI shims: unused at runtime (`require('sharp')` never touches them) and their
// dangling symlinks break Pulumi's archive-hash walk (stat of a missing target).
rmSync(resolve(sweepDir, "node_modules/.bin"), { recursive: true, force: true });
rmSync(sharpTmp, { recursive: true, force: true });
console.log("Installed sharp arm64 binaries into dist/sweep/node_modules (sweep only)");
