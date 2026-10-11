import { AppText as Text } from '../components/ui/AppText';
import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Smartphone,
  ShieldCheck,
  ArrowRight,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  LogIn,
  Server,
} from 'lucide-react-native';
import { useTheme } from '../theme/ThemeContext';
import { useTranslation } from '../i18n';
import { PrimaryButton } from '../components/ui/PrimaryButton';
import { GlassCard } from '../components/ui/GlassCard';
import { Radius, Spacing, FontSize, Palette } from '@ashok-raj/ui';

import { useAuthStore } from '../store/useAuthStore';

export interface LoginScreenProps {
  onLoginSuccess: () => void;
  onNavigateToRegister?: () => void;
  onOpenSettings?: () => void;
  initialPhone?: string;
  successMessage?: string;
}

export function LoginScreen({
  onLoginSuccess,
  onNavigateToRegister,
  onOpenSettings,
  initialPhone,
  successMessage,
}: LoginScreenProps) {
  const { colors } = useTheme();
  const { t, isTamil } = useTranslation();
  const sendOtp = useAuthStore((state) => state.sendOtp);
  const verifyOtp = useAuthStore((state) => state.verifyOtp);
  const loginWithPassword = useAuthStore((state) => state.loginWithPassword);

  const [phone, setPhone] = useState(initialPhone || '');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState<'PHONE' | 'OTP' | 'PASSWORD'>(
    initialPhone ? 'PASSWORD' : 'PHONE'
  );
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [bannerSuccess, setBannerSuccess] = useState<string | null>(successMessage || null);

  const handleSendOtp = async () => {
    if (phone.length === 10) {
      setLoading(true);
      setLocalError(null);
      setBannerSuccess(null);
      const res = await sendOtp(phone);
      setLoading(false);
      if (res.success) {
        if (res.debugOtp) {
          setOtp(res.debugOtp);
        }
        setStep('OTP');
      } else {
        setLocalError(res.error || 'Failed to send OTP.');
      }
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length === 6) {
      setLoading(true);
      setLocalError(null);
      setBannerSuccess(null);
      const res = await verifyOtp(phone, otp);
      setLoading(false);
      if (res.success) {
        onLoginSuccess();
      } else {
        setLocalError(res.error || 'Invalid verification code.');
      }
    }
  };

  const handlePasswordLogin = async () => {
    if (phone.length === 10 && password.length >= 6) {
      setLoading(true);
      setLocalError(null);
      setBannerSuccess(null);
      const res = await loginWithPassword(phone, password);
      setLoading(false);
      if (res.success) {
        onLoginSuccess();
      } else {
        setLocalError(res.error || (isTamil ? 'தவறான தொலைபேசி அல்லது கடவுச்சொல்.' : 'Invalid phone number or password.'));
      }
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {isTamil ? 'அசோக் ராஜ்' : 'ASHOK RAJ'}
                </Text>
              </View>
              {onOpenSettings && (
                <TouchableOpacity
                  onPress={onOpenSettings}
                  accessibilityLabel="Network Settings"
                  style={{
                    padding: 8,
                    borderRadius: 20,
                    backgroundColor: colors.surfaceElevated,
                    borderWidth: 1,
                    borderColor: colors.border,
                  }}
                >
                  <Server size={16} color={colors.textSecondary} />
                </TouchableOpacity>
              )}
            </View>
            <Text style={[styles.title, { color: colors.textPrimary }]}>
              {step === 'OTP'
                ? t('auth.verifyPhone')
                : isTamil
                ? 'மீண்டும் வருக!'
                : 'Welcome Back'}
            </Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              {step === 'OTP'
                ? t('auth.otpSentTo', { phone: `+91 ${phone}` })
                : step === 'PASSWORD'
                ? isTamil
                  ? 'உங்கள் கடவுச்சொல்லை உள்ளிட்டு தொடரவும்'
                  : 'Enter your phone & password to sign in'
                : t('auth.phoneHint')}
            </Text>
          </View>

          <GlassCard style={styles.card}>
            {/* Registration success message banner */}
            {bannerSuccess && (
              <View
                style={[
                  styles.successBanner,
                  { backgroundColor: Palette.emerald50, borderColor: Palette.emerald500 },
                ]}
              >
                <CheckCircle2 size={18} color={Palette.emerald600} />
                <Text style={[styles.successText, { color: Palette.emerald800 }]}>
                  {bannerSuccess}
                </Text>
              </View>
            )}

            {/* Error message banner */}
            {localError && (
              <View
                style={[
                  styles.errorBanner,
                  { backgroundColor: colors.danger + '18', borderColor: colors.danger },
                ]}
              >
                <AlertCircle size={18} color={colors.danger} />
                <Text style={[styles.errorText, { color: colors.danger }]}>{localError}</Text>
              </View>
            )}

            {step === 'PHONE' ? (
              <View>
                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                  {t('auth.enterPhone')}
                </Text>
                <View
                  style={[
                    styles.phoneRow,
                    {
                      backgroundColor: colors.surfaceElevated,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <Text style={[styles.countryCode, { color: colors.textPrimary }]}>
                    +91
                  </Text>
                  <View
                    style={[styles.phoneDivider, { backgroundColor: colors.border }]}
                  />
                  <TextInput
                    value={phone}
                    onChangeText={(text) => {
                      setLocalError(null);
                      setBannerSuccess(null);
                      setPhone(text.replace(/[^0-9]/g, ''));
                    }}
                    placeholder={t('auth.phonePlaceholder')}
                    placeholderTextColor={colors.textTertiary}
                    keyboardType="phone-pad"
                    maxLength={10}
                    style={[styles.input, { color: colors.textPrimary }]}
                    autoFocus
                  />
                </View>

                <PrimaryButton
                  title={t('auth.sendOtp')}
                  onPress={handleSendOtp}
                  loading={loading}
                  disabled={phone.length !== 10 || loading}
                  fullWidth
                  style={styles.actionBtn}
                  icon={<ArrowRight size={18} color={Palette.white} />}
                  iconPosition="right"
                />

                <TouchableOpacity
                  onPress={() => {
                    setLocalError(null);
                    setStep('PASSWORD');
                  }}
                  style={styles.changePhoneBtn}
                >
                  <Text style={[styles.changePhoneText, { color: colors.accent }]}>
                    {isTamil ? 'கடவுச்சொல் மூலம் உள்நுழைக' : 'Sign In with Password'}
                  </Text>
                </TouchableOpacity>
              </View>
            ) : step === 'OTP' ? (
              <View>
                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                  {t('auth.enterOtp')}
                </Text>
                <View
                  style={[
                    styles.otpRow,
                    {
                      backgroundColor: colors.surfaceElevated,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <ShieldCheck size={20} color={colors.accent} />
                  <TextInput
                    value={otp}
                    onChangeText={(text) => {
                      setLocalError(null);
                      setBannerSuccess(null);
                      setOtp(text.replace(/[^0-9]/g, ''));
                    }}
                    placeholder="• • • • • •"
                    placeholderTextColor={colors.textTertiary}
                    keyboardType="number-pad"
                    maxLength={6}
                    style={[
                      styles.input,
                      styles.otpInput,
                      { color: colors.textPrimary },
                    ]}
                    autoFocus
                  />
                </View>

                <PrimaryButton
                  title={t('auth.verifyOtp')}
                  onPress={handleVerifyOtp}
                  loading={loading}
                  disabled={otp.length !== 6 || loading}
                  fullWidth
                  style={styles.actionBtn}
                />

                <TouchableOpacity
                  onPress={() => {
                    setLocalError(null);
                    setStep('PHONE');
                  }}
                  style={styles.changePhoneBtn}
                >
                  <Text style={[styles.changePhoneText, { color: colors.accent }]}>
                    {isTamil ? 'எண்ணை மாற்றவும்' : 'Change Phone Number'}
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View>
                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                  {t('auth.enterPhone')}
                </Text>
                <View
                  style={[
                    styles.phoneRow,
                    {
                      backgroundColor: colors.surfaceElevated,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <Text style={[styles.countryCode, { color: colors.textPrimary }]}>
                    +91
                  </Text>
                  <View
                    style={[styles.phoneDivider, { backgroundColor: colors.border }]}
                  />
                  <TextInput
                    value={phone}
                    onChangeText={(text) => {
                      setLocalError(null);
                      setBannerSuccess(null);
                      setPhone(text.replace(/[^0-9]/g, ''));
                    }}
                    placeholder={t('auth.phonePlaceholder')}
                    placeholderTextColor={colors.textTertiary}
                    keyboardType="phone-pad"
                    maxLength={10}
                    style={[styles.input, { color: colors.textPrimary }]}
                  />
                </View>

                <Text style={[styles.inputLabel, { color: colors.textSecondary, marginTop: Spacing.md }]}>
                  {isTamil ? 'கடவுச்சொல்' : 'Password'}
                </Text>
                <View
                  style={[
                    styles.phoneRow,
                    {
                      backgroundColor: colors.surfaceElevated,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <Lock size={18} color={colors.textTertiary} />
                  <TextInput
                    value={password}
                    onChangeText={(text) => {
                      setLocalError(null);
                      setBannerSuccess(null);
                      setPassword(text);
                    }}
                    placeholder="••••••••"
                    placeholderTextColor={colors.textTertiary}
                    secureTextEntry={!showPassword}
                    style={[styles.input, { color: colors.textPrimary, marginLeft: Spacing.sm }]}
                    autoFocus={Boolean(initialPhone)}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    {showPassword ? (
                      <EyeOff size={18} color={colors.textTertiary} />
                    ) : (
                      <Eye size={18} color={colors.textTertiary} />
                    )}
                  </TouchableOpacity>
                </View>

                <PrimaryButton
                  title={isTamil ? 'உள்நுழைக' : 'Sign In'}
                  onPress={handlePasswordLogin}
                  loading={loading}
                  disabled={phone.length !== 10 || password.length < 6 || loading}
                  fullWidth
                  style={styles.actionBtn}
                  icon={<LogIn size={18} color={Palette.white} />}
                />

                <TouchableOpacity
                  onPress={() => {
                    setLocalError(null);
                    setStep('PHONE');
                  }}
                  style={styles.changePhoneBtn}
                >
                  <Text style={[styles.changePhoneText, { color: colors.accent }]}>
                    {isTamil ? 'OTP மூலம் உள்நுழைக' : 'Use OTP Login Instead'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Switch to Register link */}
            {onNavigateToRegister && (
              <TouchableOpacity
                onPress={onNavigateToRegister}
                style={styles.switchAuthBtn}
                activeOpacity={0.7}
              >
                <Text style={[styles.switchAuthText, { color: colors.textSecondary }]}>
                  {isTamil ? 'புதியவரா? ' : "Don't have an account? "}
                  <Text style={{ color: colors.accent, fontWeight: '700' }}>
                    {isTamil ? 'கணக்கை உருவாக்குக' : 'Register'}
                  </Text>
                </Text>
              </TouchableOpacity>
            )}
          </GlassCard>

          {/* Terms */}
          <View style={styles.footer}>
            <Text style={[styles.termsText, { color: colors.textTertiary }]}>
              {t('auth.termsAgreement')}{' '}
              <Text style={{ color: colors.accent }}>{t('auth.termsOfService')}</Text> &{' '}
              <Text style={{ color: colors.accent }}>{t('auth.privacyPolicy')}</Text>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing['3xl'],
  },
  header: {
    marginTop: Spacing.md,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: Palette.blue700,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: Radius.xs,
    marginBottom: Spacing.md,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  title: {
    fontSize: FontSize['3xl'],
    fontWeight: '800',
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: FontSize.sm,
    lineHeight: 20,
  },
  card: {
    marginVertical: Spacing.xl,
    padding: Spacing.lg,
  },
  inputLabel: {
    fontSize: FontSize.xs + 1,
    fontWeight: '600',
    marginBottom: Spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.md,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    height: 52,
    marginBottom: Spacing.lg,
  },
  countryCode: {
    fontSize: FontSize.md,
    fontWeight: '700',
  },
  phoneDivider: {
    width: 1,
    height: 24,
    marginHorizontal: Spacing.md,
  },
  otpRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.md,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    height: 52,
    marginBottom: Spacing.lg,
    gap: Spacing.md,
  },
  input: {
    flex: 1,
    fontSize: FontSize.md,
    fontWeight: '600',
  },
  otpInput: {
    letterSpacing: 8,
    fontSize: FontSize.xl,
    textAlign: 'center',
  },
  actionBtn: {
    marginTop: Spacing.xs,
  },
  changePhoneBtn: {
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  changePhoneText: {
    fontSize: FontSize.xs + 1,
    fontWeight: '600',
  },
  switchAuthBtn: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
    marginTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  switchAuthText: {
    fontSize: FontSize.sm,
  },
  footer: {
    alignItems: 'center',
  },
  termsText: {
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 16,
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  successText: {
    flex: 1,
    fontSize: FontSize.xs,
    fontWeight: '600',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  errorText: {
    flex: 1,
    fontSize: FontSize.xs,
    fontWeight: '600',
  },
});
