import { AppText as Text } from './AppText';
import React from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  type StyleProp,
  type ViewStyle,
  type TextStyle
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../theme/ThemeContext';
import { Radius, FontSize } from '@ashok-raj/ui';

export interface SecondaryButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  variant?: 'outline' | 'ghost';
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export function SecondaryButton({
  title,
  onPress,
  loading = false,
  disabled = false,
  icon,
  iconPosition = 'left',
  size = 'md',
  fullWidth = false,
  variant = 'outline',
  style,
  textStyle,
}: SecondaryButtonProps) {
  const { colors, isDark } = useTheme();

  const handlePress = () => {
    if (!disabled && !loading) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress();
    }
  };

  const sizeStyles = {
    sm: { paddingVertical: 7, paddingHorizontal: 14, fontSize: FontSize.xs + 2 },
    md: { paddingVertical: 12, paddingHorizontal: 22, fontSize: FontSize.sm + 1 },
    lg: { paddingVertical: 16, paddingHorizontal: 28, fontSize: FontSize.md },
  }[size];

  const isOutline = variant === 'outline';

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={disabled || loading}
      activeOpacity={0.75}
      style={[
        styles.container,
        {
          paddingVertical: sizeStyles.paddingVertical,
          paddingHorizontal: sizeStyles.paddingHorizontal,
          borderWidth: isOutline ? 1 : 0,
          borderColor: isOutline ? colors.border : 'transparent',
          backgroundColor: isOutline
            ? isDark
              ? 'rgba(255,255,255,0.04)'
              : 'rgba(0,0,0,0.02)'
            : 'transparent',
        },
        fullWidth && styles.fullWidth,
        disabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={colors.textPrimary} size="small" />
      ) : (
        <>
          {icon && iconPosition === 'left' && icon}
          <Text
            style={[
              styles.text,
              {
                fontSize: sizeStyles.fontSize,
                color: disabled ? colors.textTertiary : colors.textPrimary,
              },
              textStyle,
            ]}
          >
            {title}
          </Text>
          {icon && iconPosition === 'right' && icon}
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: Radius.full,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});
