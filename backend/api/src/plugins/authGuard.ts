import type { FastifyRequest, FastifyReply } from 'fastify';
import type { UserRole } from '@ashok-raj/types';

/**
 * Role-Based Access Control (RBAC) Guard for Fastify routes.
 *
 * Rules:
 * - KITCHEN_STAFF: Restricted to kitchen queue, order item statuses, and dish timing.
 *   Explicitly denied from financial transactions, invoice PDFs, ledger, and customer addresses.
 * - WAITER: Restricted to table sessions, table service calls, and table-side orders.
 *   Explicitly denied from general customer PII, room booking data, and financial administration.
 * - MANAGER / ADMIN / SUPER_ADMIN: Full operational and administrative access.
 */
export function requireRoles(...allowedRoles: (UserRole | string)[]) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      let userRole: string | undefined;
      let userId: string | undefined;

      // 1. Try JWT verification if Authorization header is present
      if (request.headers.authorization) {
        try {
          const decoded = await request.jwtVerify<{ userId: string; role?: string; roles?: string[] }>();
          userId = decoded.userId;
          userRole = decoded.role || (decoded.roles && decoded.roles[0]);
        } catch {
          // Fallback to role header if in development
        }
      }

      // 2. Allow role simulation in development / local mode via custom header
      if (!userRole && process.env['NODE_ENV'] !== 'production') {
        const staffRoleHeader = request.headers['x-staff-role'] as string | undefined;
        if (staffRoleHeader) {
          userRole = staffRoleHeader.toUpperCase();
        }
      }

      // Default to WAITER / KITCHEN_STAFF if called on those respective endpoints without auth in dev mode
      if (!userRole && process.env['NODE_ENV'] !== 'production') {
        if (request.url.includes('/kitchen')) userRole = 'KITCHEN_STAFF';
        else if (request.url.includes('/waiter')) userRole = 'WAITER';
        else userRole = 'ADMIN';
      }

      if (!userRole) {
        return reply.status(401).send({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required for this operational route',
          },
        });
      }

      // Check if user's role is in the allowed list
      const isAllowed =
        allowedRoles.includes(userRole) ||
        userRole === 'SUPER_ADMIN' ||
        userRole === 'ADMIN' ||
        userRole === 'MANAGER';

      if (!isAllowed) {
        // Enforce specific boundary reasons in error messages
        let message = `Access denied: Role '${userRole}' is not permitted to perform this action`;
        if (userRole === 'KITCHEN_STAFF' && (request.url.includes('/finance') || request.url.includes('/billing'))) {
          message = 'Access denied: Kitchen staff cannot access financial administration.';
        } else if (userRole === 'WAITER' && request.url.includes('/customer-profile')) {
          message = 'Access denied: Waiters cannot access unrelated customer data.';
        }

        return reply.status(403).send({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message,
          },
        });
      }

      // Attach staff context to request
      (request as any).staffContext = {
        userId: userId || `staff-${userRole.toLowerCase()}`,
        role: userRole,
      };
    } catch (err: any) {
      return reply.status(401).send({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: err?.message || 'Authentication error',
        },
      });
    }
  };
}
