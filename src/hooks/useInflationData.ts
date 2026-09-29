import { useMemo } from 'react';
import useSWR from 'swr';
import { inflationFetcher } from '@services/inflationApi';
import type { InflationDataset, YearRange } from '@/types/inflation';

export const INFLATION_CACHE_KEY = 'india-inflation-data';
export const REFRESH_INTERVAL = 6 * 60 * 60 * 1000;

export function useInflationData(range?: YearRange) {
  const { data, error, isLoading, isValidating, mutate } = useSWR<InflationDataset, Error>(
    INFLATION_CACHE_KEY,
    inflationFetcher,
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      refreshInterval: REFRESH_INTERVAL,
      refreshWhenHidden: false,
      refreshWhenOffline: false,
      dedupingInterval: 60000,
      errorRetryCount: 3,
    }
  );
  const observations = data?.observations;
  const first = observations?.at(0);
  const last = observations?.at(-1);
  const yearRange = first && last ? { min: first.year, max: last.year } : null;
  const effectiveRange = yearRange
    ? (range ?? {
        startYear: yearRange.min,
        endYear: yearRange.max,
      })
    : null;
  const filteredData = useMemo(
    () =>
      observations?.filter(
        (point) => !range || (point.year >= range.startYear && point.year <= range.endYear)
      ) ?? [],
    [observations, range]
  );

  // Keep cached observations on retry; request errors are exposed through SWR state.
  const retry = () => mutate(undefined, { populateCache: false, throwOnError: false });
  return { data, filteredData, yearRange, effectiveRange, error, isLoading, isValidating, retry };
}
