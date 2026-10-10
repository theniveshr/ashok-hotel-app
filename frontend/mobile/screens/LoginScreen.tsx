import { AppText as Text } from '../components/ui/AppText';
import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Smartphone, ShieldCheck, ArrowRight } from 'lucide-react-native';
import { useTheme } from '../theme/ThemeContext';
import { useTranslation } from '../i18n';
import { PrimaryButton } from '../components/ui/PrimaryButton';
import { GlassCard } from '../components/ui/GlassCard';
import { Radius, Spacing, FontSize, Palette } from '@ashok-raj/ui';

export interface LoginScreenProps {
  onLoginSuccess: () => void;
}

export function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const { colors } = useTheme();
  const { t, isTamil } = useTranslation();
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'PHONE' | 'OTP'>('PHONE');
  const [loading, setLoading] = useState(false);

  const handleSendOtp = () => {
    if (phone.length === 10) {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        setStep('OTP');
      }, 600);
    }
  };

  const handleVerifyOtp = () => {
    if (otp.length === 6) {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        onLoginSuccess();
      }, 600);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <View style={styles.header}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {isTamil ? 'அசோக் ராஜ்' : 'ASHOK RAJ'}
            </Text>
          </View>
          <Text style={[styles.title, { color: colors.textPrimary }]}>
            {step === 'PHONE' ? t('auth.welcomeBack') : t('auth.verifyPhone')}
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {step === 'PHONE'
              ? t('auth.phoneHint')
              : t('auth.otpSentTo', { phone: `+91 ${phone}` })}
          </Text>
        </View>

        <GlassCard style={styles.card}>
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
                  onChangeText={(text) => setPhone(text.replace(/[^0-9]/g, ''))}
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
                disabled={phone.length !== 10}
                fullWidth
                style={styles.actionBtn}
                icon={<ArrowRight size={18} color={Palette.white} />}
                iconPosition="right"
              />
            </View>
          ) : (
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
                  onChangeText={(text) => setOtp(text.replace(/[^0-9]/g, ''))}
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
                disabled={otp.length !== 6}
                fullWidth
                style={styles.actionBtn}
              />

              <TouchableOpacity
                onPress={() => setStep('PHONE')}
                style={styles.changePhoneBtn}
              >
                <Text style={[styles.changePhoneText, { color: colors.accent }]}>
                  {isTamil ? 'எண்ணை மாற்றவும்' : 'Change Phone Number'}
                </Text>
              </TouchableOpacity>
            </View>
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
    paddingHorizontal: Spacing.xl,
    justifyContent: 'space-between',
    paddingVertical: Spacing.xl,
  },
  header: {
    marginTop: Spacing.xl,
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
  footer: {
    alignItems: 'center',
  },
  termsText: {
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 16,
  },
});

