/**
 * English translations — restaurant & food ordering
 */
export const restaurant = {
  // Navigation
  orderFood: 'Order Food',
  menu: 'Menu',
  ourMenu: 'Our Menu',
  allItems: 'All Items',
  categories: 'Categories',

  // Menu Item
  addToCart: 'Add to Cart',
  addItem: 'Add Item',
  removeItem: 'Remove Item',
  customise: 'Customise',
  itemAdded: 'Item added to cart',
  veg: 'Veg',
  nonVeg: 'Non-Veg',
  spicy: 'Spicy',
  glutenFree: 'Gluten Free',
  calories: '{{count}} cal',
  prepTime: '{{minutes}} min',

  // Cart
  cart: 'Cart',
  yourCart: 'Your Cart',
  cartEmpty: 'Your cart is empty',
  cartEmptyHint: 'Add items from the menu to get started',
  clearCart: 'Clear Cart',
  clearCartConfirm: 'Remove all items from your cart?',
  itemCount: '{{count}} item',
  itemCountPlural: '{{count}} items',
  addMore: 'Add More Items',
  specialInstructions: 'Special Instructions',
  specialInstructionsPlaceholder: 'Any allergies, preferences...',

  // Order Type
  orderType: 'Order Type',
  dineIn: 'Dine In',
  takeaway: 'Takeaway',
  homeDelivery: 'Home Delivery',
  roomService: 'Room Service',

  // Checkout
  checkout: 'Checkout',
  placeOrder: 'Place Order',
  orderSummary: 'Order Summary',
  deliveryAddress: 'Delivery Address',
  selectAddress: 'Select Delivery Address',
  addAddress: 'Add New Address',
  tableNumber: 'Table Number',
  scanQr: 'Scan QR Code',

  // Order Status
  orderPlaced: 'Order Placed',
  orderConfirmed: 'Order Confirmed',
  orderPreparing: 'Preparing Your Order',
  orderReady: 'Order Ready',
  orderPickedUp: 'Order Picked Up',
  orderDelivered: 'Order Delivered',
  orderCancelled: 'Order Cancelled',

  // Reviews
  rateOrder: 'Rate Your Order',
  writeReview: 'Write a Review',

  // Dine-in QR
  scanTableQr: 'Scan Table QR Code',
  scanQrInstruction: 'Point your camera at the QR code on your table',
  tableDetected: 'Table {{number}} detected',

  // Coupons
  couponCode: 'Coupon Code',
  enterCoupon: 'Enter coupon code',
  applyCoupon: 'Apply',
  couponApplied: 'Coupon applied!',
  couponInvalid: 'Invalid or expired coupon',
  couponSaved: 'You saved {{amount}}!',
} as const;
