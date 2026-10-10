import React, { createContext, useContext } from 'react';
import {
  Colors,
  Spacing,
  Radius,
  FontSize,
  Elevation,
  Gradients,
  IconSize,
  Palette,
  type ColorScheme,
  type ThemeMode,
  type ThemeColors,
} from '@ashok-raj/ui';

/**
 * ThemeContext — Ashok Raj Groups
 *
 * Light mode is ALWAYS enforced regardless of system setting or user preference.
 * The isDark flag is always false. setMode / toggleMode are no-ops.
 */

interface ThemeContextType {
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
  };
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Always light — no dark mode
  const colors = Colors.light;
  const isDark = false;
  const colorScheme: ColorScheme = 'light';
  const mode: ThemeMode = 'light';

  const value: ThemeContextType = {
    colors,
    colorScheme,
    mode,
    isDark,
    setMode: () => {},    // no-op: light mode enforced
    toggleMode: () => {}, // no-op: light mode enforced
    tokens: {
      spacing: Spacing,
      radius: Radius,
      fontSize: FontSize,
      elevation: Elevation,
      gradients: Gradients,
      iconSize: IconSize,
      palette: Palette,
    },
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (!context) {
    const colors = Colors.light;
    return {
      colors,
      colorScheme: 'light',
      mode: 'light',
      isDark: false,
      setMode: () => {},
      toggleMode: () => {},
      tokens: {
        spacing: Spacing,
        radius: Radius,
        fontSize: FontSize,
        elevation: Elevation,
        gradients: Gradients,
        iconSize: IconSize,
        palette: Palette,
      },
    };
  }
  return context;
}
