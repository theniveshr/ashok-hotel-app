/**
 * Theme context and hook — React Native
 * Phase 1 will wrap the app in ThemeProvider; for now this exports the theme object.
 */
import { Colors, type ColorScheme, type ThemeColors } from './tokens';

export function getTheme(scheme: ColorScheme): ThemeColors {
  return Colors[scheme];
}

export * from './tokens';
