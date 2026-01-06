import { ApexOptions } from 'apexcharts';
import { InflationDataPoint, HistoricalEvent } from '../../types/inflation';
import { findEventDataPoint } from '../../data/historicalEvents';

interface AnnotationPoint {
  x: string | number;
  y: number;
  marker?: {
    size?: number;
    fillColor?: string;
    strokeColor?: string;
    radius?: number;
  };
  label?: {
    borderColor?: string;
    offsetY?: number;
    style?: {
      color?: string;
      background?: string;
      fontSize?: string;
      fontWeight?: number | string;
      padding?: { left: number; right: number; top: number; bottom: number };
    };
    text?: string;
  };
}

function createAnnotationPoint(
  event: HistoricalEvent,
  data: InflationDataPoint[],
  baseValue: number
): AnnotationPoint | null {
  const dataPoint = findEventDataPoint(data, event.year);
  if (!dataPoint) return null;

  const normalizedValue = (dataPoint.purchasingPower / baseValue) * 100;

  return {
    x: String(event.year),
    y: normalizedValue,
    marker: {
      size: 5,
      fillColor: '#ffffff',
      strokeColor: '#1d4ed8',
      radius: 2,
    },
    label: {
      borderColor: '#dc2626',
      offsetY: event.offsetY ?? 0,
      style: {
        color: '#ffffff',
        background: '#dc2626',
        fontSize: '10px',
        fontWeight: 500,
        padding: { left: 6, right: 6, top: 3, bottom: 3 },
      },
      text: event.label,
    },
  };
}

export function createChartOptions(
  data: InflationDataPoint[],
  events: HistoricalEvent[],
  isDarkMode: boolean
): ApexOptions {
  if (data.length === 0) return {};

  const baseValue = data[0].purchasingPower;
  const textColor = isDarkMode ? '#a3a3a3' : '#525252';
  const gridColor = isDarkMode ? '#262626' : '#e5e5e5';

  const visibleYears = new Set(data.map((d) => d.year));
  const annotations = events
    .filter((e) => visibleYears.has(e.year))
    .map((e) => createAnnotationPoint(e, data, baseValue))
    .filter((a): a is NonNullable<typeof a> => a !== null);

  // Calculate tick interval based on data length to avoid crowding
  const tickInterval = data.length > 40 ? 5 : data.length > 20 ? 2 : 1;

  return {
    chart: {
      id: 'rupee-inflation-chart',
      type: 'area',
      height: '100%',
      background: 'transparent',
      toolbar: { show: false },
      zoom: { enabled: false },
      animations: {
        enabled: true,
        speed: 400,
      },
      fontFamily: 'DM Sans, sans-serif',
    },
    colors: ['#1d4ed8'],
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.25,
        opacityTo: 0.02,
        stops: [0, 100],
      },
    },
    stroke: {
      curve: 'smooth',
      width: 2.5,
    },
    dataLabels: { enabled: false },
    xaxis: {
      categories: data.map((d) => String(d.year)),
      type: 'category',
      tickAmount: Math.ceil(data.length / tickInterval),
      labels: {
        rotate: 0,
        rotateAlways: false,
        hideOverlappingLabels: true,
        style: {
          colors: textColor,
          fontSize: '11px',
          fontFamily: 'DM Sans, sans-serif',
        },
      },
      axisBorder: { color: gridColor },
      axisTicks: { color: gridColor },
    },
    yaxis: {
      min: 0,
      max: 105,
      labels: {
        formatter: (value: number) => `₹${value.toFixed(0)}`,
        style: {
          colors: textColor,
          fontSize: '11px',
          fontFamily: 'DM Sans, sans-serif',
        },
        offsetX: -5,
      },
    },
    grid: {
      borderColor: gridColor,
      strokeDashArray: 0,
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } },
      padding: { top: 0, right: 10, bottom: 0, left: 10 },
    },
    annotations: { points: annotations },
    tooltip: {
      theme: isDarkMode ? 'dark' : 'light',
      style: { fontFamily: 'DM Sans, sans-serif' },
      y: {
        formatter: (value: number) => `₹${value.toFixed(2)}`,
        title: { formatter: () => 'Value:' },
      },
    },
    responsive: [
      {
        breakpoint: 768,
        options: {
          xaxis: {
            labels: { rotate: -90, style: { fontSize: '9px' } },
          },
          annotations: { points: [] },
        },
      },
    ],
  };
}

export function createChartSeries(data: InflationDataPoint[]): ApexAxisChartSeries {
  if (data.length === 0) return [];

  const baseValue = data[0].purchasingPower;

  return [
    {
      name: 'Value',
      data: data.map((d) => (d.purchasingPower / baseValue) * 100),
    },
  ];
}
