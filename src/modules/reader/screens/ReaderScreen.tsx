import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  AppState,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
  type ViewToken,
  useWindowDimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Line, Path, Rect } from 'react-native-svg';

import { RootStackParamList } from '@/app/navigation/types';
import { useAppSettings } from '@/modules/settings/AppSettingsProvider';
import { EmptyState } from '@/modules/shared/components/EmptyState';
import { useAppTheme, useResolvedColorScheme } from '@/modules/theme/ThemeProvider';
import type { Chapter, ParagraphBlock } from '@/modules/storage/types/models';
import { touchBookOpened } from '@/modules/storage/repositories/booksRepository';
import { saveReadingPosition } from '@/modules/storage/repositories/readerRepository';
import { toggleSavedWord } from '@/modules/storage/repositories/wordsRepository';
import {
  normalizeWord,
  translateParagraph,
  translateWord,
} from '@/modules/translation/services/translator';

import { ReaderParagraph } from '../components/ReaderParagraph';
import { useReaderBook } from '../hooks/useReaderBook';

type Props = NativeStackScreenProps<RootStackParamList, 'Reader'>;

type WordSheetState = {
  word: string;
  translation: string;
  sentence: string;
  translatedSentence: string;
} | null;

type ParagraphSheetState = {
  paragraphId: string;
  paragraph: string;
  translation: string;
} | null;

const EMPTY_PARAGRAPHS: ParagraphBlock[] = [];
const EMPTY_CHAPTERS: Chapter[] = [];

export function ReaderScreen({ route, navigation }: Props) {
  const theme = useAppTheme();
  const resolvedColorScheme = useResolvedColorScheme();
  const {
    settings: {
      readerFontSize,
      readerTextAlignment,
      translationLanguage,
      translationProvider,
    },
  } = useAppSettings();
  const { bookId, initialParagraphIndex } = route.params;
  const queryClient = useQueryClient();
  const { bookQuery, chaptersQuery, paragraphsQuery, readingPositionQuery } =
    useReaderBook(bookId);

  const flatListRef = useRef<FlatList>(null);
  const [currentParagraphIndex, setCurrentParagraphIndex] = useState(0);
  const [wordSheet, setWordSheet] = useState<WordSheetState>(null);
  const [isWordSheetExpanded, setIsWordSheetExpanded] = useState(false);
  const [paragraphSheet, setParagraphSheet] = useState<ParagraphSheetState>(null);
  const [isTocVisible, setIsTocVisible] = useState(false);
  const [selectedWord, setSelectedWord] = useState<{
    paragraphId: string;
    normalizedWord: string;
  } | null>(null);

  const paragraphs = paragraphsQuery.data ?? EMPTY_PARAGRAPHS;
  const chapters = chaptersQuery.data ?? EMPTY_CHAPTERS;
  const currentChapter = useMemo(
    () => resolveCurrentChapter(chapters, currentParagraphIndex),
    [chapters, currentParagraphIndex],
  );

  useEffect(() => {
    if (!bookQuery.data) {
      return;
    }

    void touchBookOpened(bookId, new Date().toISOString());
  }, [bookId, bookQuery.data]);

  useEffect(() => {
    if (paragraphs.length === 0) {
      return;
    }

    const requestedIndex =
      typeof initialParagraphIndex === 'number'
        ? initialParagraphIndex
        : readingPositionQuery.data?.paragraphIndex;

    if (typeof requestedIndex !== 'number') {
      return;
    }

    const index = Math.min(requestedIndex, paragraphs.length - 1);

    requestAnimationFrame(() => {
      flatListRef.current?.scrollToIndex({ index, animated: false });
      setCurrentParagraphIndex(index);
    });
  }, [initialParagraphIndex, paragraphs.length, readingPositionQuery.data]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'background') {
        void persistReadingPosition(
          bookId,
          currentChapter?.id ?? chapters[0]?.id,
          currentParagraphIndex,
        );
      }
    });

    return () => {
      subscription.remove();
    };
  }, [bookId, chapters, currentChapter?.id, currentParagraphIndex]);

  const translateWordMutation = useMutation({
    mutationFn: async (input: {
      word: string;
      sentence: string;
      paragraphId: string;
    }) =>
      translateWord({
        bookId,
        mode: 'word',
        sourceText: input.word,
        sourceLanguage: 'auto',
        targetLanguage: translationLanguage,
        provider: translationProvider,
        contextSentence: input.sentence,
      }),
    onSuccess: async (result, variables) => {
      setWordSheet({
        word: variables.word,
        translation: result.translatedText,
        sentence: variables.sentence,
        translatedSentence: result.translatedSentence,
      });
      setSelectedWord({
        paragraphId: variables.paragraphId,
        normalizedWord: normalizeWord(variables.word),
      });
      setIsWordSheetExpanded(false);
      await invalidateWordQueries(queryClient, bookId);
    },
    onError: (error) => {
      Alert.alert(
        'Translation failed',
        error instanceof Error ? error.message : 'Please try again.',
      );
    },
  });

  const translateParagraphMutation = useMutation({
    mutationFn: async (input: { paragraphId: string; text: string }) =>
      translateParagraph({
        bookId,
        mode: 'paragraph',
        sourceText: input.text,
        sourceLanguage: 'auto',
        targetLanguage: translationLanguage,
        provider: translationProvider,
      }),
    onSuccess: (result, variables) => {
      setParagraphSheet({
        paragraphId: variables.paragraphId,
        paragraph: variables.text,
        translation: result.translatedText,
      });
    },
    onError: (error) => {
      Alert.alert(
        'Paragraph translation failed',
        error instanceof Error ? error.message : 'Please try again.',
      );
    },
  });

  const saveWordMutation = useMutation({
    mutationFn: async () => {
      if (!wordSheet) {
        return null;
      }

      return toggleSavedWord({
        bookId,
        word: wordSheet.word,
        normalizedWord: normalizeWord(wordSheet.word),
        translation: wordSheet.translation,
        exampleSentence: wordSheet.sentence,
      });
    },
    onSuccess: async () => {
      await invalidateWordQueries(queryClient, bookId);
    },
  });

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      const firstVisible = viewableItems[0];

      if (!firstVisible || typeof firstVisible.index !== 'number') {
        return;
      }

      setCurrentParagraphIndex(firstVisible.index);
      void persistReadingPosition(
        bookId,
        paragraphs[firstVisible.index]?.chapterId ?? chapters[0]?.id,
        firstVisible.index,
      );
    },
  );

  if (
    bookQuery.isLoading ||
    paragraphsQuery.isLoading ||
    chaptersQuery.isLoading ||
    readingPositionQuery.isLoading
  ) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: theme.colors.background,
        }}
      >
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!bookQuery.data || paragraphs.length === 0) {
    return (
      <View
        style={{
          flex: 1,
          padding: theme.spacing.lg,
          backgroundColor: theme.colors.background,
        }}
      >
        <EmptyState
          title="Nothing to read"
          description="This book does not have readable paragraphs yet."
        />
      </View>
    );
  }

  const nextChapter = findNextChapter(chapters, currentParagraphIndex);
  const readerChromeColor = theme.colors.surface;

  return (
    <View style={{ flex: 1, backgroundColor: readerChromeColor }}>
      <StatusBar style={resolvedColorScheme === 'dark' ? 'light' : 'dark'} />
      <SafeAreaView edges={['top']} style={{ backgroundColor: readerChromeColor }}>
        <ReaderToolbar
          title={bookQuery.data.title}
          subtitle={bookQuery.data.author}
          onBack={() => navigation.goBack()}
          onTitlePress={() => setIsTocVisible(true)}
        />
      </SafeAreaView>

      <FlatList
        ref={flatListRef}
        data={paragraphs}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          paddingTop: theme.spacing.md,
          paddingBottom: 180,
        }}
        renderItem={({ item, index }) => {
          const translatedParagraph =
            paragraphSheet?.paragraphId === item.id ? paragraphSheet : null;
          const showsTranslationConnector = translatedParagraph !== null;

          return (
          <View
            style={{
              gap: theme.spacing.md,
              paddingHorizontal: theme.spacing.xl,
            }}
          >
            <ReaderParagraph
              paragraph={item}
              fontSize={readerFontSize}
              textAlignment={readerTextAlignment}
              selectedWord={selectedWord}
              showTranslationConnector={showsTranslationConnector}
              onWordPress={(word, sentence, paragraphId) =>
                translateWordMutation.mutate({ word, sentence, paragraphId })
              }
              onParagraphTranslatePress={(paragraphText) =>
                translateParagraphMutation.mutate({
                  paragraphId: item.id,
                  text: paragraphText,
                })
              }
            />
            {translatedParagraph ? (
              <View style={{ flexDirection: 'row', gap: theme.spacing.lg }}>
                <View
                  style={{
                    width: 22,
                    alignItems: 'center',
                    alignSelf: 'stretch',
                  }}
                />
                <View
                  style={{
                    flex: 1,
                    marginRight: 11,
                    backgroundColor: theme.colors.card,
                    borderTopLeftRadius: 12,
                    borderBottomLeftRadius: 12,
                    borderBottomRightRadius: 12,
                    padding: theme.spacing.lg,
                  }}
                >
                  <Text
                    style={{
                      ...theme.typography.body,
                      color: theme.colors.textPrimary,
                      fontSize: readerFontSize,
                      lineHeight: Math.round(readerFontSize * 1.5),
                      textAlign: readerTextAlignment,
                    }}
                  >
                    {translatedParagraph.translation}
                  </Text>
                </View>
              </View>
            ) : null}
          </View>
          );
        }}
        ItemSeparatorComponent={() => <View style={{ height: theme.spacing.md }} />}
        onViewableItemsChanged={onViewableItemsChanged.current}
        viewabilityConfig={{ itemVisiblePercentThreshold: 60 }}
        onMomentumScrollEnd={() =>
          persistReadingPosition(
            bookId,
            currentChapter?.id ?? chapters[0]?.id,
            currentParagraphIndex,
          )
        }
        onScrollEndDrag={() =>
          persistReadingPosition(
            bookId,
            currentChapter?.id ?? chapters[0]?.id,
            currentParagraphIndex,
          )
        }
        ListFooterComponent={
          <Pressable
            onPress={() => {
              if (nextChapter) {
                flatListRef.current?.scrollToIndex({
                  index: nextChapter.startParagraphIndex,
                  animated: true,
                });
                return;
              }

              flatListRef.current?.scrollToEnd({ animated: true });
            }}
            style={{
              marginHorizontal: theme.spacing.lg,
              marginTop: theme.spacing.sm,
              backgroundColor: theme.colors.primary,
              borderRadius: 12,
              paddingVertical: theme.spacing.md,
              alignItems: 'center',
            }}
          >
            <Text style={{ ...theme.typography.body, color: theme.colors.white }}>
              Read next chapter
            </Text>
          </Pressable>
        }
      />

      <WordTranslationDrawer
        visible={Boolean(wordSheet)}
        expanded={isWordSheetExpanded}
        title={wordSheet?.word ?? ''}
        subtitle={bookQuery.data.author}
        translation={wordSheet?.translation ?? ''}
        context={wordSheet?.sentence ?? ''}
        translatedContext={wordSheet?.translatedSentence ?? ''}
        isSaving={saveWordMutation.isPending}
        onClose={() => {
          setWordSheet(null);
          setSelectedWord(null);
          setIsWordSheetExpanded(false);
        }}
        onSave={() => saveWordMutation.mutate()}
        onExpand={() => setIsWordSheetExpanded((current) => !current)}
      />

      <TocOverlay
        visible={isTocVisible}
        title={bookQuery.data.title}
        subtitle={bookQuery.data.author}
        chapters={chapters}
        currentParagraphIndex={currentParagraphIndex}
        onClose={() => setIsTocVisible(false)}
        onSelectChapter={(chapter) => {
          flatListRef.current?.scrollToIndex({
            index: chapter.startParagraphIndex,
            animated: true,
          });
          setCurrentParagraphIndex(chapter.startParagraphIndex);
          setIsTocVisible(false);
        }}
      />
    </View>
  );
}

function ReaderToolbar({
  title,
  subtitle,
  onBack,
  onTitlePress,
}: {
  title: string;
  subtitle: string;
  onBack: () => void;
  onTitlePress: () => void;
}) {
  const theme = useAppTheme();

  return (
    <View
      style={{
        height: 56,
        paddingHorizontal: theme.spacing.lg,
        paddingBottom: theme.spacing.md,
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
      <Pressable onPress={onTitlePress} style={{ flex: 1, alignItems: 'center' }}>
        <Text numberOfLines={1} style={{ ...theme.typography.bodyMedium, color: theme.colors.textPrimary }}>
          {title}
        </Text>
        <Text numberOfLines={1} style={{ ...theme.typography.caption, color: theme.colors.textSecondary }}>
          {subtitle}
        </Text>
      </Pressable>
      <View style={{ width: 44, height: 44 }} />
    </View>
  );
}

function TocOverlay({
  visible,
  title,
  subtitle,
  chapters,
  currentParagraphIndex,
  onSelectChapter,
  onClose,
}: {
  visible: boolean;
  title: string;
  subtitle: string;
  chapters: Chapter[];
  currentParagraphIndex: number;
  onSelectChapter: (chapter: Chapter) => void;
  onClose: () => void;
}) {
  const theme = useAppTheme();
  const currentChapter = resolveCurrentChapter(chapters, currentParagraphIndex);

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <ReaderToolbar title={title} subtitle={subtitle} onBack={onClose} onTitlePress={onClose} />
        <View style={{ paddingHorizontal: theme.spacing.lg, gap: 2 }}>
          {chapters.map((chapter, index) => {
            const isCurrent = currentChapter?.id === chapter.id;
            const isRead = chapter.startParagraphIndex < currentParagraphIndex;

            return (
              <Pressable
                key={chapter.id}
                onPress={() => onSelectChapter(chapter)}
                style={{
                  height: 40,
                  borderRadius: 8,
                  paddingHorizontal: theme.spacing.lg,
                  borderWidth: isCurrent || isRead ? 0 : 1,
                  borderColor: theme.colors.border,
                  backgroundColor: isCurrent || isRead ? theme.colors.surfaceMuted : 'transparent',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Text style={{ ...theme.typography.body, color: theme.colors.textPrimary }}>
                  {chapter.title || String(index + 1)}
                </Text>
                {isCurrent ? <BookFilledIcon /> : isRead ? <CheckIcon /> : null}
              </Pressable>
            );
          })}
        </View>
      </SafeAreaView>
    </Modal>
  );
}

function WordTranslationDrawer({
  visible,
  expanded,
  title,
  subtitle,
  translation,
  context,
  translatedContext,
  isSaving,
  onClose,
  onSave,
  onExpand,
}: {
  visible: boolean;
  expanded: boolean;
  title: string;
  subtitle: string;
  translation: string;
  context: string;
  translatedContext: string;
  isSaving: boolean;
  onClose: () => void;
  onSave: () => void;
  onExpand: () => void;
}) {
  const theme = useAppTheme();
  const { height: windowHeight } = useWindowDimensions();
  const collapsedHeight = 165;
  const expandedHeight = Math.round(windowHeight * 0.82);
  const drawerHeight = expanded ? expandedHeight : collapsedHeight;

  if (!visible) {
    return null;
  }

  return (
    <View
      pointerEvents="box-none"
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        justifyContent: 'flex-end',
      }}
    >
      <View
        pointerEvents="auto"
        style={{
          height: drawerHeight,
          borderTopLeftRadius: 38,
          borderTopRightRadius: 38,
          backgroundColor: theme.colors.surfaceMuted,
          shadowColor: '#FFFFFF',
          shadowOffset: { width: 0, height: 24 },
          shadowOpacity: 0.1,
          shadowRadius: 48,
          elevation: 12,
        }}
      >
        <Pressable onPress={onExpand} style={{ alignItems: 'center', paddingTop: 5, height: 16 }}>
          <View
            style={{
              width: 36,
              height: 5,
              borderRadius: 999,
              backgroundColor: theme.colors.textSecondary,
              opacity: 0.55,
            }}
          />
        </Pressable>
        <View style={{ height: 44, flexDirection: 'row', alignItems: 'center', paddingHorizontal: theme.spacing.lg }}>
          <Pressable onPress={onClose} style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}>
            <CloseIcon color={theme.colors.textPrimary} />
          </Pressable>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Text style={{ ...theme.typography.bodyMedium, color: theme.colors.textPrimary }}>
              {title}
            </Text>
            <Text style={{ ...theme.typography.caption, color: theme.colors.textSecondary }}>
              {subtitle}
            </Text>
          </View>
          <Pressable
            onPress={onSave}
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: theme.colors.primary,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <PlusIcon color={theme.colors.white} />
          </Pressable>
        </View>

        {expanded ? (
          <View style={{ flex: 1, paddingHorizontal: theme.spacing.lg, paddingBottom: theme.spacing.lg }}>
            <View style={{ flexDirection: 'row', gap: theme.spacing.sm }}>
              <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
                <Text style={{ ...theme.typography.body, color: theme.colors.textPrimary }}>
                  {translatedContext || context || translation}
                </Text>
              </ScrollView>
              <View style={{ width: 6, alignItems: 'center', paddingTop: theme.spacing.md }}>
                <View
                  style={{
                    flex: 1,
                    width: 6,
                    borderRadius: 999,
                    borderWidth: 1,
                    borderColor: theme.colors.textPrimary,
                    opacity: 0.2,
                  }}
                />
              </View>
            </View>
          </View>
        ) : (
          <Pressable onPress={onExpand} style={{ paddingHorizontal: theme.spacing.lg, paddingTop: theme.spacing.sm }}>
            <Text style={{ ...theme.typography.body, color: theme.colors.textPrimary }}>
              {translation}
            </Text>
            {isSaving ? (
              <Text style={{ ...theme.typography.caption, color: theme.colors.textSecondary }}>
                Saving...
              </Text>
            ) : null}
          </Pressable>
        )}
      </View>
    </View>
  );
}

function ChevronLeftIcon({ color }: { color: string }) {
  return (
    <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
      <Path d="M12.5 4.5L7 10L12.5 15.5" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function CheckIcon() {
  const theme = useAppTheme();

  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Path d="M6 12.5L10.2 16.7L18 8.9" stroke={theme.colors.primary} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function BookFilledIcon() {
  const theme = useAppTheme();

  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Rect x={4} y={5} width={7.2} height={14} rx={1.8} fill={theme.colors.primary} />
      <Rect x={12.8} y={5} width={7.2} height={14} rx={1.8} fill={theme.colors.primary} />
      <Line x1={12} y1={6} x2={12} y2={19} stroke={theme.colors.white} strokeWidth={1.2} opacity={0.7} />
    </Svg>
  );
}

function CloseIcon({ color }: { color: string }) {
  return (
    <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
      <Path d="M5 5L15 15M15 5L5 15" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}

function PlusIcon({ color }: { color: string }) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={12} fill="transparent" />
      <Path d="M12 6.5V17.5M6.5 12H17.5" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}

async function invalidateWordQueries(queryClient: ReturnType<typeof useQueryClient>, bookId: string) {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: ['translated-words', bookId] }),
    queryClient.invalidateQueries({ queryKey: ['saved-words', bookId] }),
    queryClient.invalidateQueries({ queryKey: ['book-words-summary', bookId] }),
    queryClient.invalidateQueries({ queryKey: ['books'] }),
  ]);
}

async function persistReadingPosition(
  bookId: string,
  chapterId: string | undefined,
  paragraphIndex: number,
) {
  if (!chapterId) {
    return;
  }

  await saveReadingPosition({
    bookId,
    chapterId,
    paragraphIndex,
    updatedAt: new Date().toISOString(),
  });
}

function resolveCurrentChapter(chapters: Chapter[], paragraphIndex: number) {
  let current = chapters[0];

  for (const chapter of chapters) {
    if (chapter.startParagraphIndex <= paragraphIndex) {
      current = chapter;
    } else {
      break;
    }
  }

  return current;
}

function findNextChapter(chapters: Chapter[], paragraphIndex: number) {
  return chapters.find((chapter) => chapter.startParagraphIndex > paragraphIndex);
}
