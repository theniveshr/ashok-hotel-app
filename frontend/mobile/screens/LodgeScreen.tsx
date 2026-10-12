import { AppText as Text } from '../components/ui/AppText';
import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import {
  Calendar,
  Users,
  Search,
  Wind,
  Snowflake,
  Sparkles,
  RefreshCw,
  Bed,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react-native';
import { useTheme } from '../theme/ThemeContext';
import { useTranslation } from '../i18n';
import { Header } from '../components/ui/Header';
import { RoomCard } from '../components/ui/RoomCard';
import { Radius, Spacing, FontSize, Palette } from '@ashok-raj/ui';
import { LODGE } from '@ashok-raj/config';
import { apiFetch } from '../config/api';

export interface LodgeScreenProps {
  onBack?: () => void;
  onRoomPress: (id: string) => void;
  onBookPress: (id: string) => void;
}

interface RoomTypeItem {
  id: string;
  name: string;
  nameTa: string;
  description: string;
  basePrice: number;
  weekendPrice?: number;
  maxOccupancy: number;
  bedType: string;
  imageUrls: string[];
  amenities: string[];
  amenitiesTa: string[];
  isActive?: boolean;
}

export function LodgeScreen({
  onBack,
  onRoomPress,
  onBookPress,
}: LodgeScreenProps) {
  const { colors } = useTheme();
  const { t, isTamil } = useTranslation();

  const [rooms, setRooms] = useState<RoomTypeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [selectedGuestFilter, setSelectedGuestFilter] = useState<number>(0); // 0 = all
  const [acFilter, setAcFilter] = useState<'ALL' | 'AC' | 'NON_AC'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Live room types fetch
  const fetchRoomTypes = useCallback(async () => {
    try {
      setError(null);
      const res = await apiFetch('/api/v1/lodge/room-types', { timeoutMs: 8000 });
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setRooms(json.data);
          return;
        }
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch rooms');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchRoomTypes();
  }, [fetchRoomTypes]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchRoomTypes();
  }, [fetchRoomTypes]);

  // Filtering logic
  const filteredRooms = rooms.filter((r) => {
    // Guest capacity filter
    if (selectedGuestFilter > 0 && r.maxOccupancy < selectedGuestFilter) {
      return false;
    }
    // AC filter
    const isAc = r.name.toLowerCase().includes('ac') && !r.name.toLowerCase().includes('non-ac');
    if (acFilter === 'AC' && !isAc) return false;
    if (acFilter === 'NON_AC' && isAc) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = r.name.toLowerCase().includes(q) || r.nameTa.toLowerCase().includes(q);
      const matchDesc = r.description.toLowerCase().includes(q);
      const matchBed = r.bedType.toLowerCase().includes(q);
      if (!matchName && !matchDesc && !matchBed) return false;
    }

    return true;
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        showBack={Boolean(onBack)}
        onBackPress={onBack}
        title={t('lodge.lodge')}
        subtitle={isTamil ? 'குளிரூட்டி தங்குமிடம் & முன்பதிவு' : 'AC Accommodation & Booking'}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.accent}
            colors={[colors.accent]}
          />
        }
      >
        {/* Quick Date Range & Check-in Info */}
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

        {/* Search Bar */}
        <View
          style={[
            styles.searchContainer,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          <Search size={18} color={colors.textTertiary} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder={isTamil ? 'அறை தேடவும் (எ.கா: Double Bed, AC)...' : 'Search rooms (e.g., Double Bed, AC)...'}
            placeholderTextColor={colors.textTertiary}
            style={[styles.searchInput, { color: colors.textPrimary }]}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Text style={[styles.clearBtn, { color: colors.textTertiary }]}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* AC / Non-AC Segment Filter */}
        <View style={styles.segmentContainer}>
          {[
            { key: 'ALL', label: isTamil ? 'அனைத்தும்' : 'All Types', icon: Bed },
            { key: 'AC', label: isTamil ? 'ஏ/சி மட்டும்' : 'AC Only', icon: Snowflake },
            { key: 'NON_AC', label: isTamil ? 'சாதாரண அறை' : 'Non-AC', icon: Wind },
          ].map((item) => {
            const isSelected = acFilter === item.key;
            const IconComp = item.icon;
            return (
              <TouchableOpacity
                key={item.key}
                onPress={() => setAcFilter(item.key as any)}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel={item.label}
                style={[
                  styles.segmentBtn,
                  {
                    backgroundColor: isSelected ? colors.accent : colors.surface,
                    borderColor: isSelected ? colors.accent : colors.border,
                  },
                ]}
              >
                <IconComp
                  size={14}
                  color={isSelected ? '#FFFFFF' : colors.textSecondary}
                />
                <Text
                  style={[
                    styles.segmentBtnText,
                    { color: isSelected ? '#FFFFFF' : colors.textSecondary },
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Guest Filter Pills */}
        <View style={styles.filterRow}>
          {[
            { count: 0, label: isTamil ? 'அனைத்து கொள்ளளவு' : 'Any Guests' },
            { count: 1, label: isTamil ? '1 நபர்' : '1 Guest' },
            { count: 2, label: isTamil ? '2 நபர்கள்' : '2 Guests' },
            { count: 4, label: isTamil ? '4+ குடும்பம்' : '4+ Family' },
            { count: 6, label: isTamil ? '6+ சூட்' : '6+ Suite' },
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

        {/* Loading Indicator */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.accent} />
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
              {isTamil ? 'அறைகள் விவரங்கள் ஏற்றப்படுகிறது...' : 'Loading available rooms...'}
            </Text>
          </View>
        ) : filteredRooms.length === 0 ? (
          /* Empty State */
          <View style={[styles.emptyContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <AlertCircle size={44} color={colors.textTertiary} />
            <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
              {isTamil ? 'அறைகள் எதுவும் பொருந்தவில்லை' : 'No Rooms Found'}
            </Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
              {isTamil
                ? 'உங்கள் வடிப்பான்களை மாற்றவும் அல்லது தேடலை அழிக்கவும்.'
                : 'Try adjusting your guest capacity, AC filter, or search term.'}
            </Text>
            <TouchableOpacity
              onPress={() => {
                setSelectedGuestFilter(0);
                setAcFilter('ALL');
                setSearchQuery('');
              }}
              style={[styles.resetBtn, { backgroundColor: colors.accent }]}
            >
              <Text style={styles.resetBtnText}>
                {isTamil ? 'வடிப்பான்களை மீட்டமைக்கவும்' : 'Reset Filters'}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          /* Room Catalog List */
          <>
            <View style={styles.catalogHeader}>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                {t('lodge.availableRooms')} ({filteredRooms.length})
              </Text>
              <Text style={[styles.catalogSub, { color: colors.accent }]}>
                {isTamil ? '24/7 செக்-இன் கிடைக்கும்' : '24/7 Front Desk Support'}
              </Text>
            </View>

            {filteredRooms.map((room) => {
              const isAc = room.name.toLowerCase().includes('ac') && !room.name.toLowerCase().includes('non-ac');
              return (
                <RoomCard
                  key={room.id}
                  id={room.id}
                  name={room.name}
                  nameTa={room.nameTa}
                  description={room.description}
                  basePrice={room.basePrice}
                  maxOccupancy={room.maxOccupancy}
                  bedType={room.bedType}
                  isAc={isAc}
                  imageUrl={room.imageUrls?.[0]}
                  amenities={room.amenities}
                  amenitiesTa={room.amenitiesTa}
                  isAvailable={true}
                  onPress={() => onRoomPress(room.id)}
                  onBookPress={() => onBookPress(room.id)}
                />
              );
            })}
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
    marginBottom: Spacing.md,
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.lg,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    height: 44,
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: FontSize.sm,
    paddingVertical: 0,
  },
  clearBtn: {
    fontSize: FontSize.base,
    paddingHorizontal: Spacing.xs,
  },
  segmentContainer: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  segmentBtn: {
    flex: 1,
    flexDirection: 'row',
    gap: 6,
    minHeight: 44,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.xs,
    borderRadius: Radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentBtnText: {
    fontSize: FontSize.xs,
    fontWeight: '700',
  },
  catalogHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: FontSize.sm + 1,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  catalogSub: {
    fontSize: FontSize.xs,
    fontWeight: '600',
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
  loadingContainer: {
    paddingVertical: Spacing['3xl'],
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  loadingText: {
    fontSize: FontSize.sm,
  },
  emptyContainer: {
    borderRadius: Radius.xl,
    borderWidth: 1,
    padding: Spacing['2xl'],
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  emptyTitle: {
    fontSize: FontSize.base,
    fontWeight: '700',
    marginTop: Spacing.xs,
  },
  emptySubtitle: {
    fontSize: FontSize.sm,
    textAlign: 'center',
    paddingHorizontal: Spacing.md,
  },
  resetBtn: {
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
  },
  resetBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: FontSize.sm,
  },
});
