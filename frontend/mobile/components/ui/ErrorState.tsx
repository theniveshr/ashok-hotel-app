import { AppText as Text } from './AppText';
import React from 'react';
import {
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle
} from 'react-native';
import { AlertCircle } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeContext';
import { useTranslation } from '../../i18n';
import { PrimaryButton } from './PrimaryButton';
import { Spacing, FontSize, Radius } from '@ashok-raj/ui';

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  style?: StyleProp<ViewStyle>;
}

export function ErrorState({
  title,
  message,
  onRetry,
  style,
}: ErrorStateProps) {
  const { colors } = useTheme();
  const { t, isTamil } = useTranslation();

  const displayTitle = title ?? (isTamil ? 'பிழை ஏற்பட்டது' : 'Something went wrong');
  const displayMessage = message ?? t('common.errorRetry');

  return (
    <View style={[styles.container, style]}>
      <View
        style={[
          styles.iconCircle,
          {
            backgroundColor: colors.errorBg,
            borderColor: colors.error,
          },
        ]}
      >
        <AlertCircle size={32} color={colors.error} />
      </View>

      <Text style={[styles.title, { color: colors.textPrimary }]}>
        {displayTitle}
      </Text>

      <Text style={[styles.message, { color: colors.textSecondary }]}>
        {displayMessage}
      </Text>

      {onRetry && (
        <PrimaryButton
          title={t('common.retry')}
          onPress={onRetry}
          size="sm"
          style={styles.retryBtn}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: Spacing['3xl'],
    paddingHorizontal: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: Radius.full,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: FontSize.md + 1,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 6,
  },
  message: {
    fontSize: FontSize.sm,
    lineHeight: 18,
    textAlign: 'center',
    marginBottom: Spacing.lg,
    maxWidth: 280,
  },
  retryBtn: {
    marginTop: Spacing.xs,
  },
});
