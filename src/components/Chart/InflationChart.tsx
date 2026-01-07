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
  // Generate a stable key from the data range to force remount on year change
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
      <Chart
        key={chartKey}
        options={chartOptions}
        series={chartSeries}
        type="area"
        height="100%"
        width="100%"
      />
    </div>
  );
}
