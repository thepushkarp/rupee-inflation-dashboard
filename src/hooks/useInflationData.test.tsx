import type { ReactNode } from 'react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { SWRConfig } from 'swr';
import { afterEach, expect, it, vi } from 'vitest';
import { useInflationData } from './useInflationData';
import type { YearRange } from '@/types/inflation';

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

function wrapper() {
  const cache = new Map();
  return ({ children }: { children: ReactNode }) => (
    <SWRConfig value={{ provider: () => cache, shouldRetryOnError: false }}>{children}</SWRConfig>
  );
}

function mockResponse(newYear = false) {
  return new Response(
    JSON.stringify([
      { lastupdated: '2026-07-13' },
      [
        { date: '2023', value: 100 },
        { date: '2024', value: 110 },
        ...(newYear ? [{ date: '2025', value: 120 }] : []),
      ],
    ])
  );
}

it('advances full history with new observations and preserves an explicit range', async () => {
  let newYear = false;
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => mockResponse(newYear))
  );
  const { result, rerender } = renderHook(
    ({ range }: { range: YearRange | undefined }) => useInflationData(range),
    {
      initialProps: { range: undefined as YearRange | undefined },
      wrapper: wrapper(),
    }
  );
  await waitFor(() => expect(result.current.effectiveRange?.endYear).toBe(2024));
  newYear = true;
  await act(async () => {
    await result.current.retry();
  });
  expect(result.current.effectiveRange?.endYear).toBe(2025);
  rerender({ range: { startYear: 2023, endYear: 2024 } });
  await act(async () => {
    await result.current.retry();
  });
  expect(result.current.filteredData.map((d) => d.year)).toEqual([2023, 2024]);
  expect(result.current.yearRange?.max).toBe(2025);
});

it('keeps cached observations and timestamp on refresh failure, then recovers', async () => {
  let fail = false;
  vi.spyOn(Date, 'now').mockReturnValue(1000);
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => {
      if (fail) throw new Error('Network unavailable');
      return mockResponse();
    })
  );
  const { result } = renderHook(() => useInflationData(), { wrapper: wrapper() });
  await waitFor(() => expect(result.current.data?.fetchedAt).toBe(1000));
  fail = true;
  vi.spyOn(Date, 'now').mockReturnValue(2000);
  await act(async () => {
    await result.current.retry();
  });
  expect(result.current.data?.fetchedAt).toBe(1000);
  expect(result.current.filteredData).toHaveLength(2);
  expect(result.current.error?.message).toBe('Network unavailable');
  fail = false;
  await act(async () => {
    await result.current.retry();
  });
  expect(result.current.data?.fetchedAt).toBe(2000);
  expect(result.current.error).toBeUndefined();
});
