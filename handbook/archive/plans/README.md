# Archived plans — outcome table

History only (see `../README.md`). Each plan's lasting output is a row in `DECISIONS.md` or a line in
`STATUS.md`; the bodies below are kept verbatim for reference.

| plans | what | outcome |
|---|---|---|
| 00–08 | v1 LINE echo bot → staging/prod rollout, hardening | built + deployed June 6–7 2026 |
| 09–13 | v1 catalog assistant, GSI3, richer details, listing depth, chanote OCR | built; plan 12 caused the 16-nullable-params outage, fixed in 13 |
| 14, 17 | v1 LIFF mini-app + deep-chat integration | built; retired by v2 Stage 5 |
| 15, 16, cleanup/ | domain type-safety, pattern consolidation, cleanup dossier | 16 + dossier executed June 8; 15 deferred |
| 18 | geo dedup design | absorbed into v2 Stage 2 |
| 19 (+stages) | v2 marketplace rebuild | Stages 0–6 built and gated; 7 skeleton; superseded by the 2026-09 website-first pivot (decisions live in DECISIONS.md) |
| 20 | frontend visual e2e | built; lives in packages/website/e2e |
| 21 | Tailwind v4 + shadcn conformance, Direction A | built |
| 22 | instruction-surface cleanup | never executed; superseded by 24 |
| 23 | ingestion pipeline audit | Groups A, C, D built (D not deployed); B not started; parked with the bot |
| 24 | context cleanup | executed 2026-09-05 (this layout: STATUS/DECISIONS/README + handbook/) |

Decoder for identifiers in code comments and live docs: "plan N" / "Stage N" → the plan file or `19-v2-marketplace-rebuild/stage-N-*.md` here; `D-S<stage>-<n>` (e.g. D-S1-4) and `D<stage>.<n>` / `Q<n>` (e.g. D2.1, Q6) → decisions/questions inside that stage spec; `S<stage>-I<n>` and `INC-*` → increments of that stage; plan-23 units (U-D2, A1, A2, CR-*, E5) → `23-ingestion-pipeline-audit/`; "4.x" in browse code → §4.x of `stage-4-public-website.md`. Heuristic IDs (TECH-*, CONV-*, COPY-*, …) resolve in the live register, `handbook/research/00-product-principles.md` §4.
