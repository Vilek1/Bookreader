import type { AppTheme } from '@/modules/theme/tokens/theme';

export function getBottomBarTokens(theme: AppTheme) {
  const darkBottomMenuFill = '#0C0E12';
  const isDarkTheme = theme.colors.textPrimary.toLowerCase() === '#f7f7f7';

  return {
    containerHeight: 87,
    navHeight: 87,
    curveHeight: 119,
    curveTop: -32,
    fabSize: 56,
    fabBottom: 51,
    fabOpacity: 0.8,
    iconSize: 24,
    activeIconColor: theme.colors.textBrandPrimary,
    inactiveIconColor: theme.colors.iconSecondary,
    activeLabelColor: theme.colors.textBrandPrimary,
    inactiveLabelColor: theme.colors.textSecondary,
    navBackground: isDarkTheme ? darkBottomMenuFill : theme.colors.card,
    navShadow: theme.shadows.bottomBar,
    fabBackgroundNormal: theme.colors.card,
    fabBackgroundSelected: theme.colors.primary,
    fabIconNormal: theme.colors.iconSecondary,
    fabIconSelected: theme.colors.white,
    fabShadowNormal: theme.shadows.fabDefault,
    fabShadowSelected: theme.shadows.fabSelected,
    fabGlassBorderColor: theme.colors.white,
    fabGlassBorderOpacity: 0.28,
    fabGlassSheenOpacity: 0.08,
  } as const;
}
