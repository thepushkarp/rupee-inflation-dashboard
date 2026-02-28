import { useEffect, useMemo, useState } from 'react';
import { mutate } from 'swr';

import { InflationChart } from '@components/Chart';
import { RangePresets, YearRangeSelector } from '@components/Controls';
import { EventsLedger } from '@components/Events/EventsLedger';
import { KpiStrip } from '@components/Kpi/KpiStrip';
import { Footer } from '@components/Layout/Footer';
import { TopBar } from '@components/Layout/TopBar';
import { ErrorState, LoadingState } from '@components/ui';
import { useInflationData } from '@hooks/useInflationData';
import { useTheme } from '@hooks/useTheme';
import { historicalEvents } from '@data/historicalEvents';
import type { YearRange } from '@/types/inflation';

import styles from './App.module.css';

function App() {
  const { theme, toggleTheme } = useTheme();
  const [selectedRange, setSelectedRange] = useState<YearRange | null>(null);
  const [activeEventYear, setActiveEventYear] = useState<number | null>(null);
  const {
    data,
    filteredData: chartData,
    isLoading,
    error,
    yearRange: availableRange,
    lastUpdated,
  } = useInflationData(selectedRange ?? undefined);

  const effectiveRange = useMemo(() => {
    if (!availableRange) return null;
    return selectedRange ?? { startYear: availableRange.min, endYear: availableRange.max };
  }, [availableRange, selectedRange]);

  const visibleEvents = useMemo(() => {
    if (!effectiveRange) return [];
    return historicalEvents.filter(
      (event) => event.year >= effectiveRange.startYear && event.year <= effectiveRange.endYear
    );
  }, [effectiveRange]);

  useEffect(() => {
    if (!activeEventYear || !effectiveRange) return;
    const inRange =
      activeEventYear >= effectiveRange.startYear && activeEventYear <= effectiveRange.endYear;
    if (!inRange) setActiveEventYear(null);
  }, [activeEventYear, effectiveRange]);

  const stats = useMemo(() => {
    if (chartData.length === 0) return null;

    const firstPoint = chartData.at(0);
    const lastPoint = chartData.at(-1);
    if (!firstPoint || !lastPoint) return null;

    // Calculate value relative to the SELECTED start year, not 1960
    // If ₹100 from startYear, what is it worth in endYear?
    const relativeValue = (lastPoint.purchasingPower / firstPoint.purchasingPower) * 100;
    const currentValue = Math.round(relativeValue * 100) / 100;
    const percentLost = Math.round((100 - relativeValue) * 10) / 10;
    const multiplier = currentValue === 0 ? 0 : Math.round((100 / currentValue) * 10) / 10;

    return {
      startYear: firstPoint.year,
      endYear: lastPoint.year,
      currentValue,
      percentLost,
      yearsSpan: lastPoint.year - firstPoint.year,
      multiplier,
    };
  }, [chartData]);

  return (
    <div className={styles.app}>
      <TopBar
        theme={theme}
        onToggleTheme={toggleTheme}
        lastUpdated={lastUpdated}
        {...(availableRange ? { dataThroughYear: availableRange.max } : {})}
      />

      <main className={styles.main}>
        <div className={styles.shell}>
          {isLoading ? <LoadingState /> : null}

          {error ? (
            <ErrorState error={error} onRetry={() => mutate('india-inflation-data')} />
          ) : null}

          {!isLoading && !error && data && effectiveRange && availableRange ? (
            <>
              {stats ? <KpiStrip stats={stats} /> : null}

              <section className={styles.panel} aria-label="Inflation chart and historical context">
                <div className={styles.chartColumn}>
                  <InflationChart
                    data={chartData}
                    isDarkMode={theme === 'dark'}
                    activeEventYear={activeEventYear}
                  />

                  <div className={styles.controlsRow}>
                    <YearRangeSelector
                      yearRange={effectiveRange}
                      availableRange={availableRange}
                      onChange={setSelectedRange}
                    />
                    <RangePresets
                      availableRange={availableRange}
                      activeRange={effectiveRange}
                      onSelect={setSelectedRange}
                    />
                  </div>

                  {stats ? (
                    <p className={styles.summary}>
                      From {stats.startYear} to {stats.endYear}, ₹100 becomes ₹
                      {stats.currentValue.toFixed(2)} ({stats.percentLost.toFixed(1)}% loss).
                    </p>
                  ) : null}
                </div>

                <div className={styles.ledgerColumn}>
                  <EventsLedger
                    events={visibleEvents}
                    activeYear={activeEventYear}
                    onSelect={setActiveEventYear}
                  />
                </div>
              </section>
            </>
          ) : null}
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default App;
