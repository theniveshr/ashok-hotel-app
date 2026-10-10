import { AppText as Text } from '../components/ui/AppText';
﻿import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
  ActivityIndicator
} from 'react-native';
import {
  MapPin,
  Phone,
  Clock,
  ShieldCheck,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Truck,
  Bike,
  RefreshCw,
  XCircle,
} from 'lucide-react-native';
import { useTheme } from '../theme/ThemeContext';
import { useTranslation } from '../i18n';
import { Header } from '../components/ui/Header';
import { GlassCard } from '../components/ui/GlassCard';
import { Radius, Spacing, FontSize, Palette } from '@ashok-raj/ui';
import type { DeliveryTrackingInfo } from '@ashok-raj/types';

export interface DeliveryTrackingScreenProps {
  orderId: string;
  onBack: () => void;
}

export function DeliveryTrackingScreen({ orderId, onBack }: DeliveryTrackingScreenProps) {
  const { colors } = useTheme();
  const { t, isTamil } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [trackingData, setTrackingData] = useState<DeliveryTrackingInfo | null>(null);

  // Mock tracking data fetch
  const fetchTracking = async () => {
    setLoading(true);
    try {
      // Simulate live tracking fetch
      setTimeout(() => {
        const mockInfo: DeliveryTrackingInfo = {
          orderId: orderId || 'ord-del-101',
          orderNumber: 'AR-DEL-8801',
          status: 'OUT_FOR_DELIVERY',
          deliveryStatus: 'EN_ROUTE',
          estimatedDeliveryAt: new Date(Date.now() + 1000 * 60 * 18).toISOString(),
          estimatedDeliveryMinutes: 18,
          elapsedMinutes: 14,
          deliveryFee: 0,
          otp: '482915',
          partner: {
            id: 'driver-101',
            name: 'Murugan Selvam',
            phoneMasked: '98******81',
            phone: '9842199881',
            vehicleType: 'BIKE',
            vehicleNumber: 'TN 63 AB 4589',
            rating: 4.9,
            currentLat: 9.8452,
            currentLng: 78.6541,
          },
          deliveryAddress: {
            label: 'Home',
            line1: 'No 45, Sivan Koil North Car Street',
            line2: 'Near Raja Theatres',
            city: 'Kalaiyarkoil',
            pincode: '630551',
          },
          timeline: [
            {
              step: 'PLACED',
              title: isTamil ? 'ஆர்டர் பெறப்பட்டது' : 'Order Placed',
              titleTa: 'ஆர்டர் பெறப்பட்டது',
              description: isTamil ? 'உணவகம் உங்கள் ஆர்டரை பெற்றது' : 'Order confirmed by restaurant',
              timestamp: '12:45 PM',
              isCompleted: true,
              isCurrent: false,
            },
            {
              step: 'PREPARING',
              title: isTamil ? 'சமையலறையில் தயாராகிறது' : 'Kitchen Cooking',
              titleTa: 'சமையலறையில் தயாராகிறது',
              description: isTamil ? 'செட்டிநாடு பிரியாணி தயாராகிறது' : 'Chef is preparing hot Chettinad dishes',
              timestamp: '12:50 PM',
              isCompleted: true,
              isCurrent: false,
            },
            {
              step: 'READY',
              title: isTamil ? 'உணவு பேக் செய்யப்பட்டது' : 'Packed & Ready',
              titleTa: 'உணவு பேக் செய்யப்பட்டது',
              description: isTamil ? 'டெலிவரிக்கு தயாராக வைக்கப்பட்டுள்ளது' : 'Packed hot in tamper-proof container',
              timestamp: '01:02 PM',
              isCompleted: true,
              isCurrent: false,
            },
            {
              step: 'PICKED_UP',
              title: isTamil ? 'பார்ட்னர் பெற்றுக் கொண்டார்' : 'Picked Up by Partner',
              titleTa: 'பார்ட்னர் பெற்றுக் கொண்டார்',
              description: isTamil ? 'முருகன் செல்வம் ஆர்டரை எடுத்தார்' : 'Murugan Selvam picked up your order',
              timestamp: '01:05 PM',
              isCompleted: true,
              isCurrent: false,
            },
            {
              step: 'EN_ROUTE',
              title: isTamil ? 'உங்கள் முகவரிக்கு வருகிறது' : 'Out for Delivery (On The Way)',
              titleTa: 'உங்கள் முகவரிக்கு வருகிறது',
              description: isTamil ? 'டெலிவரி பார்ட்னர் வழியில் உள்ளார்' : 'Driver is driving towards your location',
              timestamp: '01:08 PM',
              isCompleted: false,
              isCurrent: true,
            },
            {
              step: 'DELIVERED',
              title: isTamil ? 'டெலிவரி செய்யப்படும்' : 'Delivered',
              titleTa: 'டெலிவரி செய்யப்படும்',
              description: isTamil ? 'OTP சரிபார்த்த பின் ஒப்படைக்கப்படும்' : 'Handover verified with 6-digit OTP',
              isCompleted: false,
              isCurrent: false,
            },
          ],
          cancellationAllowed: false,
          cancellationReason: undefined,
        };
        setTrackingData(mockInfo);
        setLoading(false);
      }, 500);
    } catch {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTracking();
  }, [orderId]);

  const handleCallPartner = (phone?: string | null) => {
    if (!phone) {
      Alert.alert(t('delivery.callPartner'), 'Driver phone number is currently masked for privacy.');
      return;
    }
    Linking.openURL(`tel:${phone}`).catch(() => {
      Alert.alert('Error', 'Unable to initiate phone call.');
    });
  };

  const handleCancelOrder = () => {
    if (!trackingData?.cancellationAllowed) {
      Alert.alert(
        t('delivery.cancelOrder'),
        isTamil
          ? 'சமையல் அல்லது டெலிவரி ஏற்கனவே துவங்கிவிட்டதால் ரத்து செய்ய இயலாது. உணவகத்தை தொடர்பு கொள்ளவும்.'
          : 'Order cannot be cancelled as kitchen cooking or delivery has already started. Please contact restaurant directly.'
      );
      return;
    }

    Alert.alert(
      t('delivery.cancelOrder'),
      t('delivery.cancelOrderConfirm'),
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Success', 'Order cancelled successfully.');
            onBack();
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        title={t('delivery.deliveryTracking')}
        subtitle={trackingData?.orderNumber || 'AR-DEL-8801'}
        showBack
        onBackPress={onBack}
        rightElement={
          <TouchableOpacity onPress={fetchTracking} style={styles.refreshBtn}>
            <RefreshCw size={18} color={Palette.blue700} />
          </TouchableOpacity>
        }
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {loading && !trackingData ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={Palette.blue700} />
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
              {isTamil ? 'டெலிவரி நிலவரம் பெறப்படுகிறது...' : 'Loading live tracking...'}
            </Text>
          </View>
        ) : (
          <>
            {/* ── Status & ETA Hero Banner ──────────────────────────────────── */}
            <View style={styles.heroBanner}>
              <View style={styles.heroLeft}>
                <Text style={styles.etaLabel}>
                  {isTamil ? 'தோராயமான நேரம்' : 'ESTIMATED DELIVERY'}
                </Text>
                <Text style={styles.etaTime}>
                  ~{trackingData?.estimatedDeliveryMinutes || 20} {isTamil ? 'நிமிடங்கள்' : 'mins'}
                </Text>
                <Text style={styles.etaSub}>
                  {isTamil ? 'சூடான உணவு உங்கள் வாசலில்!' : 'Arriving hot & fresh at your door'}
                </Text>
              </View>
              <View style={styles.heroBadge}>
                <Bike size={32} color="#000" />
              </View>
            </View>

            {/* ── Secure Delivery OTP Card ──────────────────────────────────── */}
            {trackingData?.otp && (
              <View style={styles.otpCard}>
                <View style={styles.otpHeader}>
                  <ShieldCheck size={20} color={Palette.blue700} />
                  <Text style={styles.otpTitle}>
                    {t('delivery.deliveryOtp')}: <Text style={styles.otpCode}>{trackingData.otp}</Text>
                  </Text>
                </View>
                <Text style={styles.otpInstruction}>
                  {t('delivery.otpForDelivery')}
                </Text>
              </View>
            )}

            {/* ── Delivery Partner Details Card ─────────────────────────────── */}
            {trackingData?.partner && (
              <GlassCard style={styles.partnerCard}>
                <View style={styles.partnerHeader}>
                  <View style={styles.partnerAvatar}>
                    <Text style={styles.avatarText}>
                      {trackingData.partner.name.charAt(0)}
                    </Text>
                  </View>
                  <View style={styles.partnerInfo}>
                    <Text style={[styles.partnerName, { color: colors.textPrimary }]}>
                      {trackingData.partner.name}
                    </Text>
                    <Text style={[styles.partnerVehicle, { color: colors.textSecondary }]}>
                      {trackingData.partner.vehicleNumber} • ⭐ {trackingData.partner.rating}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.callBtn}
                    onPress={() => handleCallPartner(trackingData.partner?.phone)}
                  >
                    <Phone size={16} color="#000" />
                    <Text style={styles.callBtnText}>
                      {isTamil ? 'அழைக்க' : 'Call'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </GlassCard>
            )}

            {/* ── Delivery Step Timeline ────────────────────────────────────── */}
            <GlassCard style={styles.timelineCard}>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                {isTamil ? 'டெலிவரி நிலவரம்' : 'Live Order Journey'}
              </Text>

              <View style={styles.timelineContainer}>
                {trackingData?.timeline.map((item, idx) => {
                  const isLast = idx === (trackingData.timeline.length - 1);
                  return (
                    <View key={idx} style={styles.timelineRow}>
                      <View style={styles.timelineIndicatorCol}>
                        <View
                          style={[
                            styles.dot,
                            item.isCompleted && styles.dotCompleted,
                            item.isCurrent && styles.dotCurrent,
                          ]}
                        >
                          {item.isCompleted ? (
                            <CheckCircle2 size={14} color="#000" />
                          ) : (
                            <View
                              style={[
                                styles.innerDot,
                                item.isCurrent && styles.innerDotCurrent,
                              ]}
                            />
                          )}
                        </View>
                        {!isLast && (
                          <View
                            style={[
                              styles.line,
                              item.isCompleted && styles.lineCompleted,
                            ]}
                          />
                        )}
                      </View>

                      <View style={styles.timelineContentCol}>
                        <View style={styles.timelineTitleRow}>
                          <Text
                            style={[
                              styles.stepTitle,
                              {
                                color: item.isCurrent
                                  ? Palette.blue700
                                  : item.isCompleted
                                  ? colors.textPrimary
                                  : colors.textTertiary,
                                fontWeight: item.isCurrent ? '700' : '600',
                              },
                            ]}
                          >
                            {isTamil ? item.titleTa : item.title}
                          </Text>
                          {item.timestamp && (
                            <Text style={[styles.stepTime, { color: colors.textTertiary }]}>
                              {item.timestamp}
                            </Text>
                          )}
                        </View>
                        {item.description && (
                          <Text style={[styles.stepDesc, { color: colors.textSecondary }]}>
                            {item.description}
                          </Text>
                        )}
                      </View>
                    </View>
                  );
                })}
              </View>
            </GlassCard>

            {/* ── Delivery Destination Address ──────────────────────────────── */}
            {trackingData?.deliveryAddress && (
              <GlassCard style={styles.addressCard}>
                <View style={styles.addressHeader}>
                  <MapPin size={18} color={Palette.blue700} />
                  <Text style={[styles.addressTitle, { color: colors.textPrimary }]}>
                    {t('delivery.deliveryAddress')} ({trackingData.deliveryAddress.label || 'Home'})
                  </Text>
                </View>
                <Text style={[styles.addressText, { color: colors.textSecondary }]}>
                  {trackingData.deliveryAddress.line1}
                  {trackingData.deliveryAddress.line2 ? `, ${trackingData.deliveryAddress.line2}` : ''}
                </Text>
                <Text style={[styles.addressCity, { color: colors.textTertiary }]}>
                  {trackingData.deliveryAddress.city} - {trackingData.deliveryAddress.pincode}
                </Text>
              </GlassCard>
            )}

            {/* ── Cancel Order Button (Conditional) ─────────────────────────── */}
            <TouchableOpacity
              style={[
                styles.cancelBtn,
                !trackingData?.cancellationAllowed && styles.cancelBtnDisabled,
              ]}
              onPress={handleCancelOrder}
            >
              <XCircle
                size={16}
                color={trackingData?.cancellationAllowed ? '#EF4444' : '#64748B'}
              />
              <Text
                style={[
                  styles.cancelBtnText,
                  {
                    color: trackingData?.cancellationAllowed ? '#EF4444' : '#64748B',
                  },
                ]}
              >
                {t('delivery.cancelOrder')}
              </Text>
            </TouchableOpacity>

            {!trackingData?.cancellationAllowed && (
              <Text style={styles.cancellationNote}>
                {isTamil
                  ? '🔒 சமையல் துவங்கிவிட்டதால் ஆர்டரை ரத்து செய்ய இயலாது.'
                  : '🔒 Cooking has started. Cancellation is locked to prevent food waste.'}
              </Text>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: Spacing.md,
    paddingBottom: Spacing.xl * 2,
  },
  refreshBtn: {
    padding: Spacing.xs,
  },
  centerContainer: {
    paddingTop: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: Spacing.sm,
    fontSize: FontSize.sm,
  },
  heroBanner: {
    backgroundColor: '#1E293B',
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: Spacing.md,
  },
  heroLeft: {
    flex: 1,
  },
  etaLabel: {
    fontSize: FontSize.xs,
    fontWeight: '800',
    color: Palette.blue700,
    letterSpacing: 1,
  },
  etaTime: {
    fontSize: FontSize.xxl,
    fontWeight: '900',
    color: '#FFF',
    marginVertical: 2,
  },
  etaSub: {
    fontSize: FontSize.xs,
    color: '#E2E8F0',
    fontWeight: '600',
  },
  heroBadge: {
    height: 56,
    width: 56,
    borderRadius: 28,
    backgroundColor: Palette.blue700,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: Spacing.md,
  },
  otpCard: {
    backgroundColor: '#2A1F05',
    borderWidth: 1.5,
    borderColor: Palette.blue700,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  otpHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  otpTitle: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: '#FDE68A',
    marginLeft: Spacing.xs,
  },
  otpCode: {
    fontSize: FontSize.lg,
    fontWeight: '900',
    color: Palette.blue700,
    letterSpacing: 3,
  },
  otpInstruction: {
    fontSize: FontSize.xs,
    color: '#D4B36A',
    lineHeight: 18,
  },
  partnerCard: {
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  partnerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  partnerAvatar: {
    height: 44,
    width: 44,
    borderRadius: 22,
    backgroundColor: '#0284C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: FontSize.md,
    fontWeight: '900',
    color: '#FFF',
  },
  partnerInfo: {
    flex: 1,
    marginLeft: Spacing.sm,
  },
  partnerName: {
    fontSize: FontSize.sm,
    fontWeight: '700',
  },
  partnerVehicle: {
    fontSize: FontSize.xs,
    marginTop: 2,
  },
  callBtn: {
    backgroundColor: Palette.blue700,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  callBtnText: {
    fontSize: FontSize.xs,
    fontWeight: '800',
    color: '#000',
  },
  timelineCard: {
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: FontSize.sm,
    fontWeight: '800',
    marginBottom: Spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  timelineContainer: {
    paddingLeft: Spacing.xs,
  },
  timelineRow: {
    flexDirection: 'row',
    minHeight: 52,
  },
  timelineIndicatorCol: {
    alignItems: 'center',
    width: 24,
  },
  dot: {
    height: 20,
    width: 20,
    borderRadius: 10,
    backgroundColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotCompleted: {
    backgroundColor: '#10B981',
  },
  dotCurrent: {
    backgroundColor: Palette.blue700,
  },
  innerDot: {
    height: 8,
    width: 8,
    borderRadius: 4,
    backgroundColor: '#475569',
  },
  innerDotCurrent: {
    backgroundColor: '#000',
  },
  line: {
    width: 2,
    flex: 1,
    backgroundColor: '#334155',
    marginVertical: 2,
  },
  lineCompleted: {
    backgroundColor: '#10B981',
  },
  timelineContentCol: {
    flex: 1,
    marginLeft: Spacing.sm,
    paddingBottom: Spacing.md,
  },
  timelineTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stepTitle: {
    fontSize: FontSize.sm,
  },
  stepTime: {
    fontSize: FontSize.xs,
  },
  stepDesc: {
    fontSize: FontSize.xs,
    marginTop: 2,
    lineHeight: 16,
  },
  addressCard: {
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  addressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  addressTitle: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    marginLeft: Spacing.xs,
  },
  addressText: {
    fontSize: FontSize.xs,
    lineHeight: 18,
  },
  addressCity: {
    fontSize: FontSize.xs,
    marginTop: 2,
  },
  cancelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: Radius.md,
    marginTop: Spacing.sm,
  },
  cancelBtnDisabled: {
    borderColor: '#1E293B',
    opacity: 0.6,
  },
  cancelBtnText: {
    fontSize: FontSize.xs,
    fontWeight: '700',
  },
  cancellationNote: {
    textAlign: 'center',
    fontSize: 11,
    color: '#475569',
    marginTop: 6,
  },
});

