# CryptoRunway — Product Specification

**Status**: v1.0 (final for hackathon MVP)
**Last updated**: April 21, 2026

---

## Overview

CryptoRunway is a hosted, self-serve treasury runway forecasting tool built for small crypto organizations — labs, foundations, early-stage protocols, and small funds. The target user is a Head of Finance / CFO at a 5-20 person crypto company who is hands-on with treasury management and needs to answer one critical question: **"When do we run out of money?"**

Unlike enterprise SaaS tools (Bitwave, Tres Finance, Coinshift), CryptoRunway requires no onboarding, no sales call, no login, no integrations. A finance person shows up, inputs their numbers, and gets a clear answer with crypto-native intelligence — including realistic token liquidation estimates for every volatile asset they hold.

The app is also designed from day one to be **agent-friendly**: an AI agent can read the schema, fill in a model, import it via JSON or URL, and read back projections without any special API. See `07-AGENT-ARCHITECTURE.md` for details.

---

## Hackathon Context

- **Event**: Accountant Quits Web3 Crypto Hackathon (April 20-27, 2026)
- **Format**: Vibe coding hackathon, ~50 participants, judged by participants via 2-3 minute video submissions
- **Sponsor**: Perplexity AI (all AI inference goes through Perplexity — see `06-PERPLEXITY-INTEGRATION.md`)
- **Post-hackathon**: Open-sourced under MIT license, hosted live as evergreen marketing material for Accountant Quits

---

## Target User Persona

- **Role**: CFO, Head of Finance, VP Finance, or Finance Lead at a small crypto org
- **Org size**: 5-20 people (the CFO is doing AP/AR/treasury/reporting themselves)
- **Technical level**: Financially sophisticated, NOT engineering-oriented, but understands crypto basics (tokens, liquidity, haircuts, vesting)
- **Pain point**: Currently doing this analysis in spreadsheets, rebuilding it every board meeting, and struggling to account for token volatility and liquidity constraints
- **Platform**: Desktop web browser. Mobile users see an interstitial directing them to desktop.

---

## Core Value Proposition

Two runway answers in one view:

1. **Hard Runway** — Using ONLY stablecoins and fiat. This is your guaranteed floor. Volatile assets are not included under any circumstances.
2. **Extended Runway** — A month-by-month simulation of liquidating your volatile assets (native token, ETH, BTC, SOL, anything) under their real-world liquidity constraints and haircut assumptions. Not "tokens × spot price" fantasy math.

Plus **scenario analysis** that lets you model changes without touching your baseline, and **AI-assisted setup and scenarios** powered by Perplexity.

---

## Key Design Decisions (locked)

These decisions resolve ambiguities from earlier spec drafts. They are final.

### D1. Hard Runway = stables + fiat only
Major crypto (ETH, BTC, SOL) is volatile and does NOT count toward Hard Runway. It goes into Extended Runway with its own liquidity profile. This is the product's core honesty promise — anything that could lose 50% overnight is not a "guaranteed floor."

### D2. Unified Volatile Assets
Native tokens and major crypto are the same class: `VolatileAsset`. Each has its own liquidity profile (haircut, max sell per month, price assumption) and its own user-configured liquidation priority. See `02-DATA-MODEL.md`.

### D3. Extended Runway = simulation, not valuation
The Extended Runway line is produced by a real month-by-month simulation: how much can you actually sell, at what haircut, given the burn? When liquidity can't keep up with burn, we track the **funding gap** — the dollar amount the org would need to raise (or cut) to actually survive that month. See `05-PROJECTION-ENGINE.md`.

### D4. User-configured liquidation priority
The order in which volatile assets are liquidated is set by the user, not hardcoded. Every org has different preferences: some sell BTC for tax-loss harvesting first, some protect BTC gains and dump stables first, nobody wants to dump their native token. Defaults are suggestions only.

### D5. Currency routing on burn categories: deferred to v2
The `currency: "fiat" | "stablecoin" | "native_token"` field on `BurnCategory` stays in the type definition but is not used by the v1 engine and not exposed in the UI. Reserved for future.

### D6. No backend, no login, ever (MVP)
All state is client-side: Zustand store + localStorage. AI calls go through Next.js API routes as a thin proxy (to hide the API key) but store nothing server-side.

### D7. Desktop-only for MVP
Mobile users see an interstitial directing them to desktop. No half-broken mobile UI.

---

## Feature Specification

### 1. Treasury Snapshot (Input)

#### Asset Categories

| Category | Fields | Notes |
|----------|--------|-------|
| **Stablecoins** | Name (USDC/USDT/DAI/etc.), amount | USD-pegged assumed |
| **Fiat** | Currency (USD/EUR/GBP), amount | USD for MVP; others display only |
| **Volatile Assets** | Name, ticker, tier, quantity, price, liquidity profile, liquidation priority | Unified list — native token and major crypto are both `VolatileAsset` |

#### VolatileAsset Liquidity Profile (per asset)
- **Tier** — "major" (ETH, BTC), "alt" (other tradeable crypto), or "native" (your own token). Controls UI grouping and sets sensible defaults.
- **Haircut %** — expected slippage/impact on sale. Defaults: major 2%, alt 10%, native 15%.
- **Max sell per month** — how many tokens you can realistically sell in a month, either as a raw token count or as a % of 24h volume. Defaults: major unlimited, alt ~10% of holdings, native ~2% of daily volume × 30.
- **Price assumption** — constant, monthly decline %, or custom per-month schedule.
- **Liquidation priority** — integer. Lower = liquidated first when burn exceeds hard assets. User-configurable via drag-to-reorder.
- **Vesting schedule** (optional, native tokens) — unlock events that add quantity at specific months.

#### Data Persistence
- On first visit: Nexus Labs demo model loads. "Start Fresh" button clears it.
- localStorage with debounced saves (~500ms idle).
- Export/import as JSON.
- Shareable URL (`/dashboard#model=<base64>`).

### 2. Burn Modeling (Monthly Outflows)

#### Preset Categories
1. **Headcount & Payroll** — Cash payroll + benefits
2. **Employee Token Grants** — Token-based comp tracked in USD equivalent
3. **Infrastructure & Tooling** — Cloud, SaaS, RPC nodes, indexers
4. **Legal & Compliance** — Outside counsel, audit, regulatory
5. **Marketing & Growth** — Events, sponsorships, campaigns
6. **Token Incentives / Emissions** — Ongoing token distributions
7. **Grants & Ecosystem** — Grants paid out
8. **Office & Admin** — Rent, insurance, misc

Plus unlimited custom categories.

#### Monthly Adjustments per Category
- **Baseline** — recurring monthly amount
- **One-off** — additional charge/credit for a specific month (negative values allowed)
- **Baseline change** — changes the baseline starting at a specific month
- **Growth rate** — optional % monthly compound

### 3. Inflow Modeling (Monthly Inflows)

Same structure as burn. Preset categories:
1. **Staking Rewards**
2. **Grant Income**
3. **Revenue / Protocol Fees**
4. **Token Sales (Planned)**
5. **Other Income**

### 4. Projection Engine

See `05-PROJECTION-ENGINE.md` for the full specification.

#### Timeline
- Horizon: 12, 15, or 18 months
- X-axis: calendar months
- Y-axis: USD value

#### Chart Layers
1. **Stacked area** — treasury composition over time (stables, fiat, per-asset value at haircut)
2. **Hard Runway line** — solid, prominent
3. **Extended Runway line** — dashed
4. **Scenario lines** — one per active scenario, distinct colors

#### Summary Cards
- **Hard Runway**: "X months — runs out [DATE]" color-coded (green >12mo, amber 6-12mo, red <6mo)
- **Extended Runway**: same format; displays "∞" if cashflow-positive, or "18+ months ⚠️ Funding gap: $X.XM" if horizon survives with liquidity strain
- **Monthly net burn** shown below

#### Monthly Breakdown Table
Expandable table: burn, inflows, net burn, stables/fiat drawdown, each asset's liquidation (tokens sold, proceeds), funding gap this month, cumulative funding gap, hard balance, extended balance.

### 5. Scenario Analysis

- Up to 5 named scenarios, never mutate baseline
- Each scenario is a set of overrides applied to a deep clone of the baseline
- Scenarios appear as additional chart lines and in a comparison table
- Toggle individual scenarios on/off

#### Preset Scenario Templates
- **Bear Market**: All volatile prices -50%, revenue -30%, haircuts +10pp
- **Token Crash**: Native token -80%, native haircut +20pp, native max-sell halved
- **Aggressive Hiring**: +5 headcount at $15K/mo avg
- **Emergency Cuts**: -30% all non-headcount burn
- **Fundraising Win**: +$2M stables in month 3

### 6. AI Layer (Perplexity)

Full spec in `06-PERPLEXITY-INTEGRATION.md`. Summary:

- **Natural language scenario builder** — text input → Sonar → ScenarioOverrides JSON → user reviews → applied
- **Natural language initial setup** — text or voice → Sonar → full model JSON → user reviews → loaded
- **Live market banner** — BTC/ETH/SOL prices + native token if applicable + 2-3 recent news headlines with Perplexity citations, refreshed every 5-10 min
- **Prominent branding** — "Powered by Perplexity" on every AI button, banner, and call

### 7. Demo Data — "Nexus Labs"

Loads on first visit:
- 12-person team
- $1.5M USDC + 500K DAI
- 50M NEXUS @ $0.12 (15% haircut, 250K/mo cap, priority 50)
- 100 ETH (2% haircut, priority 10)
- 2 BTC (2% haircut, priority 10)
- Monthly burn ~$250K
- Staking income $5K/mo
- Pre-built scenarios: "Bear Market", "Aggressive Hiring"

### 8. Export / Import / Share

- **Export**: JSON download, copy to clipboard, shareable URL (hash fragment)
- **Import**: file upload, paste JSON, paste URL
- **Stretch**: PDF export of chart + summary

---

## Non-Functional Requirements

### Performance
- Client-side projection updates
- Sub-2-second page load
- Debounced localStorage writes

### Data Privacy
- No treasury data server-side in MVP
- AI calls: only structured model data sent, never raw documents
- API keys server-side only
- Hash fragments never sent to server

### Accessibility
- WCAG AA contrast
- Keyboard navigation
- Screen reader labels
- Agent-accessible `data-*` attributes (see `07-AGENT-ARCHITECTURE.md`)
- Print-friendly CSS

### Browser Support
- Latest Chrome, Firefox, Safari, Edge on desktop
- Mobile: interstitial

---

## MVP Scope

### Committed (must ship)
- Treasury input with unified volatile assets + per-asset liquidity
- User-configurable liquidation priority (drag-to-reorder)
- Burn + inflow modeling with presets, custom, adjustments, growth
- Projection chart with Hard + Extended lines + stacked composition
- Funding gap tracking and display
- Scenario analysis (5 scenarios, 5 preset templates)
- localStorage + JSON export/import + shareable URL
- Perplexity: market banner + scenario parser + setup parser + voice
- Nexus Labs demo
- Branding (Accountant Quits + Perplexity)
- Mobile interstitial
- Agent-friendly architecture (schemas, `.well-known`, SKILLs, `data-*` attrs)
- 9 engine test fixtures passing

### Stretch
- Live price auto-refresh
- Real volume data from CoinGecko
- PDF export
- Multi-currency

### Post-Hackathon
- Accounts + backend
- Team sharing
- Historical tracking
- On-chain integration
- Alerts
- Bucket routing (D5 v2)

---

## Definition of Done

See `04-BUILD-PLAN.md` for the full checklist.
