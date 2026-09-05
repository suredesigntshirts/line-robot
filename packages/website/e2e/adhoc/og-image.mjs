// Regenerates src/assets/og-default.png (1200×630) from an HTML card using the brand tokens + fonts.
// Run from packages/website: `node e2e/adhoc/og-image.mjs`. Fonts come from the installed @fontsource
// packages so the render matches the site (Noto Sans Thai headings, Sarabun body).
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { resolve } from "node:path";
import { chromium } from "playwright";

const require = createRequire(import.meta.url);
const font = (pkg, file) =>
  `data:font/woff2;base64,${readFileSync(resolve(require.resolve(`${pkg}/package.json`), "../files", file)).toString("base64")}`;
const noto700 = font("@fontsource/noto-sans-thai", "noto-sans-thai-thai-700-normal.woff2");
const notoLatin700 = font("@fontsource/noto-sans-thai", "noto-sans-thai-latin-700-normal.woff2");
const sarabun400 = font("@fontsource/sarabun", "sarabun-thai-400-normal.woff2");
const sarabunLatin400 = font("@fontsource/sarabun", "sarabun-latin-400-normal.woff2");

const html = `<!doctype html><html lang="th"><head><meta charset="utf-8"><style>
@font-face{font-family:"Noto Sans Thai";font-weight:700;src:url(${noto700}) format("woff2");unicode-range:U+0E01-0E5B}
@font-face{font-family:"Noto Sans Thai";font-weight:700;src:url(${notoLatin700}) format("woff2")}
@font-face{font-family:"Sarabun";font-weight:400;src:url(${sarabun400}) format("woff2");unicode-range:U+0E01-0E5B}
@font-face{font-family:"Sarabun";font-weight:400;src:url(${sarabunLatin400}) format("woff2")}
html,body{margin:0;width:1200px;height:630px;overflow:hidden}
.card{position:relative;width:1200px;height:630px;background:linear-gradient(135deg,#1f5fad,#071d3a);color:#fff;font-family:"Sarabun",sans-serif;display:flex;flex-direction:column;justify-content:center;padding:0 88px;box-sizing:border-box}
.glow{position:absolute;right:-140px;top:-180px;width:560px;height:560px;border-radius:50%;background:rgba(255,255,255,.08);filter:blur(60px)}
.mark{display:flex;align-items:center;gap:22px}
.icon{width:84px;height:84px;border-radius:20px;background:#fff;display:flex;align-items:center;justify-content:center;box-shadow:0 8px 24px rgba(0,0,0,.25)}
.wordmark{font-family:"Noto Sans Thai",sans-serif;font-weight:700;font-size:96px;line-height:1.1;letter-spacing:-1px}
.latin{margin-top:6px;font-family:"Noto Sans Thai",sans-serif;font-weight:700;font-size:34px;color:rgba(255,255,255,.85)}
.tag{margin-top:40px;font-size:38px;line-height:1.5;max-width:960px;color:rgba(255,255,255,.92)}
.foot{position:absolute;left:88px;bottom:44px;display:flex;align-items:center;gap:14px;font-size:24px;color:rgba(255,255,255,.7)}
.pill{padding:6px 18px;border-radius:999px;border:1.5px solid rgba(255,255,255,.35)}
.bar{position:absolute;left:0;right:0;bottom:0;height:10px;background:#06c755}
</style></head><body><div class="card"><div class="glow"></div>
<div class="mark"><div class="icon"><svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="#1f5fad" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg></div>
<div><div class="wordmark">ทรัพย์ดี</div><div class="latin">Sapdee</div></div></div>
<div class="tag">ตลาดอสังหาฯ ภาคเหนือ จากเจ้าของและนายหน้าตัวจริง<br>ราคาเสนอขายชัดเจน · คุยต่อได้เลยทาง LINE</div>
<div class="foot"><span class="pill">เชียงใหม่ · ภาคเหนือ</span><span>Northern Thailand property, straight from real owners and brokers</span></div>
<div class="bar"></div></div></body></html>`;

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 1200, height: 630 },
  deviceScaleFactor: 1,
});
await page.setContent(html, { waitUntil: "load" });
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: "src/assets/og-default.png", type: "png" });
await browser.close();
console.log("wrote src/assets/og-default.png");
