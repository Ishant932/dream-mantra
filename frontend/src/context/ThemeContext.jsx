import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const THEMES = ['light', 'dark', 'aurora'];

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('dm_theme');
    return THEMES.includes(saved) ? saved : 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('light', 'dark', 'aurora');
    if (theme === 'light') {
      root.classList.add('light');
    } else if (theme === 'dark') {
      root.classList.add('dark');
    } else if (theme === 'aurora') {
      /* Solar Flux uses aurora tokens + dark class so Tailwind dark: utilities apply */
      root.classList.add('aurora', 'dark');
    }
    localStorage.setItem('dm_theme', theme);
  }, [theme]);

  const cycleTheme = useCallback(() => {
    setTheme((t) => THEMES[(THEMES.indexOf(t) + 1) % THEMES.length]);
  }, []);

  const toggle = cycleTheme;

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggle, cycleTheme, themes: THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
