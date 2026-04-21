# CryptoRunway — Projection Engine Specification

**Status**: v1.0 (final for hackathon MVP)
**Test fixtures**: 9 canonical examples at end of this doc

---

## Overview

The projection engine is the mathematical core of CryptoRunway. It is implemented as **pure functions** — no side effects, no API calls, no state mutations. Given a `CryptoRunwayModel`, it returns `{ projections: MonthlyProjection[]; summary: RunwaySummary }`.

**If the output of the engine doesn't match the 9 test fixtures at the end of this document, the implementation is wrong. Those fixtures are the spec.**

---

## Entry Point

```typescript
import type {
  CryptoRunwayModel,
  MonthlyProjection,
  RunwaySummary,
  Scenario,
} from "./types";

export function computeProjection(model: CryptoRunwayModel): {
  projections: MonthlyProjection[];
  summary: RunwaySummary;
}

export function computeScenarioProjection(
  baseline: CryptoRunwayModel,
  scenario: Scenario
): { projections: MonthlyProjection[]; summary: RunwaySummary }
```

---

## Algorithm

### Step 0: Initialize State

```typescript
// Hard assets (stables + fiat)
let stablecoinBalance = sum(model.treasury.stablecoins, s => s.amount);
let fiatBalance = sum(model.treasury.fiat, f => f.amount);

const stablecoinInitial = stablecoinBalance;
const fiatInitial = fiatBalance;

// Volatile assets — deep clone so we can mutate quantity during simulation.
// Sort by liquidationPriority ascending (lower = sold first).
const assets: VolatileAsset[] = structuredClone(model.treasury.volatileAssets)
  .sort((a, b) => a.liquidationPriority - b.liquidationPriority);

// Tracking across months
let cumulativeFundingGap = 0;
let hardRunwayMonth: number | null = null;
let extendedRunwayMonth: number | null = null;
let monthsLiquidityConstrained = 0;

const projections: MonthlyProjection[] = [];
```

### Main loop: Steps 1-8 for each month M = 1 to projectionMonths

---

### Step 1: Vesting — add newly vested quantity FIRST

Vesting happens at the start of the month so those tokens are available for sale.

```typescript
for (const asset of assets) {
  if (!asset.vestingSchedule) continue;
  for (const event of asset.vestingSchedule) {
    if (event.month === month) {
      asset.quantity += event.quantity;
    }
  }
}
```

### Step 2: Compute monthly burn

For each active burn category, apply: baseline → growth → most-recent baseline_change → one-offs.

```typescript
function getMonthlyBurn(category: BurnCategory, month: number): number {
  if (!category.isActive) return 0;

  // Find the most recent baseline_change at or before this month.
  const baselineChanges = category.adjustments
    .filter(a => a.type === "baseline_change" && a.month <= month)
    .sort((a, b) => b.month - a.month);

  let baseline: number;
  let growthStart: number;

  if (baselineChanges.length > 0) {
    baseline = baselineChanges[0].amount;
    growthStart = baselineChanges[0].month;
  } else {
    baseline = category.monthlyBaseline;
    growthStart = 1;
  }

  // Apply growth compounding from growthStart to month
  let amount = baseline;
  if (category.growthRate > 0) {
    amount = baseline * Math.pow(1 + category.growthRate, month - growthStart);
  }

  // Add one-offs for THIS specific month (can be negative)
  const oneOffs = category.adjustments
    .filter(a => a.type === "one_off" && a.month === month)
    .reduce((sum, a) => sum + a.amount, 0);

  return amount + oneOffs;
}

const totalBurn = model.burnCategories
  .reduce((sum, cat) => sum + getMonthlyBurn(cat, month), 0);
```

### Step 3: Compute monthly inflows

Same structure as burn.

```typescript
function getMonthlyInflow(category: InflowCategory, month: number): number {
  // Identical logic to getMonthlyBurn
}

const totalInflows = model.inflowCategories
  .reduce((sum, cat) => sum + getMonthlyInflow(cat, month), 0);
```

### Step 4: Net burn

```typescript
const netBurn = totalBurn - totalInflows;
// Positive = spending > earning (normal)
// Negative = profitable this month (treasury grows)
```

### Step 5: Draw from HARD assets only (stables → fiat)

```typescript
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

// Handle profitable month: negative remainingBurn = surplus to stables
if (netBurn < 0) {
  stablecoinBalance += Math.abs(netBurn);
  remainingBurn = 0;
}

const hardBalance = stablecoinBalance + fiatBalance;
if (hardBalance <= 0 && hardRunwayMonth === null) {
  hardRunwayMonth = month;
}
```

### Step 6: Liquidate volatile assets in priority order

Only if `extendedRunwayEnabled` is true and there's still deficit to cover.

```typescript
const liquidationDetails: LiquidationDetail[] = [];
let totalLiquidationProceeds = 0;

if (model.extendedRunwayEnabled && remainingBurn > 0) {
  for (const asset of assets) {
    if (remainingBurn <= 0) break;
    if (asset.quantity <= 0) continue;

    const priceThisMonth = computeAssetPrice(asset, month);
    const effectivePrice = priceThisMonth * (1 - asset.liquidity.haircutPercent / 100);
    if (effectivePrice <= 0) continue;

    // Max sellable THIS month
    let maxSellableTokens: number;
    if (asset.liquidity.maxSellUnit === "tokens") {
      maxSellableTokens = Math.min(
        asset.liquidity.maxSellPerMonth ?? Infinity,
        asset.quantity
      );
    } else {
      // percent_of_volume path
      const pct = asset.liquidity.percentOfVolume ?? 0;
      const vol = asset.liquidity.dailyVolume ?? 0;
      const dailyUSD = pct * vol;
      // Use raw price (not haircut) for the volume-denominated capacity
      const maxTokensFromVolume = priceThisMonth > 0
        ? (dailyUSD / priceThisMonth) * 30
        : 0;
      maxSellableTokens = Math.min(maxTokensFromVolume, asset.quantity);
    }

    // Tokens needed to cover remaining deficit
    const tokensNeeded = remainingBurn / effectivePrice;

    // Sell the min of need vs capacity
    const tokensToSell = Math.min(tokensNeeded, maxSellableTokens);
    const proceeds = tokensToSell * effectivePrice;

    asset.quantity -= tokensToSell;
    remainingBurn -= proceeds;
    totalLiquidationProceeds += proceeds;

    liquidationDetails.push({
      assetId: asset.id,
      assetName: asset.name,
      tokensSold: tokensToSell,
      proceeds,
      priceUsed: effectivePrice,
    });
  }
}
```

### Step 7: Track funding gap (unmet deficit)

```typescript
const unmetDeficitThisMonth = Math.max(0, remainingBurn);
cumulativeFundingGap += unmetDeficitThisMonth;
const liquidityConstrained = unmetDeficitThisMonth > 0;
if (liquidityConstrained) monthsLiquidityConstrained++;
```

### Step 8: Compute extended balance and record

```typescript
// Per-asset state at end of month
const volatileAssetStates: VolatileAssetMonthState[] = assets.map(a => {
  const priceThisMonth = computeAssetPrice(a, month);
  const effectivePrice = priceThisMonth * (1 - a.liquidity.haircutPercent / 100);
  return {
    assetId: a.id,
    assetName: a.name,
    quantity: a.quantity,
    priceThisMonth,
    effectivePrice,
    valueAtHaircut: a.quantity * effectivePrice,
  };
});

const totalVolatileValue = volatileAssetStates
  .reduce((sum, s) => sum + s.valueAtHaircut, 0);

// Extended balance: hard + remaining volatile value (at haircut) minus cumulative gap
const extendedBalance = hardBalance + totalVolatileValue - cumulativeFundingGap;

if (extendedBalance <= 0 && extendedRunwayMonth === null) {
  extendedRunwayMonth = month;
}

projections.push({
  month,
  label: formatMonthLabel(model.startDate, month),
  date: computeMonthDate(model.startDate, month),

  stablecoinBalance,
  fiatBalance,
  hardBalance,

  volatileAssetStates,
  totalVolatileValue,

  totalBurn,
  totalInflows,
  netBurn,

  liquidationDetails,
  totalLiquidationProceeds,

  unmetDeficitThisMonth,
  cumulativeFundingGap,

  extendedBalance,

  hardRunwayDepleted: hardBalance <= 0,
  extendedRunwayDepleted: extendedBalance <= 0,
  liquidityConstrained,
});
```

---

### After the loop: Build summary

```typescript
// Average net burn across pre-depletion months (or whole horizon if never depleted)
const preDepletion = hardRunwayMonth
  ? projections.slice(0, hardRunwayMonth)
  : projections;
const monthlyNetBurnAverage = preDepletion.length > 0
  ? preDepletion.reduce((sum, p) => sum + p.netBurn, 0) / preDepletion.length
  : 0;

// Current treasury (snapshot of what the user put in, at spot and at haircut)
const currentTreasuryUSD =
  stablecoinInitial +
  fiatInitial +
  sum(model.treasury.volatileAssets, a => a.quantity * a.currentPrice);

const realisticTreasuryUSD =
  stablecoinInitial +
  fiatInitial +
  sum(model.treasury.volatileAssets,
      a => a.quantity * a.currentPrice * (1 - a.liquidity.haircutPercent / 100));

const summary: RunwaySummary = {
  hardRunwayMonths: hardRunwayMonth,
  hardRunwayDate: hardRunwayMonth
    ? computeMonthDate(model.startDate, hardRunwayMonth)
    : null,
  extendedRunwayMonths: extendedRunwayMonth,
  extendedRunwayDate: extendedRunwayMonth
    ? computeMonthDate(model.startDate, extendedRunwayMonth)
    : null,

  survivedHorizon: extendedRunwayMonth === null,
  totalFundingGap: cumulativeFundingGap,
  monthsLiquidityConstrained,

  monthlyNetBurnAverage,
  currentTreasuryUSD,
  realisticTreasuryUSD,
};

return { projections, summary };
```

---

## Helper: `computeAssetPrice`

```typescript
function computeAssetPrice(asset: VolatileAsset, month: number): number {
  switch (asset.liquidity.priceAssumption) {
    case "constant":
      return asset.currentPrice;
    case "monthly_decline": {
      const rate = asset.liquidity.monthlyDeclineRate ?? 0;
      return asset.currentPrice * Math.pow(1 - rate, month - 1);
    }
    case "custom_schedule": {
      const scheduled = asset.liquidity.customPriceSchedule?.find(s => s.month === month);
      return scheduled?.price ?? asset.currentPrice;
    }
  }
}
```

---

## Scenario Overrides

```typescript
export function applyScenarioOverrides(
  baseline: CryptoRunwayModel,
  overrides: ScenarioOverrides
): CryptoRunwayModel {
  const model = structuredClone(baseline);

  // Price overrides (per asset or "all")
  if (overrides.priceOverrides) {
    for (const po of overrides.priceOverrides) {
      const targets = po.assetId === "all"
        ? model.treasury.volatileAssets
        : model.treasury.volatileAssets.filter(a =>
            a.id === po.assetId || a.tier === po.assetId // "native"/"major"/"alt" as shortcut
          );
      for (const asset of targets) {
        if (po.type === "absolute") {
          asset.currentPrice = po.value;
        } else {
          asset.currentPrice *= (1 + po.value);
        }
      }
    }
  }

  // Liquidity overrides
  if (overrides.liquidityOverrides) {
    for (const lo of overrides.liquidityOverrides) {
      const targets = lo.assetId === "all"
        ? model.treasury.volatileAssets
        : model.treasury.volatileAssets.filter(a =>
            a.id === lo.assetId || a.tier === lo.assetId
          );
      for (const asset of targets) {
        if (lo.haircutPercent !== undefined) {
          asset.liquidity.haircutPercent = lo.haircutPercent;
        }
        if (lo.haircutPercentChange !== undefined) {
          asset.liquidity.haircutPercent =
            Math.max(0, Math.min(100, asset.liquidity.haircutPercent + lo.haircutPercentChange));
        }
        if (lo.maxSellPerMonth !== undefined && asset.liquidity.maxSellUnit === "tokens") {
          asset.liquidity.maxSellPerMonth = lo.maxSellPerMonth;
        }
        if (lo.maxSellMultiplier !== undefined) {
          if (asset.liquidity.maxSellUnit === "tokens" && asset.liquidity.maxSellPerMonth !== undefined) {
            asset.liquidity.maxSellPerMonth *= lo.maxSellMultiplier;
          } else if (asset.liquidity.maxSellUnit === "percent_of_volume" && asset.liquidity.percentOfVolume !== undefined) {
            asset.liquidity.percentOfVolume *= lo.maxSellMultiplier;
          }
        }
      }
    }
  }

  // Priority overrides
  if (overrides.priorityOverrides) {
    for (const po of overrides.priorityOverrides) {
      const asset = model.treasury.volatileAssets.find(a => a.id === po.assetId);
      if (asset) asset.liquidationPriority = po.newPriority;
    }
  }

  // Burn overrides
  if (overrides.burnOverrides) {
    for (const bo of overrides.burnOverrides) {
      const cat = model.burnCategories.find(
        c => c.id === bo.categoryId || c.presetKey === bo.categoryId
      );
      if (!cat) continue;
      if (bo.type === "disable") {
        cat.isActive = false;
      } else if (bo.type === "percent_change") {
        cat.monthlyBaseline *= (1 + (bo.value ?? 0));
      } else if (bo.type === "absolute") {
        cat.monthlyBaseline = bo.value ?? 0;
      }
    }
  }

  // Inflow overrides (same pattern)
  if (overrides.inflowOverrides) {
    for (const io of overrides.inflowOverrides) {
      const cat = model.inflowCategories.find(
        c => c.id === io.categoryId || c.presetKey === io.categoryId
      );
      if (!cat) continue;
      if (io.type === "disable") {
        cat.isActive = false;
      } else if (io.type === "percent_change") {
        cat.monthlyBaseline *= (1 + (io.value ?? 0));
      } else if (io.type === "absolute") {
        cat.monthlyBaseline = io.value ?? 0;
      }
    }
  }

  // Headcount shortcut → baseline_change on headcount category
  if (overrides.headcountChange) {
    const hc = model.burnCategories.find(c => c.presetKey === "headcount");
    if (hc) {
      const addlCost = overrides.headcountChange.count * overrides.headcountChange.costPerHead;
      hc.adjustments.push({
        id: `scenario-hc-${Date.now()}-${Math.random()}`,
        month: overrides.headcountChange.startMonth,
        type: "baseline_change",
        amount: hc.monthlyBaseline + addlCost,
        description: `Scenario: ${overrides.headcountChange.count > 0 ? "+" : ""}${overrides.headcountChange.count} headcount`,
      });
    }
  }

  // One-off burn events → injected as a synthetic category
  if (overrides.additionalBurnEvents && overrides.additionalBurnEvents.length > 0) {
    model.burnCategories.push({
      id: "scenario-burn-events",
      name: "Scenario Events (Expenses)",
      type: "custom",
      monthlyBaseline: 0,
      growthRate: 0,
      isActive: true,
      adjustments: overrides.additionalBurnEvents.map((e, i) => ({
        id: `scenario-be-${i}`,
        month: e.month,
        type: "one_off",
        amount: e.amount,
        description: e.description,
      })),
    });
  }

  // One-off inflow events → same pattern
  if (overrides.additionalInflowEvents && overrides.additionalInflowEvents.length > 0) {
    model.inflowCategories.push({
      id: "scenario-inflow-events",
      name: "Scenario Events (Income)",
      type: "custom",
      monthlyBaseline: 0,
      growthRate: 0,
      isActive: true,
      adjustments: overrides.additionalInflowEvents.map((e, i) => ({
        id: `scenario-ie-${i}`,
        month: e.month,
        type: "one_off",
        amount: e.amount,
        description: e.description,
      })),
    });
  }

  return model;
}
```

---

## Utility Functions

```typescript
function sum<T>(arr: T[], fn: (item: T) => number): number {
  return arr.reduce((acc, item) => acc + fn(item), 0);
}

// "2026-05" + offset 1 → "May 2026"
function formatMonthLabel(startDate: string, offset: number): string {
  const [year, mon] = startDate.split("-").map(Number);
  const d = new Date(year, mon - 1 + offset - 1);
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

// "2026-05" + offset 3 → "2026-07"
function computeMonthDate(startDate: string, offset: number): string {
  const [year, mon] = startDate.split("-").map(Number);
  const d = new Date(year, mon - 1 + offset - 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}
```

---

## Edge Cases

1. **Zero burn** → both runways null (infinite). UI shows "∞".
2. **Net positive** → treasury grows. Surplus added to stables. Both runways null.
3. **No volatile assets** → Extended depletes same month as Hard.
4. **`extendedRunwayEnabled = false`** → step 6 skipped; Extended = Hard.
5. **Vesting outside horizon** → ignored (events with `month > projectionMonths` never fire).
6. **All categories inactive** → zero burn/inflow.
7. **Negative one-offs** → reduce burn that month (refund/credit). Works naturally since we sum.
8. **Multiple baseline_changes** → only most recent (by month) at or before current month applies.
9. **Growth + baseline_change** → growth compounds from the baseline_change month forward, not month 1.
10. **Fractional months** → depletion month recorded as the first month where balance ≤ 0. No mid-month interpolation in v1.

---

# Test Fixtures (the 9 canonical examples)

**These are the spec.** The implementation must produce these exact outputs.

For all fixtures: `startDate = "2026-05"`, `projectionMonths = 18`, `extendedRunwayEnabled = true`. No vesting unless stated.

### Fixture 1 — Pure cash baseline
**Input**: $1.2M stables, $100K/mo burn, no inflows, no volatile assets.
**Expected**: `hardRunwayMonth = 12`, `extendedRunwayMonth = 12`.
**Logic**: $1.2M / $100K = 12.

### Fixture 2 — Stables + fiat mix
**Input**: $800K stables + $400K fiat, $100K/mo burn.
**Expected**: `hardRunwayMonth = 12`, `extendedRunwayMonth = 12`.
**Logic**: $1.2M total / $100K = 12. Both assets are "hard" by D1.

### Fixture 3 — Inflows reduce net burn
**Input**: $600K stables, $100K/mo burn, $20K/mo staking inflow.
**Expected**: `hardRunwayMonth = 8`, `extendedRunwayMonth = 8`.
**Logic**: Net burn $80K/mo. $600K / $80K = 7.5 → crosses zero in month 8.

### Fixture 4 — Liquid native token extends runway with strain
**Input**: $500K stables + 10M NATIVE @ $0.20 (haircut 10%, max 200K tokens/mo, priority 50). Burn $150K/mo, no inflows.
**Expected**: `hardRunwayMonth = 4`, `extendedRunwayMonth = null` (survives 18mo with strain), `monthsLiquidityConstrained ≥ 14`, `totalFundingGap ≈ $1.7M`.
**Logic**: Stables last ~3.33 months → depletes month 4. After that: need $150K/mo, but effective price = $0.18, 200K cap → $36K proceeds/mo, $114K gap/mo. Token value at haircut = $1.8M. Org survives horizon but accumulates ~$1.71M gap (15 × $114K).

### Fixture 5 — Illiquid native token (liquidity bottleneck)
**Input**: Same as Fixture 4 but max 50K tokens/mo.
**Expected**: `hardRunwayMonth = 4`, `extendedRunwayMonth = null`, `totalFundingGap ≈ $2.1M` (15 × $141K).
**Logic**: $9K/mo proceeds vs $150K/mo need. Gap grows faster. Still survives horizon (token value $1.8M > accumulated gap for first ~12 months), but breaches around month 14-15.

**Note**: this is the product's hero example — shows why "tokens × spot price" is a lie.

### Fixture 6 — Multi-asset priority (ETH first, then native)
**Input**: $300K stables + 100 ETH @ $3000 (haircut 2%, max 100/mo, priority 10) + 5M NATIVE @ $0.10 (haircut 15%, max 25K/mo, priority 50). Burn $200K/mo.
**Expected**: `hardRunwayMonth = 2`. ETH fully sold by ~month 3. After ETH exhausted, native covers only ~$2.1K/mo. Heavy funding gap from month 4 onward.
**Logic**: Month 1: $200K from stables, $100K left. Month 2: $100K stables + ~34 ETH @ $2940 = $99.96K + remainder from ETH. Month 3: remaining ETH sells, very limited native. Month 4+: only native, severely capped.

### Fixture 7 — Declining token price (bear market)
**Input**: $200K stables + 10M NATIVE @ $0.20 (haircut 10%, max 500K/mo, **decline 5%/mo compound**). Burn $100K/mo.
**Expected**: `hardRunwayMonth = 2`. Extended survives 18 months but total funding gap grows substantially. Month 18 effective price ≈ $0.20 × 0.95^17 × 0.9 ≈ $0.073.
**Logic**: Price erodes every month, so even generous liquidity cap can't keep up in later months.

### Fixture 8 — One-off expense event
**Input**: $1M stables, $80K/mo baseline burn, +$200K one-off in month 4.
**Expected**: `hardRunwayMonth = 10`.
**Logic**: Through month 3: $760K left. Month 4: $760K − $80K − $200K = $480K. Months 5-10: $480K / $80K = 6 → depletes month 10.

### Fixture 9 — Profitable org (infinite runway)
**Input**: $500K stables, $80K/mo burn, $100K/mo inflows.
**Expected**: `hardRunwayMonth = null`, `extendedRunwayMonth = null`. UI displays "∞". Treasury grows by $20K/mo.

---

## Reference Verifier

The Python script `scripts/verify-engine.py` (included in the repo) runs all 9 fixtures against a reference implementation of the engine. Run after any engine change:

```bash
python3 scripts/verify-engine.py
```

The TypeScript engine's test suite (`tests/projection-engine.test.ts`) encodes the same fixtures. CI runs them on every commit.
