import { AppText as Text } from '../components/ui/AppText';
import React, { useEffect, useState, useMemo } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Platform,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { useTranslation } from '../i18n';
import { Header } from '../components/ui/Header';
import { SearchBar } from '../components/ui/SearchBar';
import { CategoryCard } from '../components/ui/CategoryCard';
import { FoodCard } from '../components/ui/FoodCard';
import { FloatingActionButton } from '../components/ui/FloatingActionButton';
import {
  ShoppingBag,
  Flame,
  Leaf,
  Award,
  RefreshCw,
  MapPin,
  LayoutGrid,
  List,
  ArrowUpDown,
  CheckCircle2,
  X,
} from 'lucide-react-native';
import { Spacing, Palette, Radius, FontSize } from '@ashok-raj/ui';
import { useMenuStore, type SortOption } from '../store/useMenuStore';
import { useCartStore } from '../store/useCartStore';
import { useBranchStore } from '../store/useBranchStore';

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
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  const { selectedBranch } = useBranchStore();

  const {
    categories,
    items,
    selectedCategoryId,
    searchQuery,
    vegOnly,
    spicyOnly,
    bestsellerOnly,
    inStockOnly,
    sortBy,
    isLoading,
    isRefreshing,
    error,
    fetchCategories,
    fetchItems,
    setDivision,
    setSelectedCategory,
    setSearchQuery,
    setSortBy,
    setVegOnly,
    setSpicyOnly,
    setBestsellerOnly,
    setInStockOnly,
    resetFilters,
    refreshMenu,
  } = useMenuStore();

  const { items: cartItems, addItem } = useCartStore();
  const totalCartCount = cartItems.reduce((acc, curr) => acc + curr.quantity, 0);

  // Sync segment & branch
  useEffect(() => {
    setDivision(segment);
    fetchCategories(selectedBranch?.id, segment);
    fetchItems(selectedBranch?.id);
  }, [segment, selectedBranch?.id]);

  // Categories belonging to current segment
  const filteredCategories = useMemo(() => {
    return categories.filter((c) => {
      if (c.division) {
        return c.division === segment;
      }
      if (segment === 'bakery') return c.id.includes('bakery');
      if (segment === 'veg') return c.id.includes('veg');
      return c.id.startsWith('cat-rest') || (!c.id.includes('bakery') && !c.id.includes('veg'));
    });
  }, [categories, segment]);

  // Segment items fallback
  const segmentItems = useMemo(() => {
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

  // Client-side category filtering
  const displayedItems = useMemo(() => {
    let list = segmentItems;
    if (selectedCategoryId) {
      list = list.filter((i) => i.categoryId === selectedCategoryId);
    }
    return list;
  }, [segmentItems, selectedCategoryId]);

  // Category pills with item count
  const allCategories = useMemo(() => {
    const totalCount =
      filteredCategories.reduce((acc, cat) => acc + (cat.itemCount ?? 0), 0) || segmentItems.length;

    return [
      {
        id: null,
        name: 'All Items',
        nameTa: 'அனைத்தும்',
        count: totalCount,
      },
      ...filteredCategories.map((cat) => ({
        id: cat.id,
        name: cat.name,
        nameTa: cat.nameTa,
        count: cat.itemCount ?? cat._count?.menuItems ?? 0,
      })),
    ];
  }, [filteredCategories, segmentItems.length]);

  const handleSegmentChange = (newSegment: 'restaurant' | 'bakery' | 'veg') => {
    setSegment(newSegment);
    setSelectedCategory(null);
    setDivision(newSegment);
  };

  const getSubtitle = () => {
    if (segment === 'bakery') return isTamil ? 'புதிய கேக்குகள், சாட்ஸ் & இனிப்புகள்' : 'Fresh Cakes, Chaats & Sweets';
    if (segment === 'veg') return isTamil ? '100% தூய சைவ உணவகம்' : '100% Pure Vegetarian Delights';
    return isTamil ? 'செட்டிநாடு & பாரம்பரிய தென்னிந்திய உணவுகள்' : 'Authentic Chettinad & South Indian';
  };

  const sortOptions: Array<{ key: SortOption; label: string; labelTa: string }> = [
    { key: 'popular', label: 'Bestsellers', labelTa: 'சிறந்தவை' },
    { key: 'price_asc', label: 'Price: Low → High', labelTa: 'விலை: குறைவு' },
    { key: 'price_desc', label: 'Price: High → Low', labelTa: 'விலை: அதிகம்' },
    { key: 'rating', label: 'Top Rated', labelTa: 'மதிப்பீடு' },
    { key: 'prep_time', label: 'Under 15 Mins', labelTa: 'விரைவானது' },
  ];

  const hasActiveFilters = vegOnly || spicyOnly || bestsellerOnly || inStockOnly || Boolean(searchQuery);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Screen Header */}
      <Header
        showBack={Boolean(onBack)}
        onBackPress={onBack}
        title={t('restaurant.ourMenu')}
        subtitle={getSubtitle()}
        rightElement={
          <View style={styles.headerRightRow}>
            {/* View Mode Toggle: List vs Grid */}
            <TouchableOpacity
              style={[styles.viewModeBtn, { borderColor: colors.border, backgroundColor: colors.surface }]}
              onPress={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
              activeOpacity={0.7}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              {viewMode === 'list' ? (
                <LayoutGrid size={17} color={Palette.blue700} />
              ) : (
                <List size={17} color={Palette.blue700} />
              )}
            </TouchableOpacity>
          </View>
        }
      />

      {/* Branch Indicator Bar */}
      <View style={[styles.branchBar, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
        <View style={styles.branchLeft}>
          <MapPin size={13} color={Palette.blue700} />
          <Text style={[styles.branchText, { color: colors.textPrimary }]} numberOfLines={1}>
            {isTamil ? (selectedBranch?.nameTa || selectedBranch?.name || 'காளையார்கோவில் கிளை') : (selectedBranch?.name || 'Kalaiyarkoil Main Branch')}
          </Text>
        </View>
        <Text style={[styles.branchStatus, { color: Palette.emerald700 }]}>
          ● {isTamil ? 'மெனு தயார்' : 'Kitchen Open'}
        </Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchWrapper}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder={
            segment === 'bakery'
              ? (isTamil ? 'கேக், அல்வா, பானி பூரி தேடுக...' : 'Search cakes, sweets, chaat...')
              : (isTamil ? 'பிரியாணி, தோசை, இட்லி தேடுக...' : 'Search food, biryani, dosa...')
          }
        />
      </View>

      {/* Segment Tabs: Restaurant | Bakery | Pure Veg */}
      <View style={[styles.segmentBar, { borderColor: colors.border, backgroundColor: colors.surface }]}>
        {[
          { key: 'restaurant', label: isTamil ? 'உணவகம்' : 'Restaurant' },
          { key: 'bakery',     label: isTamil ? 'பேக்கரி & ஸ்வீட்ஸ்' : 'Bakery & Sweets' },
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
              activeOpacity={0.7}
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

      {/* Category Pills Horizontal Scroll */}
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

      {/* Filter & Sort Chips Row */}
      <View style={styles.filtersWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersContent}
        >
          {/* Veg Only Chip (Only relevant in non-veg restaurant segment) */}
          {segment === 'restaurant' && (
            <TouchableOpacity
              style={[
                styles.filterChip,
                { borderColor: vegOnly ? '#16A34A' : colors.border },
                vegOnly && { backgroundColor: '#DCFCE7' },
              ]}
              onPress={() => setVegOnly(!vegOnly)}
              activeOpacity={0.7}
            >
              <Leaf size={13} color={vegOnly ? '#15803D' : colors.textTertiary} />
              <Text
                style={[
                  styles.filterChipText,
                  { color: vegOnly ? '#15803D' : colors.textSecondary },
                ]}
              >
                {isTamil ? 'சைவம்' : 'Veg Only'}
              </Text>
            </TouchableOpacity>
          )}

          {/* Spicy Chip */}
          <TouchableOpacity
            style={[
              styles.filterChip,
              { borderColor: spicyOnly ? '#EA580C' : colors.border },
              spicyOnly && { backgroundColor: '#FFEDD5' },
            ]}
            onPress={() => setSpicyOnly(!spicyOnly)}
            activeOpacity={0.7}
          >
            <Flame size={13} color={spicyOnly ? '#C2410C' : colors.textTertiary} />
            <Text
              style={[
                styles.filterChipText,
                { color: spicyOnly ? '#C2410C' : colors.textSecondary },
              ]}
            >
              {isTamil ? 'காரம்' : 'Spicy'}
            </Text>
          </TouchableOpacity>

          {/* Bestseller Chip */}
          <TouchableOpacity
            style={[
              styles.filterChip,
              { borderColor: bestsellerOnly ? Palette.blue700 : colors.border },
              bestsellerOnly && { backgroundColor: '#EFF6FF' },
            ]}
            onPress={() => setBestsellerOnly(!bestsellerOnly)}
            activeOpacity={0.7}
          >
            <Award size={13} color={bestsellerOnly ? Palette.blue700 : colors.textTertiary} />
            <Text
              style={[
                styles.filterChipText,
                { color: bestsellerOnly ? Palette.blue700 : colors.textSecondary },
              ]}
            >
              {isTamil ? 'சிறந்தவை' : 'Bestsellers'}
            </Text>
          </TouchableOpacity>

          {/* In Stock Only Toggle */}
          <TouchableOpacity
            style={[
              styles.filterChip,
              { borderColor: inStockOnly ? '#059669' : colors.border },
              inStockOnly && { backgroundColor: '#D1FAE5' },
            ]}
            onPress={() => setInStockOnly(!inStockOnly)}
            activeOpacity={0.7}
          >
            <CheckCircle2 size={13} color={inStockOnly ? '#059669' : colors.textTertiary} />
            <Text
              style={[
                styles.filterChipText,
                { color: inStockOnly ? '#059669' : colors.textSecondary },
              ]}
            >
              {isTamil ? 'கிடைப்பவை மட்டும்' : 'In Stock Only'}
            </Text>
          </TouchableOpacity>

          {/* Clear Filters Chip if active */}
          {hasActiveFilters && (
            <TouchableOpacity
              style={[styles.filterChip, styles.clearFilterChip]}
              onPress={resetFilters}
              activeOpacity={0.7}
            >
              <X size={12} color="#DC2626" />
              <Text style={styles.clearFilterText}>
                {isTamil ? 'அனைத்தும் நீக்கு' : 'Reset'}
              </Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </View>

      {/* Sorting Options Bar */}
      <View style={[styles.sortBar, { borderColor: colors.border }]}>
        <View style={styles.sortBarHeader}>
          <ArrowUpDown size={12} color={colors.textTertiary} />
          <Text style={[styles.sortBarLabel, { color: colors.textSecondary }]}>
            {isTamil ? 'வரிசைப்படுத்து:' : 'Sort:'}
          </Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.sortOptionsContent}
        >
          {sortOptions.map((opt) => {
            const isSelected = sortBy === opt.key;
            return (
              <TouchableOpacity
                key={opt.key}
                onPress={() => setSortBy(opt.key)}
                style={[
                  styles.sortPill,
                  {
                    backgroundColor: isSelected ? Palette.blue700 : colors.surface,
                    borderColor: isSelected ? Palette.blue700 : colors.border,
                  },
                ]}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.sortPillText,
                    { color: isSelected ? '#FFFFFF' : colors.textPrimary },
                  ]}
                >
                  {isTamil ? opt.labelTa : opt.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Menu Item Listings */}
      {displayedItems.length === 0 && isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Palette.blue700} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            {isTamil ? 'உணவு பட்டியல் பெறப்படுகிறது...' : 'Loading delicious dishes...'}
          </Text>
        </View>
      ) : displayedItems.length === 0 && error ? (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
            {isTamil ? 'மெனு தரவை ஏற்ற முடியவில்லை' : 'Unable to load menu'}
          </Text>
          <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
            {error}
          </Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => refreshMenu(selectedBranch?.id)}>
            <RefreshCw size={15} color="#FFFFFF" />
            <Text style={styles.retryBtnText}>{isTamil ? 'மீண்டும் முயல்க' : 'Retry'}</Text>
          </TouchableOpacity>
        </View>
      ) : displayedItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
            {isTamil ? 'உணவு வகைகள் எதுவும் கிடைக்கவில்லை' : 'No matching dishes found'}
          </Text>
          <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
            {isTamil
              ? 'வேறு தேடல் அல்லது வடிகட்டிகளை மாற்றி முயலவும்.'
              : 'Try adjusting your filters, category selection, or keywords.'}
          </Text>
          {hasActiveFilters && (
            <TouchableOpacity style={styles.retryBtn} onPress={resetFilters}>
              <Text style={styles.retryBtnText}>
                {isTamil ? 'வடிகட்டிகளை அழிக்கவும்' : 'Clear All Filters'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <FlatList
          key={viewMode}
          data={displayedItems}
          keyExtractor={(item) => item.id}
          numColumns={viewMode === 'grid' ? 2 : 1}
          columnWrapperStyle={viewMode === 'grid' ? styles.gridRow : undefined}
          contentContainerStyle={[styles.listContent, viewMode === 'grid' && styles.gridListContent]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={() => refreshMenu(selectedBranch?.id)}
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
              discountPercentage={item.discountPercentage}
              isVeg={item.isVegetarian}
              isSpicy={item.isSpicy}
              isAvailable={item.isAvailable}
              prepTimeMinutes={item.preparationTimeMinutes}
              imageUrl={item.imageUrl ?? undefined}
              rating={item.rating}
              layout={viewMode === 'list' ? 'row' : 'card'}
              style={viewMode === 'grid' ? styles.gridCard : undefined}
              onPress={() => onFoodPress(item.id)}
              onAddToCart={() =>
                addItem({
                  id: item.id,
                  name: item.name,
                  nameTa: item.nameTa,
                  price: Number(item.price),
                  discountPercentage: item.discountPercentage,
                  isVeg: item.isVegetarian,
                  imageUrl: item.imageUrl,
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
  headerRightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  viewModeBtn: {
    padding: 7,
    borderRadius: Radius.md,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  branchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingVertical: 6,
    borderBottomWidth: 1,
  },
  branchLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    flex: 1,
  },
  branchText: {
    fontSize: 12,
    fontWeight: '600',
  },
  branchStatus: {
    fontSize: 11,
    fontWeight: '700',
    marginLeft: Spacing.sm,
  },
  searchWrapper: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.xs,
    paddingBottom: 2,
  },
  segmentBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  segmentTab: {
    flex: 1,
    paddingVertical: 11,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  segmentTabText: {
    fontSize: FontSize.sm,
    letterSpacing: 0.2,
  },
  categoriesWrapper: {
    paddingVertical: Spacing.xs + 2,
  },
  categoriesContent: {
    paddingHorizontal: Spacing.base,
  },
  filtersWrapper: {
    paddingBottom: Spacing.xs,
  },
  filtersContent: {
    paddingHorizontal: Spacing.base,
    gap: Spacing.xs,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: 5,
    borderRadius: Radius.full,
    borderWidth: 1,
    gap: 4,
  },
  filterChipText: {
    fontSize: 11.5,
    fontWeight: '600',
  },
  clearFilterChip: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FCA5A5',
  },
  clearFilterText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#DC2626',
  },
  sortBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingVertical: 4,
    borderBottomWidth: 1,
    gap: Spacing.xs,
  },
  sortBarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  sortBarLabel: {
    fontSize: 11,
    fontWeight: '700',
  },
  sortOptionsContent: {
    gap: Spacing.xs,
    paddingVertical: 2,
  },
  sortPill: {
    paddingHorizontal: 10,
    paddingVertical: 3.5,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  sortPillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  listContent: {
    padding: Spacing.base,
    paddingBottom: 90,
  },
  gridListContent: {
    paddingHorizontal: Spacing.base,
  },
  gridRow: {
    justifyContent: 'space-between',
    marginBottom: Spacing.base,
  },
  gridCard: {
    flex: 1,
    maxWidth: '48.5%',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing['4xl'],
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
    paddingVertical: Spacing['4xl'],
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
    lineHeight: 18,
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
