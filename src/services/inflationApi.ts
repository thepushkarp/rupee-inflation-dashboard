import type { InflationDataPoint, WorldBankDataPoint, WorldBankResponse } from '@/types/inflation';

const WORLD_BANK_API = 'https://api.worldbank.org/v2';
const INDIA_CODE = 'IN';
const CPI_INDICATOR = 'FP.CPI.TOTL'; // Consumer Price Index (2010 = 100)
const START_YEAR = 1960;
const PAGE_SIZE = 100;

function createInflationApiUrl(currentYear: number, page = 1): string {
  return `${WORLD_BANK_API}/country/${INDIA_CODE}/indicator/${CPI_INDICATOR}?format=json&per_page=${PAGE_SIZE}&date=${START_YEAR}:${currentYear}&page=${page}`;
}

async function fetchInflationPage(
  currentYear: number,
  page: number
): Promise<[WorldBankResponse, WorldBankDataPoint[]]> {
  const response = await fetch(createInflationApiUrl(currentYear, page));
  if (!response.ok) {
    throw new Error(`World Bank API error: ${response.status}`);
  }

  const json: unknown = await response.json();
  if (!Array.isArray(json) || json.length < 2) {
    throw new Error('Unexpected response format from World Bank API');
  }

  const metadata = json[0] as WorldBankResponse;
  const pageData = Array.isArray(json[1]) ? (json[1] as WorldBankDataPoint[]) : [];
  return [metadata, pageData];
}

/**
 * Fetches Consumer Price Index data from World Bank API.
 * CPI is indexed to 2010 = 100, so we calculate purchasing power relative to 1960.
 */
export async function fetchInflationData(): Promise<InflationDataPoint[]> {
  const currentYear = new Date().getFullYear();
  const [metadata, firstPageData] = await fetchInflationPage(currentYear, 1);
  const totalPages = Math.max(1, Number.parseInt(String(metadata.pages), 10) || 1);
  const rawDataByPage: WorldBankDataPoint[][] = [firstPageData];

  if (totalPages > 1) {
    const remainingPages = await Promise.all(
      Array.from({ length: totalPages - 1 }, (_, index) =>
        fetchInflationPage(currentYear, index + 2)
      )
    );
    for (const [, pageData] of remainingPages) {
      rawDataByPage.push(pageData);
    }
  }

  const rawData = rawDataByPage.flat();

  if (!rawData || rawData.length === 0) {
    throw new Error('No inflation data received from World Bank API');
  }

  // Filter out null values and sort by year ascending
  const validData = rawData
    .filter((d) => d.value !== null)
    .sort((a, b) => Number.parseInt(a.date, 10) - Number.parseInt(b.date, 10));

  if (validData.length === 0) {
    throw new Error('No valid inflation data points');
  }

  // Get base CPI (earliest year in our data)
  const baseCPI = validData.at(0)?.value;
  if (baseCPI === undefined || baseCPI === null) {
    throw new Error('No valid inflation data points');
  }

  // Transform to our data structure
  const inflationData: InflationDataPoint[] = validData.map((d, index) => {
    const currentCPI = d.value!;
    const year = Number.parseInt(d.date, 10);

    // Purchasing power: What ₹100 from base year can buy today
    // If CPI doubled, ₹100 can only buy what ₹50 could before
    const purchasingPower = (baseCPI / currentCPI) * 100;

    // Inflation rate (year-over-year change)
    let inflationRate = 0;
    if (index > 0) {
      const prevCPI = validData.at(index - 1)?.value;
      if (prevCPI !== undefined && prevCPI !== null) {
        inflationRate = ((currentCPI - prevCPI) / prevCPI) * 100;
      }
    }

    return {
      year,
      cpi: currentCPI,
      purchasingPower: Math.round(purchasingPower * 100) / 100,
      inflationRate: Math.round(inflationRate * 100) / 100,
    };
  });

  return inflationData;
}

/**
 * SWR fetcher function
 */
export const inflationFetcher = () => fetchInflationData();
