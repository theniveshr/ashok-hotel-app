import React, { useMemo, useState } from 'react';
import {
  StatusBar,
  StyleSheet,
  View
} from 'react-native';
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

  const { colors } = useTheme();
  const cartItems = useCartStore((state) => state.items);
  const addItem = useCartStore((state) => state.addItem);
  const homeData = useHomeStore((state) => state.data);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const restoreSession = useAuthStore((state) => state.restoreSession);

  React.useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  const [activeScreen, setActiveScreen] = useState<ActiveScreen>('splash');
  const [activeTab, setActiveTab] = useState<TabKey>('home');
  const [loginInitialPhone, setLoginInitialPhone] = useState<string>('');
  const [loginSuccessMessage, setLoginSuccessMessage] = useState<string>('');
  const [selectedFoodId, setSelectedFoodId] = useState<string>('item-ghee-dosa');
  const [selectedRoomId, setSelectedRoomId] = useState<string>('rt-double-ac');
  const [restaurantSegment, setRestaurantSegment] = useState<'restaurant' | 'bakery' | 'veg'>('restaurant');
  const [returnScreen, setReturnScreen] = useState<'tabs' | 'restaurant' | 'lodge' | 'register' | 'login'>('tabs');

  // Route protection: Block unauthenticated access to protected screens
  React.useEffect(() => {
    const unauthenticatedScreens = ['splash', 'register', 'login', 'onboarding', 'settings', 'language'];
    if (!isAuthenticated && !unauthenticatedScreens.includes(activeScreen)) {
      setActiveScreen('register');
    }
  }, [isAuthenticated, activeScreen]);

  const cartCount = useMemo(() => cartItems.reduce((sum, item) => sum + item.quantity, 0), [cartItems]);

  if (!fontsLoaded) {
    return <View style={styles.fontLoading} />;
  }

  const goTabs = (tab: TabKey) => {
    setActiveTab(tab);
    setActiveScreen('tabs');
  };

  const openRestaurant = (seg: 'restaurant' | 'bakery' | 'veg' = 'restaurant') => {
    setRestaurantSegment(seg);
    setActiveScreen('restaurant');
  };

  const openFood = (id: string, from: 'tabs' | 'restaurant' = 'tabs') => {
    setSelectedFoodId(id);
    setReturnScreen(from);
    setActiveScreen('food-detail');
  };

  const openRoom = (id: string, from: 'tabs' | 'lodge' = 'tabs') => {
    setSelectedRoomId(id);
    setReturnScreen(from);
    setActiveScreen('room-detail');
  };

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
              setActiveScreen('register');
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
              if (useAuthStore.getState().isAuthenticated) {
                goTabs('home');
              } else {
                setActiveScreen('register');
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
            onOpenSettings={() => {
              setReturnScreen('register');
              setActiveScreen('settings');
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
            onOpenSettings={() => {
              setReturnScreen('login');
              setActiveScreen('settings');
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
    <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="dark-content" backgroundColor={Palette.slate50} />
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
  root: { flex: 1 },
  screenContainer: { flex: 1 },
});
