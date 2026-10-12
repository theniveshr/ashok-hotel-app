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
  Star,
  Lock,
} from 'lucide-react-native';
import { useTheme } from '../theme/ThemeContext';
import { useTranslation } from '../i18n';
import { Header } from '../components/ui/Header';
import { GlassCard } from '../components/ui/GlassCard';
import { EmptyState } from '../components/ui/EmptyState';
import { Radius, Spacing, FontSize, Palette } from '@ashok-raj/ui';
import type { DeliveryTrackingInfo } from '@ashok-raj/types';
import { useOrderStore } from '../store/useOrderStore';

export interface DeliveryTrackingScreenProps {
  orderId: string;
  onBack: () => void;
}

export function DeliveryTrackingScreen({ orderId, onBack }: DeliveryTrackingScreenProps) {
  const { colors } = useTheme();
  const { t, isTamil } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [trackingData, setTrackingData] = useState<DeliveryTrackingInfo | null>(null);

  // Live tracking data fetch with real backend order integration
  const fetchTracking = async () => {
    setLoading(true);
    try {
      const realOrder = await useOrderStore.getState().fetchOrderById(orderId);
      if (realOrder) {
        const isCancelled = realOrder.status === 'CANCELLED';
        const isDelivered = realOrder.status === 'DELIVERED';
        const cancellationAllowed = realOrder.status === 'PLACED';

        const statusOrder = ['PLACED', 'ACCEPTED', 'PREPARING', 'READY_FOR_PICKUP', 'OUT_FOR_DELIVERY', 'DELIVERED'];
        const currentIdx = isCancelled ? -1 : statusOrder.indexOf(realOrder.status);

        const mappedTimeline = [
          {
            step: 'PLACED',
            title: isTamil ? 'ஆர்டர் பெறப்பட்டது' : 'Order Placed',
            titleTa: 'ஆர்டர் பெறப்பட்டது',
            description: isTamil ? 'உணவகம் உங்கள் ஆர்டரை பெற்றது' : 'Order confirmed by restaurant',
            timestamp: new Date(realOrder.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isCompleted: currentIdx >= 0,
            isCurrent: currentIdx === 0,
          },
          {
            step: 'PREPARING',
            title: isTamil ? 'சமையலறையில் தயாராகிறது' : 'Kitchen Cooking',
            titleTa: 'சமையலறையில் தயாராகிறது',
            description: isTamil ? 'செட்டிநாடு சுவையான உணவுகள் தயாராகிறது' : 'Chef is preparing hot Chettinad dishes',
            timestamp: currentIdx >= 2 ? 'In progress' : undefined,
            isCompleted: currentIdx >= 2,
            isCurrent: currentIdx === 1 || currentIdx === 2,
          },
          {
            step: 'READY',
            title: isTamil ? 'உணவு பேக் செய்யப்பட்டது' : 'Packed & Ready',
            titleTa: 'உணவு பேக் செய்யப்பட்டது',
            description: isTamil ? 'டெலிவரிக்கு தயாராக வைக்கப்பட்டுள்ளது' : 'Packed hot in tamper-proof container',
            timestamp: currentIdx >= 3 ? 'Ready' : undefined,
            isCompleted: currentIdx >= 3,
            isCurrent: currentIdx === 3,
          },
          {
            step: 'EN_ROUTE',
            title: isTamil ? 'உங்கள் முகவரிக்கு வருகிறது' : 'Out for Delivery (On The Way)',
            titleTa: 'உங்கள் முகவரிக்கு வருகிறது',
            description: isTamil ? 'டெலிவரி பார்ட்னர் வழியில் உள்ளார்' : 'Driver is driving towards your location',
            timestamp: currentIdx >= 4 ? 'En Route' : undefined,
            isCompleted: currentIdx >= 4,
            isCurrent: currentIdx === 4,
          },
          {
            step: 'DELIVERED',
            title: isTamil ? 'டெலிவரி செய்யப்படும்' : 'Delivered',
            titleTa: 'டெலிவரி செய்யப்படும்',
            description: isTamil ? 'OTP சரிபார்த்த பின் ஒப்படைக்கப்படும்' : 'Handover verified with 6-digit OTP',
            isCompleted: isDelivered,
            isCurrent: isDelivered,
          },
        ];

        const info: DeliveryTrackingInfo = {
          orderId: realOrder.id,
          orderNumber: realOrder.orderNumber,
          status: realOrder.status as any,
          deliveryStatus: realOrder.status === 'OUT_FOR_DELIVERY' ? 'EN_ROUTE' : isDelivered ? 'DELIVERED' : 'ASSIGNED',
          estimatedDeliveryAt: (realOrder as any).estimatedDeliveryAt || null,
          estimatedDeliveryMinutes: realOrder.estimatedDeliveryMinutes || 25,
          elapsedMinutes: Math.max(0, Math.floor((Date.now() - new Date(realOrder.createdAt).getTime()) / 60000)),
          deliveryFee: realOrder.deliveryFee || 0,
          otp: (realOrder as any).otp || null,
          partner: (realOrder as any).partner || null,
          deliveryAddress: (realOrder as any).deliveryAddress || null,
          timeline: mappedTimeline,
          cancellationAllowed,
          cancellationReason: (realOrder as any).cancellationReason,
        };

        setTrackingData(info);
        setLoading(false);
        return;
      }
    } catch {
      // Fallback
    }

    setTrackingData(null);
    setLoading(false);
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
        { text: isTamil ? 'இல்லை' : 'No', style: 'cancel' },
        {
          text: isTamil ? 'ஆம், ரத்து செய்' : 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            const ok = await useOrderStore.getState().cancelOrder(orderId, 'Cancelled by customer');
            if (ok) {
              Alert.alert(
                isTamil ? 'வெற்றி' : 'Success',
                isTamil ? 'ஆர்டர் ரத்து செய்யப்பட்டது.' : 'Order cancelled successfully.'
              );
              fetchTracking();
            }
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        title={t('delivery.deliveryTracking')}
        subtitle={trackingData?.orderNumber || (orderId ? `#${orderId.slice(-6)}` : '')}
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
        ) : !trackingData ? (
          <EmptyState
            title={isTamil ? 'நேரலை டெலிவரி எதுவும் இல்லை' : 'No Active Delivery Found'}
            description={
              isTamil
                ? 'இந்த ஆர்டருக்கான நேரலை டெலிவரி விவரங்கள் கிடைக்கவில்லை அல்லது இன்னும் ஒதுக்கப்படவில்லை.'
                : 'No live tracking details found for this order. It may still be pending assignment.'
            }
            icon={<Truck size={36} color={Palette.blue700} />}
            actionTitle={isTamil ? 'திரும்பச் செல்க' : 'Go Back'}
            onActionPress={onBack}
          />
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
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
                      <Text style={[styles.partnerVehicle, { color: colors.textSecondary }]}>
                        {trackingData.partner.vehicleNumber} •
                      </Text>
                      <Star size={12} color="#F59E0B" fill="#F59E0B" />
                      <Text style={[styles.partnerVehicle, { color: colors.textSecondary }]}>
                        {trackingData.partner.rating}
                      </Text>
                    </View>
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
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 8 }}>
                <Lock size={13} color={colors.textTertiary} />
                <Text style={styles.cancellationNote}>
                  {isTamil
                    ? 'சமையல் துவங்கிவிட்டதால் ஆர்டரை ரத்து செய்ய இயலாது.'
                    : 'Cooking has started. Cancellation is locked to prevent food waste.'}
                </Text>
              </View>
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

