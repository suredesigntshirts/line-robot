import { defineConfig, devices } from "@playwright/test";

// The LIFF-SPA frontend gate (plan-20 net, ported). Boots e2e/server.mjs serving the REAL `dist-e2e/`
// build (LIFF SDK aliased to the mock, api base pinned to a route Playwright intercepts). LIFF renders
// inside LINE's in-app WebView (mobile, old Thai-Android Chrome) — so the projects are MOBILE,
// light + dark (the dark-mode CTA-contrast pairing is checked too). No pixel baselines — we assert
// theme-applies / TH-07 / contrast / hydration / no-broken-images / no-JS-errors INVARIANTS and
// capture a gallery for the perceptual /frontend-review mock-diff pass.

const PORT = Number(process.env.E2E_PORT || 4330);
const baseURL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./e2e",
  testMatch: "**/*.spec.ts",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: [["dot"], ["json", { outputFile: "test-results/results.json" }]],
  outputDir: "test-results/artifacts",
  use: {
    baseURL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "off",
  },
  projects: [
    { name: "mobile-light", use: { ...devices["Pixel 7"], colorScheme: "light" } },
    { name: "mobile-dark", use: { ...devices["Pixel 7"], colorScheme: "dark" } },
  ],
  webServer: {
    command: "node e2e/server.mjs",
    cwd: import.meta.dirname,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    stdout: "pipe",
    stderr: "pipe",
  },
});
