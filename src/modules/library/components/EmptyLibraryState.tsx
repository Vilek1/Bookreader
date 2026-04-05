import { Pressable, Text, View } from 'react-native';

import { BookOpen01Icon } from '@/modules/shared/icons/BookOpen01Icon';
import { useAppTheme } from '@/modules/theme/ThemeProvider';

type EmptyLibraryStateProps = {
  onAddBookPress: () => void;
};

export function EmptyLibraryState({ onAddBookPress }: EmptyLibraryStateProps) {
  const theme = useAppTheme();

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.colors.background,
      }}
    >
      <View
        style={{
          flex: 1,
          alignItems: 'center',
        }}
      >
        <View
          style={{
            width: '100%',
            height: 56,
            paddingHorizontal: 16,
            paddingBottom: 12,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <View style={{ width: 44 }} />
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Text
              style={{
                ...theme.typography.titleMedium,
                color: theme.colors.textPrimary,
              }}
            >
              Library
            </Text>
          </View>
          <Pressable
            onPress={onAddBookPress}
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: theme.colors.primary,
            }}
          >
            <Text style={{ color: theme.colors.white, fontSize: 24, lineHeight: 24 }}>+</Text>
          </Pressable>
        </View>

        <Pressable
          onPress={onAddBookPress}
          style={{
            flex: 1,
            width: '100%',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 24,
            padding: 8,
          }}
        >
          <View
            style={{
              width: 200,
              height: 200,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <View
              style={{
                position: 'absolute',
                width: 200,
                height: 200,
                borderRadius: 100,
                backgroundColor: theme.colors.primary,
                opacity: 0.12,
              }}
            />
            <View
              style={{
                position: 'absolute',
                width: 144.63,
                height: 144.63,
                borderRadius: 72.315,
                backgroundColor: theme.colors.primary,
                opacity: 0.48,
                shadowColor: theme.colors.primary,
                shadowOffset: { width: 0, height: 12 },
                shadowOpacity: 0.28,
                shadowRadius: 24,
              }}
            />
            <BookOpen01Icon size={48} color={theme.colors.white} />
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text style={{ color: theme.colors.primary, fontSize: 20, lineHeight: 20 }}>+</Text>
            <Text
              style={{
                ...theme.typography.bodyMedium,
                color: theme.colors.textSecondary,
              }}
            >
              Add book
            </Text>
          </View>
        </Pressable>
      </View>
    </View>
  );
}
