import { useEffect, useState } from 'react';
import useSWR from 'swr';
import { inflationFetcher } from '@services/inflationApi';
import type { InflationDataPoint, YearRange } from '@/types/inflation';

const CACHE_KEY = 'india-inflation-data';

interface UseInflationDataResult {
  data: InflationDataPoint[] | undefined;
  filteredData: InflationDataPoint[];
  isLoading: boolean;
  error: Error | undefined;
  yearRange: { min: number; max: number } | null;
  lastUpdated: number | null;
}

/**
 * Hook for fetching and managing inflation data.
 * Uses SWR for caching and automatic revalidation.
 */
export function useInflationData(range?: YearRange): UseInflationDataResult {
  const { data, error, isLoading } = useSWR<InflationDataPoint[], Error>(
    CACHE_KEY,
    inflationFetcher,
    {
      revalidateOnFocus: false, // Don't refetch when window regains focus
      revalidateOnReconnect: true, // Refetch when network reconnects
      dedupingInterval: 60000, // Dedupe requests within 1 minute
      errorRetryCount: 3, // Retry 3 times on error
    }
  );

  const [lastUpdated, setLastUpdated] = useState<number | null>(null);

  useEffect(() => {
    if (!data) return;
    setLastUpdated(Date.now());
  }, [data]);

  // Calculate available year range from data
  const yearRange = data
    ? {
        min: Math.min(...data.map((d) => d.year)),
        max: Math.max(...data.map((d) => d.year)),
      }
    : null;

  // Filter data by year range if provided
  const filteredData =
    data && range
      ? data.filter((d) => d.year >= range.startYear && d.year <= range.endYear)
      : (data ?? []);

  return {
    data,
    filteredData,
    isLoading,
    error,
    yearRange,
    lastUpdated,
  };
}
