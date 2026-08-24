import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

// ─── Types ──────────────────────────────────────────────────────────────────

export type ThemeMode = 'light' | 'dark' | 'system';

export interface ThemeContextValue {
  /** The mode the user explicitly selected (light | dark | system) */
  theme: ThemeMode;
  /** The actual rendered theme after resolving 'system' (always 'light' | 'dark') */
  resolvedTheme: 'light' | 'dark';
  /** Set a specific mode */
  setTheme: (mode: ThemeMode) => void;
  /** Toggle between light and dark (ignores system) */
  toggleTheme: () => void;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'healthpulse_theme';
const DARK_META = '#08111F';
const LIGHT_META = '#2563EB';

function safeLocalStorageGet(): ThemeMode | null {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === 'light' || v === 'dark' || v === 'system') return v;
    return null;
  } catch {
    return null;
  }
}

function safeLocalStorageSet(value: ThemeMode): void {
  try {
    localStorage.setItem(STORAGE_KEY, value);
  } catch {
    /* private browsing — silently ignore */
  }
}

function getSystemPreference(): 'light' | 'dark' {
  try {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

function resolveTheme(mode: ThemeMode): 'light' | 'dark' {
  if (mode === 'system') return getSystemPreference();
  return mode;
}

function applyThemeToDom(resolved: 'light' | 'dark'): void {
  document.documentElement.dataset.theme = resolved;
  // Update meta theme-color for mobile browser chrome
  try {
    const meta = document.getElementById('meta-theme-color');
    if (meta) meta.setAttribute('content', resolved === 'dark' ? DARK_META : LIGHT_META);
  } catch {
    /* ignore */
  }
}

// ─── Context ─────────────────────────────────────────────────────────────────

const ThemeContext = createContext<ThemeContextValue | null>(null);

// ─── Provider ────────────────────────────────────────────────────────────────

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    return safeLocalStorageGet() ?? 'system';
  });

  const resolvedTheme = useMemo(() => resolveTheme(theme), [theme]);

  // Apply to DOM whenever resolved theme changes
  useEffect(() => {
    applyThemeToDom(resolvedTheme);
  }, [resolvedTheme]);

  // Listen for OS preference changes when theme is 'system'
  useEffect(() => {
    if (theme !== 'system') return;

    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => {
      applyThemeToDom(getSystemPreference());
    };

    try {
      mq.addEventListener('change', handler);
      return () => mq.removeEventListener('change', handler);
    } catch {
      // Older Safari
      mq.addListener(handler);
      return () => mq.removeListener(handler);
    }
  }, [theme]);

  const setTheme = useCallback((mode: ThemeMode) => {
    safeLocalStorageSet(mode);
    setThemeState(mode);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  }, [resolvedTheme, setTheme]);

  const value = useMemo<ThemeContextValue>(
    () => ({ theme, resolvedTheme, setTheme, toggleTheme }),
    [theme, resolvedTheme, setTheme, toggleTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside <ThemeProvider>');
  return ctx;
}
