import { AppText as Text } from '../components/ui/AppText';
import React, { useState } from 'react';
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
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useTranslation } from '../i18n';
import { Header } from '../components/ui/Header';
import { AboutAshokRajModal } from '../components/ui/AboutAshokRajModal';
import { Radius, Spacing, FontSize, Palette } from '@ashok-raj/ui';

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
  const { isTamil, language } = useTranslation();
  const [aboutModalVisible, setAboutModalVisible] = useState(false);

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

  return (
    <View style={styles.container}>
      <Header
        title={isTamil ? 'சுயவிவரம்' : 'Profile'}
        subtitle={isTamil ? 'என் கணக்கு & விருப்பங்கள்' : 'My Account & Preferences'}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* User Card */}
        <View style={styles.userCard}>
          <View style={styles.avatarWrap}>
            <Text style={styles.avatarText}>SR</Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>Sundar Rajan</Text>
            <Text style={styles.userPhone}>+91 98765 43210</Text>
            <Text style={styles.userLocation}>Kalaiyarkoil, Sivagangai</Text>
          </View>
        </View>

        {/* Loyalty Points Card */}
        <View style={styles.loyaltyCard}>
          <View style={styles.loyaltyHeader}>
            <View style={styles.loyaltyLeft}>
              <View style={styles.loyaltyIconCircle}>
                <Award size={22} color="#2563EB" />
              </View>
              <View>
                <Text style={styles.loyaltyTitle}>
                  {isTamil ? 'ரிவார்ட் புள்ளிகள்' : 'Ashok Raj Club'}
                </Text>
                <Text style={styles.tierText}>
                  {isTamil ? 'கோல்ட் உறுப்பினர்' : 'Gold Member'}
                </Text>
              </View>
            </View>

            <View style={styles.pointsWrap}>
              <Text style={styles.pointsVal}>1,250</Text>
              <Text style={styles.pointsLabel}>
                {isTamil ? 'புள்ளிகள்' : 'Points'}
              </Text>
            </View>
          </View>
        </View>

        {/* Section: Activity & Orders */}
        <Text style={styles.sectionTitle}>
          {isTamil ? 'என் செயல்பாடுகள்' : 'My Activity'}
        </Text>
        <View style={styles.menuSection}>
          {/* My Orders */}
          <TouchableOpacity
            onPress={onNavigateToOrders}
            style={styles.menuItem}
            activeOpacity={0.7}
          >
            <View style={styles.menuLeft}>
              <View style={[styles.menuIcon, { backgroundColor: '#EFF6FF' }]}>
                <ShoppingBag size={18} color="#2563EB" />
              </View>
              <Text style={styles.menuText}>
                {isTamil ? 'என் ஆர்டர்கள்' : 'My Orders'}
              </Text>
            </View>
            <View style={styles.menuRight}>
              <ChevronRight size={16} color="#64748B" />
            </View>
          </TouchableOpacity>

          {/* My Bookings */}
          <TouchableOpacity
            onPress={onNavigateToBookings}
            style={styles.menuItem}
            activeOpacity={0.7}
          >
            <View style={styles.menuLeft}>
              <View style={[styles.menuIcon, { backgroundColor: '#F4F0FF' }]}>
                <Calendar size={18} color="#7C3AED" />
              </View>
              <Text style={styles.menuText}>
                {isTamil ? 'என் பதிவுகள்' : 'My Bookings'}
              </Text>
            </View>
            <View style={styles.menuRight}>
              <ChevronRight size={16} color="#64748B" />
            </View>
          </TouchableOpacity>

          {/* Offers */}
          <TouchableOpacity
            onPress={onNavigateToOffers}
            style={[styles.menuItem, { borderBottomWidth: 0 }]}
            activeOpacity={0.7}
          >
            <View style={styles.menuLeft}>
              <View style={[styles.menuIcon, { backgroundColor: '#FFF1F6' }]}>
                <Tag size={18} color="#DB2777" />
              </View>
              <Text style={styles.menuText}>
                {isTamil ? 'சலுகைகள் & கூப்பன்கள்' : 'Offers & Coupons'}
              </Text>
            </View>
            <View style={styles.menuRight}>
              <ChevronRight size={16} color="#64748B" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Section: AshokRaj Groups & Official Links */}
        <Text style={styles.sectionTitle}>
          {isTamil ? 'அசோக் ராஜ் குழுமம்' : 'AshokRaj Groups'}
        </Text>
        <View style={styles.menuSection}>
          {/* About AshokRaj Groups */}
          <TouchableOpacity
            onPress={() => {
              Haptics.selectionAsync();
              setAboutModalVisible(true);
            }}
            style={styles.menuItem}
            activeOpacity={0.7}
          >
            <View style={styles.menuLeft}>
              <View style={[styles.menuIcon, { backgroundColor: '#EFF6FF' }]}>
                <Building2 size={18} color="#2563EB" />
              </View>
              <View>
                <Text style={styles.menuText}>
                  {isTamil ? 'அசோக் ராஜ் குழுமம் பற்றி' : 'About AshokRaj Groups'}
                </Text>
                <Text style={styles.menuSubText}>
                  Restaurant • Pure Veg • Bakery • Lodge • Mini Hall
                </Text>
              </View>
            </View>
            <View style={styles.menuRight}>
              <ChevronRight size={16} color="#64748B" />
            </View>
          </TouchableOpacity>

          {/* Visit Official Website */}
          <TouchableOpacity
            onPress={handleOpenWebsite}
            style={styles.menuItem}
            activeOpacity={0.7}
          >
            <View style={styles.menuLeft}>
              <View style={[styles.menuIcon, { backgroundColor: '#ECFDF5' }]}>
                <ExternalLink size={18} color="#059669" />
              </View>
              <View>
                <Text style={[styles.menuText, { color: '#059669', fontWeight: '700' }]}>
                  {isTamil ? 'அதிகாரப்பூர்வ இணையதளம் செல்க' : 'Visit Official Website'}
                </Text>
                <Text style={styles.menuSubText}>ashokrajgroups.com</Text>
              </View>
            </View>
            <View style={styles.menuRight}>
              <ExternalLink size={16} color="#059669" />
            </View>
          </TouchableOpacity>

          {/* Contact Us */}
          <TouchableOpacity
            onPress={handleContactUs}
            style={styles.menuItem}
            activeOpacity={0.7}
          >
            <View style={styles.menuLeft}>
              <View style={[styles.menuIcon, { backgroundColor: '#EFF6FF' }]}>
                <Phone size={18} color="#2563EB" />
              </View>
              <Text style={styles.menuText}>
                {isTamil ? 'தொடர்பு கொள்க' : 'Contact Us'}
              </Text>
            </View>
            <View style={styles.menuRight}>
              <ChevronRight size={16} color="#64748B" />
            </View>
          </TouchableOpacity>

          {/* Terms & Privacy */}
          <TouchableOpacity
            onPress={handleTermsAndPrivacy}
            style={[styles.menuItem, { borderBottomWidth: 0 }]}
            activeOpacity={0.7}
          >
            <View style={styles.menuLeft}>
              <View style={[styles.menuIcon, { backgroundColor: '#F8FAFC' }]}>
                <ShieldCheck size={18} color="#475569" />
              </View>
              <Text style={styles.menuText}>
                {isTamil ? 'விதிமுறைகள் & தனியுரிமை' : 'Terms & Privacy'}
              </Text>
            </View>
            <View style={styles.menuRight}>
              <ChevronRight size={16} color="#64748B" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Section: App Preferences */}
        <Text style={styles.sectionTitle}>
          {isTamil ? 'அமைப்புகள்' : 'Preferences'}
        </Text>
        <View style={styles.menuSection}>
          {/* Language Switch */}
          <TouchableOpacity
            onPress={onNavigateToLanguage}
            style={styles.menuItem}
            activeOpacity={0.7}
          >
            <View style={styles.menuLeft}>
              <View style={[styles.menuIcon, { backgroundColor: '#EFF6FF' }]}>
                <Globe size={18} color="#2563EB" />
              </View>
              <Text style={styles.menuText}>
                {isTamil ? 'மொழி' : 'Language'}
              </Text>
            </View>
            <View style={styles.menuRight}>
              <Text style={styles.menuVal}>
                {language === 'ta' ? 'தமிழ்' : 'English'}
              </Text>
              <ChevronRight size={16} color="#64748B" />
            </View>
          </TouchableOpacity>

          {/* Notifications */}
          <TouchableOpacity
            onPress={onNavigateToNotifications}
            style={styles.menuItem}
            activeOpacity={0.7}
          >
            <View style={styles.menuLeft}>
              <View style={[styles.menuIcon, { backgroundColor: '#EFF6FF' }]}>
                <Bell size={18} color="#2563EB" />
              </View>
              <Text style={styles.menuText}>
                {isTamil ? 'அறிவிப்புகள்' : 'Notifications'}
              </Text>
            </View>
            <View style={styles.menuRight}>
              <ChevronRight size={16} color="#64748B" />
            </View>
          </TouchableOpacity>

          {/* Saved Addresses */}
          <TouchableOpacity
            onPress={onNavigateToSettings}
            style={[styles.menuItem, { borderBottomWidth: 0 }]}
            activeOpacity={0.7}
          >
            <View style={styles.menuLeft}>
              <View style={[styles.menuIcon, { backgroundColor: '#F0FDF4' }]}>
                <MapPin size={18} color="#16A34A" />
              </View>
              <Text style={styles.menuText}>
                {isTamil ? 'சேமிக்கப்பட்ட முகவரிகள்' : 'Saved Addresses'}
              </Text>
            </View>
            <View style={styles.menuRight}>
              <ChevronRight size={16} color="#64748B" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Sign Out Button */}
        <TouchableOpacity
          onPress={onSignOut}
          style={styles.signOutBtn}
          activeOpacity={0.8}
        >
          <LogOut size={18} color="#EF4444" />
          <Text style={styles.signOutText}>
            {isTamil ? 'வெளியேறு' : 'Sign Out'}
          </Text>
        </TouchableOpacity>

        {/* App Version */}
        <Text style={styles.versionText}>
          Ashok Raj Groups • Official App v0.0.1
        </Text>
      </ScrollView>

      {/* About Modal */}
      <AboutAshokRajModal
        visible={aboutModalVisible}
        onClose={() => setAboutModalVisible(false)}
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
    padding: Spacing.base,
    paddingBottom: Spacing['6xl'],
    gap: Spacing.md,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: Spacing.md,
    ...Platform.select({
      web: {
        boxShadow: '0 2px 10px rgba(15, 23, 42, 0.04)',
      },
      default: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 2,
      },
    }),
  },
  avatarWrap: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#EFF6FF',
    borderWidth: 2,
    borderColor: '#BFDBFE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#2563EB',
  },
  userInfo: {
    flex: 1,
    gap: 2,
  },
  userName: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },
  userPhone: {
    fontSize: 13,
    color: '#475569',
  },
  userLocation: {
    fontSize: 11,
    color: '#475569',
  },
  loyaltyCard: {
    backgroundColor: '#EFF6FF',
    borderRadius: 20,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: '#DBEAFE',
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
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loyaltyTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1E40AF',
  },
  tierText: {
    fontSize: 12,
    color: '#2563EB',
    fontWeight: '600',
  },
  pointsWrap: {
    alignItems: 'flex-end',
  },
  pointsVal: {
    fontSize: 20,
    fontWeight: '900',
    color: '#1E40AF',
  },
  pointsLabel: {
    fontSize: 11,
    color: '#475569',
  },
  sectionTitle: {
    fontSize: FontSize.xs + 1,
    fontWeight: '700',
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: Spacing.sm,
    marginBottom: 2,
  },
  menuSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
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
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  menuSubText: {
    fontSize: 11,
    color: '#334155',
    fontWeight: '600',
    marginTop: 1,
  },
  menuRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  menuVal: {
    fontSize: 13,
    color: '#2563EB',
    fontWeight: '600',
  },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FEF2F2',
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FEE2E2',
    marginTop: 4,
  },
  signOutText: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '700',
  },
  versionText: {
    textAlign: 'center',
    fontSize: 11,
    color: '#334155',
    fontWeight: '600',
    marginTop: 6,
  },
});
