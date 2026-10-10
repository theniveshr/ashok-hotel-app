/**
 * @ashok-raj/types
 * Shared TypeScript types for all apps in the monorepo.
 * Never import runtime code here — types only.
 */

// ─── Enumerations ─────────────────────────────────────────────────────────────

export type Language = 'en' | 'ta';

export type UserRole =
  | 'SUPER_ADMIN'
  | 'ADMIN'
  | 'MANAGER'
  | 'RECEPTIONIST'
  | 'WAITER'
  | 'KITCHEN_STAFF'
  | 'HOUSEKEEPER'
  | 'DELIVERY_PARTNER'
  | 'CUSTOMER';

export type OrderStatus =
  | 'PENDING'
  | 'PLACED'
  | 'ACCEPTED'
  | 'CONFIRMED'
  | 'PREPARING'
  | 'READY'
  | 'ASSIGNED'
  | 'PICKED_UP'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'REFUNDED';

export type OrderType = 'DINE_IN' | 'TAKEAWAY' | 'HOME_DELIVERY' | 'ROOM_SERVICE';

export type PaymentStatus = 'PENDING' | 'PAID' | 'PARTIALLY_PAID' | 'REFUNDED' | 'FAILED';

export type PaymentMethod =
  | 'CASH'
  | 'UPI'
  | 'CARD'
  | 'RAZORPAY'
  | 'LOYALTY_POINTS'
  | 'COUPON'
  | 'MIXED';

export type RoomStatus =
  | 'AVAILABLE'
  | 'RESERVED'
  | 'OCCUPIED'
  | 'CLEANING'
  | 'INSPECTED'
  | 'MAINTENANCE'
  | 'BLOCKED';

export type BookingStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'CHECKED_IN'
  | 'CHECKED_OUT'
  | 'CANCELLED'
  | 'NO_SHOW';

export type DeliveryStatus =
  | 'PENDING'
  | 'ASSIGNED'
  | 'PICKED_UP'
  | 'EN_ROUTE'
  | 'DELIVERED'
  | 'FAILED'
  | 'CANCELLED';

export type VehicleType = 'BIKE' | 'BICYCLE' | 'CAR' | 'SCOOTER';

export type TableStatus = 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'CLEANING';

export type HousekeepingStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'SKIPPED';

export type NotificationType =
  | 'ORDER_UPDATE'
  | 'BOOKING_UPDATE'
  | 'PAYMENT_CONFIRMED'
  | 'PROMOTION'
  | 'SYSTEM';

// ─── Base Entity ──────────────────────────────────────────────────────────────

export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface SoftDeletable {
  deletedAt: string | null;
}

// ─── User / Auth ──────────────────────────────────────────────────────────────

export interface User extends BaseEntity, SoftDeletable {
  name: string;
  phone: string;
  email: string | null;
  avatarUrl: string | null;
  isVerified: boolean;
  isActive: boolean;
  preferredLanguage: Language;
  roles: UserRole[];
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface JwtPayload {
  userId: string;
  roles: UserRole[];
  branchId?: string;
  iat?: number;
  exp?: number;
}

export interface UserSession {
  user: User;
  tokens: AuthTokens;
}

// ─── Restaurant / Menu ────────────────────────────────────────────────────────

export interface MenuItemAddon extends BaseEntity {
  menuItemId: string;
  name: string;
  nameTa: string;
  price: number;
  isRequired: boolean;
  maxSelect: number;
  isActive: boolean;
}

export interface MenuItemReview {
  id: string;
  menuItemId: string;
  userId?: string | null;
  userName: string;
  rating: number;
  comment?: string | null;
  commentTa?: string | null;
  createdAt: string;
}

export interface MenuCategory extends BaseEntity {
  branchId?: string | null;
  name: string;
  nameTa: string;
  description: string | null;
  descriptionTa: string | null;
  imageUrl?: string | null;
  displayOrder: number;
  iconName?: string | null;
  isActive: boolean;
  itemCount?: number;
}

export interface MenuItem extends BaseEntity {
  categoryId: string;
  name: string;
  nameTa: string;
  description: string | null;
  descriptionTa: string | null;
  price: number;
  discountPercentage: number;
  imageUrl: string | null;
  isVeg?: boolean;
  isVegetarian: boolean;
  isVegan: boolean;
  isGlutenFree: boolean;
  isSpicy: boolean;
  isPopular?: boolean;
  isBestseller: boolean;
  isFeatured: boolean;
  isAvailable: boolean;
  preparationTimeMinutes: number;
  calories?: number | null;
  orderCount?: number;
  rating: number;
  reviewCount: number;
  ingredients: string[];
  allergens: string[];
  tags: string[];
  addons?: MenuItemAddon[];
  reviews?: MenuItemReview[];
}

export interface CreateCategoryInput {
  name: string;
  nameTa: string;
  description?: string;
  descriptionTa?: string;
  imageUrl?: string;
  displayOrder?: number;
  isActive?: boolean;
}

export interface UpdateCategoryInput extends Partial<CreateCategoryInput> {}

export interface CreateMenuItemInput {
  categoryId: string;
  name: string;
  nameTa: string;
  description?: string;
  descriptionTa?: string;
  price: number;
  discountPercentage?: number;
  imageUrl?: string;
  isVegetarian?: boolean;
  isVegan?: boolean;
  isGlutenFree?: boolean;
  isSpicy?: boolean;
  isBestseller?: boolean;
  isFeatured?: boolean;
  preparationTimeMinutes?: number;
  isAvailable?: boolean;
  displayOrder?: number;
  calories?: number;
  ingredients?: string[];
  allergens?: string[];
  tags?: string[];
}

export interface UpdateMenuItemInput extends Partial<CreateMenuItemInput> {}

export interface CreateAddonInput {
  menuItemId: string;
  name: string;
  nameTa: string;
  price: number;
  isRequired?: boolean;
  maxSelect?: number;
  isActive?: boolean;
}

export interface UpdateAddonInput extends Partial<CreateAddonInput> {}

export interface OrderItemAddonSnapshot {
  id: string;
  orderItemId: string;
  addonId: string;
  name: string;
  nameTa?: string;
  price: number;
}

export interface OrderItem {
  id: string;
  orderId?: string;
  menuItemId: string;
  name: string;
  nameTa?: string;
  price: number;
  quantity: number;
  subtotal: number;
  note?: string | null;
  notes?: string | null;
  item?: MenuItem;
  addons?: OrderItemAddonSnapshot[];
}

export interface OrderStatusHistory {
  id: string;
  orderId: string;
  status: OrderStatus;
  note: string | null;
  changedBy: string | null;
  createdAt: string;
}

export interface Order extends BaseEntity {
  orderNumber: string;
  branchId: string;
  customerId?: string | null;
  userId?: string | null;
  tableId?: string | null;
  tableSessionId?: string | null;
  waiterId?: string | null;
  deliveryAddressId?: string | null;
  roomId?: string | null;
  type: OrderType;
  status: OrderStatus;
  subtotal: number;
  taxAmount: number;
  deliveryFee: number;
  discountAmount: number;
  total: number;
  totalAmount?: number;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  notes?: string | null;
  estimatedDeliveryMinutes?: number | null;
  items: OrderItem[];
  statusHistory?: OrderStatusHistory[];
}

export interface PlaceOrderInput {
  type: OrderType;
  items: Array<{
    menuItemId: string;
    quantity: number;
    addons?: Array<{ addonId: string; quantity?: number }>;
    note?: string;
  }>;
  tableId?: string;
  tableSessionId?: string;
  deliveryAddressId?: string;
  deliveryAddress?: {
    line1: string;
    line2?: string;
    city: string;
    pincode: string;
  };
  roomId?: string;
  couponCode?: string;
  notes?: string;
  paymentMethod: PaymentMethod;
  idempotencyKey?: string;
}

// ─── Restaurant — Tables & Dine-in ──────────────────────────────────────────

export interface Table extends BaseEntity {
  branchId: string;
  tableNumber: string;
  floor: number;
  capacity: number;
  status: TableStatus;
  qrCode?: string | null;
  qrToken?: string | null;
  isAc?: boolean;
  isActive: boolean;
}

export type ServiceRequestType =
  | 'CALL_WAITER'
  | 'WATER'
  | 'ASSISTANCE'
  | 'BILL'
  | 'CUTLERY'
  | 'CLEAN_TABLE';

export interface TableServiceRequest {
  id: string;
  tableSessionId: string;
  tableId: string;
  tableNumber: string;
  type: ServiceRequestType;
  note?: string | null;
  status: 'PENDING' | 'ACKNOWLEDGED' | 'COMPLETED';
  createdAt: string;
  acknowledgedAt?: string | null;
}

export interface TableSession extends BaseEntity {
  tableId: string;
  tableNumber: string;
  branchId: string;
  sessionToken: string;
  openedAt: string;
  closedAt?: string | null;
  guestCount: number;
  hostUserId?: string | null;
  notes?: string | null;
  status: 'OPEN' | 'BILL_REQUESTED' | 'PAID' | 'CLOSED';
  orders: Order[];
  serviceRequests: TableServiceRequest[];
  subtotal: number;
  taxAmount: number;
  total: number;
}

export interface ScanQrPayload {
  qrToken: string;
  guestCount?: number;
}

// ─── Lodge / Rooms ────────────────────────────────────────────────────────────

export interface Amenity extends BaseEntity {
  name: string;
  nameTa: string;
  icon: string;
  category: 'ROOM' | 'BATHROOM' | 'MEDIA' | 'SERVICE';
  isPaid: boolean;
  price: number;
  isActive: boolean;
}

export interface RoomPhoto {
  id: string;
  roomTypeId: string;
  url: string;
  caption?: string | null | undefined;
  captionTa?: string | null | undefined;
  isPrimary: boolean;
  displayOrder: number;
  createdAt: string;
}

export interface RoomType extends BaseEntity {
  branchId?: string | undefined;
  name?: string | undefined;
  title?: string | undefined;
  nameTa?: string | undefined;
  titleTa?: string | undefined;
  description?: string | null | undefined;
  descriptionTa?: string | null | undefined;
  basePrice: number;
  weekendPrice?: number | null | undefined;
  maxOccupancy: number;
  bedType?: string | undefined;
  isAc?: boolean | undefined;
  sizeSqFt?: number | null | undefined;
  roomSizeSqft?: number | null | undefined;
  totalRooms?: number | undefined;
  imageUrls?: string[] | undefined;
  images?: string[] | undefined;
  amenities: string[];
  amenitiesTa?: string[] | undefined;
  photos?: RoomPhoto[] | undefined;
  isActive?: boolean | undefined;
  displayOrder?: number | undefined;
}

export interface RoomMaintenance {
  id: string;
  roomId: string;
  type: string; // 'PLUMBING' | 'ELECTRICAL' | 'AC' | 'CARPENTRY' | 'GENERAL'
  issue: string;
  issueTa?: string | null | undefined;
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  status: 'REPORTED' | 'IN_PROGRESS' | 'RESOLVED' | 'CANCELLED';
  cost?: number | null | undefined;
  reportedBy?: string | null | undefined;
  assignedTo?: string | null | undefined;
  notes?: string | null | undefined;
  startedAt?: string | null | undefined;
  resolvedAt?: string | null | undefined;
  createdAt: string;
  updatedAt: string;
  room?: Room | undefined;
}

export interface Room extends BaseEntity {
  branchId?: string | undefined;
  roomTypeId?: string | undefined;
  typeId?: string | undefined;
  roomNumber: string;
  floor: number;
  status: RoomStatus;
  currentBookingId?: string | null | undefined;
  notes?: string | null | undefined;
  lastCleanedAt?: string | null | undefined;
  lastInspectedAt?: string | null | undefined;
  isActive?: boolean | undefined;
  type?: RoomType | undefined;
  currentBooking?: Booking | undefined;
  maintenanceLogs?: RoomMaintenance[] | undefined;
}

export interface BookingExtra {
  name: string;
  nameTa: string;
  price: number;
}

export interface BookingGuest {
  id: string;
  bookingId: string;
  name: string;
  phone?: string | null;
  idType?: string | null;    // Aadhaar | PAN | Passport
  idNumber?: string | null;
  isPrimary: boolean;
  createdAt: string;
}

export interface BookingStatusHistoryEntry {
  id: string;
  bookingId: string;
  status: BookingStatus;
  note?: string | null;
  changedBy?: string | null;
  createdAt: string;
}

export interface Booking extends BaseEntity {
  bookingNumber: string;
  userId: string;
  roomId: string;
  checkIn: string;           // ISO date YYYY-MM-DD
  checkOut: string;
  status: BookingStatus;
  adultsCount: number;
  childrenCount: number;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  advancePaid: number;
  paymentStatus: PaymentStatus;
  paymentMethod?: PaymentMethod | null;
  couponId?: string | null;
  specialRequests?: string | null;
  extras: BookingExtra[];
  checkedInAt?: string | null;
  checkedOutAt?: string | null;
  cancellationReason?: string | null;
  modifiedBy?: string | null;
  user?: { id: string; name: string; phone: string; email?: string | null | undefined } | undefined;
  room?: (Room & { type?: RoomType | undefined }) | undefined;
  guests?: BookingGuest[] | undefined;
  statusHistory?: BookingStatusHistoryEntry[] | undefined;
}

export interface CreateBookingInput {
  roomTypeId: string;
  checkIn: string;           // YYYY-MM-DD
  checkOut: string;
  adultsCount: number;
  childrenCount?: number;
  guests: Array<{
    name: string;
    phone?: string;
    idType?: string;
    idNumber?: string;
    isPrimary: boolean;
  }>;
  extras?: BookingExtra[];
  couponCode?: string;
  specialRequests?: string;
  paymentMethod: PaymentMethod;
}

export interface BookingAvailabilityResult {
  roomTypeId: string;
  roomTypeName: string;
  roomTypeNameTa: string;
  available: boolean;
  availableRoomsCount: number;
  nights: number;
  pricePerNight: number;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  isWeekend: boolean;
}

export interface TodayArrivalDeparture {
  arrivals: Booking[];
  departures: Booking[];
  inHouseCount: number;
  expectedArrivals: number;
  expectedDepartures: number;
}

export interface AssignRoomInput {
  bookingId: string;
  roomId: string;
}

export interface RoomChangeInput {
  bookingId: string;
  newRoomId: string;
  reason?: string;
}

export interface BookingModificationInput {
  checkIn?: string;
  checkOut?: string;
  adultsCount?: number;
  childrenCount?: number;
  specialRequests?: string;
}

export interface BookingReminder {
  id: string;
  bookingId: string;
  type: 'CHECKIN_24H' | 'CHECKIN_2H' | 'CHECKOUT_1H';
  channel: 'SMS' | 'WHATSAPP' | 'NOTIFICATION' | 'EMAIL';
  subject: string;
  subjectTa: string;
  body: string;
  bodyTa: string;
  sentAt?: string;
  status: 'PENDING' | 'SENT' | 'FAILED';
}

export interface ApplyCouponResult {
  valid: boolean;
  code: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  discountAmount: number;
  newSubtotal: number;
  message?: string;
  messageTa?: string;
}

export interface BookingCancellationResult {
  bookingId: string;
  bookingNumber: string;
  refundAmount: number;
  cancellationCharge: number;
  reason: string;
}

// ─── Offers & Coupons ─────────────────────────────────────────────────────────

export interface OfferCoupon extends BaseEntity {
  code: string;
  title: string;
  titleTa: string;
  description: string | null;
  descriptionTa: string | null;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  maxDiscount?: number | null;
  minOrderAmount?: number;
  minOrderValue?: number;
  validUntil?: string;
}

// ─── Loyalty ──────────────────────────────────────────────────────────────────

export interface LoyaltyAccount extends BaseEntity {
  userId: string;
  points: number;
  tier: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';
  totalEarned: number;
  totalRedeemed: number;
}

// ─── Customer Home Feed ────────────────────────────────────────────────────────

export interface PromotionalBanner {
  id: string;
  title: string;
  titleTa: string;
  subtitle: string;
  subtitleTa: string;
  imageUrl: string;
  badgeText: string;
  badgeTextTa: string;
  actionUrl?: string;
  code?: string;
}

export interface QuickActionItem {
  id: string;
  title: string;
  titleTa: string;
  iconName: string;
  route: string;
  badge?: string;
}

export interface HomeFeedData {
  greeting: {
    userName: string;
    branchName: string;
    branchNameTa: string;
  };
  loyalty: {
    points: number;
    tier: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';
    rupeeEquivalent: number;
  };
  activeOrder?: {
    id: string;
    orderNumber: string;
    status: OrderStatus;
    type: OrderType;
    estimatedMinutes: number;
    itemsCount: number;
    totalAmount: number;
    tableNumber?: string;
  };
  activeBooking?: {
    id: string;
    bookingNumber: string;
    roomTypeTitle: string;
    roomTypeTitleTa: string;
    roomNumber?: string;
    status: BookingStatus;
    checkInDate: string;
    checkOutDate: string;
  };
  banners: PromotionalBanner[];
  quickActions: QuickActionItem[];
  popularFoods: MenuItem[];
  recommendedFoods: MenuItem[];
  featuredRooms: RoomType[];
  offers: OfferCoupon[];
}

// ─── Notifications ────────────────────────────────────────────────────────────

export interface Notification extends BaseEntity {
  userId: string;
  type: NotificationType;
  title: string;
  titleTa: string;
  body: string;
  bodyTa: string;
  isRead: boolean;
  data: Record<string, string>;
}

// ─── API Response Wrappers ────────────────────────────────────────────────────

export interface ApiSuccess<T> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

export interface PaginatedData<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
  search?: string;
}

// ─── WebSocket Events ─────────────────────────────────────────────────────────

export type WsEventType =
  | 'ORDER_STATUS_CHANGED'
  | 'NEW_ORDER'
  | 'TABLE_STATUS_CHANGED'
  | 'KITCHEN_UPDATE'
  | 'DELIVERY_LOCATION_UPDATE'
  | 'DELIVERY_STATUS_CHANGED'
  | 'HOUSEKEEPING_TASK_UPDATED'
  | 'NOTIFICATION';

export interface WsMessage<T = unknown> {
  event: WsEventType;
  data: T;
  timestamp: string;
}

// ─── Phase 7: Kitchen Display System (KDS) & Waiter Types ───────────────────

export type KitchenOrderStatus =
  | 'PLACED'
  | 'ACCEPTED'
  | 'PREPARING'
  | 'READY'
  | 'SERVED'
  | 'CANCELLED';

export interface KitchenOrderItem {
  id: string;
  menuItemId: string;
  name: string;
  nameTa: string;
  quantity: number;
  note?: string | null;
  status: 'PENDING' | 'PREPARING' | 'READY' | 'SERVED' | 'CANCELLED';
  addons?: Array<{
    addonId?: string;
    name: string;
    nameTa?: string;
    price?: number;
  }>;
}

export interface KitchenOrder {
  id: string;
  orderNumber: string;
  type: OrderType;
  status: KitchenOrderStatus;
  tableNumber?: string | null;
  tableId?: string | null;
  roomId?: string | null;
  guestName?: string | null;
  notes?: string | null;
  createdAt: string;
  acceptedAt?: string | null;
  readyAt?: string | null;
  elapsedMinutes: number;
  estimatedPrepMinutes: number;
  priority: 'NORMAL' | 'RUSH' | 'VIP';
  items: KitchenOrderItem[];
  itemCount: number;
}

export interface KitchenStats {
  totalActive: number;
  newCount: number;
  preparingCount: number;
  readyCount: number;
  avgPrepMinutes: number;
  delayedCount: number;
}

export interface WaiterTableSummary {
  id: string;
  tableNumber: string;
  floor: number;
  capacity: number;
  status: TableStatus;
  isAc: boolean;
  qrToken?: string | null;
  activeSessionId?: string | null;
  guestCount?: number;
  openedAt?: string | null;
  sessionDurationMinutes?: number;
  activeOrdersCount?: number;
  totalAmount?: number;
  pendingRequests: TableServiceRequest[];
  hasPendingCall: boolean;
  hasBillRequest: boolean;
  assignedWaiterId?: string | null;
  assignedWaiterName?: string | null;
}

export interface WaiterOrderSummary {
  id: string;
  orderNumber: string;
  type: OrderType;
  status: OrderStatus;
  tableNumber?: string | null;
  roomId?: string | null;
  items: Array<{
    id: string;
    name: string;
    nameTa: string;
    quantity: number;
    status: string;
    note?: string | null;
  }>;
  readyAt?: string | null;
  createdAt: string;
  isReadyForPickup: boolean;
}

export interface AuditLogEntry {
  id?: string | undefined;
  actorId?: string | null | undefined;
  actorName?: string | null | undefined;
  actorRole?: UserRole | string | null | undefined;
  action: string;
  resource: string;
  resourceId?: string | null | undefined;
  before?: Record<string, unknown> | null | undefined;
  after?: Record<string, unknown> | null | undefined;
  ipAddress?: string | null | undefined;
  userAgent?: string | null | undefined;
  createdAt?: string | undefined;
}

export interface Address extends BaseEntity, SoftDeletable {
  userId: string;
  label: string;
  line1: string;
  line2?: string | null | undefined;
  city: string;
  state: string;
  pincode: string;
  lat?: number | null | undefined;
  lng?: number | null | undefined;
  isDefault: boolean;
}

// ─── Phase 8: Home Delivery ──────────────────────────────────────────────────

export interface DeliveryZone extends BaseEntity {
  branchId: string;
  name: string;
  nameTa: string;
  baseFee: number;
  minOrderAmount: number;
  freeDeliveryThreshold: number;
  estimatedDeliveryMinutes: number;
  radiusKm: number;
  pincodes: string[];
  isActive: boolean;
}

export interface DeliveryPartner extends BaseEntity {
  userId: string;
  name?: string | null | undefined;
  phone?: string | null | undefined;
  vehicleType: VehicleType;
  vehicleNumber?: string | null | undefined;
  isOnline: boolean;
  isVerified: boolean;
  currentLat?: number | null | undefined;
  currentLng?: number | null | undefined;
  rating: number;
  totalDeliveries: number;
  activeDeliveryId?: string | null | undefined;
  user?: User | undefined;
}

export interface DeliveryStatusHistory {
  id: string;
  deliveryId: string;
  status: DeliveryStatus;
  lat?: number | null | undefined;
  lng?: number | null | undefined;
  note?: string | null | undefined;
  createdAt: string;
}

export interface DeliveryRecord extends BaseEntity {
  orderId: string;
  partnerId?: string | null | undefined;
  deliveryAddressId?: string | null | undefined;
  zoneId?: string | null | undefined;
  status: DeliveryStatus;
  estimatedDeliveryAt?: string | null | undefined;
  actualDeliveryAt?: string | null | undefined;
  distanceKm?: number | null | undefined;
  deliveryFee: number;
  assignedAt?: string | null | undefined;
  pickedUpAt?: string | null | undefined;
  otp?: string | null | undefined;
  cancellationReason?: string | null | undefined;
  order?: Order | undefined;
  partner?: DeliveryPartner | undefined;
  deliveryAddress?: Address | undefined;
  zone?: DeliveryZone | undefined;
  statusHistory?: DeliveryStatusHistory[] | undefined;
}

export interface DeliveryFeeEstimate {
  zoneId?: string | null | undefined;
  zoneName?: string | null | undefined;
  zoneNameTa?: string | null | undefined;
  deliveryFee: number;
  baseFee: number;
  minOrderAmount: number;
  freeDeliveryThreshold: number;
  isFreeDelivery: boolean;
  amountNeededForFreeDelivery: number;
  estimatedDeliveryMinutes: number;
  isDeliverable: boolean;
  rejectionReason?: string | null | undefined;
}

export interface DeliveryTrackingInfo {
  orderId: string;
  orderNumber: string;
  status: OrderStatus;
  deliveryStatus: DeliveryStatus;
  estimatedDeliveryAt?: string | null | undefined;
  estimatedDeliveryMinutes: number;
  elapsedMinutes: number;
  deliveryFee: number;
  otp?: string | null | undefined;
  partner?: {
    id: string;
    name: string;
    phoneMasked: string;
    phone?: string | null | undefined;
    vehicleType: VehicleType;
    vehicleNumber?: string | null | undefined;
    rating: number;
    currentLat?: number | null | undefined;
    currentLng?: number | null | undefined;
  } | null | undefined;
  deliveryAddress?: {
    label?: string | null | undefined;
    line1: string;
    line2?: string | null | undefined;
    city: string;
    pincode: string;
  } | null | undefined;
  timeline: Array<{
    step: 'PLACED' | 'ACCEPTED' | 'PREPARING' | 'READY' | 'ASSIGNED' | 'PICKED_UP' | 'EN_ROUTE' | 'DELIVERED';
    title: string;
    titleTa: string;
    description?: string | null | undefined;
    timestamp?: string | null | undefined;
    isCompleted: boolean;
    isCurrent: boolean;
  }>;
  cancellationAllowed: boolean;
  cancellationReason?: string | null | undefined;
}

// ─── Phase 9: Delivery Partner & mapcn.dev Map Layer ─────────────────────────

export interface MapCoordinate {
  lat: number;
  lng: number;
}

export interface MapWaypoint {
  coordinate: MapCoordinate;
  label: string;
  type: 'RESTAURANT' | 'CUSTOMER' | 'DRIVER';
}

export interface DriverActiveTask {
  deliveryId: string;
  orderId: string;
  orderNumber: string;
  status: DeliveryStatus;
  orderStatus: OrderStatus;
  stage: 'NAVIGATING_TO_RESTAURANT' | 'WAITING_FOR_KITCHEN' | 'PICKED_UP_ON_WAY' | 'ARRIVED_AT_CUSTOMER' | 'COMPLETED';
  restaurant: {
    name: string;
    address: string;
    phone: string;
    coordinate: MapCoordinate;
  };
  customer: {
    nameMasked: string;
    phoneMasked: string;
    phone?: string | null | undefined;
    address: {
      label?: string | null | undefined;
      line1: string;
      line2?: string | null | undefined;
      city: string;
      pincode: string;
    };
    coordinate: MapCoordinate;
  };
  driverLocation: MapCoordinate;
  routeCoordinates: MapCoordinate[];
  distanceKm: number;
  estimatedDeliveryMinutes: number;
  payoutAmount: number;
  itemsSummary: string;
  itemCount: number;
  totalOrderAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  specialInstructions?: string | null | undefined;
  assignedAt: string;
  pickedUpAt?: string | null | undefined;
}

export interface PartnerAvailableDelivery {
  deliveryId: string;
  orderId: string;
  orderNumber: string;
  zoneName: string;
  zoneNameTa: string;
  distanceKm: number;
  payoutAmount: number;
  itemCount: number;
  itemsSummary: string;
  restaurantDistanceKm: number;
  customerDistanceKm: number;
  estimatedMinutes: number;
  createdAt: string;
}

export interface PartnerEarningsSummary {
  todayEarnings: number;
  tripsCount: number;
  onlineHours: number;
  basePay: number;
  tips: number;
  distanceIncentives: number;
  weeklyTotal: number;
  recentDeliveries: Array<{
    id: string;
    orderNumber: string;
    deliveredAt: string;
    payout: number;
    tip: number;
    distanceKm: number;
    customerRating?: number | null | undefined;
  }>;
}

// ─── Phase 10: Lodge Management System ───────────────────────────────────────

export interface LodgePolicy extends BaseEntity {
  branchId: string;
  checkInTime: string;
  checkOutTime: string;
  cancellationPolicy: string;
  cancellationPolicyTa: string;
  childPolicy: string;
  childPolicyTa: string;
  idProofRequired: boolean;
  smokingAllowed: boolean;
  petsAllowed: boolean;
}

export interface RoomAvailabilitySearch {
  checkInDate: string;
  checkOutDate: string;
  guests: number;
  roomTypeId?: string | undefined;
  amenities?: string[] | undefined;
  maxPrice?: number | undefined;
}

export interface FrontDeskRackSummary {
  totalRooms: number;
  available: number;
  reserved: number;
  occupied: number;
  cleaning: number;
  inspected: number;
  maintenance: number;
  blocked: number;
  occupancyRate: number;
  floors: Array<{
    floorNumber: number;
    floorName: string;
    rooms: Room[];
  }>;
}
