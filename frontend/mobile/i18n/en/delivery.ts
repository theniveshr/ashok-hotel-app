/**
 * English translations — home delivery & delivery tracking
 */
export const delivery = {
  homeDelivery: 'Home Delivery',
  deliveryAddress: 'Delivery Address',
  deliveryFee: 'Delivery Fee',
  freeDelivery: 'Free Delivery',
  minOrderAmount: 'Minimum order ₹{{amount}} for delivery',
  minOrderNotMet: 'Minimum order for this zone is ₹{{amount}}. Please add ₹{{diff}} more.',
  addMoreForFreeDelivery: 'Add ₹{{amount}} more for FREE Delivery!',
  freeDeliveryUnlocked: 'You have unlocked FREE Delivery!',
  estimatedTime: 'Estimated {{minutes}} min',
  trackDelivery: 'Track Delivery',
  deliveryTracking: 'Delivery Tracking',
  deliveryZone: 'Delivery Zone',
  orderSummary: 'Order Summary',

  // Status
  finding: 'Finding a delivery partner',
  assigned: 'Delivery partner assigned',
  pickedUp: 'Order picked up',
  enRoute: 'On the way',
  arriving: 'Arriving soon',
  delivered: 'Delivered',
  deliveryFailed: 'Delivery failed',
  cancelled: 'Order Cancelled',

  // Timeline Steps
  stepPlaced: 'Order Placed',
  stepAccepted: 'Restaurant Confirmed',
  stepPreparing: 'Kitchen Preparing',
  stepReady: 'Packed & Ready',
  stepAssigned: 'Driver Assigned',
  stepPickedUp: 'Driver Picked Up',
  stepEnRoute: 'On The Way',
  stepDelivered: 'Delivered',

  // Partner
  deliveryPartner: 'Delivery Partner',
  partnerName: 'Partner',
  callPartner: 'Call Partner',
  partnerRating: '{{rating}} rating',
  vehicleNumber: 'Vehicle',

  // Address & Privacy
  savedAddresses: 'Saved Addresses',
  addNewAddress: 'Add New Address',
  addressLabel: 'Label (Home, Work...)',
  addressLine1: 'Address Line 1',
  addressLine2: 'Address Line 2 (Optional)',
  city: 'City',
  state: 'State',
  pincode: 'Pincode',
  setAsDefault: 'Set as Default',
  deleteAddress: 'Delete Address',
  deleteAddressConfirm: 'Delete this address?',
  addressPrivacyProtected: 'Customer address is strictly confidential and protected.',

  // OTP
  deliveryOtp: 'Delivery OTP',
  otpForDelivery: 'Share this 6-digit OTP with your delivery partner to confirm delivery.',
  enterOtpToComplete: 'Enter 6-digit OTP from customer to complete delivery',

  // Cancellation
  cancelOrder: 'Cancel Order',
  cancelOrderConfirm: 'Are you sure you want to cancel this delivery order?',
  cancellationAllowedNote: 'Orders can only be cancelled before kitchen cooking begins.',
  cancellationNotAllowed: 'Cooking has started. Cancellation is locked to prevent food waste.',
  cancellationReason: 'Reason for cancellation',
} as const;
