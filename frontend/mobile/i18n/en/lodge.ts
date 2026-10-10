/**
 * English translations — lodge / room booking
 */
export const lodge = {
  // Navigation & Headers
  lodge: 'Lodge',
  rooms: 'Rooms',
  bookRoom: 'Book a Room',
  myBookings: 'My Bookings',
  currentStay: 'Current Stay',
  activeStay: 'Active Stay',
  pastStays: 'Past Stays',
  todayOverview: "Today's Front Desk",

  // Flow Steps
  stepDates: '1. Dates',
  stepGuests: '2. Guests',
  stepRooms: '3. Room',
  stepGuestDetails: '4. Guest Info',
  stepExtras: '5. Extras',
  stepCoupon: '6. Coupon',
  stepPayment: '7. Payment',
  stepConfirm: '8. Confirmation',

  // Room Discovery & Availability
  availableRooms: 'Available Rooms',
  checkAvailability: 'Check Availability',
  checkIn: 'Check-in',
  checkOut: 'Check-out',
  selectDates: 'Select Dates',
  datesSelected: 'Selected Dates',
  guests: 'Guests',
  adults: 'Adults',
  children: 'Children',
  nights: '{{count}} Night',
  nightsPlural: '{{count}} Nights',
  perNight: 'per night',
  viewRooms: 'View Rooms',
  selectThisRoom: 'Select This Room',
  noRoomsAvailable: 'No rooms available for the selected dates',

  // Room Details
  roomDetails: 'Room Details',
  amenities: 'Amenities',
  policies: 'Policies',
  photos: 'Photos',
  maxOccupancy: 'Max {{count}} Guests',
  floor: 'Floor {{number}}',
  roomNumber: 'Room {{number}}',

  // Guest Details Form
  bookingDetails: 'Booking Details',
  guestDetails: 'Primary Guest Details',
  additionalGuests: 'Additional Guests',
  addGuest: '+ Add Another Guest',
  removeGuest: 'Remove',
  guestName: 'Full Name',
  guestPhone: 'Mobile Number',
  idType: 'Govt ID Proof',
  idNumber: 'ID Number',
  aadhaar: 'Aadhaar Card',
  pan: 'PAN Card',
  passport: 'Passport',
  drivingLicense: 'Driving Licence',
  specialRequests: 'Special Requests / Notes',
  specialRequestsPlaceholder: 'e.g. Ground floor preference, extra towels, late arrival...',
  confirmBooking: 'Confirm & Book Now',

  // Extras & Add-ons
  extrasTitle: 'Enhance Your Stay (Optional Add-ons)',
  extraBed: 'Extra Bed / Rollaway Mattress',
  extraBreakfast: 'South Indian Breakfast Buffet',
  extraPickup: 'Kalaiyarkoil / Sivagangai Pickup',
  extraLateCheckout: 'Late Check-out Buffer (2 hrs)',
  added: 'Added',
  add: 'Add',

  // Coupons & Discounts
  applyCoupon: 'Apply Promo Coupon',
  couponCode: 'Enter Coupon Code',
  apply: 'Apply',
  removeCoupon: 'Remove',
  couponDiscount: 'Coupon Discount',
  couponApplied: 'Coupon applied successfully!',

  // Payment Options
  paymentMethod: 'Payment Method',
  payUpi: 'Instant UPI (GPay / PhonePe / Paytm)',
  payCard: 'Debit / Credit Card',
  payHotel: 'Pay at Hotel (Cash / Card at Reception)',
  payRazorpay: 'Razorpay NetBanking / Wallets',
  advancePayment: 'Advance Payment',
  balanceAtHotel: 'Balance due at Check-in',

  // Confirmation & Receipt
  bookingSuccess: 'Booking Confirmed!',
  bookingId: 'Booking ID',
  scanQrAtDesk: 'Show this QR code at front desk for express check-in',
  staySummary: 'Stay Summary',
  downloadReceipt: 'Download Receipt',
  addToCalendar: 'Add to Calendar',
  sendWhatsAppConfirmation: 'Send via WhatsApp',
  reminderSet: 'Check-in reminder enabled',

  // Booking Management (Cancellation & Modification)
  cancelBooking: 'Cancel Booking',
  modifyBooking: 'Modify Dates / Guests',
  cancellationPolicyTitle: '24-Hour Free Cancellation Policy',
  cancellationFreeNotice: 'Free cancellation up to 24 hours before 2:00 PM check-in.',
  cancellationFeeNotice: '50% charge applies for cancellations within 24 hours.',
  cancellationReason: 'Reason for Cancellation',
  cancellationReasonPlaceholder: 'Please tell us why you need to cancel...',
  confirmCancellation: 'Confirm Cancellation',
  refundAmount: 'Estimated Refund Amount',
  cancellationCharge: 'Cancellation Fee',
  bookingCancelledNotice: 'This booking has been cancelled and refunded.',

  // Booking Status
  bookingPending: 'Pending Confirmation',
  bookingConfirmed: 'Confirmed',
  checkedIn: 'Checked In',
  checkedOut: 'Checked Out',
  bookingCancelled: 'Cancelled',
  noShow: 'No Show',

  // Reminders
  bookingReminders: 'Stay Reminders',
  reminderCheckInTomorrow: 'Reminder: Check-in tomorrow at 2:00 PM',
  reminderSent: 'Reminder sent to your mobile number',
  sendReminderNow: 'Send Reminder Notification',

  // Staff Front Desk Labels
  todaysArrivals: "Today's Arrivals",
  todaysDepartures: "Today's Departures",
  inHouseGuests: 'In-House Guests',
  checkInAction: 'Check-In',
  checkOutAction: 'Check-Out',
  assignRoomAction: 'Assign Room',
  changeRoomAction: 'Change Room',
  roomChangedNotice: 'Room changed successfully',

  // Policies
  checkInTime: 'Check-in from {{time}}',
  checkOutTime: 'Check-out by {{time}}',
  cancellationPolicy: 'Cancellation Policy',
  freeCancellation: 'Free cancellation within {{hours}} hours',

  // Room Service
  roomService: 'Room Service',
  orderToRoom: 'Order Food to Room',
  currentRoomService: 'Room Service Orders',

  // Guest Folio
  guestFolio: 'Guest Folio',
  billSummary: 'Bill Summary',
  roomCharges: 'Room Tariff',
  roomServiceCharges: 'Room Service',
  taxes: 'GST (12% Room Tax)',
  checkOutBill: 'Check-out & Settle Bill',
} as const;
