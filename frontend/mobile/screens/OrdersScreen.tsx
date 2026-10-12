import { AppText as Text } from '../components/ui/AppText';
import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Platform,
  Alert
} from 'react-native';
import { ShoppingBag, ChevronRight, Clock, RefreshCw, XCircle, Truck } from 'lucide-react-native';
import { useTheme } from '../theme/ThemeContext';
import { useTranslation } from '../i18n';
import { Header } from '../components/ui/Header';
import { StatusBadge } from '../components/ui/StatusBadge';
import { OrderTimeline } from '../components/ui/OrderTimeline';
import { GlassCard } from '../components/ui/GlassCard';
import { EmptyState } from '../components/ui/EmptyState';
import { Radius, Spacing, FontSize, Palette } from '@ashok-raj/ui';
import { useOrderStore } from '../store/useOrderStore';
import { useCartStore } from '../store/useCartStore';
import { DeliveryTrackingScreen } from './DeliveryTrackingScreen';

export interface OrdersScreenProps {
  onFoodPress?: (id: string) => void;
  onViewCart?: () => void;
}

export function OrdersScreen({ onFoodPress, onViewCart }: OrdersScreenProps = {}) {
  const { colors } = useTheme();
  const { t, isTamil } = useTranslation();
  const cartItems = useCartStore((state) => state.items);
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const [tab, setTab] = useState<'ACTIVE' | 'HISTORY'>('ACTIVE');
  const [trackingOrderId, setTrackingOrderId] = useState<string | null>(null);

  const { orders, fetchOrders, cancelOrder, isLoading } = useOrderStore();

  useEffect(() => {
    fetchOrders();
  }, []);

  const activeOrders = orders.filter(
    (o) => o.status !== 'DELIVERED' && o.status !== 'CANCELLED'
  );
  const pastOrders = orders.filter(
    (o) => o.status === 'DELIVERED' || o.status === 'CANCELLED'
  );

  const getStatusBadgeProps = (status: string) => {
    switch (status) {
      case 'PLACED':
        return { label: isTamil ? 'ஆர்டர் பெறப்பட்டது' : 'Order Placed', variant: 'warning' as const };
      case 'CONFIRMED':
        return { label: isTamil ? 'உறுதியானது' : 'Confirmed', variant: 'info' as const };
      case 'PREPARING':
        return { label: isTamil ? 'தயாராகிறது' : 'Preparing', variant: 'warning' as const };
      case 'READY_FOR_PICKUP':
        return { label: isTamil ? 'தயாராக உள்ளது' : 'Ready', variant: 'success' as const };
      case 'OUT_FOR_DELIVERY':
        return { label: isTamil ? 'விநியோகத்தில் உள்ளது' : 'Out for Delivery', variant: 'info' as const };
      case 'DELIVERED':
        return { label: isTamil ? 'வழங்கப்பட்டது' : 'Delivered', variant: 'success' as const };
      case 'CANCELLED':
        return { label: isTamil ? 'ரத்து செய்யப்பட்டது' : 'Cancelled', variant: 'error' as const };
      default:
        return { label: status, variant: 'neutral' as const };
    }
  };

  if (trackingOrderId) {
    return (
      <DeliveryTrackingScreen
        orderId={trackingOrderId}
        onBack={() => setTrackingOrderId(null)}
      />
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: '#F8FAFC' }]}>
      <Header
        title={isTamil ? 'ஆர்டர்கள்' : 'Orders'}
        subtitle={isTamil ? 'உணவு ஆர்டர்கள் & கண்காணிப்பு' : 'Food Orders & Live Tracking'}
      />

      {/* Cart Banner */}
      {cartCount > 0 && onViewCart && (
        <TouchableOpacity
          onPress={onViewCart}
          activeOpacity={0.85}
          style={styles.cartBanner}
        >
          <View style={styles.cartBannerLeft}>
            <View style={styles.cartBannerIconWrap}>
              <ShoppingBag size={18} color="#2563EB" />
            </View>
            <View style={styles.cartBannerTextWrap}>
              <Text style={styles.cartBannerTitle}>
                {isTamil ? `கார்ட்டில் ${cartCount} பொருட்கள்` : `${cartCount} items in your Cart`}
              </Text>
              <Text style={styles.cartBannerSub}>
                {isTamil ? 'செக்அவுட் செய்ய தட்டவும்' : 'Tap to review and checkout'}
              </Text>
            </View>
          </View>
          <View style={styles.cartBannerBtn}>
            <Text style={styles.cartBannerBtnText}>{isTamil ? 'கார்ட் காண்' : 'View Cart'}</Text>
            <ChevronRight size={15} color="#2563EB" />
          </View>
        </TouchableOpacity>
      )}

      {/* Tabs */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          onPress={() => setTab('ACTIVE')}
          style={[
            styles.tabBtn,
            tab === 'ACTIVE' && styles.tabBtnActive,
          ]}
        >
          <Text
            style={[
              styles.tabText,
              tab === 'ACTIVE' ? styles.tabTextActive : styles.tabTextInactive,
            ]}
          >
            {isTamil ? 'செயலில் உள்ளவை' : 'Active Orders'} ({activeOrders.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setTab('HISTORY')}
          style={[
            styles.tabBtn,
            tab === 'HISTORY' && styles.tabBtnActive,
          ]}
        >
          <Text
            style={[
              styles.tabText,
              tab === 'HISTORY' ? styles.tabTextActive : styles.tabTextInactive,
            ]}
          >
            {isTamil ? 'வரலாறு' : 'Past Orders'} ({pastOrders.length})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={fetchOrders} tintColor={Palette.blue700} />
        }
      >
        {tab === 'ACTIVE' ? (
          activeOrders.length === 0 ? (
            <EmptyState
              title={isTamil ? 'செயலில் உள்ள ஆர்டர்கள் இல்லை' : 'No active orders'}
              description={isTamil ? 'சுவையான உணவுகளை ஆர்டர் செய்ய மெனுவை பார்க்கவும்' : 'You have no orders currently being prepared or delivered.'}
            />
          ) : (
            activeOrders.map((order) => {
              const badge = getStatusBadgeProps(order.status);
              const itemsSummary = (order.items || [])
                .map((i: any) => `${i.quantity}x ${isTamil ? i.nameTa || i.name : i.name}`)
                .join(', ');

              return (
                <View key={order.id} style={styles.orderCard}>
                  <View style={styles.orderHead}>
                    <View>
                      <Text style={styles.orderNumber}>
                        #{order.orderNumber}
                      </Text>
                      <Text style={styles.orderDate}>
                        {new Date(order.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </Text>
                    </View>
                    <StatusBadge label={badge.label} variant={badge.variant} />
                  </View>

                  <Text style={styles.itemsSummary} numberOfLines={2}>
                    {itemsSummary}
                  </Text>

                  <View style={styles.timelineBox}>
                    <OrderTimeline currentStatus={order.status} />
                  </View>

                  <View style={styles.orderFoot}>
                    <Text style={styles.itemsTotal}>
                      Total: ₹{Number(order.totalAmount || 0).toFixed(0)}
                    </Text>

                    <View style={styles.actionRow}>
                      {(order.type === 'HOME_DELIVERY' || (order as any).orderType === 'DELIVERY' || (order.type as string) === 'DELIVERY') && (
                        <TouchableOpacity
                          style={styles.trackBtn}
                          onPress={() => setTrackingOrderId(order.id)}
                        >
                          <Truck size={14} color="#FFFFFF" />
                          <Text style={styles.trackBtnText}>
                            {isTamil ? 'கண்காணி' : 'Track'}
                          </Text>
                        </TouchableOpacity>
                      )}

                      {order.status === 'PLACED' && (
                        <TouchableOpacity
                          style={styles.cancelBtn}
                          onPress={() => {
                            Alert.alert(
                              isTamil ? 'ஆர்டரை ரத்து செய்' : 'Cancel Order',
                              isTamil
                                ? 'இந்த ஆர்டரை நிச்சயமாக ரத்து செய்ய விரும்புகிறீர்களா?'
                                : 'Are you sure you want to cancel this order?',
                              [
                                { text: isTamil ? 'இல்லை' : 'No', style: 'cancel' },
                                {
                                  text: isTamil ? 'ஆம், ரத்து செய்' : 'Yes, Cancel',
                                  style: 'destructive',
                                  onPress: () => cancelOrder(order.id, 'Cancelled by user'),
                                },
                              ]
                            );
                          }}
                        >
                          <XCircle size={14} color={Palette.error} />
                          <Text style={styles.cancelBtnText}>
                            {isTamil ? 'ரத்து' : 'Cancel'}
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                </View>
              );
            })
          )
        ) : pastOrders.length === 0 ? (
          <EmptyState
            title={isTamil ? 'கடந்த ஆர்டர்கள் இல்லை' : 'No past orders'}
            description={isTamil ? 'உங்கள் பழைய ஆர்டர்கள் இங்கே தோன்றும்' : 'Your completed and cancelled orders will appear here.'}
          />
        ) : (
          pastOrders.map((order) => {
            const badge = getStatusBadgeProps(order.status);
            const itemsSummary = (order.items || [])
              .map((i: any) => `${i.quantity}x ${isTamil ? i.nameTa || i.name : i.name}`)
              .join(', ');

            return (
              <View key={order.id} style={styles.orderCard}>
                <View style={styles.orderHead}>
                  <View>
                    <Text style={styles.orderNumber}>
                      #{order.orderNumber}
                    </Text>
                    <Text style={styles.orderDate}>
                      {new Date(order.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>
                  </View>
                  <StatusBadge label={badge.label} variant={badge.variant} />
                </View>

                <Text style={styles.itemsSummary} numberOfLines={2}>
                  {itemsSummary}
                </Text>

                <View style={styles.orderFoot}>
                  <Text style={styles.pastTotal}>
                    ₹{Number(order.totalAmount || 0).toFixed(0)}
                  </Text>
                  <Text style={styles.itemCountText}>
                    {(order.items || []).length} {isTamil ? 'உணவுகள்' : 'items'}
                  </Text>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabBtnActive: {
    borderBottomColor: '#2563EB',
  },
  tabText: {
    fontSize: FontSize.sm,
  },
  tabTextActive: {
    color: '#2563EB',
    fontWeight: '700',
  },
  tabTextInactive: {
    color: '#475569',
    fontWeight: '500',
  },
  scrollContent: {
    padding: Spacing.base,
    paddingBottom: Spacing['6xl'],
    gap: Spacing.md,
  },
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Platform.select({
      web: {
        boxShadow: '0 4px 12px rgba(15, 23, 42, 0.05)',
      },
      default: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
      },
    }),
    gap: 8,
  },
  orderHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderNumber: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  orderDate: {
    fontSize: 11,
    color: '#475569',
    marginTop: 2,
  },
  itemsSummary: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 18,
  },
  timelineBox: {
    marginVertical: 4,
  },
  orderFoot: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 8,
  },
  itemsTotal: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  pastTotal: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  itemCountText: {
    fontSize: 12,
    color: '#475569',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  trackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#2563EB',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.full,
  },
  trackBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  cancelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.full,
  },
  cancelBtnText: {
    color: Palette.error,
    fontSize: 12,
    fontWeight: '700',
  },
  cartBanner: {
    marginHorizontal: Spacing.base,
    marginBottom: Spacing.md,
    padding: 12,
    borderRadius: 18,
    backgroundColor: '#EFF6FF',
    borderWidth: 1.2,
    borderColor: '#BFDBFE',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cartBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  cartBannerIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBannerTextWrap: {
    flex: 1,
  },
  cartBannerTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#1E40AF',
  },
  cartBannerSub: {
    fontSize: 11,
    color: '#475569',
    marginTop: 1,
  },
  cartBannerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: '#93C5FD',
  },
  cartBannerBtnText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#2563EB',
  },
});
