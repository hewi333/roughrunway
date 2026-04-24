# CHEATSHEET — RoughRunway

One-page survival guide. Memorize this.

## What is this repo?
Next.js 14 App Router, TypeScript strict, **no backend, no DB**. Crypto treasury runway modeler. State in Zustand+localStorage. Models share via URL hash (lz-string). AI via Perplexity Sonar.

## The 5 commands you'll run most
```
npm run dev            # localhost:3000
npm run typecheck      # before committing
npm run test:unit      # engine regressions are blockers
npm run lint
npm run meta:generate  # regen .claude/metadata/*.json
```

## The 5 files that matter most
| File | What it is |
|---|---|
| `lib/types.ts` | Canonical model types. Change here first. |
| `lib/projection-engine.ts` | Pure runway math. No I/O. |
| `lib/scenario-engine.ts` | `applyScenarioOverrides` — pure. |
| `lib/constants.ts` | Defaults, presets, scenario templates, colors. |
| `lib/store.ts` | Zustand store + localStorage persist. |

## Routing lookups
- **Pages**: `app/<segment>/page.tsx`  (`/`, `/dashboard`, `/setup`, `/docs`)
- **API**: `app/api/{ai,agent}/<x>/route.ts`  (5 routes total — see `.claude/metadata/routes.json`)
- **UI primitives**: `components/ui/`  (shadcn)
- **Domain components**: `components/{ai,burn,inflow,treasury}/`
- **Top-level panels**: `components/*.tsx`

## Hard rules (don't break)
1. Projection/scenario engines are **pure**. No `fetch`, no `Date.now()` outside inputs, no mutation.
2. TypeScript strict — no `any` in new code.
3. Import alias `@/*`. Never `../../`.
4. Don't import from `mcp/` into `app/` or `lib/` — different tsconfig.
5. `baseCurrency` is always `"USD"`. `projectionMonths ∈ {12, 15, 18}`.
6. Conventional Commits: `feat:`, `fix:`, `docs:`, `chore:`, `refactor:`.
7. Never push to `main`. Claude agents use `claude/<slug>`.

## AI route pattern
```ts
if (!process.env.PERPLEXITY_API_KEY) {
  return Response.json({ error: "AI features not configured" }, { status: 503 });
}
// parse body, bound inputs (MAX_*_LENGTH), trim, validate
// call perplexity.chat.completions.create with response_format json_schema
// catch → console.error("[route]", ...) → 400 with user-friendly msg
```

## When in doubt
Open `CLAUDE.md` → "Task Routing". If your task isn't there, open `.claude/DECISION_TREE.md`.
