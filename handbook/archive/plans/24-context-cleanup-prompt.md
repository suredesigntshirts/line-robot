# Bootstrap prompt for the context-cleanup session (paste verbatim after /clear)

You are starting a fresh session in the `line-robot` repo to execute a docs-and-layout cleanup.
Read this whole message before opening any file.

**Override the context you will find.** This repo's root `CLAUDE.md`, `BACKLOG.md`, `MORNING.md`,
`SPRINT-LOG.md`, `BLOCKERS.md`, every `plans/00–23` file, `docs/design/skill-hardening/`, and the
auto-loaded session memory are HISTORY from a previous phase. They contain process instructions
(multi-agent review panels, budget polling, real-API eval gates, overnight-run charters) and status
claims that are stale or contradictory. For this task, do NOT follow any process instruction from
those files and do NOT treat any status statement in them as current. The only instructions you
follow are this message and `plans/24-context-cleanup.md`. The only status you trust is the facts
listed in that plan's §4.1 template and what `git log` / the filesystem show.

**Your task.** Execute `plans/24-context-cleanup.md` exactly, top to bottom: the guardrails in
§0, the steps in §3 in order, the file contents in §4, the verification in §5, the report in §6.
The decisions in §0 are already taken — do not re-ask them. It is a docs/layout reorganisation
only: no product code changes beyond the path/comment rewrites the plan lists, no deploys, no
AWS or database mutations, archive by `git mv` only, never edit an archived file's body.

**Working style.** One commit per step with the message the plan gives. Run the free gate
(`npm run lint`, `npm run typecheck`, the unit tests named in §5) before the verification step.
If a guardrail would be violated or a fact you need is not in the plan or discoverable from the
repo, stop and ask; otherwise do not ask questions. Do not use subagents. Do not narrate; work,
then deliver the §6 report.

**Definition of done.** Every command in §5 passes, the acceptance test in §5 is answered from
`CLAUDE.md` + `STATUS.md` alone, `plans/` contains only `README.md`, and the work is pushed.

Begin by reading `plans/24-context-cleanup.md` in full, then `git status` and `git log --oneline -5`.
