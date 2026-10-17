import { AppText as Text } from '../components/ui/AppText';
import React, { useState, useEffect } from 'react';
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
  CheckCircle2,
  Square,
  CheckSquare,
  ShieldCheck,
  ArrowLeft,
  RefreshCw,
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
}

export function RegisterScreen({
  onRegisterSuccess,
  onNavigateToLogin,
}: RegisterScreenProps) {
  const { colors } = useTheme();
  const { isTamil } = useTranslation();
  const register = useAuthStore((state) => state.register);
  const sendOtp = useAuthStore((state) => state.sendOtp);

  // Form Fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  // OTP Verification Step
  const [step, setStep] = useState<'FORM' | 'OTP'>('FORM');
  const [otp, setOtp] = useState('');
  const [resendCountdown, setResendCountdown] = useState(0);

  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // Field validation touched states
  const [touched, setTouched] = useState({
    name: false,
    phone: false,
    email: false,
    password: false,
    confirmPassword: false,
    terms: false,
  });

  // Countdown timer for resending OTP
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendCountdown > 0) {
      timer = setTimeout(() => setResendCountdown((prev) => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCountdown]);

  // Validation rules
  const isNameValid = name.trim().length >= 2;
  const isPhoneValid = /^[6-9]\d{9}$/.test(phone.trim());
  const isEmailValid = email.trim().length === 0 || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const isPasswordValid = password.length >= 6;
  const isConfirmPasswordValid = confirmPassword.length > 0 && confirmPassword === password;
  const isTermsValid = agreeTerms;

  const isFormValid =
    isNameValid &&
    isPhoneValid &&
    isEmailValid &&
    isPasswordValid &&
    isConfirmPasswordValid &&
    isTermsValid;

  // Password strength calculation
  const getPasswordStrength = (pwd: string) => {
    if (!pwd || pwd.length < 6) return { label: isTamil ? 'எளிய' : 'Weak', score: 1, color: '#EF4444' };
    let score = 1;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd) && /[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    if (score <= 1) return { label: isTamil ? 'எளிய' : 'Weak', score: 1, color: '#EF4444' };
    if (score === 2) return { label: isTamil ? 'நடுத்தர' : 'Fair', score: 2, color: '#F59E0B' };
    return { label: isTamil ? 'வலுவான' : 'Strong', score: 3, color: '#10B981' };
  };

  const strength = getPasswordStrength(password);

  // Clean phone input
  const handlePhoneChange = (text: string) => {
    let cleaned = (text || '').replace(/[^0-9+]/g, '');
    if (cleaned.startsWith('+91')) cleaned = cleaned.slice(3);
    else if (cleaned.startsWith('91') && cleaned.length > 10) cleaned = cleaned.slice(2);
    else if (cleaned.startsWith('0') && cleaned.length > 10) cleaned = cleaned.slice(1);
    cleaned = cleaned.replace(/[^0-9]/g, '').slice(0, 10);
    setPhone(cleaned);
    setServerError(null);
  };

  // Step 1: Request OTP and proceed to verification
  const handleInitiateRegistration = async () => {
    if (loading) return;

    setTouched({
      name: true,
      phone: true,
      email: true,
      password: true,
      confirmPassword: true,
      terms: true,
    });

    if (!isFormValid) {
      return;
    }

    setLoading(true);
    setServerError(null);

    // Send OTP to user's mobile number
    const otpRes = await sendOtp(phone.trim());
    setLoading(false);

    if (otpRes.success) {
      if (otpRes.debugOtp) {
        setOtp(otpRes.debugOtp);
      }
      setResendCountdown(60);
      setStep('OTP');
    } else {
      setServerError(
        otpRes.error ||
          (isTamil ? 'OTP அனுப்ப முடியவில்லை. எண்களைச் சரிபார்க்கவும்.' : 'Failed to send OTP. Please check your number.')
      );
    }
  };

  // Step 2: Verify OTP and save account securely
  const handleCompleteRegistration = async () => {
    if (loading) return;

    if (otp.trim().length !== 6) {
      setServerError(
        isTamil ? 'சரியான 6 இலக்க OTP குறியீட்டை உள்ளிடவும்.' : 'Please enter a valid 6-digit OTP code.'
      );
      return;
    }

    setLoading(true);
    setServerError(null);

    const res = await register({
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim() ? email.trim().toLowerCase() : undefined,
      password,
      otp: otp.trim(),
    });

    setLoading(false);

    if (res.success) {
      const successMsg =
        res.message ||
        (isTamil
          ? 'பதிவு வெற்றிகரமாக முடிந்தது! உள்நுழையவும்.'
          : 'Registration successful! Please log in to continue.');
      onRegisterSuccess(phone.trim(), successMsg);
    } else {
      setServerError(
        res.error || (isTamil ? 'பதிவு தோல்வியடைந்தது. மீண்டும் முயற்சிக்கவும்.' : 'Registration failed. Please try again.')
      );
    }
  };

  // Resend OTP handler
  const handleResendOtp = async () => {
    if (resendCountdown > 0 || loading) return;
    setLoading(true);
    setServerError(null);
    const otpRes = await sendOtp(phone.trim());
    setLoading(false);
    if (otpRes.success) {
      if (otpRes.debugOtp) {
        setOtp(otpRes.debugOtp);
      }
      setResendCountdown(60);
    } else {
      setServerError(otpRes.error || 'Failed to resend OTP.');
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
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {isTamil ? 'அசோக் ராஜ்' : 'ASHOK RAJ'}
              </Text>
            </View>

            <Text style={[styles.title, { color: colors.textPrimary }]}>
              {step === 'OTP'
                ? isTamil
                  ? 'மொபைல் எண்ணை சரிபார்க்கவும்'
                  : 'Verify Mobile Number'
                : isTamil
                ? 'புதிய கணக்கை உருவாக்குக'
                : 'Create Account'}
            </Text>

            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              {step === 'OTP'
                ? isTamil
                  ? `+91 ${phone} எண்ணுக்கு அனுப்பப்பட்ட 6 இலக்க OTP ஐ உள்ளிடவும்`
                  : `Enter the 6-digit verification code sent to +91 ${phone}`
                : isTamil
                ? 'அசோக் ராஜ் குழுமத்தில் இணைந்து சிறந்த விருந்தோம்பலை அனுபவிக்கவும்'
                : 'Sign up to order delicious food, book lodge rooms & reserve halls.'}
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

            {step === 'OTP' ? (
              /* OTP Verification Step */
              <View>
                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                  {isTamil ? 'OTP குறியீடு *' : 'Enter 6-Digit OTP *'}
                </Text>
                <View
                  style={[
                    styles.inputRow,
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
                      setOtp(text.replace(/[^0-9]/g, ''));
                      setServerError(null);
                    }}
                    placeholder={isTamil ? '6 இலக்க OTP குறியீடு' : 'Enter 6-digit OTP'}
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

                {/* Resend Countdown */}
                <View style={styles.resendContainer}>
                  {resendCountdown > 0 ? (
                    <Text style={[styles.resendTimerText, { color: colors.textTertiary }]}>
                      {isTamil
                        ? `மீண்டும் OTP அனுப்ப: ${resendCountdown} வினாடிகள்`
                        : `Resend OTP in ${resendCountdown}s`}
                    </Text>
                  ) : (
                    <TouchableOpacity onPress={handleResendOtp} disabled={loading} style={styles.resendBtn}>
                      <RefreshCw size={14} color={colors.accent} />
                      <Text style={[styles.resendActionText, { color: colors.accent }]}>
                        {isTamil ? 'மீண்டும் OTP அனுப்பு' : 'Resend OTP'}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>

                {/* Complete Registration Button */}
                <PrimaryButton
                  title={isTamil ? 'சரிபார்த்து பதிவு செய்க' : 'Verify & Complete Registration'}
                  onPress={handleCompleteRegistration}
                  loading={loading}
                  disabled={otp.length !== 6 || loading}
                  fullWidth
                  style={styles.actionBtn}
                  icon={<CheckCircle2 size={18} color={Palette.white} />}
                />

                {/* Back to Form */}
                <TouchableOpacity
                  onPress={() => {
                    setStep('FORM');
                    setServerError(null);
                  }}
                  style={styles.backStepBtn}
                  activeOpacity={0.7}
                >
                  <ArrowLeft size={16} color={colors.textSecondary} />
                  <Text style={[styles.backStepText, { color: colors.textSecondary }]}>
                    {isTamil ? 'விவரங்களை மாற்றவும்' : 'Edit Registration Details'}
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              /* Registration Form */
              <View>
                {/* Full Name */}
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
                      placeholder={isTamil ? 'உங்கள் முழு பெயரை உள்ளிடவும்' : 'Enter your full name'}
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

                {/* Mobile Number */}
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
                      onChangeText={handlePhoneChange}
                      onBlur={() => setTouched((prev) => ({ ...prev, phone: true }))}
                      placeholder={isTamil ? '10 இலக்க மொபைல் எண்' : '10-digit mobile number'}
                      placeholderTextColor={colors.textTertiary}
                      keyboardType="phone-pad"
                      maxLength={10}
                      style={[styles.input, { color: colors.textPrimary }]}
                    />
                  </View>
                  {touched.phone && !isPhoneValid && (
                    <Text style={[styles.inlineError, { color: colors.danger }]}>
                      {isTamil ? 'சரியான 10 இலக்க இந்திய மொபைல் எண்ணை உள்ளிடவும்' : 'Enter a valid 10-digit Indian mobile number'}
                    </Text>
                  )}
                </View>

                {/* Email (Optional) */}
                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                    {isTamil ? 'மின்னஞ்சல் (விருப்பத்தேர்வு)' : 'Email Address (Optional)'}
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
                      placeholder={isTamil ? 'மின்னஞ்சல் முகவரியை உள்ளிடவும்' : 'name@example.com'}
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

                {/* Password */}
                <View style={styles.inputGroup}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                      {isTamil ? 'கடவுச்சொல் *' : 'Password *'}
                    </Text>
                    {password.length > 0 && (
                      <Text style={[styles.strengthBadge, { color: strength.color }]}>
                        {strength.label}
                      </Text>
                    )}
                  </View>
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
                      placeholder={isTamil ? 'குறைந்தது 6 எழுத்துக்கள்' : 'At least 6 characters'}
                      placeholderTextColor={colors.textTertiary}
                      secureTextEntry={!showPassword}
                      style={[styles.input, { color: colors.textPrimary }]}
                    />
                    <TouchableOpacity
                      onPress={() => setShowPassword(!showPassword)}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      accessibilityLabel="Toggle password visibility"
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

                {/* Confirm Password */}
                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                    {isTamil ? 'கடவுச்சொல்லை உறுதிப்படுத்துக *' : 'Confirm Password *'}
                  </Text>
                  <View
                    style={[
                      styles.inputRow,
                      {
                        backgroundColor: colors.surfaceElevated,
                        borderColor:
                          touched.confirmPassword && !isConfirmPasswordValid
                            ? colors.danger
                            : colors.border,
                      },
                    ]}
                  >
                    <Lock size={18} color={colors.textTertiary} />
                    <TextInput
                      value={confirmPassword}
                      onChangeText={(text) => {
                        setConfirmPassword(text);
                        setServerError(null);
                      }}
                      onBlur={() => setTouched((prev) => ({ ...prev, confirmPassword: true }))}
                      placeholder={isTamil ? 'கடவுச்சொல்லை மீண்டும் உள்ளிடவும்' : 'Re-enter your password'}
                      placeholderTextColor={colors.textTertiary}
                      secureTextEntry={!showConfirmPassword}
                      style={[styles.input, { color: colors.textPrimary }]}
                    />
                    <TouchableOpacity
                      onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      accessibilityLabel="Toggle confirm password visibility"
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={18} color={colors.textTertiary} />
                      ) : (
                        <Eye size={18} color={colors.textTertiary} />
                      )}
                    </TouchableOpacity>
                  </View>
                  {touched.confirmPassword && !isConfirmPasswordValid && (
                    <Text style={[styles.inlineError, { color: colors.danger }]}>
                      {confirmPassword.length === 0
                        ? isTamil
                          ? 'கடவுச்சொல்லை உறுதிப்படுத்துவது கட்டாயம்'
                          : 'Please confirm your password'
                        : isTamil
                        ? 'கடவுச்சொற்கள் பொருந்தவில்லை'
                        : 'Passwords do not match'}
                    </Text>
                  )}
                </View>

                {/* Terms of Service & Privacy Policy Checkbox */}
                <TouchableOpacity
                  style={styles.checkboxRow}
                  activeOpacity={0.8}
                  onPress={() => {
                    setAgreeTerms(!agreeTerms);
                    setTouched((prev) => ({ ...prev, terms: true }));
                  }}
                >
                  {agreeTerms ? (
                    <CheckSquare size={20} color={colors.accent} />
                  ) : (
                    <Square
                      size={20}
                      color={touched.terms && !agreeTerms ? colors.danger : colors.textTertiary}
                    />
                  )}
                  <Text style={[styles.checkboxLabel, { color: colors.textSecondary }]}>
                    {isTamil ? 'நான் அசோக் ராஜ் ' : 'I agree to the '}
                    <Text style={{ color: colors.accent, fontWeight: '700' }}>
                      {isTamil ? 'விதிமுறைகள்' : 'Terms of Service'}
                    </Text>{' '}
                    {isTamil ? 'மற்றும் ' : '& '}
                    <Text style={{ color: colors.accent, fontWeight: '700' }}>
                      {isTamil ? 'தனியுரிமைக் கொள்கையை' : 'Privacy Policy'}
                    </Text>{' '}
                    {isTamil ? 'ஏற்கிறேன்.' : 'of Ashok Raj Groups.'}
                  </Text>
                </TouchableOpacity>
                {touched.terms && !agreeTerms && (
                  <Text style={[styles.inlineError, { color: colors.danger, marginTop: -4, marginBottom: 12 }]}>
                    {isTamil
                      ? 'தொடர விதிமுறைகளை ஏற்க வேண்டும்'
                      : 'You must accept the Terms of Service to create an account'}
                  </Text>
                )}

                {/* Create Account Button */}
                <PrimaryButton
                  title={isTamil ? 'கணக்கை உருவாக்குக' : 'Create Account'}
                  onPress={handleInitiateRegistration}
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
              </View>
            )}
          </GlassCard>

          {/* Footer note */}
          <View style={styles.footer}>
            <Text style={[styles.termsText, { color: colors.textTertiary }]}>
              {isTamil
                ? 'அசோக் ராஜ் லாட்ஜ் & உணவகம் • பாதுகாப்பான வாடிக்கையாளர் நுழைவு'
                : 'Ashok Raj Lodge & Restaurant • Trusted Hospitality & Food Delivery'}
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
  strengthBadge: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
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
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    marginVertical: Spacing.sm,
  },
  checkboxLabel: {
    flex: 1,
    fontSize: FontSize.xs + 1,
    lineHeight: 18,
  },
  actionBtn: {
    marginTop: Spacing.md,
  },
  switchAuthBtn: {
    alignItems: 'center',
    marginTop: Spacing.lg,
    paddingVertical: Spacing.xs,
  },
  switchAuthText: {
    fontSize: FontSize.sm,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  errorText: {
    flex: 1,
    fontSize: FontSize.xs + 1,
    fontWeight: '600',
  },
  otpRow: {
    justifyContent: 'center',
  },
  otpInput: {
    fontSize: FontSize.xl,
    fontWeight: '800',
    letterSpacing: 8,
    textAlign: 'center',
  },
  resendContainer: {
    alignItems: 'center',
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
  },
  resendTimerText: {
    fontSize: FontSize.xs,
  },
  resendBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
  },
  resendActionText: {
    fontSize: FontSize.xs + 1,
    fontWeight: '700',
  },
  backStepBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  backStepText: {
    fontSize: FontSize.xs + 1,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  termsText: {
    fontSize: FontSize.xs - 1,
    textAlign: 'center',
    lineHeight: 16,
  },
});
