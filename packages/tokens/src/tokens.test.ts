import { mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { compile } from "@tailwindcss/node";
import Color from "colorjs.io";
import { beforeAll, describe, expect, it } from "vitest";
import {
  buildModel,
  buildTokens,
  generatedDir,
  type TokenEntry,
  tokensDir,
} from "../scripts/build-tokens.ts";

let entries: TokenEntry[];
let primitiveNames: string[];
let themeCss: string;

beforeAll(async () => {
  ({ entries, primitiveNames } = await buildModel());
  themeCss = await readFile(join(generatedDir, "theme.css"), "utf8");
});

const readJson = async (path: string): Promise<Record<string, unknown>> =>
  JSON.parse(await readFile(join(tokensDir, path), "utf8")) as Record<string, unknown>;

/** Token keys of a DTCG group, ignoring `$type`, `$description` and other `$` properties. */
const tokenKeys = (group: unknown): string[] =>
  Object.keys(group as Record<string, unknown>).filter((key) => !key.startsWith("$"));

describe("resolve", () => {
  it("resolves every semantic and component token to a concrete value in both modes", () => {
    expect(entries.length).toBeGreaterThan(0);
    for (const entry of entries) {
      for (const value of [entry.light, entry.dark]) {
        expect(value, entry.name).not.toBe("");
        expect(value, `${entry.name} still contains a reference`).not.toMatch(/[{}]/);
      }
    }
  });

  it("gives every semantic color and shadow an explicit light and dark value", async () => {
    for (const file of ["color.json", "shadow.json"]) {
      const group = file === "color.json" ? "color" : "shadow";
      const described = tokenKeys((await readJson(`semantic/${file}`))[group]);
      const light = tokenKeys((await readJson(`semantic/light/${file}`))[group]);
      const dark = tokenKeys((await readJson(`semantic/dark/${file}`))[group]);
      expect(light.sort(), `semantic/light/${file}`).toEqual(described.sort());
      expect(dark.sort(), `semantic/dark/${file}`).toEqual(described.sort());
    }
  });

  it("documents every public token", () => {
    const undocumented = entries
      .filter((entry) => entry.description === "" && !entry.name.endsWith("-line-height"))
      .map((entry) => entry.name);
    expect(undocumented).toEqual([]);
  });
});

describe("@theme", () => {
  it("exposes semantic and component tokens only, never a primitive", () => {
    const publicVars = new Set(entries.map((entry) => entry.cssVar));
    const referenced = [...themeCss.matchAll(/var\((--tsr-[a-z0-9-]+)\)/g)].map(
      (match) => match[1],
    );

    expect(referenced.length).toBe(entries.length);
    for (const cssVar of referenced) expect(publicVars, cssVar).toContain(cssVar);
    expect(themeCss).not.toMatch(/primitive/);
    for (const name of primitiveNames) expect(themeCss).not.toContain(`--tsr-${name}`);
  });
});

describe("contrast (WCAG 2.x)", async () => {
  const pairs = (await readJson("contrast-pairs.json")) as Record<
    "text" | "ui",
    { fg: string; bg: string }[]
  >;
  const byName = (name: string): TokenEntry => {
    const entry = entries.find((candidate) => candidate.name === `color-${name}`);
    if (!entry) throw new Error(`contrast-pairs.json: unknown color "${name}"`);
    return entry;
  };
  const cases = [
    ...pairs.text.map((pair) => ({ ...pair, min: 4.5, kind: "text" })),
    ...pairs.ui.map((pair) => ({ ...pair, min: 3, kind: "ui" })),
  ].flatMap((pair) => (["light", "dark"] as const).map((mode) => ({ ...pair, mode })));

  it.each(cases)("$kind $fg on $bg ($mode) ≥ $min:1", ({ fg, bg, min, mode }) => {
    const ratio = new Color(byName(bg)[mode]).contrast(new Color(byName(fg)[mode]), "WCAG21");
    expect(ratio).toBeGreaterThanOrEqual(min);
  });
});

describe("generated files", () => {
  it("match a fresh build (run `pnpm --filter @tessera/tokens tokens` after editing tokens/)", async () => {
    const fresh = await mkdtemp(join(tmpdir(), "tessera-tokens-"));
    for (const file of await buildTokens(fresh)) {
      const name = file.slice(fresh.length + 1);
      const committed = await readFile(join(generatedDir, name), "utf8");
      expect(await readFile(file, "utf8"), `src/generated/${name} is out of date`).toBe(committed);
    }
  });

  it("snapshot: theme.css", async () => {
    await expect(themeCss).toMatchFileSnapshot("./__snapshots__/theme.css.snap");
  });
});

describe("Tailwind", () => {
  const css = '@import "tailwindcss";\n@import "./generated/theme.css";\n';
  const build = async (candidates: string[]): Promise<string> => {
    const compiler = await compile(css, {
      base: dirname(fileURLToPath(import.meta.url)),
      onDependency: () => {},
    });
    return compiler.build(candidates);
  };

  it("generates utilities from semantic tokens, reading the runtime vars", async () => {
    const out = await build([
      "bg-surface",
      "text-fg-muted",
      "p-md",
      "rounded-lg",
      "text-sm",
      "h-control",
    ]);
    expect(out).toContain("background-color: var(--tsr-color-surface)");
    expect(out).toContain("color: var(--tsr-color-fg-muted)");
    expect(out).toContain("var(--tsr-spacing-md)");
    expect(out).toContain("var(--tsr-radius-lg)");
    expect(out).toContain("var(--tsr-text-sm-size)");
    expect(out).toContain("var(--tsr-spacing-control)");
  });

  it("generates nothing for Tailwind's default palette and scales", async () => {
    const defaults = [
      "bg-red-600",
      "text-gray-500",
      "p-4",
      "gap-2",
      "rounded-md",
      "text-base",
      "shadow-xl",
    ];
    const out = await build(defaults);
    for (const utility of defaults.filter((name) => name !== "rounded-md")) {
      expect(out, utility).not.toContain(`.${utility}`);
    }
  });
});
