---
name: alignment-review
description: Judge a screen, flow, copy, schema, or pipeline change against the product heuristic register (docs/research/00-product-principles.md §4) — pass/violation/n-a per applicable heuristic ID. Use on design-bearing increments (UI, copy, schema, user-facing flows) and at user-facing stage gates. Args: [surface description or diff ref]
disable-model-invocation: true
---

# Alignment review — heuristic-register check

Judges design-bearing work against the research-derived heuristic register, by ID. This is NOT a code-correctness or simplicity review — run `/increment-review` for that; this skill answers *does this honor what we know about the Thai market, our users, and our product decisions?*

## Inputs

- **Surface** (arg, required): either a short description of what changed ("listing card component", "rental submission form schema", "bot group-join message copy") or a git diff ref. If a diff ref, derive the touched surfaces from the changed files; if the diff resolves to empty, stop and say so.

## Procedure

1. Read `.claude/skills/alignment-review/context-map.md` and pick the **context groups** that apply to the surface. A change can hit several (a listing card touches *Card & detail UI* + *Typography, i18n & copy*).
2. Spawn ONE fresh `Explore` agent (read-only) — **never evaluate inline in the main conversation; fresh context is the point, and if you cannot spawn an agent, stop and say so** — with: the surface/diff, the selected context groups, and instructions to read `docs/research/00-product-principles.md` §4 in full — the register's own context headings define which IDs belong to each selected group, and its canonical-merges section defines which ID to cite for duplicated rules.
3. The agent evaluates **every heuristic ID in the selected groups** against the actual artifact (reads the code/copy/schema). **For any heuristic about rendered styling — typography actually applies, colours render, spacing/contrast hold (e.g. TH-06/07, TECH-06, the NPA-tone IDs) — DO NOT infer compliance from source or token declarations.** Reading `theme.css` and seeing the tokens declared is exactly how the unstyled-site regression passed alignment review (the non-Tailwind site discarded the `@theme {}` block at runtime, so every declared token resolved empty). Use **rendered evidence from a real browser against the real built artifact** — the screenshots / computed-style report produced by `/frontend-review`, or render it yourself. If no rendered evidence is available, mark those IDs **UNVERIFIED** and require `/frontend-review`; never grade them `pass` from source. The semantic heuristics (copy, units, consent, disclosure presence) are still judged from source as before:
   - **pass** — the artifact satisfies the rule (one-line evidence),
   - **violation** — it breaks the rule (one-line evidence + what would fix it),
   - **n-a** — the rule genuinely doesn't apply to this artifact (one-line why).
   No ID in a selected group may be skipped silently.
4. Report, as markdown: one table per context group (`ID | verdict | evidence`), then a `## Violations` rollup ordered by product impact, then `## Verdict`: **ALIGNED** (no violations) or **VIOLATIONS** (listed). Violations are fixed or explicitly rebutted in writing (SPRINT-LOG or commit message) — a rebuttal that amounts to disagreeing with the research goes to the founder, not into the code.

## Rules

- If the register itself seems wrong or outdated, that's a finding *about the register* routed to the founder — never silently ignored; heuristics the register marks superseded are skipped with a note, not failed.
