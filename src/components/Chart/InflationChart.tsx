import { lazy, Suspense, useMemo } from 'react';

import { historicalEvents } from '@data/historicalEvents';
import type { InflationDataPoint } from '@/types/inflation';

import { createChartOptions, createChartSeries } from './chartConfig';
import styles from './InflationChart.module.css';

const ApexChart = lazy(async () => {
  const module = await import('react-apexcharts');
  return { default: module.default };
});

interface InflationChartProps {
  data: InflationDataPoint[];
  isDarkMode: boolean;
  activeEventYear: number | null;
}

export function InflationChart({ data, isDarkMode, activeEventYear }: InflationChartProps) {
  // Generate a stable key from the data range to force remount on year change
  const chartKey = useMemo(() => {
    const firstPoint = data.at(0);
    const lastPoint = data.at(-1);
    if (!firstPoint || !lastPoint) return 'empty';
    return `chart-${firstPoint.year}-${lastPoint.year}`;
  }, [data]);

  const chartOptions = useMemo(
    () => createChartOptions(data, historicalEvents, isDarkMode, activeEventYear),
    [activeEventYear, data, isDarkMode]
  );

  const chartSeries = useMemo(() => createChartSeries(data), [data]);

  if (data.length === 0) {
    return null;
  }

  return (
    <div className={styles.chartWrapper}>
      <Suspense fallback={<div className={styles.chartSkeleton} aria-hidden="true" />}>
        <ApexChart
          key={chartKey}
          options={chartOptions}
          series={chartSeries}
          type="area"
          height="100%"
          width="100%"
        />
      </Suspense>
    </div>
  );
}
