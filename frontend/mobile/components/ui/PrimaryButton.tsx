import { AppText as Text } from './AppText';
import React from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  type StyleProp,
  type ViewStyle,
  type TextStyle,
  View,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../theme/ThemeContext';
import { Radius, FontSize, Elevation, TouchTarget, Spacing } from '@ashok-raj/ui';

export interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  variant?: 'filled' | 'outline' | 'gold' | 'navy';
}

export function PrimaryButton({
  title,
  onPress,
  loading = false,
  disabled = false,
  icon,
  iconPosition = 'left',
  size = 'md',
  fullWidth = false,
  style,
  textStyle,
  variant = 'filled',
}: PrimaryButtonProps) {
  const { colors, isDark } = useTheme();

  const handlePress = () => {
    if (!disabled && !loading) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onPress();
    }
  };

  const sizeStyles = {
    sm: { paddingVertical: 8,  paddingHorizontal: 16, fontSize: FontSize.xs + 2, minHeight: TouchTarget.minHeight },
    md: { paddingVertical: 13, paddingHorizontal: 24, fontSize: FontSize.sm + 1, minHeight: 48 },
    lg: { paddingVertical: 16, paddingHorizontal: 32, fontSize: FontSize.md, minHeight: 54 },
  }[size];

  // Resolve background and text colors per variant and theme
  let bgColor = colors.primary;
  let textColor = isDark ? colors.primaryDark : '#FFFFFF';
  let borderColor = 'transparent';

  if (variant === 'gold') {
    bgColor = colors.accent;
    textColor = isDark ? colors.primaryDark : '#070C1E';
  } else if (variant === 'navy') {
    bgColor = colors.royalNavy;
    textColor = '#FFFFFF';
  } else if (variant === 'outline') {
    bgColor = 'transparent';
    borderColor = colors.borderFocus;
    textColor = colors.textPrimary;
  } else if (variant === 'filled') {
    if (isDark) {
      bgColor = colors.accent; // Champagne Gold CTA in Dark Mode
      textColor = colors.primaryDark; // Royal Navy text
    } else {
      bgColor = colors.primary; // Royal Navy in Light Mode
      textColor = '#FFFFFF';
    }
  }

  if (disabled) {
    bgColor = colors.borderStrong;
    textColor = colors.textDisabled;
    borderColor = 'transparent';
  }

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={disabled || loading}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled, busy: !!loading }}
      style={[
        styles.container,
        fullWidth && styles.fullWidth,
        disabled && styles.disabled,
        {
          backgroundColor: bgColor,
          borderColor,
          borderWidth: variant === 'outline' ? 1.5 : 0,
          paddingVertical: sizeStyles.paddingVertical,
          paddingHorizontal: sizeStyles.paddingHorizontal,
          minHeight: sizeStyles.minHeight,
        },
        !disabled && variant !== 'outline' && Elevation.sm,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textColor} size="small" />
      ) : (
        <View style={styles.row}>
          {icon && iconPosition === 'left' && icon}
          <Text
            style={[
              styles.text,
              {
                fontSize: sizeStyles.fontSize,
                color: textColor,
              },
              textStyle,
            ]}
          >
            {title}
          </Text>
          {icon && iconPosition === 'right' && icon}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.65,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  text: {
    fontWeight: '800',
    letterSpacing: 0.3,
  },
});
