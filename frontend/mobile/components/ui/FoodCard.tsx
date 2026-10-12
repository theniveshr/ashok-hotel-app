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
import { Heart, Plus, Utensils, Leaf } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useTranslation } from '../../i18n';
import { useTheme } from '../../theme/ThemeContext';
import { Radius, Spacing, FontSize, Palette } from '@ashok-raj/ui';

export interface FoodCardProps {
  id: string;
  name: string;
  nameTa: string;
  description?: string;
  price: number;
  isVeg: boolean;
  isSpicy?: boolean;
  imageUrl?: string;
  prepTimeMinutes?: number;
  subtitle?: string;
  onPress?: () => void;
  onAddToCart?: () => void;
  quantityInCart?: number;
  cartQuantity?: number;
  style?: StyleProp<ViewStyle>;
}

import { resolveFoodImageUrl, getFallbackFoodImage } from '../../utils/foodImageResolver';

export function FoodCard({
  id,
  name,
  nameTa,
  description,
  price,
  isVeg,
  imageUrl,
  subtitle,
  onPress,
  onAddToCart,
  quantityInCart = 0,
  cartQuantity = 0,
  style,
}: FoodCardProps) {
  const { isTamil } = useTranslation();
  const { colors, isDark } = useTheme();
  const [isFavorite, setIsFavorite] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [fallbackFailed, setFallbackFailed] = useState(false);

  const effectiveCartQty = quantityInCart || cartQuantity || 0;

  const handleAdd = (e: GestureResponderEvent) => {
    e.stopPropagation();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onAddToCart?.();
  };

  const toggleFavorite = (e: GestureResponderEvent) => {
    e.stopPropagation();
    Haptics.selectionAsync();
    setIsFavorite(!isFavorite);
  };

  const displayName = isTamil ? nameTa : name;
  const subText =
    subtitle ||
    (description
      ? description.length > 25
        ? `${description.slice(0, 24)}...`
        : description
      : isVeg
      ? isTamil
        ? 'சுவையான சைவம்'
        : 'Soft & Tasty'
      : isTamil
      ? 'சிறப்பு உணவு'
      : 'Crispy & Delicious');

  const resolvedUri = imgError
    ? getFallbackFoodImage(name, isVeg)
    : resolveFoodImageUrl(name, imageUrl, isVeg);

  const handleImageError = () => {
    if (!imgError) {
      setImgError(true);
    } else {
      setFallbackFailed(true);
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.88}
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
        style,
      ]}
    >
      {/* Food Image Container */}
      <View style={styles.imageWrap}>
        {fallbackFailed ? (
          <View style={styles.placeholderBox}>
            {isVeg ? (
              <Leaf size={28} color="#86EFAC" strokeWidth={1.8} />
            ) : (
              <Utensils size={28} color="#CBD5E1" strokeWidth={1.8} />
            )}
          </View>
        ) : (
          <Image
            source={{ uri: resolvedUri }}
            style={styles.image}
            resizeMode="cover"
            onError={handleImageError}
          />
        )}

        {/* Veg / Non-Veg Indicator Badge */}
        <View style={styles.dietBadge}>
          <View
            style={[
              styles.dietBadgeInner,
              { borderColor: isVeg ? '#16A34A' : '#DC2626' },
            ]}
          >
            <View
              style={[
                styles.dietBadgeDot,
                { backgroundColor: isVeg ? '#16A34A' : '#DC2626' },
              ]}
            />
          </View>
        </View>

        {/* Favorite Heart Button */}
        <TouchableOpacity
          onPress={toggleFavorite}
          style={styles.favoriteButton}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Heart
            size={15}
            color={isFavorite ? '#EF4444' : '#FFFFFF'}
            fill={isFavorite ? '#EF4444' : 'rgba(0,0,0,0.25)'}
            strokeWidth={2}
          />
        </TouchableOpacity>
      </View>

      {/* Food Info Body */}
      <View style={styles.body}>
        <Text style={[styles.title, { color: colors.textPrimary }]} numberOfLines={1}>
          {displayName}
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]} numberOfLines={1}>
          {subText}
        </Text>

        <View style={styles.bottomRow}>
          <Text style={[styles.price, { color: colors.textAccent }]}>
            ₹{Number(price ?? 0).toFixed(0)}
          </Text>

          <TouchableOpacity
            onPress={handleAdd}
            style={[
              styles.addButton,
              {
                backgroundColor: 'rgba(37, 99, 235, 0.1)',
                borderColor: colors.accent,
              },
              effectiveCartQty > 0 && styles.addButtonActive,
            ]}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            {effectiveCartQty > 0 ? (
              <Text style={styles.addQuantityText}>{effectiveCartQty}</Text>
            ) : (
              <Plus size={16} color={colors.accent} strokeWidth={2.5} />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 165,
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
  imageWrap: {
    width: '100%',
    height: 110,
    position: 'relative',
    backgroundColor: '#F1F5F9',
    overflow: 'hidden',
    borderTopLeftRadius: 17,
    borderTopRightRadius: 17,
  },
  placeholderBox: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  image: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  dietBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    zIndex: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderRadius: 4,
    padding: 2,
    ...Platform.select({
      android: {
        elevation: 3,
      },
    }),
  },
  dietBadgeInner: {
    width: 13,
    height: 13,
    borderWidth: 1.2,
    borderRadius: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dietBadgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  favoriteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 10,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      android: {
        elevation: 3,
      },
    }),
  },
  body: {
    padding: 10,
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: -0.1,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
    marginBottom: 6,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
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
  addButtonActive: {
    backgroundColor: Palette.blue700,
    borderColor: Palette.blue700,
  },
  addQuantityText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
});

