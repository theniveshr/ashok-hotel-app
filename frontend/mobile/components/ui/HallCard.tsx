import { AppText as Text } from './AppText';
import React from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  View,
  Image,
  type StyleProp,
  type ViewStyle
} from 'react-native';
import { Users, ChevronRight, CheckCircle } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Radius, Spacing, FontSize, Elevation, Palette } from '@ashok-raj/ui';

export interface HallCardProps {
  title: string;
  description: string;
  imageUrl?: string;
  seatingCapacity: number;
  eventTypes: string[];
  facilities: string[];
  isAvailable?: boolean;
  onPress: () => void;
  onCheckAvailability: () => void;
  style?: StyleProp<ViewStyle>;
}

/**
 * HallCard — event/venue card for Mini Hall feature.
 *
 * Layout:
 *   ┌──────────────────────────────┐
 *   │       Hall Image / Gradient  │
 *   ├──────────────────────────────┤
 *   │ Hall title              ████ │  ← availability badge
 *   │ Description text             │
 *   │ ● 100+ Seating               │
 *   │ [Family] [Business] [Celebr] │  ← event type chips
 *   │ [ Check availability → ]     │
 *   └──────────────────────────────┘
 */
export function HallCard({
  title,
  description,
  imageUrl,
  seatingCapacity,
  eventTypes,
  facilities,
  isAvailable = true,
  onPress,
  onCheckAvailability,
  style,
}: HallCardProps) {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  const handleCheckAvailability = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onCheckAvailability();
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.92}
      style={[styles.card, Elevation.md, style]}
      accessibilityRole="button"
      accessibilityLabel={`${title}, ${isAvailable ? 'Available' : 'Unavailable'}`}
    >
      {/* Hall Image */}
      <View style={styles.imageContainer}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="cover" />
        ) : (
          // Gradient fallback
          <View style={styles.imagePlaceholder}>
            <View style={styles.imagePlaceholderInner} />
          </View>
        )}

        {/* Availability badge */}
        <View
          style={[
            styles.availBadge,
            { backgroundColor: isAvailable ? '#DCFCE7' : '#FEE2E2' },
          ]}
        >
          <CheckCircle
            size={12}
            color={isAvailable ? '#16A34A' : '#DC2626'}
            fill={isAvailable ? '#16A34A' : '#DC2626'}
          />
          <Text style={[styles.availText, { color: isAvailable ? '#15803D' : '#B91C1C' }]}>
            {isAvailable ? 'Available' : 'Booked'}
          </Text>
        </View>
      </View>

      {/* Card body */}
      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        <Text style={styles.description} numberOfLines={2}>
          {description}
        </Text>

        {/* Seating row */}
        <View style={styles.seatingRow}>
          <Users size={14} color={Palette.blue700} />
          <Text style={styles.seatingText}>
            {seatingCapacity}+ seating capacity
          </Text>
        </View>

        {/* Event type chips */}
        <View style={styles.chipsRow}>
          {eventTypes.slice(0, 3).map((type, i) => (
            <View key={i} style={styles.chip}>
              <Text style={styles.chipText}>{type}</Text>
            </View>
          ))}
        </View>

        {/* CTA */}
        <TouchableOpacity
          onPress={handleCheckAvailability}
          activeOpacity={0.85}
          style={styles.ctaButton}
        >
          <Text style={styles.ctaText}>Check availability</Text>
          <ChevronRight size={16} color={Palette.blue700} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Palette.slate200,
  },
  imageContainer: {
    height: 180,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: Palette.blue200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePlaceholderInner: {
    width: 60,
    height: 60,
    borderRadius: Radius.full,
    backgroundColor: Palette.blue300,
    opacity: 0.5,
  },
  availBadge: {
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radius.full,
  },
  availText: {
    fontSize: FontSize.xs,
    fontWeight: '700',
  },
  body: {
    padding: Spacing.base,
    gap: Spacing.sm,
  },
  title: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Palette.slate900,
  },
  description: {
    fontSize: FontSize.base,
    color: '#475569',
    lineHeight: FontSize.base * 1.5,
  },
  seatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  seatingText: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Palette.blue700,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  chip: {
    backgroundColor: Palette.blue100,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  chipText: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    color: Palette.blue700,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: Spacing.xs,
  },
  ctaText: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: Palette.blue700,
  },
});
