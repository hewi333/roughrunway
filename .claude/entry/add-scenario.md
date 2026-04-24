# Entry: Add a Scenario Template or Override Type

## Quick Navigation

| What you want | Files |
|---|---|
| Add a one-click scenario template | `lib/constants.ts` → `SCENARIO_TEMPLATES` |
| Add a new override *type* (new kind of override) | `lib/types.ts` → `ScenarioOverrides` → `lib/scenario-engine.ts` → `components/ScenarioEditor.tsx` |
| Add a color | `lib/constants.ts` → `SCENARIO_COLORS` (retro Swiss aviation palette) |
| Show the scenario in comparison | `components/ScenarioComparison.tsx` (already generic — usually no change needed) |
| Show on chart | `components/ScenarioProjectionChart.tsx` (already generic) |

## Workflow — New Template

1. Add an entry to `SCENARIO_TEMPLATES` in `lib/constants.ts`:
   ```ts
   {
     key: "my_scenario",
     name: "My Scenario",
     description: "One-line human description",
     color: "#...", // pick from SCENARIO_COLORS or add one
     buildOverrides: (model) => { /* return a ScenarioOverrides */ },
   }
   ```
2. `buildOverrides` receives the **base** model and returns a `ScenarioOverrides` object. Reference existing IDs (`model.burnCategories[i].id`, `model.treasury.volatileAssets[i].id`).
3. Gracefully handle missing referents — `find(...)` can return undefined; skip that override if so.
4. Add a test to `tests/projection-engine.test.ts` that applies the scenario and checks expected impact.
5. `npm run test:unit`.

## Workflow — New Override Type

Higher-risk. Every override flows through `applyScenarioOverrides`.

1. Add the type to `ScenarioOverrides` in `lib/types.ts`.
2. Add the application logic in `lib/scenario-engine.ts` — it must return a *new* model, never mutate input.
3. Add UI affordance in `components/ScenarioEditor.tsx`.
4. Write failing tests in `tests/projection-engine.test.ts` before the code.
5. `npm run test:unit && npm run typecheck`.
6. Update `docs/02-DATA-MODEL.md` and `app/schema/scenario.json`.

## Don't Forget

- Scenario overrides reference base-model IDs. A deleted target → silently skip (don't throw).
- `headcountChange` is the only non-override-by-ID override. It adds headcount burn for `count * costPerHead` starting at `startMonth`.
- Negative values in `percent_change` mean reduction (`-0.3` = -30%).
- Colors should respect the design system — see `docs/DESIGN-IMPLEMENTATION.md` §6.

## Deeper Docs

- `.claude/rules/engine-patterns.md`
- `lib/scenario-engine.ts` — small file, read it in full
- `lib/constants.ts` → `SCENARIO_TEMPLATES` — existing examples to copy
