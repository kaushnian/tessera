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

## Learning pages
The owner keeps private claude.ai artifacts to learn the project and to recall how it works later. They explain the repo; the repo stays the source of truth.

| Page (find it with the Artifact tool's `list`) | Explains | Based on |
|---|---|---|
| "Tessera: Cancel Subscription Walkthrough" | How an agent uses each Tessera layer to build a feature | `docs/examples/cancel-subscription.md`; Button, Dialog and Text props, the `useToast` API, MCP tool responses, `@tessera/eslint-plugin` rule IDs |

- When a task changes anything a page is based on, update the page in the same task so it stays accurate, and note it in the PR. If you can't update it from this session, write "learning page needs update" in the PR.
- When you make a new learning page, add a row here.

## Code rules (enforced by hooks/lint once Phase 1 lands)
- No raw colors, spacing, radii or font sizes: token-backed Tailwind utilities only. No arbitrary values (`bg-[#fff]`, `p-[13px]`), no inline style values.
- Every interactive component: keyboard support, an accessible name, and a vitest-axe test.
- Public component props are documented with TSDoc (the MCP server reads them).
- Strict TypeScript, no `any`.

## Commands
_To be filled in when the monorepo is scaffolded (Phase 1)._
