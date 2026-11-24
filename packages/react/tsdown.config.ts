import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["src/index.ts"],
  format: "esm",
  // A library for any environment, consumed through a bundler: not Node-specific.
  platform: "neutral",
  target: "es2023",
  // Emit .js / .d.ts (the package is "type": "module"), matching "exports".
  fixedExtension: false,
  dts: true,
  clean: true,
  // Fail the build if package.json points at files that weren't emitted.
  publint: { level: "warning" },
  failOnWarn: true,
});
