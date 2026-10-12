import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  type StyleProp,
  type ViewStyle,
  type TextStyle,
  type KeyboardTypeOptions,
  type NativeSyntheticEvent,
  type TextInputFocusEventData,
} from 'react-native';
import { Eye, EyeOff, AlertCircle } from 'lucide-react-native';
import { AppText as Text } from './AppText';
import { useTheme } from '../../theme/ThemeContext';
import { useTranslation } from '../../i18n';
import { Radius, Spacing, FontSize, TouchTarget } from '@ashok-raj/ui';

export interface AppInputProps {
  label?: string;
  labelTa?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  placeholderTa?: string;
  error?: string;
  helperText?: string;
  isPassword?: boolean;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoCorrect?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  disabled?: boolean;
  required?: boolean;
  maxLength?: number;
  multiline?: boolean;
  numberOfLines?: number;
  onFocus?: (e: NativeSyntheticEvent<TextInputFocusEventData>) => void;
  onBlur?: (e: NativeSyntheticEvent<TextInputFocusEventData>) => void;
  style?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
}

export function AppInput({
  label,
  labelTa,
  value,
  onChangeText,
  placeholder,
  placeholderTa,
  error,
  helperText,
  isPassword = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
  autoCorrect = false,
  leftIcon,
  rightIcon,
  disabled = false,
  required = false,
  maxLength,
  multiline = false,
  numberOfLines = 1,
  onFocus,
  onBlur,
  style,
  inputStyle,
}: AppInputProps) {
  const { colors, isDark } = useTheme();
  const { isTamil } = useTranslation();
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(!isPassword);

  const displayLabel = isTamil && labelTa ? labelTa : label;
  const displayPlaceholder = isTamil && placeholderTa ? placeholderTa : placeholder;

  const handleFocus = (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  const borderColor = error
    ? colors.error
    : isFocused
    ? colors.accent
    : colors.border;

  return (
    <View style={[styles.container, style]}>
      {displayLabel && (
        <View style={styles.labelRow}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>
            {displayLabel}
            {required && <Text style={{ color: colors.error }}> *</Text>}
          </Text>
          {maxLength && (
            <Text style={[styles.counter, { color: colors.textTertiary }]}>
              {value.length}/{maxLength}
            </Text>
          )}
        </View>
      )}

      <View
        style={[
          styles.inputWrapper,
          {
            backgroundColor: isDark ? colors.surface : colors.surfaceElevated,
            borderColor,
            opacity: disabled ? 0.6 : 1,
          },
          multiline && { minHeight: 88, alignItems: 'flex-start' },
        ]}
      >
        {leftIcon && <View style={styles.leftIconContainer}>{leftIcon}</View>}

        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={displayPlaceholder}
          placeholderTextColor={colors.textTertiary}
          editable={!disabled}
          secureTextEntry={isPassword && !showPassword}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          maxLength={maxLength}
          multiline={multiline}
          numberOfLines={numberOfLines}
          onFocus={handleFocus}
          onBlur={handleBlur}
          style={[
            styles.textInput,
            {
              color: colors.textPrimary,
              textAlignVertical: multiline ? 'top' : 'center',
            },
            inputStyle,
          ]}
        />

        {isPassword && (
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.rightAction}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            {showPassword ? (
              <EyeOff size={18} color={colors.textSecondary} />
            ) : (
              <Eye size={18} color={colors.textSecondary} />
            )}
          </TouchableOpacity>
        )}

        {rightIcon && !isPassword && (
          <View style={styles.rightIconContainer}>{rightIcon}</View>
        )}
      </View>

      {error ? (
        <View style={styles.errorRow}>
          <AlertCircle size={14} color={colors.error} />
          <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
        </View>
      ) : helperText ? (
        <Text style={[styles.helperText, { color: colors.textTertiary }]}>
          {helperText}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
    width: '100%',
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  label: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  counter: {
    fontSize: FontSize.xs,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    minHeight: TouchTarget.minHeight + 4, // Accessible height >= 48pt
    paddingHorizontal: Spacing.md,
  },
  leftIconContainer: {
    marginRight: Spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rightIconContainer: {
    marginLeft: Spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rightAction: {
    padding: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textInput: {
    flex: 1,
    fontSize: FontSize.base,
    paddingVertical: 12,
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
    paddingHorizontal: 2,
  },
  errorText: {
    fontSize: FontSize.xs + 1,
    fontWeight: '600',
  },
  helperText: {
    fontSize: FontSize.xs,
    marginTop: 4,
    paddingHorizontal: 2,
  },
});
