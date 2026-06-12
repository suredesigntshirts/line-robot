# Spike — sharp on Lambda for the v2 sweep (classify + chanote OCR re-enable)

**Question:** can the sweep bundle (esbuild, `external: ["sharp"]`) load sharp on
`nodejs22.x` arm64 Lambda without a layer, and can the x86 build host fetch the
arm64 binaries? **Answer: yes to both — mechanics proven 2026-06-13** (sprint-01
extension; run in /tmp, results below). Deliberately NOT wired into the build yet:
v2-lite's sweep never imports sharp, and 29 MB of dead binaries in every deploy
would be waste. Apply the recipe below in the same increment that wires
classify/derivatives into the v2 pipeline port.

## Proven mechanics

1. **Cross-platform binary fetch** (x86 build host → arm64 Lambda):
   ```bash
   cd packages/bot/dist/sweep
   npm install --no-save --no-package-lock --os=linux --cpu=arm64 sharp@0.35.1
   ```
   Downloads `@img/sharp-linux-arm64` + `@img/sharp-libvips-linux-arm64`
   (~29 MB unpacked incl. a prunable `@img/sharp-wasm32` fallback — delete it
   and the artifact stays well inside Lambda's 250 MB unzipped cap; zip ≈ 10 MB).

2. **Resolution from the bundle**: an esbuild ESM bundle with `external: ["sharp"]`
   and the `createRequire` banner (already in `packages/bot/esbuild.config.mjs`)
   resolves a SIBLING `node_modules/sharp` and executed the exact D2.7 derivative
   op (2000×1000 → long-edge 1568 JPEG q80): `RESIZED 1568 784 jpeg`.

## Recipe for the classify-wiring increment

- esbuild config: keep `external: ["sharp"]` (already true); after the sweep
  bundle, run the `npm install --os=linux --cpu=arm64` step above + prune
  `@img/sharp-wasm32`, scoped to `dist/sweep` ONLY (other lambdas never touch
  sharp).
- No Pulumi change: `FileArchive("../packages/bot/dist/sweep")` zips the
  node_modules automatically.
- Verification once deployed (the one thing not provable on an x86 host): a
  sweep-side smoke that resizes a 1-pixel PNG at cold start and logs it; check
  CloudWatch on first flip.
