import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import { RootStackParamList } from '@/app/navigation/types';
import { getBookById } from '@/modules/storage/repositories/booksRepository';
import { deleteSavedWord } from '@/modules/storage/repositories/wordsRepository';
import { useAppTheme } from '@/modules/theme/ThemeProvider';

import { useBookWords } from '../hooks/useBookWords';

type WordTab = 'Added' | 'Translated';

type Props = NativeStackScreenProps<RootStackParamList, 'Words'>;

export function WordsScreen({ route, navigation }: Props) {
  const theme = useAppTheme();
  const { bookId } = route.params;
  const queryClient = useQueryClient();
  const { savedWordsQuery, translatedWordsQuery } = useBookWords(bookId);
  const bookQuery = useQuery({
    queryKey: ['book', bookId],
    queryFn: () => getBookById(bookId),
  });

  const [activeTab, setActiveTab] = useState<WordTab>('Added');
  const [selectedWordId, setSelectedWordId] = useState<string | null>(null);

  const words = useMemo(
    () =>
      activeTab === 'Added'
        ? savedWordsQuery.data ?? []
        : translatedWordsQuery.data ?? [],
    [activeTab, savedWordsQuery.data, translatedWordsQuery.data],
  );

  const deleteSavedWordMutation = useMutation({
    mutationFn: deleteSavedWord,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['saved-words', bookId] });
      await queryClient.invalidateQueries({ queryKey: ['book-words-summary', bookId] });
    },
  });

  const wordsCountLabel = `${words.length} ${activeTab.toLowerCase()} words`;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={{ flex: 1 }}>
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
          <Pressable
            onPress={() => navigation.goBack()}
            style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}
          >
            <ChevronLeftIcon color={theme.colors.textPrimary} />
          </Pressable>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Text
              numberOfLines={1}
              style={{ ...theme.typography.bodyMedium, color: theme.colors.textPrimary }}
            >
              {bookQuery.data?.title ?? 'Book words'}
            </Text>
            <Text
              numberOfLines={1}
              style={{ ...theme.typography.caption, color: theme.colors.textSecondary }}
            >
              {bookQuery.data?.author ?? 'Author'}
            </Text>
          </View>
          <View style={{ width: 44 }} />
        </View>

        <View style={{ paddingHorizontal: 16, gap: 16 }}>
          <WordSegmentedControl activeTab={activeTab} onTabChange={setActiveTab} />
          <Text style={{ ...theme.typography.bodySmall, color: theme.colors.textSecondary, textAlign: 'center' }}>
            <Text style={{ ...theme.typography.body, fontWeight: '600', color: theme.colors.textPrimary }}>
              {words.length}{' '}
            </Text>
            {wordsCountLabel.replace(`${words.length} `, '')}
          </Text>
        </View>

        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 16,
            paddingBottom: 24,
            gap: 14,
          }}
        >
          {words.map((word) => {
            const isSelected = selectedWordId === word.id;

            return (
              <View key={word.id} style={{ gap: 8 }}>
                <Pressable
                  onPress={() => setSelectedWordId(isSelected ? null : word.id)}
                  style={{
                    minHeight: 24,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 12,
                  }}
                >
                  <Text
                    style={{
                      flex: 1,
                      ...theme.typography.body,
                      color: isSelected ? theme.colors.primary : theme.colors.textPrimary,
                    }}
                  >
                    {word.word}
                  </Text>
                  {activeTab === 'Added' ? (
                    <Pressable
                      onPress={() => {
                        setSelectedWordId((current) => (current === word.id ? null : current));
                        deleteSavedWordMutation.mutate(word.id);
                      }}
                      style={{ width: 24, height: 24, alignItems: 'center', justifyContent: 'center' }}
                    >
                      <TrashIcon color={theme.colors.textSecondary} />
                    </Pressable>
                  ) : null}
                </Pressable>

                {isSelected ? (
                  <View
                    style={{
                      backgroundColor: theme.colors.surfaceMuted,
                      borderTopRightRadius: 12,
                      borderBottomRightRadius: 12,
                      borderBottomLeftRadius: 12,
                      padding: 12,
                      gap: 10,
                    }}
                  >
                    <Text style={{ ...theme.typography.body, color: theme.colors.textPrimary }}>
                      [translation] {word.translation}
                    </Text>
                    <Text style={{ ...theme.typography.body, color: theme.colors.textSecondary }}>
                      {'contextSentence' in word
                        ? word.contextSentence || 'Context from the paragraph'
                        : word.exampleSentence || 'Context from the paragraph'}
                    </Text>
                  </View>
                ) : null}
              </View>
            );
          })}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

function WordSegmentedControl({
  activeTab,
  onTabChange,
}: {
  activeTab: WordTab;
  onTabChange: (next: WordTab) => void;
}) {
  const theme = useAppTheme();

  return (
    <View
      style={{
        height: 36,
        borderRadius: 100,
        backgroundColor: theme.colors.surfaceMuted,
        flexDirection: 'row',
        padding: 2,
      }}
    >
      {(['Added', 'Translated'] as const).map((tab) => {
        const isActive = tab === activeTab;
        return (
          <Pressable
            key={tab}
            onPress={() => onTabChange(tab)}
            style={{
              flex: 1,
              borderRadius: 20,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: isActive ? theme.colors.background : 'transparent',
            }}
          >
            <Text
              style={{
                ...theme.typography.bodySmallMedium,
                color: isActive ? theme.colors.primary : theme.colors.textPrimary,
              }}
            >
              {tab}
            </Text>
          </Pressable>
        );
      })}
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

function TrashIcon({ color }: { color: string }) {
  return (
    <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
      <Path
        d="M3.33334 5H5.00001H16.6667M7.50001 5V3.33333C7.50001 2.89131 7.6756 2.46738 7.98816 2.15482C8.30072 1.84226 8.72465 1.66667 9.16668 1.66667H12.5C12.942 1.66667 13.366 1.84226 13.6785 2.15482C13.9911 2.46738 14.1667 2.89131 14.1667 3.33333V5M15.8333 5V16.6667C15.8333 17.1087 15.6578 17.5326 15.3452 17.8452C15.0326 18.1577 14.6087 18.3333 14.1667 18.3333H7.50001C7.05798 18.3333 6.63406 18.1577 6.3215 17.8452C6.00894 17.5326 5.83334 17.1087 5.83334 16.6667V5H15.8333Z"
        stroke={color}
        strokeWidth={1.7}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
