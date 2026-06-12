import * as fs from "node:fs";
import * as path from "node:path";
import * as pulumi from "@pulumi/pulumi";

// Static-asset content types for static-site uploads (Vite/Astro emit these). Anything unlisted falls
// back to a binary octet-stream — harmless for CloudFront, which serves the stored Content-Type.
const SITE_CONTENT_TYPES: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".map": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".txt": "text/plain; charset=utf-8",
  ".webmanifest": "application/manifest+json",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

export interface SiteFile {
  readonly key: string;
  readonly fullPath: string;
  readonly contentType: string;
  readonly cacheControl: string;
}

/** Recursively list the built SPA's files (relative S3 keys, content-type, cache policy). Returns []
 * when the SPA hasn't been built yet — so the CloudFront/S3 shell can be provisioned first and the
 * assets uploaded on a later `pulumi up` (the documented bootstrap order). `distDir` is passed in from
 * `index.ts` (where `__dirname` resolves to the project root); computing it here would shift
 * `__dirname` to `infra/src/` and silently break the lookup. */
export function listSiteFiles(distDir: string): SiteFile[] {
  if (!fs.existsSync(distDir)) {
    pulumi.log.warn(`static dist not found at ${distDir}; skipping SPA upload (build it first)`);
    return [];
  }
  const files: SiteFile[] = [];
  const walk = (dir: string): void => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(full);
        continue;
      }
      const key = path.relative(distDir, full).split(path.sep).join("/");
      const ext = path.extname(entry.name).toLowerCase();
      files.push({
        key,
        fullPath: full,
        contentType: SITE_CONTENT_TYPES[ext] ?? "application/octet-stream",
        // index.html must always be re-validated so a new deploy is picked up; everything else is a
        // content-hashed asset and can be cached immutably.
        cacheControl: key === "index.html" ? "no-cache" : "public, max-age=31536000, immutable",
      });
    }
  };
  walk(distDir);
  return files;
}
