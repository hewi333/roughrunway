# CryptoRunway — Build Plan & Implementation Roadmap

**Status**: v1.0 (final)
**Timeline**: April 21-27, 2026 (1 week)
**Builder**: Solo dev using an agent-assisted coding harness

---

## Core Philosophy

Each phase produces a working, demoable increment. If time runs out at any phase, you still have something complete to show. The projection engine is built and tested FIRST because it's the riskiest component — bad math invalidates everything else.

---

## Pre-Work (Day 0 — already done or in progress)

### Environment & Docs
- [x] Product/data/architecture/engine docs finalized (this planning session)
- [ ] Create GitHub repo `cryptorunway`, MIT license
- [ ] Unzip the scaffold handed off from planning, `git init`, first commit
- [ ] Vercel project connected to repo, verify hello-world deploys
- [ ] `.env.local` with `PERPLEXITY_API_KEY` set locally
- [ ] Same key added as Vercel env var

### Pre-built Foundation (included in the scaffold)
- [x] `lib/types.ts` — All TS interfaces from data model
- [x] `lib/constants.ts` — Preset categories, scenario templates, defaults
- [x] `lib/utils.ts` — IDs, currency formatting, date helpers
- [x] `lib/projection-engine.ts` — Pure-function engine
- [x] `lib/scenario-engine.ts` — `applyScenarioOverrides`
- [x] `lib/storage.ts` — Debounced localStorage wrapper with versioning
- [x] `lib/url-sharing.ts` — Encode/decode model in hash fragment
- [x] `lib/demo-data.ts` — Nexus Labs preloaded model
- [x] `tests/projection-engine.test.ts` — 9 test fixtures, all passing
- [x] `scripts/verify-engine.py` — Reference Python verifier

**Day 1 work starts with the engine already validated against the 9 fixtures.**

---

## Phase 1: Core Dashboard Shell (Day 1)

**Goal**: Working dashboard layout with navigation, empty states, and the treasury input flow.

### Tasks
1. `AppShell` — Sidebar (320px fixed) + main content area
2. `Sidebar` — Collapsible sections: Treasury, Burn, Inflows, Scenarios
3. `Header` — Model name (editable), horizon dropdown (12/15/18), start date picker, Import/Export/Share buttons
4. `MobileInterstitial` — Viewport < 1024px → show "Please use desktop"
5. `TreasuryPanel`:
   - `StablecoinInput` — name + amount, add/remove
   - `FiatInput` — currency + amount
   - `VolatileAssetList` with `VolatileAssetInput` — name, ticker, tier, quantity, price, `LiquidityProfileEditor`
   - Drag-to-reorder for liquidation priority
6. `TreasurySummaryCard` — total at spot + total at haircut
7. Zustand store wired; inputs persist to localStorage (debounced)
8. `FooterBrand` — Accountant Quits logo + Perplexity logo + repo link

### Deliverable
Open the app, enter treasury holdings (including multiple volatile assets with liquidity profiles), reorder them, refresh the page, data persists.

---

## Phase 2: Burn & Inflow Modeling (Day 2)

**Goal**: Complete input side.

### Tasks
1. `BurnPanel` + `BurnCategoryRow` for all 8 presets + custom
2. `AdjustmentModal` — add/edit one-offs and baseline-changes
3. Growth rate toggle per category
4. Active/inactive toggle per category
5. `InflowPanel` + `InflowCategoryRow` — 5 presets + custom, same adjustment flow
6. `BurnSummaryCard` + `InflowSummaryCard` + net burn display
7. Wire everything to store

### Deliverable
Full input model working. All numbers entered, persisted, editable. You can read off monthly burn and inflows even before the chart renders.

---

## Phase 3: Projection Chart (Day 3 — THE KEY DAY)

**Goal**: The chart. This is the "wow" moment.

### Tasks
1. Wire `computeProjection(model)` via `useMemo` in the dashboard
2. `RunwaySummaryCards` — Hard + Extended dates, color-coded. Funding gap badge when applicable.
3. `FundingGapCallout` — prominent yellow banner: "⚠️ Funding gap: $X.XM. You'd need to raise or cut this amount to cover months where liquidations couldn't keep up with burn."
4. `ProjectionChart` (Recharts):
   - X-axis: calendar months
   - Y-axis: USD
   - Stacked areas: stables, fiat, per-asset haircut-adjusted value
   - Solid line: Hard Runway
   - Dashed line: Extended Runway
   - Hover tooltip with full month breakdown
5. `MonthlyBreakdownTable` — expandable; all fields from `MonthlyProjection`
6. `ProjectionControls` — toggle stacked areas on/off, show/hide individual assets

### Deliverable
**This alone is hackathon-worthy.** Enter your treasury, set burn/inflows, see your runway with two clear dates, a full composition chart, and funding gap callout when liquidity bites.

---

## Phase 4: Scenario Analysis (Day 4-5)

### Day 4: Infrastructure
1. `ScenarioPanel` in sidebar — list of scenarios + "New Scenario" button
2. `ScenarioEditor` (modal/slide-out):
   - Price override section (per asset or "all")
   - Liquidity override section
   - Priority reorder
   - Burn overrides (pick category, set type + value)
   - Inflow overrides
   - Headcount shortcut
   - One-off events (burn and inflow)
3. `applyScenarioOverrides` wired; scenario projections computed via `useMemo`
4. Scenario lines appear on `ProjectionChart` with distinct colors
5. Toggle active/inactive per scenario

### Day 5: Polish
6. `ScenarioTemplates` — 5 preset quick-picks (Bear Market, Token Crash, Aggressive Hiring, Emergency Cuts, Fundraising Win)
7. `ScenarioComparison` table — Baseline vs each scenario, runway dates, Δ from baseline, funding gaps
8. `ScenarioCard` — summary chip showing key changes

### Deliverable
Full scenario analysis: create custom, pick from templates, compare side-by-side.

---

## Phase 5: Perplexity + Agent + Polish + Demo (Day 6-7)

### Day 6: Perplexity integration
1. `/api/ai/market-banner` route → `MarketBanner` component (fixed top)
2. `/api/ai/parse-scenario` route → `AIScenarioBuilder` (text + voice input)
3. `/api/ai/parse-setup` route → `AISetupAssistant` (text + voice input)
4. `PoweredByBadge` component, placed on all AI-triggering buttons
5. Graceful degradation: if Perplexity fails, AI features are hidden (not broken)

### Day 6 (also): Agent-friendly architecture
6. `/schema/model` and `/schema/scenario` routes serving JSON Schemas
7. `/public/.well-known/agent-instructions.md`
8. `data-*` attributes on all interactive elements
9. `ImportDialog` / `ExportDialog` / `ShareURLButton`
10. Import via file upload, paste JSON, paste URL
11. Export as file download, copy-to-clipboard, generate shareable URL
12. Publish `skills/` folder: `create-runway-model`, `import-export-model`, `run-scenario`, `analyze-projection`

### Day 7: Demo prep
13. Load `demo-data.ts` (Nexus Labs) as default on first visit
14. Landing page (`app/page.tsx`) — simple hero, "Launch the tool" CTA
15. README with live demo link, screenshot, "Use with AI agents" section
16. Bug bash: test all flows end-to-end
17. Record 2-3 minute demo video

### Deliverable
Production-quality submission. Perplexity-branded. AI features working. Open-source with MIT license. Demo video recorded.

---

## Risk Register

| Risk | Mitigation |
|------|-----------|
| Engine math wrong | 9 test fixtures already pass. Any change runs tests in CI. |
| Chart visually overloaded with 5 scenarios | Scenario toggles; can hide stacked area when multiple scenarios active. |
| Perplexity rate limits at demo | Cache market banner aggressively (5-10 min). Graceful fallback if down. |
| Perplexity API key exposed | All calls via `/api/ai/*`; key never in client bundle. |
| Voice input flaky in non-Chrome browsers | Text input always visible as fallback. |
| localStorage fills up | Single model under 100KB. Plenty of room. |
| Import JSON malformed | Validate against JSON Schema on import; show clear error. |
| Mobile user tries tool | `MobileInterstitial` blocks with message. |
| AI returns malformed JSON | Use Perplexity structured output / JSON mode; validate + fall back to "couldn't parse, try rephrasing." |

---

## Demo Script (2-3 minute video)

1. **[0:00-0:15]** "I'm a Head of Finance at a crypto protocol. Every month I rebuild my runway in spreadsheets. Here's what I wish I had — powered by Perplexity."
2. **[0:15-0:40]** Open app → Nexus Labs demo model loads. Point out: $2M stables, 50M native tokens, 100 ETH, 2 BTC. Chart shows Hard Runway 8 months, Extended 16 months with small funding gap.
3. **[0:40-1:00]** "But our native token isn't actually that liquid. Let's see what happens in a bear market." Click Bear Market scenario template. Chart updates — token price cut in half, Extended runway collapses to 11 months with $1.2M funding gap.
4. **[1:00-1:30]** "What if we also need to cut headcount?" Use AI scenario builder (text input): "Cut 3 engineers starting month 2." Shows parsed preview → user confirms → scenario adds to chart with new date.
5. **[1:30-1:50]** Show the Perplexity banner refreshing with live prices. Click a headline. "News is fresh because Perplexity's Sonar pulls live."
6. **[1:50-2:15]** Export model as URL. Paste URL in new tab — model loads. "You can share this with your board, your agent, anywhere. No backend, no login. Your data is yours."
7. **[2:15-2:30]** Close: "CryptoRunway. Built at the Accountant Quits Web3 Hackathon. Powered by Perplexity. Open source, free forever."

---

## Definition of Done

All checkboxes from `01-PRODUCT-SPEC.md` MVP list, plus:

### Engineering
- [ ] All 9 engine test fixtures pass locally and in CI
- [ ] TypeScript strict mode, no `any` escape hatches in engine code
- [ ] No console errors on production build
- [ ] Lighthouse score ≥ 85 for performance, accessibility, best practices

### Product
- [ ] Nexus Labs loads on first visit
- [ ] Mobile interstitial works at < 1024px
- [ ] Dark-mode-safe (even if only light mode ships — nothing should break)
- [ ] All AI buttons branded "Powered by Perplexity"
- [ ] Footer: Accountant Quits + Perplexity + GitHub link

### Agent-Friendliness
- [ ] `/schema/model` returns valid JSON Schema
- [ ] `/schema/scenario` returns valid JSON Schema
- [ ] `/.well-known/agent-instructions.md` accessible
- [ ] `skills/` folder has 4 SKILL.md files
- [ ] Interactive elements have stable `data-action` attributes
- [ ] Shareable URL import round-trip works (export → paste URL → load)

### Delivery
- [ ] Deployed to Vercel at public URL
- [ ] GitHub repo public, MIT licensed, README complete
- [ ] 2-3 minute demo video recorded and uploaded
- [ ] Submission uploaded to hackathon platform
