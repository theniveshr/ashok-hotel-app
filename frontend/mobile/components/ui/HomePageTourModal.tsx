import React from 'react';
import {
  Dimensions,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  ArrowLeft,
  ArrowRight,
  Bell,
  CheckCircle2,
  Compass,
  Grid,
  MapPin,
  Navigation,
  Search,
  Sparkles,
  Tag,
  X,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { AppText as Text } from './AppText';
import { useTranslation } from '../../i18n';
import { useTourStore } from '../../store/useTourStore';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface TourStepContent {
  step: number;
  icon: any;
  iconBg: string;
  iconColor: string;
  title: string;
  titleTa: string;
  subtitle: string;
  subtitleTa: string;
  description: string;
  descriptionTa: string;
  bullets: string[];
  bulletsTa: string[];
  targetLocation: 'top' | 'upper_middle' | 'center' | 'lower_middle' | 'bottom';
  accentColor: string;
}

const TOUR_STEPS: TourStepContent[] = [
  {
    step: 1,
    icon: MapPin,
    iconBg: '#EFF6FF',
    iconColor: '#2563EB',
    title: 'Choose Your Location',
    titleTa: 'உங்கள் இருப்பிடத்தைத் தேர்வுசெய்க',
    subtitle: 'Deliver to your exact doorstep',
    subtitleTa: 'உங்கள் வீட்டு முகவரிக்கே டெலிவரி',
    description:
      'Set your delivery address to see live branch availability, estimated delivery times, and accurate menus.',
    descriptionTa:
      'நேரலை கிளை இருப்பு, துல்லியமான மெனு மற்றும் டெலிவரி நேரத்தைக் காண உங்கள் முகவரியை அமைக்கவும்.',
    bullets: [
      'Automatic GPS detection with one tap',
      'Manual search with house & landmark details',
      'Save multiple addresses (Home, Work, Other)',
      'Instant delivery coverage verification',
    ],
    bulletsTa: [
      'ஒரே தொடுதலில் GPS இருப்பிடம் அறிதல்',
      'வீட்டு எண் மற்றும் அடையாளங்களுடன் முகவரி தேடல்',
      'பல முகவரிகளைச் சேமிக்கும் வசதி (வீடு, அலுவலகம்)',
      'உடனடி டெலிவரி எல்லை சரிபார்ப்பு',
    ],
    targetLocation: 'top',
    accentColor: '#2563EB',
  },
  {
    step: 2,
    icon: Search,
    iconBg: '#F0FDF4',
    iconColor: '#16A34A',
    title: 'Search Anything Instantly',
    titleTa: 'விரைவான தேடல் வசதி',
    subtitle: 'Find dishes, sweets, rooms & more',
    subtitleTa: 'உணவு, இனிப்புகள், அறைகள் மற்றும் பல',
    description:
      'Use the smart search bar to find Chettinad specialties, bakery items, AC lodge rooms, or banquet halls.',
    descriptionTa:
      'செட்டிநாடு உணவுகள், பேக்கரி தின்பண்டங்கள், ஏசி லாட்ஜ் அறைகள் அல்லது திருமண மண்டபங்களை எளிதாகத் தேடுங்கள்.',
    bullets: [
      'Search across restaurant, bakery, and lodge services',
      'Instant suggestions with Tamil & English matching',
      'Filter by Pure Veg, Non-Veg, or Price',
      'Real-time branch availability indicator',
    ],
    bulletsTa: [
      'உணவகம், பேக்கரி, லாட்ஜ் அனைத்திலும் தேடலாம்',
      'தமிழ் மற்றும் ஆங்கிலத்தில் உடனடி பரிந்துரைகள்',
      'தூய சைவம், அசைவம் அல்லது விலை வடிகட்டி',
      'நேரலை கிளை உணவு இருப்பு விபரம்',
    ],
    targetLocation: 'upper_middle',
    accentColor: '#16A34A',
  },
  {
    step: 3,
    icon: Grid,
    iconBg: '#FAF5FF',
    iconColor: '#9333EA',
    title: 'Explore All Ashok Raj Services',
    titleTa: 'அசோக் ராஜ் சேவைகள்',
    subtitle: 'Restaurant, Bakery, Lodge & Mini Hall',
    subtitleTa: 'உணவகம், பேக்கரி, லாட்ஜ் மற்றும் மினி ஹால்',
    description:
      'One app for everything Ashok Raj Groups offers in Kalaiyarkoil and surrounding areas.',
    descriptionTa:
      'காளையார்கோவில் மற்றும் சுற்றுவட்டாரத்தில் அசோக் ராஜ் குழுமத்தின் அனைத்து சேவைகளும் ஒரே செயலியில்.',
    bullets: [
      'Restaurant: Chettinad biryani, gravies & parcel',
      'Bakery & Sweets: Fresh cakes, puffs & snacks',
      'Pure Veg: Dedicated traditional vegetarian dining',
      'Lodge & Mini Hall: AC deluxe rooms & 100+ seater hall',
    ],
    bulletsTa: [
      'உணவகம்: செட்டிநாடு பிரியாணி, குழம்புகள் & பார்சல்',
      'பேக்கரி: புதிய கேக்குகள், பப்ஸ் மற்றும் இனிப்புகள்',
      'தூய சைவம்: பாரம்பரிய சுவையான சைவ உணவுகள்',
      'லாட்ஜ் & மினி ஹால்: டீலக்ஸ் அறைகள் & 100+ பேர் கூடம்',
    ],
    targetLocation: 'center',
    accentColor: '#9333EA',
  },
  {
    step: 4,
    icon: Tag,
    iconBg: '#FFF7ED',
    iconColor: '#EA580C',
    title: 'Featured Offers & Combos',
    titleTa: 'சிறப்பு சலுகைகள் & காம்போக்கள்',
    subtitle: 'Exciting discounts on dining and stays',
    subtitleTa: 'உணவு மற்றும் தங்குதலில் சிறப்பு தள்ளுபடிகள்',
    description:
      'Swipe through daily promotional banners, seasonal combos, and exclusive app-only deals.',
    descriptionTa:
      'தினசரி விளம்பர சலுகைகள், பருவகால காம்போக்கள் மற்றும் பிரத்யேக தள்ளுபடிகளை அறிந்து கொள்ளுங்கள்.',
    bullets: [
      'Daily curated combos with free delivery options',
      'Loyalty cashback coins on every completed order',
      'Weekend room reservation discounts',
      'Festive sweets & celebration cake booking',
    ],
    bulletsTa: [
      'இலவச டெலிவரி வசதியுடன் தினசரி காம்போக்கள்',
      'ஒவ்வொரு ஆர்டரிலும் லாயல்டி கேஷ்பேக் நாணயங்கள்',
      'வார இறுதி அறை முன்பதிவு தள்ளுபடிகள்',
      'பண்டிகை இனிப்புகள் & கொண்டாட்ட கேக் முன்பதிவு',
    ],
    targetLocation: 'center',
    accentColor: '#EA580C',
  },
  {
    step: 5,
    icon: Bell,
    iconBg: '#FEF3C7',
    iconColor: '#D97706',
    title: 'Live Order & Booking Updates',
    titleTa: 'நேரலை அறிவிப்புகள்',
    subtitle: 'Stay informed every step of the way',
    subtitleTa: 'ஒவ்வொரு நிலையிலும் உடனடி தகவல்',
    description:
      'Track your food preparation, delivery partner location, table reservations, and room check-in notifications.',
    descriptionTa:
      'உணவு தயாரிப்பு, டெலிவரி பார்ட்னர் இடம், மேஜை முன்பதிவு மற்றும் அறை விபரங்களை உடனுக்குடன் கண்காணிக்கவும்.',
    bullets: [
      'Instant order acceptance and preparation alerts',
      'Real-time delivery partner arrival countdown',
      'Table reservation confirmations & reminders',
      'Exclusive flash sales and coupon announcements',
    ],
    bulletsTa: [
      'ஆர்டர் உறுதி மற்றும் தயாரிப்பு உடனடி தகவல்கள்',
      'டெலிவரி பார்ட்னர் வருகை நேரம் நேரலை கண்காணிப்பு',
      'மேஜை முன்பதிவு உறுதிப்படுத்தல் விபரங்கள்',
      'சிறப்பு தள்ளுபடி கூப்பன்கள் அறிவிப்பு',
    ],
    targetLocation: 'top',
    accentColor: '#D97706',
  },
  {
    step: 6,
    icon: Navigation,
    iconBg: '#EFF6FF',
    iconColor: '#2563EB',
    title: 'Quick Bottom Navigation',
    titleTa: 'கீழ் வழிசெலுத்தல் பலகை',
    subtitle: 'Home, Orders, Bookings, Offers & Profile',
    subtitleTa: 'முகப்பு, ஆர்டர்கள், முன்பதிவுகள் & சுயவிவரம்',
    description:
      'Access your active orders, past bookings, reward coins, and saved addresses anytime from the bottom bar.',
    descriptionTa:
      'செயலில் உள்ள ஆர்டர்கள், முன்பதிவுகள், நாணயங்கள் மற்றும் சேமித்த முகவரிகளை எப்போது வேண்டுமானாலும் அணுகலாம்.',
    bullets: [
      'Home: Discover food, bakery, and hotel services',
      'Orders: Live tracking and re-order favorites',
      'Bookings: Manage room stays and table tables',
      'Profile: Saved addresses, wallet & language preference',
    ],
    bulletsTa: [
      'முகப்பு: உணவுகள், பேக்கரி மற்றும் தங்கும் சேவைகள்',
      'ஆர்டர்கள்: நேரலை கண்காணிப்பு & மறு ஆர்டர் செய்தல்',
      'முன்பதிவுகள்: அறை மற்றும் மேஜை முன்பதிவு மேலாண்மை',
      'சுயவிவரம்: சேமிக்கப்பட்ட முகவரிகள் & மொழி விருப்பம்',
    ],
    targetLocation: 'bottom',
    accentColor: '#2563EB',
  },
];

interface HomePageTourModalProps {
  visible: boolean;
  onFinishOrSkip: () => void;
}

export function HomePageTourModal({ visible, onFinishOrSkip }: HomePageTourModalProps) {
  const { isTamil } = useTranslation();
  const {
    currentStep,
    nextStep,
    prevStep,
    skipTour,
    finishTour,
    isSaving,
  } = useTourStore();

  const stepData = TOUR_STEPS[currentStep - 1] || TOUR_STEPS[0];
  const StepIcon = stepData.icon;
  const isLastStep = currentStep === TOUR_STEPS.length;

  const handleNext = async () => {
    Haptics.selectionAsync();
    if (isLastStep) {
      await finishTour();
      onFinishOrSkip();
    } else {
      nextStep();
    }
  };

  const handlePrev = () => {
    Haptics.selectionAsync();
    prevStep();
  };

  const handleSkip = async () => {
    Haptics.selectionAsync();
    await skipTour();
    onFinishOrSkip();
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={handleSkip}
    >
      <View style={styles.overlay}>
        {/* Spotlight Pointer depending on targetLocation */}
        {stepData.targetLocation === 'top' && (
          <View style={styles.topSpotlightIndicator}>
            <View style={styles.spotlightRing} />
            <Text style={styles.spotlightHint}>
              {stepData.step === 1
                ? isTamil
                  ? '👆 டெலிவரி இருப்பிடம் இங்கே உள்ளது'
                  : '👆 Delivery location selector is right here'
                : isTamil
                ? '👆 அறிவிப்புகள் மணி மேலே உள்ளது'
                : '👆 Notifications bell is located here'}
            </Text>
          </View>
        )}

        {stepData.targetLocation === 'bottom' && (
          <View style={styles.bottomSpotlightIndicator}>
            <Text style={styles.spotlightHint}>
              {isTamil
                ? '👇 வழிசெலுத்தல் பலகை கீழே உள்ளது'
                : '👇 Bottom navigation bar is right here'}
            </Text>
            <View style={styles.spotlightRing} />
          </View>
        )}

        {/* Floating Interactive Tour Card */}
        <View
          style={[
            styles.tourCard,
            stepData.targetLocation === 'top'
              ? styles.tourCardTop
              : stepData.targetLocation === 'bottom'
              ? styles.tourCardBottom
              : styles.tourCardCenter,
          ]}
        >
          {/* Header Row: Step Indicator & Skip Button */}
          <View style={styles.cardHeader}>
            <View style={styles.stepBadge}>
              <Sparkles size={13} color="#2563EB" />
              <Text style={styles.stepBadgeText}>
                {isTamil
                  ? `படி ${stepData.step} / ${TOUR_STEPS.length}`
                  : `Step ${stepData.step} of ${TOUR_STEPS.length}`}
              </Text>
            </View>

            <TouchableOpacity
              onPress={handleSkip}
              disabled={isSaving}
              style={styles.skipButton}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={isTamil ? 'சுற்றுலாவைத் தவிர்' : 'Skip tour'}
            >
              <Text style={styles.skipButtonText}>
                {isTamil ? 'தவிர்' : 'Skip Tour'}
              </Text>
              <X size={14} color="#64748B" style={{ marginLeft: 3 }} />
            </TouchableOpacity>
          </View>

          {/* Progress Bar (6 segments) */}
          <View style={styles.progressRow}>
            {TOUR_STEPS.map((s) => (
              <View
                key={s.step}
                style={[
                  styles.progressBarSegment,
                  s.step <= currentStep && styles.progressBarSegmentActive,
                  s.step === currentStep && { backgroundColor: stepData.accentColor },
                ]}
              />
            ))}
          </View>

          {/* Scrollable Step Details */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.cardContent}
            bounces={false}
          >
            {/* Title & Icon Header */}
            <View style={styles.iconTitleRow}>
              <View style={[styles.stepIconWrap, { backgroundColor: stepData.iconBg }]}>
                <StepIcon size={24} color={stepData.iconColor} strokeWidth={2.4} />
              </View>
              <View style={styles.titleCol}>
                <Text style={styles.stepTitle}>
                  {isTamil ? stepData.titleTa : stepData.title}
                </Text>
                <Text style={[styles.stepSubtitle, { color: stepData.accentColor }]}>
                  {isTamil ? stepData.subtitleTa : stepData.subtitle}
                </Text>
              </View>
            </View>

            {/* Description */}
            <Text style={styles.stepDescription}>
              {isTamil ? stepData.descriptionTa : stepData.description}
            </Text>

            {/* Bullet Highlights */}
            <View style={styles.bulletsContainer}>
              {(isTamil ? stepData.bulletsTa : stepData.bullets).map((bullet, index) => (
                <View key={index} style={styles.bulletItem}>
                  <CheckCircle2
                    size={15}
                    color={stepData.accentColor}
                    strokeWidth={2.2}
                    style={{ marginTop: 2 }}
                  />
                  <Text style={styles.bulletText}>{bullet}</Text>
                </View>
              ))}
            </View>
          </ScrollView>

          {/* Footer Navigation Buttons */}
          <View style={styles.cardFooter}>
            {/* Back Button (hidden on step 1) */}
            {currentStep > 1 ? (
              <TouchableOpacity
                onPress={handlePrev}
                disabled={isSaving}
                style={styles.backButton}
                activeOpacity={0.75}
                accessibilityRole="button"
                accessibilityLabel={isTamil ? 'முந்தைய' : 'Previous step'}
              >
                <ArrowLeft size={16} color="#475569" strokeWidth={2.2} />
                <Text style={styles.backButtonText}>
                  {isTamil ? 'முந்தைய' : 'Back'}
                </Text>
              </TouchableOpacity>
            ) : (
              <View style={{ flex: 0.6 }} />
            )}

            {/* Next / Finish Button */}
            <TouchableOpacity
              onPress={handleNext}
              disabled={isSaving}
              style={[styles.nextButton, { backgroundColor: stepData.accentColor }]}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel={
                isLastStep
                  ? isTamil
                    ? 'சுற்றுலா முடிந்தது'
                    : 'Finish tour'
                  : isTamil
                  ? 'அடுத்தது'
                  : 'Next step'
              }
            >
              <Text style={styles.nextButtonText}>
                {isSaving
                  ? isTamil
                    ? 'சேமிக்கிறது...'
                    : 'Saving...'
                  : isLastStep
                  ? isTamil
                    ? 'முடிந்தது (இருப்பிடம் அமைக்கவும்)'
                    : 'Finish (Set Location)'
                  : isTamil
                  ? 'அடுத்தது'
                  : 'Next'}
              </Text>
              {!isSaving && (
                <ArrowRight size={16} color="#FFFFFF" strokeWidth={2.4} style={{ marginLeft: 6 }} />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.78)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  topSpotlightIndicator: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 56 : 38,
    alignItems: 'center',
    gap: 6,
    zIndex: 10,
  },
  bottomSpotlightIndicator: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 70 : 54,
    alignItems: 'center',
    gap: 6,
    zIndex: 10,
  },
  spotlightHint: {
    color: '#F8FAFC',
    fontSize: 12.5,
    fontWeight: '700',
    backgroundColor: 'rgba(30, 41, 59, 0.85)',
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#38BDF8',
  },
  spotlightRing: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(56, 189, 248, 0.3)',
    borderWidth: 2,
    borderColor: '#38BDF8',
  },
  tourCard: {
    width: Math.min(SCREEN_WIDTH - 32, 420),
    maxHeight: Math.min(SCREEN_HEIGHT * 0.78, 540),
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    ...Platform.select({
      web: {
        boxShadow: '0 20px 45px rgba(15, 23, 42, 0.35)',
      },
      default: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.3,
        shadowRadius: 24,
        elevation: 12,
      },
    }),
  },
  tourCardTop: {
    marginTop: Platform.OS === 'ios' ? 70 : 50,
  },
  tourCardCenter: {
    marginVertical: 'auto',
  },
  tourCardBottom: {
    marginBottom: Platform.OS === 'ios' ? 95 : 75,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  stepBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  stepBadgeText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#2563EB',
  },
  skipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  skipButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 16,
  },
  progressBarSegment: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E2E8F0',
  },
  progressBarSegmentActive: {
    backgroundColor: '#93C5FD',
  },
  cardContent: {
    paddingBottom: 8,
  },
  iconTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 12,
  },
  stepIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleCol: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  stepSubtitle: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
  },
  stepDescription: {
    fontSize: 13,
    lineHeight: 18,
    color: '#475569',
    fontWeight: '500',
    marginBottom: 14,
  },
  bulletsContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 12,
    gap: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  bulletItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  bulletText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 17,
    color: '#334155',
    fontWeight: '600',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    marginTop: 8,
    gap: 10,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 11,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  backButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
  },
  nextButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 14,
    ...Platform.select({
      web: {
        boxShadow: '0 4px 14px rgba(37, 99, 235, 0.25)',
      },
      default: {
        shadowColor: '#2563EB',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 3,
      },
    }),
  },
  nextButtonText: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
