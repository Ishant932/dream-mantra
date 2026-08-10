import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const THEMES = ['light', 'dark'];

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('dm_theme');
    if (saved === 'aurora') return 'dark';
    return THEMES.includes(saved) ? saved : 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('light', 'dark', 'aurora');
    root.classList.add(theme === 'dark' ? 'dark' : 'light');
    localStorage.setItem('dm_theme', theme);
  }, [theme]);

  const cycleTheme = useCallback(() => {
    setTheme((t) => (t === 'light' ? 'dark' : 'light'));
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggle: cycleTheme, cycleTheme, themes: THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
