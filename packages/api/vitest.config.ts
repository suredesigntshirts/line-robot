import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["test/unit/**/*.test.ts"],
    coverage: {
      provider: "istanbul",
      all: true,
      include: ["src/**/*.ts"],
      // The Lambda composition root + the thin S3/LINE adapter wrappers are exercised in the build /
      // integration paths, not in these handler unit tests; the gate is on the handler's logic.
      exclude: ["src/**/*.d.ts", "src/lambda/**", "src/adapters/s3Presigner.ts"],
      reporter: ["text", "html"],
      thresholds: {
        "src/handler.ts": { lines: 80, functions: 80, branches: 70, statements: 80 },
      },
    },
  },
});
