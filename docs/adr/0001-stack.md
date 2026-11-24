# ADR-0001: Core stack

- Status: Accepted (2026-11-16); "Lint / format" row amended by ADR-0002; "AI layer" eval runner amended by ADR-0003; "latest stable" amended for TypeScript by ADR-0005
- Date: 2026-11-16

## Context
We need a design system that is (1) credible to design-system hiring managers, (2) easy for AI agents to read and use, and (3) quick to build part-time over about 6 weeks. We pin exact versions when we scaffold, using the latest stable releases at that point.

## Decision
| Concern | Choice | Why |
|---|---|---|
| Package manager / monorepo | **pnpm workspaces + Turborepo** | Industry default for DS monorepos; cached task graph |
| Language / UI | **TypeScript (strict) + React 19** | The target market |
| Accessible primitives | **Radix primitives, shadcn/ui-style** (we own the component code; variants via `cva`) | The most common pattern in 2026 product teams and AI codegen (v0, the shadcn MCP/registry); fast foundation, so more time for the AI layer |
| Tokens | **W3C DTCG JSON → Style Dictionary** → CSS custom properties, Tailwind v4 `@theme`, and a typed TS export | DTCG is the standard; one source feeds Tailwind, CSS and agents |
| Styling | **Tailwind CSS v4**, with the theme generated *only* from tokens | Tailwind's default palette is removed, so only token utilities exist; arbitrary values (`bg-[#fff]`, `p-[13px]`) are banned by lint/hooks |
| Distribution | **npm package** (versioned, Changesets) **plus a shadcn-compatible registry** | Library = DS-team credibility (versioning, breaking changes, codemods); registry = "copy into your app" flow that agents already know |
| Build | **tsdown** (or Vite library mode if tsdown blocks us) | Fast ESM + types |
| Lint / format | **Biome**, plus Stylelint for token enforcement | One fast tool; Stylelint enforces "no raw values" |
| Tests | **Vitest + Testing Library + vitest-axe**; **Playwright** for visual regression | Fast unit/a11y tests plus real-browser screenshots |
| Docs | **Storybook** (latest) with autodocs | What DS teams expect |
| Releases | **Changesets** | Standard in DS monorepos |
| AI layer | **MCP TypeScript SDK**, Claude Code plugin, **claude-code-action** in CI, **Claude Agent SDK** for evals | The core of the project |
| CI | **GitHub Actions** | — |

## Monorepo setup
| Tool | Role |
|---|---|
| **pnpm workspaces** + **catalogs** | One shared version list for React, TS, Vitest, etc. (`pnpm-workspace.yaml`), so there are no version mismatches between packages |
| **Turborepo** | Task graph (`build → test → lint`), caching, `--filter` for changed packages; remote cache in CI |
| **Shared config packages** | `@tessera/tsconfig`, shared Biome config at the root: one source of rules for humans and agents |
| **Changesets** | Per-package semver, changelogs, release PRs |
| **Node via `.nvmrc` + `packageManager` field** | Reproducible toolchain (Corepack) |
| **Husky-free hooks** | Claude Code hooks locally plus CI checks; `lefthook` only if humans need git hooks too |

Considered **Nx**: more powerful (generators, an MCP integration, project graph), but heavier to learn. Turborepo is the most common choice in design-system monorepos and is enough for about 6 packages.

## Packages (planned)
```
packages/tokens        @tessera/tokens        DTCG source → CSS vars, Tailwind @theme, TS
packages/react         @tessera/react         components (shadcn-style, Radix)
packages/tsconfig      @tessera/tsconfig      shared TS config (private)
packages/mcp-server    @tessera/mcp           design-system MCP server
packages/claude-plugin tessera-claude-plugin  skills, agents, hooks
apps/docs              Storybook (+ registry JSON for shadcn CLI)
apps/playground        Vite app: consumes the packages like a real product would
evals/                 eval harness, prompts, results
```

## Consequences
- Raw shadcn is "a starting point, not a design system" (no versioning, no token governance, and every copy drifts). Our value-add is exactly that missing layer: DTCG tokens, a versioned API, enforcement, MCP, evals. That's the interview story.
- Tailwind with a token-only theme keeps `validate_usage` simple: any arbitrary value or non-token class is a violation.
- Considered **React Aria Components** (stronger a11y, less common in AI-generated code) and **CSS Modules** (simpler, but agents produce far more Tailwind than CSS Modules). Rejected for speed and AI-ecosystem fit.
