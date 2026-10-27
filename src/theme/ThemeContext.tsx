import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import * as FileSystem from 'expo-file-system/legacy';
import { COLORS } from '../constants/theme';

export type AppTheme = 'light' | 'dark';

const THEME_FILE = `${FileSystem.documentDirectory}agrisos-theme.txt`;

const DARK_COLORS = {
  ...COLORS,
  white: '#1E2A1F',
  offWhite: '#172018',
  greyLight: '#344337',
  grey: '#AAB8AB',
  background: '#101810',
  card: '#1E2A1F',
  border: '#38543D',
  text: '#F1F8F2',
  textSecondary: '#C2CEC3',
  primary: '#66BB6A',
  primaryDark: '#A5D6A7',
  greenPale: '#203A24',
  yellowPale: '#3C3518',
  redPale: '#3A2022',
  shadow: 'rgba(0,0,0,0.4)',
};

type ThemeContextValue = {
  theme: AppTheme;
  colors: typeof COLORS;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<AppTheme>('light');

  useEffect(() => {
    FileSystem.getInfoAsync(THEME_FILE)
      .then(async (info) => {
        if (info.exists) {
          const saved = (await FileSystem.readAsStringAsync(THEME_FILE)).trim();
          if (saved === 'light' || saved === 'dark') setTheme(saved);
        }
      })
      .catch(() => undefined);
  }, []);

  function toggleTheme() {
    setTheme((current) => {
      const next = current === 'light' ? 'dark' : 'light';
      FileSystem.writeAsStringAsync(THEME_FILE, next).catch(() => undefined);
      return next;
    });
  }

  const value = useMemo(
    () => ({ theme, colors: theme === 'dark' ? DARK_COLORS : COLORS, toggleTheme }),
    [theme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
}
