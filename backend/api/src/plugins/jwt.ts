import fp from 'fastify-plugin';
import jwt from '@fastify/jwt';
import { type JwtPayload } from '@ashok-raj/types';

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: JwtPayload;
    user: JwtPayload;
  }
}

export const jwtPlugin = fp(async (app) => {
  const secret = process.env['JWT_SECRET'];
  const refreshSecret = process.env['JWT_REFRESH_SECRET'];

  if (!secret || !refreshSecret) {
    throw new Error('JWT_SECRET and JWT_REFRESH_SECRET must be set in environment variables');
  }

  await app.register(jwt, {
    secret,
    sign: {
      expiresIn: process.env['JWT_EXPIRY'] ?? '15m',
    },
  });

  // Decorate a helper for protected routes
  app.decorate('authenticate', async function (request: any, reply: any) {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.status(401).send({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        },
      });
    }
  });

  app.log.info('JWT plugin registered');
});
