import { afterEach, describe, expect, it, vi } from 'vitest';
import { fetchInflationData } from './inflationApi';
import { createChartSeries } from '@components/Chart/chartConfig';

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

function response(points: { date: string; value: number | null }[], metadata = {}) {
  return new Response(JSON.stringify([metadata, points]));
}

describe('World Bank CPI', () => {
  it('preserves precision, source metadata and successful fetch time', async () => {
    vi.spyOn(Date, 'now').mockReturnValue(123456);
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        response(
          [
            { date: '2002', value: 121 },
            { date: '2000', value: 100 },
            { date: '2001', value: 110 },
            { date: '2003', value: null },
          ],
          { lastupdated: '2026-07-13' }
        )
      )
    );
    const dataset = await fetchInflationData();
    expect(dataset.fetchedAt).toBe(123456);
    expect(dataset.sourceUpdatedAt).toBe('2026-07-13');
    expect(dataset.observations.map((d) => d.year)).toEqual([2000, 2001, 2002]);
    expect(dataset.observations[1]?.cpi).toBe(110);
    expect(dataset.observations[0]?.inflationRate).toBeNull();
    expect(dataset.observations[1]?.inflationRate).toBeCloseTo(10);
    expect(createChartSeries(dataset.observations.slice(1))).toEqual([
      {
        name: 'Purchasing power',
        data: [
          { x: 2001, y: 100 },
          { x: 2002, y: (110 / 121) * 100 },
        ],
      },
    ]);
  });

  it('combines pages, ignores null years and does not label gaps as annual inflation', async () => {
    const fetchMock = vi.fn(async (url: string) =>
      new URL(url).searchParams.get('page') === '1'
        ? response(
            [
              { date: '2002', value: 125 },
              { date: '2003', value: null },
            ],
            { pages: 2 }
          )
        : response([{ date: '2000', value: 100 }], { pages: 2 })
    );
    vi.stubGlobal('fetch', fetchMock);
    const dataset = await fetchInflationData();
    expect(dataset.observations.map((d) => d.year)).toEqual([2000, 2002]);
    expect(dataset.observations[1]?.inflationRate).toBeNull();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('reports request failures with the source and HTTP status', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('', { status: 503 }))
    );
    await expect(fetchInflationData()).rejects.toThrow(
      'World Bank CPI request failed (HTTP 503, page 1)'
    );
  });

  it('rejects nonpositive CPI rather than plotting invalid purchasing power', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        response([
          { date: '2000', value: 100 },
          { date: '2001', value: 0 },
        ])
      )
    );
    await expect(fetchInflationData()).rejects.toThrow('invalid observation for 2001');
  });
});
