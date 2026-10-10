import { AppText as Text } from './AppText';
import React from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  View,
  type StyleProp,
  type ViewStyle
} from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../theme/ThemeContext';
import { useTranslation } from '../../i18n';
import { Spacing, FontSize } from '@ashok-raj/ui';

export interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  actionText?: string;
  onActionPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export function SectionHeader({
  title,
  subtitle,
  actionText,
  onActionPress,
  style,
}: SectionHeaderProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();

  const handleAction = () => {
    if (onActionPress) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onActionPress();
    }
  };

  const defaultAction = actionText ?? t('common.viewAll');

  return (
    <View style={[styles.container, style]}>
      <View style={styles.titleColumn}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>
          {title}
        </Text>
        {subtitle && (
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {subtitle}
          </Text>
        )}
      </View>

      {onActionPress && (
        <TouchableOpacity
          onPress={handleAction}
          activeOpacity={0.7}
          style={styles.actionBtn}
        >
          <Text style={[styles.actionText, { color: colors.accent }]}>
            {defaultAction}
          </Text>
          <ChevronRight size={14} color={colors.accent} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: Spacing.md,
    marginTop: Spacing.lg,
  },
  titleColumn: {
    flex: 1,
  },
  title: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  subtitle: {
    fontSize: FontSize.xs + 1,
    marginTop: 2,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingVertical: 2,
  },
  actionText: {
    fontSize: FontSize.xs + 1,
    fontWeight: '600',
  },
});
