# Rough Runway Design System

## Branding

- **Product Name**: Rough Runway
- **Domain**: roughrunway.com
- **GitHub Repository**: hewi333/roughrunway
- **Tagline**: Self-serve treasury runway forecasting for small crypto organizations

## Visual Identity

### Colors
- Primary: #14B8A6 (Teal)
- Secondary: #EC4899 (Pink)
- Background: #F9FAFB (Light Gray)
- Text: #111827 (Dark Gray)
- Border: #E5E7EB (Gray)

### Typography
- Primary Font: Inter (via Google Fonts)
- Font Weights: 400 (Regular), 500 (Medium), 600 (Semi-bold), 700 (Bold)

### Spacing
- Base unit: 4px
- Common spacing: 4px, 8px, 12px, 16px, 24px, 32px, 48px, 64px

## UI Components

### Buttons
- Primary: Solid background with white text
- Secondary: Outline with primary color border
- Ghost: Text only with hover effect
- Sizes: sm, md (default), lg

### Cards
- Border radius: 8px
- Border: 1px solid #E5E7EB
- Background: #FFFFFF
- Shadow: subtle (shadow-sm)

### Forms
- Input height: 40px
- Border radius: 6px
- Border color: #D1D5DB
- Focus state: primary color border with ring

## Data Visualization

### Charts
- Library: Recharts
- Colors: 
  - Hard Runway: #EC4899 (Pink)
  - Extended Runway: #14B8A6 (Teal) with 60% opacity
- Grid lines: #E5E7EB
- Tooltips: Dark background with white text

## Responsive Design

### Breakpoints
- sm: 640px
- md: 768px
- lg: 1024px
- xl: 1280px
- 2xl: 1536px

### Layout
- Mobile-first approach
- Sidebar collapses to icons-only on small screens
- Content area uses max-width: 1280px with padding

## Accessibility

- Minimum contrast ratio: 4.5:1
- Focus indicators: visible on all interactive elements
- ARIA labels: required for all icons and interactive elements
- Keyboard navigation: fully supported

## Naming Conventions

- File names: kebab-case
- Component names: PascalCase
- Variables: camelCase
- CSS classes: kebab-case
- Constants: UPPER_SNAKE_CASE

## Code Structure

### File Organization
```
roughrunway/
├── app/              # Next.js app router
├── components/       # Shared components
├── lib/              # Business logic
├── public/           # Static assets
├── styles/           # Global styles
├── tests/            # Unit tests
└── types/            # TypeScript types
```

### Component Structure
- Each component in its own directory
- index.ts for exports
- ComponentName.tsx for implementation
- ComponentName.test.ts for tests
- ComponentName.stories.tsx for Storybook (if applicable)

## API Design

### JSON Schema
- All data models have corresponding JSON schemas
- Schemas are publicly accessible via /schema/* endpoints
- Versioning follows semantic versioning

### Error Handling
- All API errors return structured JSON
- Error codes follow standard HTTP status codes
- User-friendly error messages in response body