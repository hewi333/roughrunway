# SKILL: Construct a Scenario from a Question

**Purpose**: Turn a natural-language "what if" question into a `ScenarioOverrides` JSON object that layers on top of the baseline model without mutating it.

**When to use**: A user asks a hypothetical ("what if token drops 40%", "what if we cut 3 engineers", "what if we land a $500K grant in month 4") and you need to produce structured overrides the app can apply.

---

## The core principle

A scenario is a **diff** against the baseline. It only contains fields the user wants to change — everything unspecified inherits from the baseline. Never restate the full model.

---

## Shape of `ScenarioOverrides`

See `/schema/scenario.json` for the full schema. Top-level fields (all optional):

```typescript
{
  priceOverrides?: [{ assetId, type: "absolute" | "percent_change", value }]
  burnOverrides?: [{ categoryId, type, value?, startMonth? }]
  inflowOverrides?: [{ categoryId, type, value?, startMonth? }]
  liquidityOverrides?: [{ assetId, haircutPercent?, maxSellPerMonth? }]
  additionalBurnEvents?: [{ month, amount, description }]
  additionalInflowEvents?: [{ month, amount, description }]
  headcountChange?: { count, costPerHead, startMonth }
}
```

### Field-by-field cheatsheet

| Intent | Use |
|---|---|
| "Token drops 40%" | `priceOverrides: [{ assetId: "all_volatile", type: "percent_change", value: -0.4 }]` |
| "Native token crashes to $0.05" | `priceOverrides: [{ assetId: "native", type: "absolute", value: 0.05 }]` |
| "Cut infrastructure 30%" | `burnOverrides: [{ categoryId: "infrastructure", type: "percent_change", value: -0.3 }]` |
| "Disable marketing spend" | `burnOverrides: [{ categoryId: "marketing", type: "disable" }]` |
| "Add 3 engineers at $15K/mo starting month 2" | `headcountChange: { count: 3, costPerHead: 15000, startMonth: 2 }` |
| "Fire 2 people next month" | `headcountChange: { count: -2, costPerHead: <avg>, startMonth: 2 }` |
| "$500K grant in month 4" | `additionalInflowEvents: [{ month: 4, amount: 500000, description: "..." }]` |
| "$150K legal bill in month 6" | `additionalBurnEvents: [{ month: 6, amount: 150000, description: "..." }]` |
| "Liquidity gets worse — 30% haircut on native token" | `liquidityOverrides: [{ assetId: "native", haircutPercent: 30 }]` |

---

## Rules

- **Percent changes are decimals**: 40% drop → `-0.4`, 5% rise → `0.05`.
- **`startMonth` defaults to 1** (the first projection month) if omitted.
- **Asset IDs**: use the exact `id` from the baseline model's `treasury.volatileAssets`. Use `"all_volatile"` to apply an override to every volatile asset.
- **Category IDs**: use the exact `id` (or `presetKey` as fallback) from the baseline model's `burnCategories` / `inflowCategories`.
- **Do not invent categories or assets** that aren't in the baseline. If the user references something new ("add a new marketing line"), add it as `additionalBurnEvents` instead.
- **Compose multiple changes**: a scenario can combine price + headcount + one-off events. Put all of them in one `ScenarioOverrides` object.

---

## Example: "Bear market — token down 50%, revenue drops 30%, we lay off 2"

```json
{
  "priceOverrides": [
    { "assetId": "all_volatile", "type": "percent_change", "value": -0.5 }
  ],
  "inflowOverrides": [
    { "categoryId": "revenue", "type": "percent_change", "value": -0.3 }
  ],
  "headcountChange": {
    "count": -2,
    "costPerHead": 15000,
    "startMonth": 1
  }
}
```

---

## How scenarios appear in the app

The app computes the scenario by deep-cloning the baseline model, applying these overrides via `applyScenarioOverrides`, and running the same projection engine. The baseline is never touched. Up to 5 scenarios can be active simultaneously and compared side-by-side on the chart.

Once you hand the user a scenario JSON, they can paste it into the scenario editor's JSON tab, or an agent can POST it to the future scenario API route.
