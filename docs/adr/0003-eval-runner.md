# ADR-0003: Headless Claude Code as the eval runner

- Status: Accepted (2026-11-18)
- Amends: ADR-0001 ("AI layer" row: "Claude Agent SDK for evals")

## Context
ADR-0001 planned to run evals through the Claude Agent SDK. The SDK needs an API key and per-token billing. The owner runs the project on a Claude Code subscription, and the eval arms (SPEC §5) compare *Claude Code itself* with and without the MCP server and plugin, so the runner should be the same tool a product team would use.

## Decision
- Evals run with **headless Claude Code**: `claude -p --output-format json`, one run at a time, each in an isolated temp workspace with the arm's `.mcp.json` / plugin config.
- Runs execute in batches, overnight if needed. Bulk runs on Sonnet, plus one Opus comparison.
- Tokens and turns per run are read from the JSON output.

## Consequences
- No API key or extra cost. The arms test the real consumer setup (Claude Code + `.mcp.json` + plugin), not a re-creation of it.
- Throughput is limited by the subscription's rate limits, so the final 180 runs (20 × 3 × 3) must be resumable and run sequentially.
- Less low-level control than the SDK (custom tool loops, hooks in code). Acceptable: we're measuring the product, not the agent loop.
- Rejected: **Agent SDK** (API cost, and a different harness from what consumers actually use).
