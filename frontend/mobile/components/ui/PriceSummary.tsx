import { AppText as Text } from './AppText';
import React from 'react';
import {
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle
} from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { useTranslation } from '../../i18n';
import { Radius, Spacing, FontSize } from '@ashok-raj/ui';

export interface PriceSummaryProps {
  subtotal: number;
  taxAmount?: number;
  deliveryFee?: number;
  discountAmount?: number;
  total: number;
  currency?: string;
  style?: StyleProp<ViewStyle>;
}

export function PriceSummary({
  subtotal,
  taxAmount = 0,
  deliveryFee = 0,
  discountAmount = 0,
  total,
  currency = '₹',
  style,
}: PriceSummaryProps) {
  const { colors } = useTheme();
  const { t, isTamil } = useTranslation();

  const safeSubtotal = Number(subtotal ?? 0);
  const safeTax = Number(taxAmount ?? 0);
  const safeDelivery = Number(deliveryFee ?? 0);
  const safeDiscount = Number(discountAmount ?? 0);
  const safeTotal = Number(total ?? 0);

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
        style,
      ]}
    >
      <Text style={[styles.title, { color: colors.textPrimary }]}>
        {t('restaurant.orderSummary')}
      </Text>

      {/* Subtotal */}
      <View style={styles.row}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>
          {t('common.subtotal')}
        </Text>
        <Text style={[styles.value, { color: colors.textPrimary }]}>
          {currency}{safeSubtotal.toFixed(2)}
        </Text>
      </View>

      {/* Tax */}
      {safeTax > 0 && (
        <View style={styles.row}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>
            {t('common.tax')} (GST)
          </Text>
          <Text style={[styles.value, { color: colors.textPrimary }]}>
            {currency}{safeTax.toFixed(2)}
          </Text>
        </View>
      )}

      {/* Delivery Fee */}
      {deliveryFee !== undefined && (
        <View style={styles.row}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>
            {t('delivery.deliveryFee')}
          </Text>
          <Text
            style={[
              styles.value,
              {
                color: safeDelivery === 0 ? colors.success : colors.textPrimary,
              },
            ]}
          >
            {safeDelivery === 0
              ? t('delivery.freeDelivery')
              : `${currency}${safeDelivery.toFixed(2)}`}
          </Text>
        </View>
      )}

      {/* Discount */}
      {safeDiscount > 0 && (
        <View style={styles.row}>
          <Text style={[styles.label, { color: colors.success }]}>
            {t('common.discount')}
          </Text>
          <Text style={[styles.value, { color: colors.success }]}>
            -{currency}{safeDiscount.toFixed(2)}
          </Text>
        </View>
      )}

      {/* Divider */}
      <View
        style={[styles.divider, { backgroundColor: colors.border }]}
      />

      {/* Total */}
      <View style={styles.totalRow}>
        <Text style={[styles.totalLabel, { color: colors.textPrimary }]}>
          {t('common.total')}
        </Text>
        <Text style={[styles.totalValue, { color: colors.accent }]}>
          {currency}{safeTotal.toFixed(2)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Spacing.base,
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: FontSize.md,
    fontWeight: '700',
    marginBottom: Spacing.md,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  label: {
    fontSize: FontSize.sm,
  },
  value: {
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    marginVertical: Spacing.sm,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 2,
  },
  totalLabel: {
    fontSize: FontSize.md,
    fontWeight: '700',
  },
  totalValue: {
    fontSize: FontSize.xl,
    fontWeight: '800',
  },
});
