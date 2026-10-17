import React from 'react';
import {
  StyleSheet,
  View,
  Modal as RNModal,
  Pressable,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { AlertTriangle, Info, CheckCircle2 } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { AppText as Text } from './AppText';
import { useTheme } from '../../theme/ThemeContext';
import { Radius, Spacing, FontSize, TouchTarget } from '@ashok-raj/ui';

export interface ConfirmDialogProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'gold' | 'info';
  icon?: React.ReactNode;
  loading?: boolean;
}

export function ConfirmDialog({
  visible,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'gold',
  icon,
  loading = false,
}: ConfirmDialogProps) {
  const { colors, isDark } = useTheme();

  const handleConfirm = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onConfirm();
  };

  const handleCancel = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
  };

  const getAccentColor = () => {
    switch (variant) {
      case 'danger':
        return colors.error;
      case 'info':
        return colors.info;
      case 'gold':
      default:
        return colors.accent;
    }
  };

  const accentColor = getAccentColor();

  return (
    <RNModal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />

        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          {/* Icon Header */}
          <View
            style={[
              styles.iconWrapper,
              {
                backgroundColor:
                  variant === 'danger'
                    ? colors.errorBg
                    : variant === 'info'
                    ? colors.infoBg
                    : 'rgba(37, 99, 235, 0.12)',
                borderColor: accentColor,
              },
            ]}
          >
            {icon ? (
              icon
            ) : variant === 'danger' ? (
              <AlertTriangle size={24} color={colors.error} />
            ) : variant === 'info' ? (
              <Info size={24} color={colors.info} />
            ) : (
              <CheckCircle2 size={24} color={colors.accent} />
            )}
          </View>

          <Text style={[styles.title, { color: colors.textPrimary }]}>
            {title}
          </Text>

          <Text style={[styles.message, { color: colors.textSecondary }]}>
            {message}
          </Text>

          {/* Action Buttons */}
          <View style={styles.buttonRow}>
            <TouchableOpacity
              onPress={handleCancel}
              style={[
                styles.button,
                styles.cancelButton,
                {
                  borderColor: colors.border,
                  backgroundColor: colors.surfaceElevated,
                },
              ]}
              activeOpacity={0.75}
              accessibilityRole="button"
            >
              <Text style={[styles.cancelText, { color: colors.textPrimary }]}>
                {cancelLabel}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleConfirm}
              disabled={loading}
              style={[
                styles.button,
                styles.confirmButton,
                {
                  backgroundColor: accentColor,
                },
              ]}
              activeOpacity={0.85}
              accessibilityRole="button"
            >
              <Text
                style={[
                  styles.confirmText,
                  {
                    color: variant === 'gold' ? colors.primaryDark : '#FFFFFF',
                  },
                ]}
              >
                {confirmLabel}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </RNModal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(7, 12, 30, 0.70)',
    ...Platform.select({
      web: {
        backdropFilter: 'blur(8px)',
      },
    }),
  },
  card: {
    width: '100%',
    maxWidth: 380,
    borderRadius: Radius['2xl'],
    borderWidth: 1,
    padding: Spacing.xl,
    alignItems: 'center',
    ...Platform.select({
      web: {
        boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
      },
    }),
  },
  iconWrapper: {
    width: 54,
    height: 54,
    borderRadius: Radius.full,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: FontSize.lg,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  message: {
    fontSize: FontSize.sm + 1,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    width: '100%',
  },
  button: {
    flex: 1,
    minHeight: TouchTarget.minHeight, // Accessible 44pt touch target
    borderRadius: Radius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
  },
  cancelButton: {
    borderWidth: 1,
  },
  confirmButton: {},
  cancelText: {
    fontSize: FontSize.sm + 1,
    fontWeight: '700',
  },
  confirmText: {
    fontSize: FontSize.sm + 1,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
});
