import node from "@astrojs/node";
import react from "@astrojs/react";
import { defineConfig } from "astro/config";

// SSR output so routes render per-request on Lambda. The @astrojs/node adapter in `middleware`
// mode emits a stable Node-style `handler(req, res, next)` at dist/server/entry.mjs — our Lambda
// shim (src/lambda.mjs) wraps that, so deploys stay on our own Pulumi (DF-2 spike verdict).
//
// `site` is the canonical public origin for sitemap/canonical/hreflang URLs. Domain (D19) is a
// parked founder decision — until then SITE_URL (build-time env) or the CloudFront domain wins.
export default defineConfig({
  output: "server",
  adapter: node({ mode: "middleware" }),
  integrations: [react()],
  site: process.env.SITE_URL || "https://example.invalid",
  i18n: {
    locales: ["th", "en"],
    defaultLocale: "th",
    routing: { prefixDefaultLocale: false },
  },
  vite: {
    ssr: {
      // Native/binary deps must never be bundled into the Lambda artifact (same rule as the bot).
      external: ["pg-native", "sharp"],
    },
  },
});
