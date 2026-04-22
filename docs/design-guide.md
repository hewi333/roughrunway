# Rough Runway Design Guide — Superseded

> **This document is deprecated.**
> It was produced during the initial scaffold phase (PR #3) with a teal/pink palette and a generic Tailwind/shadcn setup. That direction has been **replaced by the Retro Swiss Aviation system**.
>
> **Source of truth:** [`DESIGN-IMPLEMENTATION.md`](./DESIGN-IMPLEMENTATION.md)
>
> Do not copy tokens, fonts, or component specs from this file. It is retained only so older links and PR references do not 404.

---

## What changed

| Area | Old (this doc) | New (`DESIGN-IMPLEMENTATION.md`) |
|---|---|---|
| Primary color | `#14B8A6` teal | `#DC2626` swiss-red |
| Secondary color | `#EC4899` pink | `#D4A574` knob-gold |
| Hard Runway chart line | `#EC4899` pink | `#DC2626` swiss-red, 2.5px solid |
| Extended Runway chart line | `#14B8A6` teal at 60% | `#6FA3D4` sky-blue, 2px dashed |
| Primary font | Inter (only) | Inter (stand-in for Helvetica Neue) + JetBrains Mono for figures |
| Typography scale | Undefined | 8-step ramp (`text-display` → `text-placard`) |
| Card radius | `8px` | `rounded-panel` (8px) + `rounded-knob` (9999px) for CTAs |
| Spacing scale | Ad-hoc 4-64px | Formal 8pt grid with semantic tokens |
| Dark mode | Partial | Full "Night Flying" parity + contrast-verified |
| Chart axes / tooltip | Unstyled | Placard labels, knob-silver gridlines, mono tooltip |
| State tokens (hover/active/focus/error) | Not specified | Defined in `DESIGN-IMPLEMENTATION.md` §5 |

---

## Where to look now

- Tokens & color palette → `DESIGN-IMPLEMENTATION.md` §1–§2
- Typography → §3
- Spacing → §4
- State tokens, focus, motion → §5
- Chart styling → §6
- Component specs (Button, Card, Input) → §7
- Accessibility & contrast → §8
- Implementation checklist → §9

Branding, domain, repo, naming conventions, API/JSON Schema conventions, and file organization continue as described in the main specs (`01-PRODUCT-SPEC.md`, `03-ARCHITECTURE.md`, `07-AGENT-ARCHITECTURE.md`).
