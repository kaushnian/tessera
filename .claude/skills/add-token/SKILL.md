---
name: add-token
description: Add, change, rename or remove a Tessera design token (color, spacing, radius, typography, shadow). Use when UI needs a value no existing semantic token covers, or when editing packages/tokens/tokens/.
---

# Add a token

Tokens are DTCG JSON in `packages/tokens/tokens/`, in three tiers:

| Tier | Folder | Public? | Named by |
|---|---|---|---|
| primitive | `primitive/` (root group `primitive`) | no: build input only | scale step: `primitive.color.teal.700`, `primitive.space.4` |
| semantic | `semantic/` (+ `light/`, `dark/`) | yes | role: `color.fg-muted`, `color.danger-subtle`, `spacing.md` |
| component | `component/` | yes, sparingly | component family: `radius.control`, `spacing.control` |

`scripts/build-tokens.ts` turns them into `src/generated/` (committed): `tokens.css` (runtime `--tsr-*` vars), `theme.css` (Tailwind `@theme`, semantic and component only) and `tokens.ts` (metadata for code and the MCP server).

## Steps

1. **Look for an existing token.** Read the descriptions in `packages/tokens/src/generated/tokens.ts`. Reuse a token whose *role* fits, even if its name differs from what you'd guess.
   Done when you can name the closest existing tokens and say why each doesn't fit.

2. **Choose the tier.** Semantic by default: a role any component could use. Component only when the value belongs to one family of components. A new primitive only when no step of the existing scales has the value you need; add it as a step of a scale, under the `primitive` root.
   Done when the token has a tier and a role-first kebab name that follows the existing patterns: `<role>`, `<role>-hover`, `<role>-subtle`, `fg-on-<role>`, t-shirt sizes for scales.

3. **Write the token.** Semantic and component values are references, `{primitive.…}` or `{<semantic>}`; literal values live only in primitives.
   - **Color or shadow** (varies by mode): `$description` in `semantic/color.json` or `semantic/shadow.json`, and a `$value` in *both* `semantic/light/` and `semantic/dark/`.
   - **Everything else**: one entry with `$value` and `$description` in the matching `semantic/*.json` or `component/*.json`.
   - **Description**: what the token is for and what it pairs with, written for an agent choosing between tokens ("Text on bg-danger; pair with bg-danger").
   - **New top-level group** (a namespace like `blur`): add it to `themeVarOf()` and `THEME_RESETS` in `scripts/build-tokens.ts`; the build names the function to edit.
   Done when every new token has a description and, for colors and shadows, a light and a dark value.

4. **Add contrast pairs** (colors only). In `tokens/contrast-pairs.json`, pair each new foreground with every background it will sit on, and each new background with every foreground that will sit on it: `text` for text and icons (4.5:1), `ui` for outlines, focus rings and control boundaries (3:1).
   Done when every combination the new color will appear in is listed.

5. **Generate.** `pnpm --filter @tessera/tokens tokens`, then read the `git diff` of `src/generated/`.
   Done when the token appears in `tokens.css` (in `[data-theme="dark"]` too, for colors), as one `var(--tsr-…)` line in `theme.css`, and in `tokens.ts` with its description.

6. **Test.** `pnpm --filter @tessera/tokens test`.
   - A contrast failure means the color is wrong: move to a darker step in light mode or a lighter step in dark mode. The thresholds are WCAG's and stay fixed.
   - A `theme.css` snapshot diff is expected for a new token: read it, then update with `pnpm --filter @tessera/tokens exec vitest run -u`.
   Done when the suite is green.

7. **Record the release.** `pnpm changeset`, package `@tessera/tokens`: **minor** for a new token, **patch** for a value change.
   Done when a `.changeset/*.md` file describes the token in one line.

## Renaming or removing a token

A public token name is API: components, apps and agent prompts use it. Before `1.0.0` (SPEC §10) a rename or removal is a **minor** changeset that says so; after `1.0.0` it is **major**, and the old name stays as a deprecated alias for one minor release first. Search the repo for the old name (`git grep -n "fg-muted"`) and update every use in the same PR.
