import type { FastifyPluginAsync } from 'fastify';
import {
  CreateDeliveryZoneSchema,
  UpdateDeliveryZoneSchema,
  EstimateDeliveryFeeSchema,
  AssignDeliveryPartnerSchema,
  VerifyDeliveryOtpSchema,
  UpdatePartnerLocationSchema,
  CancelDeliveryOrderSchema,
  DriverLoginSchema,
  DriverStatusToggleSchema,
  DriverTaskRejectSchema,
} from '@ashok-raj/validation';
import type {
  DeliveryZone,
  DeliveryPartner,
  DeliveryRecord,
  DeliveryTrackingInfo,
  DeliveryFeeEstimate,
  OrderStatus,
  DriverActiveTask,
  PartnerAvailableDelivery,
  PartnerEarningsSummary,
} from '@ashok-raj/types';
import { DELIVERY } from '@ashok-raj/config';
import { requireRoles } from '../plugins/authGuard.js';

export const deliveryRoutes: FastifyPluginAsync = async (app) => {
  // ── In-memory Operational Store for Fast Dispatch & Mock Mode ─────────────
  const inMemoryZones: Map<string, DeliveryZone> = new Map();
  const inMemoryPartners: Map<string, DeliveryPartner> = new Map();
  const inMemoryDeliveries: Map<string, DeliveryRecord> = new Map();

  // Helper: WebSocket broadcaster for delivery events
  const broadcastDeliveryEvent = (event: string, payload: any) => {
    try {
      const websocketServer = (app as any).websocketServer;
      if (websocketServer && websocketServer.clients) {
        const message = JSON.stringify({
          channel: 'delivery',
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
      app.log.warn({ err }, 'Delivery WebSocket broadcast warning');
    }
  };

  // Helper: Seed initial sample zones and drivers if empty
  const initDeliveryData = () => {
    if (inMemoryZones.size === 0) {
      DELIVERY.ZONES.forEach((z) => {
        inMemoryZones.set(z.id, {
          ...z,
          pincodes: [...z.pincodes],
          branchId: 'branch-kalaiyarkoil',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      });
    }

    if (inMemoryPartners.size === 0) {
      const samplePartners: DeliveryPartner[] = [
        {
          id: 'driver-101',
          userId: 'user-drv-101',
          name: 'Murugan Selvam',
          phone: '9842199881',
          vehicleType: 'BIKE',
          vehicleNumber: 'TN 63 AB 4589',
          isOnline: true,
          isVerified: true,
          currentLat: 9.8452,
          currentLng: 78.6541,
          rating: 4.9,
          totalDeliveries: 342,
          activeDeliveryId: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'driver-102',
          userId: 'user-drv-102',
          name: 'Kavin Kumar',
          phone: '9842199882',
          vehicleType: 'SCOOTER',
          vehicleNumber: 'TN 63 BC 1204',
          isOnline: true,
          isVerified: true,
          currentLat: 9.8485,
          currentLng: 78.6512,
          rating: 4.8,
          totalDeliveries: 215,
          activeDeliveryId: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'driver-103',
          userId: 'user-drv-103',
          name: 'Senthil Nathan',
          phone: '9842199883',
          vehicleType: 'BIKE',
          vehicleNumber: 'TN 63 D 8821',
          isOnline: false,
          isVerified: true,
          currentLat: 9.841,
          currentLng: 78.659,
          rating: 4.7,
          totalDeliveries: 189,
          activeDeliveryId: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      samplePartners.forEach((p) => inMemoryPartners.set(p.id, p));
    }

    if (inMemoryDeliveries.size === 0) {
      const sampleDeliveries: DeliveryRecord[] = [
        {
          id: 'del-201',
          orderId: 'ord-del-101',
          partnerId: 'driver-101',
          deliveryAddressId: 'addr-1',
          zoneId: 'zone-kalaiyarkoil-town',
          status: 'EN_ROUTE',
          estimatedDeliveryAt: new Date(Date.now() + 1000 * 60 * 18).toISOString(),
          distanceKm: 2.8,
          deliveryFee: 25,
          assignedAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
          pickedUpAt: new Date(Date.now() - 1000 * 60 * 6).toISOString(),
          otp: '482915',
          order: {
            id: 'ord-del-101',
            orderNumber: 'AR-DEL-8801',
            branchId: 'branch-kalaiyarkoil',
            userId: 'cust-1',
            type: 'HOME_DELIVERY',
            status: 'OUT_FOR_DELIVERY',
            subtotal: 380,
            taxAmount: 19,
            deliveryFee: 0,
            discountAmount: 0,
            total: 399,
            paymentStatus: 'PAID',
            paymentMethod: 'UPI',
            notes: 'Please do not ring bell, baby is sleeping',
            items: [
              {
                id: 'item-1',
                menuItemId: 'item-biryani-1',
                name: 'Chettinad Chicken Biryani',
                nameTa: 'செட்டிநாடு சிக்கன் பிரியாணி',
                price: 260,
                quantity: 1,
                subtotal: 260,
              },
              {
                id: 'item-2',
                menuItemId: 'item-parotta-1',
                name: 'Madurai Bun Parotta (2 pcs)',
                nameTa: 'மதுரை பன் பரோட்டா',
                price: 120,
                quantity: 1,
                subtotal: 120,
              },
            ],
            createdAt: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
            updatedAt: new Date().toISOString(),
          },
          deliveryAddress: {
            id: 'addr-1',
            userId: 'cust-1',
            label: 'Home',
            line1: 'No 45, Sivan Koil North Car Street',
            line2: 'Near Raja Theatres',
            city: 'Kalaiyarkoil',
            state: 'Tamil Nadu',
            pincode: '630551',
            lat: 9.8465 as any,
            lng: 78.6535 as any,
            isDefault: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            deletedAt: null,
          },
          createdAt: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
          updatedAt: new Date().toISOString(),
          statusHistory: [
            {
              id: 'hist-1',
              deliveryId: 'del-201',
              status: 'PENDING',
              note: 'Order placed by customer',
              createdAt: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
            },
            {
              id: 'hist-2',
              deliveryId: 'del-201',
              status: 'ASSIGNED',
              note: 'Assigned to driver Murugan Selvam',
              createdAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
            },
            {
              id: 'hist-3',
              deliveryId: 'del-201',
              status: 'PICKED_UP',
              note: 'Order picked up from Ashok Raj kitchen',
              createdAt: new Date(Date.now() - 1000 * 60 * 6).toISOString(),
            },
            {
              id: 'hist-4',
              deliveryId: 'del-201',
              status: 'EN_ROUTE',
              note: 'Driver is on the way to customer location',
              createdAt: new Date(Date.now() - 1000 * 60 * 4).toISOString(),
            },
          ],
        },
      ];

      sampleDeliveries.forEach((d) => inMemoryDeliveries.set(d.id, d));
      inMemoryPartners.get('driver-101')!.activeDeliveryId = 'del-201';
    }
  };

  initDeliveryData();

  // Helper: Role-Based Address Filter (Address Privacy Protection)
  const sanitizeAddressForRole = (
    delivery: DeliveryRecord,
    requesterRole?: string,
    requesterUserId?: string
  ) => {
    const isElevatedStaff =
      requesterRole === 'ADMIN' ||
      requesterRole === 'SUPER_ADMIN' ||
      requesterRole === 'MANAGER';

    const isAssignedPartner =
      requesterRole === 'DELIVERY_PARTNER' &&
      delivery.partner?.userId === requesterUserId;

    const isCustomerOwner =
      delivery.order?.userId === requesterUserId ||
      (!requesterUserId && process.env['NODE_ENV'] !== 'production');

    // If kitchen or waiter staff or unassigned driver -> redact address
    if (!isElevatedStaff && !isAssignedPartner && !isCustomerOwner) {
      return {
        ...delivery,
        deliveryAddress: delivery.deliveryAddress
          ? {
              ...delivery.deliveryAddress,
              line1: '*** Redacted (Authorized Personnel Only) ***',
              line2: null,
              city: delivery.deliveryAddress.city,
              pincode: delivery.deliveryAddress.pincode,
            }
          : undefined,
        otp: undefined, // Redact delivery OTP from non-owners
      };
    }

    // For assigned driver: provide address, but hide OTP (driver must request OTP from customer on arrival)
    if (isAssignedPartner && !isCustomerOwner && !isElevatedStaff) {
      return {
        ...delivery,
        otp: undefined, // Driver must ask customer for OTP
      };
    }

    return delivery;
  };

  // Helper: Match delivery zone by pincode or radius
  const findMatchingZone = (pincode?: string, _lat?: number, _lng?: number): DeliveryZone => {
    const activeZones = Array.from(inMemoryZones.values()).filter((z) => z.isActive);
    if (pincode) {
      const match = activeZones.find((z) => z.pincodes.includes(pincode.trim()));
      if (match) return match;
    }
    // Default to Town core zone
    return (
      activeZones[0] || {
        id: 'zone-default',
        branchId: 'branch-kalaiyarkoil',
        name: 'Kalaiyarkoil Town Core',
        nameTa: 'காளையார்கோவில் நகர் மையம்',
        baseFee: 25,
        minOrderAmount: 100,
        freeDeliveryThreshold: 250,
        estimatedDeliveryMinutes: 30,
        radiusKm: 5,
        pincodes: ['630551'],
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    );
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // 1. PUBLIC & CUSTOMER DELIVERY APIS
  // ═══════════════════════════════════════════════════════════════════════════

  // ── GET /zones — List All Active Delivery Zones ───────────────────────────
  app.get('/zones', async (_req, reply) => {
    let zones = Array.from(inMemoryZones.values()).filter((z) => z.isActive);
    try {
      if (app.prisma && (app.prisma as any).deliveryZone) {
        const dbZones = await (app.prisma as any).deliveryZone.findMany({
          where: { isActive: true },
          orderBy: { baseFee: 'asc' },
        });
        if (dbZones && dbZones.length > 0) {
          zones = dbZones.map((z: any) => ({
            ...z,
            baseFee: Number(z.baseFee),
            minOrderAmount: Number(z.minOrderAmount),
            freeDeliveryThreshold: Number(z.freeDeliveryThreshold),
            radiusKm: Number(z.radiusKm),
          }));
        }
      }
    } catch {
      // Use in-memory
    }

    return reply.send({
      success: true,
      data: zones,
    });
  });

  // ── POST /estimate-fee — Dynamic Delivery Fee & Threshold Calculation ─────
  app.post('/estimate-fee', async (req, reply) => {
    const parseResult = EstimateDeliveryFeeSchema.safeParse(req.body);
    if (!parseResult.success) {
      return reply.status(422).send({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid estimate inputs', details: parseResult.error.errors },
      });
    }

    const { subtotal, pincode, lat, lng } = parseResult.data;
    const zone = findMatchingZone(pincode, lat, lng);

    const isDeliverable = true;
    const isFreeDelivery = subtotal >= zone.freeDeliveryThreshold;
    const deliveryFee = isFreeDelivery ? 0 : zone.baseFee;
    const amountNeededForFreeDelivery = Math.max(0, zone.freeDeliveryThreshold - subtotal);

    const estimate: DeliveryFeeEstimate = {
      zoneId: zone.id,
      zoneName: zone.name,
      zoneNameTa: zone.nameTa,
      deliveryFee,
      baseFee: zone.baseFee,
      minOrderAmount: zone.minOrderAmount,
      freeDeliveryThreshold: zone.freeDeliveryThreshold,
      isFreeDelivery,
      amountNeededForFreeDelivery,
      estimatedDeliveryMinutes: zone.estimatedDeliveryMinutes,
      isDeliverable,
    };

    return reply.send({
      success: true,
      data: estimate,
    });
  });

  // ── GET /track/:orderId — Live Customer Delivery Tracking & Timeline ──────
  app.get('/track/:orderId', async (req, reply) => {
    const { orderId } = req.params as { orderId: string };
    const requesterRole = (req as any).user?.role || (req.headers['x-staff-role'] as string) || 'CUSTOMER';
    const requesterUserId = (req as any).user?.userId;

    let delivery = Array.from(inMemoryDeliveries.values()).find(
      (d) => d.orderId === orderId || d.id === orderId
    );

    if (!delivery) {
      return reply.status(404).send({
        success: false,
        error: { code: 'DELIVERY_NOT_FOUND', message: 'Delivery tracking not found for this order' },
      });
    }

    // Role-based data sanitization
    const sanitized = sanitizeAddressForRole(delivery, requesterRole, requesterUserId);
    const partner = delivery.partnerId ? inMemoryPartners.get(delivery.partnerId) : null;

    // Build standard 5-step customer flow timeline
    const orderStatus = (delivery.order?.status || 'PLACED') as OrderStatus;
    const deliveryStatus = delivery.status;

    const timeline: DeliveryTrackingInfo['timeline'] = [
      {
        step: 'PLACED',
        title: 'Order Placed',
        titleTa: 'ஆர்டர் பெறப்பட்டது',
        description: 'Restaurant has received your order',
        timestamp: delivery.createdAt,
        isCompleted: true,
        isCurrent: orderStatus === 'PLACED' || orderStatus === 'PENDING',
      },
      {
        step: 'ACCEPTED',
        title: 'Restaurant Confirmed',
        titleTa: 'உணவகம் உறுதிப்படுத்தியது',
        description: 'Your order is confirmed and sent to kitchen',
        timestamp: delivery.assignedAt || delivery.createdAt,
        isCompleted: ['ACCEPTED', 'PREPARING', 'READY', 'ASSIGNED', 'PICKED_UP', 'EN_ROUTE', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(orderStatus),
        isCurrent: orderStatus === 'ACCEPTED',
      },
      {
        step: 'PREPARING',
        title: 'Kitchen Preparing',
        titleTa: 'சமையலறையில் தயாராகிறது',
        description: 'Chef is cooking your fresh Chettinad dishes',
        isCompleted: ['PREPARING', 'READY', 'ASSIGNED', 'PICKED_UP', 'EN_ROUTE', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(orderStatus),
        isCurrent: orderStatus === 'PREPARING',
      },
      {
        step: 'READY',
        title: 'Food Packed & Ready',
        titleTa: 'உணவு பேக் செய்யப்பட்டு தயார்',
        description: 'Packed hot and ready for delivery partner pickup',
        isCompleted: ['READY', 'ASSIGNED', 'PICKED_UP', 'EN_ROUTE', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(orderStatus) || deliveryStatus !== 'PENDING',
        isCurrent: orderStatus === 'READY' && deliveryStatus === 'PENDING',
      },
      {
        step: 'ASSIGNED',
        title: partner ? `Partner Assigned: ${partner.name}` : 'Assigning Delivery Partner',
        titleTa: partner ? `டெலிவரி பார்ட்னர்: ${partner.name}` : 'டெலிவரி பார்ட்னர் ஒதுக்கப்படுகிறார்',
        description: partner ? `Vehicle: ${partner.vehicleNumber || partner.vehicleType}` : 'Searching nearest available driver',
        timestamp: delivery.assignedAt,
        isCompleted: ['ASSIGNED', 'PICKED_UP', 'EN_ROUTE', 'DELIVERED'].includes(deliveryStatus),
        isCurrent: deliveryStatus === 'ASSIGNED',
      },
      {
        step: 'PICKED_UP',
        title: 'Order Picked Up',
        titleTa: 'ஆர்டர் எடுக்கப்பட்டது',
        description: 'Delivery partner has collected your package from restaurant',
        timestamp: delivery.pickedUpAt,
        isCompleted: ['PICKED_UP', 'EN_ROUTE', 'DELIVERED'].includes(deliveryStatus),
        isCurrent: deliveryStatus === 'PICKED_UP',
      },
      {
        step: 'EN_ROUTE',
        title: 'On The Way (En Route)',
        titleTa: 'உங்கள் முகவரிக்கு வருகிறது',
        description: 'Partner is driving towards your delivery address',
        isCompleted: deliveryStatus === 'EN_ROUTE' || deliveryStatus === 'DELIVERED',
        isCurrent: deliveryStatus === 'EN_ROUTE',
      },
      {
        step: 'DELIVERED',
        title: 'Order Delivered',
        titleTa: 'வெற்றிகரமாக டெலிவரி செய்யப்பட்டது',
        description: 'Delivered safely. Enjoy your meal!',
        timestamp: delivery.actualDeliveryAt,
        isCompleted: deliveryStatus === 'DELIVERED',
        isCurrent: deliveryStatus === 'DELIVERED',
      },
    ];

    // Cancellation Rules: Allowed only if order is in PLACED or PENDING status before kitchen cooking
    const cancellationAllowed = orderStatus === 'PLACED' || orderStatus === 'PENDING';

    const trackingInfo: DeliveryTrackingInfo = {
      orderId: delivery.orderId,
      orderNumber: delivery.order?.orderNumber || `AR-DEL-${delivery.orderId.slice(-4)}`,
      status: orderStatus,
      deliveryStatus,
      estimatedDeliveryAt: delivery.estimatedDeliveryAt,
      estimatedDeliveryMinutes: 20,
      elapsedMinutes: Math.max(0, Math.floor((Date.now() - new Date(delivery.createdAt).getTime()) / 60000)),
      deliveryFee: delivery.deliveryFee,
      otp: sanitized.otp, // Only visible to owning customer
      partner: partner
        ? {
            id: partner.id,
            name: partner.name || 'Delivery Hero',
            phoneMasked: partner.phone ? `${partner.phone.slice(0, 2)}******${partner.phone.slice(-2)}` : '98****88',
            phone: partner.phone,
            vehicleType: partner.vehicleType,
            vehicleNumber: partner.vehicleNumber,
            rating: partner.rating,
            currentLat: partner.currentLat,
            currentLng: partner.currentLng,
          }
        : null,
      deliveryAddress: sanitized.deliveryAddress
        ? {
            label: sanitized.deliveryAddress.label,
            line1: sanitized.deliveryAddress.line1,
            line2: sanitized.deliveryAddress.line2,
            city: sanitized.deliveryAddress.city,
            pincode: sanitized.deliveryAddress.pincode,
          }
        : null,
      timeline,
      cancellationAllowed,
      cancellationReason: delivery.cancellationReason,
    };

    return reply.send({
      success: true,
      data: trackingInfo,
    });
  });

  // ── POST /orders/:id/cancel — Strict Delivery Cancellation Policy ─────────
  app.post('/orders/:id/cancel', async (req, reply) => {
    const { id } = req.params as { id: string };
    const parseResult = CancelDeliveryOrderSchema.safeParse(req.body);
    if (!parseResult.success) {
      return reply.status(422).send({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Cancellation reason is required', details: parseResult.error.errors },
      });
    }

    const { reason } = parseResult.data;
    const delivery = Array.from(inMemoryDeliveries.values()).find(
      (d) => d.orderId === id || d.id === id
    );

    if (!delivery) {
      return reply.status(404).send({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Delivery order not found' },
      });
    }

    // Cancellation Policy Enforcement
    const orderStatus = delivery.order?.status || 'PLACED';
    if (orderStatus === 'PREPARING' || orderStatus === 'READY' || orderStatus === 'PICKED_UP' || orderStatus === 'OUT_FOR_DELIVERY') {
      return reply.status(400).send({
        success: false,
        error: {
          code: 'CANCELLATION_RESTRICTED',
          message: 'This order cannot be cancelled as kitchen preparation or delivery has already commenced. Please contact restaurant support at 04575 232 333.',
          messageTa: 'சமையல் அல்லது விநியோகம் ஏற்கனவே துவங்கிவிட்டதால் இந்த ஆர்டரை ரத்து செய்ய இயலாது. உணவக ஆதரவை தொடர்பு கொள்ளவும்: 04575 232 333.',
        },
      });
    }

    // Process Cancellation
    delivery.status = 'CANCELLED';
    delivery.cancellationReason = reason;
    if (delivery.order) {
      delivery.order.status = 'CANCELLED';
    }

    // Free up partner if assigned
    if (delivery.partnerId && inMemoryPartners.has(delivery.partnerId)) {
      const partner = inMemoryPartners.get(delivery.partnerId)!;
      partner.activeDeliveryId = null;
    }

    delivery.statusHistory?.push({
      id: `hist-${Date.now()}`,
      deliveryId: delivery.id,
      status: 'CANCELLED',
      note: `Cancelled: ${reason}`,
      createdAt: new Date().toISOString(),
    });

    broadcastDeliveryEvent('delivery:cancelled', {
      orderId: delivery.orderId,
      deliveryId: delivery.id,
      reason,
    });

    return reply.send({
      success: true,
      message: 'Delivery order cancelled successfully',
      data: delivery,
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 2. DELIVERY PARTNER FLEET APIS
  // ═══════════════════════════════════════════════════════════════════════════

  // ── POST /partner/login — Delivery Partner Phone / PIN Authentication ─────
  app.post('/partner/login', async (req, reply) => {
    const parseResult = DriverLoginSchema.safeParse(req.body);
    if (!parseResult.success) {
      return reply.status(422).send({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Valid 10-digit mobile number is required', details: parseResult.error.errors },
      });
    }

    const { phone } = parseResult.data;
    let partner = Array.from(inMemoryPartners.values()).find((p) => p.phone === phone);

    if (!partner) {
      // Create registered partner profile if first time
      const id = `driver-${Date.now().toString().slice(-4)}`;
      partner = {
        id,
        userId: `user-${id}`,
        name: `Driver (${phone.slice(-4)})`,
        phone,
        vehicleType: 'BIKE',
        vehicleNumber: 'TN 63 NEW',
        isOnline: true,
        isVerified: true,
        currentLat: 9.8445,
        currentLng: 78.6545,
        rating: 4.8,
        totalDeliveries: 0,
        activeDeliveryId: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      inMemoryPartners.set(id, partner);
    }

    const token = `mock-jwt-token-driver-${partner.id}`;

    return reply.send({
      success: true,
      message: 'Driver logged in successfully',
      data: {
        token,
        partner,
      },
    });
  });

  // ── GET /partner/profile — Active Partner Profile & Status ─────────────────
  app.get(
    '/partner/profile',
    { preHandler: [requireRoles('DELIVERY_PARTNER', 'ADMIN', 'MANAGER', 'SUPER_ADMIN')] },
    async (req, reply) => {
      const partnerUserId = (req as any).staffContext?.userId || 'user-drv-101';
      const partner = Array.from(inMemoryPartners.values()).find(
        (p) => p.userId === partnerUserId || p.id === partnerUserId || p.phone === (req.query as any)?.phone
      ) || inMemoryPartners.get('driver-101');

      if (!partner) {
        return reply.status(404).send({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Driver profile not found' },
        });
      }

      return reply.send({
        success: true,
        data: partner,
      });
    }
  );

  // ── POST /partner/status — Toggle Driver Online / Offline Status ──────────
  app.post(
    '/partner/status',
    { preHandler: [requireRoles('DELIVERY_PARTNER', 'ADMIN', 'MANAGER', 'SUPER_ADMIN')] },
    async (req, reply) => {
      const parseResult = DriverStatusToggleSchema.safeParse(req.body);
      if (!parseResult.success) {
        return reply.status(422).send({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'Invalid status toggle input', details: parseResult.error.errors },
        });
      }

      const { isOnline, lat, lng } = parseResult.data;
      const partnerUserId = (req as any).staffContext?.userId || 'user-drv-101';
      const partner = Array.from(inMemoryPartners.values()).find(
        (p) => p.userId === partnerUserId || p.id === partnerUserId || p.phone === (req.body as any)?.phone
      ) || inMemoryPartners.get('driver-101');

      if (!partner) {
        return reply.status(404).send({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Driver profile not found' },
        });
      }

      partner.isOnline = isOnline;
      if (typeof lat === 'number') partner.currentLat = lat;
      if (typeof lng === 'number') partner.currentLng = lng;
      partner.updatedAt = new Date().toISOString();

      broadcastDeliveryEvent('delivery:partner_status_changed', {
        partnerId: partner.id,
        isOnline: partner.isOnline,
        lat: partner.currentLat,
        lng: partner.currentLng,
      });

      return reply.send({
        success: true,
        message: `Driver status is now ${isOnline ? 'ONLINE' : 'OFFLINE'}`,
        data: partner,
      });
    }
  );

  // ── GET /partner/available-deliveries — Incoming Deliveries Radar ──────────
  app.get(
    '/partner/available-deliveries',
    { preHandler: [requireRoles('DELIVERY_PARTNER', 'ADMIN', 'MANAGER', 'SUPER_ADMIN')] },
    async (_req, reply) => {
      const availableList: PartnerAvailableDelivery[] = [];

      for (const d of inMemoryDeliveries.values()) {
        // Unassigned deliveries ready for pickup
        if (!d.partnerId && d.status !== 'DELIVERED' && d.status !== 'CANCELLED') {
          const zone = d.zoneId ? inMemoryZones.get(d.zoneId) : null;
          const itemsSummary = (d.order?.items || [])
            .map((it: any) => `${it.quantity}x ${it.name}`)
            .join(', ') || 'Chettinad Special Meal';

          const distanceKm = d.distanceKm || 3.2;
          const payoutAmount = Math.max(35, Math.round(35 + (distanceKm - 1.5) * 8));

          availableList.push({
            deliveryId: d.id,
            orderId: d.orderId,
            orderNumber: d.order?.orderNumber || 'AR-DEL-8800',
            zoneName: zone?.name || 'Kalaiyarkoil Town Core',
            zoneNameTa: zone?.nameTa || 'காளையார்கோவில் நகர் மையம்',
            distanceKm,
            payoutAmount,
            itemCount: d.order?.items?.length || 2,
            itemsSummary,
            restaurantDistanceKm: 0.8,
            customerDistanceKm: distanceKm,
            estimatedMinutes: zone?.estimatedDeliveryMinutes || 25,
            createdAt: d.createdAt,
          });
        }
      }

      // If list is empty in mock demo, provide a sample pending delivery
      if (availableList.length === 0) {
        availableList.push({
          deliveryId: 'del-demo-99',
          orderId: 'ord-demo-99',
          orderNumber: 'AR-DEL-8899',
          zoneName: 'Kalaiyarkoil Town Core',
          zoneNameTa: 'காளையார்கோவில் நகர் மையம்',
          distanceKm: 2.4,
          payoutAmount: 42,
          itemCount: 3,
          itemsSummary: '2x Chettinad Chicken Biryani, 1x Parotta Set',
          restaurantDistanceKm: 0.5,
          customerDistanceKm: 2.4,
          estimatedMinutes: 20,
          createdAt: new Date().toISOString(),
        });
      }

      return reply.send({
        success: true,
        data: availableList,
      });
    }
  );

  // ── POST /partner/tasks/:deliveryId/accept — Accept Order ──────────────────
  app.post(
    '/partner/tasks/:deliveryId/accept',
    { preHandler: [requireRoles('DELIVERY_PARTNER', 'ADMIN', 'MANAGER', 'SUPER_ADMIN')] },
    async (req, reply) => {
      const { deliveryId } = req.params as { deliveryId: string };
      const partnerUserId = (req as any).staffContext?.userId || 'user-drv-101';
      const partner = Array.from(inMemoryPartners.values()).find(
        (p) => p.userId === partnerUserId || p.id === partnerUserId
      ) || inMemoryPartners.get('driver-101');

      if (!partner) {
        return reply.status(404).send({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Driver profile not found' },
        });
      }

      let delivery = inMemoryDeliveries.get(deliveryId);
      if (!delivery && deliveryId === 'del-demo-99') {
        // Create the demo delivery
        delivery = {
          id: 'del-demo-99',
          orderId: 'ord-demo-99',
          partnerId: partner.id,
          deliveryAddressId: 'addr-demo-99',
          zoneId: 'zone-kalaiyarkoil-town',
          status: 'ASSIGNED',
          estimatedDeliveryAt: new Date(Date.now() + 1000 * 60 * 20).toISOString(),
          distanceKm: 2.4,
          deliveryFee: 25,
          assignedAt: new Date().toISOString(),
          otp: '592814',
          order: {
            id: 'ord-demo-99',
            orderNumber: 'AR-DEL-8899',
            branchId: 'branch-kalaiyarkoil',
            userId: 'cust-demo-99',
            type: 'HOME_DELIVERY',
            status: 'ACCEPTED',
            subtotal: 480,
            taxAmount: 24,
            deliveryFee: 0,
            discountAmount: 0,
            total: 504,
            paymentStatus: 'PAID',
            paymentMethod: 'UPI',
            items: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          deliveryAddress: {
            id: 'addr-demo-99',
            userId: 'cust-demo-99',
            label: 'Home',
            line1: '12, Car Street, Near Kallal Road',
            city: 'Kalaiyarkoil',
            state: 'Tamil Nadu',
            pincode: '630551',
            isDefault: true,
            deletedAt: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          statusHistory: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        inMemoryDeliveries.set(delivery.id, delivery);
      }

      if (!delivery) {
        return reply.status(404).send({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Delivery not found' },
        });
      }

      if (delivery.partnerId && delivery.partnerId !== partner.id) {
        return reply.status(409).send({
          success: false,
          error: { code: 'ALREADY_ASSIGNED', message: 'This delivery has already been assigned to another partner' },
        });
      }

      delivery.partnerId = partner.id;
      delivery.status = 'ASSIGNED';
      delivery.assignedAt = new Date().toISOString();
      partner.activeDeliveryId = delivery.id;

      delivery.statusHistory?.push({
        id: `hist-${Date.now()}`,
        deliveryId: delivery.id,
        status: 'ASSIGNED',
        note: `Accepted by driver: ${partner.name}`,
        createdAt: new Date().toISOString(),
      });

      broadcastDeliveryEvent('delivery:assigned', {
        orderId: delivery.orderId,
        deliveryId: delivery.id,
        partnerId: partner.id,
        partnerName: partner.name,
      });

      return reply.send({
        success: true,
        message: 'Delivery accepted successfully!',
        data: delivery,
      });
    }
  );

  // ── POST /partner/tasks/:deliveryId/reject — Reject / Pass Order ───────────
  app.post(
    '/partner/tasks/:deliveryId/reject',
    { preHandler: [requireRoles('DELIVERY_PARTNER', 'ADMIN', 'MANAGER', 'SUPER_ADMIN')] },
    async (req, reply) => {
      const { deliveryId } = req.params as { deliveryId: string };
      const parseResult = DriverTaskRejectSchema.safeParse(req.body);
      const reason = parseResult.success ? parseResult.data.reason : 'Passed by partner';

      const delivery = inMemoryDeliveries.get(deliveryId);
      if (delivery && delivery.partnerId) {
        const partner = inMemoryPartners.get(delivery.partnerId);
        if (partner) {
          partner.activeDeliveryId = null;
        }
        delivery.partnerId = null;
        delivery.status = 'PENDING';
      }

      return reply.send({
        success: true,
        message: 'Delivery order passed',
        data: { deliveryId, reason },
      });
    }
  );

  // ── GET /partner/active-task — Partner Assigned Active Delivery Details ────
  app.get(
    '/partner/active-task',
    { preHandler: [requireRoles('DELIVERY_PARTNER', 'ADMIN', 'MANAGER', 'SUPER_ADMIN')] },
    async (req, reply) => {
      const partnerUserId = (req as any).staffContext?.userId || 'user-drv-101';
      const partner = Array.from(inMemoryPartners.values()).find(
        (p) => p.userId === partnerUserId || p.id === partnerUserId
      ) || inMemoryPartners.get('driver-101');

      if (!partner || !partner.activeDeliveryId) {
        return reply.send({
          success: true,
          data: null,
          message: 'No active delivery task currently assigned',
        });
      }

      const delivery = inMemoryDeliveries.get(partner.activeDeliveryId);
      if (!delivery) {
        return reply.send({ success: true, data: null });
      }

      // Kalaiyarkoil Restaurant Coordinates (Ashok Raj Lodge & Restaurant)
      const restaurantCoordinate = {
        lat: 9.8436,
        lng: 78.6548,
      };

      // Customer Destination Coordinates
      const customerCoordinate = {
        lat: 9.8482,
        lng: 78.6585,
      };

      const driverLocation = {
        lat: partner.currentLat || 9.8445,
        lng: partner.currentLng || 78.6545,
      };

      // Simulated Waypoints Polyline connecting Restaurant -> Driver -> Customer
      const routeCoordinates = [
        restaurantCoordinate,
        { lat: 9.8442, lng: 78.6552 },
        driverLocation,
        { lat: 9.8465, lng: 78.6568 },
        customerCoordinate,
      ];

      // Determine stage
      let stage: DriverActiveTask['stage'] = 'NAVIGATING_TO_RESTAURANT';
      if (delivery.status === 'ASSIGNED') {
        stage = 'NAVIGATING_TO_RESTAURANT';
      } else if (delivery.order?.status === 'PREPARING') {
        stage = 'WAITING_FOR_KITCHEN';
      } else if (delivery.status === 'PICKED_UP' || delivery.status === 'EN_ROUTE') {
        stage = 'PICKED_UP_ON_WAY';
      } else if (delivery.status === 'DELIVERED') {
        stage = 'COMPLETED';
      }

      const itemsSummary = (delivery.order?.items || [])
        .map((it: any) => `${it.quantity}x ${it.name}`)
        .join(', ') || '2x Chettinad Biryani, 1x Kal Dosa';

      const distanceKm = delivery.distanceKm || 2.8;
      const payoutAmount = Math.max(35, Math.round(35 + (distanceKm - 1.5) * 8));

      const activeTask: DriverActiveTask = {
        deliveryId: delivery.id,
        orderId: delivery.orderId,
        orderNumber: delivery.order?.orderNumber || 'AR-DEL-8801',
        status: delivery.status,
        orderStatus: delivery.order?.status || 'ACCEPTED',
        stage,
        restaurant: {
          name: 'Ashok Raj Lodge & Restaurant',
          address: 'Madurai-Thondi Main Road, Kalaiyarkoil, Tamil Nadu 630551',
          phone: '04575 232 333',
          coordinate: restaurantCoordinate,
        },
        customer: {
          nameMasked: 'S. Ramkumar (Customer)',
          phoneMasked: '98******81',
          phone: '9842199881',
          address: {
            label: delivery.deliveryAddress?.label || 'Home',
            line1: delivery.deliveryAddress?.line1 || 'No 45, Sivan Koil North Car Street',
            line2: delivery.deliveryAddress?.line2 || 'Near Raja Theatres',
            city: delivery.deliveryAddress?.city || 'Kalaiyarkoil',
            pincode: delivery.deliveryAddress?.pincode || '630551',
          },
          coordinate: customerCoordinate,
        },
        driverLocation,
        routeCoordinates,
        distanceKm,
        estimatedDeliveryMinutes: 18,
        payoutAmount,
        itemsSummary,
        itemCount: delivery.order?.items?.length || 2,
        totalOrderAmount: delivery.order?.total || 399,
        paymentMethod: delivery.order?.paymentMethod || 'UPI',
        paymentStatus: delivery.order?.paymentStatus || 'PAID',
        specialInstructions: 'Please do not ring the bell, call on arrival.',
        assignedAt: delivery.assignedAt || delivery.createdAt,
        pickedUpAt: delivery.pickedUpAt,
      };

      return reply.send({
        success: true,
        data: activeTask,
      });
    }
  );

  // ── POST /partner/location — Driver Real-time GPS Location Broadcast ──────
  app.post(
    '/partner/location',
    { preHandler: [requireRoles('DELIVERY_PARTNER', 'ADMIN', 'MANAGER', 'SUPER_ADMIN')] },
    async (req, reply) => {
      const parseResult = UpdatePartnerLocationSchema.safeParse(req.body);
      if (!parseResult.success) {
        return reply.status(422).send({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'Invalid GPS coordinates', details: parseResult.error.errors },
        });
      }

      const { lat, lng, isOnline } = parseResult.data;
      const partnerUserId = (req as any).staffContext?.userId || 'user-drv-101';
      const partner = Array.from(inMemoryPartners.values()).find(
        (p) => p.userId === partnerUserId || p.id === partnerUserId
      ) || inMemoryPartners.get('driver-101');

      if (partner) {
        partner.currentLat = lat;
        partner.currentLng = lng;
        if (typeof isOnline === 'boolean') partner.isOnline = isOnline;
        partner.updatedAt = new Date().toISOString();

        // If driver has active delivery, broadcast live coordinates to tracking client
        if (partner.activeDeliveryId) {
          const delivery = inMemoryDeliveries.get(partner.activeDeliveryId);
          if (delivery) {
            broadcastDeliveryEvent('delivery:location_update', {
              orderId: delivery.orderId,
              deliveryId: delivery.id,
              partnerId: partner.id,
              lat,
              lng,
            });
          }
        }
      }

      return reply.send({
        success: true,
        message: 'Location updated',
        data: partner,
      });
    }
  );

  // ── POST /tasks/:deliveryId/pickup — Mark Food Collected From Restaurant ──
  app.post(
    '/tasks/:deliveryId/pickup',
    { preHandler: [requireRoles('DELIVERY_PARTNER', 'ADMIN', 'MANAGER', 'SUPER_ADMIN')] },
    async (req, reply) => {
      const { deliveryId } = req.params as { deliveryId: string };
      const delivery = inMemoryDeliveries.get(deliveryId);

      if (!delivery) {
        return reply.status(404).send({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Delivery not found' },
        });
      }

      delivery.status = 'PICKED_UP';
      delivery.pickedUpAt = new Date().toISOString();
      if (delivery.order) {
        delivery.order.status = 'PICKED_UP';
      }

      delivery.statusHistory?.push({
        id: `hist-${Date.now()}`,
        deliveryId,
        status: 'PICKED_UP',
        note: 'Order picked up from kitchen counter',
        createdAt: new Date().toISOString(),
      });

      broadcastDeliveryEvent('delivery:status_changed', {
        orderId: delivery.orderId,
        deliveryId,
        status: 'PICKED_UP',
      });

      return reply.send({
        success: true,
        message: 'Order marked as PICKED_UP',
        data: delivery,
      });
    }
  );

  // ── POST /tasks/:deliveryId/en-route — Start Trip to Customer ────────────
  app.post(
    '/tasks/:deliveryId/en-route',
    { preHandler: [requireRoles('DELIVERY_PARTNER', 'ADMIN', 'MANAGER', 'SUPER_ADMIN')] },
    async (req, reply) => {
      const { deliveryId } = req.params as { deliveryId: string };
      const delivery = inMemoryDeliveries.get(deliveryId);

      if (!delivery) {
        return reply.status(404).send({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Delivery not found' },
        });
      }

      delivery.status = 'EN_ROUTE';
      if (delivery.order) {
        delivery.order.status = 'OUT_FOR_DELIVERY';
      }

      delivery.statusHistory?.push({
        id: `hist-${Date.now()}`,
        deliveryId,
        status: 'EN_ROUTE',
        note: 'Partner is driving towards customer destination',
        createdAt: new Date().toISOString(),
      });

      broadcastDeliveryEvent('delivery:status_changed', {
        orderId: delivery.orderId,
        deliveryId,
        status: 'EN_ROUTE',
      });

      return reply.send({
        success: true,
        message: 'Delivery status changed to EN_ROUTE',
        data: delivery,
      });
    }
  );

  // ── POST /tasks/:deliveryId/complete — Verify Customer OTP & Finish ───────
  app.post(
    '/tasks/:deliveryId/complete',
    { preHandler: [requireRoles('DELIVERY_PARTNER', 'ADMIN', 'MANAGER', 'SUPER_ADMIN')] },
    async (req, reply) => {
      const { deliveryId } = req.params as { deliveryId: string };
      const parseResult = VerifyDeliveryOtpSchema.safeParse(req.body);
      if (!parseResult.success) {
        return reply.status(422).send({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'Invalid delivery OTP input', details: parseResult.error.errors },
        });
      }

      const { otp, note } = parseResult.data;
      const delivery = inMemoryDeliveries.get(deliveryId);

      if (!delivery) {
        return reply.status(404).send({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Delivery not found' },
        });
      }

      // Verify OTP (Secure confirmation of delivery hand-off)
      if (delivery.otp && delivery.otp !== otp.trim()) {
        return reply.status(400).send({
          success: false,
          error: {
            code: 'INVALID_OTP',
            message: 'Incorrect Delivery OTP provided. Please request the 6-digit code shown on the customer app.',
            messageTa: 'தவறான டெலிவரி OTP. வாடிக்கையாளர் மொபைல் செயலியில் உள்ள 6 இலக்க குறியீட்டை கேட்கவும்.',
          },
        });
      }

      delivery.status = 'DELIVERED';
      delivery.actualDeliveryAt = new Date().toISOString();
      if (delivery.order) {
        delivery.order.status = 'DELIVERED';
        delivery.order.paymentStatus = 'PAID';
      }

      // Increment partner stats & free up active delivery
      if (delivery.partnerId && inMemoryPartners.has(delivery.partnerId)) {
        const partner = inMemoryPartners.get(delivery.partnerId)!;
        partner.totalDeliveries += 1;
        partner.activeDeliveryId = null;
      }

      delivery.statusHistory?.push({
        id: `hist-${Date.now()}`,
        deliveryId,
        status: 'DELIVERED',
        note: note || 'Verified via customer OTP & marked delivered',
        createdAt: new Date().toISOString(),
      });

      broadcastDeliveryEvent('delivery:completed', {
        orderId: delivery.orderId,
        deliveryId,
        status: 'DELIVERED',
        deliveredAt: delivery.actualDeliveryAt,
      });

      return reply.send({
        success: true,
        message: 'Delivery successfully verified and completed!',
        data: delivery,
      });
    }
  );

  // ── GET /partner/earnings — Driver Daily / Weekly Payout Breakdown ─────────
  app.get(
    '/partner/earnings',
    { preHandler: [requireRoles('DELIVERY_PARTNER', 'ADMIN', 'MANAGER', 'SUPER_ADMIN')] },
    async (req, reply) => {
      const partnerUserId = (req as any).staffContext?.userId || 'user-drv-101';
      const partner = Array.from(inMemoryPartners.values()).find(
        (p) => p.userId === partnerUserId || p.id === partnerUserId
      ) || inMemoryPartners.get('driver-101');

      const earningsSummary: PartnerEarningsSummary = {
        todayEarnings: 680,
        tripsCount: 14,
        onlineHours: 5.5,
        basePay: 490,
        tips: 90,
        distanceIncentives: 100,
        weeklyTotal: 4250,
        recentDeliveries: [
          {
            id: 'trip-101',
            orderNumber: 'AR-DEL-8798',
            deliveredAt: 'Today, 01:15 PM',
            payout: 45,
            tip: 20,
            distanceKm: 2.6,
            customerRating: 5,
          },
          {
            id: 'trip-102',
            orderNumber: 'AR-DEL-8785',
            deliveredAt: 'Today, 12:40 PM',
            payout: 50,
            tip: 0,
            distanceKm: 3.4,
            customerRating: 5,
          },
          {
            id: 'trip-103',
            orderNumber: 'AR-DEL-8772',
            deliveredAt: 'Today, 11:55 AM',
            payout: 40,
            tip: 10,
            distanceKm: 2.1,
            customerRating: 4,
          },
        ],
      };

      return reply.send({
        success: true,
        data: earningsSummary,
      });
    }
  );

  // ── GET /partner/history — Driver Completed Trip Log ───────────────────────
  app.get(
    '/partner/history',
    { preHandler: [requireRoles('DELIVERY_PARTNER', 'ADMIN', 'MANAGER', 'SUPER_ADMIN')] },
    async (_req, reply) => {
      const history = [
        {
          id: 'del-hist-1',
          orderNumber: 'AR-DEL-8798',
          customerName: 'K. Ramesh',
          area: 'Sivan Koil Street',
          payout: 45,
          tip: 20,
          deliveredAt: 'Today, 01:15 PM',
          items: '2x Mutton Biryani, 1x Pepper Chicken',
          rating: 5,
        },
        {
          id: 'del-hist-2',
          orderNumber: 'AR-DEL-8785',
          customerName: 'M. Anand',
          area: 'Sivagangai Road',
          payout: 50,
          tip: 0,
          deliveredAt: 'Today, 12:40 PM',
          items: '4x Parotta, 1x Chettinad Chicken Gravy',
          rating: 5,
        },
        {
          id: 'del-hist-3',
          orderNumber: 'AR-DEL-8772',
          customerName: 'S. Priya',
          area: 'Kallal Road',
          payout: 40,
          tip: 10,
          deliveredAt: 'Today, 11:55 AM',
          items: '1x Veg Meals, 2x Paneer Butter Masala',
          rating: 4,
        },
      ];

      return reply.send({
        success: true,
        data: history,
      });
    }
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // 3. ADMIN & DISPATCHER MANAGEMENT APIS
  // ═══════════════════════════════════════════════════════════════════════════

  // ── GET /admin/deliveries — Real-time Fleet Dispatch Overview ──────────────
  app.get(
    '/admin/deliveries',
    { preHandler: [requireRoles('ADMIN', 'MANAGER', 'SUPER_ADMIN')] },
    async (_req, reply) => {
      const deliveries = Array.from(inMemoryDeliveries.values()).sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      const metrics = {
        totalToday: deliveries.length,
        activeCount: deliveries.filter((d) => d.status !== 'DELIVERED' && d.status !== 'CANCELLED').length,
        pendingAssignment: deliveries.filter((d) => d.status === 'PENDING').length,
        enRouteCount: deliveries.filter((d) => d.status === 'EN_ROUTE').length,
        deliveredToday: deliveries.filter((d) => d.status === 'DELIVERED').length,
        onlineDrivers: Array.from(inMemoryPartners.values()).filter((p) => p.isOnline).length,
      };

      return reply.send({
        success: true,
        data: {
          deliveries,
          metrics,
        },
      });
    }
  );

  // ── GET /admin/partners — Fleet Partner List & Status ─────────────────────
  app.get(
    '/admin/partners',
    { preHandler: [requireRoles('ADMIN', 'MANAGER', 'SUPER_ADMIN')] },
    async (_req, reply) => {
      const partners = Array.from(inMemoryPartners.values());
      return reply.send({
        success: true,
        data: partners,
      });
    }
  );

  // ── POST /admin/assign — Intelligent Partner Auto/Manual Dispatch Engine ───
  app.post(
    '/admin/assign',
    { preHandler: [requireRoles('ADMIN', 'MANAGER', 'SUPER_ADMIN')] },
    async (req, reply) => {
      const parseResult = AssignDeliveryPartnerSchema.safeParse(req.body);
      if (!parseResult.success) {
        return reply.status(422).send({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'Invalid assignment parameters', details: parseResult.error.errors },
        });
      }

      const { orderId, partnerId, notes } = parseResult.data;
      let delivery = Array.from(inMemoryDeliveries.values()).find(
        (d) => d.orderId === orderId || d.id === orderId
      );

      if (!delivery) {
        // Create fresh delivery record if not exists
        delivery = {
          id: `del-${Date.now()}`,
          orderId,
          status: 'PENDING',
          deliveryFee: 25,
          otp: Math.floor(100000 + Math.random() * 900000).toString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          statusHistory: [],
        };
        inMemoryDeliveries.set(delivery.id, delivery);
      }

      let targetPartner: DeliveryPartner | undefined;

      if (partnerId) {
        // Manual assignment
        targetPartner = inMemoryPartners.get(partnerId);
        if (!targetPartner) {
          return reply.status(404).send({
            success: false,
            error: { code: 'PARTNER_NOT_FOUND', message: 'Selected delivery partner not found' },
          });
        }
      } else {
        // Auto-assignment algorithm:
        // Filter online, verified drivers without active deliveries, sort by highest rating
        const availableDrivers = Array.from(inMemoryPartners.values())
          .filter((p) => p.isOnline && p.isVerified && !p.activeDeliveryId)
          .sort((a, b) => b.rating - a.rating);

        if (availableDrivers.length === 0) {
          // Fallback: Pick any online driver
          const onlineDrivers = Array.from(inMemoryPartners.values()).filter((p) => p.isOnline);
          if (onlineDrivers.length === 0) {
            return reply.status(400).send({
              success: false,
              error: {
                code: 'NO_DRIVERS_AVAILABLE',
                message: 'No delivery drivers are currently online. Please notify on-call fleet.',
              },
            });
          }
          targetPartner = onlineDrivers[0];
        } else {
          targetPartner = availableDrivers[0];
        }
      }

      if (!targetPartner) {
        return reply.status(400).send({
          success: false,
          error: { code: 'ASSIGNMENT_FAILED', message: 'Could not resolve partner' },
        });
      }

      // Update Delivery
      delivery.partnerId = targetPartner.id;
      delivery.status = 'ASSIGNED';
      delivery.assignedAt = new Date().toISOString();
      targetPartner.activeDeliveryId = delivery.id;

      delivery.statusHistory?.push({
        id: `hist-${Date.now()}`,
        deliveryId: delivery.id,
        status: 'ASSIGNED',
        note: notes || `Assigned to ${targetPartner.name} (${targetPartner.vehicleType})`,
        createdAt: new Date().toISOString(),
      });

      broadcastDeliveryEvent('delivery:assigned', {
        orderId: delivery.orderId,
        deliveryId: delivery.id,
        partner: {
          id: targetPartner.id,
          name: targetPartner.name,
          phone: targetPartner.phone,
          vehicleType: targetPartner.vehicleType,
          vehicleNumber: targetPartner.vehicleNumber,
        },
      });

      return reply.send({
        success: true,
        message: `Assigned successfully to ${targetPartner.name}`,
        data: {
          delivery,
          partner: targetPartner,
        },
      });
    }
  );

  // ── POST /admin/zones — Create Delivery Zone ──────────────────────────────
  app.post(
    '/admin/zones',
    { preHandler: [requireRoles('ADMIN', 'MANAGER', 'SUPER_ADMIN')] },
    async (req, reply) => {
      const parseResult = CreateDeliveryZoneSchema.safeParse(req.body);
      if (!parseResult.success) {
        return reply.status(422).send({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'Invalid zone data', details: parseResult.error.errors },
        });
      }

      const data = parseResult.data;
      const id = `zone-${Date.now()}`;
      const newZone: DeliveryZone = {
        id,
        branchId: data.branchId || 'branch-kalaiyarkoil',
        name: data.name,
        nameTa: data.nameTa,
        baseFee: data.baseFee,
        minOrderAmount: data.minOrderAmount,
        freeDeliveryThreshold: data.freeDeliveryThreshold,
        estimatedDeliveryMinutes: data.estimatedDeliveryMinutes,
        radiusKm: data.radiusKm,
        pincodes: data.pincodes,
        isActive: data.isActive,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      inMemoryZones.set(id, newZone);

      return reply.status(201).send({
        success: true,
        message: 'Delivery zone created successfully',
        data: newZone,
      });
    }
  );

  // ── PATCH /admin/zones/:id — Update Delivery Zone ─────────────────────────
  app.patch(
    '/admin/zones/:id',
    { preHandler: [requireRoles('ADMIN', 'MANAGER', 'SUPER_ADMIN')] },
    async (req, reply) => {
      const { id } = req.params as { id: string };
      const parseResult = UpdateDeliveryZoneSchema.safeParse(req.body);
      if (!parseResult.success) {
        return reply.status(422).send({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'Invalid update inputs', details: parseResult.error.errors },
        });
      }

      const zone = inMemoryZones.get(id);
      if (!zone) {
        return reply.status(404).send({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Delivery zone not found' },
        });
      }

      Object.assign(zone, parseResult.data);
      zone.updatedAt = new Date().toISOString();

      return reply.send({
        success: true,
        message: 'Delivery zone updated successfully',
        data: zone,
      });
    }
  );

  app.log.info('Phase 8 Delivery Routes Registered');
};
