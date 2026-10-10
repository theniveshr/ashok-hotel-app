import React from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../theme/ThemeContext';
import { Radius, Elevation } from '@ashok-raj/ui';

export interface IconButtonProps {
  icon: React.ReactNode;
  onPress: () => void;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'glass' | 'filled' | 'ghost';
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  badgeCount?: number;
}

export function IconButton({
  icon,
  onPress,
  size = 'md',
  variant = 'glass',
  disabled = false,
  style,
  badgeCount,
}: IconButtonProps) {
  const { colors, isDark } = useTheme();

  const handlePress = () => {
    if (!disabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress();
    }
  };

  const dimensions = {
    sm: 36,
    md: 44,
    lg: 52,
  }[size];

  const getBackground = () => {
    switch (variant) {
      case 'filled':
        return colors.surfaceElevated;
      case 'ghost':
        return 'transparent';
      case 'glass':
      default:
        return isDark ? 'rgba(17, 29, 56, 0.7)' : 'rgba(255, 255, 255, 0.85)';
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={disabled}
      activeOpacity={0.7}
      style={[
        styles.button,
        {
          width: dimensions,
          height: dimensions,
          backgroundColor: getBackground(),
          borderColor: variant === 'ghost' ? 'transparent' : colors.border,
          borderWidth: variant === 'ghost' ? 0 : 1,
        },
        variant !== 'ghost' && Elevation.xs,
        disabled && styles.disabled,
        style,
      ]}
    >
      {icon}
      {badgeCount !== undefined && badgeCount > 0 && (
        <View style={[styles.badge, { backgroundColor: colors.accent }]}>
          <View style={styles.badgeDot} />
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: Radius.full,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  disabled: {
    opacity: 0.5,
  },
  badge: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 10,
    height: 10,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#0A0F1E',
  },
});
