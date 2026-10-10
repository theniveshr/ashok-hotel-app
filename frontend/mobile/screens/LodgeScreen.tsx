import { AppText as Text } from '../components/ui/AppText';
import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  FlatList,
  TouchableOpacity
} from 'react-native';
import { Calendar, Users, Filter } from 'lucide-react-native';
import { useTheme } from '../theme/ThemeContext';
import { useTranslation } from '../i18n';
import { Header } from '../components/ui/Header';
import { RoomCard } from '../components/ui/RoomCard';
import { Radius, Spacing, FontSize } from '@ashok-raj/ui';

export interface LodgeScreenProps {
  onBack?: () => void;
  onRoomPress: (id: string) => void;
  onBookPress: (id: string) => void;
}

export function LodgeScreen({
  onBack,
  onRoomPress,
  onBookPress,
}: LodgeScreenProps) {
  const { colors } = useTheme();
  const { t, isTamil } = useTranslation();
  const [selectedGuestFilter, setSelectedGuestFilter] = useState<number>(0); // 0 = all

  const roomTypes = [
    {
      id: 'rt-single-non-ac',
      name: 'Single Non-AC Room',
      nameTa: 'தனி நபருக்கான சாதாரண அறை',
      description: 'Clean single bedroom with comfortable bed, attached bathroom, high-speed WiFi, and 24/7 front desk support.',
      basePrice: 1000,
      maxOccupancy: 1,
      bedType: 'Single Bed',
      amenities: ['Hot Water', 'WiFi', 'Room Service'],
      amenitiesTa: ['சூடான நீர்', 'வைஃபை', 'அறை சேவை'],
      imageUrl: 'https://www.ashokrajgroups.com/images/Lodge/single-non-ac.webp',
      isAvailable: true,
    },
    {
      id: 'rt-single-ac',
      name: 'Single AC Room',
      nameTa: 'தனி நபர் குளிரூட்டி அறை',
      description: 'Cool and comfortable air-conditioned single room equipped with Smart LED TV, high-speed WiFi and attached hot water bathroom.',
      basePrice: 1300,
      maxOccupancy: 1,
      bedType: 'Single Bed',
      amenities: ['AC', 'WiFi', 'Hot Water', 'Smart TV'],
      amenitiesTa: ['குளிரூட்டி', 'வைஃபை', 'சூடான நீர்', 'ஸ்மார்ட் டிவி'],
      imageUrl: 'https://www.ashokrajgroups.com/images/Lodge/single-ac.jpg',
      isAvailable: true,
    },
    {
      id: 'rt-double-ac',
      name: 'Double Bed AC Room',
      nameTa: 'இரட்டை படுக்கை குளிரூட்டி அறை',
      description: 'Spacious master bedroom with plush double bed, attached modern bathroom, Smart LED TV, high-speed WiFi and 24/7 room service.',
      basePrice: 2000,
      maxOccupancy: 2,
      bedType: 'Double Bed',
      amenities: ['AC', 'Smart TV', 'WiFi', 'Hot Water', 'Room Service'],
      amenitiesTa: ['குளிரூட்டி', 'ஸ்மார்ட் டிவி', 'வைஃபை', 'சூடான நீர்', 'அறை சேவை'],
      imageUrl: 'https://www.ashokrajgroups.com/images/Lodge/double-bed-ac.webp',
      isAvailable: true,
    },
    {
      id: 'rt-six-bed-suite',
      name: 'Six Bed Family AC Suite',
      nameTa: 'ஆறு படுக்கை குடும்ப குளிரூட்டி சூட்',
      description: 'Large luxury family suite accommodating up to 6 guests with multiple beds, living area, Smart TV and 24/7 room service.',
      basePrice: 4000,
      maxOccupancy: 6,
      bedType: '6 Multi Beds',
      amenities: ['AC', 'Living Area', 'Smart TV', 'WiFi', 'Hot Water', 'Room Service'],
      amenitiesTa: ['குளிரூட்டி', 'வரவேற்பறை', 'ஸ்மார்ட் டிவி', 'வைஃபை', 'சூடான நீர்', 'அறை சேவை'],
      imageUrl: 'https://www.ashokrajgroups.com/images/Lodge/six-bed-ac.webp',
      isAvailable: true,
    },
  ];

  const filteredRooms = selectedGuestFilter > 0
    ? roomTypes.filter((r) => r.maxOccupancy >= selectedGuestFilter)
    : roomTypes;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        showBack={Boolean(onBack)}
        onBackPress={onBack}
        title={t('lodge.lodge')}
        subtitle={isTamil ? 'குளிரூட்டி தங்குமிடம் & முன்பதிவு' : 'AC Accommodation & Booking'}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Quick Date Range & Guests Bar */}
        <View
          style={[
            styles.dateBar,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          <View style={styles.dateCol}>
            <View style={styles.dateHeaderRow}>
              <Calendar size={14} color={colors.accent} />
              <Text style={[styles.dateLabel, { color: colors.textTertiary }]}>
                {t('lodge.checkIn')}
              </Text>
            </View>
            <Text style={[styles.dateVal, { color: colors.textPrimary }]}>
              {isTamil ? 'இன்று' : 'Today'}, 14:00
            </Text>
          </View>

          <View style={[styles.dateDivider, { backgroundColor: colors.border }]} />

          <View style={styles.dateCol}>
            <View style={styles.dateHeaderRow}>
              <Calendar size={14} color={colors.accent} />
              <Text style={[styles.dateLabel, { color: colors.textTertiary }]}>
                {t('lodge.checkOut')}
              </Text>
            </View>
            <Text style={[styles.dateVal, { color: colors.textPrimary }]}>
              {isTamil ? 'நாளை' : 'Tomorrow'}, 11:00
            </Text>
          </View>
        </View>

        {/* Guest Filter Pills */}
        <View style={styles.filterRow}>
          {[
            { count: 0, label: isTamil ? 'அனைத்து அறைகளும்' : 'All Rooms' },
            { count: 2, label: isTamil ? '2 விருந்தினர்கள்' : '2 Guests' },
            { count: 3, label: isTamil ? '3 விருந்தினர்கள்' : '3 Guests' },
            { count: 4, label: isTamil ? '4+ குடும்பம்' : '4+ Family' },
          ].map((gf) => {
            const isSelected = selectedGuestFilter === gf.count;
            return (
              <TouchableOpacity
                key={gf.count}
                onPress={() => setSelectedGuestFilter(gf.count)}
                style={[
                  styles.filterPill,
                  {
                    backgroundColor: isSelected ? colors.accent : colors.surface,
                    borderColor: isSelected ? colors.accent : colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.filterPillText,
                    { color: isSelected ? '#FFFFFF' : colors.textSecondary },
                  ]}
                >
                  {gf.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Room Catalog List */}
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
          {t('lodge.availableRooms')} ({filteredRooms.length})
        </Text>

        {filteredRooms.map((room) => (
          <RoomCard
            key={room.id}
            id={room.id}
            name={room.name}
            nameTa={room.nameTa}
            description={room.description}
            basePrice={room.basePrice}
            maxOccupancy={room.maxOccupancy}
            bedType={room.bedType}
            amenities={room.amenities}
            amenitiesTa={room.amenitiesTa}
            isAvailable={room.isAvailable}
            onPress={() => onRoomPress(room.id)}
            onBookPress={() => onBookPress(room.id)}
          />
        ))}
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
  dateBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  dateCol: {
    flex: 1,
  },
  dateHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  dateLabel: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  dateVal: {
    fontSize: FontSize.sm + 1,
    fontWeight: '700',
  },
  dateDivider: {
    width: 1,
    height: 32,
    marginHorizontal: Spacing.md,
  },
  sectionTitle: {
    fontSize: FontSize.sm + 1,
    fontWeight: '700',
    marginBottom: Spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginBottom: Spacing.lg,
  },
  filterPill: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  filterPillText: {
    fontSize: FontSize.xs,
    fontWeight: '700',
  },
});
