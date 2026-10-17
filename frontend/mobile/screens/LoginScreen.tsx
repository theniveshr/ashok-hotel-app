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
  Smartphone,
  ShieldCheck,
  ArrowRight,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  LogIn,
  Mail,
  KeyRound,
  ArrowLeft,
  RefreshCw,
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
  initialPhone?: string;
  successMessage?: string;
}

export function LoginScreen({
  onLoginSuccess,
  onNavigateToRegister,
  initialPhone,
  successMessage,
}: LoginScreenProps) {
  const { colors } = useTheme();
  const { isTamil } = useTranslation();
  const sendOtp = useAuthStore((state) => state.sendOtp);
  const verifyOtp = useAuthStore((state) => state.verifyOtp);
  const loginWithPassword = useAuthStore((state) => state.loginWithPassword);
  const resetPassword = useAuthStore((state) => state.resetPassword);

  // Login Mode: 'OTP' or 'PASSWORD'
  const [loginMode, setLoginMode] = useState<'OTP' | 'PASSWORD'>('PASSWORD');

  // OTP Mode State
  const [otpPhone, setOtpPhone] = useState(initialPhone || '');
  const [otpStep, setOtpStep] = useState<'PHONE' | 'VERIFY'>('PHONE');
  const [otpCode, setOtpCode] = useState('');
  const [resendCountdown, setResendCountdown] = useState(0);

  // Password Mode State
  const [identifier, setIdentifier] = useState(initialPhone || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Forgot Password / Recovery State
  const [isForgotModal, setIsForgotModal] = useState(false);
  const [forgotPhone, setForgotPhone] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [forgotStep, setForgotStep] = useState<'PHONE' | 'RESET'>('PHONE');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState('');
  const [showForgotNewPassword, setShowForgotNewPassword] = useState(false);
  const [showForgotConfirmPassword, setShowForgotConfirmPassword] = useState(false);

  // Common UI State
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [bannerSuccess, setBannerSuccess] = useState<string | null>(successMessage || null);

  // Countdown timer for resending OTP
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendCountdown > 0) {
      timer = setTimeout(() => setResendCountdown((prev) => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCountdown]);

  // Update success message if prop changes
  useEffect(() => {
    if (successMessage) {
      setBannerSuccess(successMessage);
    }
  }, [successMessage]);

  const cleanPhone = (val: string) => {
    let cleaned = (val || '').replace(/[^0-9+]/g, '');
    if (cleaned.startsWith('+91')) cleaned = cleaned.slice(3);
    else if (cleaned.startsWith('91') && cleaned.length > 10) cleaned = cleaned.slice(2);
    else if (cleaned.startsWith('0') && cleaned.length > 10) cleaned = cleaned.slice(1);
    return cleaned.replace(/[^0-9]/g, '').slice(0, 10);
  };

  // ── OTP Login Handlers ───────────────────────────────────────────────────────
  const handleSendOtp = async () => {
    if (loading) return;
    const clean = cleanPhone(otpPhone);
    if (clean.length !== 10 || !/^[6-9]\d{9}$/.test(clean)) {
      setLocalError(
        isTamil
          ? 'சரியான 10 இலக்க இந்திய மொபைல் எண்ணை உள்ளிடவும் (6-9 இல் தொடங்க வேண்டும்).'
          : 'Please enter a valid 10-digit Indian mobile number.'
      );
      return;
    }

    setLoading(true);
    setLocalError(null);
    setBannerSuccess(null);
    const res = await sendOtp(clean);
    setLoading(false);

    if (res.success) {
      if (res.debugOtp) {
        setOtpCode(res.debugOtp);
      }
      setResendCountdown(60);
      setOtpStep('VERIFY');
    } else {
      setLocalError(res.error || (isTamil ? 'OTP அனுப்புவதில் தோல்வி.' : 'Failed to send OTP. Please check your number.'));
    }
  };

  const handleVerifyOtp = async () => {
    if (loading) return;
    const clean = cleanPhone(otpPhone);
    const cleanCode = otpCode.trim();
    if (cleanCode.length !== 6 || !/^\d{6}$/.test(cleanCode)) {
      setLocalError(
        isTamil
          ? 'சரியான 6 இலக்க சரிபார்ப்புக் குறியீட்டை உள்ளிடவும்.'
          : 'Please enter a valid 6-digit verification code.'
      );
      return;
    }

    setLoading(true);
    setLocalError(null);
    setBannerSuccess(null);
    const res = await verifyOtp(clean, cleanCode);
    setLoading(false);

    if (res.success) {
      onLoginSuccess();
    } else {
      setLocalError(
        res.error || (isTamil ? 'தவறான அல்லது காலாவதியான OTP.' : 'Invalid or expired verification code.')
      );
    }
  };

  const handleResendOtp = async () => {
    if (resendCountdown > 0 || loading) return;
    setLoading(true);
    setLocalError(null);
    const clean = cleanPhone(otpPhone);
    const res = await sendOtp(clean);
    setLoading(false);
    if (res.success) {
      if (res.debugOtp) {
        setOtpCode(res.debugOtp);
      }
      setResendCountdown(60);
    } else {
      setLocalError(res.error || 'Failed to resend OTP.');
    }
  };

  // ── Password Login Handler ──────────────────────────────────────────────────
  const handlePasswordLogin = async () => {
    if (loading) return;
    const rawTarget = identifier.trim();

    if (!rawTarget) {
      setLocalError(
        isTamil
          ? 'மொபைல் எண் அல்லது மின்னஞ்சலை உள்ளிடவும்.'
          : 'Please enter your registered mobile number or email.'
      );
      return;
    }

    const isEmail = rawTarget.includes('@');
    if (!isEmail) {
      const clean = cleanPhone(rawTarget);
      if (clean.length !== 10 || !/^[6-9]\d{9}$/.test(clean)) {
        setLocalError(
          isTamil
            ? 'சரியான 10 இலக்க மொபைல் எண் அல்லது மின்னஞ்சலை உள்ளிடவும்.'
            : 'Enter a valid 10-digit mobile number or email address.'
        );
        return;
      }
    }

    if (password.length < 6) {
      setLocalError(
        isTamil
          ? 'கடவுச்சொல் குறைந்தது 6 எழுத்துக்கள் இருக்க வேண்டும்.'
          : 'Password must be at least 6 characters.'
      );
      return;
    }

    setLoading(true);
    setLocalError(null);
    setBannerSuccess(null);
    const res = await loginWithPassword(rawTarget, password);
    setLoading(false);

    if (res.success) {
      onLoginSuccess();
    } else {
      setLocalError(
        res.error || (isTamil ? 'தவறான தகவல்கள் அல்லது கடவுச்சொல்.' : 'Invalid credentials. Please check details.')
      );
    }
  };

  // ── Forgot Password Handlers ────────────────────────────────────────────────
  const handleSendForgotOtp = async () => {
    if (loading) return;
    const clean = cleanPhone(forgotPhone);
    if (clean.length !== 10 || !/^[6-9]\d{9}$/.test(clean)) {
      setLocalError(
        isTamil
          ? 'பதிவுசெய்யப்பட்ட 10 இலக்க இந்திய மொபைல் எண்ணை உள்ளிடவும்.'
          : 'Please enter your registered 10-digit mobile number.'
      );
      return;
    }

    setLoading(true);
    setLocalError(null);
    const res = await sendOtp(clean);
    setLoading(false);

    if (res.success) {
      if (res.debugOtp) {
        setForgotOtp(res.debugOtp);
      }
      setForgotStep('RESET');
    } else {
      setLocalError(res.error || 'Failed to send recovery OTP.');
    }
  };

  const handleResetPassword = async () => {
    if (loading) return;
    const clean = cleanPhone(forgotPhone);

    if (forgotOtp.trim().length !== 6) {
      setLocalError(isTamil ? 'சரியான 6 இலக்க OTP ஐ உள்ளிடவும்.' : 'Enter the 6-digit OTP code.');
      return;
    }

    if (forgotNewPassword.length < 6) {
      setLocalError(isTamil ? 'புதிய கடவுச்சொல் குறைந்தது 6 எழுத்துக்கள் இருக்க வேண்டும்.' : 'New password must be at least 6 characters.');
      return;
    }

    if (forgotNewPassword !== forgotConfirmPassword) {
      setLocalError(isTamil ? 'கடவுச்சொற்கள் பொருந்தவில்லை.' : 'Passwords do not match.');
      return;
    }

    setLoading(true);
    setLocalError(null);
    const res = await resetPassword(clean, forgotOtp.trim(), forgotNewPassword);
    setLoading(false);

    if (res.success) {
      setIsForgotModal(false);
      setForgotStep('PHONE');
      setForgotPhone('');
      setForgotOtp('');
      setForgotNewPassword('');
      setForgotConfirmPassword('');
      setLoginMode('PASSWORD');
      setIdentifier(clean);
      setBannerSuccess(
        isTamil
          ? 'கடவுச்சொல் வெற்றிகரமாக மாற்றப்பட்டது! உங்கள் புதிய கடவுச்சொல்லுடன் உள்நுழையவும்.'
          : 'Password reset successful! Please log in with your new password.'
      );
    } else {
      setLocalError(res.error || 'Failed to reset password.');
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
              {isForgotModal
                ? isTamil
                  ? 'கடவுச்சொல்லை மீட்டெடுக்கவும்'
                  : 'Reset Password'
                : isTamil
                ? 'மீண்டும் வருக!'
                : 'Welcome Back'}
            </Text>

            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              {isForgotModal
                ? isTamil
                  ? 'உங்கள் மொபைல் எண்ணை உள்ளிட்டு OTP மூலம் புதிய கடவுச்சொல்லை அமைக்கவும்.'
                  : 'Recover your account using a one-time verification code.'
                : isTamil
                ? 'உணவு ஆர்டர் செய்ய, அறைகள் பதிவு செய்ய உள்நுழைக.'
                : 'Sign in to order food, book lodge rooms and manage your bookings.'}
            </Text>
          </View>

          {/* Card Container */}
          <GlassCard style={styles.card}>
            {/* Success message banner */}
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

            {/* ── Mode Selection Tabs (When not in Forgot Password modal) ── */}
            {!isForgotModal && (
              <View style={[styles.tabSelector, { backgroundColor: colors.surfaceElevated }]}>
                <TouchableOpacity
                  style={[
                    styles.tabButton,
                    loginMode === 'OTP' && [styles.activeTabButton, { backgroundColor: colors.surface }],
                  ]}
                  onPress={() => {
                    setLocalError(null);
                    setLoginMode('OTP');
                  }}
                  activeOpacity={0.8}
                >
                  <Smartphone
                    size={16}
                    color={loginMode === 'OTP' ? colors.accent : colors.textTertiary}
                  />
                  <Text
                    style={[
                      styles.tabText,
                      { color: loginMode === 'OTP' ? colors.accent : colors.textSecondary },
                    ]}
                  >
                    {isTamil ? 'மொபைல் OTP' : 'Mobile OTP'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.tabButton,
                    loginMode === 'PASSWORD' && [styles.activeTabButton, { backgroundColor: colors.surface }],
                  ]}
                  onPress={() => {
                    setLocalError(null);
                    setLoginMode('PASSWORD');
                  }}
                  activeOpacity={0.8}
                >
                  <Lock
                    size={16}
                    color={loginMode === 'PASSWORD' ? colors.accent : colors.textTertiary}
                  />
                  <Text
                    style={[
                      styles.tabText,
                      { color: loginMode === 'PASSWORD' ? colors.accent : colors.textSecondary },
                    ]}
                  >
                    {isTamil ? 'கடவுச்சொல்' : 'Password'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* ── 1. FORGOT PASSWORD FLOW ── */}
            {isForgotModal ? (
              forgotStep === 'PHONE' ? (
                <View>
                  <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                    {isTamil ? 'பதிவுசெய்த மொபைல் எண்' : 'Registered Mobile Number'}
                  </Text>
                  <View
                    style={[
                      styles.inputRow,
                      {
                        backgroundColor: colors.surfaceElevated,
                        borderColor: colors.border,
                      },
                    ]}
                  >
                    <Smartphone size={18} color={colors.textTertiary} />
                    <Text style={[styles.countryCode, { color: colors.textPrimary }]}>+91</Text>
                    <View style={[styles.phoneDivider, { backgroundColor: colors.border }]} />
                    <TextInput
                      value={forgotPhone}
                      onChangeText={(text) => {
                        setLocalError(null);
                        setForgotPhone(cleanPhone(text));
                      }}
                      placeholder={isTamil ? '10 இலக்க மொபைல் எண்' : '10-digit mobile number'}
                      placeholderTextColor={colors.textTertiary}
                      keyboardType="phone-pad"
                      maxLength={10}
                      style={[styles.input, { color: colors.textPrimary }]}
                      autoFocus
                    />
                  </View>

                  <PrimaryButton
                    title={isTamil ? 'மீட்பு OTP அனுப்பு' : 'Send Recovery Code'}
                    onPress={handleSendForgotOtp}
                    loading={loading}
                    disabled={forgotPhone.length !== 10 || loading}
                    fullWidth
                    style={styles.actionBtn}
                    icon={<ArrowRight size={18} color={Palette.white} />}
                    iconPosition="right"
                  />

                  <TouchableOpacity
                    onPress={() => {
                      setIsForgotModal(false);
                      setLocalError(null);
                    }}
                    style={styles.backLinkBtn}
                  >
                    <ArrowLeft size={16} color={colors.accent} />
                    <Text style={[styles.backLinkText, { color: colors.accent }]}>
                      {isTamil ? 'உள்நுழைவிற்குத் திரும்பு' : 'Back to Login'}
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View>
                  {/* Enter OTP */}
                  <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                    {isTamil ? 'OTP குறியீடு (6 இலக்கங்கள்)' : 'Verification Code (6-Digits)'}
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
                      value={forgotOtp}
                      onChangeText={(text) => {
                        setLocalError(null);
                        setForgotOtp(text.replace(/[^0-9]/g, ''));
                      }}
                      placeholder="• • • • • •"
                      placeholderTextColor={colors.textTertiary}
                      keyboardType="number-pad"
                      maxLength={6}
                      style={[styles.input, styles.otpInput, { color: colors.textPrimary }]}
                      autoFocus
                    />
                  </View>

                  {/* New Password */}
                  <Text style={[styles.inputLabel, { color: colors.textSecondary, marginTop: Spacing.sm }]}>
                    {isTamil ? 'புதிய கடவுச்சொல்' : 'New Password (min 6 chars)'}
                  </Text>
                  <View
                    style={[
                      styles.inputRow,
                      {
                        backgroundColor: colors.surfaceElevated,
                        borderColor: colors.border,
                      },
                    ]}
                  >
                    <Lock size={18} color={colors.textTertiary} />
                    <TextInput
                      value={forgotNewPassword}
                      onChangeText={(text) => {
                        setLocalError(null);
                        setForgotNewPassword(text);
                      }}
                      placeholder={isTamil ? 'புதிய கடவுச்சொல்' : 'Enter new password'}
                      placeholderTextColor={colors.textTertiary}
                      secureTextEntry={!showForgotNewPassword}
                      style={[styles.input, { color: colors.textPrimary }]}
                    />
                    <TouchableOpacity
                      onPress={() => setShowForgotNewPassword(!showForgotNewPassword)}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      {showForgotNewPassword ? (
                        <EyeOff size={18} color={colors.textTertiary} />
                      ) : (
                        <Eye size={18} color={colors.textTertiary} />
                      )}
                    </TouchableOpacity>
                  </View>

                  {/* Confirm New Password */}
                  <Text style={[styles.inputLabel, { color: colors.textSecondary, marginTop: Spacing.sm }]}>
                    {isTamil ? 'புதிய கடவுச்சொல்லை உறுதிப்படுத்துக' : 'Confirm New Password'}
                  </Text>
                  <View
                    style={[
                      styles.inputRow,
                      {
                        backgroundColor: colors.surfaceElevated,
                        borderColor: colors.border,
                      },
                    ]}
                  >
                    <Lock size={18} color={colors.textTertiary} />
                    <TextInput
                      value={forgotConfirmPassword}
                      onChangeText={(text) => {
                        setLocalError(null);
                        setForgotConfirmPassword(text);
                      }}
                      placeholder={isTamil ? 'கடவுச்சொல்லை மீண்டும் உள்ளிடவும்' : 'Re-enter new password'}
                      placeholderTextColor={colors.textTertiary}
                      secureTextEntry={!showForgotConfirmPassword}
                      style={[styles.input, { color: colors.textPrimary }]}
                    />
                    <TouchableOpacity
                      onPress={() => setShowForgotConfirmPassword(!showForgotConfirmPassword)}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      {showForgotConfirmPassword ? (
                        <EyeOff size={18} color={colors.textTertiary} />
                      ) : (
                        <Eye size={18} color={colors.textTertiary} />
                      )}
                    </TouchableOpacity>
                  </View>

                  <PrimaryButton
                    title={isTamil ? 'கடவுச்சொல்லை மாற்றுக' : 'Set New Password & Login'}
                    onPress={handleResetPassword}
                    loading={loading}
                    disabled={
                      forgotOtp.length !== 6 ||
                      forgotNewPassword.length < 6 ||
                      forgotNewPassword !== forgotConfirmPassword ||
                      loading
                    }
                    fullWidth
                    style={styles.actionBtn}
                    icon={<KeyRound size={18} color={Palette.white} />}
                  />

                  <TouchableOpacity
                    onPress={() => {
                      setForgotStep('PHONE');
                      setLocalError(null);
                    }}
                    style={styles.backLinkBtn}
                  >
                    <ArrowLeft size={16} color={colors.textSecondary} />
                    <Text style={[styles.backLinkText, { color: colors.textSecondary }]}>
                      {isTamil ? 'மொபைல் எண்ணை மாற்றவும்' : 'Change Recovery Phone'}
                    </Text>
                  </TouchableOpacity>
                </View>
              )
            ) : loginMode === 'OTP' ? (
              /* ── 2. MOBILE OTP LOGIN ── */
              otpStep === 'PHONE' ? (
                <View>
                  <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                    {isTamil ? 'மொபைல் எண் *' : 'Mobile Number *'}
                  </Text>
                  <View
                    style={[
                      styles.inputRow,
                      {
                        backgroundColor: colors.surfaceElevated,
                        borderColor: colors.border,
                      },
                    ]}
                  >
                    <Smartphone size={18} color={colors.textTertiary} />
                    <Text style={[styles.countryCode, { color: colors.textPrimary }]}>+91</Text>
                    <View style={[styles.phoneDivider, { backgroundColor: colors.border }]} />
                    <TextInput
                      value={otpPhone}
                      onChangeText={(text) => {
                        setLocalError(null);
                        setBannerSuccess(null);
                        setOtpPhone(cleanPhone(text));
                      }}
                      placeholder={isTamil ? '10 இலக்க மொபைல் எண்' : '10-digit mobile number'}
                      placeholderTextColor={colors.textTertiary}
                      keyboardType="phone-pad"
                      maxLength={10}
                      style={[styles.input, { color: colors.textPrimary }]}
                      autoFocus
                    />
                  </View>

                  <PrimaryButton
                    title={isTamil ? 'OTP குறியீடு அனுப்பு' : 'Send Mobile OTP'}
                    onPress={handleSendOtp}
                    loading={loading}
                    disabled={otpPhone.length !== 10 || loading}
                    fullWidth
                    style={styles.actionBtn}
                    icon={<ArrowRight size={18} color={Palette.white} />}
                    iconPosition="right"
                  />
                </View>
              ) : (
                <View>
                  <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                    {isTamil ? 'OTP சரிபார்ப்புக் குறியீடு *' : 'Enter 6-Digit OTP *'}
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
                      value={otpCode}
                      onChangeText={(text) => {
                        setLocalError(null);
                        setBannerSuccess(null);
                        setOtpCode(text.replace(/[^0-9]/g, ''));
                      }}
                      placeholder="• • • • • •"
                      placeholderTextColor={colors.textTertiary}
                      keyboardType="number-pad"
                      maxLength={6}
                      style={[styles.input, styles.otpInput, { color: colors.textPrimary }]}
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

                  <PrimaryButton
                    title={isTamil ? 'சரிபார்த்து உள்நுழைக' : 'Verify & Sign In'}
                    onPress={handleVerifyOtp}
                    loading={loading}
                    disabled={otpCode.length !== 6 || loading}
                    fullWidth
                    style={styles.actionBtn}
                    icon={<LogIn size={18} color={Palette.white} />}
                  />

                  <TouchableOpacity
                    onPress={() => {
                      setOtpStep('PHONE');
                      setLocalError(null);
                    }}
                    style={styles.changePhoneBtn}
                  >
                    <Text style={[styles.changePhoneText, { color: colors.accent }]}>
                      {isTamil ? 'எண்ணை மாற்றவும்' : 'Change Phone Number'}
                    </Text>
                  </TouchableOpacity>
                </View>
              )
            ) : (
              /* ── 3. PASSWORD LOGIN ── */
              <View>
                {/* Mobile Number or Email */}
                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                  {isTamil ? 'மொபைல் எண் அல்லது மின்னஞ்சல் *' : 'Mobile Number or Email *'}
                </Text>
                <View
                  style={[
                    styles.inputRow,
                    {
                      backgroundColor: colors.surfaceElevated,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  {identifier.includes('@') ? (
                    <Mail size={18} color={colors.textTertiary} />
                  ) : (
                    <Smartphone size={18} color={colors.textTertiary} />
                  )}
                  <TextInput
                    value={identifier}
                    onChangeText={(text) => {
                      setLocalError(null);
                      setBannerSuccess(null);
                      setIdentifier(text);
                    }}
                    placeholder={
                      isTamil ? 'மொபைல் எண் அல்லது மின்னஞ்சல்' : 'Enter mobile number or email'
                    }
                    placeholderTextColor={colors.textTertiary}
                    keyboardType="default"
                    autoCapitalize="none"
                    style={[styles.input, { color: colors.textPrimary }]}
                    autoFocus={!initialPhone}
                  />
                </View>

                {/* Password Input */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: Spacing.md }}>
                  <Text style={[styles.inputLabel, { color: colors.textSecondary, marginBottom: 0 }]}>
                    {isTamil ? 'கடவுச்சொல் *' : 'Password *'}
                  </Text>
                  <TouchableOpacity
                    onPress={() => {
                      setIsForgotModal(true);
                      setForgotStep('PHONE');
                      setForgotPhone(cleanPhone(identifier));
                      setLocalError(null);
                    }}
                  >
                    <Text style={[styles.forgotPasswordText, { color: colors.accent }]}>
                      {isTamil ? 'கடவுச்சொல் மறந்துவிட்டதா?' : 'Forgot password?'}
                    </Text>
                  </TouchableOpacity>
                </View>

                <View
                  style={[
                    styles.inputRow,
                    {
                      backgroundColor: colors.surfaceElevated,
                      borderColor: colors.border,
                      marginTop: Spacing.xs,
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
                    placeholder={isTamil ? '6 எழுத்துக்கள் கடவுச்சொல்' : 'Enter your password'}
                    placeholderTextColor={colors.textTertiary}
                    secureTextEntry={!showPassword}
                    style={[styles.input, { color: colors.textPrimary }]}
                    autoFocus={Boolean(initialPhone)}
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

                <PrimaryButton
                  title={isTamil ? 'உள்நுழைக' : 'Sign In'}
                  onPress={handlePasswordLogin}
                  loading={loading}
                  disabled={!identifier.trim() || password.length < 6 || loading}
                  fullWidth
                  style={styles.actionBtn}
                  icon={<LogIn size={18} color={Palette.white} />}
                />
              </View>
            )}

            {/* Switch to Register link */}
            {onNavigateToRegister && !isForgotModal && (
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

          {/* Footer Terms */}
          <View style={styles.footer}>
            <Text style={[styles.termsText, { color: colors.textTertiary }]}>
              {isTamil
                ? 'அசோக் ராஜ் குழுமம் • பாதுகாப்பான 30-நாள் அமர்வு மேலாண்மை'
                : 'Ashok Raj Groups • Secure 30-Day Session Management'}
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
    marginBottom: Spacing.sm,
  },
  card: {
    marginVertical: Spacing.sm,
    padding: Spacing.lg,
  },
  tabSelector: {
    flexDirection: 'row',
    borderRadius: Radius.md,
    padding: 3,
    marginBottom: Spacing.lg,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: Radius.sm,
    gap: 6,
  },
  activeTabButton: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: FontSize.xs + 1,
    fontWeight: '700',
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
  otpRow: {
    justifyContent: 'center',
  },
  otpInput: {
    fontSize: FontSize.xl,
    fontWeight: '800',
    letterSpacing: 8,
    textAlign: 'center',
  },
  forgotPasswordText: {
    fontSize: FontSize.xs,
    fontWeight: '600',
  },
  actionBtn: {
    marginTop: Spacing.lg,
  },
  changePhoneBtn: {
    alignItems: 'center',
    marginTop: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  changePhoneText: {
    fontSize: FontSize.xs + 1,
    fontWeight: '600',
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
  backLinkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: Spacing.lg,
    paddingVertical: Spacing.xs,
  },
  backLinkText: {
    fontSize: FontSize.xs + 1,
    fontWeight: '600',
  },
  switchAuthBtn: {
    alignItems: 'center',
    marginTop: Spacing.lg,
    paddingVertical: Spacing.xs,
  },
  switchAuthText: {
    fontSize: FontSize.sm,
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  successText: {
    flex: 1,
    fontSize: FontSize.xs + 1,
    fontWeight: '600',
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
