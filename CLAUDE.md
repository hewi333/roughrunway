# CLAUDE.md — RoughRunway

> Single-page crypto treasury runway modeling tool. Next.js 14 App Router, TypeScript strict, no backend, no DB. State lives in Zustand + localStorage; models share via URL hash (lz-string). AI uses Perplexity Sonar.

**You are reading the switchboard.** Most tasks resolve from this file alone. If a task is listed in the routing table below, jump straight to the named files — no exploration needed.

---

## Commands

| Task | Command |
|---|---|
| Dev server (localhost:3000) | `npm run dev` |
| Build | `npm run build` |
| Unit tests (vitest) | `npm run test:unit` |
| E2E tests (playwright) | `npm run test:e2e` |
| All tests | `npm run test` |
| Watch unit tests | `npm run test:watch` |
| Type check | `npm run typecheck` |
| Lint | `npm run lint` |
| Verify projection engine | `npm run verify:engine` |
| Regenerate agent metadata | `npm run meta:generate` |
| Validate agent docs | `npm run meta:validate` |
| All metadata tasks | `npm run meta:all` |

Pre-commit minimum: `npm run typecheck && npm run test:unit`. CI also runs e2e + build.

---

## Task Routing

For each common task, this table names the files to touch and the exact command to verify. **One lookup, no guessing.**

| Task | Touch These Files | Test With |
|---|---|---|
| Add an AI route (`/api/ai/<x>`) | `app/api/ai/<x>/route.ts`; schema in `lib/json-schemas.ts`; client in `lib/perplexity-client.ts`. Existing: `parse-setup`, `parse-scenario`, `market-banner` (`/api/ai/market-banner`) | `curl localhost:3000/api/ai/<x>` + e2e |
| Add an agent route (`/api/agent/<x>`) | `app/api/agent/<x>/route.ts`; model helpers in `lib/model-export.ts` | `curl` + `npm run test:unit` |
| Add a page/route | `app/<segment>/page.tsx`; link from `components/Header.tsx` or `app/page.tsx` | open in `npm run dev`; add e2e in `e2e-tests/` |
| Add a UI primitive (shadcn) | `components/ui/<primitive>.tsx` | `npm run typecheck` |
| Add a domain component | `components/<domain>/<Name>.tsx` where domain ∈ {ai, burn, inflow, treasury, ui}; top-level panels go directly in `components/` | `npm run typecheck`; story in dashboard |
| Add a field to the model | `lib/types.ts` → `lib/constants.ts` (defaults) → `lib/projection-engine.ts` → `app/schema/model.json` → tests in `tests/projection-engine.test.ts` | `npm run test:unit && npm run typecheck` |
| Change projection math | `lib/projection-engine.ts` (pure; no side effects); add case to `tests/projection-engine.test.ts` | `npm run test:unit` — **must stay green** |
| Add a scenario override type | `lib/types.ts` (`ScenarioOverrides`) → `lib/scenario-engine.ts` (`applyScenarioOverrides`) → `components/ScenarioEditor.tsx` UI → `lib/constants.ts` if adding a template | `npm run test:unit` |
| Add a scenario template | `lib/constants.ts` → `SCENARIO_TEMPLATES`; color from `SCENARIO_COLORS` | `npm run test:unit` |
| Add a preset burn/inflow category | `lib/constants.ts` → `PRESET_BURN_CATEGORIES` or `PRESET_INFLOW_CATEGORIES`; AI prompt in `app/api/ai/parse-setup/route.ts` + `app/api/agent/build/route.ts` | `npm run test:unit` |
| Add a skill for AI agents | `skills/<skill-name>/SKILL.md` (top-level, not `.claude/skills/`) | manual — no automated test |
| Add MCP tool | `mcp/src/index.ts`; build with `cd mcp && npm run build` | manual via Claude Desktop |
| Update AI prompts | `app/api/ai/parse-setup/route.ts`, `app/api/ai/parse-scenario/route.ts`, `app/api/agent/build/route.ts`; JSON schemas in `lib/json-schemas.ts` | live test against `PERPLEXITY_API_KEY` |
| Change URL-share format | `lib/model-export.ts` (lz-string encode/decode); consumer in `app/dashboard/page.tsx` | `tests/export-import.test.ts` |
| Fix a bug | See `.claude/entry/fix-bug.md` | reproduce → test → fix → `npm run test:unit` |

---

## Architecture

| Layer | Technology | Hosting |
|---|---|---|
| Framework | Next.js 14 App Router + TypeScript strict | Vercel |
| State | Zustand + `persist` to localStorage | client-only |
| Projection engine | Pure TS functions, no I/O | runs in browser |
| Charts | Recharts | client |
| Styling | Tailwind CSS + shadcn/ui primitives | — |
| AI | Perplexity Sonar / Sonar Pro via `openai` SDK | server routes only |
| URL sharing | `lz-string` compresses model into `#model=<hash>` | no server round-trip |
| Persistence | localStorage only — **no backend, no DB** | — |
| CI | GitHub Actions: typecheck → test:unit → test:e2e → build | `.github/workflows/ci.yml` |
| MCP | Separate package in `mcp/` (excluded from Next.js tsconfig) | npm-published binary |

Import alias: `@/*` → repo root (e.g. `@/lib/types`, `@/components/ui/button`).

---

## Conventions

- **TypeScript strict**: no `any` in new code. Prefer discriminated unions over loose objects.
- **Pure functions in `lib/projection-engine.ts` and `lib/scenario-engine.ts`**: no side effects, no API calls, no state mutation. These run deterministically for tests.
- **File size**: split anything over ~500 lines. `ScenarioEditor.tsx` (610) and `ProjectionChart.tsx` (462) are known outliers — don't grow them further.
- **Imports**: always use `@/*` alias, never relative `../../`.
- **Path case**: components `PascalCase.tsx`, libs `kebab-case.ts`, routes `page.tsx` / `route.ts`.
- **IDs**: runtime models use `uuidv4()`; agent-authored skill examples use short slugs (the app reassigns UUIDs on import).
- **Currencies**: `baseCurrency` is always `"USD"`. Burn `currency` field exists but v1 engine ignores it — leave as `"stablecoin"` if unsure.
- **Server env**: only `PERPLEXITY_API_KEY`. Routes return `503` if missing rather than throwing.
- **Commits**: Conventional Commits (`feat:`, `fix:`, `docs:`, `chore:`, `refactor:`). See `.claude/rules/commit-conventions.md`.
- **Branches**: Claude agents work on `claude/<slug>`; user features on descriptive names. Never push to `main` directly.

---

## Gotchas

- `lib/projection-engine.ts` expects `projectionMonths ∈ {12, 15, 18}` — adding new values requires schema + UI updates.
- `structuredClone` is used on volatile assets to avoid mutating the input model. Don't skip it.
- `extendedRunwayEnabled` defaults true; when false, liquidation logic is skipped entirely.
- `maxSellUnit: "percent_of_volume"` requires `dailyVolume` and `percentOfVolume` to be set, otherwise sell rate is 0.
- Scenario IDs vs category IDs: overrides reference `categoryId` / `assetId` from the **base** model. If a scenario was authored before you deleted a category, the override is silently ignored.
- `mcp/` is **excluded** from `tsconfig.json` (it has its own). Don't import from `mcp/` into `app/` or `lib/`.
- `app/api/agent/encode` is the zero-latency shareUrl endpoint (no AI call). `app/api/agent/build` calls Perplexity.
- The two AI setup paths (`/api/ai/parse-setup` and `/api/agent/build`) share the **same system prompt**. Update both together, or extract to a constant.

---

## Agent Navigation

**Need something? Read one file.**

| Need | Read |
|---|---|
| Cheat sheet (one-pager) | `.claude/CHEATSHEET.md` |
| "I want to… → read X" decision tree | `.claude/DECISION_TREE.md` |
| Minimal context for fixing a bug | `.claude/entry/fix-bug.md` |
| Minimal context for adding a feature | `.claude/entry/add-feature.md` |
| Minimal context for adding an API route | `.claude/entry/add-route.md` |
| Minimal context for editing the engine | `.claude/entry/edit-engine.md` |
| Minimal context for adding a scenario | `.claude/entry/add-scenario.md` |
| API patterns and error handling | `.claude/rules/api-patterns.md` |
| Frontend / component patterns | `.claude/rules/frontend-patterns.md` |
| Projection engine invariants | `.claude/rules/engine-patterns.md` |
| Testing rules | `.claude/rules/testing-rules.md` |
| Commit conventions | `.claude/rules/commit-conventions.md` |
| PR conventions | `.claude/rules/pr-conventions.md` |
| Development workflows | `.claude/rules/workflows.md` |
| List of all API routes (machine-readable) | `.claude/metadata/routes.json` |
| List of all components | `.claude/metadata/components.json` |
| Function index / call graph | `.claude/metadata/functions.json` |
| Project summary counts | `.claude/metadata/summary.json` |

---

## Documentation Routing — Topic → Source of Truth

| Topic | Canonical source |
|---|---|
| Product spec | `docs/01-PRODUCT-SPEC.md` |
| Data model (TS + JSON) | `lib/types.ts` + `docs/02-DATA-MODEL.md` + `app/schema/model.json` |
| Architecture | `docs/03-ARCHITECTURE.md` |
| Projection math | `lib/projection-engine.ts` + `docs/05-PROJECTION-ENGINE.md` |
| Perplexity / AI integration | `app/api/ai/*` + `docs/06-PERPLEXITY-INTEGRATION.md` |
| Agent architecture | `docs/07-AGENT-ARCHITECTURE.md` + `skills/*/SKILL.md` |
| Design system / tokens | `tailwind.config.ts` + `docs/DESIGN-IMPLEMENTATION.md` |
| Scenario colors / templates | `lib/constants.ts` (`SCENARIO_COLORS`, `SCENARIO_TEMPLATES`) |
| Share URL encoding | `lib/model-export.ts` |

If you find conflicting info between a `docs/*.md` and source, **source wins** — then update the doc.

---

## Validation Checklist (pre-commit)

Run these in order. Fix as you go. Stop at the first failure.

```bash
npm run typecheck          # must pass — no any in new code
npm run lint               # must pass
npm run test:unit          # must pass — engine regressions are blockers
npm run meta:validate      # optional but recommended — catches doc drift
# For UI changes:
npm run dev                # verify manually at localhost:3000
npm run test:e2e           # add/update tests for new flows
# For build sanity:
npm run build              # catches type errors the incremental compiler missed
```

**Hard rule:** never commit with `npm run typecheck` or `npm run test:unit` failing.
