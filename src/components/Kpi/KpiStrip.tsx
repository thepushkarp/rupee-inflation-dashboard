import styles from './KpiStrip.module.css';

export interface KpiStats {
  startYear: number;
  endYear: number;
  currentValue: number;
  percentLost: number;
  yearsSpan: number;
  multiplier: number;
}

interface KpiStripProps {
  stats: KpiStats;
}

export function KpiStrip({ stats }: KpiStripProps) {
  return (
    <section className={styles.strip} aria-label="Summary statistics">
      <div className={styles.card}>
        <div className={styles.label}>Value of ₹100</div>
        <div className={styles.value}>
          <span className={styles.currency}>₹</span>
          {stats.currentValue.toFixed(2)}
        </div>
        <div className={styles.meta}>
          {stats.startYear} → {stats.endYear}
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.label}>Purchasing power lost</div>
        <div className={styles.valueNegative}>{stats.percentLost.toFixed(1)}%</div>
        <div className={styles.meta}>Over {stats.yearsSpan} years</div>
      </div>

      <div className={styles.card}>
        <div className={styles.label}>More money needed</div>
        <div className={styles.value}>{stats.multiplier.toFixed(1)}×</div>
        <div className={styles.meta}>Same goods & services</div>
      </div>
    </section>
  );
}
