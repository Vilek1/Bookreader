/**
 * Design Tokens for Bottom Navigation Bar
 * 
 * Централизованные константы для нижнего бара навигации.
 * Используется в компоненте bottom-bar.tsx
 */

export const BOTTOM_BAR_TOKENS = {
  // =====================
  // Heights & Dimensions
  // =====================
  
  /** Общая высота контейнера навигационного бара */
  containerHeight: 108,
  
  /** Высота видимой части навигации */
  navHeight: 75,
  
  /** Высота SVG кривой фона */
  curveHeight: 107,
  
  /** Отступ кривой сверху (отрицательный для перекрытия) */
  curveTop: -32,

  // =====================
  // FAB (Floating Action Button)
  // =====================
  
  /** Размер центральной плавающей кнопки */
  fabSize: 56,
  
  /** Позиция FAB сверху (отрицательная для выступа) */
  fabTop: -22,
  
  /** Тень для FAB с фиолетовым свечением */
  fabShadow: "0px 4px 12px 0px rgba(97,62,234,0.5)",
  
  /** Непрозрачность FAB */
  fabOpacity: 0.8,

  // =====================
  // Icons
  // =====================
  
  /** Размер иконок в пикселях */
  iconSize: 24,
  
  /** Внутренний отступ для иконок */
  iconInset: "8.33%",

  // =====================
  // Colors
  // =====================
  
  /** Цвет активной иконки/кнопки */
  activeColor: "#9E77ED",
  
  /** Цвет активного текста */
  activeTextColor: "#b692f6",
  
  /** Фон неактивного FAB */
  inactiveBg: "#7f56d9",

  // =====================
  // Typography
  // =====================
  
  /** Размер шрифта для лейблов */
  labelFontSize: "12px",
  
  /** Высота строки для лейблов */
  labelLineHeight: "18px",
  
  /** Семейство шрифтов */
  labelFontFamily: "'Inter',sans-serif",

  // =====================
  // Spacing
  // =====================
  
  /** Горизонтальные отступы (соответствует px-6) */
  horizontalPadding: "1.5rem",
  
  /** Расстояние между иконкой и текстом (соответствует gap-3) */
  itemGap: "0.75rem",
} as const;

/**
 * CSS Variables используемые компонентом
 * (определены в /src/styles/theme.css)
 */
export const BOTTOM_BAR_CSS_VARS = {
  /** Фон навигационного бара */
  navBg: "var(--app-nav-bg)",
  
  /** Цвет неактивных иконок */
  iconMuted: "var(--app-icon-muted)",
  
  /** Цвет неактивного текста */
  textMuted: "var(--app-text-muted)",
  
  /** Цвет вторичного текста */
  textSecondary: "var(--app-text-secondary)",
} as const;

/**
 * Liquid Glass эффект
 * Добавьте класс .glass к контейнеру для применения эффекта
 */
export const LIQUID_GLASS_CLASS = "glass";

/**
 * Пример использования токенов:
 * 
 * ```tsx
 * import { BOTTOM_BAR_TOKENS } from "./bottom-bar-tokens";
 * 
 * <div style={{ height: BOTTOM_BAR_TOKENS.containerHeight }}>
 *   <button style={{ 
 *     width: BOTTOM_BAR_TOKENS.fabSize,
 *     height: BOTTOM_BAR_TOKENS.fabSize,
 *     boxShadow: BOTTOM_BAR_TOKENS.fabShadow 
 *   }}>
 *     Click
 *   </button>
 * </div>
 * ```
 */
