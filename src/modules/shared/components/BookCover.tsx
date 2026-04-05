import { Text, View, type DimensionValue } from 'react-native';
import { Image } from 'expo-image';

import { BookOpen01Icon } from '@/modules/shared/icons/BookOpen01Icon';
import { useAppTheme } from '@/modules/theme/ThemeProvider';

type BookCoverProps = {
  title: string;
  coverUri: string | null;
  hasCover: boolean;
  height?: number;
  width?: DimensionValue;
  borderRadius?: number;
  titleSize?: number;
};

export function BookCover({
  title,
  coverUri,
  hasCover,
  height = 200,
  width = '100%',
  borderRadius,
  titleSize = 20,
}: BookCoverProps) {
  const theme = useAppTheme();
  const resolvedBorderRadius = borderRadius ?? theme.radius.lg;

  if (hasCover && coverUri) {
    return (
      <Image
        source={{ uri: coverUri }}
        style={{
          width,
          height,
          borderRadius: resolvedBorderRadius,
          backgroundColor: theme.colors.surfaceMuted,
        }}
        contentFit="cover"
      />
    );
  }

  return (
    <View
      style={{
        width,
        height,
        borderRadius: resolvedBorderRadius,
        backgroundColor: '#2E3E68',
        alignItems: 'center',
        justifyContent: 'center',
        padding: theme.spacing.lg,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.12)',
        overflow: 'hidden',
      }}
    >
      <View
        style={{
          position: 'absolute',
          left: -Math.round(Number(height) * 0.2),
          right: -Math.round(Number(height) * 0.2),
          top: -Math.round(Number(height) * 0.2),
          height: Number(height) * 0.75,
          borderRadius: Number(height),
          backgroundColor: '#7F56D9',
          opacity: 0.48,
        }}
      />
      <View
        style={{
          position: 'absolute',
          left: -Math.round(Number(height) * 0.2),
          right: -Math.round(Number(height) * 0.2),
          bottom: -Math.round(Number(height) * 0.25),
          height: Number(height) * 0.65,
          borderRadius: Number(height),
          backgroundColor: '#2F80ED',
          opacity: 0.45,
        }}
      />
      <BookOpen01Icon
        size={Math.max(40, Math.round(Number(height) * 0.2))}
        color={theme.colors.white}
      />
      <Text
        style={{
          marginTop: theme.spacing.md,
          fontSize: Math.max(20, Math.round(titleSize * 1.1)),
          lineHeight: Math.round(Math.max(20, Math.round(titleSize * 1.1)) * 1.2),
          fontWeight: '700',
          color: theme.colors.white,
          textAlign: 'center',
          letterSpacing: 1.2,
        }}
      >
        NO COVER
      </Text>
      <Text
        style={{
          marginTop: 2,
          color: theme.colors.white,
          opacity: 0.92,
          fontSize: Math.max(11, Math.round(titleSize * 0.55)),
          lineHeight: Math.max(14, Math.round(titleSize * 0.75)),
          letterSpacing: 2.4,
          textAlign: 'center',
        }}
      >
        AVAILABLE
      </Text>
    </View>
  );
}
