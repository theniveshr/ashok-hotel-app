import { AppText as Text } from './AppText';
import React from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  type StyleProp,
  type ViewStyle
} from 'react-native';
import { ChevronLeft, Bell, Globe, MapPin } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../theme/ThemeContext';
import { useTranslation } from '../../i18n';
import { Radius, Spacing, FontSize, Palette } from '@ashok-raj/ui';

export interface HeaderProps {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  onBackPress?: () => void;
  showNotifications?: boolean;
  onNotificationsPress?: () => void;
  notificationsCount?: number;
  showLanguageToggle?: boolean;
  showLocationBadge?: boolean;
  locationText?: string;
  rightAction?: React.ReactNode;
  /** Backwards-compatible alias used by older screens. */
  rightElement?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function Header({
  title,
  subtitle,
  showBack = false,
  onBackPress,
  showNotifications = false,
  onNotificationsPress,
  notificationsCount = 0,
  showLanguageToggle = false,
  showLocationBadge = false,
  locationText,
  rightAction,
  rightElement,
  style,
}: HeaderProps) {
  const { colors, isDark } = useTheme();
  const { isTamil, toggleLanguage } = useTranslation();

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onBackPress?.();
  };

  const handleLangToggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    toggleLanguage();
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDark ? colors.surface : colors.surfaceElevated,
          borderBottomColor: colors.border,
        },
        style,
      ]}
    >
      <View style={styles.leftRow}>
        {showBack && (
          <TouchableOpacity
            onPress={handleBack}
            style={[styles.iconBtn, { backgroundColor: colors.surfaceElevated }]}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <ChevronLeft size={20} color={colors.textPrimary} />
          </TouchableOpacity>
        )}

        {showLocationBadge && (
          <View style={styles.locationGroup}>
            <View style={styles.locationPin}>
              <MapPin size={14} color={colors.accent} />
            </View>
            <View>
              <Text style={[styles.locationLabel, { color: colors.textSecondary }]}>
                {isTamil ? 'அமைவிடம்' : 'Location'}
              </Text>
              <Text style={[styles.locationValue, { color: colors.textPrimary }]}>
                {locationText ?? 'Kalaiyarkoil'}
              </Text>
            </View>
          </View>
        )}

        {title && !showLocationBadge && (
          <View>
            <Text style={[styles.title, { color: colors.textPrimary }]}>
              {title}
            </Text>
            {subtitle && (
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                {subtitle}
              </Text>
            )}
          </View>
        )}
      </View>

      <View style={styles.rightRow}>
        {showLanguageToggle && (
          <TouchableOpacity
            onPress={handleLangToggle}
            style={[
              styles.langToggle,
              {
                backgroundColor: colors.surfaceElevated,
                borderColor: colors.border,
              },
            ]}
            activeOpacity={0.8}
          >
            <Globe size={14} color={colors.accent} />
            <Text style={[styles.langText, { color: colors.accent }]}>
              {isTamil ? 'தமிழ்' : 'EN'}
            </Text>
          </TouchableOpacity>
        )}

        {showNotifications && (
          <TouchableOpacity
            onPress={onNotificationsPress}
            style={[styles.iconBtn, { backgroundColor: colors.surfaceElevated }]}
            activeOpacity={0.8}
          >
            <Bell size={18} color={colors.textPrimary} />
            {notificationsCount > 0 && (
              <View style={[styles.badge, { backgroundColor: colors.accent }]}>
                <Text style={styles.badgeText}>
                  {notificationsCount > 9 ? '9+' : notificationsCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        )}

        {rightAction ?? rightElement}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    flex: 1,
  },
  rightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: Radius.full,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  title: {
    fontSize: FontSize.lg,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: FontSize.xs + 1,
    fontWeight: '600',
    marginTop: 1,
  },
  locationGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  locationPin: {
    width: 28,
    height: 28,
    borderRadius: Radius.full,
    backgroundColor: 'rgba(37, 99, 235, 0.10)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationLabel: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  locationValue: {
    fontSize: 13,
    fontWeight: '700',
  },
  langToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  langText: {
    fontSize: 11,
    fontWeight: '700',
  },
  badge: {
    position: 'absolute',
    top: 2,
    right: 2,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
});
