import { defineConfig, devices } from "@playwright/test";

// Plan 20 — frontend e2e + visual-review gate. Two targets, ONE spec set:
//   • LOCAL  (default): boots test/e2e-server.mjs (seeded Docker PG + real build) on localhost.
//   • DEPLOYED: set E2E_BASE_URL=https://<cloudfront> — no webServer, tests hit the live site.
// The specs are DATA-DRIVEN (they discover listings from the rendered page, the DB's public
// projection), so the same suite runs against seeded test data now and live data later, unchanged.
//
// NOTE: no pixel-regression baselines — the design is still in flux (theme work ongoing). We assert
// INVARIANTS that survive theme churn (the theme applies, islands hydrate, no broken images, no JS
// errors) and CAPTURE a gallery for an LLM to review against the design direction. Snapshot baselines
// come later, at design lock-in.

const E2E_BASE_URL = process.env.E2E_BASE_URL?.replace(/\/$/, "");
const PORT = Number(process.env.E2E_PORT || 4321);
const baseURL = E2E_BASE_URL || `http://localhost:${PORT}`;
const isLocal = !E2E_BASE_URL;

const project = (
  name: string,
  device: object,
  colorScheme: "light" | "dark",
  viewport?: object,
) => ({
  name,
  use: { ...device, ...(viewport ? { viewport } : {}), colorScheme },
});

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: E2E_BASE_URL ? 1 : 0, // a deployed page can have a transient hiccup; local is deterministic
  workers: process.env.CI ? 2 : undefined,
  // Token-frugal for the agent loop: near-silent on green (`dot`), machine-readable failures to a
  // FILE the agent greps. No HTML reporter (nothing auto-opens/serves).
  reporter: [["dot"], ["json", { outputFile: "test-results/results.json" }]],
  outputDir: "test-results/artifacts",
  use: {
    baseURL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "off",
  },
  projects: [
    project("desktop-light", devices["Desktop Chrome"], "light", { width: 1280, height: 800 }),
    project("desktop-dark", devices["Desktop Chrome"], "dark", { width: 1280, height: 800 }),
    project("mobile-light", devices["Pixel 7"], "light"),
    project("mobile-dark", devices["Pixel 7"], "dark"),
  ],
  webServer: isLocal
    ? {
        command: "node test/e2e-server.mjs",
        // Pin cwd to this package so the relative `test/e2e-server.mjs` resolves no matter where
        // playwright is invoked from (don't rely on the caller's shell being in packages/website).
        cwd: import.meta.dirname,
        url: baseURL,
        reuseExistingServer: !process.env.CI,
        timeout: 180_000,
        stdout: "pipe",
        stderr: "pipe",
      }
    : undefined,
});
