import { AppText as Text } from '../components/ui/AppText';
import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  Platform,
} from 'react-native';
import {
  Hotel,
  Calendar,
  KeyRound,
  Coffee,
  XCircle,
  Edit3,
  Bell,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  User,
  Phone,
  QrCode,
  ChevronRight,
} from 'lucide-react-native';
import { useTranslation } from '../i18n';
import { Header } from '../components/ui/Header';
import { StatusBadge } from '../components/ui/StatusBadge';
import { BookingTimeline } from '../components/ui/BookingTimeline';
import { Radius, Spacing, FontSize, Palette } from '@ashok-raj/ui';

export interface BookingsScreenProps {
  onOrderRoomService?: () => void;
}

export function BookingsScreen({ onOrderRoomService }: BookingsScreenProps) {
  const { isTamil } = useTranslation();
  const [tab, setTab] = useState<'CURRENT' | 'PAST'>('CURRENT');

  // Interactive Modals
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showModifyModal, setShowModifyModal] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);

  // Active Booking State
  const [activeBooking, setActiveBooking] = useState({
    id: 'bkg-1044',
    bookingNumber: 'AR-BKG-1044',
    roomNumber: '104',
    roomType: 'Deluxe AC Master Room',
    roomTypeTa: 'டீலக்ஸ் மாஸ்டர் குளிரூட்டி அறை',
    checkIn: '2026-08-27',
    checkOut: '2026-08-29',
    adults: 2,
    guestsCount: 2,
    guestName: 'Sundar Rajan',
    guestPhone: '9876543210',
    status: 'CHECKED_IN',
    roomCharges: 3600,
    roomServiceCharges: 0,
    taxAmount: 432,
    totalAmount: 4032,
    advancePaid: 4032,
    isCancelled: false,
  });

  const [cancelReason, setCancelReason] = useState('');
  const [cancelLoading, setCancelLoading] = useState(false);
  const [modifyCheckOut, setModifyCheckOut] = useState('2026-08-30');
  const [modifyAdults, setModifyAdults] = useState('2');
  const [modifyLoading, setModifyLoading] = useState(false);

  const handleSendReminder = () => {
    Alert.alert(
      isTamil ? 'நினைவூட்டல்' : 'Booking Reminder',
      isTamil
        ? 'நினைவூட்டல் SMS & WhatsApp செய்தி 9876543210 என்ற எண்ணிற்கு அனுப்பப்பட்டது!'
        : 'Stay reminder notification & WhatsApp alert sent to +91 9876543210 successfully!'
    );
  };

  const handleConfirmCancel = () => {
    if (!cancelReason.trim()) {
      Alert.alert(isTamil ? 'பிழை' : 'Reason Required', isTamil ? 'ரத்து செய்வதற்கான காரணத்தை உள்ளிடவும்' : 'Please provide a reason for cancellation');
      return;
    }

    setCancelLoading(true);
    setTimeout(() => {
      setCancelLoading(false);
      setShowCancelModal(false);
      setActiveBooking({
        ...activeBooking,
        status: 'CANCELLED',
        isCancelled: true,
      });
      Alert.alert(
        isTamil ? 'முன்பதிவு ரத்து' : 'Booking Cancelled',
        isTamil
          ? 'முன்பதிவு ரத்து செய்யப்பட்டது. ₹4,032 உங்கள் மூல வங்கி கணக்கிற்கு 24 மணி நேரத்தில் திருப்பி செலுத்தப்படும்.'
          : 'Booking has been cancelled. Full refund of ₹4,032 has been initiated to your original payment method.'
      );
    }, 800);
  };

  const handleConfirmModify = () => {
    setModifyLoading(true);
    setTimeout(() => {
      setModifyLoading(false);
      setShowModifyModal(false);
      setActiveBooking({
        ...activeBooking,
        checkOut: modifyCheckOut,
        adults: parseInt(modifyAdults) || 2,
      });
      Alert.alert(
        isTamil ? 'மாற்றம் செய்யப்பட்டது' : 'Booking Updated',
        isTamil
          ? 'தங்குமிட தேதிகள் வெற்றிகரமாக மாற்றப்பட்டது.'
          : 'Stay dates have been updated successfully with room allocation retained.'
      );
    }, 800);
  };

  return (
    <View style={styles.container}>
      <Header
        title={isTamil ? 'அறை முன்பதிவுகள்' : 'My Bookings'}
        subtitle={isTamil ? 'லாட்ஜ் தங்குமிடம் & வரலாறு' : 'Lodge Stays & History'}
      />

      {/* Tabs */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          onPress={() => setTab('CURRENT')}
          style={[styles.tabBtn, tab === 'CURRENT' && styles.tabBtnActive]}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabText, tab === 'CURRENT' ? styles.tabTextActive : styles.tabTextInactive]}>
            {isTamil ? 'தற்போதைய தங்குமிடம்' : 'Active Stay'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setTab('PAST')}
          style={[styles.tabBtn, tab === 'PAST' && styles.tabBtnActive]}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabText, tab === 'PAST' ? styles.tabTextActive : styles.tabTextInactive]}>
            {isTamil ? 'கடந்த முன்பதிவுகள்' : 'Past Stays'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {tab === 'CURRENT' ? (
          <View style={styles.activeBookingCard}>
            {/* Header & Status */}
            <View style={styles.cardHeader}>
              <View>
                <Text style={styles.bookingNumber}>#{activeBooking.bookingNumber}</Text>
                <Text style={styles.roomType}>
                  {isTamil ? activeBooking.roomTypeTa : activeBooking.roomType}
                </Text>
              </View>
              <StatusBadge
                label={
                  activeBooking.status === 'CHECKED_IN'
                    ? isTamil ? 'செக்-இன் ஆனது' : 'Checked In'
                    : activeBooking.status === 'CANCELLED'
                    ? isTamil ? 'ரத்து செய்யப்பட்டது' : 'Cancelled'
                    : isTamil ? 'உறுதியானது' : 'Confirmed'
                }
                variant={activeBooking.status === 'CHECKED_IN' ? 'success' : activeBooking.status === 'CANCELLED' ? 'error' : 'info'}
              />
            </View>

            {/* Room Key Badge */}
            <View style={styles.roomKeyBanner}>
              <View style={styles.roomKeyLeft}>
                <View style={styles.keyIconCircle}>
                  <KeyRound size={20} color="#2563EB" />
                </View>
                <View>
                  <Text style={styles.roomKeyLabel}>{isTamil ? 'அறை எண்' : 'Allocated Room'}</Text>
                  <Text style={styles.roomKeyNumber}>Room {activeBooking.roomNumber}</Text>
                </View>
              </View>

              <TouchableOpacity
                onPress={() => setShowQrModal(true)}
                style={styles.qrButton}
                activeOpacity={0.7}
              >
                <QrCode size={16} color="#2563EB" />
                <Text style={styles.qrButtonText}>{isTamil ? 'சாவி QR' : 'Key Pass'}</Text>
              </TouchableOpacity>
            </View>

            {/* Dates Grid */}
            <View style={styles.datesGrid}>
              <View style={styles.dateCol}>
                <Text style={styles.dateColLabel}>{isTamil ? 'செக்-இன்' : 'Check-In'}</Text>
                <Text style={styles.dateColValue}>{activeBooking.checkIn}</Text>
                <Text style={styles.dateColTime}>02:00 PM</Text>
              </View>
              <View style={styles.dateDivider} />
              <View style={styles.dateCol}>
                <Text style={styles.dateColLabel}>{isTamil ? 'செக்-அவுட்' : 'Check-Out'}</Text>
                <Text style={styles.dateColValue}>{activeBooking.checkOut}</Text>
                <Text style={styles.dateColTime}>11:00 AM</Text>
              </View>
            </View>

            {/* Timeline */}
            <View style={styles.timelineContainer}>
              <BookingTimeline currentStatus={activeBooking.status} />
            </View>

            {/* Action Buttons Row */}
            <View style={styles.actionsRow}>
              {onOrderRoomService && (
                <TouchableOpacity
                  onPress={onOrderRoomService}
                  style={styles.roomServiceBtn}
                  activeOpacity={0.8}
                >
                  <Coffee size={16} color="#FFFFFF" />
                  <Text style={styles.roomServiceBtnText}>
                    {isTamil ? 'ரூம் சர்வீஸ் உணவு' : 'Room Service'}
                  </Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                onPress={handleSendReminder}
                style={styles.iconActionBtn}
                activeOpacity={0.7}
              >
                <Bell size={18} color="#2563EB" />
              </TouchableOpacity>

              {!activeBooking.isCancelled && (
                <TouchableOpacity
                  onPress={() => setShowModifyModal(true)}
                  style={styles.iconActionBtn}
                  activeOpacity={0.7}
                >
                  <Edit3 size={18} color="#475569" />
                </TouchableOpacity>
              )}

              {!activeBooking.isCancelled && (
                <TouchableOpacity
                  onPress={() => setShowCancelModal(true)}
                  style={[styles.iconActionBtn, { backgroundColor: '#FEE2E2', borderColor: '#FECACA' }]}
                  activeOpacity={0.7}
                >
                  <XCircle size={18} color="#DC2626" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        ) : (
          <View style={styles.pastContainer}>
            <View style={styles.pastCard}>
              <View style={styles.cardHeader}>
                <View>
                  <Text style={styles.bookingNumber}>#AR-BKG-0982</Text>
                  <Text style={styles.roomType}>
                    {isTamil ? 'டீலக்ஸ் ஏசி அறை' : 'Deluxe AC Room'}
                  </Text>
                </View>
                <StatusBadge label={isTamil ? 'முடிந்தது' : 'Completed'} variant="success" />
              </View>
              <Text style={styles.pastDates}>12 Aug 2026 – 14 Aug 2026 • 2 Nights</Text>
              <Text style={styles.pastTotal}>Total: ₹3,600 (Paid via UPI)</Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* QR Key Modal */}
      <Modal visible={showQrModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>{isTamil ? 'டிஜிட்டல் ரூம் கீ' : 'Digital Room Key'}</Text>
            <Text style={styles.modalSub}>
              {isTamil
                ? 'ஹோட்டல் கதவு சென்சார் அல்லது ரிசப்ஷனில் காண்பிக்கவும்'
                : 'Scan at reception or tap at door lock for express access'}
            </Text>
            <View style={styles.qrPlaceholder}>
              <QrCode size={140} color="#2563EB" />
            </View>
            <Text style={styles.qrRoomText}>Room 104 • {activeBooking.guestName}</Text>
            <TouchableOpacity
              onPress={() => setShowQrModal(false)}
              style={styles.modalCloseBtn}
            >
              <Text style={styles.modalCloseBtnText}>{isTamil ? 'மூடு' : 'Close'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modify Modal */}
      <Modal visible={showModifyModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>{isTamil ? 'தேதியை மாற்று' : 'Modify Stay Dates'}</Text>
            <Text style={styles.fieldLabel}>{isTamil ? 'புதிய செக்-அவுட் தேதி' : 'New Check-Out Date'}</Text>
            <TextInput
              value={modifyCheckOut}
              onChangeText={setModifyCheckOut}
              style={styles.modalInput}
              placeholder="YYYY-MM-DD"
            />
            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                onPress={() => setShowModifyModal(false)}
                style={styles.modalCancelBtn}
              >
                <Text style={styles.modalCancelText}>{isTamil ? 'ரத்து' : 'Cancel'}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleConfirmModify}
                style={styles.modalConfirmBtn}
              >
                <Text style={styles.modalConfirmText}>{isTamil ? 'சேமி' : 'Save Changes'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Cancel Modal */}
      <Modal visible={showCancelModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={[styles.modalTitle, { color: '#DC2626' }]}>
              {isTamil ? 'முன்பதிவை ரத்து செய்க' : 'Cancel Booking'}
            </Text>
            <Text style={styles.modalSub}>
              {isTamil
                ? 'முழு கட்டணம் ₹4,032 திருப்பி அளிக்கப்படும்.'
                : '100% full refund of ₹4,032 will be credited to your account.'}
            </Text>
            <TextInput
              value={cancelReason}
              onChangeText={setCancelReason}
              placeholder={isTamil ? 'ரத்து செய்ய காரணம்...' : 'Reason for cancellation...'}
              style={[styles.modalInput, { height: 70 }]}
              multiline
            />
            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                onPress={() => setShowCancelModal(false)}
                style={styles.modalCancelBtn}
              >
                <Text style={styles.modalCancelText}>{isTamil ? 'பின்வாங்கு' : 'Keep Booking'}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleConfirmCancel}
                style={[styles.modalConfirmBtn, { backgroundColor: '#DC2626' }]}
              >
                <Text style={styles.modalConfirmText}>{isTamil ? 'ரத்து செய்' : 'Confirm Cancel'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabBtnActive: {
    borderBottomColor: '#2563EB',
  },
  tabText: {
    fontSize: FontSize.sm,
  },
  tabTextActive: {
    color: '#2563EB',
    fontWeight: '700',
  },
  tabTextInactive: {
    color: '#475569',
    fontWeight: '600',
  },
  scrollContent: {
    padding: Spacing.base,
    paddingBottom: Spacing['6xl'],
    gap: Spacing.md,
  },
  activeBookingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Platform.select({
      web: {
        boxShadow: '0 4px 12px rgba(15, 23, 42, 0.05)',
      },
      default: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
      },
    }),
    gap: Spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bookingNumber: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  roomType: {
    fontSize: 12.5,
    color: '#475569',
    marginTop: 2,
    fontWeight: '500',
  },
  roomKeyBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  roomKeyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  keyIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  roomKeyLabel: {
    fontSize: 10.5,
    color: '#475569',
    fontWeight: '600',
  },
  roomKeyNumber: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1E40AF',
  },
  qrButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  qrButtonText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2563EB',
  },
  datesGrid: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  dateCol: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  dateColLabel: {
    fontSize: 10.5,
    color: '#334155',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  dateColValue: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  dateColTime: {
    fontSize: 11,
    color: '#1E293B',
    fontWeight: '600',
  },
  dateDivider: {
    width: 1,
    backgroundColor: '#E2E8F0',
  },
  timelineContainer: {
    marginVertical: 4,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 12,
  },
  roomServiceBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#2563EB',
    paddingVertical: 10,
    borderRadius: 12,
  },
  roomServiceBtnText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '700',
  },
  iconActionBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pastContainer: {
    gap: Spacing.md,
  },
  pastCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 6,
  },
  pastDates: {
    fontSize: 12.5,
    color: '#475569',
    fontWeight: '500',
  },
  pastTotal: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  // Modals
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  modalBox: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: Spacing.xl,
    alignItems: 'center',
    gap: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
  },
  modalSub: {
    fontSize: 12,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 16,
    fontWeight: '500',
  },
  qrPlaceholder: {
    padding: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginVertical: 8,
  },
  qrRoomText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  modalCloseBtn: {
    width: '100%',
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 6,
  },
  modalCloseBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  fieldLabel: {
    alignSelf: 'flex-start',
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  modalInput: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: '#0F172A',
  },
  modalBtnRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
    marginTop: 6,
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  modalConfirmBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#2563EB',
    alignItems: 'center',
  },
  modalConfirmText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
