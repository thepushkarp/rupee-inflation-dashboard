import React, { useRef, useMemo } from 'react';
import Chart from 'react-apexcharts';
import { InflationDataPoint } from '../../types/inflation';
import { historicalEvents } from '../../data/historicalEvents';
import { createChartOptions, createChartSeries } from './chartConfig';
import { RupeeBackground } from './RupeeBackground';
import styles from './InflationChart.module.css';

interface InflationChartProps {
  data: InflationDataPoint[];
  isDarkMode: boolean;
}

export function InflationChart({ data, isDarkMode }: InflationChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);

  const chartOptions = useMemo(
    () => createChartOptions(data, historicalEvents, isDarkMode),
    [data, isDarkMode]
  );

  const chartSeries = useMemo(() => createChartSeries(data), [data]);

  if (data.length === 0) {
    return null;
  }

  return (
    <div className={styles.chartWrapper} ref={chartContainerRef}>
      <RupeeBackground data={data} chartRef={chartContainerRef} />
      <div className={styles.chartContainer}>
        <Chart
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
