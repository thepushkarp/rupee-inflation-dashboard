import React from 'react';
import styles from './ui.module.css';

interface ErrorStateProps {
  error: Error;
  onRetry?: () => void;
}

export function ErrorState({ error, onRetry }: ErrorStateProps) {
  return (
    <div className={styles.stateContainer}>
      <h2 className={styles.errorTitle}>Unable to load data</h2>
      <p className={styles.stateText}>{error.message}</p>
      {onRetry && (
        <button className={styles.retryButton} onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  );
}
