# Development Workflows

How we actually develop in this repo. Start with the principle, then the loop.

## Core principles

1. **Source beats docs.** If `docs/02-DATA-MODEL.md` disagrees with `lib/types.ts`, source wins. Then update the doc.
2. **Small, verifiable changes.** Ship one behavior at a time with its test.
3. **Pure engines stay pure.** `lib/projection-engine.ts` and `lib/scenario-engine.ts` never acquire side effects, full stop.
4. **No backend creep.** This app has no server state. Features that need persistence go via URL-hash share or localStorage — not a new API route.
5. **Agent UX is a feature.** Routes under `/api/agent/*` exist so external LLMs can use the app. When you change data shapes, update `skills/*/SKILL.md`.

## The inner loop

```
1. Read CLAUDE.md → task routing → locate files (1 hop)
2. Read the named files + any rules/*.md pointed to
3. Change code. Keep diffs surgical.
4. npm run typecheck
5. npm run test:unit  (watch mode during active work)
6. npm run dev  (for UI changes)
7. npm run lint
8. npm run meta:generate  (if you added/removed routes, components, or exported fns)
9. Commit (Conventional)
```

## The outer loop

```
- Branch: claude/<slug> (never main)
- Push: git push -u origin <branch>
- PR only when user asks (see pr-conventions.md)
- CI runs typecheck + unit + e2e + build; all must pass before merge
```

## When to update agent navigation

Update `.claude/` alongside your change when:

- You add a new route class (e.g. first `/api/webhooks/*`) → new row in CLAUDE.md Task Routing + update `add-route.md`.
- You add a lib module that isn't covered by existing rules → mention it in `CLAUDE.md` "Task Routing" or "Documentation Routing".
- You change a convention (testing framework, state lib) → update the relevant rules file.
- You find a gotcha that bit you → add it to `CLAUDE.md` "Gotchas" or the nearest rules file.

Agent navigation drift is expensive. Keep it fresh.

## Doc health check

```
npm run meta:validate
```

Fails if:
- A doc references a file that doesn't exist.
- A doc references a function name not found in `.claude/metadata/functions.json`.
- `.claude/metadata/*.json` is out of date vs source.

Wire this into pre-commit or CI (example hook in `.claude/hooks-examples/pre-commit.sh`).

## Environment

- `.env.local` is gitignored. Template in `.env.local.example`.
- Only `PERPLEXITY_API_KEY` is needed. Everything else works without one.
- Node 18+. `npm ci` for reproducible installs.

## Related

- `.claude/rules/commit-conventions.md`
- `.claude/rules/pr-conventions.md`
- `.claude/rules/testing-rules.md`
