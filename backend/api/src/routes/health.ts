import { type FastifyPluginAsync } from 'fastify';

export const healthRoutes: FastifyPluginAsync = async (app) => {
  app.get('/', async (request, reply) => {
    const dbOk = await app.prisma
      .$queryRaw`SELECT 1`
      .then(() => true)
      .catch(() => false);

    const redisOk = await app.redis
      .ping()
      .then((r) => r === 'PONG')
      .catch(() => false);

    const status = dbOk ? 'ok' : 'degraded';

    return reply.status(status === 'ok' ? 200 : 503).send({
      status,
      timestamp: new Date().toISOString(),
      version: '0.0.1',
      services: {
        database: dbOk ? 'connected' : 'disconnected',
        redis: redisOk ? 'connected' : 'disconnected',
      },
    });
  });
};
