import { useEffect, useState } from 'react';

type Theme = 'dark' | 'light' | 'fun';

export const useTheme = () => {
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    // Don't default to fun mode, keep it manual
    if (savedTheme === 'fun') return 'fun';
    return savedTheme === 'light' || savedTheme === 'dark' ? savedTheme : (prefersDark ? 'dark' : 'light');
  });

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('light', 'dark', 'fun');
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const setThemeMode = (newTheme: Theme) => {
    setTheme(newTheme);
  };

  const cycleTheme = () => {
    setTheme(prev => {
      if (prev === 'light') return 'dark';
      if (prev === 'dark') return 'fun';
      return 'light';
    });
  };

  return { theme, toggleTheme, setThemeMode, cycleTheme };
};