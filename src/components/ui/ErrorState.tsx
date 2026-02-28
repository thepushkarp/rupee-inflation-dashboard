import styles from './ui.module.css';

interface ErrorStateProps {
  error: Error;
  onRetry?: () => void;
}

export function ErrorState({ error, onRetry }: ErrorStateProps) {
  const worldBankUrl = 'https://data.worldbank.org/indicator/FP.CPI.TOTL?locations=IN';

  return (
    <section className={styles.errorRoot} role="alert" aria-label="Data load error">
      <div className={styles.errorHeader}>
        <h2 className={styles.errorTitle}>Unable to load inflation data</h2>
        <p className={styles.errorBody}>
          The World Bank CPI endpoint may be temporarily unavailable. Check your connection and try
          again.
        </p>
      </div>

      <div className={styles.errorActions}>
        {onRetry ? (
          <button type="button" className={styles.primaryButton} onClick={onRetry}>
            Retry
          </button>
        ) : null}

        <a
          className={styles.secondaryLink}
          href={worldBankUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          Open data source
        </a>
      </div>

      <details className={styles.errorDetails}>
        <summary className={styles.errorSummary}>Error details</summary>
        <pre className={styles.errorMessage}>{error.message}</pre>
      </details>
    </section>
  );
}
