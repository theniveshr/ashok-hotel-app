import { AppText as Text } from '../components/ui/AppText';
﻿import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import { MapPin, CreditCard, Banknote, ShieldCheck, Check, Smartphone, Lock, Sparkles } from 'lucide-react-native';
import { useTheme } from '../theme/ThemeContext';
import { useTranslation } from '../i18n';
import { Header } from '../components/ui/Header';
import { PrimaryButton } from '../components/ui/PrimaryButton';
import { PriceSummary } from '../components/ui/PriceSummary';
import { LocationSelectorModal } from '../components/ui/LocationSelectorModal';
import { Radius, Spacing, FontSize, Palette } from '@ashok-raj/ui';
import { useCartStore } from '../store/useCartStore';
import { useOrderStore } from '../store/useOrderStore';
import { useAddressStore } from '../store/useAddressStore';
import type { PaymentMethod } from '@ashok-raj/types';

export interface CheckoutScreenProps {
  onBack: () => void;
  onOrderSuccess: () => void;
}

export function CheckoutScreen({
  onBack,
  onOrderSuccess,
}: CheckoutScreenProps) {
  const { colors } = useTheme();
  const { t, isTamil } = useTranslation();
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>('RAZORPAY');
  const [loading, setLoading] = useState(false);
  const [addressModalVisible, setAddressModalVisible] = useState(false);

  const {
    items,
    deliveryType,
    selectedAddress,
    setSelectedAddress,
    specialInstructions,
    couponCode,
    discountAmount,
    deliveryFee,
    getSubtotal,
    getTaxAmount,
    getTotalAmount,
    clearCart,
  } = useCartStore();

  const { placeOrder } = useOrderStore();

  const subtotal = getSubtotal();
  const taxAmount = getTaxAmount();
  const total = getTotalAmount();

  const handlePlaceOrder = async () => {
    if (deliveryType === 'HOME_DELIVERY' && (!selectedAddress || !selectedAddress.line1)) {
      alert(
        isTamil
          ? 'தயவுசெய்து டெலிவரி முகவரியைத் தேர்ந்தெடுக்கவும் அல்லது புதிய முகவரியை உள்ளிடவும்.'
          : 'Please select or enter a delivery address before placing order.'
      );
      setAddressModalVisible(true);
      return;
    }

    setLoading(true);

    try {
      const payload = {
        type: deliveryType,
        items: items.map((it) => ({
          menuItemId: it.id,
          quantity: it.quantity,
          name: it.name,
          nameTa: it.nameTa,
          price: it.price,
          addons: (it.addons || []).map((ad: any) => ({
            addonId: typeof ad === 'object' ? ad.id : 'addon-default',
            quantity: 1,
          })),
          note: it.notes,
        })),
        deliveryAddressId: selectedAddress?.id,
        deliveryAddress: selectedAddress
          ? {
              line1: selectedAddress.line1,
              line2: selectedAddress.line2,
              city: selectedAddress.city,
              pincode: selectedAddress.pincode,
            }
          : undefined,
        couponCode: couponCode || undefined,
        notes: specialInstructions || undefined,
        paymentMethod: selectedPayment,
      };

      const createdOrder = await placeOrder(payload);
      setLoading(false);

      if (createdOrder) {
        clearCart();
        onOrderSuccess();
      } else {
        alert(isTamil ? 'ஆர்டர் செய்வதில் சிக்கல் ஏற்பட்டது. மீண்டும் முயற்சிக்கவும்.' : 'Unable to place order. Please check your items and try again.');
      }
    } catch {
      setLoading(false);
      alert(isTamil ? 'ஆர்டர் செய்வதில் பிழை ஏற்பட்டது.' : 'An error occurred while placing order.');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        showBack
        onBackPress={onBack}
        title={t('restaurant.checkout')}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Delivery Address Box */}
        {deliveryType === 'HOME_DELIVERY' && (
          <View style={styles.sectionWrap}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              {t('delivery.deliveryAddress')}
            </Text>
            <View
              style={[
                styles.addressCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
              ]}
            >
              <View style={styles.addressTop}>
                <View style={styles.addressLeft}>
                  <View style={[styles.pinCircle, { backgroundColor: 'rgba(37, 99, 235, 0.12)' }]}>
                    <MapPin size={18} color="#2563EB" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Text style={[styles.addressLabel, { color: colors.textPrimary }]}>
                        {selectedAddress?.label || (isTamil ? 'வீட்டு முகவரி' : 'Home Address')}
                      </Text>
                      {selectedAddress?.recipientName && (
                        <Text style={{ fontSize: 12, color: colors.textSecondary, fontWeight: '600' }}>
                          • {selectedAddress.recipientName} {selectedAddress.recipientPhone ? `(${selectedAddress.recipientPhone})` : ''}
                        </Text>
                      )}
                    </View>
                    <Text style={[styles.addressText, { color: colors.textSecondary }]}>
                      {selectedAddress?.line1 || (isTamil ? 'முகவரி தேர்ந்தெடுக்கப்படவில்லை' : 'No address selected')}
                      {selectedAddress?.city ? `, ${selectedAddress.city}` : ''}
                      {selectedAddress?.pincode ? ` - ${selectedAddress.pincode}` : ''}
                    </Text>
                    {specialInstructions ? (
                      <Text style={{ fontSize: 11, color: '#2563EB', marginTop: 3, fontWeight: '500' }}>
                        {isTamil ? 'குறிப்பு:' : 'Note:'} {specialInstructions}
                      </Text>
                    ) : null}
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => setAddressModalVisible(true)}
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 8,
                    backgroundColor: '#EFF6FF',
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={{ color: '#2563EB', fontWeight: '700', fontSize: 13 }}>
                    {isTamil ? 'மாற்ற' : 'Change'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* Order Mode Badge & Free Delivery Threshold Banner */}
        <View style={[styles.modeBanner, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
          <Text style={[styles.modeTitle, { color: Palette.blue700 }]}>
            {deliveryType === 'HOME_DELIVERY'
              ? isTamil ? 'வீட்டு விநியோகம் (25-35 நிமிடங்கள்)' : 'Home Delivery (25-35 mins)'
              : deliveryType === 'TAKEAWAY'
              ? isTamil ? 'சுய பார்சல் (15-20 நிமிடங்கள்)' : 'Self Takeaway (15-20 mins)'
              : isTamil ? 'உணவுக்கூடம்' : 'Dine-in Table Service'}
          </Text>
        </View>

        {deliveryType === 'HOME_DELIVERY' && (
          <View
            style={[
              styles.freeDeliveryBanner,
              {
                backgroundColor: subtotal >= 250 ? '#ECFDF5' : '#EFF6FF',
                borderColor: subtotal >= 250 ? Palette.emerald500 : colors.accent,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              },
            ]}
          >
            {subtotal >= 250 && <Sparkles size={16} color={Palette.emerald500} />}
            <Text
              style={[
                styles.freeDeliveryText,
                { color: subtotal >= 250 ? Palette.emerald500 : colors.accent },
              ]}
            >
              {subtotal >= 250
                ? isTamil
                  ? 'இலவச டெலிவரி கிடைத்துள்ளது!'
                  : 'FREE Delivery Unlocked for your zone!'
                : isTamil
                ? `இலவச டெலிவரி பெற மேலும் ₹${(250 - subtotal).toFixed(0)} சேர்க்கவும்`
                : `Add ₹${(250 - subtotal).toFixed(0)} more for FREE Delivery!`}
            </Text>
          </View>
        )}

        {/* Payment Method Selector */}
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
          {isTamil ? 'பணம் செலுத்தும் முறை' : 'Payment Method'}
        </Text>

        <View style={styles.paymentMethods}>
          {/* Razorpay / UPI */}
          <TouchableOpacity
            onPress={() => setSelectedPayment('RAZORPAY')}
            activeOpacity={0.8}
            style={[
              styles.paymentOption,
              {
                backgroundColor: colors.surface,
                borderColor: selectedPayment === 'RAZORPAY' ? Palette.blue700 : colors.border,
              },
            ]}
          >
            <View style={styles.payOptionLeft}>
              <View style={[styles.payIconWrap, { backgroundColor: 'rgba(204, 146, 0, 0.15)' }]}>
                <Smartphone size={18} color={Palette.blue700} />
              </View>
              <View>
                <Text style={[styles.payTitle, { color: colors.textPrimary }]}>
                  UPI / GPay / PhonePe / Cards
                </Text>
                <Text style={[styles.paySub, { color: colors.textTertiary }]}>
                  {isTamil ? 'ரேஸர்பே மூலம் பாதுகாப்பானது' : 'Instant 256-bit encrypted checkout'}
                </Text>
              </View>
            </View>
            {selectedPayment === 'RAZORPAY' && (
              <View style={[styles.radioActive, { backgroundColor: Palette.blue700 }]}>
                <Check size={12} color={Palette.white} strokeWidth={3} />
              </View>
            )}
          </TouchableOpacity>

          {/* Cash on Delivery / Pay at Counter */}
          <TouchableOpacity
            onPress={() => setSelectedPayment('CASH')}
            activeOpacity={0.8}
            style={[
              styles.paymentOption,
              {
                backgroundColor: colors.surface,
                borderColor: selectedPayment === 'CASH' ? Palette.blue700 : colors.border,
              },
            ]}
          >
            <View style={styles.payOptionLeft}>
              <View style={[styles.payIconWrap, { backgroundColor: 'rgba(34, 197, 94, 0.15)' }]}>
                <Banknote size={18} color={Palette.emerald500} />
              </View>
              <View>
                <Text style={[styles.payTitle, { color: colors.textPrimary }]}>
                  {deliveryType === 'HOME_DELIVERY'
                    ? isTamil ? 'பொருளை பெற்ற பின் பணம் (COD)' : 'Cash on Delivery (COD)'
                    : isTamil ? 'கவுண்டரில் பணம் செலுத்தவும்' : 'Pay at Counter'}
                </Text>
                <Text style={[styles.paySub, { color: colors.textTertiary }]}>
                  {isTamil ? 'ரொக்கம் அல்லது UPI மூலம் செலுத்தலாம்' : 'Pay via cash or QR scanner'}
                </Text>
              </View>
            </View>
            {selectedPayment === 'CASH' && (
              <View style={[styles.radioActive, { backgroundColor: Palette.blue700 }]}>
                <Check size={12} color={Palette.white} strokeWidth={3} />
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Security Assurance */}
        <View style={styles.securityRow}>
          <Lock size={14} color={Palette.emerald500} />
          <Text style={[styles.securityText, { color: colors.textTertiary }]}>
            {isTamil ? 'உணவு தரம் & சுகாதார பாதுகாப்பு உத்தரவாதம்' : '100% Secure Checkout • FSSAI Certified Kitchen'}
          </Text>
        </View>

        {/* Price Breakdown */}
        <PriceSummary
          subtotal={subtotal}
          taxAmount={taxAmount}
          deliveryFee={deliveryFee}
          discountAmount={discountAmount}
          total={total}
        />
      </ScrollView>

      {/* Place Order CTA Button */}
      <View
        style={[
          styles.bottomBar,
          {
            backgroundColor: colors.surface,
            borderTopColor: colors.border,
          },
        ]}
      >
        <PrimaryButton
          title={`${t('restaurant.placeOrder')} • ₹${total.toFixed(2)}`}
          onPress={handlePlaceOrder}
          loading={loading}
          disabled={loading || items.length === 0}
          fullWidth
        />
      </View>

      <LocationSelectorModal
        visible={addressModalVisible}
        onClose={() => setAddressModalVisible(false)}
      />
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
  sectionWrap: {
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: FontSize.md,
    fontWeight: '700',
    marginBottom: Spacing.sm,
    marginTop: Spacing.xs,
  },
  addressCard: {
    padding: Spacing.base,
    borderRadius: Radius.lg,
    borderWidth: 1,
  },
  addressTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  addressLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flex: 1,
  },
  pinCircle: {
    width: 38,
    height: 38,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addressLabel: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    marginBottom: 2,
  },
  addressText: {
    fontSize: FontSize.xs,
    lineHeight: 16,
  },
  modeBanner: {
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    marginBottom: Spacing.xs,
  },
  modeTitle: {
    fontSize: FontSize.xs + 1,
    fontWeight: '700',
    textAlign: 'center',
  },
  freeDeliveryBanner: {
    padding: Spacing.sm + 2,
    borderRadius: Radius.md,
    borderWidth: 1,
    marginBottom: Spacing.md,
    alignItems: 'center',
  },
  freeDeliveryText: {
    fontSize: FontSize.xs,
    fontWeight: '800',
    textAlign: 'center',
  },
  paymentMethods: {
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  paymentOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.base,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
  },
  payOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flex: 1,
  },
  payIconWrap: {
    width: 36,
    height: 36,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  payTitle: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    marginBottom: 2,
  },
  paySub: {
    fontSize: FontSize.xs - 1,
  },
  radioActive: {
    width: 20,
    height: 20,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  securityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginBottom: Spacing.lg,
  },
  securityText: {
    fontSize: FontSize.xs - 1,
  },
  bottomBar: {
    padding: Spacing.base,
    borderTopWidth: 1,
  },
});

