import { AppText as Text } from '../components/ui/AppText';
import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Hotel, UtensilsCrossed, Bike, ChevronRight } from 'lucide-react-native';
import { useTheme } from '../theme/ThemeContext';
import { useTranslation } from '../i18n';
import { PrimaryButton } from '../components/ui/PrimaryButton';
import { Radius, Spacing, FontSize, Palette } from '@ashok-raj/ui';

export interface OnboardingScreenProps {
  onComplete: () => void;
}

export function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const { colors, isDark } = useTheme();
  const { t, isTamil, setLanguage } = useTranslation();
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      icon: Hotel,
      title: isTamil ? 'ஆடம்பர தங்குமிடம்' : 'Luxury Lodge Stays',
      subtitle: isTamil
        ? 'வசதியான ஏசி அறைகள், 24/7 அறை சேவை மற்றும் சுத்தமான பராமரிப்பு.'
        : 'Spacious AC rooms, 24/7 room service, and top-tier hospitality.',
    },
    {
      icon: UtensilsCrossed,
      title: isTamil ? 'உணவக ஆர்டர்கள் & QR' : 'Dine-In & QR Ordering',
      subtitle: isTamil
        ? 'உங்கள் மேசையிலிருந்தே QR ஸ்கேன் செய்து உடனடியாக உணவு ஆர்டர் செய்யுங்கள்.'
        : 'Scan the QR code at your table to explore the menu and order instantly.',
    },
    {
      icon: Bike,
      title: isTamil ? 'விரைவான வீட்டிற்கு டெலிவரி' : 'Fast Home Delivery',
      subtitle: isTamil
        ? 'சூடான மற்றும் சுவையான உணவு உங்கள் வீட்டிற்கே விரைவாக வந்து சேரும்.'
        : 'Fresh, piping-hot dishes delivered right to your doorstep in Kalaiyarkoil.',
    },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const StepIcon = steps[currentStep]!.icon;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Top Bar with Language Toggle */}
      <View style={styles.topBar}>
        <View style={styles.langToggle}>
          <TouchableOpacity
            onPress={() => setLanguage('en')}
            style={[
              styles.langBtn,
              !isTamil && { backgroundColor: colors.accent },
            ]}
          >
            <Text
              style={[
                styles.langBtnText,
                { color: !isTamil ? Palette.white : colors.textSecondary },
              ]}
            >
              EN
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setLanguage('ta')}
            style={[
              styles.langBtn,
              isTamil && { backgroundColor: colors.accent },
            ]}
          >
            <Text
              style={[
                styles.langBtnText,
                { color: isTamil ? Palette.white : colors.textSecondary },
              ]}
            >
              தமிழ்
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={onComplete}>
          <Text style={[styles.skipText, { color: colors.textSecondary }]}>
            {isTamil ? 'தவிர்' : 'Skip'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Main Illustration / Icon */}
      <View style={styles.centerArea}>
        <View
          style={[
            styles.iconCircle,
            {
              backgroundColor: isDark ? colors.surface : colors.surfaceElevated,
              borderColor: colors.accent,
            },
          ]}
        >
          <StepIcon size={64} color={colors.accent} />
        </View>

        <Text style={[styles.stepTitle, { color: colors.textPrimary }]}>
          {steps[currentStep]!.title}
        </Text>
        <Text style={[styles.stepSubtitle, { color: colors.textSecondary }]}>
          {steps[currentStep]!.subtitle}
        </Text>

        {/* Step Indicator Dots */}
        <View style={styles.dotsRow}>
          {steps.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                {
                  backgroundColor:
                    i === currentStep ? colors.accent : colors.border,
                  width: i === currentStep ? 24 : 8,
                },
              ]}
            />
          ))}
        </View>
      </View>

      {/* Bottom Action */}
      <View style={styles.bottomBar}>
        <PrimaryButton
          title={
            currentStep === steps.length - 1
              ? isTamil
                ? 'தொடங்குவோம்'
                : 'Get Started'
              : isTamil
              ? 'அடுத்து'
              : 'Next'
          }
          onPress={handleNext}
          fullWidth
          icon={<ChevronRight size={18} color={Palette.white} />}
          iconPosition="right"
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
  },
  langToggle: {
    flexDirection: 'row',
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
    padding: 2,
  },
  langBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  langBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
  skipText: {
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
  centerArea: {
    alignItems: 'center',
    paddingHorizontal: Spacing['2xl'],
  },
  iconCircle: {
    width: 140,
    height: 140,
    borderRadius: Radius.full,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing['2xl'],
  },
  stepTitle: {
    fontSize: FontSize['2xl'],
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  stepSubtitle: {
    fontSize: FontSize.sm + 1,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  bottomBar: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xl,
  },
});

