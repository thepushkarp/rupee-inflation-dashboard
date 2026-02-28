<p align="center"><img alt="Rupee Inflation Dashboard" src="public/logo512.png" width="200"></p>

<h1 align="center">Rupee Inflation Dashboard</h1>

<p align="center">
  <a href="https://github.com/thepushkarp/rupee-inflation-dashboard/"><img alt="CI Status" src="https://img.shields.io/github/actions/workflow/status/thepushkarp/rupee-inflation-dashboard/ci.yml?logo=GitHub&label=CI&style=for-the-badge"></a>
  <a href="https://github.com/thepushkarp/rupee-inflation-dashboard/"><img alt="CodeQL Status" src="https://img.shields.io/github/actions/workflow/status/thepushkarp/rupee-inflation-dashboard/codeql-analysis.yml?logo=GitHub&label=CodeQL&style=for-the-badge"></a>
  <a href="https://github.com/thepushkarp/rupee-inflation-dashboard/stargazers"><img alt="Stargazers" src="https://img.shields.io/github/stars/thepushkarp/rupee-inflation-dashboard?style=for-the-badge"></a>
  <a href="https://github.com/thepushkarp/rupee-inflation-dashboard/blob/master/LICENSE"><img alt="License" src="https://img.shields.io/github/license/thepushkarp/rupee-inflation-dashboard?style=for-the-badge"></a>
</p>

<p align="center">
  Interactive dashboard visualizing the declining purchasing power of ₹100 over the decades
</p>

---

## Features

- **Live Data**: Fetches real-time inflation data from [World Bank Open Data](https://data.worldbank.org/indicator/FP.CPI.TOTL?locations=IN)
- **Interactive Chart**: Filter data by year range with responsive ApexCharts visualization
- **Historical Events**: Annotated markers for significant economic events (Bank Nationalisation, LPG Reforms, Demonetisation, COVID-19, etc.)
- **Theme Toggle**: Dark/light with system default and a manual override
- **Responsive Design**: Mobile-first CSS with modern design patterns
- **TypeScript**: Full type safety throughout the codebase

## Tech Stack

- **React 19** + **Vite 7** SPA
- **Bun** for installs, scripts, and the canonical lockfile (`bun.lock`)
- **TypeScript 5.9** (strict)
- **SWR** for data fetching with caching
- **ApexCharts** for interactive charting
- **CSS Modules** + CSS custom properties for theming
- **oxlint** + **oxfmt** for fast lint/format
- **Vitest** + Testing Library for tests

## Getting Started

### Prerequisites

- Bun 1.3.10
- Node.js 22.12+

### Installation

```bash
# Clone the repository
git clone https://github.com/thepushkarp/rupee-inflation-dashboard.git
cd rupee-inflation-dashboard

# Install dependencies
bun install

# Start development server
bun run dev
```

The app will be available at [http://localhost:3000](http://localhost:3000)

### Available Scripts

```bash
bun run dev            # Start Vite dev server
bun run check          # Format + lint + css types + typecheck + test + build
bun run build          # Production build (outputs to /build)
bun run test           # Run tests
bun run format         # Auto-format the repo
bun run lint           # Lint TypeScript/TSX
bun run typecheck      # Type check without emitting
bun run css:types      # (Re)generate CSS Module typings
bun run css:types:check # Verify CSS Module typings are up to date
```

## Data Source

This dashboard uses the **World Bank Open Data API** to fetch Consumer Price Index (CPI) data for India. The CPI indicator (`FP.CPI.TOTL`) provides annual inflation data from 1960 onwards.

- [World Bank API Documentation](https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation)
- [India CPI Data](https://data.worldbank.org/indicator/FP.CPI.TOTL?locations=IN)

## Project Structure

```
src/
├── components/
│   ├── Chart/           # Chart components with SVG background effect
│   ├── Controls/        # Year range selector + presets
│   ├── Events/          # Historical events ledger
│   ├── Kpi/             # KPI strip
│   ├── Layout/          # TopBar + footer
│   └── ui/              # Reusable UI components
├── hooks/               # Custom React hooks
├── services/            # API integration
├── styles/              # Global CSS and variables
├── types/               # TypeScript type definitions
└── data/                # Static data and event annotations
```

## License

MIT License - see [LICENSE](LICENSE) for details.

---

<p align="center">
  Made with love by <a href="https://thepushkarp.com">Pushkar Patel</a>
</p>
