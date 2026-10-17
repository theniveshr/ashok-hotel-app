/**
 * @ashok-raj/config
 * Shared constants and configuration values across all apps.
 * No secrets here — environment variables are accessed from the respective app.
 */

// ─── Business Constants ───────────────────────────────────────────────────────

export const BUSINESS = {
  name: 'Ashok Raj Lodge & Restaurant A/C',
  nameTa: 'அசோக் ராஜ் தங்குமிடம் மற்றும் உணவகம் குளிரூட்டி',
  phone: '04575 232 333',
  website: 'https://ashokrajgroups.com',
  mapsUrl: 'https://www.google.com/maps/place/Ashok+Raj+Lodge+%26+Restaurant+A%2FC/@9.8465627,78.6356551,17z',
  coordinates: {
    lat: 9.8465627,
    lng: 78.6356551,
  },
  address: {
    line1: 'No-1412, Madurai to Thondi Main Road',
    line2: 'Kalaiyarkoil, opposite Petrol Pump',
    city: 'Kalaiyarkoil',
    state: 'Tamil Nadu',
    pincode: '630551',
    landmark: 'Kochi-Madurai-Thondi Point Highway, Murthi Nagar',
  },
  gst: '', // Fill in GST number
  fssai: '', // Fill in FSSAI license
} as const;

// ─── API Constants ─────────────────────────────────────────────────────────────

export const API = {
  VERSION: 'v1',
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  RATE_LIMIT_WINDOW_MS: 60_000,
  RATE_LIMIT_MAX_REQUESTS: 100,
  RATE_LIMIT_AUTH_MAX: 10,
  JWT_EXPIRY: '15m',
  REFRESH_TOKEN_EXPIRY: '7d',
  OTP_EXPIRY_MINUTES: 10,
  OTP_LENGTH: 6,
} as const;

// ─── Loyalty Constants ─────────────────────────────────────────────────────────

export const LOYALTY = {
  POINTS_PER_RUPEE: 1,          // 1 point per ₹1 spent
  RUPEE_PER_POINT_REDEEM: 0.25, // ₹0.25 per point redeemed
  TIERS: {
    BRONZE: { minPoints: 0, maxPoints: 999 },
    SILVER: { minPoints: 1000, maxPoints: 4999 },
    GOLD: { minPoints: 5000, maxPoints: 19999 },
    PLATINUM: { minPoints: 20000, maxPoints: Infinity },
  },
} as const;

// ─── Tax Constants ─────────────────────────────────────────────────────────────

export const TAX = {
  FOOD_GST_RATE: 0.05,  // 5% GST on food
  ROOM_GST_RATE: 0.12,  // 12% GST on rooms
  DELIVERY_GST_RATE: 0.18, // 18% GST on delivery
} as const;

// ─── Room & Lodge Constants ──────────────────────────────────────────────────

export const ROOM = {
  CHECKOUT_TIME: '11:00',   // HH:mm
  CHECKIN_TIME: '14:00',    // HH:mm
  MAX_ADVANCE_BOOKING_DAYS: 365,
  CANCELLATION_WINDOW_HOURS: 24,
  ROOM_GST_RATE: 0.12,
} as const;

export const LODGE = {
  DEFAULT_CHECKIN_TIME: '14:00',
  DEFAULT_CHECKOUT_TIME: '11:00',
  ROOM_GST_PERCENT: 12,
  ROOM_STATUSES: [
    { key: 'AVAILABLE', label: 'Available', labelTa: 'கிடைக்கக்கூடியது', color: '#10B981' },
    { key: 'RESERVED', label: 'Reserved', labelTa: 'முன்பதிவு செய்யப்பட்டது', color: '#E5A800' },
    { key: 'OCCUPIED', label: 'Occupied', labelTa: 'விருந்தினர் உள்ளார்', color: '#EF4444' },
    { key: 'CLEANING', label: 'Cleaning', labelTa: 'சுத்தம் செய்யப்படுகிறது', color: '#A855F7' },
    { key: 'INSPECTED', label: 'Inspected', labelTa: 'ஆய்வு செய்யப்பட்டது', color: '#38BDF8' },
    { key: 'MAINTENANCE', label: 'Maintenance', labelTa: 'பராமரிப்பில்', color: '#F97316' },
    { key: 'BLOCKED', label: 'Blocked', labelTa: 'முடக்கப்பட்டது', color: '#64748B' },
  ],
  STANDARD_AMENITIES: [
    { name: 'Air Conditioning', nameTa: 'குளிரூட்டி (A/C)', icon: 'Wind', category: 'ROOM' },
    { name: '24/7 Hot Water', nameTa: '24/7 சூடான நீர்', icon: 'Flame', category: 'BATHROOM' },
    { name: 'High-Speed WiFi', nameTa: 'இலவச அதிவேக வைஃபை', icon: 'Wifi', category: 'MEDIA' },
    { name: 'Smart LED TV', nameTa: 'ஸ்மார்ட் LED டிவி', icon: 'Tv', category: 'MEDIA' },
    { name: 'Room Service', nameTa: '24/7 அறை சேவை', icon: 'Coffee', category: 'SERVICE' },
    { name: 'Daily Sanitized', nameTa: 'தினசரி சுத்திகரிப்பு', icon: 'Shield', category: 'SERVICE' },
    { name: 'Tea/Coffee Maker', nameTa: 'டீ/காபி மேக்கர்', icon: 'CupSoda', category: 'ROOM' },
    { name: 'Wardrobe & Desk', nameTa: 'அலமாரி & மேசை', icon: 'Briefcase', category: 'ROOM' },
  ],
  DEFAULT_ROOM_TYPES: [
    {
      id: 'rt-single-non-ac',
      name: 'Single Non-AC Room',
      nameTa: 'தனி நபருக்கான சாதாரண அறை',
      description: 'Budget-friendly, clean single bedroom with comfortable bed, attached bathroom, high-speed WiFi and 24/7 front desk support.',
      descriptionTa: 'பட்ஜெட் விலையில் தூய்மையான படுக்கையறை, குளியலறை மற்றும் அதிவேக வைஃபை வசதியுடன் கூடிய சௌகரியமான அறை.',
      basePrice: 650,
      weekendPrice: 750,
      maxOccupancy: 1,
      bedType: 'Single Bed',
      sizeSqFt: 160,
      amenities: ['24/7 Hot Water', 'High-Speed WiFi', 'Daily Sanitized', 'Room Service'],
      amenitiesTa: ['24/7 சூடான நீர்', 'இலவச அதிவேக வைஃபை', 'தினசரி சுத்திகரிப்பு', '24/7 அறை சேவை'],
      imageUrls: ['https://www.ashokrajgroups.com/images/Lodge/single-non-ac.webp'],
    },
    {
      id: 'rt-single-ac',
      name: 'Single AC Room',
      nameTa: 'தனி நபர் குளிரூட்டி அறை',
      description: 'Cool and comfortable air-conditioned single room equipped with Smart LED TV, high-speed WiFi and attached hot water bathroom.',
      descriptionTa: 'குளிரூட்டப்பட்ட தனி நபர் படுக்கையறை, ஸ்மார்ட் டிவி மற்றும் 24 மணி நேர சூடான நீர் வசதியுடன்.',
      basePrice: 950,
      weekendPrice: 1100,
      maxOccupancy: 1,
      bedType: 'Single Bed',
      sizeSqFt: 180,
      amenities: ['Air Conditioning', '24/7 Hot Water', 'High-Speed WiFi', 'Smart LED TV', 'Room Service'],
      amenitiesTa: ['குளிரூட்டி (A/C)', '24/7 சூடான நீர்', 'இலவச அதிவேக வைஃபை', 'ஸ்மார்ட் LED டிவி', '24/7 அறை சேவை'],
      imageUrls: ['https://www.ashokrajgroups.com/images/Lodge/single-ac.jpg'],
    },
    {
      id: 'rt-double-ac',
      name: 'Double Bed AC Room',
      nameTa: 'இரட்டை படுக்கை குளிரூட்டி அறை',
      description: 'Spacious master bedroom with plush double bed, attached modern bathroom, Smart LED TV, high-speed WiFi and 24/7 room service.',
      descriptionTa: 'இரட்டை படுக்கை, நவீன குளியலறை, ஸ்மார்ட் டிவி மற்றும் 24 மணி நேர அறை சேவையுடன் கூடிய விசாலமான குளிரூட்டப்பட்ட அறை.',
      basePrice: 1400,
      weekendPrice: 1600,
      maxOccupancy: 2,
      bedType: 'Double Bed',
      sizeSqFt: 260,
      amenities: ['Air Conditioning', '24/7 Hot Water', 'High-Speed WiFi', 'Smart LED TV', 'Room Service', 'Tea/Coffee Maker'],
      amenitiesTa: ['குளிரூட்டி (A/C)', '24/7 சூடான நீர்', 'இலவச அதிவேக வைஃபை', 'ஸ்மார்ட் LED டிவி', '24/7 அறை சேவை', 'டீ/காபி மேக்கர்'],
      imageUrls: ['https://www.ashokrajgroups.com/images/Lodge/double-bed-ac.webp'],
    },
    {
      id: 'rt-six-bed-suite',
      name: 'Six Bed Family AC Suite',
      nameTa: 'ஆறு படுக்கை குடும்ப குளிரூட்டி சூட்',
      description: 'Large luxury family suite accommodating up to 6 guests with multiple beds, living space, attached bathrooms, Smart TV and room service.',
      descriptionTa: '6 விருந்தினர்கள் வரை தங்குவதற்கு ஏற்ற 6 படுக்கைகள் கொண்ட பிரம்மாண்ட குளிரூட்டப்பட்ட குடும்ப அறை.',
      basePrice: 2800,
      weekendPrice: 3200,
      maxOccupancy: 6,
      bedType: '6 Single / Multi Beds',
      sizeSqFt: 480,
      amenities: ['Air Conditioning', '24/7 Hot Water', 'High-Speed WiFi', 'Smart LED TV', 'Room Service', 'Daily Sanitized', 'Living Area'],
      amenitiesTa: ['குளிரூட்டி (A/C)', '24/7 சூடான நீர்', 'இலவச அதிவேக வைஃபை', 'ஸ்மார்ட் LED டிவி', '24/7 அறை சேவை', 'தினசரி சுத்திகரிப்பு', 'வரவேற்பறை'],
      imageUrls: ['https://www.ashokrajgroups.com/images/Lodge/six-bed-ac.webp'],
    },
  ],
  DEFAULT_POLICY: {
    checkInTime: '14:00',
    checkOutTime: '11:00',
    cancellationPolicy: 'Free cancellation up to 24 hours before check-in. 50% charge applies for same-day cancellations.',
    cancellationPolicyTa: 'செக்-இன் நேரத்திற்கு 24 மணி நேரத்திற்கு முன் வரை இலவச ரத்து. அதே நாளில் ரத்து செய்தால் 50% கட்டணம்.',
    childPolicy: 'Children below 6 years stay complimentary with existing bedding.',
    childPolicyTa: '6 வயதுக்குட்பட்ட குழந்தைகளுக்கு கட்டணம் இல்லை.',
    idProofRequired: true,
    smokingAllowed: false,
    petsAllowed: false,
  },
  BOOKING_EXTRAS: [
    { id: 'extra-bed', name: 'Extra Bed / Rollaway Mattress', nameTa: 'கூடுதல் படுக்கை / மெத்தை', price: 350, perNight: true, icon: 'BedDouble' },
    { id: 'extra-breakfast', name: 'South Indian Breakfast Buffet', nameTa: 'தென்னிந்திய காலை உணவு பஃபே', price: 180, perNight: true, perPerson: true, icon: 'Utensils' },
    { id: 'extra-pickup', name: 'Kalaiyarkoil / Sivagangai Pickup', nameTa: 'காளையார்கோவில் / சிவகங்கை பிக்-அப்', price: 600, perNight: false, icon: 'Car' },
    { id: 'extra-late-checkout', name: 'Late Check-out Buffer (2 hrs)', nameTa: 'தாமதமாக வெளியேறும் அனுமதி (2 மணி)', price: 400, perNight: false, icon: 'Clock' },
  ],
  SAMPLE_COUPONS: [
    {
      code: 'LODGE15',
      title: '15% Off on Lodge Stays',
      titleTa: 'தங்குமிடத்திற்கு 15% தள்ளுபடி',
      description: 'Get 15% instant discount on room tariff (max ₹500)',
      descriptionTa: 'அறை வாடகையில் 15% உடனடி தள்ளுபடி (அதிகபட்சம் ₹500)',
      discountType: 'PERCENTAGE',
      discountValue: 15,
      maxDiscount: 500,
      minOrderAmount: 1000,
      validUntil: '2027-12-31T23:59:59Z',
    },
    {
      code: 'ASHOKSTAY',
      title: 'Flat ₹300 Welcome Bonus',
      titleTa: 'நேரடி ₹300 தள்ளுபடி போனஸ்',
      description: 'Flat ₹300 off on 2+ nights stay',
      descriptionTa: '2 அல்லது அதற்கு மேற்பட்ட இரவுகள் தங்குவதற்கு ₹300 தள்ளுபடி',
      discountType: 'FIXED',
      discountValue: 300,
      maxDiscount: 300,
      minOrderAmount: 2000,
      validUntil: '2027-12-31T23:59:59Z',
    },
  ],
  REMINDER_TEMPLATES: {
    CHECKIN_24H: {
      subject: 'Upcoming Stay Tomorrow at Ashok Raj Lodge',
      subjectTa: 'நாளை அசோக் ராஜ் தங்குமிடத்தில் உங்களின் வருகை',
      body: 'Dear Guest, your stay at Ashok Raj Lodge begins tomorrow. Check-in is at 2:00 PM. Contact: 04575 232 333.',
      bodyTa: 'அன்பான விருந்தினரே, அசோக் ராஜ் தங்குமிடத்தில் உங்களின் முன்பதிவு நாளை தொடங்குகிறது. வருகை நேரம் மதியம் 2:00 PM.',
    },
    CHECKIN_2H: {
      subject: 'Welcome to Kalaiyarkoil — Your room is prepared',
      subjectTa: 'காளையார்கோவிலுக்கு நல்வரவு — உங்கள் அறை தயார்',
      body: 'Your room is sanitized and ready. Show your booking QR at reception for express 30-second check-in.',
      bodyTa: 'உங்கள் அறை தயார் நிலையில் உள்ளது. வரவேற்பறையில் உங்கள் QR குறியீட்டை காட்டி 30 நொடியில் உள்நுழையவும்.',
    },
  },
} as const;

// ─── Order & Delivery Constants ───────────────────────────────────────────────

export const ORDER = {
  MAX_ITEMS_PER_ORDER: 50,
  MIN_DELIVERY_ORDER_AMOUNT: 100,
  DEFAULT_PREP_TIME_MINUTES: 20,
  DELIVERY_RADIUS_KM: 10,
} as const;

export const DELIVERY = {
  DEFAULT_MIN_ORDER_AMOUNT: 100,
  DEFAULT_BASE_FEE: 30,
  DEFAULT_FREE_DELIVERY_THRESHOLD: 300,
  DEFAULT_ESTIMATED_MINUTES: 30,
  OTP_LENGTH: 6,
  CANCELLATION_PRE_KITCHEN_ONLY: true,
  ZONES: [
    {
      id: 'zone-kalaiyarkoil-town',
      name: 'Kalaiyarkoil Town Core',
      nameTa: 'காளையார்கோவில் நகர் மையம்',
      baseFee: 25,
      minOrderAmount: 100,
      freeDeliveryThreshold: 250,
      estimatedDeliveryMinutes: 25,
      radiusKm: 3.5,
      pincodes: ['630551'],
      isActive: true,
    },
    {
      id: 'zone-sivagangai-rd',
      name: 'Sivagangai Highway & Murthi Nagar',
      nameTa: 'சிவகங்கை நெடுஞ்சாலை & மூர்த்தி நகர்',
      baseFee: 40,
      minOrderAmount: 150,
      freeDeliveryThreshold: 400,
      estimatedDeliveryMinutes: 35,
      radiusKm: 7.0,
      pincodes: ['630551', '630552'],
      isActive: true,
    },
    {
      id: 'zone-outer-villages',
      name: 'Outer Villages & Surrounding Areas',
      nameTa: 'வெளிப்புற கிராமங்கள் & சுற்றுப்புறங்கள்',
      baseFee: 60,
      minOrderAmount: 250,
      freeDeliveryThreshold: 600,
      estimatedDeliveryMinutes: 45,
      radiusKm: 12.0,
      pincodes: ['630551', '630552', '630554'],
      isActive: true,
    },
  ],
} as const;

// ─── Supported Languages ───────────────────────────────────────────────────────

export const SUPPORTED_LANGUAGES = ['en', 'ta'] as const;
export const DEFAULT_LANGUAGE = 'en' as const;

// ─── Queue Names ───────────────────────────────────────────────────────────────

export const QUEUES = {
  NOTIFICATIONS: 'notifications',
  EMAIL: 'email',
  SMS: 'sms',
  HOUSEKEEPING: 'housekeeping',
  DELIVERY_ASSIGNMENT: 'delivery-assignment',
  INVOICE_GENERATION: 'invoice-generation',
} as const;

// ─── WebSocket Room Prefixes ───────────────────────────────────────────────────

export const WS_ROOMS = {
  ORDER: (id: string) => `order:${id}`,
  TABLE: (id: string) => `table:${id}`,
  KITCHEN: (branchId: string) => `kitchen:${branchId}`,
  DELIVERY: (id: string) => `delivery:${id}`,
  ADMIN: (branchId: string) => `admin:${branchId}`,
} as const;
