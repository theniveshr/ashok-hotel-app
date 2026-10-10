import { AppText as Text } from '../components/ui/AppText';
import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Clipboard,
  Alert,
  Platform,
} from 'react-native';
import { Tag, Copy, Sparkles, Utensils, Hotel, Calendar, Percent, Check } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useTranslation } from '../i18n';
import { Palette, Radius, Spacing, FontSize } from '@ashok-raj/ui';

export interface OffersScreenProps {
  onBack?: () => void;
  onApplyCoupon?: (code: string) => void;
}

interface OfferItem {
  id: string;
  code: string;
  title: string;
  titleTa: string;
  description: string;
  descriptionTa: string;
  discount: string;
  category: 'ALL' | 'FOOD' | 'LODGE' | 'HALL';
  expiry: string;
  color: string;
}

const OFFERS: OfferItem[] = [
  {
    id: 'off-1',
    code: 'WELCOME100',
    title: 'Flat ₹100 Off on First Food Order',
    titleTa: 'முதல் உணவு ஆர்டரில் ₹100 தள்ளுபடி',
    description: 'Valid on orders above ₹399 across all restaurant and bakery items.',
    descriptionTa: '₹399-க்கு மேற்பட்ட ஆர்டர்களுக்கு பொருந்தும்.',
    discount: '₹100 OFF',
    category: 'FOOD',
    expiry: 'Valid till 30 Sep',
    color: '#2563EB',
  },
  {
    id: 'off-2',
    code: 'STAYMORE',
    title: '15% Off on 2+ Nights Stay',
    titleTa: '2+ இரவு தங்குமிடம் முன்பதிவில் 15% தள்ளுபடி',
    description: 'Enjoy a luxurious stay at Ashok Raj Lodge with complimentary breakfast.',
    descriptionTa: 'அசோக் ராஜ் லாட்ஜில் காலை உணவுடன் தங்குங்கள்.',
    discount: '15% OFF',
    category: 'LODGE',
    expiry: 'Valid till 15 Oct',
    color: '#9333EA',
  },
  {
    id: 'off-3',
    code: 'CELEBRATE',
    title: '₹2,000 Off on Mini Hall Booking',
    titleTa: 'மினி ஹால் முன்பதிவில் ₹2,000 தள்ளுபடி',
    description: 'Applicable on birthday celebrations and family function reservations.',
    descriptionTa: 'பிறந்தநாள் விழா மற்றும் குடும்ப நிகழ்ச்சிகளுக்கு பொருந்தும்.',
    discount: '₹2,000 OFF',
    category: 'HALL',
    expiry: 'Valid till 31 Dec',
    color: '#EA580C',
  },
  {
    id: 'off-4',
    code: 'SWEET20',
    title: '20% Off on Bakery & Cakes',
    titleTa: 'பேக்கரி & கேக் வகைகளில் 20% தள்ளுபடி',
    description: 'Freshly baked pastries, cookies, and customized celebration cakes.',
    descriptionTa: 'புதிய கேக்குகள் மற்றும் பேக்கரி உணவுகள்.',
    discount: '20% OFF',
    category: 'FOOD',
    expiry: 'Valid on Weekends',
    color: '#DB2777',
  },
];

export function OffersScreen({ onApplyCoupon }: OffersScreenProps) {
  const { isTamil } = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState<'ALL' | 'FOOD' | 'LODGE' | 'HALL'>('ALL');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopy = (code: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setCopiedCode(code);
    onApplyCoupon?.(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const filteredOffers = selectedCategory === 'ALL'
    ? OFFERS
    : OFFERS.filter((o) => o.category === selectedCategory);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {isTamil ? 'பிரத்யேக சலுகைகள்' : 'Exclusive Offers'}
        </Text>
        <Text style={styles.headerSubtitle}>
          {isTamil
            ? 'அனைத்து சேவைகளுக்கும் சிறப்பு தள்ளுபடிகள்'
            : 'Exciting discounts & coupons for all services'}
        </Text>
      </View>

      {/* Category Filter Chips */}
      <View style={styles.filterBar}>
        {[
          { key: 'ALL',   label: isTamil ? 'அனைத்தும்' : 'All Offers' },
          { key: 'FOOD',  label: isTamil ? 'உணவு' : 'Food & Bakery' },
          { key: 'LODGE', label: isTamil ? 'லாட்ஜ்' : 'Lodge Stay' },
          { key: 'HALL',  label: isTamil ? 'மினி ஹால்' : 'Mini Hall' },
        ].map((f) => {
          const isActive = selectedCategory === f.key;
          return (
            <TouchableOpacity
              key={f.key}
              onPress={() => {
                Haptics.selectionAsync();
                setSelectedCategory(f.key as any);
              }}
              style={[
                styles.filterChip,
                isActive && styles.filterChipActive,
              ]}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.filterChipText,
                  isActive && styles.filterChipTextActive,
                ]}
              >
                {f.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {filteredOffers.map((offer) => {
          const isCopied = copiedCode === offer.code;
          return (
            <View key={offer.id} style={styles.offerCard}>
              <View style={styles.cardHeader}>
                <View style={[styles.discountBadge, { backgroundColor: `${offer.color}15` }]}>
                  <Percent size={14} color={offer.color} />
                  <Text style={[styles.discountText, { color: offer.color }]}>
                    {offer.discount}
                  </Text>
                </View>
                <Text style={styles.expiryText}>{offer.expiry}</Text>
              </View>

              <Text style={styles.offerTitle}>
                {isTamil ? offer.titleTa : offer.title}
              </Text>
              <Text style={styles.offerDesc}>
                {isTamil ? offer.descriptionTa : offer.description}
              </Text>

              {/* Coupon Code Strip */}
              <View style={styles.couponStrip}>
                <View style={styles.codeWrap}>
                  <Tag size={14} color={Palette.blue700} />
                  <Text style={styles.codeText}>{offer.code}</Text>
                </View>

                <TouchableOpacity
                  onPress={() => handleCopy(offer.code)}
                  style={[styles.copyBtn, isCopied && styles.copyBtnDone]}
                  activeOpacity={0.7}
                >
                  {isCopied ? (
                    <>
                      <Check size={14} color="#FFFFFF" strokeWidth={2.5} />
                      <Text style={styles.copyBtnText}>
                        {isTamil ? 'நகலெடுக்கப்பட்டது' : 'Copied!'}
                      </Text>
                    </>
                  ) : (
                    <>
                      <Copy size={14} color="#2563EB" />
                      <Text style={[styles.copyBtnText, { color: '#2563EB' }]}>
                        {isTamil ? 'நகல் செய்க' : 'Copy Code'}
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xs,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 12.5,
    color: '#475569',
    marginTop: 2,
    marginBottom: 8,
    fontWeight: '500',
  },
  filterBar: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.base,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.full,
    backgroundColor: '#F1F5F9',
  },
  filterChipActive: {
    backgroundColor: '#2563EB',
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  scrollContent: {
    padding: Spacing.base,
    paddingBottom: Spacing['6xl'],
    gap: 14,
  },
  offerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Platform.select({
      web: {
        boxShadow: '0 4px 14px rgba(15, 23, 42, 0.05)',
      },
      default: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 3,
      },
    }),
    gap: 6,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  discountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  discountText: {
    fontSize: 12,
    fontWeight: '800',
  },
  expiryText: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '600',
  },
  offerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: -0.1,
  },
  offerDesc: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 16,
    marginBottom: 6,
  },
  couponStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
    padding: 8,
  },
  codeWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingLeft: 4,
  },
  codeText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#2563EB',
    letterSpacing: 0.5,
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  copyBtnDone: {
    backgroundColor: '#16A34A',
    borderColor: '#16A34A',
  },
  copyBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
