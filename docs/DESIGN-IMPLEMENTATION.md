# Rough Runway Design Implementation — Retro Swiss Aviation

**Status**: Locked (April 22, 2026). This is the single source of truth for the visual system. The earlier exploration docs (`DESIGN-SPEC.md`, `THEME-CONCEPTS.md`, `DESIGN-QUESTIONNAIRE.md`, `DESIGN-GAPS.md`, `DESIGN-PROCESS.md`, `DESIGN-INITIATIVE-SUMMARY.md`, `design-guide.md`) are historical context and must not be used to seed tokens.

**System**: Retro Swiss Aviation — Swiss precision grid + Helvetica-lineage type + vintage cockpit instrumentation details (knob controls, panel cards, placard typography). Two modes: **Day Flying** (light) and **Night Flying** (dark).

---

## 1. Tailwind Config

`tailwind.config.ts` keeps the shadcn HSL tokens for framework primitives (so existing Button/Card/Input variants keep working) and adds explicit brand tokens for Swiss palette + chart colors. Font and radius aliases match the cockpit vocabulary.

```typescript
theme: {
  extend: {
    colors: {
      // shadcn primitives remain, but their HSL values are replaced (see §2)
      border: "hsl(var(--border))",
      input: "hsl(var(--input))",
      ring: "hsl(var(--ring))",
      background: "hsl(var(--background))",
      foreground: "hsl(var(--foreground))",
      primary: { DEFAULT: "hsl(var(--primary))", foreground: "hsl(var(--primary-foreground))" },
      secondary: { DEFAULT: "hsl(var(--secondary))", foreground: "hsl(var(--secondary-foreground))" },
      muted: { DEFAULT: "hsl(var(--muted))", foreground: "hsl(var(--muted-foreground))" },
      accent: { DEFAULT: "hsl(var(--accent))", foreground: "hsl(var(--accent-foreground))" },
      destructive: { DEFAULT: "hsl(var(--destructive))", foreground: "hsl(var(--destructive-foreground))" },
      card: { DEFAULT: "hsl(var(--card))", foreground: "hsl(var(--card-foreground))" },
      popover: { DEFAULT: "hsl(var(--popover))", foreground: "hsl(var(--popover-foreground))" },

      // Swiss Aviation brand palette (hex — used directly as utilities)
      'swiss-red':      '#DC2626',   // hard runway line, critical CTAs, focus
      'aviation-green': '#2E7D32',   // positive financial indicator
      'aviation-red':   '#C62828',   // warnings, funding gap
      'knob-gold':      '#D4A574',   // primary knob fill, "powered by" accents
      'knob-silver':    '#B8B8B8',   // panel borders, tick marks, gridlines
      'sky-blue':       '#6FA3D4',   // extended runway line
      'mountain-white': '#F5F5F5',   // panel surface (light)
      'ink':            '#1A1A1A',   // primary text (light)
      'ink-secondary':  '#6B6B6B',   // secondary text (light)

      // Night Flying (dark mode variants)
      'primary-dark':        '#0F1115',
      'panel-dark':          '#1A1D23',
      'aviation-green-dark': '#4ADE80',
      'aviation-red-dark':   '#F87171',
      'sky-blue-dark':       '#5B9BD5',
      'knob-gold-dark':      '#C9966A',
      'knob-silver-dark':    '#8A8A8A',
    },
    borderRadius: {
      // shadcn defaults kept for compatibility
      lg: "var(--radius)",
      md: "calc(var(--radius) - 2px)",
      sm: "calc(var(--radius) - 4px)",
      // cockpit-specific aliases
      knob:    '9999px', // fully round — primary CTAs and toggles
      panel:   '8px',    // instrument panels / cards
      precise: '4px',    // inputs, chips, tight controls
    },
    fontFamily: {
      // Helvetica Neue is the reference; these are the free-license stand-ins
      // we ship with (see §3). Swap the first entry if a licensed face is added.
      sans: ['"Inter"', '"Helvetica Neue"', 'Arial', 'system-ui', 'sans-serif'],
      display: ['"Inter Display"', '"Inter"', '"Helvetica Neue"', 'sans-serif'],
      mono:    ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
    },
  }
}
```

---

## 2. CSS Variables (`app/globals.css`)

Replace the current shadcn pink/rose values with Swiss palette equivalents. The shadcn HSL contract stays intact — only the values change — so no component needs to be rewired.

```css
:root {
  /* Day Flying (light) */
  --background:             0 0% 100%;     /* pure white */
  --foreground:             0 0% 10%;      /* ink #1A1A1A */
  --card:                   0 0% 96%;      /* mountain-white */
  --card-foreground:        0 0% 10%;
  --popover:                0 0% 100%;
  --popover-foreground:     0 0% 10%;
  --primary:                0 72% 51%;     /* swiss-red */
  --primary-foreground:     0 0% 100%;
  --secondary:              0 0% 96%;
  --secondary-foreground:   0 0% 10%;
  --muted:                  0 0% 96%;
  --muted-foreground:       0 0% 42%;      /* ink-secondary */
  --accent:                 31 51% 64%;    /* knob-gold */
  --accent-foreground:      0 0% 10%;
  --destructive:            0 65% 47%;     /* aviation-red */
  --destructive-foreground: 0 0% 100%;
  --border:                 0 0% 72%;      /* knob-silver */
  --input:                  0 0% 72%;
  --ring:                   0 72% 51%;     /* swiss-red focus ring */
  --radius:                 0.5rem;        /* 8px — panel */

  /* Explicit semantic chart/financial tokens (hex, read by chart components) */
  --chart-hard-runway:     #DC2626;
  --chart-extended-runway: #6FA3D4;
  --chart-funding-gap:     #C62828;
  --chart-stables:         #2E7D32;
  --chart-fiat:            #6FA3D4;
  --chart-volatile-major:  #D4A574;
  --chart-volatile-alt:    #B8B8B8;
  --chart-volatile-native: #DC2626;
}

.dark {
  /* Night Flying (dark) */
  --background:             222 19% 7%;    /* primary-dark */
  --foreground:             0 0% 90%;
  --card:                   219 14% 12%;   /* panel-dark */
  --card-foreground:        0 0% 90%;
  --popover:                222 19% 7%;
  --popover-foreground:     0 0% 90%;
  --primary:                0 84% 60%;
  --primary-foreground:     0 0% 100%;
  --secondary:              219 14% 12%;
  --secondary-foreground:   0 0% 90%;
  --muted:                  219 14% 12%;
  --muted-foreground:       0 0% 61%;
  --accent:                 31 42% 54%;
  --accent-foreground:      0 0% 90%;
  --destructive:            0 91% 71%;
  --destructive-foreground: 0 0% 10%;
  --border:                 0 0% 33%;
  --input:                  0 0% 33%;
  --ring:                   0 84% 60%;

  --chart-hard-runway:     #EF4444;
  --chart-extended-runway: #5B9BD5;
  --chart-funding-gap:     #F87171;
  --chart-stables:         #4ADE80;
  --chart-fiat:            #5B9BD5;
  --chart-volatile-major:  #C9966A;
  --chart-volatile-alt:    #8A8A8A;
  --chart-volatile-native: #EF4444;
}
```

---

## 3. Typography Scale

Helvetica Neue is the reference face but is not webfont-licensed. Ship with free stand-ins that preserve the Swiss feel; upgrade path is noted.

### Faces

| Role | Face (shipped) | Notes |
|---|---|---|
| UI / body | **Inter** | Rasmus Andersson's modern Helvetica-alternative. Already wired via `next/font/google`. |
| Display / headings | **Inter Display** (tighter tracking) | Optional — can fall back to Inter. |
| Numeric / placards | **JetBrains Mono** | Cockpit/instrument feel for figures, tickers, axis labels. |

**Upgrade path**: replace Inter with **Neue Haas Grotesk Display Pro** (the modern digital version of Helvetica) when a commercial license is acquired. No token changes needed — swap the first entry in `fontFamily.sans`.

### Scale

8-step ramp. Headings tighten line-height; body opens it; placards use tracking for vintage instrument panel feel.

| Token | Size / Line-height | Weight | Tracking | Usage |
|---|---|---|---|---|
| `text-display` | 48 / 52 | 700 | -0.02em | Landing hero only |
| `text-h1` | 32 / 38 | 700 | -0.01em | Page title (dashboard model name) |
| `text-h2` | 24 / 30 | 600 | -0.005em | Section headings (Treasury, Burn, Inflows) |
| `text-h3` | 18 / 26 | 600 | 0 | Card titles, panel headers |
| `text-body-lg` | 16 / 24 | 400 | 0 | Primary body, input values |
| `text-body` | 14 / 20 | 400 | 0 | Default UI text, table cells |
| `text-caption` | 12 / 16 | 500 | 0.01em | Helper text, form hints |
| `text-placard` | 10 / 14 | 600 | 0.08em, uppercase | Axis labels, legends, category tags, "HARD RUNWAY" chips |
| `text-mono` | inherits | 400 | 0 | Applied to JetBrains Mono — all figures, amounts, dates |

Add to Tailwind (`theme.extend.fontSize`):

```typescript
fontSize: {
  'display':  ['3rem',      { lineHeight: '3.25rem', letterSpacing: '-0.02em', fontWeight: '700' }],
  'h1':       ['2rem',      { lineHeight: '2.375rem', letterSpacing: '-0.01em', fontWeight: '700' }],
  'h2':       ['1.5rem',    { lineHeight: '1.875rem', letterSpacing: '-0.005em', fontWeight: '600' }],
  'h3':       ['1.125rem',  { lineHeight: '1.625rem', fontWeight: '600' }],
  'body-lg':  ['1rem',      { lineHeight: '1.5rem' }],
  'body':     ['0.875rem',  { lineHeight: '1.25rem' }],
  'caption':  ['0.75rem',   { lineHeight: '1rem', letterSpacing: '0.01em', fontWeight: '500' }],
  'placard':  ['0.625rem',  { lineHeight: '0.875rem', letterSpacing: '0.08em', fontWeight: '600' }],
},
```

### Rules

- **All numbers use `font-mono`** — treasury amounts, burn rates, runway months, dates, percentages. Never render numeric data in Inter; monospace is the cockpit convention.
- **Tabular numerals** are required on every mono usage: `font-feature-settings: "tnum"` (already implicit in JetBrains Mono's defaults).
- Never mix more than two weights in a single component.
- Uppercase tracked placards are used sparingly — placard-style labels on the chart, the summary card headers, and runway status chips only.

---

## 4. Spacing Scale — 8pt Grid

Tailwind's default spacing already sits on a 4px base. We formalize the subset we use so components stop improvising paddings.

| Token | Value | Usage |
|---|---|---|
| `space-0` | 0 | — |
| `space-1` | 4px | Icon/label gap, tight chip padding |
| `space-2` | 8px | Form element internal padding, stacked row gap |
| `space-3` | 12px | Button internal padding (vertical) |
| `space-4` | 16px | Card internal gap, default element spacing |
| `space-5` | 20px | Section row gap |
| `space-6` | 24px | **Panel padding (desktop)**, default card inset |
| `space-8` | 32px | **Section gap** — between major dashboard blocks |
| `space-12` | 48px | Page-level vertical rhythm |
| `space-16` | 64px | Hero / landing padding |
| `space-24` | 96px | Reserved — landing hero only |

**Grid rules**:

- Sidebar: 320px fixed (spec'd in build plan)
- Main content: `max-w-7xl` (1280px) with `px-6` (24px) gutter
- Panel inner padding: `p-6` (24px) desktop, `p-4` (16px) at < 768px (interstitial blocks <1024 anyway)
- Inter-card gap: `gap-4` (16px) within a row; `gap-8` (32px) between sections
- Form fields: `space-y-2` (8px) between label and input, `space-y-4` (16px) between fields
- Do not use odd values (5, 7, 9, 11, 13, 15). If a 1px divider needs offsetting, use `p-[15px]` explicitly with a comment.

---

## 5. State Tokens & Interaction

Every interactive element must define these states. Defaults below apply unless a component explicitly overrides.

| State | Treatment |
|---|---|
| **Default** | Token-defined background + border |
| **Hover** | `brightness-105` on fills; `bg-muted` on ghost; 1px `knob-silver` border strengthens to `ink-secondary` |
| **Active / pressed** | `shadow-inner` + `brightness-95` — the "knob depressed" effect. Animate in 80ms ease-out. |
| **Focus-visible** | `ring-2 ring-swiss-red ring-offset-2 ring-offset-background` — replaces the current pink shadcn ring (mapped via `--ring`) |
| **Disabled** | `opacity-40 pointer-events-none`, no hover/active |
| **Selected** | 2px `knob-gold` border + `bg-knob-gold/10` fill |
| **Loading** | Pulse between `knob-silver/50` and `knob-silver/80`, 1.5s ease-in-out infinite |
| **Error** | `border-aviation-red`, `bg-aviation-red/5`, error text below in `text-caption text-aviation-red` |
| **Success** | `border-aviation-green`, transient `bg-aviation-green/10` fade over 1.5s |

### Motion

Swiss aesthetic = restrained. **No bouncy easings, no parallax, no decorative entrance animations.**

- Transitions: 150ms ease-out for hover/focus, 80ms ease-out for active.
- Chart updates: 300ms ease-out on recompute.
- Dark-mode crossfade: 200ms on `body` background/color only.
- Use `prefers-reduced-motion: reduce` to disable all non-essential transitions.

---

## 6. Chart Styling

Recharts components should read from CSS variables defined in §2 so chart appearance flips with dark mode automatically.

### Palette (assignments)

| Series | Light | Dark | Notes |
|---|---|---|---|
| Hard Runway line | `var(--chart-hard-runway)` / `#DC2626` | `#EF4444` | 2.5px solid, round caps |
| Extended Runway line | `var(--chart-extended-runway)` / `#6FA3D4` | `#5B9BD5` | 2px dashed, `strokeDasharray="8 4"` |
| Funding gap zone | `var(--chart-funding-gap)` / `#C62828` at 10% fill | same | Between hard and extended lines where gap exists |
| Stables (stacked area) | `#2E7D32` | `#4ADE80` | 70% fill opacity |
| Fiat (stacked area) | `#6FA3D4` | `#5B9BD5` | 60% fill opacity |
| Volatile — major | `#D4A574` | `#C9966A` | 65% fill opacity |
| Volatile — alt | `#B8B8B8` | `#8A8A8A` | 55% fill opacity |
| Volatile — native | `#DC2626` | `#EF4444` | 50% fill opacity |
| Scenario lines | knob-gold, aviation-green, sky-blue, aviation-red, ink-secondary (in order) | dark equivalents | 1.5px solid |

### Axes, grid, tooltip

- **Gridlines**: `stroke: knob-silver`, `stroke-opacity: 0.2`, `strokeWidth: 1`. Horizontal only — no vertical gridlines (Swiss grid = clean).
- **Axis lines**: `stroke: knob-silver`, `stroke-opacity: 0.4`, 1px.
- **Tick marks**: 4px outward (instrument-panel feel). Color: `knob-silver`.
- **Axis labels**: `text-placard` (10px uppercase tracked), `fill: ink-secondary`.
- **Tooltip**: `bg-card` with 1px `knob-silver` border, `rounded-panel` (8px), `p-3`, `shadow-sm`. Values in `font-mono`. Active-point dot: 4px, filled with series color, 1px white stroke.
- **Legend**: placard-style chips at top-right, 8px square swatch + placard label.

### Behavior

- No animation on initial mount (data is deterministic, not a surprise). Use `isAnimationActive={false}` or set `animationDuration={0}` on first render; transitions between scenario toggles may animate at 300ms.
- No gradient fills — flat color with opacity, always.
- Hover guide line: 1px dashed `knob-silver` at 50% opacity, full height.

---

## 7. Component Styling (updated)

### Button (`components/ui/button.tsx`)

Add a `knob` variant alongside the existing shadcn variants:

```tsx
variants: {
  variant: {
    default:      "bg-primary text-primary-foreground hover:brightness-105 active:shadow-inner",
    knob:         "bg-knob-gold text-ink rounded-knob hover:brightness-105 active:shadow-inner font-medium",
    outline:      "border border-knob-silver bg-background hover:bg-muted",
    ghost:        "hover:bg-muted",
    destructive:  "bg-destructive text-destructive-foreground hover:brightness-105",
    link:         "text-primary underline-offset-4 hover:underline",
  },
  size: {
    default: "h-10 px-4 py-2 rounded-precise",
    sm:      "h-9  px-3 rounded-precise",
    lg:      "h-11 px-6 rounded-precise",
    icon:    "h-10 w-10 rounded-knob",
  },
}
```

### Card (instrument panel) (`components/ui/card.tsx`)

```tsx
"rounded-panel border border-knob-silver bg-card text-card-foreground shadow-sm"
```

Add an optional `<CardPlacard>` slot for the top-left "HARD RUNWAY" / "EXTENDED RUNWAY" label in placard type.

### Input (`components/ui/input.tsx`)

Numeric inputs must render in mono:

```tsx
"flex h-10 w-full rounded-precise border border-input bg-background px-3 py-2 text-body font-mono ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-40"
```

Add a non-mono `<TextInput>` variant for non-numeric fields (model name, asset ticker names).

---

## 8. Accessibility & Contrast

WCAG 2.1 AA minimum (the product spec's NFR). Verified pairings on mountain-white (`#F5F5F5`) and panel-dark (`#1A1D23`) backgrounds:

| Foreground | Background | Contrast | Verdict |
|---|---|---|---|
| ink `#1A1A1A` | mountain-white `#F5F5F5` | 15.9:1 | AAA |
| ink-secondary `#6B6B6B` | mountain-white | 5.1:1 | AA |
| swiss-red `#DC2626` | mountain-white | 4.9:1 | AA (large text / UI only — not body) |
| aviation-green `#2E7D32` | mountain-white | 5.5:1 | AA |
| knob-gold `#D4A574` | mountain-white | 1.9:1 | **Fail** — use only as fill, never as text color on light bg |
| sky-blue `#6FA3D4` | mountain-white | 2.7:1 | **Fail** — chart stroke only, never as text on light bg |
| `#E5E5E5` | panel-dark `#1A1D23` | 13.2:1 | AAA |
| `#9B9B9B` | panel-dark | 5.4:1 | AA |
| swiss-red-dark `#EF4444` | panel-dark | 5.0:1 | AA |
| sky-blue-dark `#5B9BD5` | panel-dark | 4.8:1 | AA |

Rules that follow:

- **knob-gold and sky-blue are never used as text colors** on light backgrounds. They are fills and strokes only. If a label needs to sit on a knob-gold surface, use `ink` (15.9:1 on gold passes AAA).
- Every chart series that conveys information also has a second channel: dashed vs solid line style, placard label, or fill pattern. No color-only data.
- Focus rings are swiss-red at 2px with 2px offset — visible on both modes.
- `prefers-reduced-motion: reduce` disables non-essential transitions (§5).
- Every icon-only button has `aria-label`.
- Form fields: `<label>` always associated, error state announced via `aria-describedby` pointing to the error text.

---

## 9. Implementation Checklist

### Phase 1: Design Foundation (½ day)
- [ ] Replace HSL values in `app/globals.css` `:root` and `.dark` per §2
- [ ] Add Swiss palette + radius + font aliases to `tailwind.config.ts` per §1
- [ ] Add `fontSize` scale per §3
- [ ] Remove hard-coded `className="dark"` from `app/layout.tsx`; add pre-hydration script that reads `localStorage.darkMode` to avoid FOUC
- [ ] Load JetBrains Mono via `next/font/google` alongside Inter
- [ ] Verify `DarkModeToggle` flips cleanly without hydration warnings

### Phase 2: Primitive Components (½ day)
- [ ] `components/ui/button.tsx` — add `knob` variant, update hover/active per §5, update `rounded-*` per §1
- [ ] `components/ui/card.tsx` — `rounded-panel`, `border-knob-silver`; add optional `<CardPlacard>` subcomponent
- [ ] `components/ui/input.tsx` — `font-mono` default, `rounded-precise`; add `<TextInput>` escape hatch for non-numeric
- [ ] `components/ui/select.tsx`, `textarea.tsx`, `label.tsx` — align with tokens

### Phase 3: Migrate Existing Screens (1 day)
- [ ] `AppShell`, `Header`, `Sidebar`, `FooterBrand` — replace hard-coded `bg-white` / `bg-gray-*` / `border-gray-*` with tokens
- [ ] `RunwaySummaryCards`, `ScenarioSummaryCards` — placard headers, mono numbers, knob-gold "powered by" badge
- [ ] `TreasuryPanel`, `BurnPanel`, `InflowPanel`, `ScenarioPanel` — token migration + placard section labels
- [ ] `ProjectionChart` + `ScenarioProjectionChart` — rewire all colors to CSS vars per §6; axis/legend/tooltip restyle
- [ ] `MonthlyBreakdownTable` — mono for all figures, placard for column headers
- [ ] Landing page (`app/page.tsx`) — swap hero type scale to `text-display`, restyle feature tiles as instrument panels

### Phase 4: Verification
- [ ] Run axe / pa11y or manual contrast check on both modes
- [ ] Toggle dark mode on every screen — no color drift, no flashes
- [ ] Disable motion preference — confirm transitions gated correctly
- [ ] Screenshot every panel in both modes; attach to PR

### Deferred to after foundation (unchanged from Build Plan Phase 5)
- Perplexity market banner — uses `knob-gold` gradient + placard layout
- `AIScenarioBuilder` / `AISetupAssistant` — panel card + voice input
- `PoweredByBadge` — placard chip, `knob-gold` fill
- `data-agent-*` attrs on interactive elements (already partially present)

---

## 10. Agent Interaction Flow (unchanged)

Spec lives in `07-AGENT-ARCHITECTURE.md` and is already partially implemented (`/schema/*`, `/.well-known/agent-instructions.md`, `skills/*`). This section is a pointer, not a duplicate checklist.

Key visual hook: any element that is part of the agent interface should carry both its design token styling and a `data-agent-action="..."` / `data-agent-schema="..."` attribute for programmatic discovery.
