import { InflationDataPoint, WorldBankDataPoint } from '../types/inflation';

const WORLD_BANK_API = 'https://api.worldbank.org/v2';
const INDIA_CODE = 'IN';
const CPI_INDICATOR = 'FP.CPI.TOTL'; // Consumer Price Index (2010 = 100)

/**
 * Fetches Consumer Price Index data from World Bank API.
 * CPI is indexed to 2010 = 100, so we calculate purchasing power relative to 1960.
 */
export async function fetchInflationData(): Promise<InflationDataPoint[]> {
  const url = `${WORLD_BANK_API}/country/${INDIA_CODE}/indicator/${CPI_INDICATOR}?format=json&per_page=100&date=1960:2024`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`World Bank API error: ${response.status}`);
  }

  const json = await response.json();

  // World Bank returns [metadata, data] array
  const rawData: WorldBankDataPoint[] = json[1];

  if (!rawData || rawData.length === 0) {
    throw new Error('No inflation data received from World Bank API');
  }

  // Filter out null values and sort by year ascending
  const validData = rawData
    .filter((d) => d.value !== null)
    .sort((a, b) => parseInt(a.date) - parseInt(b.date));

  if (validData.length === 0) {
    throw new Error('No valid inflation data points');
  }

  // Get base CPI (earliest year in our data)
  const baseCPI = validData[0].value!;

  // Transform to our data structure
  const inflationData: InflationDataPoint[] = validData.map((d, index) => {
    const currentCPI = d.value!;
    const year = parseInt(d.date);

    // Purchasing power: What ₹100 from base year can buy today
    // If CPI doubled, ₹100 can only buy what ₹50 could before
    const purchasingPower = (baseCPI / currentCPI) * 100;

    // Inflation rate (year-over-year change)
    let inflationRate = 0;
    if (index > 0) {
      const prevCPI = validData[index - 1].value!;
      inflationRate = ((currentCPI - prevCPI) / prevCPI) * 100;
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
