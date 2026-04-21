# CryptoRunway

Self-serve treasury runway forecasting for small crypto organizations.

**Live demo**: _TBD — deploy to Vercel post-hackathon_
**Status**: Planning + engine complete. UI implementation in progress.

> Built for the **Accountant Quits Web3 Crypto Hackathon** (April 20-27, 2026).
> AI inference powered by **Perplexity AI** (hackathon sponsor).

---

## What this is

CryptoRunway answers one question for a crypto-org CFO: **"When do we run out of money?"**

Unlike enterprise treasury tools, there's no login, no onboarding, no sales call, no integrations. You open the page, enter your numbers, and get two runway numbers:

- **Hard Runway** — months of runway using only stablecoins + fiat. The guaranteed floor.
- **Extended Runway** — months including realistic liquidation of volatile assets (BTC, ETH, native tokens), accounting for per-asset haircut and sell capacity. Simulated month by month, not a snapshot valuation.

Plus scenario analysis (bear market, aggressive hiring, token crash) that branches off the baseline without mutating it.

All data is client-side (localStorage). Export as JSON, share as a URL, or hand to an AI agent.

---

## Repository layout

```
cryptorunway/
├── docs/                    # Specs — start here
│   ├── 01-PRODUCT-SPEC.md
│   ├── 02-DATA-MODEL.md
│   ├── 03-ARCHITECTURE.md
│   ├── 04-BUILD-PLAN.md
│   ├── 05-PROJECTION-ENGINE.md
│   ├── 06-PERPLEXITY-INTEGRATION.md
│   └── 07-AGENT-ARCHITECTURE.md
├── lib/                     # Pure logic (no UI dependencies)
│   ├── types.ts             # Every TS interface
│   ├── constants.ts         # Preset categories, scenario templates
│   ├── utils.ts             # ID gen, currency/date formatters
│   ├── projection-engine.ts # computeProjection() — the core math
│   └── scenario-engine.ts   # applyScenarioOverrides()
├── tests/
│   └── projection-engine.test.ts  # 9 canonical fixtures, 26 assertions
├── app/                     # Next.js 14 App Router
│   ├── layout.tsx
│   ├── page.tsx             # Landing page
│   ├── dashboard/page.tsx   # Main app (placeholder — to be built)
│   └── schema/              # /schema/*.json — public JSON Schema endpoints
├── skills/                  # Agent-facing SKILL.md files
│   ├── create-runway-model/
│   ├── import-export-model/
│   ├── run-scenario/
│   └── analyze-projection/
├── public/
│   └── .well-known/
│       └── agent-instructions.md  # First port of call for AI agents
└── components/              # (empty — to be built per docs/03)
```

---

## Getting started

```bash
# Install
npm install

# Run tests (validates the projection engine — 26 passing)
npm test

# Typecheck
npm run typecheck

# Dev server
npm run dev
```

Open http://localhost:3000.

### Environment variables

Copy `.env.local.example` to `.env.local` and fill in:

```
PERPLEXITY_API_KEY=<your key>
```

Perplexity is the AI provider for scenario parsing, the live market banner, and the natural-language setup assistant. See `docs/06-PERPLEXITY-INTEGRATION.md`.

---

## The projection engine is tested

Before building any UI, the pure-function engine in `lib/projection-engine.ts` is validated against 9 hand-verified fixtures covering:

1. Pure cash baseline
2. Stables + fiat mix
3. Inflows offsetting burn
4. Liquid native token extends runway (with strain)
5. Illiquid native token — liquidity bottleneck
6. Multi-asset priority (ETH first, then native)
7. Declining token price
8. One-off event spike
9. Profitable org (infinite runway)

Run `npm test` to verify. If any fixture fails, the engine's math is wrong — do not proceed to UI work until fixed.

---

## For AI agents

CryptoRunway is designed to be agent-friendly from day one.

- **JSON Schema**: [`/schema/model.json`](./app/schema/model.json/route.ts), [`/schema/scenario.json`](./app/schema/scenario.json/route.ts)
- **Agent instructions**: [`/.well-known/agent-instructions.md`](./public/.well-known/agent-instructions.md)
- **Skills**: [`/skills/`](./skills/) — four SKILL.md files covering model creation, import/export, scenarios, and projection analysis

### Typical agent flow

1. Agent reads `/.well-known/agent-instructions.md`
2. Agent reads relevant SKILL.md
3. Agent asks the user for their treasury/burn via conversation
4. Agent constructs JSON matching `/schema/model.json`
5. Agent hands the user a shareable URL: `https://cryptorunway.app/dashboard#model=<lz-compressed-base64>`
6. User clicks — model loads, projection runs, scenarios can be built

No API keys, no auth, no coordination. The tool is self-describing.

---

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS |
| State | Zustand |
| Charts | Recharts |
| Persistence | localStorage (client-only) |
| AI | Perplexity API (Sonar models) |
| Testing | Vitest |
| Hosting | Vercel |

---

## License

MIT. See `LICENSE`.

---

## Credits

- Hackathon: [Accountant Quits Web3 Crypto Hackathon](https://accountantquits.com)
- Sponsor: [Perplexity AI](https://www.perplexity.ai)
