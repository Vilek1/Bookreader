import { Text, View } from 'react-native';

import { useAppTheme } from '@/modules/theme/ThemeProvider';

type EmptyStateProps = {
  title: string;
  description: string;
};

export function EmptyState({ title, description }: EmptyStateProps) {
  const theme = useAppTheme();

  return (
    <View
      style={{
        borderRadius: theme.radius.lg,
        padding: theme.spacing.xl,
        backgroundColor: theme.colors.surface,
        borderWidth: 1,
        borderColor: theme.colors.border,
        gap: theme.spacing.sm,
      }}
    >
      <Text style={{ ...theme.typography.heading, color: theme.colors.textPrimary }}>
        {title}
      </Text>
      <Text style={{ ...theme.typography.body, color: theme.colors.textSecondary }}>
        {description}
      </Text>
    </View>
  );
}
