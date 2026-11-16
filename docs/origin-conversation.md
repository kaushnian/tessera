# Origin conversation (2026-11-16)

> Source: claude.ai shared conversation, pasted by the project owner. Kept verbatim (minus source chips) as the project's starting brief.

## The ask

I'm a senior frontend developer who is looking for a job. I want to create some project to expand my claude code knowledge and prepare for a next role. I'm targeting design system roles.
I want to learn latest trending AI features that are used inside top companies for the software development cycle. Give me some suggestions how can I quickly and efficiently gain that experience. What projects should i consider to implement. Design system is not a hard requirement, my main goal is to implement some project that would prepare me for interviews and make me a confident developer

## The answer (summary of recommendations)

What separates candidates now is knowing how to **orchestrate agents and check their output**. ~84–90% of developers use AI tools, but only ~13% of teams run AI across the full SDLC (Forrester, Keyhole Software). Explaining how you wired AI into planning, building, review and CI — and how you kept it reliable — stands out.

### Claude Code building blocks to learn (by building)

"Skills define what to do, MCP provides the data, Subagents and Agent Teams handle the delegation, Hooks enforce the rules, and Plugins package it all for your team."

- **CLAUDE.md & context management**: project rules, /compact, plan mode, small context.
- **Skills**: reusable instructions ("how we build a component here").
- **Subagents & agent teams**: reviewer agent, test-writer agent, parallel work in git worktrees.
- **Hooks**: always-on checks (lint, typecheck, "no raw hex colors" after every edit).
- **MCP**: connect existing servers (Figma, GitHub, Playwright) and write your own.
- **Headless & CI**: `claude -p` and the GitHub Action for automated PR review.
- **Evals**: measure whether agent output is correct. Few candidates have this.

### Flagship project: an "AI-ready" design system

Design systems are how companies make agents produce on-brand UI (Figma's "flywheel"). Gap: composition rules and spacing conventions live in people's heads, not in files. This project closes that gap.

Layers, in order:
1. **Foundation**: React + TypeScript library (Button, Input, Select, Dialog, Toast, DataTable); W3C DTCG tokens via Style Dictionary; Storybook docs; a11y tests; Playwright visual regression.
2. **Design-system MCP server**: `list_components`, `get_component_api`, `get_tokens`, `get_usage_guidelines`, `validate_usage` — read from real source and docs.
3. **Claude Code plugin** for library consumers: screen-building skill, design-review subagent, hooks rejecting hardcoded colors/spacing and missing aria labels.
4. **CI**: agent PR review against DS rules; auto changelogs; codemods for breaking changes.
5. **Evals**: 20 screen-building prompts, with vs without MCP + plugin. Score token use, a11y violations, type errors. ("Correct DS usage went from 40% to 90%.")
6. *Optional*: Figma MCP to detect design↔code drift.

Timeline (~6 weeks part-time): W1–2 foundation · W3 MCP · W4 plugin · W5 CI + evals · W6 README, architecture diagram, 3-min demo, blog post on what failed.

Side projects: generative-UI chat on the Claude API streaming real components via tool calls; spec→PR agent triggered by GitHub issues.

Interview tip: keep a **decision log** — what you delegated, what broke, how you verified, cost/context trade-offs, security risks (prompt injection via MCP tools). "How do you trust AI-written code?" is a common senior question.
