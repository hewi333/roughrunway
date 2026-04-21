// CryptoRunway Type Definitions
// Source of truth: docs/02-DATA-MODEL.md

// ============================================================================
// Top-Level Model
// ============================================================================

export interface CryptoRunwayModel {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  projectionMonths: 12 | 15 | 18;
  startDate: string;       // "YYYY-MM"
  baseCurrency: "USD";

  treasury: TreasurySnapshot;
  burnCategories: BurnCategory[];
  inflowCategories: InflowCategory[];
  scenarios: Scenario[];

  extendedRunwayEnabled: boolean;
}

// ============================================================================
// Treasury
// ============================================================================

export interface TreasurySnapshot {
  stablecoins: StablecoinHolding[];
  fiat: FiatHolding[];
  volatileAssets: VolatileAsset[];
}

export interface StablecoinHolding {
  id: string;
  name: string;
  amount: number;
}

export interface FiatHolding {
  id: string;
  currency: "USD" | "EUR" | "GBP";
  amount: number;
}

export type VolatileAssetTier = "major" | "alt" | "native";

export interface VolatileAsset {
  id: string;
  name: string;
  ticker: string;
  tier: VolatileAssetTier;
  quantity: number;
  currentPrice: number;
  priceSource: "manual" | "api";
  liquidity: LiquidityProfile;
  liquidationPriority: number;
  vestingSchedule?: VestingEvent[];
}

export type PriceAssumption = "constant" | "monthly_decline" | "custom_schedule";
export type MaxSellUnit = "tokens" | "percent_of_volume";

export interface LiquidityProfile {
  maxSellUnit: MaxSellUnit;
  maxSellPerMonth: number;
  percentOfVolume?: number;
  dailyVolume?: number;
  haircutPercent: number;
  priceAssumption: PriceAssumption;
  monthlyDeclineRate?: number;
  customPriceSchedule?: { month: number; price: number }[];
}

export interface VestingEvent {
  id: string;
  month: number;
  quantity: number;
  description: string;
}

// ============================================================================
// Burn & Inflow Categories
// ============================================================================

export type BurnCurrency = "fiat" | "stablecoin" | "native_token";

export interface BurnCategory {
  id: string;
  name: string;
  type: "preset" | "custom";
  presetKey?: string;
  monthlyBaseline: number;
  currency: BurnCurrency;
  growthRate: number;
  adjustments: MonthlyAdjustment[];
  isActive: boolean;
}

export interface InflowCategory {
  id: string;
  name: string;
  type: "preset" | "custom";
  presetKey?: string;
  monthlyBaseline: number;
  growthRate: number;
  adjustments: MonthlyAdjustment[];
  isActive: boolean;
}

export interface MonthlyAdjustment {
  id: string;
  month: number;
  type: "one_off" | "baseline_change";
  amount: number;
  description: string;
}

// ============================================================================
// Scenarios
// ============================================================================

export interface Scenario {
  id: string;
  name: string;
  color: string;
  createdAt: string;
  isActive: boolean;
  templateKey?: string;
  overrides: ScenarioOverrides;
}

export interface ScenarioOverrides {
  priceOverrides?: PriceOverride[];
  burnOverrides?: BurnOverride[];
  inflowOverrides?: InflowOverride[];
  liquidityOverrides?: LiquidityOverride[];
  additionalBurnEvents?: OneOffEvent[];
  additionalInflowEvents?: OneOffEvent[];
  headcountChange?: HeadcountChange;
}

export interface PriceOverride {
  assetId: string | "all_volatile";
  type: "absolute" | "percent_change";
  value: number;
}

export interface BurnOverride {
  categoryId: string;
  type: "percent_change" | "absolute" | "disable";
  value?: number;
  startMonth?: number;
}

export interface InflowOverride {
  categoryId: string;
  type: "percent_change" | "absolute" | "disable";
  value?: number;
  startMonth?: number;
}

export interface LiquidityOverride {
  assetId: string;
  haircutPercent?: number;
  maxSellPerMonth?: number;
  percentOfVolume?: number;
}

export interface OneOffEvent {
  month: number;
  amount: number;
  description: string;
}

export interface HeadcountChange {
  count: number;
  costPerHead: number;
  startMonth: number;
}

// ============================================================================
// Projection Output
// ============================================================================

export interface MonthlyProjection {
  month: number;
  label: string;
  date: string;

  stablecoinBalance: number;
  fiatBalance: number;
  volatileAssets: {
    assetId: string;
    quantity: number;
    pricePerToken: number;
    valueAtHaircut: number;
  }[];

  totalBurn: number;
  totalInflows: number;
  netBurn: number;
  liquidationDetails: {
    assetId: string;
    tokensSold: number;
    proceeds: number;
  }[];
  totalLiquidationProceeds: number;

  unmetDeficitThisMonth: number;
  cumulativeUnmetDeficit: number;

  hardBalance: number;
  extendedBalance: number;

  hardRunwayDepleted: boolean;
  extendedRunwayDepleted: boolean;
  liquidityConstrained: boolean;
}

export interface RunwaySummary {
  hardRunwayMonths: number | null;
  hardRunwayDate: string;
  extendedRunwayMonths: number | null;
  extendedRunwayDate: string;
  averageMonthlyNetBurn: number;
  currentTotalUSD: number;
  currentTotalAtHaircut: number;
  fundingGapUSD: number;
  liquidityConstrainedMonths: number;
}

// ============================================================================
// Storage
// ============================================================================

export interface StoredData {
  version: number;
  activeModelId: string;
  models: CryptoRunwayModel[];
}

export interface ExportedModel {
  format: "cryptorunway";
  version: number;
  exportedAt: string;
  model: CryptoRunwayModel;
}
