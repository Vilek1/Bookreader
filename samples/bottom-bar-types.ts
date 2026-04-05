/**
 * Type definitions for Bottom Bar component
 */

export interface BottomBarProps {
  /** Optional ID of the currently active book for FAB navigation */
  activeBookId?: string;
  
  /** Optional className for additional styling (e.g., "glass" for liquid effect) */
  className?: string;
}

/**
 * Navigation route type for bottom bar
 */
export type BottomBarRoute = "library" | "book" | "settings";

/**
 * Active state detector return type
 */
export interface BottomBarActiveState {
  isLibrary: boolean;
  isBook: boolean;
  isSettings: boolean;
}
