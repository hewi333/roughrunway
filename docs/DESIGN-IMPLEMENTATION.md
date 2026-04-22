# Rough Runway Design Implementation

## Overview
This document provides actionable implementation specs for the Retro Swiss Aviation design system.

---

## 1. Tailwind Config Updates

Add to `tailwind.config.ts`:

```typescript
theme: {
  extend: {
    colors: {
      // Light Mode - Day Flying
      'swiss-red': '#DC2626',
      'aviation-green': '#2E7D32',
      'aviation-red': '#C62828',
      'knob-gold': '#D4A574',
      'knob-silver': '#B8B8B8',
      'sky-blue': '#6FA3D4',
      'mountain-white': '#F5F5F5',
      
      // Dark Mode - Night Flying
      'primary-dark': '#0F1115',
      'panel-dark': '#1A1D23',
      'aviation-green-dark': '#4ADE80',
      'aviation-red-dark': '#F87171',
      'sky-blue-dark': '#5B9BD5',
    },
    borderRadius: {
      'knob': '9999px',
      'panel': '8px',
      'precise': '4px',
    },
    fontFamily: {
      sans: ['Helvetica Neue', 'Arial', 'sans-serif'],
      mono: ['Helvetica Neue Mono', 'monospace'],
    },
  }
}
```

---

## 2. CSS Variables (globals.css)

```css
:root {
  /* Light Mode */
  --color-hard-runway: #DC2626;
  --color-extended-runway: #6FA3D4;
  --color-funding-gap: #C62828;
  --color-positive: #2E7D32;
  --color-knob-gold: #D4A574;
  --color-knob-silver: #B8B8B8;
  --color-bg: #FFFFFF;
  --color-panel: #F5F5F5;
  --color-text: #1A1A1A;
  --color-text-secondary: #6B6B6B;
}

.dark {
  /* Dark Mode */
  --color-hard-runway: #EF4444;
  --color-extended-runway: #5B9BD5;
  --color-funding-gap: #F87171;
  --color-positive: #4ADE80;
  --color-knob-gold: #C9966A;
  --color-knob-silver: #8A8A8A;
  --color-bg: #0F1115;
  --color-panel: #1A1D23;
  --color-text: #E5E5E5;
  --color-text-secondary: #9B9B9B;
}
```

---

## 3. Component Implementation

### Knob Button (components/ui/button.tsx)
```tsx
className="rounded-full bg-knob-gold hover:brightness-110 active:shadow-inner"
```

### Instrument Panel Card (components/ui/card.tsx)
```tsx
className="rounded-panel border-1 border-knob-silver shadow-sm"
```

### Runway Chart Colors (lib/constants.ts)
```tsx
export const CHART_COLORS = {
  hardRunway: '#DC2626',
  extendedRunway: '#6FA3D4',
  fundingGap: '#C62828',
  positive: '#2E7D32',
};
```

---

## 4. Implementation Checklist

### Phase 1: Foundation (Day 1)
- [ ] Update tailwind.config.ts with color tokens
- [ ] Add CSS variables to globals.css
- [ ] Update button component (knob-style, rounded-full)
- [ ] Update card component (instrument panel styling)
- [ ] Add dark mode toggle component

### Phase 2: Dashboard (Day 2-3)
- [ ] Apply colors to Treasury panel
- [ ] Apply colors to Burn/Inflow panels
- [ ] Update runway chart with new color scheme
- [ ] Add Swiss grid layout (strict alignment)
- [ ] Update input fields (monospace for numbers)

### Phase 3: Agent + Perplexity (Day 4-5)
- [ ] Add data-* attributes to interactive elements
- [ ] Create /.well-known/agent-instructions.md
- [ ] Add JSON Schema endpoints
- [ ] Implement Perplexity market banner (knob-gold gradient)
- [ ] Test agent scenario creation flow

### Phase 4: Demo Prep (Day 6-7)
- [ ] Record 2-3min demo video (light mode)
- [ ] Verify Hard vs Extended runway distinction
- [ ] Accessibility check (WCAG AA contrast)
- [ ] Final typography hierarchy review

---

## 5. Agent Interaction Flow

For hackathon demo video:

1. Agent visits roughrunway.com
2. Discovers /.well-known/agent-instructions.md
3. Creates scenario via POST /api/scenarios
4. Generates shareable URL with encoded state
5. Human opens URL → loads pre-configured scenario

Key attributes:
```html
<div data-agent-action="create-scenario" data-agent-schema="/api/schema/scenario.json">
```