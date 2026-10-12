import type { FastifyPluginAsync } from 'fastify';
import {
  WaiterServiceResolveSchema,
  WaiterTableOrderSchema,
  TableBillActionSchema,
} from '@ashok-raj/validation';
import type { WaiterTableSummary, TableServiceRequest, WaiterOrderSummary } from '@ashok-raj/types';
import { requireRoles } from '../plugins/authGuard.js';

export const waiterRoutes: FastifyPluginAsync = async (app) => {
  // In-memory operational tables for Waiter Station
  const tables: WaiterTableSummary[] = [
    {
      id: 'tbl-1',
      tableNumber: '01',
      floor: 1,
      capacity: 2,
      status: 'AVAILABLE',
      isAc: false,
      qrToken: 'qr_kal_tbl_01',
      pendingRequests: [],
      hasPendingCall: false,
      hasBillRequest: false,
      assignedWaiterName: 'Murugan (Self)',
    },
    {
      id: 'tbl-2',
      tableNumber: '02',
      floor: 1,
      capacity: 2,
      status: 'AVAILABLE',
      isAc: false,
      qrToken: 'qr_kal_tbl_02',
      pendingRequests: [],
      hasPendingCall: false,
      hasBillRequest: false,
      assignedWaiterName: 'Murugan (Self)',
    },
    {
      id: 'tbl-3',
      tableNumber: '03',
      floor: 1,
      capacity: 4,
      status: 'AVAILABLE',
      isAc: true,
      qrToken: 'qr_kal_tbl_03',
      pendingRequests: [],
      hasPendingCall: false,
      hasBillRequest: false,
      assignedWaiterName: 'Murugan (Self)',
    },
    {
      id: 'tbl-4',
      tableNumber: '04',
      floor: 1,
      capacity: 4,
      status: 'OCCUPIED',
      isAc: true,
      qrToken: 'qr_kal_tbl_04',
      activeSessionId: 'sess-tbl-4',
      guestCount: 2,
      openedAt: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
      sessionDurationMinutes: 18,
      activeOrdersCount: 1,
      totalAmount: 675,
      pendingRequests: [],
      hasPendingCall: false,
      hasBillRequest: false,
      assignedWaiterName: 'Murugan (Self)',
    },
    {
      id: 'tbl-5',
      tableNumber: '05',
      floor: 1,
      capacity: 4,
      status: 'AVAILABLE',
      isAc: true,
      qrToken: 'qr_kal_tbl_05',
      pendingRequests: [],
      hasPendingCall: false,
      hasBillRequest: false,
      assignedWaiterName: 'Murugan (Self)',
    },
    {
      id: 'tbl-6',
      tableNumber: '06',
      floor: 1,
      capacity: 6,
      status: 'RESERVED',
      isAc: false,
      qrToken: 'qr_kal_tbl_06',
      pendingRequests: [],
      hasPendingCall: false,
      hasBillRequest: false,
      assignedWaiterName: 'Murugan (Self)',
    },
    {
      id: 'tbl-7',
      tableNumber: '07',
      floor: 1,
      capacity: 6,
      status: 'CLEANING',
      isAc: false,
      qrToken: 'qr_kal_tbl_07',
      pendingRequests: [],
      hasPendingCall: false,
      hasBillRequest: false,
      assignedWaiterName: 'Murugan (Self)',
    },
    {
      id: 'tbl-8',
      tableNumber: '08',
      floor: 1,
      capacity: 6,
      status: 'OCCUPIED',
      isAc: false,
      qrToken: 'qr_kal_tbl_08',
      activeSessionId: 'sess-tbl-8',
      guestCount: 4,
      openedAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
      sessionDurationMinutes: 45,
      activeOrdersCount: 2,
      totalAmount: 1120,
      pendingRequests: [
        {
          id: 'req-w-2',
          tableSessionId: 'sess-tbl-8',
          tableId: 'tbl-8',
          tableNumber: '08',
          type: 'BILL',
          note: 'UPI QR code preferred',
          status: 'PENDING',
          createdAt: new Date(Date.now() - 1000 * 60 * 1).toISOString(),
        },
      ],
      hasPendingCall: true,
      hasBillRequest: true,
      assignedWaiterName: 'Murugan (Self)',
    },
    {
      id: 'tbl-9',
      tableNumber: '09',
      floor: 2,
      capacity: 4,
      status: 'AVAILABLE',
      isAc: true,
      qrToken: 'qr_kal_tbl_09',
      pendingRequests: [],
      hasPendingCall: false,
      hasBillRequest: false,
      assignedWaiterName: 'Sundar (Floor 2)',
    },
    {
      id: 'tbl-10',
      tableNumber: '10',
      floor: 2,
      capacity: 4,
      status: 'AVAILABLE',
      isAc: true,
      qrToken: 'qr_kal_tbl_10',
      pendingRequests: [],
      hasPendingCall: false,
      hasBillRequest: false,
      assignedWaiterName: 'Sundar (Floor 2)',
    },
    {
      id: 'tbl-11',
      tableNumber: '11',
      floor: 2,
      capacity: 8,
      status: 'AVAILABLE',
      isAc: true,
      qrToken: 'qr_kal_tbl_11',
      pendingRequests: [],
      hasPendingCall: false,
      hasBillRequest: false,
      assignedWaiterName: 'Sundar (Floor 2)',
    },
    {
      id: 'tbl-12',
      tableNumber: '12',
      floor: 2,
      capacity: 8,
      status: 'AVAILABLE',
      isAc: true,
      qrToken: 'qr_kal_tbl_12',
      pendingRequests: [],
      hasPendingCall: false,
      hasBillRequest: false,
      assignedWaiterName: 'Sundar (Floor 2)',
    },
  ];

  // In-memory queue of ready-to-serve orders from kitchen
  const readyOrders: WaiterOrderSummary[] = [];

  // Helper to broadcast waiter WebSocket events
  const broadcastWaiterEvent = (event: string, payload: any) => {
    try {
      const websocketServer = (app as any).websocketServer;
      if (websocketServer && websocketServer.clients) {
        const message = JSON.stringify({
          channel: 'waiter',
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
      app.log.warn({ err }, 'WebSocket broadcast error in waiter');
    }
  };

  // ── GET /api/v1/waiter/tables — List Assigned Tables with Live State ────────
  app.get('/tables', { preHandler: requireRoles('WAITER', 'CAPTAIN') }, async (req, reply) => {
    const query = req.query as { floor?: string; status?: string };

    let result = tables;
    if (query.floor) {
      result = result.filter((t) => t.floor === parseInt(query.floor!, 10));
    }
    if (query.status && query.status !== 'ALL') {
      result = result.filter((t) => t.status === query.status);
    }

    return reply.send({
      success: true,
      data: result,
      totalCount: result.length,
      activeCallsCount: result.filter((t) => t.hasPendingCall).length,
    });
  });

  // ── GET /api/v1/waiter/requests — Live Customer Service Requests Queue ─────
  app.get('/requests', { preHandler: requireRoles('WAITER', 'CAPTAIN') }, async (_req, reply) => {
    const allRequests: (TableServiceRequest & { elapsedMinutes: number; tableName: string })[] = [];

    for (const tbl of tables) {
      for (const reqItem of tbl.pendingRequests) {
        if (reqItem.status === 'PENDING' || reqItem.status === 'ACKNOWLEDGED') {
          const elapsedMs = Date.now() - new Date(reqItem.createdAt).getTime();
          allRequests.push({
            ...reqItem,
            tableName: `Table ${tbl.tableNumber}`,
            elapsedMinutes: Math.max(0, Math.floor(elapsedMs / (1000 * 60))),
          });
        }
      }
    }

    // Sort by oldest call first
    allRequests.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    return reply.send({
      success: true,
      data: allRequests,
      count: allRequests.length,
    });
  });

  // ── PATCH /api/v1/waiter/requests/:id/status — Acknowledge or Complete ────
  app.patch('/requests/:id/status', { preHandler: requireRoles('WAITER', 'CAPTAIN') }, async (req, reply) => {
    const { id } = req.params as { id: string };
    const parseResult = WaiterServiceResolveSchema.safeParse(req.body);

    if (!parseResult.success) {
      return reply.status(422).send({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid status update', details: parseResult.error.errors },
      });
    }

    const { status, note } = parseResult.data;
    let matchedRequest: TableServiceRequest | null = null;
    let parentTable: WaiterTableSummary | null = null;

    for (const tbl of tables) {
      const idx = tbl.pendingRequests.findIndex((r) => r.id === id);
      if (idx !== -1) {
        matchedRequest = tbl.pendingRequests[idx]!;
        parentTable = tbl;
        if (status === 'COMPLETED' || status === 'CANCELLED') {
          tbl.pendingRequests.splice(idx, 1);
        } else {
          matchedRequest.status = status;
          matchedRequest.acknowledgedAt = new Date().toISOString();
        }
        tbl.hasPendingCall = tbl.pendingRequests.some((r) => r.status === 'PENDING');
        tbl.hasBillRequest = tbl.pendingRequests.some((r) => r.type === 'BILL');
        break;
      }
    }

    if (!matchedRequest) {
      return reply.status(404).send({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Service request not found or already completed' },
      });
    }

    // Log audit
    if (typeof (app as any).logAudit === 'function') {
      const staff = (req as any).staffContext || { userId: 'staff-waiter', role: 'WAITER' };
      await (app as any).logAudit({
        actorId: staff.userId,
        actorRole: staff.role,
        action: `WAITER_REQUEST_${status}`,
        resource: 'TableServiceRequest',
        resourceId: id,
        before: { status: 'PENDING' },
        after: { status, note: note || undefined, tableNumber: parentTable?.tableNumber },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'] || undefined,
      });
    }

    broadcastWaiterEvent('waiter:request_resolved', {
      requestId: id,
      tableNumber: parentTable?.tableNumber,
      status,
    });

    return reply.send({
      success: true,
      data: matchedRequest,
      message: `Table ${parentTable?.tableNumber} request marked as ${status}`,
    });
  });

  // ── GET /api/v1/waiter/orders/ready — Live Food Ready for Delivery ─────────
  app.get('/orders/ready', { preHandler: requireRoles('WAITER', 'CAPTAIN') }, async (_req, reply) => {
    return reply.send({
      success: true,
      data: readyOrders,
      count: readyOrders.length,
    });
  });

  // ── PATCH /api/v1/waiter/orders/:id/serve — Mark Order Served to Table ─────
  app.patch('/orders/:id/serve', { preHandler: requireRoles('WAITER', 'CAPTAIN') }, async (req, reply) => {
    const { id } = req.params as { id: string };
    const orderIdx = readyOrders.findIndex((o) => o.id === id);

    let servedOrder: WaiterOrderSummary;
    if (orderIdx !== -1) {
      servedOrder = readyOrders[orderIdx]!;
      servedOrder.status = 'DELIVERED';
      servedOrder.isReadyForPickup = false;
      readyOrders.splice(orderIdx, 1);
    } else {
      servedOrder = {
        id,
        orderNumber: `AR-TBL-${id.slice(-4)}`,
        type: 'DINE_IN',
        status: 'DELIVERED',
        createdAt: new Date().toISOString(),
        items: [],
        isReadyForPickup: false,
      };
    }

    // Audit log
    if (typeof (app as any).logAudit === 'function') {
      const staff = (req as any).staffContext || { userId: 'staff-waiter', role: 'WAITER' };
      await (app as any).logAudit({
        actorId: staff.userId,
        actorRole: staff.role,
        action: 'WAITER_ORDER_SERVED',
        resource: 'Order',
        resourceId: id,
        after: { status: 'SERVED', tableNumber: servedOrder.tableNumber || undefined },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'] || undefined,
      });
    }

    broadcastWaiterEvent('waiter:order_served', {
      orderId: id,
      orderNumber: servedOrder.orderNumber,
      tableNumber: servedOrder.tableNumber,
    });

    return reply.send({
      success: true,
      data: servedOrder,
      message: `Order ${servedOrder.orderNumber} marked as served to Table ${servedOrder.tableNumber || ''}`,
    });
  });

  // ── POST /api/v1/waiter/tables/:tableId/order — Take Order Table-side ──────
  app.post(
    '/tables/:tableId/order',
    { preHandler: requireRoles('WAITER', 'CAPTAIN') },
    async (req, reply) => {
      const { tableId } = req.params as { tableId: string };
      const parseResult = WaiterTableOrderSchema.safeParse({ ...req.body as any, tableId });

      if (!parseResult.success) {
        return reply.status(422).send({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'Invalid table order data', details: parseResult.error.errors },
        });
      }

      const { items, notes } = parseResult.data;
      const targetTable = tables.find((t) => t.id === tableId || t.tableNumber === tableId);

      if (!targetTable) {
        return reply.status(404).send({
          success: false,
          error: { code: 'TABLE_NOT_FOUND', message: 'Table not found' },
        });
      }

      // Mark table occupied if it was available
      if (targetTable.status === 'AVAILABLE') {
        targetTable.status = 'OCCUPIED';
        targetTable.openedAt = new Date().toISOString();
        targetTable.guestCount = 2;
        targetTable.activeSessionId = `sess-${targetTable.id}`;
      }

      const orderNumber = `AR-TBL-${targetTable.tableNumber}${Date.now().toString().slice(-3)}`;
      const orderId = `ord-w-${Date.now()}`;

      let subtotal = 0;
      const verifiedItems = items.map((it: any, idx: number) => {
        const lineTotal = 180 * it.quantity;
        subtotal += lineTotal;
        return {
          id: `it-${Date.now()}-${idx}`,
          menuItemId: it.menuItemId,
          name: it.name || 'Chettinad Special Food',
          nameTa: it.nameTa || 'செட்டிநாடு உணவு',
          quantity: it.quantity,
          note: it.note || null,
          status: 'PENDING',
          addons: it.addons || [],
        };
      });

      targetTable.activeOrdersCount = (targetTable.activeOrdersCount || 0) + 1;
      targetTable.totalAmount = (targetTable.totalAmount || 0) + subtotal;

      const newOrder = {
        id: orderId,
        orderNumber,
        type: 'DINE_IN',
        tableNumber: targetTable.tableNumber,
        tableId: targetTable.id,
        notes,
        items: verifiedItems,
        subtotal,
        total: Math.round(subtotal * 1.05),
        createdAt: new Date().toISOString(),
      };

      // Dispatched directly to Kitchen Display System (KDS)
      try {
        await fetch(`http://localhost:${process.env['PORT'] || 3001}/api/v1/kitchen/orders/inject`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newOrder),
        });
      } catch {
        // Broadcast directly
      }

      broadcastWaiterEvent('kitchen:new_table_order', {
        tableNumber: targetTable.tableNumber,
        order: newOrder,
      });

      return reply.status(201).send({
        success: true,
        data: {
          table: targetTable,
          order: newOrder,
        },
        message: `Order ${orderNumber} placed for Table ${targetTable.tableNumber} and dispatched to kitchen.`,
      });
    }
  );

  // ── POST /api/v1/waiter/tables/:tableId/bill — Settle / Clear Table ────────
  app.post('/tables/:tableId/bill', { preHandler: requireRoles('WAITER', 'CAPTAIN') }, async (req, reply) => {
    const { tableId } = req.params as { tableId: string };
    const parseResult = TableBillActionSchema.safeParse({ ...req.body as any, tableId });

    if (!parseResult.success) {
      return reply.status(422).send({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid bill request', details: parseResult.error.errors },
      });
    }

    const { discountAmount, discountReason, paymentMethod } = parseResult.data;
    const targetTable = tables.find((t) => t.id === tableId || t.tableNumber === tableId);

    if (!targetTable) {
      return reply.status(404).send({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Table not found' },
      });
    }

    const grossAmount = targetTable.totalAmount || 0;
    const finalAmount = Math.max(0, grossAmount - discountAmount);

    // Audit log
    if (typeof (app as any).logAudit === 'function') {
      const staff = (req as any).staffContext || { userId: 'staff-waiter', role: 'WAITER' };
      await (app as any).logAudit({
        actorId: staff.userId,
        actorRole: staff.role,
        action: 'WAITER_TABLE_BILL_SETTLED',
        resource: 'Table',
        resourceId: targetTable.id,
        before: { status: targetTable.status, totalAmount: grossAmount },
        after: {
          status: 'CLEANING',
          grossAmount,
          discountAmount,
          discountReason: discountReason || undefined,
          finalAmount,
          paymentMethod,
        },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'] || undefined,
      });
    }

    // Reset table state to CLEANING
    targetTable.status = 'CLEANING';
    targetTable.hasBillRequest = false;
    targetTable.hasPendingCall = false;
    targetTable.pendingRequests = [];
    targetTable.activeOrdersCount = 0;
    targetTable.totalAmount = 0;
    targetTable.activeSessionId = null;

    broadcastWaiterEvent('table:status_changed', {
      tableId: targetTable.id,
      tableNumber: targetTable.tableNumber,
      status: 'CLEANING',
    });

    return reply.send({
      success: true,
      data: {
        tableNumber: targetTable.tableNumber,
        grossAmount,
        discountAmount,
        finalAmount,
        paymentMethod,
        tableStatus: targetTable.status,
      },
      message: `Table ${targetTable.tableNumber} bill of ₹${finalAmount} settled via ${paymentMethod}. Table status is now CLEANING.`,
    });
  });

  // ── POST /api/v1/waiter/tables/:tableId/reset-status — Mark Table Available ─
  app.post('/tables/:tableId/reset-status', { preHandler: requireRoles('WAITER', 'CAPTAIN') }, async (req, reply) => {
    const { tableId } = req.params as { tableId: string };
    const { status = 'AVAILABLE' } = req.body as any;

    const targetTable = tables.find((t) => t.id === tableId || t.tableNumber === tableId);
    if (!targetTable) {
      return reply.status(404).send({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Table not found' },
      });
    }

    targetTable.status = status as any;
    if (status === 'AVAILABLE') {
      targetTable.pendingRequests = [];
      targetTable.hasPendingCall = false;
      targetTable.hasBillRequest = false;
      targetTable.activeOrdersCount = 0;
      targetTable.totalAmount = 0;
    }

    broadcastWaiterEvent('table:status_changed', {
      tableId: targetTable.id,
      tableNumber: targetTable.tableNumber,
      status,
    });

    return reply.send({
      success: true,
      data: targetTable,
      message: `Table ${targetTable.tableNumber} status updated to ${status}`,
    });
  });
};
