# Tessera — an AI-ready Design System

A React + TypeScript design system built to be consumed by AI agents (MCP server, Claude Code plugin, evals). It is also a learning project: the owner is a senior frontend dev preparing for design-system roles.

## Read first
- `docs/ROADMAP.md`: phases, current status, and who does what
- `docs/adr/`: accepted decisions. Don't contradict an accepted ADR; propose a new one instead.
- `docs/SPEC.md`: locked product decisions (pitch, Ledgerly, theming, components, evals, rules manifest)
- `docs/origin-conversation.md`: the original brief

## Working agreement
- Claude is the lead and the teacher. Explain *why* briefly when introducing a new Claude Code concept.
- One issue → one branch → one PR. Never commit to `main` directly. The owner reviews and merges.
- Plan before multi-file changes. Keep PRs small.
- After each task, add an entry to `docs/DECISION-LOG.md` with the owner.
- Ask before any outward-facing action (creating repos, publishing packages, posting comments).

## Code rules (enforced by hooks/lint once Phase 1 lands)
- No raw colors, spacing, radii or font sizes: token-backed Tailwind utilities only. No arbitrary values (`bg-[#fff]`, `p-[13px]`), no inline style values.
- Every interactive component: keyboard support, an accessible name, and a vitest-axe test.
- Public component props are documented with TSDoc (the MCP server reads them).
- Strict TypeScript, no `any`.

## Commands
Toolchain: Node from `.nvmrc` (`nvm use`) and pnpm from the `packageManager` field. Node 26 has no Corepack, so install pnpm once with `npm i -g pnpm`.

| Task | Command |
|---|---|
| Install | `pnpm install` |
| Build / typecheck / lint / test (all packages, through Turborepo) | `pnpm build` · `pnpm typecheck` · `pnpm lint` · `pnpm test` |
| Everything CI runs | `pnpm turbo run build typecheck lint lint:root test` |
| One package | `pnpm --filter @tessera/react test` |
| Format and auto-fix | `pnpm format` |
| Record a version bump | `pnpm changeset` |

- Dependency versions live in the `catalog:` in `pnpm-workspace.yaml`. Packages reference `catalog:` and never pin their own versions.
- TypeScript stays on 6.x (ADR-0005).
- pnpm asks before a dependency may run build scripts or ship agent skills. Decisions live under `permissions:` in `pnpm-workspace.yaml`. Read what a package wants before approving, and never approve skills that fetch remote instructions.
