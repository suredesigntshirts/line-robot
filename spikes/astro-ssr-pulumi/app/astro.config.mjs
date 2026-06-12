import node from "@astrojs/node";
import { defineConfig } from "astro/config";

// SSR ("server") output so routes render per-request. The @astrojs/node adapter in `middleware`
// mode emits a stable Node-style `handler(req, res, next)` at dist/server/entry.mjs — our Lambda
// shim (../src/lambda.mjs) wraps that, so we take zero third-party *deploy* tooling (no SST).
export default defineConfig({
  output: "server",
  adapter: node({ mode: "middleware" }),
});
