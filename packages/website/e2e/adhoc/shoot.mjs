// Ad-hoc review shots against the running e2e server (not part of the suite).
import { chromium, devices } from "playwright";

const base = process.env.BASE || "http://localhost:4321";
const out = "test-results/review/"; // gitignored

import { mkdirSync } from "node:fs";

mkdirSync(out, { recursive: true });
const browser = await chromium.launch();
const shots = JSON.parse(process.env.SHOTS || "[]");
for (const s of shots) {
  const ctx = await browser.newContext({
    ...(s.mobile
      ? devices["Pixel 7"]
      : { viewport: { width: s.width ?? 1280, height: s.height ?? 800 } }),
    colorScheme: s.dark ? "dark" : "light",
    locale: "th-TH",
  });
  const page = await ctx.newPage();
  await page.goto(base + s.path, { waitUntil: "networkidle" });
  if (s.click) {
    for (const sel of [].concat(s.click)) {
      await page.locator(sel).first().click();
      await page.waitForTimeout(400);
    }
  }
  if (s.scroll) await page.evaluate((y) => window.scrollTo(0, y), s.scroll);
  await page.waitForTimeout(s.wait ?? 600);
  await page.screenshot({ path: `${out}${s.name}.png`, fullPage: !!s.full });
  console.log("shot", s.name);
  await ctx.close();
}
await browser.close();
