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
import { Radius, Elevation, FontSize, Palette } from '@ashok-raj/ui';

export interface FloatingActionButtonProps {
  icon: React.ReactNode;
  label?: string;
  badgeCount?: number;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
}

/**
 * FloatingActionButton — Blue filled FAB (cart, quick action).
 * Removed gold/navy LinearGradient — solid cobalt blue.
 */
export function FloatingActionButton({
  icon,
  label,
  badgeCount,
  onPress,
  style,
}: FloatingActionButtonProps) {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.85}
      style={[styles.container, Elevation.lg, style]}
    >
      <View style={[styles.inner, label ? styles.extended : styles.circular]}>
        <View style={styles.iconWrap}>
          {icon}
          {badgeCount !== undefined && badgeCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {badgeCount > 99 ? '99+' : badgeCount}
              </Text>
            </View>
          )}
        </View>

        {label && (
          <Text style={styles.label}>{label}</Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 18,
    right: 18,
    borderRadius: Radius.full,
    zIndex: 99,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.full,
    backgroundColor: '#2563EB',
  },
  circular: {
    width: 52,
    height: 52,
  },
  extended: {
    paddingHorizontal: 16,
    height: 46,
    gap: 8,
  },
  iconWrap: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    position: 'absolute',
    top: -7,
    right: -9,
    backgroundColor: '#EF4444',
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
    textAlign: 'center',
  },
  label: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
});
