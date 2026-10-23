import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import { palettes, type Palette } from './tokens';

interface Theme {
  scheme: 'light' | 'dark';
  colors: Palette;
}

const ThemeContext = createContext<Theme>({ scheme: 'light', colors: palettes.light });

export function ThemeProvider({ children }: { children: ReactNode }) {
  const scheme: Theme['scheme'] = useColorScheme() === 'dark' ? 'dark' : 'light';
  const value = useMemo(() => ({ scheme, colors: palettes[scheme] }), [scheme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => useContext(ThemeContext);
