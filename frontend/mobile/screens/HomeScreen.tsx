import { AppText as Text } from '../components/ui/AppText';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Dimensions,
  Image,
  Linking,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  AlertCircle,
  ArrowRight,
  Award,
  BedDouble,
  Bell,
  Building2,
  CakeSlice,
  Calendar,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Hotel,
  Leaf,
  MapPin,
  PartyPopper,
  ShoppingBag,
  Sparkles,
  Sun,
  Users,
  Utensils,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useTranslation } from '../i18n';
import { FoodCard } from '../components/ui/FoodCard';
import { RoomCard } from '../components/ui/RoomCard';
import { GlassCard } from '../components/ui/GlassCard';
import { Skeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorState } from '../components/ui/ErrorState';
import { AboutAshokRajModal } from '../components/ui/AboutAshokRajModal';
import { BranchSelectionModal } from '../components/ui/BranchSelectionModal';
import { LocationSelectorModal } from '../components/ui/LocationSelectorModal';
import { HomePageTourModal } from '../components/ui/HomePageTourModal';
import { FloatingActionButton } from '../components/ui/FloatingActionButton';
import { useHomeStore } from '../store/useHomeStore';
import { useBranchStore } from '../store/useBranchStore';
import { useLocationStore } from '../store/useLocationStore';
import { useAddressStore } from '../store/useAddressStore';
import { useTourStore } from '../store/useTourStore';
import { useCartStore } from '../store/useCartStore';
import { useOrderStore } from '../store/useOrderStore';
import { useAuthStore } from '../store/useAuthStore';
import { Palette, Radius, Spacing, FontSize } from '@ashok-raj/ui';
import { proxyImageUrl } from '../utils/foodImageResolver';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_MARGIN = 16;
const CARD_PEEK = 20;
const CARD_WIDTH = Math.min(SCREEN_WIDTH - CARD_MARGIN * 2 - CARD_PEEK, 440);
const CARD_GAP = 12;
const SNAP_INTERVAL = CARD_WIDTH + CARD_GAP;
const CAROUSEL_HEIGHT = 220;

export interface HeroSlide {
  id: 'offer' | 'restaurant' | 'bakery' | 'veg' | 'lodge' | 'mini-hall';
  badge: string;
  badgeTa: string;
  title: string;
  titleTa: string;
  subtitle: string;
  subtitleTa: string;
  desc: string;
  descTa: string;
  cta: string;
  ctaTa: string;
  image: string;
  trustedLabel: string;
  trustedValue: string;
  trustedSub: string;
  themePillBg: string;
  themePillText: string;
  accentColor: string;
}

const HERO_SLIDES: HeroSlide[] = [
  {
    id: 'offer',
    badge: '★ Special Offer',
    badgeTa: '★ சிறப்பு சலுகை',
    title: 'Authentic Feast',
    titleTa: 'அசல் விருந்து',
    subtitle: 'Dining & Chettinad Flavors',
    subtitleTa: 'செட்டிநாடு சுவை மற்றும் பார்சல்',
    desc: 'Delicious food, fresh ingredients, crafted with care daily.',
    descTa: 'சுவையான உணவு, தரமான பொருட்கள், பாரம்பரிய சுவை!',
    cta: 'Order Now',
    ctaTa: 'ஆர்டர் செய்க',
    image: 'https://images.pexels.com/photos/12737656/pexels-photo-12737656.jpeg?auto=compress&cs=tinysrgb&w=800',
    trustedLabel: 'Trusted by',
    trustedValue: '5000+',
    trustedSub: 'Happy Guests',
    themePillBg: '#EFF6FF',
    themePillText: '#1E40AF',
    accentColor: '#2563EB',
  },
  {
    id: 'restaurant',
    badge: 'DINING & PARCEL',
    badgeTa: 'உணவகம் & பார்சல்',
    title: 'Restaurant',
    titleTa: 'உணவகம்',
    subtitle: 'Dine-in, Parcel & Delivery',
    subtitleTa: 'உணவருந்தல், பார்சல் & டெலிவரி',
    desc: 'Authentic Chettinad & South Indian dishes made fresh.',
    descTa: 'சுவையான செட்டிநாடு மற்றும் தென்னிந்திய உணவுகள்.',
    cta: 'Explore Restaurant',
    ctaTa: 'உணவகம் காண்க',
    image: 'https://www.ashokrajgroups.com/images/Restaurant/hero-image.JPG',
    trustedLabel: 'Signature',
    trustedValue: 'Top Taste',
    trustedSub: 'Pure Spices',
    themePillBg: '#FFE4E6',
    themePillText: '#BE123C',
    accentColor: '#E11D48',
  },
  {
    id: 'bakery',
    badge: 'FRESH BAKERY',
    badgeTa: 'புதிய பேக்கரி',
    title: 'Bakery & Sweets',
    titleTa: 'பேக்கரி & இனிப்புகள்',
    subtitle: 'Fresh Cakes, Chaats & Sweets',
    subtitleTa: 'புதிய கேக்குகள், சாட்ஸ் & இனிப்புகள்',
    desc: 'Cakes, pastries, cookies, puffs & snacks made daily.',
    descTa: 'கேக்குகள், பேஸ்ட்ரிகள் மற்றும் சுவையான தின்பண்டங்கள்.',
    cta: 'Explore Bakery',
    ctaTa: 'பேக்கரி காண்க',
    image: 'https://images.pexels.com/photos/1702373/pexels-photo-1702373.jpeg?auto=compress&cs=tinysrgb&w=800',
    trustedLabel: 'Fresh Daily',
    trustedValue: '100% Fresh',
    trustedSub: 'Oven Baked',
    themePillBg: '#FCE7F3',
    themePillText: '#9D174D',
    accentColor: '#DB2777',
  },
  {
    id: 'veg',
    badge: '100% VEGETARIAN',
    badgeTa: '100% தூய சைவம்',
    title: 'Pure Veg',
    titleTa: 'பியூர் வெஜ்',
    subtitle: 'Ghee Roast & Leaf Meals',
    subtitleTa: 'நெய் ரோஸ்ட் & வாழை இலை சாப்பாடு',
    desc: 'Traditional meals, tiffin, ghee roasts & fresh sweets.',
    descTa: 'பாரம்பரிய சைவ உணவுகள் மற்றும் நெய் தோசைகள்.',
    cta: 'Explore Pure Veg',
    ctaTa: 'சைவ உணவுகள் காண்க',
    image: 'https://www.ashokrajgroups.com/images/Restaurant/Breakfast/Ghee-Dosa.webp',
    trustedLabel: 'Pure Veg',
    trustedValue: 'Quality',
    trustedSub: 'Traditional',
    themePillBg: '#DCFCE7',
    themePillText: '#15803D',
    accentColor: '#16A34A',
  },
  {
    id: 'lodge',
    badge: 'STAY IN COMFORT',
    badgeTa: 'சுகமான தங்குமிடம்',
    title: 'AshokRaj Lodge',
    titleTa: 'அசோக் ராஜ் லாட்ஜ்',
    subtitle: 'Comfortable AC & Non-AC Rooms',
    subtitleTa: 'AC & Non-AC சொகுசு அறைகள்',
    desc: 'Well-appointed rooms, 24/7 service & modern amenities.',
    descTa: 'நவீன வசதிகளுடன் கூடிய சுத்தமான சொகுசு அறைகள்.',
    cta: 'Explore Lodge',
    ctaTa: 'லாட்ஜ் காண்க',
    image: 'https://www.ashokrajgroups.com/images/Lodge/double-bed-ac.webp',
    trustedLabel: 'Hospitality',
    trustedValue: '24/7 Stay',
    trustedSub: 'AC & Non-AC',
    themePillBg: '#EDE9FE',
    themePillText: '#6D28D9',
    accentColor: '#7C3AED',
  },
  {
    id: 'mini-hall',
    badge: 'EVENTS & OCCASIONS',
    badgeTa: 'சிறப்பான விழாக்கள்',
    title: 'Mini Hall',
    titleTa: 'மினி ஹால்',
    subtitle: '100+ Seater Banquet & Events',
    subtitleTa: 'உங்கள் விழாக்களுக்கு சிறந்த அரங்கு',
    desc: '100+ seating capacity with acoustics & full catering.',
    descTa: '100+ பேர் அமரும் வசதி மற்றும் சிறந்த அலங்காரம்.',
    cta: 'Explore Mini Hall',
    ctaTa: 'மினி ஹால் காண்க',
    image: 'https://www.ashokrajgroups.com/images/Lodge/six-bed-ac.webp',
    trustedLabel: 'Celebrations',
    trustedValue: '100+ Seats',
    trustedSub: 'Modern Hall',
    themePillBg: '#FFEDD5',
    themePillText: '#C2410C',
    accentColor: '#EA580C',
  },
];

type CategoryFilterKey = 'ALL' | 'RESTAURANT' | 'BAKERY' | 'VEG' | 'LODGE' | 'MINI_HALL';

const CATEGORY_FILTERS: { key: CategoryFilterKey; label: string; labelTa: string }[] = [
  { key: 'ALL', label: 'All Services', labelTa: 'அனைத்தும்' },
  { key: 'RESTAURANT', label: 'Restaurant', labelTa: 'உணவகம்' },
  { key: 'BAKERY', label: 'Bakery & Sweets', labelTa: 'பேக்கரி' },
  { key: 'VEG', label: 'Pure Veg', labelTa: 'தூய சைவம்' },
  { key: 'LODGE', label: 'Lodge Rooms', labelTa: 'லாட்ஜ் அறைகள்' },
  { key: 'MINI_HALL', label: 'Mini Hall', labelTa: 'மினி ஹால்' },
];

export interface HomeScreenProps {
  onNavigateToRestaurant: (initialSegment?: 'restaurant' | 'bakery' | 'veg') => void;
  onNavigateToLodge: () => void;
  onNavigateToMiniHall: () => void;
  onNavigateToTableReservation?: () => void;
  onNavigateToOffers: () => void;
  onNavigateToOrders: () => void;
  onNavigateToBookings?: () => void;
  onNavigateToProfile: () => void;
  onNavigateToNotifications?: () => void;
  onFoodPress: (foodId: string) => void;
  onRoomPress: (roomId: string) => void;
  onAddFoodToCart: (foodId: string) => void;
  onNavigateToCart?: () => void;
}

export function HomeScreen({
  onNavigateToRestaurant,
  onNavigateToLodge,
  onNavigateToMiniHall,
  onNavigateToTableReservation,
  onNavigateToOffers,
  onNavigateToOrders,
  onNavigateToBookings,
  onNavigateToProfile,
  onNavigateToNotifications,
  onFoodPress,
  onRoomPress,
  onAddFoodToCart,
  onNavigateToCart,
}: HomeScreenProps) {
  const { isTamil } = useTranslation();
  const { data, isLoading, error, refreshHomeFeed } = useHomeStore();
  const { selectedBranch, initBranch } = useBranchStore();
  const user = useAuthStore((state) => state.user);
  const cartItems = useCartStore((state) => state.items);
  const orders = useOrderStore((state) => state.orders);
  const activeOrder = useOrderStore((state) => state.activeOrder);
  const fetchOrders = useOrderStore((state) => state.fetchOrders);

  const { selectedLocation, coverage, initLocation, getDisplayAddress } = useLocationStore();
  const [refreshing, setRefreshing] = useState(false);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilterKey>('ALL');
  const [activityFilter, setActivityFilter] = useState<'ALL' | 'ORDERS' | 'LODGE' | 'MINI_HALL'>('ALL');
  const [aboutModalVisible, setAboutModalVisible] = useState(false);
  const [branchModalVisible, setBranchModalVisible] = useState(false);
  const [locationModalVisible, setLocationModalVisible] = useState(false);
  const [isLocationMandatory, setIsLocationMandatory] = useState(false);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  const { isTourActive, startTour, fetchTourStatus } = useTourStore();
  const { addresses, fetchAddresses } = useAddressStore();

  const carouselRef = useRef<ScrollView>(null);
  const carouselIndexRef = useRef(0);
  const isUserTouchingRef = useRef(false);
  const prevUserIdRef = useRef<string | null>(null);
  const tourCheckedRef = useRef(false);

  const totalCartCount = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.quantity, 0),
    [cartItems]
  );

  useEffect(() => {
    void initBranch();
    void initLocation();
    void refreshHomeFeed(selectedBranch?.id);
    void fetchOrders();
  }, [initBranch, initLocation, refreshHomeFeed, fetchOrders, selectedBranch?.id]);

  // Load user addresses and handle first-time onboarding tour per authenticated user
  useEffect(() => {
    if (user?.id !== prevUserIdRef.current) {
      prevUserIdRef.current = user?.id || null;
      tourCheckedRef.current = false;
    }

    if (user?.id && !tourCheckedRef.current) {
      tourCheckedRef.current = true;
      // Fetch saved addresses from Supabase Cloud DB
      void fetchAddresses();
      // Fetch user's tour status from Supabase Cloud DB
      void fetchTourStatus().then((status) => {
        if (status === 'not_started') {
          startTour();
        }
      });
    }
  }, [user?.id, fetchAddresses, fetchTourStatus, startTour]);

  const handleTourFinishOrSkip = () => {
    const hasValidAddress = Boolean(
      (selectedLocation?.address &&
        selectedLocation.address !== 'Kalaiyarkoil, Tamil Nadu' &&
        selectedLocation.address.length > 5) ||
      (addresses && addresses.length > 0)
    );

    // If no valid address selected, mandatory location selection opens automatically
    if (!hasValidAddress) {
      setIsLocationMandatory(true);
      setLocationModalVisible(true);
    }
  };

  useEffect(() => {
    carouselIndexRef.current = carouselIndex;
  }, [carouselIndex]);

  // Smooth auto-slide every 5.5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      if (isUserTouchingRef.current) return;
      const nextIndex = (carouselIndexRef.current + 1) % HERO_SLIDES.length;
      carouselIndexRef.current = nextIndex;
      setCarouselIndex(nextIndex);
      carouselRef.current?.scrollTo({
        x: nextIndex * SNAP_INTERVAL,
        animated: true,
      });
    }, 5500);

    return () => clearInterval(timer);
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return isTamil ? 'காலை வணக்கம்' : 'Good morning';
    if (hour < 17) return isTamil ? 'மதிய வணக்கம்' : 'Good afternoon';
    return isTamil ? 'மாலை வணக்கம்' : 'Good evening';
  };

  const rawPopularFoods = useMemo(() => {
    const list = data?.popularFoods || [];
    const recommended = data?.recommendedFoods || [];
    return [...list, ...recommended];
  }, [data?.popularFoods, data?.recommendedFoods]);

  const rawFeaturedRooms = useMemo(() => data?.featuredRooms ?? [], [data?.featuredRooms]);

  // Filter foods by Category Filter & Search Query
  const filteredFoods = useMemo(() => {
    let list = rawPopularFoods;

    if (selectedCategory === 'RESTAURANT') {
      list = list.filter((f) => !f.categoryId?.includes('bakery') && !f.id?.startsWith('bakery-'));
    } else if (selectedCategory === 'BAKERY') {
      list = list.filter((f) => f.categoryId?.includes('bakery') || f.id?.startsWith('bakery-'));
    } else if (selectedCategory === 'VEG') {
      list = list.filter((f) => f.isVeg || f.isVegetarian);
    } else if (selectedCategory === 'LODGE' || selectedCategory === 'MINI_HALL') {
      list = [];
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (f) =>
          f.name?.toLowerCase().includes(q) ||
          f.nameTa?.toLowerCase().includes(q) ||
          f.description?.toLowerCase().includes(q) ||
          f.descriptionTa?.toLowerCase().includes(q) ||
          f.tags?.some((t) => t.toLowerCase().includes(q))
      );
    }

    return list;
  }, [rawPopularFoods, selectedCategory, searchQuery]);

  // Filter rooms by Category Filter & Search Query
  const filteredRooms = useMemo(() => {
    if (
      selectedCategory === 'RESTAURANT' ||
      selectedCategory === 'BAKERY' ||
      selectedCategory === 'VEG' ||
      selectedCategory === 'MINI_HALL'
    ) {
      return [];
    }

    let list = rawFeaturedRooms;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (r) =>
          (r.name || (r as any).title)?.toLowerCase().includes(q) ||
          (r.nameTa || (r as any).titleTa)?.toLowerCase().includes(q) ||
          r.description?.toLowerCase().includes(q) ||
          r.amenities?.some((a: string) => a.toLowerCase().includes(q))
      );
    }

    return list;
  }, [rawFeaturedRooms, selectedCategory, searchQuery]);

  const cartQuantityFor = (id: string) =>
    cartItems.filter((item) => item.id === id).reduce((sum, item) => sum + item.quantity, 0);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshHomeFeed(selectedBranch?.id);
      await fetchOrders();
    } finally {
      setRefreshing(false);
    }
  };

  const onHeroScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / SNAP_INTERVAL);
    const clamped = Math.max(0, Math.min(HERO_SLIDES.length - 1, index));
    setCarouselIndex(clamped);
    carouselIndexRef.current = clamped;
  };

  const goToSlide = (idx: number) => {
    Haptics.selectionAsync();
    setCarouselIndex(idx);
    carouselIndexRef.current = idx;
    carouselRef.current?.scrollTo({
      x: idx * SNAP_INTERVAL,
      animated: true,
    });
  };

  const handleHeroSlidePress = (slide: HeroSlide) => {
    Haptics.selectionAsync();
    switch (slide.id) {
      case 'offer':
      case 'restaurant':
        onNavigateToRestaurant('restaurant');
        break;
      case 'bakery':
        onNavigateToRestaurant('bakery');
        break;
      case 'veg':
        onNavigateToRestaurant('veg');
        break;
      case 'lodge':
        onNavigateToLodge();
        break;
      case 'mini-hall':
        onNavigateToMiniHall();
        break;
      default:
        onNavigateToRestaurant();
    }
  };

  const latestOrder = useMemo(() => {
    const active = orders.find(
      (o) => o.status !== 'DELIVERED' && o.status !== 'CANCELLED'
    ) || activeOrder;
    if (active) return active;
    if (orders.length > 0) return orders[0];
    return data?.activeOrder || null;
  }, [orders, activeOrder, data?.activeOrder]);

  const getStatusInfo = (status?: string) => {
    switch (status) {
      case 'PLACED':
        return {
          label: isTamil ? 'ஆர்டர் பெறப்பட்டது' : 'Placed',
          bg: '#FEF3C7',
          text: '#D97706',
        };
      case 'ACCEPTED':
      case 'CONFIRMED':
        return {
          label: isTamil ? 'உறுதியானது' : 'Confirmed',
          bg: '#EFF6FF',
          text: '#2563EB',
        };
      case 'PREPARING':
        return {
          label: isTamil ? 'தயாராகிறது' : 'Preparing',
          bg: '#FEF3C7',
          text: '#D97706',
        };
      case 'READY_FOR_PICKUP':
        return {
          label: isTamil ? 'தயாராக உள்ளது' : 'Ready',
          bg: '#DCFCE7',
          text: '#16A34A',
        };
      case 'OUT_FOR_DELIVERY':
        return {
          label: isTamil ? 'விநியோகத்தில்' : 'Out for Delivery',
          bg: '#EFF6FF',
          text: '#2563EB',
        };
      case 'DELIVERED':
        return {
          label: isTamil ? 'வழங்கப்பட்டது' : 'Delivered',
          bg: '#DCFCE7',
          text: '#16A34A',
        };
      case 'CANCELLED':
        return {
          label: isTamil ? 'ரத்து செய்யப்பட்டது' : 'Cancelled',
          bg: '#FEE2E2',
          text: '#DC2626',
        };
      default:
        return {
          label: isTamil ? 'செயலில்' : 'Active',
          bg: '#ECFDF3',
          text: '#15803D',
        };
    }
  };

  const formatOrderType = (type?: string) => {
    if (!type) return isTamil ? 'டைன்-இன்' : 'DINE IN';
    if (type === 'HOME_DELIVERY') return isTamil ? 'ஹோம் டெலிவரி' : 'HOME DELIVERY';
    if (type === 'PARCEL_TAKEAWAY' || type === 'TAKEAWAY') return isTamil ? 'பார்சல்' : 'TAKEAWAY';
    return isTamil ? 'டைன்-இன்' : 'DINE IN';
  };

  const orderItemCount = latestOrder?.items
    ? latestOrder.items.reduce((sum: number, it: any) => sum + (it.quantity || 1), 0)
    : (latestOrder as any)?.itemsCount || 0;

  const orderNumberStr = latestOrder?.orderNumber
    ? `Order #${latestOrder.orderNumber}`
    : '';

  const orderTypeStr = formatOrderType(latestOrder?.type);
  const statusInfo = getStatusInfo(latestOrder?.status);

  const getEstimatedTimeStr = () => {
    if (!latestOrder) return isTamil ? '15 நிமிடம் கணிக்கப்பட்டது' : '15 min estimated';
    if (latestOrder.status === 'DELIVERED') return isTamil ? 'வெற்றிகரமாக வழங்கப்பட்டது' : 'Delivered successfully';
    if (latestOrder.status === 'CANCELLED') return isTamil ? 'ஆர்டர் ரத்து செய்யப்பட்டது' : 'Order cancelled';
    const mins = (latestOrder as any).estimatedDeliveryMinutes || (latestOrder as any).estimatedMinutes || 20;
    return isTamil ? `${mins} நிமிடம் கணிக்கப்பட்டது` : `${mins} min estimated`;
  };

  const services = [
    {
      title: isTamil ? 'உணவகம்' : 'Restaurant',
      desc: isTamil ? 'Dine-in & Parcel' : 'Dine-in & Parcel',
      icon: Utensils,
      tint: '#EFF6FF',
      iconColor: '#2563EB',
      onPress: () => onNavigateToRestaurant('restaurant'),
    },
    {
      title: isTamil ? 'மேசை முன்பதிவு' : 'Book a Table',
      desc: isTamil ? 'Instant Reservation' : 'Instant Reservation',
      icon: Calendar,
      tint: '#FFFBEB',
      iconColor: '#D97706',
      onPress: () => onNavigateToTableReservation?.(),
    },
    {
      title: isTamil ? 'பேக்கரி' : 'Bakery & Sweets',
      desc: isTamil ? 'Fresh Cakes & Snacks' : 'Fresh Cakes & Snacks',
      icon: CakeSlice,
      tint: '#FFF1F6',
      iconColor: '#DB2777',
      onPress: () => onNavigateToRestaurant('bakery'),
    },
    {
      title: isTamil ? 'தூய சைவம்' : 'Pure Veg',
      desc: isTamil ? 'Vegetarian Meals' : 'Vegetarian Meals',
      icon: Leaf,
      tint: '#ECFDF3',
      iconColor: '#16A34A',
      onPress: () => onNavigateToRestaurant('veg'),
    },
    {
      title: isTamil ? 'லாட்ஜ்' : 'Lodge Rooms',
      desc: isTamil ? 'Comfortable AC Rooms' : 'Comfortable AC Rooms',
      icon: BedDouble,
      tint: '#F4F0FF',
      iconColor: '#7C3AED',
      onPress: onNavigateToLodge,
    },
    {
      title: isTamil ? 'மினி ஹால்' : 'Mini Hall',
      desc: isTamil ? '100+ Seater AC Hall' : '100+ Seater AC Hall',
      icon: Users,
      tint: '#FFF7ED',
      iconColor: '#EA580C',
      onPress: onNavigateToMiniHall,
    },
  ];

  const currentBranchName = isTamil
    ? selectedBranch?.nameTa || data?.greeting?.branchNameTa || 'காளையார்கோவில் முதன்மை கிளை'
    : selectedBranch?.name || data?.greeting?.branchName || 'Kalaiyarkoil Main Branch';

  // Loading Skeleton State
  if (isLoading && !data) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Skeleton width={44} height={44} borderRadius={15} />
          <View style={{ alignItems: 'center', gap: 6 }}>
            <Skeleton width={180} height={18} />
            <Skeleton width={120} height={12} />
          </View>
          <Skeleton width={44} height={44} borderRadius={22} />
        </View>
        <View style={{ paddingHorizontal: 16, marginTop: 12 }}>
          <Skeleton width="100%" height={44} borderRadius={22} />
        </View>
        <View style={{ paddingHorizontal: 16, marginTop: 16 }}>
          <Skeleton width="100%" height={210} borderRadius={24} />
        </View>
        <View style={{ paddingHorizontal: 16, marginTop: 24 }}>
          <Skeleton width={140} height={20} />
          <View style={{ flexDirection: 'row', gap: 12, marginTop: 12 }}>
            <Skeleton width={110} height={130} borderRadius={20} />
            <Skeleton width={110} height={130} borderRadius={20} />
            <Skeleton width={110} height={130} borderRadius={20} />
          </View>
        </View>
      </View>
    );
  }

  // Error State when offline / network down without cached data
  if (error && !data) {
    return (
      <View style={styles.container}>
        <ErrorState
          title={isTamil ? 'இணைப்பு தோல்வியடைந்தது' : 'Unable to load Ashok Raj services'}
          message={error}
          onRetry={handleRefresh}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#2563EB" />}
      >
        {/* Offline Warning Banner if cached data with error */}
        {error && (
          <View style={styles.offlineBanner}>
            <AlertCircle size={15} color="#B45309" />
            <Text style={styles.offlineText} numberOfLines={1}>
              {isTamil
                ? 'ஆஃப்லைன் பயன்முறை — சேமிக்கப்பட்ட தகவல்கள் காட்டப்படுகின்றன'
                : 'Offline mode — Showing cached menu & services'}
            </Text>
            <TouchableOpacity onPress={handleRefresh} style={styles.offlineRetryBtn} activeOpacity={0.7}>
              <Text style={styles.offlineRetryText}>{isTamil ? 'மீண்டும்' : 'Retry'}</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Header: Deliver To Location Selector */}
        <View style={styles.header}>
          {/* Top-Left: Location Pin Icon / Button */}
          <TouchableOpacity
            onPress={() => {
              Haptics.selectionAsync();
              setLocationModalVisible(true);
            }}
            style={styles.locationButton}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={isTamil ? 'இருப்பிடத்தைத் தேர்ந்தெடுக்கவும்' : 'Choose delivery location'}
          >
            <MapPin size={21} color="#2563EB" strokeWidth={2.4} />
          </TouchableOpacity>

          {/* Top-Center: Dynamic "Deliver to" + Address */}
          <TouchableOpacity
            onPress={() => {
              Haptics.selectionAsync();
              setLocationModalVisible(true);
            }}
            style={styles.deliverToCenter}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={`${isTamil ? 'டெலிவரி முகவரி' : 'Deliver to'} ${getDisplayAddress()}`}
          >
            <View style={styles.deliverToLabelRow}>
              <Text style={styles.deliverToHeading}>
                {isTamil ? 'டெலிவரி இடம்' : 'DELIVER TO'}
              </Text>
              <View
                style={[
                  styles.coverageDot,
                  { backgroundColor: coverage.isDeliverable ? '#16A34A' : '#F59E0B' },
                ]}
              />
            </View>
            <View style={styles.deliverToAddressRow}>
              <Text style={styles.deliverToAddressText} numberOfLines={1}>
                {getDisplayAddress()}
              </Text>
              <ChevronDown size={14} color="#2563EB" strokeWidth={2.5} style={{ marginLeft: 3 }} />
            </View>
          </TouchableOpacity>

          {/* Right: Notifications */}
          <TouchableOpacity
            onPress={() => {
              Haptics.selectionAsync();
              if (onNavigateToNotifications) onNavigateToNotifications();
              else onNavigateToProfile();
            }}
            style={styles.profileButton}
            activeOpacity={0.82}
            accessibilityRole="button"
            accessibilityLabel={isTamil ? 'அறிவிப்புகள்' : 'Open notifications'}
          >
            <Bell size={20} color="#2563EB" strokeWidth={2} />
            <View style={styles.profileDot} />
          </TouchableOpacity>
        </View>
        {/* Hero Carousel Section */}
        <View style={styles.heroSection}>
            <ScrollView
              ref={carouselRef}
              horizontal
              showsHorizontalScrollIndicator={false}
              decelerationRate="fast"
              snapToInterval={SNAP_INTERVAL}
              snapToAlignment="start"
              contentContainerStyle={styles.heroScrollContainer}
              onScrollBeginDrag={() => {
                isUserTouchingRef.current = true;
              }}
              onScrollEndDrag={() => {
                setTimeout(() => {
                  isUserTouchingRef.current = false;
                }, 4000);
              }}
              onMomentumScrollEnd={onHeroScroll}
              style={styles.heroScrollView}
            >
              {HERO_SLIDES.map((slide) => (
                <TouchableOpacity
                  key={slide.id}
                  onPress={() => handleHeroSlidePress(slide)}
                  activeOpacity={0.92}
                  style={styles.heroSlide}
                  accessibilityRole="button"
                  accessibilityLabel={`${slide.title} - ${slide.subtitle}`}
                >
                  {/* Left Content Area */}
                  <View style={styles.heroLeft}>
                    <View style={[styles.heroBadgePill, { backgroundColor: slide.themePillBg }]}>
                      <Text style={[styles.heroBadgePillText, { color: slide.themePillText }]}>
                        {isTamil ? slide.badgeTa : slide.badge}
                      </Text>
                    </View>

                    <Text style={styles.heroTitle} numberOfLines={1}>
                      {isTamil ? slide.titleTa : slide.title}
                    </Text>

                    <Text style={[styles.heroSubHeading, { color: slide.accentColor }]} numberOfLines={1}>
                      {isTamil ? slide.subtitleTa : slide.subtitle}
                    </Text>

                    <Text style={styles.heroDesc} numberOfLines={2}>
                      {isTamil ? slide.descTa : slide.desc}
                    </Text>

                    <View style={[styles.heroCta, { backgroundColor: slide.accentColor }]}>
                      <Text style={styles.heroCtaText}>
                        {isTamil ? slide.ctaTa : slide.cta}
                      </Text>
                      <View style={styles.heroCtaIcon}>
                        <ArrowRight size={12} color={slide.accentColor} strokeWidth={2.8} />
                      </View>
                    </View>
                  </View>

                  {/* Right Image / Showcase Area */}
                  <View style={styles.heroRight}>
                    <View style={styles.heroImageContainer}>
                      <Image
                        source={{
                          uri: proxyImageUrl(
                            failedImages[slide.id]
                              ? 'https://www.ashokrajgroups.com/images/Restaurant/hero-image.JPG'
                              : slide.image
                          ),
                        }}
                        style={styles.heroImage}
                        resizeMode="cover"
                        onError={() => {
                          setFailedImages((prev) => ({ ...prev, [slide.id]: true }));
                        }}
                      />
                      {/* Floating Trust / Highlight Tag */}
                      <View style={styles.heroImagePill}>
                        <Text style={styles.heroImagePillValue}>{slide.trustedValue}</Text>
                        <Text style={styles.heroImagePillSub}>{slide.trustedSub}</Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Carousel Dots */}
            <View style={styles.dots}>
              {HERO_SLIDES.map((slide, index) => (
                <TouchableOpacity
                  key={slide.id}
                  onPress={() => goToSlide(index)}
                  activeOpacity={0.7}
                  style={[styles.dot, index === carouselIndex && styles.dotActive]}
                />
              ))}
            </View>
          </View>

        {/* Our Services Section */}
        <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{isTamil ? 'எங்கள் சேவைகள்' : 'Our Services'}</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.serviceRow}>
              {services.map((service) => {
                const Icon = service.icon;
                return (
                  <TouchableOpacity
                    key={service.title}
                    onPress={() => {
                      Haptics.selectionAsync();
                      service.onPress();
                    }}
                    activeOpacity={0.84}
                    style={styles.serviceCard}
                  >
                    <View style={[styles.serviceIcon, { backgroundColor: service.tint }]}>
                      <Icon size={23} color={service.iconColor} strokeWidth={2} />
                    </View>
                    <Text style={styles.serviceName} numberOfLines={1}>{service.title}</Text>
                    <Text style={styles.serviceDesc} numberOfLines={2}>{service.desc}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>


        {/* Popular / Filtered Dishes Section */}
        {filteredFoods.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Sparkles size={18} color="#2563EB" />
                <Text style={styles.sectionTitle}>
                  {selectedCategory === 'BAKERY'
                    ? isTamil ? 'பேக்கரி & இனிப்புகள்' : 'Bakery & Sweets'
                    : selectedCategory === 'VEG'
                    ? isTamil ? 'தூய சைவ உணவுகள்' : 'Pure Veg Specialties'
                    : isTamil ? 'இன்றைய ஸ்பெஷல் உணவுகள்' : 'Popular Dishes Today'}
                </Text>
              </View>

              <TouchableOpacity
                onPress={() => {
                  Haptics.selectionAsync();
                  if (selectedCategory === 'BAKERY') onNavigateToRestaurant('bakery');
                  else if (selectedCategory === 'VEG') onNavigateToRestaurant('veg');
                  else onNavigateToRestaurant('restaurant');
                }}
                style={styles.viewAll}
                activeOpacity={0.7}
              >
                <Text style={styles.viewAllText}>{isTamil ? 'முழு மெனு' : 'View full menu'}</Text>
                <ArrowRight size={15} color="#2563EB" />
              </TouchableOpacity>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.popularRow}>
              {filteredFoods.map((item) => (
                <FoodCard
                  key={item.id}
                  id={item.id}
                  name={item.name}
                  nameTa={item.nameTa}
                  description={item.description}
                  price={Number(item.price)}
                  isVeg={Boolean(item.isVeg ?? item.isVegetarian)}
                  isSpicy={item.isSpicy}
                  imageUrl={item.imageUrl}
                  onPress={() => onFoodPress(item.id)}
                  onAddToCart={() => onAddFoodToCart(item.id)}
                  cartQuantity={cartQuantityFor(item.id)}
                />
              ))}
            </ScrollView>
          </View>
        )}

        {/* Featured Lodge Rooms Section */}
        {filteredRooms.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Hotel size={18} color="#7C3AED" />
                <Text style={styles.sectionTitle}>
                  {isTamil ? 'லாட்ஜ் அறைகள்' : 'Rooms & Suites'}
                </Text>
              </View>

              <TouchableOpacity
                onPress={() => {
                  Haptics.selectionAsync();
                  onNavigateToLodge();
                }}
                style={styles.viewAll}
                activeOpacity={0.7}
              >
                <Text style={styles.viewAllText}>{isTamil ? 'அனைத்து அறைகள்' : 'View all rooms'}</Text>
                <ArrowRight size={15} color="#2563EB" />
              </TouchableOpacity>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.popularRow}>
              {filteredRooms.map((room) => {
                const roomTitle = room.name || (room as any).title;
                const roomTitleTa = room.nameTa || (room as any).titleTa;
                const roomPrice = Number(room.pricePerNight || (room as any).basePrice || (room as any).price || 1200);
                const roomImg = (room as any).imageUrl || room.images?.[0] || 'https://www.ashokrajgroups.com/images/Lodge/double-bed-ac.webp';

                return (
                  <RoomCard
                    key={room.id}
                    id={room.id}
                    name={roomTitle}
                    title={roomTitle}
                    nameTa={roomTitleTa}
                    titleTa={roomTitleTa}
                    description={room.description}
                    pricePerNight={roomPrice}
                    basePrice={roomPrice}
                    maxOccupancy={room.maxOccupancy || (room as any).capacity || 2}
                    amenities={room.amenities}
                    imageUrl={roomImg}
                    isAvailable={true}
                    compact
                    onPress={() => onRoomPress(room.id)}
                  />
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* Empty State for Search or Filter */}
        {filteredFoods.length === 0 && filteredRooms.length === 0 && (
          <View style={{ paddingHorizontal: 16, marginVertical: 16 }}>
            <EmptyState
              title={
                searchQuery.trim().length > 0
                  ? isTamil ? `"${searchQuery}" க்கான முடிவுகள் இல்லை` : `No matches for "${searchQuery}"`
                  : isTamil ? 'பொருட்கள் எதுவும் கிடைக்கவில்லை' : 'No items found in this category'
              }
              description={
                searchQuery.trim().length > 0
                  ? isTamil
                    ? 'வேறு உணவுகள், பேக்கரி அல்லது அறைகளைத் தேடவும் அல்லது முழு உணவக மெனுவைப் பார்க்கவும்.'
                    : 'Try searching for Biryani, Dosa, Parotta, or explore our full restaurant menu.'
                  : isTamil
                  ? 'மற்ற சேவைகளைத் தேர்ந்தெடுக்கவும்.'
                  : 'Try selecting another service category above.'
              }
              actionTitle={isTamil ? 'உணவக மெனு பார்க்க' : 'Browse Restaurant Menu'}
              onActionPress={() => {
                setSearchQuery('');
                setSelectedCategory('ALL');
                onNavigateToRestaurant('restaurant');
              }}
            />
          </View>
        )}

        {/* Recent Activity Section */}
        <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{isTamil ? 'சமீபத்திய நடவடிக்கை' : 'Your recent activity'}</Text>
              <TouchableOpacity onPress={onNavigateToOrders} style={styles.viewAll} activeOpacity={0.7}>
                <Text style={styles.viewAllText}>{isTamil ? 'அனைத்தும்' : 'View all'}</Text>
                <ArrowRight size={16} color="#2563EB" />
              </TouchableOpacity>
            </View>

            {/* Activity Filter Chips */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.activityFilterScroll}
            >
              {[
                { key: 'ALL', label: isTamil ? 'அனைத்தும்' : 'All Activities' },
                { key: 'ORDERS', label: isTamil ? 'உணவு ஆர்டர்' : 'Food Orders' },
                { key: 'LODGE', label: isTamil ? 'லாட்ஜ் தங்குமிடம்' : 'Lodge Stay' },
                { key: 'MINI_HALL', label: isTamil ? 'மினி ஹால்' : 'Mini Hall' },
              ].map((f) => (
                <TouchableOpacity
                  key={f.key}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setActivityFilter(f.key as any);
                  }}
                  style={[
                    styles.activityFilterChip,
                    activityFilter === f.key && styles.activityFilterChipActive,
                  ]}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.activityFilterText,
                      activityFilter === f.key && styles.activityFilterTextActive,
                    ]}
                  >
                    {f.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Activities List */}
            <View style={styles.activityList}>
              {/* 1. Real Food Order Activity */}
              {latestOrder && (activityFilter === 'ALL' || activityFilter === 'ORDERS') && (
                <TouchableOpacity
                  onPress={onNavigateToOrders}
                  activeOpacity={0.85}
                  style={styles.activityCard}
                >
                  <View style={[styles.activityIcon, { backgroundColor: '#EFF6FF' }]}>
                    <ShoppingBag size={21} color="#2563EB" />
                  </View>
                  <View style={styles.activityBody}>
                    <Text style={styles.activityTitle}>{orderNumberStr}</Text>
                    <Text style={styles.activityDescription} numberOfLines={1}>
                      {orderItemCount} {isTamil ? 'பொருட்கள்' : 'Items'} • {orderTypeStr}
                    </Text>
                    <Text style={styles.activityDate}>{getEstimatedTimeStr()}</Text>
                  </View>
                  <View style={styles.activityRight}>
                    <View style={[styles.statusPill, { backgroundColor: statusInfo.bg }]}>
                      <Text style={[styles.statusText, { color: statusInfo.text }]}>
                        {statusInfo.label}
                      </Text>
                    </View>
                    <ChevronRight size={16} color="#475569" />
                  </View>
                </TouchableOpacity>
              )}

              {/* 2. Real Lodge Stay Activity */}
              {data?.activeBooking && (activityFilter === 'ALL' || activityFilter === 'LODGE') && (
                <TouchableOpacity
                  onPress={() => (onNavigateToBookings ? onNavigateToBookings() : onNavigateToLodge())}
                  activeOpacity={0.85}
                  style={styles.activityCard}
                >
                  <View style={[styles.activityIcon, { backgroundColor: '#EEF2FF' }]}>
                    <Hotel size={21} color="#4F46E5" />
                  </View>
                  <View style={styles.activityBody}>
                    <Text style={styles.activityTitle}>
                      {isTamil
                        ? `லாட்ஜ் தங்குமிடம் #${data.activeBooking.bookingNumber}`
                        : `Lodge Stay #${data.activeBooking.bookingNumber}`}
                    </Text>
                    <Text style={styles.activityDescription} numberOfLines={1}>
                      {isTamil
                        ? `அறை ${data.activeBooking.roomNumber} • ${data.activeBooking.roomTypeTitleTa || data.activeBooking.roomTypeTitle}`
                        : `Room ${data.activeBooking.roomNumber} • ${data.activeBooking.roomTypeTitle}`}
                    </Text>
                    <Text style={styles.activityDate}>
                      {data.activeBooking.checkInDate
                        ? new Date(data.activeBooking.checkInDate).toLocaleDateString()
                        : ''}
                    </Text>
                  </View>
                  <View style={styles.activityRight}>
                    <View style={[styles.statusPill, { backgroundColor: '#DCFCE7' }]}>
                      <Text style={[styles.statusText, { color: '#15803D' }]}>
                        {data.activeBooking.status}
                      </Text>
                    </View>
                    <ChevronRight size={16} color="#475569" />
                  </View>
                </TouchableOpacity>
              )}

              {/* Empty activities state */}
              {!((latestOrder && (activityFilter === 'ALL' || activityFilter === 'ORDERS')) ||
                (data?.activeBooking && (activityFilter === 'ALL' || activityFilter === 'LODGE'))) && (
                <View style={styles.emptyActivityCard}>
                  <Text style={styles.emptyActivityText}>
                    {isTamil
                      ? 'செயலில் உள்ள ஆர்டர்கள் அல்லது தங்குமிடங்கள் எதுவும் இல்லை'
                      : 'No active orders or reservations yet'}
                  </Text>
                </View>
              )}
            </View>
          </View>

        {/* About AshokRaj Groups */}
        <View style={styles.aboutCardContainer}>
          <GlassCard style={styles.aboutCard} bordered>
            <View style={styles.aboutHeaderRow}>
              <View style={styles.aboutIconWrap}>
                <Building2 size={22} color="#2563EB" />
              </View>
              <View style={styles.aboutTextCol}>
                <Text style={styles.aboutTitle}>AshokRaj Groups</Text>
                <Text style={styles.aboutSubtitle}>
                  {isTamil
                    ? 'எங்கள் உணவகம், பேக்கரி, லாட்ஜ் & மினி ஹால் சேவைகளை அறியுங்கள்.'
                    : 'Discover our restaurant, bakery, lodge and event facilities.'}
                </Text>
              </View>
            </View>
            <View style={styles.aboutActionRow}>
              <TouchableOpacity
                onPress={() => {
                  Haptics.selectionAsync();
                  setAboutModalVisible(true);
                }}
                style={styles.aboutLearnMoreBtn}
                activeOpacity={0.8}
              >
                <Text style={styles.aboutLearnMoreText}>
                  {isTamil ? 'மேலும் அறிய →' : 'Learn More →'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  Haptics.selectionAsync();
                  Linking.openURL('https://www.ashokrajgroups.com/');
                }}
                style={styles.aboutWebsiteLink}
                activeOpacity={0.8}
              >
                <Text style={styles.aboutWebsiteLinkText}>
                  {isTamil ? 'இணையதளம்' : 'ashokrajgroups.com'}
                </Text>
                <ExternalLink size={13} color="#64748B" />
              </TouchableOpacity>
            </View>
          </GlassCard>
        </View>
      </ScrollView>

      {/* Floating View Cart Button */}
      {totalCartCount > 0 && (
        <FloatingActionButton
          icon={<ShoppingBag size={19} color="#FFFFFF" />}
          label={isTamil ? 'கார்ட் காண்' : 'View Cart'}
          badgeCount={totalCartCount}
          onPress={() => onNavigateToCart?.()}
        />
      )}

      {/* About Modal */}
      <AboutAshokRajModal
        visible={aboutModalVisible}
        onClose={() => setAboutModalVisible(false)}
      />

      {/* Branch Selection Modal */}
      <BranchSelectionModal
        visible={branchModalVisible}
        onClose={() => setBranchModalVisible(false)}
      />

      {/* Location Selector Modal */}
      <LocationSelectorModal
        visible={locationModalVisible}
        onClose={() => {
          setLocationModalVisible(false);
          setIsLocationMandatory(false);
        }}
        mandatory={isLocationMandatory}
      />

      {/* Interactive Home Page Onboarding Tour Modal */}
      <HomePageTourModal
        visible={isTourActive}
        onFinishOrSkip={handleTourFinishOrSkip}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    paddingBottom: 112,
  },
  offlineBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: Spacing.base,
    paddingVertical: 8,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#FDE68A',
  },
  offlineText: {
    fontSize: FontSize.xs,
    color: '#92400E',
    flex: 1,
    fontWeight: '600',
  },
  offlineRetryBtn: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: Radius.full,
  },
  offlineRetryText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  header: {
    minHeight: 76,
    paddingHorizontal: Spacing.base,
    paddingTop: 8,
    paddingBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  locationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EFF6FF',
    borderWidth: 1.2,
    borderColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      web: {
        boxShadow: '0 4px 12px rgba(37, 99, 235, 0.10)',
      },
      default: {
        shadowColor: '#2563EB',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 2,
      },
    }),
  },
  deliverToCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  deliverToLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  deliverToHeading: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.7,
  },
  coverageDot: {
    width: 6.5,
    height: 6.5,
    borderRadius: 3.5,
  },
  deliverToAddressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: '96%',
    marginTop: 2,
  },
  deliverToAddressText: {
    color: '#0F172A',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    ...Platform.select({
      web: {
        boxShadow: '0 4px 14px rgba(15, 23, 42, 0.06)',
        backdropFilter: 'blur(10px)',
      },
      default: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 10,
        elevation: 2,
      },
    }),
  },
  profileDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2563EB',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  searchContainer: {
    paddingHorizontal: Spacing.base,
    marginBottom: 8,
  },
  categoryFilterRow: {
    paddingHorizontal: Spacing.base,
    paddingVertical: 6,
    gap: 8,
    marginBottom: Spacing.xs,
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: Radius.full,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
  },
  categoryChipActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  categoryChipText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#475569',
  },
  categoryChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  searchFeedbackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingVertical: 6,
    marginBottom: 4,
  },
  searchFeedbackText: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    color: '#0F172A',
  },
  clearSearchText: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    color: '#2563EB',
  },
  heroSection: {
    marginBottom: Spacing.lg,
    marginTop: 4,
  },
  heroScrollView: {
    height: CAROUSEL_HEIGHT,
  },
  heroScrollContainer: {
    paddingLeft: CARD_MARGIN,
    paddingRight: CARD_MARGIN + CARD_PEEK,
    gap: CARD_GAP,
  },
  heroSlide: {
    width: CARD_WIDTH,
    height: CAROUSEL_HEIGHT,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 13,
    overflow: 'hidden',
    ...Platform.select({
      web: {
        boxShadow: '0 6px 20px rgba(15, 23, 42, 0.08)',
      },
      default: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 14,
        elevation: 3,
      },
    }),
  },
  heroLeft: {
    flex: 1,
    height: '100%',
    justifyContent: 'space-between',
    paddingRight: 10,
  },
  heroBadgePill: {
    alignSelf: 'flex-start',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  heroBadgePillText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.1,
  },
  heroTitle: {
    color: '#0F172A',
    fontSize: 17.5,
    fontWeight: '900',
    letterSpacing: -0.3,
    marginTop: 2,
  },
  heroSubHeading: {
    color: '#2563EB',
    fontSize: 12,
    fontWeight: '800',
    marginTop: 1,
  },
  heroDesc: {
    color: '#475569',
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '600',
    marginTop: 2,
    marginBottom: 4,
  },
  heroCta: {
    alignSelf: 'flex-start',
    height: 32,
    paddingLeft: 12,
    paddingRight: 5,
    borderRadius: 16,
    backgroundColor: '#2563EB',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  heroCtaText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  heroCtaIcon: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroRight: {
    width: 125,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroImageContainer: {
    width: 125,
    height: 194,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroImagePill: {
    position: 'absolute',
    bottom: 8,
    left: 6,
    right: 6,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    borderRadius: 10,
    paddingVertical: 3,
    paddingHorizontal: 6,
    alignItems: 'center',
  },
  heroImagePillValue: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
  },
  heroImagePillSub: {
    color: '#93C5FD',
    fontSize: 8.5,
    fontWeight: '700',
  },
  dots: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 10,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#CBD5E1',
  },
  dotActive: {
    width: 20,
    backgroundColor: '#2563EB',
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionHeader: {
    paddingHorizontal: Spacing.base,
    marginBottom: 11,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    color: '#0F172A',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  viewAll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingVertical: 5,
  },
  viewAllText: {
    color: '#2563EB',
    fontSize: 12.5,
    fontWeight: '700',
  },
  serviceRow: {
    paddingHorizontal: Spacing.base,
    paddingRight: Spacing.base,
    gap: 10,
  },
  serviceCard: {
    width: 112,
    minHeight: 140,
    paddingHorizontal: 8,
    paddingVertical: 12,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      web: {
        boxShadow: '0 4px 14px rgba(15, 23, 42, 0.05)',
        backdropFilter: 'blur(10px)',
      },
      default: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
      },
    }),
  },
  serviceIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  serviceName: {
    color: '#0F172A',
    fontSize: 13,
    fontWeight: '800',
    textAlign: 'center',
  },
  serviceDesc: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 3,
  },
  miniHallBannerContainer: {
    paddingHorizontal: Spacing.base,
    marginBottom: Spacing.lg,
  },
  miniHallBanner: {
    height: 170,
    borderRadius: 22,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#0F172A',
    ...Platform.select({
      web: {
        boxShadow: '0 6px 20px rgba(15, 23, 42, 0.12)',
      },
      default: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.12,
        shadowRadius: 14,
        elevation: 4,
      },
    }),
  },
  miniHallBannerImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    opacity: 0.45,
  },
  miniHallOverlay: {
    flex: 1,
    padding: Spacing.md,
    justifyContent: 'space-between',
  },
  miniHallBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(234, 88, 12, 0.9)',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.sm,
  },
  miniHallBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  miniHallTitle: {
    fontSize: 19,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  miniHallSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    color: '#E2E8F0',
    maxWidth: '85%',
  },
  miniHallCtaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  miniHallBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#2563EB',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: Radius.full,
  },
  miniHallBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  popularRow: {
    paddingHorizontal: Spacing.base,
    gap: 12,
  },
  activityFilterScroll: {
    paddingHorizontal: Spacing.base,
    gap: 8,
    marginBottom: 12,
  },
  activityFilterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  activityFilterChipActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  activityFilterText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#475569',
  },
  activityFilterTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  activityList: {
    gap: 10,
  },
  activityCard: {
    marginHorizontal: Spacing.base,
    padding: 14,
    borderRadius: 21,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    ...Platform.select({
      web: {
        boxShadow: '0 4px 14px rgba(15, 23, 42, 0.05)',
        backdropFilter: 'blur(10px)',
      },
      default: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 2,
      },
    }),
  },
  activityIcon: {
    width: 45,
    height: 45,
    borderRadius: 23,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityBody: {
    flex: 1,
    marginHorizontal: 12,
  },
  activityTitle: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '800',
  },
  activityDescription: {
    color: '#475569',
    fontSize: 11,
    marginTop: 2,
    fontWeight: '500',
  },
  activityDate: {
    color: '#64748B',
    fontSize: 10,
    marginTop: 3,
  },
  activityRight: {
    alignItems: 'flex-end',
    gap: 8,
  },
  statusPill: {
    backgroundColor: '#ECFDF3',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: Radius.full,
  },
  statusText: {
    color: '#15803D',
    fontSize: 9.5,
    fontWeight: '800',
  },
  emptyActivityCard: {
    marginHorizontal: Spacing.base,
    paddingVertical: 18,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyActivityText: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  aboutCardContainer: {
    marginHorizontal: Spacing.base,
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
  },
  aboutCard: {
    borderRadius: 22,
    gap: 12,
  },
  aboutHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  aboutIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  aboutTextCol: {
    flex: 1,
    gap: 2,
  },
  aboutTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  aboutSubtitle: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 17,
    fontWeight: '500',
  },
  aboutActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  aboutLearnMoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
  },
  aboutLearnMoreText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2563EB',
  },
  aboutWebsiteLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
  },
  aboutWebsiteLinkText: {
    fontSize: 11.5,
    color: '#64748B',
    fontWeight: '600',
  },
});
