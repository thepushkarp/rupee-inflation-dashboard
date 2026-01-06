# CLAUDE.md

This file provides guidance to Claude Code when working with this repository.

## Project Overview

A React dashboard visualizing the declining purchasing power of ₹100 (Indian Rupee) from 1960 to present, with historical economic event annotations. Uses live data from the World Bank API.

## Development Commands

```bash
yarn install      # Install dependencies
yarn start        # Start dev server on port 3000
yarn build        # Production build
yarn test         # Run tests (interactive watch mode)
yarn format       # Format code with Prettier
yarn lint         # Lint TypeScript files
yarn typecheck    # Type check without emitting
```

## Architecture

**Single-page TypeScript React app** using Create React App with functional components and hooks.

### Data Flow

1. `useInflationData` hook calls World Bank API via `inflationApi.ts`
2. SWR handles caching, revalidation, and error states
3. Data flows to `InflationChart` component with memoized calculations
4. `RupeeBackground` creates SVG clip mask effect based on chart data

### Key Directories

```
src/
├── components/
│   ├── Chart/           # InflationChart, RupeeBackground, chartConfig
│   ├── Controls/        # YearRangeSelector
│   ├── Layout/          # Header, Footer
│   └── ui/              # LoadingState, ErrorState, StatCard
├── hooks/
│   ├── useInflationData.ts   # Data fetching with SWR
│   └── useTheme.ts           # Dark mode management
├── services/
│   └── inflationApi.ts       # World Bank API integration
├── data/
│   └── historicalEvents.ts   # Event annotations config
├── types/
│   └── inflation.ts          # TypeScript interfaces
└── styles/
    ├── variables.css         # CSS custom properties
    └── global.css            # Reset and base styles
```

### Key Files

| File | Purpose |
|------|---------|
| `src/App.tsx` | Main component, state management, layout |
| `src/services/inflationApi.ts` | World Bank API fetcher |
| `src/components/Chart/chartConfig.ts` | ApexCharts configuration |
| `src/components/Chart/RupeeBackground.tsx` | SVG clip mask effect |
| `src/data/historicalEvents.ts` | Event annotations (year-based lookup) |

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
- Coverage: 1960-present (annual data)

### Theming

Uses CSS custom properties in `variables.css`. Dark mode is automatic based on system preference via `useTheme` hook. Key variables:

- `--color-bg-primary`, `--color-text-primary` for base colors
- `--color-accent` for interactive elements
- `--color-saffron`, `--color-green` for Indian flag colors

## Tech Stack

- React 18 with functional components
- TypeScript 5 with strict mode
- SWR for data fetching
- ApexCharts for charting
- CSS Modules for component styling
- Prettier + ESLint for formatting/linting
