import { defineConfig } from "vitest/config";

// Unit tests live in test/*.test.ts. Scope vitest to them so it does NOT collect the Playwright
// e2e specs (e2e/**/*.spec.ts) — those run under `npm run test:e2e` (a real browser + seeded PG),
// not vitest. Without this, `vitest run` greedily matches *.spec.ts and errors on Playwright's API.
export default defineConfig({
  test: {
    include: ["test/**/*.test.ts"],
  },
});
