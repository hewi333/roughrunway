# Entry Points

Task-scoped minimal-context files. Each loads just what you need for one kind of work.

| File | Use when |
|---|---|
| `fix-bug.md` | Something is broken. You have a symptom and need to reproduce, fix, and prevent regression. |
| `add-feature.md` | User-facing addition (new panel, component, field, dialog). |
| `add-route.md` | New `/api/ai/*` or `/api/agent/*` endpoint. |
| `edit-engine.md` | Modifying `lib/projection-engine.ts` or `lib/scenario-engine.ts`. Extra care required — pure, tested. |
| `add-scenario.md` | Adding a scenario template or a new override type. |

**Rule**: prefer the most specific entry. Don't load `add-feature.md` if you're only editing the engine.
