# CryptoRunway — Architecture & Component Specification

**Status**: v1.0 (final for hackathon MVP)

---

## Tech Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| **Framework** | Next.js 14+ (App Router) | Fast setup, Vercel deploy, SSR for landing, API routes for AI proxy |
| **Language** | TypeScript (strict) | Types are the spec |
| **Styling** | Tailwind CSS v3 | Rapid iteration, design tokens as utilities |
| **Charts** | Recharts | React-native, composable, handles composed/overlaid charts |
| **State** | Zustand + persist middleware (debounced) | Lightweight, single-store pattern |
| **Persistence** | localStorage (MVP) | No backend, instant save/load |
| **AI** | Perplexity API (Sonar family) | Sponsor requirement — see `06-PERPLEXITY-INTEGRATION.md` |
| **Testing** | Vitest | Fast, TS-native |
| **Icons** | Lucide React | Clean, consistent |
| **Hosting** | Vercel | Free tier, GitHub auto-deploy |
| **Voice** | Web Speech API | Free, no deps, Chrome-first |

Key non-dependency: **no backend database.** API routes are stateless proxies to Perplexity.

---

## Project Structure

```
cryptorunway/
├── app/
│   ├── layout.tsx                    # Root layout, fonts, metadata
│   ├── page.tsx                      # Landing / marketing page
│   ├── dashboard/
│   │   └── page.tsx                  # Main app
│   ├── api/
│   │   └── ai/
│   │       ├── parse-scenario/       # POST: NL → ScenarioOverrides
│   │       │   └── route.ts
│   │       ├── parse-setup/          # POST: NL → CryptoRunwayModel
│   │       │   └── route.ts
│   │       └── market-banner/        # GET: live market data + news
│   │           └── route.ts
│   └── schema/                       # Published JSON Schemas (static)
│       ├── model/route.ts            # GET: returns model.schema.json
│       └── scenario/route.ts         # GET: returns scenario.schema.json
├── components/
│   ├── layout/
│   │   ├── AppShell.tsx              # Sidebar + main content
│   │   ├── Sidebar.tsx               # Collapsible sections
│   │   ├── Header.tsx                # Model name, horizon, branding
│   │   ├── MobileInterstitial.tsx    # Desktop-only notice
│   │   └── FooterBrand.tsx           # Accountant Quits + Perplexity + repo link
│   ├── treasury/
│   │   ├── TreasuryPanel.tsx
│   │   ├── StablecoinInput.tsx
│   │   ├── FiatInput.tsx
│   │   ├── VolatileAssetInput.tsx    # Single asset with liquidity profile
│   │   ├── VolatileAssetList.tsx     # Drag-to-reorder list
│   │   ├── LiquidityProfileEditor.tsx
│   │   └── TreasurySummaryCard.tsx
│   ├── burn/
│   │   ├── BurnPanel.tsx
│   │   ├── BurnCategoryRow.tsx
│   │   ├── AdjustmentModal.tsx       # One-off / baseline-change editor
│   │   └── BurnSummaryCard.tsx
│   ├── inflows/
│   │   ├── InflowPanel.tsx
│   │   ├── InflowCategoryRow.tsx
│   │   └── InflowSummaryCard.tsx
│   ├── projection/
│   │   ├── ProjectionChart.tsx       # The main chart
│   │   ├── RunwaySummaryCards.tsx
│   │   ├── FundingGapCallout.tsx     # Shows cumulative gap warning
│   │   ├── MonthlyBreakdownTable.tsx
│   │   └── ProjectionControls.tsx
│   ├── scenarios/
│   │   ├── ScenarioPanel.tsx
│   │   ├── ScenarioCard.tsx
│   │   ├── ScenarioEditor.tsx
│   │   ├── ScenarioComparison.tsx
│   │   └── ScenarioTemplates.tsx
│   ├── ai/
│   │   ├── AIScenarioBuilder.tsx     # NL → scenario
│   │   ├── AISetupAssistant.tsx      # NL → full model
│   │   └── VoiceInput.tsx            # Web Speech API wrapper
│   ├── perplexity/
│   │   ├── MarketBanner.tsx          # Fixed banner, live data
│   │   └── PoweredByBadge.tsx        # Branding chip
│   └── shared/
│       ├── CurrencyInput.tsx
│       ├── PercentInput.tsx
│       ├── NumberInput.tsx
│       ├── TokenSearchInput.tsx
│       ├── MonthSelector.tsx
│       ├── InfoTooltip.tsx
│       ├── EmptyState.tsx
│       ├── ImportDialog.tsx
│       ├── ExportDialog.tsx
│       └── ShareURLButton.tsx
├── lib/
│   ├── types.ts                      # All interfaces from data-model doc
│   ├── constants.ts                  # Presets, templates, defaults
│   ├── store.ts                      # Zustand store
│   ├── projection-engine.ts          # PURE functions, the core
│   ├── scenario-engine.ts            # applyScenarioOverrides
│   ├── storage.ts                    # localStorage + versioning
│   ├── url-sharing.ts                # Encode/decode model in hash fragment
│   ├── perplexity-client.ts          # Typed Perplexity client (server-side only)
│   ├── ai-prompts.ts                 # System prompts for parsers
│   ├── json-schemas.ts               # Generated JSON Schemas for /schema routes
│   ├── utils.ts                      # IDs, formatting, date math
│   └── demo-data.ts                  # Nexus Labs preloaded model
├── public/
│   ├── .well-known/
│   │   ├── ai-plugin.json
│   │   └── agent-instructions.md
│   └── [brand assets, logos]
├── skills/
│   ├── create-runway-model/SKILL.md
│   ├── import-export-model/SKILL.md
│   ├── run-scenario/SKILL.md
│   └── analyze-projection/SKILL.md
├── tests/
│   ├── projection-engine.test.ts     # 9 fixture cases
│   ├── scenario-engine.test.ts
│   └── fixtures/                     # Canonical input/output pairs
├── docs/                             # The 7 markdown docs
├── .env.local.example                # PERPLEXITY_API_KEY=
├── tailwind.config.ts
├── next.config.js
├── tsconfig.json
├── package.json
├── vitest.config.ts
├── README.md
└── LICENSE                           # MIT
```

---

## Core Architecture Principles

### 1. Separation: Data / Calculation / Presentation

```
┌──────────────────────┐
│   Zustand Store      │  ← Single source of truth (CryptoRunwayModel)
│   (lib/store.ts)     │
└──────────┬───────────┘
           │ model state (immutable reads)
           ▼
┌──────────────────────┐
│  Projection Engine   │  ← Pure functions: model in, projections out
│  (lib/projection-    │     NO side effects, fully testable
│   engine.ts)         │
└──────────┬───────────┘
           │ { projections, summary }
           ▼
┌──────────────────────┐
│  React Components    │  ← Render projections, dispatch actions
└──────────────────────┘
```

The engine never touches React, Zustand, or localStorage. Any harness (CLI, tests, agent) can call it.

### 2. Immutable Baseline, Override-Based Scenarios

```typescript
function computeScenarioProjection(baseline: CryptoRunwayModel, scenario: Scenario) {
  const modifiedModel = applyScenarioOverrides(baseline, scenario.overrides);
  return computeProjection(modifiedModel);
}
```

`applyScenarioOverrides` uses `structuredClone` — never mutates the baseline.

### 3. Reactive Recomputation with Memoization

```typescript
// Baseline projection
const baselineResult = useMemo(
  () => computeProjection(model),
  [model]  // Zustand immutable updates produce new model ref on any change
);

// Scenario projections — keyed by scenario ID
const scenarioResults = useMemo(
  () => model.scenarios.reduce((acc, s) => {
    acc[s.id] = computeScenarioProjection(model, s);
    return acc;
  }, {} as Record<string, ReturnType<typeof computeProjection>>),
  [model]
);
```

For MVP, re-running all scenario projections on any baseline change is acceptable (<5ms total for 18 months × 5 scenarios). Can be optimized per-scenario later if needed.

### 4. Debounced Persistence

Zustand's `persist` middleware is configured with a debounce so typing into currency inputs doesn't hammer localStorage:

```typescript
persist(storeDefinition, {
  name: 'cryptorunway_data',
  version: 1,
  storage: createJSONStorage(() => localStorage),
  // Debounced write: only serialize 500ms after last change
  partialize: (state) => ({ model: state.model, activeModelId: state.activeModelId }),
});
```

Implementation detail: wrap `setItem` in a debounced function — see `lib/storage.ts`.

---

## Page Layout (Dashboard)

```
┌──────────────────────────────────────────────────────────────┐
│  [Perplexity market banner — fixed top]                       │
├──────────────────────────────────────────────────────────────┤
│  Header: Model Name | Horizon | Import | Export | Share | AI │
├────────────┬─────────────────────────────────────────────────┤
│            │                                                 │
│  Sidebar   │  Main Content                                   │
│            │                                                 │
│  Treasury  │  ┌─────────────────────────────────────────┐    │
│  ────────  │  │  Runway Summary Cards                   │    │
│  Stables   │  │  Hard: 14mo (Jul 2027)                  │    │
│  Fiat      │  │  Extended: 19mo (Dec 2027)              │    │
│  Volatile  │  │  ⚠️ Funding gap: $1.7M                  │    │
│   Assets   │  └─────────────────────────────────────────┘    │
│  (drag to  │                                                 │
│   reorder) │  ┌─────────────────────────────────────────┐    │
│            │  │                                         │    │
│  Burn      │  │  PROJECTION CHART                       │    │
│  ────────  │  │  (stacked area + 2 lines + scenarios)   │    │
│  Headcount │  │                                         │    │
│  ...       │  │                                         │    │
│  + Custom  │  └─────────────────────────────────────────┘    │
│            │                                                 │
│  Inflows   │  ┌─────────────────────────────────────────┐    │
│  ────────  │  │  Monthly Breakdown Table (expandable)   │    │
│  ...       │  └─────────────────────────────────────────┘    │
│            │                                                 │
│  Scenarios │  ┌─────────────────────────────────────────┐    │
│  ────────  │  │  Scenario Comparison Table              │    │
│  + New     │  └─────────────────────────────────────────┘    │
│  [AI ✨]   │                                                 │
├────────────┴─────────────────────────────────────────────────┤
│  [Footer: Accountant Quits · Perplexity · GitHub · Schema]    │
└──────────────────────────────────────────────────────────────┘
```

### Layout Behavior
- **Market banner**: Fixed top, ~48px tall, dismissible
- **Sidebar**: 320px wide, scrollable, collapsible sections
- **Main content**: Fills remaining width, scrollable
- **Responsive**: Below ~1024px → `MobileInterstitial`

---

## State Management (Zustand Store)

```typescript
interface CryptoRunwayStore {
  // State
  model: CryptoRunwayModel;
  ui: {
    activeView: "treasury" | "burn" | "inflows" | "scenarios";
    importDialogOpen: boolean;
    exportDialogOpen: boolean;
    aiBuilderOpen: boolean;
  };

  // Treasury
  addStablecoin: (holding: Omit<StablecoinHolding, "id">) => void;
  updateStablecoin: (id: string, updates: Partial<StablecoinHolding>) => void;
  removeStablecoin: (id: string) => void;

  addFiat: (holding: Omit<FiatHolding, "id">) => void;
  updateFiat: (id: string, updates: Partial<FiatHolding>) => void;
  removeFiat: (id: string) => void;

  addVolatileAsset: (asset: Omit<VolatileAsset, "id">) => void;
  updateVolatileAsset: (id: string, updates: Partial<VolatileAsset>) => void;
  removeVolatileAsset: (id: string) => void;
  reorderVolatileAssets: (orderedIds: string[]) => void;  // Drag-to-reorder

  // Burn
  addBurnCategory: (cat: Omit<BurnCategory, "id">) => void;
  updateBurnCategory: (id: string, updates: Partial<BurnCategory>) => void;
  removeBurnCategory: (id: string) => void;
  addBurnAdjustment: (catId: string, adj: Omit<MonthlyAdjustment, "id">) => void;
  removeBurnAdjustment: (catId: string, adjId: string) => void;

  // Inflows (same pattern as burn)
  addInflowCategory: (cat: Omit<InflowCategory, "id">) => void;
  updateInflowCategory: (id: string, updates: Partial<InflowCategory>) => void;
  removeInflowCategory: (id: string) => void;
  addInflowAdjustment: (catId: string, adj: Omit<MonthlyAdjustment, "id">) => void;
  removeInflowAdjustment: (catId: string, adjId: string) => void;

  // Scenarios
  addScenario: (scenario: Omit<Scenario, "id">) => void;
  updateScenario: (id: string, updates: Partial<Scenario>) => void;
  removeScenario: (id: string) => void;
  addScenarioFromTemplate: (templateKey: ScenarioTemplateKey) => void;
  toggleScenarioActive: (id: string) => void;

  // Model meta
  updateModelMeta: (updates: Partial<Pick<CryptoRunwayModel, "name" | "projectionMonths" | "startDate">>) => void;
  resetModel: () => void;
  loadDemoModel: () => void;
  importModel: (model: CryptoRunwayModel) => void;

  // UI
  setActiveView: (view: CryptoRunwayStore["ui"]["activeView"]) => void;
  setImportDialogOpen: (open: boolean) => void;
  setExportDialogOpen: (open: boolean) => void;
  setAiBuilderOpen: (open: boolean) => void;
}
```

---

## AI API Routes (Server-Side Proxies)

All AI requests go through Next.js API routes. The Perplexity API key lives only in `PERPLEXITY_API_KEY` env var. No keys in client bundles.

```
POST /api/ai/parse-scenario
Body: { prompt: string, model: CryptoRunwayModel }
Response: { overrides: ScenarioOverrides }

POST /api/ai/parse-setup
Body: { prompt: string }
Response: { model: Partial<CryptoRunwayModel> }

GET /api/ai/market-banner?tokens=BTC,ETH,SOL,NEXUS
Response: {
  prices: { ticker: string; price: number; change24h: number }[],
  headlines: { title: string; url: string; source: string; publishedAt: string }[],
  fetchedAt: string,
}
```

Full prompts and response shapes in `06-PERPLEXITY-INTEGRATION.md`.

---

## Agent-Friendly Routes

See `07-AGENT-ARCHITECTURE.md` for full spec. Routes:

```
GET /schema/model       → model.schema.json (JSON Schema)
GET /schema/scenario    → scenario.schema.json
GET /.well-known/ai-plugin.json
GET /.well-known/agent-instructions.md
```

---

## Design System Tokens

### Colors
```css
--color-primary: #0F172A;
--color-accent: #3B82F6;
--color-success: #10B981;
--color-warning: #F59E0B;
--color-danger: #EF4444;
--color-neutral-50: #F8FAFC;
--color-neutral-100: #F1F5F9;
--color-neutral-200: #E2E8F0;
--color-neutral-400: #94A3B8;
--color-neutral-600: #475569;
--color-neutral-900: #0F172A;

/* Chart */
--color-hard-runway: #3B82F6;
--color-extended-runway: #8B5CF6;
--color-stables-area: #10B981;
--color-fiat-area: #6366F1;
--color-volatile-major: #F59E0B;
--color-volatile-native: #EC4899;
--color-volatile-alt: #06B6D4;

/* Scenarios (up to 5) */
--color-scenario-1: #EC4899;
--color-scenario-2: #14B8A6;
--color-scenario-3: #F97316;
--color-scenario-4: #8B5CF6;
--color-scenario-5: #06B6D4;

/* Perplexity brand */
--color-perplexity: #20808D;
```

### Typography
- Headings: 600-700 weight, tight tracking
- Body: 400 weight, 1.5 line height
- Numbers: tabular-nums for alignment
- Mono: for tickers and schema snippets

### Spacing
- Sidebar: 320px
- Card padding: 16-24px
- Section spacing: 24-32px
- Input row: 40px tall
