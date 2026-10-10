/**
 * English translations — common strings
 * Used throughout the app for navigation, actions, and generic labels.
 */
export const common = {
  // Navigation
  home: 'Home',
  order: 'Order',
  stay: 'Stay',
  menu: 'Menu',
  orders: 'Orders',
  bookings: 'Bookings',
  profile: 'Profile',
  settings: 'Settings',
  notifications: 'Notifications',
  search: 'Search menu or rooms...',
  back: 'Back',
  close: 'Close',

  // Greetings
  goodMorning: 'Good Morning',
  goodAfternoon: 'Good Afternoon',
  goodEvening: 'Good Evening',
  welcomeGuest: 'Welcome Guest',
  locationBranch: 'Kalaiyarkoil Main Branch',

  // Quick Actions
  orderFood: 'Order Food',
  scanQr: 'Scan Table QR',
  bookRoom: 'Book a Room',
  myOrders: 'My Orders',

  // Home Feed Sections
  popularFoods: 'Popular Foods',
  recommendedFoods: 'Recommended for You',
  featuredRooms: 'Featured Rooms',
  specialOffers: 'Offers & Discounts',
  activeOrder: 'Current Active Order',
  activeBooking: 'Current Active Stay',
  loyaltyPoints: 'Loyalty Rewards',
  tierGold: 'Gold Tier',
  pointsCount: '{{points}} Points',
  rupeeValue: 'Value ₹{{value}}',

  // Actions
  confirm: 'Confirm',
  cancel: 'Cancel',
  save: 'Save',
  edit: 'Edit',
  delete: 'Delete',
  submit: 'Submit',
  continue: 'Continue',
  done: 'Done',
  retry: 'Retry',
  refresh: 'Refresh',
  viewAll: 'View All',
  seeMore: 'See More',
  apply: 'Apply',
  remove: 'Remove',
  add: 'Add',
  update: 'Update',
  share: 'Share',
  call: 'Call',
  directions: 'Directions',

  // Status & Feedback
  loading: 'Loading...',
  error: 'Something went wrong',
  errorRetry: 'Something went wrong. Please try again.',
  noResults: 'No results found',
  empty: 'Nothing here yet',
  success: 'Success',
  failed: 'Failed',
  pullToRefresh: 'Pull to refresh',

  // Time & Currency
  currency: '₹',
  free: 'Free',
  total: 'Total',
  subtotal: 'Subtotal',
  tax: 'Tax',
  discount: 'Discount',
} as const;

export type CommonKeys = keyof typeof common;
