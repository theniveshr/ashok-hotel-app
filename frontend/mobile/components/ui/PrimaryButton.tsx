import { AppText as Text } from './AppText';
import React from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  type StyleProp,
  type ViewStyle,
  type TextStyle,
  View
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Radius, Spacing, FontSize, Elevation, Palette } from '@ashok-raj/ui';

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
  variant?: 'filled' | 'outline';
}

/**
 * PrimaryButton — Cobalt blue filled CTA.
 * Background: #2563EB, Text: white. No gold/navy gradient.
 */
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
  const handlePress = () => {
    if (!disabled && !loading) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onPress();
    }
  };

  const sizeStyles = {
    sm: { paddingVertical: 8,  paddingHorizontal: 16, fontSize: FontSize.xs + 2 },
    md: { paddingVertical: 14, paddingHorizontal: 24, fontSize: FontSize.sm + 1 },
    lg: { paddingVertical: 18, paddingHorizontal: 32, fontSize: FontSize.md },
  }[size];

  const isFilled = variant === 'filled';

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={disabled || loading}
      activeOpacity={0.85}
      style={[
        styles.container,
        fullWidth && styles.fullWidth,
        disabled && styles.disabled,
        {
          backgroundColor: disabled
            ? Palette.slate300
            : isFilled ? Palette.blue700 : 'transparent',
          borderColor: disabled ? Palette.slate300 : Palette.blue700,
          borderWidth: isFilled ? 0 : 1.5,
          paddingVertical: sizeStyles.paddingVertical,
          paddingHorizontal: sizeStyles.paddingHorizontal,
        },
        Elevation.sm,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={isFilled ? '#FFFFFF' : Palette.blue700} size="small" />
      ) : (
        <View style={styles.row}>
          {icon && iconPosition === 'left' && icon}
          <Text
            style={[
              styles.text,
              {
                fontSize: sizeStyles.fontSize,
                color: disabled
                  ? Palette.slate500
                  : isFilled ? '#FFFFFF' : Palette.blue700,
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
    borderRadius: Radius.md,
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
    gap: 8,
  },
  text: {
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
