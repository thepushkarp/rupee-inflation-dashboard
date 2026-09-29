import styles from './ui.module.css';
export function LoadingState() {
  return (
    <section className={styles.loadingRoot} role="status" aria-busy="true">
      Loading CPI data…
    </section>
  );
}
