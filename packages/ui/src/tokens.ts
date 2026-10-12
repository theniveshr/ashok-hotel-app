/**
 * Design Tokens — Ashok Raj Groups
 *
 * Signature Hospitality Design System:
 * - Signature Blue (#2563EB / #1D4ED8 / #3B82F6)
 * - Clean Light Theme (#FFFFFF / #F8FAFC / #F1F5F9)
 * - High-contrast Neutral Text (Charcoal #0F172A / Slate #475569)
 * - Semantic Statuses (Emerald / Amber / Rose / Sky)
 *
 * Light Theme Only.
 * Components must import tokens from here — never hard-code hex codes.
 */

import { Platform } from 'react-native';

// ─── Color Palette ────────────────────────────────────────────────────────────

export const Palette = {
  // Brand — Royal Navy
  navy950: '#070C1E', // Midnight Royal Navy (Deepest background)
  navy900: '#0B132B', // Signature Royal Navy (Surface & Branding)
  navy850: '#111B38', // Elevated Navy Card Surface
  navy800: '#1C2541', // Secondary Navy Surface
  navy700: '#2A365F', // Muted Navy Border
  navy600: '#3A4B7C',

  // Brand — Gold tokens mapped to Project Blue Palette
  gold600: '#1D4ED8', // Palette.blue800
  gold500: '#2563EB', // Palette.blue700 (Signature Blue)
  gold400: '#3B82F6', // Palette.blue600
  gold300: '#60A5FA', // Palette.blue500
  gold200: '#DBEAFE', // Palette.blue200
  gold100: '#EFF6FF', // Palette.blue100
  gold50:  '#F8FAFC',

  // Neutral — Warm Ivory & Clean Surfaces
  ivory50:  '#FAF8F5', // Signature Warm Ivory Background
  ivory100: '#F5F0E8', // Warm Ivory Surface
  ivory200: '#EBE3D5', // Warm Ivory Border
  ivory300: '#D6C7B2',

  // Neutral — Text & Slate
  slate950: '#020617',
  slate900: '#0F172A', // Primary Charcoal Text
  slate800: '#1E293B', // Secondary Text
  slate700: '#334155',
  slate600: '#475569', // Muted Slate
  slate500: '#64748B',
  slate400: '#94A3B8',
  slate300: '#CBD5E1',
  slate200: '#E2E8F0', // Border
  slate100: '#F1F5F9',
  slate50:  '#F8FAFC',

  // Legacy compatibility: Cobalt Blue
  blue950: '#0C1A47',
  blue900: '#1E3A8A',
  blue800: '#1D4ED8',
  blue700: '#2563EB',
  blue600: '#3B82F6',
  blue500: '#60A5FA',
  blue400: '#93C5FD',
  blue300: '#BFDBFE',
  blue200: '#DBEAFE',
  blue100: '#EFF6FF',
  blue50:  '#F0F7FF',

  // Semantic Status Colors
  emerald700: '#15803D',
  emerald600: '#16A34A',
  emerald500: '#10B981', // Success
  emerald100: '#D1FAE5',
  emerald900: '#064E3B',

  amber900: '#78350F',
  amber800: '#92400E',
  amber700: '#B45309',
  amber600: '#D97706',
  amber500: '#F59E0B', // Warning
  amber300: '#FCD34D',
  amber100: '#FEF3C7',

  rose700: '#BE123C',
  rose600: '#DC2626',
  rose500: '#EF4444', // Error
  rose100: '#FEE2E2',
  rose900: '#7F1D1D',

  sky600: '#0284C7',
  sky500: '#0EA5E9', // Info
  sky100: '#E0F2FE',
  sky900: '#0C4A6E',

  // Pure
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',

  // Status mapping
  successDark: '#14532D',
  success:     '#10B981',
  successLight:'#D1FAE5',
  warningDark: '#78350F',
  warning:     '#F59E0B',
  warningLight:'#FEF3C7',
  errorDark:   '#7F1D1D',
  error:       '#EF4444',
  errorLight:  '#FEE2E2',
  infoDark:    '#1E3A8A',
  info:        '#0EA5E9',
  infoLight:   '#E0F2FE',
} as const;

// ─── Semantic Color System (Light Theme Only) ─────────────────────────────────

export const Colors = {
  light: {
    // Surfaces
    background:         Palette.slate50,       // Light Gray #F8FAFC
    surface:            Palette.white,         // Clean Pure White #FFFFFF
    surfaceElevated:    Palette.white,
    surfaceOverlay:     'rgba(255, 255, 255, 0.96)',

    // Navigation & Overlays
    glass:              'rgba(255, 255, 255, 0.95)',
    glassBorder:        Palette.slate200,      // #E2E8F0
    glassDark:          'rgba(15, 23, 42, 0.06)',

    // Brand Signatures — Signature Blue Scheme
    primary:            Palette.blue700,       // Signature Blue #2563EB
    primaryDark:        Palette.blue800,       // Deep Blue #1D4ED8
    primaryLight:       Palette.blue600,       // Bright Blue #3B82F6
    accent:             Palette.blue700,       // Active Accent Blue #2563EB
    accentDark:         Palette.blue800,       // #1D4ED8
    accentLight:        Palette.blue200,       // Soft Blue Tint #DBEAFE
    accentSoft:         Palette.blue100,       // Pale Blue #EFF6FF

    royalNavy:          Palette.blue900,       // #1E3A8A
    champagneGold:      Palette.blue700,       // Mapped to Blue
    ivory:              Palette.white,

    // Text & Contrast
    textPrimary:        Palette.slate900,      // Charcoal #0F172A
    textSecondary:      Palette.slate700,      // Slate #334155
    textTertiary:       Palette.slate600,      // Muted Slate #475569
    textMuted:          Palette.slate500,      // #64748B
    textDisabled:       Palette.slate400,
    textInverse:        Palette.white,
    textAccent:         Palette.blue700,       // #2563EB
    textLink:           Palette.blue700,       // #2563EB

    // Borders & Dividers
    border:             Palette.slate200,      // Light Gray Border #E2E8F0
    borderFocus:        Palette.blue700,       // Focus Blue #2563EB
    borderStrong:       Palette.slate300,      // #CBD5E1

    // Semantic States
    success:            Palette.emerald500,
    successBg:          Palette.emerald100,
    warning:            Palette.amber500,
    warningBg:          Palette.amber100,
    error:              Palette.rose500,
    errorBg:            Palette.rose100,
    info:               Palette.sky500,
    infoBg:             Palette.sky100,

    // Navigation & Tabs
    tabActive:          Palette.blue700,       // Blue Active Item #2563EB
    tabInactive:        Palette.slate500,      // Slate Inactive Item #64748B
    tabBar:             Palette.white,
  },

  // Dark is mapped to Light to strictly enforce Light Theme Only
  dark: {
    // Surfaces
    background:         Palette.slate50,
    surface:            Palette.white,
    surfaceElevated:    Palette.white,
    surfaceOverlay:     'rgba(255, 255, 255, 0.96)',

    // Navigation & Overlays
    glass:              'rgba(255, 255, 255, 0.95)',
    glassBorder:        Palette.slate200,
    glassDark:          'rgba(15, 23, 42, 0.06)',

    // Brand Signatures
    primary:            Palette.blue700,
    primaryDark:        Palette.blue800,
    primaryLight:       Palette.blue600,
    accent:             Palette.blue700,
    accentDark:         Palette.blue800,
    accentLight:        Palette.blue200,
    accentSoft:         Palette.blue100,

    royalNavy:          Palette.blue900,
    champagneGold:      Palette.blue700,
    ivory:              Palette.white,

    // Text & Contrast
    textPrimary:        Palette.slate900,
    textSecondary:      Palette.slate700,
    textTertiary:       Palette.slate600,
    textMuted:          Palette.slate500,
    textDisabled:       Palette.slate400,
    textInverse:        Palette.white,
    textAccent:         Palette.blue700,
    textLink:           Palette.blue700,

    // Borders & Dividers
    border:             Palette.slate200,
    borderFocus:        Palette.blue700,
    borderStrong:       Palette.slate300,

    // Semantic States
    success:            Palette.emerald500,
    successBg:          Palette.emerald100,
    warning:            Palette.amber500,
    warningBg:          Palette.amber100,
    error:              Palette.rose500,
    errorBg:            Palette.rose100,
    info:               Palette.sky500,
    infoBg:             Palette.sky100,

    // Navigation & Tabs
    tabActive:          Palette.blue700,
    tabInactive:        Palette.slate500,
    tabBar:             Palette.white,
  },
} as const;

export type ColorScheme = 'light';
export type ThemeMode = 'light';
export type ThemeColors = { [K in keyof typeof Colors.light]: string };

// ─── Spacing Scale ────────────────────────────────────────────────────────────

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

// ─── Responsive Breakpoints ───────────────────────────────────────────────────

export const Breakpoints = {
  phoneSmall: 360,
  phone:      414,
  tablet:     768,
  desktop:    1024,
  wide:       1280,
} as const;

// ─── Accessibility & Touch Targets ───────────────────────────────────────────

export const TouchTarget = {
  minHeight: 44,
  minWidth:  44,
} as const;

// ─── Typography ───────────────────────────────────────────────────────────────

export const FontFamily = {
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

// ─── Elevation / Shadow Presets ───────────────────────────────────────────────

export const Elevation = {
  none: Platform.select({
    web: { boxShadow: 'none' },
    default: {
      shadowColor: Palette.black,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0,
      shadowRadius: 0,
      elevation: 0,
    },
  }) as any,
  xs: Platform.select({
    web: { boxShadow: '0 1px 3px rgba(11, 19, 43, 0.08)' },
    default: {
      shadowColor: Palette.navy900,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.06,
      shadowRadius: 2,
      elevation: 1,
    },
  }) as any,
  sm: Platform.select({
    web: { boxShadow: '0 2px 6px rgba(11, 19, 43, 0.10)' },
    default: {
      shadowColor: Palette.navy900,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
      elevation: 2,
    },
  }) as any,
  md: Platform.select({
    web: { boxShadow: '0 4px 12px rgba(11, 19, 43, 0.12)' },
    default: {
      shadowColor: Palette.navy900,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 8,
      elevation: 4,
    },
  }) as any,
  lg: Platform.select({
    web: { boxShadow: '0 8px 24px rgba(11, 19, 43, 0.16)' },
    default: {
      shadowColor: Palette.navy950,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.16,
      shadowRadius: 16,
      elevation: 8,
    },
  }) as any,
  xl: Platform.select({
    web: { boxShadow: '0 16px 36px rgba(11, 19, 43, 0.20)' },
    default: {
      shadowColor: Palette.navy950,
      shadowOffset: { width: 0, height: 16 },
      shadowOpacity: 0.20,
      shadowRadius: 24,
      elevation: 12,
    },
  }) as any,
  blueGlow: Platform.select({
    web: { boxShadow: '0 4px 16px rgba(37, 99, 235, 0.25)' },
    default: {
      shadowColor: Palette.blue700,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 10,
      elevation: 6,
    },
  }) as any,
  goldGlow: Platform.select({
    web: { boxShadow: '0 4px 16px rgba(37, 99, 235, 0.25)' },
    default: {
      shadowColor: Palette.blue700,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 10,
      elevation: 6,
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

// ─── Z-Index Hierarchy ────────────────────────────────────────────────────────

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
  // Signature Blue Gradients
  blue: [Palette.blue700, Palette.blue800] as const,
  blueSoft: [Palette.blue600, Palette.blue700] as const,
  blueSubtle: ['rgba(37, 99, 235, 0.12)', 'rgba(37, 99, 235, 0.02)'] as const,

  // Compatibility aliases mapped to blue
  gold: [Palette.blue700, Palette.blue800] as const,
  goldSoft: [Palette.blue600, Palette.blue700] as const,
  goldSubtle: ['rgba(37, 99, 235, 0.12)', 'rgba(37, 99, 235, 0.02)'] as const,

  // Navy Gradients
  navyHero: [Palette.blue900, Palette.blue800] as const,
  navyCard: [Palette.white, Palette.slate50] as const,

  // Overlays
  heroOverlay: ['rgba(15, 23, 42, 0.0)', 'rgba(15, 23, 42, 0.65)'] as const,
  heroOverlayLight: ['rgba(248, 250, 252, 0.0)', 'rgba(248, 250, 252, 0.88)'] as const,

  // Glassmorphic Gradients
  glassLight: ['rgba(255, 255, 255, 0.95)', 'rgba(248, 250, 252, 0.85)'] as const,
  glassDark: ['rgba(255, 255, 255, 0.95)', 'rgba(248, 250, 252, 0.85)'] as const,
  glassGold: ['rgba(37, 99, 235, 0.12)', 'rgba(37, 99, 235, 0.02)'] as const,

  // Surfaces
  backgroundPage: [Palette.slate50, Palette.white] as const,
  surfaceShimmer: ['rgba(255,255,255,0.4)', 'rgba(255,255,255,0.8)', 'rgba(255,255,255,0.4)'] as const,
} as const;

// ─── Spring & Motion Presets ──────────────────────────────────────────────────

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
