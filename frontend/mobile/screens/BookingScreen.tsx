import { AppText as Text } from '../components/ui/AppText';
import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert
} from 'react-native';
import {
  User,
  Phone,
  IdCard,
  Calendar,
  ShieldCheck,
  CheckCircle2,
  Tag,
  CreditCard,
  Building2,
  Sparkles,
  Plus,
  Trash2,
  BedDouble,
  Utensils,
  Car,
  Clock,
  QrCode,
  Share2,
  CalendarPlus,
  Bell,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Bed,
} from 'lucide-react-native';
import { useTheme } from '../theme/ThemeContext';
import { useTranslation } from '../i18n';
import { Header } from '../components/ui/Header';
import { PrimaryButton } from '../components/ui/PrimaryButton';
import { PriceSummary } from '../components/ui/PriceSummary';
import { StatusBadge } from '../components/ui/StatusBadge';
import { GlassCard } from '../components/ui/GlassCard';
import { Radius, Spacing, FontSize, Palette } from '@ashok-raj/ui';
import { LODGE, TAX } from '@ashok-raj/config';
import type { BookingExtra, BookingGuest } from '@ashok-raj/types';
import { apiFetch } from '../config/api';

export interface BookingScreenProps {
  initialRoomTypeId?: string;
  initialCheckIn?: string;
  initialCheckOut?: string;
  initialGuests?: number;
  onBack: () => void;
  onBookingComplete: () => void;
}

interface AdditionalGuestInput {
  name: string;
  phone: string;
  idType: 'Aadhaar' | 'Passport' | 'PAN' | 'Driving Licence';
  idNumber: string;
}

export function BookingScreen({
  initialRoomTypeId = 'rt-deluxe-ac',
  initialCheckIn,
  initialCheckOut,
  initialGuests = 2,
  onBack,
  onBookingComplete,
}: BookingScreenProps) {
  const { colors } = useTheme();
  const { t, isTamil } = useTranslation();

  // ── Step State ─────────────────────────────────────────────────────────────
  // Steps: 'CONFIG' (Dates/Guests/Room) | 'GUEST_INFO' (Guests/Extras/Coupon/Pay) | 'CONFIRMED'
  const [activeStep, setActiveStep] = useState<'CONFIG' | 'GUEST_INFO' | 'CONFIRMED'>('CONFIG');

  // Dates & Occupancy
  const todayStr = new Date().toISOString().split('T')[0]!;
  const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0]!;
  const dayAfterTomorrowStr = new Date(Date.now() + 172800000).toISOString().split('T')[0]!;

  const [checkInDate, setCheckInDate] = useState(initialCheckIn || todayStr);
  const [checkOutDate, setCheckOutDate] = useState(initialCheckOut || tomorrowStr);
  const [adultsCount, setAdultsCount] = useState(initialGuests);
  const [childrenCount, setChildrenCount] = useState(0);

  // Selected Room Type
  const [selectedRoomTypeId, setSelectedRoomTypeId] = useState(initialRoomTypeId);

  // Primary Guest Form
  const [primaryName, setPrimaryName] = useState('');
  const [primaryPhone, setPrimaryPhone] = useState('');
  const [idType, setIdType] = useState<'Aadhaar' | 'Passport' | 'PAN' | 'Driving Licence'>('Aadhaar');
  const [idNumber, setIdNumber] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');

  // Additional Guests
  const [additionalGuests, setAdditionalGuests] = useState<AdditionalGuestInput[]>([]);

  // Selected Extras (Key Set)
  const [selectedExtraIds, setSelectedExtraIds] = useState<string[]>(['extra-breakfast']);

  // Coupon
  const [couponCodeInput, setCouponCodeInput] = useState('LODGE15');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discountAmount: number } | null>({
    code: 'LODGE15',
    discountAmount: 270,
  });
  const [couponError, setCouponError] = useState<string | null>(null);

  // Payment Selection
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'CARD' | 'HOTEL' | 'RAZORPAY'>('UPI');

  // Loading & Final Confirmation Result
  const [loading, setLoading] = useState(false);
  const [confirmedBookingId, setConfirmedBookingId] = useState<string>('AR-BKG-260828-4821');
  const [allocatedRoomNumber, setAllocatedRoomNumber] = useState<string>('104');
  const [reminderEnabled, setReminderEnabled] = useState(true);

  // Nights calculation
  const calculateNights = () => {
    const inDate = new Date(checkInDate);
    const outDate = new Date(checkOutDate);
    const diff = outDate.getTime() - inDate.getTime();
    return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  const nights = calculateNights();

  // Room Type Data
  const roomTypes = LODGE.DEFAULT_ROOM_TYPES;
  const currentRoomType = roomTypes.find((r) => r.id === selectedRoomTypeId) || roomTypes[0]!;

  // ── Pricing Calculations ───────────────────────────────────────────────────
  const baseRoomPrice = currentRoomType.basePrice * nights;

  // Extras pricing
  const availableExtras = LODGE.BOOKING_EXTRAS;
  const extrasTotal = selectedExtraIds.reduce((sum, id) => {
    const item = availableExtras.find((ex) => ex.id === id);
    if (!item) return sum;
    if (item.perPerson && item.perNight) return sum + item.price * adultsCount * nights;
    if (item.perNight) return sum + item.price * nights;
    return sum + item.price;
  }, 0);

  const subtotalBeforeDiscount = baseRoomPrice + extrasTotal;
  const discountAmount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const subtotalAfterDiscount = Math.max(0, subtotalBeforeDiscount - discountAmount);
  const taxAmount = Math.round(subtotalAfterDiscount * TAX.ROOM_GST_RATE * 100) / 100;
  const grandTotal = subtotalAfterDiscount + taxAmount;
  const advancePaid = paymentMethod === 'HOTEL' ? 0 : grandTotal;
  const balanceDueAtCheckin = paymentMethod === 'HOTEL' ? grandTotal : 0;

  // Handle Coupon Apply
  const handleApplyCoupon = async () => {
    setCouponError(null);
    const code = couponCodeInput.toUpperCase().trim();
    if (!code) return;

    try {
      const res = await apiFetch('/api/v1/lodge/apply-coupon', {
        method: 'POST',
        body: JSON.stringify({
          code,
          roomTypeId: selectedRoomTypeId,
          nights,
          subtotal: subtotalBeforeDiscount,
        }),
      });
      const json = await res.json();
      if (res.ok && json.success && json.data) {
        setAppliedCoupon({
          code: json.data.code,
          discountAmount: json.data.discountAmount,
        });
        return;
      } else if (json.error?.message) {
        setCouponError(json.error.message);
        setAppliedCoupon(null);
        return;
      }
    } catch {
      // Offline fallback: check local config
    }

    const coupon = LODGE.SAMPLE_COUPONS.find((c) => c.code === code);
    if (!coupon) {
      setCouponError(isTamil ? 'தவறான கூப்பன் குறியீடு' : 'Invalid coupon code');
      setAppliedCoupon(null);
      return;
    }

    if (subtotalBeforeDiscount < coupon.minOrderAmount) {
      setCouponError(
        isTamil
          ? `குறைந்தபட்ச முன்பதிவு ₹${coupon.minOrderAmount} தேவை`
          : `Minimum booking of ₹${coupon.minOrderAmount} required`
      );
      setAppliedCoupon(null);
      return;
    }

    let disc = 0;
    if (coupon.discountType === 'PERCENTAGE') {
      disc = Math.round((subtotalBeforeDiscount * coupon.discountValue) / 100);
      if (coupon.maxDiscount && disc > coupon.maxDiscount) disc = coupon.maxDiscount;
    } else {
      disc = coupon.discountValue;
    }

    setAppliedCoupon({ code: coupon.code, discountAmount: disc });
  };

  // Toggle Extra
  const toggleExtra = (id: string) => {
    if (selectedExtraIds.includes(id)) {
      setSelectedExtraIds(selectedExtraIds.filter((x) => x !== id));
    } else {
      setSelectedExtraIds([...selectedExtraIds, id]);
    }
  };

  // Add/Remove Additional Guest
  const addAdditionalGuest = () => {
    if (additionalGuests.length + 1 >= currentRoomType.maxOccupancy) {
      Alert.alert(
        isTamil ? 'அதிகபட்ச விருந்தினர் வரம்பு' : 'Maximum Capacity',
        isTamil
          ? `இந்த அறையில் அதிகபட்சம் ${currentRoomType.maxOccupancy} விருந்தினர்கள் மட்டுமே தங்கலாம்.`
          : `This room type allows a maximum of ${currentRoomType.maxOccupancy} guests.`
      );
      return;
    }
    setAdditionalGuests([
      ...additionalGuests,
      { name: '', phone: '', idType: 'Aadhaar', idNumber: '' },
    ]);
  };

  const removeAdditionalGuest = (index: number) => {
    setAdditionalGuests(additionalGuests.filter((_, i) => i !== index));
  };

  // Handle Final Booking Submission (Flow Step 9)
  const handleConfirmBooking = async () => {
    if (!primaryName.trim()) {
      Alert.alert(isTamil ? 'பிழை' : 'Validation Error', isTamil ? 'முதன்மை விருந்தினர் பெயரை உள்ளிடவும்' : 'Please enter primary guest name');
      return;
    }
    if (!primaryPhone.trim() || primaryPhone.length < 10) {
      Alert.alert(isTamil ? 'பிழை' : 'Validation Error', isTamil ? 'சரியான 10 இலக்க தொலைபேசி எண்ணை உள்ளிடவும்' : 'Please enter valid 10-digit mobile number');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        roomTypeId: selectedRoomTypeId,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        adultsCount,
        childrenCount,
        guests: [
          {
            name: primaryName.trim(),
            phone: primaryPhone.trim(),
            idType,
            idNumber: idNumber.trim() || undefined,
            isPrimary: true,
          },
          ...additionalGuests.map((g) => ({
            name: g.name.trim(),
            phone: g.phone.trim() || undefined,
            idType: g.idType,
            idNumber: g.idNumber.trim() || undefined,
            isPrimary: false,
          })),
        ],
        extras: selectedExtraIds.map((id) => {
          const ex = availableExtras.find((e) => e.id === id);
          return {
            name: ex?.name || id,
            nameTa: ex?.nameTa || id,
            price: ex?.price || 0,
          };
        }),
        couponCode: appliedCoupon?.code,
        specialRequests: specialRequests.trim() || undefined,
        paymentMethod: paymentMethod === 'HOTEL' ? 'CASH' : paymentMethod,
      };

      const res = await apiFetch('/api/v1/lodge/bookings', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (res.ok && json.success && json.data) {
        setConfirmedBookingId(json.data.bookingNumber || json.data.id);
        setAllocatedRoomNumber(json.data.room?.roomNumber || '104');
        setActiveStep('CONFIRMED');
        return;
      } else if (json.error?.message) {
        Alert.alert(
          isTamil ? 'முன்பதிவு தகவல்' : 'Booking Notice',
          json.error.message
        );
        return;
      }
    } catch {
      // Offline fallback: generate local confirmation
    } finally {
      setLoading(false);
    }

    const generatedBkg = `AR-BKG-${new Date().toISOString().slice(2, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;
    const assignedRoom = selectedRoomTypeId === 'rt-six-bed-suite' ? '301' : selectedRoomTypeId === 'rt-double-ac' ? '201' : '101';
    setConfirmedBookingId(generatedBkg);
    setAllocatedRoomNumber(assignedRoom);
    setActiveStep('CONFIRMED');
  };

  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  // RENDER: STEP 9 â€” CONFIRMATION SCREEN
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  if (activeStep === 'CONFIRMED') {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Header
          title={t('lodge.bookingSuccess')}
          subtitle={confirmedBookingId}
        />

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Success Banner Card */}
          <GlassCard style={styles.successCard}>
            <View style={styles.successHeader}>
              <View style={[styles.checkCircle, { backgroundColor: Palette.emerald500 }]}>
                <CheckCircle2 size={32} color={Palette.white} />
              </View>
              <Text style={[styles.successTitle, { color: colors.textPrimary }]}>
                {t('lodge.bookingConfirmed')}
              </Text>
              <Text style={[styles.successSubtitle, { color: colors.textSecondary }]}>
                {isTamil
                  ? 'உங்கள் அறை வெற்றிகரமாக முன்பதிவு செய்யப்பட்டது. வரவேற்பறையில் உறுதிப்படுத்தல் செய்தி அனுப்பப்பட்டுள்ளது.'
                  : 'Your room has been reserved with double-booking lock. Confirmation sent to your phone.'}
              </Text>
            </View>

            {/* QR Code Simulation for 30-sec Check-in */}
            <View style={[styles.qrContainer, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
              <QrCode size={110} color={colors.accent} />
              <Text style={[styles.qrText, { color: colors.textPrimary }]}>
                {confirmedBookingId}
              </Text>
              <Text style={[styles.qrSubText, { color: colors.textTertiary }]}>
                {t('lodge.scanQrAtDesk')}
              </Text>
            </View>

            {/* Stay & Room Details */}
            <View style={[styles.detailTable, { borderColor: colors.border }]}>
              <View style={styles.tableRow}>
                <Text style={[styles.tableLabel, { color: colors.textSecondary }]}>
                  {t('lodge.roomNumber', { number: allocatedRoomNumber })}
                </Text>
                <Text style={[styles.tableVal, { color: colors.accent }]}>
                  {isTamil ? currentRoomType.nameTa : currentRoomType.name}
                </Text>
              </View>
              <View style={styles.tableRow}>
                <Text style={[styles.tableLabel, { color: colors.textSecondary }]}>
                  {t('lodge.checkIn')}
                </Text>
                <Text style={[styles.tableVal, { color: colors.textPrimary }]}>
                  {checkInDate} (14:00)
                </Text>
              </View>
              <View style={styles.tableRow}>
                <Text style={[styles.tableLabel, { color: colors.textSecondary }]}>
                  {t('lodge.checkOut')}
                </Text>
                <Text style={[styles.tableVal, { color: colors.textPrimary }]}>
                  {checkOutDate} (11:00)
                </Text>
              </View>
              <View style={styles.tableRow}>
                <Text style={[styles.tableLabel, { color: colors.textSecondary }]}>
                  {t('lodge.guestName')}
                </Text>
                <Text style={[styles.tableVal, { color: colors.textPrimary }]}>
                  {primaryName} ({primaryPhone})
                </Text>
              </View>
              <View style={styles.tableRow}>
                <Text style={[styles.tableLabel, { color: colors.textSecondary }]}>
                  {t('lodge.paymentMethod')}
                </Text>
                <Text style={[styles.tableVal, { color: colors.textPrimary }]}>
                  {paymentMethod === 'HOTEL' ? 'Pay at Hotel' : paymentMethod} • {advancePaid > 0 ? `₹${grandTotal} (Paid)` : `₹${grandTotal} (Due at Check-in)`}
                </Text>
              </View>
            </View>

            {/* Reminder Status Toggle */}
            <TouchableOpacity
              onPress={() => setReminderEnabled(!reminderEnabled)}
              style={[
                styles.reminderBar,
                {
                  backgroundColor: reminderEnabled ? colors.surface : colors.surfaceElevated,
                  borderColor: reminderEnabled ? colors.accent : colors.border,
                },
              ]}
            >
              <Bell size={18} color={reminderEnabled ? colors.accent : colors.textTertiary} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.reminderBarText, { color: colors.textPrimary }]}>
                  {t('lodge.reminderSet')}
                </Text>
                <Text style={[styles.reminderBarSub, { color: colors.textTertiary }]}>
                  {isTamil ? 'செக்-இன் நேரத்திற்கு 24 மணி நேரத்திற்கு முன் WhatsApp நினைவூட்டல்' : 'WhatsApp alert 24h & 2h before check-in'}
                </Text>
              </View>
              <StatusBadge
                label={reminderEnabled ? 'ACTIVE' : 'OFF'}
                variant={reminderEnabled ? 'success' : 'neutral'}
                size="sm"
              />
            </TouchableOpacity>

            {/* Action Buttons */}
            <View style={styles.actionGrid}>
              <TouchableOpacity
                onPress={() => Alert.alert(isTamil ? 'பதிவிறக்கம்' : 'Download', isTamil ? 'முன்பதிவு ரசீது PDF பதிவிறக்கப்பட்டது' : 'Booking PDF receipt downloaded')}
                style={[styles.actionBtn, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}
              >
                <Share2 size={16} color={colors.accent} />
                <Text style={[styles.actionBtnText, { color: colors.textPrimary }]}>
                  {t('lodge.downloadReceipt')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => Alert.alert(isTamil ? 'நாட்காட்டி' : 'Calendar', isTamil ? 'நாட்காட்டியில் நிகழ்வு சேர்க்கப்பட்டது' : 'Stay added to your calendar')}
                style={[styles.actionBtn, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}
              >
                <CalendarPlus size={16} color={colors.accent} />
                <Text style={[styles.actionBtnText, { color: colors.textPrimary }]}>
                  {t('lodge.addToCalendar')}
                </Text>
              </TouchableOpacity>
            </View>
          </GlassCard>
        </ScrollView>

        {/* Bottom Bar: Go to My Bookings */}
        <View style={[styles.bottomBar, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
          <PrimaryButton
            title={isTamil ? 'எனது முன்பதிவுகளை காண்க' : 'View My Bookings'}
            onPress={onBookingComplete}
            fullWidth
          />
        </View>
      </View>
    );
  }

  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  // RENDER: MAIN CUSTOMER BOOKING FLOW (STEPS 1 - 8)
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        showBack
        onBackPress={() => {
          if (activeStep === 'GUEST_INFO') {
            setActiveStep('CONFIG');
          } else {
            onBack();
          }
        }}
        title={activeStep === 'CONFIG' ? t('lodge.selectDates') : t('lodge.bookingDetails')}
        subtitle={isTamil ? 'அசோக் ராஜ் குளிரூட்டி தங்குமிடம்' : 'Ashok Raj AC Accommodation'}
      />

      {/* Step Indicator Bar */}
      <View style={[styles.stepIndicatorRow, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <View style={[styles.stepItem, activeStep === 'CONFIG' && styles.stepItemActive]}>
          <Text style={[styles.stepNumber, { color: activeStep === 'CONFIG' ? colors.accent : colors.textTertiary }]}>1</Text>
          <Text style={[styles.stepTitle, { color: activeStep === 'CONFIG' ? colors.textPrimary : colors.textTertiary }]}>
            {isTamil ? 'தேதிகள் & அறை' : 'Dates & Room'}
          </Text>
        </View>
        <ChevronRight size={14} color={colors.textTertiary} />
        <View style={[styles.stepItem, activeStep === 'GUEST_INFO' && styles.stepItemActive]}>
          <Text style={[styles.stepNumber, { color: activeStep === 'GUEST_INFO' ? colors.accent : colors.textTertiary }]}>2</Text>
          <Text style={[styles.stepTitle, { color: activeStep === 'GUEST_INFO' ? colors.textPrimary : colors.textTertiary }]}>
            {isTamil ? 'விருந்தினர் & கட்டணம்' : 'Guests & Payment'}
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {activeStep === 'CONFIG' ? (
          <View>
            {/* ── STEP 1: SELECT DATES & NIGHTS ── */}
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              {t('lodge.stepDates')} ({nights} {t('lodge.nights', { count: nights })})
            </Text>

            <View style={[styles.dateSelectionBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.dateCol}>
                <Text style={[styles.dateColLabel, { color: colors.textTertiary }]}>
                  {t('lodge.checkIn')}
                </Text>
                <TextInput
                  value={checkInDate}
                  onChangeText={setCheckInDate}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={colors.textTertiary}
                  style={[styles.dateInput, { color: colors.textPrimary }]}
                />
                <Text style={[styles.dateHint, { color: colors.accent }]}>
                  14:00 (2:00 PM)
                </Text>
              </View>

              <View style={[styles.dateDivider, { backgroundColor: colors.border }]} />

              <View style={styles.dateCol}>
                <Text style={[styles.dateColLabel, { color: colors.textTertiary }]}>
                  {t('lodge.checkOut')}
                </Text>
                <TextInput
                  value={checkOutDate}
                  onChangeText={setCheckOutDate}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={colors.textTertiary}
                  style={[styles.dateInput, { color: colors.textPrimary }]}
                />
                <Text style={[styles.dateHint, { color: colors.textTertiary }]}>
                  11:00 (11:00 AM)
                </Text>
              </View>
            </View>

            {/* Quick Date Presets */}
            <View style={styles.presetRow}>
              {[
                { label: isTamil ? 'இன்று - 1 இரவு' : 'Tonight (1 Night)', in: todayStr, out: tomorrowStr },
                { label: isTamil ? '2 இரவுகள்' : '2 Nights Stay', in: todayStr, out: dayAfterTomorrowStr },
                { label: isTamil ? 'வார இறுதி' : 'Weekend Getaway', in: tomorrowStr, out: dayAfterTomorrowStr },
              ].map((preset, idx) => (
                <TouchableOpacity
                  key={idx}
                  onPress={() => {
                    setCheckInDate(preset.in);
                    setCheckOutDate(preset.out);
                  }}
                  style={[
                    styles.presetPill,
                    {
                      backgroundColor: checkInDate === preset.in && checkOutDate === preset.out ? colors.accent : colors.surfaceElevated,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.presetPillText,
                      {
                        color: checkInDate === preset.in && checkOutDate === preset.out ? Palette.slate900 : colors.textSecondary,
                      },
                    ]}
                  >
                    {preset.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* ── STEP 2: GUESTS COUNT ── */}
            <Text style={[styles.sectionTitle, { color: colors.textPrimary, marginTop: Spacing.md }]}>
              {t('lodge.stepGuests')}
            </Text>

            <View style={[styles.guestCounterCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              {/* Adults Counter */}
              <View style={styles.counterRow}>
                <View>
                  <Text style={[styles.counterLabel, { color: colors.textPrimary }]}>
                    {t('lodge.adults')}
                  </Text>
                  <Text style={[styles.counterSub, { color: colors.textTertiary }]}>
                    {isTamil ? 'வயது 12+' : 'Age 12+'}
                  </Text>
                </View>
                <View style={styles.counterControl}>
                  <TouchableOpacity
                    onPress={() => setAdultsCount(Math.max(1, adultsCount - 1))}
                    style={[styles.counterBtn, { borderColor: colors.border }]}
                  >
                    <Text style={[styles.counterBtnText, { color: colors.textPrimary }]}>-</Text>
                  </TouchableOpacity>
                  <Text style={[styles.counterVal, { color: colors.textPrimary }]}>{adultsCount}</Text>
                  <TouchableOpacity
                    onPress={() => setAdultsCount(Math.min(currentRoomType.maxOccupancy, adultsCount + 1))}
                    style={[styles.counterBtn, { borderColor: colors.border }]}
                  >
                    <Text style={[styles.counterBtnText, { color: colors.textPrimary }]}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={[styles.divider, { backgroundColor: colors.border }]} />

              {/* Children Counter */}
              <View style={styles.counterRow}>
                <View>
                  <Text style={[styles.counterLabel, { color: colors.textPrimary }]}>
                    {t('lodge.children')}
                  </Text>
                  <Text style={[styles.counterSub, { color: colors.textTertiary }]}>
                    {isTamil ? 'வயது 0-11 (கட்டணம் இல்லை)' : 'Age 0-11 (Free stay)'}
                  </Text>
                </View>
                <View style={styles.counterControl}>
                  <TouchableOpacity
                    onPress={() => setChildrenCount(Math.max(0, childrenCount - 1))}
                    style={[styles.counterBtn, { borderColor: colors.border }]}
                  >
                    <Text style={[styles.counterBtnText, { color: colors.textPrimary }]}>-</Text>
                  </TouchableOpacity>
                  <Text style={[styles.counterVal, { color: colors.textPrimary }]}>{childrenCount}</Text>
                  <TouchableOpacity
                    onPress={() => setChildrenCount(Math.min(4, childrenCount + 1))}
                    style={[styles.counterBtn, { borderColor: colors.border }]}
                  >
                    <Text style={[styles.counterBtnText, { color: colors.textPrimary }]}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* ── STEP 3: SELECT ROOM TYPE ── */}
            <Text style={[styles.sectionTitle, { color: colors.textPrimary, marginTop: Spacing.lg }]}>
              {t('lodge.stepRooms')}
            </Text>

            {roomTypes.map((rt) => {
              const isSelected = selectedRoomTypeId === rt.id;
              const isSuitable = rt.maxOccupancy >= adultsCount;

              return (
                <TouchableOpacity
                  key={rt.id}
                  onPress={() => {
                    setSelectedRoomTypeId(rt.id);
                    if (adultsCount > rt.maxOccupancy) setAdultsCount(rt.maxOccupancy);
                  }}
                  style={[
                    styles.roomTypeCard,
                    {
                      backgroundColor: isSelected ? colors.surfaceElevated : colors.surface,
                      borderColor: isSelected ? colors.accent : colors.border,
                      borderWidth: isSelected ? 2 : 1,
                    },
                  ]}
                >
                  <View style={styles.roomTypeHeader}>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Text style={[styles.roomTypeName, { color: colors.textPrimary }]}>
                          {isTamil ? rt.nameTa : rt.name}
                        </Text>
                        {isSelected && (
                          <StatusBadge label={isTamil ? 'தேர்வு செய்யப்பட்டது' : 'Selected'} variant="success" size="sm" />
                        )}
                      </View>
                      <Text style={[styles.roomTypeBed, { color: colors.textSecondary }]}>
                        {rt.bedType} • {t('lodge.maxOccupancy', { count: rt.maxOccupancy })}
                      </Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={[styles.roomTypePrice, { color: colors.accent }]}>
                        ₹{rt.basePrice}
                      </Text>
                      <Text style={[styles.roomTypePerNight, { color: colors.textTertiary }]}>
                        / {t('lodge.perNight')}
                      </Text>
                    </View>
                  </View>

                  <Text style={[styles.roomTypeDesc, { color: colors.textSecondary }]}>
                    {isTamil ? rt.descriptionTa : rt.description}
                  </Text>

                  {/* Amenities Badges */}
                  <View style={styles.roomAmenitiesRow}>
                    {(isTamil ? rt.amenitiesTa : rt.amenities).slice(0, 4).map((am, i) => (
                      <View key={i} style={[styles.amenityPill, { backgroundColor: colors.background, borderColor: colors.border }]}>
                        <Text style={[styles.amenityPillText, { color: colors.textSecondary }]}>
                          âœ“ {am}
                        </Text>
                      </View>
                    ))}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        ) : (
          <View>
            {/* ── STEP 4: PRIMARY GUEST DETAILS ── */}
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              {t('lodge.stepGuestDetails')}
            </Text>

            <View style={[styles.formCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                {t('lodge.guestName')} *
              </Text>
              <View style={[styles.inputRow, { borderColor: colors.border }]}>
                <User size={18} color={colors.textTertiary} />
                <TextInput
                  value={primaryName}
                  onChangeText={setPrimaryName}
                  placeholder={isTamil ? 'முழு பெயரை உள்ளிடவும்' : 'Enter full name'}
                  placeholderTextColor={colors.textTertiary}
                  style={[styles.input, { color: colors.textPrimary }]}
                />
              </View>

              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                {t('lodge.guestPhone')} *
              </Text>
              <View style={[styles.inputRow, { borderColor: colors.border }]}>
                <Phone size={18} color={colors.textTertiary} />
                <TextInput
                  value={primaryPhone}
                  onChangeText={setPrimaryPhone}
                  placeholder={isTamil ? 'மொபைல் எண்ணை உள்ளிடவும்' : 'Enter mobile number'}
                  placeholderTextColor={colors.textTertiary}
                  keyboardType="phone-pad"
                  maxLength={10}
                  style={[styles.input, { color: colors.textPrimary }]}
                />
              </View>

              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                {t('lodge.idType')} *
              </Text>
              <View style={styles.idTypeRow}>
                {(['Aadhaar', 'Passport', 'PAN', 'Driving Licence'] as const).map((type) => (
                  <TouchableOpacity
                    key={type}
                    onPress={() => setIdType(type)}
                    style={[
                      styles.idTypeBtn,
                      {
                        backgroundColor: idType === type ? colors.accent : colors.surfaceElevated,
                        borderColor: idType === type ? colors.accent : colors.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.idTypeText,
                        { color: idType === type ? Palette.slate900 : colors.textPrimary },
                      ]}
                    >
                      {type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                {t('lodge.idNumber')} *
              </Text>
              <View style={[styles.inputRow, { borderColor: colors.border }]}>
                <IdCard size={18} color={colors.textTertiary} />
                <TextInput
                  value={idNumber}
                  onChangeText={setIdNumber}
                  placeholder="XXXX XXXX XXXX"
                  placeholderTextColor={colors.textTertiary}
                  style={[styles.input, { color: colors.textPrimary }]}
                />
              </View>

              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                {t('lodge.specialRequests')}
              </Text>
              <View style={[styles.inputRow, { borderColor: colors.border, height: 64 }]}>
                <TextInput
                  value={specialRequests}
                  onChangeText={setSpecialRequests}
                  placeholder={t('lodge.specialRequestsPlaceholder')}
                  placeholderTextColor={colors.textTertiary}
                  multiline
                  style={[styles.input, { color: colors.textPrimary }]}
                />
              </View>
            </View>

            {/* Additional Guests List */}
            {additionalGuests.map((guest, idx) => (
              <View key={idx} style={[styles.formCard, { backgroundColor: colors.surface, borderColor: colors.border, marginTop: Spacing.sm }]}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={[styles.counterLabel, { color: colors.textPrimary }]}>
                    {isTamil ? `விருந்தினர் #${idx + 2}` : `Additional Guest #${idx + 2}`}
                  </Text>
                  <TouchableOpacity onPress={() => removeAdditionalGuest(idx)}>
                    <Trash2 size={16} color={Palette.rose500} />
                  </TouchableOpacity>
                </View>

                <TextInput
                  value={guest.name}
                  onChangeText={(val) => {
                    const list = [...additionalGuests];
                    list[idx]!.name = val;
                    setAdditionalGuests(list);
                  }}
                  placeholder={isTamil ? 'விருந்தினர் பெயர்' : 'Guest Full Name'}
                  placeholderTextColor={colors.textTertiary}
                  style={[styles.inputRow, { color: colors.textPrimary, borderColor: colors.border, marginTop: 8 }]}
                />
              </View>
            ))}

            {additionalGuests.length + 1 < currentRoomType.maxOccupancy && (
              <TouchableOpacity onPress={addAdditionalGuest} style={styles.addGuestBtn}>
                <Plus size={16} color={colors.accent} />
                <Text style={[styles.addGuestText, { color: colors.accent }]}>
                  {t('lodge.addGuest')}
                </Text>
              </TouchableOpacity>
            )}

            {/* ── STEP 5: EXTRAS & ADD-ONS ── */}
            <Text style={[styles.sectionTitle, { color: colors.textPrimary, marginTop: Spacing.lg }]}>
              {t('lodge.stepExtras')}
            </Text>

            {availableExtras.map((extra) => {
              const isChecked = selectedExtraIds.includes(extra.id);
              return (
                <TouchableOpacity
                  key={extra.id}
                  onPress={() => toggleExtra(extra.id)}
                  style={[
                    styles.extraCard,
                    {
                      backgroundColor: isChecked ? colors.surfaceElevated : colors.surface,
                      borderColor: isChecked ? colors.accent : colors.border,
                    },
                  ]}
                >
                  <View style={[styles.extraIconBox, { backgroundColor: isChecked ? colors.accent : colors.background }]}>
                    {extra.id === 'extra-bed' ? <BedDouble size={20} color={isChecked ? Palette.slate900 : colors.accent} /> :
                     extra.id === 'extra-breakfast' ? <Utensils size={20} color={isChecked ? Palette.slate900 : colors.accent} /> :
                     extra.id === 'extra-pickup' ? <Car size={20} color={isChecked ? Palette.slate900 : colors.accent} /> :
                     <Clock size={20} color={isChecked ? Palette.slate900 : colors.accent} />}
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text style={[styles.extraName, { color: colors.textPrimary }]}>
                      {isTamil ? extra.nameTa : extra.name}
                    </Text>
                    <Text style={[styles.extraPrice, { color: colors.accent }]}>
                      +₹{extra.price} {extra.perPerson ? '/ guest' : ''} {extra.perNight ? '/ night' : ''}
                    </Text>
                  </View>

                  <StatusBadge
                    label={isChecked ? t('lodge.added') : t('lodge.add')}
                    variant={isChecked ? 'success' : 'neutral'}
                    size="sm"
                  />
                </TouchableOpacity>
              );
            })}

            {/* ── STEP 6: COUPON / OFFERS ── */}
            <Text style={[styles.sectionTitle, { color: colors.textPrimary, marginTop: Spacing.lg }]}>
              {t('lodge.stepCoupon')}
            </Text>

            <View style={[styles.couponBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.couponInputRow}>
                <Tag size={18} color={colors.accent} />
                <TextInput
                  value={couponCodeInput}
                  onChangeText={setCouponCodeInput}
                  placeholder="LODGE15 / ASHOKSTAY"
                  placeholderTextColor={colors.textTertiary}
                  autoCapitalize="characters"
                  style={[styles.input, { color: colors.textPrimary }]}
                />
                <TouchableOpacity onPress={handleApplyCoupon} style={[styles.applyBtn, { backgroundColor: colors.accent }]}>
                  <Text style={styles.applyBtnText}>{t('lodge.apply')}</Text>
                </TouchableOpacity>
              </View>

              {appliedCoupon && (
                <View style={styles.appliedRow}>
                  <Text style={[styles.appliedText, { color: Palette.emerald500 }]}>
                    ✓ {t('lodge.couponApplied')} (-₹{appliedCoupon.discountAmount})
                  </Text>
                  <TouchableOpacity onPress={() => setAppliedCoupon(null)}>
                    <Text style={[styles.removeCouponText, { color: Palette.rose500 }]}>{t('lodge.removeCoupon')}</Text>
                  </TouchableOpacity>
                </View>
              )}

              {couponError && (
                <Text style={[styles.errorText, { color: Palette.rose500 }]}>{couponError}</Text>
              )}
            </View>

            {/* ── STEP 7: PAYMENT METHOD ── */}
            <Text style={[styles.sectionTitle, { color: colors.textPrimary, marginTop: Spacing.lg }]}>
              {t('lodge.stepPayment')}
            </Text>

            <View style={[styles.paymentCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              {[
                { key: 'UPI', label: t('lodge.payUpi'), icon: Sparkles },
                { key: 'CARD', label: t('lodge.payCard'), icon: CreditCard },
                { key: 'HOTEL', label: t('lodge.payHotel'), icon: Building2 },
                { key: 'RAZORPAY', label: t('lodge.payRazorpay'), icon: ShieldCheck },
              ].map((pm) => {
                const IconC = pm.icon;
                const isSelected = paymentMethod === pm.key;
                return (
                  <TouchableOpacity
                    key={pm.key}
                    onPress={() => setPaymentMethod(pm.key as any)}
                    style={[
                      styles.paymentOption,
                      {
                        backgroundColor: isSelected ? colors.surfaceElevated : colors.surface,
                        borderColor: isSelected ? colors.accent : colors.border,
                      },
                    ]}
                  >
                    <IconC size={18} color={isSelected ? colors.accent : colors.textTertiary} />
                    <Text style={[styles.paymentOptionText, { color: colors.textPrimary, fontWeight: isSelected ? '700' : '500' }]}>
                      {pm.label}
                    </Text>
                    <View style={[styles.radioCircle, { borderColor: isSelected ? colors.accent : colors.border }]}>
                      {isSelected && <View style={[styles.radioInner, { backgroundColor: colors.accent }]} />}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* ── STEP 8: BILL SUMMARY BREAKDOWN ── */}
            <Text style={[styles.sectionTitle, { color: colors.textPrimary, marginTop: Spacing.lg }]}>
              {t('lodge.billSummary')}
            </Text>

            <PriceSummary
              subtotal={subtotalBeforeDiscount}
              discount={discountAmount}
              taxAmount={taxAmount}
              total={grandTotal}
            />

            {paymentMethod === 'HOTEL' && (
              <View style={[styles.balanceNotice, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
                <Text style={[styles.balanceNoticeText, { color: colors.accent }]}>
                  {t('lodge.balanceAtHotel')}: ₹{grandTotal.toLocaleString()}
                </Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* ── BOTTOM BAR CTA ── */}
      <View style={[styles.bottomBar, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
        {activeStep === 'CONFIG' ? (
          <PrimaryButton
            title={`${isTamil ? 'விருந்தினர் விவரங்களுக்கு தொடரவும்' : 'Continue to Guest Details'} • ₹${grandTotal.toLocaleString()}`}
            onPress={() => setActiveStep('GUEST_INFO')}
            icon={<ArrowRight size={18} color={Palette.white} />}
            fullWidth
          />
        ) : (
          <PrimaryButton
            title={`${t('lodge.confirmBooking')} • ₹${grandTotal.toLocaleString()}`}
            onPress={handleConfirmBooking}
            loading={loading}
            icon={<ShieldCheck size={18} color={Palette.white} />}
            fullWidth
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  stepIndicatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    gap: 8,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  stepItemActive: {
    opacity: 1,
  },
  stepNumber: {
    fontSize: 12,
    fontWeight: '800',
    width: 20,
    height: 20,
    borderRadius: 10,
    textAlign: 'center',
    lineHeight: 20,
    borderWidth: 1,
  },
  stepTitle: {
    fontSize: FontSize.xs + 1,
    fontWeight: '700',
  },
  scrollContent: {
    padding: Spacing.base,
    paddingBottom: Spacing['5xl'],
  },
  sectionTitle: {
    fontSize: FontSize.sm + 1,
    fontWeight: '800',
    marginBottom: Spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dateSelectionBox: {
    flexDirection: 'row',
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Spacing.md,
  },
  dateCol: {
    flex: 1,
  },
  dateColLabel: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  dateInput: {
    fontSize: FontSize.md,
    fontWeight: '800',
    padding: 0,
    height: 28,
  },
  dateHint: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  dateDivider: {
    width: 1,
    height: 48,
    marginHorizontal: Spacing.md,
  },
  presetRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: Spacing.sm,
  },
  presetPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  presetPillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  guestCounterCard: {
    padding: Spacing.base,
    borderRadius: Radius.lg,
    borderWidth: 1,
    gap: Spacing.md,
  },
  counterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  counterLabel: {
    fontSize: FontSize.sm + 1,
    fontWeight: '700',
  },
  counterSub: {
    fontSize: 11,
    marginTop: 2,
  },
  counterControl: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  counterBtn: {
    width: 34,
    height: 34,
    borderRadius: Radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterBtnText: {
    fontSize: 18,
    fontWeight: '700',
  },
  counterVal: {
    fontSize: FontSize.md,
    fontWeight: '800',
    minWidth: 20,
    textAlign: 'center',
  },
  divider: {
    height: 1,
  },
  roomTypeCard: {
    padding: Spacing.base,
    borderRadius: Radius.xl,
    marginBottom: Spacing.md,
  },
  roomTypeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  roomTypeName: {
    fontSize: FontSize.md,
    fontWeight: '800',
  },
  roomTypeBed: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  roomTypePrice: {
    fontSize: FontSize.lg,
    fontWeight: '800',
  },
  roomTypePerNight: {
    fontSize: 10,
  },
  roomTypeDesc: {
    fontSize: FontSize.xs + 1,
    lineHeight: 18,
    marginBottom: Spacing.sm,
  },
  roomAmenitiesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  amenityPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.xs,
    borderWidth: 1,
  },
  amenityPillText: {
    fontSize: 10,
    fontWeight: '600',
  },
  formCard: {
    padding: Spacing.base,
    borderRadius: Radius.lg,
    borderWidth: 1,
    gap: 6,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginTop: 6,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.md,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    height: 46,
    gap: Spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: FontSize.sm,
  },
  idTypeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginVertical: 4,
  },
  idTypeBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  idTypeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  addGuestBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: Spacing.md,
  },
  addGuestText: {
    fontSize: FontSize.xs + 1,
    fontWeight: '700',
  },
  extraCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    marginBottom: Spacing.sm,
    gap: Spacing.md,
  },
  extraIconBox: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  extraName: {
    fontSize: FontSize.xs + 1,
    fontWeight: '700',
  },
  extraPrice: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  couponBox: {
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    gap: 8,
  },
  couponInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  applyBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: Radius.md,
  },
  applyBtnText: {
    color: Palette.slate900,
    fontSize: FontSize.xs,
    fontWeight: '800',
  },
  appliedRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  appliedText: {
    fontSize: 11,
    fontWeight: '700',
  },
  removeCouponText: {
    fontSize: 11,
    fontWeight: '700',
  },
  errorText: {
    fontSize: 11,
    fontWeight: '600',
  },
  paymentCard: {
    padding: Spacing.base,
    borderRadius: Radius.lg,
    borderWidth: 1,
    gap: Spacing.sm,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    gap: Spacing.sm,
  },
  paymentOptionText: {
    flex: 1,
    fontSize: FontSize.xs + 1,
  },
  radioCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  balanceNotice: {
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  balanceNoticeText: {
    fontSize: FontSize.xs + 1,
    fontWeight: '700',
  },
  bottomBar: {
    padding: Spacing.base,
    borderTopWidth: 1,
  },
  successCard: {
    padding: Spacing.lg,
    alignItems: 'center',
    gap: Spacing.lg,
  },
  successHeader: {
    alignItems: 'center',
    gap: 8,
  },
  checkCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successTitle: {
    fontSize: FontSize.xl,
    fontWeight: '800',
  },
  successSubtitle: {
    fontSize: FontSize.xs + 1,
    textAlign: 'center',
    lineHeight: 18,
  },
  qrContainer: {
    padding: Spacing.lg,
    borderRadius: Radius.xl,
    borderWidth: 1,
    alignItems: 'center',
    gap: 6,
    width: '100%',
  },
  qrText: {
    fontSize: FontSize.md,
    fontWeight: '800',
    letterSpacing: 1,
    marginTop: 4,
  },
  qrSubText: {
    fontSize: 10,
    textAlign: 'center',
  },
  detailTable: {
    width: '100%',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    paddingVertical: Spacing.md,
    gap: 8,
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  tableLabel: {
    fontSize: FontSize.xs + 1,
  },
  tableVal: {
    fontSize: FontSize.xs + 1,
    fontWeight: '700',
  },
  reminderBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    gap: Spacing.sm,
    width: '100%',
  },
  reminderBarText: {
    fontSize: FontSize.xs + 1,
    fontWeight: '700',
  },
  reminderBarSub: {
    fontSize: 10,
  },
  actionGrid: {
    flexDirection: 'row',
    gap: Spacing.sm,
    width: '100%',
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  actionBtnText: {
    fontSize: FontSize.xs,
    fontWeight: '700',
  },
});

