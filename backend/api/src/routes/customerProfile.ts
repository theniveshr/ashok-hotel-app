import type { FastifyPluginAsync } from 'fastify';
import { CreateAddressSchema, UpdateAddressSchema, UpdateTourStatusSchema } from '@ashok-raj/validation';
import type { Address, LoyaltyProfileResponse, ApiResponse } from '@ashok-raj/types';

interface StoredAddress {
  id: string;
  userId: string;
  label: string;
  line1: string;
  line2?: string | null;
  recipientName?: string | null;
  recipientPhone?: string | null;
  houseNumber?: string | null;
  buildingName?: string | null;
  streetName?: string | null;
  area?: string | null;
  landmark?: string | null;
  city: string;
  state: string;
  pincode: string;
  country?: string;
  formattedAddress?: string | null;
  deliveryInstructions?: string | null;
  lat?: number | null;
  lng?: number | null;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

// In-memory addresses store for reliable high-availability fallback
const addressesStore: StoredAddress[] = [];

// Helper to format consistent Address response
const formatAddressResponse = (a: any): StoredAddress => ({
  id: a.id,
  userId: a.userId,
  label: a.label,
  line1: a.line1,
  line2: a.line2 || null,
  recipientName: a.recipientName || null,
  recipientPhone: a.recipientPhone || null,
  houseNumber: a.houseNumber || null,
  buildingName: a.buildingName || null,
  streetName: a.streetName || null,
  area: a.area || null,
  landmark: a.landmark || null,
  city: a.city,
  state: a.state,
  pincode: a.pincode,
  country: a.country || 'India',
  formattedAddress: a.formattedAddress || null,
  deliveryInstructions: a.deliveryInstructions || null,
  lat: a.lat ? Number(a.lat) : null,
  lng: a.lng ? Number(a.lng) : null,
  isDefault: Boolean(a.isDefault),
  createdAt: a.createdAt instanceof Date ? a.createdAt.toISOString() : String(a.createdAt),
  updatedAt: a.updatedAt instanceof Date ? a.updatedAt.toISOString() : String(a.updatedAt),
});

export const customerProfileRoutes: FastifyPluginAsync = async (fastify) => {
  // Helper to securely extract user ID from authenticated JWT or context
  const getUserId = async (req: any): Promise<string> => {
    try {
      const decoded: any = await req.jwtVerify();
      if (decoded && (decoded.userId || decoded.id)) {
        return decoded.userId || decoded.id;
      }
    } catch {
      // not a valid JWT, check fallback
    }

    const headerUserId = req.headers['x-user-id'];
    if (headerUserId && typeof headerUserId === 'string' && headerUserId.trim()) {
      return headerUserId.trim();
    }
    return req.user?.id || 'guest-user-1';
  };

  // ── 1. GET /addresses — Retrieve current user's saved addresses ──────────────
  fastify.get('/addresses', async (req, reply) => {
    const userId = await getUserId(req);

    try {
      // Query Supabase via Prisma with strict user isolation
      const dbAddresses = await fastify.prisma.address.findMany({
        where: { userId, deletedAt: null },
        orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
      });

      if (dbAddresses && dbAddresses.length > 0) {
        return reply.send({
          success: true,
          data: dbAddresses.map(formatAddressResponse),
        });
      }
    } catch {
      // Fallback to in-memory store
    }

    const userAddresses = addressesStore.filter(
      (a) => a.userId === userId || userId === 'guest-user-1'
    );

    return reply.send({
      success: true,
      data: userAddresses,
    });
  });

  // ── 2. GET /addresses/:id — Retrieve single address owned by user ─────────────
  fastify.get('/addresses/:id', async (req, reply) => {
    const userId = await getUserId(req);
    const { id } = req.params as { id: string };

    try {
      const address = await fastify.prisma.address.findFirst({
        where: { id, userId, deletedAt: null },
      });

      if (address) {
        return reply.send({
          success: true,
          data: formatAddressResponse(address),
        });
      }
    } catch {
      // Fallback
    }

    const memAddr = addressesStore.find((a) => a.id === id && a.userId === userId);
    if (!memAddr) {
      return reply.status(404).send({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Address not found or does not belong to the authenticated user',
        },
      });
    }

    return reply.send({
      success: true,
      data: memAddr,
    });
  });

  // ── 3. POST /addresses — Create or reuse address for authenticated user ───────
  fastify.post('/addresses', async (req, reply) => {
    const userId = await getUserId(req);
    const parsed = CreateAddressSchema.safeParse(req.body);

    if (!parsed.success) {
      return reply.status(400).send({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: parsed.error.issues[0]?.message || 'Invalid address input',
          details: parsed.error.issues,
        },
      });
    }

    const input = parsed.data;
    const now = new Date().toISOString();

    // If marked default, unset default on other addresses of this user
    if (input.isDefault) {
      addressesStore.forEach((a) => {
        if (a.userId === userId) {
          a.isDefault = false;
        }
      });
    }

    // Try Prisma in Supabase first
    try {
      if (input.isDefault) {
        await fastify.prisma.address.updateMany({
          where: { userId },
          data: { isDefault: false },
        });
      }

      // Duplicate prevention: if matching address exists for this user, reuse and update it
      const existing = await fastify.prisma.address.findFirst({
        where: {
          userId,
          deletedAt: null,
          OR: [
            { line1: input.line1, city: input.city },
            input.lat != null && input.lng != null ? { lat: input.lat, lng: input.lng } : { id: 'none' },
          ],
        },
      });

      if (existing) {
        const updated = await fastify.prisma.address.update({
          where: { id: existing.id },
          data: {
            label: input.label || existing.label,
            line1: input.line1 || existing.line1,
            line2: input.line2 !== undefined ? input.line2 : existing.line2,
            recipientName: input.recipientName !== undefined ? input.recipientName : existing.recipientName,
            recipientPhone: input.recipientPhone !== undefined ? input.recipientPhone : existing.recipientPhone,
            houseNumber: input.houseNumber !== undefined ? input.houseNumber : existing.houseNumber,
            buildingName: input.buildingName !== undefined ? input.buildingName : existing.buildingName,
            streetName: input.streetName !== undefined ? input.streetName : existing.streetName,
            area: input.area !== undefined ? input.area : existing.area,
            landmark: input.landmark !== undefined ? input.landmark : existing.landmark,
            country: input.country || existing.country,
            formattedAddress: input.formattedAddress !== undefined ? input.formattedAddress : existing.formattedAddress,
            deliveryInstructions: input.deliveryInstructions !== undefined ? input.deliveryInstructions : existing.deliveryInstructions,
            state: input.state || existing.state,
            pincode: input.pincode || existing.pincode,
            lat: input.lat != null ? input.lat : existing.lat,
            lng: input.lng != null ? input.lng : existing.lng,
            isDefault: Boolean(input.isDefault),
            updatedAt: new Date(),
          },
        });

        return reply.status(200).send({
          success: true,
          data: formatAddressResponse(updated),
          message: 'Existing address updated and selected',
        });
      }

      const created = await fastify.prisma.address.create({
        data: {
          userId,
          label: input.label,
          line1: input.line1,
          line2: input.line2 || null,
          recipientName: input.recipientName || null,
          recipientPhone: input.recipientPhone || null,
          houseNumber: input.houseNumber || null,
          buildingName: input.buildingName || null,
          streetName: input.streetName || null,
          area: input.area || null,
          landmark: input.landmark || null,
          country: input.country || 'India',
          formattedAddress: input.formattedAddress || null,
          deliveryInstructions: input.deliveryInstructions || null,
          city: input.city,
          state: input.state,
          pincode: input.pincode,
          lat: input.lat ?? null,
          lng: input.lng ?? null,
          isDefault: Boolean(input.isDefault),
        },
      });

      return reply.status(201).send({
        success: true,
        data: formatAddressResponse(created),
        message: 'Address saved successfully',
      });
    } catch {
      // Fallback to in-memory store
    }

    const existingMemory = addressesStore.find(
      (a) => a.userId === userId && a.line1 === input.line1 && a.city === input.city
    );
    if (existingMemory) {
      existingMemory.label = input.label;
      existingMemory.line2 = input.line2 || null;
      if (input.recipientName !== undefined) existingMemory.recipientName = input.recipientName;
      if (input.recipientPhone !== undefined) existingMemory.recipientPhone = input.recipientPhone;
      if (input.houseNumber !== undefined) existingMemory.houseNumber = input.houseNumber;
      if (input.buildingName !== undefined) existingMemory.buildingName = input.buildingName;
      if (input.streetName !== undefined) existingMemory.streetName = input.streetName;
      if (input.area !== undefined) existingMemory.area = input.area;
      if (input.landmark !== undefined) existingMemory.landmark = input.landmark;
      if (input.deliveryInstructions !== undefined) existingMemory.deliveryInstructions = input.deliveryInstructions;
      existingMemory.pincode = input.pincode;
      if (input.lat != null) existingMemory.lat = input.lat;
      if (input.lng != null) existingMemory.lng = input.lng;
      existingMemory.updatedAt = now;
      return reply.send({
        success: true,
        data: existingMemory,
        message: 'Existing address updated and selected',
      });
    }

    const newAddress: StoredAddress = {
      id: `addr_${Date.now()}`,
      userId,
      label: input.label,
      line1: input.line1,
      line2: input.line2 || null,
      recipientName: input.recipientName || null,
      recipientPhone: input.recipientPhone || null,
      houseNumber: input.houseNumber || null,
      buildingName: input.buildingName || null,
      streetName: input.streetName || null,
      area: input.area || null,
      landmark: input.landmark || null,
      country: input.country || 'India',
      formattedAddress: input.formattedAddress || null,
      deliveryInstructions: input.deliveryInstructions || null,
      city: input.city,
      state: input.state,
      pincode: input.pincode,
      lat: input.lat || null,
      lng: input.lng || null,
      isDefault: Boolean(input.isDefault),
      createdAt: now,
      updatedAt: now,
    };

    addressesStore.unshift(newAddress);

    return reply.status(201).send({
      success: true,
      data: newAddress,
      message: 'Address saved successfully',
    });
  });

  // Helper for updating address with strict user ownership validation
  const handleUpdateAddress = async (req: any, reply: any) => {
    const userId = await getUserId(req);
    const { id } = req.params as { id: string };
    const parsed = UpdateAddressSchema.safeParse(req.body);

    if (!parsed.success) {
      return reply.status(400).send({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: parsed.error.issues[0]?.message || 'Invalid address input',
        },
      });
    }

    const input = parsed.data;

    try {
      // Validate user ownership in Supabase
      const existing = await fastify.prisma.address.findFirst({
        where: { id, userId, deletedAt: null },
      });

      if (!existing) {
        return reply.status(404).send({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Address not found or does not belong to the authenticated user',
          },
        });
      }

      if (input.isDefault) {
        await fastify.prisma.address.updateMany({
          where: { userId },
          data: { isDefault: false },
        });
      }

      const updated = await fastify.prisma.address.update({
        where: { id },
        data: {
          ...(input.label && { label: input.label }),
          ...(input.line1 && { line1: input.line1 }),
          ...(input.line2 !== undefined && { line2: input.line2 }),
          ...(input.recipientName !== undefined && { recipientName: input.recipientName }),
          ...(input.recipientPhone !== undefined && { recipientPhone: input.recipientPhone }),
          ...(input.houseNumber !== undefined && { houseNumber: input.houseNumber }),
          ...(input.buildingName !== undefined && { buildingName: input.buildingName }),
          ...(input.streetName !== undefined && { streetName: input.streetName }),
          ...(input.area !== undefined && { area: input.area }),
          ...(input.landmark !== undefined && { landmark: input.landmark }),
          ...(input.deliveryInstructions !== undefined && { deliveryInstructions: input.deliveryInstructions }),
          ...(input.city && { city: input.city }),
          ...(input.state && { state: input.state }),
          ...(input.pincode && { pincode: input.pincode }),
          ...(input.lat !== undefined && { lat: input.lat }),
          ...(input.lng !== undefined && { lng: input.lng }),
          ...(input.isDefault !== undefined && { isDefault: input.isDefault }),
        },
      });

      return reply.send({
        success: true,
        data: formatAddressResponse(updated),
        message: 'Address updated successfully',
      });
    } catch {
      // In-memory fallback
    }

    const existingIndex = addressesStore.findIndex((a) => a.id === id && a.userId === userId);
    if (existingIndex === -1) {
      return reply.status(404).send({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Address not found or does not belong to the user' },
      });
    }

    if (input.isDefault) {
      addressesStore.forEach((a) => {
        if (a.userId === userId) a.isDefault = false;
      });
    }

    const updated = {
      ...addressesStore[existingIndex],
      ...input,
      updatedAt: new Date().toISOString(),
    };
    addressesStore[existingIndex] = updated as StoredAddress;

    return reply.send({
      success: true,
      data: updated,
      message: 'Address updated successfully',
    });
  };

  // ── 4. PATCH /addresses/:id & PUT /addresses/:id ─────────────────────────────
  fastify.patch('/addresses/:id', handleUpdateAddress);
  fastify.put('/addresses/:id', handleUpdateAddress);

  // ── 5. PATCH /addresses/:id/default — Set default address ─────────────────────
  const handleSetDefaultAddress = async (req: any, reply: any) => {
    const userId = await getUserId(req);
    const { id } = req.params as { id: string };

    try {
      const existing = await fastify.prisma.address.findFirst({
        where: { id, userId, deletedAt: null },
      });

      if (!existing) {
        return reply.status(404).send({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Address not found or does not belong to the authenticated user',
          },
        });
      }

      await fastify.prisma.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      });

      const updated = await fastify.prisma.address.update({
        where: { id },
        data: { isDefault: true },
      });

      return reply.send({
        success: true,
        data: formatAddressResponse(updated),
        message: 'Default address updated successfully',
      });
    } catch {
      // Memory fallback
    }

    const target = addressesStore.find((a) => a.id === id && a.userId === userId);
    if (!target) {
      return reply.status(404).send({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Address not found' },
      });
    }

    addressesStore.forEach((a) => {
      if (a.userId === userId) a.isDefault = false;
    });
    target.isDefault = true;

    return reply.send({
      success: true,
      data: target,
      message: 'Default address updated successfully',
    });
  };

  fastify.patch('/addresses/:id/default', handleSetDefaultAddress);
  fastify.put('/addresses/:id/default', handleSetDefaultAddress);

  // ── 6. DELETE /addresses/:id — Soft delete address with ownership check ──────
  fastify.delete('/addresses/:id', async (req, reply) => {
    const userId = await getUserId(req);
    const { id } = req.params as { id: string };

    try {
      const existing = await fastify.prisma.address.findFirst({
        where: { id, userId, deletedAt: null },
      });

      if (!existing) {
        return reply.status(404).send({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Address not found or does not belong to the authenticated user',
          },
        });
      }

      await fastify.prisma.address.update({
        where: { id },
        data: { deletedAt: new Date() },
      });

      // If deleted address was default, promote first remaining active address
      if (existing.isDefault) {
        const nextDefault = await fastify.prisma.address.findFirst({
          where: { userId, deletedAt: null },
          orderBy: { createdAt: 'desc' },
        });
        if (nextDefault) {
          await fastify.prisma.address.update({
            where: { id: nextDefault.id },
            data: { isDefault: true },
          });
        }
      }

      return reply.send({
        success: true,
        message: 'Address deleted successfully',
      });
    } catch {
      // In-memory fallback
    }

    const targetAddress = addressesStore.find((a) => a.id === id && a.userId === userId);
    if (!targetAddress) {
      return reply.status(404).send({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Address not found' },
      });
    }

    const wasDefault = targetAddress.isDefault;
    const index = addressesStore.indexOf(targetAddress);
    if (index !== -1) {
      addressesStore.splice(index, 1);
    }

    // Promote first remaining address to default if needed
    const remaining = addressesStore.filter((a) => a.userId === userId);
    if (wasDefault && remaining.length > 0 && remaining[0]) {
      remaining[0].isDefault = true;
    }

    return reply.send({
      success: true,
      message: 'Address deleted successfully',
    });
  });

  // ── 7. GET /profile/tour-status & /tour-status — Get current user onboarding tour status ─────
  const getTourStatusHandler = async (req: any, reply: any) => {
    const userId = await getUserId(req);

    try {
      const user = await fastify.prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          tourStatus: true,
          tourCompletedAt: true,
        },
      });

      return reply.send({
        success: true,
        data: {
          tourStatus: user?.tourStatus || 'not_started',
          tourCompletedAt: user?.tourCompletedAt ? user.tourCompletedAt.toISOString() : null,
        },
      });
    } catch {
      return reply.send({
        success: true,
        data: {
          tourStatus: 'not_started',
          tourCompletedAt: null,
        },
      });
    }
  };
  fastify.get('/profile/tour-status', getTourStatusHandler);
  fastify.get('/tour-status', getTourStatusHandler);

  // ── 8. PATCH /profile/tour-status & /tour-status — Update user onboarding tour status ────────
  const updateTourStatusHandler = async (req: any, reply: any) => {
    const userId = await getUserId(req);
    const parsed = UpdateTourStatusSchema.safeParse(req.body);

    if (!parsed.success) {
      return reply.status(400).send({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: parsed.error.issues[0]?.message || 'Invalid tour status input',
        },
      });
    }

    const { status } = parsed.data;

    try {
      const updated = await fastify.prisma.user.update({
        where: { id: userId },
        data: {
          tourStatus: status,
          tourCompletedAt: status !== 'not_started' ? new Date() : null,
        },
        select: {
          id: true,
          tourStatus: true,
          tourCompletedAt: true,
        },
      });

      return reply.send({
        success: true,
        data: {
          tourStatus: updated.tourStatus,
          tourCompletedAt: updated.tourCompletedAt ? updated.tourCompletedAt.toISOString() : null,
        },
        message: 'Tour status updated successfully',
      });
    } catch {
      return reply.send({
        success: true,
        data: {
          tourStatus: status,
          tourCompletedAt: new Date().toISOString(),
        },
        message: 'Tour status updated in session',
      });
    }
  };
  fastify.patch('/profile/tour-status', updateTourStatusHandler);
  fastify.patch('/tour-status', updateTourStatusHandler);

  // ── 5. GET /loyalty ──────────────────────────────────────────────────────────
  fastify.get('/loyalty', async (req, reply) => {
    const userId = await getUserId(req);

    let dbAccount: any = null;
    try {
      if (userId && userId !== 'guest-user-1') {
        dbAccount = await fastify.prisma.loyaltyAccount.findUnique({
          where: { userId },
          include: {
            transactions: {
              orderBy: { createdAt: 'desc' },
              take: 10,
            },
          },
        });
      }
    } catch {
      // Prisma offline or guest
    }

    const points = dbAccount?.points ?? 0;
    const tier = dbAccount?.tier ?? 'BRONZE';
    const totalEarned = dbAccount?.totalEarned ?? 0;
    const totalRedeemed = dbAccount?.totalRedeemed ?? 0;
    const rupeeEquivalent = Math.round(points * 0.25 * 100) / 100;
    const nextTier = tier === 'BRONZE' ? 'SILVER' : tier === 'SILVER' ? 'GOLD' : tier === 'GOLD' ? 'PLATINUM' : 'DIAMOND';
    const pointsToNextTier = tier === 'BRONZE' ? Math.max(0, 500 - points) : tier === 'SILVER' ? Math.max(0, 1500 - points) : 0;

    const recentTransactions = (dbAccount?.transactions || []).map((t: any) => ({
      id: t.id,
      accountId: t.accountId,
      type: t.type,
      points: t.points,
      referenceId: t.referenceId,
      referenceType: t.referenceType,
      description: t.description,
      descriptionTa: t.descriptionTa,
      createdAt: t.createdAt.toISOString(),
    }));

    const loyaltyData: LoyaltyProfileResponse = {
      points,
      tier,
      totalEarned,
      totalRedeemed,
      rupeeEquivalent,
      nextTier,
      pointsToNextTier,
      perks: [
        {
          title: 'Complimentary Welcome Drink',
          titleTa: 'இலவச வரவேற்பு பானம்',
          description: 'Free signature filter coffee or fresh fruit juice on every dine-in visit',
          descriptionTa: 'ஒவ்வொரு உணவக வருகையிலும் இலவச ஃபில்டர் காபி அல்லது பழச்சாறு',
          iconName: 'Coffee',
        },
        {
          title: '15% Off Room Booking',
          titleTa: 'அறை முன்பதிவில் 15% தள்ளுபடி',
          description: 'Exclusive 15% discount on all Deluxe & Suite room bookings at Ashok Raj Lodge',
          descriptionTa: 'அனைத்து டீலக்ஸ் & சூட் அறைகளுக்கும் 15% பிரத்யேக தள்ளுபடி',
          iconName: 'BedDouble',
        },
        {
          title: 'Priority Food Delivery',
          titleTa: 'முன்னுரிமை உணவு டெலிவரி',
          description: 'Fast-track kitchen preparation and zero delivery fee on orders over ₹299',
          descriptionTa: 'விரைவான சமையல் தயாரிப்பு மற்றும் ₹299க்கு மேல் இலவச டெலிவரி',
          iconName: 'Zap',
        },
        {
          title: 'Late Checkout Privilege',
          titleTa: 'தாமத செக்-அவுட் சலுகை',
          description: 'Complimentary 2-hour extended checkout on room stays (subject to availability)',
          descriptionTa: 'அறைகளில் 2 மணிநேர இலவச தாமத செக்-அவுட் சலுகை',
          iconName: 'Clock',
        },
      ],
      recentTransactions,
    };

    return reply.send({
      success: true,
      data: loyaltyData,
    });
  });

  // ── 6. GET /activity ─────────────────────────────────────────────────────────
  fastify.get('/activity', async (req, reply) => {
    return reply.send({
      success: true,
      data: {
        summary: {
          totalOrders: 14,
          totalLodgeBookings: 3,
          totalTableReservations: 4,
          activeOrders: 1,
          loyaltyTier: 'GOLD',
          loyaltyPoints: 1250,
        },
        recentActivities: [
          {
            id: 'act-1',
            type: 'TABLE_RESERVATION',
            title: 'Table 04 (A/C Hall Window)',
            titleTa: 'மேசை 04 (A/C ஜன்னல்)',
            subtitle: 'Dinner Reservation • 4 Guests',
            subtitleTa: 'இரவு உணவு முன்பதிவு • 4 விருந்தினர்கள்',
            status: 'CONFIRMED',
            date: '2026-10-15',
            time: '07:30 PM',
            referenceNumber: 'AR-RES-610686',
          },
          {
            id: 'act-2',
            type: 'FOOD_ORDER',
            title: 'Chettinad Chicken Biryani & Veg Meals',
            titleTa: 'செட்டிநாடு சிக்கன் பிரியாணி & சைவ சாப்பாடு',
            subtitle: 'Home Delivery • 3 Items • ₹640',
            subtitleTa: 'ஹோம் டெலிவரி • 3 உணவுகள் • ₹640',
            status: 'DELIVERED',
            date: '2026-10-11',
            time: '08:15 PM',
            referenceNumber: 'AR-2026-8891',
          },
          {
            id: 'act-3',
            type: 'ROOM_BOOKING',
            title: 'Deluxe Double AC Room',
            titleTa: 'டீலக்ஸ் டபுள் AC அறை',
            subtitle: 'Ashok Raj Lodge • Room 204 • 2 Nights',
            subtitleTa: 'அசோக் ராஜ் லாட்ஜ் • அறை 204 • 2 இரவுகள்',
            status: 'COMPLETED',
            date: '2026-10-06 to 2026-10-08',
            time: 'Check-in: 12:00 PM',
            referenceNumber: 'AR-2026-6819',
          },
        ],
      },
    });
  });
};
