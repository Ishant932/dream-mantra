import { createContext, useContext, useEffect } from 'react';

const ThemeContext = createContext(null);

/** Site uses a single light theme — no dark / aurora switching. */
export function ThemeProvider({ children }) {
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('light', 'dark', 'aurora');
    root.classList.add('light');
    try {
      localStorage.setItem('dm_theme', 'light');
    } catch {
      /* ignore storage errors */
    }
  }, []);

  const value = {
    theme: 'light',
    setTheme: () => {},
    toggle: () => {},
    cycleTheme: () => {},
    themes: ['light'],
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
