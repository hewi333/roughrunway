# Engine Patterns

Rules for `lib/projection-engine.ts`, `lib/scenario-engine.ts`, and related pure functions.

## The cardinal rule

**Engines are pure.** Given the same input, they return the same output, always. No side effects. This is non-negotiable:

- No `fetch`, no network.
- No `Date.now()`, no `Math.random()`. Pass any temporal or stochastic value as an argument.
- No `console.log` / `console.error` in engine code. Logging belongs in routes and UI.
- No mutation of inputs. Use `structuredClone` where an iterable copy is needed (pattern already in place for volatile assets).
- No I/O. No localStorage, no sessionStorage, no DOM access.

## Shape

```ts
// Primary entry point
computeProjection(model: RoughRunwayModel): {
  projections: MonthlyProjection[];
  summary: RunwaySummary;
}
```

- `projections` has exactly `model.projectionMonths` entries (12, 15, or 18).
- `summary` aggregates the series into headline numbers for the UI.
- `projections[0]` is month 1 (one-indexed internally — see the loop `M = 1 .. projectionMonths`).

## Invariants

- **Hard vs extended runway**: `hardBalance` tracks stables+fiat only. `extendedBalance` tracks `hardBalance + liquidation proceeds`. If `extendedRunwayEnabled === false`, liquidation short-circuits entirely and `extendedBalance === hardBalance`.
- **Runway sentinel**: `hardRunwayMonths: null` (and the `Date` variant) means runway was not depleted within the horizon. Don't change this sentinel.
- **Liquidation order**: assets sort by `liquidationPriority` ascending. Lower = sold first.
- **Haircut**: proceeds are always discounted by `haircutPercent`: `proceeds = tokensSold * price * (1 - haircutPercent / 100)`.
- **`liquidityConstrained`**: true in months where we wanted to sell more but couldn't due to the liquidity cap. Surfaced via `summary.liquidityConstrainedMonths`.
- **Unmet deficit**: carried forward as `cumulativeUnmetDeficit`; per-month as `unmetDeficitThisMonth`.

## Scenario engine

```ts
applyScenarioOverrides(model: RoughRunwayModel, scenario: Scenario): RoughRunwayModel
```

- Returns a **new** model. Input untouched.
- Overrides reference IDs from the base model. If an ID doesn't resolve (e.g. the category was deleted), **silently skip** that override — do not throw.
- Order of application inside `applyScenarioOverrides` matters for compound overrides — see the existing implementation; don't reorder casually.
- `headcountChange` adds a synthetic burn category; it does not mutate an existing one.

## Testing

- Every non-trivial change gets a new case in `tests/projection-engine.test.ts`.
- Use minimal fixtures — a model with one asset, one burn category, no inflows is usually enough to isolate a behavior.
- Assert on exact numbers where possible. Use `toBeCloseTo` only for computed float values that can drift.
- Keep existing tests green. A breaking test is a signal — don't "fix" it by adjusting the expectation without understanding why it moved.

## Common pitfalls

- Reading `model.extendedRunwayEnabled` with `!==` instead of `===` — the default is `true`, so `!== false` is the safe check.
- Forgetting `structuredClone` and mutating an asset's `quantity` in place — breaks re-computes.
- Adding a new branch to the liquidation loop without handling `maxSellUnit: "percent_of_volume"` (which needs `dailyVolume` + `percentOfVolume`, both possibly undefined).
- Applying price overrides *after* the projection loop starts — they must be applied before (in `applyScenarioOverrides`, before `computeProjection`).
- Reading `Date.now()` to derive `startDate` — `startDate` lives on the model; use it.

## Related

- `lib/projection-engine.ts` — source
- `lib/scenario-engine.ts` — source
- `tests/projection-engine.test.ts` — every behavior has a test
- `docs/05-PROJECTION-ENGINE.md` — full math spec
- `.claude/entry/edit-engine.md` — workflow
