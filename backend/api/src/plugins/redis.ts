import fp from 'fastify-plugin';
import { Redis } from 'ioredis';

declare module 'fastify' {
  interface FastifyInstance {
    redis: Redis;
  }
}

export const redisPlugin = fp(async (app) => {
  const redisUrl = process.env['REDIS_URL'] ?? 'redis://localhost:6379';
  const password = process.env['REDIS_PASSWORD'] || undefined;

  const redis = new Redis(redisUrl, {
    password,
    maxRetriesPerRequest: 1,
    enableReadyCheck: false,
    lazyConnect: true,
    retryStrategy: () => null, // don't loop indefinitely if redis is down
  });

  try {
    await redis.connect();
    app.log.info(`Redis connected: ${redisUrl}`);
  } catch (err) {
    app.log.warn('Redis not available — running in in-memory fallback mode');
  }

  app.decorate('redis', redis);

  app.addHook('onClose', async () => {
    try {
      await redis.quit();
    } catch {
      // Ignore
    }
    app.log.info('Redis disconnected');
  });

  redis.on('error', (err) => {
    // Suppress unhandled crash if redis is offline
    app.log.debug({ err }, 'Redis offline warning');
  });
});
