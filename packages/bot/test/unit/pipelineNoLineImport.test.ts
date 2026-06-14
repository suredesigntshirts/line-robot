import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

// Architecture boundary (Stage 6, INC-B4 invariant): the LINE SDK / bot-side LINE code must NEVER leak
// into `packages/pipeline` — the pipeline is pure extract/dedup/gate over Postgres, and the webhook→
// sweep spine keeps all LINE I/O in `packages/bot`. This test BITES: add `import … from "@line/bot-sdk"`
// (or any `@line/…` package) anywhere under `packages/pipeline/src` and it goes red.

const PIPELINE_SRC = join(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
  "..",
  "pipeline",
  "src",
);

function tsFiles(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      out.push(...tsFiles(full));
    } else if (entry.endsWith(".ts")) {
      out.push(full);
    }
  }
  return out;
}

// Match an ESM import/export-from or a require of any `@line/…` package (the LINE org scope).
const LINE_IMPORT = /(?:from|require\()\s*["']@line\/[^"']+["']/;

describe("packages/pipeline has NO @line/* import (hexagonal boundary)", () => {
  it("no source file under packages/pipeline/src imports the LINE SDK", () => {
    const offenders = tsFiles(PIPELINE_SRC).filter((f) =>
      LINE_IMPORT.test(readFileSync(f, "utf8")),
    );
    expect(offenders).toEqual([]);
  });
});
