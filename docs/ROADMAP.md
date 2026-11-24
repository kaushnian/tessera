# Roadmap

How we work: **Claude builds and teaches, you decide, review and merge.** Every phase has a Claude Code concept you'll learn by doing, and a "you" task that you have to do yourself. Don't skip those; they're what you'll talk about in interviews.

Status: ⬜ not started · 🟨 in progress · ✅ done

## Workflow for every task (the loop)

```
issue → plan mode → branch/worktree → tests first → implement → hooks/CI green
     → reviewer subagent → PR → YOU review & merge → decision-log entry
```

1. **Issue**: each task is a GitHub issue with acceptance criteria.
2. **Plan**: Claude proposes a plan in plan mode; you approve or push back.
3. **Build**: one branch per issue (worktrees when running tasks in parallel). Test-first where it makes sense.
4. **Verify**: hooks run on every edit; CI runs on every PR.
5. **Review**: a reviewer subagent, then you. **Nothing merges without you understanding it.**
6. **Log**: one entry in `docs/DECISION-LOG.md`: what the agent did, what broke, how you checked it.

---

## Phase 0 — Setup & spec (now) 🟨
| Task | Who | Learn |
|---|---|---|
| Save origin brief, roadmap, ADR-0001, CLAUDE.md | Claude ✅ | CLAUDE.md as project memory |
| Answer the open questions ✅ (Tessera · public · ~10 h/week) | **You** | — |
| Grill session to lock the MVP scope → `docs/SPEC.md` ✅ | Both | Using skills (`/grill-me`) |
| Create the public GitHub repo ✅ (kaushnian/tessera) | Claude | `gh` |
| Create Phase 1 issues | Claude (after your OK) | Issue-driven work |

## Phase 1 — Foundation (weeks 1–2) ⬜
Monorepo, token pipeline, the 10 v1 components (see `docs/SPEC.md` §4), Storybook, tests, CI.
| Task | Who | Learn |
|---|---|---|
| Scaffold monorepo + tooling + CI skeleton | Claude | Plan mode, permissions, `/init` vs hand-written CLAUDE.md |
| Tokens: DTCG JSON → Style Dictionary → CSS vars + TS | Claude | Writing a **skill** ("how to add a token") |
| Project hooks: typecheck/lint on edit, block raw hex | Claude, you configure | **Hooks** |
| Stack, Text, Heading, Button with tests, a11y, stories | Claude, TDD | Test-first with agents |
| Card, Input, Field, Select, Dialog, Toast, DataTable **in parallel** | Claude | **Subagents + git worktrees** |
| Write the "component contract" doc (by hand!) | **You** | The domain knowledge agents can't invent |
| Visual regression (Playwright) | Claude | Checking agent output |

## Phase 2 — Design-system MCP server (week 3) ⬜
| Task | Who | Learn |
|---|---|---|
| MCP server (local stdio, SPEC §8): `list_components`, `get_component_api`, `get_tokens`, `get_usage_guidelines`, `get_pattern`, `validate_usage` | Claude | **Building MCP** (TS SDK) |
| Generate component metadata from source (props from TS types) | Claude | Making a codebase AI-readable |
| `@tessera/eslint-plugin`: rules from `*.rules.yaml` + good/bad fixtures (ADR-0002) | Claude | Custom ESLint rules (AST) |
| 4 patterns (`pattern.yaml` + tested `example.tsx`) + `get_pattern` tool (SPEC §9) | Claude builds, **you** define the composition rules | Encoding tacit design knowledge |
| Threat model: prompt injection via docs/tool output | **You** + Claude | MCP security |
| Connect it to Claude Code and use it to build a demo screen | **You** | Consuming MCP |
| Release `1.0.0` (SPEC §10) | Claude, after your OK | Changesets, semver |

## Phase 3 — Claude Code plugin (week 4) ⬜
| Task | Who | Learn |
|---|---|---|
| Skill: "build a screen with our DS" | Claude | **Skills** |
| Subagent: design-system reviewer | Claude | **Subagents** |
| Hooks: no hardcoded colors/spacing, aria checks | Claude | **Hooks** (packaged) |
| Package as a plugin + marketplace entry | Claude | **Plugins** |

## Phase 4 — CI agents & evals (week 5) ⬜
| Task | Who | Learn |
|---|---|---|
| Claude PR review GitHub Action using DS rules | Claude | **Headless / `claude -p` / GH Action** |
| Staged 2.0 breaking change: deprecation in 1.x, Changeset, codemod, migrate playground (SPEC §10) | Claude, **you** run the migration | Release automation, codemods |
| Eval harness: 3 arms, pilot 5 prompts → final 20×3×3, via headless `claude -p` (`docs/SPEC.md` §5) | Claude | **Evals**, headless mode |
| Choose metrics, read the failures, write up the results | **You** | The interview story |

## Phase 5 — Ship & tell the story (week 6) ⬜
| Task | Who | Learn |
|---|---|---|
| Deploy Storybook + docs site | Claude | — |
| README + architecture diagram | Claude drafts, **you** edit | — |
| 3-minute demo video, blog post "what failed" | **You** | Telling the story |
| Mock interview: I grill you on every decision | Both | Interview prep |

## Stretch ⬜
- Figma MCP drift detection · Generative-UI chat app (Claude API streaming DS components) · Issue→PR agent.
