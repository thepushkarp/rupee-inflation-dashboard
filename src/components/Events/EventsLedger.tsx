import type { HistoricalEvent } from '@/types/inflation';

import styles from './EventsLedger.module.css';

interface EventsLedgerProps {
  events: HistoricalEvent[];
  activeYear: number | null;
  onSelect: (year: number | null) => void;
}

export function EventsLedger({ events, activeYear, onSelect }: EventsLedgerProps) {
  const activeEvent = activeYear ? events.find((event) => event.year === activeYear) : undefined;

  return (
    <aside className={styles.ledger} aria-label="Historical events ledger">
      <div className={styles.header}>
        <div className={styles.headerTitle}>Event ledger</div>
        <div className={styles.headerHint}>Click a row to highlight the chart</div>
      </div>

      <div className={styles.list} role="list">
        {events.length === 0 ? (
          <div className={styles.empty}>No annotated events in this range.</div>
        ) : (
          events.map((event) => {
            const isActive = activeYear === event.year;
            return (
              <button
                key={event.year}
                type="button"
                className={isActive ? styles.rowActive : styles.row}
                onClick={() => onSelect(isActive ? null : event.year)}
                aria-pressed={isActive}
              >
                <div className={styles.year}>{event.year}</div>
                <div className={styles.rowBody}>
                  <div className={styles.label}>{event.label}</div>
                  <div className={styles.desc}>{event.description}</div>
                </div>
              </button>
            );
          })
        )}
      </div>

      {activeEvent ? (
        <div className={styles.detail} aria-live="polite">
          <div className={styles.detailTitle}>
            {activeEvent.year} — {activeEvent.label}
          </div>
          <div className={styles.detailText}>{activeEvent.description}</div>
          <button type="button" className={styles.clear} onClick={() => onSelect(null)}>
            Clear highlight
          </button>
        </div>
      ) : null}
    </aside>
  );
}
