// Scenario Engine — applies overrides to a baseline, returns a new model
// Source of truth: docs/05-PROJECTION-ENGINE.md

import type { CryptoRunwayModel, ScenarioOverrides } from "./types";
import { generateId } from "./utils";

export function applyScenarioOverrides(
  baseline: CryptoRunwayModel,
  overrides: ScenarioOverrides
): CryptoRunwayModel {
  const model: CryptoRunwayModel = structuredClone(baseline);

  // Price overrides
  if (overrides.priceOverrides) {
    for (const override of overrides.priceOverrides) {
      const targets =
        override.assetId === "all_volatile"
          ? model.treasury.volatileAssets
          : model.treasury.volatileAssets.filter((a) => a.id === override.assetId);

      for (const asset of targets) {
        if (override.type === "absolute") {
          asset.currentPrice = override.value;
        } else {
          asset.currentPrice *= 1 + override.value;
        }
      }
    }
  }

  // Liquidity overrides
  if (overrides.liquidityOverrides) {
    for (const override of overrides.liquidityOverrides) {
      const asset = model.treasury.volatileAssets.find((a) => a.id === override.assetId);
      if (!asset) continue;
      if (override.haircutPercent !== undefined) {
        asset.liquidity.haircutPercent = override.haircutPercent;
      }
      if (override.maxSellPerMonth !== undefined) {
        asset.liquidity.maxSellPerMonth = override.maxSellPerMonth;
      }
      if (override.percentOfVolume !== undefined) {
        asset.liquidity.percentOfVolume = override.percentOfVolume;
      }
    }
  }

  // Burn category overrides (match by ID or presetKey)
  if (overrides.burnOverrides) {
    for (const override of overrides.burnOverrides) {
      const category = model.burnCategories.find(
        (c) => c.id === override.categoryId || c.presetKey === override.categoryId
      );
      if (!category) continue;
      if (override.type === "disable") {
        category.isActive = false;
      } else if (override.type === "percent_change") {
        category.monthlyBaseline *= 1 + (override.value ?? 0);
      } else if (override.type === "absolute") {
        category.monthlyBaseline = override.value ?? 0;
      }
    }
  }

  // Inflow category overrides
  if (overrides.inflowOverrides) {
    for (const override of overrides.inflowOverrides) {
      const category = model.inflowCategories.find(
        (c) => c.id === override.categoryId || c.presetKey === override.categoryId
      );
      if (!category) continue;
      if (override.type === "disable") {
        category.isActive = false;
      } else if (override.type === "percent_change") {
        category.monthlyBaseline *= 1 + (override.value ?? 0);
      } else if (override.type === "absolute") {
        category.monthlyBaseline = override.value ?? 0;
      }
    }
  }

  // Headcount shortcut
  if (overrides.headcountChange) {
    const headcount = model.burnCategories.find((c) => c.presetKey === "headcount");
    if (headcount) {
      const additionalCost =
        overrides.headcountChange.count * overrides.headcountChange.costPerHead;
      headcount.adjustments.push({
        id: generateId("adj"),
        month: overrides.headcountChange.startMonth,
        type: "baseline_change",
        amount: headcount.monthlyBaseline + additionalCost,
        description: `Scenario: ${
          overrides.headcountChange.count > 0 ? "+" : ""
        }${overrides.headcountChange.count} headcount`,
      });
    }
  }

  // One-off burn events
  if (overrides.additionalBurnEvents && overrides.additionalBurnEvents.length > 0) {
    model.burnCategories.push({
      id: generateId("cat"),
      name: "Scenario Events (Expenses)",
      type: "custom",
      monthlyBaseline: 0,
      currency: "fiat",
      growthRate: 0,
      isActive: true,
      adjustments: overrides.additionalBurnEvents.map((e) => ({
        id: generateId("adj"),
        month: e.month,
        type: "one_off" as const,
        amount: e.amount,
        description: e.description,
      })),
    });
  }

  // One-off inflow events
  if (overrides.additionalInflowEvents && overrides.additionalInflowEvents.length > 0) {
    model.inflowCategories.push({
      id: generateId("cat"),
      name: "Scenario Events (Income)",
      type: "custom",
      monthlyBaseline: 0,
      growthRate: 0,
      isActive: true,
      adjustments: overrides.additionalInflowEvents.map((e) => ({
        id: generateId("adj"),
        month: e.month,
        type: "one_off" as const,
        amount: e.amount,
        description: e.description,
      })),
    });
  }

  return model;
}
