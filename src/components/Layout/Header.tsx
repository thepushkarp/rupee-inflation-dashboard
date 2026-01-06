import React from 'react';
import styles from './Layout.module.css';

export function Header() {
  return (
    <header className={styles.header}>
      <h1 className={styles.title}>Rupee Inflation Dashboard</h1>
      <p className={styles.subtitle}>
        How the purchasing power of ₹100 has changed over time
      </p>
    </header>
  );
}
