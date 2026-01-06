import React from 'react';
import styles from './Layout.module.css';

export function Footer() {
  return (
    <footer className={styles.footer}>
      <p>
        Data from{' '}
        <a
          href="https://data.worldbank.org/indicator/FP.CPI.TOTL?locations=IN"
          target="_blank"
          rel="noopener noreferrer"
        >
          World Bank
        </a>
        {' · '}
        Built by{' '}
        <a
          href="https://thepushkarp.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          Pushkar Patel
        </a>
        {' · '}
        <a
          href="https://github.com/thepushkarp/rupee-inflation-dashboard"
          target="_blank"
          rel="noopener noreferrer"
        >
          Source
        </a>
      </p>
    </footer>
  );
}
