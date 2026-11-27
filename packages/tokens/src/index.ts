/**
 * Tessera design tokens.
 *
 * - CSS: `@import "@tessera/tokens/theme.css"` (Tailwind v4, includes tokens.css)
 *   or `@import "@tessera/tokens/tokens.css"` (plain CSS custom properties).
 * - JS/TS: `tokens` below, with light/dark values and a description per token.
 *
 * Only semantic and component tokens are public. Primitives are build inputs.
 */
export { type TokenName, tokens } from "./generated/tokens.ts";
