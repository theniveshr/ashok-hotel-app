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
import { useTheme } from '../../theme/ThemeContext';
import { Radius, Spacing, FontSize, Elevation } from '@ashok-raj/ui';

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
  const { colors, isDark } = useTheme();

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
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
        Elevation.md,
        style,
      ]}
      accessibilityRole="button"
      accessibilityLabel={`${title}, ${isAvailable ? 'Available' : 'Unavailable'}`}
    >
      {/* Hall Image */}
      <View style={styles.imageContainer}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="cover" />
        ) : (
          <View
            style={[
              styles.imagePlaceholder,
              { backgroundColor: '#F1F5F9' },
            ]}
          >
            <View
              style={[
                styles.imagePlaceholderInner,
                { backgroundColor: '#E2E8F0' },
              ]}
            />
          </View>
        )}

        {/* Availability badge */}
        <View
          style={[
            styles.availBadge,
            {
              backgroundColor: isAvailable ? '#DCFCE7' : '#FEE2E2',
            },
          ]}
        >
          <CheckCircle
            size={12}
            color={isAvailable ? '#16A34A' : '#DC2626'}
            fill={isAvailable ? '#16A34A' : '#DC2626'}
          />
          <Text
            style={[
              styles.availText,
              { color: isAvailable ? (isDark ? '#34D399' : '#15803D') : (isDark ? '#F87171' : '#B91C1C') },
            ]}
          >
            {isAvailable ? 'Available' : 'Booked'}
          </Text>
        </View>
      </View>

      {/* Card body */}
      <View style={styles.body}>
        <Text style={[styles.title, { color: colors.textPrimary }]} numberOfLines={1}>
          {title}
        </Text>
        <Text style={[styles.description, { color: colors.textSecondary }]} numberOfLines={2}>
          {description}
        </Text>

        {/* Seating row */}
        <View style={styles.seatingRow}>
          <Users size={14} color={colors.accent} />
          <Text style={[styles.seatingText, { color: colors.accent }]}>
            {seatingCapacity}+ seating capacity
          </Text>
        </View>

        {/* Event type chips */}
        <View style={styles.chipsRow}>
          {eventTypes.slice(0, 3).map((type, i) => (
            <View
              key={i}
              style={[
                styles.chip,
                {
                  backgroundColor: colors.surfaceElevated,
                  borderColor: colors.border,
                },
              ]}
            >
              <Text style={[styles.chipText, { color: colors.textSecondary }]}>
                {type}
              </Text>
            </View>
          ))}
        </View>

        {/* CTA */}
        <TouchableOpacity
          onPress={handleCheckAvailability}
          activeOpacity={0.85}
          style={styles.ctaButton}
          accessibilityRole="button"
          accessibilityLabel={`Check availability for ${title}`}
        >
          <Text style={[styles.ctaText, { color: colors.accent }]}>Check availability</Text>
          <ChevronRight size={16} color={colors.accent} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.xl,
    overflow: 'hidden',
    borderWidth: 1,
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePlaceholderInner: {
    width: 60,
    height: 60,
    borderRadius: Radius.full,
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
  },
  description: {
    fontSize: FontSize.base,
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
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  chipText: {
    fontSize: FontSize.xs,
    fontWeight: '600',
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    minHeight: 44,
    marginTop: Spacing.xs,
  },
  ctaText: {
    fontSize: FontSize.sm,
    fontWeight: '700',
  },
});
