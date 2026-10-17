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
  type ViewStyle,
} from 'react-native';
import { Heart, Plus, Utensils, Leaf, Star, Clock } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useTranslation } from '../../i18n';
import { useTheme } from '../../theme/ThemeContext';
import { Radius, Spacing, FontSize, Palette } from '@ashok-raj/ui';
import { resolveFoodImageUrl, getFallbackFoodImage } from '../../utils/foodImageResolver';

export interface FoodCardProps {
  id: string;
  name: string;
  nameTa: string;
  description?: string;
  price: number;
  isVeg: boolean;
  isSpicy?: boolean;
  isAvailable?: boolean;
  imageUrl?: string;
  prepTimeMinutes?: number;
  discountPercentage?: number;
  rating?: number;
  subtitle?: string;
  layout?: 'card' | 'row';
  onPress?: () => void;
  onAddToCart?: () => void;
  quantityInCart?: number;
  cartQuantity?: number;
  style?: StyleProp<ViewStyle>;
}

export function FoodCard({
  id,
  name,
  nameTa,
  description,
  price,
  isVeg,
  isSpicy,
  isAvailable = true,
  imageUrl,
  prepTimeMinutes,
  discountPercentage = 0,
  rating,
  subtitle,
  layout = 'card',
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
    if (!isAvailable) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onAddToCart?.();
  };

  const toggleFavorite = (e: GestureResponderEvent) => {
    e.stopPropagation();
    Haptics.selectionAsync();
    setIsFavorite(!isFavorite);
  };

  const primaryName = isTamil ? (nameTa || name) : name;
  const secondaryName = isTamil ? name : nameTa;

  const numericPrice = Number(price ?? 0);
  const discount = Number(discountPercentage ?? 0);
  const originalPrice = discount > 0 ? Math.round(numericPrice / (1 - discount / 100)) : null;

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

  // ── ROW LAYOUT (Full-width detailed item for list browsing) ───────────────
  if (layout === 'row') {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.88}
        style={[
          styles.rowCard,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
          },
          !isAvailable && { opacity: 0.8 },
          style,
        ]}
      >
        <View style={styles.rowInfo}>
          {/* Diet Dot & Bestseller / Spicy Tags */}
          <View style={styles.rowTagLine}>
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

            {rating !== undefined && rating > 0 && (
              <View style={styles.ratingBadge}>
                <Star size={11} color="#EAB308" fill="#EAB308" />
                <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
              </View>
            )}

            {isSpicy && (
              <View style={[styles.spicyBadge, { backgroundColor: '#FFEDD5' }]}>
                <Text style={styles.spicyBadgeText}>{isTamil ? 'காரம்' : 'Spicy'}</Text>
              </View>
            )}
          </View>

          {/* Name & Tamil Name */}
          <Text style={[styles.rowTitle, { color: colors.textPrimary }]} numberOfLines={2}>
            {primaryName}
          </Text>
          {secondaryName && secondaryName !== primaryName && (
            <Text style={[styles.rowSecondaryName, { color: colors.textSecondary }]} numberOfLines={1}>
              {secondaryName}
            </Text>
          )}

          {/* Price & Strikethrough */}
          <View style={styles.rowPriceLine}>
            <Text style={[styles.rowPrice, { color: Palette.blue700 }]}>
              ₹{numericPrice.toFixed(0)}
            </Text>
            {originalPrice && originalPrice > numericPrice && (
              <Text style={[styles.rowOriginalPrice, { color: colors.textSecondary }]}>
                ₹{originalPrice}
              </Text>
            )}
            {discount > 0 && (
              <View style={styles.discountPill}>
                <Text style={styles.discountPillText}>{discount}% OFF</Text>
              </View>
            )}
          </View>

          {/* Description */}
          {description ? (
            <Text style={[styles.rowDesc, { color: colors.textSecondary }]} numberOfLines={2}>
              {description}
            </Text>
          ) : null}

          {/* Prep time */}
          {prepTimeMinutes && (
            <View style={styles.prepRow}>
              <Clock size={11} color={colors.textTertiary} />
              <Text style={[styles.prepText, { color: colors.textTertiary }]}>
                {prepTimeMinutes} {isTamil ? 'நிமி' : 'mins'}
              </Text>
            </View>
          )}
        </View>

        {/* Right side: Image + Add Button */}
        <View style={styles.rowRight}>
          <View style={styles.rowImageWrap}>
            {fallbackFailed ? (
              <View style={styles.placeholderBox}>
                {isVeg ? (
                  <Leaf size={24} color="#86EFAC" strokeWidth={1.8} />
                ) : (
                  <Utensils size={24} color="#CBD5E1" strokeWidth={1.8} />
                )}
              </View>
            ) : (
              <Image
                source={{ uri: resolvedUri }}
                style={[styles.rowImage, !isAvailable && { opacity: 0.5 }]}
                resizeMode="cover"
                onError={handleImageError}
              />
            )}

            {!isAvailable && (
              <View style={styles.outOfStockOverlay}>
                <Text style={styles.outOfStockText}>
                  {isTamil ? 'விற்றுத் தீர்ந்தது' : 'SOLD OUT'}
                </Text>
              </View>
            )}
          </View>

          {/* Add / Out of Stock Button */}
          {isAvailable ? (
            <TouchableOpacity
              onPress={handleAdd}
              style={[
                styles.rowAddBtn,
                effectiveCartQty > 0 && styles.rowAddBtnActive,
              ]}
              activeOpacity={0.7}
            >
              {effectiveCartQty > 0 ? (
                <Text style={styles.rowAddBtnQtyText}>{effectiveCartQty}</Text>
              ) : (
                <>
                  <Plus size={14} color={Palette.blue700} strokeWidth={2.5} />
                  <Text style={styles.rowAddBtnText}>{isTamil ? 'சேர்' : 'ADD'}</Text>
                </>
              )}
            </TouchableOpacity>
          ) : (
            <View style={styles.rowUnavailableBtn}>
              <Text style={styles.rowUnavailableBtnText}>
                {isTamil ? 'கிடைக்கவில்லை' : 'Unavailable'}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  }

  // ── CARD LAYOUT (Grid / Carousel) ─────────────────────────────────────────
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
        !isAvailable && { opacity: 0.8 },
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
            style={[styles.image, !isAvailable && { opacity: 0.55 }]}
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

        {/* Discount Badge */}
        {discount > 0 && isAvailable && (
          <View style={styles.cardDiscountBadge}>
            <Text style={styles.cardDiscountText}>{discount}% OFF</Text>
          </View>
        )}

        {/* Out of Stock Overlay */}
        {!isAvailable && (
          <View style={styles.outOfStockOverlay}>
            <Text style={styles.outOfStockText}>
              {isTamil ? 'விற்றுத் தீர்ந்தது' : 'SOLD OUT'}
            </Text>
          </View>
        )}

        {/* Favorite Heart Button */}
        <TouchableOpacity
          onPress={toggleFavorite}
          style={styles.favoriteButton}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Heart
            size={14}
            color={isFavorite ? '#EF4444' : '#FFFFFF'}
            fill={isFavorite ? '#EF4444' : 'rgba(0,0,0,0.25)'}
            strokeWidth={2}
          />
        </TouchableOpacity>
      </View>

      {/* Food Info Body */}
      <View style={styles.body}>
        <Text style={[styles.title, { color: colors.textPrimary }]} numberOfLines={1}>
          {primaryName}
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]} numberOfLines={1}>
          {subtitle || description || (isVeg ? (isTamil ? 'சுவையான சைவம்' : 'Soft & Tasty') : (isTamil ? 'சிறப்பு உணவு' : 'Crispy & Delicious'))}
        </Text>

        <View style={styles.bottomRow}>
          <View style={styles.priceContainer}>
            <Text style={[styles.price, { color: Palette.blue700 }]}>
              ₹{numericPrice.toFixed(0)}
            </Text>
            {originalPrice && originalPrice > numericPrice && (
              <Text style={[styles.originalPrice, { color: colors.textSecondary }]}>
                ₹{originalPrice}
              </Text>
            )}
          </View>

          {isAvailable ? (
            <TouchableOpacity
              onPress={handleAdd}
              style={[
                styles.addButton,
                {
                  backgroundColor: 'rgba(37, 99, 235, 0.1)',
                  borderColor: Palette.blue700,
                },
                effectiveCartQty > 0 && styles.addButtonActive,
              ]}
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              {effectiveCartQty > 0 ? (
                <Text style={styles.addQuantityText}>{effectiveCartQty}</Text>
              ) : (
                <Plus size={16} color={Palette.blue700} strokeWidth={2.5} />
              )}
            </TouchableOpacity>
          ) : (
            <View style={styles.cardUnavailableBadge}>
              <Text style={styles.cardUnavailableText}>
                {isTamil ? 'இல்லை' : 'Unavailable'}
              </Text>
            </View>
          )}
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
  cardDiscountBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    zIndex: 10,
    backgroundColor: Palette.rose600,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.sm,
  },
  cardDiscountText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  outOfStockOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 15,
  },
  outOfStockText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.8,
    backgroundColor: 'rgba(239, 68, 68, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.sm,
    textTransform: 'uppercase',
  },
  favoriteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 10,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(0, 0, 0, 0.28)',
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
    fontSize: 11.5,
    color: '#64748B',
    fontWeight: '500',
    marginBottom: 6,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  price: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  originalPrice: {
    fontSize: 11,
    textDecorationLine: 'line-through',
    color: '#94A3B8',
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
  cardUnavailableBadge: {
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: Radius.sm,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  cardUnavailableText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#94A3B8',
  },

  // ── ROW LAYOUT STYLES ─────────────────────────────────────────────────────
  rowCard: {
    flexDirection: 'row',
    padding: Spacing.base,
    borderRadius: Radius.xl,
    borderWidth: 1,
    marginBottom: Spacing.md,
    gap: Spacing.md,
    ...Platform.select({
      web: {
        boxShadow: '0 3px 10px rgba(15, 23, 42, 0.04)',
      },
      default: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
        elevation: 2,
      },
    }),
  },
  rowInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  rowTagLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: '#FEF9C3',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: Radius.sm,
  },
  ratingText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#854D0E',
  },
  spicyBadge: {
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: Radius.sm,
  },
  spicyBadgeText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#C2410C',
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.2,
    marginBottom: 1,
  },
  rowSecondaryName: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
  },
  rowPriceLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginVertical: 3,
  },
  rowPrice: {
    fontSize: 16,
    fontWeight: '800',
  },
  rowOriginalPrice: {
    fontSize: 12,
    textDecorationLine: 'line-through',
  },
  discountPill: {
    backgroundColor: '#FFE4E6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.sm,
  },
  discountPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#E11D48',
  },
  rowDesc: {
    fontSize: 12,
    lineHeight: 16,
    marginTop: 2,
    marginBottom: 4,
  },
  prepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  prepText: {
    fontSize: 11,
    fontWeight: '500',
  },
  rowRight: {
    width: 108,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  rowImageWrap: {
    width: 104,
    height: 94,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    backgroundColor: '#F1F5F9',
    position: 'relative',
  },
  rowImage: {
    width: '100%',
    height: '100%',
  },
  rowAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
    borderWidth: 1.5,
    borderRadius: Radius.full,
    paddingHorizontal: 16,
    paddingVertical: 6,
    marginTop: -14,
    gap: 3,
    ...Platform.select({
      android: { elevation: 3 },
      web: { boxShadow: '0 2px 6px rgba(0,0,0,0.1)' },
    }),
  },
  rowAddBtnActive: {
    backgroundColor: Palette.blue700,
    borderColor: Palette.blue700,
  },
  rowAddBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: Palette.blue700,
    letterSpacing: 0.3,
  },
  rowAddBtnQtyText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  rowUnavailableBtn: {
    backgroundColor: '#F1F5F9',
    borderColor: '#CBD5E1',
    borderWidth: 1,
    borderRadius: Radius.full,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginTop: -12,
  },
  rowUnavailableBtnText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94A3B8',
  },
});
