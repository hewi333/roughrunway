# Entry: Add a Feature

## Quick Navigation

| Feature kind | Touch |
|---|---|
| New panel on dashboard | `components/<Name>Panel.tsx` + mount in `app/dashboard/page.tsx` or `components/AppShell.tsx` |
| New domain component (AI/burn/inflow/treasury) | `components/<domain>/<Name>.tsx` |
| New shadcn UI primitive | `components/ui/<name>.tsx` (copy style from siblings) |
| New dialog | `components/<Name>Dialog.tsx`; open-state lived via `useState` in parent |
| New field on the model | `lib/types.ts` → `lib/constants.ts` → `lib/projection-engine.ts` → `app/schema/model.json` → tests |
| New scenario template | `lib/constants.ts` (`SCENARIO_TEMPLATES`) |
| New preset category | `lib/constants.ts` (`PRESET_BURN_CATEGORIES` / `PRESET_INFLOW_CATEGORIES`) + AI prompts |
| New AI-powered feature | `.claude/entry/add-route.md` first, then UI |

## Workflow

1. **Locate** the closest existing feature and mimic its structure. The repo is small — patterns are consistent.
2. **Read** `.claude/rules/frontend-patterns.md` for component/state rules.
3. **Write** the component. Use shadcn primitives from `components/ui/`. Use the `@/*` import alias.
4. **Wire state** via `useRoughRunwayStore` from `lib/store.ts`. Don't prop-drill the model.
5. **Type + test**: `npm run typecheck`. Add an e2e case if the feature is interactive.
6. **Dev**: `npm run dev`, verify at localhost:3000.

## State pattern

```tsx
import { useRoughRunwayStore } from "@/lib/store";

const model = useRoughRunwayStore((s) => s.model);
const updateModel = useRoughRunwayStore((s) => s.updateModel);
// updateModel({ burnCategories: newList });
```

For heavy editors, use `useDebouncedRoughRunwayStore` to avoid thrashing localStorage.

## Styling

- Tailwind utility classes in JSX. No CSS modules, no styled-components.
- Colors: use design tokens in `tailwind.config.ts`. Scenario colors from `lib/constants.ts` (`SCENARIO_COLORS`).
- Dark mode: class-based (`dark:`). Toggle via `components/DarkModeToggle.tsx`.

## Don't Forget

- New fields need defaults in `lib/constants.ts` so loading old stored models doesn't break.
- If the feature changes the share-URL payload, test round-trip encode/decode (`tests/export-import.test.ts`).
- Keep components under 500 lines. Split sub-pieces into a sibling file.
- Run `npm run meta:generate` to update `.claude/metadata/components.json`.

## Deeper Docs

- `.claude/rules/frontend-patterns.md`
- `.claude/rules/testing-rules.md`
- `docs/03-ARCHITECTURE.md`
