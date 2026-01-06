import React, { useState, useMemo } from 'react';
import { useInflationData } from './hooks/useInflationData';
import { useTheme } from './hooks/useTheme';
import { Header, Footer } from './components/Layout';
import { InflationChart } from './components/Chart';
import { YearRangeSelector } from './components/Controls';
import { LoadingState, ErrorState } from './components/ui';
import { YearRange } from './types/inflation';
import { mutate } from 'swr';
import './styles/global.css';
import styles from './App.module.css';

function App() {
  const { theme } = useTheme();
  const { data, isLoading, error, yearRange: availableRange } = useInflationData();
  const [yearRange, setYearRange] = useState<YearRange | null>(null);

  const effectiveRange = useMemo(() => {
    if (!availableRange) return null;
    return yearRange ?? { startYear: availableRange.min, endYear: availableRange.max };
  }, [availableRange, yearRange]);

  const chartData = useMemo(() => {
    if (!data || !effectiveRange) return [];
    return data.filter(
      (d) => d.year >= effectiveRange.startYear && d.year <= effectiveRange.endYear
    );
  }, [data, effectiveRange]);

  const stats = useMemo(() => {
    if (chartData.length === 0) return null;

    const firstPoint = chartData[0];
    const lastPoint = chartData[chartData.length - 1];

    // Calculate value relative to the SELECTED start year, not 1960
    // If ₹100 from startYear, what is it worth in endYear?
    const relativeValue = (lastPoint.purchasingPower / firstPoint.purchasingPower) * 100;
    const percentLost = 100 - relativeValue;
    const multiplier = 100 / relativeValue;

    return {
      startYear: firstPoint.year,
      endYear: lastPoint.year,
      currentValue: relativeValue.toFixed(2),
      percentLost: percentLost.toFixed(1),
      yearsSpan: lastPoint.year - firstPoint.year,
      multiplier: multiplier.toFixed(1),
    };
  }, [chartData]);

  return (
    <div className={styles.app}>
      <Header />

      <main className={styles.main}>
        <div className={styles.container}>
          {isLoading && <LoadingState />}

          {error && <ErrorState error={error} onRetry={() => mutate('india-inflation-data')} />}

          {!isLoading && !error && chartData.length > 0 && effectiveRange && availableRange && (
            <>
              <div className={styles.controls}>
                <YearRangeSelector
                  yearRange={effectiveRange}
                  availableRange={availableRange}
                  onChange={setYearRange}
                />
              </div>

              <div className={styles.chart}>
                <InflationChart data={chartData} isDarkMode={theme === 'dark'} />
              </div>

              {stats && (
                <div className={styles.stats}>
                  <div className={styles.stat}>
                    <span className={styles.statValue}>₹{stats.currentValue}</span>
                    <span className={styles.statLabel}>
                      Value of ₹100 from {stats.startYear} in {stats.endYear}
                    </span>
                  </div>
                  <div className={styles.stat}>
                    <span className={styles.statValue}>{stats.percentLost}%</span>
                    <span className={styles.statLabel}>
                      Purchasing power lost over {stats.yearsSpan} years
                    </span>
                  </div>
                  <div className={styles.stat}>
                    <span className={styles.statValue}>{stats.multiplier}×</span>
                    <span className={styles.statLabel}>
                      More money needed today for the same goods
                    </span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default App;
