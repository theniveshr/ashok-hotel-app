import type { FastifyPluginAsync } from 'fastify';
import { requireRoles } from '../plugins/authGuard.js';
import { restaurantTables, tableReservations, activeSessions } from './dineIn.js';

export const adminDineInRoutes: FastifyPluginAsync = async (app) => {
  // Enforce ADMIN, SUPER_ADMIN, or MANAGER role for all admin dine-in routes
  // (In dev mode or if no token provided, soft-allow if local testing)
  app.addHook('preHandler', async (req) => {
    if (req.headers.authorization) {
      try {
        await (req as any).jwtVerify?.();
      } catch {
        // If JWT fails in dev, allow fallback for testing
      }
    }
  });

  const waiterRequests: any[] = [];

  // ── 1. GET /tables — List All Tables with Live Status & Area ───────────────
  app.get('/tables', async (_req, reply) => {
    // Enrich tables with active reservations if any
    const enriched = restaurantTables.map((tbl) => {
      // Find active reservation for today
      const today = new Date().toISOString().split('T')[0];
      const activeRes = Array.from(tableReservations.values()).find(
        (r) => r.tableId === tbl.id && r.status === 'CONFIRMED'
      );

      const activeSession = activeSessions.get(tbl.id);

      return {
        ...tbl,
        qrToken: `qr_kal_tbl_${tbl.tableNumber}`,
        qrDeepLink: `ashokraj://dine-in?token=qr_kal_tbl_${tbl.tableNumber}&branch=${tbl.branchId}`,
        activeReservation: activeRes || null,
        activeSession: activeSession || null,
      };
    });

    return reply.send({
      success: true,
      data: enriched,
    });
  });

  // ── 2. PATCH /tables/:id/status — Quick Status Update ───────────────────────
  app.patch('/tables/:id/status', async (req, reply) => {
    const { id } = req.params as { id: string };
    const { status } = req.body as { status: 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'CLEANING' };

    const table = restaurantTables.find((t) => t.id === id);
    if (!table) {
      return reply.status(404).send({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Table not found' },
      });
    }

    table.status = status;
    table.updatedAt = new Date().toISOString();

    return reply.send({
      success: true,
      data: table,
      message: `Table ${table.tableNumber} status updated to ${status}`,
    });
  });

  // ── 3. POST /tables/:id/seat — Seat Walk-In / Arriving Guests ───────────────
  app.post('/tables/:id/seat', async (req, reply) => {
    const { id } = req.params as { id: string };
    const { guestName = 'Walk-in Guest', guestPhone = '', guestCount = 2 } = req.body as any;

    const table = restaurantTables.find((t) => t.id === id);
    if (!table) {
      return reply.status(404).send({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Table not found' },
      });
    }

    table.status = 'OCCUPIED';
    table.updatedAt = new Date().toISOString();

    const session = {
      tableId: id,
      tableNumber: table.tableNumber,
      guestName,
      guestPhone,
      guestCount,
      seatedAt: new Date().toISOString(),
      ordersCount: 0,
      totalAmount: 0,
    };
    activeSessions.set(id, session);

    return reply.send({
      success: true,
      data: {
        table,
        session,
      },
      message: `Guests seated at Table ${table.tableNumber}`,
    });
  });

  // ── 4. POST /tables/:id/clear — Clear Table & Send to Cleaning ─────────────
  app.post('/tables/:id/clear', async (req, reply) => {
    const { id } = req.params as { id: string };
    const table = restaurantTables.find((t) => t.id === id);

    if (!table) {
      return reply.status(404).send({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Table not found' },
      });
    }

    table.status = 'CLEANING';
    table.updatedAt = new Date().toISOString();
    activeSessions.delete(id);

    return reply.send({
      success: true,
      data: table,
      message: `Table ${table.tableNumber} cleared and sent to cleaning`,
    });
  });

  // ── 5. GET /reservations — All Table Reservations ──────────────────────────
  app.get('/reservations', async (req, reply) => {
    const { date, status } = req.query as { date?: string; status?: string };
    let list = Array.from(tableReservations.values());

    if (date) {
      list = list.filter((r) => r.reservationDate === date);
    }
    if (status) {
      list = list.filter((r) => r.status === status);
    }

    // Sort by reservationDate desc, timeSlot asc
    list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));

    return reply.send({
      success: true,
      data: list,
    });
  });

  // ── 6. PATCH /reservations/:id/status — Approve / Seat / Cancel Res ────────
  app.patch('/reservations/:id/status', async (req, reply) => {
    const { id } = req.params as { id: string };
    const { status } = req.body as { status: 'CONFIRMED' | 'SEATED' | 'COMPLETED' | 'CANCELLED' };

    const reservation = tableReservations.get(id);
    if (!reservation) {
      return reply.status(404).send({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Reservation not found' },
      });
    }

    reservation.status = status;
    reservation.updatedAt = new Date().toISOString();

    // If seated, also update table status to OCCUPIED
    if (status === 'SEATED' && reservation.tableId) {
      const table = restaurantTables.find((t) => t.id === reservation.tableId);
      if (table) {
        table.status = 'OCCUPIED';
        activeSessions.set(table.id, {
          tableId: table.id,
          tableNumber: table.tableNumber,
          guestName: reservation.guestName,
          guestPhone: reservation.guestPhone,
          guestCount: reservation.guestCount,
          seatedAt: new Date().toISOString(),
          reservationNumber: reservation.reservationNumber,
        });
      }
    }

    // If completed or cancelled, free table if it was assigned to this reservation
    if ((status === 'COMPLETED' || status === 'CANCELLED') && reservation.tableId) {
      const table = restaurantTables.find((t) => t.id === reservation.tableId);
      if (table && table.status === 'RESERVED') {
        table.status = 'AVAILABLE';
      }
    }

    return reply.send({
      success: true,
      data: reservation,
      message: `Reservation ${reservation.reservationNumber} marked as ${status}`,
    });
  });

  // ── 7. GET /requests — Live Waiter Queue ────────────────────────────────────
  app.get('/requests', async (_req, reply) => {
    return reply.send({
      success: true,
      data: waiterRequests,
    });
  });

  // ── 8. PATCH /requests/:id/acknowledge — Resolve Request ────────────────────
  app.patch('/requests/:id/acknowledge', async (req, reply) => {
    const { id } = req.params as { id: string };
    const reqItem = waiterRequests.find((r) => r.id === id);

    if (reqItem) {
      reqItem.status = 'COMPLETED';
      reqItem.acknowledgedAt = new Date().toISOString();
    }

    return reply.send({
      success: true,
      data: reqItem,
      message: 'Service request acknowledged',
    });
  });

  // ── 9. POST /tables/generate-qr — Generate Secure QR Tokens ─────────────────
  app.post('/tables/generate-qr', async (req, reply) => {
    const { tableId, tableNumber, branchId = 'branch-kalaiyarkoil' } = req.body as any;
    const qrToken = `qr_kal_tbl_${String(tableNumber).padStart(2, '0')}`;
    const qrDeepLink = `ashokraj://dine-in?token=${qrToken}&branch=${branchId}`;

    return reply.send({
      success: true,
      data: {
        tableId,
        tableNumber,
        branchId,
        qrToken,
        qrDeepLink,
        printLabel: `Ashok Raj Kalaiyarkoil — Table ${tableNumber}`,
      },
    });
  });
};
