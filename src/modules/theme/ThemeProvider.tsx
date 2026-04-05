import {
  createContext,
  useContext,
  type PropsWithChildren,
} from 'react';
import { useColorScheme, type ColorSchemeName } from 'react-native';

import { useAppSettings } from '@/modules/settings/AppSettingsProvider';
import { getTheme, lightTheme, type AppTheme } from './tokens/theme';

type ThemeContextValue = {
  theme: AppTheme;
  resolvedColorScheme: NonNullable<ColorSchemeName>;
};

const ThemeContext = createContext<ThemeContextValue>({
  theme: lightTheme,
  resolvedColorScheme: 'light',
});

export function ThemeProvider({ children }: PropsWithChildren) {
  const systemColorScheme = useColorScheme();
  const {
    settings: { themeMode },
  } = useAppSettings();
  const resolvedColorScheme =
    themeMode === 'system'
      ? systemColorScheme === 'dark'
        ? 'dark'
        : 'light'
      : themeMode;
  const theme = getTheme(resolvedColorScheme);

  return (
    <ThemeContext.Provider value={{ theme, resolvedColorScheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useAppTheme() {
  return useContext(ThemeContext).theme;
}

export function useResolvedColorScheme() {
  return useContext(ThemeContext).resolvedColorScheme;
}

export function useIsDarkTheme() {
  return useResolvedColorScheme() === 'dark';
}
