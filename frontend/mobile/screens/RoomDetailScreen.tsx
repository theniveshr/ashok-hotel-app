import { AppText as Text } from '../components/ui/AppText';
import React from 'react';
import {
  Image,
  StyleSheet,
  View,
  ScrollView
} from 'react-native';
import { Bed, Users, Wifi, Tv, Wind, Coffee, Shield, Sparkles } from 'lucide-react-native';
import { useTheme } from '../theme/ThemeContext';
import { useTranslation } from '../i18n';
import { Header } from '../components/ui/Header';
import { PrimaryButton } from '../components/ui/PrimaryButton';
import { Radius, Spacing, FontSize, Palette } from '@ashok-raj/ui';
import { proxyImageUrl } from '../utils/foodImageResolver';

export interface RoomDetailScreenProps {
  id?: string;
  onBack: () => void;
  onBookNow: () => void;
}

export function RoomDetailScreen({
  id = 'rt-deluxe-ac',
  onBack,
  onBookNow,
}: RoomDetailScreenProps) {
  const { colors } = useTheme();
  const { t, isTamil } = useTranslation();

  const room = {
    'rt-single-non-ac': {
      name: 'Single Non-AC Room', nameTa: 'தனி நபருக்கான சாதாரண அறை', price: 650, guests: 1, bed: 'Single Bed', image: 'https://www.ashokrajgroups.com/images/Lodge/single-non-ac.webp',
      description: 'A clean, budget-friendly single room with a comfortable bed, attached bathroom, high-speed WiFi and 24/7 front desk support.',
    },
    'rt-single-ac': {
      name: 'Single AC Room', nameTa: 'தனி நபர் குளிரூட்டி அறை', price: 950, guests: 1, bed: 'Single Bed', image: 'https://www.ashokrajgroups.com/images/Lodge/single-ac.jpg',
      description: 'Cool and comfortable air-conditioned single room equipped with Smart LED TV, high-speed WiFi and attached hot water bathroom.',
    },
    'rt-double-ac': {
      name: 'Double Bed AC Room', nameTa: 'இரட்டை படுக்கை குளிரூட்டி அறை', price: 1400, guests: 2, bed: 'Double Bed', image: 'https://www.ashokrajgroups.com/images/Lodge/double-bed-ac.webp',
      description: 'Spacious master bedroom with plush double bed, attached modern bathroom, Smart LED TV, high-speed WiFi and 24/7 room service.',
    },
    'rt-six-bed-suite': {
      name: 'Six Bed Family AC Suite', nameTa: 'ஆறு படுக்கை குடும்ப குளிரூட்டி சூட்', price: 2800, guests: 6, bed: '6 Multi Beds', image: 'https://www.ashokrajgroups.com/images/Lodge/six-bed-ac.webp',
      description: 'A large luxury family suite for up to six guests with multiple beds, living area, Smart TV and 24/7 room service.',
    },
    // Backwards-compatible aliases
    'rt-standard-ac': {
      name: 'Single AC Room', nameTa: 'தனி நபர் குளிரூட்டி அறை', price: 950, guests: 1, bed: 'Single Bed', image: 'https://www.ashokrajgroups.com/images/Lodge/single-ac.jpg',
      description: 'Cool and comfortable air-conditioned single room equipped with Smart LED TV, high-speed WiFi and attached hot water bathroom.',
    },
    'rt-deluxe-ac': {
      name: 'Double Bed AC Room', nameTa: 'இரட்டை படுக்கை குளிரூட்டி அறை', price: 1400, guests: 2, bed: 'Double Bed', image: 'https://www.ashokrajgroups.com/images/Lodge/double-bed-ac.webp',
      description: 'Spacious master bedroom with plush double bed, attached modern bathroom, Smart LED TV, high-speed WiFi and 24/7 room service.',
    },
    'rt-family-suite': {
      name: 'Six Bed Family AC Suite', nameTa: 'ஆறு படுக்கை குடும்ப குளிரூட்டி சூட்', price: 2800, guests: 6, bed: '6 Multi Beds', image: 'https://www.ashokrajgroups.com/images/Lodge/six-bed-ac.webp',
      description: 'A large luxury family suite for up to six guests with multiple beds, living area, Smart TV and 24/7 room service.',
    },
  } as const;

  const selectedRoom = room[id as keyof typeof room] ?? room['rt-double-ac'];

  const amenities = [
    { icon: Wind, label: 'Air Conditioning', labelTa: 'குளிரூட்டி (A/C)' },
    { icon: Wifi, label: 'High-Speed WiFi', labelTa: 'இலவச வைஃபை' },
    { icon: Tv, label: 'LED Smart TV', labelTa: 'LED தொலைக்காட்சி' },
    { icon: Coffee, label: 'Room Service', labelTa: '24/7 அறை சேவை' },
    { icon: Bed, label: selectedRoom.bed, labelTa: 'பெரிய கட்டில்' },
    { icon: Shield, label: 'Daily Sanitized', labelTa: 'தினசரி சுத்தம்' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        showBack
        onBackPress={onBack}
        title={t('lodge.roomDetails')}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Large Room Photography Frame */}
        <View style={[styles.photoFrame, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
          <Image source={{ uri: proxyImageUrl(selectedRoom.image) }} style={styles.photo} resizeMode="cover" />
          <View style={styles.photoOverlay} />
          <View style={styles.photoCaption}>
            <Sparkles size={16} color={Palette.white} />
            <Text style={styles.photoText}>{isTamil ? 'பிரீமியம் அறை' : 'Premium room'}</Text>
          </View>
        </View>

        {/* Room Header */}
        <View style={styles.headerSection}>
          <Text style={[styles.title, { color: colors.textPrimary }]}>
            {isTamil ? selectedRoom.nameTa : selectedRoom.name}
          </Text>
          <View style={styles.priceRow}>
            <Text style={[styles.price, { color: colors.accent }]}>
              ₹{selectedRoom.price.toLocaleString()}
            </Text>
            <Text style={[styles.perNight, { color: colors.textTertiary }]}>
              / {t('lodge.perNight')}
            </Text>
          </View>
        </View>

        {/* Meta Info */}
        <View style={styles.metaRow}>
          <View style={[styles.metaBadge, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
            <Users size={14} color={colors.textSecondary} />
            <Text style={[styles.metaBadgeText, { color: colors.textSecondary }]}>
              {t('lodge.maxOccupancy', { count: selectedRoom.guests })}
            </Text>
          </View>
          <View style={[styles.metaBadge, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
            <Bed size={14} color={colors.textSecondary} />
            <Text style={[styles.metaBadgeText, { color: colors.textSecondary }]}>
              {selectedRoom.bed}
            </Text>
          </View>
        </View>

        {/* Description */}
        <Text style={[styles.description, { color: colors.textSecondary }]}>
          {isTamil ? `${selectedRoom.nameTa}. குளிர்சாதன வசதி, சூடான நீர், உயர் வேக இணையம் மற்றும் 24 மணி நேர அறை சேவையுடன் கூடிய சௌகரியமான தங்குமிடம்.` : selectedRoom.description}
        </Text>

        {/* Amenities Grid */}
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
          {t('lodge.amenities')}
        </Text>
        <View style={styles.amenitiesGrid}>
          {amenities.map((item, i) => {
            const IconComp = item.icon;
            return (
              <View
                key={i}
                style={[
                  styles.amenityBox,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  },
                ]}
              >
                <IconComp size={20} color={colors.accent} />
                <Text style={[styles.amenityLabel, { color: colors.textPrimary }]}>
                  {isTamil ? item.labelTa : item.label}
                </Text>
              </View>
            );
          })}
        </View>

        {/* Check-in / Check-out Policies */}
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
          {t('lodge.policies')}
        </Text>
        <View
          style={[
            styles.policiesCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          <Text style={[styles.policyText, { color: colors.textSecondary }]}>
            • {t('lodge.checkInTime', { time: '14:00 (2:00 PM)' })}
          </Text>
          <Text style={[styles.policyText, { color: colors.textSecondary }]}>
            • {t('lodge.checkOutTime', { time: '11:00 (11:00 AM)' })}
          </Text>
          <Text style={[styles.policyText, { color: colors.textSecondary }]}>
            • {t('lodge.freeCancellation', { hours: 24 })}
          </Text>
        </View>
      </ScrollView>

      {/* Book CTA */}
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
          <Text style={[styles.ctaLabel, { color: colors.textTertiary }]}>
            {isTamil ? 'மொத்த கட்டணம்' : 'Total Price'}
          </Text>
          <Text style={[styles.ctaPrice, { color: colors.accent }]}>
            ₹{selectedRoom.price.toLocaleString()} + GST
          </Text>
        </View>

        <PrimaryButton
          title={t('lodge.confirmBooking')}
          onPress={onBookNow}
          style={styles.bookBtn}
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
  photoFrame: {
    height: 200,
    borderRadius: Radius.xl,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
    gap: 8,
  },
  photo: { width: '100%', height: '100%', borderRadius: Radius.xl },
  photoOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(15,23,42,0.18)', borderRadius: Radius.xl },
  photoCaption: { position: 'absolute', left: 14, bottom: 14, flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 7, borderRadius: Radius.full, backgroundColor: 'rgba(15,23,42,0.58)' },
  photoText: { fontSize: FontSize.sm, fontWeight: '700', color: Palette.white },
  headerSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.xs,
  },
  title: {
    flex: 1,
    fontSize: FontSize.xl,
    fontWeight: '800',
    paddingRight: Spacing.sm,
  },
  priceRow: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: FontSize['2xl'],
    fontWeight: '800',
  },
  perNight: {
    fontSize: 10,
  },
  metaRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  metaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  metaBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  description: {
    fontSize: FontSize.sm + 1,
    lineHeight: 22,
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: FontSize.md,
    fontWeight: '700',
    marginBottom: Spacing.sm,
  },
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  amenityBox: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  amenityLabel: {
    fontSize: FontSize.xs + 1,
    fontWeight: '600',
    flex: 1,
  },
  policiesCard: {
    padding: Spacing.base,
    borderRadius: Radius.lg,
    borderWidth: 1,
    gap: 6,
  },
  policyText: {
    fontSize: FontSize.sm,
    lineHeight: 20,
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.base,
    borderTopWidth: 1,
  },
  ctaLabel: {
    fontSize: 11,
    textTransform: 'uppercase',
  },
  ctaPrice: {
    fontSize: FontSize.lg,
    fontWeight: '800',
  },
  bookBtn: {
    minWidth: 160,
  },
});
