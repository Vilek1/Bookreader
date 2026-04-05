import { useEffect } from 'react';
import { ActivityIndicator, Alert, Pressable, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RootStackParamList } from '@/app/navigation/types';
import { importFb2Book } from '@/modules/fb2-import/services/importFb2Book';
import { BottomBar } from '@/modules/library/components/BottomBar';
import { useLibraryBooks } from '@/modules/library/hooks/useLibraryBooks';
import { EmptyState } from '@/modules/shared/components/EmptyState';
import { useAppTheme } from '@/modules/theme/ThemeProvider';

type Props = NativeStackScreenProps<RootStackParamList, 'BookHome'>;

export function BookHomeScreen({ navigation }: Props) {
  const theme = useAppTheme();
  const queryClient = useQueryClient();
  const booksQuery = useLibraryBooks();

  const importMutation = useMutation({
    mutationFn: importFb2Book,
    onSuccess: async (bookId) => {
      await queryClient.invalidateQueries({ queryKey: ['books'] });

      if (bookId) {
        navigation.replace('BookDetails', { bookId });
      }
    },
    onError: (error) => {
      Alert.alert(
        'Import failed',
        error instanceof Error ? error.message : 'Please try again.',
      );
    },
  });

  useEffect(() => {
    const firstBook = booksQuery.data?.[0];

    if (firstBook) {
      navigation.replace('BookDetails', { bookId: firstBook.id });
    }
  }, [booksQuery.data, navigation]);

  if (booksQuery.isLoading) {
    return (
      <SafeAreaView
        edges={['top', 'left', 'right']}
        style={{ flex: 1, backgroundColor: theme.colors.background }}
      >
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      style={{ flex: 1, backgroundColor: theme.colors.background }}
    >
      <View style={{ flex: 1, justifyContent: 'center', padding: theme.spacing.lg }}>
        <EmptyState
          title="No books yet"
          description="Import your first FB2 book to open the Book tab."
        />
        <Pressable
          onPress={() => importMutation.mutate()}
          style={{
            marginTop: theme.spacing.lg,
            borderRadius: theme.radius.md,
            backgroundColor: theme.colors.primary,
            paddingVertical: theme.spacing.md,
            alignItems: 'center',
          }}
        >
          <Text style={{ ...theme.typography.bodyMedium, color: theme.colors.white }}>
            Import book
          </Text>
        </Pressable>
      </View>
      <BottomBar
        activeTab="Book"
        onLibraryPress={() => navigation.replace('Library')}
        onBookPress={() => {}}
        onSettingsPress={() => navigation.replace('Settings')}
      />
    </SafeAreaView>
  );
}
