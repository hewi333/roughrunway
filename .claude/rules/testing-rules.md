# Testing Rules

Two test runners: **vitest** for unit, **playwright** for e2e.

## Commands

| Purpose | Command |
|---|---|
| Unit tests | `npm run test:unit` |
| Unit watch | `npm run test:watch` |
| E2E | `npm run test:e2e` |
| Both | `npm run test` |

## Where tests live

| Code area | Test file |
|---|---|
| `lib/projection-engine.ts` | `tests/projection-engine.test.ts` |
| `lib/scenario-engine.ts` | covered in `tests/projection-engine.test.ts` (shared fixtures) |
| `lib/model-export.ts` | `tests/export-import.test.ts` |
| UI flows | `e2e-tests/*.test.ts` (Playwright) |
| New lib module `lib/<x>.ts` | `tests/<x>.test.ts` |

## Unit test patterns

```ts
import { describe, it, expect } from "vitest";
import { computeProjection } from "@/lib/projection-engine";
import type { RoughRunwayModel } from "@/lib/types";

const baseModel: RoughRunwayModel = { /* minimal */ };

describe("computeProjection", () => {
  it("tracks hardBalance when only stables exist", () => {
    const { projections, summary } = computeProjection(baseModel);
    expect(projections).toHaveLength(baseModel.projectionMonths);
    expect(projections[0]?.hardBalance).toBeCloseTo(1_000_000, 2);
    expect(summary.hardRunwayMonths).toBe(5);
  });
});
```

- Prefer minimal fixtures over loading the default model. Smaller = easier to reason about failures.
- Use `toBe` for integers / sentinels, `toBeCloseTo` for computed floats.
- One behavior per `it`. Fat tests hide failures.

## E2E test patterns

- Run the dev server via Playwright's `webServer` config (`playwright.config.ts`).
- Use role-based selectors: `page.getByRole("button", { name: "Share" })`.
- Avoid `waitForTimeout` — use `waitForSelector` / `expect.toBeVisible`.
- AI-dependent paths (`parse-setup`, `parse-scenario`) should be **skipped** or **mocked** in e2e — don't hit Perplexity from CI.

## When to add which

| Change | Minimum tests |
|---|---|
| Projection math / liquidation / unmet deficit | Vitest unit — non-negotiable |
| New scenario override type | Vitest unit covering the new override |
| Import/export format | Round-trip test in `tests/export-import.test.ts` |
| New page or dialog | Playwright smoke test (load page, click primary action) |
| New API route | Manual `curl`; optional vitest if logic non-trivial (schema validation etc.) |
| shadcn primitive | None required — TypeScript is the test |

## Common pitfalls

- Tests that read `Date.now()` — make fixtures deterministic by injecting dates as strings.
- Using the default model from `lib/store.ts` for tests — it has `uuidv4()` IDs that drift. Build explicit fixtures.
- Flaky e2e from missing hydration waits. Prefer `waitForLoadState("networkidle")` after page.goto, then assert.
- Running `npm run test:e2e` without `playwright install` — CI handles this via `npx playwright install --with-deps`; locally you may need to run it once.

## Related

- `.claude/rules/engine-patterns.md`
- `vitest.config.ts` — unit config
- `playwright.config.ts` — e2e config
