import { type FastifyPluginAsync } from 'fastify';

export const healthRoutes: FastifyPluginAsync = async (app) => {
  app.get('/', async (request, reply) => {
    const dbOk = app.isDbConnected
      ? await Promise.race([
          app.prisma.$queryRaw`SELECT 1`.then(() => true).catch(() => false),
          new Promise<boolean>((resolve) => setTimeout(() => resolve(false), 1500)),
        ])
      : false;

    const redisOk = await Promise.race([
      app.redis.ping().then((r) => r === 'PONG').catch(() => false),
      new Promise<boolean>((resolve) => setTimeout(() => resolve(false), 1000)),
    ]);

    const supabaseOk = app.supabase !== null;
    const status = (dbOk || supabaseOk) ? 'ok' : 'degraded';

    return reply.status(200).send({
      status,
      timestamp: new Date().toISOString(),
      version: '0.0.1',
      services: {
        database: dbOk ? 'connected' : (supabaseOk ? 'cloud_supabase_active' : 'disconnected'),
        supabase: supabaseOk ? 'configured' : 'not_configured',
        redis: redisOk ? 'connected' : 'disconnected',
      },
    });
  });
};
