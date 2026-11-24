# ADR-0005: Pin TypeScript 6, not 7

- Status: Accepted (2026-11-24)
- Amends: ADR-0001 ("pin the latest stable releases", for TypeScript only)

## Context
ADR-0001 says we pin the latest stable version of each tool when we scaffold. On 2026-11-24 that is TypeScript **7.0.2**, the native (Go) compiler. It typechecks much faster, but it ships without the stable JavaScript compiler API: its package exports only `version` plus `unstable/*` entry points.

Two planned pieces depend on that API:
- **`@tessera/eslint-plugin`** (ADR-0002) is built on typescript-eslint, whose current release (8.74.0) supports `typescript >=4.8.4 <6.1.0`.
- **Phase 2 metadata generation** reads component props from TS types for the MCP server, which needs a type checker you can call from JavaScript (react-docgen-typescript, ts-morph, or the compiler API directly).

## Decision
Pin **TypeScript 6.0.3**, the latest 6.x release, in the pnpm catalog. Every package uses it for `tsc --noEmit` and for tsdown's declaration build.

We revisit this when typescript-eslint supports TS 7 and TS 7's API is stable. At that point the upgrade is a one-line change to the catalog plus a typecheck run.

## Consequences
- Typecheck runs at TS 6 speed. That's fine for about 6 packages; tsdown already generates `.d.ts` files without the type checker (`isolatedDeclarations`).
- Nothing in Phases 1–2 is blocked, and there's only one compiler in the repo.
- Rejected: **TS 7 now** (blocks ADR-0002's ESLint plugin and Phase 2 metadata); **TS 6 plus the TS 7 native compiler for typecheck only** (faster, but two compilers that can disagree, which is extra setup for no real gain at this size).
