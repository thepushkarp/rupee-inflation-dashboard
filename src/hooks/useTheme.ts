import { useEffect, useState } from 'react';

/**
 * Hook for managing dark/light theme based on system preference.
 */
export function useTheme(): {
  theme: 'light' | 'dark';
  systemPreference: 'light' | 'dark';
} {
  const [systemPreference, setSystemPreference] = useState<'light' | 'dark'>(() => {
    if (typeof window === 'undefined') return 'light';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (e: MediaQueryListEvent) => {
      setSystemPreference(e.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', systemPreference);
  }, [systemPreference]);

  return {
    theme: systemPreference,
    systemPreference,
  };
}
