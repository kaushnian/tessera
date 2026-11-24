# ADR-0002: Biome for repo hygiene, ESLint plugin for design-system rules

- Status: Accepted (2026-11-18)
- Amends: ADR-0001 ("Lint / format" row)

## Context
ADR-0001 chose Biome for all linting. Since then, `docs/SPEC.md` §6 established that design-system usage rules live in `*.rules.yaml` and must be enforced in four places: consumers' editors and CI, the MCP `validate_usage` tool, the eval scorer, and Claude Code hooks. These rules are custom and need the syntax tree (AST), e.g. "at most one primary Button per view" or "destructive Button must be inside a Dialog".

Biome's plugin system (GritQL) can't express rules like these well, and consumer teams overwhelmingly run ESLint, not Biome.

## Decision
- **Biome** formats and lints *this repo's own code*.
- **`@tessera/eslint-plugin`** implements Tessera's usage rules, generated from or validated against `tessera.manifest.json`. It's the single engine behind:
  - the editor and CI (consumers add it to their flat config)
  - MCP `validate_usage` (through ESLint's Node API on a code snippet)
  - the eval scorer
  - the Claude Code post-edit hook

## Consequences
- Two lint tools in the repo, but their scopes don't overlap (repo hygiene vs. design-system rules).
- Writing custom ESLint rules (AST visitors) becomes a project skill and an interview talking point.
- Rejected: **ESLint-only** (one tool, but slower and with more config for repo hygiene); **a standalone checker** (no editor integration, and it would reinvent ESLint).
