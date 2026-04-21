# Rough Runway — Agent Instructions

You've found the agent-friendly entry point for Rough Runway, a crypto treasury runway forecasting tool.

## What this tool does

Takes a crypto org's treasury holdings + monthly burn/inflows and produces a 12-18 month runway projection with two key numbers:

- **Hard Runway** — months of runway using only stablecoins + fiat (the guaranteed floor)
- **Extended Runway** — months including realistic liquidation of volatile assets (BTC/ETH/native tokens), accounting for haircut and per-asset sell capacity

Users can also define "what-if" scenarios (price drops, layoffs, new grants, etc.) that layer on top of the baseline without mutating it.

## Key properties for agents

- **No login, no backend storage.** All state is client-side (localStorage). You can construct a complete model, hand the user a URL or JSON, and the tool loads it fresh.
- **Public JSON Schemas.** `/schema/model.json` and `/schema/scenario.json` define the exact data shape.
- **Shareable URLs.** Models can be encoded into `#model=<lz-compressed-base64>` fragments. Generate a URL, the user clicks, the model loads.
- **Pure-function engine.** The projection logic is deterministic; given the same model, you always get the same output.

## How to help a user

### 1. User describes their org, wants to see runway

See [`/skills/create-runway-model/SKILL.md`](https://github.com/hewi333/roughrunway/blob/main/skills/create-runway-model/SKILL.md) for the step-by-step. The short version:

1. Ask for treasury (stables, fiat, volatile assets with quantities and prices)
2. Ask for monthly burn (by category) and monthly inflows
3. Construct a JSON object matching `/schema/model.json`
4. Hand it to the user as a shareable URL, downloadable `.json`, or paste-able text

### 2. User asks a "what if"

See [`/skills/run-scenario/SKILL.md`](https://github.com/hewi333/roughrunway/blob/main/skills/run-scenario/SKILL.md).

Scenarios are **diffs** against the baseline — only include the fields you want to change. Don't restate the whole model.

### 3. User has a projection, wants interpretation

See [`/skills/analyze-projection/SKILL.md`](https://github.com/hewi333/roughrunway/blob/main/skills/analyze-projection/SKILL.md).

Always mention both runway numbers (Hard + Extended), not just one. The gap between them is the product.

## Important concepts

- **Hard Runway** uses ONLY stables + fiat. BTC, ETH, native token — all treated as volatile and excluded from Hard.
- **Extended Runway** is a month-by-month simulation of liquidating volatile assets under their individual liquidity profiles (haircut %, max sell per month, price assumption). It is *not* a snapshot valuation.
- **Funding gap** = cumulative deficit that couldn't be covered even after liquidation. The app displays this prominently when a projection "survives 18 months" only because unmet deficits were projected forward. Never hide this.
- **Liquidation priority** is user-configurable per asset (lower number = sold first). Defaults: major crypto = 10, alts = 30, native token = 50. But users override this freely — some keep BTC for tax-loss harvesting, some dump stables before touching their native token.

## API surface for agents (stable)

| Path | Method | Purpose |
|---|---|---|
| `/schema/model.json` | GET | JSON Schema for the model |
| `/schema/scenario.json` | GET | JSON Schema for scenario overrides |
| `/dashboard#model=<encoded>` | — | Load a model from a shareable URL |

Agentic endpoints for POSTing models directly are on the roadmap. For now, the import dialog in the UI accepts file upload, paste, and URL input.

## DOM conventions

The UI includes machine-readable attributes for browser-automation agents:

- `data-action="<verb>"` on every button (e.g., `data-action="add-stablecoin"`, `data-action="export-model"`)
- `data-field="<field-path>"` on every input (e.g., `data-field="treasury.stablecoins.0.amount"`)
- `data-value` on displayed numbers for programmatic read (chart tooltips, runway cards, breakdown table)

## Source of truth

- Repo: https://github.com/hewi333/roughrunway
- License: MIT
- Built for: Accountant Quits Web3 Crypto Hackathon (April 20-27, 2026)
- Sponsored by: Perplexity AI
