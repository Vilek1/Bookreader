import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Line, Path, Rect } from 'react-native-svg';

import { RootStackParamList } from '@/app/navigation/types';
import { useAppTheme } from '@/modules/theme/ThemeProvider';

import { useBookDetails } from '../hooks/useBookDetails';

type Props = NativeStackScreenProps<RootStackParamList, 'Chapters'>;

export function ChaptersScreen({ route, navigation }: Props) {
  const theme = useAppTheme();
  const { bookId } = route.params;
  const { bookQuery, chaptersQuery, progressPercent } = useBookDetails(bookId);
  const book = bookQuery.data;
  const chapters = chaptersQuery.data ?? [];

  if (bookQuery.isLoading || chaptersQuery.isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.surface }}>
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!book) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.surface }}>
        <ChaptersToolbar
          title="Book"
          subtitle="Author"
          onBack={() => navigation.goBack()}
        />
      </SafeAreaView>
    );
  }

  const currentChapterCount =
    chapters.length === 0
      ? 0
      : Math.max(1, Math.round((progressPercent / 100) * chapters.length));

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.surface }}>
      <View style={{ flex: 1, backgroundColor: theme.colors.surface }}>
        <ChaptersToolbar
          title={book.title}
          subtitle={book.author}
          onBack={() => navigation.goBack()}
        />

        <View
          style={{
            paddingHorizontal: theme.spacing.xl,
            gap: theme.spacing.xxs,
          }}
        >
          {chapters.map((chapter, index) => {
            const chapterNumber = index + 1;
            const isCurrent =
              currentChapterCount > 0 && chapterNumber === currentChapterCount;
            const isRead = currentChapterCount > 1 && chapterNumber < currentChapterCount;

            return (
              <Pressable
                key={chapter.id}
                onPress={() =>
                  navigation.navigate('Reader', {
                    bookId,
                    initialParagraphIndex: chapter.startParagraphIndex,
                  })
                }
                style={{
                  height: 40,
                  borderRadius: theme.radius.md,
                  paddingHorizontal: theme.spacing.xl,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor:
                    isCurrent || isRead ? theme.colors.card : 'transparent',
                  borderWidth: isCurrent || isRead ? 0 : 1,
                  borderColor: theme.colors.border,
                }}
              >
                <Text
                  numberOfLines={1}
                  style={{
                    flex: 1,
                    ...theme.typography.body,
                    color: theme.colors.textPrimary,
                  }}
                >
                  {chapter.title || String(chapterNumber)}
                </Text>
                {isCurrent ? (
                  <BookFilledIcon />
                ) : isRead ? (
                  <CheckIcon />
                ) : null}
              </Pressable>
            );
          })}
        </View>
      </View>
    </SafeAreaView>
  );
}

function ChaptersToolbar({
  title,
  subtitle,
  onBack,
}: {
  title: string;
  subtitle: string;
  onBack: () => void;
}) {
  const theme = useAppTheme();

  return (
    <View
      style={{
        height: 56,
        paddingHorizontal: theme.spacing.xl,
        paddingBottom: theme.spacing.lg,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <Pressable
        onPress={onBack}
        style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}
      >
        <ChevronLeftIcon color={theme.colors.textPrimary} />
      </Pressable>
      <View style={{ flex: 1, alignItems: 'center' }}>
        <Text numberOfLines={1} style={{ ...theme.typography.bodyMedium, color: theme.colors.textPrimary }}>
          {title}
        </Text>
        <Text numberOfLines={1} style={{ ...theme.typography.caption, color: theme.colors.textSecondary }}>
          {subtitle}
        </Text>
      </View>
      <View style={{ width: 44, height: 44 }} />
    </View>
  );
}

function ChevronLeftIcon({ color }: { color: string }) {
  return (
    <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
      <Path
        d="M12.5 4.5L7 10L12.5 15.5"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function CheckIcon() {
  const theme = useAppTheme();

  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Path
        d="M6 12.5L10.2 16.7L18 8.9"
        stroke={theme.colors.primary}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function BookFilledIcon() {
  const theme = useAppTheme();

  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Rect x={4} y={5} width={7.2} height={14} rx={1.8} fill={theme.colors.primary} />
      <Rect x={12.8} y={5} width={7.2} height={14} rx={1.8} fill={theme.colors.primary} />
      <Line
        x1={12}
        y1={6}
        x2={12}
        y2={19}
        stroke={theme.colors.white}
        strokeWidth={1.2}
        opacity={0.7}
      />
    </Svg>
  );
}
