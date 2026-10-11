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
  User as UserIcon,
  Smartphone,
  Mail,
  Lock,
  Eye,
  EyeOff,
  UserPlus,
  AlertCircle,
  Server,
} from 'lucide-react-native';
import { useTheme } from '../theme/ThemeContext';
import { useTranslation } from '../i18n';
import { PrimaryButton } from '../components/ui/PrimaryButton';
import { GlassCard } from '../components/ui/GlassCard';
import { Radius, Spacing, FontSize, Palette } from '@ashok-raj/ui';
import { useAuthStore } from '../store/useAuthStore';

export interface RegisterScreenProps {
  onRegisterSuccess: (phone: string, message: string) => void;
  onNavigateToLogin: () => void;
  onOpenSettings?: () => void;
}

export function RegisterScreen({
  onRegisterSuccess,
  onNavigateToLogin,
  onOpenSettings,
}: RegisterScreenProps) {
  const { colors } = useTheme();
  const { isTamil } = useTranslation();
  const register = useAuthStore((state) => state.register);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // Field validation touched states
  const [touched, setTouched] = useState({
    name: false,
    phone: false,
    email: false,
    password: false,
  });

  // Validation rules
  const isNameValid = name.trim().length >= 2;
  const isPhoneValid = /^[6-9]\d{9}$/.test(phone.trim());
  const isEmailValid = email.trim().length === 0 || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const isPasswordValid = password.length >= 6;
  const isFormValid = isNameValid && isPhoneValid && isEmailValid && isPasswordValid;

  const handleRegister = async () => {
    if (loading) return;

    setTouched({
      name: true,
      phone: true,
      email: true,
      password: true,
    });

    if (!isFormValid) {
      return;
    }

    setLoading(true);
    setServerError(null);

    const res = await register({
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim() ? email.trim() : undefined,
      password,
      autoLogin: false, // Per specification: register first, then navigate to login
    });

    setLoading(false);

    if (res.success) {
      const successMsg = isTamil
        ? 'பதிவு வெற்றிகரமாக முடிந்தது! உங்கள் கடவுச்சொல்லைப் பயன்படுத்தி உள்நுழையவும்.'
        : 'Registration completed successfully! Please sign in with your credentials.';
      onRegisterSuccess(phone.trim(), successMsg);
    } else {
      setServerError(
        res.error || (isTamil ? 'பதிவு தோல்வியடைந்தது. மீண்டும் முயற்சிக்கவும்.' : 'Registration failed. Please try again.')
      );
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
          {/* Header */}
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
              {isTamil ? 'புதிய கணக்கை உருவாக்குக' : 'Create Account'}
            </Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              {isTamil
                ? 'அசோக் ராஜ் குழுமத்தில் இணைந்து சிறந்த விருந்தோம்பலை அனுபவிக்கவும்'
                : 'Join Ashok Raj Groups to easily order food & book luxury lodge rooms.'}
            </Text>
          </View>

          {/* Form Card */}
          <GlassCard style={styles.card}>
            {serverError && (
              <View
                style={[
                  styles.errorBanner,
                  { backgroundColor: colors.danger + '18', borderColor: colors.danger },
                ]}
              >
                <AlertCircle size={18} color={colors.danger} />
                <Text style={[styles.errorText, { color: colors.danger }]}>{serverError}</Text>
              </View>
            )}

            {/* Name Input */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                {isTamil ? 'முழு பெயர் *' : 'Full Name *'}
              </Text>
              <View
                style={[
                  styles.inputRow,
                  {
                    backgroundColor: colors.surfaceElevated,
                    borderColor:
                      touched.name && !isNameValid ? colors.danger : colors.border,
                  },
                ]}
              >
                <UserIcon size={18} color={colors.textTertiary} />
                <TextInput
                  value={name}
                  onChangeText={(text) => {
                    setName(text);
                    setServerError(null);
                  }}
                  onBlur={() => setTouched((prev) => ({ ...prev, name: true }))}
                  placeholder={isTamil ? 'எ.கா. ரமேஷ் குமார்' : 'e.g. Ramesh Kumar'}
                  placeholderTextColor={colors.textTertiary}
                  style={[styles.input, { color: colors.textPrimary }]}
                  autoCapitalize="words"
                />
              </View>
              {touched.name && !isNameValid && (
                <Text style={[styles.inlineError, { color: colors.danger }]}>
                  {isTamil ? 'பெயர் குறைந்தது 2 எழுத்துக்கள் இருக்க வேண்டும்' : 'Name must be at least 2 characters'}
                </Text>
              )}
            </View>

            {/* Phone Number Input */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                {isTamil ? 'மொபைல் எண் *' : 'Mobile Number *'}
              </Text>
              <View
                style={[
                  styles.inputRow,
                  {
                    backgroundColor: colors.surfaceElevated,
                    borderColor:
                      touched.phone && !isPhoneValid ? colors.danger : colors.border,
                  },
                ]}
              >
                <Smartphone size={18} color={colors.textTertiary} />
                <Text style={[styles.countryCode, { color: colors.textPrimary }]}>
                  +91
                </Text>
                <View style={[styles.phoneDivider, { backgroundColor: colors.border }]} />
                <TextInput
                  value={phone}
                  onChangeText={(text) => {
                    setPhone(text.replace(/[^0-9]/g, ''));
                    setServerError(null);
                  }}
                  onBlur={() => setTouched((prev) => ({ ...prev, phone: true }))}
                  placeholder="98765 43210"
                  placeholderTextColor={colors.textTertiary}
                  keyboardType="phone-pad"
                  maxLength={10}
                  style={[styles.input, { color: colors.textPrimary }]}
                />
              </View>
              {touched.phone && !isPhoneValid && (
                <Text style={[styles.inlineError, { color: colors.danger }]}>
                  {isTamil ? 'சரியான 10 இலக்க இந்திய எண்ணை உள்ளிடவும்' : 'Enter a valid 10-digit Indian mobile number'}
                </Text>
              )}
            </View>

            {/* Email Input (Optional) */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                {isTamil ? 'மின்னஞ்சல் (விருப்பத்தேர்வு)' : 'Email (Optional)'}
              </Text>
              <View
                style={[
                  styles.inputRow,
                  {
                    backgroundColor: colors.surfaceElevated,
                    borderColor:
                      touched.email && !isEmailValid ? colors.danger : colors.border,
                  },
                ]}
              >
                <Mail size={18} color={colors.textTertiary} />
                <TextInput
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text.trim());
                    setServerError(null);
                  }}
                  onBlur={() => setTouched((prev) => ({ ...prev, email: true }))}
                  placeholder="name@example.com"
                  placeholderTextColor={colors.textTertiary}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  style={[styles.input, { color: colors.textPrimary }]}
                />
              </View>
              {touched.email && !isEmailValid && (
                <Text style={[styles.inlineError, { color: colors.danger }]}>
                  {isTamil ? 'சரியான மின்னஞ்சல் முகவரியை உள்ளிடவும்' : 'Enter a valid email address'}
                </Text>
              )}
            </View>

            {/* Password Input */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                {isTamil ? 'கடவுச்சொல் *' : 'Password *'}
              </Text>
              <View
                style={[
                  styles.inputRow,
                  {
                    backgroundColor: colors.surfaceElevated,
                    borderColor:
                      touched.password && !isPasswordValid ? colors.danger : colors.border,
                  },
                ]}
              >
                <Lock size={18} color={colors.textTertiary} />
                <TextInput
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    setServerError(null);
                  }}
                  onBlur={() => setTouched((prev) => ({ ...prev, password: true }))}
                  placeholder="••••••••"
                  placeholderTextColor={colors.textTertiary}
                  secureTextEntry={!showPassword}
                  style={[styles.input, { color: colors.textPrimary }]}
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
              {touched.password && !isPasswordValid && (
                <Text style={[styles.inlineError, { color: colors.danger }]}>
                  {isTamil ? 'கடவுச்சொல் குறைந்தது 6 எழுத்துக்கள் இருக்க வேண்டும்' : 'Password must be at least 6 characters'}
                </Text>
              )}
            </View>

            {/* Create Account Button */}
            <PrimaryButton
              title={isTamil ? 'கணக்கை உருவாக்குக' : 'Create Account'}
              onPress={handleRegister}
              loading={loading}
              disabled={loading}
              fullWidth
              style={styles.actionBtn}
              icon={<UserPlus size={18} color={Palette.white} />}
            />

            {/* Switch to Login Link */}
            <TouchableOpacity
              onPress={onNavigateToLogin}
              style={styles.switchAuthBtn}
              activeOpacity={0.7}
            >
              <Text style={[styles.switchAuthText, { color: colors.textSecondary }]}>
                {isTamil ? 'ஏற்கனவே கணக்கு உள்ளதா? ' : 'Already have an account? '}
                <Text style={{ color: colors.accent, fontWeight: '700' }}>
                  {isTamil ? 'உள்நுழைக' : 'Login'}
                </Text>
              </Text>
            </TouchableOpacity>
          </GlassCard>

          {/* Footer note */}
          <View style={styles.footer}>
            <Text style={[styles.termsText, { color: colors.textTertiary }]}>
              {isTamil
                ? 'தொடர்வதன் மூலம் அசோக் ராஜ் விதிமுறைகள் மற்றும் தனியுரிமைக் கொள்கையை ஏற்கிறீர்கள்.'
                : 'By registering, you agree to the Ashok Raj Groups Terms of Service and Privacy Policy.'}
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
    paddingTop: Spacing.lg,
    paddingBottom: Spacing['3xl'],
  },
  header: {
    marginBottom: Spacing.md,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: Palette.blue700,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: Radius.xs,
    marginBottom: Spacing.sm,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  title: {
    fontSize: FontSize['2xl'],
    fontWeight: '800',
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: FontSize.sm,
    lineHeight: 20,
  },
  card: {
    marginVertical: Spacing.md,
    padding: Spacing.lg,
  },
  inputGroup: {
    marginBottom: Spacing.md,
  },
  inputLabel: {
    fontSize: FontSize.xs + 1,
    fontWeight: '600',
    marginBottom: Spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.md,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    height: 52,
    gap: Spacing.sm,
  },
  countryCode: {
    fontSize: FontSize.md,
    fontWeight: '700',
    marginLeft: 2,
  },
  phoneDivider: {
    width: 1,
    height: 22,
    marginHorizontal: 4,
  },
  input: {
    flex: 1,
    fontSize: FontSize.md,
    fontWeight: '500',
  },
  inlineError: {
    fontSize: 11,
    marginTop: 4,
    fontWeight: '500',
  },
  actionBtn: {
    marginTop: Spacing.sm,
  },
  switchAuthBtn: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
    marginTop: Spacing.xs,
  },
  switchAuthText: {
    fontSize: FontSize.sm,
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
  footer: {
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  termsText: {
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 16,
  },
});
