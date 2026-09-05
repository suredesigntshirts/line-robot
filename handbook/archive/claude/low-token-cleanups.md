# Low-token cleanup prompts

Cheap, self-contained tasks for smaller models (haiku/sonnet) while waiting out a usage-rate
window. Each prompt below is complete — paste it directly into a sub-agent call. Ground rules
for every prompt: stay cheap (no broad file reads beyond the named target), commit nothing
(leave changes in the working tree for the orchestrator to review), produce a ≤5-line summary.

---

### Documentation consistency sweep

You are a documentation consistency checker. Your job is cheap and read-mostly.

1. Run `git log --since="7 days ago" --name-only --pretty=format: -- docs/ plans/ CLAUDE.md | sort -u | head -10` to find recently-changed doc files. Pick the most recently touched one.
2. Read that file fully.
3. For every claim that references another artifact — a file path, a command, a section heading, a count, a script name — verify it still holds by reading only the directly referenced file or running only a targeted `grep` or `ls`. Do not read files that are not directly referenced.
4. Fix only **objective drift**: a renamed path, a stale command, a wrong count. Do not rewrite prose, do not change meaning, do not rephrase.
5. Anything that requires judgment (ambiguous ownership, deprecation intent, design decisions) — list it, do not touch it.
6. Commit nothing. Leave fixes in the working tree.
7. Output a ≤5-line summary: file checked, fixes applied (with old→new), and any judgment-bearing items flagged.

---

### Language tightening for token savings

You are a concision editor. Your job is cheap and targeted.

1. Pick one frequently-loaded doc: prefer `CLAUDE.md` files, skill `SKILL.md` files, or stage specs under `plans/19-v2-marketplace-rebuild/`. Choose the longest one you can find with `wc -l` on those paths.
2. Read the file. Tighten wording — shorter phrases, remove filler — while retaining **exact** meaning. Rules: (a) if a sentence's meaning could change even slightly, leave it untouched; (b) never drop a constraint, soften a MUST/NEVER, or remove a warning; (c) do not reorder sections.
3. Apply the edits in place.
4. Run `wc -w <before>` mentally by comparing original vs new line count — report the delta.
5. Commit nothing. Leave changes in the working tree.
6. Output a ≤5-line summary: file edited, approximate word-count reduction, and any sentences you left untouched because meaning was at risk.

---

### Cross-reference integrity check

You are a link-rot checker. Your job is read-only except for trivially-correct fixes.

1. Collect all `CLAUDE.md` files (`find /home/user/src/line-robot -name 'CLAUDE.md'`), all `.claude/skills/*/SKILL.md` files, and all `plans/*.md` files. Read them.
2. Extract every reference to: a file path, a directory, an `npm run <script>` name, or a section anchor.
3. For each, verify existence: `ls` the path, or `grep` the script name in the relevant `package.json`. Do not read whole source files.
4. **Fix** only references where the correct new path is unambiguous (e.g. a file was clearly renamed and the new name is visible nearby). Update the reference in-place.
5. **List** everything else that is broken or ambiguous — do not guess.
6. Commit nothing. Leave fixes in the working tree.
7. Output a ≤5-line summary: total refs checked, how many broken, how many fixed, how many need human judgment.

---

### TODO / stale-marker scan

You are a triage assistant. Your job is read-only — make zero edits.

1. Run: `grep -rn --include="*.ts" --include="*.tsx" --include="*.md" -E "TODO|FIXME|XXX|temporary|for now" /home/user/src/line-robot/packages /home/user/src/line-robot/docs /home/user/src/line-robot/plans 2>/dev/null | grep -v node_modules | grep -v dist`
2. For each hit, record: `file:line`, the matched line (trimmed), and a one-line suggested owner action (e.g. "remove after plan 17 ships", "needs design decision", "safe to delete").
3. Make **no edits whatsoever** — not even whitespace.
4. Output the triage list directly (each item on one line), then a ≤3-line footer with totals and any patterns worth flagging.
