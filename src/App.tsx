import { useState } from 'react';
import { InflationChart } from '@components/Chart';
import { YearRangeSelector } from '@components/Controls';
import { ErrorState, LoadingState } from '@components/ui';
import { useInflationData } from '@hooks/useInflationData';
import type { YearRange } from '@/types/inflation';
import styles from './App.module.css';

function App() {
  const [selectedRange, setSelectedRange] = useState<YearRange | null>(null);
  const { data, filteredData, yearRange, effectiveRange, error, isLoading, isValidating, retry } =
    useInflationData(selectedRange ?? undefined);
  const checked = data
    ? new Intl.DateTimeFormat(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(data.fetchedAt)
    : null;

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <h1>Rupee Inflation</h1>
        {yearRange ? <span>Annual CPI through {yearRange.max}</span> : null}
      </header>
      <main>
        {!data && isLoading ? <LoadingState /> : null}
        {!data && error ? <ErrorState error={error} onRetry={() => void retry()} /> : null}
        {data && yearRange && effectiveRange ? (
          <>
            <div className={styles.controls}>
              <YearRangeSelector
                yearRange={effectiveRange}
                availableRange={yearRange}
                onChange={setSelectedRange}
              />
              <button className={styles.reset} type="button" onClick={() => setSelectedRange(null)}>
                Full history
              </button>
            </div>
            {error ? (
              <p className={styles.notice} role="status">
                Couldn’t refresh. Showing the last available data.{' '}
                <button type="button" disabled={isValidating} onClick={() => void retry()}>
                  Retry
                </button>
              </p>
            ) : null}
            {filteredData.length >= 2 ? (
              <InflationChart data={filteredData} />
            ) : (
              <p className={styles.notice}>
                No data for this range. Choose another period or reset to full history.
              </p>
            )}
          </>
        ) : null}
      </main>
      <footer className={styles.footer}>
        <div className={styles.source}>
          <a
            href="https://data.worldbank.org/indicator/FP.CPI.TOTL?locations=IN"
            target="_blank"
            rel="noreferrer"
          >
            World Bank CPI
          </a>
          {checked ? (
            <span
              title={
                data?.sourceUpdatedAt
                  ? `World Bank dataset updated ${data.sourceUpdatedAt}`
                  : undefined
              }
            >
              Last checked <time dateTime={new Date(data!.fetchedAt).toISOString()}>{checked}</time>
            </span>
          ) : null}
        </div>
        <div className={styles.credits}>
          <span>
            Note:{' '}
            <a
              href="https://commons.wikimedia.org/wiki/File:Rs_100_note_front_view.jpg"
              target="_blank"
              rel="noreferrer"
            >
              RBI
            </a>
            ,{' '}
            <a
              href="https://data.gov.in/government-open-data-license-india"
              target="_blank"
              rel="noreferrer"
            >
              GODL India
            </a>
          </span>
          <span>
            Made by{' '}
            <a href="https://www.thepushkarp.com/" target="_blank" rel="noreferrer">
              Pushkar
            </a>
          </span>
        </div>
      </footer>
    </div>
  );
}
export default App;
