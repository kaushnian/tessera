# Tessera — product spec

Decisions locked in during the grilling session (2026-11-16 → 2026-11-18). Each one is final unless a later ADR changes it.

## 1. Pitch
> Tessera is a design system built for **AI agents as first-class consumers**: tokens, components and usage rules are machine-readable through an MCP server and a Claude Code plugin, and **evals prove** that agents using it build correct, accessible, on-brand UI more often.

The measured result is the headline, not the component list.

## 2. Reference product
**Ledgerly**, a fictional B2B SaaS billing and subscriptions admin app. All eval prompts, examples and usage rules target Ledgerly screens: settings forms, customer lists, cancel-subscription confirmation, save feedback.

## 3. Theming
- One brand, **light and dark** modes (`[data-theme="dark"]`).
- Three token tiers: **primitive → semantic → component** (the component tier is used sparingly).
- Components and agents may use **semantic tokens only**; referencing a primitive is a rule violation.
- Stretch: a second brand ("Ledgerly Enterprise") made by swapping primitives only.

## 4. v1 components (10)
| Group | Components |
|---|---|
| Layout & type | Stack, Text, Heading, Card |
| Forms | Button, Input, Select, Field |
| Feedback & data | Dialog, Toast, DataTable (TanStack Table) |

Out of v1: Tabs, Tooltip, Checkbox/Radio, DatePicker, Combobox.

## 5. Evals
- **Arms:** (1) baseline: package only · (2) + MCP server · (3) + MCP + plugin.
- **Runner** (ADR-0003): headless `claude -p --output-format json` on the owner's Claude Code subscription. No API key. Runs one at a time, in batches, overnight if needed, each in an isolated temp workspace.
- **Size:** pilot of 5 prompts × 3 arms × 1 run → final of 20 prompts × 3 arms × 3 runs (180 runs).
- **Deterministic scores:** tsc pass, lint violations (arbitrary values, primitive tokens, raw HTML where a component exists), axe violations, Ledgerly rule checks.
- **Efficiency:** tokens and turns per run.
- **Secondary:** LLM-judge score, clearly labelled.
- Bulk runs on Sonnet; one Opus comparison.

## 6. Single source of truth for component knowledge
```
Button.tsx         props/variants via TSDoc + cva   (extracted)
Button.rules.yaml  machine-checkable rules + short do/don't   (hand-written)
        └─ build (ts-morph) ─▶ tessera.manifest.json ─▶ MCP · Storybook · registry · lint · eval scorer
```
Rule-drift protection:
1. The build fails if a rule references an unknown component, prop or variant.
2. Every rule ships good and bad fixtures, tested in CI.
3. A CI check plus a Claude Code hook flag "component changed, rules didn't"; the PR must update the rules or state "no rule impact".
4. Evals are the backstop.

Principle: **docs as code: validated, tested, diff-checked.**

## 7. Rule enforcement engine
`@tessera/eslint-plugin` is the one checker, used by the editor/CI, MCP `validate_usage`, the eval scorer and the post-edit hook. Biome handles the repo's own formatting and lint. See ADR-0002.

## 8. MCP server: local, version-matched
- `@tessera/mcp` runs as a **local stdio** process, started by Claude Code from the consumer's `.mcp.json` (`npx @tessera/mcp`).
- It reads `tessera.manifest.json` from the consumer's **installed** `node_modules/@tessera/react`, so its answers always match the installed version. It can report when a feature needs a newer version.
- No hosting, no auth, no network. Stretch: a hosted HTTP variant for a multi-app company, with its trade-offs written up.

## 9. Patterns are first-class
- `packages/react/src/patterns/<name>/` holds `pattern.yaml` (when to use, structure, rules in the same rule format) and `example.tsx` (a reference implementation, type-checked and tested).
- v1 patterns (4): **settings-form**, **destructive-confirm**, **data-list** (DataTable + empty/loading/error), **page-layout**.
- Patterns go into the manifest. The MCP tools are `list_components`, `get_component_api`, `get_tokens`, `get_usage_guidelines`, **`get_pattern`** and `validate_usage`.
- Pattern rules are enforced by `@tessera/eslint-plugin` (e.g. `settings-form/one-save-action`).
- Each eval prompt maps to 1–2 patterns.

## 10. Versioning and the staged breaking change
- `0.x` during Phases 1–2; **`1.0.0` at the end of Phase 2**; strict semver via Changesets after that.
- Phase 4: one **deliberate breaking change → `2.0.0`** (e.g. a Button variant rename), shipped with:
  - a Changeset and migration note
  - a codemod (`@tessera/codemods`, tested on fixtures)
  - deprecation warnings in the last `1.x` (dev-time warning + lint rule)
  - MCP version awareness ("this needs 2.0")
- `apps/playground` plays the product team and is migrated 1.x → 2.0 with the codemod.

## 11. Distribution model
- **Inside the monorepo:** packages depend on each other with `workspace:*`. Changesets swaps in real versions at publish time.
- **Playground and eval workspaces consume like an external team:** they install `pnpm pack` tarballs (`.tgz`), never workspace links, so install behavior and versions are real. No local registry.
- **Public npm:** deferred. It's decided at the `1.0.0` release with the owner's explicit OK; if yes, publish from CI using npm trusted publishing (no long-lived tokens).
- Context: the owner has worked with the in-repo `workspace:*` model (atomic changes). Tessera deliberately builds the versioned model, so the owner can compare both.
