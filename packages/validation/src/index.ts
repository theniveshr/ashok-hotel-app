/**
 * @ashok-raj/validation
 * Shared Zod schemas for API validation and form validation in mobile/admin.
 * Import these in both Fastify (server-side) and React Native / Next.js (client-side).
 */
import { z } from 'zod';

// ─── Common ───────────────────────────────────────────────────────────────────

export const PaginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().optional(),
});

export const IdParamSchema = z.object({
  id: z.string().min(1, 'Invalid ID format'),
});

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const PhoneSchema = z
  .string()
  .trim()
  .transform((val) => {
    let clean = val.replace(/[\s\-\(\)]/g, '');
    if (clean.startsWith('+91')) {
      clean = clean.slice(3);
    } else if (clean.startsWith('91') && clean.length === 12) {
      clean = clean.slice(2);
    } else if (clean.startsWith('0') && clean.length === 11) {
      clean = clean.slice(1);
    }
    return clean;
  })
  .refine((val) => /^[6-9]\d{9}$/.test(val), {
    message: 'Enter a valid 10-digit Indian mobile number',
  });

export const OtpSchema = z
  .string()
  .trim()
  .length(6, 'OTP must be 6 digits')
  .regex(/^\d+$/, 'OTP must contain only digits');

export const SendOtpSchema = z.object({
  phone: PhoneSchema,
});

export const VerifyOtpSchema = z.object({
  phone: PhoneSchema,
  otp: OtpSchema,
});

export const RegisterSchema = z.object({
  phone: PhoneSchema,
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().trim().email('Invalid email address').optional(),
  password: z.string().min(6, 'Password must be at least 6 characters').max(100).optional(),
  otp: OtpSchema.optional(),
  preferredLanguage: z.enum(['en', 'ta']).default('en'),
});

export const RefreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export const PasswordLoginSchema = z
  .object({
    phone: z.string().trim().optional(),
    email: z.string().trim().email('Invalid email address').optional(),
    identifier: z.string().trim().min(3, 'Enter mobile number or email').optional(),
    password: z.string().min(6, 'Password must be at least 6 characters').max(100),
  })
  .refine((data) => Boolean(data.identifier || data.phone || data.email), {
    message: 'Please provide your registered phone number or email',
    path: ['identifier'],
  });

export const ResetPasswordSchema = z.object({
  phone: PhoneSchema,
  otp: OtpSchema,
  newPassword: z.string().min(6, 'New password must be at least 6 characters').max(100),
});

export const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters').max(100),
});

// ─── User & Address ───────────────────────────────────────────────────────────

export const UpdateProfileSchema = z.object({
  name: z.string().trim().min(2).max(100).optional(),
  email: z.string().trim().email().optional().nullable(),
  preferredLanguage: z.enum(['en', 'ta']).optional(),
});

export const AddressSchema = z.object({
  label: z.string().trim().min(1).max(50),
  line1: z.string().trim().min(2).max(200),
  line2: z.string().trim().max(200).optional().nullable(),
  recipientName: z.string().trim().max(100).optional().nullable(),
  recipientPhone: z.string().trim().max(15).optional().nullable(),
  houseNumber: z.string().trim().max(100).optional().nullable(),
  buildingName: z.string().trim().max(100).optional().nullable(),
  streetName: z.string().trim().max(150).optional().nullable(),
  area: z.string().trim().max(100).optional().nullable(),
  landmark: z.string().trim().max(150).optional().nullable(),
  country: z.string().trim().max(50).default('India').optional(),
  formattedAddress: z.string().trim().optional().nullable(),
  deliveryInstructions: z.string().trim().optional().nullable(),
  city: z.string().trim().min(1).max(100),
  state: z.string().trim().min(1).max(100),
  pincode: z
    .string()
    .trim()
    .regex(/^\d{6}$/, 'Enter a valid 6-digit pincode'),
  lat: z.number().optional().nullable(),
  lng: z.number().optional().nullable(),
  isDefault: z.boolean().default(false),
});

export const CreateAddressSchema = AddressSchema;
export const UpdateAddressSchema = AddressSchema.partial();
export type CreateAddressInput = z.infer<typeof CreateAddressSchema>;
export type UpdateAddressInput = z.infer<typeof UpdateAddressSchema>;

export const UpdateTourStatusSchema = z.object({
  status: z.enum(['not_started', 'completed', 'skipped']),
  lastCompletedStep: z.number().int().min(1).max(6).optional(),
});
export type UpdateTourStatusInput = z.infer<typeof UpdateTourStatusSchema>;

// ─── Restaurant Menu (Category & Items) ───────────────────────────────────────

export const CreateCategorySchema = z.object({
  branchId: z.string().optional(),
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
  nameTa: z.string().trim().min(2, 'Tamil name is required').max(100),
  description: z.string().trim().max(500).optional(),
  descriptionTa: z.string().trim().max(500).optional(),
  imageUrl: z.string().url().optional().or(z.literal('')),
  displayOrder: z.coerce.number().int().default(0),
  isActive: z.boolean().default(true),
});

export const UpdateCategorySchema = CreateCategorySchema.partial();

export const CreateMenuItemSchema = z.object({
  categoryId: z.string().min(1, 'Category is required'),
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(150),
  nameTa: z.string().trim().min(2, 'Tamil name is required').max(150),
  description: z.string().trim().max(1000).optional(),
  descriptionTa: z.string().trim().max(1000).optional(),
  price: z.coerce.number().positive('Price must be greater than 0'),
  discountPercentage: z.coerce.number().min(0).max(99).default(0),
  imageUrl: z.string().url().optional().or(z.literal('')),
  isVegetarian: z.boolean().default(false),
  isVegan: z.boolean().default(false),
  isGlutenFree: z.boolean().default(false),
  isSpicy: z.boolean().default(false),
  isBestseller: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
  preparationTimeMinutes: z.coerce.number().int().min(1).default(20),
  isAvailable: z.boolean().default(true),
  displayOrder: z.coerce.number().int().default(0),
  calories: z.coerce.number().int().optional(),
  ingredients: z.array(z.string()).default([]),
  allergens: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
});

export const UpdateMenuItemSchema = CreateMenuItemSchema.partial();

export const CreateAddonSchema = z.object({
  menuItemId: z.string().min(1),
  name: z.string().trim().min(2).max(100),
  nameTa: z.string().trim().min(2).max(100),
  price: z.coerce.number().min(0),
  isRequired: z.boolean().default(false),
  maxSelect: z.coerce.number().int().min(1).default(1),
  isActive: z.boolean().default(true),
});

export const UpdateAddonSchema = CreateAddonSchema.partial();

// ─── Restaurant / Order ───────────────────────────────────────────────────────

export const CartItemSchema = z.object({
  menuItemId: z.string().min(1, 'Item ID is required'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1').max(20, 'Maximum 20 per item'),
  addons: z
    .array(
      z.object({
        addonId: z.string().min(1),
        quantity: z.number().int().min(1).default(1),
      })
    )
    .optional()
    .default([]),
  note: z.string().trim().max(200).optional(),
});

export const PlaceOrderSchema = z.object({
  type: z.enum(['DINE_IN', 'TAKEAWAY', 'HOME_DELIVERY', 'ROOM_SERVICE']).default('HOME_DELIVERY'),
  items: z.array(CartItemSchema).min(1, 'At least one item is required'),
  tableId: z.string().optional(),
  tableSessionId: z.string().optional(),
  deliveryAddressId: z.string().optional(),
  deliveryAddress: z
    .object({
      line1: z.string().min(1),
      line2: z.string().optional(),
      city: z.string().default('Kalaiyarkoil'),
      pincode: z.string().default('630551'),
    })
    .optional(),
  roomId: z.string().optional(),
  couponCode: z.string().trim().toUpperCase().optional(),
  notes: z.string().trim().max(500).optional(),
  scheduledAt: z.string().optional(),
  paymentMethod: z
    .enum(['CASH', 'UPI', 'CARD', 'RAZORPAY', 'LOYALTY_POINTS', 'COUPON', 'MIXED'])
    .default('RAZORPAY'),
  idempotencyKey: z.string().optional(),
});

// ─── Dine-in & QR ─────────────────────────────────────────────────────────────

export const ScanTableQrSchema = z.object({
  qrToken: z.string().min(1, 'QR token is required'),
  guestCount: z.number().int().min(1).max(20).default(2),
});

export const CreateTableReservationSchema = z.object({
  guestCount: z.coerce.number().int().min(1, 'At least 1 guest required').max(20, 'Maximum 20 guests per reservation').default(2),
  reservationDate: z.string().min(1, 'Date is required'),
  timeSlot: z.string().min(1, 'Time slot is required'),
  seatingArea: z.enum(['AC_HALL', 'MAIN_HALL', 'FAMILY_SECTION', 'ROOFTOP']).default('AC_HALL'),
  guestName: z.string().trim().min(2, 'Guest name must be at least 2 characters'),
  guestPhone: z.string().regex(/^[6-9]\d{9}$/, 'Must be a valid 10-digit Indian mobile number'),
  specialRequests: z.string().trim().max(300).optional(),
});

export const TableServiceRequestSchema = z.object({
  type: z.enum(['CALL_WAITER', 'WATER', 'ASSISTANCE', 'BILL', 'CUTLERY', 'CLEAN_TABLE']),
  note: z.string().trim().max(200).optional(),
});


// ─── Payment ──────────────────────────────────────────────────────────────────

export const InitiatePaymentSchema = z.object({
  referenceId: z.string().min(1),
  referenceType: z.enum(['ORDER', 'BOOKING']),
  method: z.enum(['CASH', 'UPI', 'CARD', 'RAZORPAY', 'LOYALTY_POINTS', 'COUPON', 'MIXED']),
  amount: z.number().positive(),
});

export const RazorpayWebhookSchema = z.object({
  event: z.string(),
  payload: z.object({
    payment: z
      .object({
        entity: z.object({
          id: z.string(),
          order_id: z.string().optional(),
          amount: z.number(),
          status: z.string(),
          notes: z.record(z.string()).optional(),
        }),
      })
      .optional(),
  }),
});

// ─── Review ───────────────────────────────────────────────────────────────────

export const CreateReviewSchema = z.object({
  referenceId: z.string().min(1),
  referenceType: z.enum(['ORDER', 'BOOKING', 'MENU_ITEM', 'ROOM_TYPE']),
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().max(1000).optional(),
});

// ─── Phase 7: Kitchen & Waiter Operations ──────────────────────────────────────

export const KitchenStatusUpdateSchema = z.object({
  status: z.enum(['ACCEPTED', 'PREPARING', 'READY', 'CANCELLED']),
  note: z.string().trim().max(300).optional(),
});

export const KitchenItemStatusUpdateSchema = z.object({
  status: z.enum(['PENDING', 'PREPARING', 'READY', 'SERVED', 'CANCELLED']),
});

export const WaiterServiceResolveSchema = z.object({
  status: z.enum(['ACKNOWLEDGED', 'COMPLETED', 'CANCELLED']),
  note: z.string().trim().max(300).optional(),
});

export const WaiterTableOrderSchema = z.object({
  tableId: z.string().min(1, 'Table ID is required'),
  sessionId: z.string().optional(),
  items: z.array(CartItemSchema).min(1, 'At least one item is required'),
  notes: z.string().trim().max(500).optional(),
});

export const TableBillActionSchema = z.object({
  tableId: z.string().min(1, 'Table ID is required'),
  sessionId: z.string().optional(),
  discountAmount: z.coerce.number().min(0).default(0),
  discountReason: z.string().optional(),
  paymentMethod: z
    .enum(['CASH', 'UPI', 'CARD', 'RAZORPAY', 'LOYALTY_POINTS', 'COUPON', 'MIXED'])
    .default('CASH'),
});

// ─── Phase 8: Home Delivery ──────────────────────────────────────────────────

export const CreateDeliveryZoneSchema = z.object({
  branchId: z.string().optional(),
  name: z.string().trim().min(2, 'Zone name is required').max(100),
  nameTa: z.string().trim().min(2, 'Tamil zone name is required').max(100),
  baseFee: z.coerce.number().min(0).default(30),
  minOrderAmount: z.coerce.number().min(0).default(100),
  freeDeliveryThreshold: z.coerce.number().min(0).default(300),
  estimatedDeliveryMinutes: z.coerce.number().int().min(5).default(30),
  radiusKm: z.coerce.number().min(0.5).default(5),
  pincodes: z.array(z.string()).default([]),
  isActive: z.boolean().default(true),
});

export const UpdateDeliveryZoneSchema = CreateDeliveryZoneSchema.partial();

export const EstimateDeliveryFeeSchema = z.object({
  subtotal: z.coerce.number().min(0),
  pincode: z.string().optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
  addressId: z.string().optional(),
});

export const AssignDeliveryPartnerSchema = z.object({
  orderId: z.string().min(1, 'Order ID is required'),
  partnerId: z.string().optional(), // If omitted, triggers auto-assignment
  notes: z.string().trim().max(300).optional(),
});

export const UpdateDeliveryStatusSchema = z.object({
  status: z.enum(['ASSIGNED', 'PICKED_UP', 'EN_ROUTE', 'DELIVERED', 'FAILED', 'CANCELLED']),
  note: z.string().trim().max(300).optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
  otp: z.string().length(6).optional(),
});

export const VerifyDeliveryOtpSchema = z.object({
  otp: z.string().trim().length(6, 'OTP must be 6 digits'),
  lat: z.number().optional(),
  lng: z.number().optional(),
  note: z.string().trim().max(300).optional(),
});

export const UpdatePartnerLocationSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  isOnline: z.boolean().optional(),
});

export const CancelDeliveryOrderSchema = z.object({
  reason: z.string().trim().min(3, 'Cancellation reason is required').max(300),
});

export const DriverLoginSchema = z.object({
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Must be a valid 10-digit Indian mobile number'),
  pin: z.string().min(4).max(6).optional(),
});

export const DriverStatusToggleSchema = z.object({
  isOnline: z.boolean(),
  lat: z.number().min(-90).max(90).optional(),
  lng: z.number().min(-180).max(180).optional(),
});

export const DriverTaskRejectSchema = z.object({
  reason: z.string().trim().min(2, 'Rejection reason is required').max(200),
});

// ─── Phase 10: Lodge Validation Schemas ──────────────────────────────────────

export const CreateRoomTypeSchema = z.object({
  name: z.string().trim().min(2, 'Room type name is required').max(100),
  nameTa: z.string().trim().min(2, 'Tamil room type name is required').max(100),
  description: z.string().trim().min(10, 'Description must be at least 10 characters'),
  descriptionTa: z.string().trim().min(10, 'Tamil description is required'),
  basePrice: z.number().positive('Base price must be greater than 0'),
  weekendPrice: z.number().positive().optional(),
  maxOccupancy: z.number().int().min(1).max(10).default(2),
  bedType: z.string().trim().min(2).max(50),
  sizeSqFt: z.number().int().positive().optional(),
  imageUrls: z.array(z.string().url()).optional().default([]),
  amenities: z.array(z.string()).optional().default([]),
  amenitiesTa: z.array(z.string()).optional().default([]),
  isActive: z.boolean().optional().default(true),
  displayOrder: z.number().int().optional().default(0),
});

export const UpdateRoomTypeSchema = CreateRoomTypeSchema.partial();

export const CreateRoomSchema = z.object({
  roomNumber: z.string().trim().min(1, 'Room number is required').max(10),
  floor: z.number().int().min(0).max(20).default(1),
  typeId: z.string().uuid('Valid room type ID is required'),
  status: z
    .enum(['AVAILABLE', 'RESERVED', 'OCCUPIED', 'CLEANING', 'INSPECTED', 'MAINTENANCE', 'BLOCKED'])
    .default('AVAILABLE'),
  notes: z.string().trim().max(500).optional(),
  isActive: z.boolean().optional().default(true),
});

export const UpdateRoomSchema = CreateRoomSchema.partial();

export const UpdateRoomStatusSchema = z.object({
  status: z.enum([
    'AVAILABLE',
    'RESERVED',
    'OCCUPIED',
    'CLEANING',
    'INSPECTED',
    'MAINTENANCE',
    'BLOCKED',
  ]),
  notes: z.string().trim().max(500).optional(),
  assignedStaff: z.string().optional(),
});

export const CreateAmenitySchema = z.object({
  name: z.string().trim().min(2).max(100),
  nameTa: z.string().trim().min(2).max(100),
  icon: z.string().trim().min(1).max(50),
  category: z.enum(['ROOM', 'BATHROOM', 'MEDIA', 'SERVICE']).default('ROOM'),
  isPaid: z.boolean().optional().default(false),
  price: z.number().min(0).optional().default(0),
  isActive: z.boolean().optional().default(true),
});

export const CreateMaintenanceSchema = z.object({
  roomId: z.string().min(1, 'Room ID is required'),
  type: z.enum(['PLUMBING', 'ELECTRICAL', 'AC', 'CARPENTRY', 'GENERAL']).default('GENERAL'),
  issue: z.string().trim().min(3, 'Issue description is required').max(500),
  issueTa: z.string().trim().max(500).optional(),
  priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']).default('NORMAL'),
  assignedTo: z.string().optional(),
  notes: z.string().trim().max(500).optional(),
  cost: z.number().min(0).optional(),
});

export const UpdateMaintenanceSchema = z.object({
  status: z.enum(['REPORTED', 'IN_PROGRESS', 'RESOLVED', 'CANCELLED']),
  notes: z.string().trim().max(500).optional(),
  cost: z.number().min(0).optional(),
  assignedTo: z.string().optional(),
});

export const SearchRoomsSchema = z.object({
  checkInDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format YYYY-MM-DD required'),
  checkOutDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format YYYY-MM-DD required'),
  guests: z.coerce.number().int().min(1).max(20).default(1),
  roomTypeId: z.string().optional(),
  amenities: z.array(z.string()).optional(),
  maxPrice: z.coerce.number().positive().optional(),
});

export const UpdateLodgePolicySchema = z.object({
  checkInTime: z.string().regex(/^\d{2}:\d{2}$/, 'HH:mm format required'),
  checkOutTime: z.string().regex(/^\d{2}:\d{2}$/, 'HH:mm format required'),
  cancellationPolicy: z.string().trim().min(10),
  cancellationPolicyTa: z.string().trim().min(10),
  childPolicy: z.string().trim().min(10),
  childPolicyTa: z.string().trim().min(10),
  idProofRequired: z.boolean(),
  smokingAllowed: z.boolean(),
  petsAllowed: z.boolean(),
});

export const AddRoomPhotoSchema = z.object({
  roomTypeId: z.string().min(1),
  url: z.string().url('Valid photo URL required'),
  caption: z.string().trim().max(100).optional(),
  captionTa: z.string().trim().max(100).optional(),
  isPrimary: z.boolean().optional().default(false),
  displayOrder: z.number().int().optional().default(0),
});

// ─── Phase 11: Lodge Booking ───────────────────────────────────────────────────

const BookingExtraSchema = z.object({
  name: z.string().trim().min(1).max(100),
  nameTa: z.string().trim().min(1).max(100),
  price: z.number().min(0),
});

const BookingGuestInputSchema = z.object({
  name: z.string().trim().min(2, 'Guest name must be at least 2 characters').max(100),
  phone: z
    .string()
    .trim()
    .regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number')
    .optional(),
  idType: z.enum(['Aadhaar', 'Passport', 'PAN', 'Driving Licence']).optional(),
  idNumber: z.string().trim().min(4).max(50).optional(),
  isPrimary: z.boolean().default(false),
});

export const CreateBookingSchema = z.object({
  roomTypeId: z.string().min(1, 'Room type is required'),
  checkIn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format YYYY-MM-DD required'),
  checkOut: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format YYYY-MM-DD required'),
  adultsCount: z.coerce.number().int().min(1, 'At least 1 adult required').max(10),
  childrenCount: z.coerce.number().int().min(0).max(6).default(0),
  guests: z
    .array(BookingGuestInputSchema)
    .min(1, 'At least one guest record is required')
    .max(10),
  extras: z.array(BookingExtraSchema).default([]),
  couponCode: z.string().trim().max(30).optional(),
  specialRequests: z.string().trim().max(500).optional(),
  paymentMethod: z.enum(['CASH', 'UPI', 'CARD', 'RAZORPAY', 'LOYALTY_POINTS', 'MIXED']),
}).refine(
  (data) => new Date(data.checkOut) > new Date(data.checkIn),
  { message: 'Check-out date must be after check-in date', path: ['checkOut'] },
);

export const ApplyCouponSchema = z.object({
  code: z.string().trim().min(1).max(30),
  roomTypeId: z.string().min(1),
  nights: z.coerce.number().int().min(1),
  subtotal: z.number().positive(),
});

export const BookingCancellationSchema = z.object({
  reason: z.string().trim().min(5, 'Please provide a cancellation reason').max(500),
});

export const BookingModificationSchema = z.object({
  checkIn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  checkOut: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  adultsCount: z.coerce.number().int().min(1).max(10).optional(),
  childrenCount: z.coerce.number().int().min(0).max(6).optional(),
  specialRequests: z.string().trim().max(500).optional(),
});

export const CheckInSchema = z.object({
  roomId: z.string().optional(), // staff may override/confirm room assignment
  idVerified: z.boolean().default(true),
  notes: z.string().trim().max(500).optional(),
});

export const CheckOutSchema = z.object({
  paymentMethod: z.enum(['CASH', 'UPI', 'CARD', 'RAZORPAY', 'MIXED']).optional(),
  notes: z.string().trim().max(500).optional(),
});

export const AssignRoomSchema = z.object({
  roomId: z.string().min(1, 'Room ID is required'),
});

export const ChangeRoomSchema = z.object({
  newRoomId: z.string().min(1, 'New Room ID is required'),
  reason: z.string().trim().min(3, 'Please provide a reason for changing room').max(300),
});

export const SendBookingReminderSchema = z.object({
  type: z.enum(['CHECKIN_24H', 'CHECKIN_2H', 'CHECKOUT_1H']).default('CHECKIN_24H'),
  channel: z.enum(['SMS', 'WHATSAPP', 'NOTIFICATION', 'EMAIL']).default('WHATSAPP'),
});

export const BookingListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  status: z
    .enum(['PENDING', 'CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT', 'CANCELLED', 'NO_SHOW'])
    .optional(),
  checkIn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  checkOut: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  search: z.string().trim().optional(), // bookingNumber or guest name
});

export const AvailabilityQuerySchema = z.object({
  checkIn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format YYYY-MM-DD required'),
  checkOut: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format YYYY-MM-DD required'),
  roomTypeId: z.string().optional(),
  guests: z.coerce.number().int().min(1).max(20).default(1),
});

// ─── Type Exports ─────────────────────────────────────────────────────────────

export type PaginationInput = z.infer<typeof PaginationSchema>;
export type IdParamInput = z.infer<typeof IdParamSchema>;

export type SendOtpInput = z.infer<typeof SendOtpSchema>;
export type VerifyOtpInput = z.infer<typeof VerifyOtpSchema>;
export type RegisterInput = z.infer<typeof RegisterSchema>;
export type RefreshTokenInput = z.infer<typeof RefreshTokenSchema>;

export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>;
export type AddressInput = z.infer<typeof AddressSchema>;

export type CreateCategoryInput = z.infer<typeof CreateCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof UpdateCategorySchema>;
export type CreateMenuItemInput = z.infer<typeof CreateMenuItemSchema>;
export type UpdateMenuItemInput = z.infer<typeof UpdateMenuItemSchema>;
export type CreateAddonInput = z.infer<typeof CreateAddonSchema>;
export type UpdateAddonInput = z.infer<typeof UpdateAddonSchema>;

export type CartItemInput = z.infer<typeof CartItemSchema>;
export type PlaceOrderInput = z.infer<typeof PlaceOrderSchema>;

export type ScanTableQrInput = z.infer<typeof ScanTableQrSchema>;
export type CreateTableReservationInput = z.infer<typeof CreateTableReservationSchema>;
export type TableServiceRequestInput = z.infer<typeof TableServiceRequestSchema>;

export type InitiatePaymentInput = z.infer<typeof InitiatePaymentSchema>;
export type RazorpayWebhookInput = z.infer<typeof RazorpayWebhookSchema>;
export type CreateReviewInput = z.infer<typeof CreateReviewSchema>;

export type KitchenStatusUpdateInput = z.infer<typeof KitchenStatusUpdateSchema>;
export type KitchenItemStatusUpdateInput = z.infer<typeof KitchenItemStatusUpdateSchema>;
export type WaiterServiceResolveInput = z.infer<typeof WaiterServiceResolveSchema>;
export type WaiterTableOrderInput = z.infer<typeof WaiterTableOrderSchema>;
export type TableBillActionInput = z.infer<typeof TableBillActionSchema>;

export type CreateDeliveryZoneInput = z.infer<typeof CreateDeliveryZoneSchema>;
export type UpdateDeliveryZoneInput = z.infer<typeof UpdateDeliveryZoneSchema>;
export type EstimateDeliveryFeeInput = z.infer<typeof EstimateDeliveryFeeSchema>;
export type AssignDeliveryPartnerInput = z.infer<typeof AssignDeliveryPartnerSchema>;
export type UpdateDeliveryStatusInput = z.infer<typeof UpdateDeliveryStatusSchema>;
export type VerifyDeliveryOtpInput = z.infer<typeof VerifyDeliveryOtpSchema>;
export type UpdatePartnerLocationInput = z.infer<typeof UpdatePartnerLocationSchema>;
export type CancelDeliveryOrderInput = z.infer<typeof CancelDeliveryOrderSchema>;
export type DriverLoginInput = z.infer<typeof DriverLoginSchema>;
export type DriverStatusToggleInput = z.infer<typeof DriverStatusToggleSchema>;
export type DriverTaskRejectInput = z.infer<typeof DriverTaskRejectSchema>;

export type CreateRoomTypeInput = z.infer<typeof CreateRoomTypeSchema>;
export type UpdateRoomTypeInput = z.infer<typeof UpdateRoomTypeSchema>;
export type CreateRoomInput = z.infer<typeof CreateRoomSchema>;
export type UpdateRoomInput = z.infer<typeof UpdateRoomSchema>;
export type UpdateRoomStatusInput = z.infer<typeof UpdateRoomStatusSchema>;
export type CreateAmenityInput = z.infer<typeof CreateAmenitySchema>;
export type CreateMaintenanceInput = z.infer<typeof CreateMaintenanceSchema>;
export type UpdateMaintenanceInput = z.infer<typeof UpdateMaintenanceSchema>;
export type SearchRoomsInput = z.infer<typeof SearchRoomsSchema>;
export type UpdateLodgePolicyInput = z.infer<typeof UpdateLodgePolicySchema>;
export type AddRoomPhotoInput = z.infer<typeof AddRoomPhotoSchema>;

// Phase 11 booking types
export type CreateBookingInputValidated = z.infer<typeof CreateBookingSchema>;
export type ApplyCouponInput = z.infer<typeof ApplyCouponSchema>;
export type BookingCancellationInput = z.infer<typeof BookingCancellationSchema>;
export type BookingModificationInput = z.infer<typeof BookingModificationSchema>;
export type CheckInInput = z.infer<typeof CheckInSchema>;
export type CheckOutInput = z.infer<typeof CheckOutSchema>;
export type AssignRoomInput = z.infer<typeof AssignRoomSchema>;
export type ChangeRoomInput = z.infer<typeof ChangeRoomSchema>;
export type SendBookingReminderInput = z.infer<typeof SendBookingReminderSchema>;
export type BookingListQueryInput = z.infer<typeof BookingListQuerySchema>;
export type AvailabilityQueryInput = z.infer<typeof AvailabilityQuerySchema>;