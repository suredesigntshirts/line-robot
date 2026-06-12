// D3.2 lint rule: component code must reference tokens (var(--…)), never raw
// colors — this is what makes the founder's candidate swap a one-file change.
// Fails on hex, oklch(), rgb()/hsl(), or CSS named colors in src/components.
import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const componentsDir = join(dirname(fileURLToPath(import.meta.url)), "../src/components");

const RAW_COLOR =
  /#[0-9a-fA-F]{3,8}\b|\boklch\(|\brgba?\(|\bhsla?\(|\b(?:color\s*:\s*|background(?:-color)?\s*:\s*)(red|blue|green|black|white|gray|grey|orange|yellow|purple|pink)\b/;

function walk(dir) {
  const offenders = [];
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) {
      offenders.push(...walk(path));
      continue;
    }
    if (!/\.(tsx?|css)$/.test(entry)) continue;
    readFileSync(path, "utf8")
      .split("\n")
      .forEach((line, i) => {
        if (RAW_COLOR.test(line)) offenders.push(`${path}:${i + 1}: ${line.trim()}`);
      });
  }
  return offenders;
}

let offenders = [];
try {
  offenders = walk(componentsDir);
} catch {
  console.log("check-colors: no components yet");
  process.exit(0);
}
if (offenders.length > 0) {
  console.error("Hardcoded colors found (use var(--token) from theme.css):");
  for (const line of offenders) console.error(`  ${line}`);
  process.exit(1);
}
console.log("check-colors: OK (tokens only)");
