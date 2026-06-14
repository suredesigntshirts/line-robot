import { defineConfig, devices } from "@playwright/test";

// The REAL-BACKEND e2e suite (INC-2) — Phase-2 of the Stage-5 functional goal. Boots
// `e2e-api/server.mjs`, which serves the SAME built `dist-e2e/` SPA AND the actual packages/api
// `handleApi` over a SEEDED Docker Postgres on ONE port. The specs FORWARD the SPA's baked api origin
// (`https://e2e.api.local`) to that server (support.ts), so claim/publish + CRM round-trips prove REAL
// persistence + the real contract, not optimistic client UI against canned mocks.
//
// This suite proves FUNCTION, not style (the static gate at playwright.config.ts owns the
// theme/TH-07/contrast/colorScheme invariants + the perceptual gallery) — so ONE mobile project,
// light-only, headless. A DIFFERENT port than the static gate (4330) so the two never clash.

const PORT = Number(process.env.E2E_API_PORT || 4331);
const baseURL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./e2e-api",
  testMatch: "**/*.spec.ts",
  fullyParallel: false, // one shared seeded DB — serialise so a claim/publish in one spec can't race another
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: [["dot"], ["json", { outputFile: "test-results/results-realapi.json" }]],
  outputDir: "test-results/artifacts-realapi",
  use: {
    baseURL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "off",
  },
  projects: [{ name: "mobile-light", use: { ...devices["Pixel 7"], colorScheme: "light" } }],
  webServer: {
    command: "node e2e-api/server.mjs",
    cwd: import.meta.dirname,
    url: `${baseURL}/__ids`, // ready only after PG is up + the seed has run
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
    stdout: "pipe",
    stderr: "pipe",
    env: { E2E_API_PORT: String(PORT) },
  },
});
