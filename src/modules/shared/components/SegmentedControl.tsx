import { Pressable, Text, View } from 'react-native';

import { useAppTheme } from '@/modules/theme/ThemeProvider';

type SegmentedControlProps<T extends string> = {
  options: T[];
  activeOption: T;
  onChange: (value: T) => void;
};

export function SegmentedControl<T extends string>({
  options,
  activeOption,
  onChange,
}: SegmentedControlProps<T>) {
  const theme = useAppTheme();

  return (
    <View
      style={{
        flexDirection: 'row',
        padding: theme.spacing.xs,
        borderRadius: theme.radius.pill,
        backgroundColor: theme.colors.surfaceMuted,
      }}
    >
      {options.map((option) => {
        const isActive = activeOption === option;

        return (
          <Pressable
            key={option}
            onPress={() => onChange(option)}
            style={{
              flex: 1,
              borderRadius: theme.radius.pill,
              backgroundColor: isActive
                ? theme.colors.surface
                : 'transparent',
              paddingVertical: theme.spacing.sm,
            }}
          >
            <Text
              style={{
                textAlign: 'center',
                color: isActive
                  ? theme.colors.textPrimary
                  : theme.colors.textSecondary,
                fontWeight: '600',
              }}
            >
              {option}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
