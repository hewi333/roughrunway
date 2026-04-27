# RoughRunway

Treasury runway forecasting for crypto organizations. Two runway numbers, AI-assisted setup, and scenario stress-testing — no login, no backend, no spreadsheet.

**[roughrunway.com](https://roughrunway.com)** &nbsp;·&nbsp; Built for [The Accountant Quits Hackathon](https://www.theaccountantquits.com/), April 2026

---

<!-- Screenshot: replace this comment with ![RoughRunway dashboard](./docs/screenshot.png) -->
<!-- Best capture: dark mode, projection chart visible, one scenario active, funding gap callout showing -->

---

## The problem it solves

A crypto treasury isn't a single number. It's stablecoins, ETH that dropped 40% last month, a native token you can't sell without moving your own price, and a burn rate split across payroll, grants, and infrastructure. Modeling this accurately in a spreadsheet is a recurring full-time job — and it's wrong the moment prices move.

RoughRunway replaces that spreadsheet. Input your treasury and burn rate; get two runway numbers instantly, with a month-by-month simulation underneath.

---

## Core output

**Hard runway** — how long your stablecoins and fiat last at current burn. No volatile assets included. This is your guaranteed floor.

**Extended runway** — a month-by-month simulation of liquidating volatile assets (ETH, BTC, SOL, native tokens) in user-configured priority order, applying per-asset haircuts and monthly sell limits. When liquidity can't cover the deficit, the engine tracks a **funding gap** — the dollar amount you'd need to raise or cut that month.

---

## Projection model

Each volatile asset has its own liquidation profile:

| Asset type | Default haircut | Sell limit |
|---|---|---|
| Major crypto (BTC, ETH) | 2% | User-configured monthly cap |
| Alt tokens | 10% | User-configured monthly cap |
| Native / protocol token | 15% | Raw cap or % of 24h volume |

Liquidation order is user-configurable via drag-to-reorder. The engine runs forward month by month: burn from hard assets first, then draw down volatile assets in priority order until the deficit is covered or liquidity runs out. Vesting unlocks, inflow cliffs, and per-category growth rates are all modeled.

---

## Scenario analysis

Up to five named scenarios, each a parallel projection against your baseline. Scenarios never mutate the base model — they apply overrides to a deep clone and run a separate simulation.

Preset templates included: Bear Market, Token Crash, Aggressive Hiring, Emergency Cuts, Fundraising Win. Or describe a scenario in plain English and the AI builds the override set.

---

## AI features

Powered by [Perplexity](https://www.perplexity.ai/) Sonar:

- **Natural language setup** — describe your treasury; AI fills in the full model for review
- **Natural language scenarios** — type "ETH down 70%, cut marketing 30%" and the overrides are created
- **Live market banner** — current prices and headlines for your assets, pulled fresh from Perplexity

---

## Sharing

The entire model compresses into the URL hash (lz-string). Share a link; the recipient sees your exact model with no server round-trip, no account, no setup. Export and import as JSON also supported.

---

## Getting started

```bash
git clone https://github.com/hewi333/roughrunway
cd roughrunway
cp .env.local.example .env.local   # add your PERPLEXITY_API_KEY
npm install
npm run dev
```

Open [localhost:3000](http://localhost:3000). AI features require a [Perplexity API key](https://www.perplexity.ai/). Everything else — projection engine, scenarios, sharing — runs without one. A demo org (Nexus Labs) loads on first visit.

---

## Tech stack

| | |
|---|---|
| Framework | Next.js 14, App Router, TypeScript strict |
| State | Zustand + localStorage — no backend, no database |
| Charts | Recharts |
| AI | Perplexity Sonar / Sonar Pro, structured JSON output |
| Styling | Tailwind CSS + shadcn/ui |
| Sharing | lz-string URL compression |
| Hosting | Vercel |

---

*Built for the Accountant Quits Web3 Hackathon, April 2026. MIT licensed.*
