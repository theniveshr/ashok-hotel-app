import { AppText as Text } from '../components/ui/AppText';
import React from 'react';
import {
  StyleSheet,
  View,
  ScrollView
} from 'react-native';
import { Utensils, Bell } from 'lucide-react-native';
import { useTheme } from '../theme/ThemeContext';
import { useTranslation } from '../i18n';
import { Header } from '../components/ui/Header';
import { EmptyState } from '../components/ui/EmptyState';
import { Radius, Spacing, FontSize, Palette } from '@ashok-raj/ui';
import { useOrderStore } from '../store/useOrderStore';

export interface NotificationsScreenProps {
  onBack: () => void;
}

export function NotificationsScreen({ onBack }: NotificationsScreenProps) {
  const { colors } = useTheme();
  const { t, isTamil } = useTranslation();
  const orders = useOrderStore((state) => state.orders);

  const notifications = orders.map((o) => ({
    id: `notif-order-${o.id}`,
    type: 'ORDER',
    icon: Utensils,
    iconBg: 'rgba(37, 99, 235, 0.12)',
    iconColor: Palette.blue700,
    title: isTamil ? `ஆர்டர் #${o.orderNumber}` : `Order #${o.orderNumber}`,
    body: isTamil
      ? `ஆர்டர் நிலை: ${o.status}. மொத்தம்: ₹${o.totalAmount || o.total}`
      : `Order status is currently ${o.status}. Total: ₹${o.totalAmount || o.total}`,
    time: new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    isUnread: o.status !== 'DELIVERED' && o.status !== 'CANCELLED',
  }));

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        showBack
        onBackPress={onBack}
        title={t('settings.notifications')}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {notifications.length === 0 ? (
          <EmptyState
            title={isTamil ? 'அறிவிப்புகள் எதுவும் இல்லை' : 'No Notifications'}
            description={
              isTamil
                ? 'உங்கள் உணவு ஆர்டர்கள் மற்றும் முன்பதிவுகள் தொடர்பான அறிவிப்புகள் இங்கு தோன்றும்.'
                : "You're all caught up! Updates regarding your food orders and stays will appear here."
            }
            icon={<Bell size={36} color={Palette.blue700} />}
          />
        ) : (
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
                      borderColor: n.isUnread ? Palette.blue700 : colors.border,
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
                        <View style={[styles.unreadDot, { backgroundColor: Palette.blue700 }]} />
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
        )}
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
