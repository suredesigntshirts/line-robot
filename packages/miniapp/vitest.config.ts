import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

// Unit + component tests. jsdom so the React screens render (cards/detail from fixture data, router
// resolution, the api client's auth header). The LIFF-dependent boot path can't run here (it needs
// the LINE webview) — that's covered by the real-browser e2e gate (playwright.config.ts) with a
// mocked LIFF context. @vitejs/plugin-react compiles JSX for the component tests.
export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    include: ["test/**/*.test.{ts,tsx}"],
    setupFiles: ["./test/setup.ts"],
  },
});
