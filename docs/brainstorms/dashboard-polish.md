# Rupee Inflation Dashboard Polish

## Overview

The **Rupee Inflation Dashboard Polish** project aims to modernize and enhance a React-based visualization showing the declining purchasing power of ₹100 over time. The project involves four major workstreams:

1. **Migration from Create React App to Vite** for faster builds and modern tooling
2. **Fixing the year-change chart rendering bug** that breaks the chart when users adjust the date range
3. **Implementing a canvas-based rupee note background** that shows a single ₹100 note visible only below the inflation line, creating a powerful visual metaphor for value erosion
4. **UI/UX refinements** following a minimal & modern aesthetic with improved typography, spacing, and interactions

The core user experience remains unchanged: visitors see how ₹100 from any selected starting year has lost value over time, with historical events annotated on the chart.

## Goals

**Must Have:**
- Migrate from Create React App to Vite with all existing functionality preserved
- Fix the chart rendering bug when year range changes (likely a React key or ApexCharts update issue)
- Implement canvas-based rupee note background that:
  - Shows a single centered ₹100 note image
  - Only visible below the inflation line (masked/clipped above)
  - Updates correctly when year range changes
  - Works across all modern browsers
- Update all dependencies to latest stable versions (React 18.3+, TypeScript 5.5+, etc.)

**Should Have:**
- Cleaner, more minimal UI with improved whitespace and typography
- Smoother animations and transitions
- Better mobile responsiveness
- Simplified project structure and cleaner documentation

**Nice to Have:**
- Add subtle micro-interactions (hover states, loading transitions)
- Performance optimizations (lazy loading, code splitting)
- Accessibility improvements (ARIA labels, keyboard navigation)

## Non-Goals

**Explicitly NOT doing:**
- Adding new data sources or APIs beyond the World Bank CPI data
- Implementing user accounts, saving preferences, or any backend functionality
- Adding multiple currencies or countries (this remains India-focused)
- Building a mobile app or PWA capabilities
- Adding social sharing features or embedding options
- Implementing complex charting features (zoom, pan, multiple chart types)
- Server-side rendering or static site generation
- Analytics or tracking integration
- Internationalization/localization (English only)
- Changing the core calculation logic for purchasing power

**Out of scope for this polish:**
- Redesigning the data model or API layer
- Adding tests beyond what currently exists
- Setting up CI/CD pipelines
- Docker containerization

## User Experience

**Primary Flow (unchanged):**
1. User lands on the dashboard → sees the full 1960-present chart with ₹100 note visible below the declining line
2. The note creates an immediate visual impact: "this is how much value has eroded"
3. User adjusts year range via dropdowns → chart smoothly updates, note mask recalculates
4. Stats below the chart update to reflect the selected period
5. Historical event annotations provide context for major inflection points

**Visual Enhancements:**
- **Chart area:** Single ₹100 note centered in the plot area, with canvas masking that reveals the note only below the inflation line. Above the line = clean background, below = note visible
- **Typography:** Larger stat values with better hierarchy, using the existing DM Sans font with refined weights
- **Spacing:** More generous padding around components, breathing room between sections
- **Controls:** Cleaner dropdown styling, subtle hover states
- **Loading:** Skeleton states instead of spinner for perceived performance
- **Dark mode:** Maintains existing auto-detection, refined contrast ratios

**Responsive Behavior:**
- Desktop: Full layout with annotations visible
- Tablet: Annotations hidden, slightly compressed stats
- Mobile: Stacked stats, larger touch targets for dropdowns

## Technical Approach

**Build System Migration (CRA → Vite):**
- Create new `vite.config.ts` with React plugin
- Update `package.json` scripts (`dev`, `build`, `preview`)
- Move `index.html` to root, update asset references
- Replace `react-scripts` with `vite` and `@vitejs/plugin-react`
- Update environment variable handling (`VITE_` prefix)
- Remove CRA-specific files (`react-app-env.d.ts`, etc.)

**Chart Rendering Bug Fix:**
- The issue likely stems from ApexCharts not receiving a proper re-render signal when data changes
- Solution: Add a unique `key` prop to the Chart component based on year range, forcing remount
- Alternative: Use ApexCharts' `updateSeries()` method imperatively if key approach causes animation issues

**Canvas-Based Rupee Background:**
```
Architecture:
┌─────────────────────────────────────┐
│  ChartContainer (relative)          │
│  ┌───────────────────────────────┐  │
│  │  <canvas> (absolute, z:0)     │  │  ← Draws note, masked by line path
│  │  - Listens to chart dimensions │  │
│  │  - Redraws on data/resize      │  │
│  └───────────────────────────────┘  │
│  ┌───────────────────────────────┐  │
│  │  ApexChart (relative, z:1)    │  │  ← Transparent background
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```
- Canvas draws the ₹100 note image
- Uses `ctx.clip()` with a path traced from the inflation line down to the bottom
- Recalculates on: data change, year range change, window resize
- Syncs with ApexCharts plot area dimensions via DOM observation

**Dependency Updates:**
- React 18.2 → 18.3, TypeScript 5.3 → 5.6
- ApexCharts and react-apexcharts to latest
- SWR 2.2 → 2.3, testing libraries to latest
- Add Vite-specific deps, remove CRA deps

## Key Components

**New/Modified Components:**

| Component | Change | Purpose |
|-----------|--------|---------|
| `RupeeCanvas.tsx` | **New** | Canvas-based background with inflation line masking |
| `InflationChart.tsx` | Modify | Add key prop for re-render fix, integrate canvas container |
| `ChartContainer.tsx` | **New** | Wrapper managing canvas + chart positioning and dimensions |
| `YearRangeSelector.tsx` | Modify | Refined styling, better touch targets |
| `StatCard.tsx` | **New** | Extract stat display into reusable component |

**Key Files to Update:**

| File | Changes |
|------|---------|
| `vite.config.ts` | New build configuration |
| `package.json` | New scripts, updated deps |
| `index.html` | Move to root, Vite format |
| `src/main.tsx` | Rename from index.tsx, Vite entry |
| `variables.css` | Refined spacing, typography tokens |
| `App.module.css` | Updated layout, spacing |

**Files to Remove:**
- `react-app-env.d.ts`
- `reportWebVitals.ts`
- `setupTests.ts` (or update for Vitest)
- CRA-specific config in `package.json`

**Preserved (no changes):**
- `inflationApi.ts` - API layer works fine
- `useInflationData.ts` - SWR hook unchanged
- `historicalEvents.ts` - Event data unchanged
- `types/inflation.ts` - Types unchanged

## Open Questions

**To resolve during implementation:**

1. **Canvas sync timing:** How to reliably detect when ApexCharts has finished rendering so the canvas can read accurate plot dimensions? (Options: MutationObserver, requestAnimationFrame polling, or ApexCharts event hooks)

2. **Note image positioning:** Should the ₹100 note be:
   - Anchored to bottom-left of plot area?
   - Centered horizontally in plot area?
   - Scaled to fit plot height or maintain aspect ratio?

3. **Animation coordination:** When year range changes, should the canvas mask animate smoothly or snap to new position? (Smooth may require interpolating between old/new line paths)

4. **Test migration:** Keep Jest or migrate to Vitest for consistency with Vite? (Vitest is faster and more aligned, but requires test file updates)

5. **ApexCharts alternatives:** If the rendering bug proves deeply rooted in ApexCharts, consider lightweight alternatives like `recharts` or `visx`? (Likely overkill for this fix, but worth noting)

---
*Generated via /brainstorm on 2026-01-06*
