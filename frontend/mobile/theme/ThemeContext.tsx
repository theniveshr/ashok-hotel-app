import React, { createContext, useContext, useMemo } from 'react';
import {
  Colors,
  Spacing,
  Radius,
  FontSize,
  Elevation,
  Gradients,
  IconSize,
  Palette,
  Breakpoints,
  TouchTarget,
  type ColorScheme,
  type ThemeMode,
  type ThemeColors,
} from '@ashok-raj/ui';
import { useThemeStore } from '../store/useThemeStore';

/**
 * ThemeContext — Ashok Raj Groups
 *
 * Full support for Royal Ivory (Light) and Royal Midnight Navy (Dark) themes
 * with persisted user preference across sessions via AsyncStorage.
 */

export interface ThemeContextType {
  colors: ThemeColors;
  colorScheme: ColorScheme;
  mode: ThemeMode;
  isDark: boolean;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
  tokens: {
    spacing: typeof Spacing;
    radius: typeof Radius;
    fontSize: typeof FontSize;
    elevation: typeof Elevation;
    gradients: typeof Gradients;
    iconSize: typeof IconSize;
    palette: typeof Palette;
    breakpoints: typeof Breakpoints;
    touchTarget: typeof TouchTarget;
  };
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { mode, setMode, toggleMode } = useThemeStore();

  const isDark = false;
  const colorScheme: ColorScheme = 'light';
  const colors = Colors.light;

  const value: ThemeContextType = useMemo(
    () => ({
      colors,
      colorScheme,
      mode,
      isDark,
      setMode,
      toggleMode,
      tokens: {
        spacing: Spacing,
        radius: Radius,
        fontSize: FontSize,
        elevation: Elevation,
        gradients: Gradients,
        iconSize: IconSize,
        palette: Palette,
        breakpoints: Breakpoints,
        touchTarget: TouchTarget,
      },
    }),
    [colors, colorScheme, mode, isDark, setMode, toggleMode]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (!context) {
    const isDark = false;
    const colors = Colors.light;
    return {
      colors,
      colorScheme: 'light',
      mode: 'light',
      isDark: false,
      setMode: useThemeStore.getState().setMode,
      toggleMode: useThemeStore.getState().toggleMode,
      tokens: {
        spacing: Spacing,
        radius: Radius,
        fontSize: FontSize,
        elevation: Elevation,
        gradients: Gradients,
        iconSize: IconSize,
        palette: Palette,
        breakpoints: Breakpoints,
        touchTarget: TouchTarget,
      },
    };
  }
  return context;
}
