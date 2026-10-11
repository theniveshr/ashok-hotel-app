import type { FastifyPluginAsync } from 'fastify';
import {
  CreateBookingSchema,
  ApplyCouponSchema,
  BookingCancellationSchema,
  BookingModificationSchema,
  CheckInSchema,
  CheckOutSchema,
  AssignRoomSchema,
  ChangeRoomSchema,
  SendBookingReminderSchema,
  BookingListQuerySchema,
  AvailabilityQuerySchema,
} from '@ashok-raj/validation';
import type {
  Booking,
  BookingGuest,
  BookingStatusHistoryEntry,
  BookingExtra,
  BookingAvailabilityResult,
  TodayArrivalDeparture,
  BookingCancellationResult,
  ApplyCouponResult,
  BookingReminder,
  Room,
  RoomType,
  BookingStatus,
} from '@ashok-raj/types';
import { LODGE, TAX, BUSINESS } from '@ashok-raj/config';
import { requireRoles } from '../plugins/authGuard.js';

export const bookingRoutes: FastifyPluginAsync = async (app) => {
  // Extract authenticated user if token is provided
  app.addHook('preHandler', async (req) => {
    if (req.headers.authorization) {
      try {
        const decoded = await req.jwtVerify<{ userId: string }>();
        (req as any).user = { ...decoded, id: decoded.userId };
      } catch {
        // Continue if unauthenticated guest
      }
    }
  });

  // ── In-Memory Stores for Fast Standalone Execution & Fallback ─────────────
  const inMemoryBookings: Map<string, Booking> = new Map();
  const inMemoryRooms: Map<string, Room & { type?: RoomType | undefined }> = new Map();
  const inMemoryRoomTypes: Map<string, RoomType> = new Map();
  const inMemoryReminders: Map<string, BookingReminder[]> = new Map();

  // Helper: Broadcast WebSocket Event to connected Front Desk / Mobile clients
  const broadcastBookingEvent = (event: string, payload: any) => {
    try {
      const websocketServer = (app as any).websocketServer;
      if (websocketServer && websocketServer.clients) {
        const message = JSON.stringify({
          channel: 'lodge',
          event,
          payload,
          timestamp: new Date().toISOString(),
        });
        for (const client of websocketServer.clients) {
          if (client.readyState === 1) {
            client.send(message);
          }
        }
      }
    } catch (err) {
      app.log.warn({ err }, 'Booking WebSocket broadcast warning');
    }
  };

  // Helper: Format Date String to YYYY-MM-DD
  const formatDateOnly = (d: Date | string): string => {
    const date = typeof d === 'string' ? new Date(d) : d;
    return date.toISOString().split('T')[0]!;
  };

  // Helper: Calculate Nights between checkIn and checkOut
  const calculateNights = (checkInStr: string, checkOutStr: string): number => {
    const inDate = new Date(checkInStr);
    const outDate = new Date(checkOutStr);
    const diffTime = outDate.getTime() - inDate.getTime();
    return Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  };

  // Helper: Generate Formatted Booking Number (#AR-BKG-YYMMDD-XXXX)
  const generateBookingNumber = (): string => {
    const today = new Date();
    const yy = String(today.getFullYear()).slice(-2);
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const random = Math.floor(1000 + Math.random() * 9000);
    return `AR-BKG-${yy}${mm}${dd}-${random}`;
  };

  // Seed Initial Inventory & Sample Bookings
  const initBookingData = () => {
    if (inMemoryRoomTypes.size === 0) {
      LODGE.DEFAULT_ROOM_TYPES.forEach((rt) => {
        inMemoryRoomTypes.set(rt.id, {
          id: rt.id,
          name: rt.name,
          nameTa: rt.nameTa,
          description: rt.description,
          descriptionTa: rt.descriptionTa,
          basePrice: rt.basePrice,
          weekendPrice: rt.weekendPrice,
          maxOccupancy: rt.maxOccupancy,
          bedType: rt.bedType,
          sizeSqFt: rt.sizeSqFt,
          imageUrls: [...rt.imageUrls],
          amenities: [...rt.amenities],
          amenitiesTa: [...rt.amenitiesTa],
          isActive: true,
          displayOrder: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      });
    }

    if (inMemoryRooms.size === 0) {
      const initialRoomsList: Array<{ number: string; floor: number; typeId: string; status: any; notes?: string }> = [
        { number: '101', floor: 1, typeId: 'rt-standard-ac', status: 'AVAILABLE', notes: 'Near Garden & Lobby' },
        { number: '102', floor: 1, typeId: 'rt-standard-ac', status: 'OCCUPIED', notes: 'Guest Anand Kumar' },
        { number: '103', floor: 1, typeId: 'rt-deluxe-ac', status: 'CLEANING', notes: 'Checkout at 11:00 AM' },
        { number: '104', floor: 1, typeId: 'rt-deluxe-ac', status: 'OCCUPIED', notes: 'Guest Sundar Rajan (Active stay)' },
        { number: '105', floor: 1, typeId: 'rt-family-suite', status: 'RESERVED', notes: 'Arrival expected at 04:00 PM' },
        { number: '201', floor: 2, typeId: 'rt-deluxe-ac', status: 'AVAILABLE', notes: 'Pool Facing' },
        { number: '202', floor: 2, typeId: 'rt-deluxe-ac', status: 'OCCUPIED', notes: 'VIP Guest' },
        { number: '203', floor: 2, typeId: 'rt-standard-ac', status: 'MAINTENANCE', notes: 'AC Sensor Servicing' },
        { number: '204', floor: 2, typeId: 'rt-standard-ac', status: 'AVAILABLE' },
        { number: '205', floor: 2, typeId: 'rt-family-suite', status: 'OCCUPIED', notes: 'Family 4 guests' },
        { number: '301', floor: 3, typeId: 'rt-family-suite', status: 'AVAILABLE', notes: 'Top Floor View' },
        { number: '302', floor: 3, typeId: 'rt-deluxe-ac', status: 'BLOCKED', notes: 'Repainting scheduled' },
        { number: '303', floor: 3, typeId: 'rt-deluxe-ac', status: 'AVAILABLE' },
        { number: '304', floor: 3, typeId: 'rt-standard-ac', status: 'AVAILABLE' },
      ];

      initialRoomsList.forEach((r) => {
        const id = `room-${r.number}`;
        inMemoryRooms.set(id, {
          id,
          branchId: 'branch-kalaiyarkoil',
          roomNumber: r.number,
          floor: r.floor,
          typeId: r.typeId,
          status: r.status,
          notes: r.notes || null,
          isActive: true,
          type: inMemoryRoomTypes.get(r.typeId),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      });
    }

    if (inMemoryBookings.size === 0) {
      const today = new Date();
      const yesterday = new Date(Date.now() - 86400000);
      const tomorrow = new Date(Date.now() + 86400000);
      const dayAfter = new Date(Date.now() + 172800000);

      // Sample 1: Active In-House Stay (Room 104)
      const bkg1: Booking = {
        id: 'bkg-1044',
        bookingNumber: 'AR-BKG-1044',
        userId: 'user-sample-1',
        roomId: 'room-104',
        checkIn: formatDateOnly(yesterday),
        checkOut: formatDateOnly(tomorrow),
        status: 'CHECKED_IN',
        adultsCount: 2,
        childrenCount: 0,
        subtotal: 3600,
        taxAmount: 432,
        discountAmount: 0,
        totalAmount: 4032,
        advancePaid: 4032,
        paymentStatus: 'PAID',
        paymentMethod: 'UPI',
        specialRequests: 'Ground floor room near garden',
        extras: [
          { name: 'South Indian Breakfast Buffet', nameTa: 'தென்னிந்திய காலை உணவு பஃபே', price: 360 },
        ],
        checkedInAt: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
        user: { id: 'user-sample-1', name: 'Sundar Rajan', phone: '9876543210', email: 'sundar@example.com' },
        room: inMemoryRooms.get('room-104'),
        guests: [
          {
            id: 'guest-101',
            bookingId: 'bkg-1044',
            name: 'Sundar Rajan',
            phone: '9876543210',
            idType: 'Aadhaar',
            idNumber: '•••• •••• 4589',
            isPrimary: true,
            createdAt: yesterday.toISOString(),
          },
          {
            id: 'guest-102',
            bookingId: 'bkg-1044',
            name: 'Meenakshi Sundar',
            phone: '9876543211',
            idType: 'Aadhaar',
            idNumber: '•••• •••• 4590',
            isPrimary: false,
            createdAt: yesterday.toISOString(),
          },
        ],
        statusHistory: [
          {
            id: 'hist-1',
            bookingId: 'bkg-1044',
            status: 'CONFIRMED',
            note: 'Booking confirmed via Mobile App',
            createdAt: yesterday.toISOString(),
          },
          {
            id: 'hist-2',
            bookingId: 'bkg-1044',
            status: 'CHECKED_IN',
            note: 'Checked in by Receptionist Sangeetha (Room #104)',
            changedBy: 'Receptionist Sangeetha',
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
          },
        ],
        createdAt: yesterday.toISOString(),
        updatedAt: yesterday.toISOString(),
      };

      // Sample 2: Today's Arrival (Room 105)
      const bkg2: Booking = {
        id: 'bkg-1045',
        bookingNumber: 'AR-BKG-1045',
        userId: 'user-sample-2',
        roomId: 'room-105',
        checkIn: formatDateOnly(today),
        checkOut: formatDateOnly(dayAfter),
        status: 'CONFIRMED',
        adultsCount: 4,
        childrenCount: 1,
        subtotal: 5200,
        taxAmount: 624,
        discountAmount: 500,
        totalAmount: 5324,
        advancePaid: 2000,
        paymentStatus: 'PARTIALLY_PAID',
        paymentMethod: 'CARD',
        couponId: 'LODGE15',
        specialRequests: 'Late arrival around 4:00 PM, extra pillows requested',
        extras: [
          { name: 'Extra Bed / Rollaway Mattress', nameTa: 'கூடுதல் படுக்கை / மெத்தை', price: 700 },
        ],
        user: { id: 'user-sample-2', name: 'Karthik Ramanathan', phone: '9443322110', email: 'karthik@example.com' },
        room: inMemoryRooms.get('room-105'),
        guests: [
          {
            id: 'guest-201',
            bookingId: 'bkg-1045',
            name: 'Karthik Ramanathan',
            phone: '9443322110',
            idType: 'Aadhaar',
            idNumber: '•••• •••• 7823',
            isPrimary: true,
            createdAt: today.toISOString(),
          },
        ],
        statusHistory: [
          {
            id: 'hist-3',
            bookingId: 'bkg-1045',
            status: 'CONFIRMED',
            note: 'Advance of ₹2,000 received via Card. Arrival expected today.',
            createdAt: today.toISOString(),
          },
        ],
        createdAt: today.toISOString(),
        updatedAt: today.toISOString(),
      };

      // Sample 3: Today's Departure (Room 102)
      const bkg3: Booking = {
        id: 'bkg-1042',
        bookingNumber: 'AR-BKG-1042',
        userId: 'user-sample-3',
        roomId: 'room-102',
        checkIn: formatDateOnly(new Date(Date.now() - 172800000)),
        checkOut: formatDateOnly(today),
        status: 'CHECKED_IN',
        adultsCount: 2,
        childrenCount: 0,
        subtotal: 2400,
        taxAmount: 288,
        discountAmount: 0,
        totalAmount: 2688,
        advancePaid: 2688,
        paymentStatus: 'PAID',
        paymentMethod: 'CASH',
        specialRequests: null,
        extras: [],
        checkedInAt: new Date(Date.now() - 172800000).toISOString(),
        user: { id: 'user-sample-3', name: 'Anand Kumar', phone: '9789012345', email: 'anand@example.com' },
        room: inMemoryRooms.get('room-102'),
        guests: [
          {
            id: 'guest-301',
            bookingId: 'bkg-1042',
            name: 'Anand Kumar',
            phone: '9789012345',
            idType: 'PAN',
            idNumber: 'ABCDE1234F',
            isPrimary: true,
            createdAt: new Date(Date.now() - 172800000).toISOString(),
          },
        ],
        statusHistory: [
          {
            id: 'hist-4',
            bookingId: 'bkg-1042',
            status: 'CHECKED_IN',
            note: 'Checked in 2 days ago',
            createdAt: new Date(Date.now() - 172800000).toISOString(),
          },
        ],
        createdAt: new Date(Date.now() - 172800000).toISOString(),
        updatedAt: today.toISOString(),
      };

      // Sample 4: Past Completed Stay (Room 201)
      const pastDateIn = new Date(Date.now() - 86400000 * 15);
      const pastDateOut = new Date(Date.now() - 86400000 * 13);
      const bkg4: Booking = {
        id: 'bkg-0980',
        bookingNumber: 'AR-BKG-0980',
        userId: 'user-sample-1',
        roomId: 'room-201',
        checkIn: formatDateOnly(pastDateIn),
        checkOut: formatDateOnly(pastDateOut),
        status: 'CHECKED_OUT',
        adultsCount: 2,
        childrenCount: 0,
        subtotal: 3600,
        taxAmount: 432,
        discountAmount: 300,
        totalAmount: 3732,
        advancePaid: 3732,
        paymentStatus: 'PAID',
        paymentMethod: 'UPI',
        couponId: 'ASHOKSTAY',
        specialRequests: 'Quiet room requested',
        extras: [],
        checkedInAt: pastDateIn.toISOString(),
        checkedOutAt: pastDateOut.toISOString(),
        user: { id: 'user-sample-1', name: 'Sundar Rajan', phone: '9876543210', email: 'sundar@example.com' },
        room: inMemoryRooms.get('room-201'),
        guests: [
          {
            id: 'guest-401',
            bookingId: 'bkg-0980',
            name: 'Sundar Rajan',
            phone: '9876543210',
            idType: 'Aadhaar',
            idNumber: '•••• •••• 4589',
            isPrimary: true,
            createdAt: pastDateIn.toISOString(),
          },
        ],
        statusHistory: [
          { id: 'hist-5', bookingId: 'bkg-0980', status: 'CONFIRMED', note: 'Confirmed online', createdAt: pastDateIn.toISOString() },
          { id: 'hist-6', bookingId: 'bkg-0980', status: 'CHECKED_IN', note: 'Guest checked in', createdAt: pastDateIn.toISOString() },
          { id: 'hist-7', bookingId: 'bkg-0980', status: 'CHECKED_OUT', note: 'Bill settled in full and checked out', createdAt: pastDateOut.toISOString() },
        ],
        createdAt: pastDateIn.toISOString(),
        updatedAt: pastDateOut.toISOString(),
      };

      inMemoryBookings.set(bkg1.id, bkg1);
      inMemoryBookings.set(bkg2.id, bkg2);
      inMemoryBookings.set(bkg3.id, bkg3);
      inMemoryBookings.set(bkg4.id, bkg4);
    }
  };

  initBookingData();

  // ─────────────────────────────────────────────────────────────────────────
  // HELPER: Concurrency & Double-Booking Prevention Algorithm
  // ─────────────────────────────────────────────────────────────────────────
  const checkRoomConflict = (
    roomId: string,
    checkInStr: string,
    checkOutStr: string,
    excludeBookingId?: string
  ): boolean => {
    const newIn = new Date(checkInStr).getTime();
    const newOut = new Date(checkOutStr).getTime();

    for (const booking of inMemoryBookings.values()) {
      if (excludeBookingId && booking.id === excludeBookingId) continue;
      if (booking.roomId !== roomId) continue;
      if (booking.status === 'CANCELLED' || booking.status === 'NO_SHOW') continue;

      const existingIn = new Date(booking.checkIn).getTime();
      const existingOut = new Date(booking.checkOut).getTime();

      // Date range overlap condition: [newIn, newOut) overlaps with [existingIn, existingOut)
      if (newIn < existingOut && newOut > existingIn) {
        return true; // Overlap detected!
      }
    }
    return false;
  };

  // Find an available physical room for a given RoomType and Date Range
  const allocateAvailableRoom = (
    typeId: string,
    checkInStr: string,
    checkOutStr: string,
    preferredRoomId?: string
  ): Room | null => {
    // If a preferred room is requested, check if it fits criteria
    if (preferredRoomId) {
      const prefRoom = inMemoryRooms.get(preferredRoomId);
      if (
        prefRoom &&
        prefRoom.typeId === typeId &&
        prefRoom.status !== 'MAINTENANCE' &&
        prefRoom.status !== 'BLOCKED' &&
        prefRoom.isActive &&
        !checkRoomConflict(prefRoom.id, checkInStr, checkOutStr)
      ) {
        return prefRoom;
      }
    }

    // Find all matching active rooms of type
    const candidateRooms = Array.from(inMemoryRooms.values()).filter(
      (r) =>
        r.typeId === typeId &&
        r.status !== 'MAINTENANCE' &&
        r.status !== 'BLOCKED' &&
        r.isActive
    );

    // Prioritize AVAILABLE / INSPECTED rooms with NO date overlap
    for (const room of candidateRooms) {
      if (!checkRoomConflict(room.id, checkInStr, checkOutStr)) {
        return room;
      }
    }

    return null;
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // 1. CUSTOMER PUBLIC APIS (FLOW STEPS 1 - 9)
  // ═══════════════════════════════════════════════════════════════════════════

  // ── GET /availability — Step 1, 2, 3: Search Availability & Pricing ────────
  app.get('/availability', async (req, reply) => {
    initBookingData();
    const parseResult = AvailabilityQuerySchema.safeParse(req.query);
    if (!parseResult.success) {
      return reply.status(422).send({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid search parameters', details: parseResult.error.errors },
      });
    }

    const { checkIn, checkOut, roomTypeId, guests } = parseResult.data;
    const nights = calculateNights(checkIn, checkOut);

    let types = Array.from(inMemoryRoomTypes.values()).filter((rt) => rt.isActive && rt.maxOccupancy >= guests);
    if (roomTypeId) {
      types = types.filter((rt) => rt.id === roomTypeId);
    }

    const results: BookingAvailabilityResult[] = types.map((rt) => {
      // Count available physical rooms for this specific date range
      const availableRooms = Array.from(inMemoryRooms.values()).filter(
        (r) =>
          r.typeId === rt.id &&
          r.status !== 'MAINTENANCE' &&
          r.status !== 'BLOCKED' &&
          r.isActive &&
          !checkRoomConflict(r.id, checkIn, checkOut)
      );

      const pricePerNight = rt.basePrice;
      const subtotal = pricePerNight * nights;
      const taxAmount = Math.round(subtotal * TAX.ROOM_GST_RATE * 100) / 100;
      const totalAmount = subtotal + taxAmount;

      return {
        roomTypeId: rt.id,
        roomTypeName: rt.name || rt.title || 'Standard Room',
        roomTypeNameTa: rt.nameTa || rt.titleTa || 'நிலையான அறை',
        available: availableRooms.length > 0,
        availableRoomsCount: availableRooms.length,
        nights,
        pricePerNight,
        subtotal,
        taxAmount,
        totalAmount,
        isWeekend: false,
      };
    });

    return reply.send({
      success: true,
      data: {
        checkIn,
        checkOut,
        nights,
        guests,
        results,
      },
    });
  });

  // ── POST /apply-coupon — Step 7: Live Coupon Validation & Deduction ───────
  app.post('/apply-coupon', async (req, reply) => {
    initBookingData();
    const parseResult = ApplyCouponSchema.safeParse(req.body);
    if (!parseResult.success) {
      return reply.status(422).send({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid coupon request', details: parseResult.error.errors },
      });
    }

    const { code, subtotal } = parseResult.data;
    const normalizedCode = code.toUpperCase().trim();
    const coupon = LODGE.SAMPLE_COUPONS.find((c) => c.code === normalizedCode);

    if (!coupon) {
      return reply.status(404).send({
        success: false,
        error: { code: 'COUPON_NOT_FOUND', message: 'Invalid promo code entered' },
      });
    }

    if (subtotal < coupon.minOrderAmount) {
      return reply.status(400).send({
        success: false,
        error: {
          code: 'MIN_AMOUNT_NOT_MET',
          message: `Coupon valid on minimum booking of ₹${coupon.minOrderAmount}`,
        },
      });
    }

    let discountAmount = 0;
    if (coupon.discountType === 'PERCENTAGE') {
      discountAmount = Math.round((subtotal * coupon.discountValue) / 100);
      if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
        discountAmount = coupon.maxDiscount;
      }
    } else {
      discountAmount = coupon.discountValue;
    }

    const newSubtotal = Math.max(0, subtotal - discountAmount);

    const result: ApplyCouponResult = {
      valid: true,
      code: coupon.code,
      discountType: coupon.discountType as any,
      discountValue: coupon.discountValue,
      discountAmount,
      newSubtotal,
      message: `Coupon ${coupon.code} applied! Saved ₹${discountAmount}`,
      messageTa: `கூப்பன் ${coupon.code} பயன்படுத்தப்பட்டது! ₹${discountAmount} தள்ளுபடி`,
    };

    return reply.send({
      success: true,
      data: result,
    });
  });

  // ── POST /bookings — Step 8 & 9: Create Booking & Atomic Room Allocation ────
  app.post('/bookings', async (req, reply) => {
    initBookingData();
    const parseResult = CreateBookingSchema.safeParse(req.body);
    if (!parseResult.success) {
      return reply.status(422).send({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid booking data', details: parseResult.error.errors },
      });
    }

    const {
      roomTypeId,
      checkIn,
      checkOut,
      adultsCount,
      childrenCount,
      guests,
      extras,
      couponCode,
      specialRequests,
      paymentMethod,
    } = parseResult.data;

    const roomType = inMemoryRoomTypes.get(roomTypeId);
    if (!roomType) {
      return reply.status(404).send({
        success: false,
        error: { code: 'ROOM_TYPE_NOT_FOUND', message: 'Requested room type does not exist' },
      });
    }

    const nights = calculateNights(checkIn, checkOut);

    // ── Atomic Room Allocation & Double Booking Prevention ──
    const allocatedRoom = allocateAvailableRoom(roomTypeId, checkIn, checkOut);
    if (!allocatedRoom) {
      return reply.status(409).send({
        success: false,
        error: {
          code: 'NO_ROOMS_AVAILABLE',
          message: 'No available rooms found for the selected dates. Please choose another date or room type.',
        },
      });
    }

    // ── Pricing Computation ──
    const pricePerNight = roomType.basePrice;
    const roomSubtotal = pricePerNight * nights;

    // Calculate Extras Subtotal
    let extrasSubtotal = 0;
    const processedExtras: BookingExtra[] = (extras || []).map((ex) => {
      extrasSubtotal += ex.price;
      return {
        name: ex.name,
        nameTa: ex.nameTa,
        price: ex.price,
      };
    });

    let subtotal = roomSubtotal + extrasSubtotal;

    // Apply Coupon if provided
    let discountAmount = 0;
    let validCouponId: string | null = null;
    if (couponCode) {
      const coupon = LODGE.SAMPLE_COUPONS.find((c) => c.code === couponCode.toUpperCase().trim());
      if (coupon && subtotal >= coupon.minOrderAmount) {
        validCouponId = coupon.code;
        if (coupon.discountType === 'PERCENTAGE') {
          discountAmount = Math.round((subtotal * coupon.discountValue) / 100);
          if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
            discountAmount = coupon.maxDiscount;
          }
        } else {
          discountAmount = coupon.discountValue;
        }
      }
    }

    const taxableAmount = Math.max(0, subtotal - discountAmount);
    const taxAmount = Math.round(taxableAmount * TAX.ROOM_GST_RATE * 100) / 100;
    const totalAmount = taxableAmount + taxAmount;
    const advancePaid = paymentMethod === 'CASH' ? 0 : totalAmount;

    // Generate Unique IDs
    const bookingId = `bkg-${Date.now()}`;
    const bookingNumber = generateBookingNumber();
    const primaryGuest = guests.find((g) => g.isPrimary) || guests[0]!;

    const guestRecords: BookingGuest[] = guests.map((g, idx) => ({
      id: `guest-${bookingId}-${idx + 1}`,
      bookingId,
      name: g.name,
      phone: g.phone || null,
      idType: g.idType || 'Aadhaar',
      idNumber: g.idNumber || null,
      isPrimary: g.isPrimary,
      createdAt: new Date().toISOString(),
    }));

    const statusHistory: BookingStatusHistoryEntry[] = [
      {
        id: `hist-${bookingId}-1`,
        bookingId,
        status: 'CONFIRMED',
        note: `Booking confirmed for ${nights} night(s). Room #${allocatedRoom.roomNumber} allocated.`,
        createdAt: new Date().toISOString(),
      },
    ];

    const newBooking: Booking = {
      id: bookingId,
      bookingNumber,
      userId: (req as any).user?.id || 'guest-user',
      roomId: allocatedRoom.id,
      checkIn,
      checkOut,
      status: 'CONFIRMED',
      adultsCount,
      childrenCount: childrenCount || 0,
      subtotal,
      taxAmount,
      discountAmount,
      totalAmount,
      advancePaid,
      paymentStatus: paymentMethod === 'CASH' ? 'PENDING' : 'PAID',
      paymentMethod: paymentMethod as any,
      couponId: validCouponId,
      specialRequests: specialRequests || null,
      extras: processedExtras,
      checkedInAt: null,
      checkedOutAt: null,
      user: {
        id: (req as any).user?.id || 'guest-user',
        name: primaryGuest.name,
        phone: primaryGuest.phone || '9876543210',
        email: null,
      },
      room: {
        ...allocatedRoom,
        type: roomType,
      },
      guests: guestRecords,
      statusHistory,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Store Booking in Transactional Store
    inMemoryBookings.set(bookingId, newBooking);

    // Broadcast Real-time Event to Front Desk and Mobile
    broadcastBookingEvent('lodge:booking_created', newBooking);

    return reply.status(201).send({
      success: true,
      message: `Booking #${bookingNumber} confirmed successfully!`,
      data: newBooking,
    });
  });

  // ── GET /bookings/my-bookings — Customer Stay History ─────────────────────
  app.get('/bookings/my-bookings', async (req, reply) => {
    initBookingData();
    const userId = (req as any).user?.id || 'user-sample-1';

    const userBookings = Array.from(inMemoryBookings.values())
      .filter((b) => b.userId === userId || b.userId === 'guest-user' || b.userId === 'user-sample-1')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const activeStays = userBookings.filter(
      (b) => b.status === 'CONFIRMED' || b.status === 'CHECKED_IN' || b.status === 'PENDING'
    );
    const pastStays = userBookings.filter(
      (b) => b.status === 'CHECKED_OUT' || b.status === 'CANCELLED' || b.status === 'NO_SHOW'
    );

    return reply.send({
      success: true,
      data: {
        activeStays,
        pastStays,
        totalBookings: userBookings.length,
      },
    });
  });

  // ── GET /bookings/:id — Single Booking Details & Timeline ──────────────────
  app.get('/bookings/:id', async (req, reply) => {
    initBookingData();
    const { id } = req.params as { id: string };
    const booking = inMemoryBookings.get(id) || Array.from(inMemoryBookings.values()).find((b) => b.bookingNumber === id);

    if (!booking) {
      return reply.status(404).send({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Booking not found' },
      });
    }

    return reply.send({
      success: true,
      data: booking,
    });
  });

  // ── POST /bookings/:id/cancel — 24h Policy Cancellation with Refund Calc ────
  app.post('/bookings/:id/cancel', async (req, reply) => {
    initBookingData();
    const { id } = req.params as { id: string };
    const parseResult = BookingCancellationSchema.safeParse(req.body);
    if (!parseResult.success) {
      return reply.status(422).send({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Cancellation reason is required', details: parseResult.error.errors },
      });
    }

    const booking = inMemoryBookings.get(id);
    if (!booking) {
      return reply.status(404).send({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Booking not found' },
      });
    }

    if (booking.status === 'CHECKED_IN' || booking.status === 'CHECKED_OUT') {
      return reply.status(400).send({
        success: false,
        error: { code: 'CANNOT_CANCEL', message: 'Active or completed stays cannot be cancelled.' },
      });
    }

    // ── 24-Hour Policy Rule ──
    const now = Date.now();
    const checkInTime = new Date(`${booking.checkIn}T${LODGE.DEFAULT_CHECKIN_TIME}:00`).getTime();
    const hoursBeforeCheckIn = (checkInTime - now) / (1000 * 60 * 60);

    let cancellationCharge = 0;
    let refundAmount = booking.advancePaid;

    if (hoursBeforeCheckIn < 24) {
      // 50% cancellation fee if within 24h window
      cancellationCharge = Math.round(booking.totalAmount * 0.5);
      refundAmount = Math.max(0, booking.advancePaid - cancellationCharge);
    }

    booking.status = 'CANCELLED';
    booking.cancellationReason = parseResult.data.reason;
    booking.updatedAt = new Date().toISOString();

    booking.statusHistory?.push({
      id: `hist-${Date.now()}`,
      bookingId: booking.id,
      status: 'CANCELLED',
      note: `Cancelled: ${parseResult.data.reason}. Refund of ₹${refundAmount} processed.`,
      createdAt: new Date().toISOString(),
    });

    broadcastBookingEvent('lodge:booking_cancelled', {
      bookingId: booking.id,
      bookingNumber: booking.bookingNumber,
      refundAmount,
      cancellationCharge,
    });

    const result: BookingCancellationResult = {
      bookingId: booking.id,
      bookingNumber: booking.bookingNumber,
      refundAmount,
      cancellationCharge,
      reason: parseResult.data.reason,
    };

    return reply.send({
      success: true,
      message: `Booking #${booking.bookingNumber} has been cancelled.`,
      data: result,
    });
  });

  // ── PATCH /bookings/:id/modify — Modify Dates / Guests ────────────────────
  app.patch('/bookings/:id/modify', async (req, reply) => {
    initBookingData();
    const { id } = req.params as { id: string };
    const parseResult = BookingModificationSchema.safeParse(req.body);
    if (!parseResult.success) {
      return reply.status(422).send({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid modification data', details: parseResult.error.errors },
      });
    }

    const booking = inMemoryBookings.get(id);
    if (!booking) {
      return reply.status(404).send({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Booking not found' },
      });
    }

    if (booking.status !== 'CONFIRMED' && booking.status !== 'PENDING') {
      return reply.status(400).send({
        success: false,
        error: { code: 'MODIFICATION_NOT_ALLOWED', message: 'Only upcoming confirmed bookings can be modified' },
      });
    }

    const newCheckIn = parseResult.data.checkIn || booking.checkIn;
    const newCheckOut = parseResult.data.checkOut || booking.checkOut;

    // Verify room availability for modified dates
    if (newCheckIn !== booking.checkIn || newCheckOut !== booking.checkOut) {
      const isConflict = checkRoomConflict(booking.roomId, newCheckIn, newCheckOut, booking.id);
      if (isConflict) {
        // Try reallocating another room of same type
        const newRoom = allocateAvailableRoom(booking.room?.typeId || 'rt-standard-ac', newCheckIn, newCheckOut);
        if (!newRoom) {
          return reply.status(409).send({
            success: false,
            error: { code: 'DATES_UNAVAILABLE', message: 'Selected new dates are not available for this room type' },
          });
        }
        booking.roomId = newRoom.id;
        booking.room = newRoom;
      }
      booking.checkIn = newCheckIn;
      booking.checkOut = newCheckOut;

      const newNights = calculateNights(newCheckIn, newCheckOut);
      const roomBase = (booking.room?.type?.basePrice || 1200) * newNights;
      booking.subtotal = roomBase + (booking.extras?.reduce((s, e) => s + e.price, 0) || 0);
      booking.taxAmount = Math.round((booking.subtotal - booking.discountAmount) * TAX.ROOM_GST_RATE * 100) / 100;
      booking.totalAmount = booking.subtotal - booking.discountAmount + booking.taxAmount;
    }

    if (parseResult.data.adultsCount) booking.adultsCount = parseResult.data.adultsCount;
    if (parseResult.data.childrenCount !== undefined) booking.childrenCount = parseResult.data.childrenCount;
    if (parseResult.data.specialRequests !== undefined) booking.specialRequests = parseResult.data.specialRequests;
    booking.updatedAt = new Date().toISOString();

    booking.statusHistory?.push({
      id: `hist-${Date.now()}`,
      bookingId: booking.id,
      status: booking.status,
      note: `Booking modified: ${booking.checkIn} to ${booking.checkOut}, ${booking.adultsCount} guests.`,
      createdAt: new Date().toISOString(),
    });

    broadcastBookingEvent('lodge:booking_modified', booking);

    return reply.send({
      success: true,
      message: 'Booking updated successfully',
      data: booking,
    });
  });

  // ── POST /bookings/:id/reminders — Send / Schedule Bilingual Reminder ─────
  app.post('/bookings/:id/reminders', async (req, reply) => {
    initBookingData();
    const { id } = req.params as { id: string };
    const parseResult = SendBookingReminderSchema.safeParse(req.body);
    if (!parseResult.success) {
      return reply.status(422).send({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid reminder request', details: parseResult.error.errors },
      });
    }

    const booking = inMemoryBookings.get(id);
    if (!booking) {
      return reply.status(404).send({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Booking not found' },
      });
    }

    const { type, channel } = parseResult.data;
    const tpl = (LODGE.REMINDER_TEMPLATES as any)[type] || LODGE.REMINDER_TEMPLATES.CHECKIN_24H;

    const reminder: BookingReminder = {
      id: `rem-${Date.now()}`,
      bookingId: booking.id,
      type,
      channel,
      subject: tpl.subject,
      subjectTa: tpl.subjectTa,
      body: tpl.body,
      bodyTa: tpl.bodyTa,
      sentAt: new Date().toISOString(),
      status: 'SENT',
    };

    const existingList = inMemoryReminders.get(booking.id) || [];
    existingList.push(reminder);
    inMemoryReminders.set(booking.id, existingList);

    return reply.send({
      success: true,
      message: `Reminder sent via ${channel} successfully!`,
      data: reminder,
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 2. STAFF FRONT DESK OPERATIONS APIS
  // ═══════════════════════════════════════════════════════════════════════════

  // ── GET /staff/today-overview — Today's Arrivals, Departures & In-House ────
  app.get(
    '/staff/today-overview',
    { preHandler: [requireRoles('ADMIN', 'MANAGER', 'RECEPTIONIST', 'SUPER_ADMIN')] },
    async (_req, reply) => {
      initBookingData();
      const todayStr = formatDateOnly(new Date());

      const allBookings = Array.from(inMemoryBookings.values());

      // Arrivals: CheckIn is today and status is CONFIRMED or PENDING
      const arrivals = allBookings.filter(
        (b) => b.checkIn === todayStr && (b.status === 'CONFIRMED' || b.status === 'PENDING')
      );

      // Departures: CheckOut is today and status is CHECKED_IN
      const departures = allBookings.filter(
        (b) => b.checkOut === todayStr && b.status === 'CHECKED_IN'
      );

      // In-House: Currently active stay
      const inHouse = allBookings.filter((b) => b.status === 'CHECKED_IN');

      const data: TodayArrivalDeparture = {
        arrivals,
        departures,
        inHouseCount: inHouse.length,
        expectedArrivals: arrivals.length,
        expectedDepartures: departures.length,
      };

      return reply.send({
        success: true,
        data,
      });
    }
  );

  // ── GET /staff/bookings — Full Filterable Bookings List ────────────────────
  app.get(
    '/staff/bookings',
    { preHandler: [requireRoles('ADMIN', 'MANAGER', 'RECEPTIONIST', 'SUPER_ADMIN')] },
    async (req, reply) => {
      initBookingData();
      const parseResult = BookingListQuerySchema.safeParse(req.query);
      if (!parseResult.success) {
        return reply.status(422).send({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'Invalid query parameters', details: parseResult.error.errors },
        });
      }

      const { page, pageSize, status, checkIn, checkOut, search } = parseResult.data;

      let list = Array.from(inMemoryBookings.values());

      if (status) {
        list = list.filter((b) => b.status === status);
      }
      if (checkIn) {
        list = list.filter((b) => b.checkIn >= checkIn);
      }
      if (checkOut) {
        list = list.filter((b) => b.checkOut <= checkOut);
      }
      if (search) {
        const query = search.toLowerCase();
        list = list.filter(
          (b) =>
            b.bookingNumber.toLowerCase().includes(query) ||
            b.user?.name?.toLowerCase().includes(query) ||
            b.user?.phone?.includes(query) ||
            b.room?.roomNumber.includes(query)
        );
      }

      // Sort newest first
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      const total = list.length;
      const startIndex = (page - 1) * pageSize;
      const items = list.slice(startIndex, startIndex + pageSize);

      return reply.send({
        success: true,
        data: {
          items,
          total,
          page,
          pageSize,
          totalPages: Math.ceil(total / pageSize),
        },
      });
    }
  );

  // ── POST /staff/bookings/:id/check-in — Front Desk 1-Click Check-in ────────
  app.post(
    '/staff/bookings/:id/check-in',
    { preHandler: [requireRoles('ADMIN', 'MANAGER', 'RECEPTIONIST', 'SUPER_ADMIN')] },
    async (req, reply) => {
      initBookingData();
      const { id } = req.params as { id: string };
      const parseResult = CheckInSchema.safeParse(req.body);
      if (!parseResult.success) {
        return reply.status(422).send({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'Invalid check-in input', details: parseResult.error.errors },
        });
      }

      const booking = inMemoryBookings.get(id);
      if (!booking) {
        return reply.status(404).send({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Booking not found' },
        });
      }

      if (booking.status !== 'CONFIRMED' && booking.status !== 'PENDING') {
        return reply.status(400).send({
          success: false,
          error: { code: 'INVALID_STATUS', message: `Cannot check-in booking with status ${booking.status}` },
        });
      }

      // If staff assigns a specific room during check-in
      if (parseResult.data.roomId && parseResult.data.roomId !== booking.roomId) {
        const targetRoom = inMemoryRooms.get(parseResult.data.roomId);
        if (targetRoom) {
          booking.roomId = targetRoom.id;
          booking.room = targetRoom;
        }
      }

      booking.status = 'CHECKED_IN';
      booking.checkedInAt = new Date().toISOString();
      booking.updatedAt = new Date().toISOString();

      // Update Physical Room Status to OCCUPIED
      const room = inMemoryRooms.get(booking.roomId);
      if (room) {
        room.status = 'OCCUPIED';
        room.currentBookingId = booking.id;
        room.updatedAt = new Date().toISOString();
      }

      const staffName = (req as any).staffContext?.name || 'Reception Staff';
      booking.statusHistory?.push({
        id: `hist-${Date.now()}`,
        bookingId: booking.id,
        status: 'CHECKED_IN',
        note: `Checked in by ${staffName}. ID verified: ${parseResult.data.idVerified ? 'Yes' : 'No'}.`,
        changedBy: staffName,
        createdAt: new Date().toISOString(),
      });

      broadcastBookingEvent('lodge:guest_checked_in', booking);

      return reply.send({
        success: true,
        message: `Guest checked into Room #${room?.roomNumber || booking.room?.roomNumber}`,
        data: booking,
      });
    }
  );

  // ── POST /staff/bookings/:id/check-out — Front Desk Check-out & Housekeeping ──
  app.post(
    '/staff/bookings/:id/check-out',
    { preHandler: [requireRoles('ADMIN', 'MANAGER', 'RECEPTIONIST', 'SUPER_ADMIN')] },
    async (req, reply) => {
      initBookingData();
      const { id } = req.params as { id: string };
      const parseResult = CheckOutSchema.safeParse(req.body);
      if (!parseResult.success) {
        return reply.status(422).send({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'Invalid check-out input', details: parseResult.error.errors },
        });
      }

      const booking = inMemoryBookings.get(id);
      if (!booking) {
        return reply.status(404).send({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Booking not found' },
        });
      }

      if (booking.status !== 'CHECKED_IN') {
        return reply.status(400).send({
          success: false,
          error: { code: 'INVALID_STATUS', message: `Cannot checkout booking with status ${booking.status}` },
        });
      }

      booking.status = 'CHECKED_OUT';
      booking.paymentStatus = 'PAID';
      booking.checkedOutAt = new Date().toISOString();
      booking.updatedAt = new Date().toISOString();

      // Transition Room to CLEANING state
      const room = inMemoryRooms.get(booking.roomId);
      if (room) {
        room.status = 'CLEANING';
        room.currentBookingId = null;
        room.lastCleanedAt = null;
        room.updatedAt = new Date().toISOString();
      }

      const staffName = (req as any).staffContext?.name || 'Reception Staff';
      booking.statusHistory?.push({
        id: `hist-${Date.now()}`,
        bookingId: booking.id,
        status: 'CHECKED_OUT',
        note: `Checked out by ${staffName}. Folio settled in full. Room marked for cleaning.`,
        changedBy: staffName,
        createdAt: new Date().toISOString(),
      });

      broadcastBookingEvent('lodge:guest_checked_out', booking);

      return reply.send({
        success: true,
        message: `Guest checked out from Room #${room?.roomNumber || booking.room?.roomNumber}. Room marked for cleaning.`,
        data: booking,
      });
    }
  );

  // ── POST /staff/bookings/:id/assign-room — Room Assignment ────────────────
  app.post(
    '/staff/bookings/:id/assign-room',
    { preHandler: [requireRoles('ADMIN', 'MANAGER', 'RECEPTIONIST', 'SUPER_ADMIN')] },
    async (req, reply) => {
      initBookingData();
      const { id } = req.params as { id: string };
      const parseResult = AssignRoomSchema.safeParse(req.body);
      if (!parseResult.success) {
        return reply.status(422).send({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'Room ID required', details: parseResult.error.errors },
        });
      }

      const booking = inMemoryBookings.get(id);
      if (!booking) {
        return reply.status(404).send({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Booking not found' },
        });
      }

      const targetRoom = inMemoryRooms.get(parseResult.data.roomId);
      if (!targetRoom) {
        return reply.status(404).send({
          success: false,
          error: { code: 'ROOM_NOT_FOUND', message: 'Target room not found' },
        });
      }

      // Check conflict for target room
      if (checkRoomConflict(targetRoom.id, booking.checkIn, booking.checkOut, booking.id)) {
        return reply.status(409).send({
          success: false,
          error: { code: 'ROOM_UNAVAILABLE', message: `Room #${targetRoom.roomNumber} is booked for these dates` },
        });
      }

      const oldRoomNum = booking.room?.roomNumber || 'None';
      booking.roomId = targetRoom.id;
      booking.room = targetRoom;
      booking.updatedAt = new Date().toISOString();

      const staffName = (req as any).staffContext?.name || 'Reception Staff';
      booking.statusHistory?.push({
        id: `hist-${Date.now()}`,
        bookingId: booking.id,
        status: booking.status,
        note: `Room assigned by ${staffName}: from #${oldRoomNum} to #${targetRoom.roomNumber}`,
        changedBy: staffName,
        createdAt: new Date().toISOString(),
      });

      broadcastBookingEvent('lodge:room_assigned', booking);

      return reply.send({
        success: true,
        message: `Booking #${booking.bookingNumber} assigned to Room #${targetRoom.roomNumber}`,
        data: booking,
      });
    }
  );

  // ── POST /staff/bookings/:id/change-room — Mid-Stay Room Transfer ─────────
  app.post(
    '/staff/bookings/:id/change-room',
    { preHandler: [requireRoles('ADMIN', 'MANAGER', 'RECEPTIONIST', 'SUPER_ADMIN')] },
    async (req, reply) => {
      initBookingData();
      const { id } = req.params as { id: string };
      const parseResult = ChangeRoomSchema.safeParse(req.body);
      if (!parseResult.success) {
        return reply.status(422).send({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'Valid target room and reason required', details: parseResult.error.errors },
        });
      }

      const booking = inMemoryBookings.get(id);
      if (!booking) {
        return reply.status(404).send({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Booking not found' },
        });
      }

      const { newRoomId, reason } = parseResult.data;
      const targetRoom = inMemoryRooms.get(newRoomId);
      if (!targetRoom) {
        return reply.status(404).send({
          success: false,
          error: { code: 'ROOM_NOT_FOUND', message: 'Target room does not exist' },
        });
      }

      if (targetRoom.status !== 'AVAILABLE' && targetRoom.status !== 'INSPECTED') {
        return reply.status(400).send({
          success: false,
          error: { code: 'ROOM_NOT_READY', message: `Target room #${targetRoom.roomNumber} is currently ${targetRoom.status}` },
        });
      }

      const oldRoom = inMemoryRooms.get(booking.roomId);
      if (oldRoom) {
        // Release previous room to CLEANING
        oldRoom.status = 'CLEANING';
        oldRoom.currentBookingId = null;
        oldRoom.updatedAt = new Date().toISOString();
      }

      // Move into new room
      targetRoom.status = 'OCCUPIED';
      targetRoom.currentBookingId = booking.id;
      targetRoom.updatedAt = new Date().toISOString();

      booking.roomId = targetRoom.id;
      booking.room = targetRoom;
      booking.updatedAt = new Date().toISOString();

      const staffName = (req as any).staffContext?.name || 'Reception Staff';
      booking.statusHistory?.push({
        id: `hist-${Date.now()}`,
        bookingId: booking.id,
        status: booking.status,
        note: `Room Transfer: Moved from #${oldRoom?.roomNumber || 'Unknown'} to #${targetRoom.roomNumber}. Reason: ${reason}`,
        changedBy: staffName,
        createdAt: new Date().toISOString(),
      });

      broadcastBookingEvent('lodge:room_changed', {
        bookingId: booking.id,
        previousRoomNumber: oldRoom?.roomNumber,
        newRoomNumber: targetRoom.roomNumber,
        reason,
      });

      return reply.send({
        success: true,
        message: `Guest successfully moved to Room #${targetRoom.roomNumber}`,
        data: booking,
      });
    }
  );
};
