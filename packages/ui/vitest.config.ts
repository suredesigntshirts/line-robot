import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    // RTL's auto-cleanup hooks the global afterEach — required between renders.
    globals: true,
    include: ["test/**/*.test.tsx", "test/**/*.test.ts"],
  },
});
