import React from 'react';
import styles from './ui.module.css';

export function LoadingState() {
  return (
    <div className={styles.stateContainer}>
      <div className={styles.loader} />
      <p className={styles.stateText}>Loading data...</p>
    </div>
  );
}
