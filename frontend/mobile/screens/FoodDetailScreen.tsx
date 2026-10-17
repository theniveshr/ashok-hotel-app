import { AppText as Text } from '../components/ui/AppText';
import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Platform,
} from 'react-native';
import {
  Clock,
  Flame,
  Check,
  Star,
  Heart,
  Leaf,
  ShieldAlert,
  AlertTriangle,
  ChevronRight,
  Info,
} from 'lucide-react-native';
import { useTheme } from '../theme/ThemeContext';
import { useTranslation } from '../i18n';
import { Header } from '../components/ui/Header';
import { PrimaryButton } from '../components/ui/PrimaryButton';
import { QuantitySelector } from '../components/ui/QuantitySelector';
import { Radius, Spacing, FontSize, Palette } from '@ashok-raj/ui';
import { useMenuStore } from '../store/useMenuStore';
import { useCartStore } from '../store/useCartStore';
import { resolveFoodImageUrl, getFallbackFoodImage } from '../utils/foodImageResolver';

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
  const [loadError, setLoadError] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [imgError, setImgError] = useState(false);

  const isFav = favorites.includes(id);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setLoadError(false);

    fetchItemDetail(id)
      .then((fetchedItem) => {
        if (!isMounted) return;
        if (fetchedItem) {
          setItem(fetchedItem);
          // Auto-select first variant if one exists with isRequired or Size
          const addonsList: any[] = fetchedItem.addons || [];
          const variants = addonsList.filter(
            (a) =>
              a.isRequired ||
              a.name?.toLowerCase().includes('size:') ||
              a.name?.toLowerCase().includes('pack:') ||
              a.name?.toLowerCase().includes('portion:')
          );
          if (variants.length > 0 && variants[0].price === 0) {
            setSelectedVariantId(variants[0].id);
          }
        } else {
          setLoadError(true);
        }
        setLoading(false);
      })
      .catch(() => {
        if (isMounted) {
          setLoadError(true);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Header showBack onBackPress={onBack} title={isTamil ? 'உணவு விவரம்' : 'Dish Details'} />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Palette.blue700} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            {isTamil ? 'உணவு விவரங்கள் பெறப்படுகின்றன...' : 'Loading dish details...'}
          </Text>
        </View>
      </View>
    );
  }

  if (loadError || !item) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Header showBack onBackPress={onBack} title={isTamil ? 'உணவு விவரம்' : 'Dish Details'} />
        <View style={styles.centerContainer}>
          <AlertTriangle size={48} color={Palette.rose500} />
          <Text style={[styles.errorTitle, { color: colors.textPrimary }]}>
            {isTamil ? 'உணவு விவரம் கிடைக்கவில்லை' : 'Dish Not Found'}
          </Text>
          <Text style={[styles.errorSub, { color: colors.textSecondary }]}>
            {isTamil
              ? 'கோரப்பட்ட உணவு மெனுவில் இல்லை அல்லது அகற்றப்பட்டுவிட்டது.'
              : 'The requested dish is currently unavailable in the menu.'}
          </Text>
          <TouchableOpacity style={styles.backBtn} onPress={onBack}>
            <Text style={styles.backBtnText}>
              {isTamil ? 'மெனுவுக்குத் திரும்பு' : 'Back to Menu'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const isAvailable = Boolean(item.isAvailable !== false);
  const basePrice = Number(item.price ?? 0);
  const discountPercent = Number(item.discountPercentage ?? 0);
  const discountedBase =
    discountPercent > 0 ? basePrice * (1 - discountPercent / 100) : basePrice;

  const allAddons: any[] = item.addons || [];

  // Categorize addons into Variants (Sizes/Packs) and Extras (Addons)
  const isVariantAddon = (a: any) =>
    Boolean(
      a.isRequired ||
        a.name?.toLowerCase().includes('size:') ||
        a.name?.toLowerCase().includes('pack:') ||
        a.name?.toLowerCase().includes('portion:')
    );

  const variantsList = allAddons.filter(isVariantAddon);
  const optionalAddonsList = allAddons.filter((a) => !isVariantAddon(a));

  // Calculate extra cost from selected variant
  const selectedVariant = variantsList.find((v) => v.id === selectedVariantId);
  const variantCost = Number(selectedVariant?.price ?? 0);

  // Calculate extra cost from optional addons
  const addonsTotal = selectedAddons.reduce((sum: number, addonId: string) => {
    const found = optionalAddonsList.find((a) => a.id === addonId);
    return sum + Number(found?.price ?? 0);
  }, 0);

  const finalUnitPrice = Math.max(0, discountedBase + variantCost + addonsTotal);
  const totalPrice = Math.round(finalUnitPrice * quantity);

  const toggleOptionalAddon = (addonId: string) => {
    setSelectedAddons((prev) =>
      prev.includes(addonId) ? prev.filter((a) => a !== addonId) : [...prev, addonId]
    );
  };

  const handleSelectVariant = (variantId: string) => {
    setSelectedVariantId((prev) => (prev === variantId ? null : variantId));
  };

  const handleAddToCart = () => {
    if (!isAvailable) return;

    // Collect all chosen addons
    const chosenAddons: Array<{ id: string; name: string; nameTa: string; price: number }> = [];

    if (selectedVariant) {
      chosenAddons.push({
        id: selectedVariant.id,
        name: selectedVariant.name,
        nameTa: selectedVariant.nameTa || selectedVariant.name,
        price: Number(selectedVariant.price),
      });
    }

    for (const addonId of selectedAddons) {
      const addon = optionalAddonsList.find((a) => a.id === addonId);
      if (addon) {
        chosenAddons.push({
          id: addon.id,
          name: addon.name,
          nameTa: addon.nameTa || addon.name,
          price: Number(addon.price),
        });
      }
    }

    addItem({
      id: item.id,
      name: item.name,
      nameTa: item.nameTa,
      price: Math.round(discountedBase + variantCost),
      discountPercentage: discountPercent,
      isVeg: Boolean(item.isVegetarian),
      quantity,
      addons: chosenAddons,
      notes: specialInstructions.trim() || undefined,
      imageUrl: item.imageUrl,
    });

    if (onAddToCart) onAddToCart(quantity);
    onBack();
  };

  const resolvedImageUri = imgError
    ? getFallbackFoodImage(item.name, item.isVegetarian)
    : resolveFoodImageUrl(item.name, item.imageUrl, item.isVegetarian);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        showBack
        onBackPress={onBack}
        title={isTamil ? (item.nameTa || item.name) : item.name}
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
            source={{ uri: resolvedImageUri }}
            style={[styles.foodImage, !isAvailable && { opacity: 0.6 }]}
            resizeMode="cover"
            onError={() => setImgError(true)}
          />

          {discountPercent > 0 && isAvailable && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>{discountPercent}% OFF</Text>
            </View>
          )}

          {!isAvailable && (
            <View style={styles.outOfStockBannerOverlay}>
              <Text style={styles.outOfStockBannerText}>
                {isTamil ? 'விற்றுத் தீர்ந்தது' : 'OUT OF STOCK'}
              </Text>
            </View>
          )}
        </View>

        {/* Unavailable Notice Banner */}
        {!isAvailable && (
          <View style={styles.unavailableWarningCard}>
            <ShieldAlert size={20} color="#DC2626" />
            <View style={styles.unavailableWarningTextWrap}>
              <Text style={styles.unavailableWarningTitle}>
                {isTamil ? 'தற்போது கிடைக்கவில்லை (Sold Out)' : 'Currently Out of Stock'}
              </Text>
              <Text style={styles.unavailableWarningDesc}>
                {isTamil
                  ? 'இந்த உணவு தயாரிப்பு இன்று நிறைவடைந்துவிட்டது. மற்ற சுவையான உணவுகளைப் பார்வையிடவும்.'
                  : 'This dish is currently sold out for today at this branch. Please check other available menu items.'}
              </Text>
            </View>
          </View>
        )}

        {/* Title & Price Header */}
        <View style={styles.titleSection}>
          <View style={styles.titleLeft}>
            <View style={styles.dietRow}>
              <View
                style={[
                  styles.dietSquare,
                  { borderColor: item.isVegetarian ? '#16A34A' : '#DC2626' },
                ]}
              >
                <View
                  style={[
                    styles.dietDot,
                    { backgroundColor: item.isVegetarian ? '#16A34A' : '#DC2626' },
                  ]}
                />
              </View>
              <Text
                style={[
                  styles.dietText,
                  { color: item.isVegetarian ? '#15803D' : '#B91C1C' },
                ]}
              >
                {item.isVegetarian
                  ? isTamil
                    ? '100% தூய சைவம் (Veg)'
                    : '100% Vegetarian'
                  : isTamil
                  ? 'அசைவம் (Non-Veg)'
                  : 'Non-Vegetarian'}
              </Text>
            </View>

            <Text style={[styles.title, { color: colors.textPrimary }]}>
              {isTamil ? item.nameTa || item.name : item.name}
            </Text>
            {isTamil && item.nameTa && item.name !== item.nameTa && (
              <Text style={[styles.subTitle, { color: colors.textSecondary }]}>{item.name}</Text>
            )}
          </View>

          <View style={styles.priceContainer}>
            <Text style={[styles.price, { color: Palette.blue700 }]}>
              ₹{Math.round(discountedBase)}
            </Text>
            {discountPercent > 0 && (
              <Text style={[styles.originalPrice, { color: colors.textSecondary }]}>
                ₹{basePrice}
              </Text>
            )}
          </View>
        </View>

        {/* Key Metrics Row */}
        <View style={styles.metricsRow}>
          <View
            style={[
              styles.metricPill,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <Star size={14} color="#EAB308" fill="#EAB308" />
            <Text style={[styles.metricText, { color: colors.textPrimary }]}>
              {Number(item.rating ?? 4.8).toFixed(1)} ({item.reviewCount ?? 42})
            </Text>
          </View>

          <View
            style={[
              styles.metricPill,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <Clock size={14} color={colors.textSecondary} />
            <Text style={[styles.metricText, { color: colors.textPrimary }]}>
              {item.preparationTimeMinutes ?? 15} {isTamil ? 'நிமி' : 'mins'}
            </Text>
          </View>

          {item.isSpicy && (
            <View
              style={[
                styles.metricPill,
                { backgroundColor: '#FFEDD5', borderColor: '#FDBA74' },
              ]}
            >
              <Flame size={14} color="#C2410C" />
              <Text style={[styles.metricText, { color: '#C2410C' }]}>
                {isTamil ? 'காரம்' : 'Spicy'}
              </Text>
            </View>
          )}

          {item.calories && (
            <View
              style={[
                styles.metricPill,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
            >
              <Text style={[styles.metricText, { color: colors.textSecondary }]}>
                {item.calories} kcal
              </Text>
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
          <View style={[styles.infoBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.infoBoxHeader}>
              <Leaf size={15} color="#16A34A" />
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
          <View style={[styles.infoBox, { borderColor: '#FCD34D', backgroundColor: '#FFFBEB' }]}>
            <View style={styles.infoBoxHeader}>
              <ShieldAlert size={15} color="#D97706" />
              <Text style={[styles.infoBoxTitle, { color: '#92400E' }]}>
                {isTamil ? 'அலர்ஜி எச்சரிக்கை' : 'Allergens Warning'}
              </Text>
            </View>
            <Text style={[styles.infoBoxBody, { color: '#B45309' }]}>
              {item.allergens.join(', ')}
            </Text>
          </View>
        )}

        {/* Variant / Size Options (Radio Selection) */}
        {variantsList.length > 0 && (
          <View style={styles.sectionWrapper}>
            <View style={styles.sectionHeaderRow}>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                {isTamil ? 'அளவு / பேக் தேர்வு (Variants)' : 'Select Portion / Size'}
              </Text>
              <Text style={styles.optionalBadge}>
                {isTamil ? 'விருப்பத் தேர்வு' : 'Optional'}
              </Text>
            </View>

            <View style={styles.addonsList}>
              {variantsList.map((variant: any) => {
                const isSelected = selectedVariantId === variant.id;
                return (
                  <TouchableOpacity
                    key={variant.id}
                    onPress={() => handleSelectVariant(variant.id)}
                    activeOpacity={0.8}
                    style={[
                      styles.addonItem,
                      {
                        backgroundColor: colors.surface,
                        borderColor: isSelected ? Palette.blue700 : colors.border,
                      },
                      isSelected && { backgroundColor: '#EFF6FF' },
                    ]}
                  >
                    <View style={styles.addonLeft}>
                      <View
                        style={[
                          styles.radioCircle,
                          {
                            borderColor: isSelected ? Palette.blue700 : colors.border,
                          },
                        ]}
                      >
                        {isSelected && <View style={styles.radioDot} />}
                      </View>
                      <Text style={[styles.addonName, { color: colors.textPrimary }]}>
                        {isTamil ? variant.nameTa || variant.name : variant.name}
                      </Text>
                    </View>

                    <Text style={[styles.addonPrice, { color: Palette.blue700 }]}>
                      {Number(variant.price) > 0 ? `+₹${variant.price}` : (isTamil ? 'சேர்க்கப்பட்டுள்ளது' : 'Included')}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* Optional Add-ons List (Checkbox Selection) */}
        {optionalAddonsList.length > 0 && (
          <View style={styles.sectionWrapper}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              {isTamil ? 'கூடுதல் விருப்பங்கள் (Add-ons & Extras)' : 'Add-on Extras & Customizations'}
            </Text>

            <View style={styles.addonsList}>
              {optionalAddonsList.map((addon: any) => {
                const isSelected = selectedAddons.includes(addon.id);
                return (
                  <TouchableOpacity
                    key={addon.id}
                    onPress={() => toggleOptionalAddon(addon.id)}
                    activeOpacity={0.8}
                    style={[
                      styles.addonItem,
                      {
                        backgroundColor: colors.surface,
                        borderColor: isSelected ? Palette.blue700 : colors.border,
                      },
                      isSelected && { backgroundColor: '#EFF6FF' },
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
                        {isSelected && <Check size={12} color="#FFFFFF" />}
                      </View>
                      <Text style={[styles.addonName, { color: colors.textPrimary }]}>
                        {isTamil ? addon.nameTa || addon.name : addon.name}
                      </Text>
                    </View>

                    <Text style={[styles.addonPrice, { color: Palette.blue700 }]}>
                      +₹{Number(addon.price)}
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
              <View
                key={rev.id}
                style={[
                  styles.reviewCard,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                ]}
              >
                <View style={styles.reviewHeader}>
                  <Text style={[styles.reviewerName, { color: colors.textPrimary }]}>
                    {rev.userName}
                  </Text>
                  <View style={styles.reviewStars}>
                    <Star size={12} color="#EAB308" fill="#EAB308" />
                    <Text style={[styles.reviewRating, { color: '#854D0E' }]}>{rev.rating}</Text>
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
        {isAvailable ? (
          <>
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
          </>
        ) : (
          <View style={styles.bottomUnavailableBar}>
            <Text style={styles.bottomUnavailableText}>
              {isTamil ? 'தற்போது விற்றுத் தீர்ந்தது (Out of Stock)' : 'Sold Out / Unavailable'}
            </Text>
          </View>
        )}
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
    padding: Spacing.xl,
  },
  loadingText: {
    marginTop: Spacing.md,
    fontSize: 14,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: Spacing.md,
    textAlign: 'center',
  },
  errorSub: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: Spacing.xs,
    marginBottom: Spacing.lg,
  },
  backBtn: {
    backgroundColor: Palette.blue700,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm + 2,
    borderRadius: Radius.md,
  },
  backBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  scrollContent: {
    paddingBottom: 110,
  },
  headerFavBtn: {
    padding: Spacing.xs,
  },
  imageWrapper: {
    width: '100%',
    height: 250,
    backgroundColor: '#F1F5F9',
    position: 'relative',
  },
  foodImage: {
    width: '100%',
    height: '100%',
  },
  discountBadge: {
    position: 'absolute',
    top: Spacing.base,
    left: Spacing.base,
    backgroundColor: Palette.rose600,
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: 4,
    borderRadius: Radius.sm,
  },
  discountText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  outOfStockBannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  outOfStockBannerText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1.2,
    backgroundColor: '#DC2626',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.md,
  },
  unavailableWarningCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: Radius.lg,
    padding: Spacing.md,
    margin: Spacing.base,
    marginBottom: 0,
    gap: Spacing.sm,
  },
  unavailableWarningTextWrap: {
    flex: 1,
  },
  unavailableWarningTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#991B1B',
    marginBottom: 2,
  },
  unavailableWarningDesc: {
    fontSize: 12,
    color: '#B91C1C',
    lineHeight: 16,
  },
  titleSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.base,
  },
  titleLeft: {
    flex: 1,
    paddingRight: Spacing.sm,
  },
  dietRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: Spacing.xs,
  },
  dietSquare: {
    width: 14,
    height: 14,
    borderWidth: 1.5,
    borderRadius: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dietDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  dietText: {
    fontSize: 11,
    fontWeight: '700',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  subTitle: {
    fontSize: 13,
    marginTop: 2,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: 22,
    fontWeight: '900',
  },
  originalPrice: {
    fontSize: 13,
    textDecorationLine: 'line-through',
    marginTop: 2,
  },
  metricsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.base,
    marginTop: Spacing.sm,
  },
  metricPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: 5,
    borderRadius: Radius.full,
    borderWidth: 1,
    gap: 4,
  },
  metricText: {
    fontSize: 12,
    fontWeight: '600',
  },
  description: {
    fontSize: 13.5,
    lineHeight: 20,
    paddingHorizontal: Spacing.base,
    marginTop: Spacing.md,
  },
  infoBox: {
    marginHorizontal: Spacing.base,
    marginTop: Spacing.md,
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
  },
  infoBoxHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  infoBoxTitle: {
    fontSize: 12.5,
    fontWeight: '700',
  },
  infoBoxBody: {
    fontSize: 12,
    lineHeight: 18,
  },
  sectionWrapper: {
    marginTop: Spacing.lg,
    paddingHorizontal: Spacing.base,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: Spacing.sm,
  },
  optionalBadge: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  addonsList: {
    gap: Spacing.xs,
  },
  addonItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1.2,
  },
  addonLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flex: 1,
  },
  radioCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: Palette.blue700,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addonName: {
    fontSize: 13.5,
    fontWeight: '600',
    flex: 1,
  },
  addonPrice: {
    fontSize: 13,
    fontWeight: '700',
    marginLeft: Spacing.sm,
  },
  instructionsInput: {
    borderWidth: 1,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    fontSize: 13,
    textAlignVertical: 'top',
    minHeight: 70,
  },
  reviewCard: {
    padding: Spacing.md,
    borderRadius: Radius.lg,
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
    gap: 3,
  },
  reviewRating: {
    fontSize: 11.5,
    fontWeight: '700',
  },
  reviewComment: {
    fontSize: 12,
    lineHeight: 16,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    gap: Spacing.md,
  },
  addBtn: {
    flex: 1,
  },
  bottomUnavailableBar: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    paddingVertical: 14,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  bottomUnavailableText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.3,
  },
});
