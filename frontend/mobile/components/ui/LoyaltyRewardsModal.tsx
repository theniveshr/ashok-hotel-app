import React, { useEffect } from 'react';
import {
  Modal,
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { AppText as Text } from './AppText';
import {
  Award,
  Crown,
  Sparkles,
  Coffee,
  BedDouble,
  Zap,
  Clock,
  ArrowUpRight,
  ArrowDownLeft,
  Gift,
  X,
} from 'lucide-react-native';
import { useTranslation } from '../../i18n';
import { useLoyaltyStore } from '../../store/useLoyaltyStore';

interface LoyaltyRewardsModalProps {
  visible: boolean;
  onClose: () => void;
}

export function LoyaltyRewardsModal({ visible, onClose }: LoyaltyRewardsModalProps) {
  const { isTamil } = useTranslation();
  const { loyalty, fetchLoyalty } = useLoyaltyStore();

  useEffect(() => {
    if (visible) {
      fetchLoyalty();
    }
  }, [visible, fetchLoyalty]);

  const getPerkIcon = (iconName?: string) => {
    switch (iconName) {
      case 'Coffee':
        return <Coffee size={20} color="#2563EB" />;
      case 'BedDouble':
        return <BedDouble size={20} color="#2563EB" />;
      case 'Zap':
        return <Zap size={20} color="#2563EB" />;
      case 'Clock':
        return <Clock size={20} color="#2563EB" />;
      default:
        return <Gift size={20} color="#2563EB" />;
    }
  };

  const currentPoints = loyalty.points || 1250;
  const targetPoints = 2000;
  const progressPercent = Math.min(100, Math.round((currentPoints / targetPoints) * 100));

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.headerIconWrap}>
                <Crown size={22} color="#2563EB" />
              </View>
              <View>
                <Text style={styles.headerTitle}>
                  {isTamil ? 'அசோக் ராஜ் கிளப்' : 'Ashok Raj Club'}
                </Text>
                <Text style={styles.headerSubtitle}>
                  {isTamil ? 'பிரத்யேக வெகுமதிகள் & சலுகைகள்' : 'Member Loyalty & Privileges'}
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.8}>
              <X size={20} color="#64748B" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            {/* VIP Card */}
            <View style={styles.vipCard}>
              <View style={styles.cardHeaderRow}>
                <View style={styles.badgeRow}>
                  <Sparkles size={16} color="#FFFFFF" />
                  <Text style={styles.badgeText}>
                    {isTamil ? 'கிளப் உறுப்பினர்' : 'CLUB MEMBER'}
                  </Text>
                </View>
                <Text style={styles.hotelBrand}>ASHOK RAJ</Text>
              </View>

              <View style={styles.pointsBlock}>
                <Text style={styles.pointsLabel}>
                  {isTamil ? 'தற்போதைய இருப்பு' : 'Current Reward Points'}
                </Text>
                <View style={styles.pointsValueRow}>
                  <Text style={styles.pointsValue}>{currentPoints.toLocaleString()}</Text>
                  <Text style={styles.pointsSuffix}>{isTamil ? 'புள்ளிகள்' : 'Pts'}</Text>
                </View>
                <Text style={styles.rupeeEquivalent}>
                  {isTamil
                    ? `மதிப்பு: ₹${loyalty.rupeeEquivalent || 312.5} உடனடி தள்ளுபடி`
                    : `Worth ₹${loyalty.rupeeEquivalent || 312.5} in instant savings`}
                </Text>
              </View>

              {/* Progress Bar */}
              <View style={styles.progressContainer}>
                <View style={styles.progressHeader}>
                  <Text style={styles.progressLabel}>
                    {isTamil ? 'அடுத்த நிலை இலக்கு' : 'Next Tier Goal'}
                  </Text>
                  <Text style={styles.progressRemaining}>
                    {isTamil
                      ? `இன்னும் ${loyalty.pointsToNextTier || 750} புள்ளிகள்`
                      : `${loyalty.pointsToNextTier || 750} pts to go`}
                  </Text>
                </View>
                <View style={styles.progressBarBg}>
                  <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
                </View>
              </View>
            </View>

            {/* Privileges Section */}
            <Text style={styles.sectionTitle}>
              {isTamil ? 'உங்கள் பிரத்யேக சலுகைகள்' : 'Your Member Privileges'}
            </Text>

            <View style={styles.perksList}>
              {loyalty.perks.map((perk, idx) => (
                <View key={idx} style={styles.perkCard}>
                  <View style={styles.perkIconWrap}>{getPerkIcon(perk.iconName)}</View>
                  <View style={styles.perkInfo}>
                    <Text style={styles.perkTitle}>
                      {isTamil ? perk.titleTa : perk.title}
                    </Text>
                    <Text style={styles.perkDesc}>
                      {isTamil ? perk.descriptionTa : perk.description}
                    </Text>
                  </View>
                </View>
              ))}
            </View>

            {/* Points Activity History */}
            <Text style={styles.sectionTitle}>
              {isTamil ? 'புள்ளிகள் வரலாறு' : 'Points Activity History'}
            </Text>

            <View style={styles.txList}>
              {loyalty.recentTransactions.map((tx) => {
                const isEarn = tx.type === 'EARN' || tx.type === 'BONUS';
                return (
                  <View key={tx.id} style={styles.txItem}>
                    <View
                      style={[
                        styles.txIconWrap,
                        isEarn ? styles.txEarnIcon : styles.txRedeemIcon,
                      ]}
                    >
                      {isEarn ? (
                        <ArrowDownLeft size={16} color="#16A34A" />
                      ) : (
                        <ArrowUpRight size={16} color="#EF4444" />
                      )}
                    </View>

                    <View style={styles.txInfo}>
                      <Text style={styles.txDesc} numberOfLines={1}>
                        {isTamil ? tx.descriptionTa : tx.description}
                      </Text>
                      <Text style={styles.txDate}>
                        {new Date(tx.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </Text>
                    </View>

                    <Text
                      style={[
                        styles.txPoints,
                        isEarn ? styles.txEarnPoints : styles.txRedeemPoints,
                      ]}
                    >
                      {isEarn ? `+${tx.points}` : `${tx.points}`}
                    </Text>
                  </View>
                );
              })}
            </View>

            <View style={{ height: 36 }} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '90%',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    padding: 20,
  },
  vipCard: {
    backgroundColor: '#EFF6FF',
    borderRadius: 22,
    padding: 20,
    borderWidth: 1.5,
    borderColor: '#2563EB',
    marginBottom: 24,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563EB',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 6,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  hotelBrand: {
    color: '#2563EB',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  pointsBlock: {
    marginBottom: 16,
  },
  pointsLabel: {
    color: '#64748B',
    fontSize: 12,
    marginBottom: 4,
  },
  pointsValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  pointsValue: {
    color: '#0F172A',
    fontSize: 36,
    fontWeight: '800',
  },
  pointsSuffix: {
    color: '#2563EB',
    fontSize: 16,
    fontWeight: '700',
  },
  rupeeEquivalent: {
    color: '#16A34A',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 4,
  },
  progressContainer: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#DBEAFE',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progressLabel: {
    color: '#475569',
    fontSize: 12,
    fontWeight: '600',
  },
  progressRemaining: {
    color: '#2563EB',
    fontSize: 12,
    fontWeight: '600',
  },
  progressBarBg: {
    height: 7,
    borderRadius: 4,
    backgroundColor: '#DBEAFE',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#2563EB',
    borderRadius: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 14,
  },
  perksList: {
    gap: 12,
    marginBottom: 24,
  },
  perkCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 14,
    gap: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  perkIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  perkInfo: {
    flex: 1,
  },
  perkTitle: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  perkDesc: {
    color: '#64748B',
    fontSize: 12,
    lineHeight: 16,
  },
  txList: {
    backgroundColor: '#F8FAFC',
    borderRadius: 18,
    padding: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  txItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    gap: 12,
  },
  txIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  txEarnIcon: {
    backgroundColor: '#DCFCE7',
  },
  txRedeemIcon: {
    backgroundColor: '#FEE2E2',
  },
  txInfo: {
    flex: 1,
  },
  txDesc: {
    color: '#0F172A',
    fontSize: 13,
    fontWeight: '600',
  },
  txDate: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 2,
  },
  txPoints: {
    fontSize: 15,
    fontWeight: '700',
  },
  txEarnPoints: {
    color: '#16A34A',
  },
  txRedeemPoints: {
    color: '#DC2626',
  },
});
