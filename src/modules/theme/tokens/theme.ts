import type { ColorSchemeName, TextStyle } from 'react-native';

import {
  figmaColorModes,
  figmaRadius,
  figmaSpacing,
  figmaTypography,
} from './figmaTokens';

type AppColors = {
  background: string;
  surface: string;
  surfaceMuted: string;
  card: string;
  primary: string;
  primaryStrong: string;
  primarySoft: string;
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  textBrandPrimary: string;
  iconSecondary: string;
  border: string;
  borderSubtle: string;
  danger: string;
  success: string;
  warning: string;
  white: string;
  overlay: string;
};

type AppSpacing = {
  none: number;
  xxs: number;
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  xxl: number;
  xxxl: number;
};

type AppRadius = {
  none: number;
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  pill: number;
};

type TypographyStyle = Pick<
  TextStyle,
  'fontFamily' | 'fontSize' | 'lineHeight' | 'fontWeight'
>;

type AppTypography = {
  title: TypographyStyle;
  titleMedium: TypographyStyle;
  titleSmall: TypographyStyle;
  heading: TypographyStyle;
  body: TypographyStyle;
  bodyMedium: TypographyStyle;
  bodySmall: TypographyStyle;
  bodySmallMedium: TypographyStyle;
  caption: TypographyStyle;
  label: TypographyStyle;
};

type AppShadows = {
  bottomBar: {
    shadowColor: string;
    shadowOffset: { width: number; height: number };
    shadowOpacity: number;
    shadowRadius: number;
    elevation: number;
  };
  menu: {
    shadowColor: string;
    shadowOffset: { width: number; height: number };
    shadowOpacity: number;
    shadowRadius: number;
    elevation: number;
  };
  fabDefault: {
    shadowColor: string;
    shadowOffset: { width: number; height: number };
    shadowOpacity: number;
    shadowRadius: number;
    elevation: number;
  };
  fabSelected: {
    shadowColor: string;
    shadowOffset: { width: number; height: number };
    shadowOpacity: number;
    shadowRadius: number;
    elevation: number;
  };
};

export type AppTheme = {
  colors: AppColors;
  spacing: AppSpacing;
  radius: AppRadius;
  typography: AppTypography;
  shadows: AppShadows;
};

const baseTheme: Omit<AppTheme, 'colors' | 'shadows'> = {
  spacing: {
    none: figmaSpacing.none,
    xxs: figmaSpacing.xxs,
    xs: figmaSpacing.xs,
    sm: figmaSpacing.sm,
    md: figmaSpacing.md,
    lg: figmaSpacing.lg,
    xl: figmaSpacing.xl,
    xxl: figmaSpacing['2xl'],
    xxxl: figmaSpacing['3xl'],
  },
  radius: {
    none: figmaRadius.none,
    xs: figmaRadius.xs,
    sm: figmaRadius.sm,
    md: figmaRadius.md,
    lg: figmaRadius['2xl'],
    xl: figmaRadius['3xl'],
    pill: figmaRadius.full,
  },
  typography: {
    title: {
      fontFamily: figmaTypography.fontFamilyBody,
      fontSize: figmaTypography.fontSizeTextXl,
      lineHeight: figmaTypography.lineHeightTextXl,
      fontWeight: figmaTypography.fontWeightSemibold,
    },
    titleMedium: {
      fontFamily: figmaTypography.fontFamilyBody,
      fontSize: figmaTypography.fontSizeTextMd,
      lineHeight: figmaTypography.lineHeightTextMd,
      fontWeight: figmaTypography.fontWeightMedium,
    },
    titleSmall: {
      fontFamily: figmaTypography.fontFamilyBody,
      fontSize: figmaTypography.fontSizeTextSm,
      lineHeight: figmaTypography.lineHeightTextSm,
      fontWeight: figmaTypography.fontWeightSemibold,
    },
    heading: {
      fontFamily: figmaTypography.fontFamilyDisplay,
      fontSize: figmaTypography.fontSizeDisplayXs,
      lineHeight: figmaTypography.lineHeightDisplayXs,
      fontWeight: figmaTypography.fontWeightBold,
    },
    body: {
      fontFamily: figmaTypography.fontFamilyBody,
      fontSize: figmaTypography.fontSizeTextMd,
      lineHeight: figmaTypography.lineHeightTextMd,
      fontWeight: figmaTypography.fontWeightRegular,
    },
    bodyMedium: {
      fontFamily: figmaTypography.fontFamilyBody,
      fontSize: figmaTypography.fontSizeTextMd,
      lineHeight: figmaTypography.lineHeightTextMd,
      fontWeight: figmaTypography.fontWeightMedium,
    },
    bodySmall: {
      fontFamily: figmaTypography.fontFamilyBody,
      fontSize: figmaTypography.fontSizeTextSm,
      lineHeight: figmaTypography.lineHeightTextSm,
      fontWeight: figmaTypography.fontWeightRegular,
    },
    bodySmallMedium: {
      fontFamily: figmaTypography.fontFamilyBody,
      fontSize: figmaTypography.fontSizeTextSm,
      lineHeight: figmaTypography.lineHeightTextSm,
      fontWeight: figmaTypography.fontWeightMedium,
    },
    caption: {
      fontFamily: figmaTypography.fontFamilyBody,
      fontSize: figmaTypography.fontSizeTextXs,
      lineHeight: figmaTypography.lineHeightTextXs,
      fontWeight: figmaTypography.fontWeightRegular,
    },
    label: {
      fontFamily: figmaTypography.fontFamilyBody,
      fontSize: figmaTypography.fontSizeTextXs,
      lineHeight: figmaTypography.lineHeightTextXs,
      fontWeight: figmaTypography.fontWeightSemibold,
    },
  },
};

function buildTheme(colors: AppColors, shadows: AppShadows): AppTheme {
  return {
    ...baseTheme,
    colors,
    shadows,
  };
}

const lightShadows: AppShadows = {
  bottomBar: {
    shadowColor: '#0A0D12',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 6,
  },
  menu: {
    shadowColor: '#0A0D12',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 6,
  },
  fabDefault: {
    shadowColor: '#0A0D12',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 6,
  },
  fabSelected: {
    shadowColor: '#613EEA',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.24,
    shadowRadius: 16,
    elevation: 10,
  },
};

const darkShadows: AppShadows = {
  bottomBar: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0,
    shadowRadius: 16,
    elevation: 0,
  },
  menu: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0,
    shadowRadius: 16,
    elevation: 0,
  },
  fabDefault: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0,
    shadowRadius: 16,
    elevation: 0,
  },
  fabSelected: {
    shadowColor: '#613EEA',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.24,
    shadowRadius: 16,
    elevation: 10,
  },
};

export const lightTheme = buildTheme(figmaColorModes.light as AppColors, lightShadows);

export const darkTheme = buildTheme(figmaColorModes.dark as AppColors, darkShadows);

export function getTheme(colorScheme?: ColorSchemeName): AppTheme {
  return colorScheme === 'dark' ? darkTheme : lightTheme;
}

export const theme = lightTheme;
