/**
 * English translations — authentication & onboarding
 */
export const auth = {
  welcome: 'Welcome',
  welcomeBack: 'Welcome Back',
  tagline: 'Lodge, Dine & Unwind',
  signIn: 'Sign In',
  signOut: 'Sign Out',
  createAccount: 'Create Account',
  alreadyHaveAccount: 'Already have an account?',
  dontHaveAccount: "Don't have an account?",

  // Phone
  enterPhone: 'Enter Mobile Number',
  phonePlaceholder: 'Enter mobile number',
  phoneHint: 'We will send a verification code to this number',
  sendOtp: 'Send OTP',
  resendOtp: 'Resend OTP',
  resendIn: 'Resend in {{seconds}}s',

  // OTP
  verifyPhone: 'Verify Mobile Number',
  enterOtp: 'Enter OTP',
  otpSentTo: 'OTP sent to {{phone}}',
  otpPlaceholder: 'Enter 6-digit OTP',
  verifyOtp: 'Verify',
  otpExpired: 'OTP has expired. Please request a new one.',
  otpInvalid: 'Invalid OTP. Please check and try again.',

  // Registration
  yourName: 'Your Name',
  namePlaceholder: 'Enter your full name',
  emailOptional: 'Email Address (Optional)',
  emailPlaceholder: 'Enter Your email address',
  completeProfile: 'Complete Profile',

  // Errors
  phoneRequired: 'Mobile number is required',
  phoneInvalid: 'Please enter a valid 10-digit mobile number',
  nameRequired: 'Name is required',
  nameMinLength: 'Name must be at least 2 characters',
  otpRequired: 'OTP is required',
  otpLength: 'OTP must be 6 digits',

  // Consent
  termsAgreement: 'By continuing, you agree to our',
  termsOfService: 'Terms of Service',
  privacyPolicy: 'Privacy Policy',
} as const;
