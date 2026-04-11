import { Pressable, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { useAppTheme } from '@/modules/theme/ThemeProvider';
import type { ParagraphBlock } from '@/modules/storage/types/models';
import { normalizeWord } from '@/modules/translation/services/translator';

type ReaderParagraphProps = {
  paragraph: ParagraphBlock;
  fontSize: number;
  textAlignment: 'left' | 'center' | 'right' | 'justify';
  onWordPress: (word: string, sentence: string, paragraphId: string) => void;
  onParagraphTranslatePress: (text: string) => void;
  selectedWord: {
    paragraphId: string;
    normalizedWord: string;
  } | null;
  showTranslationConnector?: boolean;
};

export function ReaderParagraph({
  paragraph,
  fontSize,
  textAlignment,
  onWordPress,
  onParagraphTranslatePress,
  selectedWord,
  showTranslationConnector = false,
}: ReaderParagraphProps) {
  const theme = useAppTheme();

  if (paragraph.type === 'heading') {
    return (
      <Text
        style={{
          ...theme.typography.heading,
          color: theme.colors.textPrimary,
          marginTop: theme.spacing.lg,
        }}
      >
        {paragraph.text}
      </Text>
    );
  }

  const tokens = paragraph.text.match(/[\p{L}\p{N}'-]+|[^\p{L}\p{N}'-]+/gu) ?? [
    paragraph.text,
  ];

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: theme.spacing.sm,
      }}
    >
      <View style={{ flex: 1 }}>
        <Text
          style={{
            ...theme.typography.body,
            color: theme.colors.textPrimary,
            fontSize,
            lineHeight: fontSize * 1.4,
            textAlign: textAlignment,
          }}
        >
          {tokens.map((token, index) => {
            const isWord = /[\p{L}\p{N}]/u.test(token);

            if (!isWord) {
              return token;
            }

            return (
              <Text
                key={`${paragraph.id}-${index}`}
                onPress={() => onWordPress(token, paragraph.text, paragraph.id)}
                style={{
                  color: theme.colors.textPrimary,
                  backgroundColor:
                    selectedWord?.paragraphId === paragraph.id &&
                    selectedWord.normalizedWord === normalizeWord(token)
                      ? theme.colors.primary
                      : 'transparent',
                  borderRadius: 4,
                }}
              >
                {token}
              </Text>
            );
          })}
        </Text>
      </View>

      <View
        style={{
          alignItems: 'center',
          alignSelf: 'stretch',
          gap: 10,
        }}
      >
        <Pressable
          onPress={() => onParagraphTranslatePress(paragraph.text)}
          style={{
            padding: theme.spacing.xs,
            backgroundColor: theme.colors.border,
            borderRadius: theme.radius.pill,
            width: 22,
            height: 22,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <TranslateIcon color={theme.colors.white} />
        </Pressable>

        {showTranslationConnector ? (
          <View
            style={{
              width: 1,
              flex: 1,
              minHeight: showTranslationConnector ? 180 : 0,
              backgroundColor: theme.colors.textSecondary,
              opacity: 0.85,
            }}
          />
        ) : null}
      </View>
    </View>
  );
}

function TranslateIcon({ color }: { color: string }) {
  return (
    <Svg width={14} height={14} viewBox="0 0 14 14" fill="none">
      <Path
        d="M2.91602 4.66675L5.83268 7.58342M2.33268 8.16675L5.83268 4.66675L6.99935 2.91675M1.16602 2.91675H8.16602M4.08268 1.16675H4.66602M7.53196 9.91675H11.7167M7.53196 9.91675L6.41602 12.2501M7.53196 9.91675L9.20335 6.42201C9.33803 6.14041 9.40538 5.9996 9.49752 5.95511C9.57765 5.91641 9.67105 5.91641 9.75118 5.95511C9.84332 5.9996 9.91066 6.14041 10.0453 6.42201L11.7167 9.91675M11.7167 9.91675L12.8327 12.2501"
        stroke={color}
        strokeWidth={1.16667}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
