import type { APIRoute } from "astro";

/** Origin health probe for CloudFront + smoke tests. No DB touch — liveness only. */
export const GET: APIRoute = () =>
  new Response(JSON.stringify({ ok: true, service: "website" }), {
    headers: { "content-type": "application/json" },
  });
