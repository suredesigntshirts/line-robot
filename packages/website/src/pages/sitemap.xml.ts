import { getDb, listPublicListingIds } from "@line-robot/db";
import type { APIRoute } from "astro";

const escapeXml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/**
 * Auto-updating sitemap from Postgres (stage-4 deliverable #5): the browse roots
 * plus every consented listing, th + en with xhtml:link alternates (hreflang).
 */
export const GET: APIRoute = async ({ site }) => {
  if (!site) return new Response("site not configured", { status: 500 });
  const origin = site.href.replace(/\/$/, "");

  let rows: Array<{ id: string; updatedAt: Date }>;
  try {
    rows = await listPublicListingIds(getDb());
  } catch (error) {
    console.error("sitemap query failed:", error);
    return new Response("Service unavailable", { status: 503 });
  }

  const urlEntry = (thPath: string, enPath: string, lastmod?: Date) => `  <url>
    <loc>${escapeXml(`${origin}${thPath}`)}</loc>${lastmod ? `\n    <lastmod>${lastmod.toISOString()}</lastmod>` : ""}
    <xhtml:link rel="alternate" hreflang="th" href="${escapeXml(`${origin}${thPath}`)}"/>
    <xhtml:link rel="alternate" hreflang="en" href="${escapeXml(`${origin}${enPath}`)}"/>
  </url>`;

  const entries = [
    urlEntry("/", "/en/"),
    ...rows.map((r) => urlEntry(`/properties/${r.id}`, `/en/properties/${r.id}`, r.updatedAt)),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${entries.join("\n")}
</urlset>
`;
  return new Response(xml, { headers: { "content-type": "application/xml; charset=utf-8" } });
};
