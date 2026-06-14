import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// The SPA is served from the CloudFront root (the LIFF Endpoint URL), so assets resolve from "/".
// VITE_LIFF_ID + VITE_API_URL are baked at build time (both public) — see .env.example.
//
// Tailwind v4 runs via its Vite plugin (canon Finding 10 / TECH-06 — it matters MORE here: LIFF
// renders inside LINE's in-app WebView = old Thai-Android Chrome). The plugin compiles the shared
// `@line-robot/ui/theme.css` `@theme {}` block into :root tokens AND generates the utilities the
// screens are authored in. `src/global.css` is the entry that pulls `@import "tailwindcss"` + the
// shared theme; main.tsx imports it. React via @vitejs/plugin-react (one React stack — Preact retired).
//
// `mode === "e2e"` (the LIFF-SPA frontend gate, `vite build --mode e2e`): ALIAS `@line/liff` to the
// deterministic mock (e2e/mocks/liff.ts) so the gate renders the REAL artifact with the one LIFF-SDK
// boundary stubbed, and pin VITE_API_URL to a known origin Playwright `page.route` intercepts.
export default defineConfig(({ mode }) => {
  const isE2e = mode === "e2e";
  return {
    base: "/",
    plugins: [react(), tailwindcss()],
    define: isE2e
      ? {
          "import.meta.env.VITE_API_URL": JSON.stringify("https://e2e.api.local"),
          // The real liff.ts still reads VITE_LIFF_ID (it's the prod boot path; only the @line/liff
          // SDK is aliased). Give it a fixture so initLiff() doesn't throw "VITE_LIFF_ID is not set".
          "import.meta.env.VITE_LIFF_ID": JSON.stringify("0000000000-e2efixture"),
        }
      : {},
    resolve: isE2e
      ? {
          alias: {
            "@line/liff": fileURLToPath(new URL("./e2e/mocks/liff.ts", import.meta.url)),
          },
        }
      : {},
    build: {
      outDir: isE2e ? "dist-e2e" : "dist",
      sourcemap: true,
    },
  };
});
