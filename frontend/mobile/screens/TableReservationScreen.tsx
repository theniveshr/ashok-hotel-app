import { AppText as Text } from '../components/ui/AppText';
import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import {
  Calendar,
  Clock,
  Users,
  Utensils,
  MapPin,
  CheckCircle,
  XCircle,
  Sparkles,
  Phone,
  User,
  Info,
  ChevronRight,
  ShieldCheck,
  Building,
} from 'lucide-react-native';
import { useTheme } from '../theme/ThemeContext';
import { useTranslation } from '../i18n';
import { Header } from '../components/ui/Header';
import { PrimaryButton } from '../components/ui/PrimaryButton';
import { GlassCard } from '../components/ui/GlassCard';
import { StatusBadge } from '../components/ui/StatusBadge';
import { EmptyState } from '../components/ui/EmptyState';
import { Radius, Spacing, FontSize, Palette } from '@ashok-raj/ui';
import { useTableReservationStore, type AreaOption } from '../store/useTableReservationStore';
import { useAuthStore } from '../store/useAuthStore';
import type { TableArea, TableReservation } from '@ashok-raj/types';

export interface TableReservationScreenProps {
  onBack: () => void;
  onExploreMenu?: () => void;
}

export function TableReservationScreen({ onBack, onExploreMenu }: TableReservationScreenProps) {
  const { colors } = useTheme();
  const { t, isTamil } = useTranslation();
  const user = useAuthStore((state) => state.user);

  const {
    tables,
    lunchSlots,
    dinnerSlots,
    areas,
    selectedDate,
    selectedSlot,
    guestCount,
    selectedArea,
    guestName,
    guestPhone,
    specialRequests,
    myReservations,
    activeReservation,
    isLoading,
    error,
    setGuestCount,
    setSelectedDate,
    setSelectedSlot,
    setSelectedArea,
    setGuestDetails,
    setActiveReservation,
    fetchTables,
    fetchSlots,
    createReservation,
    fetchMyReservations,
    cancelReservation,
  } = useTableReservationStore();

  const [activeTab, setActiveTab] = useState<'RESERVE' | 'MY_RESERVATIONS'>('RESERVE');
  const [nameInput, setNameInput] = useState(guestName || user?.name || '');
  const [phoneInput, setPhoneInput] = useState(guestPhone || user?.phone || '');
  const [notesInput, setNotesInput] = useState(specialRequests || '');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [confirmedReservation, setConfirmedReservation] = useState<TableReservation | null>(null);

  useEffect(() => {
    fetchTables();
    fetchSlots();
    fetchMyReservations();
  }, []);

  useEffect(() => {
    if (user && (!nameInput || !phoneInput)) {
      if (!nameInput && user.name) setNameInput(user.name);
      if (!phoneInput && user.phone) setPhoneInput(user.phone);
    }
  }, [user]);

  // Generate next 5 dates
  const availableDates = Array.from({ length: 5 }).map((_, idx) => {
    const d = new Date();
    d.setDate(d.getDate() + idx);
    const dateStr = d.toISOString().split('T')[0];
    const isToday = idx === 0;
    const isTomorrow = idx === 1;
    const dayLabel = isToday
      ? isTamil ? 'இன்று' : 'Today'
      : isTomorrow
      ? isTamil ? 'நாளை' : 'Tomorrow'
      : d.toLocaleDateString('en-IN', { weekday: 'short' });
    const formattedDate = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

    return {
      dateStr,
      dayLabel,
      formattedDate,
    };
  });

  // Calculate matching candidate table for preview
  const previewTable = tables.find(
    (tbl) => (tbl as any).seatingArea === selectedArea && tbl.capacity >= guestCount
  ) || tables.find((tbl) => tbl.capacity >= guestCount) || {
    id: 'tbl-preview',
    tableNumber: selectedArea === 'FAMILY_SECTION' ? '12' : selectedArea === 'ROOFTOP' ? '16' : '02',
    name: selectedArea === 'FAMILY_SECTION' ? 'Table 12 (Family Suite)' : 'Table 02 (A/C Hall)',
    nameTa: selectedArea === 'FAMILY_SECTION' ? 'மேசை 12 (குடும்ப பிரிவு)' : 'மேசை 02 (A/C ஹால்)',
    floor: selectedArea === 'FAMILY_SECTION' ? 2 : selectedArea === 'ROOFTOP' ? 3 : 1,
    capacity: selectedArea === 'FAMILY_SECTION' ? 8 : 4,
  };

  const handleConfirmReservation = async () => {
    const trimmedName = nameInput.trim();
    const trimmedPhone = phoneInput.trim();

    if (!trimmedName || trimmedName.length < 2) {
      Alert.alert(isTamil ? 'பிழை' : 'Input Error', isTamil ? 'உங்கள் பெயரை சரியாக உள்ளிடவும்.' : 'Please enter guest name.');
      return;
    }

    if (!trimmedPhone || !/^[6-9]\d{9}$/.test(trimmedPhone)) {
      Alert.alert(isTamil ? 'பிழை' : 'Input Error', isTamil ? 'சரியான 10 இலக்க தொலைபேசி எண்ணை உள்ளிடவும்.' : 'Please enter a valid 10-digit mobile number.');
      return;
    }

    setGuestDetails(trimmedName, trimmedPhone, notesInput.trim());

    const result = await createReservation({
      guestName: trimmedName,
      guestPhone: trimmedPhone,
      specialRequests: notesInput.trim() || undefined,
    });

    if (result) {
      setConfirmedReservation(result);
      setShowSuccessModal(true);
      fetchMyReservations();
    } else {
      Alert.alert(isTamil ? 'முன்பதிவு தோல்வி' : 'Reservation Notice', error || 'Unable to book table. Please try another time slot.');
    }
  };

  const handleCancelReservation = (resId: string) => {
    Alert.alert(
      isTamil ? 'முன்பதிவு ரத்து' : 'Cancel Reservation',
      isTamil ? 'இந்த மேசை முன்பதிவை நிச்சயமாக ரத்து செய்ய விரும்புகிறீர்களா?' : 'Are you sure you want to cancel this table reservation?',
      [
        { text: isTamil ? 'இல்லை' : 'No', style: 'cancel' },
        {
          text: isTamil ? 'ஆம், ரத்து செய்' : 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            const ok = await cancelReservation(resId, 'Cancelled by guest');
            if (ok) {
              Alert.alert(isTamil ? 'வெற்றி' : 'Success', isTamil ? 'மேசை முன்பதிவு ரத்து செய்யப்பட்டது.' : 'Table reservation has been cancelled.');
              fetchMyReservations();
            }
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: '#F8FAFC' }]}>
      <Header
        showBack
        onBackPress={onBack}
        title={isTamil ? 'மேசை முன்பதிவு' : 'Table Reservation'}
        subtitle={isTamil ? 'அசோக் ராஜ் உணவகத்தில் சிறந்த டைனிங்' : 'Premium Dining at Ashok Raj Kalaiyarkoil'}
      />

      {/* Segment Bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          onPress={() => setActiveTab('RESERVE')}
          style={[styles.tabBtn, activeTab === 'RESERVE' && styles.tabBtnActive]}
        >
          <Text style={[styles.tabText, activeTab === 'RESERVE' ? styles.tabTextActive : styles.tabTextInactive]}>
            {isTamil ? 'புதிய முன்பதிவு' : 'Book a Table'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab('MY_RESERVATIONS')}
          style={[styles.tabBtn, activeTab === 'MY_RESERVATIONS' && styles.tabBtnActive]}
        >
          <Text style={[styles.tabText, activeTab === 'MY_RESERVATIONS' ? styles.tabTextActive : styles.tabTextInactive]}>
            {isTamil ? 'என் முன்பதிவுகள்' : 'My Bookings'} ({myReservations.length})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {activeTab === 'RESERVE' ? (
          <View style={styles.formWrap}>
            {/* 1. Date Selector */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <Calendar size={18} color="#2563EB" />
                <Text style={styles.sectionTitle}>
                  {isTamil ? '1. தேதியை தேர்வு செய்க' : '1. Select Dining Date'}
                </Text>
              </View>

              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dateScroll}>
                {availableDates.map((item) => {
                  const isSelected = selectedDate === item.dateStr;
                  return (
                    <TouchableOpacity
                      key={item.dateStr}
                      onPress={() => setSelectedDate(item.dateStr)}
                      style={[
                        styles.dateChip,
                        isSelected && styles.dateChipActive,
                      ]}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.dateChipDay, isSelected && styles.dateChipTextActive]}>
                        {item.dayLabel}
                      </Text>
                      <Text style={[styles.dateChipDate, isSelected && styles.dateChipTextActive]}>
                        {item.formattedDate}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* 2. Guest Count Selector */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <Users size={18} color="#2563EB" />
                <Text style={styles.sectionTitle}>
                  {isTamil ? '2. விருந்தினர்களின் எண்ணிக்கை' : '2. Number of Guests'}
                </Text>
              </View>

              <View style={styles.guestPillRow}>
                {[1, 2, 4, 6, 8, 10, 12].map((num) => {
                  const isSelected = guestCount === num;
                  return (
                    <TouchableOpacity
                      key={num}
                      onPress={() => setGuestCount(num)}
                      style={[
                        styles.guestPill,
                        isSelected && styles.guestPillActive,
                      ]}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.guestPillText, isSelected && styles.guestPillTextActive]}>
                        {num} {isTamil ? 'பேர்' : num === 1 ? 'Guest' : 'Guests'}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* 3. Seating Area Preferences */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <Building size={18} color="#2563EB" />
                <Text style={styles.sectionTitle}>
                  {isTamil ? '3. விரும்பும் அரங்கு பகுதி' : '3. Preferred Seating Area'}
                </Text>
              </View>

              <View style={styles.areaGrid}>
                {areas.map((area) => {
                  const isSelected = selectedArea === area.key;
                  return (
                    <TouchableOpacity
                      key={area.key}
                      onPress={() => setSelectedArea(area.key as TableArea)}
                      style={[
                        styles.areaCard,
                        isSelected && styles.areaCardActive,
                      ]}
                      activeOpacity={0.8}
                    >
                      <View style={styles.areaHead}>
                        <Utensils size={16} color={isSelected ? '#2563EB' : '#64748B'} />
                        {isSelected && <CheckCircle size={16} color="#2563EB" />}
                      </View>
                      <Text style={[styles.areaTitle, isSelected && styles.areaTitleActive]}>
                        {isTamil ? area.nameTa : area.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* 4. Time Slots (Lunch & Dinner) */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <Clock size={18} color="#2563EB" />
                <Text style={styles.sectionTitle}>
                  {isTamil ? '4. நேரத்தை தேர்வு செய்க' : '4. Select Dining Time Slot'}
                </Text>
              </View>

              {/* Lunch Section */}
              <Text style={styles.slotCategoryTitle}>
                {isTamil ? 'மதிய உணவு (12:00 PM – 02:30 PM)' : 'Lunch Dining (12:00 PM – 02:30 PM)'}
              </Text>
              <View style={styles.slotsGrid}>
                {lunchSlots.map((item) => {
                  const isSelected = selectedSlot === item.slot;
                  return (
                    <TouchableOpacity
                      key={item.slot}
                      onPress={() => setSelectedSlot(item.slot)}
                      disabled={!item.isAvailable}
                      style={[
                        styles.slotPill,
                        isSelected && styles.slotPillActive,
                        !item.isAvailable && styles.slotPillDisabled,
                      ]}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.slotPillText, isSelected && styles.slotPillTextActive]}>
                        {item.slot}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Dinner Section */}
              <Text style={[styles.slotCategoryTitle, { marginTop: Spacing.md }]}>
                {isTamil ? 'இரவு உணவு (07:00 PM – 10:00 PM)' : 'Dinner Dining (07:00 PM – 10:00 PM)'}
              </Text>
              <View style={styles.slotsGrid}>
                {dinnerSlots.map((item) => {
                  const isSelected = selectedSlot === item.slot;
                  return (
                    <TouchableOpacity
                      key={item.slot}
                      onPress={() => setSelectedSlot(item.slot)}
                      disabled={!item.isAvailable}
                      style={[
                        styles.slotPill,
                        isSelected && styles.slotPillActive,
                        !item.isAvailable && styles.slotPillDisabled,
                      ]}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.slotPillText, isSelected && styles.slotPillTextActive]}>
                        {item.slot}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* 5. Smart Table Allocation Banner */}
            <View style={styles.allocationCard}>
              <View style={styles.allocationLeft}>
                <Sparkles size={20} color="#D97706" />
                <View>
                  <Text style={styles.allocationBadge}>
                    {isTamil ? 'தானியங்கி மேசை ஒதுக்கீடு' : 'Smart Table Allocation'}
                  </Text>
                  <Text style={styles.allocationTableName}>
                    {isTamil ? (previewTable as any).nameTa || previewTable.name : previewTable.name}
                  </Text>
                  <Text style={styles.allocationMeta}>
                    {isTamil ? `தளம் ${previewTable.floor} • ${previewTable.capacity} இருக்கைகள்` : `Floor ${previewTable.floor} • Capacity: ${previewTable.capacity} seats`}
                  </Text>
                </View>
              </View>
            </View>

            {/* 6. Guest Contact & Special Requests Form */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <User size={18} color="#2563EB" />
                <Text style={styles.sectionTitle}>
                  {isTamil ? '5. தொடர்பு விவரங்கள் & குறிப்புகள்' : '5. Contact Details & Requests'}
                </Text>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{isTamil ? 'முழு பெயர்' : 'Full Name'}</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder={isTamil ? 'உங்கள் பெயரை உள்ளிடவும்' : 'Enter guest full name'}
                  placeholderTextColor="#94A3B8"
                  value={nameInput}
                  onChangeText={setNameInput}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{isTamil ? 'தொலைபேசி எண்' : 'Mobile Number'}</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder={isTamil ? '10 இலக்க எண்' : '10-digit Indian mobile number'}
                  placeholderTextColor="#94A3B8"
                  keyboardType="phone-pad"
                  maxLength={10}
                  value={phoneInput}
                  onChangeText={setPhoneInput}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  {isTamil ? 'சிறப்பு கோரிக்கைகள் (விருப்பத்தேர்வு)' : 'Special Requests (Optional)'}
                </Text>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  placeholder={isTamil ? 'குழந்தை நாற்காலி, பிறந்தநாள் கொண்டாட்டம், ஜன்னல் மேசை...' : 'E.g., Window table, high chair, birthday decoration...'}
                  placeholderTextColor="#94A3B8"
                  multiline
                  numberOfLines={3}
                  value={notesInput}
                  onChangeText={setNotesInput}
                />
              </View>
            </View>

            {/* Submit Reservation Button */}
            <PrimaryButton
              title={isTamil ? 'மேசை முன்பதிவை உறுதி செய்' : 'Confirm Table Reservation'}
              onPress={handleConfirmReservation}
              loading={isLoading}
            />
          </View>
        ) : (
          /* My Reservations Tab */
          <View style={styles.reservationsWrap}>
            {myReservations.length === 0 ? (
              <EmptyState
                title={isTamil ? 'முன்பதிவுகள் எதுவும் இல்லை' : 'No Table Bookings'}
                description={isTamil ? 'சுவையான உணவருந்த புதிய மேசையை முன்பதிவு செய்யவும்.' : 'You have no table reservations. Book a table for lunch or dinner.'}
                actionTitle={isTamil ? 'இப்போது முன்பதிவு செய்' : 'Book a Table Now'}
                onActionPress={() => setActiveTab('RESERVE')}
              />
            ) : (
              myReservations.map((res) => {
                const isConfirmed = res.status === 'CONFIRMED';
                const isCancelled = res.status === 'CANCELLED';

                return (
                  <View key={res.id} style={styles.resCard}>
                    <View style={styles.resCardHead}>
                      <View>
                        <Text style={styles.resNumber}>#{res.reservationNumber}</Text>
                        <Text style={styles.resDate}>
                          {new Date(res.reservationDate).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}{' '}
                          • {res.timeSlot}
                        </Text>
                      </View>
                      <StatusBadge
                        label={
                          isConfirmed
                            ? isTamil ? 'உறுதியானது' : 'Confirmed'
                            : isCancelled
                            ? isTamil ? 'ரத்து' : 'Cancelled'
                            : res.status
                        }
                        variant={isConfirmed ? 'success' : isCancelled ? 'error' : 'info'}
                      />
                    </View>

                    <View style={styles.resDetailsRow}>
                      <View style={styles.resDetailItem}>
                        <Users size={15} color="#2563EB" />
                        <Text style={styles.resDetailText}>
                          {res.guestCount} {isTamil ? 'விருந்தினர்கள்' : 'Guests'}
                        </Text>
                      </View>
                      <View style={styles.resDetailItem}>
                        <Utensils size={15} color="#2563EB" />
                        <Text style={styles.resDetailText}>
                          {isTamil ? (res as any).tableNameTa || res.tableNumber : `Table ${res.tableNumber}`}
                        </Text>
                      </View>
                    </View>

                    {res.specialRequests && (
                      <Text style={styles.resNotes} numberOfLines={2}>
                        "{res.specialRequests}"
                      </Text>
                    )}

                    <View style={styles.resFooter}>
                      <Text style={styles.resGuestName}>
                        {res.guestName} ({res.guestPhone})
                      </Text>

                      {isConfirmed && (
                        <TouchableOpacity
                          style={styles.cancelResBtn}
                          onPress={() => handleCancelReservation(res.id)}
                        >
                          <XCircle size={14} color="#EF4444" />
                          <Text style={styles.cancelResBtnText}>
                            {isTamil ? 'ரத்து செய்' : 'Cancel'}
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                );
              })
            )}
          </View>
        )}
      </ScrollView>

      {/* Success Confirmation Modal Overlay */}
      {showSuccessModal && confirmedReservation && (
        <View style={styles.modalOverlay}>
          <GlassCard style={styles.modalCard}>
            <CheckCircle size={56} color="#16A34A" style={{ alignSelf: 'center', marginBottom: 12 }} />
            <Text style={styles.modalTitle}>
              {isTamil ? 'மேசை முன்பதிவு உறுதியானது!' : 'Table Reserved Successfully!'}
            </Text>
            <Text style={styles.modalSub}>
              {isTamil ? 'அசோக் ராஜ் உணவகத்தில் உங்களுக்காக மேசை ஒதுக்கப்பட்டுள்ளது.' : 'Your dining table is ready at Ashok Raj Lodge & Restaurant.'}
            </Text>

            <View style={styles.modalDetailsBox}>
              <View style={styles.modalRow}>
                <Text style={styles.modalLabel}>{isTamil ? 'முன்பதிவு எண்' : 'Booking Number'}</Text>
                <Text style={styles.modalVal}>#{confirmedReservation.reservationNumber}</Text>
              </View>
              <View style={styles.modalRow}>
                <Text style={styles.modalLabel}>{isTamil ? 'ஒதுக்கப்பட்ட மேசை' : 'Allocated Table'}</Text>
                <Text style={styles.modalVal}>{confirmedReservation.tableNumber} (A/C Hall)</Text>
              </View>
              <View style={styles.modalRow}>
                <Text style={styles.modalLabel}>{isTamil ? 'தேதி & நேரம்' : 'Date & Time'}</Text>
                <Text style={styles.modalVal}>{confirmedReservation.reservationDate} • {confirmedReservation.timeSlot}</Text>
              </View>
              <View style={styles.modalRow}>
                <Text style={styles.modalLabel}>{isTamil ? 'விருந்தினர்கள்' : 'Guests'}</Text>
                <Text style={styles.modalVal}>{confirmedReservation.guestCount} {isTamil ? 'பேர்' : 'Guests'}</Text>
              </View>
            </View>

            <View style={styles.modalActions}>
              <PrimaryButton
                title={isTamil ? 'என் முன்பதிவுகளைக் காண்' : 'View My Bookings'}
                onPress={() => {
                  setShowSuccessModal(false);
                  setActiveTab('MY_RESERVATIONS');
                }}
              />
            </View>
          </GlassCard>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderBottomWidth: 2.5,
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
    fontWeight: '800',
  },
  tabTextInactive: {
    color: '#64748B',
    fontWeight: '600',
  },
  scrollContent: {
    padding: Spacing.base,
    paddingBottom: Spacing['6xl'],
  },
  formWrap: {
    gap: Spacing.md,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: Spacing.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  // Dates
  dateScroll: {
    gap: 10,
    paddingVertical: 4,
  },
  dateChip: {
    backgroundColor: '#F8FAFC',
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignItems: 'center',
    minWidth: 84,
  },
  dateChipActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  dateChipDay: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  dateChipDate: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 2,
  },
  dateChipTextActive: {
    color: '#FFFFFF',
  },
  // Guest pills
  guestPillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  guestPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
  },
  guestPillActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  guestPillText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
  },
  guestPillTextActive: {
    color: '#FFFFFF',
  },
  // Areas
  areaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  areaCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#F8FAFC',
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    padding: 12,
  },
  areaCardActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#2563EB',
  },
  areaHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  areaTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
  },
  areaTitleActive: {
    color: '#2563EB',
  },
  // Slots
  slotCategoryTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 2,
  },
  slotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  slotPill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: Radius.sm,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
  },
  slotPillActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  slotPillDisabled: {
    opacity: 0.35,
  },
  slotPillText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
  },
  slotPillTextActive: {
    color: '#FFFFFF',
  },
  // Allocation
  allocationCard: {
    backgroundColor: '#FEF3C7',
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    borderColor: '#F59E0B',
    padding: Spacing.base,
  },
  allocationLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  allocationBadge: {
    fontSize: 11,
    fontWeight: '800',
    color: '#B45309',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  allocationTableName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#78350F',
    marginTop: 2,
  },
  allocationMeta: {
    fontSize: 12,
    fontWeight: '600',
    color: '#92400E',
    marginTop: 1,
  },
  // Form input
  inputGroup: {
    gap: 6,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
  },
  textInput: {
    backgroundColor: '#F8FAFC',
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0F172A',
  },
  textArea: {
    height: 72,
    textAlignVertical: 'top',
  },
  // My Reservations
  reservationsWrap: {
    gap: Spacing.md,
  },
  resCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 10,
    ...Platform.select({
      web: {
        boxShadow: '0 4px 12px rgba(15, 23, 42, 0.05)',
      },
      default: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
      },
    }),
  },
  resCardHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resNumber: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  resDate: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 2,
  },
  resDetailsRow: {
    flexDirection: 'row',
    gap: 16,
    backgroundColor: '#F8FAFC',
    padding: 10,
    borderRadius: Radius.sm,
  },
  resDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  resDetailText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
  },
  resNotes: {
    fontSize: 12,
    fontStyle: 'italic',
    color: '#64748B',
  },
  resFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 8,
  },
  resGuestName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  cancelResBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    backgroundColor: '#FEF2F2',
  },
  cancelResBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#EF4444',
  },
  // Modal Overlay
  modalOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
    zIndex: 9999,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: Spacing.xl,
    width: '100%',
    maxWidth: 420,
    gap: Spacing.sm,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
  },
  modalSub: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  modalDetailsBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: Radius.md,
    padding: Spacing.md,
    gap: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  modalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  modalVal: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalActions: {
    marginTop: Spacing.sm,
  },
});
