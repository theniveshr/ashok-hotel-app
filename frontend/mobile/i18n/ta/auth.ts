/**
 * Tamil translations — authentication & onboarding
 * தமிழ் மொழிபெயர்ப்பு — உள்நுழைவு
 */
export const auth = {
  welcome: 'வரவேற்கிறோம்',
  welcomeBack: 'மீண்டும் வரவேற்கிறோம்',
  tagline: 'தங்கி, சாப்பிட்டு, இளைப்பாறுங்கள்',
  signIn: 'உள்நுழைய',
  signOut: 'வெளியேறு',
  createAccount: 'கணக்கு உருவாக்கு',
  alreadyHaveAccount: 'ஏற்கனவே கணக்கு உள்ளதா?',
  dontHaveAccount: 'கணக்கு இல்லையா?',

  // Phone
  enterPhone: 'மொபைல் எண்ணை உள்ளிடுக',
  phonePlaceholder: '10 இலக்க மொபைல் எண்',
  phoneHint: 'இந்த எண்ணுக்கு ஒரு சரிபார்ப்பு குறியீடு அனுப்பப்படும்',
  sendOtp: 'OTP அனுப்பு',
  resendOtp: 'OTP மீண்டும் அனுப்பு',
  resendIn: '{{seconds}} விநாடிகளில் மீண்டும் அனுப்பு',

  // OTP
  verifyPhone: 'மொபைல் எண்ணை சரிபார்',
  enterOtp: 'OTP உள்ளிடுக',
  otpSentTo: '{{phone}} க்கு OTP அனுப்பப்பட்டது',
  otpPlaceholder: '6 இலக்க குறியீடு',
  verifyOtp: 'சரிபார்',
  otpExpired: 'OTP காலாவதியாகிவிட்டது. புதியதை கோரவும்.',
  otpInvalid: 'தவறான OTP. சரிபார்த்து மீண்டும் முயற்சிக்கவும்.',

  // Registration
  yourName: 'உங்கள் பெயர்',
  namePlaceholder: 'முழு பெயரை உள்ளிடுக',
  emailOptional: 'மின்னஞ்சல் முகவரி (விருப்பத்தேர்வு)',
  emailPlaceholder: 'உங்கள்@மின்னஞ்சல்.com',
  completeProfile: 'சுயவிவரம் முடிக்க',

  // Errors
  phoneRequired: 'மொபைல் எண் தேவை',
  phoneInvalid: 'சரியான 10 இலக்க மொபைல் எண்ணை உள்ளிடவும்',
  nameRequired: 'பெயர் தேவை',
  nameMinLength: 'பெயர் குறைந்தது 2 எழுத்துகள் இருக்க வேண்டும்',
  otpRequired: 'OTP தேவை',
  otpLength: 'OTP 6 இலக்கங்களாக இருக்க வேண்டும்',

  // Consent
  termsAgreement: 'தொடர்வதன் மூலம், நீங்கள் எங்கள்',
  termsOfService: 'பயன்பாட்டு விதிமுறைகளை',
  privacyPolicy: 'தனியுரிமை கொள்கையை',
} as const;
