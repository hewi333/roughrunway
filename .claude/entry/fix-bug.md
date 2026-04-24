# Entry: Fix a Bug

## Quick Navigation

| Bug is in… | Start here |
|---|---|
| Runway numbers are wrong | `lib/projection-engine.ts` + `tests/projection-engine.test.ts` |
| Scenario comparison misbehaves | `lib/scenario-engine.ts` + `components/ScenarioComparison.tsx` |
| Import/Export / share link broken | `lib/model-export.ts` + `tests/export-import.test.ts` + `components/{ImportDialog,ExportDialog}.tsx` |
| AI route returns junk | `app/api/ai/<name>/route.ts` + `lib/json-schemas.ts` |
| Agent route broken | `app/api/agent/<name>/route.ts` |
| UI panel is wrong | `components/<Panel>.tsx` (top-level) or `components/{domain}/<X>.tsx` |
| Chart rendering | `components/ProjectionChart.tsx` or `components/ScenarioProjectionChart.tsx` |
| State persistence / localStorage | `lib/store.ts` |
| Dark mode toggle issue | `components/DarkModeToggle.tsx` + `tailwind.config.ts` |
| Dashboard layout | `app/dashboard/page.tsx` + `components/AppShell.tsx` |

## Workflow

1. **Reproduce**. For engine bugs, write a failing vitest case in `tests/projection-engine.test.ts`. For UI bugs, `npm run dev` and reproduce in the browser.
2. **Locate**. Use `jq` on `.claude/metadata/functions.json` if you don't know where a function lives:
   ```bash
   jq '.functions[] | select(.name | test("X"; "i"))' .claude/metadata/functions.json
   ```
3. **Fix**. Minimum change. Don't refactor surrounding code — see root `CLAUDE.md` conventions.
4. **Verify**: `npm run test:unit` (engine) / `npm run test:e2e` (UI flows) / manual `npm run dev`.
5. **Type + lint**: `npm run typecheck && npm run lint`.

## Don't Forget

- Projection/scenario engines are **pure**. If a bug needs "current date", pass it in — don't read `Date.now()` inside the engine.
- A bug in `applyScenarioOverrides` will manifest as wrong numbers in every scenario. Check both the override builder and the application step.
- The two AI setup paths (`/api/ai/parse-setup` and `/api/agent/build`) share the **same system prompt**. Fix both.
- `structuredClone` on volatile assets — if you touch that block, don't remove the clone.
- If the engine returns `hardRunwayMonths: null`, it means runway exceeds projection horizon. Not a bug.

## Deeper Docs

- `.claude/rules/engine-patterns.md` — engine invariants
- `.claude/rules/testing-rules.md` — how to structure a regression test
- `docs/05-PROJECTION-ENGINE.md` — full math spec
