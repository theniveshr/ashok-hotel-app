import type { FastifyPluginAsync } from 'fastify';

export const adminDineInRoutes: FastifyPluginAsync = async (app) => {
  // In-memory table state
  const tables = [
    { id: 'tbl-1', tableNumber: '01', floor: 1, capacity: 2, status: 'AVAILABLE', isAc: false, qrToken: 'qr_kal_tbl_01' },
    { id: 'tbl-2', tableNumber: '02', floor: 1, capacity: 2, status: 'AVAILABLE', isAc: false, qrToken: 'qr_kal_tbl_02' },
    { id: 'tbl-3', tableNumber: '03', floor: 1, capacity: 4, status: 'OCCUPIED', isAc: true, qrToken: 'qr_kal_tbl_03' },
    { id: 'tbl-4', tableNumber: '04', floor: 1, capacity: 4, status: 'AVAILABLE', isAc: true, qrToken: 'qr_kal_tbl_04' },
    { id: 'tbl-5', tableNumber: '05', floor: 1, capacity: 4, status: 'AVAILABLE', isAc: true, qrToken: 'qr_kal_tbl_05' },
    { id: 'tbl-6', tableNumber: '06', floor: 1, capacity: 6, status: 'RESERVED', isAc: false, qrToken: 'qr_kal_tbl_06' },
    { id: 'tbl-7', tableNumber: '07', floor: 1, capacity: 6, status: 'CLEANING', isAc: false, qrToken: 'qr_kal_tbl_07' },
    { id: 'tbl-8', tableNumber: '08', floor: 1, capacity: 6, status: 'AVAILABLE', isAc: false, qrToken: 'qr_kal_tbl_08' },
    { id: 'tbl-9', tableNumber: '09', floor: 2, capacity: 4, status: 'AVAILABLE', isAc: true, qrToken: 'qr_kal_tbl_09' },
    { id: 'tbl-10', tableNumber: '10', floor: 2, capacity: 4, status: 'AVAILABLE', isAc: true, qrToken: 'qr_kal_tbl_10' },
    { id: 'tbl-11', tableNumber: '11', floor: 2, capacity: 8, status: 'AVAILABLE', isAc: true, qrToken: 'qr_kal_tbl_11' },
    { id: 'tbl-12', tableNumber: '12', floor: 2, capacity: 8, status: 'AVAILABLE', isAc: true, qrToken: 'qr_kal_tbl_12' },
  ];

  const waiterRequests: any[] = [
    {
      id: 'req-1',
      tableId: 'tbl-3',
      tableNumber: '03',
      type: 'WATER',
      note: 'Warm drinking water requested',
      status: 'PENDING',
      createdAt: new Date(Date.now() - 1000 * 60 * 3).toISOString(),
    },
  ];

  // ── GET /admin/dine-in/tables — List All Tables with Live Status ───────────
  app.get('/tables', async (_req, reply) => {
    return reply.send({
      success: true,
      data: tables,
    });
  });

  // ── GET /admin/dine-in/requests — Live Waiter Queue ────────────────────────
  app.get('/requests', async (_req, reply) => {
    return reply.send({
      success: true,
      data: waiterRequests,
    });
  });

  // ── PATCH /admin/dine-in/requests/:id/acknowledge — Resolve Request ────────
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

  // ── POST /admin/dine-in/tables/generate-qr — Generate Secure QR Tokens ─────
  app.post('/tables/generate-qr', async (req, reply) => {
    const { tableId, tableNumber, branchId = 'branch-kalaiyarkoil' } = req.body as any;
    const qrToken = `qr_kal_tbl_${tableNumber.padStart(2, '0')}`;
    const qrDeepLink = `ashokraj://dine-in?token=${qrToken}&branch=${branchId}`;

    return reply.send({
      success: true,
      data: {
        tableId,
        tableNumber,
        branchId,
        qrToken,
        qrDeepLink,
        // SVG or printable format identifier
        printLabel: `Ashok Raj Kalaiyarkoil — Table ${tableNumber}`,
      },
    });
  });
};
