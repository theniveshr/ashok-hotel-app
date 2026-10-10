/**
 * Design Tokens — Ashok Raj Groups
 *
 * Premium hospitality design system.
 * All colors, spacing, typography, elevation, gradients, and motion values are defined here.
 * Components must import from this file — never hard-code values.
 *
 * Color palette: Cobalt blue + clean white + slate neutrals
 * Direction: Premium modern hospitality — light mode only
 */

// ─── Color Palette ────────────────────────────────────────────────────────────

export const Palette = {
  // Brand — Cobalt Blue (primary)
  blue950: '#0C1A47',
  blue900: '#1E3A8A',
  blue800: '#1D4ED8',
  blue700: '#2563EB',  // Primary brand blue
  blue600: '#3B82F6',
  blue500: '#60A5FA',
  blue400: '#93C5FD',
  blue300: '#BFDBFE',
  blue200: '#DBEAFE',
  blue100: '#EFF6FF',
  blue50:  '#F0F7FF',

  // Supporting accents
  emerald700: '#15803D',
  emerald600: '#16A34A',
  emerald500: '#22C55E',
  amber900: '#78350F',
  amber800: '#92400E',
  amber700: '#B45309',
  amber600: '#D97706',
  amber500: '#F59E0B',
  amber300: '#FCD34D',
  amber100: '#FEF3C7',
  rose700: '#BE123C',
  rose600: '#E11D48',
  rose500: '#F43F5E',

  // Slate — Text & Neutral surfaces
  slate950: '#020617',
  slate900: '#0F172A',  // Text primary
  slate800: '#1E293B',
  slate700: '#334155',
  slate600: '#475569',
  slate500: '#64748B',  // Text secondary
  slate400: '#94A3B8',
  slate300: '#CBD5E1',
  slate200: '#E2E8F0',  // Border
  slate100: '#F1F5F9',
  slate50:  '#F8FAFC',  // Background

  // Semantic
  successDark: '#14532D',
  success:     '#16A34A',
  successLight:'#DCFCE7',
  warningDark: '#78350F',
  warning:     '#F59E0B',
  warningLight:'#FEF3C7',
  errorDark:   '#7F1D1D',
  error:       '#DC2626',
  errorLight:  '#FEE2E2',
  infoDark:    '#1E3A8A',
  info:        '#2563EB',
  infoLight:   '#DBEAFE',

  // Pure
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
} as const;

// ─── Semantic Color System ────────────────────────────────────────────────────
// Light mode ONLY — dark values are identical to light to enforce light-mode.

export const Colors = {
  light: {
    // Surfaces
    background:         Palette.slate50,      // #F8FAFC
    surface:            Palette.white,        // #FFFFFF
    surfaceElevated:    Palette.white,
    surfaceOverlay:     'rgba(255, 255, 255, 0.96)',

    // Glass
    glass:              'rgba(255, 255, 255, 0.95)',
    glassBorder:        'rgba(226, 232, 240, 0.85)',
    glassDark:          'rgba(37, 99, 235, 0.06)',

    // Brand
    primary:            Palette.blue700,      // #2563EB
    primaryDark:        Palette.blue800,      // #1D4ED8
    primaryLight:       Palette.blue200,      // #DBEAFE
    accent:             Palette.blue700,      // same as primary
    accentDark:         Palette.blue800,
    accentLight:        Palette.blue100,

    // Text
    textPrimary:        '#0F172A',            // strong dark black text (slate900)
    textSecondary:      '#1E293B',            // deep dark slate text (slate800)
    textTertiary:       '#334155',            // solid dark slate text (slate700)
    textMuted:          '#475569',            // clearly readable secondary slate (slate600)
    textDisabled:       '#64748B',
    textInverse:        Palette.white,
    textAccent:         Palette.blue700,
    textLink:           Palette.blue700,

    // Borders
    border:             Palette.slate200,     // #E2E8F0
    borderFocus:        Palette.blue700,
    borderStrong:       Palette.slate300,

    // Status
    success:            Palette.success,
    successBg:          Palette.successLight,
    warning:            Palette.warning,
    warningBg:          Palette.warningLight,
    error:              Palette.error,
    errorBg:            Palette.errorLight,
    info:               Palette.info,
    infoBg:             Palette.infoLight,

    // Tab bar & Nav
    tabActive:          Palette.blue700,
    tabInactive:        '#334155',
    tabBar:             Palette.white,
  },
  // Dark === light: enforced light mode, dark fallback resolves to same values
  dark: {
    background:         Palette.slate50,
    surface:            Palette.white,
    surfaceElevated:    Palette.white,
    surfaceOverlay:     'rgba(255, 255, 255, 0.96)',
    glass:              'rgba(255, 255, 255, 0.95)',
    glassBorder:        'rgba(226, 232, 240, 0.85)',
    glassDark:          'rgba(37, 99, 235, 0.06)',
    primary:            Palette.blue700,
    primaryDark:        Palette.blue800,
    primaryLight:       Palette.blue200,
    accent:             Palette.blue700,
    accentDark:         Palette.blue800,
    accentLight:        Palette.blue100,
    textPrimary:        '#0F172A',
    textSecondary:      '#1E293B',
    textTertiary:       '#334155',
    textMuted:          '#475569',
    textDisabled:       '#64748B',
    textInverse:        Palette.white,
    textAccent:         Palette.blue700,
    textLink:           Palette.blue700,
    border:             Palette.slate200,
    borderFocus:        Palette.blue700,
    borderStrong:       Palette.slate300,
    success:            Palette.success,
    successBg:          Palette.successLight,
    warning:            Palette.warning,
    warningBg:          Palette.warningLight,
    error:              Palette.error,
    errorBg:            Palette.errorLight,
    info:               Palette.info,
    infoBg:             Palette.infoLight,
    tabActive:          Palette.blue700,
    tabInactive:        '#334155',
    tabBar:             Palette.white,
  },
} as const;

export type ColorScheme = 'light' | 'dark';
export type ThemeMode = 'light' | 'dark' | 'system';
export type ThemeColors = { [K in keyof typeof Colors.light]: string };

// ─── Spacing ──────────────────────────────────────────────────────────────────

export const Spacing = {
  xs:   4,
  sm:   8,
  md:   12,
  base: 16,
  lg:   20,
  xl:   24,
  '2xl': 32,
  '3xl': 40,
  '4xl': 48,
  '5xl': 64,
  '6xl': 80,
} as const;

// ─── Border Radius ────────────────────────────────────────────────────────────

export const Radius = {
  none: 0,
  xs:   4,
  sm:   8,
  md:   12,
  lg:   16,
  xl:   20,
  '2xl': 24,
  '3xl': 32,
  full: 9999,
} as const;

// ─── Typography ───────────────────────────────────────────────────────────────

export const FontFamily = {
  // Uses the platform's clean geometric sans until bundled Manrope assets are supplied.
  regular:      'sans-serif',
  medium:       'sans-serif',
  semiBold:     'sans-serif',
  bold:         'sans-serif',
  extraBold:    'sans-serif',

  taRegular:    'NotoSansTamil-Regular',
  taMedium:     'NotoSansTamil-Medium',
  taSemiBold:   'NotoSansTamil-SemiBold',
  taBold:       'NotoSansTamil-Bold',

  serif:        'PlayfairDisplay-Bold',
} as const;

export const FontSize = {
  xs:   10,
  sm:   12,
  base: 14,
  md:   16,
  lg:   18,
  xl:   20,
  '2xl': 24,
  '3xl': 28,
  '4xl': 32,
  '5xl': 36,
  '6xl': 48,
} as const;

export const LineHeight = {
  tight:   1.2,
  normal:  1.5,
  relaxed: 1.75,
} as const;

export const LetterSpacing = {
  tight:  -0.5,
  normal: 0,
  wide:   0.5,
  wider:  1,
  widest: 2,
} as const;

// ─── Elevation / Shadow ───────────────────────────────────────────────────────
// Shadows use a soft blue-slate tint for premium feel.

import { Platform } from 'react-native';

export const Elevation = {
  none: Platform.select({
    web: { boxShadow: 'none' },
    default: {
      shadowColor: Palette.slate900,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0,
      shadowRadius: 0,
      elevation: 0,
    },
  }) as any,
  xs: Platform.select({
    web: { boxShadow: '0 1px 3px rgba(15, 23, 42, 0.05)' },
    default: {
      shadowColor: Palette.blue700,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
  }) as any,
  sm: Platform.select({
    web: { boxShadow: '0 2px 6px rgba(15, 23, 42, 0.06)' },
    default: {
      shadowColor: Palette.blue700,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.07,
      shadowRadius: 4,
      elevation: 2,
    },
  }) as any,
  md: Platform.select({
    web: { boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)' },
    default: {
      shadowColor: Palette.blue700,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.09,
      shadowRadius: 8,
      elevation: 4,
    },
  }) as any,
  lg: Platform.select({
    web: { boxShadow: '0 8px 20px rgba(15, 23, 42, 0.10)' },
    default: {
      shadowColor: Palette.blue900,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.10,
      shadowRadius: 16,
      elevation: 8,
    },
  }) as any,
  xl: Platform.select({
    web: { boxShadow: '0 16px 32px rgba(15, 23, 42, 0.12)' },
    default: {
      shadowColor: Palette.blue900,
      shadowOffset: { width: 0, height: 16 },
      shadowOpacity: 0.12,
      shadowRadius: 24,
      elevation: 12,
    },
  }) as any,
};

// ─── Animation Durations ──────────────────────────────────────────────────────

export const Duration = {
  instant:  100,
  fast:     150,
  normal:   250,
  slow:     350,
  slower:   500,
  slowest:  800,
} as const;

// ─── Z-Index ──────────────────────────────────────────────────────────────────

export const ZIndex = {
  base:    0,
  raised:  10,
  overlay: 100,
  modal:   200,
  toast:   300,
  tooltip: 400,
} as const;

// ─── Icon Sizes ───────────────────────────────────────────────────────────────

export const IconSize = {
  xs:   14,
  sm:   18,
  md:   22,
  lg:   26,
  xl:   32,
  '2xl': 40,
  '3xl': 48,
} as const;

// ─── Premium Gradients ────────────────────────────────────────────────────────

export const Gradients = {
  // Primary blue gradients
  blue: [Palette.blue700, Palette.blue800] as const,
  blueSoft: [Palette.blue600, Palette.blue700] as const,
  blueSubtle: ['rgba(37, 99, 235, 0.12)', 'rgba(37, 99, 235, 0.04)'] as const,

  // Hero overlay
  heroOverlay: ['rgba(15, 23, 42, 0.0)', 'rgba(15, 23, 42, 0.65)'] as const,
  heroOverlayLight: ['rgba(248, 250, 252, 0.0)', 'rgba(248, 250, 252, 0.85)'] as const,

  // Glass
  glassLight: ['rgba(255, 255, 255, 0.90)', 'rgba(255, 255, 255, 0.72)'] as const,
  glassBlue: ['rgba(239, 246, 255, 0.90)', 'rgba(219, 234, 254, 0.72)'] as const,

  // Background
  backgroundPage: [Palette.blue50, Palette.white] as const,
  surfaceShimmer: ['rgba(255,255,255,0.02)', 'rgba(255,255,255,0.08)', 'rgba(255,255,255,0.02)'] as const,

  // Kept for backward compat (deprecated — use blue variants instead)
  gold: [Palette.blue600, Palette.blue700] as const,
  goldSoft: [Palette.blue500, Palette.blue600] as const,
  goldSubtle: ['rgba(37, 99, 235, 0.12)', 'rgba(37, 99, 235, 0.04)'] as const,
  navyHero: [Palette.blue900, Palette.blue950] as const,
  navyCard: [Palette.blue800, Palette.blue900] as const,
  glassDark: ['rgba(30, 58, 138, 0.85)', 'rgba(12, 26, 71, 0.65)'] as const,
} as const;

// ─── Spring & Motion Presets ─────────────────────────────────────────────────

export const SpringConfig = {
  gentle: {
    damping: 20,
    stiffness: 120,
    mass: 1,
  },
  snappy: {
    damping: 15,
    stiffness: 200,
    mass: 0.8,
  },
  bouncy: {
    damping: 10,
    stiffness: 180,
    mass: 0.9,
  },
} as const;
