/** Single data point representing inflation for a year */
export interface InflationDataPoint {
  year: number;
  cpi: number;
  purchasingPower: number; // What ₹100 from base year is worth now
  inflationRate: number; // Year-over-year percentage change
}

/** Year range selection for the chart */
export interface YearRange {
  startYear: number;
  endYear: number;
}

/** Historical event annotation on the chart */
export interface HistoricalEvent {
  year: number;
  label: string;
  description: string;
  offsetY?: number; // Vertical offset for label positioning
}

/** Chart dimensions for SVG calculations */
export interface ChartDimensions {
  width: number;
  height: number;
  plotArea: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

/** API response from World Bank */
export interface WorldBankResponse {
  page: number;
  pages: number;
  per_page: string;
  total: number;
}

export interface WorldBankDataPoint {
  indicator: { id: string; value: string };
  country: { id: string; value: string };
  countryiso3code: string;
  date: string;
  value: number | null;
  unit: string;
  obs_status: string;
  decimal: number;
}

/** Theme mode for dark/light mode */
export type ThemeMode = 'light' | 'dark' | 'system';

/** Loading states for the app */
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';
