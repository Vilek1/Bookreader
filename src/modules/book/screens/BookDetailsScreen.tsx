import { Pressable, ScrollView, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import { RootStackParamList } from '@/app/navigation/types';
import { importFb2Book } from '@/modules/fb2-import/services/importFb2Book';
import { BookCover } from '@/modules/shared/components/BookCover';
import { EmptyState } from '@/modules/shared/components/EmptyState';
import { BottomBar } from '@/modules/library/components/BottomBar';
import { useAppTheme } from '@/modules/theme/ThemeProvider';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useBookDetails } from '../hooks/useBookDetails';

type Props = NativeStackScreenProps<RootStackParamList, 'BookDetails'>;

export function BookDetailsScreen({ route, navigation }: Props) {
  const theme = useAppTheme();
  const { bookId } = route.params;
  const queryClient = useQueryClient();
  const { bookQuery, summaryQuery, chaptersQuery, progressPercent } =
    useBookDetails(bookId);
  const book = bookQuery.data;
  const summary = summaryQuery.data;
  const chapters = chaptersQuery.data ?? [];

  const importMutation = useMutation({
    mutationFn: importFb2Book,
    onSuccess: async (newBookId) => {
      await queryClient.invalidateQueries({ queryKey: ['books'] });

      if (newBookId) {
        navigation.replace('BookDetails', { bookId: newBookId });
      }
    },
  });

  if (!book) {
    return (
      <SafeAreaView
        edges={['top', 'left', 'right']}
        style={{ flex: 1, backgroundColor: theme.colors.background }}
      >
        <EmptyState title="Book not found" description="This book could not be loaded." />
      </SafeAreaView>
    );
  }

  const chapterCount = chapters.length;
  const currentChapterCount =
    chapterCount === 0
      ? 0
      : Math.max(1, Math.round((progressPercent / 100) * chapterCount));

  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      style={{ flex: 1, backgroundColor: theme.colors.background }}
    >
      <View style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={{
            paddingBottom: 130,
          }}
          showsVerticalScrollIndicator={false}
        >
          <View
            style={{
              alignItems: 'center',
            }}
          >
            <View
              style={{
                height: 56,
                width: '100%',
                paddingHorizontal: 16,
                paddingBottom: 12,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <View style={{ width: 44 }} />
              <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <Text
                  numberOfLines={1}
                  style={{
                    ...theme.typography.titleMedium,
                    color: theme.colors.textPrimary,
                  }}
                >
                  {book.title}
                </Text>
                <Text
                  numberOfLines={1}
                  style={{
                    ...theme.typography.caption,
                    color: theme.colors.textSecondary,
                  }}
                >
                  {book.author}
                </Text>
              </View>
              <Pressable
                onPress={() => importMutation.mutate()}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: theme.colors.primary,
                }}
              >
                <Text style={{ color: theme.colors.white, fontSize: 24, lineHeight: 24 }}>
                  +
                </Text>
              </Pressable>
            </View>

            <View
              style={{
                width: '100%',
                paddingHorizontal: 16,
                paddingBottom: 16,
                alignItems: 'center',
              }}
            >
              <View
                style={{
                  width: '100%',
                  minHeight: 300,
                  maxHeight: 360,
                  overflow: 'hidden',
                  borderRadius: 16,
                  backgroundColor: '#252B37',
                  borderWidth: 1,
                  borderColor: 'rgba(255,255,255,0.08)',
                }}
              >
                <View
                  style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundColor: 'rgba(0,0,0,0.18)',
                  }}
                />
                <View
                  style={{
                    flex: 1,
                    paddingTop: 24,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <BookCover
                    title={book.title}
                    coverUri={book.coverUri}
                    hasCover={Boolean(book.hasCover)}
                    height={255}
                    width={179}
                    borderRadius={8}
                    titleSize={18}
                  />
                </View>

                <Pressable
                  onPress={() => navigation.navigate('Reader', { bookId })}
                  style={{
                    width: '100%',
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    backgroundColor: theme.colors.primary,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 4,
                  }}
                >
                  <BookmarkIcon />
                  <Text
                    style={{
                      ...theme.typography.bodySmall,
                      fontWeight: '600',
                      color: theme.colors.white,
                    }}
                  >
                    Continue reading
                  </Text>
                </Pressable>
              </View>
            </View>

            <View
              style={{
                width: '100%',
                paddingHorizontal: 16,
                alignItems: 'center',
              }}
            >
              <View
                style={{
                  width: '100%',
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 12,
                }}
              >
                <View
                  style={{
                    flex: 1,
                    height: 8,
                    borderRadius: 999,
                    backgroundColor: theme.colors.surfaceMuted,
                    overflow: 'hidden',
                  }}
                >
                  <View
                    style={{
                      width: `${Math.min(progressPercent, 100)}%`,
                      height: '100%',
                      borderRadius: 999,
                      backgroundColor: theme.colors.primary,
                    }}
                  />
                </View>
                <Text
                  style={{
                    ...theme.typography.bodySmall,
                    color: theme.colors.textSecondary,
                  }}
                >
                  {progressPercent}%
                </Text>
              </View>
            </View>

            <View
              style={{
                width: '100%',
                paddingTop: 16,
                paddingHorizontal: 16,
                gap: 6,
              }}
            >
              <InfoTile
                title="Chapters"
                lines={[
                  {
                    highlight: `${currentChapterCount}/${chapterCount || 0}`,
                    text: 'chapters',
                  },
                ]}
                onPress={() => navigation.navigate('Chapters', { bookId })}
              />
              <InfoTile
                title="Book words"
                lines={[
                  {
                    highlight: String(summary?.savedCount ?? 0),
                    text: 'added',
                  },
                  {
                    highlight: String(summary?.translatedCount ?? 0),
                    text: 'translated',
                  },
                ]}
                onPress={() => navigation.navigate('Words', { bookId })}
              />
            </View>
          </View>
        </ScrollView>

        <BottomBar
          activeTab="Book"
          onLibraryPress={() => navigation.replace('Library')}
          onBookPress={() => {}}
          onSettingsPress={() => navigation.replace('Settings')}
        />
      </View>
    </SafeAreaView>
  );
}

function InfoTile({
  title,
  lines,
  onPress,
}: {
  title: string;
  lines: { highlight: string; text: string }[];
  onPress: () => void;
}) {
  const theme = useAppTheme();

  return (
    <Pressable
      onPress={onPress}
      style={{
        width: '100%',
        padding: theme.spacing.md,
        borderRadius: theme.radius.md,
        borderWidth: 1,
        borderColor: theme.colors.border,
        backgroundColor: theme.colors.background,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
      }}
    >
      <View style={{ flex: 1, gap: title === 'Book words' ? 8 : 2 }}>
        <Text
          style={{
            fontSize: 20,
            lineHeight: 30,
            fontWeight: '600',
            color: theme.colors.textPrimary,
          }}
        >
          {title}
        </Text>
        <View style={{ gap: 4 }}>
          {lines.map((line) => (
            <View
              key={`${title}-${line.highlight}-${line.text}`}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
            >
              <Text
                style={{
                  ...theme.typography.body,
                  fontWeight: '600',
                  color: theme.colors.primary,
                }}
              >
                {line.highlight}
              </Text>
              <Text
                style={{
                  ...theme.typography.bodySmall,
                  color: theme.colors.textSecondary,
                }}
              >
                {line.text}
              </Text>
            </View>
          ))}
        </View>
      </View>
      <ChevronRightIcon />
    </Pressable>
  );
}

function BookmarkIcon() {
  return (
    <Svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <Path
        d="M14.1667 17.5L10 14.1667L5.83337 17.5V5.83333C5.83337 4.89991 5.83337 4.4332 6.01503 4.07668C6.17483 3.76308 6.42979 3.50811 6.74339 3.34832C7.09991 3.16666 7.56662 3.16666 8.50004 3.16666H11.5C12.4335 3.16666 12.9002 3.16666 13.2567 3.34832C13.5703 3.50811 13.8252 3.76308 13.985 4.07668C14.1667 4.4332 14.1667 4.89991 14.1667 5.83333V17.5Z"
        stroke="white"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function ChevronRightIcon() {
  const theme = useAppTheme();

  return (
    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <Path
        d="M9 6L15 12L9 18"
        stroke={theme.colors.textSecondary}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
