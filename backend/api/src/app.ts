import Fastify, { type FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import websocket from '@fastify/websocket';
import { API } from '@ashok-raj/config';

import { prismaPlugin } from './plugins/prisma.js';
import { redisPlugin } from './plugins/redis.js';
import { jwtPlugin } from './plugins/jwt.js';
import { auditPlugin } from './plugins/audit.js';
import { healthRoutes } from './routes/health.js';
import { customerHomeRoutes } from './routes/customerHome.js';
import { customerMenuRoutes } from './routes/menu.js';
import { adminMenuRoutes } from './routes/adminMenu.js';

import { customerOrderRoutes } from './routes/orders.js';
import { adminOrderRoutes } from './routes/adminOrders.js';
import { customerDineInRoutes } from './routes/dineIn.js';
import { adminDineInRoutes } from './routes/adminDineIn.js';
import { kitchenRoutes } from './routes/kitchen.js';
import { waiterRoutes } from './routes/waiter.js';
import { deliveryRoutes } from './routes/delivery.js';
import { lodgeRoutes } from './routes/lodge.js';
import { bookingRoutes } from './routes/booking.js';
import { imageProxyRoutes } from './routes/imageProxy.js';

export async function buildApp(): Promise<FastifyInstance> {
  const isDev = process.env['NODE_ENV'] !== 'production';

  const app = Fastify({
    logger: {
      level: isDev ? 'debug' : 'info',
    },
    trustProxy: true,
  });

  // ── Security ───────────────────────────────────────────────────────────────
  await app.register(helmet, {
    contentSecurityPolicy: false,
  });

  await app.register(cors, {
    origin: isDev
      ? true
      : (process.env['ALLOWED_ORIGINS'] ?? 'http://localhost:3000')
          .split(',')
          .map((o) => o.trim()),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  });

  await app.register(rateLimit, {
    global: true,
    max: API.RATE_LIMIT_MAX_REQUESTS,
    timeWindow: API.RATE_LIMIT_WINDOW_MS,
    errorResponseBuilder: () => ({
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many requests. Please try again later.',
      },
    }),
  });

  // ── WebSocket ──────────────────────────────────────────────────────────────
  await app.register(websocket);

  // ── Plugins ───────────────────────────────────────────────────────────────
  await app.register(prismaPlugin);
  await app.register(redisPlugin);
  await app.register(jwtPlugin);
  await app.register(auditPlugin);

  // ── WebSocket Order Updates Route ──────────────────────────────────────────
  app.get('/ws/orders', { websocket: true }, (socket, req) => {
    app.log.info('Client connected to /ws/orders');
    socket.send(JSON.stringify({ event: 'connected', channel: 'orders', message: 'Connected to Ashok Raj Live Order Updates' }));

    socket.on('message', (message: any) => {
      try {
        const data = JSON.parse(message.toString());
        app.log.info({ data }, 'Received WebSocket message');
        if (data.type === 'subscribe') {
          socket.send(JSON.stringify({ event: 'subscribed', orderId: data.orderId }));
        }
      } catch (err) {
        app.log.warn({ err }, 'Invalid WS message format');
      }
    });

    socket.on('close', () => {
      app.log.info('Client disconnected from /ws/orders');
    });
  });

  // ── WebSocket Kitchen & Waiter Operations Route ────────────────────────────
  app.get('/ws/operations', { websocket: true }, (socket, req) => {
    app.log.info('Client connected to /ws/operations (Kitchen & Waiter Live Hub)');
    socket.send(
      JSON.stringify({
        event: 'connected',
        channel: 'operations',
        message: 'Connected to Ashok Raj Kitchen & Waiter Live Operations',
      })
    );

    socket.on('message', (message: any) => {
      try {
        const data = JSON.parse(message.toString());
        if (data.type === 'ping') {
          socket.send(JSON.stringify({ event: 'pong', timestamp: new Date().toISOString() }));
        }
      } catch (err) {
        app.log.warn({ err }, 'Invalid WS operations message');
      }
    });

    socket.on('close', () => {
      app.log.info('Client disconnected from /ws/operations');
    });
  });

  // ── Global Error Handler ───────────────────────────────────────────────────
  app.setErrorHandler((error: any, _request, reply) => {
    app.log.error(error);

    if (error.validation) {
      return reply.status(422).send({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Request validation failed',
          details: error.validation,
        },
      });
    }

    const statusCode = error.statusCode ?? 500;
    return reply.status(statusCode).send({
      success: false,
      error: {
        code: error.code ?? 'INTERNAL_ERROR',
        message: statusCode === 500 ? 'Internal server error' : error.message,
      },
    });
  });

  app.setNotFoundHandler((_request, reply) => {
    reply.status(404).send({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'Route not found',
      },
    });
  });

  // ── Routes ─────────────────────────────────────────────────────────────────
  await app.register(healthRoutes, { prefix: '/health' });
  await app.register(customerHomeRoutes, { prefix: '/api/v1/customer' });
  await app.register(customerMenuRoutes, { prefix: '/api/v1/customer/menu' });
  await app.register(customerOrderRoutes, { prefix: '/api/v1/customer/orders' });
  await app.register(customerDineInRoutes, { prefix: '/api/v1/customer/dine-in' });
  await app.register(adminMenuRoutes, { prefix: '/api/v1/admin/menu' });
  await app.register(adminOrderRoutes, { prefix: '/api/v1/admin/orders' });
  await app.register(adminDineInRoutes, { prefix: '/api/v1/admin/dine-in' });
  await app.register(kitchenRoutes, { prefix: '/api/v1/kitchen' });
  await app.register(waiterRoutes, { prefix: '/api/v1/waiter' });
  await app.register(deliveryRoutes, { prefix: '/api/v1/delivery' });
  await app.register(lodgeRoutes, { prefix: '/api/v1/lodge' });
  await app.register(bookingRoutes, { prefix: '/api/v1/lodge' });
  await app.register(imageProxyRoutes, { prefix: '/api/v1/proxy' });

  return app;
}
