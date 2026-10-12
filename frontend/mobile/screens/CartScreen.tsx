import { AppText as Text } from '../components/ui/AppText';
﻿import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity
} from 'react-native';
import { Trash2, Tag, ArrowRight, Bike, ShoppingBag, UtensilsCrossed, Check, FileText } from 'lucide-react-native';
import { useTheme } from '../theme/ThemeContext';
import { useTranslation } from '../i18n';
import { Header } from '../components/ui/Header';
import { PrimaryButton } from '../components/ui/PrimaryButton';
import { QuantitySelector } from '../components/ui/QuantitySelector';
import { PriceSummary } from '../components/ui/PriceSummary';
import { EmptyState } from '../components/ui/EmptyState';
import { Radius, Spacing, FontSize, Palette } from '@ashok-raj/ui';
import { useCartStore } from '../store/useCartStore';
import type { OrderType } from '@ashok-raj/types';

export interface CartScreenProps {
  onBack: () => void;
  onProceedToCheckout: () => void;
  onExploreMenu: () => void;
}

export function CartScreen({
  onBack,
  onProceedToCheckout,
  onExploreMenu,
}: CartScreenProps) {
  const { colors } = useTheme();
  const { t, isTamil } = useTranslation();

  const {
    items,
    deliveryType,
    setDeliveryType,
    specialInstructions,
    setSpecialInstructions,
    updateQuantity,
    couponCode,
    discountAmount,
    applyCoupon,
    removeCoupon,
    getSubtotal,
    getDeliveryFee,
    getTaxAmount,
    getTotalAmount,
  } = useCartStore();

  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState<string | null>(null);

  const subtotal = getSubtotal();
  const deliveryFee = getDeliveryFee();
  const taxAmount = getTaxAmount();
  const total = getTotalAmount();

  const handleApplyCoupon = (codeToApply?: string) => {
    const code = codeToApply || couponInput;
    if (!code) return;
    const success = applyCoupon(code);
    if (success) {
      setCouponInput('');
      setCouponError(null);
    } else {
      setCouponError(isTamil ? 'செல்லுபடியாகாத கூப்பன்' : 'Invalid coupon code');
    }
  };

  if (items.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Header showBack onBackPress={onBack} title={t('restaurant.cart')} />
        <EmptyState
          title={t('restaurant.cartEmpty')}
          description={t('restaurant.cartEmptyHint')}
          actionTitle={isTamil ? 'உணவு பட்டியல்' : 'Explore Menu'}
          onActionPress={onExploreMenu}
        />
      </View>
    );
  }

  const deliveryOptions: Array<{ type: OrderType; label: string; labelTa: string; icon: any }> = [
    { type: 'HOME_DELIVERY', label: 'Delivery', labelTa: 'டெலிவரி', icon: Bike },
    { type: 'TAKEAWAY', label: 'Takeaway', labelTa: 'பார்சல்', icon: ShoppingBag },
    { type: 'DINE_IN', label: 'Dine-In', labelTa: 'உணவுக்கூடம்', icon: UtensilsCrossed },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        showBack
        onBackPress={onBack}
        title={t('restaurant.yourCart')}
        subtitle={`${items.length} ${isTamil ? 'உணவுகள்' : 'items'}`}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Delivery Type Selector */}
        <View style={[styles.deliveryToggleWrap, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
          {deliveryOptions.map((opt) => {
            const IconComponent = opt.icon;
            const isSelected = deliveryType === opt.type;
            return (
              <TouchableOpacity
                key={opt.type}
                onPress={() => setDeliveryType(opt.type)}
                style={[
                  styles.deliveryTab,
                  isSelected && {
                    backgroundColor: Palette.blue700,
                    borderColor: Palette.blue700,
                  },
                ]}
                activeOpacity={0.75}
              >
                <IconComponent size={16} color={isSelected ? Palette.slate900 : colors.textSecondary} />
                <Text
                  style={[
                    styles.deliveryTabText,
                    { color: isSelected ? Palette.slate900 : colors.textSecondary, fontWeight: isSelected ? '700' : '500' },
                  ]}
                >
                  {isTamil ? opt.labelTa : opt.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Cart Item Cards */}
        <View style={styles.itemsList}>
          {items.map((item) => {
            const addonsText = item.addons && item.addons.length > 0
              ? item.addons
                  .map((a) => (typeof a === 'object' ? (isTamil ? a.nameTa || a.name : a.name) : a))
                  .join(', ')
              : null;

            return (
              <View
                key={item.id}
                style={[
                  styles.cartItem,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  },
                ]}
              >
                <View style={styles.itemInfo}>
                  <Text style={[styles.itemName, { color: colors.textPrimary }]}>
                    {isTamil ? item.nameTa || item.name : item.name}
                  </Text>
                  {addonsText && (
                    <Text style={[styles.itemAddons, { color: colors.textTertiary }]}>
                      + {addonsText}
                    </Text>
                  )}
                  {item.notes ? (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
                      <FileText size={12} color={colors.textTertiary} />
                      <Text style={[styles.itemNote, { color: colors.textTertiary }]}>
                        "{item.notes}"
                      </Text>
                    </View>
                  ) : null}
                  <Text style={[styles.itemPrice, { color: colors.accent }]}>
                    ₹{(Number(item.price ?? 0) * item.quantity).toFixed(0)}
                  </Text>
                </View>

                <View style={styles.itemActions}>
                  <QuantitySelector
                    quantity={item.quantity}
                    onIncrement={() => updateQuantity(item.id, item.quantity + 1)}
                    onDecrement={() => updateQuantity(item.id, item.quantity - 1)}
                    min={0}
                    size="sm"
                  />
                </View>
              </View>
            );
          })}
        </View>

        {/* Cooking / Delivery Instructions Input */}
        <View style={[styles.instructionsCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.instructionsTitle, { color: colors.textPrimary }]}>
            {isTamil ? 'சமையல் குறிப்பு (விருப்பம்)' : 'Cooking / Delivery Instructions'}
          </Text>
          <TextInput
            value={specialInstructions}
            onChangeText={setSpecialInstructions}
            placeholder={isTamil ? 'எ.கா. காரம் குறைவாக வைக்கவும், வாழை இலை பார்சல்...' : 'e.g. Less spicy, pack extra coconut chutney...'}
            placeholderTextColor={colors.textTertiary}
            style={[styles.instructionsInput, { color: colors.textPrimary, borderColor: colors.border }]}
            multiline
          />
        </View>

        {/* Coupons & Promo Section */}
        <View style={[styles.couponSection, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.couponInputRow}>
            <Tag size={16} color={Palette.blue700} />
            <TextInput
              value={couponInput}
              onChangeText={(txt) => {
                setCouponInput(txt);
                setCouponError(null);
              }}
              placeholder={isTamil ? 'கூப்பன் குறியீட்டை உள்ளிடவும்' : 'Enter promo coupon code'}
              placeholderTextColor={colors.textTertiary}
              autoCapitalize="characters"
              style={[styles.couponTextInput, { color: colors.textPrimary }]}
            />
            <TouchableOpacity onPress={() => handleApplyCoupon()} style={styles.applyBtn} activeOpacity={0.7}>
              <Text style={styles.applyBtnText}>{isTamil ? 'பயன்படுத்து' : 'Apply'}</Text>
            </TouchableOpacity>
          </View>

          {couponError && <Text style={[styles.errorText, { color: colors.error }]}>{couponError}</Text>}

          {/* Quick Coupon Chips */}
          <View style={styles.quickCouponsRow}>
            {['ASHOKRAJ20', 'WELCOME50', 'FEAST100'].map((code) => (
              <TouchableOpacity
                key={code}
                onPress={() => handleApplyCoupon(code)}
                style={[
                  styles.quickCouponChip,
                  {
                    backgroundColor: couponCode === code ? 'rgba(204, 146, 0, 0.2)' : colors.surfaceElevated,
                    borderColor: couponCode === code ? Palette.blue700 : colors.border,
                  },
                ]}
              >
                <Text style={[styles.quickCouponText, { color: couponCode === code ? Palette.blue700 : colors.textSecondary }]}>
                  {code}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Applied Coupon Pill */}
        {couponCode && (
          <View
            style={[
              styles.couponBar,
              {
                backgroundColor: 'rgba(204, 146, 0, 0.12)',
                borderColor: Palette.blue700,
              },
            ]}
          >
            <View style={styles.couponLeft}>
              <Tag size={16} color={Palette.blue700} />
              <Text style={[styles.couponText, { color: Palette.blue700 }]}>
                {couponCode} (₹{discountAmount} {isTamil ? 'சேமிப்பு' : 'Saved'})
              </Text>
            </View>
            <TouchableOpacity onPress={removeCoupon}>
              <Text style={[styles.couponRemove, { color: colors.error }]}>
                {t('common.remove')}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Price Breakdown */}
        <PriceSummary
          subtotal={subtotal}
          taxAmount={taxAmount}
          deliveryFee={deliveryFee}
          discountAmount={discountAmount}
          total={total}
        />
      </ScrollView>

      {/* Checkout Footer */}
      <View
        style={[
          styles.bottomBar,
          {
            backgroundColor: colors.surface,
            borderTopColor: colors.border,
          },
        ]}
      >
        <View>
          <Text style={[styles.totalLabel, { color: colors.textTertiary }]}>
            {t('common.total')}
          </Text>
          <Text style={[styles.totalAmount, { color: Palette.blue700 }]}>
            ₹{total.toFixed(2)}
          </Text>
        </View>

        <PrimaryButton
          title={t('restaurant.checkout')}
          onPress={onProceedToCheckout}
          style={styles.checkoutBtn}
          icon={<ArrowRight size={18} color={Palette.white} />}
          iconPosition="right"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.base,
    paddingBottom: Spacing['5xl'],
  },
  deliveryToggleWrap: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: Radius.full,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  deliveryTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: Radius.full,
  },
  deliveryTabText: {
    fontSize: FontSize.xs + 1,
  },
  itemsList: {
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  cartItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.base,
    borderRadius: Radius.lg,
    borderWidth: 1,
  },
  itemInfo: {
    flex: 1,
    paddingRight: Spacing.md,
  },
  itemName: {
    fontSize: FontSize.sm + 1,
    fontWeight: '700',
    marginBottom: 2,
  },
  itemAddons: {
    fontSize: FontSize.xs,
    marginBottom: 2,
  },
  itemNote: {
    fontSize: FontSize.xs - 1,
    fontStyle: 'italic',
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: FontSize.md,
    fontWeight: '700',
  },
  itemActions: {
    alignItems: 'flex-end',
  },
  instructionsCard: {
    padding: Spacing.base,
    borderRadius: Radius.lg,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  instructionsTitle: {
    fontSize: FontSize.xs + 1,
    fontWeight: '700',
    marginBottom: 8,
  },
  instructionsInput: {
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: 10,
    fontSize: FontSize.xs + 1,
    minHeight: 50,
  },
  couponSection: {
    padding: Spacing.base,
    borderRadius: Radius.lg,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  couponInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  couponTextInput: {
    flex: 1,
    fontSize: FontSize.sm,
    fontWeight: '700',
  },
  applyBtn: {
    backgroundColor: Palette.blue700,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: Radius.full,
  },
  applyBtnText: {
    color: '#FFFFFF',
    fontSize: FontSize.xs + 1,
    fontWeight: '700',
  },
  errorText: {
    fontSize: FontSize.xs,
    marginTop: 4,
  },
  quickCouponsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  quickCouponChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.xs,
    borderWidth: 1,
  },
  quickCouponText: {
    fontSize: FontSize.xs - 1,
    fontWeight: '700',
  },
  couponBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderStyle: 'dashed',
    marginBottom: Spacing.md,
  },
  couponLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  couponText: {
    fontSize: FontSize.xs + 1,
    fontWeight: '700',
  },
  couponRemove: {
    fontSize: FontSize.xs + 1,
    fontWeight: '600',
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.base,
    borderTopWidth: 1,
  },
  totalLabel: {
    fontSize: 11,
    textTransform: 'uppercase',
  },
  totalAmount: {
    fontSize: FontSize.xl,
    fontWeight: '800',
  },
  checkoutBtn: {
    minWidth: 160,
  },
});

