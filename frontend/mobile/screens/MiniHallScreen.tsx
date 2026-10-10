import { AppText as Text } from '../components/ui/AppText';
import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image
} from 'react-native';
import {
  ArrowLeft,
  Users,
  Calendar,
  Clock,
  MapPin,
  CheckCircle,
  ChevronDown,
  PartyPopper,
  Briefcase,
  Heart,
  Cake,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../theme/ThemeContext';
import { useTranslation } from '../i18n';
import { GlassCard, PrimaryButton, StatusBadge } from '../components/ui';
import { Palette, Radius, Spacing, FontSize, Elevation } from '@ashok-raj/ui';
import { resolveMiniHallImageUrl, getFallbackMiniHallImage } from '../utils/lodgeImageResolver';

export interface MiniHallScreenProps {
  onBack: () => void;
}

type EventType = 'birthday' | 'engagement' | 'baby_shower' | 'family' | 'business' | 'religious';

const EVENT_TYPES: { key: EventType; label: string; labelTa: string; icon: typeof PartyPopper }[] = [
  { key: 'birthday',     label: 'Birthday Parties',       labelTa: 'பிறந்தநாள் விழா',        icon: Cake },
  { key: 'engagement',   label: 'Engagement Function',    labelTa: 'நிச்சயதார்த்த விழா',     icon: Heart },
  { key: 'baby_shower',  label: 'Baby Shower Function',   labelTa: 'வளைகாப்பு நிகழ்ச்சி',      icon: Heart },
  { key: 'family',       label: 'Family Gatherings',      labelTa: 'குடும்ப விழாக்கள்',        icon: PartyPopper },
  { key: 'business',     label: 'Business Meetings',      labelTa: 'வணிக கூட்டங்கள்',        icon: Briefcase },
  { key: 'religious',    label: 'Religious Functions',    labelTa: 'ஆன்மீக நிகழ்வுகள்',        icon: PartyPopper },
];

const FACILITIES = [
  { en: '100+ Seating Capacity', ta: '100+ இருக்கை வசதி' },
  { en: 'Fully Air Conditioned', ta: 'முழு குளிரூட்டப்பட்ட அரங்கு' },
  { en: 'Dining & Catering Area', ta: 'உணவு மற்றும் பஃபே பகுதி' },
  { en: 'Audio & Sound System', ta: 'நவீன ஒலி அமைப்பு' },
  { en: 'Ample Parking Space', ta: 'தாராளமான வாகன நிறுத்தம்' },
  { en: 'Stage & Decoration Support', ta: 'மேடை & அலங்கார உதவி' },
];

export function MiniHallScreen({ onBack }: MiniHallScreenProps) {
  const { colors } = useTheme();
  const { t, isTamil } = useTranslation();

  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [guestCount, setGuestCount] = useState(50);
  const [selectedEvent, setSelectedEvent] = useState<EventType | null>(null);
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [fallbackFailed, setFallbackFailed] = useState(false);

  const heroImageUri = imgError
    ? getFallbackMiniHallImage()
    : resolveMiniHallImageUrl('https://www.ashokrajgroups.com/images/Minihall/Mini-Hall.webp');

  const handleGuestCount = (delta: number) => {
    setGuestCount((prev) => Math.max(10, Math.min(150, prev + delta)));
  };

  const handleSubmit = async () => {
    if (!selectedDate || !selectedTime || !selectedEvent || !contactName || !contactPhone) {
      Alert.alert(
        'Incomplete details',
        'Please fill in all required fields to request a booking.',
        [{ text: 'OK' }],
      );
      return;
    }
    if (contactPhone.length !== 10) {
      Alert.alert('Invalid phone', 'Please enter a valid 10-digit mobile number.');
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setIsSubmitting(true);

    // Simulate API call
    await new Promise((r) => setTimeout(r, 1200));
    setIsSubmitting(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <View style={[styles.root, { backgroundColor: colors.background }]}>
        <View style={styles.successContainer}>
          <View style={styles.successIcon}>
            <CheckCircle size={64} color={Palette.blue700} />
          </View>
          <Text style={styles.successTitle}>Enquiry submitted</Text>
          <Text style={styles.successSubtitle}>
            Our team will contact you within 2 hours to confirm your booking at Ashok Raj Groups Mini Hall.
          </Text>
          <TouchableOpacity style={styles.backHomeBtn} onPress={onBack}>
            <Text style={styles.backHomeBtnText}>Back to home</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.7}>
          <ArrowLeft size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
          {isTamil ? 'மினி ஹால்' : 'Mini Hall'}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Hero Section ─────────────────────────────────────────────────── */}
        <View style={styles.heroContainer}>
          <View style={styles.heroImage}>
            {!fallbackFailed && (
              <Image
                source={{ uri: heroImageUri }}
                style={StyleSheet.absoluteFillObject}
                resizeMode="cover"
                onError={() => {
                  if (!imgError) {
                    setImgError(true);
                  } else {
                    setFallbackFailed(true);
                  }
                }}
              />
            )}
            <View style={styles.heroGradientBg} />
            <View style={styles.heroOverlay}>
              <GlassCard style={styles.heroGlassPanel}>
                <Text style={styles.heroTitle}>
                  {isTamil
                    ? 'அசோக் ராஜ் மினி ஹால்'
                    : 'Ashok Raj Mini Hall'}
                </Text>
                <Text style={styles.heroSubtitle}>
                  {isTamil
                    ? 'குடும்ப விழா, வணிக கூட்டம், பிறந்தநாள் — 100+ பேர் அமரக்கூடிய குளிரூட்டப்பட்ட அரங்கு.'
                    : '100+ Seating Air-Conditioned Hall for family functions, meetings & celebrations.'}
                </Text>
              </GlassCard>
            </View>
          </View>
        </View>

        {/* ── Hall Info ─────────────────────────────────────────────────────── */}
        <View style={styles.section}>
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Users size={20} color={Palette.blue700} />
              <Text style={styles.infoValue}>100+</Text>
              <Text style={styles.infoLabel}>
                {isTamil ? 'இருக்கைகள்' : 'Seating'}
              </Text>
            </View>
            <View style={styles.infoDivider} />
            <View style={styles.infoItem}>
              <MapPin size={20} color={Palette.blue700} />
              <Text style={styles.infoValue}>
                {isTamil ? 'கலையார்கோவில்' : 'Kalayarkoil'}
              </Text>
              <Text style={styles.infoLabel}>
                {isTamil ? 'இடம்' : 'Location'}
              </Text>
            </View>
            <View style={styles.infoDivider} />
            <View style={styles.infoItem}>
              <CheckCircle size={20} color={Palette.success} />
              <Text style={[styles.infoValue, { color: Palette.success }]}>
                {isTamil ? 'கிடைக்கும்' : 'Available'}
              </Text>
              <Text style={styles.infoLabel}>
                {isTamil ? 'நிலை' : 'Status'}
              </Text>
            </View>
          </View>
        </View>

        {/* ── Perfect For ───────────────────────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {isTamil ? 'இவற்றிற்கு ஏற்றது' : 'Perfect for'}
          </Text>
          <View style={styles.eventChipsRow}>
            {EVENT_TYPES.map((type) => {
              const IconComp = type.icon;
              const isSelected = selectedEvent === type.key;
              return (
                <TouchableOpacity
                  key={type.key}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setSelectedEvent(isSelected ? null : type.key);
                  }}
                  style={[
                    styles.eventChip,
                    {
                      backgroundColor: isSelected ? Palette.blue700 : Palette.blue100,
                      borderColor: isSelected ? Palette.blue700 : Palette.blue200,
                    },
                  ]}
                >
                  <IconComp size={14} color={isSelected ? '#FFFFFF' : Palette.blue700} />
                  <Text style={[styles.eventChipText, { color: isSelected ? '#FFFFFF' : Palette.blue700 }]}>
                    {isTamil ? type.labelTa : type.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* ── Facilities ────────────────────────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {isTamil ? 'வசதிகள்' : 'Facilities'}
          </Text>
          <View style={styles.facilitiesGrid}>
            {FACILITIES.map((f, i) => (
              <View key={i} style={styles.facilityItem}>
                <CheckCircle size={14} color={Palette.blue700} />
                <Text style={styles.facilityText}>
                  {isTamil ? f.ta : f.en}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── Booking Form ──────────────────────────────────────────────────── */}
        <GlassCard style={styles.formCard}>
          <Text style={styles.formTitle}>
            {isTamil ? 'இருப்பு கோரிக்கை' : 'Request booking'}
          </Text>

          {/* Date */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>
              {isTamil ? 'நிகழ்வு தேதி *' : 'Event date *'}
            </Text>
            <View style={[styles.inputRow, { borderColor: colors.border }]}>
              <Calendar size={16} color={Palette.blue700} />
              <TextInput
                placeholder={isTamil ? 'உதா: 15 செப்டம்பர் 2025' : 'e.g. 15 September 2025'}
                placeholderTextColor={Palette.slate400}
                value={selectedDate}
                onChangeText={setSelectedDate}
                style={styles.input}
              />
            </View>
          </View>

          {/* Time */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>
              {isTamil ? 'நேரம் *' : 'Time *'}
            </Text>
            <View style={[styles.inputRow, { borderColor: colors.border }]}>
              <Clock size={16} color={Palette.blue700} />
              <TextInput
                placeholder={isTamil ? 'உதா: காலை 10:00' : 'e.g. 10:00 AM'}
                placeholderTextColor={Palette.slate400}
                value={selectedTime}
                onChangeText={setSelectedTime}
                style={styles.input}
              />
            </View>
          </View>

          {/* Guest count */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>
              {isTamil ? 'விருந்தினர் எண்ணிக்கை *' : 'Number of guests *'}
            </Text>
            <View style={styles.guestCountRow}>
              <TouchableOpacity
                onPress={() => handleGuestCount(-10)}
                style={[styles.countBtn, { borderColor: colors.border }]}
              >
                <Text style={styles.countBtnText}>−</Text>
              </TouchableOpacity>
              <View style={styles.countDisplay}>
                <Text style={styles.countValue}>{guestCount}</Text>
                <Text style={styles.countUnit}>{isTamil ? 'பேர்' : 'guests'}</Text>
              </View>
              <TouchableOpacity
                onPress={() => handleGuestCount(10)}
                style={[styles.countBtn, { borderColor: colors.border }]}
              >
                <Text style={styles.countBtnText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Contact name */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>
              {isTamil ? 'தொடர்பு பெயர் *' : 'Contact name *'}
            </Text>
            <View style={[styles.inputRow, { borderColor: colors.border }]}>
              <TextInput
                placeholder={isTamil ? 'உங்கள் பெயர்' : 'Your full name'}
                placeholderTextColor={Palette.slate400}
                value={contactName}
                onChangeText={setContactName}
                style={styles.input}
                autoCapitalize="words"
              />
            </View>
          </View>

          {/* Contact phone */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>
              {isTamil ? 'கைபேசி எண் *' : 'Mobile number *'}
            </Text>
            <View style={[styles.inputRow, { borderColor: colors.border }]}>
              <Text style={styles.phonePrefix}>+91</Text>
              <TextInput
                placeholder="10-digit mobile number"
                placeholderTextColor={Palette.slate400}
                value={contactPhone}
                onChangeText={(t) => setContactPhone(t.replace(/\D/g, '').slice(0, 10))}
                style={styles.input}
                keyboardType="phone-pad"
                maxLength={10}
              />
            </View>
          </View>

          {/* Notes */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>
              {isTamil ? 'கூடுதல் குறிப்புகள்' : 'Additional notes'}
            </Text>
            <TextInput
              placeholder={isTamil ? 'சிறப்பு தேவைகள்...' : 'Special requirements, decoration preferences...'}
              placeholderTextColor={Palette.slate400}
              value={notes}
              onChangeText={setNotes}
              style={[styles.textarea, { borderColor: colors.border }]}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          <PrimaryButton
            title={isTamil ? 'கோரிக்கை அனுப்பு' : 'Request booking'}
            onPress={handleSubmit}
            loading={isSubmitting}
            fullWidth
            size="lg"
          />

          <Text style={styles.disclaimer}>
            {isTamil
              ? 'கோரிக்கை அனுப்பிய 2 மணி நேரத்திற்குள் எங்கள் குழு தொடர்பு கொள்வார்கள்.'
              : 'Our team will contact you within 2 hours to confirm your booking.'}
          </Text>
        </GlassCard>

        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.md,
    backgroundColor: Palette.slate100,
  },
  headerTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
  },
  scrollContent: {
    paddingBottom: Spacing['6xl'],
  },
  // Hero
  heroContainer: {
    margin: Spacing.base,
    borderRadius: Radius.xl,
    overflow: 'hidden',
    ...Elevation.md,
  },
  heroImage: {
    height: 220,
    position: 'relative',
  },
  heroGradientBg: {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(15, 23, 42, 0.25)',
  },
  heroOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing.base,
  },
  heroGlassPanel: {
    borderRadius: Radius.lg,
  },
  heroTitle: {
    fontSize: FontSize['2xl'],
    fontWeight: '700',
    color: Palette.slate900,
    marginBottom: 6,
  },
  heroSubtitle: {
    fontSize: FontSize.base,
    color: Palette.slate600,
    lineHeight: FontSize.base * 1.5,
  },
  // Info row
  section: {
    paddingHorizontal: Spacing.base,
    marginBottom: Spacing.xl,
  },
  infoRow: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Palette.slate200,
    padding: Spacing.base,
    ...Elevation.sm,
  },
  infoItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  infoValue: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: Palette.slate900,
    textAlign: 'center',
  },
  infoLabel: {
    fontSize: FontSize.xs,
    color: '#475569',
    textAlign: 'center',
    fontWeight: '500',
  },
  infoDivider: {
    width: 1,
    backgroundColor: Palette.slate200,
    marginVertical: 4,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Palette.slate900,
    marginBottom: Spacing.md,
  },
  // Event chips
  eventChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  eventChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  eventChipText: {
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
  // Facilities
  facilitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  facilityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    width: '45%',
  },
  facilityText: {
    fontSize: FontSize.sm,
    color: Palette.slate700,
    fontWeight: '500',
    flex: 1,
  },
  // Form
  formCard: {
    margin: Spacing.base,
    gap: Spacing.lg,
  },
  formTitle: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Palette.slate900,
    marginBottom: 4,
  },
  fieldGroup: {
    gap: Spacing.xs,
  },
  fieldLabel: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Palette.slate700,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Palette.slate50,
    borderRadius: Radius.md,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
  },
  input: {
    flex: 1,
    fontSize: FontSize.base,
    color: Palette.slate900,
  },
  phonePrefix: {
    fontSize: FontSize.base,
    fontWeight: '600',
    color: Palette.slate600,
    marginRight: 2,
  },
  textarea: {
    backgroundColor: Palette.slate50,
    borderRadius: Radius.md,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    fontSize: FontSize.base,
    color: Palette.slate900,
    minHeight: 80,
  },
  // Guest counter
  guestCountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.base,
  },
  countBtn: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Palette.blue100,
  },
  countBtnText: {
    fontSize: FontSize.xl,
    fontWeight: '600',
    color: Palette.blue700,
  },
  countDisplay: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  countValue: {
    fontSize: FontSize['3xl'],
    fontWeight: '700',
    color: Palette.blue700,
  },
  countUnit: {
    fontSize: FontSize.sm,
    color: '#475569',
  },
  disclaimer: {
    fontSize: FontSize.xs,
    color: '#475569',
    textAlign: 'center',
    lineHeight: FontSize.xs * 1.6,
    marginTop: Spacing.xs,
  },
  // Success
  successContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing['2xl'],
    gap: Spacing.xl,
  },
  successIcon: {
    width: 100,
    height: 100,
    borderRadius: Radius.full,
    backgroundColor: Palette.blue100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successTitle: {
    fontSize: FontSize['3xl'],
    fontWeight: '700',
    color: Palette.slate900,
    textAlign: 'center',
  },
  successSubtitle: {
    fontSize: FontSize.base,
    color: '#475569',
    textAlign: 'center',
    lineHeight: FontSize.base * 1.6,
  },
  backHomeBtn: {
    backgroundColor: Palette.blue700,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: Radius.md,
    marginTop: Spacing.md,
  },
  backHomeBtnText: {
    color: '#FFFFFF',
    fontSize: FontSize.md,
    fontWeight: '700',
  },
});
