import styles from './TopBar.module.css';

interface TopBarProps {
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  dataThroughYear?: number;
  lastUpdated: number | null;
}

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={styles.icon}>
      <path
        fill="currentColor"
        d="M12 18a6 6 0 1 1 0-12 6 6 0 0 1 0 12Zm0 2a1 1 0 0 1 1 1v2h-2v-2a1 1 0 0 1 1-1Zm0-19a1 1 0 0 1 1 1v2h-2V2a1 1 0 0 1 1-1Zm11 11a1 1 0 0 1-1 1h-2v-2h2a1 1 0 0 1 1 1ZM4 13H2v-2h2v2Zm15.07 7.07a1 1 0 0 1 0 1.41l-1.42 1.42-1.41-1.42 1.41-1.41a1 1 0 0 1 1.42 0ZM7.76 7.76 6.34 6.34 7.76 4.93l1.41 1.41-1.41 1.42Zm14.9-1.42-1.42 1.42-1.41-1.42 1.41-1.41 1.42 1.41ZM9.17 19.66l-1.41 1.42-1.42-1.42 1.42-1.41 1.41 1.41Z"
      />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={styles.icon}>
      <path fill="currentColor" d="M21 13.6A8.5 8.5 0 0 1 10.4 3 7.5 7.5 0 1 0 21 13.6Z" />
    </svg>
  );
}

export function TopBar({ theme, onToggleTheme, dataThroughYear, lastUpdated }: TopBarProps) {
  const lastUpdatedText = lastUpdated
    ? new Intl.DateTimeFormat(undefined, { hour: '2-digit', minute: '2-digit' }).format(
        new Date(lastUpdated)
      )
    : null;

  return (
    <header className={styles.bar}>
      <div className={styles.brand}>
        <div className={styles.mark} aria-hidden="true">
          ₹
        </div>
        <div className={styles.brandText}>
          <div className={styles.title}>Rupee Inflation</div>
          <div className={styles.subtitle}>Purchasing power of ₹100 over time</div>
        </div>
      </div>

      <div className={styles.meta}>
        <a
          className={styles.source}
          href="https://data.worldbank.org/indicator/FP.CPI.TOTL?locations=IN"
          target="_blank"
          rel="noopener noreferrer"
        >
          World Bank CPI
        </a>

        {dataThroughYear ? (
          <span className={styles.badge}>Data through {dataThroughYear}</span>
        ) : null}

        {lastUpdatedText ? (
          <span className={styles.badgeMuted}>Updated {lastUpdatedText}</span>
        ) : null}

        <button
          type="button"
          className={styles.themeToggle}
          onClick={onToggleTheme}
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
        >
          {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
          <span className={styles.toggleLabel}>{theme === 'dark' ? 'Light' : 'Dark'}</span>
        </button>
      </div>
    </header>
  );
}
