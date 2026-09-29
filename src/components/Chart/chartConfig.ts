import type { ApexOptions } from 'apexcharts';
import type { HistoricalEvent, InflationDataPoint } from '@/types/inflation';

const ACCENT = '#68518b';

export function purchasingPower(data: InflationDataPoint[], point: InflationDataPoint): number {
  return ((data[0]?.cpi ?? point.cpi) / point.cpi) * 100;
}

export function createChartSeries(data: InflationDataPoint[]): NonNullable<ApexOptions['series']> {
  return [
    {
      name: 'Purchasing power',
      data: data.map((point) => ({ x: point.year, y: purchasingPower(data, point) })),
    },
  ];
}

export function createChartOptions(
  data: InflationDataPoint[],
  events: HistoricalEvent[],
  onRendered: () => void
): ApexOptions {
  const first = data.at(0);
  const last = data.at(-1);
  if (!first || !last) return {};
  const years = new Set(events.map((event) => event.year));
  const max = Math.max(100, ...data.map((point) => purchasingPower(data, point)));
  return {
    chart: {
      id: 'rupee-inflation-chart',
      type: 'area',
      background: 'transparent',
      toolbar: { show: false },
      zoom: { enabled: false },
      animations: { enabled: false },
      fontFamily: 'Arial, Helvetica, sans-serif',
      parentHeightOffset: 0,
      events: { mounted: onRendered, updated: onRendered },
    },
    colors: [ACCENT],
    fill: { type: 'solid', opacity: 0 },
    stroke: { curve: 'straight', width: 2 },
    dataLabels: { enabled: false },
    markers: { size: 0, hover: { sizeOffset: 0 } },
    states: { hover: { filter: { type: 'none' } }, active: { filter: { type: 'none' } } },
    xaxis: {
      type: 'numeric',
      min: first.year,
      max: last.year,
      tickAmount: Math.min(6, last.year - first.year),
      decimalsInFloat: 0,
      labels: {
        formatter: (value) => String(Math.round(Number(value))),
        style: { colors: '#706e76', fontSize: '13px' },
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
      crosshairs: { show: false },
      tooltip: { enabled: false },
    },
    yaxis: {
      min: 0,
      max: Math.ceil(max / 25) * 25,
      tickAmount: 4,
      labels: {
        formatter: (value) => '₹' + value.toFixed(0),
        minWidth: 44,
        style: { colors: '#706e76', fontSize: '13px' },
      },
    },
    grid: {
      borderColor: '#e9e7ed',
      strokeDashArray: 3,
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } },
      padding: { top: 20, right: 28, bottom: 0, left: 4 },
    },
    annotations: {
      points: [
        ...data
          .filter((point) => years.has(point.year))
          .map((point) => ({
            id: 'event-' + point.year,
            x: point.year,
            y: purchasingPower(data, point),
            marker: { size: 4, fillColor: ACCENT, strokeColor: '#ffffff', strokeWidth: 1.5 },
          })),
        {
          id: 'endpoint',
          x: last.year,
          y: purchasingPower(data, last),
          marker: { size: 4, fillColor: ACCENT, strokeColor: '#ffffff', strokeWidth: 1.5 },
          label: {
            text: '₹' + purchasingPower(data, last).toFixed(2),
            borderColor: 'transparent',
            offsetY: -8,
            offsetX: -16,
            style: {
              background: '#ffffff',
              color: ACCENT,
              fontSize: '14px',
              fontWeight: 600,
              padding: { left: 4, right: 4, top: 2, bottom: 2 },
            },
          },
        },
      ],
    },
    tooltip: {
      enabled: true,
      intersect: false,
      shared: false,
      followCursor: true,
      x: { formatter: (year) => String(Math.round(Number(year))) },
      y: { formatter: (value) => '₹' + value.toFixed(2) },
      marker: { show: false },
    },
    responsive: [
      {
        breakpoint: 640,
        options: {
          xaxis: {
            tickAmount: Math.min(3, last.year - first.year),
            labels: { style: { fontSize: '11px' } },
          },
          grid: { padding: { right: 20, left: 0 } },
        },
      },
    ],
  };
}
