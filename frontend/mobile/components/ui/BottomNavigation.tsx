import { AppText as Text } from './AppText';
import React from 'react';
import {
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
  type StyleProp,
  type ViewStyle
} from 'react-native';
import { Home, ShoppingBag, Calendar, Tag, User } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../theme/ThemeContext';
import { useTranslation } from '../../i18n';
import { Radius, Spacing, Palette } from '@ashok-raj/ui';

// 5-tab navigation matching reference: Home · Orders · Bookings · Offers · Profile
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
  const { colors } = useTheme();
  const { isTamil } = useTranslation();

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
    <View style={[styles.wrapper, style]}>
      <View style={[styles.container]}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          const IconComponent = tab.icon;

          return (
            <TouchableOpacity
              key={tab.key}
              onPress={() => handlePress(tab.key)}
              activeOpacity={0.7}
              style={styles.tabItem}
              accessibilityRole="button"
              accessibilityLabel={tab.label}
              accessibilityState={{ selected: isActive }}
            >
              <View style={styles.iconContainer}>
                <IconComponent
                  size={22}
                  color={isActive ? '#1D4ED8' : '#334155'}
                  strokeWidth={isActive ? 2.5 : 2.2}
                />
                {/* Orders badge */}
                {tab.key === 'orders' && ordersBadge !== undefined && ordersBadge > 0 && (
                  <View style={[styles.badge, { backgroundColor: Palette.error }]}>
                    <Text style={styles.badgeText}>{ordersBadge}</Text>
                  </View>
                )}
                {/* Offers badge */}
                {tab.key === 'offers' && offersBadge !== undefined && offersBadge > 0 && (
                  <View style={[styles.badge, { backgroundColor: '#1D4ED8' }]}>
                    <Text style={styles.badgeText}>{offersBadge}</Text>
                  </View>
                )}
              </View>

              <Text
                style={[
                  styles.label,
                  {
                    color: isActive ? '#1D4ED8' : '#334155',
                    fontWeight: isActive ? '800' : '700',
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
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.sm,
    backgroundColor: 'transparent',
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 8,
    paddingHorizontal: 6,
    ...Platform.select({
      web: {
        // boxShadow replaces deprecated shadow* props on react-native-web
        boxShadow: '0 6px 16px rgba(15, 23, 42, 0.08)',
      },
      default: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
        elevation: 8,
      },
    }),
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    paddingVertical: 4,
    gap: 3,
  },
  iconContainer: {
    position: 'relative',
    height: 24,
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
