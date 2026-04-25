// Projection engine test fixtures
// Source of truth: docs/05-PROJECTION-ENGINE.md §"Worked Examples"
// These are hand-verified via the reference Python simulator (scripts/verify-engine.py).
// If any of these fail, the engine's math is broken — do not proceed to UI work.

import { describe, it, expect } from "vitest";
import { computeProjection, computeAssetPrice } from "../lib/projection-engine";
import { applyScenarioOverrides } from "../lib/scenario-engine";
import type {
  BurnCategory,
  RoughRunwayModel,
  InflowCategory,
  VolatileAsset,
} from "../lib/types";

// ----------------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------------

function makeBurnCategory(
  id: string,
  monthlyBaseline: number,
  overrides: Partial<BurnCategory> = {}
): BurnCategory {
  return {
    id,
    name: id,
    type: "custom",
    monthlyBaseline,
    currency: "stablecoin",
    growthRate: 0,
    adjustments: [],
    isActive: true,
    ...overrides,
  };
}

function makeInflowCategory(
  id: string,
  monthlyBaseline: number,
  overrides: Partial<InflowCategory> = {}
): InflowCategory {
  return {
    id,
    name: id,
    type: "custom",
    monthlyBaseline,
    growthRate: 0,
    adjustments: [],
    isActive: true,
    ...overrides,
  };
}

function makeVolatileAsset(
  id: string,
  config: {
    quantity: number;
    price: number;
    haircutPercent: number;
    maxSellPerMonth: number;
    liquidationPriority?: number;
    monthlyDeclineRate?: number;
    tier?: "major" | "alt" | "native";
  }
): VolatileAsset {
  return {
    id,
    name: id,
    ticker: id.toLowerCase(),
    tier: config.tier ?? "native",
    quantity: config.quantity,
    currentPrice: config.price,
    priceSource: "manual",
    liquidationPriority: config.liquidationPriority ?? 50,
    liquidity: {
      maxSellUnit: "tokens",
      maxSellPerMonth: config.maxSellPerMonth,
      haircutPercent: config.haircutPercent,
      priceAssumption:
        config.monthlyDeclineRate && config.monthlyDeclineRate > 0
          ? "monthly_decline"
          : "constant",
      monthlyDeclineRate: config.monthlyDeclineRate,
    },
  };
}

function makeModel(args: {
  stablecoins?: number;
  fiat?: number;
  volatileAssets?: VolatileAsset[];
  burnCategories?: BurnCategory[];
  inflowCategories?: InflowCategory[];
  projectionMonths?: 12 | 15 | 18;
}): RoughRunwayModel {
  return {
    id: "test",
    name: "Test",
    createdAt: "2026-04-21T00:00:00Z",
    updatedAt: "2026-04-21T00:00:00Z",
    projectionMonths: args.projectionMonths ?? 18,
    startDate: "2026-05",
    baseCurrency: "USD",
    extendedRunwayEnabled: true,
    treasury: {
      stablecoins:
        args.stablecoins && args.stablecoins > 0
          ? [{ id: "usdc", name: "USDC", amount: args.stablecoins }]
          : [],
      fiat:
        args.fiat && args.fiat > 0
          ? [{ id: "usd", currency: "USD", amount: args.fiat }]
          : [],
      volatileAssets: args.volatileAssets ?? [],
    },
    burnCategories: args.burnCategories ?? [],
    inflowCategories: args.inflowCategories ?? [],
    scenarios: [],
  };
}

// ----------------------------------------------------------------------------
// Fixture 1: Pure cash baseline
// ----------------------------------------------------------------------------

describe("Fixture 1: $1.2M stables, $100K/mo burn, no volatile assets", () => {
  const model = makeModel({
    stablecoins: 1_200_000,
    burnCategories: [makeBurnCategory("burn", 100_000)],
  });
  const { projections, summary } = computeProjection(model);

  it("hard runway depletes at month 12", () => {
    expect(summary.hardRunwayMonths).toBe(12);
  });
  it("extended runway depletes at month 12 (no volatile assets)", () => {
    expect(summary.extendedRunwayMonths).toBe(12);
  });
  it("projections have 18 rows", () => {
    expect(projections.length).toBe(18);
  });
});

// ----------------------------------------------------------------------------
// Fixture 2: Stables + fiat mix (both count for Hard)
// ----------------------------------------------------------------------------

describe("Fixture 2: $800K stables + $400K fiat, $100K/mo burn", () => {
  const model = makeModel({
    stablecoins: 800_000,
    fiat: 400_000,
    burnCategories: [makeBurnCategory("burn", 100_000)],
  });
  const { summary } = computeProjection(model);

  it("hard runway depletes at month 12 (fiat counts as hard)", () => {
    expect(summary.hardRunwayMonths).toBe(12);
  });
  it("extended runway depletes at month 12", () => {
    expect(summary.extendedRunwayMonths).toBe(12);
  });
});

// ----------------------------------------------------------------------------
// Fixture 3: Inflows reduce net burn
// ----------------------------------------------------------------------------

describe("Fixture 3: $600K stables, $100K/mo burn, $20K/mo inflows", () => {
  const model = makeModel({
    stablecoins: 600_000,
    burnCategories: [makeBurnCategory("burn", 100_000)],
    inflowCategories: [makeInflowCategory("staking", 20_000)],
  });
  const { summary } = computeProjection(model);

  it("hard runway depletes at month 8 (net $80K burn, 7.5mo)", () => {
    expect(summary.hardRunwayMonths).toBe(8);
  });
});

// ----------------------------------------------------------------------------
// Fixture 4: Liquid native token extends runway (with strain)
// ----------------------------------------------------------------------------

describe("Fixture 4: $500K stables + 10M tokens @ $0.20 (liquid), $150K/mo burn", () => {
  const model = makeModel({
    stablecoins: 500_000,
    burnCategories: [makeBurnCategory("burn", 150_000)],
    volatileAssets: [
      makeVolatileAsset("native", {
        quantity: 10_000_000,
        price: 0.2,
        haircutPercent: 10,
        maxSellPerMonth: 200_000,
      }),
    ],
  });
  const { projections, summary } = computeProjection(model);

  it("hard runway depletes at month 4", () => {
    expect(summary.hardRunwayMonths).toBe(4);
  });
  it("extended runway depletes at month 16 (accumulated deficit eats asset value)", () => {
    // Unmet deficit accumulates at $114K/mo for 15 months = $1.71M vs token value $1.8M.
    // Extended balance crosses zero around month 16.
    // This is the simulation behavior per docs/05 §3.5 —
    // extendedBalance = hardBalance + remainingVolatileValue - cumulativeUnmetDeficit.
    expect(summary.extendedRunwayMonths).toBe(16);
  });
  it("liquidity-constrained flag is true from month 4 onward", () => {
    // Month 1-3 are covered by stables, not constrained.
    // Month 4+ needs $150K but can only generate $36K (200K tokens @ $0.18 effective).
    expect(projections[3]!.liquidityConstrained).toBe(true);
    expect(projections[10]!.liquidityConstrained).toBe(true);
  });
  it("funding gap is meaningful (>$1.5M by month 18)", () => {
    expect(summary.fundingGapUSD).toBeGreaterThan(1_500_000);
  });
});

// ----------------------------------------------------------------------------
// Fixture 5: Illiquid native token — liquidity bottleneck
// ----------------------------------------------------------------------------

describe("Fixture 5: same as #4 but sell cap only 50K tokens/mo (illiquid)", () => {
  const model = makeModel({
    stablecoins: 500_000,
    burnCategories: [makeBurnCategory("burn", 150_000)],
    volatileAssets: [
      makeVolatileAsset("native", {
        quantity: 10_000_000,
        price: 0.2,
        haircutPercent: 10,
        maxSellPerMonth: 50_000, // 1/4 the liquidity of fixture 4
      }),
    ],
  });
  const { projections, summary } = computeProjection(model);

  it("hard runway still depletes at month 4", () => {
    expect(summary.hardRunwayMonths).toBe(4);
  });
  it("monthly proceeds are tiny (~$9K) from month 4 onward", () => {
    // 50K tokens * $0.20 * 0.9 = $9K
    const m5 = projections[4]!;
    expect(m5.totalLiquidationProceeds).toBeCloseTo(9_000, -1);
  });
  it("unmet deficit accumulates rapidly", () => {
    const m5 = projections[4]!;
    expect(m5.unmetDeficitThisMonth).toBeCloseTo(141_000, -1);
  });
});

// ----------------------------------------------------------------------------
// Fixture 6: Multi-asset priority (ETH liquid first, then native illiquid)
// ----------------------------------------------------------------------------

describe("Fixture 6: $300K stables + 100 ETH (priority 10) + 5M NATIVE (priority 50), $200K/mo burn", () => {
  const model = makeModel({
    stablecoins: 300_000,
    burnCategories: [makeBurnCategory("burn", 200_000)],
    volatileAssets: [
      makeVolatileAsset("eth", {
        quantity: 100,
        price: 3000,
        haircutPercent: 2,
        maxSellPerMonth: 100, // Can sell all ETH in one month
        liquidationPriority: 10,
        tier: "major",
      }),
      makeVolatileAsset("native", {
        quantity: 5_000_000,
        price: 0.1,
        haircutPercent: 15,
        maxSellPerMonth: 25_000,
        liquidationPriority: 50,
        tier: "native",
      }),
    ],
  });
  const { projections, summary } = computeProjection(model);

  it("hard runway depletes at month 2", () => {
    expect(summary.hardRunwayMonths).toBe(2);
  });
  it("ETH is drawn down BEFORE native token (priority respected)", () => {
    // Month 2: stables exhausted, ETH starts getting sold
    const m2 = projections[1]!;
    const ethRow = m2.liquidationDetails.find((d) => d.assetId === "eth");
    const nativeRow = m2.liquidationDetails.find((d) => d.assetId === "native");
    expect(ethRow).toBeDefined();
    expect(ethRow!.proceeds).toBeGreaterThan(0);
    // Native should not be touched until ETH is exhausted OR hit liquidity cap.
    // (Allow tiny floating-point residue from JS arithmetic.)
    expect(nativeRow?.proceeds ?? 0).toBeLessThan(1);
  });
  it("by month 3, ETH is fully depleted", () => {
    const m3 = projections[2]!;
    const ethAsset = m3.volatileAssets.find((a) => a.assetId === "eth");
    expect(ethAsset!.quantity).toBeCloseTo(0, 2);
  });
});

// ----------------------------------------------------------------------------
// Fixture 7: Declining token price (bear market)
// ----------------------------------------------------------------------------

describe("Fixture 7: $200K stables + 10M tokens @ $0.20 declining 5%/mo, $100K/mo burn", () => {
  const model = makeModel({
    stablecoins: 200_000,
    burnCategories: [makeBurnCategory("burn", 100_000)],
    volatileAssets: [
      makeVolatileAsset("native", {
        quantity: 10_000_000,
        price: 0.2,
        haircutPercent: 10,
        maxSellPerMonth: 500_000,
        monthlyDeclineRate: 0.05,
      }),
    ],
  });
  const { projections, summary } = computeProjection(model);

  it("hard runway depletes at month 2", () => {
    expect(summary.hardRunwayMonths).toBe(2);
  });
  it("month 3 effective price reflects decline (~5% compound)", () => {
    // Month 3: price = 0.20 * (0.95)^2 = 0.1805
    // Effective = 0.1805 * 0.90 = 0.16245
    const m3 = projections[2]!;
    const asset = m3.volatileAssets.find((a) => a.assetId === "native");
    expect(asset!.pricePerToken).toBeCloseTo(0.1805, 3);
  });
  it("by month 18, price has eroded significantly", () => {
    const m18 = projections[17]!;
    const asset = m18.volatileAssets.find((a) => a.assetId === "native");
    // Price at month 18 = 0.20 * 0.95^17 ≈ 0.0843
    expect(asset!.pricePerToken).toBeLessThan(0.09);
    expect(asset!.pricePerToken).toBeGreaterThan(0.07);
  });
});

// ----------------------------------------------------------------------------
// Fixture 8: One-off event (spike in month 4)
// ----------------------------------------------------------------------------

describe("Fixture 8: $1M stables, $80K baseline burn + $200K one-off month 4", () => {
  const model = makeModel({
    stablecoins: 1_000_000,
    burnCategories: [
      makeBurnCategory("burn", 80_000, {
        adjustments: [
          {
            id: "legal-spike",
            month: 4,
            type: "one_off",
            amount: 200_000,
            description: "Annual legal bill",
          },
        ],
      }),
    ],
  });
  const { projections, summary } = computeProjection(model);

  it("hard runway depletes at month 10 (not 13)", () => {
    // Without spike: 1M / 80K = 12.5 -> month 13
    // With $200K spike in month 4: effective loss = 4*80K + 200K = 520K by month 4
    // Remaining: 480K / 80K = 6 more months -> depletes month 10
    expect(summary.hardRunwayMonths).toBe(10);
  });
  it("month 4 burn reflects the spike", () => {
    const m4 = projections[3]!;
    expect(m4.totalBurn).toBe(280_000);
  });
  it("month 3 burn is unchanged (spike is month-specific)", () => {
    const m3 = projections[2]!;
    expect(m3.totalBurn).toBe(80_000);
  });
});

// ----------------------------------------------------------------------------
// Fixture 9: Profitable org (net positive, infinite runway)
// ----------------------------------------------------------------------------

describe("Fixture 9: $500K stables, $80K burn, $100K inflows (profitable)", () => {
  const model = makeModel({
    stablecoins: 500_000,
    burnCategories: [makeBurnCategory("burn", 80_000)],
    inflowCategories: [makeInflowCategory("revenue", 100_000)],
  });
  const { projections, summary } = computeProjection(model);

  it("hard runway never depletes", () => {
    expect(summary.hardRunwayMonths).toBeNull();
  });
  it("extended runway never depletes", () => {
    expect(summary.extendedRunwayMonths).toBeNull();
  });
  it("treasury grows over time (+$20K/mo)", () => {
    const m1 = projections[0]!;
    const m18 = projections[17]!;
    expect(m18.stablecoinBalance).toBeGreaterThan(m1.stablecoinBalance);
    // Month 18: 500K + 18 * 20K = 860K
    expect(m18.stablecoinBalance).toBeCloseTo(860_000, -2);
  });
  it("no months are liquidity-constrained", () => {
    expect(projections.every((p) => !p.liquidityConstrained)).toBe(true);
  });
});

// ----------------------------------------------------------------------------
// Fixture 10: extendedRunwayEnabled = false
// ----------------------------------------------------------------------------

describe("Fixture 10: extendedRunwayEnabled=false disables liquidation entirely", () => {
  const base = makeModel({
    stablecoins: 500_000,
    burnCategories: [makeBurnCategory("burn", 200_000)],
    volatileAssets: [
      makeVolatileAsset("native", {
        quantity: 2_000_000,
        price: 0.2,
        haircutPercent: 10,
        maxSellPerMonth: 500_000,
      }),
    ],
  });
  const model: RoughRunwayModel = { ...base, extendedRunwayEnabled: false };
  const { projections, summary } = computeProjection(model);

  it("hard runway depletes at month 3 (stables only)", () => {
    expect(summary.hardRunwayMonths).toBe(3);
  });
  it("extended runway equals hard runway (no liquidation)", () => {
    expect(summary.extendedRunwayMonths).toBe(3);
  });
  it("no liquidation occurs in any month", () => {
    expect(projections.every((p) => p.liquidationDetails.length === 0)).toBe(true);
    expect(projections.every((p) => p.totalLiquidationProceeds === 0)).toBe(true);
  });
  it("extendedBalance tracks hardBalance exactly each month", () => {
    for (const p of projections) {
      expect(p.extendedBalance).toBe(p.hardBalance);
    }
  });
});

// ----------------------------------------------------------------------------
// Fixture 11: Empty treasury — immediate depletion
// ----------------------------------------------------------------------------

describe("Fixture 11: $0 treasury, $100K/mo burn — depletes month 1", () => {
  const model = makeModel({
    burnCategories: [makeBurnCategory("burn", 100_000)],
  });
  const { projections, summary } = computeProjection(model);

  it("hard runway depletes at month 1", () => {
    expect(summary.hardRunwayMonths).toBe(1);
  });
  it("extended runway depletes at month 1", () => {
    expect(summary.extendedRunwayMonths).toBe(1);
  });
  it("every month has a $100K unmet deficit", () => {
    for (const p of projections) {
      expect(p.unmetDeficitThisMonth).toBeCloseTo(100_000, 0);
    }
  });
  it("cumulative deficit after 18 months is $1.8M", () => {
    expect(projections[17]!.cumulativeUnmetDeficit).toBeCloseTo(1_800_000, 0);
  });
  it("fundingGapUSD equals cumulative deficit", () => {
    expect(summary.fundingGapUSD).toBeCloseTo(1_800_000, 0);
  });
});

// ----------------------------------------------------------------------------
// Fixture 12: Zero burn — infinite runway, stables preserved
// ----------------------------------------------------------------------------

describe("Fixture 12: $500K stables, zero burn — infinite runway", () => {
  const model = makeModel({ stablecoins: 500_000 });
  const { projections, summary } = computeProjection(model);

  it("hard runway never depletes", () => {
    expect(summary.hardRunwayMonths).toBeNull();
  });
  it("extended runway never depletes", () => {
    expect(summary.extendedRunwayMonths).toBeNull();
  });
  it("stablecoin balance stays at $500K every month", () => {
    for (const p of projections) {
      expect(p.stablecoinBalance).toBeCloseTo(500_000, 0);
    }
  });
  it("no funding gap", () => {
    expect(summary.fundingGapUSD).toBe(0);
  });
});

// ----------------------------------------------------------------------------
// Fixture 13: Declining burn baseline (negative growth rate)
// ----------------------------------------------------------------------------

describe("Fixture 13: $1.5M stables, $100K burn declining 10%/mo — survives 18 months", () => {
  const model = makeModel({
    stablecoins: 1_500_000,
    burnCategories: [makeBurnCategory("burn", 100_000, { growthRate: -0.1 })],
  });
  const { projections, summary } = computeProjection(model);

  it("hard runway never depletes (declining burn exhausts < $1.5M)", () => {
    expect(summary.hardRunwayMonths).toBeNull();
  });
  it("month 1 burn = $100K (no decay yet)", () => {
    expect(projections[0]!.totalBurn).toBeCloseTo(100_000, 0);
  });
  it("month 2 burn = $90K (one decay step)", () => {
    expect(projections[1]!.totalBurn).toBeCloseTo(90_000, 0);
  });
  it("month 18 burn ≈ $16.7K (17 decay steps)", () => {
    // 100K * 0.9^17 ≈ 16,677
    expect(projections[17]!.totalBurn).toBeCloseTo(100_000 * Math.pow(0.9, 17), 0);
  });
  it("stables at month 18 are above $650K", () => {
    expect(projections[17]!.stablecoinBalance).toBeGreaterThan(650_000);
  });
});

// ----------------------------------------------------------------------------
// Fixture 14: Multiple baseline_change adjustments in sequence
// ----------------------------------------------------------------------------

describe("Fixture 14: $2M stables, burn escalates $100K → $200K (m4) → $300K (m8)", () => {
  const model = makeModel({
    stablecoins: 2_000_000,
    burnCategories: [
      makeBurnCategory("burn", 100_000, {
        adjustments: [
          { id: "adj1", month: 4, type: "baseline_change", amount: 200_000, description: "Series A hiring" },
          { id: "adj2", month: 8, type: "baseline_change", amount: 300_000, description: "Scale" },
        ],
      }),
    ],
  });
  const { projections, summary } = computeProjection(model);

  it("months 1-3 burn $100K each", () => {
    for (let i = 0; i < 3; i++) {
      expect(projections[i]!.totalBurn).toBeCloseTo(100_000, 0);
    }
  });
  it("months 4-7 burn $200K each", () => {
    for (let i = 3; i < 7; i++) {
      expect(projections[i]!.totalBurn).toBeCloseTo(200_000, 0);
    }
  });
  it("months 8+ burn $300K each", () => {
    for (let i = 7; i < 10; i++) {
      expect(projections[i]!.totalBurn).toBeCloseTo(300_000, 0);
    }
  });
  it("hard runway depletes at month 10", () => {
    // Months 1-3: 300K, months 4-7: 800K, months 8-9: 600K → total 1.7M by month 9
    // Month 10: 300K remaining draws 300K → balance=0
    expect(summary.hardRunwayMonths).toBe(10);
  });
});

// ----------------------------------------------------------------------------
// Fixture 15: percent_of_volume with zero daily volume — no liquidation
// ----------------------------------------------------------------------------

describe("Fixture 15: percent_of_volume asset with dailyVolume=0 — cannot liquidate", () => {
  const zeroVolumeAsset: VolatileAsset = {
    id: "token",
    name: "TOKEN",
    ticker: "TKN",
    tier: "native",
    quantity: 10_000_000,
    currentPrice: 1.0,
    priceSource: "manual",
    liquidationPriority: 10,
    liquidity: {
      maxSellUnit: "percent_of_volume",
      maxSellPerMonth: 0,
      percentOfVolume: 0.05,
      dailyVolume: 0,
      haircutPercent: 5,
      priceAssumption: "constant",
    },
  };
  const model = makeModel({
    stablecoins: 400_000,
    burnCategories: [makeBurnCategory("burn", 200_000)],
    volatileAssets: [zeroVolumeAsset],
  });
  const { projections, summary } = computeProjection(model);

  it("hard runway depletes at month 2 (stables only cover 2 months)", () => {
    // 400K / 200K = 2, balance hits 0 at end of month 2
    expect(summary.hardRunwayMonths).toBe(2);
  });
  it("no liquidation proceeds from zero-volume asset", () => {
    for (const p of projections) {
      expect(p.totalLiquidationProceeds).toBe(0);
    }
  });
  it("unmet deficit accumulates from month 3 onward (month 2 stables exactly cover burn)", () => {
    // Month 2 draws the last $200K of stables exactly — remaining=0, no deficit yet.
    // Month 3+ has nothing to draw from and zero volume to liquidate.
    expect(projections[2]!.unmetDeficitThisMonth).toBeGreaterThan(0);
  });
});

// ----------------------------------------------------------------------------
// Fixture 16: Haircut 100% — asset is worthless; proceeds are zero
// ----------------------------------------------------------------------------

describe("Fixture 16: $500K stables + asset with 100% haircut — no liquidation value", () => {
  const worthlessAsset: VolatileAsset = {
    id: "token",
    name: "TOKEN",
    ticker: "TKN",
    tier: "native",
    quantity: 10_000_000,
    currentPrice: 1.0,
    priceSource: "manual",
    liquidationPriority: 10,
    liquidity: {
      maxSellUnit: "tokens",
      maxSellPerMonth: 500_000,
      haircutPercent: 100,
      priceAssumption: "constant",
    },
  };
  const model = makeModel({
    stablecoins: 500_000,
    burnCategories: [makeBurnCategory("burn", 200_000)],
    volatileAssets: [worthlessAsset],
  });
  const { projections, summary } = computeProjection(model);

  it("hard runway depletes at month 3 (same as no volatile assets)", () => {
    expect(summary.hardRunwayMonths).toBe(3);
  });
  it("extended runway depletes at month 3 (worthless asset adds no value)", () => {
    expect(summary.extendedRunwayMonths).toBe(3);
  });
  it("proceeds are zero every month (effectivePrice=0 prevents sale)", () => {
    expect(projections.every((p) => p.totalLiquidationProceeds === 0)).toBe(true);
  });
});

// ----------------------------------------------------------------------------
// Fixture 17: Negative one-off event (credit / refund)
// ----------------------------------------------------------------------------

describe("Fixture 17: $1M stables, $100K burn with -$50K credit in month 5", () => {
  const model = makeModel({
    stablecoins: 1_000_000,
    burnCategories: [
      makeBurnCategory("burn", 100_000, {
        adjustments: [
          { id: "refund", month: 5, type: "one_off", amount: -50_000, description: "Insurance refund" },
        ],
      }),
    ],
  });
  const { projections, summary } = computeProjection(model);

  it("month 5 burn is $50K (100K - 50K credit)", () => {
    expect(projections[4]!.totalBurn).toBeCloseTo(50_000, 0);
  });
  it("months before and after month 5 are $100K", () => {
    expect(projections[3]!.totalBurn).toBeCloseTo(100_000, 0);
    expect(projections[5]!.totalBurn).toBeCloseTo(100_000, 0);
  });
  it("hard runway extends to month 11 (credit saves one month vs month 10)", () => {
    // Without credit: 1M / 100K = 10 months
    // With -50K in month 5: total spend through month 11 = 9*100K + 50K = 950K + 50K = 1M
    expect(summary.hardRunwayMonths).toBe(11);
  });
});

// ----------------------------------------------------------------------------
// Fixture 18: Vesting + liquidation timing
// ----------------------------------------------------------------------------

describe("Fixture 18: vesting event at month 4 provides liquidatable tokens", () => {
  const vestingAsset: VolatileAsset = {
    id: "vest",
    name: "VEST",
    ticker: "VST",
    tier: "native",
    quantity: 0,
    currentPrice: 1.0,
    priceSource: "manual",
    liquidationPriority: 10,
    liquidity: {
      maxSellUnit: "tokens",
      maxSellPerMonth: 250_000,
      haircutPercent: 0,
      priceAssumption: "constant",
    },
    vestingSchedule: [
      { id: "v1", month: 4, quantity: 1_000_000, description: "Cliff" },
    ],
  };
  const model = makeModel({
    stablecoins: 600_000,
    burnCategories: [makeBurnCategory("burn", 200_000)],
    volatileAssets: [vestingAsset],
  });
  const { projections } = computeProjection(model);

  it("months 1-3: no vested tokens available (quantity stays 0)", () => {
    for (let i = 0; i < 3; i++) {
      const a = projections[i]!.volatileAssets.find((v) => v.assetId === "vest");
      expect(a!.quantity).toBe(0);
    }
  });
  it("month 4: 1M tokens vest and liquidation proceeds = $250K (capped by sell limit)", () => {
    const m4 = projections[3]!;
    // After vesting: 1M tokens, need to sell 200K/1.0=200K tokens, cap=250K → sell 200K
    expect(m4.totalLiquidationProceeds).toBeCloseTo(200_000, -2);
  });
  it("month 4: asset quantity reduced by tokens sold", () => {
    const m4 = projections[3]!;
    const a = m4.volatileAssets.find((v) => v.assetId === "vest");
    // 1M vested, 200K sold → 800K remaining
    expect(a!.quantity).toBeCloseTo(800_000, -2);
  });
  it("month 4: no unmet deficit (liquidation covers full burn)", () => {
    expect(projections[3]!.unmetDeficitThisMonth).toBeCloseTo(0, 0);
  });
});

// ----------------------------------------------------------------------------
// Fixture 19: Scenario — "all_volatile" price override halves all asset prices
// ----------------------------------------------------------------------------

describe("Fixture 19: scenario 'all_volatile' price override", () => {
  const model = makeModel({
    stablecoins: 500_000,
    burnCategories: [makeBurnCategory("burn", 50_000)],
    volatileAssets: [
      makeVolatileAsset("eth", { quantity: 100, price: 3_000, haircutPercent: 2, maxSellPerMonth: 100, liquidationPriority: 10, tier: "major" }),
      makeVolatileAsset("native", { quantity: 1_000_000, price: 0.5, haircutPercent: 15, maxSellPerMonth: 50_000 }),
    ],
  });

  const modified = applyScenarioOverrides(model, {
    priceOverrides: [{ assetId: "all_volatile", type: "percent_change", value: -0.5 }],
  });

  it("ETH price is halved", () => {
    const eth = modified.treasury.volatileAssets.find((a) => a.id === "eth");
    expect(eth!.currentPrice).toBeCloseTo(1_500, 0);
  });
  it("native token price is halved", () => {
    const native = modified.treasury.volatileAssets.find((a) => a.id === "native");
    expect(native!.currentPrice).toBeCloseTo(0.25, 4);
  });
  it("original model is unmodified (pure function)", () => {
    const origEth = model.treasury.volatileAssets.find((a) => a.id === "eth");
    expect(origEth!.currentPrice).toBe(3_000);
  });
});

// ----------------------------------------------------------------------------
// Fixture 20: Scenario — headcount change silently ignored if no category exists
// ----------------------------------------------------------------------------

describe("Fixture 20: headcountChange silently skipped when no headcount category", () => {
  const model = makeModel({
    stablecoins: 1_000_000,
    burnCategories: [makeBurnCategory("marketing", 50_000)],
  });

  it("does not throw when headcount category is absent", () => {
    expect(() =>
      applyScenarioOverrides(model, {
        headcountChange: { count: 3, costPerHead: 15_000, startMonth: 2 },
      })
    ).not.toThrow();
  });
  it("burn categories are unchanged after no-op headcount override", () => {
    const modified = applyScenarioOverrides(model, {
      headcountChange: { count: 3, costPerHead: 15_000, startMonth: 2 },
    });
    expect(modified.burnCategories.length).toBe(model.burnCategories.length);
    expect(modified.burnCategories[0]!.monthlyBaseline).toBe(50_000);
  });
});

// ----------------------------------------------------------------------------
// Fixture 21: Scenario — headcount change adds baseline_change adjustment
// ----------------------------------------------------------------------------

describe("Fixture 21: headcountChange with matching category adds baseline_change", () => {
  const model = makeModel({
    stablecoins: 2_000_000,
    burnCategories: [
      makeBurnCategory("headcount", 150_000, { presetKey: "headcount" }),
      makeBurnCategory("infra", 20_000),
    ],
  });

  const modified = applyScenarioOverrides(model, {
    headcountChange: { count: 2, costPerHead: 15_000, startMonth: 3 },
  });

  it("headcount category gains a baseline_change adjustment", () => {
    const hc = modified.burnCategories.find((c) => c.presetKey === "headcount");
    const adj = hc!.adjustments.find((a) => a.type === "baseline_change");
    expect(adj).toBeDefined();
  });
  it("baseline_change amount = original + 2 * 15K = $180K", () => {
    const hc = modified.burnCategories.find((c) => c.presetKey === "headcount");
    const adj = hc!.adjustments.find((a) => a.type === "baseline_change");
    expect(adj!.amount).toBeCloseTo(180_000, 0);
  });
  it("baseline_change month = startMonth (3)", () => {
    const hc = modified.burnCategories.find((c) => c.presetKey === "headcount");
    const adj = hc!.adjustments.find((a) => a.type === "baseline_change");
    expect(adj!.month).toBe(3);
  });
  it("infra category is untouched", () => {
    const infra = modified.burnCategories.find((c) => c.name === "infra");
    expect(infra!.monthlyBaseline).toBe(20_000);
    expect(infra!.adjustments.length).toBe(0);
  });
  it("headcount months 1-2 still burn $150K (before startMonth)", () => {
    const { projections } = computeProjection(modified);
    expect(projections[0]!.totalBurn).toBeCloseTo(170_000, 0); // 150K + 20K
    expect(projections[1]!.totalBurn).toBeCloseTo(170_000, 0);
  });
  it("headcount month 3+ burns $200K (180K hc + 20K infra)", () => {
    const { projections } = computeProjection(modified);
    expect(projections[2]!.totalBurn).toBeCloseTo(200_000, 0);
  });
});

// ----------------------------------------------------------------------------
// Fixture 22: Custom price schedule with fallback to currentPrice
// ----------------------------------------------------------------------------

describe("Fixture 22: custom_schedule price assumption", () => {
  const asset: VolatileAsset = {
    id: "tok",
    name: "TOK",
    ticker: "TOK",
    tier: "native",
    quantity: 1_000_000,
    currentPrice: 1.0,
    priceSource: "manual",
    liquidationPriority: 50,
    liquidity: {
      maxSellUnit: "tokens",
      maxSellPerMonth: 50_000,
      haircutPercent: 10,
      priceAssumption: "custom_schedule",
      customPriceSchedule: [
        { month: 3, price: 0.5 },
        { month: 6, price: 0.25 },
      ],
    },
  };

  it("month 1 uses currentPrice (not in schedule)", () => {
    expect(computeAssetPrice(asset, 1)).toBe(1.0);
  });
  it("month 3 uses scheduled price $0.50", () => {
    expect(computeAssetPrice(asset, 3)).toBe(0.5);
  });
  it("month 5 falls back to currentPrice (not in schedule)", () => {
    expect(computeAssetPrice(asset, 5)).toBe(1.0);
  });
  it("month 6 uses scheduled price $0.25", () => {
    expect(computeAssetPrice(asset, 6)).toBe(0.25);
  });
  it("month 18 falls back to currentPrice", () => {
    expect(computeAssetPrice(asset, 18)).toBe(1.0);
  });
});

// ----------------------------------------------------------------------------
// Fixture 23: Multiple one-off events in the same month
// ----------------------------------------------------------------------------

describe("Fixture 23: $1M stables, $80K burn + two one-offs in month 4 (+$100K, +$50K)", () => {
  const model = makeModel({
    stablecoins: 1_000_000,
    burnCategories: [
      makeBurnCategory("burn", 80_000, {
        adjustments: [
          { id: "a1", month: 4, type: "one_off", amount: 100_000, description: "Legal bill" },
          { id: "a2", month: 4, type: "one_off", amount: 50_000, description: "Conference" },
        ],
      }),
    ],
  });
  const { projections, summary } = computeProjection(model);

  it("month 4 burn = $230K (80K + 100K + 50K)", () => {
    expect(projections[3]!.totalBurn).toBeCloseTo(230_000, 0);
  });
  it("month 3 and month 5 burn = $80K (one-offs don't bleed)", () => {
    expect(projections[2]!.totalBurn).toBeCloseTo(80_000, 0);
    expect(projections[4]!.totalBurn).toBeCloseTo(80_000, 0);
  });
  it("hard runway depletes at month 11", () => {
    // Total spend: 3*80K + 230K + 7*80K = 240K + 230K + 560K = 1030K > 1M
    // After month 10: 1M - 3*80K - 230K - 6*80K = 1M - 960K = 40K
    // Month 11: 40K - 80K → 40K drawn, balance=0, hardRunway=11
    expect(summary.hardRunwayMonths).toBe(11);
  });
});

// ----------------------------------------------------------------------------
// Fixture 24: Scenario — disable a burn category via override
// ----------------------------------------------------------------------------

describe("Fixture 24: scenario disables a burn category", () => {
  const hcId = "hc-cat";
  const model = makeModel({
    stablecoins: 2_000_000,
    burnCategories: [
      makeBurnCategory(hcId, 150_000),
      makeBurnCategory("marketing", 50_000),
    ],
  });

  const modified = applyScenarioOverrides(model, {
    burnOverrides: [{ categoryId: hcId, type: "disable" }],
  });

  it("targeted category is disabled", () => {
    const hc = modified.burnCategories.find((c) => c.id === hcId);
    expect(hc!.isActive).toBe(false);
  });
  it("other category is unaffected", () => {
    const mkt = modified.burnCategories.find((c) => c.name === "marketing");
    expect(mkt!.isActive).toBe(true);
    expect(mkt!.monthlyBaseline).toBe(50_000);
  });
  it("projection uses only the active $50K/mo burn", () => {
    const { projections } = computeProjection(modified);
    expect(projections[0]!.totalBurn).toBeCloseTo(50_000, 0);
  });
  it("runway extends significantly (2M / 50K = 40 > 18 months)", () => {
    const { summary } = computeProjection(modified);
    expect(summary.hardRunwayMonths).toBeNull();
  });
});

// ----------------------------------------------------------------------------
// Fixture 25: Inflow grows via baseline_change — runway extends
// ----------------------------------------------------------------------------

describe("Fixture 25: $1.5M stables, $100K burn, inflow grows from $20K to $80K at month 7", () => {
  const model = makeModel({
    stablecoins: 1_500_000,
    burnCategories: [makeBurnCategory("burn", 100_000)],
    inflowCategories: [
      makeInflowCategory("revenue", 20_000, {
        adjustments: [
          { id: "adj1", month: 7, type: "baseline_change", amount: 80_000, description: "Product launch" },
        ],
      }),
    ],
  });
  const { projections, summary } = computeProjection(model);

  it("months 1-6 net burn = $80K (100K - 20K)", () => {
    for (let i = 0; i < 6; i++) {
      expect(projections[i]!.netBurn).toBeCloseTo(80_000, 0);
    }
  });
  it("month 7 net burn drops to $20K (100K - 80K)", () => {
    expect(projections[6]!.netBurn).toBeCloseTo(20_000, 0);
  });
  it("hard runway never depletes (1.5M > total spend over 18 months)", () => {
    // Months 1-6: 80K * 6 = 480K; Months 7-18: 20K * 12 = 240K; Total = 720K < 1.5M
    expect(summary.hardRunwayMonths).toBeNull();
  });
  it("stablecoin balance at month 18 ≈ $780K", () => {
    // 1.5M - 6*80K (net burn months 1-6) - 12*20K (net burn months 7-18) = 780K exactly
    expect(projections[17]!.stablecoinBalance).toBeCloseTo(780_000, -2);
  });
});
