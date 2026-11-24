# Decision & failure log

Your interview gold. Add one entry per task or whenever something surprising happens. Be honest: failures are more useful than successes.

Template:
```
## YYYY-MM-DD — <task>
- Delegated to agent: …
- What went wrong / surprised me: …
- How I verified the output: …
- Cost / context notes: …
- What I'd change in CLAUDE.md / skills / hooks: …
```

---

## 2026-11-16 — Project kickoff
- Delegated to agent: turning the brainstorm into a roadmap, ADR and CLAUDE.md.
- What went wrong: Claude couldn't read the claude.ai share link (the page is rendered client-side, and the API route was blocked by permission rules). I pasted the text by hand. Lesson: agents need content in the repo, not behind a browser.
- How I verified: read the roadmap and ADR myself; accepting ADR-0001 is my call.

## 2026-11-18 — Grill session → SPEC.md, ADR-0002, ADR-0003
- Delegated to agent: running `/grill-me` on the MVP scope, then writing the answers into `docs/SPEC.md` (§1–11) and ADR-0002.
- What went wrong / surprised me: the grill exposed that ADR-0001's "Biome for all linting" couldn't enforce AST-level usage rules ("one primary Button per view"), which led to ADR-0002. Later, re-reading the docs before the PR, Claude found SPEC §5 (`claude -p`, no API key) contradicted ADR-0001 ("Agent SDK for evals"), and recorded it as ADR-0003. Decisions made in conversation drift from accepted ADRs unless someone cross-checks them.
- How I verified the output: _owner to fill in_
- Cost / context notes: the grill spanned several sessions; the repo docs, not chat history, carried context between them.
- What I'd change in CLAUDE.md / skills / hooks: when SPEC changes, check it against `docs/adr/` (candidate for a review-subagent checklist item).

## 2026-11-23 — Phase 1 issues (#2–#10)
- Delegated to agent: drafting 9 issues with acceptance criteria in plan mode, from ROADMAP + SPEC.
- What went wrong / surprised me: Claude Code's auto-mode classifier blocked the agent from posting issues to the public repo, so Claude wrote a script and I ran it with `!`. While re-checking, Claude found the first version of the script used a bash 4 feature that macOS bash 3.2 doesn't have; it would have failed after creating some issues. Also, issues and PRs share one counter, so the plan's "#1–#9" became #2–#10.
- Plan changes vs. the roadmap: the contract doc (#9) moved before the parallel batch so the three subagents follow one contract; the batch became three issues (#6–#8), one per worktree. Decided: `*.rules.yaml` waits for Phase 2; Stylelint is dropped (ADR-0004 in #4).
- How I verified the output: _owner to fill in_
- What I'd change in CLAUDE.md / skills / hooks: scripts that make outward-facing changes should be safe to re-run (check whether things already exist before creating them).
