import { AppText as Text } from '../components/ui/AppText';
import React from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Switch
} from 'react-native';
import {
  Globe,
  Moon,
  Bell,
  Shield,
  FileText,
  ChevronRight,
} from 'lucide-react-native';
import { useTheme } from '../theme/ThemeContext';
import { useTranslation } from '../i18n';
import { Header } from '../components/ui/Header';
import { Radius, Spacing, FontSize, Palette } from '@ashok-raj/ui';

export interface SettingsScreenProps {
  onBack: () => void;
  onNavigateToLanguage: () => void;
}

export function SettingsScreen({
  onBack,
  onNavigateToLanguage,
}: SettingsScreenProps) {
  const { colors, isDark, toggleMode, mode, setMode } = useTheme();
  const { t, isTamil, language } = useTranslation();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        showBack
        onBackPress={onBack}
        title={t('settings.settings')}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Appearance Section */}
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
          {isTamil ? 'தோற்றம் (Appearance)' : 'Appearance & Theme'}
        </Text>

        <View style={styles.settingsGroup}>
          <View
            style={[
              styles.settingItem,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            <View style={styles.itemLeft}>
              <View style={[styles.iconWrap, { backgroundColor: 'rgba(204, 146, 0, 0.15)' }]}>
                <Moon size={18} color={colors.accent} />
              </View>
              <View>
                <Text style={[styles.itemTitle, { color: colors.textPrimary }]}>
                  {isTamil ? 'இரவு பயன்முறை (Dark Mode)' : 'Dark Luxury Theme'}
                </Text>
                <Text style={[styles.itemSub, { color: colors.textTertiary }]}>
                  {isDark
                    ? isTamil
                      ? 'செயலில் உள்ளது'
                      : 'Enabled'
                    : isTamil
                    ? 'முடக்கப்பட்டது'
                    : 'Disabled'}
                </Text>
              </View>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleMode}
              trackColor={{ false: colors.border, true: colors.accent }}
              thumbColor={Palette.white}
            />
          </View>
        </View>

        {/* Language Section */}
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
          {t('settings.language')}
        </Text>

        <View style={styles.settingsGroup}>
          <TouchableOpacity
            onPress={onNavigateToLanguage}
            style={[
              styles.settingItem,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            <View style={styles.itemLeft}>
              <View style={[styles.iconWrap, { backgroundColor: 'rgba(0, 102, 204, 0.15)' }]}>
                <Globe size={18} color={colors.info} />
              </View>
              <View>
                <Text style={[styles.itemTitle, { color: colors.textPrimary }]}>
                  {t('settings.language')}
                </Text>
                <Text style={[styles.itemSub, { color: colors.accent }]}>
                  {language === 'ta' ? 'தமிழ் (Tamil)' : 'English'}
                </Text>
              </View>
            </View>
            <ChevronRight size={16} color={colors.textTertiary} />
          </TouchableOpacity>
        </View>

        {/* Legal & About */}
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
          {t('settings.about')}
        </Text>

        <View style={styles.settingsGroup}>
          <View
            style={[
              styles.settingItem,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            <View style={styles.itemLeft}>
              <View style={[styles.iconWrap, { backgroundColor: 'rgba(255, 255, 255, 0.08)' }]}>
                <FileText size={18} color={colors.textSecondary} />
              </View>
              <View>
                <Text style={[styles.itemTitle, { color: colors.textPrimary }]}>
                  {t('settings.termsOfService')}
                </Text>
              </View>
            </View>
            <ChevronRight size={16} color={colors.textTertiary} />
          </View>

          <View
            style={[
              styles.settingItem,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            <View style={styles.itemLeft}>
              <View style={[styles.iconWrap, { backgroundColor: 'rgba(255, 255, 255, 0.08)' }]}>
                <Shield size={18} color={colors.textSecondary} />
              </View>
              <View>
                <Text style={[styles.itemTitle, { color: colors.textPrimary }]}>
                  {t('settings.privacyPolicy')}
                </Text>
              </View>
            </View>
            <ChevronRight size={16} color={colors.textTertiary} />
          </View>
        </View>

        <Text style={[styles.versionText, { color: colors.textTertiary }]}>
          Ashok Raj Lodge & Restaurant • v1.0.0 (Phase 1)
        </Text>
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
  sectionTitle: {
    fontSize: FontSize.xs + 1,
    fontWeight: '700',
    marginBottom: Spacing.xs + 2,
    marginTop: Spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  settingsGroup: {
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.base,
    borderRadius: Radius.lg,
    borderWidth: 1,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: Radius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemTitle: {
    fontSize: FontSize.sm + 1,
    fontWeight: '600',
  },
  itemSub: {
    fontSize: FontSize.xs,
    marginTop: 2,
  },
  versionText: {
    textAlign: 'center',
    fontSize: 11,
    marginTop: Spacing.xl,
  },
});
