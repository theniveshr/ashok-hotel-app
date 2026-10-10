import { AppText as Text } from '../components/ui/AppText';
﻿import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { useTranslation } from '../i18n';
import { Header } from '../components/ui/Header';
import { SearchBar } from '../components/ui/SearchBar';
import { CategoryCard } from '../components/ui/CategoryCard';
import { FoodCard } from '../components/ui/FoodCard';
import { FloatingActionButton } from '../components/ui/FloatingActionButton';
import { ShoppingBag, Flame, Leaf, Award, RefreshCw } from 'lucide-react-native';
import { Spacing, Palette, Radius, FontSize } from '@ashok-raj/ui';
import { useMenuStore } from '../store/useMenuStore';
import { useCartStore } from '../store/useCartStore';

export interface RestaurantScreenProps {
  onBack?: () => void;
  onFoodPress: (id: string) => void;
  onCartPress: () => void;
  cartCount?: number;
  initialSegment?: 'restaurant' | 'bakery' | 'veg';
}

export function RestaurantScreen({
  onBack,
  onFoodPress,
  onCartPress,
  initialSegment = 'restaurant',
}: RestaurantScreenProps) {
  const { colors } = useTheme();
  const { t, isTamil } = useTranslation();
  const [segment, setSegment] = useState<'restaurant' | 'bakery' | 'veg'>(initialSegment);

  const {
    categories,
    items,
    selectedCategoryId,
    searchQuery,
    vegOnly,
    spicyOnly,
    bestsellerOnly,
    isLoading,
    isRefreshing,
    error,
    fetchCategories,
    fetchItems,
    setSelectedCategory,
    setSearchQuery,
    setVegOnly,
    setSpicyOnly,
    setBestsellerOnly,
    refreshMenu,
  } = useMenuStore();

  const { items: cartItems, addItem } = useCartStore();
  const totalCartCount = cartItems.reduce((acc, curr) => acc + curr.quantity, 0);

  useEffect(() => {
    fetchCategories();
    fetchItems();
  }, []);

  const filteredCategories = React.useMemo(() => {
    return categories.filter((c) => {
      if (c.division) {
        return c.division === segment;
      }
      if (segment === 'bakery') return c.id.includes('bakery');
      if (segment === 'veg') return c.id.includes('veg');
      return c.id.startsWith('cat-rest') || (!c.id.includes('bakery') && !c.id.includes('veg'));
    });
  }, [categories, segment]);

  const segmentItems = React.useMemo(() => {
    if (segment === 'bakery') {
      return items.filter((i) => i.id.startsWith('bakery-') || i.categoryId.includes('bakery'));
    } else if (segment === 'veg') {
      return items.filter(
        (i) =>
          (i.id.startsWith('veg-') || i.categoryId.includes('veg') || i.isVegetarian) &&
          !i.categoryId.includes('bakery') &&
          !i.id.startsWith('bakery-') &&
          !i.id.startsWith('rest-parotto') &&
          !i.id.startsWith('rest-nonveg') &&
          !i.id.startsWith('rest-chicken') &&
          !i.id.startsWith('rest-mutton') &&
          !i.id.startsWith('rest-bun') &&
          !i.id.startsWith('rest-egg')
      );
    } else {
      return items.filter(
        (i) =>
          i.id.startsWith('rest-') ||
          (!i.id.startsWith('bakery-') && !i.id.startsWith('veg-') && !i.categoryId.includes('bakery'))
      );
    }
  }, [items, segment]);

  const displayedItems = React.useMemo(() => {
    let list = segmentItems;
    if (selectedCategoryId) {
      list = list.filter((i) => i.categoryId === selectedCategoryId);
    }
    return list;
  }, [segmentItems, selectedCategoryId]);

  const allCategories = [
    {
      id: null,
      name: 'All Items',
      nameTa: 'அனைத்தும்',
      count: segmentItems.length,
    },
    ...filteredCategories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      nameTa: cat.nameTa,
      count: segmentItems.filter((i) => i.categoryId === cat.id).length,
    })),
  ];

  const handleSegmentChange = (newSegment: 'restaurant' | 'bakery' | 'veg') => {
    setSegment(newSegment);
    setSelectedCategory(null);
  };

  const getSubtitle = () => {
    if (segment === 'bakery') return isTamil ? 'புதிய கேக், சாட்ஸ் & இனிப்புகள்' : 'Fresh Cakes, Chaats & Sweets';
    if (segment === 'veg') return isTamil ? '100% தூய சைவ உணவகம்' : '100% Pure Vegetarian Delights';
    return isTamil ? 'செட்டிநாடு & தென்னிந்திய உணவுகள்' : 'Authentic Chettinad & South Indian';
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        showBack={Boolean(onBack)}
        onBackPress={onBack}
        title={t('restaurant.ourMenu')}
        subtitle={getSubtitle()}
      />

      <View style={styles.searchWrapper}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder={isTamil ? 'உணவை தேடுக...' : 'Search food, biryani, dosa...'}
        />
      </View>

      {/* Segment Tabs: Restaurant | Bakery | Pure Veg */}
      <View style={[styles.segmentBar, { borderColor: colors.border, backgroundColor: colors.surface }]}>
        {[
          { key: 'restaurant', label: isTamil ? 'உணவகம்' : 'Restaurant' },
          { key: 'bakery',     label: isTamil ? 'பேக்கரி'  : 'Bakery' },
          { key: 'veg',        label: isTamil ? 'தூய சைவம்' : 'Pure Veg' },
        ].map((seg) => {
          const isActive = segment === seg.key;
          return (
            <TouchableOpacity
              key={seg.key}
              onPress={() => handleSegmentChange(seg.key as typeof segment)}
              style={[
                styles.segmentTab,
                isActive && { borderBottomColor: Palette.blue700, borderBottomWidth: 2.5 },
              ]}
            >
              <Text
                style={[
                  styles.segmentTabText,
                  {
                    color: isActive ? Palette.blue700 : colors.textSecondary,
                    fontWeight: isActive ? '800' : '600',
                  },
                ]}
              >
                {seg.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Filter Chips Bar */}

      <View style={styles.filtersRow}>
        <TouchableOpacity
          style={[
            styles.filterChip,
            { borderColor: vegOnly ? '#16A34A' : colors.border },
            vegOnly && { backgroundColor: '#DCFCE7' },
          ]}
          onPress={() => setVegOnly(!vegOnly)}
          activeOpacity={0.7}
        >
          <Leaf size={14} color={vegOnly ? '#15803D' : colors.textTertiary} />
          <Text
            style={[
              styles.filterChipText,
              { color: vegOnly ? '#15803D' : colors.textSecondary },
            ]}
          >
            {isTamil ? 'சைவம்' : 'Veg Only'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterChip,
            { borderColor: spicyOnly ? '#EA580C' : colors.border },
            spicyOnly && { backgroundColor: '#FFEDD5' },
          ]}
          onPress={() => setSpicyOnly(!spicyOnly)}
          activeOpacity={0.7}
        >
          <Flame size={14} color={spicyOnly ? '#C2410C' : colors.textTertiary} />
          <Text
            style={[
              styles.filterChipText,
              { color: spicyOnly ? '#C2410C' : colors.textSecondary },
            ]}
          >
            {isTamil ? 'காரம்' : 'Spicy'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterChip,
            { borderColor: bestsellerOnly ? Palette.blue700 : colors.border },
            bestsellerOnly && { backgroundColor: Palette.blue100 },
          ]}
          onPress={() => setBestsellerOnly(!bestsellerOnly)}
          activeOpacity={0.7}
        >
          <Award size={14} color={bestsellerOnly ? Palette.blue700 : colors.textTertiary} />
          <Text
            style={[
              styles.filterChipText,
              { color: bestsellerOnly ? Palette.blue700 : colors.textSecondary },
            ]}
          >
            {isTamil ? 'சிறந்தவை' : 'Bestsellers'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Category Scroll */}
      <View style={styles.categoriesWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContent}
        >
          {allCategories.map((cat) => (
            <CategoryCard
              key={cat.id ?? 'cat-all'}
              id={cat.id ?? 'cat-all'}
              name={cat.name}
              nameTa={cat.nameTa}
              count={cat.count}
              isSelected={selectedCategoryId === cat.id}
              onPress={() => setSelectedCategory(cat.id)}
            />
          ))}
        </ScrollView>
      </View>

      {/* Menu Content */}
      {displayedItems.length === 0 && isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Palette.blue700} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            {isTamil ? 'மெனு சுமை ஏற்படுகிறது...' : 'Loading restaurant menu...'}
          </Text>
        </View>
      ) : displayedItems.length === 0 && error ? (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
            {isTamil ? 'மெனு தரவை ஏற்ற முடியவில்லை' : 'Unable to load menu'}
          </Text>
          <TouchableOpacity style={styles.retryBtn} onPress={refreshMenu}>
            <RefreshCw size={16} color="#FFFFFF" />
            <Text style={styles.retryBtnText}>{isTamil ? 'மீண்டும் முயல்க' : 'Retry'}</Text>
          </TouchableOpacity>
        </View>
      ) : displayedItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
            {isTamil ? 'உணவு வகைகள் எதுவும் கிடைக்கவில்லை' : 'No items found'}
          </Text>
          <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
            {isTamil
              ? 'வேறு தேடல் சொல்லை முயற்சிக்கவும்'
              : 'Try adjusting your filters or search keywords'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={displayedItems}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={refreshMenu}
              tintColor={Palette.blue700}
            />
          }
          renderItem={({ item }) => (
            <FoodCard
              id={item.id}
              name={item.name}
              nameTa={item.nameTa}
              description={item.description ?? ''}
              price={item.price}
              isVeg={item.isVegetarian}
              isSpicy={item.isSpicy}
              prepTimeMinutes={item.preparationTimeMinutes}
              imageUrl={item.imageUrl ?? undefined}
              onPress={() => onFoodPress(item.id)}
              onAddToCart={() =>
                addItem({
                  id: item.id,
                  name: item.name,
                  nameTa: item.nameTa,
                  price: item.price,
                  discountPercentage: item.discountPercentage,
                  isVeg: item.isVegetarian,
                  quantity: 1,
                })
              }
            />
          )}
        />
      )}

      {/* Floating Cart Button */}
      {totalCartCount > 0 && (
        <FloatingActionButton
          icon={<ShoppingBag size={20} color="#FFFFFF" />}
          label={isTamil ? 'கார்ட் காண்' : 'View Cart'}
          badgeCount={totalCartCount}
          onPress={onCartPress}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchWrapper: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.xs,
  },
  // Segment tabs
  segmentBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    marginBottom: 0,
  },
  segmentTab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  segmentTabText: {
    fontSize: FontSize.sm,
    letterSpacing: 0.2,
  },
  filtersRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.xs,
    gap: Spacing.xs,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: 20,
    borderWidth: 1,
    gap: Spacing.xs,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  categoriesWrapper: {
    paddingVertical: Spacing.xs,
  },
  categoriesContent: {
    paddingHorizontal: Spacing.base,
  },
  listContent: {
    padding: Spacing.base,
    paddingBottom: Spacing['6xl'],
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: Spacing.md,
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 13,
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Palette.blue700,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
    marginTop: Spacing.md,
    gap: Spacing.xs,
  },
  retryBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});

