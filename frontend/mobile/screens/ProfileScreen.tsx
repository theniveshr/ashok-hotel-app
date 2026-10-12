import { AppText as Text } from '../components/ui/AppText';
import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
  Platform,
} from 'react-native';
import {
  Award,
  Globe,
  Settings,
  Bell,
  MapPin,
  HelpCircle,
  LogOut,
  LogIn,
  ChevronRight,
  User,
  ShoppingBag,
  Calendar,
  Tag,
  Info,
  ExternalLink,
  Phone,
  ShieldCheck,
  Building2,
  Sparkles,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useTranslation } from '../i18n';
import { useTheme } from '../theme/ThemeContext';
import { Header } from '../components/ui/Header';
import { AboutAshokRajModal } from '../components/ui/AboutAshokRajModal';
import { AddressManagerModal } from '../components/ui/AddressManagerModal';
import { LoyaltyRewardsModal } from '../components/ui/LoyaltyRewardsModal';
import { Radius, Spacing, FontSize, Palette } from '@ashok-raj/ui';

import { useAuthStore } from '../store/useAuthStore';
import { useAddressStore } from '../store/useAddressStore';
import { useLoyaltyStore } from '../store/useLoyaltyStore';

export interface ProfileScreenProps {
  onNavigateToSettings: () => void;
  onNavigateToLanguage: () => void;
  onNavigateToNotifications: () => void;
  onNavigateToOrders?: () => void;
  onNavigateToBookings?: () => void;
  onNavigateToOffers?: () => void;
  onSignOut: () => void;
}

export function ProfileScreen({
  onNavigateToSettings,
  onNavigateToLanguage,
  onNavigateToNotifications,
  onNavigateToOrders,
  onNavigateToBookings,
  onNavigateToOffers,
  onSignOut,
}: ProfileScreenProps) {
  const { colors } = useTheme();
  const { isTamil, language } = useTranslation();
  const [aboutModalVisible, setAboutModalVisible] = useState(false);
  const [addressModalVisible, setAddressModalVisible] = useState(false);
  const [loyaltyModalVisible, setLoyaltyModalVisible] = useState(false);

  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const { loyalty, fetchLoyalty } = useLoyaltyStore();
  const { addresses, fetchAddresses } = useAddressStore();

  useEffect(() => {
    fetchLoyalty();
    fetchAddresses();
  }, [fetchLoyalty, fetchAddresses]);

  const handleOpenWebsite = () => {
    Haptics.selectionAsync();
    Linking.openURL('https://www.ashokrajgroups.com/');
  };

  const handleContactUs = () => {
    Haptics.selectionAsync();
    Alert.alert(
      isTamil ? 'அசோக் ராஜ் குழுமத்தை தொடர்பு கொள்க' : 'Contact AshokRaj Groups',
      isTamil
        ? 'தொலைபேசி: 04575 232 333\nவாட்ஸ்அப்: +971 54 245 8604\nமின்னஞ்சல்: ashokrajgroups@gmail.com\nமுகவரி: காளையார்கோவில், சிவகங்கை மாவட்டம்.'
        : 'Phone: 04575 232 333\nWhatsApp: +971 54 245 8604\nEmail: ashokrajgroups@gmail.com\nLocation: Kalaiyarkoil, Sivaganga District.',
      [
        {
          text: isTamil ? 'அழைக்க' : 'Call Now',
          onPress: () => Linking.openURL('tel:04575232333'),
        },
        {
          text: isTamil ? 'இணையதளம்' : 'Visit Website',
          onPress: handleOpenWebsite,
        },
        {
          text: isTamil ? 'சரி' : 'Close',
          style: 'cancel',
        },
      ]
    );
  };

  const handleTermsAndPrivacy = () => {
    Haptics.selectionAsync();
    Alert.alert(
      isTamil ? 'விதிமுறைகள் & தனியுரிமை' : 'Terms & Privacy',
      isTamil
        ? 'அசோக் ராஜ் குழுமம் உங்கள் தனியுரிமையை மதிக்கிறது. எங்கள் அனைத்து உணவு ஆர்டர்கள் மற்றும் தங்குமிட முன்பதிவுகள் தரமான விதிகளுக்கு உட்பட்டவை.'
        : 'AshokRaj Groups values your privacy and data security. All food orders and lodge bookings adhere to standard hospitality guidelines.',
      [{ text: 'OK' }]
    );
  };

  const handleSignOut = () => {
    Haptics.selectionAsync();
    Alert.alert(
      isTamil ? 'வெளியேறவா?' : 'Confirm Logout',
      isTamil
        ? 'உங்கள் கணக்கிலிருந்து வெளியேற விரும்புகிறீர்களா?'
        : 'Are you sure you want to sign out of your account?',
      [
        {
          text: isTamil ? 'ரத்து' : 'Cancel',
          style: 'cancel',
        },
        {
          text: isTamil ? 'வெளியேறு' : 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            await logout();
            onSignOut();
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        title={isTamil ? 'சுயவிவரம்' : 'Profile'}
        subtitle={isTamil ? 'என் கணக்கு & விருப்பங்கள்' : 'My Account & Preferences'}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* User Card */}
        <View
          style={[
            styles.userCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          <View
            style={[
              styles.avatarWrap,
              {
                backgroundColor: 'rgba(37, 99, 235, 0.08)',
                borderColor: colors.accent,
              },
            ]}
          >
            <Text style={[styles.avatarText, { color: colors.accent }]}>
              {user?.name ? user.name.slice(0, 2).toUpperCase() : 'G'}
            </Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={[styles.userName, { color: colors.textPrimary }]}>
              {user?.name || (isTamil ? 'விருந்தினர் கணக்கு' : 'Guest Account')}
            </Text>
            <Text style={[styles.userPhone, { color: colors.textSecondary }]}>
              {user?.phone ? (user.phone.startsWith('+') ? user.phone : `+91 ${user.phone}`) : (isTamil ? 'உள்நுழையவில்லை' : 'Not signed in')}
            </Text>
            {user?.email ? (
              <Text style={[styles.userEmail, { color: colors.accent }]}>{user.email}</Text>
            ) : null}
            {addresses.length > 0 ? (
              <Text style={[styles.userLocation, { color: colors.textTertiary }]}>
                {(addresses.find((a) => a.isDefault) || addresses[0])?.city || (addresses.find((a) => a.isDefault) || addresses[0])?.addressLine1}
              </Text>
            ) : null}
          </View>
        </View>

        {/* Loyalty Points Card */}
        <TouchableOpacity
          style={[
            styles.loyaltyCard,
            {
              backgroundColor: 'rgba(37, 99, 235, 0.06)',
              borderColor: colors.accent,
            },
          ]}
          activeOpacity={0.88}
          onPress={() => {
            Haptics.selectionAsync();
            setLoyaltyModalVisible(true);
          }}
          accessibilityRole="button"
          accessibilityLabel="View Loyalty Rewards"
        >
          <View style={styles.loyaltyHeader}>
            <View style={styles.loyaltyLeft}>
              <View
                style={[
                  styles.loyaltyIconCircle,
                  {
                    backgroundColor: 'rgba(37, 99, 235, 0.12)',
                  },
                ]}
              >
                <Award size={22} color={colors.accent} />
              </View>
              <View>
                <Text style={[styles.loyaltyTitle, { color: colors.textPrimary }]}>
                  {isTamil ? 'ரிவார்ட் புள்ளிகள்' : 'Ashok Raj Club'}
                </Text>
                <Text style={[styles.tierText, { color: colors.accent }]}>
                  {loyalty?.tier
                    ? isTamil
                      ? `${loyalty.tier} உறுப்பினர்`
                      : `${loyalty.tier} Member`
                    : isTamil
                    ? 'அசோக் கிளப்'
                    : 'Ashok Raj Club'}
                </Text>
              </View>
            </View>

            <View style={styles.pointsWrap}>
              <Text style={[styles.pointsVal, { color: colors.accent }]}>
                {(loyalty?.points ?? 0).toLocaleString()}
              </Text>
              <Text style={[styles.pointsLabel, { color: colors.textSecondary }]}>
                {isTamil ? 'புள்ளிகள்' : 'Points'}
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Section: Activity & Orders */}
        <Text style={[styles.sectionTitle, { color: colors.textTertiary }]}>
          {isTamil ? 'என் செயல்பாடுகள்' : 'My Activity'}
        </Text>
        <View
          style={[
            styles.menuSection,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          {/* My Orders */}
          <TouchableOpacity
            onPress={onNavigateToOrders}
            style={[styles.menuItem, { borderBottomColor: colors.border }]}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="My Orders"
          >
            <View style={styles.menuLeft}>
              <View
                style={[
                  styles.menuIcon,
                  { backgroundColor: '#EFF6FF' },
                ]}
              >
                <ShoppingBag size={18} color="#3B82F6" />
              </View>
              <Text style={[styles.menuText, { color: colors.textPrimary }]}>
                {isTamil ? 'என் ஆர்டர்கள்' : 'My Orders'}
              </Text>
            </View>
            <View style={styles.menuRight}>
              <ChevronRight size={16} color={colors.textTertiary} />
            </View>
          </TouchableOpacity>

          {/* My Bookings */}
          <TouchableOpacity
            onPress={onNavigateToBookings}
            style={[styles.menuItem, { borderBottomColor: colors.border }]}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="My Bookings"
          >
            <View style={styles.menuLeft}>
              <View
                style={[
                  styles.menuIcon,
                  { backgroundColor: '#F4F0FF' },
                ]}
              >
                <Calendar size={18} color="#A855F7" />
              </View>
              <Text style={[styles.menuText, { color: colors.textPrimary }]}>
                {isTamil ? 'என் பதிவுகள்' : 'My Bookings'}
              </Text>
            </View>
            <View style={styles.menuRight}>
              <ChevronRight size={16} color={colors.textTertiary} />
            </View>
          </TouchableOpacity>

          {/* Offers */}
          <TouchableOpacity
            onPress={onNavigateToOffers}
            style={[styles.menuItem, { borderBottomWidth: 0 }]}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Offers and Coupons"
          >
            <View style={styles.menuLeft}>
              <View
                style={[
                  styles.menuIcon,
                  { backgroundColor: 'rgba(37, 99, 235, 0.1)' },
                ]}
              >
                <Tag size={18} color={colors.accent} />
              </View>
              <Text style={[styles.menuText, { color: colors.textPrimary }]}>
                {isTamil ? 'சலுகைகள் & கூப்பன்கள்' : 'Offers & Coupons'}
              </Text>
            </View>
            <View style={styles.menuRight}>
              <ChevronRight size={16} color={colors.textTertiary} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Section: AshokRaj Groups & Official Links */}
        <Text style={[styles.sectionTitle, { color: colors.textTertiary }]}>
          {isTamil ? 'அசோக் ராஜ் குழுமம்' : 'AshokRaj Groups'}
        </Text>
        <View
          style={[
            styles.menuSection,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          {/* About AshokRaj Groups */}
          <TouchableOpacity
            onPress={() => {
              Haptics.selectionAsync();
              setAboutModalVisible(true);
            }}
            style={[styles.menuItem, { borderBottomColor: colors.border }]}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="About AshokRaj Groups"
          >
            <View style={styles.menuLeft}>
              <View
                style={[
                  styles.menuIcon,
                  { backgroundColor: 'rgba(37, 99, 235, 0.1)' },
                ]}
              >
                <Building2 size={18} color={colors.accent} />
              </View>
              <View>
                <Text style={[styles.menuText, { color: colors.textPrimary }]}>
                  {isTamil ? 'அசோக் ராஜ் குழுமம் பற்றி' : 'About AshokRaj Groups'}
                </Text>
                <Text style={[styles.menuSubText, { color: colors.textTertiary }]}>
                  Restaurant • Pure Veg • Bakery • Lodge • Mini Hall
                </Text>
              </View>
            </View>
            <View style={styles.menuRight}>
              <ChevronRight size={16} color={colors.textTertiary} />
            </View>
          </TouchableOpacity>

          {/* Visit Official Website */}
          <TouchableOpacity
            onPress={handleOpenWebsite}
            style={[styles.menuItem, { borderBottomColor: colors.border }]}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Visit Official Website"
          >
            <View style={styles.menuLeft}>
              <View
                style={[
                  styles.menuIcon,
                  { backgroundColor: '#ECFDF5' },
                ]}
              >
                <ExternalLink size={18} color="#10B981" />
              </View>
              <View>
                <Text style={[styles.menuText, { color: '#10B981', fontWeight: '700' }]}>
                  {isTamil ? 'அதிகாரப்பூர்வ இணையதளம் செல்க' : 'Visit Official Website'}
                </Text>
                <Text style={[styles.menuSubText, { color: colors.textTertiary }]}>ashokrajgroups.com</Text>
              </View>
            </View>
            <View style={styles.menuRight}>
              <ExternalLink size={16} color="#10B981" />
            </View>
          </TouchableOpacity>

          {/* Contact Us */}
          <TouchableOpacity
            onPress={handleContactUs}
            style={[styles.menuItem, { borderBottomColor: colors.border }]}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Contact Us"
          >
            <View style={styles.menuLeft}>
              <View
                style={[
                  styles.menuIcon,
                  { backgroundColor: '#EFF6FF' },
                ]}
              >
                <Phone size={18} color="#3B82F6" />
              </View>
              <Text style={[styles.menuText, { color: colors.textPrimary }]}>
                {isTamil ? 'தொடர்பு கொள்க' : 'Contact Us'}
              </Text>
            </View>
            <View style={styles.menuRight}>
              <ChevronRight size={16} color={colors.textTertiary} />
            </View>
          </TouchableOpacity>

          {/* Terms & Privacy */}
          <TouchableOpacity
            onPress={handleTermsAndPrivacy}
            style={[styles.menuItem, { borderBottomWidth: 0 }]}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Terms and Privacy"
          >
            <View style={styles.menuLeft}>
              <View
                style={[
                  styles.menuIcon,
                  { backgroundColor: '#F8FAFC' },
                ]}
              >
                <ShieldCheck size={18} color={colors.textSecondary} />
              </View>
              <Text style={[styles.menuText, { color: colors.textPrimary }]}>
                {isTamil ? 'விதிமுறைகள் & தனியுரிமை' : 'Terms & Privacy'}
              </Text>
            </View>
            <View style={styles.menuRight}>
              <ChevronRight size={16} color={colors.textTertiary} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Section: App Preferences */}
        <Text style={[styles.sectionTitle, { color: colors.textTertiary }]}>
          {isTamil ? 'அமைப்புகள்' : 'Preferences'}
        </Text>
        <View
          style={[
            styles.menuSection,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          {/* Settings */}
          <TouchableOpacity
            onPress={onNavigateToSettings}
            style={[styles.menuItem, { borderBottomColor: colors.border }]}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Settings"
          >
            <View style={styles.menuLeft}>
              <View
                style={[
                  styles.menuIcon,
                  { backgroundColor: 'rgba(37, 99, 235, 0.1)' },
                ]}
              >
                <Settings size={18} color={colors.accent} />
              </View>
              <View>
                <Text style={[styles.menuText, { color: colors.textPrimary }]}>
                  {isTamil ? 'பயன்பாட்டு அமைப்புகள்' : 'Settings'}
                </Text>
                <Text style={[styles.menuSubText, { color: colors.textTertiary }]}>
                  {isTamil ? 'அமைப்புகள் & இணைப்பு' : 'Preferences & Connection'}
                </Text>
              </View>
            </View>
            <View style={styles.menuRight}>
              <ChevronRight size={16} color={colors.textTertiary} />
            </View>
          </TouchableOpacity>

          {/* Language Switch */}
          <TouchableOpacity
            onPress={onNavigateToLanguage}
            style={[styles.menuItem, { borderBottomColor: colors.border }]}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Change Language"
          >
            <View style={styles.menuLeft}>
              <View
                style={[
                  styles.menuIcon,
                  { backgroundColor: '#EFF6FF' },
                ]}
              >
                <Globe size={18} color="#3B82F6" />
              </View>
              <Text style={[styles.menuText, { color: colors.textPrimary }]}>
                {isTamil ? 'மொழி' : 'Language'}
              </Text>
            </View>
            <View style={styles.menuRight}>
              <Text style={[styles.menuVal, { color: colors.accent }]}>
                {language === 'ta' ? 'தமிழ்' : 'English'}
              </Text>
              <ChevronRight size={16} color={colors.textTertiary} />
            </View>
          </TouchableOpacity>

          {/* Notifications */}
          <TouchableOpacity
            onPress={onNavigateToNotifications}
            style={[styles.menuItem, { borderBottomColor: colors.border }]}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Notifications"
          >
            <View style={styles.menuLeft}>
              <View
                style={[
                  styles.menuIcon,
                  { backgroundColor: '#EFF6FF' },
                ]}
              >
                <Bell size={18} color="#3B82F6" />
              </View>
              <Text style={[styles.menuText, { color: colors.textPrimary }]}>
                {isTamil ? 'அறிவிப்புகள்' : 'Notifications'}
              </Text>
            </View>
            <View style={styles.menuRight}>
              <ChevronRight size={16} color={colors.textTertiary} />
            </View>
          </TouchableOpacity>

          {/* Saved Addresses */}
          <TouchableOpacity
            onPress={() => {
              Haptics.selectionAsync();
              setAddressModalVisible(true);
            }}
            style={[styles.menuItem, { borderBottomWidth: 0 }]}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Saved Addresses"
          >
            <View style={styles.menuLeft}>
              <View
                style={[
                  styles.menuIcon,
                  { backgroundColor: '#F0FDF4' },
                ]}
              >
                <MapPin size={18} color="#10B981" />
              </View>
              <Text style={[styles.menuText, { color: colors.textPrimary }]}>
                {isTamil ? 'சேமிக்கப்பட்ட முகவரிகள்' : 'Saved Addresses'}
              </Text>
            </View>
            <View style={styles.menuRight}>
              {addresses.length > 0 ? (
                <Text style={[styles.menuVal, { color: colors.accent }]}>
                  {`${addresses.length} ${isTamil ? 'முகவரிகள்' : 'saved'}`}
                </Text>
              ) : null}
              <ChevronRight size={16} color={colors.textTertiary} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Sign In / Sign Out Button */}
        {user ? (
          <TouchableOpacity
            onPress={handleSignOut}
            style={[
              styles.signOutBtn,
              {
                backgroundColor: '#FEF2F2',
                borderColor: '#FEE2E2',
              },
            ]}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Sign Out"
          >
            <LogOut size={18} color="#EF4444" />
            <Text style={styles.signOutText}>
              {isTamil ? 'வெளியேறு' : 'Sign Out'}
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={onSignOut}
            style={[
              styles.signOutBtn,
              {
                backgroundColor: colors.accent,
                borderColor: colors.accent,
              },
            ]}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Sign In or Register"
          >
            <LogIn size={18} color="#FFFFFF" />
            <Text style={[styles.signOutText, { color: '#FFFFFF' }]}>
              {isTamil ? 'உள்நுழைக / பதிவு செய்க' : 'Sign In / Register'}
            </Text>
          </TouchableOpacity>
        )}

        {/* App Version */}
        <Text style={[styles.versionText, { color: colors.textTertiary }]}>
          Ashok Raj Groups • Official App v1.0.0
        </Text>
      </ScrollView>

      {/* About Modal */}
      <AboutAshokRajModal
        visible={aboutModalVisible}
        onClose={() => setAboutModalVisible(false)}
      />

      {/* Address Manager Modal */}
      <AddressManagerModal
        visible={addressModalVisible}
        onClose={() => setAddressModalVisible(false)}
      />

      {/* Loyalty Rewards Modal */}
      <LoyaltyRewardsModal
        visible={loyaltyModalVisible}
        onClose={() => setLoyaltyModalVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.base,
    paddingBottom: Spacing['6xl'],
    gap: Spacing.md,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius['2xl'],
    padding: Spacing.base,
    borderWidth: 1,
    gap: Spacing.md,
    ...Platform.select({
      web: {
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.08)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 2,
      },
    }),
  },
  avatarWrap: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '800',
  },
  userInfo: {
    flex: 1,
    gap: 2,
  },
  userName: {
    fontSize: FontSize.lg,
    fontWeight: '800',
  },
  userPhone: {
    fontSize: FontSize.sm,
  },
  userEmail: {
    fontSize: FontSize.xs,
    fontWeight: '500',
  },
  userLocation: {
    fontSize: 11,
  },
  loyaltyCard: {
    borderRadius: Radius['2xl'],
    padding: Spacing.base,
    borderWidth: 1,
  },
  loyaltyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  loyaltyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  loyaltyIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loyaltyTitle: {
    fontSize: FontSize.sm + 1,
    fontWeight: '800',
  },
  tierText: {
    fontSize: FontSize.xs,
    fontWeight: '600',
  },
  pointsWrap: {
    alignItems: 'flex-end',
  },
  pointsVal: {
    fontSize: FontSize.xl,
    fontWeight: '900',
  },
  pointsLabel: {
    fontSize: 11,
  },
  sectionTitle: {
    fontSize: FontSize.xs + 1,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: Spacing.sm,
    marginBottom: 2,
  },
  menuSection: {
    borderRadius: Radius['2xl'],
    borderWidth: 1,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingVertical: 14,
    minHeight: 48,
    borderBottomWidth: 1,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuText: {
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
  menuSubText: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 1,
  },
  menuRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  menuVal: {
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    minHeight: 48,
    paddingVertical: 14,
    borderRadius: Radius.lg,
    borderWidth: 1,
    marginTop: 4,
  },
  signOutText: {
    color: '#EF4444',
    fontSize: FontSize.sm,
    fontWeight: '700',
  },
  versionText: {
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 6,
  },
});
