import { AppText as Text } from '../components/ui/AppText';
﻿import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import {
  QrCode,
  Utensils,
  CheckCircle,
  Bell,
  Droplets,
  HelpCircle,
  Receipt,
  Plus,
  CreditCard,
  Banknote,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react-native';
import { useTheme } from '../theme/ThemeContext';
import { useTranslation } from '../i18n';
import { Header } from '../components/ui/Header';
import { PrimaryButton } from '../components/ui/PrimaryButton';
import { GlassCard } from '../components/ui/GlassCard';
import { StatusBadge } from '../components/ui/StatusBadge';
import { PriceSummary } from '../components/ui/PriceSummary';
import { Radius, Spacing, FontSize, Palette } from '@ashok-raj/ui';
import { useDineInStore } from '../store/useDineInStore';
import type { ServiceRequestType } from '@ashok-raj/types';

export interface DineInScreenProps {
  onBack: () => void;
  onExploreMenuForTable: (tableNum: string) => void;
}

export function DineInScreen({
  onBack,
  onExploreMenuForTable,
}: DineInScreenProps) {
  const { colors } = useTheme();
  const { t, isTamil } = useTranslation();

  const {
    table,
    session,
    isLoading,
    lastServiceRequest,
    isPaid,
    receiptData,
    scanTableQr,
    sendServiceRequest,
    requestBill,
    payBill,
    clearSession,
  } = useDineInStore();

  const [activeRequestFeedback, setActiveRequestFeedback] = useState<string | null>(null);
  const [selectedPayMethod, setSelectedPayMethod] = useState<'UPI' | 'CASH'>('UPI');
  const [isPaying, setIsPaying] = useState(false);

  const handleScan = async (qrToken: string) => {
    await scanTableQr(qrToken, 2);
  };

  const handleServiceClick = async (type: ServiceRequestType, label: string) => {
    if (type === 'BILL') {
      await requestBill();
    } else {
      await sendServiceRequest(type);
    }
    setActiveRequestFeedback(label);
    setTimeout(() => setActiveRequestFeedback(null), 3000);
  };

  const handlePayment = async () => {
    setIsPaying(true);
    await payBill(selectedPayMethod);
    setIsPaying(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        showBack
        onBackPress={onBack}
        title={isTamil ? 'உணவுக்கூட QR மேசை' : 'Dine-In Table Service'}
        subtitle={table ? `${isTamil ? 'மேசை' : 'Table'} ${table.tableNumber}` : undefined}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {!session ? (
          <View>
            {/* Scanner Viewport Mockup */}
            <View style={[styles.scannerFrame, { backgroundColor: Palette.slate900, borderColor: Palette.blue700 }]}>
              <View style={styles.scannerOverlay}>
                <View style={[styles.scanReticle, { borderColor: Palette.blue700 }]}>
                  <QrCode size={88} color={Palette.blue700} style={{ opacity: 0.9 }} />
                </View>
                <Text style={styles.scanHint}>
                  {isTamil
                    ? 'உங்கள் மேசையில் உள்ள QR குறியீட்டை ஸ்கேன் செய்யவும்'
                    : 'Point your camera at the QR code on your dining table'}
                </Text>
              </View>
            </View>

            {/* Quick Demo Table Picker */}
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              {isTamil ? 'மேசையை தேர்வு செய்யவும் (டெமோ)' : 'Select Your Table (Demo Simulation)'}
            </Text>

            <View style={styles.tablesGrid}>
              {[
                { token: 'qr_kal_tbl_04', num: '04', label: 'Table 04 (A/C Hall)' },
                { token: 'qr_kal_tbl_08', num: '08', label: 'Table 08 (Main Hall)' },
                { token: 'qr_kal_tbl_12', num: '12', label: 'Table 12 (Family Suite)' },
              ].map((tbl) => (
                <TouchableOpacity
                  key={tbl.token}
                  onPress={() => handleScan(tbl.token)}
                  style={[
                    styles.tableButton,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                    },
                  ]}
                  activeOpacity={0.8}
                >
                  <Utensils size={18} color={Palette.blue700} />
                  <Text style={[styles.tableBtnText, { color: colors.textPrimary }]}>
                    {tbl.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ) : isPaid && receiptData ? (
          /* Receipt / Paid Confirmation */
          <GlassCard style={styles.receiptCard}>
            <CheckCircle size={48} color={Palette.emerald500} style={{ alignSelf: 'center', marginBottom: Spacing.md }} />
            <Text style={[styles.receiptTitle, { color: colors.textPrimary }]}>
              {isTamil ? 'பில் வெற்றிகரமாக செலுத்தப்பட்டது!' : 'Bill Settled Successfully!'}
            </Text>
            <Text style={[styles.receiptSubtitle, { color: colors.textSecondary }]}>
              {isTamil ? 'அசோக் ராஜ் உணவகத்திற்கு வருகை தந்தமைக்கு நன்றி' : 'Thank you for dining at Ashok Raj Lodge & Restaurant'}
            </Text>

            <View style={[styles.receiptBox, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
              <View style={styles.receiptRow}>
                <Text style={{ color: colors.textTertiary }}>Receipt #</Text>
                <Text style={{ color: colors.textPrimary, fontWeight: '700' }}>{receiptData.receiptNumber}</Text>
              </View>
              <View style={styles.receiptRow}>
                <Text style={{ color: colors.textTertiary }}>{isTamil ? 'மேசை எண்' : 'Table'}</Text>
                <Text style={{ color: colors.textPrimary, fontWeight: '700' }}>Table {receiptData.tableNumber}</Text>
              </View>
              <View style={styles.receiptRow}>
                <Text style={{ color: colors.textTertiary }}>{isTamil ? 'செலுத்தப்பட்ட தொகை' : 'Total Paid'}</Text>
                <Text style={{ color: Palette.blue700, fontWeight: '800', fontSize: FontSize.lg }}>
                  ₹{Number(receiptData.totalPaid).toFixed(2)}
                </Text>
              </View>
              <View style={styles.receiptRow}>
                <Text style={{ color: colors.textTertiary }}>Payment Method</Text>
                <Text style={{ color: Palette.emerald500, fontWeight: '700' }}>{receiptData.paymentMethod}</Text>
              </View>
            </View>

            <PrimaryButton
              title={isTamil ? 'புதிய மேசை / வெளியேறு' : 'Done / New Table'}
              onPress={clearSession}
              style={{ marginTop: Spacing.lg }}
            />
          </GlassCard>
        ) : (
          /* Active Dine-In Session View */
          <View>
            {/* Active Table Badge */}
            <GlassCard style={styles.tableInfoCard}>
              <View style={styles.tableHeaderRow}>
                <View>
                  <Text style={[styles.tableName, { color: colors.textPrimary }]}>
                    Table {session.tableNumber} {session.isAc ? '• A/C' : '• Main Hall'}
                  </Text>
                  <Text style={[styles.tableBranch, { color: colors.textTertiary }]}>
                    Ashok Raj Kalaiyarkoil • Floor {session.floor}
                  </Text>
                </View>
                <StatusBadge
                  label={session.status === 'BILL_REQUESTED' ? (isTamil ? 'பில் கோரப்பட்டது' : 'Bill Requested') : (isTamil ? 'உணவுக்கூடம்' : 'Dine-In')}
                  variant={session.status === 'BILL_REQUESTED' ? 'warning' : 'success'}
                />
              </View>
            </GlassCard>

            {/* Quick Service Action Buttons */}
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              {isTamil ? 'மேசை உடனடி சேவைகள்' : 'Instant Table Services'}
            </Text>

            <View style={styles.serviceButtonsRow}>
              {[
                { type: 'CALL_WAITER' as const, label: isTamil ? 'அழைப்பாளர்' : 'Call Waiter', icon: Bell, color: Palette.blue700 },
                { type: 'WATER' as const, label: isTamil ? 'குடிநீர்' : 'Water', icon: Droplets, color: Palette.blue500 },
                { type: 'CUTLERY' as const, label: isTamil ? 'ஸ்பூன் / தட்டு' : 'Cutlery', icon: HelpCircle, color: Palette.emerald500 },
                { type: 'BILL' as const, label: isTamil ? 'பில் கேட்க' : 'Request Bill', icon: Receipt, color: Palette.amber500 },
              ].map((act) => {
                const IconComponent = act.icon;
                return (
                  <TouchableOpacity
                    key={act.type}
                    onPress={() => handleServiceClick(act.type, act.label)}
                    style={[styles.serviceBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
                    activeOpacity={0.75}
                  >
                    <View style={[styles.serviceIconWrap, { backgroundColor: 'rgba(204, 146, 0, 0.12)' }]}>
                      <IconComponent size={20} color={act.color} />
                    </View>
                    <Text style={[styles.serviceBtnLabel, { color: colors.textPrimary }]}>
                      {act.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {activeRequestFeedback && (
              <View style={[styles.feedbackBanner, { backgroundColor: 'rgba(34, 197, 94, 0.15)', borderColor: Palette.emerald500 }]}>
                <CheckCircle size={16} color={Palette.emerald500} />
                <Text style={[styles.feedbackText, { color: Palette.emerald500 }]}>
                  {activeRequestFeedback} â€” {isTamil ? 'பணியாளருக்கு அறிவிக்கப்பட்டுள்ளது!' : 'Waiter notified immediately!'}
                </Text>
              </View>
            )}

            {/* Live Kitchen & Serving Status */}
            <View style={styles.ordersSectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary, marginBottom: 0 }]}>
                {isTamil ? 'மேசை உணவுகள் & சமையல் நிலை' : 'Table Orders & Kitchen Status'}
              </Text>
              <TouchableOpacity
                onPress={() => onExploreMenuForTable(session.tableNumber)}
                style={styles.addMoreBtn}
              >
                <Plus size={14} color={Palette.white} />
                <Text style={styles.addMoreText}>{isTamil ? 'உணவு சேர்க்க' : 'Add Items'}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.ordersList}>
              {session.orders.map((ord) => (
                <View
                  key={ord.id}
                  style={[styles.orderCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                >
                  <View style={styles.orderCardHeader}>
                    <Text style={[styles.orderNumberText, { color: colors.textTertiary }]}>
                      #{ord.orderNumber}
                    </Text>
                    <StatusBadge
                      label={isTamil ? 'சமையலில் உள்ளது' : 'Cooking in Kitchen'}
                      variant="warning"
                    />
                  </View>

                  {ord.items.map((it: any) => (
                    <View key={it.id} style={styles.dishRow}>
                      <Text style={[styles.dishQty, { color: Palette.blue700 }]}>{it.quantity}x</Text>
                      <Text style={[styles.dishName, { color: colors.textPrimary }]}>
                        {isTamil ? it.nameTa || it.name : it.name}
                      </Text>
                      <Text style={[styles.dishPrice, { color: colors.textSecondary }]}>
                        ₹{Number(it.subtotal || it.price * it.quantity).toFixed(0)}
                      </Text>
                    </View>
                  ))}
                </View>
              ))}
            </View>

            {/* Consolidated Table Bill Summary */}
            <PriceSummary
              subtotal={session.subtotal}
              taxAmount={session.taxAmount}
              deliveryFee={0}
              discountAmount={0}
              total={session.total}
              style={{ marginTop: Spacing.md }}
            />

            {/* Payment Method Selector */}
            <View style={[styles.paySection, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.paySectionTitle, { color: colors.textPrimary }]}>
                {isTamil ? 'மேசையிலேயே பணம் செலுத்தவும்' : 'Pay Directly at Table'}
              </Text>

              <View style={styles.payMethodsRow}>
                <TouchableOpacity
                  onPress={() => setSelectedPayMethod('UPI')}
                  style={[
                    styles.payTab,
                    selectedPayMethod === 'UPI' && { borderColor: Palette.blue700, backgroundColor: 'rgba(204, 146, 0, 0.15)' },
                  ]}
                >
                  <CreditCard size={18} color={selectedPayMethod === 'UPI' ? Palette.blue700 : colors.textSecondary} />
                  <Text style={[styles.payTabText, { color: selectedPayMethod === 'UPI' ? Palette.blue700 : colors.textSecondary }]}>
                    UPI / GPay
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setSelectedPayMethod('CASH')}
                  style={[
                    styles.payTab,
                    selectedPayMethod === 'CASH' && { borderColor: Palette.blue700, backgroundColor: 'rgba(204, 146, 0, 0.15)' },
                  ]}
                >
                  <Banknote size={18} color={selectedPayMethod === 'CASH' ? Palette.blue700 : colors.textSecondary} />
                  <Text style={[styles.payTabText, { color: selectedPayMethod === 'CASH' ? Palette.blue700 : colors.textSecondary }]}>
                    Cash at Table
                  </Text>
                </TouchableOpacity>
              </View>

              <PrimaryButton
                title={`${isTamil ? 'பில் செலுத்தவும்' : 'Settle Bill & Pay'} • ₹${session.total.toFixed(2)}`}
                onPress={handlePayment}
                loading={isPaying}
                style={{ marginTop: Spacing.md }}
              />
            </View>
          </View>
        )}
      </ScrollView>
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
  scannerFrame: {
    borderRadius: Radius.xl,
    borderWidth: 2,
    padding: Spacing.xl,
    marginBottom: Spacing.lg,
    overflow: 'hidden',
  },
  scannerOverlay: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
  },
  scanReticle: {
    width: 140,
    height: 140,
    borderWidth: 2,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderStyle: 'dashed',
  },
  scanHint: {
    color: '#fff',
    fontSize: FontSize.xs + 1,
    textAlign: 'center',
    lineHeight: 18,
  },
  sectionTitle: {
    fontSize: FontSize.md,
    fontWeight: '700',
    marginBottom: Spacing.sm,
    marginTop: Spacing.xs,
  },
  tablesGrid: {
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  tableButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.base,
    borderRadius: Radius.lg,
    borderWidth: 1,
  },
  tableBtnText: {
    fontSize: FontSize.sm + 1,
    fontWeight: '600',
  },
  tableInfoCard: {
    padding: Spacing.base,
    marginBottom: Spacing.md,
  },
  tableHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tableName: {
    fontSize: FontSize.lg,
    fontWeight: '800',
  },
  tableBranch: {
    fontSize: FontSize.xs,
    marginTop: 2,
  },
  serviceButtonsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  serviceBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.sm + 2,
    borderRadius: Radius.lg,
    borderWidth: 1,
  },
  serviceIconWrap: {
    width: 36,
    height: 36,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  serviceBtnLabel: {
    fontSize: 10,
    fontWeight: '700',
    textAlign: 'center',
  },
  feedbackBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: Spacing.sm + 2,
    borderRadius: Radius.md,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  feedbackText: {
    fontSize: FontSize.xs,
    fontWeight: '700',
  },
  ordersSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  addMoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Palette.blue700,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  addMoreText: {
    color: '#FFFFFF',
    fontSize: FontSize.xs,
    fontWeight: '700',
  },
  ordersList: {
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  orderCard: {
    padding: Spacing.base,
    borderRadius: Radius.lg,
    borderWidth: 1,
  },
  orderCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
    paddingBottom: 6,
  },
  orderNumberText: {
    fontSize: FontSize.xs,
    fontWeight: '600',
  },
  dishRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 3,
  },
  dishQty: {
    fontWeight: '700',
    width: 24,
    fontSize: FontSize.xs + 1,
  },
  dishName: {
    flex: 1,
    fontSize: FontSize.xs + 1,
  },
  dishPrice: {
    fontWeight: '600',
    fontSize: FontSize.xs + 1,
  },
  paySection: {
    padding: Spacing.base,
    borderRadius: Radius.lg,
    borderWidth: 1,
    marginTop: Spacing.md,
  },
  paySectionTitle: {
    fontSize: FontSize.sm + 1,
    fontWeight: '700',
    marginBottom: Spacing.sm,
  },
  payMethodsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  payTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: Spacing.sm + 2,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  payTabText: {
    fontSize: FontSize.xs + 1,
    fontWeight: '700',
  },
  receiptCard: {
    padding: Spacing.xl,
    alignItems: 'center',
  },
  receiptTitle: {
    fontSize: FontSize.lg,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 4,
  },
  receiptSubtitle: {
    fontSize: FontSize.xs + 1,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  receiptBox: {
    width: '100%',
    padding: Spacing.base,
    borderRadius: Radius.lg,
    borderWidth: 1,
    gap: Spacing.sm,
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});

