import { AppText as Text } from './AppText';
import React from 'react';
import {
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { Home, ShoppingBag, Calendar, Tag, User } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme/ThemeContext';
import { useTranslation } from '../../i18n';
import { Radius, Spacing, TouchTarget } from '@ashok-raj/ui';

// 5-tab navigation: Home · Orders · Bookings · Offers · Profile
export type TabKey = 'home' | 'orders' | 'bookings' | 'offers' | 'profile';

export interface BottomNavigationProps {
  activeTab: TabKey;
  onTabPress: (tab: TabKey) => void;
  ordersBadge?: number;
  offersBadge?: number;
  style?: StyleProp<ViewStyle>;
}

export function BottomNavigation({
  activeTab,
  onTabPress,
  ordersBadge,
  offersBadge,
  style,
}: BottomNavigationProps) {
  const { colors, isDark } = useTheme();
  const { isTamil } = useTranslation();
  const insets = useSafeAreaInsets();
  const bottomOffset = Math.max(insets.bottom + 6, Platform.OS === 'ios' ? 24 : 14);

  const tabs: { key: TabKey; label: string; icon: typeof Home }[] = [
    { key: 'home',     label: isTamil ? 'முகப்பு' : 'Home',       icon: Home },
    { key: 'orders',   label: isTamil ? 'ஆர்டர்கள்' : 'Orders',   icon: ShoppingBag },
    { key: 'bookings', label: isTamil ? 'பதிவுகள்' : 'Bookings',  icon: Calendar },
    { key: 'offers',   label: isTamil ? 'சலுகைகள்' : 'Offers',    icon: Tag },
    { key: 'profile',  label: isTamil ? 'சுயவிவரம்' : 'Profile',  icon: User },
  ];

  const handlePress = (tab: TabKey) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onTabPress(tab);
  };

  return (
    <View
      pointerEvents="box-none"
      style={[
        styles.wrapper,
        {
          bottom: bottomOffset,
        },
        style,
      ]}
    >
      <View
        style={[
          styles.container,
          {
            backgroundColor: isDark ? 'rgba(30, 41, 59, 0.96)' : 'rgba(255, 255, 255, 0.98)',
            borderColor: isDark ? colors.glassBorder : '#E2E8F0',
          },
        ]}
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          const IconComponent = tab.icon;

          return (
            <TouchableOpacity
              key={tab.key}
              onPress={() => handlePress(tab.key)}
              activeOpacity={0.7}
              style={[
                styles.tabItem,
                isActive && {
                  backgroundColor: 'rgba(37, 99, 235, 0.09)',
                },
              ]}
              accessibilityRole="button"
              accessibilityLabel={tab.label}
              accessibilityState={{ selected: isActive }}
            >
              <View style={styles.iconContainer}>
                <IconComponent
                  size={20}
                  color={isActive ? colors.tabActive : colors.tabInactive}
                  strokeWidth={isActive ? 2.5 : 2}
                />
                {/* Orders badge */}
                {tab.key === 'orders' && ordersBadge !== undefined && ordersBadge > 0 && (
                  <View style={[styles.badge, { backgroundColor: colors.error }]}>
                    <Text style={styles.badgeText}>{ordersBadge}</Text>
                  </View>
                )}
                {/* Offers badge */}
                {tab.key === 'offers' && offersBadge !== undefined && offersBadge > 0 && (
                  <View style={[styles.badge, { backgroundColor: colors.accent }]}>
                    <Text style={styles.badgeText}>{offersBadge}</Text>
                  </View>
                )}
              </View>

              <Text
                style={[
                  styles.label,
                  {
                    color: isActive ? colors.tabActive : colors.tabInactive,
                    fontWeight: isActive ? '700' : '500',
                  },
                ]}
                numberOfLines={1}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 14,
    right: 14,
    alignItems: 'center',
    zIndex: 1000,
    backgroundColor: 'transparent',
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
    maxWidth: 480,
    borderRadius: 30,
    borderWidth: 1.2,
    paddingVertical: 5,
    paddingHorizontal: 6,
    ...Platform.select({
      web: {
        boxShadow: '0 8px 26px rgba(15, 23, 42, 0.14)',
        backdropFilter: 'blur(14px)',
      },
      default: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.14,
        shadowRadius: 16,
        elevation: 8,
      },
    }),
  },
  tabItem: {
    flex: 1,
    minHeight: 46,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    paddingVertical: 4,
    paddingHorizontal: 2,
    gap: 2,
  },
  iconContainer: {
    position: 'relative',
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -10,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  label: {
    fontSize: 10.5,
    letterSpacing: 0.1,
  },
});
