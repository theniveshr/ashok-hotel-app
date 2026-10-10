import { AppText as Text } from './AppText';
import React from 'react';
import {
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle
} from 'react-native';
import { Inbox } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeContext';
import { PrimaryButton } from './PrimaryButton';
import { Spacing, FontSize, Radius } from '@ashok-raj/ui';

export interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  actionTitle?: string;
  onActionPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export function EmptyState({
  title,
  description,
  icon,
  actionTitle,
  onActionPress,
  style,
}: EmptyStateProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, style]}>
      <View
        style={[
          styles.iconCircle,
          {
            backgroundColor: colors.surfaceElevated,
            borderColor: colors.border,
          },
        ]}
      >
        {icon ?? <Inbox size={32} color={colors.accent} />}
      </View>

      <Text style={[styles.title, { color: colors.textPrimary }]}>
        {title}
      </Text>

      {description && (
        <Text style={[styles.description, { color: colors.textSecondary }]}>
          {description}
        </Text>
      )}

      {actionTitle && onActionPress && (
        <PrimaryButton
          title={actionTitle}
          onPress={onActionPress}
          size="sm"
          style={styles.actionBtn}
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
    width: 68,
    height: 68,
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
  description: {
    fontSize: FontSize.sm,
    lineHeight: 18,
    textAlign: 'center',
    marginBottom: Spacing.lg,
    maxWidth: 280,
  },
  actionBtn: {
    marginTop: Spacing.xs,
  },
});
