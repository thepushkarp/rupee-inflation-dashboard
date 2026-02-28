import type { ApexOptions } from 'apexcharts';
import { findEventDataPoint } from '@data/historicalEvents';
import type { HistoricalEvent, InflationDataPoint } from '@/types/inflation';

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
  baseValue: number,
  isDarkMode: boolean,
  isActive: boolean
): AnnotationPoint | null {
  const dataPoint = findEventDataPoint(data, event.year);
  if (!dataPoint) return null;

  const normalizedValue = (dataPoint.purchasingPower / baseValue) * 100;

  const accent = isDarkMode ? '#38bdf8' : '#2563eb';
  const danger = '#ef4444';

  return {
    x: String(event.year),
    y: normalizedValue,
    marker: {
      size: isActive ? 7 : 5,
      fillColor: isDarkMode ? '#0c111b' : '#ffffff',
      strokeColor: isActive ? accent : accent,
      radius: 2,
    },
    label: {
      borderColor: isActive ? accent : danger,
      offsetY: event.offsetY ?? 0,
      style: {
        color: '#ffffff',
        background: isActive ? accent : danger,
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
  isDarkMode: boolean,
  activeEventYear: number | null
): ApexOptions {
  const firstPoint = data.at(0);
  if (!firstPoint) return {};

  const baseValue = firstPoint.purchasingPower;
  const textColor = isDarkMode ? '#a3a3a3' : '#525252';
  const gridColor = isDarkMode ? '#262626' : '#e5e5e5';
  const accent = isDarkMode ? '#38bdf8' : '#2563eb';

  const visibleYears = new Set(data.map((d) => d.year));
  const eventByYear = new Map(events.map((event) => [event.year, event] as const));
  const annotations = events
    .filter((e) => visibleYears.has(e.year))
    .map((e) => createAnnotationPoint(e, data, baseValue, isDarkMode, e.year === activeEventYear))
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
    colors: [accent],
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: isDarkMode ? 0.22 : 0.25,
        opacityTo: isDarkMode ? 0.05 : 0.02,
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
      custom: ({ series, seriesIndex, dataPointIndex }) => {
        const point = data[dataPointIndex];
        const year = point?.year;
        const value = series[seriesIndex]?.[dataPointIndex];
        const inflationRate = point?.inflationRate;
        const event = year ? eventByYear.get(year) : undefined;

        const background = isDarkMode ? '#0c111b' : '#ffffff';
        const border = isDarkMode ? '#1b2638' : '#e5e5e5';
        const fg = isDarkMode ? '#e6e9ef' : '#0b0f14';
        const muted = isDarkMode ? '#a6adbb' : '#525252';

        return `
          <div style="
            min-width: 180px;
            padding: 10px 12px;
            border: 1px solid ${border};
            border-radius: 10px;
            background: ${background};
            color: ${fg};
            box-shadow: 0 10px 30px rgba(0,0,0,0.18);
            font-family: var(--font-sans);
          ">
            <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;">
              <div style="font-size:12px;font-weight:650;letter-spacing:-0.02em;">${year ?? ''}</div>
              <div style="font-family: JetBrains Mono, monospace; font-size:12px; color:${muted};">CPI</div>
            </div>
            <div style="margin-top:8px;display:flex;align-items:baseline;justify-content:space-between;gap:12px;">
              <div style="font-size:12px;color:${muted};">Value of ₹100</div>
              <div style="font-family: JetBrains Mono, monospace; font-size:14px; font-weight:650;">₹${typeof value === 'number' ? value.toFixed(2) : ''}</div>
            </div>
            <div style="margin-top:6px;display:flex;align-items:baseline;justify-content:space-between;gap:12px;">
              <div style="font-size:12px;color:${muted};">YoY inflation</div>
              <div style="font-family: JetBrains Mono, monospace; font-size:12px; color:${muted};">${
                typeof inflationRate === 'number' ? `${inflationRate.toFixed(2)}%` : '—'
              }</div>
            </div>
            ${
              event
                ? `<div style="margin-top:10px;padding-top:8px;border-top:1px solid ${border};font-size:12px;color:${muted};">
                     <span style="color:${fg};font-weight:600;">${event.label}</span>
                   </div>`
                : ''
            }
          </div>
        `;
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

export function createChartSeries(data: InflationDataPoint[]): NonNullable<ApexOptions['series']> {
  const firstPoint = data.at(0);
  if (!firstPoint) return [];

  const baseValue = firstPoint.purchasingPower;

  return [
    {
      name: 'Value',
      data: data.map((d) => (d.purchasingPower / baseValue) * 100),
    },
  ];
}
