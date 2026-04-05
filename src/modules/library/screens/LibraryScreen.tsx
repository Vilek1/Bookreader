import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useState } from 'react';
import Svg, { Path } from 'react-native-svg';

import { RootStackParamList } from '@/app/navigation/types';
import { importFb2Book } from '@/modules/fb2-import/services/importFb2Book';
import { useAppTheme } from '@/modules/theme/ThemeProvider';
import { type BookListItem } from '@/modules/storage/types/models';
import { deleteBook } from '@/modules/storage/repositories/booksRepository';

import { BottomBar } from '../components/BottomBar';
import { EmptyLibraryState } from '../components/EmptyLibraryState';
import { useLibraryBooks } from '../hooks/useLibraryBooks';

type Props = NativeStackScreenProps<RootStackParamList, 'Library'>;

export function LibraryScreen({ navigation }: Props) {
  const theme = useAppTheme();
  const queryClient = useQueryClient();
  const booksQuery = useLibraryBooks();
  const [openMenuBookId, setOpenMenuBookId] = useState<string | null>(null);

  const importMutation = useMutation({
    mutationFn: importFb2Book,
    onSuccess: async (bookId) => {
      await queryClient.invalidateQueries({ queryKey: ['books'] });

      if (bookId) {
        navigation.navigate('BookDetails', { bookId });
      }
    },
    onError: (error) => {
      Alert.alert(
        'Import failed',
        error instanceof Error ? error.message : 'Please try again.',
      );
    },
  });

  const onDeleteBook = (book: BookListItem) => {
    Alert.alert('Delete book', `Remove "${book.title}" from your library?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteBook(book.id);
          await queryClient.invalidateQueries({ queryKey: ['books'] });
        },
      },
    ]);
  };

  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      style={{ flex: 1, backgroundColor: theme.colors.background }}
    >
      {booksQuery.data?.length ? (
        <View style={{ flex: 1 }}>
          <ScrollView
            contentContainerStyle={{
              paddingBottom: 140,
            }}
          >
            <View
              style={{
                height: 56,
                paddingHorizontal: 16,
                paddingBottom: 12,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
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
                onPress={() => importMutation.mutate()}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  backgroundColor: theme.colors.primary,
                  alignItems: 'center',
                  justifyContent: 'center',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: 0.22,
                  shadowRadius: 20,
                }}
              >
                <Text style={{ color: theme.colors.white, fontSize: 24, lineHeight: 24 }}>+</Text>
              </Pressable>
            </View>

            <View style={{ width: '100%', paddingHorizontal: 16, gap: 8 }}>
              {booksQuery.data.map((book) => {
                const isMenuOpen = openMenuBookId === book.id;

                return (
                  <View key={book.id} style={{ position: 'relative' }}>
                    <Pressable
                      onPress={() =>
                        navigation.navigate('BookDetails', { bookId: book.id })
                      }
                      style={{
                        width: '100%',
                        flexDirection: 'row',
                        alignItems: 'center',
                        padding: 8,
                        borderRadius: 8,
                        borderWidth: 1,
                        borderColor: theme.colors.border,
                        backgroundColor: 'transparent',
                      }}
                    >
                      <SmallBookPreview
                        title={book.title}
                        coverUri={book.coverUri}
                        hasCover={Boolean(book.hasCover)}
                      />
                      <View
                        style={{
                          flex: 1,
                          minHeight: 80,
                          justifyContent: 'center',
                          paddingLeft: 16,
                        }}
                      >
                        <Text
                          numberOfLines={1}
                          style={{
                            ...theme.typography.bodyMedium,
                            fontWeight: '600',
                            color: theme.colors.textPrimary,
                          }}
                        >
                          {book.title}
                        </Text>
                        {booksQuery.data.length > 1 ? (
                          <Text
                            numberOfLines={1}
                            style={{
                              marginTop: 8,
                              ...theme.typography.caption,
                              color: theme.colors.textSecondary,
                            }}
                          >
                            {book.author || 'Author'}
                          </Text>
                        ) : null}
                      </View>
                      <View
                        style={{
                          alignSelf: 'stretch',
                          justifyContent: 'space-between',
                          paddingVertical: 8,
                          alignItems: 'flex-end',
                        }}
                      >
                        <Pressable
                          onPress={() => setOpenMenuBookId(isMenuOpen ? null : book.id)}
                          style={{ width: 24, height: 24, alignItems: 'center', justifyContent: 'center' }}
                        >
                          <DotsVerticalIcon color={theme.colors.textSecondary} />
                        </Pressable>
                        <Text
                          style={{
                            fontSize: 12,
                            lineHeight: 18,
                            color: theme.colors.textPrimary,
                          }}
                        >
                          {book.progressPercent}%
                        </Text>
                      </View>
                    </Pressable>

                    {isMenuOpen ? (
                      <View
                        style={{
                          position: 'absolute',
                          right: 0,
                          top: 42,
                          width: 200,
                          borderRadius: 32,
                          backgroundColor: theme.colors.surfaceMuted,
                          shadowColor: '#000',
                          shadowOffset: { width: 0, height: 20 },
                          shadowOpacity: 0.26,
                          shadowRadius: 24,
                          elevation: 20,
                          paddingVertical: 12,
                        }}
                      >
                        <LibraryMenuAction
                          icon={<TrashIcon color={theme.colors.textSecondary} />}
                          label="Delete book"
                          onPress={() => {
                            setOpenMenuBookId(null);
                            onDeleteBook(book);
                          }}
                        />
                        <LibraryMenuAction
                          icon={<BookOpenMenuIcon color={theme.colors.textSecondary} />}
                          label="Read book"
                          onPress={() => {
                            setOpenMenuBookId(null);
                            navigation.navigate('Reader', { bookId: book.id });
                          }}
                        />
                      </View>
                    ) : null}
                  </View>
                );
              })}
            </View>
          </ScrollView>

          <BottomBar
            activeTab="Library"
            onLibraryPress={() => {}}
            onBookPress={() =>
              navigation.replace('BookHome')
            }
            onSettingsPress={() => navigation.replace('Settings')}
          />
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          <EmptyLibraryState onAddBookPress={() => importMutation.mutate()} />
          <BottomBar
            activeTab="Library"
            onLibraryPress={() => {}}
            onBookPress={() => navigation.replace('BookHome')}
            onSettingsPress={() => navigation.replace('Settings')}
          />
        </View>
      )}
    </SafeAreaView>
  );
}

function SmallBookPreview({
  title,
  coverUri,
  hasCover,
}: {
  title: string;
  coverUri: string | null;
  hasCover: boolean;
}) {
  const theme = useAppTheme();

  if (hasCover && coverUri) {
    return (
      <Image
        source={{ uri: coverUri }}
        style={{
          width: 56.087,
          height: 80,
          borderTopLeftRadius: 2.507,
          borderBottomLeftRadius: 2.507,
          borderTopRightRadius: 5.013,
          borderBottomRightRadius: 5.013,
        }}
        contentFit="cover"
      />
    );
  }

  return (
    <View
      style={{
        width: 56.087,
        height: 80,
        borderTopLeftRadius: 2.507,
        borderBottomLeftRadius: 2.507,
        borderTopRightRadius: 5.013,
        borderBottomRightRadius: 5.013,
        backgroundColor: theme.colors.primarySoft,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 6,
      }}
    >
      <Text
        numberOfLines={4}
        style={{
          fontSize: 10,
          lineHeight: 12,
          fontWeight: '600',
          color: theme.colors.primary,
          textAlign: 'center',
        }}
      >
        {title}
      </Text>
    </View>
  );
}

function LibraryMenuAction({
  icon,
  label,
  onPress,
}: {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
}) {
  const theme = useAppTheme();

  return (
    <Pressable
      onPress={onPress}
      style={{
        paddingHorizontal: 16,
        paddingVertical: 4,
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
          paddingHorizontal: 10,
          paddingVertical: 8,
          borderRadius: 6,
        }}
      >
        {icon}
        <Text
          style={{
            flex: 1,
            ...theme.typography.bodySmallMedium,
            color: theme.colors.textSecondary,
          }}
        >
          {label}
        </Text>
      </View>
    </Pressable>
  );
}

function DotsVerticalIcon({ color }: { color: string }) {
  return (
    <Svg width={16} height={16} viewBox="0 0 16 16" fill="none">
      <Path
        d="M8 3.33301C8.36819 3.33301 8.66667 3.63148 8.66667 3.99967C8.66667 4.36786 8.36819 4.66634 8 4.66634C7.63181 4.66634 7.33333 4.36786 7.33333 3.99967C7.33333 3.63148 7.63181 3.33301 8 3.33301ZM8 7.33301C8.36819 7.33301 8.66667 7.63148 8.66667 7.99967C8.66667 8.36786 8.36819 8.66634 8 8.66634C7.63181 8.66634 7.33333 8.36786 7.33333 7.99967C7.33333 7.63148 7.63181 7.33301 8 7.33301ZM8 11.333C8.36819 11.333 8.66667 11.6315 8.66667 11.9997C8.66667 12.3679 8.36819 12.6663 8 12.6663C7.63181 12.6663 7.33333 12.3679 7.33333 11.9997C7.33333 11.6315 7.63181 11.333 8 11.333Z"
        fill={color}
      />
    </Svg>
  );
}

function TrashIcon({ color }: { color: string }) {
  return (
    <Svg width={16} height={16} viewBox="0 0 16 16" fill="none">
      <Path
        d="M2 4H3.33333H14M5.33333 4V2.66667C5.33333 2.31305 5.47381 1.97391 5.72386 1.72386C5.97391 1.47381 6.31305 1.33333 6.66667 1.33333H9.33333C9.68695 1.33333 10.0261 1.47381 10.2761 1.72386C10.5262 1.97391 10.6667 2.31305 10.6667 2.66667V4M12.6667 4V13.3333C12.6667 13.687 12.5262 14.0261 12.2761 14.2761C12.0261 14.5262 11.6869 14.6667 11.3333 14.6667H4.66667C4.31305 14.6667 3.97391 14.5262 3.72386 14.2761C3.47381 14.0261 3.33333 13.687 3.33333 13.3333V4H12.6667Z"
        stroke={color}
        strokeWidth={1.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function BookOpenMenuIcon({ color }: { color: string }) {
  return (
    <Svg width={16} height={16} viewBox="0 0 16 16" fill="none">
      <Path
        d="M8 13.6667L7.9333 13.5666C7.4702 12.872 7.23866 12.5247 6.93273 12.2733C6.66189 12.0507 6.34981 11.8837 6.01439 11.7818C5.6355 11.6667 5.21807 11.6667 4.3832 11.6667H3.46667C2.71993 11.6667 2.34656 11.6667 2.06135 11.5213C1.81047 11.3935 1.60649 11.1895 1.47866 10.9387C1.33333 10.6534 1.33333 10.2801 1.33333 9.53333V3.8C1.33333 3.05326 1.33333 2.67989 1.47866 2.39468C1.60649 2.14381 1.81047 1.93982 2.06135 1.81199C2.34656 1.66667 2.71993 1.66667 3.46667 1.66667H3.73333C5.2268 1.66667 5.97353 1.66667 6.54396 1.95731C7.04573 2.21301 7.45369 2.62093 7.7094 3.1227C8 3.69313 8 4.43987 8 5.93333M8 13.6667V5.93333M8 13.6667L8.0667 13.5666C8.5298 12.872 8.76134 12.5247 9.06727 12.2733C9.33811 12.0507 9.6502 11.8837 9.98561 11.7818C10.3645 11.6667 10.7819 11.6667 11.6168 11.6667H12.5333C13.2801 11.6667 13.6534 11.6667 13.9387 11.5213C14.1895 11.3935 14.3935 11.1895 14.5213 10.9387C14.6667 10.6534 14.6667 10.2801 14.6667 9.53333V3.8C14.6667 3.05326 14.6667 2.67989 14.5213 2.39468C14.3935 2.14381 14.1895 1.93982 13.9387 1.81199C13.6534 1.66667 13.2801 1.66667 12.5333 1.66667H12.2667C10.7732 1.66667 10.0265 1.66667 9.45604 1.95731C8.95427 2.21301 8.54631 2.62093 8.2906 3.1227C8 3.69313 8 4.43987 8 5.93333"
        stroke={color}
        strokeWidth={1.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
