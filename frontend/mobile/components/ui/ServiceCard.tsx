import { AppText as Text } from './AppText';
import React from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  View,
  type StyleProp,
  type ViewStyle
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Radius, Spacing, FontSize, Elevation, Palette } from '@ashok-raj/ui';

export interface ServiceCardProps {
  icon: React.ReactNode;
  name: string;
  description: string;
  onPress: () => void;
  tintColor?: string;   // Icon background tint — defaults to soft blue
  style?: StyleProp<ViewStyle>;
}

/**
 * ServiceCard — horizontally scrollable service tile for the Home screen.
 * Each card represents one of the 5 Ashok Raj Groups divisions.
 *
 * Layout:
 *   ┌───────────────┐
 *   │  [Icon bg]    │
 *   │   Icon        │
 *   │ Service name  │
 *   │ Description   │
 *   └───────────────┘
 */
export function ServiceCard({
  icon,
  name,
  description,
  onPress,
  tintColor = Palette.blue200,
  style,
}: ServiceCardProps) {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.82}
      style={[styles.card, Elevation.sm, style]}
      accessibilityRole="button"
      accessibilityLabel={name}
    >
      {/* Tinted icon container */}
      <View style={[styles.iconBg, { backgroundColor: tintColor }]}>
        {icon}
      </View>

      <Text style={styles.name} numberOfLines={1}>
        {name}
      </Text>
      <Text style={styles.description} numberOfLines={2}>
        {description}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 104,
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.xl,
    padding: Spacing.md,
    alignItems: 'center',
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: Palette.slate200,
    // Subtle press animation via activeOpacity
  },
  iconBg: {
    width: 52,
    height: 52,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    fontSize: FontSize.sm,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    letterSpacing: 0.1,
  },
  description: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
    textAlign: 'center',
    lineHeight: FontSize.xs * 1.5,
  },
});
