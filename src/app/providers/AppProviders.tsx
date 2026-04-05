import { PropsWithChildren, useEffect, useState } from 'react';
import { ActivityIndicator, Text, View, useColorScheme } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';

import { AppSettingsProvider } from '@/modules/settings/AppSettingsProvider';
import { initializeDatabase } from '@/modules/storage/db/database';
import { getAppSettings } from '@/modules/storage/repositories/settingsRepository';
import type { AppSettings } from '@/modules/storage/types/models';
import { ThemeProvider } from '@/modules/theme/ThemeProvider';
import { getTheme } from '@/modules/theme/tokens/theme';

const queryClient = new QueryClient();

export function AppProviders({ children }: PropsWithChildren) {
  return <AppProvidersContent>{children}</AppProvidersContent>;
}

function AppProvidersContent({ children }: PropsWithChildren) {
  const fallbackTheme = getTheme(useColorScheme());
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialSettings, setInitialSettings] = useState<AppSettings | null>(null);

  useEffect(() => {
    let isMounted = true;

    const setup = async () => {
      try {
        await initializeDatabase();
        const settings = await getAppSettings();

        if (isMounted) {
          setInitialSettings(settings);
          setIsReady(true);
        }
      } catch (setupError) {
        if (isMounted) {
          setError(
            setupError instanceof Error
              ? setupError.message
              : 'Unknown setup error',
          );
        }
      }
    };

    void setup();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          {error ? (
            <View
              style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: fallbackTheme.colors.background,
                padding: fallbackTheme.spacing.lg,
              }}
            >
              <Text
                style={{
                  color: fallbackTheme.colors.danger,
                  fontSize: fallbackTheme.typography.body.fontSize,
                  textAlign: 'center',
                }}
              >
                {error}
              </Text>
            </View>
          ) : isReady && initialSettings ? (
            <AppSettingsProvider initialSettings={initialSettings}>
              <ThemeProvider>{children}</ThemeProvider>
            </AppSettingsProvider>
          ) : (
            <View
              style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: fallbackTheme.colors.background,
                gap: fallbackTheme.spacing.md,
              }}
            >
              <ActivityIndicator size="large" color={fallbackTheme.colors.primary} />
              <Text style={{ color: fallbackTheme.colors.textSecondary }}>
                Preparing local reader storage...
              </Text>
            </View>
          )}
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
