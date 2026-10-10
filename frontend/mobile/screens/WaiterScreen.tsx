import { AppText as Text } from '../components/ui/AppText';
import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal
} from 'react-native';
import {
  Bell,
  Droplets,
  HelpCircle,
  Receipt,
  Utensils,
  CheckCircle2,
  Clock,
  Users,
  Check,
  Sparkles,
  Plus,
  RefreshCw,
} from 'lucide-react-native';
import { useTheme } from '../theme/ThemeContext';
import { useTranslation } from '../i18n';
import { Header } from '../components/ui/Header';
import { GlassCard } from '../components/ui/GlassCard';
import { Radius, Spacing, FontSize, Palette } from '@ashok-raj/ui';

// Local color aliases â€” bridge for staff screen color tokens
const LOCAL_COLORS = {
  amber500:  '#F59E0B',
  amber600:  '#D97706',
  emerald400:'#34D399',
  emerald500:'#10B981',
  emerald600:'#059669',
  indigo500: '#6366F1',
  dark900:   '#0F172A',   // replaced old navy950
  textMuted: '#475569',
} as const;


export interface WaiterScreenProps {
  onBack: () => void;
}

interface MockTable {
  id: string;
  tableNumber: string;
  floor: number;
  capacity: number;
  status: 'AVAILABLE' | 'OCCUPIED' | 'CLEANING' | 'RESERVED';
  isAc: boolean;
  guestCount?: number;
  sessionMins?: number;
  totalAmount?: number;
  hasCall?: boolean;
  callType?: string;
  callNote?: string;
}

interface MockReadyOrder {
  id: string;
  orderNumber: string;
  tableNumber: string;
  items: Array<{ name: string; nameTa: string; qty: number }>;
  readyMinsAgo: number;
}

export function WaiterScreen({ onBack }: WaiterScreenProps) {
  const { colors } = useTheme();
  const { isTamil } = useTranslation();

  const [activeSegment, setActiveSegment] = useState<'tables' | 'calls' | 'ready'>('tables');
  const [selectedFloor, setSelectedFloor] = useState<number | 'all'>('all');

  // Initial Mock Data for offline/demo robustness
  const [tables, setTables] = useState<MockTable[]>([
    { id: '1', tableNumber: '01', floor: 1, capacity: 2, status: 'AVAILABLE', isAc: false },
    { id: '2', tableNumber: '02', floor: 1, capacity: 2, status: 'AVAILABLE', isAc: false },
    {
      id: '3',
      tableNumber: '03',
      floor: 1,
      capacity: 4,
      status: 'OCCUPIED',
      isAc: true,
      guestCount: 3,
      sessionMins: 35,
      totalAmount: 480,
      hasCall: true,
      callType: 'WATER',
      callNote: 'Warm drinking water',
    },
    {
      id: '4',
      tableNumber: '04',
      floor: 1,
      capacity: 4,
      status: 'OCCUPIED',
      isAc: true,
      guestCount: 2,
      sessionMins: 18,
      totalAmount: 675,
    },
    { id: '5', tableNumber: '05', floor: 1, capacity: 4, status: 'AVAILABLE', isAc: true },
    { id: '6', tableNumber: '06', floor: 1, capacity: 6, status: 'RESERVED', isAc: false },
    { id: '7', tableNumber: '07', floor: 1, capacity: 6, status: 'CLEANING', isAc: false },
    {
      id: '8',
      tableNumber: '08',
      floor: 1,
      capacity: 6,
      status: 'OCCUPIED',
      isAc: false,
      guestCount: 4,
      sessionMins: 45,
      totalAmount: 1120,
      hasCall: true,
      callType: 'BILL',
      callNote: 'Bill with UPI QR',
    },
    { id: '9', tableNumber: '09', floor: 2, capacity: 4, status: 'AVAILABLE', isAc: true },
    { id: '10', tableNumber: '10', floor: 2, capacity: 4, status: 'AVAILABLE', isAc: true },
    { id: '11', tableNumber: '11', floor: 2, capacity: 8, status: 'AVAILABLE', isAc: true },
    { id: '12', tableNumber: '12', floor: 2, capacity: 8, status: 'AVAILABLE', isAc: true },
  ]);

  const [readyOrders, setReadyOrders] = useState<MockReadyOrder[]>([
    {
      id: 'ro-1',
      orderNumber: 'AR-TBL-0802',
      tableNumber: '08',
      readyMinsAgo: 2,
      items: [
        { name: 'Chettinad Special Chicken Biryani', nameTa: 'செட்டிநாடு சிக்கன் பிரியாணி', qty: 2 },
        { name: 'Kalaiyarkoil Special Filter Coffee', nameTa: 'காளையார்கோவில் ஃபில்டர் காபி', qty: 2 },
      ],
    },
  ]);

  // Modals
  const [selectedTableForOrder, setSelectedTableForOrder] = useState<MockTable | null>(null);
  const [orderDish, setOrderDish] = useState('Seeraga Samba Mutton Biryani');
  const [orderQty, setOrderQty] = useState(1);
  const [orderNote, setOrderNote] = useState('');
  const [billingTable, setBillingTable] = useState<MockTable | null>(null);

  const t = {
    title: isTamil ? 'பரிமாறுநர் கட்டுப்பாட்டகம்' : 'Waiter Operations Hub',
    sub: isTamil ? 'நேரலை மேஜை சேவை & விருந்தினர் அழைப்புகள்' : 'Live Table Station & Guest Calls',
    tablesTab: isTamil ? 'மேஜைகள்' : 'My Tables',
    callsTab: isTamil ? 'அழைப்புகள்' : 'Guest Calls',
    readyTab: isTamil ? 'பரிமாற தயார்' : 'Ready Food',
    floorAll: isTamil ? 'அனைத்து' : 'All',
    floor1: isTamil ? 'தளம் 1' : 'Floor 1',
    floor2: isTamil ? 'தளம் 2 (A/C)' : 'Floor 2 (A/C)',
    tableAvailable: isTamil ? 'காலியாக உள்ளது' : 'Available',
    tableOccupied: isTamil ? 'விருந்தினர் உள்ளனர்' : 'Occupied',
    tableCleaning: isTamil ? 'சுத்தம் செய்யப்படுகிறது' : 'Cleaning',
    tableReserved: isTamil ? 'முன்பதிவு' : 'Reserved',
    takeOrder: isTamil ? '+ ஆர்டர் எடு' : '+ Take Order',
    settleBill: isTamil ? 'பில் செய்' : 'Settle Bill',
    markClean: isTamil ? 'சுத்தம் செய்யப்பட்டது' : 'Mark Available',
    acknowledge: isTamil ? 'பார்த்தேன்' : 'Acknowledge',
    resolved: isTamil ? 'சேவை முடிந்தது' : 'Mark Done',
    markServed: isTamil ? 'மேஜையில் பரிமாறப்பட்டது' : 'Delivered to Table',
    noCalls: isTamil ? 'செயலில் உள்ள அழைப்புகள் இல்லை' : 'No Active Guest Calls',
    noReady: isTamil ? 'பரிமாற உணவுகள் எதுவும் தயாராக இல்லை' : 'No Food Ready in Kitchen',
  };

  // Resolve Call
  const handleResolveCall = (tableId: string) => {
    setTables((prev) =>
      prev.map((t) => (t.id === tableId ? { ...t, hasCall: false, callType: undefined, callNote: undefined } : t))
    );
  };

  // Mark Served
  const handleMarkServed = (orderId: string) => {
    setReadyOrders((prev) => prev.filter((o) => o.id !== orderId));
  };

  // Submit Order Table-side
  const handlePunchOrder = () => {
    if (!selectedTableForOrder) return;
    setTables((prev) =>
      prev.map((t) => {
        if (t.id !== selectedTableForOrder.id) return t;
        return {
          ...t,
          status: 'OCCUPIED',
          guestCount: t.guestCount || 2,
          sessionMins: t.sessionMins || 1,
          totalAmount: (t.totalAmount || 0) + 320 * orderQty,
        };
      })
    );
    setSelectedTableForOrder(null);
    setOrderNote('');
    setOrderQty(1);
  };

  // Settle Bill
  const handleSettle = () => {
    if (!billingTable) return;
    setTables((prev) =>
      prev.map((t) => {
        if (t.id !== billingTable.id) return t;
        return {
          ...t,
          status: 'CLEANING',
          totalAmount: 0,
          sessionMins: 0,
          guestCount: 0,
          hasCall: false,
        };
      })
    );
    setBillingTable(null);
  };

  // Reset Table to Available
  const handleMakeAvailable = (tableId: string) => {
    setTables((prev) =>
      prev.map((t) => (t.id === tableId ? { ...t, status: 'AVAILABLE', totalAmount: 0, sessionMins: 0, guestCount: 0 } : t))
    );
  };

  const filteredTables = tables.filter((tbl) => {
    if (selectedFloor !== 'all' && tbl.floor !== selectedFloor) return false;
    return true;
  });

  const pendingCalls = tables.filter((t) => t.hasCall);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title={t.title} showBack onBack={onBack} />

      {/* Top Segment Tabs */}
      <View style={[styles.tabBar, { borderBottomColor: colors.border, backgroundColor: colors.surface }]}>
        <TouchableOpacity
          onPress={() => setActiveSegment('tables')}
          style={[styles.tabButton, activeSegment === 'tables' && { borderBottomColor: LOCAL_COLORS.amber500 }]}
        >
          <Utensils size={16} color={activeSegment === 'tables' ? LOCAL_COLORS.amber500 : colors.textTertiary} />
          <Text
            style={[
              styles.tabText,
              { color: activeSegment === 'tables' ? LOCAL_COLORS.amber500 : colors.textTertiary },
            ]}
          >
            {t.tablesTab} ({tables.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveSegment('calls')}
          style={[styles.tabButton, activeSegment === 'calls' && { borderBottomColor: Palette.error }]}
        >
          <Bell size={16} color={activeSegment === 'calls' ? Palette.error : colors.textTertiary} />
          <Text
            style={[
              styles.tabText,
              { color: activeSegment === 'calls' ? Palette.error : colors.textTertiary },
            ]}
          >
            {t.callsTab} {pendingCalls.length > 0 && `(${pendingCalls.length})`}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveSegment('ready')}
          style={[styles.tabButton, activeSegment === 'ready' && { borderBottomColor: LOCAL_COLORS.emerald500 }]}
        >
          <Clock size={16} color={activeSegment === 'ready' ? LOCAL_COLORS.emerald500 : colors.textTertiary} />
          <Text
            style={[
              styles.tabText,
              { color: activeSegment === 'ready' ? LOCAL_COLORS.emerald500 : colors.textTertiary },
            ]}
          >
            {t.readyTab} {readyOrders.length > 0 && `(${readyOrders.length})`}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* VIEW 1: TABLES */}
        {activeSegment === 'tables' && (
          <View>
            {/* Floor Filter */}
            <View style={styles.floorSelector}>
              {[
                { id: 'all', label: t.floorAll },
                { id: 1, label: t.floor1 },
                { id: 2, label: t.floor2 },
              ].map((f) => (
                <TouchableOpacity
                  key={f.id}
                  onPress={() => setSelectedFloor(f.id as any)}
                  style={[
                    styles.floorPill,
                    {
                      backgroundColor: selectedFloor === f.id ? LOCAL_COLORS.amber500 : colors.surface,
                      borderColor: selectedFloor === f.id ? LOCAL_COLORS.amber500 : colors.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.floorPillText,
                      { color: selectedFloor === f.id ? LOCAL_COLORS.dark900 : colors.textPrimary },
                    ]}
                  >
                    {f.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Tables Grid */}
            <View style={styles.grid}>
              {filteredTables.map((tbl) => {
                const isOccupied = tbl.status === 'OCCUPIED';
                const isCleaning = tbl.status === 'CLEANING';
                const isAvailable = tbl.status === 'AVAILABLE';

                return (
                  <View
                    key={tbl.id}
                    style={[
                      styles.tableCard,
                      {
                        backgroundColor: colors.surface,
                        borderColor: tbl.hasCall
                          ? Palette.error
                          : isOccupied
                          ? LOCAL_COLORS.indigo500
                          : isCleaning
                          ? LOCAL_COLORS.amber600
                          : colors.border,
                      },
                    ]}
                  >
                    <View style={styles.tableHeader}>
                      <View style={styles.tableNumberRow}>
                        <Text style={[styles.tableNumText, { color: colors.textPrimary }]}>
                          #{tbl.tableNumber}
                        </Text>
                        {tbl.isAc && (
                          <View style={styles.acBadge}>
                            <Text style={styles.acBadgeText}>A/C</Text>
                          </View>
                        )}
                      </View>

                      <View
                        style={[
                          styles.statusBadge,
                          {
                            backgroundColor: isOccupied
                              ? '#1E3A8A'
                              : isCleaning
                              ? '#78350F'
                              : isAvailable
                              ? '#064E3B'
                              : '#581C87',
                          },
                        ]}
                      >
                        <Text style={styles.statusBadgeText}>
                          {isOccupied
                            ? t.tableOccupied
                            : isCleaning
                            ? t.tableCleaning
                            : isAvailable
                            ? t.tableAvailable
                            : t.tableReserved}
                        </Text>
                      </View>
                    </View>

                    {/* Active call banner */}
                    {tbl.hasCall && (
                      <View style={styles.callWarning}>
                        <Bell size={12} color={Palette.error} />
                        <Text style={styles.callWarningText}>
                          {tbl.callType === 'WATER' ? 'Water' : 'Bill'} ({tbl.callNote || 'Call'})
                        </Text>
                        <TouchableOpacity onPress={() => handleResolveCall(tbl.id)}>
                          <Text style={styles.callResolveText}>Done</Text>
                        </TouchableOpacity>
                      </View>
                    )}

                    {/* Occupancy Info */}
                    {isOccupied ? (
                      <View style={styles.occupiedInfo}>
                        <View style={styles.infoRow}>
                          <Text style={[styles.infoLabel, { color: colors.textTertiary }]}>
                            <Users size={12} color={colors.textTertiary} /> {tbl.guestCount} guests
                          </Text>
                          <Text style={[styles.infoLabel, { color: LOCAL_COLORS.amber500 }]}>
                            <Clock size={12} color={LOCAL_COLORS.amber500} /> {tbl.sessionMins}m
                          </Text>
                        </View>
                        <Text style={[styles.totalAmountText, { color: colors.textPrimary }]}>
                          ₹{tbl.totalAmount || 0}
                        </Text>
                      </View>
                    ) : (
                      <View style={styles.emptyInfo}>
                        <Text style={[styles.emptyText, { color: colors.textTertiary }]}>
                          {isCleaning ? '🧹 Needs Cleaning' : `Cap: ${tbl.capacity}`}
                        </Text>
                      </View>
                    )}

                    {/* Actions */}
                    <View style={[styles.cardFooter, { borderTopColor: colors.border }]}>
                      {isOccupied && (
                        <View style={styles.actionRow}>
                          <TouchableOpacity
                            onPress={() => setSelectedTableForOrder(tbl)}
                            style={[styles.smallBtn, { backgroundColor: '#2563EB' }]}
                          >
                            <Text style={styles.smallBtnText}>{t.takeOrder}</Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            onPress={() => setBillingTable(tbl)}
                            style={[styles.smallBtn, { backgroundColor: LOCAL_COLORS.amber500 }]}
                          >
                            <Text style={[styles.smallBtnText, { color: LOCAL_COLORS.dark900 }]}>
                              {t.settleBill}
                            </Text>
                          </TouchableOpacity>
                        </View>
                      )}

                      {isCleaning && (
                        <TouchableOpacity
                          onPress={() => handleMakeAvailable(tbl.id)}
                          style={[styles.wideBtn, { backgroundColor: LOCAL_COLORS.emerald600 }]}
                        >
                          <Check size={14} color="#FFF" />
                          <Text style={styles.smallBtnText}> {t.markClean}</Text>
                        </TouchableOpacity>
                      )}

                      {isAvailable && (
                        <TouchableOpacity
                          onPress={() => setSelectedTableForOrder(tbl)}
                          style={[styles.wideBtn, { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }]}
                        >
                          <Text style={[styles.smallBtnText, { color: colors.textPrimary }]}>
                            🪑 Seat &amp; Order
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* VIEW 2: GUEST CALLS */}
        {activeSegment === 'calls' && (
          <View style={styles.callsList}>
            {pendingCalls.length === 0 ? (
              <GlassCard style={styles.emptyCard}>
                <Sparkles size={36} color={LOCAL_COLORS.amber500} />
                <Text style={[styles.emptyCardTitle, { color: colors.textPrimary }]}>{t.noCalls}</Text>
                <Text style={[styles.emptyCardSub, { color: colors.textTertiary }]}>
                  All guest requests are currently answered.
                </Text>
              </GlassCard>
            ) : (
              pendingCalls.map((tbl) => (
                <View
                  key={tbl.id}
                  style={[styles.callCard, { backgroundColor: colors.surface, borderColor: Palette.error }]}
                >
                  <View style={styles.callLeft}>
                    <View style={styles.callIconBox}>
                      {tbl.callType === 'WATER' ? (
                        <Droplets size={22} color={Palette.error} />
                      ) : (
                        <Receipt size={22} color={Palette.error} />
                      )}
                    </View>
                    <View>
                      <Text style={[styles.callTableTitle, { color: colors.textPrimary }]}>
                        Table #{tbl.tableNumber}
                      </Text>
                      <Text style={[styles.callDetail, { color: LOCAL_COLORS.amber500 }]}>
                        {tbl.callNote || 'Guest Service Call'}
                      </Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    onPress={() => handleResolveCall(tbl.id)}
                    style={[styles.resolveBtn, { backgroundColor: LOCAL_COLORS.emerald500 }]}
                  >
                    <Check size={16} color={LOCAL_COLORS.dark900} />
                    <Text style={styles.resolveBtnText}>{t.resolved}</Text>
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>
        )}

        {/* VIEW 3: READY FOOD PICKUP */}
        {activeSegment === 'ready' && (
          <View style={styles.callsList}>
            {readyOrders.length === 0 ? (
              <GlassCard style={styles.emptyCard}>
                <CheckCircle2 size={36} color={LOCAL_COLORS.emerald500} />
                <Text style={[styles.emptyCardTitle, { color: colors.textPrimary }]}>{t.noReady}</Text>
                <Text style={[styles.emptyCardSub, { color: colors.textTertiary }]}>
                  Cooked orders from kitchen will appear here for floor delivery.
                </Text>
              </GlassCard>
            ) : (
              readyOrders.map((ord) => (
                <View
                  key={ord.id}
                  style={[styles.callCard, { backgroundColor: colors.surface, borderColor: LOCAL_COLORS.emerald500 }]}
                >
                  <View style={styles.callLeft}>
                    <View style={[styles.callIconBox, { backgroundColor: '#064E3B' }]}>
                      <Utensils size={22} color={LOCAL_COLORS.emerald400} />
                    </View>
                    <View>
                      <Text style={[styles.callTableTitle, { color: colors.textPrimary }]}>
                        Table #{ord.tableNumber} ({ord.orderNumber})
                      </Text>
                      {ord.items.map((it, idx) => (
                        <Text key={idx} style={[styles.foodItemText, { color: colors.textTertiary }]}>
                          • {it.qty}x {isTamil ? it.nameTa : it.name}
                        </Text>
                      ))}
                    </View>
                  </View>

                  <TouchableOpacity
                    onPress={() => handleMarkServed(ord.id)}
                    style={[styles.resolveBtn, { backgroundColor: LOCAL_COLORS.emerald500 }]}
                  >
                    <Text style={styles.resolveBtnText}>{t.markServed}</Text>
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>
        )}
      </ScrollView>

      {/* MODAL: PUNCH ORDER */}
      {selectedTableForOrder && (
        <Modal transparent animationType="fade" visible={!!selectedTableForOrder}>
          <View style={styles.modalOverlay}>
            <View style={[styles.modalBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
                📝 Table #{selectedTableForOrder.tableNumber} — {t.takeOrder}
              </Text>

              <Text style={[styles.fieldLabel, { color: colors.textTertiary }]}>Dish Name</Text>
              <TextInput
                value={orderDish}
                onChangeText={setOrderDish}
                style={[styles.input, { backgroundColor: colors.background, color: colors.textPrimary, borderColor: colors.border }]}
              />

              <View style={styles.qtyRow}>
                <Text style={[styles.fieldLabel, { color: colors.textTertiary }]}>Quantity: {orderQty}</Text>
                <View style={styles.qtyBtnGroup}>
                  <TouchableOpacity
                    onPress={() => setOrderQty(Math.max(1, orderQty - 1))}
                    style={[styles.qtyBtn, { borderColor: colors.border }]}
                  >
                    <Text style={[styles.qtyBtnText, { color: colors.textPrimary }]}>-</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setOrderQty(orderQty + 1)}
                    style={[styles.qtyBtn, { borderColor: colors.border }]}
                  >
                    <Text style={[styles.qtyBtnText, { color: colors.textPrimary }]}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <Text style={[styles.fieldLabel, { color: colors.textTertiary }]}>Cooking Instructions</Text>
              <TextInput
                value={orderNote}
                onChangeText={setOrderNote}
                placeholder="e.g. Medium spice, extra gravy"
                placeholderTextColor={colors.textTertiary}
                style={[styles.input, { backgroundColor: colors.background, color: colors.textPrimary, borderColor: colors.border }]}
              />

              <View style={styles.modalFooter}>
                <TouchableOpacity
                  onPress={() => setSelectedTableForOrder(null)}
                  style={[styles.modalCancelBtn, { borderColor: colors.border }]}
                >
                  <Text style={{ color: colors.textTertiary }}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handlePunchOrder}
                  style={[styles.modalSubmitBtn, { backgroundColor: LOCAL_COLORS.amber500 }]}
                >
                  <Text style={{ color: LOCAL_COLORS.dark900, fontWeight: 'bold' }}>Send to Kitchen</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* MODAL: SETTLE BILL */}
      {billingTable && (
        <Modal transparent animationType="fade" visible={!!billingTable}>
          <View style={styles.modalOverlay}>
            <View style={[styles.modalBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
                Settle Bill — Table #{billingTable.tableNumber}
              </Text>

              <View style={[styles.billSummaryBox, { backgroundColor: colors.background }]}>
                <Text style={{ color: colors.textTertiary, fontSize: 13 }}>Total Amount:</Text>
                <Text style={{ color: LOCAL_COLORS.emerald500, fontSize: 24, fontWeight: 'bold' }}>
                  ₹{billingTable.totalAmount || 0}
                </Text>
              </View>

              <View style={styles.modalFooter}>
                <TouchableOpacity
                  onPress={() => setBillingTable(null)}
                  style={[styles.modalCancelBtn, { borderColor: colors.border }]}
                >
                  <Text style={{ color: colors.textTertiary }}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleSettle}
                  style={[styles.modalSubmitBtn, { backgroundColor: LOCAL_COLORS.emerald500 }]}
                >
                  <Text style={{ color: LOCAL_COLORS.dark900, fontWeight: 'bold' }}>Confirm Payment</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
    gap: 6,
  },
  tabText: {
    fontSize: FontSize.xs,
    fontWeight: 'bold',
  },
  scrollContent: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxl * 2,
  },
  floorSelector: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  floorPill: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  floorPillText: {
    fontSize: FontSize.xs,
    fontWeight: 'bold',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  tableCard: {
    width: '47%',
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    padding: Spacing.sm,
    justifyContent: 'space-between',
    minHeight: 160,
  },
  tableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  tableNumberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  tableNumText: {
    fontSize: FontSize.lg,
    fontWeight: '900',
  },
  acBadge: {
    backgroundColor: 'rgba(56, 189, 248, 0.2)',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: Radius.sm,
  },
  acBadgeText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#38BDF8',
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.full,
  },
  statusBadgeText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: 'bold',
  },
  callWarning: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderRadius: Radius.sm,
    padding: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  callWarningText: {
    color: Palette.error,
    fontSize: 10,
    fontWeight: 'bold',
  },
  callResolveText: {
    color: Palette.error,
    fontSize: 10,
    fontWeight: '900',
    textDecorationLine: 'underline',
  },
  occupiedInfo: {
    marginVertical: 4,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoLabel: {
    fontSize: 10,
    fontWeight: '600',
  },
  totalAmountText: {
    fontSize: FontSize.md,
    fontWeight: '900',
    marginTop: 2,
  },
  emptyInfo: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 11,
    fontStyle: 'italic',
  },
  cardFooter: {
    borderTopWidth: 1,
    paddingTop: Spacing.xs,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 4,
  },
  smallBtn: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: Radius.sm,
    alignItems: 'center',
  },
  smallBtnText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  wideBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    borderRadius: Radius.sm,
  },
  callsList: {
    gap: Spacing.md,
  },
  emptyCard: {
    padding: Spacing.xl,
    alignItems: 'center',
    gap: Spacing.sm,
  },
  emptyCardTitle: {
    fontSize: FontSize.md,
    fontWeight: 'bold',
  },
  emptyCardSub: {
    fontSize: FontSize.xs,
    textAlign: 'center',
  },
  callCard: {
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    padding: Spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  callLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    flex: 1,
  },
  callIconBox: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  callTableTitle: {
    fontSize: FontSize.md,
    fontWeight: 'bold',
  },
  callDetail: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    marginTop: 2,
  },
  foodItemText: {
    fontSize: 11,
    marginTop: 2,
  },
  resolveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
  },
  resolveBtnText: {
    fontSize: FontSize.xs,
    fontWeight: 'bold',
    color: LOCAL_COLORS.dark900,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  modalBox: {
    width: '100%',
    borderRadius: Radius.xl,
    borderWidth: 1,
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  modalTitle: {
    fontSize: FontSize.md,
    fontWeight: 'bold',
    marginBottom: Spacing.xs,
  },
  fieldLabel: {
    fontSize: FontSize.xs,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: FontSize.xs,
  },
  qtyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  qtyBtnGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  qtyBtn: {
    width: 32,
    height: 32,
    borderRadius: Radius.sm,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyBtnText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalFooter: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.md,
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  modalSubmitBtn: {
    flex: 1,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    borderRadius: Radius.md,
  },
  billSummaryBox: {
    padding: Spacing.md,
    borderRadius: Radius.md,
    alignItems: 'center',
    marginVertical: Spacing.sm,
  },
});

