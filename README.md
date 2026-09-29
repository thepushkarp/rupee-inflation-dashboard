# Rupee Inflation

An interactive chart of the purchasing power of ₹100 in India, using annual World Bank CPI observations.

## Development

Requires Bun 1.3.10+ and Node.js 22.12+.

```sh
bun install --frozen-lockfile
bun run dev
bun --bun run check
```

The development server uses port 3000. Production output goes to `build/`.
The check command runs formatting, lint, CSS Module typing, TypeScript, tests, and the production build.
`--bun` runs the tooling with Bun, avoiding the typed-css-modules/yargs incompatibility with Node 26.

## Data and calculations

The browser requests all available annual observations from 1960 through the current calendar year for [World Bank indicator FP.CPI.TOTL](https://data.worldbank.org/indicator/FP.CPI.TOTL?locations=IN).
Null observations are omitted; unpublished years are never estimated. Invalid CPI values fail the request.

Purchasing power for year Y is `100 × CPI(selected start year) / CPI(Y)`.
The chart and endpoint use this ratio directly; only displayed values are rounded.
Annual inflation is the CPI percentage change from the preceding calendar year, or unavailable when that observation is missing.

SWR refreshes on initial load, focus, reconnect, and every six hours while the page is visible and online.
Requests are deduplicated for one minute. Full history includes newly published years automatically; a custom range stays selected.
A failed background refresh retains the last successful data and offers Retry. An initial failure shows an error.

“Annual CPI through” identifies the latest observation year. “Last checked” records the successful fetch time.
The World Bank dataset update date, when provided, appears in the timestamp’s title.

## Chart and events

The interface uses a single light theme. Start/end selectors and Full history control the chart.
ApexCharts renders the annual line and event annotations without animation.
A single local banknote image is clipped using the rendered area path in the same SVG coordinate system.
It preserves its proportions and crops to cover the plot. Render callbacks and resize observation keep the mask and HTML event targets aligned.

Event points show sourced historical context on hover or focus. Click/tap pins the details; Escape, Close, or clicking outside dismisses them.
Left/right arrow keys move between points, and Tab enters the open details. Previous/Next in the popup makes tightly spaced events reachable on touch screens.
Multiple events in one year share a point. The popup separates observed annual CPI change from the event’s qualitative effect; it does not assign a causal percentage to the event.

## Structure

- `src/services/inflationApi.ts`: paginated World Bank fetch and validation.
- `src/hooks/useInflationData.ts`: SWR refresh, cached error recovery, and range selection.
- `src/components/Chart/`: chart options, banknote mask, and accessible event details.
- `src/data/historicalEvents.ts`: event descriptions and primary-source links.
- `src/styles/`: shared light-theme tokens and base styles.

The app uses React, TypeScript, Vite, SWR, ApexCharts, and CSS Modules. No backend or credentials are required.

## Banknote attribution

`public/rupee-100.jpg` is the RBI ₹100 specimen image, published 19 July 2018, obtained from [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Rs_100_note_front_view.jpg).
Provider: Reserve Bank of India. License: [Government Open Data License – India](https://data.gov.in/government-open-data-license-india).
The original image is stored unmodified; the chart applies a display-only mask. RBI does not endorse this website.

## License

Application code: MIT. The banknote image has the separate attribution and license above.
