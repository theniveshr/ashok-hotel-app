import { AppText as Text } from '../components/ui/AppText';
import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator
} from 'react-native';
import { Clock, Flame, Check, Star, Heart, Leaf, ShieldAlert } from 'lucide-react-native';
import { useTheme } from '../theme/ThemeContext';
import { useTranslation } from '../i18n';
import { Header } from '../components/ui/Header';
import { PrimaryButton } from '../components/ui/PrimaryButton';
import { QuantitySelector } from '../components/ui/QuantitySelector';
import { Radius, Spacing, FontSize, Palette } from '@ashok-raj/ui';
import { useMenuStore } from '../store/useMenuStore';
import { useCartStore } from '../store/useCartStore';
import { resolveFoodImageUrl } from '../utils/foodImageResolver';

export interface FoodDetailScreenProps {
  id?: string;
  onBack: () => void;
  onAddToCart?: (qty: number) => void;
}

export function FoodDetailScreen({
  id = 'item-1',
  onBack,
  onAddToCart,
}: FoodDetailScreenProps) {
  const { colors } = useTheme();
  const { t, isTamil } = useTranslation();

  const { fetchItemDetail, favorites, toggleFavorite } = useMenuStore();
  const { addItem } = useCartStore();

  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [specialInstructions, setSpecialInstructions] = useState('');

  const isFav = favorites.includes(id);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    fetchItemDetail(id).then((fetchedItem) => {
      if (isMounted) {
        setItem(fetchedItem);
        setLoading(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [id]);

  const toggleAddon = (addonId: string) => {
    setSelectedAddons((prev) =>
      prev.includes(addonId) ? prev.filter((a) => a !== addonId) : [...prev, addonId]
    );
  };

  if (loading || !item) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Header showBack onBackPress={onBack} title={isTamil ? 'உணவு விவரம்' : 'Dish Details'} />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Palette.blue700} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            {isTamil ? 'விவரங்கள் பெறப்படுகின்றன...' : 'Fetching dish details...'}
          </Text>
        </View>
      </View>
    );
  }

  const basePrice = item.price ?? 100;
  const discountPercent = item.discountPercentage ?? 0;
  const discountedBase = discountPercent > 0 ? basePrice * (1 - discountPercent / 100) : basePrice;

  const addonsList = item.addons || [];
  const addonsTotal = selectedAddons.reduce((sum: number, addonId: string) => {
    const found = addonsList.find((a: any) => a.id === addonId);
    return sum + (found?.price ?? 0);
  }, 0);

  const finalUnitPrice = discountedBase + addonsTotal;
  const totalPrice = Math.round(finalUnitPrice * quantity);

  const handleAddToCart = () => {
    addItem({
      id: item.id,
      name: item.name,
      nameTa: item.nameTa,
      price: Math.round(discountedBase),
      discountPercentage: discountPercent,
      isVeg: item.isVegetarian,
      quantity,
      addons: selectedAddons.map((addonId: string) => {
        const addon = addonsList.find((candidate: any) => candidate.id === addonId);
        return addon
          ? { id: addon.id, name: addon.name, nameTa: addon.nameTa, price: Number(addon.price) }
          : addonId;
      }),
      imageUrl: item.imageUrl,
    });
    if (onAddToCart) onAddToCart(quantity);
    onBack();
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        showBack
        onBackPress={onBack}
        title={isTamil ? 'உணவு விவரம்' : 'Dish Details'}
        rightElement={
          <TouchableOpacity onPress={() => toggleFavorite(item.id)} style={styles.headerFavBtn}>
            <Heart
              size={22}
              color={isFav ? Palette.rose500 : colors.textSecondary}
              fill={isFav ? Palette.rose500 : 'transparent'}
            />
          </TouchableOpacity>
        }
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Food Image Banner */}
        <View style={styles.imageWrapper}>
          <Image
            source={{
              uri: resolveFoodImageUrl(item.name, item.imageUrl, item.isVegetarian),
            }}
            style={styles.foodImage}
            resizeMode="cover"
          />
          {discountPercent > 0 && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>{discountPercent}% OFF</Text>
            </View>
          )}
        </View>

        {/* Title & Price Header */}
        <View style={styles.titleSection}>
          <View style={styles.titleLeft}>
            <View style={styles.dietRow}>
              <View
                style={[
                  styles.dietSquare,
                  { borderColor: item.isVegetarian ? Palette.emerald600 : Palette.rose600 },
                ]}
              >
                <View
                  style={[
                    styles.dietDot,
                    { backgroundColor: item.isVegetarian ? Palette.emerald600 : Palette.rose600 },
                  ]}
                />
              </View>
              <Text
                style={[
                  styles.dietText,
                  { color: item.isVegetarian ? Palette.emerald700 : Palette.rose700 },
                ]}
              >
                {item.isVegetarian
                  ? isTamil
                    ? 'சைவம் (Veg)'
                    : 'Vegetarian'
                  : isTamil
                  ? 'அசைவம் (Non-Veg)'
                  : 'Non-Vegetarian'}
              </Text>
            </View>
            <Text style={[styles.title, { color: colors.textPrimary }]}>
              {isTamil ? item.nameTa || item.name : item.name}
            </Text>
            {isTamil && <Text style={[styles.subTitle, { color: colors.textSecondary }]}>{item.name}</Text>}
          </View>

          <View style={styles.priceContainer}>
            <Text style={[styles.price, { color: Palette.blue700 }]}>₹{Math.round(discountedBase)}</Text>
            {discountPercent > 0 && (
              <Text style={[styles.originalPrice, { color: colors.textSecondary }]}>₹{basePrice}</Text>
            )}
          </View>
        </View>

        {/* Key Metrics Row */}
        <View style={styles.metricsRow}>
          <View style={[styles.metricPill, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Star size={14} color={Palette.blue700} fill={Palette.blue700} />
            <Text style={[styles.metricText, { color: colors.textPrimary }]}>
              {item.rating ?? 4.8} ({item.reviewCount ?? 42})
            </Text>
          </View>

          <View style={[styles.metricPill, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Clock size={14} color={colors.textSecondary} />
            <Text style={[styles.metricText, { color: colors.textPrimary }]}>
              {item.preparationTimeMinutes ?? 20} {isTamil ? 'நிமி' : 'mins'}
            </Text>
          </View>

          {item.isSpicy && (
            <View style={[styles.metricPill, { backgroundColor: Palette.amber100, borderColor: Palette.amber300 }]}>
              <Flame size={14} color={Palette.amber700} />
              <Text style={[styles.metricText, { color: Palette.amber800 }]}>
                {isTamil ? 'காரம்' : 'Spicy'}
              </Text>
            </View>
          )}

          {item.calories && (
            <View style={[styles.metricPill, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.metricText, { color: colors.textSecondary }]}>{item.calories} kcal</Text>
            </View>
          )}
        </View>

        {/* Description */}
        <Text style={[styles.description, { color: colors.textSecondary }]}>
          {isTamil
            ? item.descriptionTa || item.description
            : item.description || item.descriptionTa}
        </Text>

        {/* Ingredients & Allergens */}
        {item.ingredients && item.ingredients.length > 0 && (
          <View style={styles.infoBox}>
            <View style={styles.infoBoxHeader}>
              <Leaf size={14} color={Palette.emerald600} />
              <Text style={[styles.infoBoxTitle, { color: colors.textPrimary }]}>
                {isTamil ? 'சேர்க்கப்பட்டுள்ள பொருட்கள்' : 'Ingredients'}
              </Text>
            </View>
            <Text style={[styles.infoBoxBody, { color: colors.textSecondary }]}>
              {item.ingredients.join(' • ')}
            </Text>
          </View>
        )}

        {item.allergens && item.allergens.length > 0 && (
          <View style={[styles.infoBox, { borderColor: Palette.amber300 }]}>
            <View style={styles.infoBoxHeader}>
              <ShieldAlert size={14} color={Palette.amber600} />
              <Text style={[styles.infoBoxTitle, { color: Palette.amber900 }]}>
                {isTamil ? 'அலர்ஜி எச்சரிக்கை' : 'Allergens Warning'}
              </Text>
            </View>
            <Text style={[styles.infoBoxBody, { color: colors.textSecondary }]}>
              {item.allergens.join(', ')}
            </Text>
          </View>
        )}

        {/* Addons Customization List */}
        {addonsList.length > 0 && (
          <View style={styles.sectionWrapper}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              {isTamil ? 'கூடுதல் விருப்பங்கள் (Addons)' : 'Add-on Customizations'}
            </Text>

            <View style={styles.addonsList}>
              {addonsList.map((addon: any) => {
                const isSelected = selectedAddons.includes(addon.id);
                return (
                  <TouchableOpacity
                    key={addon.id}
                    onPress={() => toggleAddon(addon.id)}
                    activeOpacity={0.8}
                    style={[
                      styles.addonItem,
                      {
                        backgroundColor: colors.surface,
                        borderColor: isSelected ? Palette.blue700 : colors.border,
                      },
                    ]}
                  >
                    <View style={styles.addonLeft}>
                      <View
                        style={[
                          styles.checkbox,
                          {
                            backgroundColor: isSelected ? Palette.blue700 : 'transparent',
                            borderColor: isSelected ? Palette.blue700 : colors.border,
                          },
                        ]}
                      >
                        {isSelected && <Check size={12} color={Palette.white} />}
                      </View>
                      <Text style={[styles.addonName, { color: colors.textPrimary }]}>
                        {isTamil ? addon.nameTa || addon.name : addon.name}
                      </Text>
                    </View>

                    <Text style={[styles.addonPrice, { color: Palette.blue700 }]}>
                      +₹{addon.price}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* Special Instructions */}
        <View style={styles.sectionWrapper}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            {t('restaurant.specialInstructions')}
          </Text>
          <TextInput
            value={specialInstructions}
            onChangeText={setSpecialInstructions}
            placeholder={t('restaurant.specialInstructionsPlaceholder')}
            placeholderTextColor={colors.textTertiary}
            multiline
            numberOfLines={3}
            style={[
              styles.instructionsInput,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                color: colors.textPrimary,
              },
            ]}
          />
        </View>

        {/* Guest Reviews Section */}
        {item.reviews && item.reviews.length > 0 && (
          <View style={styles.sectionWrapper}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              {isTamil ? 'வாடிக்கையாளர் விமர்சனங்கள்' : 'Guest Reviews'}
            </Text>
            {item.reviews.map((rev: any) => (
              <View key={rev.id} style={[styles.reviewCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={styles.reviewHeader}>
                  <Text style={[styles.reviewerName, { color: colors.textPrimary }]}>{rev.userName}</Text>
                  <View style={styles.reviewStars}>
                    <Star size={12} color={Palette.blue700} fill={Palette.blue700} />
                    <Text style={[styles.reviewRating, { color: Palette.blue700 }]}>{rev.rating}</Text>
                  </View>
                </View>
                <Text style={[styles.reviewComment, { color: colors.textSecondary }]}>
                  {isTamil ? rev.commentTa || rev.comment : rev.comment}
                </Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Bottom Fixed Action Bar */}
      <View
        style={[
          styles.bottomBar,
          {
            backgroundColor: colors.surface,
            borderTopColor: colors.border,
          },
        ]}
      >
        <QuantitySelector
          quantity={quantity}
          onIncrement={() => setQuantity(quantity + 1)}
          onDecrement={() => setQuantity(Math.max(1, quantity - 1))}
          min={1}
        />

        <PrimaryButton
          title={`${t('restaurant.addToCart')} • ₹${totalPrice}`}
          onPress={handleAddToCart}
          style={styles.addBtn}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: Spacing.md,
    fontSize: 14,
  },
  headerFavBtn: {
    padding: Spacing.xs,
  },
  scrollContent: {
    padding: Spacing.base,
    paddingBottom: Spacing['6xl'],
  },
  imageWrapper: {
    height: 220,
    borderRadius: Radius.xl,
    overflow: 'hidden',
    marginBottom: Spacing.md,
    position: 'relative',
  },
  foodImage: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  discountBadge: {
    position: 'absolute',
    top: Spacing.sm,
    left: Spacing.sm,
    backgroundColor: Palette.rose600,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.sm,
  },
  discountText: {
    color: '#FFF',
    fontWeight: '800',
    fontSize: 12,
  },
  titleSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  titleLeft: {
    flex: 1,
    paddingRight: Spacing.sm,
  },
  dietRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  dietSquare: {
    width: 14,
    height: 14,
    borderRadius: 2,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dietDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  dietText: {
    fontSize: 12,
    fontWeight: '700',
  },
  title: {
    fontSize: FontSize.xl,
    fontWeight: '800',
  },
  subTitle: {
    fontSize: 12,
    marginTop: 2,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: FontSize['2xl'],
    fontWeight: '800',
  },
  originalPrice: {
    fontSize: FontSize.sm,
    textDecorationLine: 'line-through',
    marginTop: 2,
  },
  metricsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  metricPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  metricText: {
    fontSize: 12,
    fontWeight: '600',
  },
  description: {
    fontSize: FontSize.sm + 1,
    lineHeight: 22,
    marginBottom: Spacing.md,
  },
  infoBox: {
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Palette.slate900,
    marginBottom: Spacing.sm,
  },
  infoBoxHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: 4,
  },
  infoBoxTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  infoBoxBody: {
    fontSize: 12,
    lineHeight: 18,
  },
  sectionWrapper: {
    marginTop: Spacing.md,
  },
  sectionTitle: {
    fontSize: FontSize.md,
    fontWeight: '700',
    marginBottom: Spacing.sm,
  },
  addonsList: {
    gap: Spacing.sm,
  },
  addonItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  addonLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addonName: {
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
  addonPrice: {
    fontSize: FontSize.sm,
    fontWeight: '700',
  },
  instructionsInput: {
    borderRadius: Radius.md,
    borderWidth: 1,
    padding: Spacing.md,
    fontSize: FontSize.sm,
    textAlignVertical: 'top',
  },
  reviewCard: {
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    marginBottom: Spacing.xs,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  reviewerName: {
    fontSize: 13,
    fontWeight: '700',
  },
  reviewStars: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  reviewRating: {
    fontSize: 12,
    fontWeight: '700',
  },
  reviewComment: {
    fontSize: 12,
    lineHeight: 18,
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.base,
    borderTopWidth: 1,
    gap: Spacing.md,
  },
  addBtn: {
    flex: 1,
  },
});

