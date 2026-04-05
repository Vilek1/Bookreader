import { PropsWithChildren } from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppTheme } from '@/modules/theme/ThemeProvider';

type ScreenProps = PropsWithChildren<{
  scrollable?: boolean;
}>;

export function Screen({ children, scrollable = false }: ScreenProps) {
  const theme = useAppTheme();
  const content = scrollable ? (
    <ScrollView
      contentContainerStyle={{
        padding: theme.spacing.lg,
        gap: theme.spacing.lg,
      }}
      style={{ flex: 1 }}
    >
      {children}
    </ScrollView>
  ) : (
    <View
      style={{
        flex: 1,
        padding: theme.spacing.lg,
        gap: theme.spacing.lg,
      }}
    >
      {children}
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {content}
    </SafeAreaView>
  );
}
