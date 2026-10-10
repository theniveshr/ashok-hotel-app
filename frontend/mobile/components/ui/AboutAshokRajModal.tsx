import { AppText as Text } from './AppText';
import React from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Linking,
  Image,
  Platform,
} from 'react-native';
import {
  Building2,
  ExternalLink,
  Phone,
  Mail,
  MapPin,
  Clock,
  Utensils,
  Leaf,
  Cake,
  BedDouble,
  Users,
  X,
  ChevronRight,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Modal } from './Modal';
import { useTranslation } from '../../i18n';
import { Radius, Spacing, FontSize, Palette } from '@ashok-raj/ui';

export interface AboutAshokRajModalProps {
  visible: boolean;
  onClose: () => void;
}

export function AboutAshokRajModal({ visible, onClose }: AboutAshokRajModalProps) {
  const { isTamil } = useTranslation();

  const handleOpenWebsite = () => {
    Haptics.selectionAsync();
    Linking.openURL('https://www.ashokrajgroups.com/');
  };

  const handleCall = () => {
    Haptics.selectionAsync();
    Linking.openURL('tel:04575232333');
  };

  const handleEmail = () => {
    Haptics.selectionAsync();
    Linking.openURL('mailto:ashokrajgroups@gmail.com');
  };

  const divisions = [
    {
      title: isTamil ? 'உணவகம்' : 'Restaurant',
      desc: isTamil
        ? 'செட்டிநாடு உணவுகள், பிரியாணி, காலை டிபன் & முட்டை சிறப்பு வகைகள்.'
        : 'Authentic Chettinad specialties, Dum biryanis, hot tiffin & egg delicacies.',
      icon: Utensils,
      color: '#2563EB',
      bg: '#EFF6FF',
      timing: '6:00 AM – 11:00 PM',
    },
    {
      title: isTamil ? 'தூய சைவம்' : 'Pure Veg Restaurant',
      desc: isTamil
        ? 'பாரம்பரிய தென்னிந்திய சைவ உணவுகள், நெய் ரோஸ்ட் & டிகிரி காபி.'
        : 'Pure vegetarian South Indian dining, crispy ghee dosas & filter coffee.',
      icon: Leaf,
      color: '#16A34A',
      bg: '#ECFDF3',
      timing: '6:00 AM – 11:00 PM',
    },
    {
      title: isTamil ? 'பேக்கரி & இனிப்புகள்' : 'Bakery & Sweets',
      desc: isTamil
        ? 'புதிய கேக்குகள், குக்கீஸ், கார வகைகள் & தூய நெய் அல்வா.'
        : 'Fresh celebration cakes, artisanal cookies, savouries & pure ghee sweets.',
      icon: Cake,
      color: '#DB2777',
      bg: '#FFF1F6',
      timing: '6:00 AM – 10:00 PM',
    },
    {
      title: isTamil ? 'லாட்ஜ் தங்குமிடம்' : 'Lodge Accommodation',
      desc: isTamil
        ? 'குளிரூட்டப்பட்ட மற்றும் சாதாரண அறைகள், 24 மணி நேர அறை சேவை.'
        : 'Single, Double & 6-Bed Family AC/Non-AC rooms with 24/7 hot water.',
      icon: BedDouble,
      color: '#7C3AED',
      bg: '#F4F0FF',
      timing: isTamil ? '24 மணி நேர செக்-இன்' : '24 Hours Check-in',
    },
    {
      title: isTamil ? 'மினி ஹால்' : 'Mini Hall',
      desc: isTamil
        ? '100+ இருக்கைகள் கொண்ட குளிரூட்டப்பட்ட அரங்கு & உணவு பகுதி.'
        : '100+ Seater air-conditioned banquet hall with attached dining area.',
      icon: Users,
      color: '#EA580C',
      bg: '#FFF7ED',
      timing: isTamil ? 'முன்பதிவு அடிப்படையில்' : 'By Reservation',
    },
  ];

  return (
    <Modal visible={visible} onClose={onClose} title={isTamil ? 'அசோக் ராஜ் குழுமம் பற்றி' : 'About AshokRaj Groups'}>
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Brand Header */}
        <View style={styles.brandHero}>
          <View style={styles.logoBadge}>
            <Building2 size={26} color="#2563EB" strokeWidth={2.2} />
          </View>
          <Text style={styles.brandName}>AshokRaj Groups</Text>
          <Text style={styles.brandTagline}>
            {isTamil
              ? 'உணவகம் • தூய சைவம் • பேக்கரி • லாட்ஜ் • மினி ஹால்'
              : 'Restaurant • Pure Veg • Bakery • Lodge • Mini Hall'}
          </Text>
          <Text style={styles.brandLocation}>
            Kalaiyarkoil, Sivaganga District, Tamil Nadu
          </Text>
        </View>

        {/* Business Overview */}
        <View style={styles.overviewBox}>
          <Text style={styles.overviewText}>
            {isTamil
              ? 'அசோக் ராஜ் குழுமம் காளையார்கோவிலில் தரம், தூய்மை மற்றும் சிறந்த விருந்தோம்பலுடன் உணவு, தங்குமிடம் மற்றும் விழா அரங்க சேவைகளை ஒரே இடத்தில் வழங்கி வருகிறது.'
              : 'AshokRaj Groups is Kalaiyarkoil’s premier hospitality destination offering restaurant dining, parcel & home delivery, fresh bakery delights, pure vegetarian cuisine, comfortable AC lodging, and a modern 100+ seating mini hall.'}
          </Text>
        </View>

        {/* 5 Divisions List */}
        <Text style={styles.sectionHeading}>
          {isTamil ? 'எங்கள் 5 பிரிவுகள்' : 'Our 5 Divisions'}
        </Text>
        <View style={styles.divisionsList}>
          {divisions.map((div, i) => {
            const Icon = div.icon;
            return (
              <View key={i} style={styles.divisionCard}>
                <View style={[styles.divisionIcon, { backgroundColor: div.bg }]}>
                  <Icon size={20} color={div.color} strokeWidth={2} />
                </View>
                <View style={styles.divisionInfo}>
                  <Text style={styles.divisionTitle}>{div.title}</Text>
                  <Text style={styles.divisionDesc}>{div.desc}</Text>
                  <View style={styles.timingRow}>
                    <Clock size={11} color="#64748B" />
                    <Text style={styles.timingText}>{div.timing}</Text>
                  </View>
                </View>
              </View>
            );
          })}
        </View>

        {/* Contact & Location */}
        <Text style={styles.sectionHeading}>
          {isTamil ? 'தொடர்பு மற்றும் இருப்பிடம்' : 'Contact & Location'}
        </Text>
        <View style={styles.contactCard}>
          <TouchableOpacity onPress={handleCall} style={styles.contactRow} activeOpacity={0.7}>
            <View style={[styles.contactIconCircle, { backgroundColor: '#EFF6FF' }]}>
              <Phone size={15} color="#2563EB" />
            </View>
            <View style={styles.contactTextCol}>
              <Text style={styles.contactLabel}>{isTamil ? 'தொலைபேசி' : 'Phone / WhatsApp'}</Text>
              <Text style={styles.contactValue}>04575 232 333 / +971 54 245 8604</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleEmail} style={styles.contactRow} activeOpacity={0.7}>
            <View style={[styles.contactIconCircle, { backgroundColor: '#F0FDF4' }]}>
              <Mail size={15} color="#16A34A" />
            </View>
            <View style={styles.contactTextCol}>
              <Text style={styles.contactLabel}>{isTamil ? 'மின்னஞ்சல்' : 'Email'}</Text>
              <Text style={styles.contactValue}>ashokrajgroups@gmail.com</Text>
            </View>
          </TouchableOpacity>

          <View style={[styles.contactRow, { borderBottomWidth: 0 }]}>
            <View style={[styles.contactIconCircle, { backgroundColor: '#FFF7ED' }]}>
              <MapPin size={15} color="#EA580C" />
            </View>
            <View style={styles.contactTextCol}>
              <Text style={styles.contactLabel}>{isTamil ? 'முகவரி' : 'Address'}</Text>
              <Text style={styles.contactValue}>
                No-1412, Madurai to Thondi Main Road, Opposite Petrol Pump, Kalaiyarkoil, Tamil Nadu 630551
              </Text>
            </View>
          </View>
        </View>

        {/* Official Website Banner Card at Bottom */}
        <View style={styles.websiteBanner}>
          <Text style={styles.bannerBrand}>AshokRaj Groups</Text>
          <Text style={styles.bannerDivisions}>
            Restaurant • Pure Veg • Bakery • Lodge • Mini Hall
          </Text>
          <Text style={styles.bannerPrompt}>
            {isTamil
              ? 'மேலும் விவரங்களுக்கு எங்கள் அதிகாரப்பூர்வ இணையதளத்தைப் பார்வையிடவும்.'
              : 'Visit our official website for more information.'}
          </Text>
          <TouchableOpacity
            onPress={handleOpenWebsite}
            style={styles.websiteOutlinedBtn}
            activeOpacity={0.8}
            accessibilityRole="link"
            accessibilityLabel="Visit AshokRaj Groups Official Website"
          >
            <Text style={styles.websiteBtnText}>
              {isTamil ? 'அதிகாரப்பூர்வ இணையதளம் செல்க' : 'Visit Official Website'}
            </Text>
            <ExternalLink size={15} color="#2563EB" strokeWidth={2.2} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 24,
    gap: 13,
  },
  brandHero: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  logoBadge: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#EFF6FF',
    borderWidth: 2,
    borderColor: '#BFDBFE',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  brandName: {
    fontSize: 19,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 3,
    letterSpacing: -0.3,
  },
  brandTagline: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2563EB',
    textAlign: 'center',
    marginBottom: 2,
  },
  brandLocation: {
    fontSize: 10.5,
    color: '#334155',
    textAlign: 'center',
    fontWeight: '700',
  },
  overviewBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  overviewText: {
    fontSize: 11.5,
    color: '#1E293B',
    lineHeight: 17,
  },
  sectionHeading: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1E293B',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginTop: 4,
  },
  divisionsList: {
    gap: 8,
  },
  divisionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 11,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 11,
  },
  divisionIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  divisionInfo: {
    flex: 1,
    gap: 2,
  },
  divisionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  divisionDesc: {
    fontSize: 10.5,
    color: '#1E293B',
    lineHeight: 15,
    fontWeight: '600',
  },
  timingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  timingText: {
    fontSize: 10,
    color: '#334155',
    fontWeight: '700',
  },
  contactCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 11,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap: 11,
  },
  contactIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactTextCol: {
    flex: 1,
    gap: 2,
  },
  contactLabel: {
    fontSize: 10,
    color: '#334155',
    fontWeight: '800',
  },
  contactValue: {
    fontSize: 11,
    color: '#0F172A',
    fontWeight: '600',
    lineHeight: 16,
  },
  // Bottom Website Callout Banner
  websiteBanner: {
    backgroundColor: '#EFF6FF',
    borderRadius: 16,
    padding: 13,
    borderWidth: 1.2,
    borderColor: '#BFDBFE',
    alignItems: 'center',
    marginTop: 2,
    gap: 5,
  },
  bannerBrand: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1E40AF',
  },
  bannerDivisions: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#2563EB',
    textAlign: 'center',
  },
  bannerPrompt: {
    fontSize: 10.5,
    color: '#334155',
    textAlign: 'center',
    marginBottom: 4,
  },
  websiteOutlinedBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#2563EB',
    borderRadius: 10,
    paddingVertical: 9,
    paddingHorizontal: 14,
    width: '100%',
    ...Platform.select({
      web: {
        boxShadow: '0 2px 8px rgba(37, 99, 235, 0.10)',
      },
      default: {
        shadowColor: '#2563EB',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
        elevation: 2,
      },
    }),
  },
  websiteBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#2563EB',
  },
});
