import fp from 'fastify-plugin';
import type { AuditLogEntry } from '@ashok-raj/types';

declare module 'fastify' {
  interface FastifyInstance {
    logAudit: (entry: AuditLogEntry) => Promise<void>;
  }
}

export const auditPlugin = fp(async (app) => {
  const logAudit = async (entry: AuditLogEntry) => {
    try {
      if (app.prisma && app.prisma.auditLog) {
        const data: any = {
          action: entry.action,
          resource: entry.resource,
        };
        if (entry.actorId) data.actorId = entry.actorId;
        if (entry.resourceId) data.resourceId = entry.resourceId;
        if (entry.before) data.before = entry.before;
        if (entry.after) data.after = entry.after;
        if (entry.ipAddress) data.ipAddress = entry.ipAddress;
        if (entry.userAgent) data.userAgent = entry.userAgent;

        await app.prisma.auditLog.create({ data });
      }
      app.log.info({ audit: entry }, `[AUDIT] ${entry.action} on ${entry.resource}:${entry.resourceId || 'all'}`);
    } catch (err) {
      app.log.warn({ err, entry }, 'Failed to persist audit log to database; logged to app logger');
    }
  };

  app.decorate('logAudit', logAudit);
  app.log.info('Audit plugin registered');
});
