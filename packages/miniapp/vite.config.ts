import preact from "@preact/preset-vite";
import { defineConfig } from "vite";

// The SPA is served from the CloudFront root (the LIFF Endpoint URL), so assets resolve from "/".
// VITE_LIFF_ID + VITE_READ_API_URL are baked at build time (both public) — see .env.example.
export default defineConfig({
  base: "/",
  plugins: [preact()],
  build: {
    outDir: "dist",
    sourcemap: true,
  },
});
