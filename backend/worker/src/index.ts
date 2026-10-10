import 'dotenv/config';
import { Redis } from 'ioredis';
import { Worker, Queue } from 'bullmq';
import { QUEUES } from '@ashok-raj/config';

const redisUrl = process.env['REDIS_URL'] ?? 'redis://localhost:6379';
const redisPassword = process.env['REDIS_PASSWORD'] || undefined;

const connection = new Redis(redisUrl, {
  password: redisPassword,
  maxRetriesPerRequest: null, // Required for BullMQ
  enableReadyCheck: false,
});

connection.on('connect', () => {
  console.log('✅ Worker Redis connected');
});

connection.on('error', (err) => {
  console.error('❌ Worker Redis error:', err.message);
});

// ── Notification Worker ────────────────────────────────────────────────────────
const notificationWorker = new Worker(
  QUEUES.NOTIFICATIONS,
  async (job) => {
    console.log(`[Notifications] Processing job ${job.id}: ${job.name}`);
    // TODO Phase 14: Implement FCM push notification sending
  },
  { connection }
);

// ── Email Worker ───────────────────────────────────────────────────────────────
const emailWorker = new Worker(
  QUEUES.EMAIL,
  async (job) => {
    console.log(`[Email] Processing job ${job.id}: ${job.name}`);
    // TODO Phase 14: Implement email sending (invoice, booking confirmation)
  },
  { connection }
);

// ── Housekeeping Worker ────────────────────────────────────────────────────────
const housekeepingWorker = new Worker(
  QUEUES.HOUSEKEEPING,
  async (job) => {
    console.log(`[Housekeeping] Processing job ${job.id}: ${job.name}`);
    // TODO Phase 17: Auto-assign housekeeping tasks after checkout
  },
  { connection }
);

// ── Delivery Assignment Worker ─────────────────────────────────────────────────
const deliveryWorker = new Worker(
  QUEUES.DELIVERY_ASSIGNMENT,
  async (job) => {
    console.log(`[Delivery] Processing job ${job.id}: ${job.name}`);
    // TODO Phase 9: Auto-assign nearest available delivery partner
  },
  { connection }
);

// ── Invoice Worker ─────────────────────────────────────────────────────────────
const invoiceWorker = new Worker(
  QUEUES.INVOICE_GENERATION,
  async (job) => {
    console.log(`[Invoice] Processing job ${job.id}: ${job.name}`);
    // TODO Phase 13: Generate PDF invoices, upload to Cloudinary
  },
  { connection }
);

// ── Error Handlers ─────────────────────────────────────────────────────────────
const workers = [
  notificationWorker,
  emailWorker,
  housekeepingWorker,
  deliveryWorker,
  invoiceWorker,
];

for (const worker of workers) {
  worker.on('completed', (job) => {
    console.log(`✅ Job completed: ${worker.name}/${job.id}`);
  });

  worker.on('failed', (job, err) => {
    console.error(`❌ Job failed: ${worker.name}/${job?.id ?? 'unknown'} - ${err.message}`);
  });
}

// ── Graceful Shutdown ──────────────────────────────────────────────────────────
async function shutdown() {
  console.log('Shutting down workers...');
  await Promise.all(workers.map((w) => w.close()));
  await connection.quit();
  console.log('Workers stopped');
  process.exit(0);
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

console.log('');
console.log('┌──────────────────────────────────────────────┐');
console.log('│   Ashok Raj Lodge & Restaurant — Worker      │');
console.log(`│   Queues: ${Object.values(QUEUES).length} queues active                  │`);
console.log('└──────────────────────────────────────────────┘');
console.log('');
