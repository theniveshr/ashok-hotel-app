import { AppText as Text } from './AppText';
import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Image,
  Platform,
  type GestureResponderEvent,
  type StyleProp,
  type ViewStyle
} from 'react-native';
import { Users, Bed, Heart, Plus, ChevronRight } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useTranslation } from '../../i18n';
import { Radius, Spacing, FontSize, Palette } from '@ashok-raj/ui';

export interface RoomCardProps {
  id?: string;
  name?: string;
  title?: string;
  nameTa?: string;
  titleTa?: string;
  description?: string;
  basePrice?: number;
  pricePerNight?: number;
  price?: number;
  maxOccupancy?: number;
  maxGuests?: number;
  bedType?: string;
  isAc?: boolean;
  imageUrl?: string;
  amenities?: string[];
  amenitiesTa?: string[];
  isAvailable?: boolean;
  compact?: boolean;
  onPress?: () => void;
  onBookPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

import { resolveRoomImageUrl, getFallbackRoomImage } from '../../utils/lodgeImageResolver';

export function RoomCard({
  name,
  title,
  nameTa,
  titleTa,
  description,
  basePrice,
  pricePerNight,
  price,
  maxOccupancy = 2,
  maxGuests,
  bedType = 'King Bed',
  isAc = true,
  imageUrl,
  amenities = ['AC', 'WiFi', 'TV'],
  amenitiesTa,
  isAvailable = true,
  compact = false,
  onPress,
  onBookPress,
  style,
}: RoomCardProps) {
  const { isTamil } = useTranslation();
  const [isFavorite, setIsFavorite] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [fallbackFailed, setFallbackFailed] = useState(false);

  const displayName = isTamil
    ? nameTa || titleTa || name || title || ''
    : name || title || nameTa || titleTa || '';

  const safePrice = Number(basePrice ?? pricePerNight ?? price ?? 1800);
  const safeOccupancy = maxOccupancy ?? maxGuests ?? 2;
  const roomImageUri = imgError
    ? getFallbackRoomImage(displayName)
    : resolveRoomImageUrl(displayName, imageUrl, isAc);

  const handleImageError = () => {
    if (!imgError) {
      setImgError(true);
    } else {
      setFallbackFailed(true);
    }
  };

  const handleBook = (e: GestureResponderEvent) => {
    e.stopPropagation();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onBookPress?.();
  };

  const toggleFavorite = (e: GestureResponderEvent) => {
    e.stopPropagation();
    Haptics.selectionAsync();
    setIsFavorite(!isFavorite);
  };

  if (compact) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.88}
        style={[styles.compactCard, style]}
      >
        <View style={styles.compactImageWrap}>
          {fallbackFailed ? (
            <View style={[styles.image, { backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center' }]}>
              <Bed size={22} color="#94A3B8" />
            </View>
          ) : (
            <Image
              source={{ uri: roomImageUri }}
              style={styles.image}
              resizeMode="cover"
              onError={handleImageError}
            />
          )}
          <TouchableOpacity
            onPress={toggleFavorite}
            style={styles.favoriteButton}
            activeOpacity={0.7}
          >
            <Heart
              size={16}
              color={isFavorite ? '#EF4444' : '#FFFFFF'}
              fill={isFavorite ? '#EF4444' : 'rgba(0,0,0,0.2)'}
              strokeWidth={2}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.compactBody}>
          <Text style={styles.compactTitle} numberOfLines={1}>
            {displayName}
          </Text>
          <Text style={styles.compactSubtitle} numberOfLines={1}>
            {`${safeOccupancy} ${isTamil ? 'விருந்தினர்' : 'Guests'} • ${isAc ? 'AC' : 'Non-AC'} • Wi-Fi`}
          </Text>

          <View style={styles.compactBottomRow}>
            <View style={styles.priceRow}>
              <Text style={styles.compactPrice}>₹{safePrice.toLocaleString()}</Text>
              <Text style={styles.compactPerNight}> / night</Text>
            </View>

            <TouchableOpacity
              onPress={handleBook}
              style={styles.addButton}
              activeOpacity={0.7}
            >
              <Plus size={16} color={Palette.blue700} strokeWidth={2.5} />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.88}
      style={[styles.card, style]}
    >
      <View style={styles.imageWrap}>
        {fallbackFailed ? (
          <View style={[styles.image, { backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center' }]}>
            <Bed size={32} color="#94A3B8" />
          </View>
        ) : (
          <Image
            source={{ uri: roomImageUri }}
            style={styles.image}
            resizeMode="cover"
            onError={handleImageError}
          />
        )}
        <View style={[styles.statusBadge, { backgroundColor: isAvailable ? '#DCFCE7' : '#FEE2E2' }]}>
          <Text style={[styles.statusText, { color: isAvailable ? '#15803D' : '#B91C1C' }]}>
            {isAvailable ? (isTamil ? 'கிடைக்கும்' : 'Available') : (isTamil ? 'முழுமை' : 'Full')}
          </Text>
        </View>
      </View>

      <View style={styles.body}>
        <View style={styles.headerRow}>
          <Text style={styles.title} numberOfLines={1}>
            {displayName}
          </Text>
          <View style={styles.priceContainer}>
            <Text style={styles.price}>₹{safePrice.toLocaleString()}</Text>
            <Text style={styles.perNight}> / {isTamil ? 'இரவு' : 'night'}</Text>
          </View>
        </View>

        {description ? (
          <Text style={styles.description} numberOfLines={2}>
            {description}
          </Text>
        ) : null}

        <View style={styles.tagsRow}>
          <View style={styles.tagPill}>
            <Users size={12} color={Palette.blue700} />
            <Text style={styles.tagText}>{safeOccupancy} {isTamil ? 'பேர்' : 'Guests'}</Text>
          </View>
          <View style={styles.tagPill}>
            <Bed size={12} color={Palette.blue700} />
            <Text style={styles.tagText}>{bedType}</Text>
          </View>
          {isAc && (
            <View style={styles.tagPill}>
              <Text style={styles.tagText}>AC</Text>
            </View>
          )}
        </View>

        <TouchableOpacity
          onPress={handleBook}
          disabled={!isAvailable}
          style={[styles.bookBtn, !isAvailable && styles.bookBtnDisabled]}
          activeOpacity={0.8}
        >
          <Text style={styles.bookBtnText}>
            {isTamil ? 'அறை முன்பதிவு செய்க' : 'Book Room'}
          </Text>
          <ChevronRight size={16} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  // Compact Card (for horizontal scrolls)
  compactCard: {
    width: 175,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    ...Platform.select({
      web: {
        boxShadow: '0 4px 12px rgba(15, 23, 42, 0.05)',
      },
      default: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
      },
    }),
  },
  compactImageWrap: {
    width: '100%',
    height: 110,
    position: 'relative',
    backgroundColor: '#F1F5F9',
    overflow: 'hidden',
    borderTopLeftRadius: 17,
    borderTopRightRadius: 17,
  },
  compactBody: {
    padding: 10,
    gap: 2,
  },
  compactTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  compactSubtitle: {
    fontSize: 12,
    color: '#1E293B',
    fontWeight: '600',
    marginBottom: 4,
  },
  compactBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  compactPrice: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  compactPerNight: {
    fontSize: 11,
    color: '#334155',
    fontWeight: '700',
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#DBEAFE',
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Full Card
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    marginBottom: Spacing.md,
    ...Platform.select({
      web: {
        boxShadow: '0 4px 16px rgba(15, 23, 42, 0.06)',
      },
      default: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
        elevation: 3,
      },
    }),
  },
  imageWrap: {
    height: 160,
    position: 'relative',
    backgroundColor: '#F1F5F9',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  favoriteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  body: {
    padding: Spacing.base,
    gap: Spacing.xs,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: FontSize.md + 1,
    fontWeight: '800',
    color: '#0F172A',
    flex: 1,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  price: {
    fontSize: FontSize.lg,
    fontWeight: '800',
    color: Palette.blue700,
  },
  perNight: {
    fontSize: FontSize.xs,
    color: '#334155',
    fontWeight: '700',
  },
  description: {
    fontSize: FontSize.xs + 1,
    color: '#1E293B',
    lineHeight: 18,
    fontWeight: '500',
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginVertical: 4,
  },
  tagPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '600',
    color: Palette.blue700,
  },
  bookBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Palette.blue700,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 6,
  },
  bookBtnDisabled: {
    backgroundColor: '#9CA3AF',
  },
  bookBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
