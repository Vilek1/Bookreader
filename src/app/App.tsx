import { StatusBar } from 'expo-status-bar';

import { useResolvedColorScheme } from '@/modules/theme/ThemeProvider';

import { AppProviders } from './providers/AppProviders';
import { RootNavigator } from './navigation/RootNavigator';

export function AppRoot() {
  return (
    <AppProviders>
      <AppShell />
    </AppProviders>
  );
}

function AppShell() {
  const colorScheme = useResolvedColorScheme();

  return (
    <>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <RootNavigator />
    </>
  );
}
