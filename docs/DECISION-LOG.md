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

## 2026-11-24 — #2 Monorepo scaffold (+ squash-only merges)
- Delegated to agent: planning in plan mode, then scaffolding pnpm workspaces + catalog, Turborepo, `@tessera/tsconfig`, Biome, Vitest, Changesets, empty `@tessera/tokens` and `@tessera/react`, CI, and the shared `.claude/settings.json` allowlist.
- Decisions: TypeScript 6.0.3 instead of 7.0.2 (ADR-0005), because TS 7 has no stable JS API and typescript-eslint supports TS below 6.1 only. The repo is now squash-merge only, with the PR title and description as the commit message and head branches deleted on merge (from the #11 merge). Publishing commands are on Claude's deny list, not just left off the allowlist.
- What went wrong / surprised me:
  - tsdown wrote `index.mjs`/`index.d.mts`, but `exports` pointed at `.js`/`.d.ts`. Build, typecheck and test all passed anyway, because nothing imports the packages yet. Fix: `platform: "neutral"` + `fixedExtension: false`, plus publint in the build (`failOnWarn`), which now fails the build on that mismatch (checked by breaking it on purpose).
  - pnpm 12 asked to approve "skills" for tsdown: the package ships an agent skill that tells the agent to fetch and follow instructions from GitHub at runtime, which the lockfile doesn't pin. Denied in `pnpm-workspace.yaml`. Dependencies can now ship instructions for agents, so they're part of the supply chain (input for the Phase 2 threat model).
  - Biome 2.6 formats Markdown and would have reformatted every doc (padded tables, `*x*` → `_x_`). Markdown formatting is off; Biome's `recommended` setting was migrated to `preset`.
  - The first draft of the tsconfig included `tsdown.config.ts`, which `isolatedDeclarations` rejects; the self-review hook caught it before anything ran.
- How I verified the output: _owner to fill in_ (Claude ran: all five commands in a fresh copy with no node_modules; a second run gave `FULL TURBO`, 9/9 cached; `any`, unchecked index access, bad formatting and wrong `exports` paths each fail.)
- Cost / context notes: Node 26 has no Corepack, so the owner installed Node 26 and pnpm by hand (`!` commands).
- What I'd change in CLAUDE.md / skills / hooks: every package build runs publint. For new dependencies, check `pnpm permissions list` before approving anything.
