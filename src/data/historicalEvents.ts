import type { HistoricalEvent } from '@/types/inflation';

/**
 * Historical events to annotate on the inflation chart.
 * Using year-based lookup instead of fragile array indices.
 */
export const historicalEvents: HistoricalEvent[] = [
  {
    year: 1969,
    label: 'Bank Nationalisation',
    description: 'Nationalisation of 14 major commercial banks by Indira Gandhi',
    offsetY: 0,
  },
  {
    year: 1971,
    label: 'Economic Liberalisation',
    description: 'Beginning of economic reforms and Indo-Soviet Treaty',
    offsetY: 40,
  },
  {
    year: 1991,
    label: 'LPG Reforms',
    description: 'Liberalisation, Privatisation, and Globalisation reforms',
    offsetY: 0,
  },
  {
    year: 2008,
    label: 'Global Financial Crisis',
    description: 'Worldwide economic downturn following US subprime crisis',
    offsetY: 40,
  },
  {
    year: 2016,
    label: 'Demonetisation & GST',
    description: 'Currency demonetisation and Goods & Services Tax introduction',
    offsetY: 0,
  },
  {
    year: 2020,
    label: 'COVID-19',
    description: 'Global pandemic causing economic disruption',
    offsetY: 40,
  },
];

/**
 * Find data point for a historical event by year.
 * This replaces the brittle hard-coded index approach.
 */
export function findEventDataPoint<T extends { year: number }>(
  data: T[],
  year: number
): T | undefined {
  return data.find((d) => d.year === year);
}
