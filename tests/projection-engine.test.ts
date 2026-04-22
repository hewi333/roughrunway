// Projection engine test fixtures
// Source of truth: docs/05-PROJECTION-ENGINE.md §"Worked Examples"
// These are hand-verified via the reference Python simulator (scripts/verify-engine.py).
// If any of these fail, the engine's math is broken — do not proceed to UI work.

import { describe, it, expect } from "vitest";
import { computeProjection } from "@/lib/projection-engine";
import type {
  BurnCategory,
  RoughRunwayModel,
  InflowCategory,
  VolatileAsset,
} from "@/lib/types";

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
