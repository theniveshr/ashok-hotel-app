import React, { useMemo, useState, useEffect, useCallback } from 'react';
import {
  BackHandler,
  Linking,
  StatusBar,
  StyleSheet,
  View
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import { ThemeProvider, useTheme } from './theme/ThemeContext';
import { BottomNavigation, type TabKey } from './components/ui/BottomNavigation';
import {
  BookingScreen,
  BookingsScreen,
  CartScreen,
  CheckoutScreen,
  DineInScreen,
  FoodDetailScreen,
  HomeScreen,
  LanguageScreen,
  LoginScreen,
  RegisterScreen,
  LodgeScreen,
  MiniHallScreen,
  NotificationsScreen,
  OffersScreen,
  OnboardingScreen,
  OrdersScreen,
  ProfileScreen,
  RestaurantScreen,
  RoomDetailScreen,
  SettingsScreen,
  SplashScreen,
  WaiterScreen,
  TableReservationScreen,
} from './screens';
import { useCartStore } from './store/useCartStore';
import { useHomeStore } from './store/useHomeStore';
import { useAuthStore } from './store/useAuthStore';
import { Palette } from '@ashok-raj/ui';

type ActiveScreen =
  | 'splash'
  | 'register'
  | 'login'
  | 'onboarding'
  | 'tabs'
  | 'restaurant'
  | 'lodge'
  | 'food-detail'
  | 'cart'
  | 'checkout'
  | 'dine-in'
  | 'table-reservation'
  | 'room-detail'
  | 'booking'
  | 'mini-hall'
  | 'settings'
  | 'language'
  | 'notifications'
  | 'waiter';

function MainApp() {
  const [fontsLoaded] = useFonts({
    MPLUSU: require('./assets/fonts/MPLUSU-VariableFont_wght.ttf'),
  });

  const { colors, isDark } = useTheme();
  const cartItems = useCartStore((state) => state.items);
  const addItem = useCartStore((state) => state.addItem);
  const homeData = useHomeStore((state) => state.data);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const authState = useAuthStore((state) => state.authState);
  const restoreSession = useAuthStore((state) => state.restoreSession);

  React.useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  const [activeScreen, setActiveScreen] = useState<ActiveScreen>('splash');
  const [activeTab, setActiveTab] = useState<TabKey>('home');
  const [loginInitialPhone, setLoginInitialPhone] = useState<string>('');
  const [loginSuccessMessage, setLoginSuccessMessage] = useState<string>('');
  const [selectedFoodId, setSelectedFoodId] = useState<string>('rest-ghee-dosa');
  const [selectedRoomId, setSelectedRoomId] = useState<string>('00000000-0000-0000-0001-000000000001');
  const [restaurantSegment, setRestaurantSegment] = useState<'restaurant' | 'bakery' | 'veg'>('restaurant');
  const [returnScreen, setReturnScreen] = useState<'tabs' | 'restaurant' | 'lodge' | 'register' | 'login'>('tabs');

  // Restore persisted active tab
  useEffect(() => {
    AsyncStorage.getItem('@ashok_raj_active_tab')
      .then((stored) => {
        if (stored && ['home', 'orders', 'bookings', 'offers', 'profile'].includes(stored)) {
          setActiveTab(stored as TabKey);
        }
      })
      .catch(() => {});
  }, []);

  // Route protection: Block unauthenticated access to protected screens
  React.useEffect(() => {
    const unauthenticatedScreens = ['splash', 'register', 'login', 'onboarding', 'settings', 'language'];
    if (!isAuthenticated && !unauthenticatedScreens.includes(activeScreen)) {
      if (authState === 'NEW_USER') {
        setActiveScreen('register');
      } else {
        if (authState === 'SESSION_EXPIRED') {
          setLoginSuccessMessage('Your 30-day session has expired. Please log in again.');
        }
        setActiveScreen('login');
      }
    }
  }, [isAuthenticated, activeScreen, authState]);

  const cartCount = useMemo(() => cartItems.reduce((sum, item) => sum + item.quantity, 0), [cartItems]);

  const goTabs = useCallback((tab: TabKey) => {
    setActiveTab(tab);
    setActiveScreen('tabs');
    AsyncStorage.setItem('@ashok_raj_active_tab', tab).catch(() => {});
  }, []);

  const openRestaurant = useCallback((seg: 'restaurant' | 'bakery' | 'veg' = 'restaurant') => {
    setRestaurantSegment(seg);
    setActiveScreen('restaurant');
  }, []);

  const openFood = useCallback((id: string, from: 'tabs' | 'restaurant' = 'tabs') => {
    setSelectedFoodId(id);
    setReturnScreen(from);
    setActiveScreen('food-detail');
  }, []);

  const openRoom = useCallback((id: string, from: 'tabs' | 'lodge' = 'tabs') => {
    setSelectedRoomId(id);
    setReturnScreen(from);
    setActiveScreen('room-detail');
  }, []);

  // Hardware Back Button Handler (Android)
  useEffect(() => {
    const onBackPress = () => {
      if (activeScreen === 'tabs') {
        if (activeTab !== 'home') {
          goTabs('home');
          return true;
        }
        return false;
      }

      switch (activeScreen) {
        case 'food-detail':
        case 'cart':
        case 'room-detail':
          setActiveScreen(returnScreen);
          return true;
        case 'checkout':
          setActiveScreen('cart');
          return true;
        case 'booking':
          setActiveScreen('room-detail');
          return true;
        case 'restaurant':
        case 'lodge':
        case 'mini-hall':
        case 'dine-in':
        case 'table-reservation':
        case 'notifications':
        case 'waiter':
          goTabs('home');
          return true;
        case 'settings':
          goTabs('profile');
          return true;
        case 'language':
          setActiveScreen('settings');
          return true;
        case 'register':
          setActiveScreen('login');
          return true;
        default:
          goTabs('home');
          return true;
      }
    };

    const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => sub.remove();
  }, [activeScreen, activeTab, returnScreen, goTabs]);

  // Deep Link Handler
  const handleDeepLink = useCallback(
    (urlStr: string | null) => {
      if (!urlStr) return;
      try {
        const url = new URL(urlStr);
        const host = url.host || url.hostname;
        const path = (url.pathname || '').replace(/^\/+/, '');
        const searchParams = url.searchParams;

        const route = host || path;
        if (route.includes('restaurant')) {
          const seg = (searchParams.get('segment') as any) || 'restaurant';
          openRestaurant(seg);
        } else if (route.includes('bakery')) {
          openRestaurant('bakery');
        } else if (route.includes('veg')) {
          openRestaurant('veg');
        } else if (route.includes('lodge') || route.includes('stay')) {
          setActiveScreen('lodge');
        } else if (route.includes('mini-hall') || route.includes('hall')) {
          setActiveScreen('mini-hall');
        } else if (route.includes('table-reservation') || route.includes('table')) {
          setActiveScreen('table-reservation');
        } else if (route.includes('dine-in') || route.includes('scan')) {
          setActiveScreen('dine-in');
        } else if (route.includes('orders')) {
          goTabs('orders');
        } else if (route.includes('bookings')) {
          goTabs('bookings');
        } else if (route.includes('offers')) {
          goTabs('offers');
        } else if (route.includes('cart')) {
          setActiveScreen('cart');
        } else if (route.includes('food')) {
          const id = searchParams.get('id') || searchParams.get('foodId') || path.split('/')[1];
          if (id) openFood(id);
        } else if (route.includes('room')) {
          const id = searchParams.get('id') || searchParams.get('roomId') || path.split('/')[1];
          if (id) openRoom(id);
        }
      } catch {
        if (urlStr.includes('restaurant')) openRestaurant('restaurant');
        else if (urlStr.includes('bakery')) openRestaurant('bakery');
        else if (urlStr.includes('veg')) openRestaurant('veg');
        else if (urlStr.includes('lodge')) setActiveScreen('lodge');
        else if (urlStr.includes('mini-hall')) setActiveScreen('mini-hall');
        else if (urlStr.includes('table-reservation')) setActiveScreen('table-reservation');
        else if (urlStr.includes('dine-in')) setActiveScreen('dine-in');
      }
    },
    [openRestaurant, openFood, openRoom, goTabs]
  );

  useEffect(() => {
    Linking.getInitialURL().then(handleDeepLink).catch(() => {});
    const sub = Linking.addEventListener('url', (event) => handleDeepLink(event.url));
    return () => sub.remove();
  }, [handleDeepLink]);

  if (!fontsLoaded) {
    return <View style={styles.fontLoading} />;
  }

  const addFoodToCart = (id: string) => {
    const item = homeData?.popularFoods?.find((food) => food.id === id);
    if (!item) return;
    addItem({
      id: item.id,
      name: item.name,
      nameTa: item.nameTa,
      price: Number(item.price),
      discountPercentage: Number(item.discountPercentage ?? 0),
      isVeg: Boolean(item.isVegetarian),
      imageUrl: item.imageUrl ?? undefined,
      quantity: 1,
    });
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'orders':
        return (
          <OrdersScreen
            onFoodPress={(id) => openFood(id, 'tabs')}
            onViewCart={() => {
              setReturnScreen('tabs');
              setActiveScreen('cart');
            }}
          />
        );
      case 'bookings':
        return <BookingsScreen onOrderRoomService={() => goTabs('home')} />;
      case 'offers':
        return <OffersScreen onApplyCoupon={() => goTabs('orders')} />;
      case 'profile':
        return (
          <ProfileScreen
            onNavigateToSettings={() => setActiveScreen('settings')}
            onNavigateToLanguage={() => setActiveScreen('language')}
            onNavigateToNotifications={() => setActiveScreen('notifications')}
            onNavigateToOrders={() => goTabs('orders')}
            onNavigateToBookings={() => goTabs('bookings')}
            onNavigateToOffers={() => goTabs('offers')}
            onSignOut={() => {
              setLoginSuccessMessage('');
              setActiveScreen('login');
            }}
          />
        );
      case 'home':
      default:
        return (
          <HomeScreen
            onNavigateToRestaurant={openRestaurant}
            onNavigateToLodge={() => setActiveScreen('lodge')}
            onNavigateToMiniHall={() => setActiveScreen('mini-hall')}
            onNavigateToTableReservation={() => setActiveScreen('table-reservation')}
            onNavigateToOffers={() => goTabs('offers')}
            onNavigateToOrders={() => goTabs('orders')}
            onNavigateToBookings={() => goTabs('bookings')}
            onNavigateToProfile={() => goTabs('profile')}
            onNavigateToNotifications={() => {
              setReturnScreen('tabs');
              setActiveScreen('notifications');
            }}
            onFoodPress={(id) => openFood(id, 'tabs')}
            onRoomPress={(id) => openRoom(id, 'tabs')}
            onAddFoodToCart={addFoodToCart}
            onNavigateToCart={() => setActiveScreen('cart')}
          />
        );
    }
  };

  const renderScreen = () => {
    switch (activeScreen) {
      case 'splash':
        return (
          <SplashScreen
            onFinish={() => {
              const currentAuth = useAuthStore.getState();
              if (currentAuth.isAuthenticated) {
                goTabs('home');
              } else if (currentAuth.authState === 'NEW_USER') {
                setActiveScreen('register');
              } else {
                if (currentAuth.authState === 'SESSION_EXPIRED') {
                  setLoginSuccessMessage('Your 30-day session has expired. Please log in again.');
                }
                setActiveScreen('login');
              }
            }}
          />
        );
      case 'register':
        return (
          <RegisterScreen
            onNavigateToLogin={() => {
              setLoginSuccessMessage('');
              setActiveScreen('login');
            }}
            onRegisterSuccess={(phone, message) => {
              setLoginInitialPhone(phone);
              setLoginSuccessMessage(message);
              setActiveScreen('login');
            }}
          />
        );
      case 'login':
        return (
          <LoginScreen
            initialPhone={loginInitialPhone}
            successMessage={loginSuccessMessage}
            onNavigateToRegister={() => {
              setLoginSuccessMessage('');
              setActiveScreen('register');
            }}
            onLoginSuccess={() => {
              setLoginSuccessMessage('');
              goTabs('home');
            }}
          />
        );
      case 'onboarding':
        return <OnboardingScreen onComplete={() => setActiveScreen('register')} />;
      case 'restaurant':
        return (
          <RestaurantScreen
            key={restaurantSegment}
            initialSegment={restaurantSegment}
            onBack={() => goTabs('home')}
            onFoodPress={(id) => openFood(id, 'restaurant')}
            onCartPress={() => setActiveScreen('cart')}
            cartCount={cartCount}
          />
        );
      case 'lodge':
        return (
          <LodgeScreen
            onBack={() => goTabs('home')}
            onRoomPress={(id) => openRoom(id, 'lodge')}
            onBookPress={(id) => {
              setSelectedRoomId(id);
              setActiveScreen('booking');
            }}
          />
        );
      case 'food-detail':
        return (
          <FoodDetailScreen
            id={selectedFoodId}
            onBack={() => setActiveScreen(returnScreen)}
            onAddToCart={() => setActiveScreen('cart')}
          />
        );
      case 'cart':
        return (
          <CartScreen
            onBack={() => setActiveScreen(returnScreen)}
            onProceedToCheckout={() => setActiveScreen('checkout')}
            onExploreMenu={() => setActiveScreen('restaurant')}
          />
        );
      case 'checkout':
        return (
          <CheckoutScreen
            onBack={() => setActiveScreen('cart')}
            onOrderSuccess={() => goTabs('orders')}
          />
        );
      case 'dine-in':
        return (
          <DineInScreen
            onBack={() => goTabs('home')}
            onExploreMenuForTable={() => setActiveScreen('restaurant')}
          />
        );
      case 'table-reservation':
        return (
          <TableReservationScreen
            onBack={() => goTabs('home')}
            onExploreMenu={() => openRestaurant()}
          />
        );
      case 'room-detail':
        return (
          <RoomDetailScreen
            id={selectedRoomId}
            onBack={() => setActiveScreen(returnScreen)}
            onBookNow={() => setActiveScreen('booking')}
          />
        );
      case 'booking':
        return (
          <BookingScreen
            initialRoomTypeId={selectedRoomId}
            onBack={() => setActiveScreen('room-detail')}
            onBookingComplete={() => goTabs('bookings')}
          />
        );
      case 'mini-hall':
        return <MiniHallScreen onBack={() => goTabs('home')} />;
      case 'settings':
        return <SettingsScreen onBack={() => goTabs('profile')} onNavigateToLanguage={() => setActiveScreen('language')} />;
      case 'language':
        return <LanguageScreen onBack={() => setActiveScreen('settings')} />;
      case 'notifications':
        return (
          <NotificationsScreen
            onBack={() => {
              if (activeTab === 'profile') goTabs('profile');
              else goTabs('home');
            }}
          />
        );
      case 'waiter':
        return <WaiterScreen onBack={() => goTabs('home')} />;
      case 'tabs':
      default:
        return renderTabContent();
    }
  };

  return (
    <SafeAreaView
      edges={activeScreen === 'tabs' ? ['top', 'left', 'right'] : ['top', 'bottom', 'left', 'right']}
      style={[styles.root, { backgroundColor: colors.background }]}
    >
      <StatusBar
        barStyle="dark-content"
        backgroundColor={colors.background}
      />
      <View style={styles.screenContainer}>{renderScreen()}</View>
      {activeScreen === 'tabs' && (
        <BottomNavigation activeTab={activeTab} onTabPress={goTabs} />
      )}
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <MainApp />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  fontLoading: { flex: 1, backgroundColor: Palette.slate50 },
  root: { flex: 1, position: 'relative' },
  screenContainer: { flex: 1 },
});
