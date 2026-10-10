import { AppText as Text } from './AppText';
import React from 'react';
import {
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle
} from 'react-native';
import { Radius, FontSize, Palette } from '@ashok-raj/ui';

/**
 * Status semantic mapping for order/booking statuses.
 * Uses WCAG AA accessible colors.
 */
const STATUS_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  // Order statuses
  CONFIRMED:        { bg: '#DCFCE7', text: '#15803D', dot: '#16A34A' },
  DELIVERED:        { bg: '#DCFCE7', text: '#15803D', dot: '#16A34A' },
  COMPLETED:        { bg: '#DCFCE7', text: '#15803D', dot: '#16A34A' },
  CHECKED_OUT:      { bg: '#DCFCE7', text: '#15803D', dot: '#16A34A' },

  PREPARING:        { bg: '#FEF3C7', text: '#B45309', dot: '#F59E0B' },
  PENDING:          { bg: '#FEF3C7', text: '#B45309', dot: '#F59E0B' },
  ACCEPTED:         { bg: '#FEF3C7', text: '#B45309', dot: '#F59E0B' },

  OUT_FOR_DELIVERY: { bg: '#DBEAFE', text: '#1D4ED8', dot: '#2563EB' },
  CHECKED_IN:       { bg: '#DBEAFE', text: '#1D4ED8', dot: '#2563EB' },
  EN_ROUTE:         { bg: '#DBEAFE', text: '#1D4ED8', dot: '#2563EB' },

  CANCELLED:        { bg: '#FEE2E2', text: '#B91C1C', dot: '#DC2626' },
  REJECTED:         { bg: '#FEE2E2', text: '#B91C1C', dot: '#DC2626' },
  NO_SHOW:          { bg: '#FEE2E2', text: '#B91C1C', dot: '#DC2626' },

  CLEANING:         { bg: '#F0F9FF', text: '#0369A1', dot: '#0EA5E9' },
  MAINTENANCE:      { bg: '#FFF7ED', text: '#C2410C', dot: '#EA580C' },
};

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
  const displayLabel = label ?? text ?? status ?? '';

  // Auto-map from status string first, then fall back to variant
  let c = STATUS_COLORS[status?.toUpperCase() ?? ''] ??
          STATUS_COLORS[displayLabel?.toUpperCase() ?? ''];

  if (!c) {
    switch (variant) {
      case 'success': c = { bg: '#DCFCE7', text: '#15803D', dot: '#16A34A' }; break;
      case 'warning': c = { bg: '#FEF3C7', text: '#B45309', dot: '#F59E0B' }; break;
      case 'error':   c = { bg: '#FEE2E2', text: '#B91C1C', dot: '#DC2626' }; break;
      case 'info':
      case 'gold':    c = { bg: '#DBEAFE', text: '#1D4ED8', dot: '#2563EB' }; break;
      default:        c = { bg: '#F1F5F9', text: '#475569', dot: '#64748B' };
    }
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
