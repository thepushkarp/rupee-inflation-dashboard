import type { InflationDataset, WorldBankDataPoint, WorldBankResponse } from '@/types/inflation';

const ENDPOINT = 'https://api.worldbank.org/v2/country/IN/indicator/FP.CPI.TOTL';

async function fetchPage(currentYear: number, page: number) {
  const url = `${ENDPOINT}?format=json&per_page=100&date=1960:${currentYear}&page=${page}`;
  const response = await fetch(url, { signal: AbortSignal.timeout(20000) });
  if (!response.ok)
    throw new Error(`World Bank CPI request failed (HTTP ${response.status}, page ${page}).`);
  const json: unknown = await response.json();
  if (!Array.isArray(json) || !json[0] || !Array.isArray(json[1])) {
    throw new Error(`World Bank CPI returned an invalid response on page ${page}.`);
  }
  return json as [WorldBankResponse, WorldBankDataPoint[]];
}

export async function fetchInflationData(): Promise<InflationDataset> {
  const currentYear = new Date().getFullYear();
  const [metadata, firstPage] = await fetchPage(currentYear, 1);
  const pages = Number(metadata.pages ?? 1);
  if (!Number.isInteger(pages) || pages < 1 || pages > 100) {
    throw new Error('World Bank CPI returned invalid pagination.');
  }
  const remaining = await Promise.all(
    Array.from({ length: pages - 1 }, (_, i) => fetchPage(currentYear, i + 2))
  );
  const byYear = new Map<number, number>();
  for (const point of [...firstPage, ...remaining.flatMap(([, points]) => points)]) {
    if (point.value === null) continue;
    const year = Number(point.date);
    if (
      !Number.isInteger(year) ||
      year < 1960 ||
      year > currentYear ||
      typeof point.value !== 'number' ||
      !Number.isFinite(point.value) ||
      point.value <= 0
    ) {
      throw new Error(`World Bank CPI returned an invalid observation for ${point.date}.`);
    }
    if (byYear.has(year) && byYear.get(year) !== point.value) {
      throw new Error(`World Bank CPI returned conflicting observations for ${year}.`);
    }
    byYear.set(year, point.value);
  }
  const points = [...byYear].sort(([a], [b]) => a - b);
  if (points.length < 2) throw new Error('World Bank CPI returned fewer than two valid years.');
  return {
    observations: points.map(([year, cpi], index) => {
      const previous = points[index - 1];
      return {
        year,
        cpi,
        inflationRate: previous && previous[0] === year - 1 ? (cpi / previous[1] - 1) * 100 : null,
      };
    }),
    fetchedAt: Date.now(),
    sourceUpdatedAt: typeof metadata.lastupdated === 'string' ? metadata.lastupdated : null,
  };
}

export const inflationFetcher = fetchInflationData;
