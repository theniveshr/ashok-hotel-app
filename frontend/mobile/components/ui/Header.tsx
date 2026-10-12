import { AppText as Text } from './AppText';
import React from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Platform,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { ChevronLeft, Bell, Globe, MapPin } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../theme/ThemeContext';
import { useTranslation } from '../../i18n';
import { Radius, Spacing, FontSize, TouchTarget } from '@ashok-raj/ui';

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
          backgroundColor: colors.glass,
          borderBottomColor: colors.glassBorder,
        },
        style,
      ]}
    >
      <View style={styles.leftRow}>
        {showBack && (
          <TouchableOpacity
            onPress={handleBack}
            style={[
              styles.iconBtn,
              {
                backgroundColor: colors.surfaceElevated,
                borderColor: colors.border,
              },
            ]}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <ChevronLeft size={20} color={colors.textPrimary} />
          </TouchableOpacity>
        )}

        {showLocationBadge && (
          <View style={styles.locationGroup}>
            <View
              style={[
                styles.locationPin,
                {
                  backgroundColor: 'rgba(37, 99, 235, 0.1)',
                },
              ]}
            >
              <MapPin size={15} color={colors.accent} />
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
          <View style={{ flex: 1 }}>
            <Text style={[styles.title, { color: colors.textPrimary }]} numberOfLines={1}>
              {title}
            </Text>
            {subtitle && (
              <Text style={[styles.subtitle, { color: colors.textSecondary }]} numberOfLines={1}>
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
            accessibilityRole="button"
            accessibilityLabel="Toggle language"
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
            style={[
              styles.iconBtn,
              {
                backgroundColor: colors.surfaceElevated,
                borderColor: colors.border,
              },
            ]}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Notifications"
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
    paddingVertical: Spacing.sm + 2,
    borderBottomWidth: 1,
    ...Platform.select({
      web: {
        backdropFilter: 'blur(10px)',
      },
    }),
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
    minWidth: TouchTarget.minWidth,
    minHeight: TouchTarget.minHeight,
    borderRadius: Radius.full,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  title: {
    fontSize: FontSize.lg,
    fontWeight: '800',
    letterSpacing: 0.2,
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
    width: 32,
    height: 32,
    borderRadius: Radius.full,
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
    gap: 5,
    minHeight: TouchTarget.minHeight,
    paddingHorizontal: 12,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  langText: {
    fontSize: 11,
    fontWeight: '700',
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    color: '#070C1E',
    fontSize: 9,
    fontWeight: '800',
  },
});
