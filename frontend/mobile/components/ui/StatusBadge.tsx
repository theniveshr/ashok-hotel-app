import { AppText as Text } from './AppText';
import React from 'react';
import {
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle
} from 'react-native';
import { Radius, FontSize, Palette } from '@ashok-raj/ui';
import { useTheme } from '../../theme/ThemeContext';

export type StatusVariant = 'success' | 'warning' | 'error' | 'info' | 'gold' | 'neutral';

export interface StatusBadgeProps {
  label: string;
  status?: string;       // e.g. 'CONFIRMED', 'DELIVERING' — auto-maps color
  variant?: StatusVariant;
  size?: 'sm' | 'md';
  dot?: boolean;
  style?: StyleProp<ViewStyle>;
  // Legacy — kept for backward compat
  text?: string;
}

export function StatusBadge({
  label,
  status,
  variant,
  size = 'md',
  dot = true,
  style,
  text, // legacy alias for label
}: StatusBadgeProps) {
  const { isDark } = useTheme();
  const displayLabel = label ?? text ?? status ?? '';

  const normalized = (status ?? displayLabel).toUpperCase();

  // Determine semantic category
  let semanticVariant: StatusVariant = variant || 'neutral';
  if (['CONFIRMED', 'DELIVERED', 'COMPLETED', 'CHECKED_OUT', 'AVAILABLE'].includes(normalized)) {
    semanticVariant = 'success';
  } else if (['PREPARING', 'PENDING', 'ACCEPTED'].includes(normalized)) {
    semanticVariant = 'warning';
  } else if (['OUT_FOR_DELIVERY', 'CHECKED_IN', 'EN_ROUTE', 'INSPECTED'].includes(normalized)) {
    semanticVariant = 'info';
  } else if (['CANCELLED', 'REJECTED', 'NO_SHOW', 'OCCUPIED'].includes(normalized)) {
    semanticVariant = 'error';
  } else if (['GOLD', 'VIP', 'SPECIAL', 'ROYAL'].includes(normalized)) {
    semanticVariant = 'gold';
  }

  // Theme-aware color palette (Clean Light Theme)
  let c: { bg: string; text: string; dot: string };
  switch (semanticVariant) {
    case 'success': c = { bg: '#DCFCE7', text: '#15803D', dot: '#16A34A' }; break;
    case 'warning': c = { bg: '#FEF3C7', text: '#B45309', dot: '#F59E0B' }; break;
    case 'error':   c = { bg: '#FEE2E2', text: '#B91C1C', dot: '#DC2626' }; break;
    case 'info':    c = { bg: '#DBEAFE', text: '#1D4ED8', dot: '#2563EB' }; break;
    case 'gold':    c = { bg: '#EFF6FF', text: '#1D4ED8', dot: '#2563EB' }; break;
    default:        c = { bg: '#F1F5F9', text: '#475569', dot: '#64748B' };
  }

  const isSmall = size === 'sm';

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: c.bg,
          paddingVertical:  isSmall ? 2 : 4,
          paddingHorizontal: isSmall ? 6 : 10,
        },
        style,
      ]}
    >
      {dot && (
        <View
          style={[
            styles.dot,
            {
              backgroundColor: c.dot,
              width:  isSmall ? 5 : 6,
              height: isSmall ? 5 : 6,
            },
          ]}
        />
      )}
      <Text
        style={[
          styles.text,
          {
            color:    c.text,
            fontSize: isSmall ? FontSize.xs - 1 : FontSize.xs + 1,
          },
        ]}
      >
        {displayLabel}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.full,
    gap: 5,
    alignSelf: 'flex-start',
  },
  dot: {
    borderRadius: 3,
  },
  text: {
    fontWeight: '700',
    letterSpacing: 0.3,
    textTransform: 'capitalize',
  },
});
