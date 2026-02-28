import { useCallback, useEffect, useMemo, useState } from 'react';

import type { ThemeMode } from '@/types/inflation';

const THEME_STORAGE_KEY = 'rupee-inflation-dashboard:theme';

/**
 * Hook for managing dark/light theme with an optional user override.
 */
export function useTheme(): {
  theme: 'light' | 'dark';
  systemPreference: 'light' | 'dark';
  preference: ThemeMode;
  setPreference: (preference: ThemeMode) => void;
  toggleTheme: () => void;
} {
  const [preference, setPreference] = useState<ThemeMode>(() => {
    if (typeof window === 'undefined') return 'system';
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === 'light' || stored === 'dark' || stored === 'system') return stored;
    return 'system';
  });

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

  const theme = useMemo(() => {
    return preference === 'system' ? systemPreference : preference;
  }, [preference, systemPreference]);

  const toggleTheme = useCallback(() => {
    setPreference((current) => {
      if (current === 'system') return systemPreference === 'dark' ? 'light' : 'dark';
      return current === 'dark' ? 'light' : 'dark';
    });
  }, [systemPreference]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(THEME_STORAGE_KEY, preference);
  }, [preference]);

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return {
    theme,
    systemPreference,
    preference,
    setPreference,
    toggleTheme,
  };
}
