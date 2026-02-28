import styles from './Layout.module.css';

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerInner}>
        <span className={styles.footerItem}>
          Data:{' '}
          <a
            href="https://data.worldbank.org/indicator/FP.CPI.TOTL?locations=IN"
            target="_blank"
            rel="noopener noreferrer"
          >
            World Bank CPI
          </a>
        </span>

        <span className={styles.footerSep} aria-hidden="true">
          •
        </span>

        <a
          className={styles.footerItem}
          href="https://thepushkarp.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          Pushkar Patel
        </a>
      </div>
    </footer>
  );
}
