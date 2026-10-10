import type { FastifyPluginAsync } from 'fastify';
import { KitchenStatusUpdateSchema, KitchenItemStatusUpdateSchema } from '@ashok-raj/validation';
import type { KitchenOrder, KitchenOrderItem, KitchenStats } from '@ashok-raj/types';
import { requireRoles } from '../plugins/authGuard.js';

export const kitchenRoutes: FastifyPluginAsync = async (app) => {
  // In-memory operational store for fast KDS state & demo mode
  const inMemoryKitchenOrders: Map<string, KitchenOrder> = new Map();

  // Helper to calculate elapsed time in minutes
  const getElapsedMinutes = (dateStr: string) => {
    const elapsedMs = Date.now() - new Date(dateStr).getTime();
    return Math.max(0, Math.floor(elapsedMs / (1000 * 60)));
  };

  // Seed sample initial active kitchen orders if empty
  const initSampleOrders = () => {
    if (inMemoryKitchenOrders.size > 0) return;

    const sampleOrders: KitchenOrder[] = [
      {
        id: 'ord-kds-101',
        orderNumber: 'AR-TBL-0401',
        type: 'DINE_IN',
        status: 'PREPARING',
        tableNumber: '04',
        tableId: 'tbl-4',
        guestName: 'Karthik Raja',
        notes: 'Less oil for Biryani, extra spicy gravy on the side please',
        createdAt: new Date(Date.now() - 1000 * 60 * 14).toISOString(), // 14 mins ago
        acceptedAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
        elapsedMinutes: 14,
        estimatedPrepMinutes: 20,
        priority: 'NORMAL',
        itemCount: 3,
        items: [
          {
            id: 'it-101',
            menuItemId: 'mi-1',
            name: 'Seeraga Samba Mutton Biryani',
            nameTa: 'சீரக சம்பா ஆட்டுக்கறி பிரியாணி',
            quantity: 2,
            note: 'Less oil, spicy gravy on side',
            status: 'PREPARING',
            addons: [{ name: 'Boiled Egg (2 pcs)', nameTa: 'வேகவைத்த முட்டை', price: 30 }],
          },
          {
            id: 'it-102',
            menuItemId: 'mi-2',
            name: 'Kalaiyarkoil Mutton Chukka',
            nameTa: 'காளையார்கோவில் மட்டன் சுக்கா',
            quantity: 1,
            note: 'Crispy fry with curry leaves',
            status: 'READY',
            addons: [],
          },
        ],
      },
      {
        id: 'ord-kds-102',
        orderNumber: 'AR-RM-2041',
        type: 'ROOM_SERVICE',
        status: 'PLACED',
        roomId: '204',
        guestName: 'Meenakshi Sundaram (Room 204)',
        notes: 'Deliver to room 204 directly. Ring bell twice.',
        createdAt: new Date(Date.now() - 1000 * 60 * 4).toISOString(), // 4 mins ago
        elapsedMinutes: 4,
        estimatedPrepMinutes: 15,
        priority: 'RUSH',
        itemCount: 3,
        items: [
          {
            id: 'it-103',
            menuItemId: 'mi-3',
            name: 'Nattu Kozhi Chettinad Gravy',
            nameTa: 'நாட்டுக்கோழி செட்டிநாடு குழம்பு',
            quantity: 1,
            note: 'Medium spice',
            status: 'PENDING',
          },
          {
            id: 'it-104',
            menuItemId: 'mi-4',
            name: 'Madurai Bun Parotta (Set of 2)',
            nameTa: 'மதுரை பன் பரோட்டா',
            quantity: 2,
            note: 'Hot & flaky with salna',
            status: 'PENDING',
          },
        ],
      },
      {
        id: 'ord-kds-103',
        orderNumber: 'AR-TBL-0802',
        type: 'DINE_IN',
        status: 'READY',
        tableNumber: '08',
        tableId: 'tbl-8',
        guestName: 'Dine-In Family',
        notes: 'Separate bowls for sambar',
        createdAt: new Date(Date.now() - 1000 * 60 * 22).toISOString(), // 22 mins ago (Delayed)
        acceptedAt: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
        readyAt: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
        elapsedMinutes: 22,
        estimatedPrepMinutes: 18,
        priority: 'VIP',
        itemCount: 4,
        items: [
          {
            id: 'it-105',
            menuItemId: 'mi-5',
            name: 'Chettinad Special Chicken Biryani',
            nameTa: 'செட்டிநாடு சிக்கன் பிரியாணி',
            quantity: 2,
            status: 'READY',
          },
          {
            id: 'it-106',
            menuItemId: 'mi-6',
            name: 'Kalaiyarkoil Special Filter Coffee',
            nameTa: 'காளையார்கோவில் ஃபில்டர் காபி',
            quantity: 2,
            note: 'Extra strong, hot',
            status: 'READY',
          },
        ],
      },
    ];

    for (const ord of sampleOrders) {
      inMemoryKitchenOrders.set(ord.id, ord);
    }
  };

  initSampleOrders();

  // Helper to broadcast WebSocket kitchen and waiter events
  const broadcastKitchenEvent = (event: string, payload: any) => {
    try {
      const websocketServer = (app as any).websocketServer;
      if (websocketServer && websocketServer.clients) {
        const message = JSON.stringify({
          channel: 'kitchen',
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
      app.log.warn({ err }, 'WebSocket broadcast error in kitchen');
    }
  };

  // ── GET /api/v1/kitchen/orders — Live Kitchen Order Stream ───────────────────
  app.get('/orders', { preHandler: requireRoles('KITCHEN_STAFF', 'CHEF') }, async (req, reply) => {
    const query = req.query as {
      status?: string;
      type?: string;
      search?: string;
    };

    // Refresh elapsed times
    const allOrders = Array.from(inMemoryKitchenOrders.values()).map((ord) => ({
      ...ord,
      elapsedMinutes: getElapsedMinutes(ord.createdAt),
    }));

    let filtered = allOrders;

    if (query.status && query.status !== 'ALL') {
      if (query.status === 'ACTIVE') {
        filtered = filtered.filter((o) => o.status !== 'SERVED' && o.status !== 'CANCELLED');
      } else {
        filtered = filtered.filter((o) => o.status === query.status);
      }
    } else {
      // Default: don't show ancient completed orders
      filtered = filtered.filter((o) => o.status !== 'SERVED' && o.status !== 'CANCELLED');
    }

    if (query.type) {
      filtered = filtered.filter((o) => o.type === query.type);
    }

    if (query.search) {
      const q = query.search.toLowerCase();
      filtered = filtered.filter(
        (o) =>
          o.orderNumber.toLowerCase().includes(q) ||
          (o.tableNumber && o.tableNumber.includes(q)) ||
          (o.roomId && o.roomId.includes(q)) ||
          o.items.some((it) => it.name.toLowerCase().includes(q) || it.nameTa.includes(q))
      );
    }

    // Sort by: PLACED -> ACCEPTED -> PREPARING -> READY, then oldest first
    const statusWeight: Record<string, number> = {
      PLACED: 1,
      ACCEPTED: 2,
      PREPARING: 3,
      READY: 4,
      SERVED: 5,
      CANCELLED: 6,
    };

    filtered.sort((a, b) => {
      const weightDiff = (statusWeight[a.status] || 99) - (statusWeight[b.status] || 99);
      if (weightDiff !== 0) return weightDiff;
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });

    return reply.send({
      success: true,
      data: filtered,
      count: filtered.length,
    });
  });

  // ── GET /api/v1/kitchen/stats — Live KDS Summary Statistics ───────────────────
  app.get('/stats', { preHandler: requireRoles('KITCHEN_STAFF', 'CHEF') }, async (_req, reply) => {
    const orders = Array.from(inMemoryKitchenOrders.values());
    const active = orders.filter((o) => o.status !== 'SERVED' && o.status !== 'CANCELLED');

    const stats: KitchenStats = {
      totalActive: active.length,
      newCount: active.filter((o) => o.status === 'PLACED').length,
      preparingCount: active.filter((o) => o.status === 'ACCEPTED' || o.status === 'PREPARING').length,
      readyCount: active.filter((o) => o.status === 'READY').length,
      delayedCount: active.filter((o) => getElapsedMinutes(o.createdAt) > 20 && o.status !== 'READY').length,
      avgPrepMinutes: 14,
    };

    return reply.send({
      success: true,
      data: stats,
    });
  });

  // ── PATCH /api/v1/kitchen/orders/:id/status — Transition Order Status ────────
  app.patch('/orders/:id/status', { preHandler: requireRoles('KITCHEN_STAFF', 'CHEF') }, async (req, reply) => {
    const { id } = req.params as { id: string };
    const parseResult = KitchenStatusUpdateSchema.safeParse(req.body);

    if (!parseResult.success) {
      return reply.status(422).send({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid status update', details: parseResult.error.errors },
      });
    }

    const { status, note } = parseResult.data;
    let order = inMemoryKitchenOrders.get(id);

    if (!order) {
      // Create or search fallback
      order = {
        id,
        orderNumber: `AR-ORD-${id.slice(-4)}`,
        type: 'DINE_IN',
        status: status as any,
        createdAt: new Date().toISOString(),
        elapsedMinutes: 0,
        estimatedPrepMinutes: 20,
        priority: 'NORMAL',
        itemCount: 1,
        items: [],
      };
    }

    const beforeState = { status: order.status };
    order.status = status as any;

    if (status === 'ACCEPTED') {
      order.acceptedAt = new Date().toISOString();
      order.items.forEach((it) => {
        if (it.status === 'PENDING') it.status = 'PREPARING';
      });
    } else if (status === 'READY') {
      order.readyAt = new Date().toISOString();
      order.items.forEach((it) => {
        if (it.status !== 'CANCELLED') it.status = 'READY';
      });
    }

    order.elapsedMinutes = getElapsedMinutes(order.createdAt);
    inMemoryKitchenOrders.set(id, order);

    // Audit log
    if (typeof (app as any).logAudit === 'function') {
      const staff = (req as any).staffContext || { userId: 'staff-kitchen', role: 'KITCHEN_STAFF' };
      await (app as any).logAudit({
        actorId: staff.userId,
        actorRole: staff.role,
        action: `KITCHEN_STATUS_${status}`,
        resource: 'Order',
        resourceId: id,
        before: beforeState,
        after: { status, note: note || undefined },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'] || undefined,
      });
    }

    // Broadcast to KDS and Floor Waiters
    broadcastKitchenEvent('kitchen:order_status_updated', {
      orderId: id,
      orderNumber: order.orderNumber,
      tableNumber: order.tableNumber,
      roomId: order.roomId,
      status,
      readyAt: order.readyAt,
    });

    if (status === 'READY') {
      broadcastKitchenEvent('waiter:order_ready', {
        orderId: id,
        orderNumber: order.orderNumber,
        tableNumber: order.tableNumber,
        roomId: order.roomId,
        itemCount: order.itemCount,
        readyAt: order.readyAt,
      });
    }

    return reply.send({
      success: true,
      data: order,
      message: `Kitchen order ${order.orderNumber} updated to ${status}`,
    });
  });

  // ── PATCH /api/v1/kitchen/orders/:orderId/items/:itemId/status ───────────────
  app.patch(
    '/orders/:orderId/items/:itemId/status',
    { preHandler: requireRoles('KITCHEN_STAFF', 'CHEF') },
    async (req, reply) => {
      const { orderId, itemId } = req.params as { orderId: string; itemId: string };
      const parseResult = KitchenItemStatusUpdateSchema.safeParse(req.body);

      if (!parseResult.success) {
        return reply.status(422).send({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'Invalid item status' },
        });
      }

      const { status } = parseResult.data;
      const order = inMemoryKitchenOrders.get(orderId);

      if (!order) {
        return reply.status(404).send({
          success: false,
          error: { code: 'ORDER_NOT_FOUND', message: 'Kitchen order not found' },
        });
      }

      const item = order.items.find((it) => it.id === itemId);
      if (item) {
        item.status = status as any;
      }

      // If all items are ready, advance order to READY
      const allReady = order.items.length > 0 && order.items.every((it) => it.status === 'READY' || it.status === 'CANCELLED');
      if (allReady && order.status !== 'READY') {
        order.status = 'READY';
        order.readyAt = new Date().toISOString();
      }

      inMemoryKitchenOrders.set(orderId, order);

      broadcastKitchenEvent('kitchen:item_status_updated', {
        orderId,
        itemId,
        status,
        allReady,
      });

      return reply.send({
        success: true,
        data: order,
        message: 'Item status updated',
      });
    }
  );

  // ── POST /api/v1/kitchen/orders/:id/bump — 1-Tap Bump Workflow ───────────────
  app.post('/orders/:id/bump', { preHandler: requireRoles('KITCHEN_STAFF', 'CHEF') }, async (req, reply) => {
    const { id } = req.params as { id: string };
    const order = inMemoryKitchenOrders.get(id);

    if (!order) {
      return reply.status(404).send({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Order not found' },
      });
    }

    let nextStatus: 'ACCEPTED' | 'PREPARING' | 'READY' | 'SERVED' = 'ACCEPTED';
    if (order.status === 'PLACED') nextStatus = 'ACCEPTED';
    else if (order.status === 'ACCEPTED') nextStatus = 'PREPARING';
    else if (order.status === 'PREPARING') nextStatus = 'READY';
    else if (order.status === 'READY') nextStatus = 'SERVED';

    order.status = nextStatus as any;
    if (nextStatus === 'READY') {
      order.readyAt = new Date().toISOString();
      order.items.forEach((it) => (it.status = 'READY'));
    }

    inMemoryKitchenOrders.set(id, order);

    broadcastKitchenEvent('kitchen:order_status_updated', {
      orderId: id,
      orderNumber: order.orderNumber,
      status: nextStatus,
    });

    if (nextStatus === 'READY') {
      broadcastKitchenEvent('waiter:order_ready', {
        orderId: id,
        orderNumber: order.orderNumber,
        tableNumber: order.tableNumber,
        roomId: order.roomId,
      });
    }

    return reply.send({
      success: true,
      data: order,
      message: `Bumped order to ${nextStatus}`,
    });
  });

  // ── POST /api/v1/kitchen/orders/inject — Internal Hook for Dine-in & Orders ──
  app.post('/inject', async (req, reply) => {
    const incoming = req.body as any;
    const orderId = incoming.id || `ord-kds-${Date.now()}`;

    const newKitchenOrder: KitchenOrder = {
      id: orderId,
      orderNumber: incoming.orderNumber || `AR-ORD-${Date.now().toString().slice(-4)}`,
      type: incoming.type || 'DINE_IN',
      status: 'PLACED',
      tableNumber: incoming.tableNumber || (incoming.tableId ? incoming.tableId.replace('tbl-', '') : null),
      tableId: incoming.tableId || null,
      roomId: incoming.roomId || null,
      notes: incoming.notes || null,
      guestName: incoming.guestName || 'Guest Order',
      createdAt: incoming.createdAt || new Date().toISOString(),
      elapsedMinutes: 0,
      estimatedPrepMinutes: incoming.estimatedPrepMinutes || 20,
      priority: incoming.priority || 'NORMAL',
      itemCount: incoming.items ? incoming.items.length : 0,
      items: (incoming.items || []).map((it: any, idx: number) => ({
        id: it.id || `it-${Date.now()}-${idx}`,
        menuItemId: it.menuItemId || it.id || 'mi-generic',
        name: it.name || 'Chettinad Special',
        nameTa: it.nameTa || 'செட்டிநாடு உணவு',
        quantity: it.quantity || 1,
        note: it.note || null,
        status: 'PENDING',
        addons: it.addons || [],
      })),
    };

    inMemoryKitchenOrders.set(orderId, newKitchenOrder);

    // Live alert on all kitchen displays
    broadcastKitchenEvent('kitchen:new_order', newKitchenOrder);

    return reply.status(201).send({
      success: true,
      data: newKitchenOrder,
      message: 'Dispatched to Kitchen Display System',
    });
  });
};
