import type { FastifyPluginAsync } from 'fastify';
import { ScanTableQrSchema, TableServiceRequestSchema, PlaceOrderSchema } from '@ashok-raj/validation';
import type { TableSession, TableServiceRequest, ServiceRequestType } from '@ashok-raj/types';

export const customerDineInRoutes: FastifyPluginAsync = async (app) => {
  // In-memory store for active table sessions and service requests
  const activeSessions = new Map<string, any>();
  const serviceRequests = new Map<string, any[]>();

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
    // Standard mock tables in Ashok Raj Kalaiyarkoil
    const tableDirectory: Record<string, any> = {
      'qr_kal_tbl_04': { id: 'tbl-4', tableNumber: '04', branchId: 'branch-kalaiyarkoil', floor: 1, capacity: 4, isAc: true, name: 'Table 04 (A/C Hall)' },
      'qr_kal_tbl_08': { id: 'tbl-8', tableNumber: '08', branchId: 'branch-kalaiyarkoil', floor: 1, capacity: 6, isAc: false, name: 'Table 08 (Main Hall)' },
      'qr_kal_tbl_12': { id: 'tbl-12', tableNumber: '12', branchId: 'branch-kalaiyarkoil', floor: 2, capacity: 8, isAc: true, name: 'Table 12 (Family Suite)' },
      // Direct table number fallbacks
      '4': { id: 'tbl-4', tableNumber: '04', branchId: 'branch-kalaiyarkoil', floor: 1, capacity: 4, isAc: true, name: 'Table 04 (A/C Hall)' },
      '8': { id: 'tbl-8', tableNumber: '08', branchId: 'branch-kalaiyarkoil', floor: 1, capacity: 6, isAc: false, name: 'Table 08 (Main Hall)' },
      '12': { id: 'tbl-12', tableNumber: '12', branchId: 'branch-kalaiyarkoil', floor: 2, capacity: 8, isAc: true, name: 'Table 12 (Family Suite)' },
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
