import { AppText as Text } from '../components/ui/AppText';
import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Switch,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import {
  Globe,
  Moon,
  Bell,
  Shield,
  FileText,
  ChevronRight,
  Server,
  Radio,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react-native';
import { useTheme } from '../theme/ThemeContext';
import { useTranslation } from '../i18n';
import { Header } from '../components/ui/Header';
import { Modal } from '../components/ui/Modal';
import { PrimaryButton } from '../components/ui/PrimaryButton';
import { Radius, Spacing, FontSize, Palette } from '@ashok-raj/ui';
import {
  getApiBaseUrl,
  getCustomApiUrl,
  setCustomApiUrl,
  testBackendConnection,
} from '../config/api';

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

  const [currentUrl, setCurrentUrl] = useState<string>(getApiBaseUrl());
  const [isNetworkModalOpen, setIsNetworkModalOpen] = useState(false);
  const [customInput, setCustomInput] = useState('');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    tested: boolean;
    ok: boolean;
    statusText: string;
    latencyMs: number;
    dbStatus?: string;
  } | null>(null);

  useEffect(() => {
    setCurrentUrl(getApiBaseUrl());
    const stored = getCustomApiUrl();
    if (stored) {
      setCustomInput(stored);
    }
  }, []);

  const handleTestConnection = async (override?: string) => {
    setTesting(true);
    const target = override !== undefined ? override : (customInput.trim() || undefined);
    const res = await testBackendConnection(target);
    setTesting(false);
    setTestResult({
      tested: true,
      ok: res.ok,
      statusText: res.statusText,
      latencyMs: res.latencyMs,
      dbStatus: res.data?.services?.database || (res.ok ? 'connected' : undefined),
    });
  };

  const handleSaveCustomUrl = async () => {
    const trimmed = customInput.trim();
    await setCustomApiUrl(trimmed || null);
    const updated = getApiBaseUrl();
    setCurrentUrl(updated);
    await handleTestConnection(trimmed || undefined);
  };

  const handleResetToAuto = async () => {
    setCustomInput('');
    await setCustomApiUrl(null);
    const updated = getApiBaseUrl();
    setCurrentUrl(updated);
    await handleTestConnection(undefined);
  };

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

        {/* Backend & Device Network Section */}
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
          {isTamil ? 'சர்வர் இணைப்பு (Server & Network)' : 'Backend & Real Device Network'}
        </Text>

        <View style={styles.settingsGroup}>
          <TouchableOpacity
            onPress={() => {
              setIsNetworkModalOpen(true);
              handleTestConnection();
            }}
            style={[
              styles.settingItem,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            <View style={styles.itemLeft}>
              <View style={[styles.iconWrap, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
                <Server size={18} color={colors.success} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.itemTitle, { color: colors.textPrimary }]}>
                  {isTamil ? 'சர்வர் இணைப்பு நிலை' : 'Backend Server Endpoint'}
                </Text>
                <Text style={[styles.itemSub, { color: colors.accent }]} numberOfLines={1}>
                  {currentUrl}
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

      {/* Network Configuration Modal */}
      <Modal
        visible={isNetworkModalOpen}
        onClose={() => setIsNetworkModalOpen(false)}
        title={isTamil ? 'சர்வர் நெட்வொர்க் அமைப்பு' : 'Device Server Connection'}
      >
        <View style={{ gap: Spacing.md }}>
          <View style={[styles.statusBox, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}>
            <Text style={{ fontSize: FontSize.xs, color: colors.textSecondary, marginBottom: 4 }}>
              ACTIVE API ENDPOINT:
            </Text>
            <Text style={{ fontSize: FontSize.sm, fontWeight: '700', color: colors.accent }}>
              {currentUrl}
            </Text>

            {testResult && (
              <View style={styles.resultRow}>
                {testResult.ok ? (
                  <CheckCircle2 size={16} color={colors.success} />
                ) : (
                  <AlertCircle size={16} color={colors.error} />
                )}
                <Text
                  style={{
                    fontSize: FontSize.xs,
                    fontWeight: '600',
                    color: testResult.ok ? colors.success : colors.error,
                  }}
                >
                  {testResult.statusText} • {testResult.latencyMs}ms
                  {testResult.dbStatus ? ` • DB: ${testResult.dbStatus}` : ''}
                </Text>
              </View>
            )}
          </View>

          <TouchableOpacity
            style={[styles.testButton, { backgroundColor: colors.surface, borderColor: colors.accent }]}
            onPress={() => handleTestConnection()}
            disabled={testing}
          >
            {testing ? (
              <ActivityIndicator size="small" color={colors.accent} />
            ) : (
              <>
                <RefreshCw size={14} color={colors.accent} />
                <Text style={{ fontSize: FontSize.xs + 1, fontWeight: '600', color: colors.accent }}>
                  {isTamil ? 'இணைப்பைச் சோதிக்கவும்' : 'Test Live Connection'}
                </Text>
              </>
            )}
          </TouchableOpacity>

          <View style={{ marginTop: Spacing.xs }}>
            <Text style={{ fontSize: FontSize.xs, color: colors.textSecondary, marginBottom: 6 }}>
              {isTamil ? 'தனிப்பயன் சர்வர் முகவரி (Custom Server / Tunnel URL):' : 'Custom Server / Tunnel URL:'}
            </Text>
            <TextInput
              style={[
                styles.urlInput,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  color: colors.textPrimary,
                },
              ]}
              placeholder="e.g. http://10.4.1.101:3001 or https://tunnel.ngrok.app"
              placeholderTextColor={colors.textTertiary}
              value={customInput}
              onChangeText={setCustomInput}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <Text style={{ fontSize: 11, color: colors.textTertiary, marginTop: 4 }}>
              Supports LAN Wi-Fi, ngrok, Cloudflare Tunnel, or live production URLs for multi-network Android testing.
            </Text>
          </View>

          <View style={{ flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.xs }}>
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: colors.accent, flex: 1 }]}
              onPress={handleSaveCustomUrl}
            >
              <Text style={{ color: '#000000', fontWeight: '700', fontSize: FontSize.xs + 1 }}>
                Save URL
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border, borderWidth: 1 }]}
              onPress={handleResetToAuto}
            >
              <Text style={{ color: colors.textPrimary, fontWeight: '600', fontSize: FontSize.xs + 1 }}>
                Auto Detect
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    flex: 1,
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
  statusBox: {
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  urlInput: {
    height: 44,
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: 12,
    fontSize: FontSize.sm,
  },
  actionBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
