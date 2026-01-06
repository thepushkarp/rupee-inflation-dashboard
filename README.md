<p align="center"><img alt="Rupee Inflation Dashboard" src="public/logo512.png" width="200"></p>

<h1 align="center">Rupee Inflation Dashboard</h1>

<p align="center">
  <a href="https://github.com/thepushkarp/rupee-inflation-dashboard/"><img alt="CodeQL Status" src="https://img.shields.io/github/actions/workflow/status/thepushkarp/rupee-inflation-dashboard/codeql.yml?logo=GitHub&label=CodeQL&style=for-the-badge"></a>
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
- **Dark Mode**: Automatic theme switching based on system preference
- **Responsive Design**: Mobile-first CSS with modern design patterns
- **TypeScript**: Full type safety throughout the codebase

## Tech Stack

- **React 18** with functional components and hooks
- **TypeScript** for type safety
- **SWR** for data fetching with caching
- **ApexCharts** for interactive charting
- **CSS Modules** with CSS custom properties for theming

## Getting Started

### Prerequisites

- Node.js 18+
- Yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/thepushkarp/rupee-inflation-dashboard.git
cd rupee-inflation-dashboard

# Install dependencies
yarn install

# Start development server
yarn start
```

The app will be available at [http://localhost:3000](http://localhost:3000)

### Available Scripts

```bash
yarn start      # Start development server
yarn build      # Create production build
yarn test       # Run tests
yarn format     # Format code with Prettier
yarn lint       # Lint TypeScript files
yarn typecheck  # Run TypeScript type checking
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
│   ├── Controls/        # Year range selector
│   ├── Layout/          # Header and footer
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
