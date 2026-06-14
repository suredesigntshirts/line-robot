import node from "@astrojs/node";
import react from "@astrojs/react";
import { defineConfig } from "astro/config";

// SSR output so routes render per-request on Lambda. The @astrojs/node adapter in `middleware`
// mode emits a stable Node-style `handler(req, res, next)` at dist/server/entry.mjs — our Lambda
// shim (src/lambda.mjs) wraps that, so deploys stay on our own Pulumi (DF-2 spike verdict).
//
// `site` is the canonical public origin for sitemap/canonical/hreflang URLs. Domain (D19) is a
// parked founder decision — until a real domain is purchased, the staging CloudFront domain is
// the canonical origin (founder-confirmed 2026-06-13). `SITE_URL` overrides it (set it to the
// real domain at build once D19 lands). The default must be a REAL origin, never a placeholder:
// a clean rebuild that fell back to example.invalid would silently ship a broken SEO bundle.
const STAGING_SITE_URL = "https://d15dpmhcgtrf1r.cloudfront.net";
export default defineConfig({
  output: "server",
  adapter: node({ mode: "middleware" }),
  integrations: [react()],
  // No dev toolbar — it must never pollute e2e / visual screenshots or hydration tests. It is
  // dev-only (absent from the built `dist/` we actually test), so this is belt-and-suspenders (plan 20).
  devToolbar: { enabled: false },
  site: process.env.SITE_URL || STAGING_SITE_URL,
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
