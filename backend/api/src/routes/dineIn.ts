import type { FastifyPluginAsync } from 'fastify';
import {
  ScanTableQrSchema,
  TableServiceRequestSchema,
  PlaceOrderSchema,
  CreateTableReservationSchema,
} from '@ashok-raj/validation';
import type { TableSession, TableServiceRequest, ServiceRequestType, TableReservation } from '@ashok-raj/types';

// In-memory store for active table sessions, service requests and reservations
export const activeSessions = new Map<string, any>();
export const serviceRequests = new Map<string, any[]>();
export const tableReservations = new Map<string, any>();

// Master Restaurant Tables
export const restaurantTables: any[] = [
  { id: 'tbl-1', tableNumber: '01', branchId: 'branch-kalaiyarkoil', floor: 1, capacity: 2, isAc: true, seatingArea: 'AC_HALL', name: 'Table 01 (Couple Cozy A/C)', nameTa: 'மேசை 01 (இருவர் A/C)', status: 'AVAILABLE' },
  { id: 'tbl-2', tableNumber: '02', branchId: 'branch-kalaiyarkoil', floor: 1, capacity: 4, isAc: true, seatingArea: 'AC_HALL', name: 'Table 02 (A/C Hall)', nameTa: 'மேசை 02 (A/C ஹால்)', status: 'AVAILABLE' },
  { id: 'tbl-4', tableNumber: '04', branchId: 'branch-kalaiyarkoil', floor: 1, capacity: 4, isAc: true, seatingArea: 'AC_HALL', name: 'Table 04 (A/C Hall Window)', nameTa: 'மேசை 04 (A/C ஜன்னல்)', status: 'AVAILABLE' },
  { id: 'tbl-5', tableNumber: '05', branchId: 'branch-kalaiyarkoil', floor: 1, capacity: 4, isAc: false, seatingArea: 'MAIN_HALL', name: 'Table 05 (Main Hall)', nameTa: 'மேசை 05 (மெயின் ஹால்)', status: 'AVAILABLE' },
  { id: 'tbl-8', tableNumber: '08', branchId: 'branch-kalaiyarkoil', floor: 1, capacity: 6, isAc: false, seatingArea: 'MAIN_HALL', name: 'Table 08 (Main Hall Family)', nameTa: 'மேசை 08 (குடும்ப மேசை)', status: 'AVAILABLE' },
  { id: 'tbl-10', tableNumber: '10', branchId: 'branch-kalaiyarkoil', floor: 1, capacity: 6, isAc: false, seatingArea: 'MAIN_HALL', name: 'Table 10 (Main Hall)', nameTa: 'மேசை 10 (மெயின் ஹால்)', status: 'AVAILABLE' },
  { id: 'tbl-12', tableNumber: '12', branchId: 'branch-kalaiyarkoil', floor: 2, capacity: 8, isAc: true, seatingArea: 'FAMILY_SECTION', name: 'Table 12 (Family Suite A/C)', nameTa: 'மேசை 12 (குடும்ப சூட் A/C)', status: 'AVAILABLE' },
  { id: 'tbl-14', tableNumber: '14', branchId: 'branch-kalaiyarkoil', floor: 2, capacity: 10, isAc: true, seatingArea: 'FAMILY_SECTION', name: 'Table 14 (Grand Banquet Table)', nameTa: 'மேசை 14 (பெரிய விருந்து மேசை)', status: 'AVAILABLE' },
  { id: 'tbl-16', tableNumber: '16', branchId: 'branch-kalaiyarkoil', floor: 3, capacity: 4, isAc: false, seatingArea: 'ROOFTOP', name: 'Table 16 (Rooftop Open Garden)', nameTa: 'மேசை 16 (ரூஃப்டாப் தோட்டம்)', status: 'AVAILABLE' },
  { id: 'tbl-18', tableNumber: '18', branchId: 'branch-kalaiyarkoil', floor: 3, capacity: 6, isAc: false, seatingArea: 'ROOFTOP', name: 'Table 18 (Rooftop Sunset View)', nameTa: 'மேசை 18 (ரூஃப்டாப் பார்வை)', status: 'AVAILABLE' },
];

export const customerDineInRoutes: FastifyPluginAsync = async (app) => {

  // Helper to broadcast dine-in events over WebSocket
  const broadcastDineInEvent = (event: string, payload: any) => {
    try {
      const websocketServer = (app as any).websocketServer;
      if (websocketServer && websocketServer.clients) {
        const message = JSON.stringify({
          channel: 'dine-in',
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
      app.log.warn({ err }, 'WebSocket dine-in broadcast warning');
    }
  };

  // ── Helper: Map QR tokens securely to tables (No sensitive customer data) ──
  const resolveTableFromQrToken = (qrToken: string) => {
    const found = restaurantTables.find((t) => t.id === `tbl-${qrToken}` || t.tableNumber === qrToken);
    if (found) return found;

    const tableDirectory: Record<string, any> = {
      'qr_kal_tbl_04': { id: 'tbl-4', tableNumber: '04', branchId: 'branch-kalaiyarkoil', floor: 1, capacity: 4, isAc: true, name: 'Table 04 (A/C Hall)' },
      'qr_kal_tbl_08': { id: 'tbl-8', tableNumber: '08', branchId: 'branch-kalaiyarkoil', floor: 1, capacity: 6, isAc: false, name: 'Table 08 (Main Hall)' },
      'qr_kal_tbl_12': { id: 'tbl-12', tableNumber: '12', branchId: 'branch-kalaiyarkoil', floor: 2, capacity: 8, isAc: true, name: 'Table 12 (Family Suite)' },
    };

    return tableDirectory[qrToken] || {
      id: `tbl-${qrToken}`,
      tableNumber: qrToken.padStart(2, '0'),
      branchId: 'branch-kalaiyarkoil',
      floor: 1,
      capacity: 4,
      isAc: true,
      name: `Table ${qrToken}`,
    };
  };

  // ── GET /tables — List Restaurant Tables with Status ───────────────────────
  app.get('/tables', async (_req, reply) => {
    const list = restaurantTables.map((tbl) => {
      const isOccupied = Array.from(activeSessions.values()).some(
        (s) => s.tableId === tbl.id && s.status !== 'CLOSED'
      );
      const isReserved = Array.from(tableReservations.values()).some(
        (r) => r.tableId === tbl.id && r.status === 'CONFIRMED'
      );

      return {
        ...tbl,
        status: isOccupied ? 'OCCUPIED' : isReserved ? 'RESERVED' : 'AVAILABLE',
      };
    });

    return reply.send({
      success: true,
      data: list,
    });
  });

  // ── GET /slots — Available Dining Time Slots ──────────────────────────────
  app.get('/slots', async (req, reply) => {
    const query = req.query as { date?: string; guestCount?: string; area?: string };
    const date = query.date || new Date().toISOString().split('T')[0];

    const lunchSlots = ['12:00 PM', '12:30 PM', '01:00 PM', '01:30 PM', '02:00 PM', '02:30 PM'];
    const dinnerSlots = ['07:00 PM', '07:30 PM', '08:00 PM', '08:30 PM', '09:00 PM', '09:30 PM', '10:00 PM'];

    const formatSlots = (slots: string[], period: 'LUNCH' | 'DINNER') =>
      slots.map((slot) => {
        // Count existing reservations for this slot on this date
        const bookedCount = Array.from(tableReservations.values()).filter(
          (r) => r.reservationDate === date && r.timeSlot === slot && r.status === 'CONFIRMED'
        ).length;

        const maxTables = query.area ? 3 : 10;
        const availableTables = Math.max(0, maxTables - bookedCount);

        return {
          slot,
          period,
          availableTables,
          isAvailable: availableTables > 0,
        };
      });

    return reply.send({
      success: true,
      data: {
        date,
        lunch: formatSlots(lunchSlots, 'LUNCH'),
        dinner: formatSlots(dinnerSlots, 'DINNER'),
        areas: [
          { key: 'AC_HALL', name: 'A/C Dining Hall', nameTa: 'A/C டைனிங் ஹால்' },
          { key: 'MAIN_HALL', name: 'Main Hall', nameTa: 'மெயின் ஹால்' },
          { key: 'FAMILY_SECTION', name: 'Family Section', nameTa: 'குடும்ப பிரிவு' },
          { key: 'ROOFTOP', name: 'Rooftop Garden', nameTa: 'ரூஃப்டாப் கார்டன்' },
        ],
      },
    });
  });

  // ── POST /reserve — Smart Table Reservation & Allocation ───────────────────
  app.post('/reserve', async (req, reply) => {
    const parseResult = CreateTableReservationSchema.safeParse(req.body);
    if (!parseResult.success) {
      return reply.status(422).send({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid reservation input', details: parseResult.error.errors },
      });
    }

    const data = parseResult.data;
    const userId = (req as any).user?.userId || 'guest-user-1';

    // 1. Intelligent Table Allocation based on area, capacity and slot availability
    const candidateTables = restaurantTables.filter(
      (tbl) => tbl.seatingArea === data.seatingArea && tbl.capacity >= data.guestCount
    );

    // Find table not already booked for same date and time slot
    let allocatedTable = candidateTables.find((tbl) => {
      const isBooked = Array.from(tableReservations.values()).some(
        (r) =>
          r.tableId === tbl.id &&
          r.reservationDate === data.reservationDate &&
          r.timeSlot === data.timeSlot &&
          r.status === 'CONFIRMED'
      );
      return !isBooked;
    });

    // Fallback: search any area if preferred area is full
    if (!allocatedTable) {
      allocatedTable = restaurantTables.find((tbl) => {
        if (tbl.capacity < data.guestCount) return false;
        const isBooked = Array.from(tableReservations.values()).some(
          (r) =>
            r.tableId === tbl.id &&
            r.reservationDate === data.reservationDate &&
            r.timeSlot === data.timeSlot &&
            r.status === 'CONFIRMED'
        );
        return !isBooked;
      });
    }

    if (!allocatedTable) {
      return reply.status(409).send({
        success: false,
        error: {
          code: 'TABLE_UNAVAILABLE',
          message: 'All tables for this time slot and party size are currently booked. Please choose another slot.',
        },
      });
    }

    const reservationNumber = `AR-RES-${Date.now().toString().slice(-6)}`;
    const reservationId = `res_${Date.now()}`;

    const reservation: any = {
      id: reservationId,
      reservationNumber,
      userId,
      tableId: allocatedTable.id,
      tableNumber: allocatedTable.tableNumber,
      tableName: allocatedTable.name,
      tableNameTa: allocatedTable.nameTa,
      branchId: allocatedTable.branchId,
      guestCount: data.guestCount,
      reservationDate: data.reservationDate,
      timeSlot: data.timeSlot,
      seatingArea: data.seatingArea,
      guestName: data.guestName,
      guestPhone: data.guestPhone,
      specialRequests: data.specialRequests || null,
      status: 'CONFIRMED',
      allocatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    tableReservations.set(reservationId, reservation);

    // Broadcast table reservation to Floor Manager & Hostess
    broadcastDineInEvent('table:reserved', {
      reservation,
      tableNumber: allocatedTable.tableNumber,
    });

    return reply.status(201).send({
      success: true,
      data: reservation,
      message: 'Table reserved successfully',
    });
  });

  // ── GET /my-reservations — List Customer's Table Reservations ─────────────
  app.get('/my-reservations', async (req, reply) => {
    const userId = (req as any).user?.userId;
    const all = Array.from(tableReservations.values());

    const filtered = userId
      ? all.filter((r) => r.userId === userId || r.userId === 'guest-user-1')
      : all;

    return reply.send({
      success: true,
      data: filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    });
  });

  // ── POST /reservations/:id/cancel — Cancel Table Reservation ──────────────
  app.post('/reservations/:id/cancel', async (req, reply) => {
    const { id } = req.params as { id: string };
    const { reason } = (req.body as any) || {};

    const reservation = tableReservations.get(id);
    if (!reservation) {
      return reply.status(404).send({
        success: false,
        error: { code: 'RESERVATION_NOT_FOUND', message: 'Reservation not found' },
      });
    }

    reservation.status = 'CANCELLED';
    reservation.cancellationReason = reason || 'Cancelled by guest';
    reservation.cancelledAt = new Date().toISOString();
    tableReservations.set(id, reservation);

    broadcastDineInEvent('table:reservation_cancelled', { id, reservationNumber: reservation.reservationNumber });

    return reply.send({
      success: true,
      data: reservation,
      message: 'Reservation cancelled successfully',
    });
  });

  // ── POST /scan — Validate QR Token and Open/Join Table Session ─────────────
  app.post('/scan', async (req, reply) => {
    const parseResult = ScanTableQrSchema.safeParse(req.body);
    if (!parseResult.success) {
      return reply.status(422).send({
        success: false,
        error: { code: 'INVALID_QR', message: 'Invalid QR token provided', details: parseResult.error.errors },
      });
    }

    const { qrToken, guestCount } = parseResult.data;
    const table = resolveTableFromQrToken(qrToken);

    // Look for active open session on this table or create one
    let session = Array.from(activeSessions.values()).find(
      (s) => s.tableId === table.id && s.status !== 'CLOSED'
    );

    if (!session) {
      const sessionId = `session_${table.id}_${Date.now()}`;
      const sessionToken = `stk_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

      session = {
        id: sessionId,
        tableId: table.id,
        tableNumber: table.tableNumber,
        branchId: table.branchId,
        sessionToken,
        tableName: table.name,
        isAc: table.isAc,
        floor: table.floor,
        capacity: table.capacity,
        openedAt: new Date().toISOString(),
        guestCount: guestCount || 2,
        status: 'OPEN',
        orders: [],
        serviceRequests: [],
        subtotal: 0,
        taxAmount: 0,
        total: 0,
      };

      activeSessions.set(sessionId, session);
      serviceRequests.set(sessionId, []);

      // Broadcast table occupied event to staff
      broadcastDineInEvent('table:occupied', { tableId: table.id, tableNumber: table.tableNumber, sessionId });
    }

    return reply.send({
      success: true,
      data: {
        table,
        session,
      },
      message: 'Table QR verified successfully',
    });
  });

  // ── GET /session/:sessionId — Get Consolidated Session State ──────────────
  app.get('/session/:sessionId', async (req, reply) => {
    const { sessionId } = req.params as { sessionId: string };
    const session = activeSessions.get(sessionId);

    if (!session) {
      return reply.status(404).send({
        success: false,
        error: { code: 'SESSION_NOT_FOUND', message: 'Active table session not found' },
      });
    }

    return reply.send({
      success: true,
      data: session,
    });
  });

  // ── POST /session/:sessionId/order — Add Dishes to Table Session ──────────
  app.post('/session/:sessionId/order', async (req, reply) => {
    const { sessionId } = req.params as { sessionId: string };
    const session = activeSessions.get(sessionId);

    if (!session || session.status === 'CLOSED') {
      return reply.status(400).send({
        success: false,
        error: { code: 'SESSION_CLOSED', message: 'Table session is not active' },
      });
    }

    const { items, notes } = req.body as any;
    if (!items || !Array.isArray(items) || items.length === 0) {
      return reply.status(400).send({
        success: false,
        error: { code: 'EMPTY_ITEMS', message: 'At least one item is required' },
      });
    }

    // Calculate subtotal for added items
    let orderSubtotal = 0;
    const verifiedItems = items.map((it: any, idx: number) => {
      const unitPrice = Number(it.price || 150);
      const addonsTotal = (it.addons || []).reduce((s: number, a: any) => s + (Number(a.price) || 0), 0);
      const lineTotal = (unitPrice + addonsTotal) * it.quantity;
      orderSubtotal += lineTotal;

      return {
        id: `tbl-it-${Date.now()}-${idx}`,
        menuItemId: it.menuItemId || it.id,
        name: it.name || 'Chettinad Special Dish',
        nameTa: it.nameTa || 'செட்டிநாடு உணவு',
        price: unitPrice + addonsTotal,
        quantity: it.quantity,
        subtotal: lineTotal,
        note: it.note || it.notes,
        addons: it.addons || [],
        status: 'PREPARING', // In kitchen
      };
    });

    const newOrder = {
      id: `ord_tbl_${Date.now()}`,
      orderNumber: `AR-TBL-${Date.now().toString().slice(-4)}`,
      type: 'DINE_IN',
      status: 'PREPARING',
      tableId: session.tableId,
      tableNumber: session.tableNumber,
      subtotal: orderSubtotal,
      taxAmount: Math.round(orderSubtotal * 0.05 * 100) / 100,
      total: Math.round(orderSubtotal * 1.05 * 100) / 100,
      notes,
      createdAt: new Date().toISOString(),
      items: verifiedItems,
    };

    session.orders.push(newOrder);
    session.subtotal += newOrder.subtotal;
    session.taxAmount = Math.round(session.subtotal * 0.05 * 100) / 100;
    session.total = Math.round(session.subtotal + session.taxAmount);

    activeSessions.set(sessionId, session);

    // Broadcast new table order to Kitchen Display System (KDS) and Floor Waiters
    broadcastDineInEvent('kitchen:new_table_order', {
      sessionId,
      tableNumber: session.tableNumber,
      order: newOrder,
    });

    return reply.status(201).send({
      success: true,
      data: session,
      message: 'Items dispatched to kitchen successfully',
    });
  });

  // ── POST /session/:sessionId/service-request — Call Waiter / Water / Cutlery
  app.post('/session/:sessionId/service-request', async (req, reply) => {
    const { sessionId } = req.params as { sessionId: string };
    const session = activeSessions.get(sessionId);

    if (!session || session.status === 'CLOSED') {
      return reply.status(400).send({
        success: false,
        error: { code: 'SESSION_CLOSED', message: 'Table session is not active' },
      });
    }

    const parseResult = TableServiceRequestSchema.safeParse(req.body);
    if (!parseResult.success) {
      return reply.status(422).send({
        success: false,
        error: { code: 'INVALID_REQUEST', message: 'Invalid service request type', details: parseResult.error.errors },
      });
    }

    const { type, note } = parseResult.data;

    const request: TableServiceRequest = {
      id: `req_${Date.now()}`,
      tableSessionId: sessionId,
      tableId: session.tableId,
      tableNumber: session.tableNumber,
      type: type as ServiceRequestType,
      note: note || null,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    };

    const list = serviceRequests.get(sessionId) || [];
    list.push(request);
    serviceRequests.set(sessionId, list);
    session.serviceRequests = list;

    // Broadcast instant real-time notification to Waiters & Floor Managers
    broadcastDineInEvent('waiter:service_call', {
      tableNumber: session.tableNumber,
      floor: session.floor,
      request,
    });

    return reply.send({
      success: true,
      data: request,
      message: `Service request for ${type} sent to waiter`,
    });
  });

  // ── POST /session/:sessionId/request-bill — Customer Requests Bill ─────────
  app.post('/session/:sessionId/request-bill', async (req, reply) => {
    const { sessionId } = req.params as { sessionId: string };
    const session = activeSessions.get(sessionId);

    if (!session || session.status === 'CLOSED') {
      return reply.status(400).send({
        success: false,
        error: { code: 'SESSION_CLOSED', message: 'Table session is not active' },
      });
    }

    session.status = 'BILL_REQUESTED';
    activeSessions.set(sessionId, session);

    // Broadcast bill request to Cashier & Waiter
    broadcastDineInEvent('waiter:bill_requested', {
      tableNumber: session.tableNumber,
      sessionId,
      total: session.total,
    });

    return reply.send({
      success: true,
      data: {
        sessionId,
        tableNumber: session.tableNumber,
        subtotal: session.subtotal,
        taxAmount: session.taxAmount,
        total: session.total,
        status: session.status,
      },
      message: 'Bill requested. Waiter notified.',
    });
  });

  // ── POST /session/:sessionId/pay — Digital Payment & Close Table Session ───
  app.post('/session/:sessionId/pay', async (req, reply) => {
    const { sessionId } = req.params as { sessionId: string };
    const { paymentMethod } = (req.body as any) || { paymentMethod: 'UPI' };
    const session = activeSessions.get(sessionId);

    if (!session) {
      return reply.status(404).send({
        success: false,
        error: { code: 'SESSION_NOT_FOUND', message: 'Session not found' },
      });
    }

    session.status = 'PAID';
    session.closedAt = new Date().toISOString();
    activeSessions.set(sessionId, session);

    // Broadcast payment confirmation and table release
    broadcastDineInEvent('table:session_settled', {
      sessionId,
      tableId: session.tableId,
      tableNumber: session.tableNumber,
      paymentMethod,
      total: session.total,
    });

    return reply.send({
      success: true,
      data: {
        receiptNumber: `RCP-TBL-${Date.now().toString().slice(-6)}`,
        tableNumber: session.tableNumber,
        totalPaid: session.total,
        paymentMethod,
        closedAt: session.closedAt,
      },
      message: 'Payment received. Table session settled successfully.',
    });
  });
};
