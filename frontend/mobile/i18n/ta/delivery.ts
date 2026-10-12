/**
 * Tamil translations — home delivery & delivery tracking
 * தமிழ் மொழிபெயர்ப்பு — வீட்டிற்கு டெலிவரி & கண்காணிப்பு
 */
export const delivery = {
  homeDelivery: 'வீட்டிற்கு டெலிவரி',
  deliveryAddress: 'டெலிவரி முகவரி',
  deliveryFee: 'டெலிவரி கட்டணம்',
  freeDelivery: 'இலவச டெலிவரி',
  minOrderAmount: 'டெலிவரிக்கு குறைந்தபட்ச ஆர்டர் ₹{{amount}}',
  minOrderNotMet: 'இந்த பகுதிக்கு குறைந்தபட்ச ஆர்டர் ₹{{amount}}. மேலும் ₹{{diff}} சேர்க்கவும்.',
  addMoreForFreeDelivery: 'இலவச டெலிவரி பெற மேலும் ₹{{amount}} சேர்க்கவும்!',
  freeDeliveryUnlocked: 'இலவச டெலிவரி பெற்றுவிட்டீர்கள்!',
  estimatedTime: 'தோராயமாக {{minutes}} நிமிடம்',
  trackDelivery: 'டெலிவரியை கண்காணிக்கவும்',
  deliveryTracking: 'டெலிவரி கண்காணிப்பு',
  deliveryZone: 'டெலிவரி பகுதி',
  orderSummary: 'ஆர்டர் சுருக்கம்',

  // Status
  finding: 'டெலிவரி பார்ட்னரை தேடுகிறது',
  assigned: 'டெலிவரி பார்ட்னர் ஒதுக்கப்பட்டார்',
  pickedUp: 'ஆர்டர் எடுக்கப்பட்டது',
  enRoute: 'வந்து கொண்டிருக்கிறது',
  arriving: 'விரைவில் வந்துவிடும்',
  delivered: 'டெலிவரி செய்யப்பட்டது',
  deliveryFailed: 'டெலிவரி தோல்வியடைந்தது',
  cancelled: 'ஆர்டர் ரத்து செய்யப்பட்டது',

  // Timeline Steps
  stepPlaced: 'ஆர்டர் பெறப்பட்டது',
  stepAccepted: 'உணவகம் உறுதிப்படுத்தியது',
  stepPreparing: 'சமையலறையில் தயாராகிறது',
  stepReady: 'பேக் செய்யப்பட்டு தயார்',
  stepAssigned: 'பார்ட்னர் ஒதுக்கப்பட்டார்',
  stepPickedUp: 'பார்ட்னர் பெற்றுக் கொண்டார்',
  stepEnRoute: 'வழியில் வந்து கொண்டிருக்கிறார்',
  stepDelivered: 'டெலிவரி செய்யப்பட்டது',

  // Partner
  deliveryPartner: 'டெலிவரி பார்ட்னர்',
  partnerName: 'பார்ட்னர்',
  callPartner: 'பார்ட்னரை அழைக்கவும்',
  partnerRating: '{{rating}} மதிப்பீடு',
  vehicleNumber: 'வாகனம்',

  // Address & Privacy
  savedAddresses: 'சேமிக்கப்பட்ட முகவரிகள்',
  addNewAddress: 'புதிய முகவரி சேர்க்க',
  addressLabel: 'பெயர் (வீடு, அலுவலகம்...)',
  addressLine1: 'முகவரி வரி 1',
  addressLine2: 'முகவரி வரி 2 (விருப்பத்தேர்வு)',
  city: 'நகரம்',
  state: 'மாநிலம்',
  pincode: 'அஞ்சல் குறியீடு',
  setAsDefault: 'இயல்புநிலையாக அமைக்கவும்',
  deleteAddress: 'முகவரியை நீக்கு',
  deleteAddressConfirm: 'இந்த முகவரியை நீக்கவா?',
  addressPrivacyProtected: 'வாடிக்கையாளர் முகவரி ரகசியமாகவும் பாதுகாப்பாகவும் வைக்கப்பட்டுள்ளது.',

  // OTP
  deliveryOtp: 'டெலிவரி OTP',
  otpForDelivery: 'டெலிவரியை உறுதிப்படுத்த இந்த 6-இலக்க OTP-யை டெலிவரி பார்ட்னரிடம் பகிரவும்.',
  enterOtpToComplete: 'டெலிவரியை முடிக்க வாடிக்கையாளரிடம் பெற்ற 6-இலக்க OTP-யை உள்ளிடவும்',

  // Cancellation
  cancelOrder: 'ஆர்டரை ரத்து செய்',
  cancelOrderConfirm: 'இந்த டெலிவரி ஆர்டரை நிச்சயமாக ரத்து செய்ய விரும்புகிறீர்களா?',
  cancellationAllowedNote: 'சமையல் துவங்குவதற்கு முன் மட்டுமே ஆர்டரை ரத்து செய்ய முடியும்.',
  cancellationNotAllowed: 'சமையல் துவங்கிவிட்டது. உணவு வீணாவதைத் தவிர்க்க ரத்து செய்ய இயலாது.',
  cancellationReason: 'ரத்து செய்வதற்கான காரணம்',
} as const;
