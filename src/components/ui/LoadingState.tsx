import styles from './ui.module.css';

export function LoadingState() {
  return (
    <section
      className={styles.loadingRoot}
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="Loading dashboard"
    >
      <p className={styles.srOnly}>Loading data…</p>
      <div className={styles.kpiSkeleton} aria-hidden="true">
        <div className={`${styles.skeletonSurface} ${styles.kpiCard}`} />
        <div className={`${styles.skeletonSurface} ${styles.kpiCard}`} />
        <div className={`${styles.skeletonSurface} ${styles.kpiCard}`} />
      </div>

      <div className={styles.panelSkeleton} aria-hidden="true">
        <div className={styles.chartColumnSkeleton}>
          <div className={`${styles.skeletonSurface} ${styles.chartSkeleton}`} />
          <div className={`${styles.skeletonSurface} ${styles.controlsSkeleton}`} />
        </div>

        <div className={`${styles.skeletonSurface} ${styles.ledgerSkeleton}`}>
          <div className={styles.ledgerHeaderSkeleton} />
          <div className={styles.ledgerRowsSkeleton}>
            <div className={styles.ledgerRowSkeleton} />
            <div className={styles.ledgerRowSkeleton} />
            <div className={styles.ledgerRowSkeleton} />
            <div className={styles.ledgerRowSkeleton} />
            <div className={styles.ledgerRowSkeleton} />
          </div>
        </div>
      </div>
    </section>
  );
}
