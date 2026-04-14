import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
import * as Speech from 'expo-speech';
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
  const [activeSpokenWord, setActiveSpokenWord] = useState<string | null>(
    null,
  );
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

  const stopTranslatedWordSpeech = useCallback(() => {
    Speech.stop();
    setActiveSpokenWord(null);
  }, []);

  const onTranslatedWordSpeechPress = useCallback(
    (translatedWord: string) => {
      const text = translatedWord.trim();

      if (!text) {
        return;
      }

      if (activeSpokenWord === text) {
        stopTranslatedWordSpeech();
        return;
      }

      Speech.stop();
      setActiveSpokenWord(text);
      Speech.speak(text, {
        onDone: () =>
          setActiveSpokenWord((current) =>
            current === text ? null : current,
          ),
        onStopped: () =>
          setActiveSpokenWord((current) =>
            current === text ? null : current,
          ),
        onError: () =>
          setActiveSpokenWord((current) =>
            current === text ? null : current,
          ),
      });
    },
    [activeSpokenWord, stopTranslatedWordSpeech],
  );

  useEffect(
    () => () => {
      Speech.stop();
    },
    [],
  );

  useEffect(() => {
    if (!wordSheet) {
      stopTranslatedWordSpeech();
      return;
    }

    if (
      activeSpokenWord &&
      activeSpokenWord !== wordSheet.word
    ) {
      stopTranslatedWordSpeech();
    }
  }, [activeSpokenWord, stopTranslatedWordSpeech, wordSheet]);

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
                      lineHeight: readerFontSize * 1.4,
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
        translation={wordSheet?.translation ?? ''}
        context={wordSheet?.sentence ?? ''}
        translatedContext={wordSheet?.translatedSentence ?? ''}
        isSaving={saveWordMutation.isPending}
        isTranslationSpeaking={
          Boolean(wordSheet?.word) &&
          activeSpokenWord === wordSheet?.word
        }
        onSpeakTranslation={() =>
          onTranslatedWordSpeechPress(wordSheet?.word ?? '')
        }
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
  translation,
  context,
  translatedContext,
  isSaving,
  isTranslationSpeaking,
  onSpeakTranslation,
  onSave,
  onExpand,
}: {
  visible: boolean;
  expanded: boolean;
  title: string;
  translation: string;
  context: string;
  translatedContext: string;
  isSaving: boolean;
  isTranslationSpeaking: boolean;
  onSpeakTranslation: () => void;
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
        <View style={{ paddingHorizontal: theme.spacing.xl, paddingBottom: theme.spacing.lg }}>
          <View style={{ height: 44, flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md }}>
            <Pressable
              onPress={onSpeakTranslation}
              style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}
            >
              <SpeakerIcon isActive={isTranslationSpeaking} />
            </Pressable>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text numberOfLines={1} style={{ ...theme.typography.bodyMedium, color: theme.colors.textPrimary }}>
                {title}
              </Text>
            </View>
            <View style={{ width: 44, height: 44, justifyContent: 'center', alignItems: 'flex-end' }}>
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
          </View>
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

function SpeakerIcon({ isActive }: { isActive: boolean }) {
  const theme = useAppTheme();
  const stroke = isActive ? theme.colors.primaryStrong : theme.colors.textTertiary;

  return (
    <Svg width={32} height={32} viewBox="0 0 32 32" fill="none">
      {isActive ? (
        <Path
          d="M26.3299 6.66665C28.2197 9.29363 29.3327 12.5168 29.3327 16C29.3327 19.4831 28.2197 22.7063 26.3299 25.3333M20.9931 10.6667C22.0476 12.1784 22.666 14.017 22.666 16C22.666 17.983 22.0476 19.8215 20.9931 21.3333M12.8451 7.15423L8.62419 11.3751C8.39359 11.6057 8.27828 11.721 8.14373 11.8035C8.02443 11.8766 7.89437 11.9305 7.75832 11.9631C7.60487 12 7.44181 12 7.11569 12H4.79935C4.05261 12 3.67924 12 3.39403 12.1453C3.14315 12.2731 2.93917 12.4771 2.81134 12.728C2.66602 13.0132 2.66602 13.3866 2.66602 14.1333V17.8667C2.66602 18.6134 2.66602 18.9868 2.81134 19.272C2.93917 19.5229 3.14315 19.7268 3.39403 19.8547C3.67924 20 4.05261 20 4.79935 20H7.11569C7.44181 20 7.60487 20 7.75832 20.0368C7.89437 20.0695 8.02443 20.1234 8.14373 20.1965C8.27828 20.2789 8.39359 20.3942 8.62419 20.6248L12.8451 24.8457C13.4163 25.4169 13.7019 25.7025 13.947 25.7218C14.1598 25.7385 14.3677 25.6524 14.5063 25.4901C14.666 25.3031 14.666 24.8992 14.666 24.0915V7.90848C14.666 7.10072 14.666 6.69685 14.5063 6.50983C14.3677 6.34755 14.1598 6.26144 13.947 6.27818C13.7019 6.29748 13.4163 6.58306 12.8451 7.15423Z"
          stroke={stroke}
          strokeWidth={2.66667}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : (
        <Path
          d="M24.3268 10.6667C25.3813 12.1784 25.9997 14.017 25.9997 16C25.9997 17.983 25.3813 19.8215 24.3268 21.3333M16.1791 7.15423L11.9582 11.3751C11.7276 11.6057 11.6123 11.721 11.4777 11.8035C11.3584 11.8766 11.2284 11.9305 11.0923 11.9631C10.9389 12 10.7758 12 10.4497 12H8.13333C7.3866 12 7.01323 12 6.72801 12.1453C6.47713 12.2731 6.27316 12.4771 6.14532 12.728C6 13.0132 6 13.3866 6 14.1333V17.8667C6 18.6134 6 18.9868 6.14532 19.272C6.27316 19.5229 6.47713 19.7268 6.72801 19.8547C7.01323 20 7.3866 20 8.13333 20H10.4497C10.7758 20 10.9389 20 11.0923 20.0368C11.2284 20.0695 11.3584 20.1234 11.4777 20.1965C11.6123 20.2789 11.7276 20.3942 11.9582 20.6248L16.1791 24.8457C16.7503 25.4169 17.0358 25.7025 17.281 25.7218C17.4938 25.7385 17.7017 25.6524 17.8403 25.4901C18 25.3031 18 24.8992 18 24.0915V7.90848C18 7.10072 18 6.69685 17.8403 6.50983C17.7017 6.34755 17.4938 6.26144 17.281 6.27818C17.0358 6.29748 16.7503 6.58306 16.1791 7.15423Z"
          stroke={stroke}
          strokeWidth={2.66667}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
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
