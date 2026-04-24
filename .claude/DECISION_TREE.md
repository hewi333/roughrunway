# DECISION_TREE — "I want to… → read X"

Find your intent below, then jump. Don't explore.

## "I want to add / modify…"

- **…an API endpoint that calls Perplexity** → `.claude/entry/add-route.md` → `app/api/ai/parse-setup/route.ts` (canonical example)
- **…an API endpoint for external agents** → `.claude/entry/add-route.md` → `app/api/agent/encode/route.ts` (zero-latency) or `app/api/agent/build/route.ts` (AI)
- **…a page** → `app/<segment>/page.tsx` + link from `components/Header.tsx`
- **…a UI component** → `.claude/entry/add-feature.md` → `components/{domain}/<Name>.tsx`
- **…a field on the model** → `lib/types.ts` → `lib/constants.ts` → `lib/projection-engine.ts` → `app/schema/model.json` → `tests/projection-engine.test.ts`
- **…a scenario template** → `lib/constants.ts` (`SCENARIO_TEMPLATES`)
- **…a scenario override type** → `.claude/entry/add-scenario.md`
- **…a preset burn or inflow category** → `lib/constants.ts` (`PRESET_BURN_CATEGORIES` / `PRESET_INFLOW_CATEGORIES`) + AI prompts in `app/api/ai/parse-setup/route.ts` and `app/api/agent/build/route.ts`
- **…a projection rule / change the math** → `.claude/entry/edit-engine.md` → `lib/projection-engine.ts`
- **…an agent skill** → `skills/<name>/SKILL.md` (top-level dir — not `.claude/skills/`)
- **…an MCP tool** → `mcp/src/index.ts` → `cd mcp && npm run build`

## "I want to fix a bug"

→ `.claude/entry/fix-bug.md`. Reproduce with a vitest case first (`tests/projection-engine.test.ts` for engine bugs), then fix.

## "I want to understand…"

- **…how runway is calculated** → `lib/projection-engine.ts` + `docs/05-PROJECTION-ENGINE.md`
- **…the data model** → `lib/types.ts` (source of truth) + `docs/02-DATA-MODEL.md`
- **…scenario overrides** → `lib/scenario-engine.ts` + `lib/types.ts` (`ScenarioOverrides`)
- **…URL share encoding** → `lib/model-export.ts`
- **…how AI setup parses natural language** → `app/api/ai/parse-setup/route.ts` + `lib/json-schemas.ts`
- **…the overall architecture** → `docs/03-ARCHITECTURE.md`
- **…design tokens / colors** → `tailwind.config.ts` + `lib/constants.ts` (`SCENARIO_COLORS`)

## "I want to query the codebase"

- **What endpoints exist?** → `cat .claude/metadata/routes.json | jq '.routes[].path'`
- **What components exist?** → `cat .claude/metadata/components.json | jq '.components[].name'`
- **Where is function X defined?** → `jq '.functions[] | select(.name==\"X\")' .claude/metadata/functions.json`
- **Project stats** → `cat .claude/metadata/summary.json`

## "I want to ship changes"

1. `npm run typecheck`
2. `npm run lint`
3. `npm run test:unit`
4. For UI: `npm run dev` + manual check, `npm run test:e2e`
5. `npm run build`
6. Commit (Conventional — see `.claude/rules/commit-conventions.md`)
7. Push to `claude/<slug>` — never `main`

## "Nothing above fits my task"

Open `CLAUDE.md` and read the Task Routing table top to bottom. If still stuck, it's a new task type — add a row to that table once you've figured it out.
