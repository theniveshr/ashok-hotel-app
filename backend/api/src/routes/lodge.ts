import type { FastifyPluginAsync } from 'fastify';
import {
  CreateRoomTypeSchema,
  UpdateRoomTypeSchema,
  CreateRoomSchema,
  UpdateRoomSchema,
  UpdateRoomStatusSchema,
  CreateAmenitySchema,
  CreateMaintenanceSchema,
  UpdateMaintenanceSchema,
  SearchRoomsSchema,
  UpdateLodgePolicySchema,
  AddRoomPhotoSchema,
} from '@ashok-raj/validation';
import type {
  RoomType,
  Room,
  Amenity,
  RoomPhoto,
  RoomMaintenance,
  LodgePolicy,
  FrontDeskRackSummary,
  RoomStatus,
} from '@ashok-raj/types';
import { LODGE, ROOM, TAX } from '@ashok-raj/config';
import { requireRoles } from '../plugins/authGuard.js';

export const lodgeRoutes: FastifyPluginAsync = async (app) => {
  // ── In-Memory Lodge Inventory Store ───────────────────────────────────────
  const inMemoryRoomTypes: Map<string, RoomType> = new Map();
  const inMemoryRooms: Map<string, Room> = new Map();
  const inMemoryAmenities: Map<string, Amenity> = new Map();
  const inMemoryPhotos: Map<string, RoomPhoto[]> = new Map();
  const inMemoryMaintenance: Map<string, RoomMaintenance> = new Map();
  let lodgePolicy: LodgePolicy = {
    id: 'policy-kalaiyarkoil',
    branchId: 'branch-kalaiyarkoil',
    checkInTime: LODGE.DEFAULT_POLICY.checkInTime,
    checkOutTime: LODGE.DEFAULT_POLICY.checkOutTime,
    cancellationPolicy: LODGE.DEFAULT_POLICY.cancellationPolicy,
    cancellationPolicyTa: LODGE.DEFAULT_POLICY.cancellationPolicyTa,
    childPolicy: LODGE.DEFAULT_POLICY.childPolicy,
    childPolicyTa: LODGE.DEFAULT_POLICY.childPolicyTa,
    idProofRequired: LODGE.DEFAULT_POLICY.idProofRequired,
    smokingAllowed: LODGE.DEFAULT_POLICY.smokingAllowed,
    petsAllowed: LODGE.DEFAULT_POLICY.petsAllowed,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // Helper: Broadcast WebSocket Events
  const broadcastLodgeEvent = (event: string, payload: any) => {
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
      app.log.warn({ err }, 'Lodge WebSocket broadcast warning');
    }
  };

  // Initialize Default Lodge Inventory Data
  const initLodgeData = () => {
    if (inMemoryRoomTypes.size === 0) {
      LODGE.DEFAULT_ROOM_TYPES.forEach((rt) => {
        inMemoryRoomTypes.set(rt.id, {
          id: rt.id,
          branchId: 'branch-kalaiyarkoil',
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

    if (inMemoryAmenities.size === 0) {
      LODGE.STANDARD_AMENITIES.forEach((am, idx) => {
        const id = `amenity-${idx + 1}`;
        inMemoryAmenities.set(id, {
          id,
          name: am.name,
          nameTa: am.nameTa,
          icon: am.icon,
          category: am.category as any,
          isPaid: false,
          price: 0,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      });
    }

    if (inMemoryRooms.size === 0) {
      // Seed 14 Rooms across 3 floors with diverse 7 operational states
      const sampleRooms: Array<{ number: string; floor: number; typeId: string; status: RoomStatus; notes?: string }> = [
        // Floor 1 (Ground)
        { number: '101', floor: 1, typeId: 'rt-standard-ac', status: 'AVAILABLE', notes: 'Near Lobby & Garden' },
        { number: '102', floor: 1, typeId: 'rt-standard-ac', status: 'OCCUPIED', notes: 'Checked in today, 2 guests' },
        { number: '103', floor: 1, typeId: 'rt-deluxe-ac', status: 'CLEANING', notes: 'Guest checked out 11:00 AM' },
        { number: '104', floor: 1, typeId: 'rt-deluxe-ac', status: 'INSPECTED', notes: 'Linen fresh, ready for clearance' },
        { number: '105', floor: 1, typeId: 'rt-family-suite', status: 'RESERVED', notes: 'Arrival expected at 04:00 PM' },

        // Floor 2
        { number: '201', floor: 2, typeId: 'rt-deluxe-ac', status: 'AVAILABLE', notes: 'Pool Facing' },
        { number: '202', floor: 2, typeId: 'rt-deluxe-ac', status: 'OCCUPIED', notes: 'VIP Guest' },
        { number: '203', floor: 2, typeId: 'rt-standard-ac', status: 'MAINTENANCE', notes: 'AC thermostat servicing' },
        { number: '204', floor: 2, typeId: 'rt-standard-ac', status: 'AVAILABLE' },
        { number: '205', floor: 2, typeId: 'rt-family-suite', status: 'OCCUPIED', notes: 'Family 4 guests' },

        // Floor 3
        { number: '301', floor: 3, typeId: 'rt-family-suite', status: 'AVAILABLE', notes: 'Highway View Top Floor' },
        { number: '302', floor: 3, typeId: 'rt-deluxe-ac', status: 'BLOCKED', notes: 'Reserved for group event' },
        { number: '303', floor: 3, typeId: 'rt-deluxe-ac', status: 'AVAILABLE' },
        { number: '304', floor: 3, typeId: 'rt-standard-ac', status: 'AVAILABLE' },
      ];

      sampleRooms.forEach((sr) => {
        const id = `room-${sr.number}`;
        const roomType = inMemoryRoomTypes.get(sr.typeId);
        inMemoryRooms.set(id, {
          id,
          branchId: 'branch-kalaiyarkoil',
          roomNumber: sr.number,
          floor: sr.floor,
          typeId: sr.typeId,
          status: sr.status,
          notes: sr.notes || null,
          lastCleanedAt: sr.status === 'AVAILABLE' || sr.status === 'INSPECTED' ? new Date(Date.now() - 1000 * 60 * 60).toISOString() : null,
          lastInspectedAt: sr.status === 'AVAILABLE' ? new Date(Date.now() - 1000 * 60 * 30).toISOString() : null,
          isActive: true,
          type: roomType,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      });
    }

    if (inMemoryMaintenance.size === 0) {
      inMemoryMaintenance.set('maint-1', {
        id: 'maint-1',
        roomId: 'room-203',
        type: 'AC',
        issue: 'AC thermostat cooling sensor fluctuation',
        issueTa: 'ஏசி சென்சார் பழுது பார்க்கப்படுகிறது',
        priority: 'HIGH',
        status: 'IN_PROGRESS',
        cost: 650,
        reportedBy: 'Receptionist Sangeetha',
        assignedTo: 'AC Tech Saravanan',
        notes: 'Replacement capacitor arriving today 2 PM',
        startedAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
        createdAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
  };

  initLodgeData();

  // ═══════════════════════════════════════════════════════════════════════════
  // 1. CUSTOMER PUBLIC APIS
  // ═══════════════════════════════════════════════════════════════════════════

  // ── GET /room-types — List Active Room Types ──────────────────────────────
  app.get('/room-types', async (_req, reply) => {
    initLodgeData();
    const roomTypes = Array.from(inMemoryRoomTypes.values())
      .filter((rt) => rt.isActive)
      .map((rt) => {
        // Calculate available room count for this type
        const totalRooms = Array.from(inMemoryRooms.values()).filter((r) => r.typeId === rt.id && r.isActive).length;
        const availableRooms = Array.from(inMemoryRooms.values()).filter((r) => r.typeId === rt.id && r.status === 'AVAILABLE' && r.isActive).length;

        return {
          ...rt,
          totalRooms,
          availableRooms,
          isAvailableNow: availableRooms > 0,
        };
      });

    return reply.send({
      success: true,
      data: roomTypes,
    });
  });

  // ── GET /room-types/:id — Room Type Details & Photos ──────────────────────
  app.get('/room-types/:id', async (req, reply) => {
    initLodgeData();
    const { id } = req.params as { id: string };
    const roomType = inMemoryRoomTypes.get(id);

    if (!roomType) {
      return reply.status(404).send({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Room type not found' },
      });
    }

    const photos = inMemoryPhotos.get(id) || [];
    const availableRooms = Array.from(inMemoryRooms.values()).filter(
      (r) => r.typeId === id && r.status === 'AVAILABLE' && r.isActive
    ).length;

    return reply.send({
      success: true,
      data: {
        ...roomType,
        photos,
        availableRooms,
        policy: lodgePolicy,
      },
    });
  });

  // ── POST /search-availability — Search Rooms for Given Date Range ────────
  app.post('/search-availability', async (req, reply) => {
    initLodgeData();
    const parseResult = SearchRoomsSchema.safeParse(req.body);
    if (!parseResult.success) {
      return reply.status(422).send({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid search parameters', details: parseResult.error.errors },
      });
    }

    const { checkInDate, checkOutDate, guests, roomTypeId, maxPrice } = parseResult.data;

    // Calculate nights
    const inDate = new Date(checkInDate);
    const outDate = new Date(checkOutDate);
    const diffTime = Math.abs(outDate.getTime() - inDate.getTime());
    const nights = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

    let matchingTypes = Array.from(inMemoryRoomTypes.values()).filter((rt) => rt.isActive && rt.maxOccupancy >= guests);

    if (roomTypeId) {
      matchingTypes = matchingTypes.filter((rt) => rt.id === roomTypeId);
    }

    if (maxPrice) {
      matchingTypes = matchingTypes.filter((rt) => rt.basePrice <= maxPrice);
    }

    const results = matchingTypes.map((rt) => {
      const availableRoomsCount = Array.from(inMemoryRooms.values()).filter(
        (r) => r.typeId === rt.id && r.status !== 'MAINTENANCE' && r.status !== 'BLOCKED' && r.isActive
      ).length;

      const baseAmount = rt.basePrice * nights;
      const taxAmount = Math.round(baseAmount * TAX.ROOM_GST_RATE * 100) / 100;
      const totalAmount = baseAmount + taxAmount;

      return {
        roomType: rt,
        nights,
        checkInDate,
        checkOutDate,
        guests,
        availableRoomsCount,
        isAvailable: availableRoomsCount > 0,
        pricing: {
          pricePerNight: rt.basePrice,
          baseAmount,
          gstRate: TAX.ROOM_GST_RATE,
          taxAmount,
          totalAmount,
        },
      };
    });

    return reply.send({
      success: true,
      data: {
        checkInDate,
        checkOutDate,
        nights,
        guests,
        results,
      },
    });
  });

  // ── GET /amenities — List Public Amenities ────────────────────────────────
  app.get('/amenities', async (_req, reply) => {
    initLodgeData();
    const amenities = Array.from(inMemoryAmenities.values()).filter((a) => a.isActive);
    return reply.send({
      success: true,
      data: amenities,
    });
  });

  // ── GET /policies — Public Lodge Policies ─────────────────────────────────
  app.get('/policies', async (_req, reply) => {
    initLodgeData();
    return reply.send({
      success: true,
      data: lodgePolicy,
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 2. ADMIN & FRONT-DESK OPERATIONS APIS
  // ═══════════════════════════════════════════════════════════════════════════

  // ── GET /admin/frontdesk — Live Room Rack & Floor Overview ────────────────
  app.get(
    '/admin/frontdesk',
    { preHandler: [requireRoles('ADMIN', 'MANAGER', 'RECEPTIONIST', 'SUPER_ADMIN')] },
    async (_req, reply) => {
      initLodgeData();
      const allRooms = Array.from(inMemoryRooms.values()).filter((r) => r.isActive);

      const statusCounts = {
        totalRooms: allRooms.length,
        available: allRooms.filter((r) => r.status === 'AVAILABLE').length,
        reserved: allRooms.filter((r) => r.status === 'RESERVED').length,
        occupied: allRooms.filter((r) => r.status === 'OCCUPIED').length,
        cleaning: allRooms.filter((r) => r.status === 'CLEANING').length,
        inspected: allRooms.filter((r) => r.status === 'INSPECTED').length,
        maintenance: allRooms.filter((r) => r.status === 'MAINTENANCE').length,
        blocked: allRooms.filter((r) => r.status === 'BLOCKED').length,
      };

      const occupancyRate = statusCounts.totalRooms > 0
        ? Math.round(((statusCounts.occupied + statusCounts.reserved) / statusCounts.totalRooms) * 100)
        : 0;

      // Group rooms by floor
      const floorMap = new Map<number, Room[]>();
      allRooms.forEach((r) => {
        const list = floorMap.get(r.floor) || [];
        list.push({
          ...r,
          type: r.typeId ? inMemoryRoomTypes.get(r.typeId) : undefined,
        });
        floorMap.set(r.floor, list);
      });

      const floors = Array.from(floorMap.entries())
        .sort(([a], [b]) => a - b)
        .map(([floorNumber, rooms]) => ({
          floorNumber,
          floorName: floorNumber === 1 ? 'Ground Floor (தரைத்தளம்)' : `Floor ${floorNumber} (${floorNumber}-ஆம் தளம்)`,
          rooms: rooms.sort((a, b) => a.roomNumber.localeCompare(b.roomNumber)),
        }));

      const summary: FrontDeskRackSummary = {
        ...statusCounts,
        occupancyRate,
        floors,
      };

      return reply.send({
        success: true,
        data: summary,
      });
    }
  );

  // ── POST /admin/room-types — Create Room Type ──────────────────────────────
  app.post(
    '/admin/room-types',
    { preHandler: [requireRoles('ADMIN', 'MANAGER', 'SUPER_ADMIN')] },
    async (req, reply) => {
      initLodgeData();
      const parseResult = CreateRoomTypeSchema.safeParse(req.body);
      if (!parseResult.success) {
        return reply.status(422).send({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'Invalid room type input', details: parseResult.error.errors },
        });
      }

      const data = parseResult.data;
      const id = `rt-${Date.now()}`;
      const newRoomType: RoomType = {
        id,
        branchId: 'branch-kalaiyarkoil',
        name: data.name,
        nameTa: data.nameTa,
        description: data.description,
        descriptionTa: data.descriptionTa,
        basePrice: data.basePrice,
        weekendPrice: data.weekendPrice || null,
        maxOccupancy: data.maxOccupancy,
        bedType: data.bedType,
        sizeSqFt: data.sizeSqFt || null,
        imageUrls: data.imageUrls || [],
        amenities: data.amenities || [],
        amenitiesTa: data.amenitiesTa || [],
        isActive: data.isActive ?? true,
        displayOrder: data.displayOrder || inMemoryRoomTypes.size + 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      inMemoryRoomTypes.set(id, newRoomType);
      broadcastLodgeEvent('lodge:room_type_created', newRoomType);

      return reply.status(201).send({
        success: true,
        message: 'Room type created successfully',
        data: newRoomType,
      });
    }
  );

  // ── PUT /admin/room-types/:id — Update Room Type ───────────────────────────
  app.put(
    '/admin/room-types/:id',
    { preHandler: [requireRoles('ADMIN', 'MANAGER', 'SUPER_ADMIN')] },
    async (req, reply) => {
      initLodgeData();
      const { id } = req.params as { id: string };
      const parseResult = UpdateRoomTypeSchema.safeParse(req.body);
      if (!parseResult.success) {
        return reply.status(422).send({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'Invalid room type update data', details: parseResult.error.errors },
        });
      }

      const existing = inMemoryRoomTypes.get(id);
      if (!existing) {
        return reply.status(404).send({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Room type not found' },
        });
      }

      const updated: RoomType = {
        ...existing,
        ...parseResult.data,
        basePrice: parseResult.data.basePrice ?? existing.basePrice,
        maxOccupancy: parseResult.data.maxOccupancy ?? existing.maxOccupancy,
        amenities: parseResult.data.amenities ?? existing.amenities,
        updatedAt: new Date().toISOString(),
      };

      inMemoryRoomTypes.set(id, updated);
      broadcastLodgeEvent('lodge:room_type_updated', updated);

      return reply.send({
        success: true,
        message: 'Room type updated successfully',
        data: updated,
      });
    }
  );

  // ── POST /admin/rooms — Create Physical Room ──────────────────────────────
  app.post(
    '/admin/rooms',
    { preHandler: [requireRoles('ADMIN', 'MANAGER', 'SUPER_ADMIN')] },
    async (req, reply) => {
      initLodgeData();
      const parseResult = CreateRoomSchema.safeParse(req.body);
      if (!parseResult.success) {
        return reply.status(422).send({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'Invalid room input', details: parseResult.error.errors },
        });
      }

      const { roomNumber, floor, typeId, status, notes, isActive } = parseResult.data;
      const roomType = inMemoryRoomTypes.get(typeId);
      if (!roomType) {
        return reply.status(404).send({
          success: false,
          error: { code: 'ROOM_TYPE_NOT_FOUND', message: 'Selected room type does not exist' },
        });
      }

      const id = `room-${roomNumber}`;
      if (inMemoryRooms.has(id)) {
        return reply.status(409).send({
          success: false,
          error: { code: 'ROOM_ALREADY_EXISTS', message: `Room #${roomNumber} already exists in inventory` },
        });
      }

      const newRoom: Room = {
        id,
        branchId: 'branch-kalaiyarkoil',
        roomNumber,
        floor,
        typeId,
        status,
        notes: notes || null,
        isActive: isActive ?? true,
        type: roomType,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      inMemoryRooms.set(id, newRoom);
      broadcastLodgeEvent('lodge:room_created', newRoom);

      return reply.status(201).send({
        success: true,
        message: `Room #${roomNumber} added to inventory`,
        data: newRoom,
      });
    }
  );

  // ── PATCH /admin/rooms/:id/status — 1-Click State Bump / Transition ───────
  app.patch(
    '/admin/rooms/:id/status',
    { preHandler: [requireRoles('ADMIN', 'MANAGER', 'RECEPTIONIST', 'SUPER_ADMIN')] },
    async (req, reply) => {
      initLodgeData();
      const { id } = req.params as { id: string };
      const parseResult = UpdateRoomStatusSchema.safeParse(req.body);
      if (!parseResult.success) {
        return reply.status(422).send({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'Valid room status is required', details: parseResult.error.errors },
        });
      }

      const { status, notes } = parseResult.data;
      const room = inMemoryRooms.get(id) || Array.from(inMemoryRooms.values()).find((r) => r.roomNumber === id);

      if (!room) {
        return reply.status(404).send({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Room not found' },
        });
      }

      const previousStatus = room.status;
      room.status = status;
      if (notes) room.notes = notes;
      if (status === 'CLEANING') room.lastCleanedAt = new Date().toISOString();
      if (status === 'INSPECTED' || status === 'AVAILABLE') room.lastInspectedAt = new Date().toISOString();
      room.updatedAt = new Date().toISOString();

      broadcastLodgeEvent('lodge:room_status_changed', {
        roomId: room.id,
        roomNumber: room.roomNumber,
        previousStatus,
        newStatus: status,
      });

      return reply.send({
        success: true,
        message: `Room #${room.roomNumber} status updated to ${status}`,
        data: room,
      });
    }
  );

  // ── POST /admin/maintenance — Log Room Maintenance Ticket ─────────────────
  app.post(
    '/admin/maintenance',
    { preHandler: [requireRoles('ADMIN', 'MANAGER', 'RECEPTIONIST', 'SUPER_ADMIN')] },
    async (req, reply) => {
      initLodgeData();
      const parseResult = CreateMaintenanceSchema.safeParse(req.body);
      if (!parseResult.success) {
        return reply.status(422).send({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'Invalid maintenance record', details: parseResult.error.errors },
        });
      }

      const { roomId, type, issue, issueTa, priority, assignedTo, notes, cost } = parseResult.data;
      const room = inMemoryRooms.get(roomId);

      if (room) {
        // Automatically put room into MAINTENANCE state
        room.status = 'MAINTENANCE';
        room.updatedAt = new Date().toISOString();
      }

      const id = `maint-${Date.now()}`;
      const newMaint: RoomMaintenance = {
        id,
        roomId,
        type,
        issue,
        issueTa: issueTa || null,
        priority,
        status: 'REPORTED',
        cost: cost || null,
        reportedBy: (req as any).staffContext?.name || 'Reception Staff',
        assignedTo: assignedTo || 'Duty Technician',
        notes: notes || null,
        startedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      inMemoryMaintenance.set(id, newMaint);
      broadcastLodgeEvent('lodge:maintenance_created', newMaint);

      return reply.status(201).send({
        success: true,
        message: 'Maintenance ticket created and room marked for repair',
        data: newMaint,
      });
    }
  );

  // ── GET /admin/maintenance — List Maintenance Tickets ────────────────────
  app.get(
    '/admin/maintenance',
    { preHandler: [requireRoles('ADMIN', 'MANAGER', 'RECEPTIONIST', 'SUPER_ADMIN')] },
    async (_req, reply) => {
      initLodgeData();
      const list = Array.from(inMemoryMaintenance.values()).sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      return reply.send({
        success: true,
        data: list,
      });
    }
  );

  // ── PUT /admin/policies — Update Lodge Policies ───────────────────────────
  app.put(
    '/admin/policies',
    { preHandler: [requireRoles('ADMIN', 'MANAGER', 'SUPER_ADMIN')] },
    async (req, reply) => {
      const parseResult = UpdateLodgePolicySchema.safeParse(req.body);
      if (!parseResult.success) {
        return reply.status(422).send({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'Invalid policy data', details: parseResult.error.errors },
        });
      }

      lodgePolicy = {
        ...lodgePolicy,
        ...parseResult.data,
        updatedAt: new Date().toISOString(),
      };

      return reply.send({
        success: true,
        message: 'Lodge policies updated successfully',
        data: lodgePolicy,
      });
    }
  );
};
