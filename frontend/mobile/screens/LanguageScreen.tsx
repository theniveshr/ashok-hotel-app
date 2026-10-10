import { AppText as Text } from '../components/ui/AppText';
import React from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  ScrollView
} from 'react-native';
import { Check, Globe, Sparkles } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../theme/ThemeContext';
import { useTranslation } from '../i18n';
import { Header } from '../components/ui/Header';
import { GlassCard } from '../components/ui/GlassCard';
import { Radius, Spacing, FontSize, Palette } from '@ashok-raj/ui';

export interface LanguageScreenProps {
  onBack: () => void;
}

export function LanguageScreen({ onBack }: LanguageScreenProps) {
  const { colors } = useTheme();
  const { t, language, setLanguage, isTamil } = useTranslation();

  const handleSelectLanguage = (lang: 'en' | 'ta') => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setLanguage(lang);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        showBack
        onBackPress={onBack}
        title={t('settings.language')}
        subtitle={t('settings.selectLanguage')}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Language Options */}
        <View style={styles.optionsList}>
          {/* English */}
          <TouchableOpacity
            onPress={() => handleSelectLanguage('en')}
            activeOpacity={0.8}
            style={[
              styles.langCard,
              {
                backgroundColor: colors.surface,
                borderColor: language === 'en' ? colors.accent : colors.border,
              },
            ]}
          >
            <View style={styles.langLeft}>
              <View
                style={[
                  styles.flagCircle,
                  {
                    backgroundColor:
                      language === 'en' ? 'rgba(204, 146, 0, 0.15)' : colors.surfaceElevated,
                  },
                ]}
              >
                <Globe size={18} color={language === 'en' ? colors.accent : colors.textTertiary} />
              </View>
              <View>
                <Text style={[styles.langName, { color: colors.textPrimary }]}>
                  English
                </Text>
                <Text style={[styles.langSub, { color: colors.textTertiary }]}>
                  Default App Language
                </Text>
              </View>
            </View>

            <View
              style={[
                styles.checkCircle,
                {
                  backgroundColor: language === 'en' ? colors.accent : 'transparent',
                  borderColor: language === 'en' ? colors.accent : colors.border,
                },
              ]}
            >
              {language === 'en' && <Check size={14} color={Palette.white} />}
            </View>
          </TouchableOpacity>

          {/* Tamil */}
          <TouchableOpacity
            onPress={() => handleSelectLanguage('ta')}
            activeOpacity={0.8}
            style={[
              styles.langCard,
              {
                backgroundColor: colors.surface,
                borderColor: language === 'ta' ? colors.accent : colors.border,
              },
            ]}
          >
            <View style={styles.langLeft}>
              <View
                style={[
                  styles.flagCircle,
                  {
                    backgroundColor:
                      language === 'ta' ? 'rgba(204, 146, 0, 0.15)' : colors.surfaceElevated,
                  },
                ]}
              >
                <Globe size={18} color={language === 'ta' ? colors.accent : colors.textTertiary} />
              </View>
              <View>
                <Text style={[styles.langName, { color: colors.textPrimary }]}>
                  தமிழ் (Tamil)
                </Text>
                <Text style={[styles.langSub, { color: colors.textTertiary }]}>
                  முழுமையான தமிழ் மொழிபெயர்ப்பு
                </Text>
              </View>
            </View>

            <View
              style={[
                styles.checkCircle,
                {
                  backgroundColor: language === 'ta' ? colors.accent : 'transparent',
                  borderColor: language === 'ta' ? colors.accent : colors.border,
                },
              ]}
            >
              {language === 'ta' && <Check size={14} color={Palette.white} />}
            </View>
          </TouchableOpacity>
        </View>

        {/* Live Preview Box */}
        <GlassCard style={styles.previewBox}>
          <View style={styles.previewHeader}>
            <Sparkles size={16} color={colors.accent} />
            <Text style={[styles.previewTitle, { color: colors.accent }]}>
              {isTamil ? 'நேரடி மொழி மாதிரிகள்' : 'Live Translation Preview'}
            </Text>
          </View>

          <View style={styles.previewRows}>
            <View style={styles.previewRow}>
              <Text style={[styles.previewKey, { color: colors.textTertiary }]}>
                {t('restaurant.orderFood')}
              </Text>
              <Text style={[styles.previewVal, { color: colors.textPrimary }]}>
                {t('restaurant.dineIn')}
              </Text>
            </View>

            <View style={styles.previewRow}>
              <Text style={[styles.previewKey, { color: colors.textTertiary }]}>
                {t('lodge.bookRoom')}
              </Text>
              <Text style={[styles.previewVal, { color: colors.textPrimary }]}>
                {t('lodge.checkAvailability')}
              </Text>
            </View>

            <View style={styles.previewRow}>
              <Text style={[styles.previewKey, { color: colors.textTertiary }]}>
                {t('delivery.deliveryFee')}
              </Text>
              <Text style={[styles.previewVal, { color: colors.success }]}>
                {t('delivery.freeDelivery')}
              </Text>
            </View>
          </View>
        </GlassCard>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.base,
    paddingBottom: Spacing['5xl'],
  },
  optionsList: {
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  langCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.base,
    borderRadius: Radius.xl,
    borderWidth: 1.5,
  },
  langLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  flagCircle: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  langName: {
    fontSize: FontSize.md,
    fontWeight: '700',
  },
  langSub: {
    fontSize: FontSize.xs,
    marginTop: 2,
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewBox: {
    marginTop: Spacing.sm,
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: Spacing.md,
  },
  previewTitle: {
    fontSize: FontSize.xs + 1,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  previewRows: {
    gap: Spacing.sm,
  },
  previewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
  },
  previewKey: {
    fontSize: FontSize.sm,
  },
  previewVal: {
    fontSize: FontSize.sm,
    fontWeight: '700',
  },
});

