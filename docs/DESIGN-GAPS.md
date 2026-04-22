# Current Design Gaps & Issues

## 1. Visual Consistency

### Component Styling Inconsistencies
- Some components use direct Tailwind classes (`bg-white dark:bg-gray-800`)
- Others might use CSS variables or utility classes
- Need unified approach to dark mode handling
- Inconsistent padding/margin usage across components

### Color Usage
- Current palette defined but not consistently applied
- Semantic colors for financial data not clearly defined
- Dark mode colors partially implemented
- Brand colors (Perplexity) integrated but not systematized

## 2. Typography System

### Hierarchy Issues
- No clear typographic scale defined
- Heading sizes inconsistent across components
- Body text sizing and line-height not standardized
- Lack of semantic typography classes

### Font Choices
- Current implementation uses system fonts
- No custom font loading strategy
- Font weights not consistently applied
- Missing typographic utilities for financial data

## 3. Spacing & Layout

### Inconsistent Spacing
- Component padding/margin values vary
- No defined spacing scale (8pt grid system)
- Layout gaps inconsistent between sections
- Mobile-responsive spacing not standardized

### Layout Structure
- AppShell layout implemented but could be more flexible
- Panel widths and breakpoints not optimized
- Grid systems not fully utilized
- Responsive behavior needs refinement

## 4. Component Design System

### Missing Components
- Form components (inputs, selects, checkboxes)
- Data display components (tables, lists, cards)
- Navigation components (tabs, breadcrumbs, pagination)
- Feedback components (alerts, toasts, modals)

### Component Variants
- Button variants defined but could be extended
- Card components implemented but need more variants
- Form components partially implemented
- Data visualization components need styling guidelines

## 5. Data Visualization

### Chart Styling
- Basic Recharts implementation
- No consistent chart color palette
- Legend and tooltip styling inconsistent
- Axis and grid line styling not standardized

### Data Representation
- Financial data formatting not consistent
- Number formatting (currency, percentages) needs standardization
- Data density and readability concerns
- Color coding for financial indicators not systematized

## 6. Dark Mode Implementation

### Inconsistencies
- Some components have dark mode classes
- Others might be missing dark mode support
- Color contrast ratios not verified
- Transition effects between modes not implemented

### System Integration
- CSS variables defined but not fully utilized
- Dark mode toggle mechanism not implemented
- System preference detection not integrated
- Theme persistence across sessions not handled

## 7. Mobile Responsiveness

### Current State
- MobileInterstitial component exists but basic
- Responsive breakpoints defined but not consistently applied
- Touch targets not optimized
- Mobile-specific layouts not implemented

### Improvements Needed
- Mobile-first component design
- Responsive utility classes standardized
- Touch-friendly interactions
- Mobile-specific navigation patterns

## 8. Accessibility

### Current Gaps
- Color contrast ratios not verified
- Semantic HTML not consistently applied
- ARIA attributes missing in some components
- Keyboard navigation support incomplete

### WCAG Compliance
- Visual focus indicators not standardized
- Screen reader compatibility not tested
- Color-only information presentation issues
- Motion sensitivity considerations not addressed

## 9. Performance Considerations

### CSS Optimization
- Unused CSS not purged
- Critical CSS not inlined
- Animation performance not optimized
- Heavy component re-renders possible

### Asset Loading
- Font loading strategy not optimized
- Icon system not implemented
- Image optimization not addressed
- Bundle size impact of design system not measured

## 10. Documentation & Maintenance

### Design System Documentation
- No centralized design system documentation
- Component usage guidelines missing
- Design tokens not documented
- Implementation examples not provided

### Maintenance Concerns
- No design system versioning
- Component dependency relationships unclear
- Update processes not defined
- Backward compatibility considerations missing