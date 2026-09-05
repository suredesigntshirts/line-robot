// Render the design mockups (handbook/design/mockups/*.html) to PNG, light + dark, 1400px wide, into
// handbook/design/mockups/renders/<name>-{light,dark}.png. Those PNGs ARE the design bar that
// /frontend-review diffs the live site against (image-vs-image, never source). Run from packages/website:
//   node e2e/adhoc/render-mocks.mjs                                   # every mock
//   node e2e/adhoc/render-mocks.mjs direction-a-baania-clean          # one or more by name
//   node e2e/adhoc/render-mocks.mjs --out /tmp/renders                # render elsewhere to compare first
// Serves the mockups dir over http with sirv (file:// blocks fonts/scripts), then screenshots each page
// full-height with the e2e suite's headless Chromium. Dark = the mocks' own switch, <html data-theme="dark">
// (plus color-scheme emulation as a fallback for mocks that only use the media query).
import { mkdirSync, readdirSync } from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";
import sirv from "sirv";

const here = path.dirname(fileURLToPath(import.meta.url));
const mocksDir = path.resolve(here, "../../../../handbook/design/mockups");
const args = process.argv.slice(2);
const outIdx = args.indexOf("--out");
const outDir =
  outIdx >= 0 ? path.resolve(args.splice(outIdx, 2)[1]) : path.join(mocksDir, "renders");
const names = args.length
  ? args
  : readdirSync(mocksDir)
      .filter((f) => f.endsWith(".html"))
      .map((f) => f.slice(0, -".html".length));
mkdirSync(outDir, { recursive: true });

const server = http.createServer(sirv(mocksDir, { dev: true }));
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const port = server.address().port;
const browser = await chromium.launch();
try {
  for (const name of names) {
    for (const theme of ["light", "dark"]) {
      const page = await browser.newPage({
        viewport: { width: 1400, height: 900 },
        colorScheme: theme,
      });
      await page.goto(`http://127.0.0.1:${port}/${name}.html`, { waitUntil: "networkidle" });
      await page.evaluate((t) => {
        document.documentElement.dataset.theme = t;
        return document.fonts.ready;
      }, theme);
      const file = path.join(outDir, `${name}-${theme}.png`);
      await page.screenshot({ path: file, fullPage: true });
      console.log(file);
      await page.close();
    }
  }
} finally {
  await browser.close();
  server.close();
}
