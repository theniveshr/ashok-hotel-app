import { AppText as Text } from '../components/ui/AppText';
import React from 'react';
import {
  StyleSheet,
  View,
  ScrollView
} from 'react-native';
import { Utensils, Hotel, Tag, Bell } from 'lucide-react-native';
import { useTheme } from '../theme/ThemeContext';
import { useTranslation } from '../i18n';
import { Header } from '../components/ui/Header';
import { Radius, Spacing, FontSize } from '@ashok-raj/ui';

export interface NotificationsScreenProps {
  onBack: () => void;
}

export function NotificationsScreen({ onBack }: NotificationsScreenProps) {
  const { colors } = useTheme();
  const { t, isTamil } = useTranslation();

  const notifications = [
    {
      id: 'notif-1',
      type: 'ORDER',
      icon: Utensils,
      iconBg: 'rgba(204, 146, 0, 0.15)',
      iconColor: colors.accent,
      title: isTamil ? 'ஆர்டர் தயாரிக்கப்படுகிறது' : 'Order Preparing',
      body: isTamil
        ? 'உங்கள் ஆர்டர் #AR-ORD-8821 சமையலறையில் தயாரிக்கப்படுகிறது.'
        : 'Chef has started preparing your order #AR-ORD-8821.',
      time: '10 mins ago',
      isUnread: true,
    },
    {
      id: 'notif-2',
      type: 'BOOKING',
      icon: Hotel,
      iconBg: 'rgba(0, 102, 204, 0.15)',
      iconColor: colors.info,
      title: isTamil ? 'அறை முன்பதிவு உறுதி' : 'Booking Confirmed',
      body: isTamil
        ? 'டீலக்ஸ் குளிரூட்டி அறை #104 முன்பதிவு உறுதி செய்யப்பட்டது.'
        : 'Your stay at Deluxe AC Room #104 has been confirmed.',
      time: '2 hours ago',
      isUnread: false,
    },
    {
      id: 'notif-3',
      type: 'OFFER',
      icon: Tag,
      iconBg: 'rgba(26, 122, 74, 0.15)',
      iconColor: colors.success,
      title: isTamil ? 'வார இறுதி 20% சலுகை' : 'Weekend 20% Discount',
      body: isTamil
        ? 'ASHOKRAJ20 கூப்பனை பயன்படுத்தி 20% தள்ளுபடி பெறுங்கள்.'
        : 'Use coupon ASHOKRAJ20 to get flat 20% off on all dine-in orders.',
      time: '1 day ago',
      isUnread: false,
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        showBack
        onBackPress={onBack}
        title={t('settings.notifications')}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.list}>
          {notifications.map((n) => {
            const IconComp = n.icon;
            return (
              <View
                key={n.id}
                style={[
                  styles.card,
                  {
                    backgroundColor: colors.surface,
                    borderColor: n.isUnread ? colors.accent : colors.border,
                  },
                ]}
              >
                <View style={[styles.iconWrap, { backgroundColor: n.iconBg }]}>
                  <IconComp size={20} color={n.iconColor} />
                </View>

                <View style={styles.content}>
                  <View style={styles.headRow}>
                    <Text style={[styles.title, { color: colors.textPrimary }]}>
                      {n.title}
                    </Text>
                    {n.isUnread && (
                      <View style={[styles.unreadDot, { backgroundColor: colors.accent }]} />
                    )}
                  </View>
                  <Text style={[styles.body, { color: colors.textSecondary }]}>
                    {n.body}
                  </Text>
                  <Text style={[styles.time, { color: colors.textTertiary }]}>
                    {n.time}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.base,
    paddingBottom: Spacing['5xl'],
  },
  list: {
    gap: Spacing.sm,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: Spacing.base,
    borderRadius: Radius.lg,
    borderWidth: 1,
    gap: Spacing.md,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  content: {
    flex: 1,
  },
  headRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: FontSize.sm + 1,
    fontWeight: '700',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  body: {
    fontSize: FontSize.xs + 1,
    lineHeight: 18,
    marginBottom: 6,
  },
  time: {
    fontSize: 10,
    fontWeight: '500',
  },
});
