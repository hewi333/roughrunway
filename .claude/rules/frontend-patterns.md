# Frontend Patterns

Rules for `app/**/*.tsx` and `components/**/*.tsx`.

## File layout

| Thing | Location | Case |
|---|---|---|
| Pages | `app/<segment>/page.tsx` | lowercase folder, `page.tsx` |
| Route handlers | `app/<segment>/route.ts` | lowercase folder, `route.ts` |
| Top-level panels | `components/<Name>Panel.tsx` | PascalCase |
| Domain components | `components/{ai,burn,inflow,treasury}/<Name>.tsx` | PascalCase |
| shadcn primitives | `components/ui/<name>.tsx` | lowercase — shadcn convention |
| Dialog components | `components/<Name>Dialog.tsx` | PascalCase |

## State

Single global store in `lib/store.ts` via Zustand + `persist` middleware. Use selectors, not the whole store:

```tsx
// Good — component only re-renders when `treasury` changes
const treasury = useRoughRunwayStore((s) => s.model.treasury);

// Bad — re-renders on every store change
const { model } = useRoughRunwayStore();
```

For high-churn editors (sliders, text inputs), use `useDebouncedRoughRunwayStore`.

Never prop-drill `model`. Fetch what you need at the leaf.

## Styling

- Tailwind utility classes only. No CSS modules, no styled-components, no inline `style` (except for computed values like chart colors).
- Use design tokens from `tailwind.config.ts`. Scenario colors from `lib/constants.ts` → `SCENARIO_COLORS`.
- Dark mode: class-based (`dark:bg-...`). Set via `<html class="dark">` — toggled by `components/DarkModeToggle.tsx`.
- Prefer shadcn primitives in `components/ui/` over raw HTML for inputs, buttons, labels, etc.
- Icons from `lucide-react`. Prefer named imports: `import { ArrowRight } from "lucide-react"`.

## Component patterns

- Functional components only. No class components.
- Named exports for utility components, default export for top-level panels. (Both conventions exist in the codebase — match the surrounding file.)
- Props interfaces named `<Component>Props`:
  ```tsx
  interface BurnPanelProps {
    model: RoughRunwayModel;
  }
  export function BurnPanel({ model }: BurnPanelProps) { … }
  ```
- Client components must declare `"use client"` at the top. Routes and server-only utilities must not.

## Import rules

- Always use `@/*` alias: `import { Button } from "@/components/ui/button"`.
- Never `../../`.
- Don't import from `mcp/` — separate tsconfig.

## Charts

`recharts` composition pattern — see `components/ProjectionChart.tsx` for the canonical setup. Reuse `ScenarioProjectionChart.tsx` for scenario overlays. Don't invent a new chart library.

## Forms / validation

- Zustand state is the source of truth. `onChange` → `updateModel({...})`.
- Bound all numeric inputs — no negatives for amounts, no fractions past 2 decimals for dollar amounts.
- Use the shadcn `input`, `select`, `textarea`, `switch`, `label` from `components/ui/`.

## Common pitfalls

- **Hydration mismatch**: `useRoughRunwayStore` reads from localStorage on mount. Wrap client-only subtrees in an `isHydrated` check when rendering model-dependent UI at route level.
- **`extendedRunwayEnabled`**: panels that show "extended runway" must gate on this flag, or UI lies.
- **Recharts + SSR**: the chart components are `"use client"` only. Don't import them into server components.
- **Performance**: avoid re-computing `computeProjection(model)` on every render. Use `lib/hooks/useProjection.ts`.
- **Component size**: split anything over 500 lines. `ScenarioEditor.tsx` and `ProjectionChart.tsx` are known exceptions; don't grow them.

## Related

- `.claude/rules/engine-patterns.md`
- `lib/hooks/useProjection.ts` — memoized projection
- `docs/DESIGN-IMPLEMENTATION.md` — full design system
