import { defineConfig } from "vitest/config";

// The real-RDS TLS gate (A5). Separate from the Docker integration suite and from the default unit
// run: it talks to the live staging RDS endpoint, so it is opt-in (DATABASE_URL must point at an
// rds.amazonaws.com host) and run explicitly with `npm run test:rds`.
export default defineConfig({
  test: {
    include: ["test/rds/**/*.test.ts"],
    testTimeout: 30_000,
    hookTimeout: 30_000,
  },
});
