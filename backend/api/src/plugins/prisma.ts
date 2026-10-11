import fp from 'fastify-plugin';
import { PrismaClient } from '@prisma/client';

declare module 'fastify' {
  interface FastifyInstance {
    prisma: PrismaClient;
    isDbConnected: boolean;
  }
}

export const prismaPlugin = fp(async (app) => {
  const prisma = new PrismaClient({
    log: process.env['NODE_ENV'] === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

  let isConnected = false;
  try {
    await prisma.$connect();
    isConnected = true;
    app.log.info('Prisma connected to PostgreSQL');
  } catch (err) {
    app.log.warn({ err }, 'PostgreSQL not connected — running in operational fallback mode');
  }

  app.decorate('prisma', prisma);
  app.decorate('isDbConnected', isConnected);

  app.addHook('onClose', async () => {
    try {
      await prisma.$disconnect();
    } catch {
      // Ignore disconnect error
    }
    app.log.info('Prisma disconnected');
  });
});
