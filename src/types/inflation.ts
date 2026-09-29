/** Annual CPI observation. Display rounding belongs at the UI boundary. */
export interface InflationDataPoint {
  year: number;
  cpi: number;
  inflationRate: number | null;
}

export interface InflationDataset {
  observations: InflationDataPoint[];
  fetchedAt: number;
  sourceUpdatedAt: string | null;
}

export interface YearRange {
  startYear: number;
  endYear: number;
}

export interface HistoricalEvent {
  year: number;
  label: string;
  impact: string;
  sources: { label: string; url: string }[];
}

export interface WorldBankResponse {
  page: number;
  pages: number;
  per_page: string;
  total: number;
  lastupdated?: string;
}

export interface WorldBankDataPoint {
  date: string;
  value: number | null;
}
