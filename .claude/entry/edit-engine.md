# Entry: Edit the Projection Engine

High-risk area. A bug here silently miscalculates every user's runway. Tread carefully.

## Quick Navigation

| What you're changing | File |
|---|---|
| Monthly projection math | `lib/projection-engine.ts` |
| Burn / inflow computation | `lib/projection-engine.ts` → `getMonthlyBurn`, `getMonthlyInflow` |
| Liquidation ordering / amount | `lib/projection-engine.ts` → liquidation loop |
| Runway summary computation | `lib/projection-engine.ts` → `RunwaySummary` assembly |
| Scenario overrides | `lib/scenario-engine.ts` → `applyScenarioOverrides` |
| Share-URL encoding | `lib/model-export.ts` |
| Engine invariants / pitfalls | `.claude/rules/engine-patterns.md` |

## Workflow (non-negotiable)

1. **Write a failing vitest case first** in `tests/projection-engine.test.ts`. Name the expected behavior.
2. Make the minimum change to `lib/projection-engine.ts` (or `scenario-engine.ts`).
3. `npm run test:unit` — **all existing tests must stay green**. If one breaks, you've changed a behavior the product depends on — stop and ask.
4. `npm run typecheck`.
5. Run `npm run verify:engine` if it's a math change (Python check script).
6. `npm run dev`, open `/dashboard`, eyeball the chart + summary cards with a realistic model.

## Hard invariants (do not violate)

- **Pure functions only.** No `fetch`, no `Date.now()`, no randomness, no mutation of input `model`. Use `structuredClone` (already in place for volatile assets).
- **Deterministic.** Same input → same output, always. Tests depend on this.
- **No side effects.** No `console.log` (except `.error` in *routes*, never in engine).
- **Monotonic month loop.** `M` runs 1..`projectionMonths`. Don't skip or reorder.
- **Hard vs Extended runway.** `extendedRunwayEnabled=false` must short-circuit liquidation entirely — `extendedBalance` tracks separately from `hardBalance`.
- **`hardRunwayMonths: null` means "not depleted in horizon".** Don't change this sentinel.
- **`projectionMonths ∈ {12, 15, 18}`.** Enforced by types.

## Liquidation rules (easy to get wrong)

- Assets sort by `liquidationPriority` ascending. Lower = sold first.
- `maxSellUnit: "tokens"` → sell up to `maxSellPerMonth` tokens.
- `maxSellUnit: "percent_of_volume"` → sell up to `percentOfVolume * dailyVolume * tradingDays` (check code for exact days).
- Proceeds = `tokensSold * pricePerToken * (1 - haircutPercent/100)`.
- Price follows `priceAssumption`: `constant`, `monthly_decline`, or `custom_schedule`.

## Don't Forget

- Update `docs/05-PROJECTION-ENGINE.md` if you change semantics.
- If you add a field to `MonthlyProjection`, update `types.ts`, anywhere in UI that shows it (`MonthlyBreakdownTable.tsx`, `ProjectionChart.tsx`), and any tests.
- `ScenarioOverrides` mutation happens in `applyScenarioOverrides` — it returns a *new* model; never mutate.
- Scenario overrides reference IDs from the **base model**. A scenario that references a deleted category becomes a no-op. Don't throw — just skip.

## Deeper Docs

- `.claude/rules/engine-patterns.md` — canonical patterns + common pitfalls
- `docs/05-PROJECTION-ENGINE.md` — full math spec
- `tests/projection-engine.test.ts` — examples of every testable behavior
