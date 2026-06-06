import { defineConfig } from "vitest/config";

// Integration tests spin up real backing services (DynamoDB Local via docker) and are kept
// separate from the fast unit suite. Run with `npm run test:integration`.
export default defineConfig({
  test: {
    environment: "node",
    include: ["test/integration/**/*.test.ts"],
    testTimeout: 30_000,
    hookTimeout: 120_000,
  },
});
