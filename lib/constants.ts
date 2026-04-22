// Rough Runway Constants

import type {
  RoughRunwayModel,
  LiquidityProfile,
  ScenarioOverrides,
  VolatileAssetTier,
} from "./types";

export const STORAGE_VERSION = 1;
export const STORAGE_KEY = "roughrunway_data";

// ============================================================================
// Preset Burn Categories
// ============================================================================

export interface PresetBurnCategoryDef {
  presetKey: string;
  name: string;
  icon: string;
}

export const PRESET_BURN_CATEGORIES: PresetBurnCategoryDef[] = [
  { presetKey: "headcount", name: "Headcount & Payroll", icon: "Users" },
  { presetKey: "token_grants", name: "Employee Token Grants", icon: "Award" },
  { presetKey: "infrastructure", name: "Infrastructure & Tooling", icon: "Server" },
  { presetKey: "legal", name: "Legal & Compliance", icon: "Scale" },
  { presetKey: "marketing", name: "Marketing & Growth", icon: "Megaphone" },
  { presetKey: "token_incentives", name: "Token Incentives / Emissions", icon: "Coins" },
  { presetKey: "grants_out", name: "Grants & Ecosystem", icon: "Gift" },
  { presetKey: "office_admin", name: "Office & Admin", icon: "Building" },
];

// ============================================================================
// Preset Inflow Categories
// ============================================================================

export interface PresetInflowCategoryDef {
  presetKey: string;
  name: string;
  icon: string;
}

export const PRESET_INFLOW_CATEGORIES: PresetInflowCategoryDef[] = [
  { presetKey: "staking", name: "Staking Rewards", icon: "TrendingUp" },
  { presetKey: "grants_in", name: "Grant Income", icon: "Award" },
  { presetKey: "revenue", name: "Revenue / Fees", icon: "DollarSign" },
  { presetKey: "token_sales", name: "Planned Token Sales", icon: "ArrowRightLeft" },
  { presetKey: "other", name: "Other Income", icon: "Plus" },
];

// ============================================================================
// Default Liquidity Profiles by Tier
// ============================================================================

export function defaultLiquidityProfile(
  tier: VolatileAssetTier,
  quantity: number
): LiquidityProfile {
  switch (tier) {
    case "major":
      return {
        maxSellUnit: "tokens",
        maxSellPerMonth: quantity,
        haircutPercent: 2,
        priceAssumption: "constant",
      };
    case "alt":
      return {
        maxSellUnit: "tokens",
        maxSellPerMonth: Math.max(quantity * 0.1, 0),
        haircutPercent: 10,
        priceAssumption: "constant",
      };
    case "native":
      return {
        maxSellUnit: "percent_of_volume",
        maxSellPerMonth: 0,
        percentOfVolume: 0.02,
        dailyVolume: 0,
        haircutPercent: 15,
        priceAssumption: "constant",
      };
  }
}

export function defaultLiquidationPriority(tier: VolatileAssetTier): number {
  switch (tier) {
    case "major":
      return 10;
    case "alt":
      return 30;
    case "native":
      return 50;
  }
}

// ============================================================================
// Scenario Color Palette — Retro Swiss Aviation
// See docs/DESIGN-IMPLEMENTATION.md §6 (chart styling, scenario lines).
// ============================================================================

export const SCENARIO_COLORS = [
  "#D4A574", // knob-gold
  "#2E7D32", // aviation-green
  "#6FA3D4", // sky-blue
  "#C62828", // aviation-red
  "#6B6B6B", // ink-secondary
];

// ============================================================================
// Scenario Templates
// ============================================================================

export interface ScenarioTemplate {
  key: string;
  name: string;
  description: string;
  color: string;
  buildOverrides: (model: RoughRunwayModel) => ScenarioOverrides;
}

export const SCENARIO_TEMPLATES: ScenarioTemplate[] = [
  {
    key: "bear_market",
    name: "Bear Market",
    description: "Native -50%, ETH -30%, revenue -30%, native haircut +10",
    color: "#C62828", // aviation-red — bearish
    buildOverrides: (model) => {
      const native = model.treasury.volatileAssets.find((a) => a.tier === "native");
      const eth = model.treasury.volatileAssets.find(
        (a) => a.ticker.toLowerCase() === "ethereum" || a.name.toLowerCase() === "ethereum"
      );
      const revenueCat = model.inflowCategories.find((c) => c.presetKey === "revenue");

      const overrides: ScenarioOverrides = {};
      const priceOverrides: ScenarioOverrides["priceOverrides"] = [];
      if (native) priceOverrides.push({ assetId: native.id, type: "percent_change", value: -0.5 });
      if (eth) priceOverrides.push({ assetId: eth.id, type: "percent_change", value: -0.3 });
      if (priceOverrides.length > 0) overrides.priceOverrides = priceOverrides;

      if (revenueCat) {
        overrides.inflowOverrides = [
          { categoryId: revenueCat.id, type: "percent_change", value: -0.3 },
        ];
      }

      if (native) {
        overrides.liquidityOverrides = [
          { assetId: native.id, haircutPercent: Math.min(native.liquidity.haircutPercent + 10, 50) },
        ];
      }

      return overrides;
    },
  },
  {
    key: "aggressive_hiring",
    name: "Aggressive Hiring",
    description: "Add 5 people at $15K/mo avg starting month 2",
    color: "#2E7D32", // aviation-green — growth
    buildOverrides: () => ({
      headcountChange: { count: 5, costPerHead: 15000, startMonth: 2 },
    }),
  },
  {
    key: "emergency_cuts",
    name: "Emergency Cuts",
    description: "Cut non-headcount burn by 30%",
    color: "#D4A574", // knob-gold — caution
    buildOverrides: (model) => {
      const cutTargets = ["infrastructure", "legal", "marketing", "token_incentives", "grants_out", "office_admin"];
      const burnOverrides = model.burnCategories
        .filter((c) => c.presetKey && cutTargets.includes(c.presetKey))
        .map((c) => ({ categoryId: c.id, type: "percent_change" as const, value: -0.3 }));
      return { burnOverrides };
    },
  },
  {
    key: "token_crash",
    name: "Token Crash",
    description: "Native -80%, haircut +20, sell rate halved",
    color: "#6B6B6B", // ink-secondary — muted/somber
    buildOverrides: (model) => {
      const native = model.treasury.volatileAssets.find((a) => a.tier === "native");
      if (!native) return {};
      return {
        priceOverrides: [{ assetId: native.id, type: "percent_change", value: -0.8 }],
        liquidityOverrides: [
          {
            assetId: native.id,
            haircutPercent: Math.min(native.liquidity.haircutPercent + 20, 50),
            maxSellPerMonth: native.liquidity.maxSellPerMonth * 0.5,
            ...(native.liquidity.percentOfVolume !== undefined
              ? { percentOfVolume: native.liquidity.percentOfVolume * 0.5 }
              : {}),
          },
        ],
      };
    },
  },
];

export const COMMON_STABLECOINS = ["USDC", "USDT", "DAI", "USDe", "FRAX", "PYUSD", "TUSD"];
