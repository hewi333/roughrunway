# RoughRunway

**Know your runway. Before you run out.**

🔗 **[roughrunway.com](https://roughrunway.com)** · Built for the [Accountant Quits Web3 Hackathon](https://lu.ma/accountantquits) · April 2026

---

<!--
  ADD SCREENSHOT: replace this comment with:
  ![RoughRunway dashboard](./docs/screenshot.png)
  Best shot: dark mode, chart visible, at least one scenario active, funding gap callout showing.
-->

---

## The problem

Every DAO and crypto org has the same meeting:

> *"How long do we have?"*
> *"Depends on ETH."*
> *"Okay but… roughly?"*
> *"Hard to say."*

Your treasury isn't just USDC. It's ETH that swings 40% in a month, native tokens you can't dump without crashing your own price, and a burn rate split across payroll, legal, infra, and grants. Modeling that in a spreadsheet is a full-time job — and it's wrong the moment prices move.

**RoughRunway solves this in under a minute.**

---

## What it does

Input your treasury. Set your burn. Get two numbers instantly:

- **Hard runway** — how long your stables and fiat last at current burn. The guaranteed floor.
- **Extended runway** — how much longer if you liquidate volatile assets in priority order, with per-asset haircuts and monthly sell limits. Simulated month-by-month, not a snapshot.

Then stress-test it:

> *"What if ETH drops 60%?"*
> *"What if we hire 3 engineers?"*
> *"What if our grant cliff hits in month 4?"*

Run scenarios side-by-side. See exactly how each one moves your runway date.

Share the link. Anyone who clicks it sees your exact model — no login, no account, no setup.

---

## Five-second demo

1. Go to **[roughrunway.com](https://roughrunway.com)**
2. Describe your treasury in plain English — AI fills in the model
3. See your runway chart and summary cards
4. Open Scenarios — type a stress test in plain English
5. Click **Share** — copy a link with your full model encoded in the URL

---

## What makes it different

**It actually models crypto treasuries**

Most tools treat your treasury as a single number. RoughRunway models each asset separately — stablecoins, fiat, BTC/ETH, and native tokens — with realistic sell constraints:

| Asset tier | Haircut | Behavior |
|------------|---------|----------|
| Major (BTC, ETH) | 2% | Liquid, sell up to your monthly limit |
| Alt tokens | 10% | Sell constrained by your set limit |
| Native/protocol token | 15% | High illiquidity, last to liquidate |

**Scenario analysis without the spreadsheet**

Type a scenario in plain English. The AI parses it into overrides and runs a parallel projection. Compare multiple scenarios against baseline in a single table — runway delta, funding gap, average net burn.

**Shareable links with no backend**

The entire model compresses into the URL hash using lz-string. Send it to your board, your accountant, or a co-founder. They click it, they see it. Nothing stored on a server.

---

## AI features

- **Setup assistant** — describe your treasury in plain English, AI builds the full model
- **Scenario parser** — type "bear market, ETH down 70%, cut marketing 30%" and it creates the override set
- **Live market banner** — real-time crypto prices and news headlines for your assets, powered by Perplexity Sonar

---

## Quickstart

```bash
git clone https://github.com/hewi333/roughrunway
cd roughrunway
cp .env.example .env.local   # add your PERPLEXITY_API_KEY
npm install
npm run dev
```

Open [localhost:3000](http://localhost:3000). AI features require a [Perplexity API key](https://www.perplexity.ai/) — everything else works without one.

---

## Tech stack

| | |
|---|---|
| Framework | Next.js 14 (App Router, TypeScript strict) |
| State | Zustand + localStorage (no backend, no database) |
| Charts | Recharts — stacked treasury areas + scenario overlay lines |
| AI | Perplexity Sonar / Sonar Pro with structured JSON output |
| Styling | Tailwind CSS + shadcn/ui |
| Sharing | lz-string URL compression — full model in the hash |
| Hosting | Vercel |

---

*Built for the Accountant Quits Web3 Hackathon, April 2026.*
