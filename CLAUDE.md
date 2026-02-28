# CLAUDE.md

This file provides guidance to Claude Code when working with this repository.

## Project Overview

A React dashboard visualizing the declining purchasing power of ₹100 (Indian Rupee) from 1960 to present, with historical economic event annotations. Uses live data from the World Bank API.

## Development Commands

```bash
bun install            # Install dependencies (writes bun.lock)
bun run dev            # Start Vite dev server on port 3000
bun run check          # Format + lint + css types + typecheck + test + build
bun run build          # Production build (outputs to /build)
bun run preview        # Preview production build locally
bun run format         # Format code with oxfmt
bun run lint           # Lint TypeScript/TSX with oxlint
bun run test           # Run Vitest
bun run typecheck      # Type check without emitting
bun run css:types      # (Re)generate CSS Module typings
bun run css:types:check # Verify CSS Module typings are up to date
```

## Architecture

**Single-page TypeScript React app** using Vite with functional components and hooks.

### Data Flow

1. `useInflationData` hook calls World Bank API via `inflationApi.ts`
2. SWR handles caching, revalidation, and error states
3. Data flows to `InflationChart` component with memoized calculations

### Key Directories

```
src/
├── components/
│   ├── Chart/           # InflationChart, chartConfig
│   ├── Controls/        # YearRangeSelector + RangePresets
│   ├── Events/          # EventsLedger
│   ├── Kpi/             # KpiStrip
│   ├── Layout/          # TopBar, Footer
│   └── ui/              # LoadingState, ErrorState
├── hooks/
│   ├── useInflationData.ts   # Data fetching with SWR
│   └── useTheme.ts           # Dark mode management
├── services/
│   └── inflationApi.ts       # World Bank API integration
├── data/
│   └── historicalEvents.ts   # Event annotations config
├── types/
│   ├── inflation.ts          # TypeScript interfaces
│   └── assets.d.ts           # Asset import declarations
└── styles/
    ├── variables.css         # CSS custom properties
    └── global.css            # Reset and base styles
```

### Key Files

| File                                      | Purpose                                      |
| ----------------------------------------- | -------------------------------------------- |
| `src/App.tsx`                             | Main component, state management, layout     |
| `src/services/inflationApi.ts`            | World Bank API fetcher                       |
| `src/components/Chart/chartConfig.ts`     | ApexCharts configuration                     |
| `src/components/Chart/InflationChart.tsx` | Chart component with key prop for re-renders |
| `src/data/historicalEvents.ts`            | Event annotations (year-based lookup)        |
| `vite.config.ts`                          | Vite build configuration                     |

### Historical Event Annotations

Events are defined by year (not index) in `historicalEvents.ts`:

- 1969: Bank Nationalisation
- 1971: Economic Liberalisation
- 1991: LPG Reforms
- 2008: Global Financial Crisis
- 2016: Demonetisation & GST
- 2020: COVID-19

To add new events, add to the `historicalEvents` array with `year`, `label`, `description`, and optional `offsetY`.

### World Bank API

**Endpoint**: `https://api.worldbank.org/v2/country/IN/indicator/FP.CPI.TOTL?format=json`

- No authentication required
- Returns CPI data indexed to 2010 = 100
- Coverage: 1960-present (annual data; request range uses current year)

### Theming

Uses CSS custom properties in `variables.css`. Dark mode is automatic based on system preference via `useTheme` hook. Key variables:

- `--color-bg`, `--color-text` for base colors
- `--color-accent` for interactive elements
- `--color-chart-line`, `--color-annotation` for chart styling

## Tech Stack

- React 19 with functional components
- TypeScript 5.9 with strict mode
- Vite 7 for build tooling
- SWR for data fetching
- ApexCharts 5 for charting
- CSS Modules for component styling
- oxfmt for formatting
- oxlint for linting
- Vitest + Testing Library for tests
