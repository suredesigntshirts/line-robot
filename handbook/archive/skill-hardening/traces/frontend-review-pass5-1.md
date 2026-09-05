# Trace: frontend-review · pass=p2-pass5-empty-404 · target=local · 2026-06-14T11:05Z

- **Increment:** Phase 2 pass 5 — finalised the empty/zero-result state + restyled the 404 page to
  direction-a. `404.astro` (calm centred not-found: icon+heading+why+home link, `data-th-content`);
  `States.tsx` EmptyState was designed in pass 1.
- **Inputs:** Mode A = test:e2e. Mode B = hardened images-only review of the `*-empty.png` screens +
  the captured `mobile-light-notfound.png`.
- **Findings:** ALIGNED — empty + 404 read as calm, centred, on-brand states (muted icon, heading,
  what/why/next, a way back); not bare errors. Matches the runner's own check.
- **Verdict:** ALIGNED on empty/404. → combined audit `audits/pass5-empty-404-1.md`.
