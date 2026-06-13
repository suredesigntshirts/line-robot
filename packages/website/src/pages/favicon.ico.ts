import type { APIRoute } from "astro";

// Browsers (and crawlers) auto-probe /favicon.ico at the root regardless of any <link> tag, and
// CloudFront routes everything-but-/_astro/* to this SSR Lambda — so without this route the probe
// 404s (logged by the 4.10 gate). A tiny inline SVG (trust-blue house glyph, TH-12 brand) served
// here is the whole fix: a file + a route, no asset pipeline, no extra CloudFront behavior. Modern
// browsers honour the image/svg+xml content-type over the .ico extension; Base.astro also points
// <link rel="icon"> here so it isn't relying on the implicit probe.
const FAVICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" rx="6" fill="#174d93"/>
  <path d="M16 6 L26 15 L23 15 L23 25 L18 25 L18 19 L14 19 L14 25 L9 25 L9 15 L6 15 Z" fill="#ffffff"/>
</svg>`;

export const GET: APIRoute = () =>
  new Response(FAVICON_SVG, {
    headers: {
      "content-type": "image/svg+xml; charset=utf-8",
      // Cosmetic + immutable: let the edge/browser cache it for a day.
      "cache-control": "public, max-age=86400",
    },
  });
