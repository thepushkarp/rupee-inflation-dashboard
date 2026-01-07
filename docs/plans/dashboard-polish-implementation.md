# Implementation Plan: Rupee Inflation Dashboard Polish

> **Design Doc:** [docs/brainstorms/dashboard-polish.md](../brainstorms/dashboard-polish.md)

## Overview

This plan covers four workstreams:
1. Migrate from Create React App to Vite
2. Fix the chart rendering bug when year range changes
3. Implement canvas-based rupee note background effect
4. Polish UI/UX with minimal & modern aesthetic

Estimated scope: 8-10 focused tasks, best done in sequence.

---

## Prerequisites

### Required Tools
```bash
node --version  # v18.x or v20.x required
yarn --version  # v1.22.x (classic)
```

### Environment Setup
```bash
cd /path/to/rupee-inflation-dashboard
yarn install
yarn start  # Verify current app works at localhost:3000
```

### No External Accounts Needed
- World Bank API requires no authentication
- No environment variables currently used

---

## Codebase Orientation

### Directory Structure
```
src/
├── components/
│   ├── Chart/           # InflationChart, chartConfig - YOU'LL MODIFY THESE
│   ├── Controls/        # YearRangeSelector
│   ├── Layout/          # Header, Footer
│   └── ui/              # LoadingState, ErrorState
├── hooks/
│   ├── useInflationData.ts   # SWR data fetching (DON'T TOUCH)
│   └── useTheme.ts           # Dark mode (DON'T TOUCH)
├── services/
│   └── inflationApi.ts       # World Bank API (DON'T TOUCH)
├── assets/
│   └── hundred.png           # ₹100 note image for background
├── styles/
│   ├── variables.css         # Design tokens - YOU'LL MODIFY
│   └── global.css            # Base styles
└── App.tsx                   # Main component - YOU'LL MODIFY
```

### Key Patterns to Follow

**CSS Modules:** All components use `*.module.css` files
```tsx
// Example from InflationChart.tsx
import styles from './InflationChart.module.css';
<div className={styles.chartWrapper}>
```

**Hooks Pattern:** Custom hooks in `hooks/` directory with `use` prefix
```tsx
// Example: useInflationData.ts
export function useInflationData(range?: YearRange): UseInflationDataResult
```

**Type Definitions:** All in `types/inflation.ts`
```tsx
interface InflationDataPoint {
  year: number;
  cpi: number;
  purchasingPower: number;
}
```

### Files to Read First
1. `src/App.tsx` - Main component, state flow
2. `src/components/Chart/InflationChart.tsx` - Current chart implementation
3. `src/components/Chart/chartConfig.ts` - ApexCharts configuration
4. `src/styles/variables.css` - Design tokens

---

## Implementation Tasks

---

### Task 1: Migrate to Vite - Setup Config Files

**Goal:** Create Vite configuration and update package.json without breaking CRA yet

**Files to create:**
- `vite.config.ts` - Vite configuration

**Files to modify:**
- `package.json` - Add Vite deps (don't remove CRA yet)
- `tsconfig.json` - Update for Vite compatibility

**Implementation steps:**

1. Install Vite dependencies:
```bash
yarn add -D vite @vitejs/plugin-react @types/node
```

2. Create `vite.config.ts` at project root:
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@services': path.resolve(__dirname, './src/services'),
      '@types': path.resolve(__dirname, './src/types'),
      '@styles': path.resolve(__dirname, './src/styles'),
      '@data': path.resolve(__dirname, './src/data'),
    },
  },
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: 'build',
    sourcemap: true,
  },
});
```

3. Update `tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noFallthroughCasesInSwitch": true,
    "forceConsistentCasingInFileNames": true,
    "baseUrl": "src",
    "paths": {
      "@/*": ["./*"],
      "@components/*": ["components/*"],
      "@hooks/*": ["hooks/*"],
      "@services/*": ["services/*"],
      "@types/*": ["types/*"],
      "@styles/*": ["styles/*"],
      "@data/*": ["data/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

4. Create `tsconfig.node.json`:
```json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true,
    "strict": true
  },
  "include": ["vite.config.ts"]
}
```

**Verification:**
- TypeScript should still compile: `yarn typecheck`
- No errors from new config files

**Commit:** `chore: add Vite configuration files`

---

### Task 2: Migrate to Vite - Move index.html and Update Entry Point

**Goal:** Transform CRA structure to Vite structure

**Files to modify:**
- `public/index.html` → move to `index.html` (root)
- `src/index.tsx` → rename to `src/main.tsx`

**Files to delete:**
- `src/reportWebVitals.ts`
- `src/react-app-env.d.ts` (if exists)

**Implementation steps:**

1. Move and transform `index.html` to project root:
```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/x-icon" href="/favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="theme-color" content="#000000" />
    <meta
      name="description"
      content="Dashboard showing how the buying power of ₹100 has changed over the years"
    />
    <link rel="apple-touch-icon" href="/logo192.png" />
    <link rel="manifest" href="/manifest.json" />
    <title>Rupee Inflation Dashboard</title>
  </head>
  <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

2. Rename `src/index.tsx` to `src/main.tsx` and simplify:
```tsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

const container = document.getElementById('root');
if (!container) throw new Error('Root element not found');

createRoot(container).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

3. Delete `src/reportWebVitals.ts`

4. Create `src/vite-env.d.ts`:
```typescript
/// <reference types="vite/client" />
```

**Verification:**
- Files moved correctly
- No import errors in main.tsx

**Commit:** `refactor: restructure for Vite entry point`

---

### Task 3: Migrate to Vite - Update Dependencies and Scripts

**Goal:** Remove CRA, update all dependencies, finalize Vite migration

**Files to modify:**
- `package.json` - Complete overhaul

**Implementation steps:**

1. Update `package.json`:
```json
{
  "name": "rupee-inflation-dashboard",
  "version": "2.0.0",
  "type": "module",
  "private": true,
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint src --ext .ts,.tsx --report-unused-disable-directives --max-warnings 0",
    "typecheck": "tsc --noEmit",
    "format": "prettier --write \"src/**/*.{ts,tsx,css}\""
  },
  "dependencies": {
    "apexcharts": "^4.0.0",
    "react": "^18.3.1",
    "react-apexcharts": "^1.6.0",
    "react-dom": "^18.3.1",
    "swr": "^2.3.0"
  },
  "devDependencies": {
    "@types/node": "^22.10.0",
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.0",
    "eslint": "^9.0.0",
    "prettier": "^3.4.0",
    "typescript": "^5.6.0",
    "vite": "^6.0.0"
  }
}
```

2. Delete `node_modules` and `yarn.lock`:
```bash
rm -rf node_modules yarn.lock
```

3. Fresh install:
```bash
yarn install
```

4. Delete old CRA files:
```bash
rm -f public/index.html src/setupTests.ts
```

5. Test the dev server:
```bash
yarn dev
```

**Verification:**
- `yarn dev` starts Vite dev server on port 3000
- App loads and displays chart
- No console errors

**Commit:** `feat: complete Vite migration, update all dependencies`

---

### Task 4: Fix Chart Rendering Bug on Year Change

**Goal:** Chart should re-render correctly when year range changes

**Files to modify:**
- `src/components/Chart/InflationChart.tsx`

**Root Cause Analysis:**
ApexCharts doesn't always detect when the underlying data array reference changes. The memoized `chartOptions` and `chartSeries` update, but ApexCharts' internal state may not sync properly.

**Implementation steps:**

1. Open `src/components/Chart/InflationChart.tsx`

2. Add a `key` prop based on the data range to force remount:
```tsx
import React, { useMemo } from 'react';
import Chart from 'react-apexcharts';
import { InflationDataPoint } from '../../types/inflation';
import { historicalEvents } from '../../data/historicalEvents';
import { createChartOptions, createChartSeries } from './chartConfig';
import styles from './InflationChart.module.css';

interface InflationChartProps {
  data: InflationDataPoint[];
  isDarkMode: boolean;
}

export function InflationChart({ data, isDarkMode }: InflationChartProps) {
  // Generate a stable key from the data range
  const chartKey = useMemo(() => {
    if (data.length === 0) return 'empty';
    return `chart-${data[0].year}-${data[data.length - 1].year}`;
  }, [data]);

  const chartOptions = useMemo(
    () => createChartOptions(data, historicalEvents, isDarkMode),
    [data, isDarkMode]
  );

  const chartSeries = useMemo(() => createChartSeries(data), [data]);

  if (data.length === 0) {
    return null;
  }

  return (
    <div className={styles.chartWrapper}>
      <div className={styles.chartContainer}>
        <Chart
          key={chartKey}  // Forces remount on data range change
          options={chartOptions}
          series={chartSeries}
          type="area"
          height="100%"
          width="100%"
        />
      </div>
    </div>
  );
}
```

**Testing:**
1. Start dev server: `yarn dev`
2. Load the page
3. Change start year from 1960 to 1980
4. Chart should re-render with new data range
5. Change end year
6. Chart should re-render again

**Verification:**
- No blank chart after year change
- Annotations update correctly
- Stats update correctly
- No console errors

**Commit:** `fix: chart re-renders correctly on year range change`

---

### Task 5: Create RupeeCanvas Component

**Goal:** New component that draws ₹100 note masked by inflation line

**Files to create:**
- `src/components/Chart/RupeeCanvas.tsx`
- `src/components/Chart/RupeeCanvas.module.css`

**Files to modify:**
- `src/components/Chart/index.ts` - Export new component

**Implementation steps:**

1. Create `src/components/Chart/RupeeCanvas.module.css`:
```css
.canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
}
```

2. Create `src/components/Chart/RupeeCanvas.tsx`:
```tsx
import React, { useRef, useEffect, useCallback } from 'react';
import { InflationDataPoint } from '../../types/inflation';
import styles from './RupeeCanvas.module.css';

// Import the rupee note image
import rupeeNoteUrl from '../../assets/hundred.png';

interface RupeeCanvasProps {
  data: InflationDataPoint[];
  chartRef: React.RefObject<HTMLDivElement>;
}

interface PlotDimensions {
  plotLeft: number;
  plotTop: number;
  plotWidth: number;
  plotHeight: number;
}

/**
 * Canvas component that draws the ₹100 note image,
 * clipped to only show below the inflation line.
 */
export function RupeeCanvas({ data, chartRef }: RupeeCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const animationFrameRef = useRef<number>(0);

  // Load the rupee note image once
  useEffect(() => {
    const img = new Image();
    img.src = rupeeNoteUrl;
    img.onload = () => {
      imageRef.current = img;
      draw();
    };
    return () => {
      imageRef.current = null;
    };
  }, []);

  // Get plot area dimensions from ApexCharts DOM
  const getPlotDimensions = useCallback((): PlotDimensions | null => {
    if (!chartRef.current) return null;

    const plotArea = chartRef.current.querySelector('.apexcharts-inner');
    const svg = chartRef.current.querySelector('svg');

    if (!plotArea || !svg) return null;

    const svgRect = svg.getBoundingClientRect();
    const plotRect = plotArea.getBoundingClientRect();

    return {
      plotLeft: plotRect.left - svgRect.left,
      plotTop: plotRect.top - svgRect.top,
      plotWidth: plotRect.width,
      plotHeight: plotRect.height,
    };
  }, [chartRef]);

  // Main draw function
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    const img = imageRef.current;

    if (!canvas || !ctx || !img || data.length === 0) return;

    const dims = getPlotDimensions();
    if (!dims) {
      // Chart not ready yet, retry
      animationFrameRef.current = requestAnimationFrame(draw);
      return;
    }

    const { plotLeft, plotTop, plotWidth, plotHeight } = dims;

    // Set canvas size to match container
    const container = canvas.parentElement;
    if (container) {
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
    }

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Calculate base value (first data point)
    const baseValue = data[0].purchasingPower;

    // Build clip path from inflation line down to bottom
    ctx.save();
    ctx.beginPath();

    // Start at first data point
    data.forEach((point, i) => {
      const x = plotLeft + (i / (data.length - 1)) * plotWidth;
      const normalizedY = point.purchasingPower / baseValue;
      const y = plotTop + (1 - normalizedY) * plotHeight;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    // Close path: go to bottom-right, bottom-left, back to start
    ctx.lineTo(plotLeft + plotWidth, plotTop + plotHeight);
    ctx.lineTo(plotLeft, plotTop + plotHeight);
    ctx.closePath();
    ctx.clip();

    // Draw the rupee note image, centered in plot area
    // Maintain aspect ratio, scale to fit height
    const imgAspect = img.width / img.height;
    const drawHeight = plotHeight * 0.9; // 90% of plot height
    const drawWidth = drawHeight * imgAspect;

    const drawX = plotLeft + (plotWidth - drawWidth) / 2;
    const drawY = plotTop + (plotHeight - drawHeight) / 2;

    // Slight opacity for subtlety
    ctx.globalAlpha = 0.15;
    ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);

    ctx.restore();
  }, [data, getPlotDimensions]);

  // Redraw on data change or resize
  useEffect(() => {
    const handleResize = () => {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = requestAnimationFrame(draw);
    };

    // Initial draw with delay to let ApexCharts render
    const timeout = setTimeout(() => {
      draw();
    }, 300);

    // Watch for chart mutations
    let observer: MutationObserver | null = null;
    if (chartRef.current) {
      observer = new MutationObserver(handleResize);
      observer.observe(chartRef.current, {
        childList: true,
        subtree: true,
        attributes: true,
      });
    }

    window.addEventListener('resize', handleResize);

    return () => {
      clearTimeout(timeout);
      cancelAnimationFrame(animationFrameRef.current);
      window.removeEventListener('resize', handleResize);
      observer?.disconnect();
    };
  }, [chartRef, draw]);

  return <canvas ref={canvasRef} className={styles.canvas} />;
}
```

3. Update `src/components/Chart/index.ts`:
```typescript
export { InflationChart } from './InflationChart';
export { RupeeCanvas } from './RupeeCanvas';
```

**Code patterns to follow:**
- Uses same ref pattern as the deleted RupeeBackground component
- Follows hook patterns from `useInflationData.ts`
- CSS module pattern consistent with other components

**Verification:**
- Component compiles without errors
- Image import works (check for TypeScript errors on png import)

**Commit:** `feat: add RupeeCanvas component for rupee note background`

---

### Task 6: Integrate RupeeCanvas into InflationChart

**Goal:** Wire up the canvas component to render behind the chart

**Files to modify:**
- `src/components/Chart/InflationChart.tsx`
- `src/components/Chart/InflationChart.module.css`

**Implementation steps:**

1. Update `src/components/Chart/InflationChart.module.css`:
```css
.chartWrapper {
  position: relative;
  width: 100%;
  height: 380px;
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.chartContainer {
  position: relative;
  width: 100%;
  height: 100%;
  z-index: 1;
}

/* Ensure ApexCharts has transparent background */
.chartContainer :global(.apexcharts-canvas) {
  background: transparent !important;
}

@media (min-width: 768px) {
  .chartWrapper {
    height: 420px;
  }
}

@media (min-width: 1024px) {
  .chartWrapper {
    height: 460px;
  }
}
```

2. Update `src/components/Chart/InflationChart.tsx`:
```tsx
import React, { useMemo, useRef } from 'react';
import Chart from 'react-apexcharts';
import { InflationDataPoint } from '../../types/inflation';
import { historicalEvents } from '../../data/historicalEvents';
import { createChartOptions, createChartSeries } from './chartConfig';
import { RupeeCanvas } from './RupeeCanvas';
import styles from './InflationChart.module.css';

interface InflationChartProps {
  data: InflationDataPoint[];
  isDarkMode: boolean;
}

export function InflationChart({ data, isDarkMode }: InflationChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);

  const chartKey = useMemo(() => {
    if (data.length === 0) return 'empty';
    return `chart-${data[0].year}-${data[data.length - 1].year}`;
  }, [data]);

  const chartOptions = useMemo(
    () => createChartOptions(data, historicalEvents, isDarkMode),
    [data, isDarkMode]
  );

  const chartSeries = useMemo(() => createChartSeries(data), [data]);

  if (data.length === 0) {
    return null;
  }

  return (
    <div className={styles.chartWrapper}>
      <RupeeCanvas data={data} chartRef={chartContainerRef} />
      <div ref={chartContainerRef} className={styles.chartContainer}>
        <Chart
          key={chartKey}
          options={chartOptions}
          series={chartSeries}
          type="area"
          height="100%"
          width="100%"
        />
      </div>
    </div>
  );
}
```

3. Update `src/components/Chart/chartConfig.ts` to ensure transparent background:

Find the `chart` config section and ensure background is transparent:
```typescript
chart: {
  id: 'rupee-inflation-chart',
  type: 'area',
  height: '100%',
  background: 'transparent',  // Ensure this is set
  // ... rest of config
}
```

**Testing:**
1. `yarn dev`
2. Load page - should see rupee note faintly visible below the inflation line
3. Change year range - canvas should update
4. Resize window - canvas should resize
5. Toggle dark mode (if system supports) - should still work

**Verification:**
- Canvas renders below chart
- Note only visible below the inflation line
- Smooth updates on data change
- No flickering or visual glitches

**Commit:** `feat: integrate RupeeCanvas into InflationChart`

---

### Task 7: Add PNG Type Declaration

**Goal:** TypeScript should recognize PNG imports

**Files to create:**
- `src/types/assets.d.ts`

**Implementation steps:**

1. Create `src/types/assets.d.ts`:
```typescript
declare module '*.png' {
  const value: string;
  export default value;
}

declare module '*.jpg' {
  const value: string;
  export default value;
}

declare module '*.jpeg' {
  const value: string;
  export default value;
}

declare module '*.svg' {
  const value: string;
  export default value;
}
```

**Verification:**
- No TypeScript errors on `import rupeeNoteUrl from '../../assets/hundred.png'`
- `yarn typecheck` passes

**Commit:** `chore: add asset type declarations`

---

### Task 8: UI Polish - Typography and Spacing

**Goal:** Refine visual design for minimal & modern aesthetic

**Files to modify:**
- `src/styles/variables.css`
- `src/App.module.css`
- `src/components/Controls/YearRangeSelector.module.css`

**Implementation steps:**

1. Update `src/styles/variables.css` - add larger heading sizes:
```css
/* Add after existing text sizes */
--text-4xl: 2.5rem;
--text-5xl: 3rem;

/* Increase spacing scale */
--space-20: 80px;
--space-24: 96px;
```

2. Update `src/App.module.css`:
```css
.app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.main {
  flex: 1;
  padding: var(--space-8) var(--space-4) var(--space-16);
}

.container {
  max-width: 900px;
  margin: 0 auto;
}

.controls {
  margin-bottom: var(--space-8);
}

.chart {
  margin-bottom: var(--space-10);
}

.stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-6);
  padding: var(--space-8);
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
}

.stat {
  text-align: center;
}

.statValue {
  display: block;
  font-size: var(--text-3xl);
  font-weight: 600;
  color: var(--color-text);
  font-family: var(--font-mono);
  letter-spacing: -0.03em;
}

.statLabel {
  display: block;
  margin-top: var(--space-2);
  font-size: var(--text-sm);
  color: var(--color-text-muted);
  line-height: 1.5;
}

@media (max-width: 640px) {
  .stats {
    grid-template-columns: 1fr;
    gap: var(--space-6);
    padding: var(--space-6);
  }

  .stat {
    padding: var(--space-3) 0;
    border-bottom: 1px solid var(--color-border-subtle);
  }

  .stat:last-child {
    border-bottom: none;
  }
}

@media (min-width: 768px) {
  .main {
    padding: var(--space-10) var(--space-8) var(--space-20);
  }

  .statValue {
    font-size: var(--text-4xl);
  }
}
```

3. Update `src/components/Controls/YearRangeSelector.module.css` (read existing first, then refine):
```css
.container {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  flex-wrap: wrap;
}

.label {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  font-weight: 500;
}

.select {
  appearance: none;
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--space-2) var(--space-4);
  padding-right: var(--space-8);
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  color: var(--color-text);
  cursor: pointer;
  transition: border-color var(--duration) var(--ease),
              box-shadow var(--duration) var(--ease);
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23525252' d='M2 4l4 4 4-4'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right var(--space-3) center;
}

.select:hover {
  border-color: var(--color-text-muted);
}

.select:focus {
  outline: none;
  border-color: var(--color-accent);
  box-shadow: 0 0 0 3px var(--color-accent-muted);
}

.separator {
  color: var(--color-text-muted);
  font-weight: 300;
}

@media (max-width: 480px) {
  .container {
    flex-direction: column;
    align-items: stretch;
  }

  .separator {
    display: none;
  }

  .label {
    justify-content: space-between;
  }

  .select {
    flex: 1;
    min-width: 100px;
  }
}
```

**Verification:**
- Layout has more breathing room
- Stats are larger and more prominent
- Dropdowns have refined styling with hover/focus states
- Mobile layout stacks properly

**Commit:** `style: polish typography, spacing, and controls`

---

### Task 9: Update Documentation

**Goal:** Update README and clean up docs for the refreshed project

**Files to modify:**
- `README.md`
- `CLAUDE.md`

**Implementation steps:**

1. Update `CLAUDE.md` - change commands section:
```markdown
## Development Commands

\`\`\`bash
yarn install      # Install dependencies
yarn dev          # Start Vite dev server on port 3000
yarn build        # Production build (outputs to /build)
yarn preview      # Preview production build locally
yarn format       # Format code with Prettier
yarn lint         # Lint TypeScript files
yarn typecheck    # Type check without emitting
\`\`\`
```

2. Update architecture section in `CLAUDE.md` to mention RupeeCanvas:
```markdown
### Key Directories

\`\`\`
src/
├── components/
│   ├── Chart/           # InflationChart, RupeeCanvas, chartConfig
│   ...
\`\`\`
```

3. Add to Key Files table:
```markdown
| `src/components/Chart/RupeeCanvas.tsx` | Canvas-based rupee note background |
```

**Verification:**
- Commands in docs match actual scripts
- Architecture docs reflect current structure

**Commit:** `docs: update for Vite migration and new components`

---

### Task 10: Final Cleanup

**Goal:** Remove any remaining CRA artifacts, verify build works

**Files to delete (if still present):**
- `public/index.html`
- `src/setupTests.ts`
- `src/App.test.tsx` (optional - can keep if tests still work)
- Any `*.d.ts` files with CRA references

**Implementation steps:**

1. Check for and remove stray CRA files:
```bash
# Check what's in public
ls -la public/

# Remove old index.html if it exists
rm -f public/index.html
```

2. Verify production build:
```bash
yarn build
```

3. Preview production build:
```bash
yarn preview
```

4. Check build output:
```bash
ls -la build/
```

**Verification:**
- `yarn build` completes without errors
- `yarn preview` serves the app correctly
- No CRA-specific warnings in console
- Chart renders with rupee note background
- Year range changes work correctly

**Commit:** `chore: final cleanup of CRA artifacts`

---

## Testing Strategy

### Manual Testing Checklist

Since this project doesn't have extensive automated tests, rely on manual verification:

| Feature | How to Test |
|---------|-------------|
| Initial load | Page loads, shows 1960-present data |
| Year range change | Change start/end year, chart updates |
| Rupee background | Note visible below line, updates on range change |
| Resize | Resize window, chart and canvas resize |
| Dark mode | Toggle system dark mode, colors update |
| Mobile | Use DevTools responsive mode, layout adjusts |
| Production build | `yarn build && yarn preview` works |

### Browser Testing

Test in:
- Chrome (primary)
- Firefox
- Safari (if on Mac)
- Mobile Chrome/Safari via DevTools

---

## Documentation Updates

| Document | Updates Needed |
|----------|---------------|
| `CLAUDE.md` | Update commands, architecture |
| `README.md` | Update setup instructions for Vite |
| `docs/brainstorms/dashboard-polish.md` | Already complete |
| `docs/plans/dashboard-polish-implementation.md` | This file |

---

## Definition of Done

- [x] Task 1: Vite config created
- [x] Task 2: Entry point migrated
- [x] Task 3: Dependencies updated, CRA removed
- [x] Task 4: Chart rendering bug fixed
- [x] Task 5: RupeeCanvas component created
- [x] Task 6: RupeeCanvas integrated
- [x] Task 7: Asset types declared
- [x] Task 8: UI polished
- [x] Task 9: Docs updated
- [x] Task 10: Final cleanup

**Final Verification:**
- [ ] `yarn dev` starts without errors
- [ ] `yarn build` completes successfully
- [ ] `yarn preview` serves working app
- [ ] Chart renders with rupee note background
- [ ] Year range changes work correctly
- [ ] No console errors
- [ ] Responsive design works
- [ ] All documentation current

---

## Using This Plan with Claude Code

This document serves as a reference. For actual implementation:

1. **Start Claude Code** in the project directory
2. **Enter plan mode** for each task: `EnterPlanMode`
3. **Reference this doc** for specific implementation details
4. **Commit after each task** with the suggested commit message
5. **Mark checkboxes** in this doc as you complete tasks

---
*Generated via /brainstorm-plan on 2026-01-06*
