# CryptoRunway — Data Model Specification

**Status**: v1.0 (final for hackathon MVP)

---

## Overview

This document defines the complete data model for CryptoRunway. All data lives client-side in localStorage as JSON. The model is designed to be serializable (export/import as JSON) and to support scenario branching without mutation of the baseline.

---

## Top-Level Model

```typescript
interface CryptoRunwayModel {
  id: string;                        // UUID for this model
  name: string;                      // User-given name, e.g., "Acme Labs Q2 2026"
  createdAt: string;                 // ISO 8601
  updatedAt: string;                 // ISO 8601
  projectionMonths: 12 | 15 | 18;    // Horizon
  startDate: string;                 // First month of projection, "YYYY-MM" e.g. "2026-05"
  baseCurrency: "USD" | "EUR" | "GBP"; // Display currency (USD for MVP)

  extendedRunwayEnabled: boolean;    // If false, Extended = Hard (volatile assets ignored in simulation)

  treasury: TreasurySnapshot;
  burnCategories: BurnCategory[];
  inflowCategories: InflowCategory[];
  scenarios: Scenario[];

  // Computed at render time, not stored:
  // projectionData: MonthlyProjection[];
  // summary: RunwaySummary;
}
```

---

## Treasury Snapshot

```typescript
interface TreasurySnapshot {
  stablecoins: StablecoinHolding[];
  fiat: FiatHolding[];
  volatileAssets: VolatileAsset[];   // Unified: native tokens + major crypto + alts
}

interface StablecoinHolding {
  id: string;
  name: string;              // "USDC", "USDT", "DAI", etc.
  amount: number;            // USD value (stables assumed 1:1)
}

interface FiatHolding {
  id: string;
  currency: "USD" | "EUR" | "GBP";
  amount: number;            // In that currency (displayed as USD for MVP)
}
```

### VolatileAsset — the critical type

```typescript
interface VolatileAsset {
  id: string;
  name: string;                  // "ETH", "BTC", "NEXUS"
  ticker: string;                // For CoinGecko/Perplexity lookup: "ethereum", "bitcoin", "nexus-protocol"
  tier: "major" | "alt" | "native"; // UI grouping; seeds default liquidity profile
  quantity: number;              // Tokens held
  currentPrice: number;          // USD price
  priceSource: "manual" | "api";

  // Liquidity profile — per-asset, never global
  liquidity: AssetLiquidityProfile;

  // Liquidation priority — lower number = sold first when burn exceeds hard assets
  // Fully user-configurable via drag-to-reorder. Defaults shown below are suggestions.
  liquidationPriority: number;

  // Vesting (optional) — unlock events add quantity mid-projection
  vestingSchedule?: VestingEvent[];
}

interface AssetLiquidityProfile {
  // How much we can sell per month
  maxSellUnit: "tokens" | "percent_of_volume";
  maxSellPerMonth?: number;      // If maxSellUnit === "tokens" (token count)
  percentOfVolume?: number;      // If maxSellUnit === "percent_of_volume", e.g., 0.02 = 2%
  dailyVolume?: number;          // Required if using percent_of_volume (USD)

  // Expected slippage / market impact on sale (0-100)
  haircutPercent: number;

  // Price trajectory for this asset during the projection
  priceAssumption: "constant" | "monthly_decline" | "custom_schedule";
  monthlyDeclineRate?: number;   // e.g., 0.05 = 5%/mo compound
  customPriceSchedule?: { month: number; price: number }[]; // Month-specific overrides
}

interface VestingEvent {
  id: string;
  month: number;                 // Month offset from startDate (1-indexed)
  quantity: number;              // Tokens unlocking
  description: string;           // e.g., "Team cliff vesting"
}
```

### Default Liquidity Profiles by Tier

These are seeded when a user adds a new volatile asset. Fully overridable.

| Tier   | Haircut | maxSell default                        | Priority default |
|--------|---------|----------------------------------------|------------------|
| major  | 2%      | `tokens` / full quantity               | 10               |
| alt    | 10%     | `tokens` / 10% of holdings per month   | 30               |
| native | 15%     | `percent_of_volume` / 2% of daily vol  | 50               |

---

## Burn Categories (Outflows)

```typescript
interface BurnCategory {
  id: string;
  name: string;
  type: "preset" | "custom";
  presetKey?: BurnPresetKey;         // For presets
  monthlyBaseline: number;           // USD per month
  growthRate: number;                // Monthly compound, 0 = flat
  adjustments: MonthlyAdjustment[];
  isActive: boolean;                 // Toggle without deleting

  // RESERVED FOR v2 (D5): which treasury bucket this draws from
  // v1 engine ignores this field
  currency?: "fiat" | "stablecoin" | "native_token";
}

type BurnPresetKey =
  | "headcount"
  | "token_grants"       // NEW — employee token grants (v1)
  | "infrastructure"
  | "legal"
  | "marketing"
  | "token_incentives"
  | "grants_out"
  | "office_admin";

interface MonthlyAdjustment {
  id: string;
  month: number;                     // 1-indexed offset from startDate
  type: "one_off" | "baseline_change";
  amount: number;
  // For "one_off": additional amount (positive = extra burn, negative = credit)
  // For "baseline_change": new recurring baseline from this month onward
  description: string;
}
```

### Preset Burn Categories (seeded for new models)

```typescript
export const PRESET_BURN_CATEGORIES: {
  presetKey: BurnPresetKey;
  name: string;
  icon: string;
}[] = [
  { presetKey: "headcount",        name: "Headcount & Payroll",            icon: "Users" },
  { presetKey: "token_grants",     name: "Employee Token Grants",          icon: "Coins" },
  { presetKey: "infrastructure",   name: "Infrastructure & Tooling",       icon: "Server" },
  { presetKey: "legal",            name: "Legal & Compliance",             icon: "Scale" },
  { presetKey: "marketing",        name: "Marketing & Growth",             icon: "Megaphone" },
  { presetKey: "token_incentives", name: "Token Incentives / Emissions",   icon: "Zap" },
  { presetKey: "grants_out",       name: "Grants & Ecosystem",             icon: "Gift" },
  { presetKey: "office_admin",     name: "Office & Admin",                 icon: "Building" },
];
```

---

## Inflow Categories

```typescript
interface InflowCategory {
  id: string;
  name: string;
  type: "preset" | "custom";
  presetKey?: InflowPresetKey;
  monthlyBaseline: number;
  growthRate: number;
  adjustments: MonthlyAdjustment[];  // Same shape as burn
  isActive: boolean;
}

type InflowPresetKey =
  | "staking"
  | "grants_in"
  | "revenue"
  | "token_sales"
  | "other";
```

### Preset Inflow Categories

```typescript
export const PRESET_INFLOW_CATEGORIES: {
  presetKey: InflowPresetKey;
  name: string;
  icon: string;
}[] = [
  { presetKey: "staking",     name: "Staking Rewards",     icon: "TrendingUp" },
  { presetKey: "grants_in",   name: "Grant Income",        icon: "Award" },
  { presetKey: "revenue",     name: "Revenue / Fees",      icon: "DollarSign" },
  { presetKey: "token_sales", name: "Planned Token Sales", icon: "ArrowRightLeft" },
  { presetKey: "other",       name: "Other Income",        icon: "Plus" },
];
```

---

## Scenario Model

```typescript
interface Scenario {
  id: string;
  name: string;                      // User-given, e.g., "Bear Case"
  color: string;                     // Hex color for chart line
  createdAt: string;
  isActive: boolean;                 // Show/hide on chart
  templateKey?: ScenarioTemplateKey; // If created from a preset template

  overrides: ScenarioOverrides;
}

type ScenarioTemplateKey =
  | "bear_market"
  | "token_crash"
  | "aggressive_hiring"
  | "emergency_cuts"
  | "fundraising_win";

interface ScenarioOverrides {
  // Price overrides — per asset, or "all" for every volatile asset
  priceOverrides?: PriceOverride[];

  // Liquidity / haircut overrides — per asset
  liquidityOverrides?: LiquidityOverride[];

  // Liquidation priority reordering
  priorityOverrides?: { assetId: string; newPriority: number }[];

  // Burn category overrides
  burnOverrides?: BurnOverride[];

  // Inflow category overrides
  inflowOverrides?: InflowOverride[];

  // One-off events unique to this scenario
  additionalBurnEvents?: OneOffEvent[];
  additionalInflowEvents?: OneOffEvent[];

  // Headcount convenience shortcut (maps to burn override internally)
  headcountChange?: HeadcountChange;
}

interface PriceOverride {
  assetId: string | "all";           // "all" = apply to every volatile asset
  type: "absolute" | "percent_change";
  value: number;                     // USD price, or % change (-0.5 = -50%)
}

interface LiquidityOverride {
  assetId: string | "all";
  haircutPercent?: number;           // Absolute % (e.g., 20 = 20%)
  haircutPercentChange?: number;     // Additive change in percentage points (e.g., +10)
  maxSellPerMonth?: number;          // Absolute override (in tokens)
  maxSellMultiplier?: number;        // Multiplier (e.g., 0.5 = halve the cap)
}

interface BurnOverride {
  categoryId: string;                // id OR presetKey matches
  type: "percent_change" | "absolute" | "disable";
  value?: number;                    // % change or new absolute baseline
  startMonth?: number;               // When override kicks in (default 1)
}

interface InflowOverride {
  categoryId: string;
  type: "percent_change" | "absolute" | "disable";
  value?: number;
  startMonth?: number;
}

interface OneOffEvent {
  month: number;
  amount: number;
  description: string;
}

interface HeadcountChange {
  count: number;                     // +3 or -2
  costPerHead: number;               // Monthly cost per person (USD)
  startMonth: number;                // When change takes effect
}
```

### Preset Scenario Templates

```typescript
export const SCENARIO_TEMPLATES: {
  key: ScenarioTemplateKey;
  name: string;
  description: string;
  overrides: ScenarioOverrides;
}[] = [
  {
    key: "bear_market",
    name: "Bear Market",
    description: "All volatile prices -50%, revenue -30%, haircuts +10pp",
    overrides: {
      priceOverrides: [{ assetId: "all", type: "percent_change", value: -0.5 }],
      liquidityOverrides: [{ assetId: "all", haircutPercentChange: 10 }],
      inflowOverrides: [{ categoryId: "revenue", type: "percent_change", value: -0.3 }],
    },
  },
  {
    key: "token_crash",
    name: "Token Crash",
    description: "Native token -80%, haircut +20pp, max-sell halved",
    overrides: {
      priceOverrides: [{ assetId: "native", type: "percent_change", value: -0.8 }],
      liquidityOverrides: [
        { assetId: "native", haircutPercentChange: 20, maxSellMultiplier: 0.5 },
      ],
    },
  },
  {
    key: "aggressive_hiring",
    name: "Aggressive Hiring",
    description: "+5 headcount at $15K/mo average",
    overrides: {
      headcountChange: { count: 5, costPerHead: 15000, startMonth: 2 },
    },
  },
  {
    key: "emergency_cuts",
    name: "Emergency Cuts",
    description: "Cut all non-headcount burn by 30%",
    overrides: {
      burnOverrides: [
        { categoryId: "infrastructure",  type: "percent_change", value: -0.3 },
        { categoryId: "legal",           type: "percent_change", value: -0.3 },
        { categoryId: "marketing",       type: "percent_change", value: -0.3 },
        { categoryId: "token_incentives",type: "percent_change", value: -0.3 },
        { categoryId: "grants_out",      type: "percent_change", value: -0.3 },
        { categoryId: "office_admin",    type: "percent_change", value: -0.3 },
      ],
    },
  },
  {
    key: "fundraising_win",
    name: "Fundraising Win",
    description: "+$2M stables in month 3 (raise closes)",
    overrides: {
      additionalInflowEvents: [
        { month: 3, amount: 2_000_000, description: "Series A close" },
      ],
    },
  },
];
```

---

## Projection Engine Output

```typescript
interface MonthlyProjection {
  month: number;                     // 1-indexed
  label: string;                     // "May 2026"
  date: string;                      // "2026-05"

  // End-of-month balances
  stablecoinBalance: number;
  fiatBalance: number;
  hardBalance: number;               // stables + fiat (Hard Runway line value)

  // Per-asset state at end of month
  volatileAssetStates: VolatileAssetMonthState[];
  totalVolatileValue: number;        // Sum of (quantity × haircut-adjusted price)

  // Flows during the month
  totalBurn: number;
  totalInflows: number;
  netBurn: number;                   // burn - inflows

  // Liquidation activity this month
  liquidationDetails: LiquidationDetail[];
  totalLiquidationProceeds: number;

  // Funding gap tracking
  unmetDeficitThisMonth: number;     // $ we couldn't cover (liquidity ran out)
  cumulativeFundingGap: number;      // Sum of all unmet deficits to date

  // Extended balance with funding gap subtracted
  extendedBalance: number;

  // Flags for UI
  hardRunwayDepleted: boolean;
  extendedRunwayDepleted: boolean;
  liquidityConstrained: boolean;     // True if unmetDeficitThisMonth > 0
}

interface VolatileAssetMonthState {
  assetId: string;
  assetName: string;                 // For UI convenience
  quantity: number;                  // Remaining after this month's sales
  priceThisMonth: number;            // Applying decline/schedule
  effectivePrice: number;            // priceThisMonth × (1 - haircut)
  valueAtHaircut: number;            // quantity × effectivePrice
}

interface LiquidationDetail {
  assetId: string;
  assetName: string;
  tokensSold: number;
  proceeds: number;                  // USD
  priceUsed: number;                 // effectivePrice that month
}

interface RunwaySummary {
  // null = never depleted within horizon
  hardRunwayMonths: number | null;
  hardRunwayDate: string | null;     // "2027-03" or null
  extendedRunwayMonths: number | null;
  extendedRunwayDate: string | null;

  // For orgs that survive the horizon:
  survivedHorizon: boolean;
  totalFundingGap: number;           // Cumulative gap at end of horizon
  monthsLiquidityConstrained: number;

  // Current state
  monthlyNetBurnAverage: number;     // Avg across projection (clamped to pre-depletion for hard)
  currentTreasuryUSD: number;        // Total at spot
  realisticTreasuryUSD: number;      // Total at haircut prices (stables + fiat + sum of haircut-adjusted volatile)
}
```

---

## localStorage Schema

```typescript
// Key: "cryptorunway_data"
interface StoredData {
  version: number;                   // Schema version for migrations
  activeModelId: string;
  models: CryptoRunwayModel[];
}
```

### Migration Strategy
- `version` starts at 1
- On load, if stored `version < CURRENT_VERSION`, run migration chain
- Always bump `CURRENT_VERSION` when changing schema

---

## Export / Import Format

```typescript
interface ExportedModel {
  format: "cryptorunway";
  version: number;
  exportedAt: string;                // ISO 8601
  model: CryptoRunwayModel;
}
```

The same shape is used for:
- JSON file download (`.json`)
- Clipboard paste
- Shareable URL (base64-encoded in URL hash fragment)

---

## JSON Schemas (published for agents)

These are served at `/schema/model.json` and `/schema/scenario.json`. See `07-AGENT-ARCHITECTURE.md` for usage details. The generated schemas match the TypeScript interfaces in this document.
