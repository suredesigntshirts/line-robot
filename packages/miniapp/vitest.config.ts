import { defineConfig } from "vitest/config";

// Only the pure logic (deep-link/route decode + filter/sort/search predicates) is unit-tested — the
// LIFF-dependent boot path can't run in CI (it needs the LINE webview). Node env, no DOM needed.
export default defineConfig({
  test: {
    environment: "node",
    include: ["test/**/*.test.ts"],
  },
});
