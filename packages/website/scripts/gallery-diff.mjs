// Parity gate for "no visual change" increments (plan 21; the /frontend-review parity mode).
//
// Mode A's invariants only check that SOME tokens resolve + fonts/dark/images — they are BLIND to a
// real visual regression (e.g. a tree-shaken --badge-*-text token rendered badges wrong while every
// invariant stayed green and the design-review agent source-inferred "ALIGNED"). For a foundation /
// refactor increment whose contract is "the site looks identical", the right gate is a pixel-diff of
// the gallery BEFORE vs AFTER the change. Any non-trivial per-screen difference is a divergence to
// surface to the founder (or a regression to fix) — NOT something to wave through.
//
// Usage:  node scripts/gallery-diff.mjs <before-dir> <after-dir> [maxAE]
//   before-dir / after-dir : two gallery dirs of matching {project}-{screen}.png files
//   maxAE (default 50)      : per-screen differing-pixel budget (AE @ -fuzz 2%) before it's flagged
// Recipe for a clean tree on main:
//   git stash || true; npm run build; npx playwright test e2e/capture.spec.ts; cp -r test-results/gallery/local /tmp/before
//   git stash pop;      npm run build; npx playwright test e2e/capture.spec.ts; cp -r test-results/gallery/local /tmp/after
//   node scripts/gallery-diff.mjs /tmp/before /tmp/after
// Exit 0 = parity (all screens within budget); exit 1 = divergence (listed) — a BLOCKER for a
// "no visual change" increment until the founder rules the change intended.
import { execFileSync } from "node:child_process";
import { readdirSync } from "node:fs";
import { join } from "node:path";

const [, , beforeDir, afterDir, maxAEArg] = process.argv;
if (!beforeDir || !afterDir) {
  console.error("usage: node scripts/gallery-diff.mjs <before-dir> <after-dir> [maxAE]");
  process.exit(2);
}
const maxAE = Number(maxAEArg ?? 50);

const pngs = readdirSync(beforeDir)
  .filter((f) => f.endsWith(".png"))
  .sort();
if (pngs.length === 0) {
  console.error(`no .png screens in ${beforeDir}`);
  process.exit(2);
}

let totalAE = 0;
const diverged = [];
const missing = [];
const dims = (p) => {
  try {
    return execFileSync("identify", ["-format", "%wx%h", p], {
      stdio: ["ignore", "pipe", "ignore"],
    })
      .toString()
      .trim();
  } catch {
    return null;
  }
};

for (const name of pngs) {
  const a = join(beforeDir, name);
  const b = join(afterDir, name);
  // A size change (page got taller/shorter, layout reflowed) IS a visual change — flag it as a max
  // divergence rather than letting `compare` mishandle mismatched dimensions.
  const [da, db] = [dims(a), dims(b)];
  if (db === null) {
    missing.push(name);
    continue;
  }
  // n = numeric sort key (Infinity for a dimension change — always the most significant divergence).
  if (da !== db) {
    diverged.push({ name, ae: `dims ${da}→${db}`, n: Number.POSITIVE_INFINITY });
    continue;
  }
  let ae;
  try {
    // `compare -metric AE` prints the differing-pixel count to stderr and exits non-zero on any diff.
    execFileSync("compare", ["-metric", "AE", "-fuzz", "2%", a, b, "null:"], {
      stdio: ["ignore", "ignore", "pipe"],
    });
    ae = 0;
  } catch (e) {
    const out = (e.stderr?.toString() ?? "").trim();
    if (/unable to open|no such|does not/i.test(out)) {
      missing.push(name);
      continue;
    }
    ae = Number.parseInt(out, 10);
    if (Number.isNaN(ae)) {
      missing.push(`${name} (compare error: ${out})`);
      continue;
    }
  }
  totalAE += ae;
  if (ae > maxAE) diverged.push({ name, ae, n: ae });
}

console.log(
  `gallery-diff: ${pngs.length} screens · total differing pixels = ${totalAE} · budget/screen = ${maxAE}`,
);
if (missing.length) console.log(`  missing/unpaired: ${missing.join(", ")}`);
if (diverged.length === 0 && missing.length === 0) {
  console.log("PARITY ✓ — the render is unchanged within budget.");
  process.exit(0);
}
for (const d of diverged.sort((x, y) => y.n - x.n)) console.log(`  DIVERGED ${d.name}: AE=${d.ae}`);
console.log(
  "PARITY ✗ — surface each diverged screen to the founder (intended?) or fix the regression.",
);
process.exit(1);
