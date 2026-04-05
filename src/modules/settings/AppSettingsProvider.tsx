import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PropsWithChildren,
} from 'react';

import {
  defaultAppSettings,
  saveAppSettings,
} from '@/modules/storage/repositories/settingsRepository';
import type {
  AppLanguage,
  AppSettings,
  ReaderTextAlignment,
  ThemeMode,
  TranslationLanguage,
  TranslationProvider,
} from '@/modules/storage/types/models';

type AppSettingsContextValue = {
  settings: AppSettings;
  setThemeMode: (themeMode: ThemeMode) => void;
  setReaderFontSize: (fontSize: number) => void;
  setReaderTextAlignment: (textAlignment: ReaderTextAlignment) => void;
  setAppLanguage: (language: AppLanguage) => void;
  setTranslationLanguage: (language: TranslationLanguage) => void;
  setTranslationProvider: (provider: TranslationProvider) => void;
};

const AppSettingsContext = createContext<AppSettingsContextValue | null>(null);

export function AppSettingsProvider({
  children,
  initialSettings = defaultAppSettings,
}: PropsWithChildren<{ initialSettings?: AppSettings }>) {
  const [settings, setSettings] = useState<AppSettings>(initialSettings);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const timeoutId = setTimeout(() => {
      void saveAppSettings(settings).catch((error) => {
        console.warn('Failed to persist app settings', error);
      });
    }, 120);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [settings]);

  const value = useMemo<AppSettingsContextValue>(
    () => ({
      settings,
      setThemeMode: (themeMode) => {
        setSettings((current) => ({
          ...current,
          themeMode,
        }));
      },
      setReaderFontSize: (readerFontSize) => {
        const clampedFontSize = Math.min(Math.max(Math.round(readerFontSize), 12), 24);

        setSettings((current) => ({
          ...current,
          readerFontSize: clampedFontSize,
        }));
      },
      setReaderTextAlignment: (readerTextAlignment) => {
        setSettings((current) => ({
          ...current,
          readerTextAlignment,
        }));
      },
      setAppLanguage: (appLanguage) => {
        setSettings((current) => ({
          ...current,
          appLanguage,
        }));
      },
      setTranslationLanguage: (translationLanguage) => {
        setSettings((current) => ({
          ...current,
          translationLanguage,
        }));
      },
      setTranslationProvider: (translationProvider) => {
        setSettings((current) => ({
          ...current,
          translationProvider,
        }));
      },
    }),
    [settings],
  );

  return (
    <AppSettingsContext.Provider value={value}>
      {children}
    </AppSettingsContext.Provider>
  );
}

export function useAppSettings() {
  const context = useContext(AppSettingsContext);

  if (!context) {
    throw new Error('useAppSettings must be used within AppSettingsProvider');
  }

  return context;
}
