import { defineConfig } from "vitest/config";

// Lets you run `pnpm exec vitest` from the root (and lets editors find every package).
// CI runs tests per package through Turborepo instead, so results are cached.
export default defineConfig({
  test: {
    projects: ["packages/*"],
  },
});
