// CryptoRunway Projection Engine
// Source of truth: docs/05-PROJECTION-ENGINE.md
// Pure functions only — no side effects, no API calls, no state mutation.

import type {
  BurnCategory,
  CryptoRunwayModel,
  InflowCategory,
  MonthlyProjection,
  RunwaySummary,
  Scenario,
  VolatileAsset,
} from "./types";
import { computeMonthDate, formatMonthLabel, sum } from "./utils";
import { applyScenarioOverrides } from "./scenario-engine";

// ============================================================================
// Primary Entry Point
// ============================================================================

export function computeProjection(model: CryptoRunwayModel): {
  projections: MonthlyProjection[];
  summary: RunwaySummary;
} {
  // Step 0: Initialize
  let stablecoinBalance = sum(model.treasury.stablecoins, (s) => s.amount);
  let fiatBalance = sum(model.treasury.fiat, (f) => f.amount);

  const assets: VolatileAsset[] = structuredClone(model.treasury.volatileAssets).sort(
    (a, b) => a.liquidationPriority - b.liquidationPriority
  );

  let cumulativeUnmetDeficit = 0;
  let hardRunwayMonth: number | null = null;
  let extendedRunwayMonth: number | null = null;

  const projections: MonthlyProjection[] = [];
  const extendedEnabled = model.extendedRunwayEnabled !== false;

  for (let M = 1; M <= model.projectionMonths; M++) {
    // Step 2: Vesting
    for (const asset of assets) {
      if (!asset.vestingSchedule) continue;
      for (const event of asset.vestingSchedule) {
        if (event.month === M) asset.quantity += event.quantity;
      }
    }

    // Step 3: Burn
    const totalBurn = model.burnCategories.reduce(
      (s, c) => s + getMonthlyBurn(c, M),
      0
    );

    // Step 4: Inflows
    const totalInflows = model.inflowCategories.reduce(
      (s, c) => s + getMonthlyInflow(c, M),
      0
    );

    const netBurn = totalBurn - totalInflows;

    // Step 5: Draw from stables → fiat
    let remainingBurn = netBurn;

    if (remainingBurn > 0 && stablecoinBalance > 0) {
      const draw = Math.min(remainingBurn, stablecoinBalance);
      stablecoinBalance -= draw;
      remainingBurn -= draw;
    }

    if (remainingBurn > 0 && fiatBalance > 0) {
      const draw = Math.min(remainingBurn, fiatBalance);
      fiatBalance -= draw;
      remainingBurn -= draw;
    }

    // Surplus (net profitable month) → stables
    if (remainingBurn < 0) {
      stablecoinBalance += Math.abs(remainingBurn);
      remainingBurn = 0;
    }

    const hardBalance = stablecoinBalance + fiatBalance;
    if (hardBalance <= 0 && hardRunwayMonth === null) {
      hardRunwayMonth = M;
    }

    // Step 6: Liquidate volatile assets in priority order
    const liquidationDetails: MonthlyProjection["liquidationDetails"] = [];
    let totalLiquidationProceeds = 0;

    if (extendedEnabled) {
      for (const asset of assets) {
        if (remainingBurn <= 0) break;
        if (asset.quantity <= 0) continue;

        const priceThisMonth = computeAssetPrice(asset, M);
        if (priceThisMonth <= 0) continue;

        const effectivePrice = priceThisMonth * (1 - asset.liquidity.haircutPercent / 100);
        if (effectivePrice <= 0) continue;

        let maxSellableTokens: number;
        if (asset.liquidity.maxSellUnit === "tokens") {
          maxSellableTokens = Math.min(asset.liquidity.maxSellPerMonth, asset.quantity);
        } else {
          const pctVol = asset.liquidity.percentOfVolume ?? 0;
          const dailyVol = asset.liquidity.dailyVolume ?? 0;
          const dailyUSD = pctVol * dailyVol;
          const dailyTokens = priceThisMonth > 0 ? dailyUSD / priceThisMonth : 0;
          maxSellableTokens = Math.min(dailyTokens * 30, asset.quantity);
        }

        if (maxSellableTokens <= 0) continue;

        const tokensNeeded = remainingBurn / effectivePrice;
        const tokensToSell = Math.min(tokensNeeded, maxSellableTokens);

        const proceeds = tokensToSell * effectivePrice;
        asset.quantity -= tokensToSell;
        remainingBurn -= proceeds;
        totalLiquidationProceeds += proceeds;

        liquidationDetails.push({
          assetId: asset.id,
          tokensSold: tokensToSell,
          proceeds,
        });
      }
    }

    // Step 7: Accumulate unmet deficit
    const unmetDeficitThisMonth = Math.max(0, remainingBurn);
    cumulativeUnmetDeficit += unmetDeficitThisMonth;

    // Step 8: Extended Balance
    const remainingVolatileValue = extendedEnabled
      ? assets.reduce((s, a) => {
          const price = computeAssetPrice(a, M);
          return s + a.quantity * price * (1 - a.liquidity.haircutPercent / 100);
        }, 0)
      : 0;

    const extendedBalance = extendedEnabled
      ? hardBalance + remainingVolatileValue - cumulativeUnmetDeficit
      : hardBalance;

    if (extendedBalance <= 0 && extendedRunwayMonth === null) {
      extendedRunwayMonth = M;
    }

    // Step 9: Record row
    const liquidityConstrained = unmetDeficitThisMonth > 0;

    projections.push({
      month: M,
      label: formatMonthLabel(model.startDate, M),
      date: computeMonthDate(model.startDate, M),
      stablecoinBalance,
      fiatBalance,
      volatileAssets: assets.map((a) => {
        const price = computeAssetPrice(a, M);
        return {
          assetId: a.id,
          quantity: a.quantity,
          pricePerToken: price,
          valueAtHaircut: a.quantity * price * (1 - a.liquidity.haircutPercent / 100),
        };
      }),
      totalBurn,
      totalInflows,
      netBurn,
      liquidationDetails,
      totalLiquidationProceeds,
      unmetDeficitThisMonth,
      cumulativeUnmetDeficit,
      hardBalance,
      extendedBalance,
      hardRunwayDepleted: hardBalance <= 0,
      extendedRunwayDepleted: extendedBalance <= 0,
      liquidityConstrained,
    });
  }

  // Step 10: Summary
  const summary = buildSummary({
    model,
    projections,
    hardRunwayMonth,
    extendedRunwayMonth,
    cumulativeUnmetDeficit,
  });

  return { projections, summary };
}

// ============================================================================
// Helpers
// ============================================================================

export function getMonthlyBurn(category: BurnCategory, month: number): number {
  if (!category.isActive) return 0;

  const baselineChanges = category.adjustments
    .filter((a) => a.type === "baseline_change" && a.month <= month)
    .sort((a, b) => b.month - a.month);

  let baseAmount: number;
  let growthStartMonth: number;

  if (baselineChanges.length > 0) {
    baseAmount = baselineChanges[0].amount;
    growthStartMonth = baselineChanges[0].month;
  } else {
    baseAmount = category.monthlyBaseline;
    growthStartMonth = 1;
  }

  const growthMonths = month - growthStartMonth;
  let amount = baseAmount * Math.pow(1 + category.growthRate, growthMonths);

  const oneOffs = category.adjustments.filter(
    (a) => a.type === "one_off" && a.month === month
  );
  amount += oneOffs.reduce((s, a) => s + a.amount, 0);

  return amount;
}

export function getMonthlyInflow(category: InflowCategory, month: number): number {
  if (!category.isActive) return 0;

  const baselineChanges = category.adjustments
    .filter((a) => a.type === "baseline_change" && a.month <= month)
    .sort((a, b) => b.month - a.month);

  let baseAmount: number;
  let growthStartMonth: number;

  if (baselineChanges.length > 0) {
    baseAmount = baselineChanges[0].amount;
    growthStartMonth = baselineChanges[0].month;
  } else {
    baseAmount = category.monthlyBaseline;
    growthStartMonth = 1;
  }

  const growthMonths = month - growthStartMonth;
  let amount = baseAmount * Math.pow(1 + category.growthRate, growthMonths);

  const oneOffs = category.adjustments.filter(
    (a) => a.type === "one_off" && a.month === month
  );
  amount += oneOffs.reduce((s, a) => s + a.amount, 0);

  return amount;
}

export function computeAssetPrice(asset: VolatileAsset, month: number): number {
  switch (asset.liquidity.priceAssumption) {
    case "constant":
      return asset.currentPrice;
    case "monthly_decline": {
      const rate = asset.liquidity.monthlyDeclineRate ?? 0;
      return asset.currentPrice * Math.pow(1 - rate, month - 1);
    }
    case "custom_schedule": {
      const scheduled = asset.liquidity.customPriceSchedule?.find((s) => s.month === month);
      return scheduled?.price ?? asset.currentPrice;
    }
  }
}

function buildSummary(opts: {
  model: CryptoRunwayModel;
  projections: MonthlyProjection[];
  hardRunwayMonth: number | null;
  extendedRunwayMonth: number | null;
  cumulativeUnmetDeficit: number;
}): RunwaySummary {
  const { model, projections, hardRunwayMonth, extendedRunwayMonth, cumulativeUnmetDeficit } = opts;

  const liquidityConstrainedMonths = projections.filter((p) => p.liquidityConstrained).length;

  const averageMonthlyNetBurn = (() => {
    const lookback = hardRunwayMonth ?? projections.length;
    if (lookback === 0) return 0;
    const relevant = projections.slice(0, lookback);
    return relevant.reduce((s, p) => s + p.netBurn, 0) / relevant.length;
  })();

  const initialStables = sum(model.treasury.stablecoins, (s) => s.amount);
  const initialFiat = sum(model.treasury.fiat, (f) => f.amount);
  const initialVolatileSpot = sum(
    model.treasury.volatileAssets,
    (a) => a.quantity * a.currentPrice
  );
  const initialVolatileHaircut = sum(
    model.treasury.volatileAssets,
    (a) => a.quantity * a.currentPrice * (1 - a.liquidity.haircutPercent / 100)
  );

  return {
    hardRunwayMonths: hardRunwayMonth,
    hardRunwayDate: hardRunwayMonth
      ? computeMonthDate(model.startDate, hardRunwayMonth)
      : `${model.projectionMonths}+ months`,
    extendedRunwayMonths: extendedRunwayMonth,
    extendedRunwayDate: extendedRunwayMonth
      ? computeMonthDate(model.startDate, extendedRunwayMonth)
      : `${model.projectionMonths}+ months`,
    averageMonthlyNetBurn,
    currentTotalUSD: initialStables + initialFiat + initialVolatileSpot,
    currentTotalAtHaircut: initialStables + initialFiat + initialVolatileHaircut,
    fundingGapUSD: cumulativeUnmetDeficit,
    liquidityConstrainedMonths,
  };
}

// ============================================================================
// Scenario Entry Point
// ============================================================================

export function computeScenarioProjection(
  baseline: CryptoRunwayModel,
  scenario: Scenario
): { projections: MonthlyProjection[]; summary: RunwaySummary } {
  const modifiedModel = applyScenarioOverrides(baseline, scenario.overrides);
  return computeProjection(modifiedModel);
}
