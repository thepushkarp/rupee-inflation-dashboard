import { afterEach, describe, expect, it, vi } from 'vitest';

import { fetchInflationData } from './inflationApi';

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('fetchInflationData', () => {
  it('throws when the World Bank API responds with a non-OK status', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({ ok: false, status: 500 }) as unknown as Response)
    );

    await expect(fetchInflationData()).rejects.toThrow('World Bank API error: 500');
  });

  it('filters null CPI values, sorts by year, and computes purchasing power + inflation rate', async () => {
    const rawData = [
      {
        indicator: { id: 'FP.CPI.TOTL', value: 'CPI' },
        country: { id: 'IN', value: 'India' },
        countryiso3code: 'IND',
        date: '1961',
        value: 110,
        unit: '',
        obs_status: '',
        decimal: 0,
      },
      {
        indicator: { id: 'FP.CPI.TOTL', value: 'CPI' },
        country: { id: 'IN', value: 'India' },
        countryiso3code: 'IND',
        date: '1960',
        value: 100,
        unit: '',
        obs_status: '',
        decimal: 0,
      },
      {
        indicator: { id: 'FP.CPI.TOTL', value: 'CPI' },
        country: { id: 'IN', value: 'India' },
        countryiso3code: 'IND',
        date: '1962',
        value: null,
        unit: '',
        obs_status: '',
        decimal: 0,
      },
      {
        indicator: { id: 'FP.CPI.TOTL', value: 'CPI' },
        country: { id: 'IN', value: 'India' },
        countryiso3code: 'IND',
        date: '1962',
        value: 121,
        unit: '',
        obs_status: '',
        decimal: 0,
      },
    ];

    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({ ok: true, json: async () => [{}, rawData] }) as unknown as Response)
    );

    const data = await fetchInflationData();

    expect(data.map((d) => d.year)).toEqual([1960, 1961, 1962]);
    expect(data.map((d) => d.cpi)).toEqual([100, 110, 121]);

    expect(data[0]?.purchasingPower).toBe(100);
    expect(data[1]?.purchasingPower).toBe(90.91);
    expect(data[2]?.purchasingPower).toBe(82.64);

    expect(data[0]?.inflationRate).toBe(0);
    expect(data[1]?.inflationRate).toBe(10);
    expect(data[2]?.inflationRate).toBe(10);
  });

  it('combines all pages when the API response is paginated', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: string | URL | Request) => {
        const rawUrl =
          typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
        const page = Number.parseInt(new URL(rawUrl).searchParams.get('page') ?? '1', 10);

        if (page === 1) {
          return {
            ok: true,
            json: async () => [
              { page: 1, pages: 2, per_page: '2', total: 4 },
              [
                {
                  indicator: { id: 'FP.CPI.TOTL', value: 'CPI' },
                  country: { id: 'IN', value: 'India' },
                  countryiso3code: 'IND',
                  date: '1961',
                  value: 110,
                  unit: '',
                  obs_status: '',
                  decimal: 0,
                },
              ],
            ],
          } as unknown as Response;
        }

        return {
          ok: true,
          json: async () => [
            { page: 2, pages: 2, per_page: '2', total: 4 },
            [
              {
                indicator: { id: 'FP.CPI.TOTL', value: 'CPI' },
                country: { id: 'IN', value: 'India' },
                countryiso3code: 'IND',
                date: '1960',
                value: 100,
                unit: '',
                obs_status: '',
                decimal: 0,
              },
            ],
          ],
        } as unknown as Response;
      })
    );

    const data = await fetchInflationData();

    expect(data.map((point) => point.year)).toEqual([1960, 1961]);
    expect(data.map((point) => point.cpi)).toEqual([100, 110]);
    expect(fetch).toHaveBeenCalledTimes(2);
  });
});
